/* Wiyo Venture Hub — navigation and enquiry forms */
(() => {
  const pages = [...document.querySelectorAll('.page')];
  const navLinks = [...document.querySelectorAll('.nav-link')];
  const nav = document.querySelector('#main-nav');
  const menuToggle = document.querySelector('.menu-toggle');
  const registerModal = document.querySelector('#register-modal');

  function showPage() {
    const requested = (window.location.hash || '#home').slice(1);
    const pageId = pages.some(page => page.id === requested) ? requested : 'home';
    pages.forEach(page => page.classList.toggle('active', page.id === pageId));
    navLinks.forEach(link => {
      const active = link.getAttribute('href') === `#${pageId}`;
      link.classList.toggle('active', active);
      if (active) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
    nav.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
    window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  }

  window.addEventListener('hashchange', showPage);
  showPage();

  // Links that point to a section inside a page (#programs, #advisory, #our-story): scroll to it instead of falling back to Home.
  document.addEventListener('click', event => {
    const link = event.target.closest('a[href^="#"]');
    const id = link ? link.getAttribute('href').slice(1) : '';
    const target = id && !pages.some(page => page.id === id) ? document.getElementById(id) : null;
    if (!target) return;
    event.preventDefault();
    const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
    const page = target.closest('.page');
    if (page && !page.classList.contains('active')) {
      window.location.hash = `#${page.id}`;
      setTimeout(() => target.scrollIntoView({ behavior, block: 'start' }), 80);
    } else {
      target.scrollIntoView({ behavior, block: 'start' });
    }
  });

  menuToggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', String(isOpen));
  });

  function openModal(dialog) {
    if (dialog && typeof dialog.showModal === 'function') dialog.showModal();
  }
  function closeModal(button) {
    const dialog = button.closest('dialog');
    if (dialog) dialog.close();
  }
  document.querySelectorAll('[data-close-modal]').forEach(button => {
    button.addEventListener('click', () => closeModal(button));
  });
  [registerModal].forEach(dialog => {
    dialog.addEventListener('click', event => {
      if (event.target === dialog) dialog.close();
    });
  });

  document.querySelectorAll('[data-open-register]').forEach(button => {
    button.addEventListener('click', () => {
      const program = button.getAttribute('data-open-register');
      const select = document.querySelector('#register-program');
      if (program && [...select.options].some(option => option.value === program || option.text === program)) {
        select.value = program;
      }
      openModal(registerModal);
    });
  });
  const today = new Date();
  const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const whatsappNumber = '23796409448'; // Replace with the official Wiyo number if it changes.
  function openWhatsApp(message) {
    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  // Registration message, same layout as the previous version of the site: one greeting, a blank line, then one field per line.
  const registerForm = document.querySelector('#register-form');
  function registerMessage() {
    const get = name => (registerForm.elements[name] ? registerForm.elements[name].value.trim() : '');
    const lines = ['Hello Wiyo Venture Hub, I would like to register.', '', `Program: ${get('program')}`, `Name: ${get('name')}`, `Phone / WhatsApp: ${get('phone')}`, `E-mail: ${get('email')}`, `Age: ${get('age')}`];
    if (get('city')) lines.push(`City: ${get('city')}`);
    if (get('message')) lines.push(`Project: ${get('message')}`);
    return lines.join('\n');
  }
  registerForm.addEventListener('submit', event => {
    event.preventDefault();
    openWhatsApp(registerMessage());
  });
  document.querySelector('#register-email-submit').addEventListener('click', () => {
    if (!registerForm.reportValidity()) return;
    window.location.href = `mailto:${REG_EMAIL}?subject=${encodeURIComponent('Registration - ' + registerForm.elements.program.value)}&body=${encodeURIComponent(registerMessage().replace(/\n/g, '\r\n'))}`;
  });

  /* ---------- Coworking booking (as on the previous version): details -> spaces and time slots -> review and send. Demo only: no server. ---------- */
  const REG_EMAIL = 'wiyoventurehub@gmail.com';
  const SPACES = ['Open-plan desk 1', 'Open-plan desk 2', 'Open-plan desk 3', 'Private booth 1', 'Private booth 2', 'Conference room'];
  const DESKS = SPACES.slice(0, 3);
  const HOURS = { 1: [480, 1200], 2: [480, 1200], 3: [480, 1200], 4: [480, 1200], 5: [480, 1200], 6: [540, 1080] }; // minutes: Mon–Fri 8 AM–8 PM, Sat 9 AM–6 PM, Sunday closed
  const toDate = iso => { const [y, m, d] = iso.split('-').map(Number); return new Date(y, m - 1, d); };
  const niceDate = iso => toDate(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  function hash(text) {
    let h = 7;
    for (const c of text) h = Math.imul(h ^ c.charCodeAt(0), 2654435761) >>> 0;
    h ^= h >>> 15; h = Math.imul(h, 2246822519) >>> 0; h ^= h >>> 13;
    return h >>> 0;
  }
  // Simulated bookings: each space has its own busy hours on each date (stable, no server).
  window.WiyoAvail = {
    SPACES,
    hours: iso => HOURS[toDate(iso).getDay()] || null,
    busy(space, iso) {
      const list = [];
      for (let k = 0; k < 3; k++) {
        const h = hash(`${space}|${iso}|${k}`);
        if (h % 100 < 70) { const start = 480 + ((h >>> 8) % 27) * 30; list.push([start, start + 60 + ((h >>> 16) % 5) * 30]); }
      }
      return list;
    }
  };
  const planRule = plan => plan.startsWith('Off-Peak') ? { s: DESKS, w: [1080, 1440] } : plan.startsWith('Full') ? {} : { s: DESKS };

  (function () {
    const dlg = document.getElementById('bookDialog');
    if (!dlg || typeof dlg.showModal !== 'function') return;
    const $ = id => document.getElementById(id);
    const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text !== undefined) e.textContent = text; return e; };
    const f = m => m === 1440 ? 'Midnight' : `${(Math.floor(m / 60) % 12) || 12}${m % 60 ? ':' + String(m % 60).padStart(2, '0') : ''} ${m >= 720 ? 'PM' : 'AM'}`;
    const form = $('bookForm'), sp = $('bkSpaces'), list = $('bkList'), rc = $('bkRecap'), dl = $('bkDl'), done = $('bookDone'), steps = $('bkSteps'), next2 = $('bkNext2');
    const TITLES = ['Your details', 'Choose a space and time', 'Review and send'];
    let pick = null, data = null;

    function go(n) {
      form.hidden = n !== 1; sp.hidden = n !== 2; rc.hidden = n !== 3; done.hidden = n !== 4;
      steps.textContent = n < 4 ? `Step ${n} of 3 · ${TITLES[n - 1]}` : '';
      dlg.scrollTop = 0;
      const t = [null, null, $('bkSpacesTitle'), $('bkRecapTitle'), $('bookDoneTitle')][n];
      if (t) t.focus(); else form.elements.fullname.focus();
    }
    function open(planText) {
      form.reset(); pick = null; data = null;
      form.elements.start.min = todayString; form.elements.start.setCustomValidity('');
      if (planText) { const o = [...form.elements.plan.options].find(x => x.text.startsWith(planText)); if (o) o.selected = true; }
      dlg.showModal(); go(1);
    }
    function drawSpaces() {
      const A = window.WiyoAvail, P = planRule(data.plan), w = P.w || A.hours(data.start), names = (P.s || A.SPACES).slice(), now = new Date();
      const n = data.start === todayString ? now.getHours() * 60 + now.getMinutes() : 0;
      $('bkSpacesTitle').textContent = 'Available spaces on ' + niceDate(data.start);
      list.textContent = '';
      names.forEach(name => {
        const fs = el('fieldset', 'bk-space'), box = el('div', 'bk-slots'), busy = A.busy(name, data.start);
        fs.appendChild(el('legend', '', name));
        for (let s = w[0]; s < w[1]; s += 120) {
          const e = Math.min(s + 120, w[1]), taken = busy.some(x => x[0] < e && x[1] > s), past = e <= n, off = taken || past;
          const lab = el('label', 'bk-slot' + (off ? ' busy' : '')), inp = el('input');
          inp.type = 'radio'; inp.name = 'slot'; inp.value = `${name}|${s}|${e}`; inp.disabled = off;
          lab.appendChild(inp); lab.appendChild(document.createTextNode(`${f(s)} – ${f(e)}`));
          lab.appendChild(el('span', '', taken ? 'Booked' : (past ? 'Passed' : 'Available')));
          box.appendChild(lab);
        }
        fs.appendChild(box); list.appendChild(fs);
      });
      next2.disabled = true;
    }
    function drawRecap() {
      const rows = [['Name', data.fullname], ['Phone / WhatsApp', data.phone], ['E-mail', data.email], ['Plan', data.plan], ['People', data.people], ['Space', pick.space], ['Date', niceDate(data.start)], ['Time', `${f(pick.s)} – ${f(pick.e)}`]];
      if (data.note) rows.push(['Notes', data.note]);
      dl.textContent = '';
      rows.forEach(r => { dl.appendChild(el('dt', '', r[0])); dl.appendChild(el('dd', '', r[1])); });
    }
    function send(ch) {
      const lines = ['Hello Wiyo Venture Hub, I would like to book a coworking space.', '', `Plan: ${data.plan}`, `Space: ${pick.space}`, `Date: ${niceDate(data.start)}`, `Time: ${f(pick.s)} – ${f(pick.e)}`, `People: ${data.people}`, `Name: ${data.fullname}`, `Phone / WhatsApp: ${data.phone}`, `E-mail: ${data.email}`];
      if (data.note) lines.push(`Notes: ${data.note}`);
      const t = lines.join('\n'), again = $('bookAgain');
      let url;
      if (ch === 'wa') { url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(t)}`; window.open(url, '_blank', 'noopener'); again.target = '_blank'; }
      else { url = `mailto:${REG_EMAIL}?subject=${encodeURIComponent('Coworking booking - ' + pick.space + ' - ' + data.start)}&body=${encodeURIComponent(t.replace(/\n/g, '\r\n'))}`; window.location.href = url; again.removeAttribute('target'); }
      $('bookDoneText').textContent = ch === 'wa' ? 'Your message is ready in WhatsApp.' : 'Your message is ready in your e-mail app.';
      again.textContent = ch === 'wa' ? 'Open WhatsApp again' : 'Open e-mail again'; again.href = url;
      go(4);
    }
    form.elements.start.addEventListener('input', e => e.target.setCustomValidity(''));
    form.addEventListener('submit', e => {
      e.preventDefault();
      const st = form.elements.start;
      if (!window.WiyoAvail.hours(st.value)) { st.setCustomValidity('We are closed on Sundays. Please choose another date.'); st.reportValidity(); return; }
      data = {}; ['plan', 'fullname', 'phone', 'email', 'start', 'people', 'note'].forEach(k => { data[k] = form.elements[k].value.trim(); });
      data.people = data.people || '1'; pick = null; drawSpaces(); go(2);
    });
    list.addEventListener('change', e => { const v = e.target.value.split('|'); pick = { space: v[0], s: +v[1], e: +v[2] }; next2.disabled = false; });
    next2.addEventListener('click', () => { if (pick) { drawRecap(); go(3); } });
    $('bkBack2').addEventListener('click', () => go(1));
    $('bkBack3').addEventListener('click', () => go(2));
    $('bkWa').addEventListener('click', () => send('wa'));
    $('bkMail').addEventListener('click', () => send('mail'));
    $('bookClose').addEventListener('click', () => dlg.close());
    $('bookDoneClose').addEventListener('click', () => dlg.close());
    dlg.addEventListener('click', e => { if (e.target === dlg) dlg.close(); });
    document.querySelectorAll('[data-open-booking]').forEach(btn => btn.addEventListener('click', e => {
      e.preventDefault();
      const heading = btn.closest('.pricing-card')?.querySelector('h3');
      open(heading ? heading.textContent.trim() : '');
    }));
  })();

  /* Floating WhatsApp button: drag to move it, tap or click to open WhatsApp */
  (function () {
    const b = document.querySelector('a.wa');
    if (!b || !window.PointerEvent) return;
    b.setAttribute('draggable', 'false');
    const M = 8;
    let sx = 0, sy = 0, ox = 0, oy = 0, pid = null, active = false, moved = false;
    const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
    function place(l, t) {
      b.style.left = clamp(l, M, window.innerWidth - b.offsetWidth - M) + 'px';
      b.style.top = clamp(t, M, window.innerHeight - b.offsetHeight - M) + 'px';
      b.style.right = 'auto'; b.style.bottom = 'auto';
    }
    b.addEventListener('pointerdown', e => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      const r = b.getBoundingClientRect();
      sx = e.clientX; sy = e.clientY; ox = r.left; oy = r.top; pid = e.pointerId; active = true; moved = false;
      b.setPointerCapture(pid); // keeps receiving moves even if the mouse is faster than the button
    });
    b.addEventListener('pointermove', e => {
      if (!active || e.pointerId !== pid) return;
      const dx = e.clientX - sx, dy = e.clientY - sy;
      if (!moved) {
        if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return; // a small wobble is still a click
        moved = true; b.classList.add('dragging');
      }
      place(ox + dx, oy + dy);
    });
    function end(e) {
      if (!active || e.pointerId !== pid) return;
      active = false; b.classList.remove('dragging');
      if (b.hasPointerCapture(pid)) b.releasePointerCapture(pid);
      setTimeout(() => { moved = false; }, 50);
    }
    b.addEventListener('pointerup', end);
    b.addEventListener('pointercancel', end);
    b.addEventListener('click', e => { if (moved) e.preventDefault(); }); // a drag must not open WhatsApp
    window.addEventListener('resize', () => { if (b.style.left) { const r = b.getBoundingClientRect(); place(r.left, r.top); } });
  })();
})();
