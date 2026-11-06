const NOTES=['C','C♯','D','E♭','E','F','F♯','G','A♭','A','B♭','B'];
const CHROMATIC=['C','C♯','D','E♭','E','F','F♯','G','A♭','A','B♭','B'];
const OPEN=['E','B','G','D','A','E'];
const OPEN_SEMITONES=[4,11,7,2,9,4];
const TRIADS={major:{label:'major',intervals:[0,4,7],formula:['1','3','5']},minor:{label:'minor',intervals:[0,3,7],formula:['1','♭3','5']},diminished:{label:'diminished',intervals:[0,3,6],formula:['1','♭3','♭5']}};
const CHORD_TYPES={major:{label:'major',intervals:[0,4,7],formula:['1','3','5']},minor:{label:'minor',intervals:[0,3,7],formula:['1','♭3','5']},diminished:{label:'diminished',intervals:[0,3,6],formula:['1','♭3','♭5']},'7':{label:'7',intervals:[0,4,7,10],formula:['1','3','5','♭7']},maj7:{label:'major 7',intervals:[0,4,7,11],formula:['1','3','5','7']},min7:{label:'minor 7',intervals:[0,3,7,10],formula:['1','♭3','5','♭7']}};
const INTERVALS=[
  {symbol:'1',name:'Unison',ratio:'1:1',tension:4,description:'The same pitch twice. The frequencies align completely, so the two notes fuse into one centre.'},
  {symbol:'♭2',name:'Minor second',ratio:'16:15',tension:96,description:'Adjacent frets rub strongly because their frequencies are very close. It creates urgency, bite and an immediate need to move.'},
  {symbol:'2',name:'Major second',ratio:'9:8',tension:66,description:'A whole-step gap is less rough than a minor second but still feels mobile. It is common in melodies and suspended chords.'},
  {symbol:'♭3',name:'Minor third',ratio:'6:5',tension:34,description:'This is the colour-defining note in a minor chord. Against the root it sounds dark, inward or plaintive without being harsh.'},
  {symbol:'3',name:'Major third',ratio:'5:4',tension:27,description:'This is the colour-defining note in a major chord. Four semitones above the root gives the triad its bright, open identity.'},
  {symbol:'4',name:'Perfect fourth',ratio:'4:3',tension:43,description:'A strong, simple relationship. It sounds stable on its own, but above a bass root it can feel suspended because it sits one fret above the third.'},
  {symbol:'♭5',name:'Tritone',ratio:'45:32',tension:92,description:'Six semitones split the octave exactly in half. The symmetry makes the tonal direction ambiguous, creating the classic pull inside dominant and diminished chords.'},
  {symbol:'5',name:'Perfect fifth',ratio:'3:2',tension:10,description:'After the octave, this is the strongest consonance. Its simple frequency relationship reinforces the root without deciding major or minor.'},
  {symbol:'♭6',name:'Minor sixth',ratio:'8:5',tension:53,description:'A wide, expressive interval and the inversion of a major third. It can sound dramatic or yearning depending on the bass and voicing.'},
  {symbol:'6',name:'Major sixth',ratio:'5:3',tension:31,description:'Warm and open. It is the inversion of a minor third and often softens a major chord into a more spacious colour.'},
  {symbol:'♭7',name:'Minor seventh',ratio:'9:5',tension:58,description:'Wide but unresolved. Added to a major triad it creates the dominant seventh sound, whose inner tritone strongly points toward the next chord.'},
  {symbol:'7',name:'Major seventh',ratio:'15:8',tension:78,description:'Only one fret below the octave, so it presses upward toward the root. In a major-7 chord that tension feels smooth, luminous and sophisticated.'}
];
const CHORD_REASONS={
  major:{title:'1–3–5 means alternate scale notes.',body:'Count through the major scale and keep every other note: 1, skip 2, take 3, skip 4, take 5. That stacks a major third (4 frets) then a minor third (3 frets).',steps:[['1 · ROOT','Names home','The root is the pitch every other note is measured from.'],['3 · 5:4','Makes it major','The major third is four frets above the root. Its relatively simple wave relationship sounds clear and bright.'],['5 · 3:2','Locks the frame','The perfect fifth strongly reinforces the root. Major and minor chords both share this stable note.']]},
  minor:{title:'The third moves; the frame stays.',body:'A minor triad is still 1–3–5 by scale position, but its third is flattened. Now the stack is 3 frets then 4: the root and fifth stay fixed while one fret changes the mood.',steps:[['1 · ROOT','Names home','The root remains the tonal centre.'],['♭3 · 6:5','Makes it minor','The minor third is three frets above the root. Its darker colour is the chord’s defining change.'],['5 · 3:2','Keeps it grounded','The same perfect fifth gives major and minor chords a shared, stable frame.']]},
  diminished:{title:'Both stacked thirds are small.',body:'A diminished triad stacks two minor thirds: 3 frets + 3 frets. That puts ♭5 only six frets above the root, replacing the stable perfect fifth with a tritone.',steps:[['1 · ROOT','Names home','The root tries to act as the centre.'],['♭3 · 6:5','Starts minor','The flattened third gives the first layer a minor colour.'],['♭5 · 45:32','Removes the anchor','The tritone divides the octave in half. Without a 3:2 fifth, the chord feels suspended and wants to move.']]},
  '7':{title:'The chord contains its own argument.',body:'Start with a major 1–3–5, then add ♭7. The 3 and ♭7 are six frets apart — a tritone — so they pull in opposite directions toward the next chord.',steps:[['1–3–5','Major foundation','The major triad sounds stable on its own.'],['♭7 · 9:5','Opens the top','The flat seventh weakens the sense of arrival and adds bluesy colour.'],['3 ↔ ♭7','Creates direction','This inner tritone usually resolves inward by a fret, making V–I feel inevitable.']]},
  maj7:{title:'Home and longing sound together.',body:'A major 1–3–5 says “arrived”, while 7 sits one fret below the octave root. You hear the settled triad and the upward pull at the same time.',steps:[['1–3–5','Stable foundation','The major triad establishes a clear home.'],['7 · 15:8','Leans upward','The major seventh is one fret below the octave and strongly anticipates it.'],['BOTH','Creates shimmer','Stability underneath delicate tension is the major-7 colour.']]},
  min7:{title:'Minor colour, gentler tension.',body:'Add ♭7 to a minor 1–♭3–5. There is no tritone between the third and seventh, so the chord stays colourful without the dominant seventh’s urgent demand to resolve.',steps:[['1–♭3–5','Minor foundation','The flat third gives the chord its inward colour.'],['♭7 · 9:5','Adds space','The flat seventh broadens the chord without pointing sharply upward.'],['NO TRITONE','Softens the pull','The guide tones do not fight each other, so the sound can rest or keep moving.']]}
};
const MODES=[
  {name:'Ionian',family:'major',intervals:[0,2,4,5,7,9,11],formula:['1','2','3','4','5','6','7'],characteristic:11,characteristicName:'Major seventh',description:'The major scale itself: bright, balanced and strongly resolved.',colour:'The 7 sits one fret below the root, creating a clear upward pull into home.',parentOffset:0},
  {name:'Dorian',family:'minor',intervals:[0,2,3,5,7,9,10],formula:['1','2','♭3','4','5','6','♭7'],characteristic:9,characteristicName:'Natural sixth',description:'A minor sound with lift, motion and a little more light than natural minor.',colour:'The natural 6 separates Dorian from ordinary minor and gives it its hopeful, soulful rise.',parentOffset:10},
  {name:'Phrygian',family:'minor',intervals:[0,1,3,5,7,8,10],formula:['1','♭2','♭3','4','5','♭6','♭7'],characteristic:1,characteristicName:'Flat second',description:'Dark, compressed and immediately tense around the root.',colour:'The ♭2 is only one fret above home. That close rub creates Phrygian’s unmistakable bite.',parentOffset:8},
  {name:'Lydian',family:'major',intervals:[0,2,4,6,7,9,11],formula:['1','2','3','♯4','5','6','7'],characteristic:6,characteristicName:'Sharp fourth',description:'A major sound made weightless, open and slightly otherworldly.',colour:'The ♯4 avoids the ordinary fourth’s pull down to the third and floats toward the fifth instead.',parentOffset:7},
  {name:'Mixolydian',family:'major',intervals:[0,2,4,5,7,9,10],formula:['1','2','3','4','5','6','♭7'],characteristic:10,characteristicName:'Flat seventh',description:'Major without the formal leading tone: earthy, bluesy and built for dominant grooves.',colour:'The ♭7 softens the pull into the octave and creates the sound of a dominant seventh chord.',parentOffset:5},
  {name:'Aeolian',family:'minor',intervals:[0,2,3,5,7,8,10],formula:['1','2','♭3','4','5','♭6','♭7'],characteristic:8,characteristicName:'Flat sixth',description:'The natural minor scale: dark, familiar and emotionally direct.',colour:'The ♭6 deepens the minor colour and often falls to the fifth in a strong, dramatic gesture.',parentOffset:3},
  {name:'Locrian',family:'diminished',intervals:[0,1,3,5,6,8,10],formula:['1','♭2','♭3','4','♭5','♭6','♭7'],characteristic:6,characteristicName:'Flat fifth',description:'Unstable by design: its home chord is diminished, so even the tonic feels unresolved.',colour:'The ♭5 removes the root’s stable perfect fifth. Home has tension built into its frame.',parentOffset:1}
];
const SAMPLE_FILES=['audio/high-e.ogg','audio/b.ogg','audio/g.ogg','audio/d.ogg','audio/a.ogg','audio/low-e.ogg'];
const STRING_MIDI=[64,59,55,50,45,40];
let target='C', view='all', traceConnections=true, harmonyQuality='major', chordType='major', selectedInterval=4, selectedMode=0, audioEngine=null, samplePromise=null, progressionTimers=[], modeTimers=[], startedAt=null, timerId=null, misses=0, found=new Set();

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

