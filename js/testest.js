/*
 * Just an example to demonstrate how to implement your own scene
 */

(function () {
  
  function Test() {
    Object.defineProperties(this, {
      "AU": {
        value: 26000,
        enumerable: true
      },
      "lEarthDaysPerYear": {
        value: 365.25,
        enumerable: true
      },
      "orrerySunPosition": {
        value: {
          x: 0,
          y: -10000,
          z: 30000
        },
        enumerable: true
      },
      "sunRadius": {
        value: 3000,
        enumerable: true
      },
      "lEarthSunPeriodSec": {
        value: 20,
        enumerable: true
      }
    });

      this.sunMesh;
  }

  Test.prototype.render = function (elapsedTime) { 
      this.sunMesh.rotation.y += 0.1;
      var time = parseInt(elapsedTime);
      if (time % 2) {
        this.sunMesh.position.x +=100;
      } else {
        this.sunMesh.position.x -=100;
      }
  };

  Test.prototype.init = function (scene, toggleObjects) {
      var sunLight = new THREE.PointLight(0xffffff, 0.40);
      sunLight.position.set(this.orrerySunPosition.x, this.orrerySunPosition.y, this.orrerySunPosition.z);
      scene.add(sunLight);

      var sunGeometry = new THREE.SphereGeometry(this.sunRadius, 48, 48);
      var sunMaterial = new THREE.MeshBasicMaterial({color: 0xffffff});
      sunMaterial.map = THREE.ImageUtils.loadTexture('images/testest/testest.jpg');
      this.sunMesh = new THREE.Mesh(sunGeometry, sunMaterial);
      this.sunMesh.position.x = this.orrerySunPosition.x; // forward
      this.sunMesh.position.y = this.orrerySunPosition.y; // up
      this.sunMesh.position.z = this.orrerySunPosition.z; // right
      scene.add(this.sunMesh);

      toggleObjects.push(this.sunMesh);

  };

  window.scenes.push(Test);

})();