'use strict';


window.scenes = [];
var ARWrapper = (function () {

  function ButtonFactory() {}
  
  ButtonFactory.prototype.finishCreate = function (callback, virtualButtonMesh, arData) {
    virtualButtonMesh.arData = arData;
    callback(virtualButtonMesh);
  };
  
  // REMOVE EVIL CALLBACK-HELL!
  // @TODO callback hell and some more defaults and duplicated function calls etc.
  ButtonFactory.prototype.create = function (config) {
    config.callback = config.callback || function(){};
    var arData = {
      baseColor: config.color,
      name: config.name,
      action: config.action
    };
    var count = 0;
    
    var virtualButtonGeometry = new THREE.PlaneGeometry(config.dimensions.x, config.dimensions.y, 1, 1);
    var virtualButtonMaterial = new THREE.MeshBasicMaterial({color: config.color});
    
    var virtualButtonMesh = new THREE.Mesh(virtualButtonGeometry, virtualButtonMaterial);
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
        
        
        arData.deactivate =  (function () {
          this.material.color = new THREE.Color(this.arData.baseColor);
          this.material.map = this.arData.baseTexture;
          this.material.needsUpdate = true;
        }).bind(virtualButtonMesh);
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
        arData.activate =  (function () {
          this.material.color = new THREE.Color(0xff9999);
          this.material.map = this.arData.activeTexture;
          this.material.needsUpdate = true;
        }).bind(virtualButtonMesh);
        if (!--count) {
          this.finishCreate(config.callback, virtualButtonMesh, arData);
        }
      }).bind(this),
      (function (err) {
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

  var focusableObjects = [];
  var toggleObjects = [];

  function ARWrapper(constants, divwebgl) {
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

    this.constants = constants;

    this.renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
    this.renderer.setClearColor(0x000000, 0);
    this.effect = new THREE.StereoEffect(this.renderer);
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
    for (var i = window.scenes.length - 1; i >= 0; --i) {
      this.scenes.push(new window.scenes[i]());
    }
  }

  ARWrapper.prototype.show = function () {
    this.toggleSpecifiedObjects(true);
  };

  ARWrapper.prototype.hide = function () {
    this.toggleSpecifiedObjects(false);
  };

  ARWrapper.prototype.toggleSpecifiedObjects = function (visible) {
    for (var i = toggleObjects.length - 1; i >= 0; --i) {
      toggleObjects[i].traverse(function (object) {
        object.visible = visible;
      });
    }
  };

  ARWrapper.prototype.init = function () {
    var light;
    light = new THREE.AmbientLight(0x444444);
    this.scene.add(light);

    //name, action, color, baseTexturePath, clickTexturePath, dimensions, position, rotation
    this.buttonFactory.create(
            {
              name : 'ALLBUTTON',
              action: constants.actions.makeAR,
              color: 0xcccccc,
              baseImagePath: 'images/buttons/ar.png',
              activeImagePath: 'images/buttons/ar_active.png',
              dimensions: {
                x: 10000,
                y: 10000
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
              callback :(function (mesh) {
                focusableObjects.push(mesh);
                this.scene.add(mesh);
              }).bind(this)
            });

    this.buttonFactory.create({
              name : 'VIRTUALBUTTON',
              action: constants.actions.makeVR,
              color: 0xcccccc,
              baseImagePath: 'images/buttons/vr.png',
              activeImagePath: 'images/buttons/vr_active.png',
              dimensions: {
                x: 10000,
                y: 10000
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
              callback :(function (mesh) {
                focusableObjects.push(mesh);
                this.scene.add(mesh);
              }).bind(this)
            });

    this.buttonFactory.create({
              name : 'REALITYBUTTON',
              action: constants.actions.makeReal,
              color: 0xcccccc,
              baseImagePath: 'images/buttons/real.png',
              activeImagePath: 'images/buttons/real_active.png',
              dimensions: {
                x: 10000,
                y: 10000
              },
              position: {
                y: -20000,
                z: 10000
              },
              rotation: {
                x: -Math.PI / 2,
                z: Math.PI
              },
              callback :(function (mesh) {
                focusableObjects.push(mesh);
                this.scene.add(mesh);
              }).bind(this)
            });

    var current = null;
    for (var i = this.scenes.length - 1; i >= 0; --i) {
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

  ARWrapper.prototype.resizeRenderer = function () {
    var screenWidth = window.innerWidth;
    var screenHeight = window.innerHeight;
    var screenHalfWidth = ((screenWidth / 2) | 0);
    // adjust margin so that we have a 4:3 ratio.
    var verticalMargin = this.constants.verticalMargin;

    // the constant has to be inverted .... :(
    // and doubled because the the aspect is calculated for a single view
    this.camera.aspect = 2 * (1 / this.constants.aspect);
    
    //this.camera.aspect = 1 / this.constants.aspect;
    this.camera.updateProjectionMatrix();

    this.divwebgl.style.top = verticalMargin + 'px';
    this.renderer.setSize(screenWidth, (screenHeight - (2 * verticalMargin)));
    this.effect.setSize(screenWidth, (screenHeight - (2 * verticalMargin)));
   // this.effect.setSizeSingleView(screenHalfWidth, (screenHeight - (2 * verticalMargin)));
  };

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

  ARWrapper.prototype.lookatHandler = function (focusObject, focusableObjects, camera) {
    if (focusObject.arData) {

      // UNCHECK ALL OTHER focusables
      for (var i = focusableObjects.length - 1; i >= 0; --i) {
        var current = focusableObjects[i];
        if ((current !== focusObject) && current.arData) {
          current.arData.deactivate();
        }
      }
      var detail = {
        distance: camera.position.distanceTo(focusObject.position),
        target: focusObject.position,
        description: focusObject.arData.name,
        action: focusObject.arData.action || null
      };

      this.focusObject.arData.activate();

      var lookAtEvent = new CustomEvent('lookat', {
        detail: detail
      });
      this.divwebgl.dispatchEvent(lookAtEvent);
    }
  };



  ARWrapper.prototype.render = function () {
    requestAnimationFrame(this.render.bind(this));

    this.camera.updateProjectionMatrix();
    this.controls.update(this.clock.getDelta());

    this.effect.render(this.scene, this.camera);

    var lTimeSec = this.clock.getElapsedTime();


    var current = null;
    for (var i = this.scenes.length - 1; i >= 0; --i) {
      current = this.scenes[i];
      if (current.render) {
        current.render(lTimeSec);
      }
    }

    this.lookAtCounter++;
    if (!(this.lookAtCounter %= this.lookAtInterval)) {
      // only determine focus if the interval-counter matches
      var prevFocus = this.focusObject;
      var newFocus = null;
      var vector = new THREE.Vector3(); // make this "global"? so that it is not created every time?!
      var focusX = 0.5; // center of screen
      var focusY = 0.5; // center of screen
      vector.set((focusX) * 2 - 1, -(focusY) * 2 + 1, 0.5);
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
})();