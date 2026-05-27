(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var index = 0;
    var timer = null;

    function showSlide(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function startHero() {
      stopHero();
      timer = window.setInterval(function () {
        showSlide(index + 1);
      }, 5200);
    }

    function stopHero() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        showSlide(dotIndex);
        startHero();
      });
    });

    hero.addEventListener('mouseenter', stopHero);
    hero.addEventListener('mouseleave', startHero);
    showSlide(0);
    startHero();
  }

  var searchInput = document.querySelector('[data-search-input]');
  var filterChips = Array.prototype.slice.call(document.querySelectorAll('[data-filter]'));
  var cards = Array.prototype.slice.call(document.querySelectorAll('.searchable-card'));
  var emptyState = document.querySelector('[data-empty-state]');
  var activeFilter = 'all';

  function normalize(value) {
    return (value || '').toString().trim().toLowerCase();
  }

  function cardText(card) {
    return normalize([
      card.dataset.title,
      card.dataset.tags,
      card.dataset.region,
      card.dataset.type,
      card.dataset.year,
      card.textContent
    ].join(' '));
  }

  function applyFilters() {
    var query = normalize(searchInput ? searchInput.value : '');
    var visible = 0;

    cards.forEach(function (card) {
      var haystack = cardText(card);
      var matchesQuery = !query || haystack.indexOf(query) !== -1;
      var matchesFilter = activeFilter === 'all' || haystack.indexOf(normalize(activeFilter)) !== -1;
      var shouldShow = matchesQuery && matchesFilter;
      card.hidden = !shouldShow;
      if (shouldShow) {
        visible += 1;
      }
    });

    if (emptyState) {
      emptyState.hidden = visible !== 0;
    }
  }

  if (searchInput || filterChips.length) {
    if (searchInput) {
      searchInput.addEventListener('input', applyFilters);
    }

    filterChips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        activeFilter = chip.dataset.filter || 'all';
        filterChips.forEach(function (item) {
          item.classList.toggle('is-active', item === chip);
        });
        applyFilters();
      });
    });
  }
})();
