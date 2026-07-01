import { useState, useEffect, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { XR, createXRStore, XRDomOverlay } from '@react-three/xr'
import AnatomyScene from './components/AnatomyScene'
import './index.css'

const store = createXRStore({
  hitTest: true,
})

const ANATOMY_DATA = {
  heart: {
    system: "Cardiovascular System",
    title: "The Human Heart",
    badgeClass: "cardio",
    activeClass: "active-cardio",
    description: "The heart is a muscular organ that pumps blood throughout the body via the circulatory system, supplying oxygen and nutrients to tissues and removing carbon dioxide and other wastes.",
    funFact: "The heart can continue to beat even if it is completely separated from the body, as long as it has oxygen, because it generates its own electrical impulses.",
    stats: [
      { label: "Average Beats", value: "72 BPM" },
      { label: "Daily Output", value: "7,200 Liters" },
      { label: "Chambers", value: "4 (Atria & Ventricles)" },
      { label: "Primary Function", value: "Circulate Blood" }
    ]
  },
  lungs: {
    system: "Respiratory System",
    title: "The Lungs",
    badgeClass: "resp",
    activeClass: "active-resp",
    description: "The lungs are a pair of spongy, air-filled organs located on either side of the chest. They facilitate gas exchange: bringing oxygen from the atmosphere into the bloodstream and releasing carbon dioxide.",
    funFact: "Lungs are the only organs in the human body that are light enough to float on water.",
    stats: [
      { label: "Surface Area", value: "approx. 70 m²" },
      { label: "Breaths / Day", value: "approx. 20,000" },
      { label: "Capillary Length", value: "990 Kilometers" },
      { label: "Primary Function", value: "Oxygenate Blood" }
    ]
  },
  brain: {
    system: "Nervous System",
    title: "The Brain",
    badgeClass: "nervous",
    activeClass: "active-nervous",
    description: "The brain is the central control organ of the human nervous system. It processes sensory information, coordinates physical movement, regulates bodily functions, and enables cognition, memory, and emotion.",
    funFact: "The human brain generates about 12-25 watts of electricity—enough to power a low-wattage LED bulb.",
    stats: [
      { label: "Neurons", value: "approx. 86 Billion" },
      { label: "Energy Usage", value: "20% of Body Total" },
      { label: "Processing Speed", value: "up to 120 m/s" },
      { label: "Primary Function", value: "Central Control" }
    ]
  }
}

function App() {
  const [isInSession, setIsInSession] = useState(false)
  const [models, setModels] = useState([])
  const [selectedOrgan, setSelectedOrgan] = useState(null)
  const [isExploded, setIsExploded] = useState(false)

  useEffect(() => {
    const unsubscribe = store.subscribe((state) => {
      setIsInSession(!!state.session)
      // When session ends, clear selection, placed models, and exploded view state
      if (!state.session) {
        setSelectedOrgan(null)
        setModels([])
        setIsExploded(false)
      }
    })
    return unsubscribe
  }, [])

  const preventPropagation = (e) => {
    e.stopPropagation()
  }

  // Find data for the selected organ system
  const activeData = selectedOrgan ? ANATOMY_DATA[selectedOrgan] : null

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      {/* 2D Overlay outside of the XR Session (Home Screen) */}
      {!isInSession && (
        <div className="ui-container" style={{ pointerEvents: 'auto', background: 'radial-gradient(circle at center, #121217 0%, #060608 100%)' }}>
          <div className="glass-panel header-widget" style={{ marginTop: '20vh', alignSelf: 'center', textAlign: 'center', maxWidth: '500px' }}>
            <h1 style={{ fontSize: '28px', marginBottom: '12px' }}>WebXR Anatomy Explorer</h1>
            <p style={{ marginTop: '8px', marginBottom: '24px', lineHeight: '1.6' }}>
              Experience interactive 3D human anatomy in Augmented Reality. Scan real-world surfaces to target and place the model, then tap organ systems to inspect educational details.
            </p>
            <button className="glass-button primary" onClick={() => store.enterAR()}>
              Enter AR Mode
            </button>
          </div>
          <div style={{ alignSelf: 'center', color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '24px' }}>
            Built with React, Fiber & @react-three/xr v6
          </div>
        </div>
      )}

      {/* Wrap 3D Canvas with React Suspense for elegant loading fallback over the network */}
      <Suspense fallback={
        <div className="ui-container" style={{ pointerEvents: 'auto', background: '#070709', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div className="glass-panel" style={{ padding: '32px', textAlign: 'center', maxWidth: '400px' }}>
            <div style={{
              display: 'inline-block',
              width: '40px',
              height: '40px',
              border: '3px solid rgba(255,255,255,0.1)',
              borderRadius: '50%',
              borderTopColor: 'var(--accent-blue)',
              animation: 'spin 1s ease-in-out infinite',
              marginBottom: '16px'
            }}></div>
            <h2 style={{ fontSize: '20px', marginBottom: '8px', fontFamily: 'var(--font-display)' }}>Loading 3D Anatomy...</h2>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Retrieving high-fidelity skeletal, muscle, and body models</p>
          </div>
          <style>{`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      }>
        {/* 3D Canvas with WebXR Context */}
        <Canvas>
          <XR store={store}>
            <AnatomyScene
              models={models}
              setModels={setModels}
              setSelectedOrgan={setSelectedOrgan}
              isExploded={isExploded}
              setIsExploded={setIsExploded}
            />

            <XRDomOverlay>
              <div className="ui-container" onClick={preventPropagation} onPointerDown={preventPropagation}>
                {/* Top Panel */}
                <div className="ui-element glass-panel header-widget" style={{ minWidth: '320px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h1>WebXR Anatomy AR</h1>
                      <p style={{ margin: 0 }}>Placements: {models.length}</p>
                    </div>
                    {models.length > 0 && (
                      <button 
                        className={`glass-button ${isExploded ? 'primary' : ''}`}
                        style={{ padding: '8px 12px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', borderRadius: '8px', marginLeft: '12px' }}
                        onClick={() => setIsExploded(!isExploded)}
                      >
                        {isExploded ? "Reset Model" : "Separate Layers"}
                      </button>
                    )}
                  </div>
                </div>

                {/* Middle instruction banner */}
                {models.length === 0 && (
                  <div className="instruction-banner">
                    Tap anywhere to spawn anatomy torso at the targeting reticle
                  </div>
                )}

                {/* Bottom Educational Panel */}
                {activeData && (
                  <div className={`ui-element glass-panel info-card ${activeData.activeClass}`}>
                    <div className="info-card-header">
                      <span className={`system-badge ${activeData.badgeClass}`}>
                        {activeData.system}
                      </span>
                      <button className="close-btn" onClick={() => setSelectedOrgan(null)}>
                        ✕
                      </button>
                    </div>
                    <h2>{activeData.title}</h2>
                    <p className="description">{activeData.description}</p>

                    {activeData.funFact && (
                      <div style={{
                        marginTop: '12px',
                        marginBottom: '16px',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        background: 'rgba(255,255,255,0.03)',
                        borderLeft: '3px solid var(--accent-blue)',
                        fontSize: '12px',
                        fontStyle: 'italic',
                        color: 'var(--text-secondary)'
                      }}>
                        <strong>Fun Fact:</strong> {activeData.funFact}
                      </div>
                    )}

                    <div className="info-details">
                      {activeData.stats.map((stat, idx) => (
                        <div className="detail-item" key={idx}>
                          <span className="label">{stat.label}</span>
                          <span className="value">{stat.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </XRDomOverlay>
          </XR>
        </Canvas>
      </Suspense>
    </div>
  )
}

export default App

