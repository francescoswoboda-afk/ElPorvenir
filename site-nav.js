// Side menu (Dock-style, right edge). Pages change with ordinary links, no animation.
(function () {
  var MENU_PEEK_DURATION = 2000;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var closeMenu = function () {};

  function samePage(url) {
    try {
      var target = new URL(url, window.location.href);
      var name = function (path) { return path.split('/').pop().replace(/.html$/, '') || 'index'; };
      return target.origin === window.location.origin && name(target.pathname) === name(window.location.pathname);
    } catch (error) {
      return false;
    }
  }

  function initSideMenu() {
    var menu = document.querySelector('[data-side-menu]');
    if (!menu) {
      return;
    }

    var handle = menu.querySelector('.side-menu-handle');
    var closeTimer = null;
    var hovering = false;
    var lastPointerType = '';
    var suppressFocusOpen = false;

    function setOpen(open) {
      window.clearTimeout(closeTimer);
      menu.classList.toggle('is-open', open);
      handle.setAttribute('aria-expanded', open ? 'true' : 'false');
    }

    closeMenu = function () {
      hovering = false;
      setOpen(false);
    };

    // Mouse: open when the cursor reaches the edge zone or the panel; close once it has left both.
    menu.addEventListener('pointerenter', function (event) {
      if (event.pointerType === 'mouse') {
        hovering = true;
        setOpen(true);
      }
    });

    menu.addEventListener('pointerleave', function (event) {
      if (event.pointerType !== 'mouse') {
        return;
      }
      hovering = false;
      if (menu.querySelector(':focus-visible')) {
        return;
      }
      closeTimer = window.setTimeout(function () {
        setOpen(false);
      }, 120);
    });

    // Touch and keyboard: the handle toggles. A mouse click only ever opens (hover already did).
    menu.addEventListener('pointerdown', function (event) {
      lastPointerType = event.pointerType;
    });

    handle.addEventListener('click', function () {
      setOpen(lastPointerType === 'mouse' ? true : !menu.classList.contains('is-open'));
      lastPointerType = '';
    });

    document.addEventListener('pointerdown', function (event) {
      if (menu.classList.contains('is-open') && !menu.contains(event.target)) {
        setOpen(false);
      }
    });

    // Keyboard focus (not mouse/touch focus) opens the menu; tabbing out closes it.
    menu.addEventListener('focusin', function (event) {
      if (!suppressFocusOpen && event.target.matches(':focus-visible')) {
        setOpen(true);
      }
    });

    menu.addEventListener('focusout', function (event) {
      if (!hovering && !menu.contains(event.relatedTarget)) {
        setOpen(false);
      }
    });

    document.addEventListener('keydown', function (event) {
      if (event.key !== 'Escape' || !menu.classList.contains('is-open')) {
        return;
      }
      var focusInside = menu.contains(document.activeElement);
      setOpen(false);
      if (focusInside && document.activeElement !== handle) {
        suppressFocusOpen = true;
        handle.focus();
        suppressFocusOpen = false;
      }
    });

    menu.querySelectorAll('.side-menu-panel a').forEach(function (link) {
      link.addEventListener('click', function (event) {
        if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
          return;
        }

        // A link to the page already open just scrolls back to its top; other links navigate normally.
        if (samePage(link.href)) {
          event.preventDefault();
          closeMenu();
          window.scrollTo({ top: 0, behavior: reduceMotion.matches ? 'auto' : 'smooth' });
        }
      });
    });

    // Restored from the back/forward cache: drop any half-open state left from before.
    window.addEventListener('pageshow', function (event) {
      if (event.persisted) {
        closeMenu();
      }
    });

    // Briefly show the menu so visitors learn where it lives, then tuck it away
    // unless they are already using it.
    function peekMenu() {
      setOpen(true);
      closeTimer = window.setTimeout(function () {
        if (!hovering && !menu.querySelector(':focus-visible')) {
          setOpen(false);
        }
      }, MENU_PEEK_DURATION);
    }

    peekMenu();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSideMenu);
  } else {
    initSideMenu();
  }
})();
