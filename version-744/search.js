(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function getParam(name) {
    return new URLSearchParams(window.location.search).get(name) || '';
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function movieCard(movie) {
    return [
      '<a class="movie-card" href="' + escapeHtml(movie.url) + '" data-title="' + escapeHtml(movie.title) + '" data-region="' + escapeHtml(movie.region) + '" data-type="' + escapeHtml(movie.type) + '" data-year="' + escapeHtml(movie.year) + '" data-genre="' + escapeHtml(movie.genre) + '">',
      '  <div class="movie-poster image-shell">',
      '    <img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '    <span class="poster-fallback">' + escapeHtml(movie.title) + '</span>',
      '    <span class="type-badge">' + escapeHtml(movie.type) + '</span>',
      '    <span class="year-badge">' + escapeHtml(movie.year) + '</span>',
      '  </div>',
      '  <div class="movie-card-body">',
      '    <h3>' + escapeHtml(movie.title) + '</h3>',
      '    <p class="movie-card-line">' + escapeHtml(movie.oneLine) + '</p>',
      '    <div class="movie-meta-row"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.genre) + '</span></div>',
      '    <div class="movie-tags-mini">' + escapeHtml((movie.tags || []).slice(0, 3).join(' / ')) + '</div>',
      '  </div>',
      '</a>'
    ].join('\n');
  }

  ready(function () {
    var movies = window.MOVIES || [];
    var input = document.getElementById('searchInput');
    var regionSelect = document.getElementById('regionSelect');
    var typeSelect = document.getElementById('typeSelect');
    var yearSelect = document.getElementById('yearSelect');
    var resetButton = document.getElementById('resetSearch');
    var results = document.getElementById('searchResults');
    var count = document.getElementById('searchCount');
    var empty = document.getElementById('searchEmpty');

    if (!input || !results) {
      return;
    }

    input.value = getParam('q');

    function normalize(value) {
      return String(value || '').toLowerCase().trim();
    }

    function matches(movie) {
      var q = normalize(input.value);
      var region = normalize(regionSelect.value);
      var type = normalize(typeSelect.value);
      var year = normalize(yearSelect.value);
      var haystack = normalize([
        movie.title,
        movie.region,
        movie.type,
        movie.year,
        movie.genre,
        movie.oneLine,
        (movie.tags || []).join(' '),
        movie.category
      ].join(' '));

      return (!q || haystack.indexOf(q) !== -1)
        && (!region || normalize(movie.region) === region)
        && (!type || normalize(movie.type) === type)
        && (!year || normalize(movie.year) === year);
    }

    function render() {
      var filtered = movies.filter(matches).slice(0, 240);
      results.innerHTML = filtered.map(movieCard).join('\n');
      if (count) {
        count.textContent = String(movies.filter(matches).length);
      }
      if (empty) {
        empty.hidden = filtered.length !== 0;
      }
      results.querySelectorAll('.image-shell img').forEach(function (img) {
        img.addEventListener('error', function () {
          var shell = img.closest('.image-shell');
          if (shell) {
            shell.classList.add('is-missing');
          }
        }, { once: true });
      });
    }

    [input, regionSelect, typeSelect, yearSelect].forEach(function (control) {
      control.addEventListener('input', render);
      control.addEventListener('change', render);
    });

    if (resetButton) {
      resetButton.addEventListener('click', function () {
        input.value = '';
        regionSelect.value = '';
        typeSelect.value = '';
        yearSelect.value = '';
        render();
      });
    }

    render();
  });
})();
