import React, { useState } from 'react'
import {
  ShoppingBag,
  Package,
  Layers,
  Cpu,
  Zap,
  Tag,
  Plus,
  Box,
  Radio,
  Cable,
  CheckCircle2,
  DollarSign
} from 'lucide-react'
import { useGameStore } from '../../store/useGameStore'
import { STORE_CATALOG } from '../../store/storeCatalog'
import { HardwareClass, StoreItemCategory } from '../../types/game'

export const StoreView: React.FC = () => {
  const buyStoreItem = useGameStore((s) => s.buyStoreItem)
  const inventory = useGameStore((s) => s.inventory)
  const cash = useGameStore((s) => s.finance.cash)

  const [selectedClass, setSelectedClass] = useState<HardwareClass | 'all'>('all')
  const [selectedCategory, setSelectedCategory] = useState<StoreItemCategory | 'all'>('all')

  const filteredItems = STORE_CATALOG.filter((item) => {
    const classMatch = selectedClass === 'all' || item.hardwareClass === selectedClass
    const catMatch = selectedCategory === 'all' || item.category === selectedCategory
    return classMatch && catMatch
  })

  const classBadges: Record<HardwareClass, { label: string; color: string; border: string }> = {
    entry: {
      label: 'Entry Tier (RT/RW Net)',
      color: 'bg-emerald-950/80 text-emerald-400',
      border: 'border-emerald-800/60'
    },
    enterprise: {
      label: 'Enterprise (Regional ISP)',
      color: 'bg-cyan-950/80 text-cyan-300',
      border: 'border-cyan-800/60'
    },
    carrier: {
      label: 'Carrier Grade (Telco Tier-1)',
      color: 'bg-indigo-950/80 text-indigo-300',
      border: 'border-indigo-800/60'
    }
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 p-6 overflow-hidden select-none font-sans">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
        <div>
          <h1 className="text-lg font-bold text-slate-100 flex items-center gap-2.5">
            <ShoppingBag className="w-5 h-5 text-cyan-400" />
            <span>Toko Perangkat & Logistik Telekomunikasi</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Distributor resmi perangkat fiber optik, router BGP, OLT, tiang beton, dan kabel feeder.
          </p>
        </div>

        {/* Filter Kelas */}
        <div className="flex items-center gap-2 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs font-mono">
          <button
            onClick={() => setSelectedClass('all')}
            className={`px-3 py-1 rounded-lg transition-all ${
              selectedClass === 'all' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Semua Kelas
          </button>
          <button
            onClick={() => setSelectedClass('entry')}
            className={`px-3 py-1 rounded-lg transition-all ${
              selectedClass === 'entry' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Entry (RT/RW)
          </button>
          <button
            onClick={() => setSelectedClass('enterprise')}
            className={`px-3 py-1 rounded-lg transition-all ${
              selectedClass === 'enterprise' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Enterprise
          </button>
          <button
            onClick={() => setSelectedClass('carrier')}
            className={`px-3 py-1 rounded-lg transition-all ${
              selectedClass === 'carrier' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Carrier Telco
          </button>
        </div>
      </div>

      {/* Main Grid: Store Items + Right Inventory Sidebar */}
      <div className="flex-1 flex gap-6 overflow-hidden pt-4">
        {/* Catalog Items */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredItems.map((item) => {
              const badge = classBadges[item.hardwareClass]
              const canAfford = cash >= item.cost

              return (
                <div
                  key={item.id}
                  className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 flex flex-col justify-between transition-all shadow-sm"
                >
                  <div>
                    {/* Brand & Class Header */}
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-mono font-bold text-cyan-400 uppercase bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                            {item.brand}
                          </span>
                          <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${badge.color} ${badge.border}`}>
                            {badge.label}
                          </span>
                        </div>
                        <h3 className="font-bold text-sm text-slate-100 mt-1 leading-tight">{item.name}</h3>
                        <div className="text-[11px] font-mono text-slate-400 mt-0.5">{item.model}</div>
                      </div>

                      <div className="text-right font-mono">
                        <div className="text-base font-bold text-emerald-400">
                          ${item.cost.toLocaleString()}
                        </div>
                        <div className="text-[10px] text-slate-500">per {item.unit}</div>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed mb-3.5 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                      {item.description}
                    </p>

                    {/* Hardware Specifications Pill */}
                    <div className="grid grid-cols-2 gap-2 text-[11px] font-mono bg-slate-950/80 p-2.5 rounded-xl border border-slate-800/60 text-slate-400 mb-4">
                      {item.throughputMbps && (
                        <div>
                          <span>Kapasitas:</span> <strong className="text-slate-200">{item.throughputMbps.toLocaleString()} Mbps</strong>
                        </div>
                      )}
                      {item.rackHeightU && (
                        <div>
                          <span>Ukuran Rak:</span> <strong className="text-slate-200">{item.rackHeightU}U</strong>
                        </div>
                      )}
                      {item.powerWatts !== undefined && (
                        <div className="flex items-center gap-1">
                          <Zap className="w-3 h-3 text-amber-400" />
                          <span>Konsumsi:</span> <strong className="text-slate-200">{item.powerWatts}W</strong>
                        </div>
                      )}
                      {item.portTypeDescription && (
                        <div className="col-span-2 text-[10px] text-cyan-400 truncate">
                          {item.portTypeDescription}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Buy Buttons */}
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-800/60">
                    <button
                      onClick={() => buyStoreItem(item.id, 1)}
                      disabled={!canAfford}
                      className={`flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                        canAfford
                          ? 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-md'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Beli 1 {item.unit}</span>
                    </button>

                    {item.category === 'civil_outdoor' && (
                      <button
                        onClick={() => buyStoreItem(item.id, 5)}
                        disabled={cash < item.cost * 5}
                        className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono font-semibold transition-colors disabled:opacity-40"
                      >
                        Beli 5x
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Right Sidebar: Current Logistics Inventory in Storage */}
        <div className="w-80 bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col justify-between shrink-0 select-none font-mono text-xs">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
              <span className="font-bold text-slate-100 flex items-center gap-2">
                <Box className="w-4 h-4 text-cyan-400" />
                <span>Gudang Logistik ISP</span>
              </span>
              <span className="text-[11px] text-slate-500">Stok Siap Pakai</span>
            </div>

            <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
              {Object.entries(inventory).map(([itemId, qty]) => {
                if (qty <= 0) return null
                const item = STORE_CATALOG.find((i) => i.id === itemId)
                if (!item) return null

                return (
                  <div
                    key={itemId}
                    className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-slate-200 text-xs leading-tight">{item.name}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{item.brand} {item.model}</div>
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-bold text-cyan-400">{qty.toLocaleString()}</span>
                      <span className="text-[10px] text-slate-500 ml-1">{item.unit}</span>
                    </div>
                  </div>
                )
              })}

              {Object.values(inventory).every((q) => q === 0) && (
                <div className="text-center py-12 text-slate-500 text-xs">
                  Gudang kosong. Beli barang di katalog sebelah kiri untuk mulai membangun!
                </div>
              )}
            </div>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] text-slate-400 mt-4">
            💡 Barang yang dibeli otomatis masuk ke inventaris dan dapat langsung ditanam di <strong>Map 2D</strong> atau dipasang di <strong>Rak Server</strong>.
          </div>
        </div>
      </div>
    </div>
  )
}
