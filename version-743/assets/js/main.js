(function () {
  function normalize(value) {
    return (value || "").toString().toLowerCase().trim();
  }

  function collectText(card) {
    return normalize([
      card.dataset.title,
      card.dataset.region,
      card.dataset.genre,
      card.dataset.tags,
      card.dataset.year,
      card.textContent
    ].join(" "));
  }

  function applyFilter(gridName) {
    var grid = document.querySelector('[data-grid="' + gridName + '"]');
    if (!grid) {
      return;
    }
    var input = document.querySelector('[data-search="' + gridName + '"]');
    var query = normalize(input ? input.value : "");
    var activeChip = document.querySelector('[data-filter-group="' + gridName + '"] .filter-chip.active');
    var chipValue = activeChip ? normalize(activeChip.dataset.filter) : "all";
    var cards = grid.querySelectorAll(".movie-card, .rank-item");
    cards.forEach(function (card) {
      var text = collectText(card);
      var matchesQuery = !query || text.indexOf(query) !== -1;
      var matchesChip = chipValue === "all" || text.indexOf(chipValue) !== -1;
      card.classList.toggle("is-hidden", !(matchesQuery && matchesChip));
    });
  }

  var menuButton = document.querySelector("[data-menu-toggle]");
  var menu = document.getElementById("site-nav");
  if (menuButton && menu) {
    menuButton.addEventListener("click", function () {
      menu.classList.toggle("open");
    });
  }

  document.querySelectorAll("[data-search]").forEach(function (input) {
    input.addEventListener("input", function () {
      applyFilter(input.dataset.search);
    });
  });

  document.querySelectorAll("[data-filter-group]").forEach(function (group) {
    group.addEventListener("click", function (event) {
      var button = event.target.closest(".filter-chip");
      if (!button) {
        return;
      }
      group.querySelectorAll(".filter-chip").forEach(function (chip) {
        chip.classList.remove("active");
      });
      button.classList.add("active");
      applyFilter(group.dataset.filterGroup);
    });
  });
})();
