const NOTES=['C','C♯','D','E♭','E','F','F♯','G','A♭','A','B♭','B'];
const CHROMATIC=['C','C♯','D','E♭','E','F','F♯','G','A♭','A','B♭','B'];
const OPEN=['E','B','G','D','A','E'];
const OPEN_SEMITONES=[4,11,7,2,9,4];
const TRIADS={major:{label:'major',intervals:[0,4,7],formula:['1','3','5']},minor:{label:'minor',intervals:[0,3,7],formula:['1','♭3','5']},diminished:{label:'diminished',intervals:[0,3,6],formula:['1','♭3','♭5']}};
const CHORD_TYPES={major:{label:'major',intervals:[0,4,7],formula:['1','3','5']},minor:{label:'minor',intervals:[0,3,7],formula:['1','♭3','5']},diminished:{label:'diminished',intervals:[0,3,6],formula:['1','♭3','♭5']},'7':{label:'7',intervals:[0,4,7,10],formula:['1','3','5','♭7']},maj7:{label:'major 7',intervals:[0,4,7,11],formula:['1','3','5','7']},min7:{label:'minor 7',intervals:[0,3,7,10],formula:['1','♭3','5','♭7']}};
const SAMPLE_FILES=['audio/high-e.ogg','audio/b.ogg','audio/g.ogg','audio/d.ogg','audio/a.ogg','audio/low-e.ogg'];
const STRING_MIDI=[64,59,55,50,45,40];
let target='C', view='all', traceConnections=true, harmonyQuality='major', chordType='major', audioEngine=null, samplePromise=null, progressionTimers=[], startedAt=null, timerId=null, misses=0, found=new Set();

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
    if(openMatch){label.dataset.target='true';label.classList.add('open-target');label.innerHTML=`<span class="note-dot anchor">${target}</span>`;if(!quiz)label.addEventListener('click',()=>pluck(s,0,label));else label.addEventListener('click',()=>guess(label,true))}
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
      else if(match)cell.addEventListener('click',()=>pluck(s,f,cell));
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
  const points=targets.map(el=>{const s=+el.dataset.string,f=+el.dataset.fret;return{x:el.offsetLeft+el.offsetWidth/2,y:el.offsetTop+el.offsetHeight/2,midi:[64,59,55,50,45,40][s]+f}});
  const byMidi=new Map();for(const point of points){if(!byMidi.has(point.midi))byMidi.set(point.midi,[]);byMidi.get(point.midi).push(point)}const groups=[...byMidi.entries()].sort((a,b)=>a[0]-b[0]);let routeIndex=0;
  const addRoute=(a,b,kind)=>{const path=document.createElementNS('http://www.w3.org/2000/svg','path'),midY=(a.y+b.y)/2;path.classList.add('connection-path',kind);path.style.animationDelay=`${routeIndex++*.13}s`;path.setAttribute('d',`M ${a.x} ${a.y} V ${midY} H ${b.x} V ${b.y}`);svg.append(path);return{x:(a.x+b.x)/2,y:midY}};
  for(const [,group] of groups){const ordered=group.slice().sort((a,b)=>a.y-b.y);for(let i=0;i<ordered.length-1;i++)addRoute(ordered[i],ordered[i+1],'unison-route')}
  for(let i=0;i<groups.length-1;i++){
    const lower=groups[i][1],upper=groups[i+1][1];let best={d:Infinity};for(const a of lower)for(const b of upper){const d=Math.hypot(a.x-b.x,a.y-b.y);if(d<best.d)best={a,b,d}}
    const at=addRoute(best.a,best.b,'octave-route'),label=document.createElementNS('http://www.w3.org/2000/svg','text');label.classList.add('route-label');label.setAttribute('x',at.x);label.setAttribute('y',at.y-7);label.textContent='+12';svg.append(label);
  }
  board.append(svg);
}

