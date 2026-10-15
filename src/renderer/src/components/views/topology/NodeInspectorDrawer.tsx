import React from 'react'
import {
  X,
  Zap,
  Activity,
  ArrowUpCircle,
  RotateCw,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  HardDrive,
  Globe,
  Router as RouterIcon,
  Share2
} from 'lucide-react'
import { useGameStore } from '../../../store/useGameStore'
import { HardwareNodeType } from '../../../types/game'

export const NodeInspectorDrawer: React.FC = () => {
  const inspectedNodeId = useGameStore((s) => s.inspectedNodeId)
  const inspectNode = useGameStore((s) => s.inspectNode)
  const nodes = useGameStore((s) => s.nodes)
  const upgradeNode = useGameStore((s) => s.upgradeNode)
  const rebootNode = useGameStore((s) => s.rebootNode)
  const removeNode = useGameStore((s) => s.removeNode)
  const cash = useGameStore((s) => s.finance.cash)

  if (!inspectedNodeId) return null

  const node = nodes.find((n) => n.id === inspectedNodeId)
  if (!node) return null

  const upgradeCost = Math.round(node.cost * 0.6)
  const canAffordUpgrade = cash >= upgradeCost && node.level < 3
  const salvageValue = Math.round(node.cost * 0.4)

  const nodeIcons: Record<HardwareNodeType, React.ElementType> = {
    upstream: Globe,
    core_router: RouterIcon,
    olt: HardDrive,
    odp: Share2
  }

  const Icon = nodeIcons[node.type] || RouterIcon

  const loadPct =
    node.maxThroughputMbps > 0
      ? Math.round((node.currentThroughputMbps / node.maxThroughputMbps) * 100)
      : 0

  return (
    <div className="absolute right-0 top-0 bottom-0 w-84 bg-slate-900/98 border-l border-slate-800 z-30 flex flex-col justify-between shadow-2xl p-5 select-none animate-slide-left backdrop-blur-md">
      <div>
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-950/80 border border-cyan-800/60 text-cyan-400">
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-100 leading-tight">{node.name}</div>
              <div className="text-[10px] font-mono text-cyan-400 uppercase font-semibold">
                {node.type.replace('_', ' ')} • Level {node.level}
              </div>
            </div>
          </div>

          <button
            onClick={() => inspectNode(null)}
            className="text-slate-400 hover:text-slate-100 p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Status Indicators */}
        <div className="space-y-4">
          {/* Health & Status Badge */}
          <div className="flex items-center justify-between bg-slate-950/70 p-3 rounded-xl border border-slate-800/80">
            <div className="flex items-center gap-2">
              {node.status === 'online' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
              {node.status === 'degraded' && <AlertTriangle className="w-4 h-4 text-amber-400" />}
              {node.status === 'unlinked' && <AlertTriangle className="w-4 h-4 text-rose-400 animate-pulse" />}
              {node.status === 'offline' && <RotateCw className="w-4 h-4 text-cyan-400 animate-spin" />}
              <span className="text-xs font-mono font-bold capitalize text-slate-200">
                {node.isRebooting ? 'Rebooting...' : node.status === 'unlinked' ? 'No Transit Link' : node.status}
              </span>
            </div>

            <div className="text-xs font-mono text-slate-400">
              Health: <span className="font-bold text-emerald-400">{node.healthPct}%</span>
            </div>
          </div>

          {/* Live Throughput Gauge */}
          <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400 flex items-center gap-1">
                <Activity className="w-3.5 h-3.5 text-cyan-400" />
                Live Load:
              </span>
              <span className="text-slate-100 font-bold">
                {node.currentThroughputMbps.toLocaleString()} / {node.maxThroughputMbps.toLocaleString()} Mbps
              </span>
            </div>
            <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
              <div
                className={`h-full transition-all duration-300 ${
                  loadPct > 90 ? 'bg-rose-500' : loadPct > 70 ? 'bg-amber-400' : 'bg-cyan-400'
                }`}
                style={{ width: `${Math.min(100, loadPct)}%` }}
              />
            </div>
            <div className="text-[10px] text-right font-mono text-slate-500">{loadPct}% capacity utilized</div>
          </div>

          {/* Hardware Specs Breakdown */}
          <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/80 space-y-2 text-xs font-mono text-slate-400">
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-800/50">
              <span>Port Density:</span>
              <span className="text-slate-200 font-bold">{node.portCapacity} Optical Ports</span>
            </div>
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-800/50">
              <span>Maintenance Upkeep:</span>
              <span className="text-slate-200 font-bold">${node.upkeepCostPerDay} / day</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                Power Draw:
              </span>
              <span className="text-slate-200 font-bold">{node.powerWatts} Watts</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Controls */}
      <div className="space-y-2.5 pt-4 border-t border-slate-800">
        {/* Upgrade Button */}
        <button
          onClick={() => upgradeNode(node.id)}
          disabled={!canAffordUpgrade}
          className={`w-full py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
            node.level >= 3
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
              : canAffordUpgrade
                ? 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-md'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
          }`}
        >
          <span className="flex items-center gap-1.5">
            <ArrowUpCircle className="w-4 h-4" />
            <span>{node.level >= 3 ? 'Max Level Reached' : `Upgrade to Level ${node.level + 1}`}</span>
          </span>
          {node.level < 3 && <span className="font-mono">${upgradeCost.toLocaleString()}</span>}
        </button>

        {/* Maintenance Reboot */}
        <button
          onClick={() => rebootNode(node.id)}
          disabled={node.isRebooting}
          className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
        >
          <RotateCw className={`w-3.5 h-3.5 text-cyan-400 ${node.isRebooting ? 'animate-spin' : ''}`} />
          <span>{node.isRebooting ? 'Reboot in progress...' : 'Execute Diagnostics Reboot'}</span>
        </button>

        {/* Decommission */}
        <button
          onClick={() => {
            if (window.confirm(`Decommission ${node.name}? You will recover $${salvageValue} in salvage.`)) {
              removeNode(node.id)
            }
          }}
          className="w-full py-2 px-3 rounded-xl bg-rose-950/40 hover:bg-rose-900/40 border border-rose-800/40 text-rose-300 text-xs font-semibold flex items-center justify-between transition-colors"
        >
          <span className="flex items-center gap-1.5">
            <Trash2 className="w-3.5 h-3.5 text-rose-400" />
            <span>Decommission</span>
          </span>
          <span className="font-mono text-emerald-400">+$${salvageValue.toLocaleString()}</span>
        </button>
      </div>
    </div>
  )
}
