var VideoSetup = (function () {

  function VideoSetup(constants, videoleftcontainer, videorightcontainer) {
    this.videoleftcontainer = videoleftcontainer; // RENAME!!! NAMES ARE TOO LONG!!
    this.videorightcontainer = videorightcontainer;
    this.videoright = null;
    this.videoleft = null;
    this.videoPlaying = false;
    this.resizeTimeout = null;
    this.constants = constants;
  }

  VideoSetup.prototype.resizeVideo = function () {
    var verticalMargin = this.constants.verticalMargin;
    this.videoleftcontainer.style.top = verticalMargin + 'px';
    this.videorightcontainer.style.top = verticalMargin + 'px';
  };

  VideoSetup.prototype.getVideoStream = function (leftcontainer, rightcontainer) {
    // @TODO: some repeated code ....do not do so
    this.videoleft = document.createElement('video');
    this.videoleft.autoplay = true;
    this.videoleft.width = 640;
    this.videoleft.height = 480;
    this.videoleft.id = 'videoleft';
    leftcontainer.appendChild(this.videoleft);

    this.videoright = document.createElement('video');
    this.videoright.autoplay = true;
    this.videoright.width = 640;
    this.videoright.height = 480;
    this.videoright.id = 'videoright';
    rightcontainer.appendChild(this.videoright);


    var getUserMedia = navigator.getUserMedia ? function (a, b, c) {
      navigator.getUserMedia(a, b, c);
    } : (navigator.webkitGetUserMedia ? function (a, b, c) {
      navigator.webkitGetUserMedia(a, b, c);
    } : null);

    if (getUserMedia !== null) {
      MediaStreamTrack.getSources((function (sourceInfos) {
        var videoSource = null;
        // Select the rear camera. We are assuming it is the last one.
        // TODO: assumption is the mother of all...
        for (var i = 0; i < sourceInfos.length; i++) {
          var sourceInfo = sourceInfos[i];
          if (sourceInfo.kind === 'video') {
            videoSource = sourceInfo.id;
            //break; // uncomment for selecting the first one.
          }
        }

        if (videoSource !== null) {
          getUserMedia.call(window,
                  {
                    video: {
                      optional: [
                        {sourceId: videoSource},
                        {minWidth: 640},
                        {maxWidth: 640},
                        {minHeight: 480},
                        {maxHeight: 480}
                      ]
                    },
                    //video: true, 
                    audio: false
                  },
          (function (stream) {
            this.videoleft.src = window.URL.createObjectURL(stream);
            this.videoleft.play();
            this.videoright.src = window.URL.createObjectURL(stream);
            this.videoright.play();
            this.videoPlaying = true;
            window.dispatchEvent(new Event('resize'));
            console.log("Video setup ok");
          }).bind(this),
                  (function (error) {
                    this.videoPlaying = false;
                    console.log('Video capture disabled');
                  }).bind(this)
                  );
        } else {
          console.log("Video capture not available");
        }
      }).bind(this));
    } else {
      console.log("HTML5 video not supported");
    }
  };

  VideoSetup.prototype.init = function () {
    this.getVideoStream(this.videoleftcontainer, this.videorightcontainer);
    this.resizeVideo();

    window.addEventListener('resize', (function () {
      if (this.resizeTimeout) {
        window.clearTimeout(this.resizeTimeout);
        this.resizeTimeout = null;
      }
      this.resizeTimeout = window.setTimeout(this.resizeVideo.bind(this), 100);
    }).bind(this), false);
  };

  VideoSetup.prototype.show = function () {
    if (this.videoleft && this.videoright) {
      this.videoleft.play();
      this.videoleft.style.display = 'block';
      this.videoright.play();
      this.videoright.style.display = 'block';
    }
  };

  VideoSetup.prototype.hide = function () {
    if (this.videoleft && this.videoright) {
      this.videoPlaying = false;
      this.videoleft.pause();
      this.videoleft.style.display = 'none';
      this.videoright.pause();
      this.videoright.style.display = 'none';
    }
  };

  return VideoSetup;
})();

