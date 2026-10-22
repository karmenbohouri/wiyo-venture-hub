/* Wiyo Venture Hub — navigation and enquiry forms */
(() => {
  const pages = [...document.querySelectorAll('.page')];
  const navLinks = [...document.querySelectorAll('.nav-link')];
  const nav = document.querySelector('#main-nav');
  const menuToggle = document.querySelector('.menu-toggle');
  const registerModal = document.querySelector('#register-modal');
  const bookingModal = document.querySelector('#booking-modal');

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
  [registerModal, bookingModal].forEach(dialog => {
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
  document.querySelectorAll('[data-open-booking]').forEach(button => {
    button.addEventListener('click', () => openModal(bookingModal));
  });

  const today = new Date();
  const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const bookingDate = document.querySelector('#booking-date');
  bookingDate.min = todayString;

  const whatsappNumber = '23796409448'; // Replace with the official Wiyo number if it changes.
  function openWhatsApp(message) {
    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  document.querySelector('#register-form').addEventListener('submit', event => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const lines = [
      'Hello Wiyo Venture Hub, I would like to register my interest.',
      '',
      `Programme: ${data.get('program')}`,
      `Name: ${data.get('name')}`,
      `Email: ${data.get('email')}`,
      `Phone / WhatsApp: ${data.get('phone')}`
    ];
    if (data.get('message')) lines.push(`Business idea: ${data.get('message')}`);
    openWhatsApp(lines.join('\n'));
  });

  document.querySelector('#booking-form').addEventListener('submit', event => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const lines = [
      'Hello Wiyo Venture Hub, I would like to enquire about coworking space.',
      '',
      `Plan: ${data.get('plan')}`,
      `Name: ${data.get('name')}`,
      `Email: ${data.get('email')}`,
      `Preferred start date: ${data.get('date')}`
    ];
    if (data.get('message')) lines.push(`Additional details: ${data.get('message')}`);
    openWhatsApp(lines.join('\n'));
  });
})();