function setTarget(note){
  clearProgressionAnimation();
  target=CHROMATIC[idx(note)];document.querySelectorAll('[data-note]').forEach(el=>el.textContent=target);document.querySelector('#heroNote').textContent=target;
  buildPicker();buildBoard(document.querySelector('#learnBoard'));resetQuiz();
  const positionCount=targetCells().length;
  document.querySelector('#shapeStrip').innerHTML=`<span class="shape-chip"><i></i>${positionCount} positions</span><span class="shape-chip"><i></i>6 strings</span><span class="shape-chip"><i></i>1 repeating pattern</span>`;
  renderTheory();
}

function getAudio(){
  if(audioEngine)return audioEngine;const AudioCtx=window.AudioContext||window.webkitAudioContext;if(!AudioCtx)return null;const ctx=new AudioCtx(),input=ctx.createGain(),rumble=ctx.createBiquadFilter(),compressor=ctx.createDynamicsCompressor(),master=ctx.createGain();rumble.type='highpass';rumble.frequency.value=48;rumble.Q.value=.55;compressor.threshold.value=-16;compressor.knee.value=12;compressor.ratio.value=2.2;compressor.attack.value=.004;compressor.release.value=.18;master.gain.value=.78;input.connect(rumble).connect(compressor).connect(master).connect(ctx.destination);audioEngine={ctx,input,buffers:[]};return audioEngine;
}

function loadSamples(){
  const engine=getAudio();if(!engine)return Promise.resolve(null);if(engine.buffers.length===6)return Promise.resolve(engine);if(samplePromise)return samplePromise;samplePromise=Promise.all(SAMPLE_FILES.map(async file=>{const response=await fetch(file);if(!response.ok)throw new Error(`Could not load ${file}`);return engine.ctx.decodeAudioData(await response.arrayBuffer())})).then(buffers=>{engine.buffers=buffers;return engine}).catch(error=>{samplePromise=null;console.error(error);return null});return samplePromise;
}

function bestStringForMidi(midi){let best=5,bestScore=Infinity;STRING_MIDI.forEach((base,s)=>{const fret=midi-base,score=fret>=0&&fret<=12?fret:100+Math.abs(fret);if(score<bestScore){best=s;bestScore=score}});return best}

async function playSample(midi,stringIndex=null,delay=0,velocity=1){
  const engine=await loadSamples();if(!engine)return;if(engine.ctx.state==='suspended')await engine.ctx.resume();const s=stringIndex??bestStringForMidi(midi),source=engine.ctx.createBufferSource(),gain=engine.ctx.createGain(),at=engine.ctx.currentTime+delay;source.buffer=engine.buffers[s];source.playbackRate.value=Math.pow(2,(midi-STRING_MIDI[s])/12);gain.gain.setValueAtTime(Math.max(.001,.88*velocity),at);gain.gain.exponentialRampToValueAtTime(.001,at+Math.min(4.2,source.buffer.duration/source.playbackRate.value));source.connect(gain).connect(engine.input);source.start(at);
}

function playPitch(midi,delay=0,velocity=1){return playSample(midi,null,delay,velocity)}

function pluck(s,f,sourceCell,delay=0){
  vibrateString(sourceCell?.closest('.fretboard'),s);playSample(STRING_MIDI[s]+f,s,delay,.92);
}

function vibrateString(board,s){
  if(!board)return;const cells=[...board.querySelectorAll(`[data-string="${s}"]`)];cells.forEach(cell=>{cell.classList.remove('string-vibrating');void cell.offsetWidth;cell.classList.add('string-vibrating')});setTimeout(()=>cells.forEach(cell=>cell.classList.remove('string-vibrating')),560);
}

function guess(cell,match){
  if(document.querySelector('#quizResult').classList.contains('show'))return;
  if(!startedAt){startedAt=Date.now();timerId=setInterval(updateTimer,500)}
  const key=keyFor(cell.dataset.string,cell.dataset.fret);
  if(match){if(found.has(key))return;found.add(key);cell.classList.add('correct');pluck(+cell.dataset.string,+cell.dataset.fret,cell)}
  else{misses++;cell.classList.remove('wrong');void cell.offsetWidth;cell.classList.add('wrong')}
  updateScore();
  if(found.size===targetCells().length)finishQuiz();
}

