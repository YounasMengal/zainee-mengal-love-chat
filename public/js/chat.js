(function(){
  const user = localStorage.getItem('love_user');
  const socket = io({ auth: { username: user } });
  const messages = document.getElementById('messages');
  const typingEl = document.getElementById('typing');
  const presence = document.getElementById('presence');
  const input = document.getElementById('msg');
  const sendBtn = document.getElementById('send');

  function addBubble({user: u, text, time}){
    const div = document.createElement('div');
    const me = u === user;
    div.className = 'message ' + (me? 'me':'them');
    div.innerHTML = `<div>${text.replace(/</g,'&lt;')}</div><div class="meta">${u} • ${new Date(time).toLocaleTimeString()}</div>`;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
  }

  sendBtn.addEventListener('click', ()=>{
    const txt = input.value.trim();
    if(!txt) return;
    socket.emit('message', txt);
    input.value = '';
    // Heart pop from send btn
    const r = sendBtn.getBoundingClientRect();
    const e = { clientX: r.left + r.width/2, clientY: r.top };
    const h = document.createElement('div');
    h.className = 'heart-pop'; h.textContent = '💗'; h.style.left = e.clientX + 'px'; h.style.top = e.clientY + 'px';
    document.body.appendChild(h); setTimeout(()=>h.remove(), 900);
  });

  let typing = false; let typingTimeout;
  input.addEventListener('input', ()=>{
    if (!typing) { typing = true; socket.emit('typing', true); }
    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(()=>{ typing=false; socket.emit('typing', false); }, 800);
  });

  socket.on('message', addBubble);
  socket.on('typing', ({user: u, isTyping})=>{
    if (u === user) return; // ignore self
    typingEl.innerHTML = isTyping ? `${u} is typing <span class="dot">•</span><span class="dot">•</span><span class="dot">•</span>` : '';
  });
  socket.on('presence', (list)=>{
    presence.textContent = `Online now: ${list.join(' & ')}`;
  });
})();