async function fetchSample(file,attempt=0){try{const response=await fetch(file);if(!response.ok)throw new Error(`Could not load ${file}`);return await response.arrayBuffer()}catch(error){if(attempt<2){await new Promise(resolve=>setTimeout(resolve,180*(attempt+1)));return fetchSample(file,attempt+1)}throw error}}
function loadSamples(){
  const engine=getAudio();if(!engine)return Promise.resolve(null);if(engine.buffers.length===6)return Promise.resolve(engine);if(samplePromise)return samplePromise;samplePromise=Promise.all(SAMPLE_FILES.map(async file=>engine.ctx.decodeAudioData(await fetchSample(file)))).then(buffers=>{engine.buffers=buffers;return engine}).catch(error=>{samplePromise=null;console.error(error);return null});return samplePromise;
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
  const classes=['root','third','fifth'],names=['ROOT','THIRD','FIFTH'];document.querySelector('#toneRoles').innerHTML=notes.map((note,i)=>`<button class="tone-role ${classes[i]}" data-tone-role="${i}" aria-label="Play ${note}, the ${names[i].toLowerCase()}"><i>${note}</i><b>${names[i]}</b><small>${def.formula[i]}</small></button>`).join('');document.querySelectorAll('#toneRoles button').forEach(button=>button.addEventListener('click',()=>playToneRole(+button.dataset.toneRole)));
  buildRoleBoard();renderChordLab();renderCircle();renderModes();
}

