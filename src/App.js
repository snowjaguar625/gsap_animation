import "./styles.css";
import * as THREE from "three";
import { React, useEffect, useRef, Suspense } from "react";
import  $ from 'jquery';
import gsap from 'gsap';
import { Canvas, render } from '@react-three/fiber'
import Effects from './Effects'
import MetaballSwarm from './MetaballSwarm/MetaballSwarm'
import Bg from './bg'

export const App = () => {
  
  const refCursorCanvas = useRef();
  

  useEffect(() => {
    

  }, []);

    return (
      <>
        {/* <div ref={inputElement} className="canvas"></div> */}
        <div className="wrapper">
          <Canvas ref={refCursorCanvas} gl={{ autoClear: false }} camera={{fov: 60, near: 1, far: 1000, position: [0, 0, 5]}} pixelRatio={getDevicePixelRatio(1)}>
            <MetaballSwarm />
            <pointLight position={[0, 0, 1]} />
            <Suspense fallback={null}>
              <Effects />
            </Suspense>
            <Bg canvas={refCursorCanvas}/>
          </Canvas>
        </div>
      </>
    );
}
const getDevicePixelRatio = (maxDpr = 2) =>
  typeof window !== 'undefined' ? Math.min(Math.max(Math.round(window.devicePixelRatio), 1), maxDpr).toFixed(1) : '1.0'