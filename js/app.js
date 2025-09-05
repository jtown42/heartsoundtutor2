(async function () {
  // Grab elements
  const els = {
    player: document.getElementById('player'),
    title: document.getElementById('current-title'),
    buzz: document.getElementById('current-buzz'),
    teach: document.getElementById('teach'),
    random: document.getElementById('btn-random'),
    filter: document.getElementById('chk-filter'),
    lists: {
      systolic: document.getElementById('list-systolic'),
      diastolic: document.getElementById('list-diastolic'),
      congenital: document.getElementById('list-congenital'),
      extra: document.getElementById('list-extra')
    }
  };

  // Load data
  let items = [];
  try {
    const data = await fetch('data/murmurs.json').then(r => r.json());
    items = data.items || [];
  } catch (e) {
    console.error('Failed to load data/murmurs.json', e);
  }

  // Build one catalog row
  function row(item) {
    const li = document.createElement('li');
    li.className = 'item';
    li.innerHTML = `
      <div class="meta">
        <div><strong>${item.title}</strong></div>
        <div class="buzz">${item.buzz.join(' • ')}</div>
      </div>
      <div class="btns">
        <button data-act="teach" title="Show teaching notes">Teach</button>
        <button data-act="play" title="Play audio">Play</button>
      </div>`;
    li.querySelector('[data-act="teach"]').onclick = () => showTeach(item);
    li.querySelector('[data-act="play"]').onclick = () => select(item, true);
    return li;
  }

  // Populate category lists
  items.forEach(it => {
    const bucket = els.lists[it.cat];
    if (bucket) bucket.appendChild(row(it));
  });

  // Selection + teaching
  let current = null;
  function select(item, autoplay = false) {
    current = item;
    els.title.textContent = item.title;
    els.buzz.textContent = item.buzz.join(' · ');
    els.player.src = item.file; // expects file in /sounds/
    if (autoplay) els.player.play().catch(() => {});
    showTeach(item); // auto-show teach on select
  }

  function showTeach(item) {
    const text = [
      `**${item.title} — NBME buzzwords**`,
      ...item.buzz.map(b => '- ' + b),
      '',
      '**How to hear it**',
      item.teach
    ].join('\n');
    els.teach.textContent = text;
  }

  // Random logic (optionally filter by checked categories)
  function getPool() {
    if (!els.filter.checked) return items;
    const checks = Array.from(document.querySelectorAll('.cat-check'));
    const allow = new Set(checks.filter(c => c.checked).map(c => c.dataset.cat));
    return items.filter(x => allow.has(x.cat));
  }

  els.random.onclick = () => {
    const pool = getPool();
    if (!pool.length) return;
    const pick = pool[Math.floor(Math.random() * pool.length)];
    select(pick, true);
  };
})();
