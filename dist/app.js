const NOTES=['C','C♯','D','E♭','E','F','F♯','G','A♭','A','B♭','B'];
const CHROMATIC=['C','C♯','D','E♭','E','F','F♯','G','A♭','A','B♭','B'];
const OPEN=['E','B','G','D','A','E'];
const OPEN_SEMITONES=[4,11,7,2,9,4];
let target='C', view='all', traceConnections=true, startedAt=null, timerId=null, misses=0, found=new Set();

const enharmonicIndex={'D♭':1,'D♯':3,'G♭':6,'G♯':8,'A♯':10};
const idx=n=>enharmonicIndex[n] ?? CHROMATIC.indexOf(n);
const noteAt=(stringIndex,fret)=>CHROMATIC[(OPEN_SEMITONES[stringIndex]+fret)%12];
const keyFor=(s,f)=>`${s}-${f}`;
const targetCells=()=>{const cells=[];for(let s=0;s<6;s++)for(let f=0;f<=12;f++)if(noteAt(s,f)===target)cells.push(keyFor(s,f));return cells};

function buildPicker(){
  const picker=document.querySelector('#notePicker');
  picker.innerHTML=NOTES.map(n=>`<button class="note-btn ${n===target?'active':''}" data-pick="${n}" aria-pressed="${n===target}">${n}</button>`).join('');
  picker.querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>setTarget(b.dataset.pick)));
}

function buildBoard(el,quiz=false){
  el.innerHTML='';
  for(let s=0;s<6;s++){
    const label=document.createElement('button');label.className='cell';label.type='button';label.dataset.string=s;label.dataset.fret=0;label.innerHTML=`<span class="string-letter">${OPEN[s]}</span>`;
    label.setAttribute('aria-label',`${OPEN[s]} string, open ${OPEN[s]}`);
    const openMatch=OPEN[s]===target;
    if(openMatch){label.dataset.target='true';label.classList.add('open-target');if(!quiz)label.addEventListener('click',()=>pluck(s,0));else label.addEventListener('click',()=>guess(label,true))}
    else if(quiz)label.addEventListener('click',()=>guess(label,false));
    else label.tabIndex=-1;
    el.append(label);
    for(let f=1;f<=12;f++){
      const cell=document.createElement('button');
      cell.className='cell';cell.type='button';cell.dataset.string=s;cell.dataset.fret=f;
      cell.setAttribute('aria-label',`${OPEN[s]} string, fret ${f}, ${noteAt(s,f)}`);
      if([3,5,7,9,12].includes(f))cell.classList.add('marker');
      const match=noteAt(s,f)===target;
      if(match){cell.dataset.target='true';const dot=document.createElement('span');dot.className='note-dot';if(s===0||s===5||f===12)dot.classList.add('anchor');dot.textContent=target;cell.append(dot)}
      else{const num=document.createElement('span');num.className='fret-num';num.textContent=s===0?f:'';cell.append(num)}
      if(quiz)cell.addEventListener('click',()=>guess(cell,match));
      else if(match)cell.addEventListener('click',()=>pluck(s,f));
      else cell.tabIndex=-1;
      el.append(cell);
    }
  }
  el.classList.toggle('anchor-hidden',view==='anchors');
  el.classList.toggle('connections-off',!traceConnections);
  if(!quiz)requestAnimationFrame(()=>drawConnections(el));
}

function drawConnections(board){
  board.querySelector('.connection-layer')?.remove();
  const targets=[...board.querySelectorAll('[data-target="true"]')];if(targets.length<2)return;
  const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.classList.add('connection-layer');
  const w=board.clientWidth,h=board.clientHeight;svg.setAttribute('viewBox',`0 0 ${w} ${h}`);
  const points=targets.map(el=>({x:el.offsetLeft+el.offsetWidth/2,y:el.offsetTop+el.offsetHeight/2}));
  const remaining=points.slice(1),connected=[points[0]];
  while(remaining.length){let best={d:Infinity};for(const a of connected)for(const b of remaining){const d=Math.hypot((a.x-b.x)*.75,(a.y-b.y)*2.3);if(d<best.d)best={a,b,d}}const {a,b}=best,curve=(b.y-a.y)*.18;const path=document.createElementNS('http://www.w3.org/2000/svg','path');path.classList.add('connection-path');path.style.animationDelay=`${connected.length*.12}s`;path.setAttribute('d',`M ${a.x} ${a.y} C ${a.x+curve} ${(a.y+b.y)/2}, ${b.x-curve} ${(a.y+b.y)/2}, ${b.x} ${b.y}`);svg.append(path);connected.push(b);remaining.splice(remaining.indexOf(b),1)}
  board.append(svg);
}

