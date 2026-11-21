(() => {
  const root = document.documentElement;
  const $ = (id) => document.getElementById(id);
  const L = root.lang || 'en';
  let S = {};
  try { S = JSON.parse($('i18n').textContent); } catch { /* English fallbacks below */ }
  const tr = (k, vars) => (S[k] || k).replace(/\{(\w+)\}/g, (_, v) => vars[v]);

  // Language switch: each language is its own page.
  $('lang').addEventListener('change', (e) => { location.href = e.target.value + location.hash; });

  // Dark / light switch. Dark is the default; the choice is remembered.
  const toggle = $('theme');
  const sync = () => toggle.setAttribute('aria-checked', root.dataset.theme !== 'light');
  sync();
  toggle.addEventListener('click', () => {
    root.dataset.theme = root.dataset.theme === 'light' ? 'dark' : 'light';
    try { localStorage.setItem('type-one-theme', root.dataset.theme); } catch { /* not saved */ }
    sync();
  });

  // Pledge card.
  const KEY = 'type-one-pledge';
  const form = $('pledge-form'), out = $('pledge-out');
  const fmt = (d) => d.toLocaleDateString(L === 'ar' ? 'ar-u-nu-latn' : L, { day: 'numeric', month: 'long', year: 'numeric' });
  const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
  const addMonths = (d, n) => { const x = new Date(d); x.setMonth(x.getMonth() + n); return x; };
  const load = () => { try { return JSON.parse(localStorage.getItem(KEY)); } catch { return null; } };
  const save = (p) => { try { localStorage.setItem(KEY, JSON.stringify(p)); } catch { /* card still shows */ } };
  const dates = (p) => { const s = new Date(p.signed); return [addDays(s, 7), addMonths(s, 1), addMonths(s, 12)].map(fmt); };

  const render = (p) => {
    const [w, m, y] = dates(p);
    $('c-name').textContent = p.name;
    $('c-trade').textContent = p.trade;
    $('c-problem').textContent = tr('j_problem', { text: p.problem });
    $('c-date').textContent = tr('j_signed', { date: fmt(new Date(p.signed)) });
    $('c-week').textContent = tr('j_by', { date: w });
    $('c-month').textContent = tr('j_by', { date: m });
    $('c-year').textContent = tr('j_by', { date: y });
    out.hidden = false;
  };
  const text = (p) => {
    const [w, m, y] = dates(p);
    return `${tr('j_pledge')}\n\n${p.name} (${p.trade})\n${tr('j_problem', { text: p.problem })}\n\n` +
      `${tr('j_by', { date: w })} ${S.u_d1}\n${tr('j_by', { date: m })} ${S.u_d2}\n${tr('j_by', { date: y })} ${S.u_d3}\n\n${S.u_motto}`;
  };

  let pledge = load();
  if (pledge && pledge.name) {
    render(pledge);
    form.name.value = pledge.name; form.trade.value = pledge.trade; form.problem.value = pledge.problem;
  }
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!form.reportValidity()) return;
    pledge = { name: form.name.value.trim(), trade: form.trade.value, problem: form.problem.value.trim(), signed: new Date().toISOString() };
    save(pledge);
    render(pledge);
    out.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
  $('copy-pledge').addEventListener('click', async () => {
    const note = $('copied');
    try { await navigator.clipboard.writeText(text(pledge)); note.textContent = tr('j_copied'); }
    catch { note.textContent = tr('j_copyfail'); }
    setTimeout(() => { note.textContent = ''; }, 3500);
  });
  $('clear-pledge').addEventListener('click', () => {
    try { localStorage.removeItem(KEY); } catch { /* ignore */ }
    form.reset(); out.hidden = true; form.name.focus();
  });
})();
