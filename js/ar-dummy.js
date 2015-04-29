(function () {
  
  /**
   * Create a constructor function for an object and push it to window.scenes
   * The resulting object should contain a render- and an init-function that will
   * be called during setup of the AR-Wrapper
   * 
   * You can add as many other functions as you need but they won't be called by the
   * AR-Wrapper.
   * @returns {ar-dummy_L1.MyArScene}
   */
  function MyArScene() {
    // do some initialisation here
  }

  /**
   * This function will be called during rendering and should update your scene.
   * As hint you get the elapsed time.
   * @param {type} elapsedTime
   * @returns {undefined}
   */
  MyArScene.prototype.render = function (elapsedTime) { 
    // here you should update your models (position, rotation etc.)
    console.log(elapsedTime);
  };

  /**
   * The AR-Wrapper will call this function during setup. You get the scene used by
   * the AR-Wrapper and you can add your 3D-objects here
   * 
   * It is a very good idea to add all your 3D-Objects to the toggle-Objects array
   * so that the AR-Wrapper can display or hide them dependend on the user willing to
   * see ar/vr/reality
   * @param {type} scene
   * @param {type} toggleObjects
   * @returns {undefined}
   */
  MyArScene.prototype.init = function (scene, toggleObjects) {
    // add your models to the scene and also add them to toggleObjects so that they can be hidden once
    // the virtual part of the ar-application should be hidden
    console.log(scene);
    console.log(toggleObjects);
  };

  // Important! push your constructor method the window.scenes. The AR-Wrapper will
  // look for your scene there
  window.scenes.push(MyArScene);

})();