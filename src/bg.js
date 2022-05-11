import React, { useRef, useMemo, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from "three";
import  $ from 'jquery';
import gsap from 'gsap';
import vertexShader from './shaders/vertexParticles.glsl';
import fragmentShader from './shaders/fragment.glsl';


/////////////////////
console.log("check")
function pixelShader() {
  var support = true;
  try {
    var canvas = document.getElementsByTagName('canvas')[0]
    var shaderType = [gl.VERTEX_SHADER,gl.FRAGMENT_SHADER]
    var precisionType = [gl.LOW_FLOAT, gl.MEDIUM_FLOAT, gl.HIGH_FLOAT, gl.LOW_INT, gl.MEDIUM_INT, gl.HIGH_INT]
    shaderType.forEach(function(shader){
      precisionType.forEach(function(precision){
        gl.getShaderPrecisionFormat(shader,precision)
      })
    })
  } catch (error) {
    if (error)
      {
        support = false;
      }
  }
  return support;
}
console.log(pixelShader());

export const Bg = ({canvas}) => {
    const sizes = {
        width: window.innerWidth,
        height: window.innerHeight
    };
    const refCursorCanvas = canvas;
    // const renderer = new THREE.WebGLRenderer();
    const renderer = new THREE.WebGLRenderer({canvas: canvas.current});
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 4));
    const { gl, size, scene, camera } = useThree();
    camera.position.z = 150;

    ////////////cursor-s
    renderer.setClearColor(0x000000, 1.0);
    renderer.physicallyCorrectLights = true;
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.autoClear = false;

    const resize = () => {
        renderer.setSize(sizes.width, sizes.height);
        camera.aspect = sizes.width / sizes.height;
        camera.updateProjectionMatrix();
    }

      window.addEventListener('resize', resize);
    ////////////cursor-e
    
    useEffect(() => {

        /////////////////////curso-s-0.5
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();
        const eMouse = new THREE.Vector2();
        const elasticMouse = new THREE.Vector2();
        const tmp = new THREE.Vector2();
        const elasticMouseVel = new THREE.Vector2();

        let cursor_time = 0;
        const cursor_material = new THREE.ShaderMaterial({
            extensions: {
              derivatives: false
            },
            side: THREE.DoubleSide,
            uniforms: {
              uTime: { value: cursor_time },
              uLight: { value: new THREE.Vector3(0, 0, 0) }
            },
            // wireframe: true,
            // transparent: true,
            opacity: 1,
            vertexShader: `
            uniform float uTime;
            
            varying vec2 vUv;
            varying vec3 vPosition;
            varying vec3 vNormal;
            varying vec3 vWorldPosition;
            
            void main() {
              vUv = uv;
            
              vPosition = position;
              vNormal = normal;
              vWorldPosition =vec3(modelMatrix * vec4(position, 1.0));
            
              vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
              gl_Position = vec4(projectionMatrix * mvPosition);
            }`,
            fragmentShader: `
            uniform float uTime;
            uniform vec3 uLight;
            
            varying vec2 vUv;
            varying vec3 vPosition;
            varying vec3 vNormal;
            varying vec3 vWorldPosition;
            
            const float PI = 3.141592653589793238;
            
            /**
             * @see https://ijdykeman.github.io/graphics/simple_fog_shader
             * @see https://gist.github.com/akella/fbc8ec75b2cb1586388f19e32ceaf1f2
             */
            float getScatter(vec3 cameraPos, vec3 dir, vec3 lightPos, float d) {
              // light to ray origin
              vec3 q = cameraPos - lightPos;
            
              // coefficients
              float b = dot(dir, q);
              float c = dot(q, q);
            
              // evaluate integral
              float t = c - b * b;
              float s = 1.0 / sqrt(max(0.0001, t));
              float l = s * (atan((d + b) * s) - atan(b * s));
            
              return pow(max(0.0, l / 250.0), 0.4) * 5.0;
            }
            
            void main() {
              vec2 uv = vUv;
            
              vec3 cameraToWorld = vWorldPosition - cameraPosition;
              vec3 cameraToWorldDir = normalize(cameraToWorld);
              float cameraToWorldDist = length(cameraToWorld);
            
              vec3 lightToWorld = normalize(uLight - vWorldPosition);
              float diffuse = max(0.0, dot(vNormal, lightToWorld));
              float dist = length(uLight - vPosition);
            
              float scatter = getScatter(cameraPosition, cameraToWorldDir, uLight, cameraToWorldDist);
            
              float final = diffuse + scatter;
              vec3 ambient = vec3(0.05, 0, 0.15);
              vec3 color = vec3(final, 0.0, 0.0);
              gl_FragColor = vec4(color, 1.0);
            }`
          });

        const cursor_raycastPlane = new THREE.Mesh(
            new THREE.PlaneBufferGeometry(500, 500),
            // new THREE.MeshBasicMaterial({ color: 0xcb0d02 })
            cursor_material
        );

        const temp = new THREE.SphereBufferGeometry(0.7, 20, 20);
        const cursor_light = new THREE.Mesh(
          temp,
            new THREE.MeshBasicMaterial({ color: 0xffffff })
        );

        // cursor_raycastPlane.position.z=-200;
        // cursor_light.position.z = 0;

        scene.add(cursor_raycastPlane);
        scene.add(cursor_light);
    ///////////////cusor-e-0.5

        const points = Array(5000)
        .fill(0)
        .map(() => {
            return new THREE.Vector3(
            Math.random() * 600 - 300,
            Math.random() * 600 - 300,
            Math.random() * 300
            );
        });

        const sprite = new THREE.TextureLoader().load('assets/img/disc_new.png');
        const starGeo = new THREE.BufferGeometry().setFromPoints(points);
        let starMaterial = new THREE.PointsMaterial({
            size: 2,
            map: sprite,
            transparent: true,
            sizeAttenuation: true,
            opacity: 0.7,
            precision: "highp",
            fog: true
        });
        starMaterial.color.setHSL( 1.0, 0.3, 0.7 );
        
        const stars = new THREE.Points(starGeo, starMaterial);
        // stars.attributes.position.z = 0;
        scene.add(stars);
        
        // Mousemove
        const cursor = {};
        cursor.x = 0;
        cursor.y = 0;
        window.addEventListener("mousemove", (event) => {
            cursor.x = (event.clientX / sizes.width - 0.5) * 10;
            cursor.y = (event.clientY / sizes.height - 0.5) * 10;

            ///////////cusor-s-2
            mouse.x = (event.clientX / sizes.width) * 2 - 1;
            mouse.y = -(event.clientY / sizes.height) * 2 + 1;
            raycaster.setFromCamera(mouse, camera);

            eMouse.x = event.clientX;
            eMouse.y = event.clientY;

            const intersects = raycaster.intersectObjects([cursor_raycastPlane]);
            if (intersects.length) {
                const p = intersects[0].point;
                cursor_light.position.copy(p);

                eMouse.x = p.x;
                eMouse.y = p.y;
            }

            ///////////cusor-e-2
            
        });

        let velocity = 0;
        let acceleration = 0.00001;

        const animate = () => {
            renderer.render(scene, camera);
            let currentPoints = starGeo.attributes.position.array;
            for (let i = 0; i < currentPoints.length; i += 3) {
                velocity += acceleration;
                currentPoints[i + 2] += velocity;

                if (currentPoints[i + 2] > 200) {
                currentPoints[i + 2] = 0;
                velocity = 0;
                }
            }
            starGeo.attributes.position.needsUpdate = true;
            stars.rotation.z -= 0.0004;

            // camera.position.set(cursor.x, cursor.y, 2);

            const time = Date.now() * 0.00005;
            const h = ( 360 * ( 1.0 + time ) % 360 ) / 360;
            starMaterial.color.setHSL( h, 0.5, 0.5 );

            //////////////////cursor-s-3
            tmp.copy(eMouse).sub(elasticMouse).multiplyScalar(0.15);
            elasticMouseVel.add(tmp);
            elasticMouseVel.multiplyScalar(0.8);
            elasticMouse.add(elasticMouseVel);

            cursor_light.position.x = elasticMouse.x;
            cursor_light.position.y = elasticMouse.y;
            cursor_material.uniforms.uLight.value.copy(cursor_light.position);

            cursor_time += 1.0;
            cursor_material.uniforms.uTime.value = cursor_time;

            renderer.clear();
            // renderer.render(scene, camera);
            //////////////////cursor-e-3
            
            window.requestAnimationFrame(animate);
        };
        
        animate();

        ///////
        hoverMouse($('.button'));
        const logo_scale = 0.13;
        let logo_tween, about_text, navbar, project_page, aboutBtn;
        let logo_move_x = $('#logo_img').offset().left + $('#logo_img').width()/2 * (1-logo_scale) - 20;
        let logo_move_y = $('#logo_img').offset().top + $('#logo_img').height()/2 * (1-logo_scale) + 1;
        
        $('#hello_btn').click(function(){
            $(this).css('display', 'none');
            logo_tween = gsap.to("#logo_img", {rotation: 360, scale: logo_scale, x: -logo_move_x, y: -logo_move_y, duration: 0.5, ease: "easeOut"});
            about_text = gsap.to($("#about_txt"), {scale:1, duration: 0.5});
            navbar = gsap.to($('#navbar'), {duration: 0.5, scaleY:1, ease: "power4.out"})
            aboutBtn = gsap.to($("#about_btn"), {scale:1, duration: 0.5});
            $("#about_btn").css('display', 'block');
        });
        $('#about_btn').click(function(){
          aboutBtn.reverse();
          $(this).css('display', 'none');
          about_text.reverse();
          $("#projects_area").css('display', 'block');
          project_page = gsap.to($("#projects_area"), {scaleY:1, duration: 1});
        });
        $("#brand").click(function(){
          aboutBtn.reverse();
          $("#about_btn").css('display', 'none');
          about_text.reverse();
          project_page.reverse();
          $("#projects_area").css('display', 'none');
          logo_tween.reverse();
          $('#hello_btn').css("display", "block");
          navbar.reverse();
        })
        
    }, []);

    return (
        <>
        </>
      )
    
}

export default Bg

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