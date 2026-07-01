import { useEffect, useRef } from 'react'
import { useXR } from '@react-three/xr'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'
import ARReticle from './ARReticle'
import AnatomyModel from '../models/AnatomyModel'

export default function AnatomyScene({ models, setModels, setSelectedOrgan, isExploded, setIsExploded }) {
  const reticleRef = useRef()
  const { session } = useXR()
  const { camera } = useThree()

  // Ref to track models state without re-registering WebXR session listeners
  const modelsRef = useRef(models)
  useEffect(() => {
    modelsRef.current = models
  }, [models])

  // Listen for native WebXR select events (screen taps in mobile AR)
  useEffect(() => {
    if (!session) return

    const handleSelect = (event) => {
      // Enforce Single Placement Rule: ignore taps if a model is already placed
      if (modelsRef.current.length > 0) return

      let position
      let quaternion

      // Check if reticle has found a valid surface
      if (reticleRef.current && reticleRef.current.visible) {
        position = reticleRef.current.position.clone()
        quaternion = reticleRef.current.quaternion.clone()
      } else {
        // Fallback: spawn in front of the camera (mid-air)
        const localPos = new THREE.Vector3(0, -0.2, -1.2) // 1.2m in front, 0.2m below camera
        position = localPos.applyMatrix4(camera.matrixWorld)

        // Make the model stand upright and face the camera
        const camDir = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion)
        camDir.y = 0 // project onto XZ plane
        camDir.normalize()

        // Create rotation looking back at the camera
        const rotationMatrix = new THREE.Matrix4().lookAt(
          new THREE.Vector3(0, 0, 0),
          camDir.negate(),
          new THREE.Vector3(0, 1, 0)
        )
        quaternion = new THREE.Quaternion().setFromRotationMatrix(rotationMatrix)
      }

      // Spawn a new anatomical torso model at the resolved coordinates
      setModels((prev) => [
        ...prev,
        {
          id: Date.now(),
          position,
          quaternion,
        },
      ])
    }

    session.addEventListener('select', handleSelect)

    return () => {
      session.removeEventListener('select', handleSelect)
    }
  }, [session, camera, setModels])

  return (
    <>
      {/* Lights setup to highlight the glassmorphic torso and organ meshes */}
      <ambientLight intensity={0.5} />

      {/* Main key light */}
      <directionalLight position={[5, 10, 5]} intensity={1.0} />

      {/* Soft fill light */}
      <directionalLight position={[-5, 5, -5]} intensity={0.4} />

      {/* Sci-fi blue accent point light to cast internal glows on the models */}
      <pointLight position={[0, 2, 2]} intensity={0.8} color="#0a84ff" />

      {/* Target Reticle for surface placement */}
      <ARReticle reticleRef={reticleRef} />

      {/* Spawned anatomy models */}
      {models.map((model) => (
        <AnatomyModel
          key={model.id}
          position={model.position}
          quaternion={model.quaternion}
          setSelectedOrgan={setSelectedOrgan}
          isExploded={isExploded}
          setIsExploded={setIsExploded}
        />
      ))}
    </>
  )
}
