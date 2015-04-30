

// store scenes here so that this objects can be reached by every other script
window.scenes = [];
var ARWrapper = (function () {
  'use strict';
  /**
   * A class/object to create 3D-Buttons that can be activated
   * @returns {arwrapper_L5.ButtonFactory}
   */
  // @TODO: Do not declare this a object!!! with its own prototype..
  function ButtonFactory() {
  }

  ButtonFactory.prototype.finishCreate = function (callback, virtualButtonMesh, arData) {
    virtualButtonMesh.arData = arData;
    if (callback) {
      callback(virtualButtonMesh);
    }
  };

  // REMOVE EVIL CALLBACK-HELL!
  // @TODO callback hell and some more defaults and duplicated function calls etc.
  ButtonFactory.prototype.create = function (config) {
    config.callback = config.callback || null;
    var arData = {
      baseColor: config.color,
      name: config.name,
      action: config.action
    },
    count = 0,
    virtualButtonGeometry = new THREE.PlaneGeometry(config.dimensions.x, config.dimensions.y, 1, 1),
    virtualButtonMaterial = new THREE.MeshBasicMaterial({color: config.color}),
    virtualButtonMesh = new THREE.Mesh(virtualButtonGeometry, virtualButtonMaterial);
    
    virtualButtonMesh.position.x = config.position.x || 0;
    virtualButtonMesh.position.y = config.position.y || 0;
    virtualButtonMesh.position.z = config.position.z || 0;
    virtualButtonMesh.rotation.x = config.rotation.x || 0;
    virtualButtonMesh.rotation.y = config.rotation.y || 0;
    virtualButtonMesh.rotation.z = config.rotation.z || 0;

    if (config.baseImagePath) {
      count++;
      THREE.ImageUtils.loadTexture(config.baseImagePath, undefined, (function (texture) {
        var baseTexture = texture;
        baseTexture.minFilter = THREE.NearestFilter;
        arData.baseTexture = baseTexture;

        virtualButtonMaterial.map = baseTexture;


        arData.deactivate = function () {
          this.material.color = new THREE.Color(this.arData.baseColor);
          this.material.map = this.arData.baseTexture;
          this.material.needsUpdate = true;
        }.bind(virtualButtonMesh);
        if (!--count) {
          this.finishCreate(config.callback, virtualButtonMesh, arData);
        }
      }).bind(this),
              (function () {
                if (!--count) {
                  this.finishCreate(config.callback, virtualButtonMesh, arData);
                }
              }).bind(this));
    }

    if (config.activeImagePath) {
      count++;
      THREE.ImageUtils.loadTexture(config.activeImagePath, undefined, (function (texture) {

        var activeTexture = texture;
        activeTexture.minFilter = THREE.NearestFilter;
        arData.activeTexture = activeTexture;
        arData.activate = function () {
          this.material.color = new THREE.Color(0xff9999);
          this.material.map = this.arData.activeTexture;
          this.material.needsUpdate = true;
        }.bind(virtualButtonMesh);
        if (!--count) {
          this.finishCreate(config.callback, virtualButtonMesh, arData);
        }
      }).bind(this),
              (function () {
                if (!--count) {
                  this.finishCreate(config.callback, virtualButtonMesh, arData);
                }
              }).bind(this));
    }

    if (!count) {
      this.finishCreate(config.callback, virtualButtonMesh, arData);
    }

    return virtualButtonMesh;
  };

  var focusableObjects = []; // objects that can be focused - most likely just the buttons
  var toggleObjects = []; // objects that can be hidden or shown - most likely everything else than the buttons

  function ARWrapper(constants, divwebgl) {
    var i = window.scenes.length - 1;
    Object.defineProperties(this, {
      "lookAtInterval": {
        value: 10,
        enumerable: true
      }
    });

    // @TODO:check if div-webgl is correct
    this.divwebgl = divwebgl;
    this.scene = new THREE.Scene();
    this.focusObject = null;
    this.resizeTimeout = null;
    this.lookAtCounter = 0;
    this.fullscreen = false;

    this.constants = constants;

    this.renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
    this.renderer.setClearColor(0x000000, 0);
    this.effect = new THREE.StereoEffect(this.renderer);
    this.effect.focalLength = 2000;
    this.currentRenderer = this.effect;
    this.divwebgl.appendChild(this.renderer.domElement);

    this.camera = new THREE.PerspectiveCamera(40, 1, 100, 10000000);
    this.camera.position.set(0, 1850, 0);
    this.camera.up = new THREE.Vector3(0, 1, 0);
    this.scene.add(this.camera);

    this.raycaster = new THREE.Raycaster();

    this.controls = null;
    this.setControls();

    this.clock = new THREE.Clock();
    this.buttonFactory = new ButtonFactory();

    this.scenes = [];
    for (i; i >= 0; --i) {
      this.scenes.push(new window.scenes[i]());
    }
  }
  
  ARWrapper.prototype.setFullscreen = function (fullscreen) {
    this.fullscreen = fullscreen;
    if (fullscreen) {
      var width = this.renderer.domElement.offsetWidth;
      var height = this.renderer.domElement.offsetHeight;
      this.currentRenderer = this.renderer;
      this.currentRenderer.setScissor( 0, 0, width, height );
      this.currentRenderer.setViewport( 0, 0, width, height );
      this.resizeRenderer();
    } else {
      this.currentRenderer = this.effect;
      this.resizeRenderer();
    }
  };

  /**
   * Show all objects that have been marked before
   * @returns {undefined}
   */
  ARWrapper.prototype.show = function () {
    this.toggleSpecifiedObjects(true);
  };

  /**
   * Hide all objects that have been marked beforehand
   * @returns {undefined}
   */
  ARWrapper.prototype.hide = function () {
    this.toggleSpecifiedObjects(false);
  };

  /**
   * Toggle show/hide-status of all objects that have been marked beforehand
   * @TODO toggle is not realy the correct word
   * @param {type} visible
   * @returns {undefined}
   */
  ARWrapper.prototype.toggleSpecifiedObjects = function (visible) {
    var i = toggleObjects.length - 1;
    var setVisibility = function (object) {
      object.visible = visible;
    };
    for (i; i >= 0; --i) {
      toggleObjects[i].traverse(setVisibility);
    }
  };

  /**
   * Initialise the AR-Wrapper by adding some virtual buttons
   * setup the scene and some light and initialized the scene-objects
   * @returns {undefined}
   */
  ARWrapper.prototype.init = function () {
    var light,
    i = this.scenes.length - 1,
    current = null;
    light = new THREE.AmbientLight(0x444444);
    this.scene.add(light);

    //name, action, color, baseTexturePath, clickTexturePath, dimensions, position, rotation
    this.buttonFactory.create(
            {
              name: 'ALLBUTTON',
              action: this.constants.actions.makeAR,
              color: 0xcccccc,
              baseImagePath: 'images/buttons/ar.png',
              activeImagePath: 'images/buttons/ar_active.png',
              dimensions: {
                x: 8000,
                y: 8000
              },
              position: {
                x: -11000,
                y: -20000,
                z: 10000
              },
              rotation: {
                x: -Math.PI / 2,
                z: Math.PI
              },
              callback: (function (mesh) {
                focusableObjects.push(mesh);
                this.scene.add(mesh);
              }).bind(this)
            });

    this.buttonFactory.create({
      name: 'VIRTUALBUTTON',
      action: this.constants.actions.makeVR,
      color: 0xcccccc,
      baseImagePath: 'images/buttons/vr.png',
      activeImagePath: 'images/buttons/vr_active.png',
      dimensions: {
        x: 8000,
        y: 8000
      },
      position: {
        x: 11000,
        y: -20000,
        z: 10000
      },
      rotation: {
        x: -Math.PI / 2,
        z: Math.PI
      },
      callback: (function (mesh) {
        focusableObjects.push(mesh);
        this.scene.add(mesh);
      }).bind(this)
    });

    this.buttonFactory.create({
      name: 'REALITYBUTTON',
      action: this.constants.actions.makeReal,
      color: 0xcccccc,
      baseImagePath: 'images/buttons/real.png',
      activeImagePath: 'images/buttons/real_active.png',
      dimensions: {
        x: 8000,
        y: 8000
      },
      position: {
        y: -20000,
        z: 10000
      },
      rotation: {
        x: -Math.PI / 2,
        z: Math.PI
      },
      callback: (function (mesh) {
        focusableObjects.push(mesh);
        this.scene.add(mesh);
      }).bind(this)
    });
    
    
    this.buttonFactory.create({
      name: 'FULLSCREEN',
      action: this.constants.actions.fullscreen,
      color: 0xcccccc,
      baseImagePath: 'images/buttons/fullscreen.png',
      activeImagePath: 'images/buttons/fullscreen_active.png',
      dimensions: {
        x: 8000,
        y: 8000
      },
      position: {
        x : 5000,
        y: -20000,
        z: 1000
      },
      rotation: {
        x: -Math.PI / 2,
        z: Math.PI
      },
      callback: (function (mesh) {
        focusableObjects.push(mesh);
        this.scene.add(mesh);
      }).bind(this)
    });
    
    this.buttonFactory.create({
      name: 'REALITYBUTTON',
      action: this.constants.actions.cardboard,
      color: 0xcccccc,
      baseImagePath: 'images/buttons/cardboard.png',
      activeImagePath: 'images/buttons/cardboard.png',
      dimensions: {
        x: 8000,
        y: 8000
      },
      position: {
        x : -5000,
        y: -20000,
        z: 1000
      },
      rotation: {
        x: -Math.PI / 2,
        z: Math.PI
      },
      callback: (function (mesh) {
        focusableObjects.push(mesh);
        this.scene.add(mesh);
      }).bind(this)
    });

    
    for (i; i >= 0; --i) {
      current = this.scenes[i];
      if (current.init) {
        current.init(this.scene, toggleObjects);
      }
    }

    window.addEventListener('resize', (function () {
      if (this.resizeTimeout) {
        window.clearTimeout(this.resizeTimeout);
        this.resizeTimeout = null;
      }
      this.resizeTimeout = window.setTimeout(this.resizeRenderer.bind(this), 100);
    }).bind(this), false);

    this.resizeRenderer();
    this.render();
  };

  /**
   * Resizes the renderer so that it fits to the screen and
   * therefore the video-outputs
   * @returns {undefined}
   */
  ARWrapper.prototype.resizeRenderer = function () {
    var screenWidth = window.innerWidth,
    screenHeight = window.innerHeight,
    //var screenHalfWidth = ((screenWidth / 2) | 0);
    // adjust margin so that we have a 4:3 ratio.
    verticalMargin = this.constants.verticalMargin;
    this.camera.aspect = 2 * (1 / this.constants.aspect);

    if (this.fullscreen) {
      verticalMargin = 0;
      this.camera.aspect = screenWidth / screenHeight;
    }
    // the constant has to be inverted .... :(
    // and doubled because the the aspect is calculated for a single view
    

    //this.camera.aspect = 1 / this.constants.aspect;
    this.camera.updateProjectionMatrix();

    this.divwebgl.style.top = verticalMargin + 'px';
    this.currentRenderer.setSize(screenWidth, (screenHeight - (2 * verticalMargin)));
    //this.renderer.setSize(screenWidth, (screenHeight - (2 * verticalMargin)));
    //this.effect.setSize(screenWidth, (screenHeight - (2 * verticalMargin)));
    // this.effect.setSizeSingleView(screenHalfWidth, (screenHeight - (2 * verticalMargin)));
  };

  /**
   * Setup PC-controls or orientation-controls
   * @returns {undefined}
   */
  ARWrapper.prototype.setControls = function () {
    // Don't orbit around Sun. Look around from camera's position instead.
    var lCenter = new THREE.Vector3(
            this.camera.position.x,
            this.camera.position.y - 0.2,
            this.camera.position.z + 0.6
            );
    // Default PC controls when no deviceorientation.
    this.controls = new THREE.navigateControl(this.camera, this.renderer.domElement, lCenter);
    function setOrientationControls(e) {
      if (!e.alpha) {
        return;
      }
      if (!this.setOrientationControlsDone) {
        this.setOrientationControlsDone = true;

        this.camera.position.set(0, 1850, 0);

        this.controls = new THREE.DeviceOrientationControls(this.camera, true);
        this.controls.connect();
        this.controls.update();

        window.removeEventListener('deviceorientation', setOrientationControls);
      }
    }
    if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', setOrientationControls.bind(this), true);
    }
  };

  /**
   * Manages if one looks at an object that has some lookat-action
   * @param {type} focusObject
   * @param {type} focusableObjects
   * @param {type} camera
   * @returns {undefined}
   */
  ARWrapper.prototype.lookatHandler = function (focusObject, focusableObjects, camera) {
    var i = focusableObjects.length - 1;
    if (focusObject.arData) {

      // UNCHECK ALL OTHER focusables
      var current = null;
      for (i; i >= 0; --i) {
        current = focusableObjects[i];
        if ((current !== focusObject) && current.arData) {
          current.arData.deactivate();
        } else {
          focusObject.arData.activate();
        }
      }
      var detail = {
        distance: camera.position.distanceTo(focusObject.position),
        target: focusObject.position,
        description: focusObject.arData.name,
        action: focusObject.arData.action || null
      };

      var lookAtEvent = new CustomEvent(focusObject.arData.action, {
        detail: detail
      });
      this.divwebgl.dispatchEvent(lookAtEvent);
    }
  };


  /**
   * Rendering loop
   * will also invoke the render-function of every scene-object
   * checks in some interval if one looks at something
   * @returns {undefined}
   */
  ARWrapper.prototype.render = function () {
    var i = this.scenes.length - 1;
    requestAnimationFrame(this.render.bind(this));

    this.camera.updateProjectionMatrix();
    this.controls.update(this.clock.getDelta());

// this.renderer.render(this.scene, this.camera);
    //this.effect.render(this.scene, this.camera);
    this.currentRenderer.render(this.scene, this.camera);

    var lTimeSec = this.clock.getElapsedTime();


    var current = null;
    for (i; i >= 0; --i) {
      current = this.scenes[i];
      if (current.render) {
        current.render(lTimeSec);
      }
    }

    this.lookAtCounter = (this.lookAtCounter + 1) % this.lookAtInterval;
    if (this.lookAtCounter === 0) {
      // only determine focus if the interval-counter matches
      var prevFocus = this.focusObject;
      var newFocus = null;
      var vector = new THREE.Vector3(); // make this "global"? so that it is not created every time?!
      var focusX = 0.5; // center of screen
      var focusY = 0.5; // center of screen
      vector.set(focusX * 2 - 1, -focusY * 2 + 1, 0.5);
      vector.unproject(this.camera);
      this.raycaster.ray.set(this.camera.position, vector.sub(this.camera.position).normalize());

      var intersects = this.raycaster.intersectObjects(focusableObjects);
      if (intersects.length > 0) {
        newFocus = intersects[0].object;
      }

      this.focusObject = newFocus || null;
      if (newFocus !== null) {
        if (this.focusObject !== prevFocus) {
          this.lookatHandler(this.focusObject, focusableObjects, this.camera);
        }
      } else {
        if (this.focusObject !== prevFocus) {
          var lookAwayEvent = new CustomEvent('lookaway', {
            detail: {
              target: prevFocus
            }
          });
          this.divwebgl.dispatchEvent(lookAwayEvent);
        }
      }
    }
  };

  return ARWrapper;
}());