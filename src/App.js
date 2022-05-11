import "./styles.css";
import * as THREE from "three";
import { React, useEffect, useState, useRef, Suspense } from "react";
import { Canvas, render } from '@react-three/fiber'
import Effects from './Effects'
import MetaballSwarm from './MetaballSwarm/MetaballSwarm'
import Bg from './bg'

//////////work page -s
import { useCallback } from 'react'
import { extend, useFrame, useThree } from '@react-three/fiber'
import * as resources from './resources/index'
extend(resources)

function Particle({ geometry, material }) {
  let ref = useRef()
  let t = Math.random() * 100
  let speed = 0.01 + Math.random() / 200
  let factor = 20 + Math.random() * 100
  let xFactor = -50 + Math.random() * 100
  let yFactor = -50 + Math.random() * 100
  let zFactor = -30 + Math.random() * 60
  useFrame(() => {
    t += speed
    const s = Math.cos(t)
    ref.current.scale.set(s, s, s)
    ref.current.rotation.set(s * 5, s * 5, s * 5)
    ref.current.position.set(
      xFactor + Math.cos((t / 30) * factor) + (Math.sin(t * 1) * factor) / 10,
      yFactor + Math.sin((t / 20) * factor) + (Math.cos(t * 2) * factor) / 10,
      zFactor + Math.cos((t / 10) * factor) + (Math.sin(t * 3) * factor) / 20
    )
  })
  return <mesh ref={ref} material={material} geometry={geometry} />
}
function Swarm({ mouse }) {
  const light = useRef()
  const [geometry, geometryRef] = useState()
  const [material, materialRef] = useState()
  useFrame(() => light.current.position.set(mouse.current[0] / 20, -mouse.current[1] / 20, 0))
  return (
    <>
      <pointLight ref={light} distance={50} intensity={1.5} color="red" />
      <spotLight intensity={0.5} position={[10, 10, 40]} penumbra={1} />
      <mesh>
        <planeGeometry attach="geometry" args={[10000, 10000]} />
        <meshPhongMaterial attach="material" color="#575757" depthTest={false} />
      </mesh>
      <dodecahedronBufferGeometry ref={geometryRef} args={[0.8, 0]} />
      <meshPhysicalMaterial ref={materialRef} />
      {geometry && new Array(800).fill().map((_, index) => <Particle key={index} material={material} geometry={geometry} />)}
    </>
  )
}

function Effect() {
  const composer = useRef()
  const { scene, gl, size, camera } = useThree()
  useEffect(() => void composer.current.setSize(size.width, size.height), [size])
  // useFrame(({ gl }) => void ((gl.autoClear = true), composer.current.render()), 1)
  return (
    <effectComposer ref={composer} args={[gl]}>
      <renderPass attachArray="passes" scene={scene} camera={camera} />
      <waterPass attachArray="passes" factor={2} />
      <afterimagePass attachArray="passes" factor={0.7} />
      <shaderPass attachArray="passes" args={[resources.FXAAShader]} material-uniforms-resolution-value={[1 / size.width, 1 / size.height]} renderToScreen />
    </effectComposer>
  )
}

/////////



export const App = () => {

  ///////////////////////work page -s
  const mouse = useRef([0, 0])
  const onMouseMove = useCallback(({ clientX: x, clientY: y }) => (mouse.current = [x - window.innerWidth / 2, y - window.innerHeight / 2]), [])
  ///////////////////////work page -e
  const refCursorCanvas = useRef();
  useEffect(() => {
    

  }, []);

    return (
      <>
        {/* <div ref={inputElement} className="canvas"></div> */}
        <div className="wrapper" onMouseMove={onMouseMove}>
          <Canvas ref={refCursorCanvas} gl={{ autoClear: true }} camera={{fov: 60, near: 1, far: 1000, position: [0, 0, 10]}} pixelRatio={getDevicePixelRatio(1)}>
            {/* <MetaballSwarm />
            <pointLight position={[0, 0, 1]} />
            <Suspense fallback={null}>
              <Effects />
            </Suspense> */}
            <Bg canvas={refCursorCanvas}/>
            {/* <Swarm mouse={mouse} />
            <Effect /> */}
          </Canvas>
        </div>
      </>
    );
}
const getDevicePixelRatio = (maxDpr = 2) =>
  typeof window !== 'undefined' ? Math.min(Math.max(Math.round(window.devicePixelRatio), 1), maxDpr).toFixed(1) : '1.0'