function updateTimer(){if(!startedAt)return;const sec=Math.floor((Date.now()-startedAt)/1000);document.querySelector('#timer').textContent=`${Math.floor(sec/60)}:${String(sec%60).padStart(2,'0')}`}
function updateScore(){const total=targetCells().length;document.querySelector('#foundCount').textContent=found.size;document.querySelector('#missCount').textContent=misses;document.querySelector('#progressBar').style.width=`${found.size/total*100}%`}
function finishQuiz(){clearInterval(timerId);updateTimer();const time=document.querySelector('#timer').textContent;document.querySelector('#resultDetail').textContent=`${targetCells().length} positions in ${time}, with ${misses} ${misses===1?'miss':'misses'}.`;document.querySelector('#quizResult').classList.add('show')}
function resetQuiz(){clearInterval(timerId);startedAt=null;timerId=null;misses=0;found=new Set();document.querySelector('#timer').textContent='0:00';document.querySelector('#quizResult').classList.remove('show');buildBoard(document.querySelector('#quizBoard'),true);updateScore()}

function toneRole(note,quality=harmonyQuality){
  const diff=(idx(note)-idx(target)+12)%12,def=TRIADS[quality],at=def.intervals.indexOf(diff);if(at<0)return null;return[{cls:'root',short:'R',name:'Root'},{cls:'third',short:def.formula[1],name:'Third'},{cls:'fifth',short:def.formula[2],name:'Fifth'}][at];
}

function buildRoleBoard(){
  const board=document.querySelector('#intervalBoard');if(!board)return;board.innerHTML='';
  for(let s=0;s<6;s++)for(let f=0;f<=12;f++){
    const note=noteAt(s,f),role=toneRole(note),cell=document.createElement('button');cell.type='button';cell.className='cell';cell.dataset.string=s;cell.dataset.fret=f;cell.setAttribute('aria-label',`${f===0?'open':`fret ${f}`} ${note}${role?`, ${role.name}`:''}`);
    if([3,5,7,9,12].includes(f))cell.classList.add('marker');
    if(f===0&&!role)cell.innerHTML=`<span class="string-letter">${OPEN[s]}</span>`;
    else if(role){cell.innerHTML=`<span class="role-note ${role.cls}">${note}<em>${role.short}</em></span>`;cell.addEventListener('click',()=>pluck(s,f,cell))}
    else{const num=document.createElement('span');num.className='fret-num';num.textContent=s===0?f:'';cell.append(num);cell.tabIndex=-1}
    board.append(cell);
  }
}

function renderTheory(){
  const rootPicker=document.querySelector('#harmonyRoot');if(!rootPicker)return;
  rootPicker.innerHTML=NOTES.map(n=>`<button class="${n===target?'active':''}" data-root="${n}" aria-pressed="${n===target}">${n}</button>`).join('');rootPicker.querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>setTarget(b.dataset.root)));
  document.querySelectorAll('#triadQuality button').forEach(b=>b.classList.toggle('active',b.dataset.quality===harmonyQuality));
  const def=TRIADS[harmonyQuality],notes=def.intervals.map(n=>CHROMATIC[(idx(target)+n)%12]);document.querySelector('#triadName').textContent=`${target} ${def.label}`;document.querySelector('#triadFormula').innerHTML=def.formula.map(x=>`<span>${x}</span>`).join('');
  const classes=['root','third','fifth'],names=['ROOT','THIRD','FIFTH'];document.querySelector('#toneRoles').innerHTML=notes.map((note,i)=>`<div class="tone-role ${classes[i]}"><i>${note}</i><b>${names[i]}</b><small>${def.formula[i]}</small></div>`).join('');
  buildRoleBoard();renderChordLab();renderCircle();
}

