(function(){
  const list = document.getElementById('notes');
  const form = document.getElementById('noteForm');

  function renderNote(n){
    const d = document.createElement('div');
    d.className = 'note';
    d.innerHTML = `<button class="del" title="Delete">✖</button><div>${n.text.replace(/</g,'&lt;')}</div><div class="by">— ${n.by} • ${new Date(n.at).toLocaleString()}</div>`;
    d.querySelector('.del').addEventListener('click', async ()=>{
      await fetch('/api/notes/'+n.id, { method: 'DELETE' });
      load();
    });
    list.appendChild(d);
  }

  async function load(){
    list.innerHTML='';
    const res = await fetch('/api/notes');
    const data = await res.json();
    data.forEach(renderNote);
  }

  form.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const fd = new FormData(form);
    const text = fd.get('text');
    const res = await fetch('/api/notes', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ text }) });
    if (res.ok) {
      form.reset(); load();
    }
  });

  load();
})();
