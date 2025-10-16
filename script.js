// ===== script.js =====

document.addEventListener('DOMContentLoaded', () => {
  const enterBtn = document.getElementById('enterBtn');
  const experience = document.getElementById('experience');
  const portal = document.querySelector('.portal');
  const timeDial = document.getElementById('timeDial');
  const currentLabel = document.getElementById('currentLabel');
  const universe = document.getElementById('universe');
  const scene = document.getElementById('scene');
  const bubble = document.getElementById('bubble');
  const chatTitle = document.getElementById('chatTitle');
  const chatDate = document.getElementById('chatDate');
  const chatBody = document.getElementById('chatBody');
  const closeBubble = document.getElementById('closeBubble');
  const finalSection = document.getElementById('final');
  const finalStar = document.getElementById('finalStar');
  const finalLetter = document.getElementById('finalLetter');
  const playJourney = document.getElementById('playJourney');

  let playing = false;

  // Sample WhatsApp JSON data
  const sampleData = [
    {
      id: 'm1',
      label: 'Our Beginning',
      date: '2024-08-10',
      messages: [
        {from:'her', text:'Hey! How are you?', time:'2024-08-10 09:14'},
        {from:'me', text:'I\'m good, thought of you today :)', time:'2024-08-10 09:16'},
        {from:'her', text:'Aww, that\'s sweet', time:'2024-08-10 09:17'}
      ]
    },
    {
      id: 'm2',
      label: 'Midnight Talks',
      date: '2024-11-02',
      messages: [
        {from:'her', text:'Can you stay awake with me?', time:'2024-11-02 23:41'},
        {from:'me', text:'Always. Tell me everything.', time:'2024-11-02 23:42'},
        {from:'her', text:'I miss you', time:'2024-11-02 23:45'}
      ]
    },
    {
      id: 'm3',
      label: 'The Storm',
      date: '2025-02-14',
      messages: [
        {from:'her', text:'Why didn\'t you answer?', time:'2025-02-14 13:02'},
        {from:'me', text:'I messed up. I\'m sorry. Can we talk?', time:'2025-02-14 13:05'},
        {from:'her', text:'Talk. Then show.', time:'2025-02-14 13:08'}
      ]
    },
    {
      id: 'm4',
      label: 'Forever',
      date: '2025-05-01',
      messages: [
        {from:'me', text:'All of this led me to you.', time:'2025-05-01 20:00'},
        {from:'her', text:'Me too.', time:'2025-05-01 20:01'}
      ],
      finalLetter: `My love,\n\nEvery message above is more than words — it\'s proof of us. I hope this little universe reminds you that I will choose you again and again.\n\nTo our next chapter,\nAlways.`
    }
  ];

  // Starfield setup
  const canvas = document.getElementById('starfield');
  const ctx = canvas.getContext('2d');
  let stars = [];

  function resizeCanvas(){
    canvas.width = window.innerWidth * devicePixelRatio;
    canvas.height = window.innerHeight * devicePixelRatio;
    canvas.style.width = window.innerWidth+'px';
    canvas.style.height = window.innerHeight+'px';
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  function createStars(count=120){
    stars = [];
    for(let i=0;i<count;i++){
      stars.push({x:Math.random()*canvas.width,y:Math.random()*canvas.height,z:Math.random()*1.5+0.3,alpha:Math.random()*0.8});
    }
  }
  createStars(140);

  function renderStars(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    for(const s of stars){
      ctx.beginPath();
      ctx.fillStyle = `rgba(255,255,255,${s.alpha})`;
      ctx.arc(s.x,s.y, s.z*1.2,0,Math.PI*2);
      ctx.fill();
    }
  }

  function twinkle(){
    for(const s of stars){
      s.alpha += (Math.random()-0.5)*0.02;
      s.alpha = Math.max(0.05, Math.min(1, s.alpha));
    }
  }

  function starLoop(){
    twinkle();
    renderStars();
    requestAnimationFrame(starLoop);
  }
  starLoop();

  // Enter portal
  enterBtn.addEventListener('click', ()=>{
    portal.classList.add('hidden');
    experience.classList.remove('hidden');
    buildDial(sampleData);
  });

  function buildDial(moments){
    const w=400,h=400,cx=w/2,cy=h/2,radius=150;
    timeDial.setAttribute('viewBox',`0 0 ${w} ${h}`);
    timeDial.innerHTML='';
    const ring=document.createElementNS('http://www.w3.org/2000/svg','circle');
    ring.setAttribute('cx',cx); ring.setAttribute('cy',cy); ring.setAttribute('r',radius);
    ring.setAttribute('fill','none'); ring.setAttribute('stroke','rgba(255,255,255,0.04)'); ring.setAttribute('stroke-width','14');
    timeDial.appendChild(ring);

    moments.forEach((m,i)=>{
      const angle=(i/(moments.length))*Math.PI*2 - Math.PI/2;
      const x=cx + Math.cos(angle)*radius;
      const y=cy + Math.sin(angle)*radius;
      const dot=document.createElementNS('http://www.w3.org/2000/svg','circle');
      dot.setAttribute('cx',x); dot.setAttribute('cy',y); dot.setAttribute('r',10);
      dot.setAttribute('fill','rgba(255,186,100,0.95)');
      dot.style.cursor='pointer';
      dot.addEventListener('click',()=>selectMoment(m));
      timeDial.appendChild(dot);
    });
  }

  function selectMoment(moment){
    currentLabel.textContent = moment.label + ' — ' + moment.date;
    universe.classList.remove('hidden');
    showBubble(moment);
  }

  function showBubble(moment){
    chatTitle.textContent = moment.label;
    chatDate.textContent = moment.date;
    chatBody.innerHTML='';
    bubble.classList.remove('hidden');
    let i=0;
    function nextMsg(){
      if(i>=moment.messages.length) return;
      const msg=moment.messages[i];
      const div=document.createElement('div');
      div.className='message '+(msg.from==='me'?'me':'her');
      chatBody.appendChild(div);
      typeWriter(msg.text,div,()=>{i++;chatBody.scrollTop=chatBody.scrollHeight;setTimeout(nextMsg,400);});
    }
    nextMsg();
  }

  closeBubble.addEventListener('click',()=>bubble.classList.add('hidden'));

  function typeWriter(text,el,cb){
    el.textContent=''; let j=0;
    const t=setInterval(()=>{
      el.textContent+=text[j]||'';
      j++; if(j>=text.length){clearInterval(t);if(cb) cb();}
    },24+Math.random()*16);
  }

  playJourney.addEventListener('click',()=>{
    if(playing){playing=false;playJourney.textContent='Play Journey';return;}
    playing=true;playJourney.textContent='Stop';
    autoPlay(sampleData);
  });

  async function autoPlay(moments){
    for(const m of moments){
      if(!playing) break;
      selectMoment(m);
      await waitFor(2200+m.messages.length*900);
      bubble.classList.add('hidden');
      await waitFor(600);
    }
    if(playing){
      finalReveal(sampleData[sampleData.length-1]);
    }
    playing=false; playJourney.textContent='Play Journey';
  }

  function waitFor(ms){return new Promise(r=>setTimeout(r,ms));}

  function finalReveal(finalMoment){
    experience.querySelectorAll('section').forEach(s=>s.classList.add('hidden'));
    finalSection.classList.remove('hidden');
    finalStar.classList.remove('hidden');
    finalLetter.classList.remove('hidden');
    finalLetter.textContent='';
    if(finalMoment.finalLetter){
      typeWriter(finalMoment.finalLetter,finalLetter);
    } else {
      finalLetter.textContent='Our next chapter begins...';
    }
  }

  // Floating particles
  (function particleGenerator(){
    const pWrap = document.getElementById('particles');
    function make(){
      const el = document.createElement('div');
      el.className='p';
      const size=Math.random()*6+2;
      Object.assign(el.style,{position:'absolute',left:(Math.random()*100)+'%',top:(Math.random()*100)+'%',width:size+'px',height:size+'px',borderRadius:'50%',background:'rgba(255,255,255,'+(Math.random()*0.6+0.06)+')',transform:'translate(-50%,-50%)',pointerEvents:'none'});
      pWrap.appendChild(el);
      setTimeout(()=>{el.style.transition='transform 6s linear,opacity 6s linear'; el.style.transform='translate(-50%,-700%)'; el.style.opacity='0';},60);
      setTimeout(()=>{pWrap.removeChild(el)},7000);
    }
    setInterval(make,260);
  })();
});
