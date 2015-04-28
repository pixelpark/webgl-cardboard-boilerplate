(function () {
  
  function SolarSystem() {
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
          y: -20000,
          z: 60000
        },
        enumerable: true
      },
      "sunRadius": {
        value: 6000,
        enumerable: true
      },
      "lEarthSunPeriodSec": {
        value: 20,
        enumerable: true
      }
    });

      this.sunMesh;
      this.planets = [
      {
        name: 'Mercury',
        radius: 700, // actually 0.3829 Earth radii
        solarDistanceAU: 0.387,
        orbitalPeriodEY: 0.240846,
        rotationPeriodEY: 58.646 / this.lEarthDaysPerYear,
        texture: 'images/texture_mercury.jpg',
        segments: 48,
        mesh: null
      },
      {
        name: 'Venus', //1800
        radius: 1600, // actually 0.949 Earth radii
        solarDistanceAU: 0.723,
        orbitalPeriodEY: 0.615,
        rotationPeriodEY: -244 / this.lEarthDaysPerYear,
        texture: 'images/texture_venus_atmosphere.jpg',
        segments: 48,
        mesh: null
      },
      {
        name: 'Earth',
        radius: 1700,
        solarDistanceAU: 1,
        orbitalPeriodEY: 1,
        rotationPeriodEY: (1 / this.lEarthDaysPerYear) * 30, //Too fast for comfortable viewing, 30 is slowdown factor
        texture: 'images/texture_earth_clouds.jpg',
        segments: 64,
        mesh: null,
        moons: [
          {
            name: 'Moon',
            radius: 500, // actually 0.2724 Earth radii
            distaneFromPlanetAU: 70 * (1 / 389), // Too close to earth, 70 is exaggeration factor
            orbitalPeriodEY: 0.0748,
            rotationPeriodEY: 0.0748,
            texture: 'images/texture_moon.jpg',
            segments: 48,
            mesh: null
          }
        ]
      },
      {
        name: 'Mars',
        radius: 900, // actually 0.532 Earth radii
        solarDistanceAU: 1.38,
        orbitalPeriodEY: 1.88,
        rotationPeriodEY: (1.03 / this.lEarthDaysPerYear) * 15, //Too fast, 10 is slowdown factor
        texture: 'images/texture_mars.jpg',
        segments: 48,
        mesh: null,
        moons: [
          {
            name: 'Phobos',
            radius: 120, // actually (22.2 / 2) km
            distaneFromPlanetAU: 1200 * (9380 / 149597871), // Too close, 1400 is exaggeration factor
            orbitalPeriodEY: (0.31891023 / this.lEarthDaysPerYear) * 50, //Too fast, 50 is slowdown factor
            rotationPeriodEY: (0.31891023 / this.lEarthDaysPerYear) * 50,
            //texture: 'images/texture_moon.jpg',
            segments: 32,
            mesh: null
          },
          {
            name: 'Deimos',
            radius: 70, // actually (12.6 / 2) km
            distaneFromPlanetAU: 1200 * (23460 / 149597871), // Too close, 1400 is exaggeration factor
            orbitalPeriodEY: (1.263 / this.lEarthDaysPerYear) * 50, //Too fast, 50 is slowdown factor
            rotationPeriodEY: 0.01,
            //texture: 'images/texture_moon.jpg',
            segments: 16,
            mesh: null
          }
        ]
      },
      {
        name: 'Jupiter',
        radius: 7500, // actually 11.21 Earth radii
        solarDistanceAU: 4.95,
        orbitalPeriodEY: 11.9,
        rotationPeriodEY: (0.415 / this.lEarthDaysPerYear) * 100, //Too fast, 100 is slowdown factor
        texture: 'images/texture_jupiter.jpg',
        segments: 64,
        mesh: null,
        moons: [
          {
            name: 'Io',
            radius: (3660 / 2) * 0.4,
            distaneFromPlanetAU: (421700 / 149597871) * 140, // Too close, 120 is exaggeration factor
            orbitalPeriodEY: (1.7691 / this.lEarthDaysPerYear) * 20, //Too fast, 20 is slowdown factor
            rotationPeriodEY: 0.2,
            texture: 'images/texture_io.jpg',
            segments: 32,
            mesh: null
          },
          {
            name: 'Europa',
            radius: (3121.6 / 2) * 0.4,
            distaneFromPlanetAU: (670900 / 149597871) * 140, // Too close, 120 is exaggeration factor
            orbitalPeriodEY: (3.551 / this.lEarthDaysPerYear) * 20, //Too fast, 20 is slowdown factor
            rotationPeriodEY: 0.2,
            texture: 'images/texture_europa.jpg',
            segments: 32,
            mesh: null
          },
          {
            name: 'Ganymede',
            radius: (5262.4 / 2) * 0.35,
            distaneFromPlanetAU: (1070412 / 149597871) * 140, // Too close, 120 is exaggeration factor
            orbitalPeriodEY: (7.154 / this.lEarthDaysPerYear) * 20, //Too fast, 20 is slowdown factor
            rotationPeriodEY: 0.2,
            texture: 'images/texture_ganymede.jpg',
            segments: 32,
            mesh: null
          },
          {
            name: 'Callisto',
            radius: (4820.6 / 2) * 0.35,
            distaneFromPlanetAU: (1882709 / 149597871) * 140, // Too close, 120 is exaggeration factor
            orbitalPeriodEY: (16.689 / this.lEarthDaysPerYear) * 20, //Too fast, 20 is slowdown factor
            rotationPeriodEY: 0.2,
            texture: 'images/texture_callisto.jpg',
            segments: 32,
            mesh: null
          }
        ]
      },
      {
        name: 'Saturn',
        radius: 7500, // actually 9.45 Earth radii
        solarDistanceAU: 9.58,
        orbitalPeriodEY: 29.4,
        rotationPeriodEY: (0.445 / this.lEarthDaysPerYear) * 100, //Too fast, 100 is slowdown factor
        texture: 'images/texture_saturn.jpg',
        segments: 64,
        mesh: null,
        ring: {
          innerRadius: 7500 * 1.6,
          outerRadius: 7500 * 2.5,
          inclination: (Math.PI / 12), // not too much, otherwise doesn't look nice
          texture: 'images/texture_saturn_ring.png',
          mesh: null
        },
        moons: [
          {
            name: 'Titan',
            radius: (5150 / 2) * 0.3, // actually (5150 / 2) km
            distaneFromPlanetAU: (1221870 / 149597871) * 250, // Too close, 250 is exaggeration factor
            orbitalPeriodEY: (16 / this.lEarthDaysPerYear) * 10, //Too fast, 50 is slowdown factor
            rotationPeriodEY: 0.1,
            //texture: 'images/texture_moon.jpg',
            segments: 32,
            mesh: null
          },
          {
            name: 'Rhea',
            radius: (1527 / 2) * 0.3, // actually (1527 / 2) km
            distaneFromPlanetAU: (527108 / 149597871) * 250, // Too close, 250 is exaggeration factor
            orbitalPeriodEY: (4.5 / this.lEarthDaysPerYear) * 10, //Too fast, 50 is slowdown factor
            rotationPeriodEY: 0.1,
            //texture: 'images/texture_moon.jpg',
            segments: 16,
            mesh: null
          }
          /*
           //Too far away
           {
           name: 'Iapetus',
           radius: (1470 / 2) * 0.3, // actually (1470 / 2) km
           distaneFromPlanetAU: (3560820 / 149597871) * 250,  // Too close, 250 is exaggeration factor
           orbitalPeriodEY: (79 / lEarthDaysPerYear) * 10, //Too fast, 50 is slowdown factor
           rotationPeriodEY: 0.1,
           //texture: 'images/texture_moon.jpg',
           segments: 16,
           mesh: null
           }
           */
        ]
      },
      {
        name: 'Uranus',
        radius: 8000, // actually 4.01 Earth radii
        solarDistanceAU: 19.20,
        orbitalPeriodEY: 83.7,
        rotationPeriodEY: (-0.720 / this.lEarthDaysPerYear) * 100, //Too fast, 100 is slowdown factor
        texture: 'images/texture_uranus.jpg',
        segments: 64,
        mesh: null,
        ring: {
          innerRadius: 8000 * 2.0,
          outerRadius: 8000 * 2.01,
          inclination: (Math.PI / 2),
          //texture: 'images/texture_uranus_ring.png',
          mesh: null
        },
        moons: [
        ]
      },
      {
        name: 'Neptune',
        radius: 8000, // actually 3.88 Earth radii
        solarDistanceAU: 30.05,
        orbitalPeriodEY: 163.7,
        rotationPeriodEY: (0.673 / this.lEarthDaysPerYear) * 100, //Too fast, 100 is slowdown factor,
        texture: 'images/texture_neptune.jpg',
        segments: 64,
        mesh: null,
        moons: [
        ]
      }
    ];

  }

  SolarSystem.prototype.render = function (elapsedTime) { 
      this.sunMesh.rotation.y += 0.003;
      var lEarthOrbitNorm = (elapsedTime / this.lEarthSunPeriodSec);
      for (var pi = 0; pi < this.planets.length; pi++) {
        var planet = this.planets[pi];
        var lPlanetOrbitNorm = elapsedTime / (this.lEarthSunPeriodSec * planet.orbitalPeriodEY);
        planet.mesh.position.x = this.sunMesh.position.x + (Math.sin(lPlanetOrbitNorm * 2 * Math.PI) * planet.solarDistanceAU * this.AU);
        planet.mesh.position.z = this.sunMesh.position.z + (Math.cos(lPlanetOrbitNorm * 2 * Math.PI) * planet.solarDistanceAU * this.AU);
        planet.mesh.rotation.y = (lEarthOrbitNorm / planet.rotationPeriodEY) * 2 * Math.PI;
        if (planet.ring) {
          planet.ring.mesh.position.x = planet.mesh.position.x;
          planet.ring.mesh.position.z = planet.mesh.position.z;
        }
        if (planet.moons) {
          for (var mi = 0; mi < planet.moons.length; mi++) {
            var moon = planet.moons[mi];
            var lMoonOrbitNorm = elapsedTime / (this.lEarthSunPeriodSec * moon.orbitalPeriodEY);
            moon.mesh.position.x = planet.mesh.position.x + (Math.sin(lMoonOrbitNorm * 2 * Math.PI) * moon.distaneFromPlanetAU * this.AU);
            moon.mesh.position.z = planet.mesh.position.z + (Math.cos(lMoonOrbitNorm * 2 * Math.PI) * moon.distaneFromPlanetAU * this.AU);
            moon.mesh.rotation.y = (lEarthOrbitNorm / moon.rotationPeriodEY) * 2 * Math.PI;
          }
        }
      }


  };

  SolarSystem.prototype.init = function (scene, toggleObjects) {

      var sunLight = new THREE.PointLight(0xffffff, 0.90);
      sunLight.position.set(this.orrerySunPosition.x, this.orrerySunPosition.y, this.orrerySunPosition.z);
      scene.add(sunLight);

      var sunGeometry = new THREE.SphereGeometry(this.sunRadius, 48, 48);
      var sunMaterial = new THREE.MeshBasicMaterial({color: 0xffffff});
      sunMaterial.map = THREE.ImageUtils.loadTexture('images/texture_sun.jpg');
      this.sunMesh = new THREE.Mesh(sunGeometry, sunMaterial);
      this.sunMesh.position.x = this.orrerySunPosition.x; // forward
      this.sunMesh.position.y = this.orrerySunPosition.y; // up
      this.sunMesh.position.z = this.orrerySunPosition.z; // right
      scene.add(this.sunMesh);


      this.sunMesh.solarSystemData = {
        name: 'The Sun',
        radius: this.sunRadius
      };
      toggleObjects.push(this.sunMesh);

      for (var pi = 0; pi < this.planets.length; pi++) {
        var planet = this.planets[pi];
        var pGeometry = new THREE.SphereGeometry(planet.radius, planet.segments, planet.segments);
        var pMaterial = new THREE.MeshPhongMaterial();
        pMaterial.map = THREE.ImageUtils.loadTexture(planet.texture);
        planet.mesh = new THREE.Mesh(pGeometry, pMaterial);
        planet.mesh.position.y = this.sunMesh.position.y;
        scene.add(planet.mesh);
        planet.mesh.solarSystemData = planet;
        toggleObjects.push(planet.mesh);
        if (planet.ring) {
          var pRingGeometry = new THREE.RingGeometry(planet.ring.innerRadius, planet.ring.outerRadius, 64, 5, 0, 2 * Math.PI);
          var pRingMaterial;
          if (planet.ring.texture && (planet.ring.texture != '')) {
            pRingMaterial = new THREE.MeshPhongMaterial({
              color: 0x222222,
              //shininess: 20,
              //shading: THREE.FlatShading,
              side: THREE.DoubleSide
            });
            var texture = THREE.ImageUtils.loadTexture(planet.ring.texture);
            texture.minFilter = THREE.NearestFilter;
            pRingMaterial.map = texture;
          } else {
            pRingMaterial = new THREE.MeshBasicMaterial({
              color: 0x222222
            });
          }
          planet.ring.mesh = new THREE.Mesh(pRingGeometry, pRingMaterial);
          planet.ring.mesh.position.y = this.sunMesh.position.y;
          planet.ring.mesh.rotation.x = (Math.PI / 2) + planet.ring.inclination;
          planet.ring.mesh.rotation.z = (Math.PI / 4);
          scene.add(planet.ring.mesh);
          toggleObjects.push(planet.ring.mesh);
        }
        if (planet.moons) {
          for (var mi = 0; mi < planet.moons.length; mi++) {
            var moon = planet.moons[mi];
            var mGeometry = new THREE.SphereGeometry(moon.radius, moon.segments, moon.segments);
            var mMaterial;
            if (moon.texture && (moon.texture != '')) {
              mMaterial = new THREE.MeshPhongMaterial();
              var texture = THREE.ImageUtils.loadTexture(moon.texture);
              texture.minFilter = THREE.NearestFilter;
              mMaterial.map = texture;
            } else {
              mMaterial = new THREE.MeshBasicMaterial({
                color: 0x333333
              });
            }
            moon.mesh = new THREE.Mesh(mGeometry, mMaterial);
            moon.mesh.position.y = planet.mesh.position.y;
            scene.add(moon.mesh);
            toggleObjects.push(moon.mesh);
          }
        }
      }




  };

  window.scenes.push(SolarSystem);

})();