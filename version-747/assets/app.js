(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  qsa('[data-cover]').forEach(function (img) {
    img.addEventListener('error', function () {
      img.classList.add('image-missing');
    });
  });

  var menuButton = qs('[data-menu-toggle]');
  var mobilePanel = qs('[data-mobile-panel]');
  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('open');
    });
  }

  qsa('[data-search-form]').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      var input = qs('input[name="q"]', form);
      if (!input || !input.value.trim()) {
        event.preventDefault();
        window.location.href = './search.html';
      }
    });
  });

  var hero = qs('[data-hero]');
  if (hero) {
    var track = qs('[data-hero-track]', hero);
    var slides = qsa('[data-hero-slide]', hero);
    var dots = qsa('[data-hero-dot]', hero);
    var current = 0;
    var timer = null;

    function go(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      track.style.transform = 'translateX(-' + current * 100 + '%)';
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === current);
      });
    }

    function start() {
      timer = window.setInterval(function () {
        go(current + 1);
      }, 5000);
    }

    function restart() {
      window.clearInterval(timer);
      start();
    }

    var prev = qs('[data-hero-prev]', hero);
    var next = qs('[data-hero-next]', hero);
    if (prev) {
      prev.addEventListener('click', function () {
        go(current - 1);
        restart();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        go(current + 1);
        restart();
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        go(Number(dot.getAttribute('data-hero-dot')) || 0);
        restart();
      });
    });
    start();
  }

  var searchPage = qs('[data-search-page]');
  if (searchPage) {
    var params = new URLSearchParams(window.location.search);
    var keywordInput = qs('[data-filter-keyword]', searchPage);
    var typeSelect = qs('[data-filter-type]', searchPage);
    var regionSelect = qs('[data-filter-region]', searchPage);
    var yearSelect = qs('[data-filter-year]', searchPage);
    var resultLine = qs('[data-result-line]', searchPage);
    var cards = qsa('.movie-card', searchPage);
    var initialQuery = params.get('q') || '';

    if (keywordInput) {
      keywordInput.value = initialQuery;
    }

    function matchAny(value, terms) {
      if (!terms) {
        return true;
      }
      return terms.split(' ').filter(Boolean).some(function (term) {
        return value.indexOf(term.toLowerCase()) !== -1;
      });
    }

    function filterCards() {
      var keyword = (keywordInput && keywordInput.value || '').trim().toLowerCase();
      var type = (typeSelect && typeSelect.value || '').toLowerCase();
      var region = (regionSelect && regionSelect.value || '').toLowerCase();
      var year = (yearSelect && yearSelect.value || '').toLowerCase();
      var visible = 0;

      cards.forEach(function (card) {
        var search = (card.getAttribute('data-search') || '').toLowerCase();
        var cardType = (card.getAttribute('data-type') || '').toLowerCase();
        var cardRegion = (card.getAttribute('data-region') || '').toLowerCase();
        var cardYear = (card.getAttribute('data-year') || '').toLowerCase();
        var ok = true;

        if (keyword && search.indexOf(keyword) === -1) {
          ok = false;
        }
        if (type && cardType.indexOf(type) === -1 && search.indexOf(type) === -1) {
          ok = false;
        }
        if (region && !matchAny(cardRegion + ' ' + search, region)) {
          ok = false;
        }
        if (year && cardYear.indexOf(year) === -1) {
          ok = false;
        }

        card.hidden = !ok;
        if (ok) {
          visible += 1;
        }
      });

      if (resultLine) {
        resultLine.textContent = visible ? '匹配影片 ' + visible + ' 部' : '没有匹配的影片';
      }
    }

    [keywordInput, typeSelect, regionSelect, yearSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', filterCards);
        control.addEventListener('change', filterCards);
      }
    });
    filterCards();
  }

  qsa('[data-player]').forEach(function (player) {
    var video = qs('[data-video]', player);
    var source = player.getAttribute('data-source');
    var button = qs('[data-play-button]', player);
    var hlsInstance = null;

    function attach() {
      if (!video || !source || video.getAttribute('data-ready') === '1') {
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else {
        video.src = source;
      }
      video.setAttribute('data-ready', '1');
    }

    function play() {
      attach();
      player.classList.add('is-playing');
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          player.classList.remove('is-playing');
        });
      }
    }

    if (button && video) {
      button.addEventListener('click', play);
      video.addEventListener('play', function () {
        player.classList.add('is-playing');
      });
      video.addEventListener('pause', function () {
        if (video.currentTime === 0 || video.ended) {
          player.classList.remove('is-playing');
        }
      });
      video.addEventListener('click', function () {
        if (video.paused) {
          play();
        }
      });
      window.addEventListener('pagehide', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    }
  });
})();
