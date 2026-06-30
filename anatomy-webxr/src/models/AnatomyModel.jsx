import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function AnatomyModel({ setSelectedOrgan, ...props }) {
  const [hoveredOrgan, setHoveredOrgan] = useState(null)
  
  const heartRef = useRef()
  const leftLungRef = useRef()
  const rightLungRef = useRef()
  const brainRef = useRef()
  const spineRef = useRef()
  const bodyGroupRef = useRef() // Structural group ref for rotation and offsets

  // Drag rotation state trackers
  const dragPlane = useRef(new THREE.Plane())
  const intersectPoint = useRef(new THREE.Vector3())
  const worldPos = useRef(new THREE.Vector3())
  const isDragging = useRef(false)
  const initialAngle = useRef(0)
  const initialRotationY = useRef(0)

  // Run real-time micro-animations for the organs
  useFrame((state) => {
    const t = state.clock.getElapsedTime()

    // 1. Heart Beating (Rhythmic double-pulse animation)
    const heartCycle = (t * 1.8) % Math.PI
    const beat = Math.pow(Math.sin(heartCycle), 10) * 0.12 + Math.pow(Math.sin(heartCycle + 0.25), 10) * 0.06
    const heartScale = 1.0 + beat
    if (heartRef.current) {
      heartRef.current.scale.set(heartScale, heartScale, heartScale)
    }

    // 2. Lungs Breathing (Slow expansion and contraction)
    const breathY = 1.0 + Math.sin(t * 1.2) * 0.04
    const breathXZ = 1.0 + Math.sin(t * 1.2) * 0.02
    if (leftLungRef.current) {
      leftLungRef.current.scale.set(breathXZ, breathY, breathXZ)
    }
    if (rightLungRef.current) {
      rightLungRef.current.scale.set(breathXZ, breathY, breathXZ)
    }

    // 3. Brain Pulsing (Subtle high-frequency cognitive wave)
    const brainScale = 1.0 + Math.sin(t * 3.5) * 0.015
    if (brainRef.current) {
      brainRef.current.scale.set(brainScale, brainScale, brainScale)
    }

    // Spine/Torso drift (subtle idle animation)
    if (spineRef.current) {
      spineRef.current.position.y = Math.sin(t * 0.8) * 0.01
    }
  })

  // Common handler to manage hovers
  const handlePointerOver = (e, organ) => {
    e.stopPropagation()
    document.body.style.cursor = 'pointer'
    setHoveredOrgan(organ)
  }

  const handlePointerOut = () => {
    document.body.style.cursor = 'default'
    setHoveredOrgan(null)
  }

  // Pointer event handlers for the rotation ring
  const handleRingDown = (e) => {
    e.stopPropagation()
    e.target.setPointerCapture(e.pointerId)
    isDragging.current = true

    // Retrieve the world position of the body group center
    if (bodyGroupRef.current) {
      bodyGroupRef.current.getWorldPosition(worldPos.current)
    }

    // Setup virtual horizontal intersection plane at the base height
    dragPlane.current.setFromNormalAndCoplanarPoint(
      new THREE.Vector3(0, 1, 0),
      worldPos.current
    )

    // Calculate initial angle of interaction relative to the model center
    initialAngle.current = Math.atan2(
      e.point.x - worldPos.current.x,
      e.point.z - worldPos.current.z
    )
    initialRotationY.current = bodyGroupRef.current.rotation.y
  }

  const handleRingMove = (e) => {
    if (!isDragging.current) return
    e.stopPropagation()

    // Intersect the controller/pointer ray with our virtual plane
    e.raycaster.ray.intersectPlane(dragPlane.current, intersectPoint.current)

    // Calculate new angle in the XZ plane relative to the model center
    const currentAngle = Math.atan2(
      intersectPoint.current.x - worldPos.current.x,
      intersectPoint.current.z - worldPos.current.z
    )

    // Apply rotation update on Y-axis
    const deltaAngle = currentAngle - initialAngle.current
    if (bodyGroupRef.current) {
      bodyGroupRef.current.rotation.y = initialRotationY.current + deltaAngle
    }
  }

  const handleRingUp = (e) => {
    if (isDragging.current) {
      e.stopPropagation()
      e.target.releasePointerCapture(e.pointerId)
      isDragging.current = false
    }
  }

  return (
    <group {...props}>
      <group ref={spineRef}>
        {/*
          Architectural preparation for "Exploded View":
          This bodyGroup group container acts as the root for our anatomical sub-layers
          (Skeleton, Muscle, Organs, Skin). During the exploded view mode (isExploded = true),
          we will programmatically offset the individual children groups (Skeleton, Organs, Skin)
          radially or along the Z/Y axes using refs to separate them for inspection.
        */}
        <group ref={bodyGroupRef}>
          {/* Outer Torso Glass Shell */}
          <mesh position={[0, 0.12, 0]}>
            <cylinderGeometry args={[0.16, 0.11, 0.44, 32, 1, true]} />
            <meshPhysicalMaterial
              color="#e2e8f0"
              transparent={true}
              opacity={0.3}
              roughness={0.1}
              transmission={0.6}
              thickness={0.5}
              side={THREE.DoubleSide}
              depthWrite={false}
            />
          </mesh>

          {/* Outer Head Glass Shell */}
          <mesh position={[0, 0.42, 0]}>
            <sphereGeometry args={[0.11, 32, 32]} />
            <meshPhysicalMaterial
              color="#e2e8f0"
              transparent={true}
              opacity={0.3}
              roughness={0.15}
              transmission={0.6}
              thickness={0.3}
              side={THREE.DoubleSide}
              depthWrite={false}
            />
          </mesh>

          {/* Neck connector */}
          <mesh position={[0, 0.32, 0]}>
            <cylinderGeometry args={[0.045, 0.05, 0.06, 16]} />
            <meshStandardMaterial color="#334155" roughness={0.5} metalness={0.1} />
          </mesh>

          {/* Spine skeleton pole (central support rod) */}
          <mesh position={[0, 0.12, -0.05]}>
            <cylinderGeometry args={[0.015, 0.015, 0.48, 16]} />
            <meshStandardMaterial color="#475569" roughness={0.3} metalness={0.8} />
          </mesh>

          {/* Rib Cage Rings (stylized design lines) */}
          {[0.0, 0.08, 0.16, 0.24].map((yOffset, i) => (
            <mesh key={i} position={[0, yOffset, 0]} rotation={[0.05, 0, 0]}>
              <torusGeometry args={[0.13 - i * 0.005, 0.006, 8, 32]} />
              <meshStandardMaterial color="#94a3b8" roughness={0.4} metalness={0.5} />
            </mesh>
          ))}

          {/* Heart Mesh */}
          <mesh
            ref={heartRef}
            position={[-0.03, 0.12, 0.04]}
            onClick={(e) => {
              e.stopPropagation()
              setSelectedOrgan('heart')
            }}
            onPointerOver={(e) => handlePointerOver(e, 'heart')}
            onPointerOut={handlePointerOut}
          >
            <boxGeometry args={[0.05, 0.05, 0.05]} />
            <meshStandardMaterial
              color="#ff453a"
              emissive="#ff453a"
              emissiveIntensity={hoveredOrgan === 'heart' ? 0.6 : 0.2}
              roughness={0.2}
            />
          </mesh>

          {/* Left Lung Mesh */}
          <mesh
            ref={leftLungRef}
            position={[-0.06, 0.14, 0.01]}
            onClick={(e) => {
              e.stopPropagation()
              setSelectedOrgan('lungs')
            }}
            onPointerOver={(e) => handlePointerOver(e, 'lungs')}
            onPointerOut={handlePointerOut}
          >
            <sphereGeometry args={[0.04, 32, 32]} />
            <meshStandardMaterial
              color="#ff2d55"
              emissive="#ff2d55"
              emissiveIntensity={hoveredOrgan === 'lungs' ? 0.5 : 0.1}
              roughness={0.4}
            />
          </mesh>

          {/* Right Lung Mesh */}
          <mesh
            ref={rightLungRef}
            position={[0.06, 0.14, 0.01]}
            onClick={(e) => {
              e.stopPropagation()
              setSelectedOrgan('lungs')
            }}
            onPointerOver={(e) => handlePointerOver(e, 'lungs')}
            onPointerOut={handlePointerOut}
          >
            <sphereGeometry args={[0.04, 32, 32]} />
            <meshStandardMaterial
              color="#ff2d55"
              emissive="#ff2d55"
              emissiveIntensity={hoveredOrgan === 'lungs' ? 0.5 : 0.1}
              roughness={0.4}
            />
          </mesh>

          {/* Brain Mesh */}
          <group
            ref={brainRef}
            position={[0, 0.43, 0]}
            onClick={(e) => {
              e.stopPropagation()
              setSelectedOrgan('brain')
            }}
            onPointerOver={(e) => handlePointerOver(e, 'brain')}
            onPointerOut={handlePointerOut}
          >
            {/* Main brain mass */}
            <mesh>
              <sphereGeometry args={[0.075, 16, 16]} />
              <meshStandardMaterial
                color="#bf5af2"
                emissive="#bf5af2"
                emissiveIntensity={hoveredOrgan === 'brain' ? 0.5 : 0.1}
                roughness={0.5}
                wireframe
              />
            </mesh>
            <mesh scale={[1.05, 0.9, 1.25]}>
              <sphereGeometry args={[0.07, 32, 32]} />
              <meshStandardMaterial
                color="#bf5af2"
                emissive="#bf5af2"
                emissiveIntensity={hoveredOrgan === 'brain' ? 0.4 : 0.08}
                roughness={0.3}
              />
            </mesh>
          </group>

          {/* Sleek support base (virtual stand) */}
          <mesh position={[0, -0.15, 0]}>
            <cylinderGeometry args={[0.1, 0.1, 0.02, 32]} />
            <meshStandardMaterial color="#1e293b" roughness={0.4} metalness={0.7} />
          </mesh>
          <mesh position={[0, -0.11, 0]}>
            <cylinderGeometry args={[0.015, 0.015, 0.06, 16]} />
            <meshStandardMaterial color="#475569" roughness={0.3} metalness={0.8} />
          </mesh>

          {/* Styled Rotation Ring at the base of the virtual stand */}
          <mesh
            position={[0, -0.15, 0]}
            rotation={[-Math.PI / 2, 0, 0]}
            onPointerDown={handleRingDown}
            onPointerMove={handleRingMove}
            onPointerUp={handleRingUp}
            onPointerLeave={handleRingUp}
          >
            <torusGeometry args={[0.15, 0.008, 16, 64]} />
            <meshBasicMaterial
              color="#0a84ff"
              transparent
              opacity={0.6}
              depthWrite={false}
            />
          </mesh>
        </group>
      </group>
    </group>
  )
}