function animateToneRole(index,delay=0){setTimeout(()=>{const tone=document.querySelector(`[data-tone-role="${index}"]`);if(!tone)return;tone.classList.remove('playing');void tone.offsetWidth;tone.classList.add('playing');setTimeout(()=>tone.classList.remove('playing'),520)},delay*1000)}
function playToneRole(index){const def=TRIADS[harmonyQuality];playPitch(60+idx(target)+def.intervals[index],0,.82);animateToneRole(index)}

function modeRole(note){
  const mode=MODES[selectedMode],distance=(idx(note)-idx(target)+12)%12,degree=mode.intervals.indexOf(distance);if(degree<0)return null;
  return{degree,formula:mode.formula[degree],kind:distance===0?'root':distance===mode.characteristic?'colour':'scale'};
}

function getModePath(){
  const mode=MODES[selectedMode],pitches=[...mode.intervals,12].map(step=>48+idx(target)+step),layers=pitches.map((midi,step)=>STRING_MIDI.map((base,s)=>({s,f:midi-base,midi,step,degree:step%7})).filter(pos=>pos.f>=0&&pos.f<=12)),costs=[],parents=[];
  layers.forEach((layer,i)=>{costs[i]=[];parents[i]=[];layer.forEach((pos,j)=>{if(i===0){costs[i][j]=Math.abs(pos.f-5)*.18+Math.abs(pos.s-3)*.08;parents[i][j]=-1;return}let best=Infinity,bestParent=0;layers[i-1].forEach((prev,k)=>{const move=Math.abs(pos.f-prev.f)*1.15+Math.abs(pos.s-prev.s)*1.75+(pos.s===prev.s?.25:0),value=costs[i-1][k]+move;if(value<best){best=value;bestParent=k}});costs[i][j]=best;parents[i][j]=bestParent})});
  let at=costs.at(-1).indexOf(Math.min(...costs.at(-1))),path=[];for(let i=layers.length-1;i>=0;i--){path.unshift(layers[i][at]);at=parents[i][at]}return path;
}

