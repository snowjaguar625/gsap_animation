import "./styles.css";
import { React, useEffect, useState, useRef, useCallback ,Suspense } from "react";
import * as THREE from "three";
import { Canvas, render } from '@react-three/fiber'
import Effects from './Effects'
import MetaballSwarm from './MetaballSwarm/MetaballSwarm'
import Bg from './bg'

//////////work page -s
import { extend, useFrame, useThree } from '@react-three/fiber'
import * as resources from './resources/index'
extend(resources)

function Particle({ geometry, material, mouse }) {
  let ref = useRef()
  let t = Math.random() * 100
  let speed = 0.01 + Math.random() / 200  //0.01 - 0.015
  let factor = 20 + Math.random() * 100   //20 - 120
  let xFactor = 0 + Math.random() * 50
  let yFactor = 0 + -Math.random() * 50
  let zFactor = 70 + Math.random() * 60;
  let xEle = 0;
  let yEle = 0;
  useFrame(() => {
    t += speed
    const a = Math.cos(t) + Math.sin(t * 1) / 10
    const b = Math.sin(t) + Math.cos(t * 2) / 10
    const s = Math.cos(t);
    xEle += (mouse.current[0] - window.innerWidth / 2 - xEle) * 0.01
    yEle += ((mouse.current[1] - window.innerHeight / 2) * -1 - yEle) * 0.01
    ref.current.scale.set(s, s, s)
    ref.current.rotation.set(s * 5, s * 5, s * 5)
    ref.current.position.set(
    (xEle / 10) * a + xFactor + Math.cos((t / 30) * factor) + (Math.sin(t * 1) * factor) / 10 + 2 ,
    (yEle / 10) * b + yFactor + Math.sin((t / 20) * factor) + (Math.cos(t * 2) * factor) / 10 + 2,
    zFactor + Math.cos((t / 10) * factor) + (Math.sin(t * 3) * factor) / 20
    )
  })
  return <mesh ref={ref} material={material} geometry={geometry} />
}

function mouseTowoldCoordinate(camera, mouse){
  var vector = new THREE.Vector3();
  vector.set(mouse.current[0] / window.innerWidth * 2 - 1, - (mouse.current[1]/ window.innerHeight) * 2 + 1, 150);
  vector.unproject(camera);
  var dir = vector.sub(camera.position).normalize();
  var distance = - camera.position.z / dir.z;
  var position = camera.position.clone().add(dir.multiplyScalar(distance));
  return position
}

function Swarm({ mouse, pastate, tmp_state }) {
  console.log("###Swarm is rendered.")
  const { camera, size, viewport } = useThree();
  const aspect = size.width / viewport.width;
  const light = useRef()
  const [geometry, geometryRef] = useState()
  const [material, materialRef] = useState();
  let mouse_coordd_x;
  let mouse_coordd_y;
  let flag_state = true;
  useFrame(() => {
    mouse_coordd_x = mouseTowoldCoordinate(camera, mouse).x;
    mouse_coordd_y = mouseTowoldCoordinate(camera, mouse).y;
    light.current.position.set(mouse_coordd_x, mouse_coordd_y, 100);
    material.transparent = tmp_state.current;
  })
  return (
    <>
      <pointLight ref={light} distance={50} intensity={2.5} color="red" />
      <spotLight intensity={0.5} position={[50, -50, 140]} penumbra={1} />
      {/* <mesh>
        <planeGeometry attach="geometry" args={[500, 500]} />
        <meshPhongMaterial attach="material" color="#575757" depthTest={false} />
      </mesh> */}
      <dodecahedronBufferGeometry ref={geometryRef} args={[0.8, 0]} />
      <meshPhysicalMaterial ref={materialRef} transparent={flag_state} opacity={0} />
      {geometry && new Array(200).fill().map((_, index) => <Particle key={index} mouse={mouse} material={material} geometry={geometry} />)}
    </>
  )
}

function Effect() {
  const composer = useRef()
  const { scene, gl, size, camera } = useThree();
  useEffect(() => void composer.current.setSize(size.width, size.height), [size])
  // useFrame(({ gl }) => void ((gl.autoClear = true), composer.current.render()), 2)
  return (
    <effectComposer ref={composer} args={[gl]}>
      <renderPass attachArray="passes" scene={scene} camera={camera} />
      <waterPass attachArray="passes" factor={2} />
      <afterimagePass attachArray="passes" factor={0.7} />
      <shaderPass attachArray="passes" args={[resources.FXAAShader]} material-uniforms-resolution-value={[1 / size.width, 1 / size.height]} renderoScreen />
    </effectComposer>
  )
}

/////////



export const App = () => {

  ///////////////////////work page -s
  const mouse = useRef([0, 0])
  const tmp_state = useRef(true);
  // const onMouseMove = useCallback(({ clientX: x, clientY: y }) => { mouse.current = [x, y]}, [])
 
  const [pastate, setPastate] = useState(true);
  console.log("&&&&this is rendered by state change");
  console.log("state value is : ", pastate)

  ///////////////////////work page -e
  
  // const particlehidefunc = useCallback(() => {(state) => {
  //   console.log("function is called. enter: ", state)
  //   setPastate(state)
  // }}, [pastate]);
  const particlehidefunc = (state) => {
  console.log("!!!!function is called. enter: ", state)
    // setPastate(state);
    tmp_state.current = state;
  };

  useEffect(() => {
    window.addEventListener("mousemove", (event) => {
      mouse.current = [event.clientX, event.clientY]
    });
  }, []);

    return (
      <>
        {/* <div ref={inputElement} className="canvas"></div> */}
        {/* <div className="wrapper" onMouseMove={onMouseMove}> */}
        <div className="wrapper">
          <Canvas gl={{ autoClear: true }} camera={{fov: 60, near: 1, far: 1000, position: [0, 0, 10]}} pixelRatio={getDevicePixelRatio(1)}>
            {/* <MetaballSwarm />
            <Suspense fallback={null}>
            <pointLight position={[0, 0, 1]} />
              <Effects />
            </Suspense> */}
            <Bg particlehidefunc={particlehidefunc}/>
            <Swarm mouse={mouse} tmp_state = {tmp_state}  pastate={pastate}/>
            <Effect />
          </Canvas>
        </div>
      </>
    );
}
const getDevicePixelRatio = (maxDpr = 2) =>
  typeof window !== 'undefined' ? Math.min(Math.max(Math.round(window.devicePixelRatio), 1), maxDpr).toFixed(1) : '1.0'