import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import * as CANNON from 'cannon-es'
import { RoundedBoxGeometry } from 'three-stdlib'
import './FateDiceRoller.css'

const DICE_COUNT = 4
const DICE_SIZE = 0.5
const VIEW_SIZE = 7
const CAMERA_HEIGHT = 9
const GRAVITY = -16.2
const SIM_SPEED = 1.8
const LINEAR_THRESHOLD = 0.12
const ANGULAR_THRESHOLD = 0.18
const SETTLE_FRAMES = 18
const FADE_DURATION_MS = 700
const MAX_DELTA = 1 / 30
const WALL_HEIGHT = DICE_SIZE * 12
const WALL_THICKNESS = Math.max(DICE_SIZE * 1.2, 0.4)
const BOUNDS_PAD = DICE_SIZE * 0.7
const CHAMFER_SEGMENTS = 3
const CHAMFER_RADIUS = DICE_SIZE * 0.08
const FACE_SYMBOLS = ['plus', 'minus', 'blank', 'plus', 'minus', 'blank']
const FACE_NORMALS = [
  new THREE.Vector3(1, 0, 0),
  new THREE.Vector3(-1, 0, 0),
  new THREE.Vector3(0, 1, 0),
  new THREE.Vector3(0, -1, 0),
  new THREE.Vector3(0, 0, 1),
  new THREE.Vector3(0, 0, -1)
]
const SYMBOL_VALUES = {
  plus: 1,
  minus: -1,
  blank: 0
}

