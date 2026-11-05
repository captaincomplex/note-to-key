const NOTES=['C','C♯','D','E♭','E','F','F♯','G','A♭','A','B♭','B'];
const CHROMATIC=['C','C♯','D','E♭','E','F','F♯','G','A♭','A','B♭','B'];
const OPEN=['E','B','G','D','A','E'];
const OPEN_SEMITONES=[4,11,7,2,9,4];
let target='C', view='all', startedAt=null, timerId=null, misses=0, found=new Set();

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
    const label=document.createElement('div');label.className='cell';label.textContent=OPEN[s];el.append(label);
    for(let f=0;f<=12;f++){
      const cell=document.createElement('button');
      cell.className='cell';cell.type='button';cell.dataset.string=s;cell.dataset.fret=f;
      cell.setAttribute('aria-label',`${OPEN[s]} string, fret ${f}, ${noteAt(s,f)}`);
      if([3,5,7,9,12].includes(f))cell.classList.add('marker');
      const match=noteAt(s,f)===target;
      if(match){const dot=document.createElement('span');dot.className='note-dot';if(s===0||s===5||f===0||f===12)dot.classList.add('anchor');dot.textContent=target;cell.append(dot)}
      else if(f>0){const num=document.createElement('span');num.className='fret-num';num.textContent=s===0?f:'';cell.append(num)}
      if(quiz)cell.addEventListener('click',()=>guess(cell,match));
      else if(match)cell.addEventListener('click',()=>pluck(s,f));
      else cell.tabIndex=-1;
      el.append(cell);
    }
  }
  el.classList.toggle('anchor-hidden',view==='anchors');
}

function setTarget(note){
  target=note;document.querySelectorAll('[data-note]').forEach(el=>el.textContent=target);document.querySelector('#heroNote').textContent=target;
  buildPicker();buildBoard(document.querySelector('#learnBoard'));resetQuiz();
  const positionCount=targetCells().length;
  document.querySelector('#shapeStrip').innerHTML=`<span class="shape-chip"><i></i>${positionCount} positions</span><span class="shape-chip"><i></i>6 strings</span><span class="shape-chip"><i></i>1 repeating pattern</span>`;
}

function pluck(s,f){
  const AudioCtx=window.AudioContext||window.webkitAudioContext;if(!AudioCtx)return;
  const ctx=new AudioCtx(),osc=ctx.createOscillator(),gain=ctx.createGain();
  const midi=[64,59,55,50,45,40][s]+f;osc.frequency.value=440*Math.pow(2,(midi-69)/12);osc.type='triangle';
  gain.gain.setValueAtTime(.001,ctx.currentTime);gain.gain.exponentialRampToValueAtTime(.18,ctx.currentTime+.01);gain.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+.65);
  osc.connect(gain).connect(ctx.destination);osc.start();osc.stop(ctx.currentTime+.7);
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

document.querySelectorAll('.view-tab').forEach(btn=>btn.addEventListener('click',()=>{view=btn.dataset.view;document.querySelectorAll('.view-tab').forEach(b=>b.classList.toggle('active',b===btn));document.querySelector('#learnBoard').classList.toggle('anchor-hidden',view==='anchors')}));
document.querySelector('#resetQuiz').addEventListener('click',resetQuiz);
document.querySelector('#nextNote').addEventListener('click',()=>{const next=NOTES[(NOTES.indexOf(target)+1)%NOTES.length];setTarget(next);document.querySelector('.picker-panel').scrollIntoView({behavior:'smooth'})});
document.querySelector('#heroNote').addEventListener('click',()=>document.querySelector('.picker-panel').scrollIntoView({behavior:'smooth'}));
setTarget('C');
