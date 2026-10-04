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
  var MENU_PEEK_DURATION = 2000;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var supportsPageTransitions = 'onpagereveal' in window;
  var navigating = false;
  var closeMenu = function () {};
  // Until the menu exists, a peek request is remembered and replayed by initSideMenu.
  var peekPending = false;
  var peekMenu = function () {
    peekPending = true;
  };

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

    // Show the menu briefly on every page start, after any slide has finished.
    var transition = event.viewTransition;
    if (!transition) {
      peekMenu();
      return;
    }
    transition.finished.finally(function () {
      peekMenu();
    });

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

  // Single entry point for leaving the page (menu links and hard scrolls).
  function goToPage(targetIndex, byScroll) {
    if (navigating || targetIndex < 0 || targetIndex >= PAGE_ORDER.length || targetIndex === currentIndex) {
      return;
    }
    navigating = true;
    rememberCurrentPage();
    if (byScroll) {
      try {
        sessionStorage.setItem(SCROLL_ARRIVAL_KEY, '1');
      } catch (error) {
        // Ignore storage failures; the next page may then scroll a little with leftover momentum.
      }
    }
    var name = PAGE_ORDER[targetIndex];
    var url = name + '.html';
    if (reduceMotion.matches || !supportsPageTransitions) {
      window.location.href = url;
      return;
    }
    // Make sure the incoming page's top images are ready so it slides in fully painted.
    whenImagesReady(HERO_IMAGES[name]).then(function () {
      window.location.href = url;
    });
  }

  // Restored from the back/forward cache: allow navigating again.
  window.addEventListener('pageshow', function (event) {
    if (!event.persisted) {
      return;
    }
    navigating = false;
    armedAt = window.performance.now() + EDGE_ARM_DELAY;
    if (!supportsPageTransitions) {
      peekMenu();
    }
  });

  // ---------- Hard scroll past the top/bottom edge moves to the previous/next page ----------
  // Only a gesture that *starts* at the edge counts, so the momentum that carried the visitor
  // to the bottom never flips the page by itself.
  var WHEEL_THRESHOLD = 600; // wheel distance (px) needed within one gesture
  var WHEEL_GESTURE_GAP = 200; // ms without wheel events that ends a gesture
  var SWIPE_THRESHOLD = 120; // finger travel (px) on touch screens
  var SWIPE_MAX_DURATION = 700; // ms; slower drags are ordinary scrolling
  var EDGE_ARM_DELAY = 1600; // ms after arriving before the edges react (covers the slide)
  var SCROLL_ARRIVAL_KEY = 'ep-scroll-arrival';
  var armedAt = window.performance.now() + EDGE_ARM_DELAY;
  var wheelGesture = null;
  var touchStart = null;

  // Reached by a hard scroll: the flick's leftover momentum keeps arriving here, so it is
  // swallowed instead of scrolling the new page away from its top.
  var swallowArrivalMomentum = false;
  try {
    swallowArrivalMomentum = sessionStorage.getItem(SCROLL_ARRIVAL_KEY) === '1';
    sessionStorage.removeItem(SCROLL_ARRIVAL_KEY);
  } catch (error) {
    swallowArrivalMomentum = false;
  }

  function atTop() {
    return window.scrollY <= 1;
  }

  function atBottom() {
    return Math.ceil(window.scrollY + window.innerHeight) >= document.documentElement.scrollHeight - 2;
  }

  window.addEventListener('wheel', function (event) {
    if (event.ctrlKey) {
      return;
    }
    if (navigating) {
      event.preventDefault();
      return;
    }
    var unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? window.innerHeight : 1;
    var deltaY = event.deltaY * unit;
    if (!deltaY || Math.abs(deltaY) < Math.abs(event.deltaX * unit)) {
      return;
    }

    var now = window.performance.now();
    var direction = deltaY > 0 ? 1 : -1;
    var newGesture = !wheelGesture || now - wheelGesture.last > WHEEL_GESTURE_GAP || direction !== wheelGesture.direction;
    if (newGesture) {
      var inTextField = event.target.closest && event.target.closest('textarea');
      wheelGesture = {
        direction: direction,
        total: 0,
        leftover: swallowArrivalMomentum && now < armedAt,
        counts: now >= armedAt && !inTextField && (direction > 0 ? atBottom() : atTop())
      };
    }
    wheelGesture.last = now;
    if (wheelGesture.leftover) {
      event.preventDefault();
      return;
    }
    if (!wheelGesture.counts) {
      return;
    }
    wheelGesture.total += Math.abs(deltaY);
    if (wheelGesture.total >= WHEEL_THRESHOLD) {
      wheelGesture.counts = false;
      goToPage(currentIndex + direction, true);
    }
  }, { passive: false });

  window.addEventListener('touchstart', function (event) {
    touchStart = null;
    if (event.touches.length !== 1 || navigating || window.performance.now() < armedAt) {
      return;
    }
    if (event.target.closest && event.target.closest('input, textarea, .side-menu')) {
      return;
    }
    var touch = event.touches[0];
    touchStart = { x: touch.clientX, y: touch.clientY, time: window.performance.now(), atTop: atTop(), atBottom: atBottom() };
  }, { passive: true });

  window.addEventListener('touchend', function (event) {
    var start = touchStart;
    touchStart = null;
    if (!start) {
      return;
    }
    var touch = event.changedTouches[0];
    var deltaY = start.y - touch.clientY; // positive = finger moved up = scrolling down
    var deltaX = start.x - touch.clientX;
    var quick = window.performance.now() - start.time <= SWIPE_MAX_DURATION;
    if (!quick || Math.abs(deltaY) < SWIPE_THRESHOLD || Math.abs(deltaY) < Math.abs(deltaX) * 2) {
      return;
    }
    if (deltaY > 0 && start.atBottom) {
      goToPage(currentIndex + 1, true);
    } else if (deltaY < 0 && start.atTop) {
      goToPage(currentIndex - 1, true);
    }
  }, { passive: true });

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

        var targetIndex = pageIndex(link.href);
        if (targetIndex === currentIndex) {
          event.preventDefault();
          closeMenu();
          window.scrollTo({ top: 0, behavior: reduceMotion.matches ? 'auto' : 'smooth' });
          return;
        }

        event.preventDefault();
        goToPage(targetIndex);
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
    peekMenu = function () {
      peekPending = false;
      setOpen(true);
      closeTimer = window.setTimeout(function () {
        if (!hovering && !menu.querySelector(':focus-visible')) {
          setOpen(false);
        }
      }, MENU_PEEK_DURATION);
    };

    // Browsers without `pagereveal` never request the peek, so start it here.
    if (peekPending || !supportsPageTransitions) {
      peekMenu();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSideMenu);
  } else {
    initSideMenu();
  }
})();
