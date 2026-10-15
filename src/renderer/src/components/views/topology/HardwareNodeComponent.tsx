import React from 'react'
import { Handle, Position } from '@xyflow/react'
import {
  Globe,
  Router as RouterIcon,
  HardDrive,
  Share2,
  Trash2,
  Zap,
  Activity,
  AlertTriangle,
  RotateCw
} from 'lucide-react'
import { HardwareNode } from '../../../types/game'
import { useGameStore } from '../../../store/useGameStore'

const nodeConfig = {
  upstream: {
    icon: Globe,
    titleColor: 'text-indigo-400',
    borderColor: 'border-indigo-500/50',
    bgColor: 'bg-indigo-950/40',
    glowColor: 'shadow-[0_0_15px_rgba(99,102,241,0.25)]',
    badge: 'Tier Upstream'
  },
  core_router: {
    icon: RouterIcon,
    titleColor: 'text-cyan-400',
    borderColor: 'border-cyan-500/50',
    bgColor: 'bg-cyan-950/40',
    glowColor: 'shadow-[0_0_15px_rgba(6,182,212,0.25)]',
    badge: 'Core Router'
  },
  olt: {
    icon: HardDrive,
    titleColor: 'text-emerald-400',
    borderColor: 'border-emerald-500/50',
    bgColor: 'bg-emerald-950/40',
    glowColor: 'shadow-[0_0_15px_rgba(16,185,129,0.25)]',
    badge: 'GPON OLT'
  },
  odp: {
    icon: Share2,
    titleColor: 'text-amber-400',
    borderColor: 'border-amber-500/50',
    bgColor: 'bg-amber-950/40',
    glowColor: 'shadow-[0_0_15px_rgba(245,158,11,0.25)]',
    badge: 'Fiber ODP'
  }
}

export const HardwareNodeComponent = ({ data }: { data: HardwareNode }) => {
  const removeNode = useGameStore((s) => s.removeNode)
  const inspectNode = useGameStore((s) => s.inspectNode)
  const inspectedNodeId = useGameStore((s) => s.inspectedNodeId)

  const config = nodeConfig[data.type] || nodeConfig.core_router
  const Icon = config.icon

  const isSelected = inspectedNodeId === data.id
  const isUnlinked = data.status === 'unlinked'
  const isDegraded = data.status === 'degraded'
  const isRebooting = data.isRebooting

  const loadPct =
    data.maxThroughputMbps > 0
      ? Math.round((data.currentThroughputMbps / data.maxThroughputMbps) * 100)
      : 0

  return (
    <div
      onClick={() => inspectNode(data.id)}
      className={`w-64 rounded-xl border bg-slate-900/95 backdrop-blur-md text-slate-200 p-3 select-none transition-all shadow-xl cursor-pointer ${
        isSelected
          ? 'border-cyan-400 shadow-[0_0_25px_rgba(6,182,212,0.5)] ring-2 ring-cyan-500/50'
          : isUnlinked
            ? 'border-rose-500/70 shadow-[0_0_15px_rgba(244,63,94,0.3)] animate-pulse'
            : isDegraded
              ? 'border-amber-500/70 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
              : `${config.borderColor} ${config.glowColor}`
      }`}
    >
      {/* Input Handle (except upstream) */}
      {data.type !== 'upstream' && (
        <Handle
          type="target"
          position={Position.Left}
          className="!w-3.5 !h-3.5 !bg-cyan-400 !border-2 !border-slate-950 hover:!scale-125 transition-transform"
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2.5">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg ${config.bgColor} ${config.titleColor}`}>
            <Icon className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold leading-tight truncate max-w-[120px] flex items-center gap-1">
              <span>{data.name}</span>
              {data.level > 1 && (
                <span className="text-[9px] px-1 bg-cyan-900/80 text-cyan-300 rounded font-mono font-bold">
                  L{data.level}
                </span>
              )}
            </div>
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
              {config.badge}
            </span>
          </div>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation()
            removeNode(data.id)
          }}
          title="Decommission hardware (salvage 40% cost)"
          className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Live Load Meter */}
      <div className="space-y-1 mb-2.5">
        <div className="flex items-center justify-between text-[11px] font-mono">
          <span className="text-slate-400 flex items-center gap-1">
            <Activity className="w-3 h-3 text-cyan-400" />
            Throughput:
          </span>
          <span className="text-slate-200 font-bold">
            {data.currentThroughputMbps.toLocaleString()} / {data.maxThroughputMbps.toLocaleString()} M
          </span>
        </div>
        <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-800">
          <div
            className={`h-full transition-all duration-300 ${
              isUnlinked
                ? 'bg-rose-500'
                : loadPct > 90
                  ? 'bg-rose-500'
                  : loadPct > 70
                    ? 'bg-amber-400'
                    : 'bg-cyan-400'
            }`}
            style={{ width: `${Math.min(100, isUnlinked ? 100 : loadPct)}%` }}
          />
        </div>
      </div>

      {/* Specifications Footer */}
      <div className="grid grid-cols-2 gap-2 text-[10px] font-mono border-t border-slate-800/80 pt-2 text-slate-400">
        <div>
          <span>Upkeep:</span> <strong className="text-slate-300">${data.upkeepCostPerDay}/day</strong>
        </div>
        <div className="flex items-center gap-1 justify-end">
          <Zap className="w-3 h-3 text-amber-400" />
          <span>{data.powerWatts} W</span>
        </div>
        <div>
          <span>Ports:</span> <strong className="text-slate-300">{data.portCapacity}</strong>
        </div>
        <div className="text-right">
          {isRebooting ? (
            <span className="inline-flex items-center gap-1 text-cyan-400 font-bold">
              <RotateCw className="w-2.5 h-2.5 animate-spin" />
              <span>REBOOT</span>
            </span>
          ) : isUnlinked ? (
            <span className="inline-flex items-center gap-1 text-rose-400 font-bold">
              <AlertTriangle className="w-2.5 h-2.5" />
              <span>NO LINK</span>
            </span>
          ) : isDegraded ? (
            <span className="inline-flex items-center gap-1 text-amber-400 font-bold">
              <AlertTriangle className="w-2.5 h-2.5" />
              <span>DEGRADED</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="text-emerald-400 font-semibold uppercase">ONLINE</span>
            </span>
          )}
        </div>
      </div>

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Right}
        className="!w-3.5 !h-3.5 !bg-indigo-400 !border-2 !border-slate-950 hover:!scale-125 transition-transform"
      />
    </div>
  )
}
