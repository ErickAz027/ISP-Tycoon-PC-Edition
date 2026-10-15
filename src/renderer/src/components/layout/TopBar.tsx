import React, { useState } from 'react'
import {
  Play,
  Pause,
  FastForward,
  Activity,
  Wifi,
  DollarSign,
  Heart,
  Save,
  FolderOpen,
  Edit2,
  Check,
  Server,
  Volume2,
  VolumeX,
  RotateCcw,
  Sparkles,
  Gamepad2,
  Home
} from 'lucide-react'
import { useGameStore } from '../../store/useGameStore'

export const TopBar: React.FC = () => {
  const companyName = useGameStore((s) => s.companyName)
  const setCompanyName = useGameStore((s) => s.setCompanyName)
  const time = useGameStore((s) => s.time)
  const setSpeed = useGameStore((s) => s.setSpeed)
  const togglePause = useGameStore((s) => s.togglePause)
  const isMuted = useGameStore((s) => s.isMuted)
  const toggleMute = useGameStore((s) => s.toggleMute)
  const metrics = useGameStore((s) => s.metrics)
  const cash = useGameStore((s) => s.finance.cash)
  const currency = useGameStore((s) => s.finance.currency)
  const gameMode = useGameStore((s) => s.gameMode)
  const setGameMode = useGameStore((s) => s.setGameMode)
  const saveToDisk = useGameStore((s) => s.saveToDisk)
  const loadFromDisk = useGameStore((s) => s.loadFromDisk)
  const resetGame = useGameStore((s) => s.resetGame)

  const [isEditingName, setIsEditingName] = useState(false)
  const [tempName, setTempName] = useState(companyName)
  const [saveStatus, setSaveStatus] = useState<string | null>(null)

  const handleSave = async () => {
    setSaveStatus('Saving...')
    const ok = await saveToDisk()
    setSaveStatus(ok ? 'Saved!' : 'Failed')
    setTimeout(() => setSaveStatus(null), 2500)
  }

  const handleLoad = async () => {
    setSaveStatus('Loading...')
    const ok = await loadFromDisk()
    setSaveStatus(ok ? 'Loaded!' : 'Failed')
    setTimeout(() => setSaveStatus(null), 2500)
  }

  const handleNameSave = () => {
    if (tempName.trim()) {
      setCompanyName(tempName.trim())
    }
    setIsEditingName(false)
  }

  const handleReset = () => {
    if (window.confirm('Reset ISP Tycoon ke kondisi awal? Semua data yang belum disimpan akan direset.')) {
      resetGame()
    }
  }

  const formattedCash =
    currency === 'IDR'
      ? `Rp ${(cash * 15000).toLocaleString('id-ID')}`
      : `$${cash.toLocaleString('en-US')}`

  const isCongested = metrics.packetLossPct > 1 || metrics.totalDemandMbps > metrics.effectiveCapacityMbps
  const pingColor =
    metrics.pingMs > 80 ? 'text-rose-400' : metrics.pingMs > 35 ? 'text-amber-400' : 'text-emerald-400'
  const lossColor =
    metrics.packetLossPct > 5 ? 'text-rose-400' : metrics.packetLossPct > 0.5 ? 'text-amber-400' : 'text-emerald-400'

  const timeString = `${time.hour.toString().padStart(2, '0')}:${time.minute.toString().padStart(2, '0')}`

  return (
    <header className="h-14 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between select-none z-30 shadow-md relative">
      {/* Brand & Company Name */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-500/40 text-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.3)]">
          <Server className="w-4 h-4 animate-pulse" />
        </div>

        {isEditingName ? (
          <div className="flex items-center gap-1.5">
            <input
              type="text"
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleNameSave()}
              className="bg-slate-950 border border-cyan-500 px-2 py-0.5 text-sm font-semibold rounded text-slate-100 focus:outline-none"
              autoFocus
            />
            <button
              onClick={handleNameSave}
              className="p-1 rounded bg-cyan-600 text-white hover:bg-cyan-500 transition-colors"
            >
              <Check className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div
            className="flex items-center gap-2 group cursor-pointer"
            onClick={() => {
              setTempName(companyName)
              setIsEditingName(true)
            }}
            title="Klik untuk mengubah nama ISP"
          >
            <span className="font-bold text-sm tracking-wide text-slate-100 group-hover:text-cyan-400 transition-colors">
              {companyName}
            </span>
            <Edit2 className="w-3 h-3 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        )}

        {/* Game Mode Switcher Badge */}
        <button
          onClick={() => setGameMode(gameMode === 'realistic' ? 'arcade' : 'realistic')}
          title="Klik untuk ganti mode gameplay"
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold border transition-all ${
            gameMode === 'realistic'
              ? 'bg-cyan-950/80 border-cyan-500 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
              : 'bg-indigo-950/80 border-indigo-500 text-indigo-300 shadow-[0_0_10px_rgba(99,102,241,0.3)]'
          }`}
        >
          {gameMode === 'realistic' ? <Home className="w-3 h-3 text-cyan-400" /> : <Gamepad2 className="w-3 h-3 text-indigo-400" />}
          <span>{gameMode === 'realistic' ? 'Mode: Realistis (Peta 2D)' : 'Mode: Arcade (Topologi)'}</span>
        </button>
      </div>

      {/* Metrics Center Cluster */}
      <div className="flex items-center gap-2.5 text-xs font-mono">
        {/* Cash Balance */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded bg-slate-950/80 border border-slate-800 shadow-inner">
          <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-slate-400">Kas:</span>
          <span className="font-bold text-emerald-400 text-sm tracking-tight">{formattedCash}</span>
        </div>

        {/* Bandwidth Usage */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded bg-slate-950/80 border border-slate-800">
          <Wifi className={`w-3.5 h-3.5 ${isCongested ? 'text-rose-400 animate-bounce' : 'text-cyan-400'}`} />
          <span className="text-slate-400">Load:</span>
          <span className="font-bold text-slate-200">
            {metrics.usedBandwidthMbps.toLocaleString()}
          </span>
          <span className="text-slate-500">/</span>
          <span className="text-cyan-400 font-semibold">{metrics.effectiveCapacityMbps.toLocaleString()}M</span>
        </div>

        {/* Latency & Loss Indicator */}
        <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-slate-950/80 border border-slate-800">
          <div className="flex items-center gap-1">
            <Activity className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400">RTT:</span>
            <span className={`font-bold ${pingColor}`}>{metrics.pingMs}ms</span>
          </div>
          <div className="w-[1px] h-3 bg-slate-800" />
          <div className="flex items-center gap-1">
            <span className="text-slate-400">Loss:</span>
            <span className={`font-bold ${lossColor}`}>{metrics.packetLossPct}%</span>
          </div>
        </div>

        {/* Houses & Subscribers Coverage */}
        <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-slate-950/80 border border-slate-800">
          <Home className="w-3.5 h-3.5 text-indigo-400" />
          <span className="text-slate-400">Rumah:</span>
          <span className="font-bold text-emerald-400">{metrics.totalSubscribersCount}</span>
          <span className="text-slate-500">/</span>
          <span className="text-slate-300">{metrics.activeHousesCovered} tercover</span>
        </div>
      </div>

      {/* Clock, Simulation Controls & Persistence */}
      <div className="flex items-center gap-2">
        {/* In-Game Clock */}
        <div className="flex items-center gap-2 bg-slate-950 px-2.5 py-1 rounded border border-slate-800 font-mono text-xs">
          <span className="text-cyan-400 font-bold">HARI {time.day}</span>
          <span className="text-slate-500">|</span>
          <span className="text-slate-200 font-medium">{timeString}</span>
        </div>

        {/* Speed Controls */}
        <div className="flex items-center bg-slate-950 rounded border border-slate-800 p-0.5">
          <button
            onClick={togglePause}
            title={time.isPaused ? 'Lanjutkan Simulasi' : 'Jeda (Pause)'}
            className={`p-1.5 rounded transition-all ${
              time.isPaused
                ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40'
                : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'
            }`}
          >
            {time.isPaused ? <Play className="w-3.5 h-3.5 fill-current" /> : <Pause className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={() => setSpeed(1)}
            title="1x Realtime"
            className={`px-2 py-0.5 text-xs font-mono font-semibold rounded transition-all ${
              !time.isPaused && time.speed === 1
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            1x
          </button>

          <button
            onClick={() => setSpeed(2)}
            title="2x Fast Forward"
            className={`px-2 py-0.5 text-xs font-mono font-semibold rounded transition-all ${
              !time.isPaused && time.speed === 2
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            2x
          </button>

          <button
            onClick={() => setSpeed(5)}
            title="5x Warp Speed"
            className={`px-2 py-0.5 text-xs font-mono font-semibold rounded transition-all flex items-center gap-0.5 ${
              !time.isPaused && time.speed === 5
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <FastForward className="w-3 h-3" />
            5x
          </button>
        </div>

        {/* Audio Mute Toggle */}
        <button
          onClick={toggleMute}
          title={isMuted ? 'Nyalakan Suara SFX' : 'Matikan Suara SFX'}
          className="p-1.5 rounded bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
        >
          {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-cyan-400" />}
        </button>

        {/* Save, Load & Reset */}
        <div className="flex items-center gap-1">
          <button
            onClick={handleSave}
            title="Simpan Game (JSON AppData)"
            className="flex items-center gap-1 px-2 py-1 text-xs bg-slate-800 hover:bg-slate-700 active:bg-slate-600 border border-slate-700 rounded text-slate-300 transition-colors"
          >
            <Save className="w-3 h-3 text-cyan-400" />
            <span>Save</span>
          </button>

          <button
            onClick={handleLoad}
            title="Muat Game"
            className="flex items-center gap-1 px-2 py-1 text-xs bg-slate-800 hover:bg-slate-700 active:bg-slate-600 border border-slate-700 rounded text-slate-300 transition-colors"
          >
            <FolderOpen className="w-3 h-3 text-amber-400" />
            <span>Load</span>
          </button>

          <button
            onClick={handleReset}
            title="Reset Game"
            className="p-1 text-xs bg-slate-800 hover:bg-rose-950/60 hover:text-rose-400 border border-slate-700 rounded text-slate-400 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {saveStatus && (
            <span className="text-[11px] font-mono text-cyan-400 animate-fade-in">{saveStatus}</span>
          )}
        </div>
      </div>
    </header>
  )
}
