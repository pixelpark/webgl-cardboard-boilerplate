var VideoSetup = (function () {

  function VideoSetup(constants, videoleftcontainer, videorightcontainer) {
    this.videoleftcontainer = videoleftcontainer; // RENAME!!! NAMES ARE TOO LONG!!
    this.videorightcontainer = videorightcontainer;
    this.videoright = null;
    this.videoleft = null;
    this.leftcontainer = null
    this.rightcontainer = null;
    this.videoPlaying = false;
    this.videoSupport = false;
    this.resizeTimeout = null;
    this.constants = constants;
  }

  VideoSetup.prototype.resizeVideo = function () {
    var verticalMargin = this.constants.verticalMargin;
    this.videoleftcontainer.style.top = verticalMargin + 'px';
    this.videorightcontainer.style.top = verticalMargin + 'px';
  };
  
  VideoSetup.prototype.configVideoElement = function (videoElement, id, streamSrc) {
      videoElement.autoplay = true;
      videoElement.width = this.constants.videoWidth;
      videoElement.height = this.constants.videoHeight;
      videoElement.id = id;
      videoElement.src = streamSrc;
      videoElement.play();
      return videoElement;
  };

  VideoSetup.prototype.getVideoStream = function (leftcontainer, rightcontainer) {
    this.leftcontainer = leftcontainer;
    this.rightcontainer = rightcontainer;

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
                        {minWidth: this.constants.videoWidth},
                        {maxWidth: this.constants.videoWidth},
                        {minHeight: this.constants.videoHeight},
                        {maxHeight: this.constants.videoHeight}
                      ]
                    },
                    //video: true, 
                    audio: false
                  },
                  (function (stream) {
                    
                    var urlStream = window.URL.createObjectURL(stream);
                    this.videoleft = document.createElement('video');
                    this.leftcontainer.appendChild(this.videoleft);
                    this.videoleft = this.configVideoElement(this.videoleft, 'videoleft', urlStream);
                    
                    this.videoright = document.createElement('video');
                    this.rightcontainer.appendChild(this.videoright);
                    this.videoright = this.configVideoElement(this.videoright, 'videoright', urlStream);
                    
                    this.videoPlaying = true;
                    this.videoSupport = true;
                    window.dispatchEvent(new Event('resize'));
                    console.log("Video setup ok");
                  }).bind(this),
                  (function (error) {
                    this.videoSupport = false;
                    console.log('Video capture disabled');
                  }).bind(this)
                  );
        } else {
          this.videoSupport = false;
          console.log("Video capture not available");
        }
      }).bind(this));
    } else {
      this.videoSupport = false;
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
    if (this.videoleft && this.videoright && this.videoSupport) {
      this.videoPlaying = true;
      this.videoleft.play();
      this.videoleft.style.display = 'block';
      this.videoright.play();
      this.videoright.style.display = 'block';
    }
  };

  VideoSetup.prototype.hide = function () {
    if (this.videoleft && this.videoright && this.videoSupport) {
      this.videoPlaying = false;
      this.videoleft.pause();
      this.videoleft.style.display = 'none';
      this.videoright.pause();
      this.videoright.style.display = 'none';
    }
  };

  return VideoSetup;
})();

