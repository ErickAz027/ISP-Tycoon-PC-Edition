import React from 'react'
import {
  Map,
  Server,
  ShoppingBag,
  Activity,
  Network,
  PackageCheck,
  TrendingUp,
  AlertCircle
} from 'lucide-react'
import { useGameStore } from '../../store/useGameStore'

export const Sidebar: React.FC = () => {
  const activeTab = useGameStore((s) => s.activeTab)
  const setActiveTab = useGameStore((s) => s.setActiveTab)
  const gameMode = useGameStore((s) => s.gameMode)
  const alerts = useGameStore((s) => s.alerts)

  const unreadAlertsCount = alerts.filter((a) => a.type === 'danger' || a.type === 'warning').length

  const realisticNavItems = [
    {
      id: 'map',
      label: 'Peta Kota 2D',
      sublabel: 'Bangun Tiang & Kabel',
      icon: Map
    },
    {
      id: 'rack',
      label: 'Ruang Rak Server',
      sublabel: 'Rak 42U & Patch Cable',
      icon: Server
    },
    {
      id: 'store',
      label: 'Toko & Gudang',
      sublabel: 'Beli Alat & Logistik',
      icon: ShoppingBag
    },
    {
      id: 'dashboard',
      label: 'Monitor NOC',
      sublabel: 'Grafik MRTG & Sinyal',
      icon: Activity
    },
    {
      id: 'plans',
      label: 'Paket & Pelanggan',
      sublabel: 'Tarif & Langganan',
      icon: PackageCheck
    },
    {
      id: 'finance',
      label: 'Keuangan & Transit',
      sublabel: 'Arus Kas & Sewa Bandwidth',
      icon: TrendingUp
    }
  ] as const

  const arcadeNavItems = [
    {
      id: 'topology',
      label: 'Topologi Jaringan',
      sublabel: 'Peta Node & Kabel',
      icon: Network
    },
    {
      id: 'dashboard',
      label: 'Monitor NOC',
      sublabel: 'Grafik MRTG & Sinyal',
      icon: Activity
    },
    {
      id: 'plans',
      label: 'Paket & Pelanggan',
      sublabel: 'Tarif & Langganan',
      icon: PackageCheck
    },
    {
      id: 'finance',
      label: 'Keuangan & Transit',
      sublabel: 'Arus Kas & Sewa Bandwidth',
      icon: TrendingUp
    }
  ] as const

  const currentNavItems = gameMode === 'realistic' ? realisticNavItems : arcadeNavItems

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between shrink-0 select-none">
      <div className="p-3 space-y-1">
        <div className="px-3 py-2 text-[10px] font-semibold tracking-wider text-slate-500 uppercase flex items-center justify-between">
          <span>{gameMode === 'realistic' ? 'Mode Realistis' : 'Mode Arcade'}</span>
          <span className="text-cyan-400 font-mono font-bold">PROTOTYPE</span>
        </div>

        {currentNavItems.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.id

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left transition-all relative ${
                isActive
                  ? 'bg-cyan-950/60 text-cyan-300 border border-cyan-800/60 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
              }`}
            >
              <div
                className={`p-1.5 rounded-lg ${
                  isActive ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-800 text-slate-400'
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold leading-tight truncate">{item.label}</div>
                <div className="text-[10px] text-slate-500 truncate leading-tight mt-0.5">
                  {item.sublabel}
                </div>
              </div>

              {item.id === 'dashboard' && unreadAlertsCount > 0 && (
                <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/40">
                  <AlertCircle className="w-3 h-3" />
                  {unreadAlertsCount}
                </span>
              )}

              {isActive && (
                <div className="absolute right-0 top-2 bottom-2 w-1 bg-cyan-400 rounded-l shadow-[0_0_8px_#06b6d4]" />
              )}
            </button>
          )
        })}
      </div>

      {/* System Status Footer */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/50">
        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            NOC Daemon v0.8-PROTOTYPE
          </span>
          <span className="font-mono text-cyan-400 font-bold">ONLINE</span>
        </div>
      </div>
    </aside>
  )
}