function renderChordLab(){
  const def=CHORD_TYPES[chordType];if(!def)return;document.querySelectorAll('#chordMenu button').forEach(b=>b.classList.toggle('active',b.dataset.chord===chordType));document.querySelector('#chordName').textContent=`${target} ${def.label}`;
  const notes=def.intervals.map(n=>CHROMATIC[(idx(target)+n)%12]);document.querySelector('#noteStack').innerHTML=notes.map((n,i)=>`<span class="stack-note" title="${def.formula[i]}">${n}</span>`).join('');
  const heights=[68,112,156,196];document.querySelector('#voicingVisual').innerHTML=notes.map((n,i)=>`<div class="voice-bar" style="height:${heights[i]}px"><span>${n}</span></div>`).join('');
}

function playChordAt(rootIndex,type='major',delay=0,strum=.028){
  const def=CHORD_TYPES[type]||CHORD_TYPES.major,rootMidi=60+rootIndex,voicing=[rootMidi-12,rootMidi-5,...def.intervals.map(n=>rootMidi+n),rootMidi+12];voicing.forEach((m,i)=>playPitch(m,delay+i*strum,i===0?.78:.62));
}

function playSelectedChord(type=chordType){
  playChordAt(idx(target),type);const bars=[...document.querySelectorAll('.voice-bar')];bars.forEach((bar,i)=>setTimeout(()=>{bar.classList.add('playing');setTimeout(()=>bar.classList.remove('playing'),360)},i*55));
}

const CIRCLE=[
  {label:'C',i:0,minor:'A minor',sig:'NO SHARPS OR FLATS'},{label:'G',i:7,minor:'E minor',sig:'1 SHARP · F♯'},{label:'D',i:2,minor:'B minor',sig:'2 SHARPS · F♯ C♯'},{label:'A',i:9,minor:'F♯ minor',sig:'3 SHARPS · F♯ C♯ G♯'},
  {label:'E',i:4,minor:'C♯ minor',sig:'4 SHARPS · F♯ C♯ G♯ D♯'},{label:'B',i:11,minor:'G♯ minor',sig:'5 SHARPS · F♯ C♯ G♯ D♯ A♯'},{label:'F♯',i:6,minor:'E♭ minor',sig:'6 SHARPS / 6 FLATS'},{label:'D♭',i:1,minor:'B♭ minor',sig:'5 FLATS · B♭ E♭ A♭ D♭ G♭'},
  {label:'A♭',i:8,minor:'F minor',sig:'4 FLATS · B♭ E♭ A♭ D♭'},{label:'E♭',i:3,minor:'C minor',sig:'3 FLATS · B♭ E♭ A♭'},{label:'B♭',i:10,minor:'G minor',sig:'2 FLATS · B♭ E♭'},{label:'F',i:5,minor:'D minor',sig:'1 FLAT · B♭'}
];
const polar=(r,a)=>({x:260+r*Math.cos(a*Math.PI/180),y:260+r*Math.sin(a*Math.PI/180)});
function ringPath(r1,r2,a1,a2){const p1=polar(r1,a1),p2=polar(r1,a2),p3=polar(r2,a2),p4=polar(r2,a1);return`M ${p1.x} ${p1.y} A ${r1} ${r1} 0 0 1 ${p2.x} ${p2.y} L ${p3.x} ${p3.y} A ${r2} ${r2} 0 0 0 ${p4.x} ${p4.y} Z`}

