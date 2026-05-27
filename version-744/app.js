(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var menuButton = document.querySelector('[data-mobile-menu-button]');
    var mobilePanel = document.querySelector('[data-mobile-panel]');

    if (menuButton && mobilePanel) {
      menuButton.addEventListener('click', function () {
        mobilePanel.classList.toggle('is-open');
        menuButton.textContent = mobilePanel.classList.contains('is-open') ? '×' : '☰';
      });
    }

    document.querySelectorAll('[data-search-form]').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        var input = form.querySelector('input[name="q"]');
        if (input && input.value.trim()) {
          event.preventDefault();
          window.location.href = 'search.html?q=' + encodeURIComponent(input.value.trim());
        }
      });
    });

    document.querySelectorAll('.image-shell img').forEach(function (img) {
      img.addEventListener('error', function () {
        var shell = img.closest('.image-shell');
        if (shell) {
          shell.classList.add('is-missing');
        }
      }, { once: true });
    });

    var heroSlides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var heroDots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var heroIndex = 0;

    function showHero(index) {
      if (!heroSlides.length) {
        return;
      }

      heroIndex = (index + heroSlides.length) % heroSlides.length;
      heroSlides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === heroIndex);
      });
      heroDots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === heroIndex);
      });
    }

    if (heroSlides.length > 1) {
      heroDots.forEach(function (dot) {
        dot.addEventListener('click', function () {
          showHero(Number(dot.getAttribute('data-hero-dot')) || 0);
        });
      });
      window.setInterval(function () {
        showHero(heroIndex + 1);
      }, 5600);
    }

    document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
      var input = scope.querySelector('[data-page-filter]');
      var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
      var countNode = scope.querySelector('[data-visible-count]');
      var quickButtons = Array.prototype.slice.call(scope.querySelectorAll('[data-filter-value]'));
      var quickValue = '';

      function normalized(value) {
        return String(value || '').toLowerCase().trim();
      }

      function cardText(card) {
        return [
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-year'),
          card.getAttribute('data-genre'),
          card.textContent
        ].join(' ').toLowerCase();
      }

      function applyFilter() {
        var keyword = normalized(input ? input.value : '');
        var quick = normalized(quickValue);
        var visible = 0;

        cards.forEach(function (card) {
          var text = cardText(card);
          var matchedKeyword = !keyword || text.indexOf(keyword) !== -1;
          var matchedQuick = !quick || text.indexOf(quick) !== -1;
          var show = matchedKeyword && matchedQuick;
          card.hidden = !show;
          if (show) {
            visible += 1;
          }
        });

        if (countNode) {
          countNode.textContent = String(visible);
        }
      }

      if (input) {
        input.addEventListener('input', applyFilter);
      }

      quickButtons.forEach(function (button) {
        button.addEventListener('click', function () {
          quickButtons.forEach(function (item) {
            item.classList.remove('is-active');
          });
          button.classList.add('is-active');
          quickValue = button.getAttribute('data-filter-value') || '';
          applyFilter();
        });
      });
    });
  });
})();
