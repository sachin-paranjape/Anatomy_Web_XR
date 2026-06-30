import { useXRHitTest } from '@react-three/xr'
import { Matrix4, Vector3, Quaternion } from 'three'

const matrixHelper = new Matrix4()
const positionHelper = new Vector3()
const quaternionHelper = new Quaternion()
const scaleHelper = new Vector3()

export default function ARReticle({ reticleRef }) {
  // Perform hit testing every frame during the AR session
  useXRHitTest((results, getWorldMatrix) => {
    if (results.length > 0 && reticleRef.current) {
      // Get the world matrix of the first hit result
      getWorldMatrix(matrixHelper, results[0])
      
      // Decompose it into position and rotation helpers
      matrixHelper.decompose(positionHelper, quaternionHelper, scaleHelper)
      
      // Update parent group coordinates
      reticleRef.current.position.copy(positionHelper)
      reticleRef.current.quaternion.copy(quaternionHelper)
      reticleRef.current.visible = true
    } else if (reticleRef.current) {
      reticleRef.current.visible = false
    }
  }, 'viewer') // 'viewer' casts a ray from the center of the mobile device camera

  return (
    <group ref={reticleRef} visible={false}>
      {/* Outer targeting ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.07, 0.09, 32]} />
        <meshBasicMaterial color="#0a84ff" transparent opacity={0.85} depthWrite={false} />
      </mesh>
      
      {/* Inner targeting dot */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0, 0.02, 16]} />
        <meshBasicMaterial color="#0a84ff" transparent opacity={0.6} depthWrite={false} />
      </mesh>

      {/* Decorative pointer guidelines (sci-fi HUD aesthetic) */}
      {[0, Math.PI / 2, Math.PI, -Math.PI / 2].map((angle, idx) => (
        <mesh key={idx} rotation={[-Math.PI / 2, 0, angle]} position={[0, 0.001, 0]}>
          <planeGeometry args={[0.004, 0.03]} />
          <meshBasicMaterial color="#0a84ff" transparent opacity={0.8} depthWrite={false} />
        </mesh>
      ))}
    </group>
  )
}
