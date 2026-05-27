(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  ready(function () {
    var toggle = document.querySelector('.nav-toggle');
    var mobileNav = document.querySelector('.mobile-nav');

    if (toggle && mobileNav) {
      toggle.addEventListener('click', function () {
        var isOpen = mobileNav.hasAttribute('hidden');
        if (isOpen) {
          mobileNav.removeAttribute('hidden');
          toggle.setAttribute('aria-expanded', 'true');
          toggle.textContent = '×';
        } else {
          mobileNav.setAttribute('hidden', '');
          toggle.setAttribute('aria-expanded', 'false');
          toggle.textContent = '☰';
        }
      });
    }

    var hero = document.querySelector('.hero-carousel');
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
      var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
      var prev = hero.querySelector('.hero-control.prev');
      var next = hero.querySelector('.hero-control.next');
      var index = 0;
      var timer = null;

      function showSlide(nextIndex) {
        if (!slides.length) {
          return;
        }
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function (slide, pos) {
          slide.classList.toggle('is-active', pos === index);
        });
        dots.forEach(function (dot, pos) {
          dot.classList.toggle('is-active', pos === index);
        });
      }

      function restart() {
        if (timer) {
          clearInterval(timer);
        }
        timer = setInterval(function () {
          showSlide(index + 1);
        }, 5000);
      }

      dots.forEach(function (dot, pos) {
        dot.addEventListener('click', function () {
          showSlide(pos);
          restart();
        });
      });

      if (prev) {
        prev.addEventListener('click', function () {
          showSlide(index - 1);
          restart();
        });
      }

      if (next) {
        next.addEventListener('click', function () {
          showSlide(index + 1);
          restart();
        });
      }

      restart();
    }

    document.querySelectorAll('[data-scroll-target]').forEach(function (button) {
      button.addEventListener('click', function () {
        var target = document.querySelector(button.getAttribute('data-scroll-target'));
        if (!target) {
          return;
        }
        var amount = button.getAttribute('data-direction') === 'left' ? -440 : 440;
        target.scrollBy({ left: amount, behavior: 'smooth' });
      });
    });

    var params = new URLSearchParams(window.location.search);
    var queryFromUrl = params.get('q') || '';
    var searchInput = document.querySelector('[data-filter-input]');
    var yearFilter = document.querySelector('[data-year-filter]');
    var regionFilter = document.querySelector('[data-region-filter]');
    var typeFilter = document.querySelector('[data-type-filter]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-title]'));
    var noResults = document.querySelector('.no-results');

    if (searchInput && queryFromUrl) {
      searchInput.value = queryFromUrl;
    }

    function includesText(value, query) {
      return String(value || '').toLowerCase().indexOf(query) !== -1;
    }

    function filterCards() {
      if (!cards.length) {
        return;
      }
      var query = searchInput ? searchInput.value.trim().toLowerCase() : '';
      var year = yearFilter ? yearFilter.value : '';
      var region = regionFilter ? regionFilter.value : '';
      var type = typeFilter ? typeFilter.value : '';
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute('data-title'),
          card.getAttribute('data-year'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-tags')
        ].join(' ').toLowerCase();

        var matched = true;
        if (query && !includesText(haystack, query)) {
          matched = false;
        }
        if (year && card.getAttribute('data-year') !== year) {
          matched = false;
        }
        if (region && !includesText(card.getAttribute('data-region'), region.toLowerCase())) {
          matched = false;
        }
        if (type && !includesText(card.getAttribute('data-type'), type.toLowerCase())) {
          matched = false;
        }

        card.hidden = !matched;
        if (matched) {
          visible += 1;
        }
      });

      if (noResults) {
        noResults.hidden = visible !== 0;
      }
    }

    [searchInput, yearFilter, regionFilter, typeFilter].forEach(function (control) {
      if (control) {
        control.addEventListener('input', filterCards);
        control.addEventListener('change', filterCards);
      }
    });

    filterCards();
  });
}());
