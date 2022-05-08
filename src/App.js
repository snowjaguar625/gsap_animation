import "./styles.css";
import * as THREE from "three";
import { React, useEffect, useRef } from "react";
import  $ from 'jquery';
import gsap from 'gsap';

export const App = () => {

  const inputElement = useRef();

  let mouse = new THREE.Vector3(0, 0, 1);

  const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
  };
  let starMaterial;

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

  const camera = new THREE.PerspectiveCamera(
    60,
    sizes.width / sizes.height,
    1,
    1000
  );
  camera.position.z = 1;

  const scene = new THREE.Scene();

  useEffect(() => {
  
    const geometry = new THREE.BufferGeometry();
    const sprite_mouse = new THREE.TextureLoader().load('assets/img/333.png');
    const material = new THREE.PointsMaterial({
      size: 0.5,
      sizeAttenuation: true,
      transparent: true,
      map: sprite_mouse,
      opacity: 0.6
    });
    material.color.setHSL( 0.3, 0.3, 0.7 );
    
    const positions = setPosition(new Float32Array(2 * 3));
    
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

    const sprite = new THREE.TextureLoader().load('assets/img/disc.png');
    const starGeo = new THREE.BufferGeometry().setFromPoints(points);
    // const canvas2 = document.createElement( 'canvas' );
    // canvas2.width = 128;
    // canvas2.height = 128;
    // const context = canvas2.getContext( '2d' );
    // context.arc( 64, 64, 64, 0, 2 * Math.PI );
    // context.fillStyle = '#aaaaaa';
    // context.fill();
    // const texture = new THREE.CanvasTexture( canvas2 );
    starMaterial = new THREE.PointsMaterial({
      size: 1,
      map: sprite,
      transparent: true,
      sizeAttenuation: true,
      opacity: 0.7,
      precision: "highp"
    });
    starMaterial.color.setHSL( 1.0, 0.3, 0.7 );

    const stars = new THREE.Points(starGeo, starMaterial);
    scene.add(stars);
    
    // Mousemove
    const cursor = {};
    cursor.x = 0;
    cursor.y = 0;
    window.addEventListener("mousemove", (event) => {
      cursor.x = (event.clientX / sizes.width - 0.5) * 10;
      cursor.y = (event.clientY / sizes.height - 0.5) * 10;

      // mouse.x = (event.clientX / sizes.width) * 2 - 1;
      // mouse.y = -(event.clientY / sizes.height) * 2 + 1;
      mouse.x = cursor.x;
      mouse.y = cursor.y;
      mouse.z = 1;
    
      // convert screen coordinates to threejs world position
      // https://stackoverflow.com/questions/13055214/mouse-canvas-x-y-to-three-js-world-x-y-z
    
      var vector = new THREE.Vector3(mouse.x, mouse.y, mouse.z);
      vector.unproject(camera);
      var dir = vector.sub(camera.position).normalize();
      var distance = -camera.position.z / dir.z;
      var pos = camera.position.clone().add(dir.multiplyScalar(distance));
    
      mouse = pos;
    });

    let velocity = 0;
    let acceleration = 0.00001;

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
    
          const lerpPoint = currentPoint.lerp(previousPoint, 0.5);
    
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
      stars.rotation.z -= 0.0004;

      camera.position.set(cursor.x, cursor.y, 0);

      const time = Date.now() * 0.00005;
      const h = ( 360 * ( 1.0 + time ) % 360 ) / 360;
      starMaterial.color.setHSL( h, 0.5, 0.5 );
    
      window.requestAnimationFrame(animate);
    };
    
    animate();

    ///////
    hoverMouse($('.button'));
    const logo_scale = 0.13;
    let logo_state = false;
    let logo_tween, about_text, navbar;
    let logo_move_x = $('#logo_img').offset().left + $('#logo_img').width()/2 * (1-logo_scale) - 20;
    let logo_move_y = $('#logo_img').offset().top + $('#logo_img').height()/2 * (1-logo_scale) + 1;
    
    $('#hello_btn').click(function(){
      $(this).css('display', 'none');
      logo_tween = gsap.to("#logo_img", {rotation: 360, scale: logo_scale, x: -logo_move_x, y: -logo_move_y, duration: 0.5, ease: "easeOut"});
      about_text = gsap.to($("#about_txt"), {scale:1, duration: 0.5});
      navbar = gsap.to($('#navbar'), {duration: 0.5, scaleY:1, ease: "power4.out"})
      $("#about_btn").css('display', 'block');
      gsap.to($("#about_btn"), {scale:1, duration: 0.5});
    });
    $('#about_btn').click(function(){
      $(this).css('display', 'none');
      about_text.reverse();
      $("#projects_area").css('display', 'block');
      gsap.to($("#projects_area"), {scaleY:1, duration: 0.5});
    });
    $("#brand").click(function(){
      $("#about_btn").css('display', 'none');
      about_text.reverse();
      $("#projects_area").css('display', 'none');
      logo_tween.reverse();
      $('#hello_btn').css("display", "block");
      navbar.reverse();
    })

  }, []);

    return <div ref={inputElement} className="canvas"></div>;
}

var hoverMouse = function($el) {
  $el.each(function() {
    var $self = $(this);
    var hover = false;
    var offsetHoverMax = $self.attr("offset-hover-max") || 0.7;
    var offsetHoverMin = $self.attr("offset-hover-min") || 0.5;

    var attachEventsListener = function() {
      $(window).on("mousemove", function(e) {
        //
        var hoverArea = hover ? offsetHoverMax : offsetHoverMin;

        // cursor
        var cursor = {
          x: e.clientX,
          y: e.clientY + $(window).scrollTop()
        };

        // size
        var width = $self.outerWidth();
        var height = $self.outerHeight();

        // position
        var offset = $self.offset();
        var elPos = {
          x: offset.left + width / 2,
          y: offset.top + height / 2
        };

        // comparaison
        var x = cursor.x - elPos.x;
        var y = cursor.y - elPos.y;

        // dist
        var dist = Math.sqrt(x * x + y * y);

        // mutex hover
        var mutHover = false;

        // anim
        if (dist < width * hoverArea) {
          mutHover = true;
          if (!hover) {
            hover = true;
          }
          onHover(x, y);
        }

        // reset
        if (!mutHover && hover) {
          onLeave();
          hover = false;
        }
      });
    };

    var onHover = function(x, y) {
      gsap.to($self,{
        duration: 0.4,
        x: x * 0.8,
        y: y * 0.8,
        //scale: .9,
        rotation: x * 0.05,
        ease: 'power2'
      });
    };
    var onLeave = function() {
      gsap.to($self,{
        duration: 0.7,
        x: 0,
        y: 0,
        scale: 1,
        rotation: 0,
        ease: "elastic.out(1.2, 0.4)"
      });
    };

    attachEventsListener();
  });
};