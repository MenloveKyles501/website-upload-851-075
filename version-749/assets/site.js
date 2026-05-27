(function () {
  var $ = function (selector, root) {
    return (root || document).querySelector(selector);
  };

  var $$ = function (selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  };

  function initNavigation() {
    var toggle = $("[data-nav-toggle]");
    var menu = $("[data-nav-menu]");

    if (!toggle || !menu) {
      return;
    }

    toggle.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  function initBackTop() {
    var button = $("[data-back-top]");

    if (!button) {
      return;
    }

    var update = function () {
      if (window.scrollY > 320) {
        button.classList.add("is-visible");
      } else {
        button.classList.remove("is-visible");
      }
    };

    button.addEventListener("click", function () {
      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    });

    window.addEventListener("scroll", update, { passive: true });
    update();
  }

  function initHero() {
    var hero = $("[data-hero]");

    if (!hero) {
      return;
    }

    var slides = $$("[data-hero-slide]", hero);
    var dots = $$("[data-hero-dot]", hero);
    var index = 0;

    if (!slides.length) {
      return;
    }

    var show = function (next) {
      index = (next + slides.length) % slides.length;

      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });

      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    };

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
      });
    });

    show(0);

    window.setInterval(function () {
      show(index + 1);
    }, 5200);
  }

  function initLocalSearch() {
    var searchInput = $("[data-local-search]");
    var cards = $$("[data-card]");
    var activeFilter = "";

    if (!cards.length) {
      return;
    }

    var apply = function () {
      var query = searchInput ? searchInput.value.trim().toLowerCase() : "";

      cards.forEach(function (card) {
        var text = (card.getAttribute("data-keywords") || "").toLowerCase();
        var matchedQuery = !query || text.indexOf(query) !== -1;
        var matchedFilter = !activeFilter || text.indexOf(activeFilter.toLowerCase()) !== -1;
        card.classList.toggle("is-hidden", !(matchedQuery && matchedFilter));
      });
    };

    if (searchInput) {
      searchInput.addEventListener("input", apply);
    }

    $$("[data-filter-value]").forEach(function (button) {
      button.addEventListener("click", function () {
        activeFilter = button.getAttribute("data-filter-value") || "";

        $$("[data-filter-value]").forEach(function (item) {
          item.classList.remove("is-active");
        });

        button.classList.add("is-active");
        apply();
      });
    });

    apply();
  }

  function createResultCard(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");

    return [
      '<article class="movie-card">',
      '<a href="' + movie.url + '" aria-label="' + escapeHtml(movie.title) + '">',
      '<div class="poster-frame">',
      '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '</div>',
      '<div class="card-body">',
      '<div class="card-meta">' + escapeHtml(movie.year) + ' · ' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.type) + '</div>',
      '<h3>' + escapeHtml(movie.title) + '</h3>',
      '<p>' + escapeHtml(movie.oneLine) + '</p>',
      '<div class="tag-row">' + tags + '</div>',
      '</div>',
      '</a>',
      '</article>'
    ].join("");
  }

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>"']/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      }[char];
    });
  }

  function initSearchPage() {
    var input = $("[data-global-search]");
    var results = $("#searchResults");

    if (!input || !results || !window.SEARCH_MOVIES) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var queryParam = params.get("q") || "";
    input.value = queryParam;

    var render = function () {
      var query = input.value.trim().toLowerCase();
      var pool = window.SEARCH_MOVIES;

      var list = query
        ? pool.filter(function (movie) {
          return movie.keywords.toLowerCase().indexOf(query) !== -1;
        }).slice(0, 80)
        : pool.slice(0, 32);

      if (!list.length) {
        results.innerHTML = '<div class="empty-state">没有匹配影片，可以尝试更换关键词。</div>';
        return;
      }

      results.innerHTML = list.map(createResultCard).join("");
    };

    input.addEventListener("input", render);
    render();
  }

  function initPlayers() {
    $$("[data-player]").forEach(function (shell) {
      var video = $("video", shell);
      var overlay = $("[data-play-button]", shell);
      var streamUrl = shell.getAttribute("data-stream");
      var started = false;
      var hlsReady = false;
      var hlsInstance = null;

      if (!video || !streamUrl) {
        return;
      }

      var launch = function () {
        if (started) {
          video.play();
          return;
        }

        started = true;

        if (overlay) {
          overlay.classList.add("is-hidden");
        }

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = streamUrl;
          video.play();
          return;
        }

        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });

          hlsInstance.loadSource(streamUrl);
          hlsInstance.attachMedia(video);

          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            hlsReady = true;
            video.play();
          });

          hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal && hlsInstance) {
              if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                hlsInstance.startLoad();
              } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                hlsInstance.recoverMediaError();
              } else {
                hlsInstance.destroy();
              }
            }
          });

          window.addEventListener("pagehide", function () {
            if (hlsInstance) {
              hlsInstance.destroy();
            }
          });

          return;
        }

        video.src = streamUrl;
        video.play();
      };

      if (overlay) {
        overlay.addEventListener("click", launch);
      }

      video.addEventListener("click", function () {
        if (!started || !hlsReady && !video.currentSrc) {
          launch();
        }
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initNavigation();
    initBackTop();
    initHero();
    initLocalSearch();
    initSearchPage();
    initPlayers();
  });
})();
