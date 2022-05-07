import "./styles.css";
import * as THREE from "three";
import { React, useEffect, useRef } from "react";

export const App = () => {

  const inputElement = useRef();

  let mouse = new THREE.Vector3(0, 0, 1);

  const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
  };
  function setPosition(array) {
    for (let i = 0; i < 150; i++) {
      const i3 = i * 3;
  
      const x = (i / (150 - 1) - 0.5) * 3;
      const y = Math.sin(i / 10.5) * 0.5;
  
      array[i3] = x;
      array[i3 + 1] = y;
      array[i3 + 2] = 1;
    }
    return array;
  }
  
  // Mouse Move
  function handleMouseMove(event) {
    mouse.x = (event.clientX / sizes.width) * 2 - 1;
    mouse.y = -(event.clientY / sizes.height) * 2 + 1;
    mouse.z = 1;
  
    // convert screen coordinates to threejs world position
    // https://stackoverflow.com/questions/13055214/mouse-canvas-x-y-to-three-js-world-x-y-z
  
    var vector = new THREE.Vector3(mouse.x, mouse.y, 0.5);
    vector.unproject(camera);
    var dir = vector.sub(camera.position).normalize();
    var distance = -camera.position.z / dir.z;
    var pos = camera.position.clone().add(dir.multiplyScalar(distance));
  
    mouse = pos;
  }
  
  window.addEventListener("mousemove", handleMouseMove);

  const camera = new THREE.PerspectiveCamera(
    75,
    sizes.width / sizes.height,
    0.1,
    100
  );

  const scene = new THREE.Scene();

  useEffect(() => {
  
    const geometry = new THREE.BufferGeometry();
    
    const material = new THREE.PointsMaterial({
      size: 1,
      sizeAttenuation: false,
      alphaTest: 0.5,
      transparent: true
    });
    
    const positions = setPosition(new Float32Array(150 * 3));
    
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    
    const points_mouse = new THREE.Points(geometry, material);
    scene.add(points_mouse);
    
    camera.position.z = 5;
    scene.add(camera);
    
    const renderer = new THREE.WebGLRenderer();
    
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 4));
    inputElement.current.appendChild(renderer.domElement);

    ///////////background
    const points = Array(6000)
      .fill(0)
      .map(() => {
        return new THREE.Vector3(
          Math.random() * 600 - 300,
          Math.random() * 600 - 300,
          Math.random() * 600 - 300
        );
      });

    const starGeo = new THREE.BufferGeometry().setFromPoints(points);
    const canvas2 = document.createElement( 'canvas' );
    canvas2.width = 128;
    canvas2.height = 128;
    const context = canvas2.getContext( '2d' );
    context.arc( 64, 64, 64, 0, 2 * Math.PI );
    context.fillStyle = '#aaaaaa';
    context.fill();
    const texture = new THREE.CanvasTexture( canvas2 );
    let starMaterial = new THREE.PointsMaterial({
      color: '#aaaaaa',
      size: 0.7,
      map: texture
    });

    const stars = new THREE.Points(starGeo, starMaterial);
    scene.add(stars);
    
    // Mousemove
    const cursor = {};
    cursor.x = 0;
    cursor.y = 0;
    window.addEventListener("mousemove", (event) => {
      cursor.x = (event.clientX / sizes.width - 0.5) * 10;
      cursor.y = (event.clientY / sizes.height - 0.5) * 10;
    });

    let velocity = 0;
    let acceleration = 0.00004;

    const animate = () => {
      renderer.render(scene, camera);
    
      for (let i = 0; i < 150; i++) {
        const i3 = i * 3;
        const previous = (i - 1) * 3;
    
        if (i3 === 0) {
          positions[0] = mouse.x;
          positions[1] = mouse.y + 0.05;
          positions[2] = mouse.z;
        } else {
          const currentPoint = new THREE.Vector3(
            positions[i3],
            positions[i3 + 1],
            positions[i3 + 2]
          );
    
          const previousPoint = new THREE.Vector3(
            positions[previous],
            positions[previous + 1],
            positions[previous + 2]
          );
    
          const lerpPoint = currentPoint.lerp(previousPoint, 0.9);
    
          positions[i3] = lerpPoint.x;
          positions[i3 + 1] = lerpPoint.y;
          positions[i3 + 2] = mouse.z;
        }
      }
      geometry.attributes.position.needsUpdate = true;

      /////////background
      let currentPoints = starGeo.attributes.position.array;
      for (let i = 0; i < currentPoints.length; i += 3) {
        velocity += acceleration;
        currentPoints[i + 2] += velocity;

        if (currentPoints[i + 2] > 200) {
          currentPoints[i + 2] = -200;
          velocity = 0;
        }
      }
      starGeo.attributes.position.needsUpdate = true;
      stars.rotation.z -= 0.001;

      // camera.position.set(cursor.x, 0, cursor.y);
    
      window.requestAnimationFrame(animate);
    };
    
    animate();
  }, []);

    return <div ref={inputElement} className="canvas"></div>;
}