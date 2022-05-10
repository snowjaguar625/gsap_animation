import React, { useRef, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Object3D, Vector2, Vector3 } from 'three'

import CreateMetaballMaterial from './MetaballMaterial'

/////////////////////
console.log("check")
function pixelShader() {
  var support = true;
  try {
    var canvas = document.getElementsByTagName('canvas')[0]
    var gl = canvas.getContext("webgl")
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
/////////////////////
const MetaballSwarm = () => {
  const { gl, size } = useThree()
  const pixelRatio = gl.getPixelRatio()
  const width = size.width * pixelRatio
  const height = size.height * pixelRatio
  const mesh = useRef()
  let metaballCount = 15

  const metaballUniforms = useMemo(() => new Array(metaballCount).fill().map(() => new Vector3()), [metaballCount])
  const resolution = useMemo(() => new Vector2(width, height), [height, width])

  // CREATE METABALL OBJECTS
  const metaballs = useMemo(() => {
    const temp = []
    for (let i = 0; i < metaballCount; i++) {
      temp[i] = new Object3D()
      temp[i].userData = {
        radius: 35 * pixelRatio,
        speed: 0.6
      }
    }
    return temp
  }, [metaballCount, pixelRatio])

  const metaballMaterial = useMemo(() => CreateMetaballMaterial(metaballCount), [metaballCount])

  useFrame(state => {
    const metaballTarget = {
      x: state.mouse.x * size.width * 0.5,
      y: -state.mouse.y * size.height * 0.5
    }
    metaballs.forEach((metaball, i) => {
      const { speed, radius } = metaball.userData
      const distX = metaballTarget.x - metaball.position.x
      const distY = metaballTarget.y - metaball.position.y

      metaball.position.x += distX * speed
      metaball.position.y += distY * speed

      metaballTarget.x = metaball.position.x
      metaballTarget.y = metaball.position.y
      metaballUniforms[i].set(metaball.position.x, metaball.position.y, radius)
    })
  })

  return (
    <mesh ref={mesh}>
      <planeBufferGeometry attach="geometry" args={[width, height, 1, 1]} />
      <shaderMaterial attach="material" uniforms-metaballs-value={metaballUniforms} uniforms-resolution-value={resolution} args={[metaballMaterial]} />
    </mesh>
  )
}

export default MetaballSwarm
