// Canvas floating hearts and stars
const canvas = document.getElementById('bg-canvas');
if (canvas) {
  const ctx = canvas.getContext('2d');
  const DPR = window.devicePixelRatio || 1;
  let W, H; let particles = [];
  function resize() {
    W = canvas.width = innerWidth * DPR; H = canvas.height = innerHeight * DPR;
  }
  function rand(a,b){return Math.random()*(b-a)+a}
  function makeParticle(){
    const heart = Math.random()<0.6;
    return {
      x: rand(0, W), y: rand(0, H),
      r: rand(6,14) * (heart?1:0.7),
      vy: rand(-0.2, -0.6),
      vx: rand(-0.2, 0.2),
      alpha: rand(0.4, 1),
      heart
    }
  }
  function heartPath(x,y,s){
    ctx.moveTo(x, y);
    ctx.bezierCurveTo(x - s/2, y - s/2, x - s, y + s/3, x, y + s);
    ctx.bezierCurveTo(x + s, y + s/3, x + s/2, y - s/2, x, y);
  }
  function draw(){
    ctx.clearRect(0,0,W,H);
    particles.forEach(p=>{
      ctx.save(); ctx.globalAlpha = p.alpha; ctx.fillStyle = '#fff';
      ctx.beginPath();
      if (p.heart){ heartPath(p.x, p.y, p.r); } else { ctx.arc(p.x,p.y,p.r*0.6,0,Math.PI*2); }
      ctx.closePath(); ctx.fill(); ctx.restore();
      p.y += p.vy; p.x += p.vx; if (p.y < -20) { p.y = H + 20; }
    });
    requestAnimationFrame(draw);
  }
  function init(){ resize(); particles = Array.from({length: 60}, makeParticle); draw(); }
  window.addEventListener('resize', resize); init();
}

// Surprise quotes feature
const Quotes = [
  "You are my today and all of my tomorrows.",
  "In a sea of people, my eyes will always search for you.",
  "I fell in love with you because of a million tiny things.",
  "Every love story is beautiful, but ours is my favorite.",
  "Forever is a long time, but I wouldn’t mind spending it by your side.",
  "You are the reason I smile a little more every day.",
  "My heart is and always will be yours.",
  "I love you to the moon and to the stars and back.",
  "With you, I am home.",
];

function showSurprise(){
  const q = Quotes[Math.floor(Math.random()*Quotes.length)];
  const el = document.createElement('div');
  el.className = 'card';
  el.style.position = 'fixed';
  el.style.left = '50%'; el.style.top = '20px'; el.style.transform = 'translateX(-50%)';
  el.style.zIndex = 99; el.innerText = q;
  document.body.appendChild(el);
  setTimeout(()=>{ el.remove(); }, 4000);
}

// Logout helper
async function logout(){
  await fetch('/logout', { method: 'POST' });
  localStorage.removeItem('love_user');
  location.href = '/login';
}

// Heart pop on click
window.addEventListener('click', (e)=>{
  const h = document.createElement('div');
  h.className = 'heart-pop';
  h.textContent = '💖';
  h.style.left = e.clientX + 'px'; h.style.top = e.clientY + 'px';
  document.body.appendChild(h);
  setTimeout(()=> h.remove(), 900);
});
