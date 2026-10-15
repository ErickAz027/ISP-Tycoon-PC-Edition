import React, { useState, useRef } from 'react'
import {
  MousePointer,
  Building,
  Radio,
  Box,
  Trash2,
  Plus,
  Wifi,
  Server,
  Home,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Zap,
  Cable,
  Check
} from 'lucide-react'
import { useGameStore } from '../../store/useGameStore'
import { MapToolMode } from '../../types/game'

export const CityMapView: React.FC = () => {
  const mapToolMode = useGameStore((s) => s.mapToolMode)
  const setMapToolMode = useGameStore((s) => s.setMapToolMode)
  const mapBuildings = useGameStore((s) => s.mapBuildings)
  const mapHouses = useGameStore((s) => s.mapHouses)
  const mapPoles = useGameStore((s) => s.mapPoles)
  const mapOdcs = useGameStore((s) => s.mapOdcs)
  const mapOdps = useGameStore((s) => s.mapOdps)
  const mapCables = useGameStore((s) => s.mapCables)
  const inventory = useGameStore((s) => s.inventory)
  const cableStartPoint = useGameStore((s) => s.cableStartPoint)
  const inspectedMapObject = useGameStore((s) => s.inspectedMapObject)
  const inspectMapObject = useGameStore((s) => s.inspectMapObject)
  const leaseBuilding = useGameStore((s) => s.leaseBuilding)
  const buildPole = useGameStore((s) => s.buildPole)
  const placeOdc = useGameStore((s) => s.placeOdc)
  const mountOdp = useGameStore((s) => s.mountOdp)
  const startStringingCable = useGameStore((s) => s.startStringingCable)
  const finishStringingCable = useGameStore((s) => s.finishStringingCable)
  const cancelStringingCable = useGameStore((s) => s.cancelStringingCable)
  const demolishObject = useGameStore((s) => s.demolishObject)
  const setActiveTab = useGameStore((s) => s.setActiveTab)

  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const svgRef = useRef<SVGSVGElement | null>(null)

  const poleStock = inventory['item-pole-7m'] || 0
  const odcStock = inventory['item-odc-48'] || 0
  const odpStock = (inventory['item-odp-8'] || 0) + (inventory['item-odp-16'] || 0)
  const cableMeters = (inventory['item-cable-dist-500m'] || 0) + (inventory['item-cable-feeder-1000m'] || 0)

  // Handle clicking on map ground
  const handleMapClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return
    const rect = svgRef.current.getBoundingClientRect()
    const x = Math.round(e.clientX - rect.left)
    const y = Math.round(e.clientY - rect.top)

    if (mapToolMode === 'build_pole') {
      buildPole(x, y)
    } else if (mapToolMode === 'place_odc') {
      placeOdc(x, y)
    } else if (mapToolMode === 'string_cable') {
      if (cableStartPoint) {
        cancelStringingCable()
      }
    } else if (mapToolMode === 'select') {
      inspectMapObject(null)
    }
  }

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return
    const rect = svgRef.current.getBoundingClientRect()
    setMousePos({
      x: Math.round(e.clientX - rect.left),
      y: Math.round(e.clientY - rect.top)
    })
  }

  // Find inspected object data
  let inspectedData: any = null
  if (inspectedMapObject) {
    if (inspectedMapObject.type === 'building') {
      inspectedData = mapBuildings.find((b) => b.id === inspectedMapObject.id)
    } else if (inspectedMapObject.type === 'house') {
      inspectedData = mapHouses.find((h) => h.id === inspectedMapObject.id)
    } else if (inspectedMapObject.type === 'pole') {
      inspectedData = mapPoles.find((p) => p.id === inspectedMapObject.id)
    } else if (inspectedMapObject.type === 'odc') {
      inspectedData = mapOdcs.find((o) => o.id === inspectedMapObject.id)
    } else if (inspectedMapObject.type === 'odp') {
      inspectedData = mapOdps.find((o) => o.id === inspectedMapObject.id)
    }
  }

  const leasedNocBuilding = mapBuildings.find((b) => b.isLeasedByPlayer)

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 relative overflow-hidden select-none font-sans">
      {/* Top Map Construction Toolbar */}
      <div className="h-16 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between z-20 shadow-md">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {/* Tool: Select */}
          <button
            onClick={() => setMapToolMode('select')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              mapToolMode === 'select'
                ? 'bg-cyan-600 text-white shadow-md'
                : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <MousePointer className="w-3.5 h-3.5" />
            <span>Pilih & Inspeksi</span>
          </button>

          {/* Tool: Lease Building */}
          <button
            onClick={() => setMapToolMode('lease_building')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              mapToolMode === 'lease_building'
                ? 'bg-cyan-600 text-white shadow-md'
                : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <Building className="w-3.5 h-3.5" />
            <span>Sewa Gedung NOC</span>
          </button>

          {/* Tool: Place Pole */}
          <button
            onClick={() => setMapToolMode('build_pole')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              mapToolMode === 'build_pole'
                ? 'bg-amber-600 text-white shadow-md'
                : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <div className="w-2 h-3.5 bg-amber-400 rounded-sm" />
            <span>Tanam Tiang ({poleStock})</span>
          </button>

          {/* Tool: String Cable */}
          <button
            onClick={() => setMapToolMode('string_cable')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              mapToolMode === 'string_cable'
                ? 'bg-cyan-500 text-white shadow-md'
                : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <Cable className="w-3.5 h-3.5" />
            <span>Tarik Kabel FO ({cableMeters}m)</span>
          </button>

          {/* Tool: Place ODC */}
          <button
            onClick={() => setMapToolMode('place_odc')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              mapToolMode === 'place_odc'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <Box className="w-3.5 h-3.5" />
            <span>Pasang ODC ({odcStock})</span>
          </button>

          {/* Tool: Mount ODP */}
          <button
            onClick={() => setMapToolMode('mount_odp')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              mapToolMode === 'mount_odp'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Pasang ODP ({odpStock})</span>
          </button>

          {/* Tool: Demolish */}
          <button
            onClick={() => setMapToolMode('demolish')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              mapToolMode === 'demolish'
                ? 'bg-rose-600 text-white shadow-md'
                : 'bg-slate-950 text-slate-400 hover:text-rose-400 border border-slate-800'
            }`}
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Bongkar</span>
          </button>
        </div>

        {/* Quick Shortcut to Store / Server Room */}
        <div className="flex items-center gap-2">
          {leasedNocBuilding ? (
            <button
              onClick={() => setActiveTab('rack')}
              className="px-3.5 py-1.5 rounded-xl bg-cyan-950/80 border border-cyan-500/50 hover:bg-cyan-900/80 text-cyan-300 text-xs font-semibold flex items-center gap-2 shadow-sm transition-all"
            >
              <Server className="w-3.5 h-3.5 text-cyan-400" />
              <span>Masuk Ruang Server (Rak 42U)</span>
            </button>
          ) : (
            <span className="text-[11px] font-mono text-amber-400 bg-amber-950/40 px-2.5 py-1 rounded-lg border border-amber-800/50">
              *Belum ada Gedung NOC yang disewa
            </span>
          )}
        </div>
      </div>

      {/* Main 2D Canvas Viewport */}
      <div className="flex-1 relative overflow-auto bg-[#0a0f1d] cursor-crosshair">
        <svg
          ref={svgRef}
          onClick={handleMapClick}
          onMouseMove={handleMouseMove}
          className="w-[1400px] h-[900px] block"
          style={{ backgroundImage: 'radial-gradient(#1e293b 1px, transparent 1px)', backgroundSize: '24px 24px' }}
        >
          {/* Roads & Asphalt Grid */}
          <rect x={0} y={205} width={1400} height={42} fill="#111827" stroke="#1f2937" strokeWidth={1} />
          <line x1={0} y1={226} x2={1400} y2={226} stroke="#374151" strokeDasharray="12 12" strokeWidth={2} />

          <rect x={0} y={430} width={1400} height={42} fill="#111827" stroke="#1f2937" strokeWidth={1} />
          <line x1={0} y1={451} x2={1400} y2={451} stroke="#374151" strokeDasharray="12 12" strokeWidth={2} />

          <rect x={310} y={0} width={42} height={900} fill="#111827" stroke="#1f2937" strokeWidth={1} />
          <line x1={331} y1={0} x2={331} y2={900} stroke="#374151" strokeDasharray="12 12" strokeWidth={2} />

          <rect x={610} y={0} width={42} height={900} fill="#111827" stroke="#1f2937" strokeWidth={1} />
          <line x1={631} y1={0} x2={631} y2={900} stroke="#374151" strokeDasharray="12 12" strokeWidth={2} />

          {/* ODP Coverage Radii (Translucent Green/Cyan Circles) */}
          {mapOdps.map((odp) => (
            <circle
              key={`radius-${odp.id}`}
              cx={odp.x}
              cy={odp.y}
              r={odp.coverageRadius}
              fill={odp.hasSignal ? 'rgba(6, 182, 212, 0.08)' : 'rgba(239, 68, 68, 0.05)'}
              stroke={odp.hasSignal ? '#06b6d4' : '#ef4444'}
              strokeWidth={1}
              strokeDasharray="4 4"
            />
          ))}

          {/* Fiber Optic Cables */}
          {mapCables.map((cable) => {
            // Find start and end coords
            let x1 = 0, y1 = 0, x2 = 0, y2 = 0

            const findPoint = (type: string, id: string) => {
              if (type === 'building') {
                const b = mapBuildings.find((x) => x.id === id)
                return b ? { x: b.x + b.width / 2, y: b.y + b.height / 2 } : { x: 0, y: 0 }
              }
              if (type === 'odc') {
                const o = mapOdcs.find((x) => x.id === id)
                return o ? { x: o.x, y: o.y } : { x: 0, y: 0 }
              }
              if (type === 'pole') {
                const p = mapPoles.find((x) => x.id === id)
                return p ? { x: p.x, y: p.y } : { x: 0, y: 0 }
              }
              return { x: 0, y: 0 }
            }

            const p1 = findPoint(cable.fromType, cable.fromId)
            const p2 = findPoint(cable.toType, cable.toId)

            return (
              <g
                key={cable.id}
                onClick={(e) => {
                  e.stopPropagation()
                  if (mapToolMode === 'demolish') {
                    demolishObject('cable', cable.id)
                  } else {
                    inspectMapObject({ type: 'cable', id: cable.id })
                  }
                }}
                className="cursor-pointer group"
              >
                {/* Glow underlay */}
                {cable.hasSignal && (
                  <line
                    x1={p1.x}
                    y1={p1.y}
                    x2={p2.x}
                    y2={p2.y}
                    stroke="#06b6d4"
                    strokeWidth={6}
                    strokeOpacity={0.25}
                  />
                )}
                {/* Core Cable */}
                <line
                  x1={p1.x}
                  y1={p1.y}
                  x2={p2.x}
                  y2={p2.y}
                  stroke={cable.hasSignal ? '#06b6d4' : '#64748b'}
                  strokeWidth={cable.type === 'feeder' ? 3.5 : 2}
                  strokeDasharray={cable.hasSignal ? 'none' : '4 4'}
                />
              </g>
            )
          })}

          {/* Active Stringing Preview Cable */}
          {cableStartPoint && (
            <line
              x1={cableStartPoint.x}
              y1={cableStartPoint.y}
              x2={mousePos.x}
              y2={mousePos.y}
              stroke="#facc15"
              strokeWidth={2}
              strokeDasharray="4 4"
            />
          )}

          {/* Buildings */}
          {mapBuildings.map((bldg) => {
            const isNoc = bldg.isLeasedByPlayer

            return (
              <g
                key={bldg.id}
                onClick={(e) => {
                  e.stopPropagation()
                  if (mapToolMode === 'lease_building' && !isNoc) {
                    leaseBuilding(bldg.id)
                  } else if (mapToolMode === 'string_cable') {
                    if (!cableStartPoint) {
                      startStringingCable({
                        type: 'building',
                        id: bldg.id,
                        x: bldg.x + bldg.width / 2,
                        y: bldg.y + bldg.height / 2
                      })
                    } else {
                      finishStringingCable({
                        type: 'building',
                        id: bldg.id,
                        x: bldg.x + bldg.width / 2,
                        y: bldg.y + bldg.height / 2
                      })
                    }
                  } else {
                    inspectMapObject({ type: 'building', id: bldg.id })
                  }
                }}
                className="cursor-pointer"
              >
                {/* Building Base */}
                <rect
                  x={bldg.x}
                  y={bldg.y}
                  width={bldg.width}
                  height={bldg.height}
                  rx={8}
                  fill={isNoc ? '#082f49' : '#0f172a'}
                  stroke={isNoc ? '#06b6d4' : '#334155'}
                  strokeWidth={isNoc ? 2.5 : 1.5}
                  filter={isNoc ? 'drop-shadow(0 0 15px rgba(6,182,212,0.3))' : undefined}
                />

                {/* Building Roof Grid / Decor */}
                <rect
                  x={bldg.x + 8}
                  y={bldg.y + 8}
                  width={bldg.width - 16}
                  height={bldg.height - 16}
                  rx={4}
                  fill={isNoc ? '#0c4a6e' : '#1e293b'}
                />

                {/* Text Label */}
                <text
                  x={bldg.x + bldg.width / 2}
                  y={bldg.y + bldg.height / 2 - 8}
                  textAnchor="middle"
                  fill="#f8fafc"
                  fontSize="11"
                  fontWeight="bold"
                >
                  {isNoc ? '★ ISP NOC POP' : bldg.name.split(' (')[0]}
                </text>

                <text
                  x={bldg.x + bldg.width / 2}
                  y={bldg.y + bldg.height / 2 + 10}
                  textAnchor="middle"
                  fill={isNoc ? '#38bdf8' : '#94a3b8'}
                  fontSize="9"
                  fontFamily="monospace"
                >
                  {isNoc ? 'PUSAT SERVER' : `$${bldg.monthlyRent}/bulan`}
                </text>
              </g>
            )
          })}

          {/* Residential Houses */}
          {mapHouses.map((house) => {
            const hasService = house.isSubscribed

            return (
              <g
                key={house.id}
                onClick={(e) => {
                  e.stopPropagation()
                  inspectMapObject({ type: 'house', id: house.id })
                }}
                className="cursor-pointer group"
              >
                {/* House Base */}
                <rect
                  x={house.x - 22}
                  y={house.y - 20}
                  width={44}
                  height={40}
                  rx={4}
                  fill={hasService ? '#064e3b' : '#1e293b'}
                  stroke={hasService ? '#10b981' : '#334155'}
                  strokeWidth={hasService ? 2 : 1}
                />

                {/* Roof Triangle */}
                <polygon
                  points={`${house.x},${house.y - 32} ${house.x - 24},${house.y - 20} ${house.x + 24},${house.y - 20}`}
                  fill={hasService ? '#047857' : '#334155'}
                />

                {/* WiFi Indicator on roof */}
                {hasService && (
                  <circle cx={house.x} cy={house.y - 36} r={3} fill="#10b981" />
                )}

                <text
                  x={house.x}
                  y={house.y + 4}
                  textAnchor="middle"
                  fill="#e2e8f0"
                  fontSize="8"
                  fontWeight="600"
                >
                  {house.address.split('No. ')[1]}
                </text>
              </g>
            )
          })}

          {/* ODC Street Cabinets */}
          {mapOdcs.map((odc) => (
            <g
              key={odc.id}
              onClick={(e) => {
                e.stopPropagation()
                if (mapToolMode === 'demolish') {
                  demolishObject('odc', odc.id)
                } else if (mapToolMode === 'string_cable') {
                  if (!cableStartPoint) {
                    startStringingCable({ type: 'odc', id: odc.id, x: odc.x, y: odc.y })
                  } else {
                    finishStringingCable({ type: 'odc', id: odc.id, x: odc.x, y: odc.y })
                  }
                } else {
                  inspectMapObject({ type: 'odc', id: odc.id })
                }
              }}
              className="cursor-pointer"
            >
              <rect
                x={odc.x - 14}
                y={odc.y - 14}
                width={28}
                height={28}
                rx={4}
                fill="#312e81"
                stroke="#6366f1"
                strokeWidth={2}
                filter="drop-shadow(0 0 8px rgba(99,102,241,0.5))"
              />
              <text x={odc.x} y={odc.y + 4} textAnchor="middle" fill="#e0e7ff" fontSize="9" fontWeight="bold">
                ODC
              </text>
            </g>
          ))}

          {/* Concrete Utility Poles */}
          {mapPoles.map((pole) => {
            const hasOdp = !!pole.mountedOdpId

            return (
              <g
                key={pole.id}
                onClick={(e) => {
                  e.stopPropagation()
                  if (mapToolMode === 'mount_odp' && !hasOdp) {
                    mountOdp(pole.id)
                  } else if (mapToolMode === 'demolish') {
                    demolishObject('pole', pole.id)
                  } else if (mapToolMode === 'string_cable') {
                    if (!cableStartPoint) {
                      startStringingCable({ type: 'pole', id: pole.id, x: pole.x, y: pole.y })
                    } else {
                      finishStringingCable({ type: 'pole', id: pole.id, x: pole.x, y: pole.y })
                    }
                  } else {
                    inspectMapObject({ type: 'pole', id: pole.id })
                  }
                }}
                className="cursor-pointer"
              >
                {/* Pole Base Circle */}
                <circle
                  cx={pole.x}
                  cy={pole.y}
                  r={8}
                  fill="#78716c"
                  stroke="#d6d3d1"
                  strokeWidth={2}
                />

                {/* Mounted ODP Box Icon */}
                {hasOdp && (
                  <rect
                    x={pole.x - 7}
                    y={pole.y - 7}
                    width={14}
                    height={14}
                    rx={2}
                    fill="#059669"
                    stroke="#34d399"
                    strokeWidth={1.5}
                  />
                )}
              </g>
            )
          })}
        </svg>

        {/* Floating Tool Instructions */}
        <div className="absolute top-4 left-4 bg-slate-900/90 backdrop-blur-md px-3.5 py-2.5 rounded-xl border border-slate-800 text-xs font-mono text-slate-300 shadow-xl flex items-center gap-2.5">
          <HelpCircle className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>
            {mapToolMode === 'lease_building' && 'Klik Ruko / Gedung untuk menyewa ruang server NOC.'}
            {mapToolMode === 'build_pole' && 'Klik di pinggir jalan untuk menanam Tiang Beton.'}
            {mapToolMode === 'string_cable' &&
              (cableStartPoint
                ? `Menarik kabel dari titik awal (${cableStartPoint.type}). Klik titik tujuan (Gedung/Tiang/ODC)!`
                : 'Klik Gedung NOC, Tiang, atau ODC untuk mulai menarik kabel.')}
            {mapToolMode === 'place_odc' && 'Klik di dekat jalan untuk memasang lemari ODC.'}
            {mapToolMode === 'mount_odp' && 'Klik pada Tiang yang sudah berdiri untuk memasang kotak ODP.'}
            {mapToolMode === 'select' && 'Klik objek apa saja di peta untuk melihat telemetri detail.'}
            {mapToolMode === 'demolish' && 'Klik objek (tiang/ODC/kabel) untuk membongkar.'}
          </span>
        </div>
      </div>

      {/* Slide-in Inspection Drawer for Selected Map Object */}
      {inspectedData && (
        <div className="absolute right-4 bottom-4 w-84 bg-slate-900/98 border border-slate-800 rounded-2xl p-4 shadow-2xl z-30 font-mono text-xs select-none backdrop-blur-md animate-fade-in">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
            <span className="font-bold text-slate-100 flex items-center gap-1.5 uppercase">
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              {inspectedMapObject?.type} Info
            </span>
            <button onClick={() => inspectMapObject(null)} className="text-slate-500 hover:text-slate-200">
              Tutup
            </button>
          </div>

          <div className="space-y-2 text-slate-300">
            {inspectedMapObject?.type === 'building' && (
              <>
                <div className="text-sm font-bold text-cyan-400">{inspectedData.name}</div>
                <div>Status: <strong className={inspectedData.isLeasedByPlayer ? 'text-emerald-400' : 'text-slate-400'}>{inspectedData.isLeasedByPlayer ? 'Disewa (ISP NOC)' : 'Bisa Disewa'}</strong></div>
                <div>Sewa Bulanan: <strong>${inspectedData.monthlyRent} / bulan</strong></div>
                {inspectedData.isLeasedByPlayer && (
                  <button
                    onClick={() => setActiveTab('rack')}
                    className="w-full mt-2 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs"
                  >
                    Buka Ruang Rak Server (42U)
                  </button>
                )}
              </>
            )}

            {inspectedMapObject?.type === 'house' && (
              <>
                <div className="text-sm font-bold text-slate-100">{inspectedData.address}</div>
                <div>Segmen: <strong className="capitalize text-indigo-400">{inspectedData.tier}</strong></div>
                <div>Budget Maksimal: <strong>${inspectedData.budgetMax} / bulan</strong></div>
                <div>Kebutuhan Kecepatan: <strong>{inspectedData.speedRequired} Mbps</strong></div>
                <div>
                  Status Berlangganan:{' '}
                  {inspectedData.isSubscribed ? (
                    <span className="text-emerald-400 font-bold">Aktif Terhubung</span>
                  ) : (
                    <span className="text-rose-400 font-bold">Belum Ada Sinyal ODP</span>
                  )}
                </div>
              </>
            )}

            {inspectedMapObject?.type === 'odp' && (
              <>
                <div className="text-sm font-bold text-emerald-400">{inspectedData.name}</div>
                <div>Kapasitas Port: <strong>{inspectedData.capacityPorts} Rumah</strong></div>
                <div>Radius Jangkauan: <strong>{inspectedData.coverageRadius} meter</strong></div>
                <div>
                  Kondisi Sinyal:{' '}
                  {inspectedData.hasSignal ? (
                    <span className="text-emerald-400 font-bold">ONLINE (Terhubung ke NOC)</span>
                  ) : (
                    <span className="text-rose-400 font-bold">PUTUS (Tidak Ada Feeder)</span>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
