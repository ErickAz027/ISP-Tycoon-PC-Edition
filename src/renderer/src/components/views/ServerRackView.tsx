import React, { useState } from 'react'
import {
  Server,
  Zap,
  Power,
  Layers,
  ArrowRight,
  Trash2,
  Cpu,
  Share2,
  Globe,
  Router as RouterIcon,
  HelpCircle,
  Plus,
  Box
} from 'lucide-react'
import { useGameStore } from '../../store/useGameStore'
import { STORE_CATALOG } from '../../store/storeCatalog'

export const ServerRackView: React.FC = () => {
  const serverRack = useGameStore((s) => s.serverRack)
  const serverRoomViewMode = useGameStore((s) => s.serverRoomViewMode)
  const setServerRoomViewMode = useGameStore((s) => s.setServerRoomViewMode)
  const selectedPortForPatching = useGameStore((s) => s.selectedPortForPatching)
  const startPatchingCable = useGameStore((s) => s.startPatchingCable)
  const connectPatchCable = useGameStore((s) => s.connectPatchCable)
  const removePatchCable = useGameStore((s) => s.removePatchCable)
  const toggleDevicePower = useGameStore((s) => s.toggleDevicePower)
  const unmountRackDevice = useGameStore((s) => s.unmountRackDevice)
  const mountRackDevice = useGameStore((s) => s.mountRackDevice)
  const inventory = useGameStore((s) => s.inventory)

  const [selectedSlotForMounting, setSelectedSlotForMounting] = useState<number | null>(null)

  // Hardware items available in inventory for rack mounting
  const mountableCatalog = STORE_CATALOG.filter(
    (item) => item.category === 'rack_hardware' && item.rackHeightU && item.rackHeightU <= 6
  )

  const handlePortClick = (deviceId: string, portId: string) => {
    if (!selectedPortForPatching) {
      startPatchingCable(deviceId, portId)
    } else {
      connectPatchCable(deviceId, portId)
    }
  }

  // Generate 42U Slots (Render from top U42 down to U1 like a real datacenter rack)
  const uSlots = Array.from({ length: 42 }, (_, i) => 42 - i)

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 p-6 overflow-hidden select-none font-sans">
      {/* Top Header with 2D vs 3D Room Toggle */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
        <div>
          <h1 className="text-lg font-bold text-slate-100 flex items-center gap-2.5">
            <Server className="w-5 h-5 text-cyan-400" />
            <span>NOC Server Room & 42U Rackmount Simulator</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Atur posisi perangkat, saklar daya listrik, dan patching kabel jumper fiber optik antar port secara fisik.
          </p>
        </div>

        {/* 2D vs 3D Room View Switcher */}
        <div className="flex items-center gap-2 bg-slate-900 p-1 rounded-xl border border-slate-800 font-mono text-xs">
          <button
            onClick={() => setServerRoomViewMode('2d')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              serverRoomViewMode === '2d'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            2D Rack View
          </button>

          {/* 3D Button - Disabled with Hover Tooltip */}
          <div className="relative group">
            <button
              disabled
              className="px-3 py-1.5 rounded-lg text-slate-600 cursor-not-allowed bg-slate-950/60 border border-slate-800/50 flex items-center gap-1.5"
            >
              <span>3D Server Room</span>
              <span className="text-[9px] px-1 bg-amber-950/80 text-amber-400 rounded">SOON</span>
            </button>

            {/* Hover Tooltip */}
            <div className="absolute right-0 top-full mt-2 hidden group-hover:block w-64 p-2.5 bg-slate-900 border border-amber-500/50 rounded-xl shadow-2xl text-[11px] text-amber-300 font-sans z-50 animate-fade-in">
              <div className="font-bold mb-0.5">🚧 Fitur Sedang Dikembangkan</div>
              <div>Mode 3D Server Room interaktif sedang dalam proses pembuatan untuk pembaruan berikutnya.</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Rack Viewport Container */}
      <div className="flex-1 flex gap-6 overflow-hidden pt-4">
        {/* Left: 42U Physical Server Rack Chassis */}
        <div className="flex-1 bg-slate-900/90 border-2 border-slate-700 rounded-2xl p-4 overflow-y-auto flex flex-col items-center relative shadow-2xl">
          {/* Rack Header Branding */}
          <div className="w-full max-w-2xl bg-slate-950 border border-slate-800 rounded-xl p-2.5 mb-3 flex items-center justify-between text-xs font-mono text-slate-400">
            <span className="font-bold text-slate-200">APC NetShelter SX 42U - Rack #01</span>
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>AC Daya: 220V 50Hz</span>
            </span>
          </div>

          {/* 19" Rack Rails & Slots Container */}
          <div className="w-full max-w-2xl bg-black/80 border-x-4 border-slate-700 rounded-b-xl flex flex-col relative p-2 shadow-inner">
            {uSlots.map((u) => {
              // Find device starting at this slot
              const deviceAtSlot = serverRack.devices.find((d) => d.uSlot === u)
              // Check if covered by taller device
              const isCoveredByTaller = serverRack.devices.some(
                (d) => d.uSlot < u && u < d.uSlot + d.uHeight
              )

              if (isCoveredByTaller) return null

              if (deviceAtSlot) {
                // Render Mounted Device Faceplate
                const heightPx = deviceAtSlot.uHeight * 44

                return (
                  <div
                    key={`u-${u}`}
                    style={{ height: `${heightPx}px` }}
                    className={`w-full rounded-lg border my-1 p-2 flex items-center justify-between transition-all select-none relative ${
                      deviceAtSlot.isPowered
                        ? 'bg-slate-900/95 border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                        : 'bg-slate-950/90 border-slate-800 opacity-60'
                    }`}
                  >
                    {/* Left: Device Brand & Model Info */}
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col items-center justify-center font-mono text-[9px] text-slate-500 w-6">
                        <span>U{u}</span>
                      </div>

                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] uppercase font-bold text-cyan-400 bg-cyan-950/80 px-1.5 py-0.5 rounded">
                            {deviceAtSlot.brand}
                          </span>
                          <span className="text-xs font-bold text-slate-100">{deviceAtSlot.model}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono mt-0.5">
                          {deviceAtSlot.maxThroughputMbps.toLocaleString()} Mbps • {deviceAtSlot.powerWatts}W
                        </span>
                      </div>
                    </div>

                    {/* Center: Physical Ports Array */}
                    <div className="flex items-center gap-1.5 bg-slate-950/80 p-1.5 rounded-lg border border-slate-800">
                      {deviceAtSlot.ports.map((port) => {
                        const isPatchingThis =
                          selectedPortForPatching?.deviceId === deviceAtSlot.id &&
                          selectedPortForPatching?.portId === port.id

                        const isConnected = serverRack.patchCables.some(
                          (c) =>
                            (c.fromDeviceId === deviceAtSlot.id && c.fromPortId === port.id) ||
                            (c.toDeviceId === deviceAtSlot.id && c.toPortId === port.id)
                        )

                        return (
                          <button
                            key={port.id}
                            onClick={() => handlePortClick(deviceAtSlot.id, port.id)}
                            title={`${port.name} (${port.type.toUpperCase()})`}
                            className={`w-7 h-7 rounded flex flex-col items-center justify-center text-[8px] font-mono border transition-all ${
                              isPatchingThis
                                ? 'bg-amber-400 border-amber-300 text-black font-bold animate-pulse'
                                : isConnected
                                  ? 'bg-cyan-950 border-cyan-400 text-cyan-300 shadow-[0_0_8px_#06b6d4]'
                                  : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500'
                            }`}
                          >
                            <span>{port.name.slice(0, 3)}</span>
                            <span
                              className={`w-1.5 h-1.5 rounded-full mt-0.5 ${
                                isConnected && deviceAtSlot.isPowered ? 'bg-emerald-400 animate-pulse' : 'bg-slate-700'
                              }`}
                            />
                          </button>
                        )
                      })}
                    </div>

                    {/* Right: Power Switch & Unmount Controls */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleDevicePower(deviceAtSlot.id)}
                        title={deviceAtSlot.isPowered ? 'Matikan Perangkat' : 'Nyalakan Perangkat'}
                        className={`p-1.5 rounded-lg border transition-all ${
                          deviceAtSlot.isPowered
                            ? 'bg-emerald-950 text-emerald-400 border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                            : 'bg-slate-950 text-slate-500 border-slate-800'
                        }`}
                      >
                        <Power className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => unmountRackDevice(deviceAtSlot.id)}
                        title="Bongkar dari rak"
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )
              }

              // Render Empty Slot U
              return (
                <div
                  key={`u-${u}`}
                  onClick={() => setSelectedSlotForMounting(u)}
                  className="h-10 w-full border border-dashed border-slate-800/80 rounded my-0.5 flex items-center justify-between px-3 text-[10px] font-mono text-slate-600 hover:border-cyan-500/50 hover:bg-cyan-950/10 cursor-pointer transition-colors group"
                >
                  <span className="w-6">U{u}</span>
                  <span className="opacity-0 group-hover:opacity-100 text-cyan-400 flex items-center gap-1">
                    <Plus className="w-3 h-3" />
                    <span>Pasang Alat di U{u}</span>
                  </span>
                  <span className="w-6 text-right">--</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Right Sidebar: Patch Cables List & Equipment Mounting Drawer */}
        <div className="w-88 flex flex-col gap-4 overflow-y-auto shrink-0 select-none font-mono text-xs">
          {/* Active Patch Cables List */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
              <span className="font-bold text-slate-100 flex items-center gap-2">
                <Share2 className="w-4 h-4 text-cyan-400" />
                <span>Kabel Patch Fiber Optik ({serverRack.patchCables.length})</span>
              </span>
            </div>

            {selectedPortForPatching && (
              <div className="bg-amber-950/40 border border-amber-500/50 p-2.5 rounded-xl text-amber-300 text-xs mb-3 flex items-center gap-2 animate-pulse">
                <HelpCircle className="w-4 h-4 shrink-0" />
                <span>Pilih port tujuan pada perangkat lain untuk menancapkan kabel jumper!</span>
              </div>
            )}

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {serverRack.patchCables.length === 0 ? (
                <div className="text-center py-6 text-slate-500 text-[11px]">
                  Belum ada kabel jumper. Klik 2 port pada alat di rak untuk menghubungkannya!
                </div>
              ) : (
                serverRack.patchCables.map((cable) => (
                  <div
                    key={cable.id}
                    className="p-2 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2 text-[11px] text-slate-300">
                      <div className="w-2.5 h-2.5 rounded-full bg-yellow-400 shadow-[0_0_6px_#facc15]" />
                      <span>Patch FO 10G</span>
                    </div>

                    <button
                      onClick={() => removePatchCable(cable.id)}
                      className="text-slate-500 hover:text-rose-400 p-1"
                      title="Cabut kabel"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Mountable Hardware from Inventory */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm flex-1 flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
              <span className="font-bold text-slate-100 flex items-center gap-2">
                <Box className="w-4 h-4 text-indigo-400" />
                <span>Alat di Gudang (Siap Pasang)</span>
              </span>
            </div>

            <div className="flex-1 space-y-2.5 overflow-y-auto pr-1">
              {mountableCatalog.map((item) => {
                const stock = inventory[item.id] || 0
                if (stock <= 0) return null

                return (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-all flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-slate-200 text-xs">{item.brand} {item.model}</div>
                      <div className="text-[10px] text-cyan-400 mt-0.5">{item.name} ({item.rackHeightU}U)</div>
                      <div className="text-[10px] text-slate-500">Stok: {stock} unit</div>
                    </div>

                    <button
                      onClick={() => {
                        const targetU = selectedSlotForMounting || 1
                        mountRackDevice(item.id, targetU)
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-[11px] font-semibold transition-colors"
                    >
                      Pasang di U{selectedSlotForMounting || 1}
                    </button>
                  </div>
                )
              })}

              {mountableCatalog.every((item) => (inventory[item.id] || 0) === 0) && (
                <div className="text-center py-10 text-slate-500 text-xs font-sans">
                  Tidak ada alat server di gudang. Beli Core Router, OLT, atau ODF dari menu Toko Hardware terlebih dahulu!
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
