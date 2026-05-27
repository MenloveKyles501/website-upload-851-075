(function () {
  var activePlayers = new WeakMap();

  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function initImages() {
    document.addEventListener('error', function (event) {
      var target = event.target;
      if (target && target.tagName === 'IMG') {
        target.classList.add('is-missing');
      }
    }, true);
  }

  function initMenu() {
    var button = document.querySelector('[data-menu-button]');
    var menu = document.querySelector('[data-mobile-nav]');
    if (!button || !menu) {
      return;
    }
    button.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  function initHero() {
    selectAll('[data-hero]').forEach(function (hero) {
      var slides = selectAll('[data-hero-slide]', hero);
      var dots = selectAll('[data-hero-dot]', hero);
      var prev = hero.querySelector('[data-hero-prev]');
      var next = hero.querySelector('[data-hero-next]');
      if (!slides.length) {
        return;
      }
      var index = 0;
      var timer = null;

      function render(target) {
        index = (target + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle('is-active', slideIndex === index);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle('is-active', dotIndex === index);
        });
      }

      function restart() {
        if (timer) {
          window.clearInterval(timer);
        }
        timer = window.setInterval(function () {
          render(index + 1);
        }, 5200);
      }

      dots.forEach(function (dot, dotIndex) {
        dot.addEventListener('click', function () {
          render(dotIndex);
          restart();
        });
      });

      if (prev) {
        prev.addEventListener('click', function () {
          render(index - 1);
          restart();
        });
      }

      if (next) {
        next.addEventListener('click', function () {
          render(index + 1);
          restart();
        });
      }

      render(0);
      restart();
    });
  }

  function initFilters() {
    selectAll('[data-filter-form]').forEach(function (form) {
      var root = form.closest('main') || document;
      var cards = selectAll('[data-card]', root);
      var inputs = selectAll('input, select', form);
      if (!cards.length) {
        return;
      }

      function filterCards() {
        var values = {};
        inputs.forEach(function (input) {
          values[input.name] = (input.value || '').trim().toLowerCase();
        });
        cards.forEach(function (card) {
          var haystack = [
            card.dataset.title || '',
            card.dataset.region || '',
            card.dataset.type || '',
            card.dataset.genre || '',
            card.dataset.year || '',
            card.textContent || ''
          ].join(' ').toLowerCase();
          var match = true;
          if (values.q && haystack.indexOf(values.q) === -1) {
            match = false;
          }
          if (values.region && (card.dataset.region || '').toLowerCase().indexOf(values.region) === -1) {
            match = false;
          }
          if (values.genre && (card.dataset.genre || '').toLowerCase().indexOf(values.genre) === -1) {
            match = false;
          }
          if (values.year && (card.dataset.year || '').toLowerCase().indexOf(values.year) === -1) {
            match = false;
          }
          card.hidden = !match;
        });
      }

      inputs.forEach(function (input) {
        input.addEventListener('input', filterCards);
        input.addEventListener('change', filterCards);
      });
    });
  }

  function attachStream(video) {
    if (!video || activePlayers.has(video)) {
      return;
    }
    var stream = video.getAttribute('data-stream');
    if (!stream) {
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hls.loadSource(stream);
      hls.attachMedia(video);
      activePlayers.set(video, hls);
      return;
    }
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = stream;
      activePlayers.set(video, true);
      return;
    }
    video.src = stream;
    activePlayers.set(video, true);
  }

  function initPlayers() {
    selectAll('[data-player]').forEach(function (player) {
      var video = player.querySelector('video');
      var button = player.querySelector('[data-play]');
      if (!video) {
        return;
      }

      function playVideo() {
        attachStream(video);
        player.classList.add('is-playing');
        var result = video.play();
        if (result && typeof result.catch === 'function') {
          result.catch(function () {});
        }
      }

      if (button) {
        button.addEventListener('click', playVideo);
      }
      video.addEventListener('click', function () {
        attachStream(video);
      });
      video.addEventListener('play', function () {
        player.classList.add('is-playing');
      });
      video.addEventListener('pause', function () {
        if (video.currentTime === 0) {
          player.classList.remove('is-playing');
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initImages();
    initMenu();
    initHero();
    initFilters();
    initPlayers();
  });
})();
