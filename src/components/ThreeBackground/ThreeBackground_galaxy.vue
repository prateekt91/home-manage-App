<script setup>
import { onMounted, onBeforeUnmount, ref } from 'vue'
import * as THREE from 'three'
import './ThreeBackground.css'

const canvasContainer = ref(null)
let scene, camera, renderer, animationId
let starFields = []
let nebulas = []
let mouse = { x: 0, y: 0 }
let windowHalf = { x: window.innerWidth / 2, y: window.innerHeight / 2 }

const initThreeScene = () => {
  // Scene setup
  scene = new THREE.Scene()
  scene.fog = new THREE.FogExp2(0x000000, 0.0003)

  // Camera setup
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 5000)
  camera.position.z = 1000

  // Renderer setup
  renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setClearColor(0x000000, 1)
  renderer.setPixelRatio(window.devicePixelRatio)

  canvasContainer.value.appendChild(renderer.domElement)

  // Create galaxy elements
  createStarField()
  createNebulas()
  createDistantStars()

  // Add ambient lighting for atmosphere
  const ambientLight = new THREE.AmbientLight(0x222266, 0.5)
  scene.add(ambientLight)

  // Add point lights for nebula glow
  const colors = [0x4444ff, 0xff4444, 0x44ff44]
  colors.forEach(color => {
    const light = new THREE.PointLight(color, 2, 1000)
    light.position.set(
        (Math.random() - 0.5) * 1000,
        (Math.random() - 0.5) * 1000,
        (Math.random() - 0.5) * 1000
    )
    scene.add(light)
  })
}

const createStarField = () => {
  const starCount = 10000
  const positions = new Float32Array(starCount * 3)
  const colors = new Float32Array(starCount * 3)
  const sizes = new Float32Array(starCount)

  for (let i = 0; i < starCount; i++) {
    // Position stars in a sphere
    const radius = Math.random() * 2000 + 500
    const theta = Math.random() * Math.PI * 2
    const phi = Math.acos((Math.random() * 2) - 1)

    positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta)
    positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
    positions[i * 3 + 2] = radius * Math.cos(phi)

    // Randomize star colors (mostly white with hints of blue and yellow)
    const color = new THREE.Color()
    const hue = Math.random() > 0.5 ? 0.6 : 0.15
    color.setHSL(hue, 0.2, 0.8 + Math.random() * 0.2)

    colors[i * 3] = color.r
    colors[i * 3 + 1] = color.g
    colors[i * 3 + 2] = color.b

    // Randomize star sizes
    sizes[i] = Math.random() * 3
  }

  const starGeometry = new THREE.BufferGeometry()
  starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  starGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
  starGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1))

  const starMaterial = new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 }
    },
    vertexShader: `
      attribute float size;
      varying vec3 vColor;
      uniform float time;
      void main() {
        vColor = color;
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = size * (300.0 / -mvPosition.z) * (sin(time + position.x * 0.025) * 0.2 + 0.8);
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      varying vec3 vColor;
      void main() {
        float r = 0.0, delta = 0.0, alpha = 1.0;
        vec2 cxy = 2.0 * gl_PointCoord - 1.0;
        r = dot(cxy, cxy);
        if (r > 1.0) {
            discard;
        }
        gl_FragColor = vec4(vColor, alpha * (1.0 - r));
      }
    `,
    blending: THREE.AdditiveBlending,
    depthTest: false,
    transparent: true,
    vertexColors: true
  })

  const starField = new THREE.Points(starGeometry, starMaterial)
  starFields.push(starField)
  scene.add(starField)
}

