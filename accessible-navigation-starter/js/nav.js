//Add your JS here for your menu//Add your JS here for your menu

(() => {
  'use strict';

  const nav = document.getElementById('main-nav');
  const toggle = document.querySelector('.nav-toggle');
  if (!nav || !toggle) return;

  const triggers = Array.from(nav.querySelectorAll('.sub-trigger'));
  const wide = window.matchMedia('(min-width: 1024px)');
  const HOVER_CLOSE_DELAY = 200;

  const isOpen = (btn) => btn.getAttribute('aria-expanded') === 'true';

  function setOpen(btn, open) {
    btn.setAttribute('aria-expanded', String(open));
    if (!open) {
      delete btn.dataset.hover;
      delete btn.dataset.pinned;
      btn.parentElement
        .querySelectorAll('.sub-trigger[aria-expanded="true"]')
        .forEach((child) => setOpen(child, false));
    }
  }

  function closeSiblings(btn) {
    const li = btn.parentElement;
    Array.from(li.parentElement.children).forEach((sib) => {
      if (sib === li) return;
      const sibBtn = sib.querySelector(':scope > .sub-trigger');
      if (sibBtn && isOpen(sibBtn)) setOpen(sibBtn, false);
    });
  }

  function closeAllSubmenus() {
    triggers.forEach((btn) => setOpen(btn, false));
  }

  function setPanel(open) {
    toggle.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('is-open', open);
    if (!open) closeAllSubmenus();
  }

  toggle.addEventListener('click', (e) => {
    const opening = toggle.getAttribute('aria-expanded') !== 'true';
    setPanel(opening);

    if (opening && e.detail === 0) {
      nav.querySelector('.top-link').focus();
    }
  });

  triggers.forEach((btn) => {
    btn.addEventListener('click', () => {

      if (wide.matches && isOpen(btn) && btn.dataset.hover === 'true') {
        delete btn.dataset.hover;
        btn.dataset.pinned = 'true';
        return;
      }

      const open = !isOpen(btn);
      if (open) closeSiblings(btn);
      setOpen(btn, open);
    });
  });

  nav.querySelectorAll('li.has-sub').forEach((li) => {
    const btn = li.querySelector(':scope > .sub-trigger');
    let timer;

    li.addEventListener('pointerenter', (e) => {
      if (e.pointerType !== 'mouse' || !wide.matches) return;
      clearTimeout(timer);
      if (!isOpen(btn)) {
        closeSiblings(btn);
        setOpen(btn, true);
        btn.dataset.hover = 'true';
      }
    });

    li.addEventListener('pointerleave', (e) => {
      if (e.pointerType !== 'mouse' || !wide.matches) return;
      clearTimeout(timer);
      timer = setTimeout(() => {

        if (btn.dataset.hover === 'true') setOpen(btn, false);
      }, HOVER_CLOSE_DELAY);
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;

    if (wide.matches) {

      const active = document.activeElement;
      const openBtns = triggers.filter(isOpen);
      const inside = openBtns.filter((b) => b.parentElement.contains(active));
      const target = (inside.length ? inside : openBtns).pop();
      if (!target) return;
      const focusWasInside = target.parentElement.contains(active);
      setOpen(target, false);
      if (focusWasInside) target.focus();
      e.preventDefault();
    } else if (toggle.getAttribute('aria-expanded') === 'true') {
      setPanel(false);
      if (nav.contains(document.activeElement)) toggle.focus();
      e.preventDefault();
    }
  });

  document.addEventListener('focusin', (e) => {
    if (!wide.matches) return;
    triggers.filter(isOpen).forEach((btn) => {
      if (!btn.parentElement.contains(e.target)) setOpen(btn, false);
    });
  });

  document.addEventListener('click', (e) => {
    const header = toggle.closest('header');
    if (wide.matches) {
      if (!nav.contains(e.target)) closeAllSubmenus();
    } else if (!header.contains(e.target)) {
      setPanel(false);
    }
  });

  wide.addEventListener('change', () => {
    setPanel(false);
    closeAllSubmenus();
  });
})();
