(function () {
  var menuButtons = document.querySelectorAll("[data-menu-toggle]");
  menuButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      var nav = document.querySelector("[data-mobile-nav]");
      if (nav) {
        nav.classList.toggle("is-open");
      }
    });
  });

  var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
  var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
  var currentSlide = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    currentSlide = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle("active", slideIndex === currentSlide);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle("active", dotIndex === currentSlide);
    });
  }

  document.querySelectorAll("[data-hero-next]").forEach(function (button) {
    button.addEventListener("click", function () {
      showSlide(currentSlide + 1);
    });
  });

  document.querySelectorAll("[data-hero-prev]").forEach(function (button) {
    button.addEventListener("click", function () {
      showSlide(currentSlide - 1);
    });
  });

  dots.forEach(function (dot, index) {
    dot.addEventListener("click", function () {
      showSlide(index);
    });
  });

  if (slides.length) {
    showSlide(0);
    setInterval(function () {
      showSlide(currentSlide + 1);
    }, 6200);
  }

  function textMatch(card, keyword) {
    var haystack = [
      card.getAttribute("data-title") || "",
      card.getAttribute("data-year") || "",
      card.getAttribute("data-region") || "",
      card.getAttribute("data-genre") || "",
      card.getAttribute("data-tags") || ""
    ].join(" ").toLowerCase();
    return haystack.indexOf(keyword.toLowerCase()) !== -1;
  }

  function filterCards(keyword) {
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
    var visible = 0;
    cards.forEach(function (card) {
      var match = !keyword || textMatch(card, keyword);
      card.style.display = match ? "" : "none";
      if (match) {
        visible += 1;
      }
    });
    var empty = document.querySelector("[data-search-empty]");
    if (empty) {
      empty.classList.toggle("is-visible", visible === 0);
    }
  }

  var params = new URLSearchParams(window.location.search);
  var initialQuery = params.get("q") || "";
  var liveSearch = document.querySelector("[data-live-search]");
  if (liveSearch) {
    liveSearch.value = initialQuery;
    filterCards(initialQuery);
    liveSearch.addEventListener("input", function () {
      filterCards(liveSearch.value.trim());
    });
  }

  var chips = Array.prototype.slice.call(document.querySelectorAll("[data-filter-chip]"));
  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      var value = chip.getAttribute("data-filter-chip") || "";
      chips.forEach(function (item) {
        item.classList.remove("active");
      });
      chip.classList.add("active");
      var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
      cards.forEach(function (card) {
        if (value === "all") {
          card.style.display = "";
          return;
        }
        var year = card.getAttribute("data-year") || "";
        var genre = card.getAttribute("data-genre") || "";
        var region = card.getAttribute("data-region") || "";
        var tags = card.getAttribute("data-tags") || "";
        var text = [year, genre, region, tags].join(" ");
        card.style.display = text.indexOf(value) !== -1 ? "" : "none";
      });
    });
  });

  function startPlayer(box) {
    var video = box.querySelector("video");
    var cover = box.querySelector(".play-cover");
    var src = box.getAttribute("data-src");
    if (!video || !src) {
      return;
    }
    if (!video.getAttribute("data-ready")) {
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = src;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(src);
        hls.attachMedia(video);
        box._hls = hls;
      } else {
        video.src = src;
      }
      video.setAttribute("data-ready", "1");
    }
    if (cover) {
      cover.classList.add("is-hidden");
    }
    video.controls = true;
    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(function () {});
    }
  }

  document.querySelectorAll("[data-player]").forEach(function (box) {
    var cover = box.querySelector(".play-cover");
    var video = box.querySelector("video");
    if (cover) {
      cover.addEventListener("click", function () {
        startPlayer(box);
      });
    }
    if (video) {
      video.addEventListener("click", function () {
        if (!video.getAttribute("data-ready")) {
          startPlayer(box);
        }
      });
    }
  });
})();
