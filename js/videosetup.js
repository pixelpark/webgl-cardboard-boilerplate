/**
 * A constructor function that leads to an objects that will setup the video-context
 * of the ar-app
 * @type Function|undefined
 */
var VideoSetup = (function () {

  /**
   * Initialised mostly empty values
   * @param {type} constants
   * @param {type} videoleftcontainer
   * @param {type} videorightcontainer
   * @returns {videosetup_L6.VideoSetup}
   */
  function VideoSetup(constants, videoleftcontainer, videorightcontainer) {
    this.videoleftcontainer = videoleftcontainer; // RENAME!!! NAMES ARE TOO LONG!!
    this.videorightcontainer = videorightcontainer;
    this.videoright = null;
    this.videoleft = null;
    this.leftcontainer = null;
    this.rightcontainer = null;
    this.videoPlaying = false;
    this.videoSupport = false;
    this.resizeTimeout = null;
    this.constants = constants;
    
    this.originalVideoWidth = 0;
    this.fullscreen = false;
    this.videoLoaded = {
      left : false,
      right: false
    };
  }

  /**
   * will be called when resizing the window
   * just puts the both video to their correct position
   * for the actual size see css-files
   * @returns {undefined}
   */
  VideoSetup.prototype.resizeVideo = function () {
    if (this.videoLoaded.left && this.videoLoaded.right) {
      this.resizeSingleVideo(this.videoleft, this.videoleftcontainer);
      this.resizeSingleVideo(this.videoright, this.videorightcontainer);
    }
  };
  
  VideoSetup.prototype.resizeSingleVideo = function (videoElement, container) {
    if (this.originalVideoWidth > 0) {
      var width = this.originalVideoWidth / 2;
      if (this.fullscreen) {
        width = this.originalVideoWidth;
      }
      
      videoElement.style.width = width + 'px';
      var height = videoElement.clientHeight;
      var offsetWidth = (container.clientWidth - width) / 2;
      var offsetHeight = (container.clientHeight - height) / 2;
      videoElement.style.left = offsetWidth + 'px';
      videoElement.style.top = offsetHeight + 'px';
    }
    var verticalMargin = this.constants.verticalMargin;
    if (this.fullscreen) {
      verticalMargin = 0;
    }
    container.style.top = verticalMargin + 'px';
  };

  /**
   * Creates and returns a video-elements
   * one for the left and one for the right eye
   * @param {type} streamSrc
   * @returns {Element|videosetup_L6.VideoSetup.prototype.configVideoElement.videoElement}
   */
  VideoSetup.prototype.configVideoElement = function (streamSrc, container, site) {
    var videoElement = document.createElement('video');
    videoElement.autoplay = true;
    videoElement.src = streamSrc;
    videoElement.play();
    videoElement.addEventListener('loadedmetadata', function (e) {
      this.originalVideoWidth = e.target.clientWidth;
      this.videoLoaded[site] = true;
      this.resizeVideo(e.target, e.target.parentElement);
    }.bind(this));

    container.appendChild(videoElement);
    return videoElement;
  };

  /**
   * Get the video stream running and create both video-elements
   * @param {type} leftcontainer
   * @param {type} rightcontainer
   * @returns {undefined}
   */
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
                        {sourceId: videoSource}/*,
                         {minWidth: this.constants.videoWidth},
                         {maxWidth: this.constants.videoWidth},
                         {minHeight: this.constants.videoHeight},
                         {maxHeight: this.constants.videoHeight}*/
                      ]
                    },
                    //video: true, 
                    audio: false
                  },
          (function (stream) {

            var urlStream = window.URL.createObjectURL(stream);
            this.videoleft = this.configVideoElement(urlStream, this.leftcontainer, 'left');

            this.videoright = this.configVideoElement(urlStream, this.rightcontainer, 'right');

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

  /**
   * Initialises the video-stream for both eyes
   * and sets up an event-listener for resizing
   */
  VideoSetup.prototype.init = function () {
    this.getVideoStream(this.videoleftcontainer, this.videorightcontainer);

    window.addEventListener('resize', (function () {
      if (this.resizeTimeout) {
        window.clearTimeout(this.resizeTimeout);
        this.resizeTimeout = null;
      }
      this.resizeTimeout = window.setTimeout(this.resizeVideo.bind(this), 100);
    }).bind(this), false);
  };

  /**
   * Shows the video and therefor the "reality"
   */
  VideoSetup.prototype.show = function () {
    if (this.videoleft && this.videoright && this.videoSupport) {
      this.videoPlaying = true;
      this.videoleft.play();
      this.videoleft.style.display = 'block';
      this.videoright.play();
      this.videoright.style.display = 'block';
    }
  };

  /**
   * Hides the "reality"
   */
  VideoSetup.prototype.hide = function () {
    if (this.videoleft && this.videoright && this.videoSupport) {
      this.videoPlaying = false;
      this.videoleft.pause();
      this.videoleft.style.display = 'none';
      this.videoright.pause();
      this.videoright.style.display = 'none';
    }
  };

  VideoSetup.prototype.setFullscreen = function (fullscreen) {
    if (this.videoleft && this.videoright && this.videoSupport) {
      if (fullscreen) {
        this.videorightcontainer.style.display = 'none';
        this.videoleftcontainer.style.width = '100%';
        this.videoleft.style.width = this.originalVideoWidth + 'px';
        this.fullscreen = true;
        this.resizeVideo();
      } else {
        this.videorightcontainer.style.display = 'block';
        this.videoleftcontainer.style.width = '50%';
        this.videoleft.style.width = (this.originalVideoWidth/2) + 'px';
        this.fullscreen = false;
        this.resizeVideo();
      }
    }
  };

  return VideoSetup;
})();