function buildModeBoard(){
  const board=document.querySelector('#modeBoard');if(!board)return;board.innerHTML='';const path=getModePath(),route=new Map(path.map(pos=>[keyFor(pos.s,pos.f),pos]));
  for(let s=0;s<6;s++)for(let f=0;f<=12;f++){
    const note=noteAt(s,f),position=route.get(keyFor(s,f)),role=position?modeRole(note):null,cell=document.createElement('button');cell.type='button';cell.className='cell';cell.dataset.string=s;cell.dataset.fret=f;cell.setAttribute('aria-label',`${f===0?'open':`fret ${f}`} ${note}${role?`, route step ${position.step+1}, degree ${role.formula}`:''}`);
    if([3,5,7,9,12].includes(f))cell.classList.add('marker');
    if(f===0&&!role)cell.innerHTML=`<span class="string-letter">${OPEN[s]}</span>`;
    else if(role){cell.classList.add('route-cell');cell.innerHTML=`<span class="mode-note ${role.kind}" data-mode-degree="${role.degree}" data-path-step="${position.step}"><b>${note}</b><em>${role.formula}</em></span>`;cell.addEventListener('click',()=>pluck(s,f,cell))}
    else{const num=document.createElement('span');num.className='fret-num';num.textContent=s===0?f:'';cell.append(num);cell.tabIndex=-1}
    board.append(cell);
  }
}

function clearModeAnimation(){modeTimers.forEach(clearTimeout);modeTimers=[];document.querySelectorAll('.mode-scale-note.playing,.mode-note.playing').forEach(el=>el.classList.remove('playing'))}
function renderModes(){
  const tabs=document.querySelector('#modeTabs');if(!tabs)return;clearModeAnimation();const mode=MODES[selectedMode],root=idx(target),notes=mode.intervals.map(step=>CHROMATIC[(root+step)%12]);
  tabs.innerHTML=MODES.map((item,i)=>`<button class="${i===selectedMode?'active':''}" data-mode="${i}" aria-pressed="${i===selectedMode}"><span>${i+1}</span><b>${item.name}</b><small>${item.family}</small></button>`).join('');tabs.querySelectorAll('button').forEach(button=>button.addEventListener('click',()=>{selectedMode=+button.dataset.mode;renderModes()}));
  document.querySelector('#modeFamily').textContent=`${mode.family.toUpperCase()} FAMILY`;document.querySelector('#modeName').textContent=mode.name;document.querySelector('#modeDescription').textContent=mode.description;document.querySelector('#modeCharacteristic').textContent=mode.formula[mode.intervals.indexOf(mode.characteristic)];document.querySelector('#modeCharacteristicName').textContent=mode.characteristicName;document.querySelector('#modeCharacteristicCopy').textContent=mode.colour;
  document.querySelector('#modeNotes').innerHTML=notes.map((note,i)=>`<span class="mode-scale-note ${i===0?'root':mode.intervals[i]===mode.characteristic?'colour':''}" data-mode-degree="${i}"><b>${note}</b><small>${mode.formula[i]}</small></span>`).join('');document.querySelector('#modeFormula').innerHTML=mode.formula.map((degree,i)=>`<span class="${i===0?'root':mode.intervals[i]===mode.characteristic?'colour':''}">${degree}</span>`).join('');
  const parent=CHROMATIC[(root+mode.parentOffset)%12];document.querySelector('#parentScale').innerHTML=`Same notes as <b>${parent} major</b> — but <b>${target}</b> is home.`;buildModeBoard();
}

function playSelectedMode(){
  clearModeAnimation();const mode=MODES[selectedMode],root=48+idx(target),sequence=[...mode.intervals,12],path=getModePath();sequence.forEach((step,i)=>{const delay=i*.38,position=path[i];playSample(root+step,position.s,delay,.78);modeTimers.push(setTimeout(()=>{document.querySelectorAll('.mode-scale-note.playing,.mode-note.playing').forEach(el=>el.classList.remove('playing'));document.querySelector(`.mode-scale-note[data-mode-degree="${i%7}"]`)?.classList.add('playing');document.querySelector(`.mode-note[data-path-step="${i}"]`)?.classList.add('playing');vibrateString(document.querySelector('#modeBoard'),position.s)},delay*1000))});modeTimers.push(setTimeout(clearModeAnimation,sequence.length*380+500));
}

