import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import * as CANNON from 'cannon-es'
import './FateDiceRoller.css'

const DICE_COUNT = 4
const DICE_SIZE = 0.5
const VIEW_SIZE = 7
const CAMERA_HEIGHT = 9
const GRAVITY = -18
const SIM_SPEED = 1.8
const LINEAR_THRESHOLD = 0.12
const ANGULAR_THRESHOLD = 0.18
const SETTLE_FRAMES = 18
const FADE_DELAY_MS = 3000
const FADE_DURATION_MS = 700
const MAX_DELTA = 1 / 30
const WALL_HEIGHT = DICE_SIZE * 4
const WALL_THICKNESS = Math.max(DICE_SIZE * 0.6, 0.2)

const createFaceTexture = (symbol) => {
  const canvas = document.createElement('canvas')
  const size = 256
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')

  ctx.fillStyle = '#f7f5ef'
  ctx.fillRect(0, 0, size, size)

  ctx.strokeStyle = '#2a2a2a'
  ctx.lineWidth = 14
  ctx.strokeRect(18, 18, size - 36, size - 36)

  if (symbol !== 'blank') {
    ctx.strokeStyle = '#111111'
    ctx.lineWidth = 22
    ctx.lineCap = 'round'
    const center = size / 2
    const half = size * 0.22

    ctx.beginPath()
    ctx.moveTo(center - half, center)
    ctx.lineTo(center + half, center)
    ctx.stroke()

    if (symbol === 'plus') {
      ctx.beginPath()
      ctx.moveTo(center, center - half)
      ctx.lineTo(center, center + half)
      ctx.stroke()
    }
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

const createDiceMaterials = () => {
  const faces = ['plus', 'minus', 'blank', 'plus', 'minus', 'blank']
  return faces.map((symbol) => {
    const texture = createFaceTexture(symbol)
    return new THREE.MeshStandardMaterial({
      map: texture,
      roughness: 0.35,
      metalness: 0.15,
      transparent: true,
      opacity: 1
    })
  })
}

const randomInRange = (min, max) => min + Math.random() * (max - min)

function FateDiceRoller({ rollId, onRollingChange }) {
  const containerRef = useRef(null)
  const sceneRef = useRef(null)
  const cameraRef = useRef(null)
  const rendererRef = useRef(null)
  const worldRef = useRef(null)
  const diceRef = useRef([])
  const materialsRef = useRef([])
  const geometryRef = useRef(null)
  const wallBodiesRef = useRef([])
  const animationRef = useRef(null)
  const lastTimeRef = useRef(null)
  const settleFramesRef = useRef(0)
  const settledRef = useRef(false)
  const settledAtRef = useRef(0)
  const fadeStartRef = useRef(0)
  const isRollingRef = useRef(false)
  const boundsRef = useRef({ halfWidth: 4, halfDepth: 4 })
  const [isVisible, setIsVisible] = useState(false)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const scene = new THREE.Scene()
    sceneRef.current = scene

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setClearColor(0x000000, 0)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    rendererRef.current = renderer
    container.appendChild(renderer.domElement)

    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 50)
    camera.position.set(0, CAMERA_HEIGHT, 0)
    camera.up.set(0, 0, -1)
    camera.lookAt(0, 0, 0)
    cameraRef.current = camera

    const ambient = new THREE.AmbientLight(0xffffff, 0.85)
    const directional = new THREE.DirectionalLight(0xffffff, 0.6)
    directional.position.set(4, 10, 2)
    scene.add(ambient, directional)

    const groundGeometry = new THREE.PlaneGeometry(20, 20)
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.05
    })
    const groundMesh = new THREE.Mesh(groundGeometry, groundMaterial)
    groundMesh.rotation.x = -Math.PI / 2
    groundMesh.position.y = 0
    scene.add(groundMesh)

    const world = new CANNON.World({
      gravity: new CANNON.Vec3(0, GRAVITY, 0)
    })
    world.allowSleep = true
    worldRef.current = world

    const diceMaterial = new CANNON.Material('dice')
    const groundPhysMaterial = new CANNON.Material('ground')
    const contactMaterial = new CANNON.ContactMaterial(diceMaterial, groundPhysMaterial, {
      friction: 0.35,
      restitution: 0.18
    })
    world.defaultContactMaterial = contactMaterial
    world.addContactMaterial(contactMaterial)

    const groundBody = new CANNON.Body({
      mass: 0,
      shape: new CANNON.Plane(),
      material: groundPhysMaterial
    })
    groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0)
    world.addBody(groundBody)

    const geometry = new THREE.BoxGeometry(DICE_SIZE, DICE_SIZE, DICE_SIZE)
    geometryRef.current = geometry

    const materials = createDiceMaterials()
    materialsRef.current = materials

    for (let i = 0; i < DICE_COUNT; i += 1) {
      const mesh = new THREE.Mesh(geometry, materials)
      mesh.visible = false
      scene.add(mesh)

      const body = new CANNON.Body({
        mass: 1,
        shape: new CANNON.Box(new CANNON.Vec3(DICE_SIZE / 2, DICE_SIZE / 2, DICE_SIZE / 2)),
        material: diceMaterial
      })
      body.linearDamping = 0.12
      body.angularDamping = 0.16
      body.allowSleep = true
      body.sleepSpeedLimit = 0.08
      body.sleepTimeLimit = 0.2
      world.addBody(body)

      diceRef.current.push({ mesh, body })
    }

    const syncWalls = (halfWidth, halfDepth) => {
      const worldInstance = worldRef.current
      if (!worldInstance) return

      wallBodiesRef.current.forEach((body) => worldInstance.removeBody(body))
      wallBodiesRef.current = []

      const halfWallHeight = WALL_HEIGHT / 2
      const wallX = halfWidth + WALL_THICKNESS
      const wallZ = halfDepth + WALL_THICKNESS

      const wallShapeZ = new CANNON.Box(new CANNON.Vec3(halfWidth + WALL_THICKNESS, halfWallHeight, WALL_THICKNESS))
      const wallShapeX = new CANNON.Box(new CANNON.Vec3(WALL_THICKNESS, halfWallHeight, halfDepth + WALL_THICKNESS))

      const wallConfigs = [
        { shape: wallShapeZ, position: new CANNON.Vec3(0, halfWallHeight, wallZ) },
        { shape: wallShapeZ, position: new CANNON.Vec3(0, halfWallHeight, -wallZ) },
        { shape: wallShapeX, position: new CANNON.Vec3(wallX, halfWallHeight, 0) },
        { shape: wallShapeX, position: new CANNON.Vec3(-wallX, halfWallHeight, 0) }
      ]

      wallConfigs.forEach(({ shape, position }) => {
        const wall = new CANNON.Body({
          mass: 0,
          shape,
          material: groundPhysMaterial
        })
        wall.position.copy(position)
        worldInstance.addBody(wall)
        wallBodiesRef.current.push(wall)
      })
    }

    const handleResize = () => {
      const { width, height } = container.getBoundingClientRect()
      if (!width || !height) return
      renderer.setSize(width, height, false)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

      const aspect = width / height
      const halfHeight = VIEW_SIZE / 2
      const halfWidth = (VIEW_SIZE * aspect) / 2
      boundsRef.current = { halfWidth, halfDepth: halfHeight }

      camera.left = -halfWidth
      camera.right = halfWidth
      camera.top = halfHeight
      camera.bottom = -halfHeight
      camera.updateProjectionMatrix()

      syncWalls(halfWidth, halfHeight)
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    setIsReady(true)

    return () => {
      setIsReady(false)
      window.removeEventListener('resize', handleResize)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      diceRef.current = []
      wallBodiesRef.current.forEach((body) => world.removeBody(body))
      wallBodiesRef.current = []
      materialsRef.current.forEach((material) => {
        material.map?.dispose()
        material.dispose()
      })
      geometry.dispose()
      groundGeometry.dispose()
      groundMaterial.dispose()
      renderer.dispose()
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement)
      }
    }
  }, [])

  useEffect(() => {
    if (!rollId || !isReady) return
    if (!worldRef.current) return

    const materials = materialsRef.current
    materials.forEach((material) => {
      material.opacity = 1
    })

    const { halfWidth, halfDepth } = boundsRef.current
    const margin = DICE_SIZE * 1.2

    diceRef.current.forEach(({ mesh, body }, index) => {
      const x = randomInRange(-halfWidth + margin, halfWidth - margin)
      const z = randomInRange(-halfDepth + margin, halfDepth - margin)
      const y = DICE_SIZE * 3 + index * 0.4

      body.position.set(x, y, z)
      body.velocity.set(
        randomInRange(-6, 6),
        randomInRange(2.4, 5),
        randomInRange(-6, 6)
      )
      body.angularVelocity.set(
        randomInRange(-12, 12),
        randomInRange(-12, 12),
        randomInRange(-12, 12)
      )
      body.quaternion.setFromEuler(
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2
      )
      body.wakeUp()

      mesh.visible = true
      mesh.position.set(x, y, z)
      mesh.quaternion.set(
        body.quaternion.x,
        body.quaternion.y,
        body.quaternion.z,
        body.quaternion.w
      )
    })

    isRollingRef.current = true
    settledRef.current = false
    settledAtRef.current = 0
    fadeStartRef.current = 0
    settleFramesRef.current = 0
    lastTimeRef.current = null
    setIsVisible(true)
    onRollingChange?.(true)

    const animate = (time) => {
      if (!isRollingRef.current) return
      if (!rendererRef.current || !sceneRef.current || !cameraRef.current || !worldRef.current) return

      const lastTime = lastTimeRef.current ?? time
      const delta = Math.min((time - lastTime) / 1000, MAX_DELTA)
      lastTimeRef.current = time

      worldRef.current.step(1 / 60, delta * SIM_SPEED, 3)

      let isMoving = false
      diceRef.current.forEach(({ mesh, body }) => {
        mesh.position.set(body.position.x, body.position.y, body.position.z)
        mesh.quaternion.set(body.quaternion.x, body.quaternion.y, body.quaternion.z, body.quaternion.w)

        if (
          body.velocity.lengthSquared() > LINEAR_THRESHOLD * LINEAR_THRESHOLD ||
          body.angularVelocity.lengthSquared() > ANGULAR_THRESHOLD * ANGULAR_THRESHOLD
        ) {
          isMoving = true
        }
      })

      if (!settledRef.current) {
        if (isMoving) {
          settleFramesRef.current = 0
        } else {
          settleFramesRef.current += 1
          if (settleFramesRef.current >= SETTLE_FRAMES) {
            settledRef.current = true
            settledAtRef.current = time
          }
        }
      }

      if (settledRef.current) {
        const sinceSettled = time - settledAtRef.current
        if (sinceSettled >= FADE_DELAY_MS && !fadeStartRef.current) {
          fadeStartRef.current = time
        }

        if (fadeStartRef.current) {
          const fadeProgress = Math.min((time - fadeStartRef.current) / FADE_DURATION_MS, 1)
          const opacity = Math.max(1 - fadeProgress, 0)
          materials.forEach((material) => {
            material.opacity = opacity
          })

          if (fadeProgress >= 1) {
            diceRef.current.forEach(({ mesh, body }) => {
              mesh.visible = false
              body.sleep()
            })
            isRollingRef.current = false
            setIsVisible(false)
            onRollingChange?.(false)
            return
          }
        }
      }

      rendererRef.current.render(sceneRef.current, cameraRef.current)
      animationRef.current = requestAnimationFrame(animate)
    }

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }
    animationRef.current = requestAnimationFrame(animate)
  }, [rollId, onRollingChange])

  return (
    <div className={`fate-dice-roller ${isVisible ? 'is-visible' : ''}`} aria-hidden="true">
      <div className="fate-dice-stage" ref={containerRef} />
    </div>
  )
}

export default FateDiceRoller
