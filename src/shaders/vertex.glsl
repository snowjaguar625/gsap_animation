precision highp float;
uniform float uTime;

varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vNormal;
varying vec3 vWorldPosition;

void main() {
  vUv = uv;

  vPosition = position;
  vNormal = normal;
  vWorldPosition = vec3(modelMatrix * vec4(position, 1.0));

  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  gl_Position = vec4(projectionMatrix * mvPosition);
}