import React, { useEffect } from 'react'
import { TopBar } from './components/layout/TopBar'
import { Sidebar } from './components/layout/Sidebar'
import { CityMapView } from './components/views/CityMapView'
import { ServerRackView } from './components/views/ServerRackView'
import { StoreView } from './components/views/StoreView'
import { TopologyView } from './components/views/TopologyView'
import { DashboardView } from './components/views/DashboardView'
import { PlansView } from './components/views/PlansView'
import { FinanceView } from './components/views/FinanceView'
import { IncidentModal } from './components/modals/IncidentModal'
import { useGameStore } from './store/useGameStore'
import { useGameLoop } from './hooks/useGameLoop'

export const App: React.FC = () => {
  // Activate simulation tick game loop
  useGameLoop()

  const activeTab = useGameStore((s) => s.activeTab)
  const togglePause = useGameStore((s) => s.togglePause)
  const setSpeed = useGameStore((s) => s.setSpeed)

  // Global game hotkeys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return
      }

      if (e.code === 'Space') {
        e.preventDefault()
        togglePause()
      } else if (e.key === '1') {
        setSpeed(1)
      } else if (e.key === '2') {
        setSpeed(2)
      } else if (e.key === '5') {
        setSpeed(5)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [togglePause, setSpeed])

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Top Navigation & Live Telemetry Bar */}
      <TopBar />

      {/* Main Workspace: Left Sidebar + Tab Viewport */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />

        <main className="flex-1 flex overflow-hidden relative">
          {activeTab === 'map' && <CityMapView />}
          {activeTab === 'rack' && <ServerRackView />}
          {activeTab === 'store' && <StoreView />}
          {activeTab === 'topology' && <TopologyView />}
          {activeTab === 'dashboard' && <DashboardView />}
          {activeTab === 'plans' && <PlansView />}
          {activeTab === 'finance' && <FinanceView />}
        </main>
      </div>

      {/* Incident / Event Modal Dialog */}
      <IncidentModal />
    </div>
  )
}

export default App
