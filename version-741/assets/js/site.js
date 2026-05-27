(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalise(value) {
    return (value || '').toString().trim().toLowerCase();
  }

  function setupMobileMenu() {
    var button = qs('[data-mobile-toggle]');
    var menu = qs('[data-mobile-menu]');

    if (!button || !menu) {
      return;
    }

    button.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  function setupCarousel() {
    var carousel = qs('[data-carousel]');

    if (!carousel) {
      return;
    }

    var slides = qsa('.hero-slide', carousel);
    var dots = qsa('[data-slide-to]', carousel);
    var prev = qs('[data-carousel-prev]', carousel);
    var next = qs('[data-carousel-next]', carousel);
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function play() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-slide-to')) || 0);
        play();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        play();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        play();
      });
    }

    carousel.addEventListener('mouseenter', stop);
    carousel.addEventListener('mouseleave', play);
    show(0);
    play();
  }

  function setupFilters() {
    var forms = qsa('[data-filter-form]');

    forms.forEach(function (form) {
      var list = form.parentElement.querySelector('[data-filter-list]');
      var cards = list ? qsa('.searchable-card', list) : [];
      var keywordInput = qs('[data-filter-keyword]', form);
      var typeSelect = qs('[data-filter-type]', form);
      var regionSelect = qs('[data-filter-region]', form);
      var yearSelect = qs('[data-filter-year]', form);
      var summary = form.parentElement.querySelector('[data-filter-summary]');
      var params = new URLSearchParams(window.location.search);
      var initialQuery = params.get('q');

      if (keywordInput && initialQuery) {
        keywordInput.value = initialQuery;
      }

      function readCardText(card) {
        return [
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-year'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-tags'),
          card.getAttribute('data-category')
        ].join(' ').toLowerCase();
      }

      function applyFilter() {
        var keyword = normalise(keywordInput && keywordInput.value);
        var type = normalise(typeSelect && typeSelect.value);
        var region = normalise(regionSelect && regionSelect.value);
        var year = normalise(yearSelect && yearSelect.value);
        var visible = 0;

        cards.forEach(function (card) {
          var text = readCardText(card);
          var cardType = normalise(card.getAttribute('data-type'));
          var cardRegion = normalise(card.getAttribute('data-region'));
          var cardYear = normalise(card.getAttribute('data-year'));
          var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
          var matchType = !type || cardType === type;
          var matchRegion = !region || cardRegion === region;
          var matchYear = true;

          if (year) {
            if (year === '2026以后') {
              matchYear = Number(cardYear.slice(0, 4)) >= 2026;
            } else if (year === '2020年代') {
              matchYear = Number(cardYear.slice(0, 4)) >= 2020 && Number(cardYear.slice(0, 4)) < 2026;
            } else if (year === '2010年代') {
              matchYear = Number(cardYear.slice(0, 4)) >= 2010 && Number(cardYear.slice(0, 4)) < 2020;
            } else if (year === '2000年代') {
              matchYear = Number(cardYear.slice(0, 4)) >= 2000 && Number(cardYear.slice(0, 4)) < 2010;
            } else if (year === '经典年份') {
              matchYear = Number(cardYear.slice(0, 4)) < 2000;
            } else {
              matchYear = cardYear.indexOf(year) !== -1;
            }
          }

          var isVisible = matchKeyword && matchType && matchRegion && matchYear;
          card.classList.toggle('is-hidden-by-filter', !isVisible);

          if (isVisible) {
            visible += 1;
          }
        });

        if (summary) {
          summary.textContent = visible > 0 ? '当前条件下可浏览 ' + visible + ' 条内容' : '没有匹配内容，请调整筛选条件';
        }
      }

      ['input', 'change'].forEach(function (eventName) {
        form.addEventListener(eventName, applyFilter);
      });

      form.addEventListener('reset', function () {
        window.setTimeout(applyFilter, 0);
      });

      applyFilter();
    });
  }

  function loadHlsScript() {
    return new Promise(function (resolve, reject) {
      if (window.Hls) {
        resolve(window.Hls);
        return;
      }

      var existing = document.querySelector('script[data-hls-loader]');

      if (existing) {
        existing.addEventListener('load', function () {
          resolve(window.Hls);
        });
        existing.addEventListener('error', reject);
        return;
      }

      var script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/hls.js@latest';
      script.async = true;
      script.setAttribute('data-hls-loader', 'true');
      script.onload = function () {
        resolve(window.Hls);
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  function showPlayerMessage(video, message) {
    var shell = video.closest('.video-shell');
    var messageBox = shell ? shell.querySelector('[data-player-message]') : null;

    if (!messageBox) {
      return;
    }

    messageBox.textContent = message;
    messageBox.classList.add('is-visible');
  }

  function attachNativeHls(video, source) {
    video.src = source;
    return Promise.resolve();
  }

  function attachHlsJs(video, source) {
    return loadHlsScript().then(function (Hls) {
      if (!Hls || !Hls.isSupported()) {
        throw new Error('当前浏览器暂不支持 HLS 播放');
      }

      var hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });

      hls.loadSource(source);
      hls.attachMedia(video);
      video._hlsInstance = hls;
    });
  }

  function setupPlayers() {
    document.addEventListener('click', function (event) {
      var startButton = event.target.closest('[data-player-start]');

      if (!startButton) {
        return;
      }

      var shell = startButton.closest('.video-shell');
      var video = shell ? shell.querySelector('video[data-src]') : null;

      if (!video) {
        return;
      }

      var source = video.getAttribute('data-src');

      if (!source) {
        showPlayerMessage(video, '当前影片暂未绑定播放源');
        return;
      }

      startButton.disabled = true;
      showPlayerMessage(video, '正在初始化播放器...');

      var attachPromise;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        attachPromise = attachNativeHls(video, source);
      } else {
        attachPromise = attachHlsJs(video, source);
      }

      attachPromise.then(function () {
        startButton.classList.add('is-hidden');
        video.controls = true;
        return video.play();
      }).then(function () {
        var messageBox = shell.querySelector('[data-player-message]');

        if (messageBox) {
          messageBox.classList.remove('is-visible');
        }
      }).catch(function (error) {
        startButton.disabled = false;
        showPlayerMessage(video, error && error.message ? error.message : '播放器启动失败，请稍后重试');
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMobileMenu();
    setupCarousel();
    setupFilters();
    setupPlayers();
  });
})();
