import React from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid
} from 'recharts'
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  ShieldCheck,
  Zap,
  TrendingUp,
  Server,
  Radio,
  CheckCircle2,
  XOctagon,
  MapPin,
  Home,
  Layers,
  Box
} from 'lucide-react'
import { useGameStore } from '../../store/useGameStore'

export const DashboardView: React.FC = () => {
  const metrics = useGameStore((s) => s.metrics)
  const history = useGameStore((s) => s.history)
  const alerts = useGameStore((s) => s.alerts)
  const clearAlerts = useGameStore((s) => s.clearAlerts)
  const plans = useGameStore((s) => s.plans)
  const mapHouses = useGameStore((s) => s.mapHouses)
  const mapPoles = useGameStore((s) => s.mapPoles)
  const mapOdps = useGameStore((s) => s.mapOdps)
  const serverRack = useGameStore((s) => s.serverRack)
  const gameMode = useGameStore((s) => s.gameMode)
  const setActiveTab = useGameStore((s) => s.setActiveTab)

  const totalSubscribers = metrics.totalSubscribersCount || plans.reduce((acc, p) => acc + p.activeSubscribers, 0)
  const utilizationPct =
    metrics.effectiveCapacityMbps > 0
      ? Math.round((metrics.usedBandwidthMbps / metrics.effectiveCapacityMbps) * 100)
      : 100

  const isCongested = metrics.totalDemandMbps > metrics.effectiveCapacityMbps

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 p-6 overflow-y-auto space-y-6 select-none font-sans">
      {/* Top Banner / Alert Status */}
      {isCongested && (
        <div className="bg-rose-950/50 border border-rose-500/50 text-rose-300 p-4 rounded-xl flex items-center justify-between shadow-[0_0_20px_rgba(244,63,94,0.15)] animate-pulse">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-rose-400 shrink-0" />
            <div>
              <div className="font-bold text-sm">PERINGATAN KONGESTI JARINGAN (OVERLOAD)</div>
              <div className="text-xs text-rose-400/80">
                Trafik saat ini ({metrics.totalDemandMbps.toLocaleString()} Mbps) melampaui kapasitas
                infrastruktur ({metrics.effectiveCapacityMbps.toLocaleString()} Mbps). Packet loss meningkat dan pelanggan komplain!
              </div>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('finance')}
            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-lg shadow transition-colors"
          >
            Tambah Bandwidth Upstream
          </button>
        </div>
      )}

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Live Bandwidth */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Bandwidth Utilization</span>
            <Radio className={`w-4 h-4 ${isCongested ? 'text-rose-400' : 'text-cyan-400'}`} />
          </div>
          <div className="my-2">
            <div className="text-2xl font-bold font-mono text-slate-100">
              {metrics.usedBandwidthMbps.toLocaleString()} <span className="text-xs text-slate-400">Mbps</span>
            </div>
            <div className="text-xs text-slate-400 mt-1 flex items-center justify-between">
              <span>Beban Puncak: <strong className="text-slate-300">{metrics.totalDemandMbps.toLocaleString()} Mbps</strong></span>
              <span className={`font-mono font-bold ${utilizationPct > 90 ? 'text-rose-400' : 'text-cyan-400'}`}>
                {utilizationPct}%
              </span>
            </div>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                utilizationPct > 95
                  ? 'bg-rose-500 shadow-[0_0_8px_#f43f5e]'
                  : utilizationPct > 80
                    ? 'bg-amber-400'
                    : 'bg-cyan-500'
              }`}
              style={{ width: `${Math.min(100, utilizationPct)}%` }}
            />
          </div>
        </div>

        {/* Card 2: Latency & Packet Loss */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>RTT & Integritas Paket</span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="my-2">
            <div className="text-2xl font-bold font-mono text-slate-100 flex items-baseline gap-2">
              <span>{metrics.pingMs}</span>
              <span className="text-xs text-slate-400">ms</span>
              <span className="text-xs font-normal text-slate-500">|</span>
              <span className={metrics.packetLossPct > 1 ? 'text-rose-400 text-lg' : 'text-emerald-400 text-lg'}>
                {metrics.packetLossPct}%
              </span>
              <span className="text-xs text-slate-400">loss</span>
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Kualitas:{' '}
              <span className={metrics.packetLossPct === 0 ? 'text-emerald-400 font-semibold' : 'text-rose-400 font-semibold'}>
                {metrics.packetLossPct === 0 ? 'Koneksi Optik Sempurna' : 'Degradasi Kongesti Parah'}
              </span>
            </div>
          </div>
          <div className="text-[11px] font-mono text-slate-500">
            Faktor Konkurensi: {Math.round(metrics.concurrencyFactor * 100)}% jam sibuk
          </div>
        </div>

        {/* Card 3: Houses & Subscribers */}
        <div
          onClick={() => setActiveTab(gameMode === 'realistic' ? 'map' : 'topology')}
          className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between shadow-sm cursor-pointer hover:border-slate-700 transition-colors"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Pelanggan & Rumah</span>
            <Home className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="my-2">
            <div className="text-2xl font-bold font-mono text-slate-100">
              {totalSubscribers} <span className="text-xs text-slate-400">Langganan</span>
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Jangkauan: <strong className="text-cyan-400">{metrics.activeHousesCovered}</strong> / {mapHouses.length} rumah
            </div>
          </div>
          <div className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Lihat peta sebaran pelanggan</span>
          </div>
        </div>

        {/* Card 4: Hardware & Physical Infrastructure */}
        <div
          onClick={() => setActiveTab(gameMode === 'realistic' ? 'rack' : 'topology')}
          className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between shadow-sm cursor-pointer hover:border-slate-700 transition-colors"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Infrastruktur Aktif</span>
            <Server className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="my-2">
            <div className="text-2xl font-bold font-mono text-slate-100">
              {gameMode === 'realistic' ? `${serverRack.devices.length} Alat` : `${metrics.effectiveCapacityMbps} M`}
            </div>
            <div className="text-xs text-slate-400 mt-1">
              {gameMode === 'realistic' ? (
                <span>{mapPoles.length} Tiang • {mapOdps.length} ODP Terpasang</span>
              ) : (
                <span>Kapasitas Core Routing</span>
              )}
            </div>
          </div>
          <div className="text-[11px] text-cyan-400 flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Klik untuk inspeksi fisik</span>
          </div>
        </div>
      </div>

      {/* MRTG Real-Time Bandwidth Graph */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-radar" />
              MRTG Real-Time Bandwidth Monitor (Mbps)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Telemetri real-time memantau Kebutuhan Trafik vs Kapasitas Infrastruktur
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-1.5 rounded-sm bg-cyan-400" />
              <span className="text-slate-300">Throughput Terpakai</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-1.5 rounded-sm bg-amber-400" />
              <span className="text-slate-300">Beban Puncak</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-0.5 bg-rose-500 dashed" />
              <span className="text-slate-300">Batas Kapasitas</span>
            </div>
          </div>
        </div>

        <div className="h-64 w-full">
          {history.length > 1 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="usageGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="demandGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} domain={[0, 'auto']} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#090d16',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: '#f8fafc'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="capacity"
                  stroke="#ef4444"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  fill="none"
                  isAnimationActive={false}
                />
                <Area
                  type="monotone"
                  dataKey="demand"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#demandGradient)"
                  isAnimationActive={false}
                />
                <Area
                  type="monotone"
                  dataKey="usage"
                  stroke="#06b6d4"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#usageGradient)"
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-500 font-mono text-xs">
              Menunggu telemetri sinyal jaringan...
            </div>
          )}
        </div>
      </div>

      {/* Split Row: Latency Graph & NOC Alerts Log */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Latency History */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
          <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2 mb-3">
            <Activity className="w-4 h-4 text-emerald-400" />
            Latensi RTT (ms) & Packet Loss (%)
          </h2>
          <div className="h-44 w-full">
            {history.length > 1 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={history} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="2 2" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#64748b" tick={{ fontSize: 10 }} domain={[0, 'auto']} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#090d16',
                      borderColor: '#334155',
                      borderRadius: '8px',
                      fontSize: '11px',
                      color: '#f8fafc'
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="ping"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={false}
                    isAnimationActive={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="packetLoss"
                    stroke="#f43f5e"
                    strokeWidth={2}
                    dot={false}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500 font-mono text-xs">
                Menunggu grafik latensi...
              </div>
            )}
          </div>
        </div>

        {/* Live NOC Alerts Stream */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              Log Keamanan & Insiden NOC
            </h2>
            <button
              onClick={clearAlerts}
              className="text-xs text-slate-400 hover:text-slate-200 transition-colors"
            >
              Hapus Log
            </button>
          </div>

          <div className="space-y-2 h-44 overflow-y-auto pr-1">
            {alerts.length === 0 ? (
              <div className="text-center py-10 text-xs text-slate-500 font-mono">
                Semua sistem nominal. Tidak ada insiden jaringan.
              </div>
            ) : (
              alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-2.5 rounded-lg border text-xs font-mono flex items-start gap-2.5 ${
                    alert.type === 'danger'
                      ? 'bg-rose-950/40 border-rose-800/60 text-rose-300'
                      : alert.type === 'warning'
                        ? 'bg-amber-950/40 border-amber-800/60 text-amber-300'
                        : alert.type === 'success'
                          ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300'
                          : 'bg-slate-950/80 border-slate-800 text-slate-300'
                  }`}
                >
                  {alert.type === 'danger' && <XOctagon className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />}
                  {alert.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />}
                  {alert.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />}
                  {alert.type === 'info' && <Radio className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />}

                  <div className="flex-1">
                    <span className="text-[10px] text-slate-500 mr-2">[{alert.timestamp}]</span>
                    <span>{alert.message}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
