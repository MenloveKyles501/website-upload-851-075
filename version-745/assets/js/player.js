(function () {
  function initMoviePlayer(streamUrl) {
    var video = document.getElementById('movie-player');
    var overlay = document.getElementById('player-overlay');
    var message = document.getElementById('player-message');
    var attached = false;
    var hls = null;

    if (!video || !streamUrl) {
      return;
    }

    function setMessage(text) {
      if (!message) {
        return;
      }
      if (text) {
        message.textContent = text;
        message.removeAttribute('hidden');
      } else {
        message.setAttribute('hidden', '');
      }
    }

    function attachStream() {
      if (attached) {
        return;
      }
      attached = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
        setMessage('');
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          setMessage('');
        });
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            setMessage('视频暂时无法播放，请稍后再试');
          }
        });
      } else {
        setMessage('视频暂时无法播放，请稍后再试');
      }
    }

    function startPlayback() {
      attachStream();
      if (overlay) {
        overlay.setAttribute('hidden', '');
      }
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
          if (overlay) {
            overlay.removeAttribute('hidden');
          }
        });
      }
    }

    if (overlay) {
      overlay.addEventListener('click', startPlayback);
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        startPlayback();
      } else {
        video.pause();
      }
    });

    video.addEventListener('play', function () {
      if (overlay) {
        overlay.setAttribute('hidden', '');
      }
    });

    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  window.initMoviePlayer = initMoviePlayer;
}());