const createFaceTexture = (symbol, isDark) => {
  const canvas = document.createElement('canvas')
  const size = 256
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')

  const faceColor = isDark ? '#060c23' : '#dee1ed'
  const symbolColor = isDark ? '#dee1ed' : '#060c23'

  ctx.fillStyle = faceColor
  ctx.fillRect(0, 0, size, size)

  if (symbol !== 'blank') {
    ctx.strokeStyle = symbolColor
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

const createDiceMaterials = (isDark, opacity = 1) => {
  return FACE_SYMBOLS.map((symbol) => {
    const texture = createFaceTexture(symbol, isDark)
    return new THREE.MeshPhongMaterial({
      map: texture,
      shininess: isDark ? 90 : 25,
      specular: isDark ? 0x1a2650 : 0xf0f3ff,
      transparent: true,
      opacity
    })
  })
}

const randomInRange = (min, max) => min + Math.random() * (max - min)

const disposeMaterials = (materials) => {
  materials.forEach((material) => {
    material.map?.dispose()
    material.dispose()
  })
}

const canUseWebGL = () => {
  if (typeof window === 'undefined' || typeof document === 'undefined') return false
  if (!('HTMLCanvasElement' in window)) return false
  try {
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
    return Boolean(context)
  } catch (error) {
    return false
  }
}

const getDiceValue = (quaternion) => {
  const up = new THREE.Vector3(0, 1, 0)
  let bestIndex = 0
  let bestDot = -Infinity

  FACE_NORMALS.forEach((normal, index) => {
    const worldNormal = normal.clone().applyQuaternion(quaternion)
    const dot = worldNormal.dot(up)
    if (dot > bestDot) {
      bestDot = dot
      bestIndex = index
    }
  })

  const symbol = FACE_SYMBOLS[bestIndex]
  return SYMBOL_VALUES[symbol] ?? 0
}

function FateDiceRoller({
  rollId,
  onRollingChange,
  onResult,
  isDark = false,
  dismissId = 0
}) {
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
  const fadeStartRef = useRef(0)
  const fadeRequestedRef = useRef(false)
  const fadeRequestedAtRef = useRef(0)
  const resultSentRef = useRef(false)
  const isRollingRef = useRef(false)
  const boundsRef = useRef({ halfWidth: 4, halfDepth: 4 })
  const [isVisible, setIsVisible] = useState(false)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    if (!canUseWebGL()) return

    const scene = new THREE.Scene()
    sceneRef.current = scene

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setClearColor(0x000000, 0)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.VSMShadowMap
    rendererRef.current = renderer
    container.appendChild(renderer.domElement)

    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 50)
    camera.position.set(0, CAMERA_HEIGHT, 0)
    camera.up.set(0, 0, -1)
    camera.lookAt(0, 0, 0)
    cameraRef.current = camera

    const ambient = new THREE.AmbientLight(0xffffff, 0.25)

    // Main directional light at 45 degrees to the right
    const mainLight = new THREE.DirectionalLight(0xffffff, 0.8)
    mainLight.position.set(6, 8, 4)

    mainLight.castShadow = true
    mainLight.shadow.mapSize.width = 2048
    mainLight.shadow.mapSize.height = 2048
    mainLight.shadow.camera.left = -8
    mainLight.shadow.camera.right = 8
    mainLight.shadow.camera.top = 8
    mainLight.shadow.camera.bottom = -8
    mainLight.shadow.camera.near = 0.5
    mainLight.shadow.camera.far = 20
    mainLight.shadow.bias = -0.0001
    mainLight.shadow.radius = 4

    // Add a second light for fill and better highlights
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.3)
    fillLight.position.set(-3, 5, -2)

    scene.add(ambient, mainLight, fillLight)

    const groundGeometry = new THREE.PlaneGeometry(20, 20)
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.18
    })
    const groundMesh = new THREE.Mesh(groundGeometry, groundMaterial)
    groundMesh.rotation.x = -Math.PI / 2
    groundMesh.position.y = 0
    groundMesh.receiveShadow = true
    scene.add(groundMesh)

    const world = new CANNON.World({
      gravity: new CANNON.Vec3(0, GRAVITY, 0)
    })
    world.allowSleep = true
    world.broadphase = new CANNON.SAPBroadphase(world)
    world.solver.iterations = 8
    worldRef.current = world

    const diceMaterial = new CANNON.Material('dice')
    const groundPhysMaterial = new CANNON.Material('ground')
    const contactMaterial = new CANNON.ContactMaterial(diceMaterial, groundPhysMaterial, {
      friction: 0.35,
      restitution: 0.18
    })
    world.defaultContactMaterial = contactMaterial
    world.addContactMaterial(contactMaterial)

    const diceContactMaterial = new CANNON.ContactMaterial(diceMaterial, diceMaterial, {
      friction: 0.2,
      restitution: 0.45
    })
    world.addContactMaterial(diceContactMaterial)

    const groundBody = new CANNON.Body({
      mass: 0,
      shape: new CANNON.Plane(),
      material: groundPhysMaterial
    })
    groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0)
    world.addBody(groundBody)

    const geometry = new RoundedBoxGeometry(DICE_SIZE, DICE_SIZE, DICE_SIZE, CHAMFER_SEGMENTS, CHAMFER_RADIUS)
    geometryRef.current = geometry

    const materials = createDiceMaterials(isDark)
    materialsRef.current = materials

    for (let i = 0; i < DICE_COUNT; i += 1) {
      const mesh = new THREE.Mesh(geometry, materials)
      mesh.visible = false
      mesh.castShadow = true
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
      disposeMaterials(materialsRef.current)
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
    if (!isReady || materialsRef.current.length === 0) return
    const currentOpacity = materialsRef.current[0]?.opacity ?? 1
    const nextMaterials = createDiceMaterials(isDark, currentOpacity)
    disposeMaterials(materialsRef.current)
    materialsRef.current = nextMaterials

    diceRef.current.forEach(({ mesh }) => {
      mesh.material = nextMaterials
    })
  }, [isDark, isReady])

  useEffect(() => {
    if (!dismissId) return
    if (!isRollingRef.current || !settledRef.current) return
    fadeRequestedRef.current = true
    fadeRequestedAtRef.current = performance.now()
  }, [dismissId])

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
      const y = DICE_SIZE * 8 + index * 0.5

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
    fadeStartRef.current = 0
    fadeRequestedRef.current = false
    fadeRequestedAtRef.current = 0
    resultSentRef.current = false
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

      worldRef.current.step(1 / 60, delta * SIM_SPEED, 6)

      let isMoving = false
      const { halfWidth, halfDepth } = boundsRef.current
      const limitX = halfWidth - BOUNDS_PAD
      const limitZ = halfDepth - BOUNDS_PAD

      diceRef.current.forEach(({ mesh, body }) => {
        if (body.position.x > limitX) {
          body.position.x = limitX
          if (body.velocity.x > 0) body.velocity.x *= -0.5
        } else if (body.position.x < -limitX) {
          body.position.x = -limitX
          if (body.velocity.x < 0) body.velocity.x *= -0.5
        }

        if (body.position.z > limitZ) {
          body.position.z = limitZ
          if (body.velocity.z > 0) body.velocity.z *= -0.5
        } else if (body.position.z < -limitZ) {
          body.position.z = -limitZ
          if (body.velocity.z < 0) body.velocity.z *= -0.5
        }

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
            if (!resultSentRef.current) {
              const total = diceRef.current.reduce((sum, { mesh }) => {
                return sum + getDiceValue(mesh.quaternion)
              }, 0)
              resultSentRef.current = true
              onResult?.(total)
            }
          }
        }
      }

      if (settledRef.current) {
        if (fadeRequestedRef.current && !fadeStartRef.current) {
          fadeStartRef.current = fadeRequestedAtRef.current || time
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
  }, [rollId, onRollingChange, onResult])

  return (
    <div className={`fate-dice-roller ${isVisible ? 'is-visible' : ''}`} aria-hidden="true">
      <div className="fate-dice-stage" ref={containerRef} />
    </div>
  )
}

export default FateDiceRoller
