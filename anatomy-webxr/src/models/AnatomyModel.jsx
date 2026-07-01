import { useRef, useState, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { motion } from 'framer-motion-3d'
import * as THREE from 'three'

// Preload GLB models at the module level for optimal network performance
useGLTF.preload('/models/skeleton.glb')
useGLTF.preload('/models/muscle.glb')
useGLTF.preload('/models/body.glb')

export default function AnatomyModel({ setSelectedOrgan, isExploded = false, setIsExploded, ...props }) {
  const [hoveredOrgan, setHoveredOrgan] = useState(null)

  const heartRef = useRef()
  const leftLungRef = useRef()
  const rightLungRef = useRef()
  const brainRef = useRef()
  const spineRef = useRef()
  const bodyGroupRef = useRef() // Structural group ref for offsets

  // Load the GLTF models
  const { scene: skeletonScene } = useGLTF('/models/skeleton.glb')
  const { scene: muscleScene } = useGLTF('/models/muscle.glb')
  const { scene: bodyScene } = useGLTF('/models/body.glb')

  // Clone scenes for independent instance rendering and configure custom transparency/materials
  const { skeletonCloned, muscleCloned, bodyCloned } = useMemo(() => {
    const skeleton = skeletonScene.clone()
    const muscle = muscleScene.clone()

    const body = bodyScene.clone()
    body.traverse((child) => {
      if (child.isMesh) {
        child.material = child.material.clone()
        child.material.transparent = true
        child.material.opacity = 0.85
        child.material.depthWrite = false
      }
    })

    return {
      skeletonCloned: skeleton,
      muscleCloned: muscle,
      bodyCloned: body
    }
  }, [skeletonScene, muscleScene, bodyScene])

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

  return (
    /*
      GLOBAL SCALING: Adjust scale array below if the model needs manual calibration.
      Default is set to [0.2, 0.2, 0.2] to fit nicely on a mobile screen.
    */
    <group {...props} scale={[0.05, 0.05, 0.05]}>
      <group ref={spineRef}>
        {/*
          bodyGroupRef containing all three models and the interactive organs.
        */}
        <group ref={bodyGroupRef}>

          {/*
            SKELETON LAYER
            Use scale, position, and rotation below for manual calibration.
            Visible only when isExploded is true.
            CALIBRATION: Adjust the middle value (Y-axis) in position below to lift the model higher or lower on the floor.
          */}
          <motion.group
            visible={isExploded}
            position={[0, 0.5, 0]}
            animate={{ x: isExploded ? -0.3 : 0 }}
            transition={{ type: 'spring', stiffness: 100, damping: 15 }}
          >
            <primitive
              object={skeletonCloned}
              scale={[1.2, 1.2, 1.2]}
              position={[-8, 0, 0]}
            />
          </motion.group>

          {/*
            MUSCLE LAYER
            Use scale, position, and rotation below for manual calibration.
            Visible only when isExploded is true.
            Interactive organ meshes are nested here to translate along with the muscle.
            CALIBRATION: Adjust the middle value (Y-axis) in position below to lift the model higher or lower on the floor.
          */}
          <motion.group
            visible={isExploded}
            position={[0, 0.5, 0]}
            animate={{ x: isExploded ? 0.3 : 0 }}
            transition={{ type: 'spring', stiffness: 100, damping: 15 }}
          >
            <primitive
              object={muscleCloned}
              scale={[680, 680, 680]}
              position={[8, 0, 0]}
            />

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
          </motion.group>

          {/*
            BODY/SKIN LAYER
            Use scale, position, and rotation below for manual calibration.
            Visible initially, disappears once isExploded is true.
            Separation is now managed entirely by the top-level UI button.
          */}
          <motion.group
            visible={!isExploded}
            transition={{ type: 'spring', stiffness: 100, damping: 15 }}
          >
            <primitive
              object={bodyCloned}
              scale={[0.1, 0.1, 0.1]}
              position={[0, 0, 0]}
            />
          </motion.group>

          {/* Sleek support base (virtual stand) */}
          <mesh position={[0, -0.15, 0]}>
            <cylinderGeometry args={[0.1, 0.1, 0.02, 32]} />
            <meshStandardMaterial color="#1e293b" roughness={0.4} metalness={0.7} />
          </mesh>
          <mesh position={[0, -0.11, 0]}>
            <cylinderGeometry args={[0.015, 0.015, 0.06, 16]} />
            <meshStandardMaterial color="#475569" roughness={0.3} metalness={0.8} />
          </mesh>
        </group>
      </group>
    </group>
  )
}



