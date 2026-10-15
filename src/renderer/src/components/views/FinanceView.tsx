import React from 'react'
import {
  TrendingUp,
  DollarSign,
  Zap,
  HardDrive,
  Globe,
  Plus,
  Minus,
  ShieldAlert,
  Coins,
  ArrowDownRight,
  ArrowUpRight,
  Building,
  Server
} from 'lucide-react'
import { useGameStore } from '../../store/useGameStore'

export const FinanceView: React.FC = () => {
  const finance = useGameStore((s) => s.finance)
  const plans = useGameStore((s) => s.plans)
  const serverRack = useGameStore((s) => s.serverRack)
  const mapBuildings = useGameStore((s) => s.mapBuildings)
  const leaseUpstream = useGameStore((s) => s.leaseUpstreamBandwidth)
  const changeCurrency = useGameStore((s) => s.changeCurrency)
  const metrics = useGameStore((s) => s.metrics)

  // Calculations
  const totalSubscribers = metrics.totalSubscribersCount || plans.reduce((acc, p) => acc + p.activeSubscribers, 0)
  const dailyGrossRevenue = finance.dailyRevenue
  const monthlyGrossRevenue = dailyGrossRevenue * 30

  const totalPowerWatts = serverRack.devices.reduce(
    (sum, d) => sum + (d.isPowered ? d.powerWatts : 0),
    0
  )
  const electricityDaily = Math.round(((totalPowerWatts * 24) / 1000) * finance.powerCostPerKWh)
  const rentDaily = finance.buildingRentDaily
  const upstreamLeaseDaily = Math.round(finance.leasedUpstreamMbps * finance.upstreamCostPerMbps)

  const totalDailyExpenses = electricityDaily + rentDaily + upstreamLeaseDaily
  const totalMonthlyExpenses = totalDailyExpenses * 30

  const netDailyProfit = dailyGrossRevenue - totalDailyExpenses
  const netMonthlyProfit = monthlyGrossRevenue - totalMonthlyExpenses

  const isProfitable = netDailyProfit >= 0

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 p-6 overflow-y-auto space-y-6 select-none font-sans">
      {/* Top Header & Currency Switcher */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            Laporan Arus Kas & Bursa Bandwidth Upstream
          </h1>
          <p className="text-xs text-slate-400">
            Pantau arus kas harian, sewa gedung POP, dan kontrak kapasitas transit Tier-1.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-1 rounded-lg text-xs font-mono">
          <button
            onClick={() => changeCurrency('USD')}
            className={`px-3 py-1 rounded transition-colors ${
              finance.currency === 'USD'
                ? 'bg-cyan-600 text-white font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            USD ($)
          </button>
          <button
            onClick={() => changeCurrency('IDR')}
            className={`px-3 py-1 rounded transition-colors ${
              finance.currency === 'IDR'
                ? 'bg-cyan-600 text-white font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            IDR (Rp)
          </button>
        </div>
      </div>

      {/* Key Cashflow Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Net Daily Cashflow */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Arus Kas Bersih (Net Daily)</span>
            {isProfitable ? (
              <ArrowUpRight className="w-4 h-4 text-emerald-400" />
            ) : (
              <ArrowDownRight className="w-4 h-4 text-rose-400" />
            )}
          </div>
          <div className="my-2">
            <div
              className={`text-2xl font-bold font-mono ${
                isProfitable ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {isProfitable ? '+' : ''}${netDailyProfit.toLocaleString()}{' '}
              <span className="text-xs text-slate-400 font-normal">/ hari</span>
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Proyeksi Bulanan: <strong className="text-slate-200">{netMonthlyProfit >= 0 ? '+' : ''}${netMonthlyProfit.toLocaleString()}</strong>
            </div>
          </div>
          <div className="text-[11px] font-mono text-slate-500">
            Settlement otomatis setiap jam 00:00 malam
          </div>
        </div>

        {/* Card 2: Gross Daily Revenue */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Pendapatan Langganan Harian</span>
            <Coins className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="my-2">
            <div className="text-2xl font-bold font-mono text-slate-100">
              +${dailyGrossRevenue.toLocaleString()}{' '}
              <span className="text-xs text-slate-400 font-normal">/ hari</span>
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Dari <strong className="text-slate-200">{totalSubscribers}</strong> rumah berlangganan
            </div>
          </div>
          <div className="text-[11px] text-emerald-400 font-mono">
            Run-Rate Bulanan: ${monthlyGrossRevenue.toLocaleString()}
          </div>
        </div>

        {/* Card 3: Total Daily Expenses */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Biaya Operasional (OPEX)</span>
            <ShieldAlert className="w-4 h-4 text-amber-400" />
          </div>
          <div className="my-2">
            <div className="text-2xl font-bold font-mono text-rose-400">
              -${totalDailyExpenses.toLocaleString()}{' '}
              <span className="text-xs text-slate-400 font-normal">/ hari</span>
            </div>
            <div className="text-xs text-slate-400 mt-1">
              OPEX Bulanan: <strong className="text-slate-200">-${totalMonthlyExpenses.toLocaleString()}</strong>
            </div>
          </div>
          <div className="text-[11px] text-slate-400 font-mono">
            Sewa Gedung + Listrik Server + Upstream
          </div>
        </div>
      </div>

      {/* Upstream Bandwidth Lease Marketplace */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Globe className="w-4 h-4 text-cyan-400" />
              Bursa Sewa Bandwidth Upstream Transit
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Sewa kapasitas pipa IP transit langsung dari penyedia Tier-1 (Singtel / Telkom / Indosat).
              Tarif: <strong className="text-slate-200 font-mono">${finance.upstreamCostPerMbps} / Mbps / hari</strong>.
            </p>
          </div>

          <div className="text-right font-mono">
            <div className="text-xs text-slate-400">Kapasitas Disewa:</div>
            <div className="text-lg font-bold text-cyan-400">
              {finance.leasedUpstreamMbps.toLocaleString()} Mbps
            </div>
          </div>
        </div>

        {/* Quick Adjustment Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <button
            onClick={() => leaseUpstream(-500)}
            disabled={finance.leasedUpstreamMbps <= 0}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-mono font-medium transition-all"
          >
            <Minus className="w-3.5 h-3.5 text-rose-400" />
            <span>-500 Mbps (-$60/hari)</span>
          </button>

          <button
            onClick={() => leaseUpstream(-100)}
            disabled={finance.leasedUpstreamMbps <= 0}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-mono font-medium transition-all"
          >
            <Minus className="w-3.5 h-3.5 text-rose-400" />
            <span>-100 Mbps (-$12/hari)</span>
          </button>

          <button
            onClick={() => leaseUpstream(250)}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg bg-cyan-950/60 border border-cyan-800/60 hover:bg-cyan-900/60 text-cyan-300 text-xs font-mono font-medium transition-all"
          >
            <Plus className="w-3.5 h-3.5 text-cyan-400" />
            <span>+250 Mbps (+$30/hari)</span>
          </button>

          <button
            onClick={() => leaseUpstream(1000)}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg bg-indigo-950/60 border border-indigo-800/60 hover:bg-indigo-900/60 text-indigo-300 text-xs font-mono font-medium transition-all"
          >
            <Plus className="w-3.5 h-3.5 text-indigo-400" />
            <span>+1,000 Mbps (+$120/hari)</span>
          </button>
        </div>
      </div>

      {/* Cost Breakdown Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2 mb-3">
          <HardDrive className="w-4 h-4 text-indigo-400" />
          Rincian Beban Operasional Harian (OPEX)
        </h2>

        <div className="space-y-3 text-xs font-mono">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              Sewa Jalur Transit Upstream ({finance.leasedUpstreamMbps} Mbps):
            </span>
            <span className="font-bold text-slate-200">${upstreamLeaseDaily} / hari</span>
          </div>

          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-indigo-400" />
              Sewa Bangunan POP / Gedung Server:
            </span>
            <span className="font-bold text-slate-200">${rentDaily} / hari</span>
          </div>

          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              Listrik Rak Server ({totalPowerWatts}W):
            </span>
            <span className="font-bold text-slate-200">${electricityDaily} / hari</span>
          </div>

          <div className="flex items-center justify-between pt-1 text-sm">
            <span className="text-slate-300 font-semibold">Total Pengeluaran Harian:</span>
            <span className="font-bold text-rose-400">-${totalDailyExpenses} / hari</span>
          </div>
        </div>
      </div>
    </div>
  )
}
