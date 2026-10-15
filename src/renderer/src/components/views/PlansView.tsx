import React, { useState } from 'react'
import {
  PackagePlus,
  Users,
  DollarSign,
  Gauge,
  TrendingUp,
  Trash2,
  Edit,
  Sparkles,
  Shield,
  Gamepad2,
  Briefcase,
  Home,
  Check
} from 'lucide-react'
import { useGameStore } from '../../store/useGameStore'
import { InternetPlan } from '../../types/game'

export const PlansView: React.FC = () => {
  const plans = useGameStore((s) => s.plans)
  const addPlan = useGameStore((s) => s.addPlan)
  const updatePlan = useGameStore((s) => s.updatePlan)
  const deletePlan = useGameStore((s) => s.deletePlan)
  const metrics = useGameStore((s) => s.metrics)

  // New Plan Form State
  const [name, setName] = useState('')
  const [speedMbps, setSpeedMbps] = useState(50)
  const [monthlyPrice, setMonthlyPrice] = useState(40)
  const [tierType, setTierType] = useState<'residential' | 'business' | 'gaming'>('residential')
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null)
  const [editPrice, setEditPrice] = useState<number>(0)
  const [editSpeed, setEditSpeed] = useState<number>(0)

  // Attractiveness calculation
  const pricePerMbps = monthlyPrice / Math.max(1, speedMbps)
  const attractivenessScore = Math.max(0, Math.min(100, Math.round((1.5 - pricePerMbps) * 65)))
  const estimatedSubscribers = Math.round(attractivenessScore * 2.5)

  const totalSubscribers = plans.reduce((acc, p) => acc + p.activeSubscribers, 0)
  const totalMonthlyRev = plans.reduce((acc, p) => acc + p.activeSubscribers * p.monthlyPrice, 0)
  const arpu = totalSubscribers > 0 ? (totalMonthlyRev / totalSubscribers).toFixed(1) : '0'

  const handleCreatePlan = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    const slaTarget = tierType === 'business' ? 99.9 : tierType === 'gaming' ? 99.5 : 98.5

    addPlan({
      name: name.trim(),
      speedMbps,
      monthlyPrice,
      tierType,
      slaTargetPct: slaTarget
    })

    setName('')
    setSpeedMbps(50)
    setMonthlyPrice(40)
  }

  const handleStartEdit = (plan: InternetPlan) => {
    setEditingPlanId(plan.id)
    setEditPrice(plan.monthlyPrice)
    setEditSpeed(plan.speedMbps)
  }

  const handleSaveEdit = (id: string) => {
    updatePlan(id, {
      monthlyPrice: Number(editPrice),
      speedMbps: Number(editSpeed)
    })
    setEditingPlanId(null)
  }

  const tierIcons = {
    residential: Home,
    business: Briefcase,
    gaming: Gamepad2
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 p-6 overflow-y-auto space-y-6 select-none">
      {/* Header Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-medium">Total Subscriber Fleet</div>
            <div className="text-2xl font-bold font-mono text-slate-100 mt-1">
              {totalSubscribers.toLocaleString()} <span className="text-xs text-slate-400 font-normal">users</span>
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-indigo-950/60 text-indigo-400 border border-indigo-800/40">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-medium">Monthly Gross Billing</div>
            <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
              ${totalMonthlyRev.toLocaleString()} <span className="text-xs text-slate-400 font-normal">/mo</span>
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-medium">Average Revenue / User (ARPU)</div>
            <div className="text-2xl font-bold font-mono text-cyan-400 mt-1">
              ${arpu} <span className="text-xs text-slate-400 font-normal">/user/mo</span>
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-cyan-950/60 text-cyan-400 border border-cyan-800/40">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Content Layout: Packages List + New Package Creator */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Packages List (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Gauge className="w-4 h-4 text-cyan-400" />
              Active Internet Plans ({plans.length})
            </h2>
            <span className="text-xs text-slate-400">
              Satisfaction Factor: <strong className="text-slate-200">{metrics.satisfactionPct}%</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {plans.map((plan) => {
              const isEditing = editingPlanId === plan.id
              const monthlyPlanRev = plan.activeSubscribers * plan.monthlyPrice
              const valueRate = plan.speedMbps / Math.max(1, plan.monthlyPrice)
              const TierIcon = tierIcons[plan.tierType || 'residential'] || Home

              return (
                <div
                  key={plan.id}
                  className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 transition-all shadow-sm"
                >
                  {/* Top Card Header */}
                  <div>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-slate-800 text-slate-300">
                          <TierIcon className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="font-bold text-sm text-slate-100 leading-tight">{plan.name}</h3>
                          <div className="text-xs text-cyan-400 font-mono mt-0.5 font-semibold flex items-center gap-1.5">
                            <span>{plan.speedMbps} Mbps</span>
                            <span className="text-slate-600">•</span>
                            <span className="text-[10px] text-slate-400 uppercase">{plan.tierType || 'Residential'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        {isEditing ? (
                          <button
                            onClick={() => handleSaveEdit(plan.id)}
                            className="p-1 rounded bg-emerald-600 text-white hover:bg-emerald-500"
                            title="Save changes"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleStartEdit(plan)}
                            className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                            title="Edit plan"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => deletePlan(plan.id)}
                          className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-950/40"
                          title="Delete plan"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Price and Speed configuration */}
                    <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80 my-3 font-mono">
                      {isEditing ? (
                        <div className="space-y-2 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400">Monthly Price ($):</span>
                            <input
                              type="number"
                              value={editPrice}
                              onChange={(e) => setEditPrice(Number(e.target.value))}
                              className="w-20 bg-slate-900 border border-cyan-500 px-1.5 py-0.5 rounded text-right text-slate-100"
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400">Speed (Mbps):</span>
                            <input
                              type="number"
                              value={editSpeed}
                              onChange={(e) => setEditSpeed(Number(e.target.value))}
                              className="w-20 bg-slate-900 border border-cyan-500 px-1.5 py-0.5 rounded text-right text-slate-100"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-baseline justify-between">
                          <span className="text-xs text-slate-400">Monthly Retail:</span>
                          <span className="text-lg font-bold text-emerald-400">
                            ${plan.monthlyPrice} <span className="text-xs text-slate-400 font-normal">/mo</span>
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Subscribers & Performance Stats */}
                  <div className="border-t border-slate-800/80 pt-3 space-y-2 text-xs font-mono">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-indigo-400" />
                        Subscribers:
                      </span>
                      <span className="font-bold text-slate-200">
                        {plan.activeSubscribers}{' '}
                        <span className="text-slate-500 text-[10px]">/ ~{plan.targetSubscribers}</span>
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Monthly Yield:</span>
                      <span className="font-bold text-emerald-400">${monthlyPlanRev.toLocaleString()}</span>
                    </div>

                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400 flex items-center gap-1">
                        <Shield className="w-3 h-3 text-cyan-400" />
                        SLA Target:
                      </span>
                      <span className="text-slate-300 font-bold">{plan.slaTargetPct || 99.0}%</span>
                    </div>

                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Attractiveness:</span>
                      <span className={valueRate >= 1.5 ? 'text-emerald-400 font-bold' : 'text-amber-400'}>
                        {valueRate >= 1.5 ? 'Great Deal' : valueRate >= 0.8 ? 'Fair Market' : 'High Price'}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Package Creator Form */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <PackagePlus className="w-4 h-4 text-cyan-400" />
              <h2 className="text-sm font-bold text-slate-100">Package Creator Studio</h2>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Design a new broadband tier. Balance bandwidth against monthly pricing to attract subscribers.
            </p>

            <form onSubmit={handleCreatePlan} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Package Name</label>
                <input
                  type="text"
                  placeholder="e.g. Ultra Fiber 250M"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 transition-colors"
                  required
                />
              </div>

              {/* Target Demographic Tier */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Target Demographic</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setTierType('residential')}
                    className={`py-1.5 px-2 rounded-lg text-xs font-semibold flex flex-col items-center gap-1 border transition-all ${
                      tierType === 'residential'
                        ? 'bg-cyan-950/80 border-cyan-500 text-cyan-300 shadow-sm'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Home className="w-3.5 h-3.5" />
                    <span className="text-[10px]">Home</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTierType('gaming')}
                    className={`py-1.5 px-2 rounded-lg text-xs font-semibold flex flex-col items-center gap-1 border transition-all ${
                      tierType === 'gaming'
                        ? 'bg-indigo-950/80 border-indigo-500 text-indigo-300 shadow-sm'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Gamepad2 className="w-3.5 h-3.5" />
                    <span className="text-[10px]">Gamer</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTierType('business')}
                    className={`py-1.5 px-2 rounded-lg text-xs font-semibold flex flex-col items-center gap-1 border transition-all ${
                      tierType === 'business'
                        ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 shadow-sm'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Briefcase className="w-3.5 h-3.5" />
                    <span className="text-[10px]">Business</span>
                  </button>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1 font-mono">
                  <span className="text-slate-300">Bandwidth Speed:</span>
                  <span className="font-bold text-cyan-400">{speedMbps} Mbps</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="1000"
                  step="10"
                  value={speedMbps}
                  onChange={(e) => setSpeedMbps(Number(e.target.value))}
                  className="w-full accent-cyan-500 bg-slate-800 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-0.5">
                  <span>10 Mbps</span>
                  <span>500 Mbps</span>
                  <span>1 Gbps</span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1 font-mono">
                  <span className="text-slate-300">Monthly Retail Price:</span>
                  <span className="font-bold text-emerald-400">${monthlyPrice} / mo</span>
                </div>
                <input
                  type="range"
                  min="15"
                  max="200"
                  step="5"
                  value={monthlyPrice}
                  onChange={(e) => setMonthlyPrice(Number(e.target.value))}
                  className="w-full accent-emerald-500 bg-slate-800 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-0.5">
                  <span>$15</span>
                  <span>$100</span>
                  <span>$200</span>
                </div>
              </div>

              {/* Dynamic Attractiveness Preview */}
              <div className="bg-slate-950 border border-slate-800/80 rounded-lg p-3 space-y-2 text-xs font-mono">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Market Appeal:</span>
                  <span
                    className={`font-bold ${
                      attractivenessScore > 60
                        ? 'text-emerald-400'
                        : attractivenessScore > 35
                          ? 'text-amber-400'
                          : 'text-rose-400'
                    }`}
                  >
                    {attractivenessScore}% Rating
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Est. Target Audience:</span>
                  <span className="text-slate-200 font-semibold">~{estimatedSubscribers} customers</span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-semibold text-xs rounded-lg shadow-md transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Launch Internet Package</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