function renderChordLab(){
  const def=CHORD_TYPES[chordType];if(!def)return;document.querySelectorAll('#chordMenu button').forEach(b=>b.classList.toggle('active',b.dataset.chord===chordType));document.querySelector('#chordName').textContent=`${target} ${def.label}`;
  const notes=def.intervals.map(n=>CHROMATIC[(idx(target)+n)%12]);document.querySelector('#noteStack').innerHTML=notes.map((n,i)=>`<span class="stack-note" title="${def.formula[i]}">${n}</span>`).join('');
  const heights=[68,112,156,196];document.querySelector('#voicingVisual').innerHTML=notes.map((n,i)=>`<div class="voice-bar" style="height:${heights[i]}px"><span>${n}</span></div>`).join('');
  renderRelationshipLab();
}

function renderRelationshipLab(){
  const rail=document.querySelector('#intervalRail');if(!rail)return;rail.innerHTML=INTERVALS.map((interval,i)=>`<button class="interval-step ${i===selectedInterval?'active':''}" data-interval="${i}" aria-pressed="${i===selectedInterval}"><b>${CHROMATIC[(idx(target)+i)%12]}</b><span>${interval.symbol}</span></button>`).join('');rail.querySelectorAll('button').forEach(button=>button.addEventListener('click',()=>{selectedInterval=+button.dataset.interval;renderRelationshipLab()}));
  const interval=INTERVALS[selectedInterval],other=CHROMATIC[(idx(target)+selectedInterval)%12],stability=interval.tension<=18?'VERY STABLE':interval.tension<=40?'CONSONANT':interval.tension<=65?'COLOURFUL':'DISSONANT';document.querySelector('#intervalSymbol').textContent=interval.symbol;document.querySelector('#intervalDistance').textContent=`${selectedInterval} ${selectedInterval===1?'SEMITONE':'SEMITONES'} · ${target} → ${other}`;document.querySelector('#intervalName').textContent=interval.name;document.querySelector('#intervalRatioBadge').textContent=interval.ratio;document.querySelector('#intervalDescription').textContent=interval.description;document.querySelector('#intervalRatio').textContent='Simple ratios mean the wave peaks meet more often. Fretted guitars use equal temperament, which closely approximates these ideal relationships.';document.querySelector('#stabilityLabel').textContent=stability;document.querySelector('#tensionBar').style.width=`${interval.tension}%`;
  const def=CHORD_TYPES[chordType],reason=CHORD_REASONS[chordType],steps=def.intervals.slice(1).map((n,i)=>n-def.intervals[i]);document.querySelector('#chordReason').innerHTML=`<div class="reason-formula">${def.formula.map((f,i)=>`${i?'<i>+</i>':''}<span>${f}</span>`).join('')}</div><div class="reason-copy"><small>${target.toUpperCase()} ${def.label.toUpperCase()}</small><h4>${reason.title}</h4><p>${reason.body}</p></div><div class="semitone-stack"><b>${steps.join(' + ')}</b><span>FRETS BETWEEN EACH STACKED NOTE</span></div>`;document.querySelector('#whySteps').innerHTML=reason.steps.map(([label,title,copy],i)=>`<article><span>${String(i+1).padStart(2,'0')}</span><small>${label}</small><h4>${title}</h4><p>${copy}</p></article>`).join('');
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
document.querySelector('#playTriad').addEventListener('click',()=>{playChordAt(idx(target),harmonyQuality);[0,1,2].forEach(i=>animateToneRole(i,i*.04))});
document.querySelector('#playArpeggio').addEventListener('click',()=>{const def=TRIADS[harmonyQuality],root=60+idx(target);def.intervals.forEach((n,i)=>{playPitch(root+n,i*.42,.75);animateToneRole(i,i*.42)})});
document.querySelector('#strumChord').addEventListener('click',()=>playSelectedChord());
document.querySelector('#playInterval').addEventListener('click',()=>{const root=60+idx(target);playPitch(root,0,.78);playPitch(root+selectedInterval,.035,.72)});
document.querySelector('#playProgression').addEventListener('click',playCircleProgression);
document.querySelector('#playMode').addEventListener('click',playSelectedMode);
setTarget('C');
