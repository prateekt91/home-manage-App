<script setup>
import { onMounted, onBeforeUnmount, ref } from 'vue'
import * as THREE from 'three'
import './ThreeBackground.css'

const canvasContainer = ref(null)
let scene, camera, renderer, animationId
let particles = []
let geometries = []
let mouse = { x: 0, y: 0 }
let windowHalf = { x: window.innerWidth / 2, y: window.innerHeight / 2 }

const initThreeScene = () => {
  // Scene setup
  scene = new THREE.Scene()
  scene.fog = new THREE.Fog(0x1a1a2e, 1, 3000)

  // Camera setup
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 3000)
  camera.position.z = 1000

  // Renderer setup
  renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setClearColor(0x0f0f23, 1)
  renderer.setPixelRatio(window.devicePixelRatio)

  canvasContainer.value.appendChild(renderer.domElement)

  // Create animated geometries
  createFloatingGeometry()
  createParticleSystem()
  createWaveGeometry()

  // Lighting
  const ambientLight = new THREE.AmbientLight(0x4444aa, 0.3)
  scene.add(ambientLight)

  const pointLight = new THREE.PointLight(0x6366f1, 1, 2000)
  pointLight.position.set(0, 0, 500)
  scene.add(pointLight)

  const directionalLight = new THREE.DirectionalLight(0x764ba2, 0.5)
  directionalLight.position.set(-1, 1, 1)
  scene.add(directionalLight)
}

const createFloatingGeometry = () => {
  // Floating cubes and spheres
  const cubeGeometry = new THREE.BoxGeometry(50, 50, 50)
  const sphereGeometry = new THREE.SphereGeometry(30, 32, 32)
  const torusGeometry = new THREE.TorusGeometry(25, 10, 16, 100)

  const materials = [
    new THREE.MeshLambertMaterial({ color: 0x6366f1, transparent: true, opacity: 0.7 }),
    new THREE.MeshLambertMaterial({ color: 0x764ba2, transparent: true, opacity: 0.7 }),
    new THREE.MeshLambertMaterial({ color: 0x8b5cf6, transparent: true, opacity: 0.7 }),
    new THREE.MeshLambertMaterial({ color: 0x667eea, transparent: true, opacity: 0.7 })
  ]

  const geoTypes = [cubeGeometry, sphereGeometry, torusGeometry]

  for (let i = 0; i < 15; i++) {
    const geometry = geoTypes[Math.floor(Math.random() * geoTypes.length)]
    const material = materials[Math.floor(Math.random() * materials.length)]
    const mesh = new THREE.Mesh(geometry, material)

    mesh.position.x = (Math.random() - 0.5) * 2000
    mesh.position.y = (Math.random() - 0.5) * 2000
    mesh.position.z = (Math.random() - 0.5) * 1000

    mesh.rotation.x = Math.random() * 2 * Math.PI
    mesh.rotation.y = Math.random() * 2 * Math.PI

    mesh.userData = {
      rotationSpeed: {
        x: (Math.random() - 0.5) * 0.02,
        y: (Math.random() - 0.5) * 0.02,
        z: (Math.random() - 0.5) * 0.02
      },
      floatSpeed: Math.random() * 0.02 + 0.01,
      originalY: mesh.position.y
    }

    geometries.push(mesh)
    scene.add(mesh)
  }
}

const createParticleSystem = () => {
  const particleCount = 800
  const positions = new Float32Array(particleCount * 3)
  const colors = new Float32Array(particleCount * 3)

  const color = new THREE.Color()

  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 4000
    positions[i * 3 + 1] = (Math.random() - 0.5) * 4000
    positions[i * 3 + 2] = (Math.random() - 0.5) * 2000

    color.setHSL(0.6 + Math.random() * 0.2, 0.7, 0.5 + Math.random() * 0.3)
    colors[i * 3] = color.r
    colors[i * 3 + 1] = color.g
    colors[i * 3 + 2] = color.b
  }

  const particleGeometry = new THREE.BufferGeometry()
  particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

  const particleMaterial = new THREE.PointsMaterial({
    size: 3,
    vertexColors: true,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending
  })

  const particleSystem = new THREE.Points(particleGeometry, particleMaterial)
  particles.push(particleSystem)
  scene.add(particleSystem)
}

const createWaveGeometry = () => {
  const waveGeometry = new THREE.PlaneGeometry(1000, 1000, 50, 50)
  const waveMaterial = new THREE.MeshLambertMaterial({
    color: 0x4a5568,
    transparent: true,
    opacity: 0.1,
    wireframe: true
  })

  const wave = new THREE.Mesh(waveGeometry, waveMaterial)
  wave.rotation.x = -Math.PI / 2
  wave.position.y = -500
  wave.userData = { originalVertices: [...waveGeometry.attributes.position.array] }

  geometries.push(wave)
  scene.add(wave)
}

const animate = () => {
  animationId = requestAnimationFrame(animate)

  const time = Date.now() * 0.001

  // Animate floating geometries
  geometries.forEach((mesh, index) => {
    if (mesh.userData.rotationSpeed) {
      mesh.rotation.x += mesh.userData.rotationSpeed.x
      mesh.rotation.y += mesh.userData.rotationSpeed.y
      mesh.rotation.z += mesh.userData.rotationSpeed.z

      mesh.position.y = mesh.userData.originalY + Math.sin(time + index) * 50
    }

    // Animate wave
    if (mesh.geometry.type === 'PlaneGeometry' && mesh.userData.originalVertices) {
      const positions = mesh.geometry.attributes.position.array
      const originalVertices = mesh.userData.originalVertices

      for (let i = 0; i < positions.length; i += 3) {
        positions[i + 2] = originalVertices[i + 2] + 
          Math.sin(originalVertices[i] * 0.01 + time) * 20 +
          Math.sin(originalVertices[i + 1] * 0.01 + time) * 20
      }
      mesh.geometry.attributes.position.needsUpdate = true
    }
  })

  // Animate particles
  particles.forEach((particleSystem) => {
    particleSystem.rotation.y += 0.001
    const positions = particleSystem.geometry.attributes.position.array

    for (let i = 0; i < positions.length; i += 3) {
      positions[i + 1] += Math.sin(time + i) * 0.5
    }
    particleSystem.geometry.attributes.position.needsUpdate = true
  })

  // Camera movement based on mouse
  camera.position.x += (mouse.x - camera.position.x) * 0.005
  camera.position.y += (-mouse.y - camera.position.y) * 0.005
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
