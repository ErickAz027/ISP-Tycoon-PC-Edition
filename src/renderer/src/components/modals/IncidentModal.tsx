import React from 'react'
import {
  AlertOctagon,
  Flame,
  Sparkles,
  DollarSign,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  X
} from 'lucide-react'
import { useGameStore } from '../../store/useGameStore'

export const IncidentModal: React.FC = () => {
  const incident = useGameStore((s) => s.activeIncident)
  const resolveIncident = useGameStore((s) => s.resolveIncident)
  const dismissIncident = useGameStore((s) => s.dismissIncident)
  const cash = useGameStore((s) => s.finance.cash)

  if (!incident) return null

  const isOpportunity = incident.severity === 'opportunity'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-fade-in select-none">
      <div
        className={`w-full max-w-lg rounded-2xl border p-6 shadow-2xl relative transition-all ${
          isOpportunity
            ? 'bg-slate-900 border-indigo-500/60 shadow-[0_0_40px_rgba(99,102,241,0.25)]'
            : 'bg-slate-900 border-rose-500/60 shadow-[0_0_50px_rgba(244,63,94,0.3)]'
        }`}
      >
        {/* Dismiss Button */}
        <button
          onClick={dismissIncident}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-100 p-1 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-4">
          <div
            className={`p-3 rounded-xl border ${
              isOpportunity
                ? 'bg-indigo-950 text-indigo-400 border-indigo-700/50'
                : 'bg-rose-950 text-rose-400 border-rose-700/50 animate-pulse'
            }`}
          >
            {isOpportunity ? <Sparkles className="w-6 h-6" /> : <Flame className="w-6 h-6" />}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span
                className={`text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded ${
                  isOpportunity
                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                }`}
              >
                {incident.severity} NOC INCIDENT
              </span>
              <span className="text-[11px] font-mono text-slate-500">[{incident.timestamp}]</span>
            </div>
            <h2 className="text-base font-bold text-slate-100 mt-1 leading-tight">
              {incident.title}
            </h2>
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-slate-300 leading-relaxed mb-4 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
          {incident.description}
        </p>

        {/* Impact Stats */}
        <div className="grid grid-cols-2 gap-3 mb-5 text-xs font-mono">
          {incident.capacityLossPct && (
            <div className="bg-rose-950/30 border border-rose-800/40 p-2.5 rounded-lg flex items-center justify-between text-rose-300">
              <span>Transit Capacity Loss:</span>
              <span className="font-bold">-{incident.capacityLossPct}%</span>
            </div>
          )}
          {incident.trafficSpikeMbps && (
            <div className="bg-amber-950/30 border border-amber-800/40 p-2.5 rounded-lg flex items-center justify-between text-amber-300">
              <span>Abnormal Traffic Surge:</span>
              <span className="font-bold">+{incident.trafficSpikeMbps} Mbps</span>
            </div>
          )}
        </div>

        {/* Action Choices */}
        <div className="space-y-3">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Select Mitigation Strategy:
          </div>

          {incident.choices.map((choice) => {
            const canAfford = cash >= choice.cost

            return (
              <div
                key={choice.id}
                className="bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl p-3.5 transition-all flex flex-col justify-between"
              >
                <div className="flex items-start justify-between mb-1.5">
                  <div className="font-bold text-xs text-slate-200">{choice.label}</div>
                  <div className="font-mono text-xs font-bold text-emerald-400">
                    {choice.cost === 0 ? 'FREE' : `$${choice.cost.toLocaleString()}`}
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 mb-3">{choice.description}</p>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
                  <div className="flex items-center gap-3 text-[10px] font-mono text-slate-400">
                    {choice.reputationImpact && (
                      <span className="flex items-center gap-0.5 text-indigo-400">
                        <TrendingUp className="w-3 h-3" />
                        Reputation +{choice.reputationImpact}
                      </span>
                    )}
                    {choice.satisfactionImpact && (
                      <span
                        className={`flex items-center gap-0.5 ${
                          choice.satisfactionImpact < 0 ? 'text-rose-400' : 'text-emerald-400'
                        }`}
                      >
                        {choice.satisfactionImpact < 0 ? (
                          <TrendingDown className="w-3 h-3" />
                        ) : (
                          <TrendingUp className="w-3 h-3" />
                        )}
                        Satisfaction {choice.satisfactionImpact}%
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => resolveIncident(choice.id)}
                    disabled={!canAfford}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                      canAfford
                        ? isOpportunity
                          ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm'
                          : 'bg-rose-600 hover:bg-rose-500 text-white shadow-sm'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    <span>{canAfford ? 'Authorize Action' : 'Insufficient Funds'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