function renderCircle(){
  const svg=document.querySelector('#circleSvg');if(!svg)return;svg.innerHTML='';const activeIndex=idx(target);
  CIRCLE.forEach((entry,n)=>{const start=-105+n*30,end=start+30,mid=start+15,majorPos=polar(202,mid),minorPos=polar(143,mid),g=document.createElementNS('http://www.w3.org/2000/svg','g');g.classList.add('circle-segment');g.dataset.keyIndex=entry.i;if(entry.i===activeIndex)g.classList.add('active');g.innerHTML=`<path class="circle-major" d="${ringPath(238,169,start,end)}"></path><path class="circle-minor" d="${ringPath(164,114,start,end)}"></path><text class="circle-label" x="${majorPos.x}" y="${majorPos.y+6}">${entry.label}</text><text class="circle-minor-label" x="${minorPos.x}" y="${minorPos.y+4}">${entry.minor.replace(' minor','m')}</text>`;g.addEventListener('click',()=>setTarget(CHROMATIC[entry.i]));svg.append(g)});
  const entry=CIRCLE.find(x=>x.i===activeIndex)||CIRCLE[0],ivIndex=(activeIndex+5)%12,vIndex=(activeIndex+7)%12,iv=CHROMATIC[ivIndex],v=CHROMATIC[vIndex];document.querySelector('#circleKey').textContent=entry.label;document.querySelector('#circleMinor').textContent=entry.minor;document.querySelector('#keySignature').textContent=entry.sig;document.querySelector('#keyName').textContent=entry.label;document.querySelector('#progression').innerHTML=[['I',target,activeIndex],['IV',iv,ivIndex],['V',v,vIndex],['I',target,activeIndex]].map(([d,n,k],step)=>`<div class="degree-card" data-key-index="${k}" data-step="${step}"><b>${d}</b><span>${n}</span></div>`).join('');
}

function clearProgressionAnimation(){progressionTimers.forEach(clearTimeout);progressionTimers=[];document.querySelectorAll('.circle-segment.playing,.degree-card.playing').forEach(el=>el.classList.remove('playing'))}
function highlightProgressionStep(keyIndex,step){document.querySelectorAll('.circle-segment.playing,.degree-card.playing').forEach(el=>el.classList.remove('playing'));document.querySelector(`.circle-segment[data-key-index="${keyIndex}"]`)?.classList.add('playing');document.querySelector(`.degree-card[data-step="${step}"]`)?.classList.add('playing')}
function playCircleProgression(){
  clearProgressionAnimation();const r=idx(target),steps=[[r,0],[r+5,1.15],[r+7,2.3],[r,3.45]];steps.forEach(([root,delay],step)=>{playChordAt(root%12,'major',delay,.022);progressionTimers.push(setTimeout(()=>highlightProgressionStep(root%12,step),delay*1000))});progressionTimers.push(setTimeout(clearProgressionAnimation,4600));
}

document.querySelectorAll('.view-tab[data-view]').forEach(btn=>btn.addEventListener('click',()=>{view=btn.dataset.view;document.querySelectorAll('.view-tab[data-view]').forEach(b=>b.classList.toggle('active',b===btn));document.querySelector('#learnBoard').classList.toggle('anchor-hidden',view==='anchors')}));
document.querySelector('#traceToggle').addEventListener('click',e=>{traceConnections=!traceConnections;e.currentTarget.classList.toggle('active',traceConnections);e.currentTarget.setAttribute('aria-pressed',traceConnections);document.querySelector('#learnBoard').classList.toggle('connections-off',!traceConnections)});
document.querySelector('#resetQuiz').addEventListener('click',resetQuiz);
document.querySelector('#nextNote').addEventListener('click',()=>{const next=NOTES[(NOTES.indexOf(target)+1)%NOTES.length];setTarget(next);document.querySelector('.picker-panel').scrollIntoView({behavior:'smooth'})});
document.querySelector('#heroNote').addEventListener('click',()=>document.querySelector('.picker-panel').scrollIntoView({behavior:'smooth'}));
document.querySelectorAll('#triadQuality button').forEach(btn=>btn.addEventListener('click',()=>{harmonyQuality=btn.dataset.quality;renderTheory()}));
document.querySelectorAll('#chordMenu button').forEach(btn=>btn.addEventListener('click',()=>{chordType=btn.dataset.chord;renderChordLab()}));
document.querySelector('#playTriad').addEventListener('click',()=>playChordAt(idx(target),harmonyQuality));
document.querySelector('#playArpeggio').addEventListener('click',()=>{const def=TRIADS[harmonyQuality],root=60+idx(target);def.intervals.forEach((n,i)=>playPitch(root+n,i*.42,.75))});
document.querySelector('#strumChord').addEventListener('click',()=>playSelectedChord());
document.querySelector('#playProgression').addEventListener('click',playCircleProgression);
setTarget('C');
