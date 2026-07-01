import { useRef, useState, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { motion } from 'framer-motion-3d'
import * as THREE from 'three'

// Preload GLB models at the module level for optimal network performance
useGLTF.preload('/models/skeleton.glb')
useGLTF.preload('/models/muscle.glb')
useGLTF.preload('/models/body.glb')
useGLTF.preload('/models/heart.glb')
useGLTF.preload('/models/brain.glb')
useGLTF.preload('/models/lungs.glb')

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
  const { scene: heartScene } = useGLTF('/models/heart.glb')
  const { scene: brainScene } = useGLTF('/models/brain.glb')
  const { scene: lungsScene } = useGLTF('/models/lungs.glb')

  // Clone scenes for independent instance rendering and configure custom transparency/materials
  const {
    skeletonCloned,
    muscleCloned,
    bodyCloned,
    heartCloned,
    brainCloned,
    lungsCloned
  } = useMemo(() => {
    const skeleton = skeletonScene.clone()
    const muscle = muscleScene.clone()
    const heart = heartScene.clone()
    const brain = brainScene.clone()
    const lungs = lungsScene.clone()

    const body = bodyScene.clone()
    body.traverse((child) => {
      if (child.isMesh) {
        child.material = child.material.clone()
        child.material.transparent = false
        //child.material.opacity = 0.85
        child.material.depthWrite = false
      }
    })

    return {
      skeletonCloned: skeleton,
      muscleCloned: muscle,
      bodyCloned: body,
      heartCloned: heart,
      brainCloned: brain,
      lungsCloned: lungs
    }
  }, [skeletonScene, muscleScene, bodyScene, heartScene, brainScene, lungsScene])

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
      Default is set to [1, 1, 1] as per user calibration.
    */
    <group {...props} scale={[0.4, 0.4, 0.4]}>
      <group ref={spineRef}>
        {/*
          bodyGroupRef containing all models and the interactive organs.
        */}
        <group ref={bodyGroupRef} position={[0, 0, 0]}>

          {/*
            SKELETON LAYER
            Visible only when isExploded is true.
            CALIBRATION: Adjust this scale and position to match the other models
          */}
          <motion.group
            visible={isExploded}
            animate={{ x: isExploded ? 0.4 : 0 }}
            transition={{ type: 'spring', stiffness: 100, damping: 15 }}
          >
            {/* CALIBRATION: Adjust this scale and position to match the other models */}
            <primitive
              object={skeletonCloned}
              scale={[0.1, 0.1, 0.1]}
              position={[0.5, 0, 0]}
            />
          </motion.group>

          {/*
            MUSCLE LAYER
            Visible only when isExploded is true.
            CALIBRATION: Adjust this scale and position to match the other models
          */}
          <motion.group
            visible={isExploded}
            animate={{ x: isExploded ? -0.4 : 0 }}
            transition={{ type: 'spring', stiffness: 100, damping: 15 }}
          >
            {/* CALIBRATION: Adjust this scale and position to match the other models */}
            <primitive
              object={muscleCloned}
              scale={[80, 80, 80]}
              position={[-0.5, 0, 0]}
            />
          </motion.group>

          {/*
            ORGANS LAYER (Heart, Lungs, Brain)
            Visible only when isExploded is true, centered in the middle (x: 0).
          */}
          {/* ORGANS LAYER */}
          <motion.group
            visible={isExploded}
            animate={{ x: isExploded ? -0.4 : 0 }}
            transition={{ type: 'spring', stiffness: 100, damping: 15 }}
          >
            {/* Heart Mesh */}
            <group
              ref={heartRef}
              onClick={(e) => {
                e.stopPropagation()
                setSelectedOrgan('heart')
              }}
              onPointerOver={(e) => handlePointerOver(e, 'heart')}
              onPointerOut={handlePointerOut}
            >
              {/* CALIBRATION: Adjust this scale and position to match the other models */}
              <primitive
                object={heartCloned}
                scale={[0.1, 0.1, 0.1]}
                position={[0.6, 0.25, 0]}
              />
            </group>

            {/* Lungs Mesh */}
            <group
              ref={rightLungRef}
              onClick={(e) => {
                e.stopPropagation()
                setSelectedOrgan('lungs')
              }}
              onPointerOver={(e) => handlePointerOver(e, 'lungs')}
              onPointerOut={handlePointerOut}
            >
              {/* CALIBRATION: Adjust this scale and position to match the other models */}
              <primitive
                object={lungsCloned}
                scale={[0.7, 0.7, 0.7]}
                position={[0.6, 0.15, 0]}
              />
            </group>

            {/* Brain Mesh */}
            <group
              ref={brainRef}
              onClick={(e) => {
                e.stopPropagation()
                setSelectedOrgan('brain')
              }}
              onPointerOver={(e) => handlePointerOver(e, 'brain')}
              onPointerOut={handlePointerOut}
            >
              {/* CALIBRATION: Adjust this scale and position to match the other models */}
              <primitive
                object={brainCloned}
                scale={[0.13, 0.13, 0.13]}
                position={[0.6, 0.75, 0]}
              />
            </group>
          </motion.group>

          {/*
            BODY/SKIN LAYER
            Visible initially, disappears once isExploded is true.
            CALIBRATION: Adjust this scale and position to match the other models
          */}
          <motion.group
            visible={!isExploded}
            transition={{ type: 'spring', stiffness: 100, damping: 15 }}
          >
            {/* CALIBRATION: Adjust this scale and position to match the other models */}
            <primitive
              object={bodyCloned}
              scale={[0.8, 0.8, 0.8]}
              position={[0, 0, 0]}
            />
          </motion.group>
        </group>
      </group>
    </group>
  )
}