const createNebulas = () => {
  const nebulaCount = 5
  const nebulaColors = [
    new THREE.Color(0x4444ff),
    new THREE.Color(0xff4444),
    new THREE.Color(0x44ff44),
    new THREE.Color(0x9944ff),
    new THREE.Color(0xff9944)
  ]

  for (let i = 0; i < nebulaCount; i++) {
    const geometry = new THREE.BufferGeometry()
    const particleCount = 1000
    const positions = new Float32Array(particleCount * 3)
    const colors = new Float32Array(particleCount * 3)

    const baseColor = nebulaColors[i]
    const size = Math.random() * 500 + 300
    const center = new THREE.Vector3(
        (Math.random() - 0.5) * 2000,
        (Math.random() - 0.5) * 2000,
        (Math.random() - 0.5) * 2000
    )

    for (let j = 0; j < particleCount; j++) {
      const offset = new THREE.Vector3(
          (Math.random() - 0.5) * size,
          (Math.random() - 0.5) * size,
          (Math.random() - 0.5) * size
      )

      positions[j * 3] = center.x + offset.x
      positions[j * 3 + 1] = center.y + offset.y
      positions[j * 3 + 2] = center.z + offset.z

      const color = baseColor.clone()
      color.multiplyScalar(0.5 + Math.random() * 0.5)

      colors[j * 3] = color.r
      colors[j * 3 + 1] = color.g
      colors[j * 3 + 2] = color.b
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

    const material = new THREE.PointsMaterial({
      size: 15,
      sizeAttenuation: true,
      map: createNebulaTexture(),
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      vertexColors: true,
      opacity: 0.6
    })

    const nebula = new THREE.Points(geometry, material)
    nebula.userData = {
      rotationSpeed: new THREE.Vector3(
          Math.random() * 0.0002 - 0.0001,
          Math.random() * 0.0002 - 0.0001,
          Math.random() * 0.0002 - 0.0001
      )
    }

    nebulas.push(nebula)
    scene.add(nebula)
  }
}

const createNebulaTexture = () => {
  const canvas = document.createElement('canvas')
  canvas.width = 32
  canvas.height = 32
  const ctx = canvas.getContext('2d')
  const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16)
  gradient.addColorStop(0, 'rgba(255,255,255,1)')
  gradient.addColorStop(0.2, 'rgba(255,255,255,0.8)')
  gradient.addColorStop(0.4, 'rgba(255,255,255,0.4)')
  gradient.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, 32, 32)

  const texture = new THREE.Texture(canvas)
  texture.needsUpdate = true
  return texture
}

const createDistantStars = () => {
  const geometry = new THREE.BufferGeometry()
  const vertices = []

  for (let i = 0; i < 1000; i++) {
    const radius = 4000
    const theta = Math.random() * Math.PI * 2
    const phi = Math.acos((Math.random() * 2) - 1)

    vertices.push(
        radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.sin(phi) * Math.sin(theta),
        radius * Math.cos(phi)
    )
  }

  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))

  const material = new THREE.PointsMaterial({
    size: 2,
    sizeAttenuation: false,
    color: 0xffffff,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending
  })

  const distantStars = new THREE.Points(geometry, material)
  scene.add(distantStars)
}

const animate = () => {
  animationId = requestAnimationFrame(animate)
  const time = Date.now() * 0.001

  // Animate star fields
  starFields.forEach(starField => {
    starField.material.uniforms.time.value = time
    starField.rotation.y += 0.0001
  })

  // Animate nebulas
  nebulas.forEach(nebula => {
    nebula.rotation.x += nebula.userData.rotationSpeed.x
    nebula.rotation.y += nebula.userData.rotationSpeed.y
    nebula.rotation.z += nebula.userData.rotationSpeed.z

    // Pulse the opacity
    nebula.material.opacity = 0.4 + Math.sin(time) * 0.2
  })

  // Camera movement based on mouse
  camera.position.x += (mouse.x * 2 - camera.position.x) * 0.01
  camera.position.y += (-mouse.y * 2 - camera.position.y) * 0.01
  camera.lookAt(scene.position)

  renderer.render(scene, camera)
}

const handleMouseMove = (event) => {
  mouse.x = (event.clientX - windowHalf.x) * 2
  mouse.y = (event.clientY - windowHalf.y) * 2
}

const handleResize = () => {
  windowHalf.x = window.innerWidth / 2
  windowHalf.y = window.innerHeight / 2

  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()

  renderer.setSize(window.innerWidth, window.innerHeight)
}

onMounted(() => {
  initThreeScene()
  animate()

  window.addEventListener('mousemove', handleMouseMove)
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  if (animationId) {
    cancelAnimationFrame(animationId)
  }

  window.removeEventListener('mousemove', handleMouseMove)
  window.removeEventListener('resize', handleResize)

  if (renderer) {
    renderer.dispose()
  }
})
</script>

<template>
  <div ref="canvasContainer" class="three-background"></div>
</template>
