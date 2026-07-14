import { useCallback, useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { useCategory, type CategoryKey } from '../../context/CategoryContext'
import { categoryFromProgress, photos, progressForCategory } from '../../data/photos'
import ClockMenu from '../ClockMenu/ClockMenu'
import { useSectionScrollLock } from '../ProductShowcase/useSectionScrollLock'
import styles from './Gallery.module.css'

/**
 * Photo page — faithful WebGL rebuild of meech213.com/photo.
 *
 * The original is a Three.js scene: a ring ("dome") of image planes that a
 * camera orbits through, with a per-vertex curve warp and momentum scrolling.
 * Every constant below is lifted verbatim from the original bundle
 * (meech213.tbpdev.com/main.js) so the geometry and feel match.
 */

// --- Scene config (static class fields in the original) ---
const VISIBLE_COUNT = 12
const REASSIGN_COUNT = 4
const SAFE_VISIBLE_COUNT = VISIBLE_COUNT - REASSIGN_COUNT // 8
const DOME_RADIUS = 15.2
const HORIZONTAL_RING_RADIUS = DOME_RADIUS * 0.95 // 14.44
const PLANE_HEIGHT = 8.1
const MAX_PLANE_WIDTH = 9.9
const MIN_PLANE_WIDTH = 5.6
const COLLISION_SCALE = 0.94
const THETA_OFFSET = 0
const PLANE_SEGMENTS = 16
const FULL_CIRCLE = Math.PI * 2
const CAMERA_FOV = 60

// --- deform (per-vertex warp + orbit response) ---
const D_WHEEL_FACTOR = 0.5
const D_WHEEL_DIRECTION = -1
const D_CURVE_FREQUENCY = 0.18
const D_CURVE_STRENGTH = 0.11
const D_DEPTH_CURVE_STRENGTH = 0.05
const D_ORBIT_SENSITIVITY = 0.253

// --- scroll-driven orbit ---
// The dome is pinned (sticky) inside a tall track. Vertical page-scroll through
// that track maps to sideways rotation of the dome: scroll down → orbit around.
// This turns "up/down" wheel-scroll into "side to side" for the middle section,
// while the page still scrolls normally past it to the footer.
const SCROLL_SPAN = Math.PI * 3 // total orbit swept across the pinned section
const ORBIT_SMOOTH = 0.12 // easing toward the scroll target each frame
const SCROLL_WHEEL_FACTOR = 0.0014
const AUTOPLAY_SPEED = 0.000055

// --- drag model (optional manual nudge, layered on top of scroll) ---
const DRAG_SCALE = 0.9
const VELOCITY_DECAY = 0.92
const MAX_VELOCITY = 180
const DRAG_THRESHOLD = 6
const CLICK_SUPPRESS_MS = 250

const mod = (n: number, m: number) => ((n % m) + m) % m

// recycleOrder = ceil((PI*1.5)/step) % COUNT, then [t, t+1, …] mod COUNT
const STEP = FULL_CIRCLE / VISIBLE_COUNT
const RECYCLE_START = Math.ceil((Math.PI * 1.5) / STEP) % VISIBLE_COUNT // 9
const RECYCLE_ORDER = Array.from({ length: VISIBLE_COUNT }, (_, n) => (RECYCLE_START + n) % VISIBLE_COUNT)

// Fixed positions of the 12 slots. The real meech213 gallery is a SINGLE
// horizontal ring (a cylinder viewed from its centre), not a stacked dome — the
// images sit in one upright band and the camera rotates sideways through them.
function buildDomePositions() {
  const out: { x: number; y: number; z: number }[] = []
  for (let e = 0; e < VISIBLE_COUNT; e++) {
    const t = THETA_OFFSET + (e / VISIBLE_COUNT) * FULL_CIRCLE
    const x = HORIZONTAL_RING_RADIUS * Math.cos(t)
    const y = 0 // one level band — no vertical spread
    const z = HORIZONTAL_RING_RADIUS * Math.sin(t)
    out.push({ x, y, z })
  }
  return out
}

function planeSize(aspect: number) {
  const w = Math.max(MIN_PLANE_WIDTH, Math.min(MAX_PLANE_WIDTH, PLANE_HEIGHT * aspect)) * COLLISION_SCALE
  const h = PLANE_HEIGHT * COLLISION_SCALE
  return { w, h }
}

export default function DomeGallery() {
  const { categoryKey, setCategoryKey } = useCategory()
  const mountRef = useRef<HTMLDivElement>(null)
  const sectionRef = useRef<HTMLElement>(null)
  const progressTarget = useRef(0)
  const orbitAngleRef = useRef(0)
  const dragAngleRef = useRef(0)
  const dragVelRef = useRef(0)
  const syncingFromDomeRef = useRef(false)
  const lastSyncedKeyRef = useRef<CategoryKey>(categoryKey)
  const setCategoryKeyRef = useRef(setCategoryKey)
  const [galleryProgress, setGalleryProgress] = useState(0)

  useEffect(() => {
    setCategoryKeyRef.current = setCategoryKey
  }, [setCategoryKey])

  const onDelta = useCallback((dy: number) => {
    progressTarget.current = Math.min(
      1,
      Math.max(0, progressTarget.current + dy * SCROLL_WHEEL_FACTOR)
    )
  }, [])

  const getProgress = useCallback(
    () => ({
      progress: Math.min(1, Math.max(0, orbitAngleRef.current / SCROLL_SPAN)),
      max: 1,
    }),
    []
  )

  useSectionScrollLock({
    sectionRef,
    onDelta,
    getProgress,
    enabled: true,
  })

  const jumpToCategory = useCallback((key: string) => {
    const p = progressForCategory(key)
    progressTarget.current = p
    dragAngleRef.current = 0
    dragVelRef.current = 0
    orbitAngleRef.current = p * SCROLL_SPAN
    setGalleryProgress(p)
    lastSyncedKeyRef.current = key as CategoryKey
  }, [])

  useEffect(() => {
    if (syncingFromDomeRef.current) {
      syncingFromDomeRef.current = false
      return
    }
    if (categoryKey === lastSyncedKeyRef.current) return
    jumpToCategory(categoryKey)
  }, [categoryKey, jumpToCategory])

  const absorbDragIntoProgress = () => {
    const total = progressTarget.current * SCROLL_SPAN + dragAngleRef.current
    progressTarget.current = Math.min(1, Math.max(0, total / SCROLL_SPAN))
    dragAngleRef.current = 0
    dragVelRef.current = 0
    orbitAngleRef.current = progressTarget.current * SCROLL_SPAN
  }

  useEffect(() => {
    const mount = mountRef.current
    const section = sectionRef.current
    if (!mount || !section) return

    const domePositions = buildDomePositions()

    // --- renderer / scene / camera ---
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(mount.clientWidth, mount.clientHeight)
    mount.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(CAMERA_FOV, mount.clientWidth / mount.clientHeight, 0.1, 100)
    camera.position.set(0, 0, 0)

    // --- texture cache ---
    const loader = new THREE.TextureLoader()
    const texCache = new Map<string, Promise<THREE.Texture>>()
    const loadTexture = (src: string) => {
      let p = texCache.get(src)
      if (!p) {
        p = new Promise<THREE.Texture>((resolve, reject) => {
          loader.load(
            src,
            (tex) => {
              tex.colorSpace = THREE.SRGBColorSpace
              resolve(tex)
            },
            undefined,
            reject
          )
        })
        texCache.set(src, p)
      }
      return p
    }

    // --- planes ---
    type PlaneUser = {
      slotIndex: number
      base: Float32Array
      currentImageIndex: number
      wasVisible: boolean
      op: number
    }
    const planes: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>[] = []

    const setGeometry = (mesh: (typeof planes)[number], w: number, h: number) => {
      const g = new THREE.PlaneGeometry(w, h, PLANE_SEGMENTS, PLANE_SEGMENTS)
      mesh.geometry.dispose()
      mesh.geometry = g
      ;(mesh.userData as PlaneUser).base = Float32Array.from(g.attributes.position.array as Float32Array)
    }

    let nextImageIndex = VISIBLE_COUNT
    const assignImage = (mesh: (typeof planes)[number], rawIdx: number) => {
      const idx = mod(rawIdx, photos.length)
      const u = mesh.userData as PlaneUser
      u.currentImageIndex = idx
      u.op = 0 // fade the fresh image in
      loadTexture(photos[idx].src).then((tex) => {
        if (u.currentImageIndex !== idx) return // superseded by a newer assign
        const img = tex.image as HTMLImageElement
        const { w, h } = planeSize(img.width / img.height)
        setGeometry(mesh, w, h)
        mesh.material.map = tex
        mesh.material.needsUpdate = true
      })
    }

    for (let e = 0; e < VISIBLE_COUNT; e++) {
      const { w, h } = planeSize(PLANE_HEIGHT / PLANE_HEIGHT) // placeholder square until texture loads
      const geo = new THREE.PlaneGeometry(w, h, PLANE_SEGMENTS, PLANE_SEGMENTS)
      const mat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, side: THREE.DoubleSide })
      const mesh = new THREE.Mesh(geo, mat)
      const n = domePositions[e]
      mesh.position.set(n.x, n.y, n.z)
      mesh.lookAt(0, 0, 0)
      mesh.frustumCulled = false
      mesh.userData = {
        slotIndex: e,
        base: Float32Array.from(geo.attributes.position.array as Float32Array),
        currentImageIndex: e,
        wasVisible: true,
        op: 0,
      } as PlaneUser
      scene.add(mesh)
      planes.push(mesh)
      assignImage(mesh, e)
    }

    // --- recycling: swap textures on planes that pass behind the camera ---
    const getSafeSet = (angle: number) => {
      const r = DOME_RADIUS * 0.9 * Math.sin(angle)
      const i = DOME_RADIUS * 0.9 * Math.cos(angle)
      const ranked = domePositions.map((p, slotIndex) => ({
        slotIndex,
        dot: p.x * r + p.y * -4 + p.z * i,
      }))
      ranked.sort((a, b) => b.dot - a.dot)
      return new Set(ranked.slice(0, SAFE_VISIBLE_COUNT).map((e) => e.slotIndex))
    }
    const recycleSlots = (angle: number) => {
      const wentHidden: number[] = []
      const safe = getSafeSet(angle)
      for (let e = 0; e < VISIBLE_COUNT; e++) {
        const u = planes[e].userData as PlaneUser
        const visible = safe.has(e)
        if (u.wasVisible && !visible) wentHidden.push(e)
        u.wasVisible = visible
      }
      if (!wentHidden.length) return
      const hidden = new Set(wentHidden)
      let count = 0
      for (const e of RECYCLE_ORDER) {
        if (hidden.has(e)) {
          assignImage(planes[e], nextImageIndex)
          nextImageIndex++
          if (++count >= REASSIGN_COUNT) break
        }
      }
    }

    // --- per-vertex warp (runs every frame per plane) ---
    const warp = (mesh: (typeof planes)[number], peel: number) => {
      const geo = mesh.geometry
      const posAttr = geo.attributes.position
      const uvAttr = geo.attributes.uv
      const pos = posAttr.array as Float32Array
      const uv = uvAttr.array as Float32Array
      const base = (mesh.userData as PlaneUser).base
      mesh.updateMatrixWorld(true)
      const m = mesh.matrixWorld.elements
      for (let v = 0; v < base.length / 3; v++) {
        const i3 = v * 3
        const i2 = v * 2
        const l = base[i3]
        const u = base[i3 + 1]
        const d = base[i3 + 2]
        const worldY = m[1] * l + m[5] * u + m[9] * d + m[13]
        pos[i3] = l + D_CURVE_STRENGTH * Math.cos(worldY * D_CURVE_FREQUENCY) - D_CURVE_STRENGTH
        pos[i3 + 1] = u + -Math.sin(uv[i2] * Math.PI) * peel
        pos[i3 + 2] = d - Math.abs(worldY) ** 1.25 * D_DEPTH_CURVE_STRENGTH
      }
      posAttr.needsUpdate = true
    }

    // orbitAngle: eased render angle (ref for clock sync + category jumps).
    let orbitAngle = orbitAngleRef.current
    const clamp = (v: number) => Math.max(-MAX_VELOCITY, Math.min(MAX_VELOCITY, v))

    const canvas = renderer.domElement
    let activePointerId: number | null = null
    let startX = 0
    let lastX = 0
    let didDrag = false
    let suppressClickUntil = 0
    const onPointerDown = (ev: PointerEvent) => {
      activePointerId = ev.pointerId
      startX = lastX = ev.clientX
      didDrag = false
      canvas.setPointerCapture(ev.pointerId)
    }
    const onPointerMove = (ev: PointerEvent) => {
      if (activePointerId === null || ev.pointerId !== activePointerId) return
      const dx = ev.clientX - lastX
      lastX = ev.clientX
      if (!didDrag && Math.abs(ev.clientX - startX) >= DRAG_THRESHOLD) {
        didDrag = true
        canvas.classList.add(styles.dragging)
      }
      if (!didDrag) return
      dragVelRef.current = clamp(dragVelRef.current - dx * DRAG_SCALE)
      dragAngleRef.current += -dx * 0.004 * D_ORBIT_SENSITIVITY
    }
    const endDrag = (ev: PointerEvent) => {
      if (activePointerId === null || ev.pointerId !== activePointerId) return
      if (didDrag) {
        suppressClickUntil = performance.now() + CLICK_SUPPRESS_MS
        canvas.classList.remove(styles.dragging)
        absorbDragIntoProgress()
      }
      canvas.releasePointerCapture?.(ev.pointerId)
      activePointerId = null
      didDrag = false
    }
    const onClickCapture = (ev: MouseEvent) => {
      if (performance.now() < suppressClickUntil) {
        ev.preventDefault()
        ev.stopPropagation()
      }
    }

    canvas.addEventListener('pointerdown', onPointerDown)
    canvas.addEventListener('pointermove', onPointerMove)
    canvas.addEventListener('pointerup', endDrag)
    canvas.addEventListener('pointercancel', endDrag)
    canvas.addEventListener('click', onClickCapture, true)

    const onResize = () => {
      const w = mount.clientWidth
      const h = mount.clientHeight
      renderer.setSize(w, h)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
    }
    window.addEventListener('resize', onResize)

    // --- render loop ---
    let raf = 0
    let syncTick = 0
    const tick = () => {
      dragVelRef.current *= VELOCITY_DECAY
      if (Math.abs(dragVelRef.current) < 0.02) dragVelRef.current = 0
      dragAngleRef.current +=
        dragVelRef.current * 0.005 * D_WHEEL_FACTOR * D_WHEEL_DIRECTION * D_ORBIT_SENSITIVITY

      if (progressTarget.current < 1) {
        progressTarget.current = Math.min(1, progressTarget.current + AUTOPLAY_SPEED)
      }

      const target = progressTarget.current * SCROLL_SPAN + dragAngleRef.current
      const step = (target - orbitAngle) * ORBIT_SMOOTH
      orbitAngle += step
      orbitAngleRef.current = orbitAngle
      const peel = step * 0.5

      syncTick += 1
      if (syncTick % 2 === 0) {
        const p = Math.min(1, Math.max(0, orbitAngle / SCROLL_SPAN))
        setGalleryProgress(p)
        const nextKey = categoryFromProgress(p)
        if (nextKey !== lastSyncedKeyRef.current) {
          lastSyncedKeyRef.current = nextKey
          syncingFromDomeRef.current = true
          setCategoryKeyRef.current(nextKey)
        }
      }

      camera.lookAt(DOME_RADIUS * 0.9 * Math.sin(orbitAngle), 0, DOME_RADIUS * 0.9 * Math.cos(orbitAngle))
      camera.updateMatrixWorld()

      recycleSlots(orbitAngle)

      for (const mesh of planes) {
        warp(mesh, peel)
        const u = mesh.userData as PlaneUser
        if (mesh.material.map) {
          u.op += (1 - u.op) * 0.08
          mesh.material.opacity = u.op
        }
      }

      renderer.render(scene, camera)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
      canvas.removeEventListener('pointerdown', onPointerDown)
      canvas.removeEventListener('pointermove', onPointerMove)
      canvas.removeEventListener('pointerup', endDrag)
      canvas.removeEventListener('pointercancel', endDrag)
      canvas.removeEventListener('click', onClickCapture, true)
      planes.forEach((m) => {
        m.geometry.dispose()
        m.material.map?.dispose()
        m.material.dispose()
      })
      renderer.dispose()
      if (canvas.parentNode === mount) mount.removeChild(canvas)
    }
  }, [])

  return (
    <section ref={sectionRef} className={styles.gallerySection} data-namespace="photos">
      <div className={styles.domeSticky}>
        <div ref={mountRef} className={styles.dome} />
        {/* Radial clock-menu, scoped to the dome section (ported from meech213) */}
        <div className={styles.clockDock}>
          <ClockMenu galleryProgress={galleryProgress} />
        </div>
      </div>
    </section>
  )
}
