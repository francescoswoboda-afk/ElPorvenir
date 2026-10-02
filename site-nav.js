// Side menu (Dock-style, right edge) and the vertical page slide between the five pages.
// Loaded in <head> so the `pagereveal` listener is registered before the first frame renders.
(function () {
  // Pages are treated as one long stack in this order; moving down the list slides up, and vice versa.
  var PAGE_ORDER = ['index', 'about-us', 'our-farm', 'pecan-nuts', 'contact-us'];
  // Images visible at the top of each page; they are loaded before the slide starts.
  var HERO_IMAGES = {
    'index': ['ElPorvenir-Homepage.jpg', 'ElPorvenir-Logo.png'],
    'about-us': ['el-porvenir-logo-dark.png'],
    'our-farm': ['ElPorvenir-Homepage.jpg', 'el-porvenir-logo-light.png'],
    'pecan-nuts': ['ElPorvenir-PecanNutHeader.jpg', 'el-porvenir-logo-dark.png'],
    'contact-us': ['el-porvenir-logo-light.png']
  };
  var FROM_KEY = 'ep-nav-from';
  var IMAGE_WAIT_LIMIT = 600;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var supportsPageTransitions = 'onpagereveal' in window;
  var closeMenu = function () {};

  function pageIndex(url) {
    try {
      var file = new URL(url, window.location.href).pathname.split('/').pop();
      return PAGE_ORDER.indexOf(file.replace(/\.html$/, '') || 'index');
    } catch (error) {
      return -1;
    }
  }

  var currentIndex = pageIndex(window.location.href);

  // Every page opens at its top, Back/Forward included.
  if ('scrollRestoration' in window.history) {
    window.history.scrollRestoration = 'manual';
  }

  function rememberCurrentPage() {
    try {
      sessionStorage.setItem(FROM_KEY, String(currentIndex));
    } catch (error) {
      // Ignore storage failures; the direction then comes from navigation.activation only.
    }
  }

  function storedFromIndex() {
    try {
      var value = sessionStorage.getItem(FROM_KEY);
      return value === null ? -1 : Number(value);
    } catch (error) {
      return -1;
    }
  }

  // Outgoing page: record where the visitor is leaving from (fallback for browsers without navigation.activation).
  window.addEventListener('pageswap', rememberCurrentPage);
  window.addEventListener('pagehide', rememberCurrentPage);

  // Incoming page: choose the slide direction before the first frame. Also runs for Back/Forward.
  window.addEventListener('pagereveal', function (event) {
    closeMenu();
    if (!window.location.hash) {
      window.scrollTo(0, 0);
    }

    var transition = event.viewTransition;
    if (!transition) {
      return;
    }

    var fromIndex = -1;
    var activation = window.navigation && window.navigation.activation;
    if (activation && activation.from) {
      fromIndex = pageIndex(activation.from.url);
    }
    if (fromIndex < 0) {
      fromIndex = storedFromIndex();
    }

    if (reduceMotion.matches || fromIndex < 0 || currentIndex < 0 || fromIndex === currentIndex) {
      transition.skipTransition();
      return;
    }

    var root = document.documentElement;
    root.setAttribute('data-nav-direction', currentIndex > fromIndex ? 'down' : 'up');
    transition.finished.finally(function () {
      root.removeAttribute('data-nav-direction');
    });
  });

  // Resolves once every image is decoded, or after IMAGE_WAIT_LIMIT so a slow network never blocks navigation.
  function whenImagesReady(sources) {
    return new Promise(function (resolve) {
      var remaining = (sources || []).length;
      if (!remaining) {
        resolve();
        return;
      }
      window.setTimeout(resolve, IMAGE_WAIT_LIMIT);
      sources.forEach(function (src) {
        var image = new Image();
        var done = function () {
          remaining -= 1;
          if (remaining === 0) {
            resolve();
          }
        };
        image.onload = function () {
          if (typeof image.decode === 'function') {
            image.decode().then(done, done);
          } else {
            done();
          }
        };
        image.onerror = done;
        image.src = src;
      });
    });
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
    var navigating = false;

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

        var targetIndex = pageIndex(link.href);
        if (targetIndex === currentIndex) {
          event.preventDefault();
          closeMenu();
          window.scrollTo({ top: 0, behavior: reduceMotion.matches ? 'auto' : 'smooth' });
          return;
        }

        rememberCurrentPage();
        if (reduceMotion.matches || !supportsPageTransitions) {
          return;
        }

        // Make sure the incoming page's top images are ready so it slides in fully painted.
        event.preventDefault();
        if (navigating) {
          return;
        }
        navigating = true;
        whenImagesReady(HERO_IMAGES[PAGE_ORDER[targetIndex]]).then(function () {
          window.location.href = link.href;
        });
      });
    });

    // Restored from the back/forward cache: drop any half-open state left from before.
    window.addEventListener('pageshow', function (event) {
      if (event.persisted) {
        navigating = false;
        closeMenu();
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSideMenu);
  } else {
    initSideMenu();
  }
})();