function setTarget(note){
  target=note;document.querySelectorAll('[data-note]').forEach(el=>el.textContent=target);document.querySelector('#heroNote').textContent=target;
  buildPicker();buildBoard(document.querySelector('#learnBoard'));resetQuiz();
  const positionCount=targetCells().length;
  document.querySelector('#shapeStrip').innerHTML=`<span class="shape-chip"><i></i>${positionCount} positions</span><span class="shape-chip"><i></i>6 strings</span><span class="shape-chip"><i></i>1 repeating pattern</span>`;
}

function pluck(s,f){
  const AudioCtx=window.AudioContext||window.webkitAudioContext;if(!AudioCtx)return;
  const ctx=new AudioCtx(),midi=[64,59,55,50,45,40][s]+f,freq=440*Math.pow(2,(midi-69)/12),duration=1.7,rate=ctx.sampleRate,length=Math.floor(rate*duration),period=Math.max(2,Math.round(rate/freq));
  const buffer=ctx.createBuffer(1,length,rate),data=buffer.getChannelData(0);for(let i=0;i<period;i++)data[i]=(Math.random()*2-1)*.72;
  for(let i=period;i<length;i++)data[i]=.9965*.5*(data[i-period]+data[i-period+1]);
  const source=ctx.createBufferSource(),body=ctx.createBiquadFilter(),air=ctx.createBiquadFilter(),gain=ctx.createGain();source.buffer=buffer;body.type='peaking';body.frequency.value=180;body.Q.value=1.2;body.gain.value=5;air.type='lowpass';air.frequency.value=3600;air.Q.value=.7;gain.gain.setValueAtTime(.8,ctx.currentTime);gain.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+duration);
  source.connect(body).connect(air).connect(gain).connect(ctx.destination);source.start();
}

function guess(cell,match){
  if(document.querySelector('#quizResult').classList.contains('show'))return;
  if(!startedAt){startedAt=Date.now();timerId=setInterval(updateTimer,500)}
  const key=keyFor(cell.dataset.string,cell.dataset.fret);
  if(match){if(found.has(key))return;found.add(key);cell.classList.add('correct');pluck(+cell.dataset.string,+cell.dataset.fret)}
  else{misses++;cell.classList.remove('wrong');void cell.offsetWidth;cell.classList.add('wrong')}
  updateScore();
  if(found.size===targetCells().length)finishQuiz();
}

function updateTimer(){if(!startedAt)return;const sec=Math.floor((Date.now()-startedAt)/1000);document.querySelector('#timer').textContent=`${Math.floor(sec/60)}:${String(sec%60).padStart(2,'0')}`}
function updateScore(){const total=targetCells().length;document.querySelector('#foundCount').textContent=found.size;document.querySelector('#missCount').textContent=misses;document.querySelector('#progressBar').style.width=`${found.size/total*100}%`}
function finishQuiz(){clearInterval(timerId);updateTimer();const time=document.querySelector('#timer').textContent;document.querySelector('#resultDetail').textContent=`${targetCells().length} positions in ${time}, with ${misses} ${misses===1?'miss':'misses'}.`;document.querySelector('#quizResult').classList.add('show')}
function resetQuiz(){clearInterval(timerId);startedAt=null;timerId=null;misses=0;found=new Set();document.querySelector('#timer').textContent='0:00';document.querySelector('#quizResult').classList.remove('show');buildBoard(document.querySelector('#quizBoard'),true);updateScore()}

document.querySelectorAll('.view-tab[data-view]').forEach(btn=>btn.addEventListener('click',()=>{view=btn.dataset.view;document.querySelectorAll('.view-tab[data-view]').forEach(b=>b.classList.toggle('active',b===btn));document.querySelector('#learnBoard').classList.toggle('anchor-hidden',view==='anchors')}));
document.querySelector('#traceToggle').addEventListener('click',e=>{traceConnections=!traceConnections;e.currentTarget.classList.toggle('active',traceConnections);e.currentTarget.setAttribute('aria-pressed',traceConnections);document.querySelector('#learnBoard').classList.toggle('connections-off',!traceConnections)});
document.querySelector('#resetQuiz').addEventListener('click',resetQuiz);
document.querySelector('#nextNote').addEventListener('click',()=>{const next=NOTES[(NOTES.indexOf(target)+1)%NOTES.length];setTarget(next);document.querySelector('.picker-panel').scrollIntoView({behavior:'smooth'})});
document.querySelector('#heroNote').addEventListener('click',()=>document.querySelector('.picker-panel').scrollIntoView({behavior:'smooth'}));
setTarget('C');
