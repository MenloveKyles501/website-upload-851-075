function SitePlayer(config) {
  var video = document.getElementById(config.video);
  var button = document.getElementById(config.button);
  var source = config.source;
  var started = false;

  function attachSource() {
    if (!video || !source) {
      return;
    }
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      return;
    }
    video.src = source;
  }

  function play() {
    if (!video) {
      return;
    }
    if (!started) {
      started = true;
      attachSource();
    }
    if (button) {
      button.classList.add("is-playing");
    }
    var action = video.play();
    if (action && action.catch) {
      action.catch(function () {
        if (button) {
          button.classList.remove("is-playing");
        }
      });
    }
  }

  if (button) {
    button.addEventListener("click", play);
  }
  if (video) {
    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      }
    });
  }
}
