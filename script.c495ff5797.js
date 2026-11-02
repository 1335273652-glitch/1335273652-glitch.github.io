document.getElementById('year').textContent = new Date().getFullYear();
const navigationLinks = [...document.querySelectorAll('nav a')];
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navigationLinks.forEach(link => {
          const active = link.getAttribute('href') === '#' + entry.target.id;
          link.classList.toggle('active', active);
          if (active) link.setAttribute('aria-current', 'location');
          else link.removeAttribute('aria-current');
        });
      }
    });
  }, { rootMargin: '-15% 0px -55% 0px', threshold: 0 });
  document.querySelectorAll('section[id]').forEach(section => observer.observe(section));
}

// Reveal the personal record with the reference page's 22 ms typewriter cadence.
(() => {
  const panel = document.querySelector('.personal-file');
  if (!panel) return;
  const lines = [...panel.querySelectorAll('.personal-file-line')];
  const replay = panel.querySelector('.personal-file-replay');
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const records = lines.map(line => line.textContent);
  let timer, run = 0;
  function showAll() {
    clearTimeout(timer); run++;
    lines.forEach((line, i) => { line.textContent = records[i]; line.classList.remove('is-typing'); });
  }
  function play() {
    showAll();
    if (motion.matches) return;
    const current = run;
    lines.forEach((line, i) => {
      const accessible = document.createElement('span');
      accessible.className = 'sr-only'; accessible.textContent = records[i];
      const visual = document.createElement('span');
      visual.className = 'personal-file-typed'; visual.setAttribute('aria-hidden', 'true');
      // Reserve the full row's height before typing, including long mobile lines.
      const reserve = document.createElement('span');
      reserve.textContent = records[i]; reserve.style.visibility = 'hidden';
      reserve.style.display = 'block'; reserve.setAttribute('aria-hidden', 'true');
      visual.style.position = 'absolute'; visual.style.inset = '0';
      line.replaceChildren(accessible, reserve, visual);
    });
    let row = 0, character = 0;
    function tick() {
      if (current !== run) return;
      const line = lines[row], visual = line.querySelector('.personal-file-typed');
      line.classList.add('is-typing');
      visual.textContent = Array.from(records[row]).slice(0, ++character).join('');
      if (character < Array.from(records[row]).length) timer = setTimeout(tick, 22);
      else {
        line.classList.remove('is-typing');
        if (++row < lines.length) { character = 0; timer = setTimeout(tick, 300); }
      }
    }
    tick();
  }
  if (!motion.matches && 'IntersectionObserver' in window) {
    // Full text stays present for screen readers and until the panel is in view.
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) { play(); observer.disconnect(); }
    }, { threshold: 0.2 });
    observer.observe(panel);
    replay.hidden = false;
  }
  replay.addEventListener('click', play);
  motion.addEventListener('change', () => { showAll(); replay.hidden = motion.matches; });
})();
