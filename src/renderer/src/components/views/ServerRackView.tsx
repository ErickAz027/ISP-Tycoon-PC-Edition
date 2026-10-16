import React, { useState, useRef, useEffect } from 'react'
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
  Box,
  Cable,
  Activity,
  Wifi,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Wind,
  Monitor,
  Scissors,
  CornerDownRight,
  RotateCcw,
  Compass
} from 'lucide-react'
import { useGameStore } from '../../store/useGameStore'
import { STORE_CATALOG } from '../../store/storeCatalog'
import { RoomCableType, RoomCableEndpoint } from '../../types/game'

export const ServerRackView: React.FC = () => {
  const serverRack = useGameStore((s) => s.serverRack)
  const serverBuilding = useGameStore((s) => s.serverBuilding)
  const serverRoomViewMode = useGameStore((s) => s.serverRoomViewMode)
  const setServerRoomViewMode = useGameStore((s) => s.setServerRoomViewMode)
  const inventory = useGameStore((s) => s.inventory)
  const mapBuildings = useGameStore((s) => s.mapBuildings)
  const setActiveTab = useGameStore((s) => s.setActiveTab)

  // Actions
  const togglePlnMcb = useGameStore((s) => s.togglePlnMcb)
  const toggleModemPower = useGameStore((s) => s.toggleModemPower)
  const setServerBuildingSubView = useGameStore((s) => s.setServerBuildingSubView)
  const setSelectedCableTool = useGameStore((s) => s.setSelectedCableTool)
  const selectCableEndpoint = useGameStore((s) => s.selectCableEndpoint)
  const connectRoomCable = useGameStore((s) => s.connectRoomCable)
  const removeRoomCable = useGameStore((s) => s.removeRoomCable)
  const updateRoomCablePoints = useGameStore((s) => s.updateRoomCablePoints)
  const toggleDevicePower = useGameStore((s) => s.toggleDevicePower)
  const unmountRackDevice = useGameStore((s) => s.unmountRackDevice)
  const mountRackDevice = useGameStore((s) => s.mountRackDevice)

  // Interactive Drawing & Waypoints State
  const [drawingWaypoints, setDrawingWaypoints] = useState<{ x: number; y: number }[]>([])
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number } | null>(null)
  const [isOrthoLock, setIsOrthoLock] = useState<boolean>(true) // Mode Siku 90 Derajat (Garis Beraturan)
  const [redrawingCableId, setRedrawingCableId] = useState<string | null>(null)
  const svgRef = useRef<SVGSVGElement | null>(null)

  const [selectedSlotForMounting, setSelectedSlotForMounting] = useState<number | null>(null)

  const leasedBuilding = mapBuildings.find((b) => b.isLeasedByPlayer)
  const subView = serverBuilding.subView
  const selectedTool = serverBuilding.selectedCableTool
  const selectedEndpoint = serverBuilding.selectedEndpoint

  // Cable stocks from inventory
  const powerStock = inventory['item-cable-power-ac'] || 0
  const lanStock = inventory['item-cable-lan-cat6'] || 0
  const fiberStock = inventory['item-patch-cord-fiber'] || 0

  // Hardware items available in inventory for rack mounting
  const mountableCatalog = STORE_CATALOG.filter(
    (item) => item.category === 'rack_hardware' && item.rackHeightU && item.rackHeightU <= 6
  )

  // Calculate live pipeline diagnostics
  const isMcbOn = serverBuilding.plnBreaker.isMcbOn
  const roomCables = serverBuilding.roomCables

  const modemPowerCable = roomCables.find(
    (c) =>
      c.type === 'power' &&
      ((c.from.type === 'upstream_modem' && c.from.portId === 'modem-pwr') ||
       (c.to.type === 'upstream_modem' && c.to.portId === 'modem-pwr'))
  )
  const isModemPowered = isMcbOn && !!modemPowerCable && serverBuilding.upstreamModem.isPowered

  const routerDev = serverRack.devices.find((d) => d.type === 'core_router')
  const routerPowerCable = routerDev && roomCables.find(
    (c) =>
      c.type === 'power' &&
      ((c.from.deviceId === routerDev.id && c.from.portId === 'pwr-1') ||
       (c.to.deviceId === routerDev.id && c.to.portId === 'pwr-1'))
  )
  const isRouterPowered = isMcbOn && !!routerPowerCable && (routerDev ? routerDev.isPowered : false)

  const isModemConnectedToRouter = isModemPowered && isRouterPowered && roomCables.some(
    (c) =>
      c.type === 'lan' &&
      ((c.from.type === 'upstream_modem' && c.to.deviceId === routerDev?.id) ||
       (c.to.type === 'upstream_modem' && c.from.deviceId === routerDev?.id))
  )

  const oltDev = serverRack.devices.find((d) => d.type === 'gpon_olt')
  const oltPowerCable = oltDev && roomCables.find(
    (c) =>
      c.type === 'power' &&
      ((c.from.deviceId === oltDev.id && c.from.portId === 'pwr-1') ||
       (c.to.deviceId === oltDev.id && c.to.portId === 'pwr-1'))
  )
  const isOltPowered = isMcbOn && !!oltPowerCable && (oltDev ? oltDev.isPowered : false)

  const isRouterConnectedToOlt = isRouterPowered && isOltPowered && (
    roomCables.some(
      (c) =>
        c.type === 'fiber' &&
        ((c.from.deviceId === routerDev?.id && c.to.deviceId === oltDev?.id) ||
         (c.to.deviceId === routerDev?.id && c.from.deviceId === oltDev?.id))
    ) ||
    serverRack.patchCables.some(
      (p) =>
        (p.fromDeviceId === routerDev?.id && p.toDeviceId === oltDev?.id) ||
        (p.fromDeviceId === oltDev?.id && p.toDeviceId === routerDev?.id)
    )
  )

  const isOltConnectedToOdfWall = isOltPowered && (
    roomCables.some(
      (c) =>
        c.type === 'fiber' &&
        ((c.from.deviceId === oltDev?.id && c.to.type === 'odf_wall') ||
         (c.to.deviceId === oltDev?.id && c.from.type === 'odf_wall'))
    ) ||
    serverRack.patchCables.some(
      (p) =>
        (p.fromDeviceId === oltDev?.id && serverRack.devices.find(d => d.id === p.toDeviceId)?.type === 'odf_patch_panel') ||
        (p.toDeviceId === oltDev?.id && serverRack.devices.find(d => d.id === p.fromDeviceId)?.type === 'odf_patch_panel')
    )
  )

  const isFullPipelineOnline = isModemConnectedToRouter && isRouterConnectedToOlt && isOltConnectedToOdfWall

  // Dynamic layout calculator for all rack devices inside the 19" 42U rack
  const rackDeviceLayout = React.useMemo(() => {
    const sorted = [...serverRack.devices].sort((a, b) => b.uSlot - a.uSlot)
    const map: Record<
      string,
      {
        device: (typeof serverRack.devices)[0]
        relY: number
        height: number
        ports: Record<string, { x: number; y: number; relX: number; relY: number; width: number; height: number }>
      }
    > = {}

    let curY = 42
    for (const dev of sorted) {
      // Determine device height based on U size
      let devHeight = dev.uHeight === 1 ? (dev.type === 'odf_patch_panel' ? 38 : 50) : dev.uHeight === 2 ? 62 : 76
      let devRelY = curY

      // Precise backwards-compatible alignment for default starter equipment
      if (dev.id === 'dev-odf-panduit' || dev.type === 'odf_patch_panel') {
        devRelY = 42
        devHeight = 38
      } else if (dev.id === 'dev-router-mikrotik' && dev.uSlot >= 36) {
        devRelY = 88
        devHeight = 50
      } else if (dev.id === 'dev-olt-zte' && dev.uSlot >= 33) {
        devRelY = 160
        devHeight = 64
      } else if (dev.id === 'dev-ups-apc' && dev.uSlot >= 30) {
        devRelY = 236
        devHeight = 58
      }

      const portCenterY = 110 + devRelY + Math.round(devHeight / 2)
      const portBtnH = 22
      const portRelY = Math.round((devHeight - portBtnH) / 2)
      const portMap: Record<string, { x: number; y: number; relX: number; relY: number; width: number; height: number }> = {}

      // Identify power ports vs data ports
      const pwrPorts = dev.ports.filter(
        (p) => p.type === 'power_ac' || p.id.includes('pwr')
      )
      const dataPorts = dev.ports.filter((p) => !pwrPorts.includes(p))

      // 1. Power Ports
      pwrPorts.forEach((p, idx) => {
        const absX = 632 + idx * 42
        const relX = absX - 470 - 20
        portMap[p.id] = {
          x: absX,
          y: portCenterY,
          relX: relX - 22,
          relY: portRelY,
          width: 44,
          height: portBtnH
        }
      })

      // 2. Data / Fiber Ports
      if (dev.type === 'odf_patch_panel') {
        dataPorts.forEach((p, idx) => {
          const absX = idx === 0 ? 672 : idx === 1 ? 747 : 747 + (idx - 1) * 45
          const relX = absX - 470 - 20
          portMap[p.id] = {
            x: absX,
            y: portCenterY,
            relX: relX - 30,
            relY: portRelY,
            width: 60,
            height: portBtnH
          }
        })
      } else {
        dataPorts.forEach((p, idx) => {
          let absX = 695
          if (p.id === 'wan-1' || p.id === 'uplink-1' || p.id === 'out-1') {
            absX = 695
          } else if (p.id === 'lan-1') {
            absX = 730
          } else if (p.id === 'sfp-1' || p.id === 'pon-1' || p.id === 'out-2') {
            absX = 765
          } else if (p.id === 'sfp-2' || p.id === 'pon-2') {
            absX = 795
          } else {
            absX = 695 + idx * 36
          }
          const relX = absX - 470 - 20
          portMap[p.id] = {
            x: absX,
            y: portCenterY,
            relX: relX - 28,
            relY: portRelY,
            width: 56,
            height: portBtnH
          }
        })
      }

      map[dev.id] = {
        device: dev,
        relY: devRelY,
        height: devHeight,
        ports: portMap
      }

      curY = Math.max(curY + devHeight + 6, devRelY + devHeight + 6)
    }

    return map
  }, [serverRack.devices])

  // Coordinate resolution helper for all room ports
  const getEndpointCoord = (ep: RoomCableEndpoint): { x: number; y: number } => {
    if (ep.type === 'pln_socket') {
      if (ep.portId === 'socket-wall-desk') return { x: 190, y: 137 }
      if (ep.portId === 'socket-wall-rack') return { x: 190, y: 167 }
    }
    if (ep.type === 'upstream_modem') {
      if (ep.portId === 'modem-pwr') return { x: 135, y: 342 }
      if (ep.portId === 'modem-lan1') return { x: 202, y: 342 }
      if (ep.portId === 'modem-lan2') return { x: 297, y: 342 }
    }
    if (ep.type === 'rack_device') {
      if (ep.deviceId && rackDeviceLayout[ep.deviceId]?.ports[ep.portId]) {
        const pt = rackDeviceLayout[ep.deviceId].ports[ep.portId]
        return { x: pt.x, y: pt.y }
      }
      // Fallback matching by device type or port
      const matchedDev = serverRack.devices.find(
        (d) => d.id === ep.deviceId || d.ports.some((p) => p.id === ep.portId)
      )
      if (matchedDev && rackDeviceLayout[matchedDev.id]?.ports[ep.portId]) {
        const pt = rackDeviceLayout[matchedDev.id].ports[ep.portId]
        return { x: pt.x, y: pt.y }
      }
      // Hardcoded fallback safety
      if (ep.portId === 'pwr-1' && ep.deviceId?.includes('router')) return { x: 632, y: 221 }
      if (ep.portId === 'pwr-1' && ep.deviceId?.includes('olt')) return { x: 632, y: 303 }
      if (ep.portId === 'pwr-in') return { x: 632, y: 375 }
      if (ep.portId === 'wan-1') return { x: 695, y: 221 }
      if (ep.portId === 'lan-1') return { x: 730, y: 221 }
      if (ep.portId === 'sfp-1') return { x: 765, y: 221 }
      if (ep.portId === 'sfp-2') return { x: 795, y: 221 }
      if (ep.portId === 'uplink-1') return { x: 695, y: 303 }
      if (ep.portId === 'pon-1') return { x: 765, y: 303 }
      if (ep.portId === 'sc-1') return { x: 672, y: 170 }
      if (ep.portId === 'sc-2') return { x: 747, y: 170 }
    }
    if (ep.type === 'odf_wall') {
      if (ep.portId === 'wall-feeder-1') return { x: 915, y: 298 }
      if (ep.portId === 'wall-feeder-2') return { x: 915, y: 333 }
    }
    return { x: 500, y: 300 }
  }

  // Automatic Orthogonal Structured Line Generator (fallback when no custom points drawn)
  const generateDefaultOrthogonalPoints = (
    p1: { x: number; y: number },
    p2: { x: number; y: number },
    type: RoomCableType
  ): { x: number; y: number }[] => {
    if (type === 'lan') {
      // Clean structured routing up into overhead tray, along tray, down into rack
      return [
        p1,
        { x: p1.x, y: 260 },
        { x: 230, y: 260 },
        { x: 230, y: 82 },
        { x: p2.x, y: 82 },
        p2
      ]
    }
    if (type === 'power') {
      // Wall conduit routing (horizontal wall channel)
      return [
        p1,
        { x: p1.x + 30, y: p1.y },
        { x: p1.x + 30, y: 110 },
        { x: p2.x, y: 110 },
        p2
      ]
    }
    // Fiber optic: neat 90 degree rack duct routing
    if (p2.x > 850) {
      // Exiting to ODF wall
      return [
        p1,
        { x: 825, y: p1.y },
        { x: 825, y: p2.y },
        p2
      ]
    }
    // Vertical rack organizer
    return [
      p1,
      { x: 810, y: p1.y },
      { x: 810, y: p2.y },
      p2
    ]
  }

  // Build SVG polyline/path string from array of points
  const buildPathD = (points: { x: number; y: number }[]): string => {
    if (!points || points.length === 0) return ''
    return points.reduce((acc, pt, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${pt.x} ${pt.y}`, '')
  }

  // Get current active anchor point during drawing
  const currentAnchorPoint = selectedEndpoint
    ? drawingWaypoints.length > 0
      ? drawingWaypoints[drawingWaypoints.length - 1]
      : getEndpointCoord(selectedEndpoint)
    : null

  // Mouse move handler on SVG canvas for drawing preview
  const handleSvgMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return
    const rect = svgRef.current.getBoundingClientRect()
    const rawX = Math.round(((e.clientX - rect.left) / rect.width) * 1100)
    const rawY = Math.round(((e.clientY - rect.top) / rect.height) * 620)

    if (selectedEndpoint && currentAnchorPoint && isOrthoLock) {
      // Orthogonal 90-degree lock: snap to strictly horizontal or vertical segment
      const dx = Math.abs(rawX - currentAnchorPoint.x)
      const dy = Math.abs(rawY - currentAnchorPoint.y)
      if (dx >= dy) {
        setCursorPos({ x: rawX, y: currentAnchorPoint.y })
      } else {
        setCursorPos({ x: currentAnchorPoint.x, y: rawY })
      }
    } else {
      setCursorPos({ x: rawX, y: rawY })
    }
  }

  // Click on SVG canvas background to add intermediate waypoint
  const handleCanvasClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!selectedEndpoint || !selectedTool || selectedTool === 'unplug') return
    if (!cursorPos) return

    // Add waypoint to path
    setDrawingWaypoints((prev) => [...prev, cursorPos])
  }

  // Handle clicking on endpoints in 2D building view
  const handleEndpointClick = (endpoint: RoomCableEndpoint) => {
    if (selectedTool === 'unplug') {
      const connectedCable = roomCables.find(
        (c) =>
          (c.from.type === endpoint.type && c.from.deviceId === endpoint.deviceId && c.from.portId === endpoint.portId) ||
          (c.to.type === endpoint.type && c.to.deviceId === endpoint.deviceId && c.to.portId === endpoint.portId)
      )
      if (connectedCable) {
        removeRoomCable(connectedCable.id)
      }
      return
    }

    if (!selectedTool) return

    if (!selectedEndpoint) {
      // Step 1: Select start port
      selectCableEndpoint(endpoint)
      setDrawingWaypoints([])
    } else {
      // Step 2: Finalize cable connection at target port
      if (selectedEndpoint.type === endpoint.type && selectedEndpoint.portId === endpoint.portId) {
        // Clicked same port, cancel
        selectCableEndpoint(null)
        setDrawingWaypoints([])
        return
      }

      const pStart = getEndpointCoord(selectedEndpoint)
      const pEnd = getEndpointCoord(endpoint)

      // Final points array: [Start, ...custom waypoints, End]
      let finalPoints: { x: number; y: number }[]
      if (drawingWaypoints.length > 0) {
        finalPoints = [pStart, ...drawingWaypoints, pEnd]
      } else {
        // Automatic structured orthogonal routing
        finalPoints = generateDefaultOrthogonalPoints(pStart, pEnd, selectedTool)
      }

      if (redrawingCableId) {
        updateRoomCablePoints(redrawingCableId, finalPoints)
        setRedrawingCableId(null)
      } else {
        connectRoomCable(selectedEndpoint, endpoint, selectedTool, finalPoints)
      }

      setDrawingWaypoints([])
      selectCableEndpoint(null)
    }
  }

  // Start redrawing an existing cable's path
  const handleStartRedrawCable = (cable: typeof roomCables[0]) => {
    setSelectedCableTool(cable.type)
    selectCableEndpoint(cable.from)
    setDrawingWaypoints([])
    setRedrawingCableId(cable.id)
    setServerBuildingSubView('building_room')
  }

  // Undo last waypoint
  const handleUndoWaypoint = () => {
    setDrawingWaypoints((prev) => prev.slice(0, -1))
  }

  // Cancel drawing
  const handleCancelDrawing = () => {
    selectCableEndpoint(null)
    setDrawingWaypoints([])
    setRedrawingCableId(null)
  }

  // Keyboard shortcut listener (Escape to cancel, Backspace to undo point)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleCancelDrawing()
      } else if (e.key === 'Backspace' && drawingWaypoints.length > 0) {
        handleUndoWaypoint()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [drawingWaypoints])

  // Generate 42U Slots
  const uSlots = Array.from({ length: 42 }, (_, i) => 42 - i)

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 p-5 overflow-hidden select-none font-sans text-slate-100">
      {/* 1. Top Header & Building Title */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Server className="w-5 h-5 text-cyan-400" />
              <span>NOC Server Room & Manajemen Jalur Kabel Fisik</span>
            </h1>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold flex items-center gap-1.5 border ${
                isFullPipelineOnline
                  ? 'bg-emerald-950/80 text-emerald-400 border-emerald-500/50 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                  : 'bg-rose-950/80 text-rose-400 border-rose-500/50 animate-pulse'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isFullPipelineOnline ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`} />
              {isFullPipelineOnline ? 'PIPELINE FTTH ONLINE (1,000 Mbps)' : 'PIPELINE KABEL BELUM LENGKAP'}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
            <span>Lokasi: {leasedBuilding ? leasedBuilding.name : 'Gedung Server Belum Disewa'}</span>
            <span className="text-slate-600">•</span>
            <span>Gambar jalur kabel beraturan (siku 90° melalui tray & duct dinding) atau sambungkan port secara instan.</span>
          </p>
        </div>

        {/* View Mode Switchers & 3D Hover Tooltip */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs font-mono">
            <button
              onClick={() => setServerBuildingSubView('building_room')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                subView === 'building_room'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Box className="w-3.5 h-3.5" />
              <span>Denah Ruangan 2D</span>
            </button>
            <button
              onClick={() => setServerBuildingSubView('rack_closeup')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                subView === 'rack_closeup'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Server className="w-3.5 h-3.5" />
              <span>Detail Rak 42U</span>
            </button>
          </div>

          {/* 3D Button - Disabled with Hover Tooltip */}
          <div className="relative group">
            <button
              disabled
              className="px-3 py-1.5 rounded-xl text-slate-600 cursor-not-allowed bg-slate-900 border border-slate-800 flex items-center gap-1.5 text-xs font-mono"
            >
              <span>3D Server Room</span>
              <span className="text-[9px] px-1 bg-amber-950/80 text-amber-400 rounded">SOON</span>
            </button>
            <div className="absolute right-0 top-full mt-2 hidden group-hover:block w-64 p-3 bg-slate-900 border border-amber-500/50 rounded-xl shadow-2xl text-[11px] text-amber-300 font-sans z-50 animate-fade-in pointer-events-none">
              <div className="font-bold flex items-center gap-1.5 mb-1 text-amber-200">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                <span>Fitur Sedang Dikembangkan</span>
              </div>
              <div>Mode 3D Server Room interaktif sedang dalam proses pembuatan untuk pembaruan berikutnya (Coming Soon in 3D Update).</div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Diagnostic Network Health Pipeline Ribbon */}
      <div className="mt-3 bg-slate-900/90 border border-slate-800/80 rounded-xl px-4 py-2 flex items-center justify-between text-[11px] font-mono shrink-0 overflow-x-auto shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-slate-400 uppercase font-bold text-[10px]">Alur Sinyal:</span>

          <div className={`flex items-center gap-1 px-2 py-0.5 rounded border ${isMcbOn ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/50' : 'bg-rose-950/60 text-rose-400 border-rose-800/50'}`}>
            <Zap className="w-3 h-3" />
            <span>1. Listrik PLN {isMcbOn ? '220V' : 'OFF'}</span>
          </div>

          <ArrowRight className="w-3 h-3 text-slate-600 shrink-0" />

          <div className={`flex items-center gap-1 px-2 py-0.5 rounded border ${isModemPowered ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/50' : 'bg-rose-950/60 text-rose-400 border-rose-800/50'}`}>
            <Power className="w-3 h-3" />
            <span>2. Modem ISP {isModemPowered ? 'ON' : 'NO POWER'}</span>
          </div>

          <ArrowRight className="w-3 h-3 text-slate-600 shrink-0" />

          <div className={`flex items-center gap-1 px-2 py-0.5 rounded border ${isModemConnectedToRouter ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/50' : 'bg-rose-950/60 text-rose-400 border-rose-800/50'}`}>
            <Cable className="w-3 h-3" />
            <span>3. Kabel LAN Cat6 {isModemConnectedToRouter ? 'WAN LINK UP' : 'UNLINKED'}</span>
          </div>

          <ArrowRight className="w-3 h-3 text-slate-600 shrink-0" />

          <div className={`flex items-center gap-1 px-2 py-0.5 rounded border ${isRouterPowered ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/50' : 'bg-rose-950/60 text-rose-400 border-rose-800/50'}`}>
            <RouterIcon className="w-3 h-3" />
            <span>4. Core Router {isRouterPowered ? 'ACTIVE' : 'NO POWER'}</span>
          </div>

          <ArrowRight className="w-3 h-3 text-slate-600 shrink-0" />

          <div className={`flex items-center gap-1 px-2 py-0.5 rounded border ${isRouterConnectedToOlt ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/50' : 'bg-rose-950/60 text-rose-400 border-rose-800/50'}`}>
            <Share2 className="w-3 h-3" />
            <span>5. Fiber 10G {isRouterConnectedToOlt ? 'LINK UP' : 'UNLINKED'}</span>
          </div>

          <ArrowRight className="w-3 h-3 text-slate-600 shrink-0" />

          <div className={`flex items-center gap-1 px-2 py-0.5 rounded border ${isOltPowered ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/50' : 'bg-rose-950/60 text-rose-400 border-rose-800/50'}`}>
            <Cpu className="w-3 h-3" />
            <span>6. GPON OLT {isOltPowered ? 'ACTIVE' : 'NO POWER'}</span>
          </div>

          <ArrowRight className="w-3 h-3 text-slate-600 shrink-0" />

          <div className={`flex items-center gap-1 px-2 py-0.5 rounded border ${isOltConnectedToOdfWall ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/50' : 'bg-rose-950/60 text-rose-400 border-rose-800/50'}`}>
            <Wifi className="w-3 h-3" />
            <span>7. Feeder Kota {isOltConnectedToOdfWall ? 'TX ON' : 'NO LIGHT'}</span>
          </div>
        </div>

        <button
          onClick={() => setActiveTab('map')}
          className="text-xs text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1 underline underline-offset-2 ml-4 shrink-0"
        >
          <span>Peta Kota 2D</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      {/* 3. Interactive Cable Drawing Toolbox Bar */}
      <div className="mt-3 bg-slate-900 border border-slate-800 rounded-xl p-2.5 flex items-center justify-between shrink-0 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase font-mono mr-1">Alat Kabel:</span>

          <button
            onClick={() => {
              setSelectedCableTool(selectedTool === 'power' ? null : 'power')
              setDrawingWaypoints([])
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 border transition-all ${
              selectedTool === 'power'
                ? 'bg-emerald-600 text-white border-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.4)]'
                : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
            <span>Kabel Listrik AC</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">{powerStock} pcs</span>
          </button>

          <button
            onClick={() => {
              setSelectedCableTool(selectedTool === 'lan' ? null : 'lan')
              setDrawingWaypoints([])
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 border transition-all ${
              selectedTool === 'lan'
                ? 'bg-blue-600 text-white border-blue-400 shadow-[0_0_12px_rgba(59,130,246,0.4)]'
                : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
            }`}
          >
            <Cable className="w-3.5 h-3.5 text-blue-400" />
            <span>Kabel LAN Cat6</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">{lanStock} pcs</span>
          </button>

          <button
            onClick={() => {
              setSelectedCableTool(selectedTool === 'fiber' ? null : 'fiber')
              setDrawingWaypoints([])
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 border transition-all ${
              selectedTool === 'fiber'
                ? 'bg-amber-600 text-white border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.4)]'
                : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
            }`}
          >
            <Share2 className="w-3.5 h-3.5 text-amber-400" />
            <span>Patchcord Fiber Optik</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">{fiberStock} pcs</span>
          </button>

          <button
            onClick={() => {
              setSelectedCableTool(selectedTool === 'unplug' ? null : 'unplug')
              setDrawingWaypoints([])
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 border transition-all ${
              selectedTool === 'unplug'
                ? 'bg-rose-600 text-white border-rose-400 shadow-[0_0_12px_rgba(244,63,94,0.4)]'
                : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
            }`}
          >
            <Scissors className="w-3.5 h-3.5 text-rose-400" />
            <span>Cabut Kabel</span>
          </button>

          <div className="h-5 w-px bg-slate-800 mx-1" />

          {/* Orthogonal / 90-degree Snap Toggle */}
          <button
            onClick={() => setIsOrthoLock(!isOrthoLock)}
            title="Kunci garis agar selalu siku 90 derajat (garis beraturan)"
            className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 border transition-all ${
              isOrthoLock
                ? 'bg-cyan-950 text-cyan-300 border-cyan-500/60 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                : 'bg-slate-950 text-slate-500 border-slate-800'
            }`}
          >
            <Compass className="w-3.5 h-3.5 text-cyan-400" />
            <span>Siku 90°: {isOrthoLock ? 'AKTIF' : 'BEBAS'}</span>
          </button>
        </div>

        {/* Live Drawing Guidance & Action Controls */}
        <div className="text-xs font-mono flex items-center gap-2">
          {selectedEndpoint ? (
            <div className="flex items-center gap-2 bg-amber-950/90 border border-amber-500/60 text-amber-300 px-3 py-1 rounded-lg">
              <span>
                Mulai: <strong>{selectedEndpoint.label}</strong>
                {drawingWaypoints.length > 0 && ` (${drawingWaypoints.length} titik belokan)`}
                {' '}$\rightarrow$ Klik di ruangan untuk belokan, lalu klik Port Tujuan!
              </span>

              {drawingWaypoints.length > 0 && (
                <button
                  onClick={handleUndoWaypoint}
                  title="Hapus titik belokan terakhir (Backspace)"
                  className="bg-amber-900/80 hover:bg-amber-800 text-white text-[10px] px-2 py-0.5 rounded flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Undo Titik</span>
                </button>
              )}

              <button
                onClick={handleCancelDrawing}
                className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-0.5 rounded"
              >
                Batal
              </button>
            </div>
          ) : selectedTool ? (
            <span className="text-cyan-400">
              Pilih Port Asal untuk mulai menggambar jalur kabel beraturan.
            </span>
          ) : (
            <span className="text-slate-500">Pilih jenis kabel di atas untuk menarik jalur kabel beraturan.</span>
          )}
        </div>
      </div>

      {/* 4. MAIN VIEWPORT */}
      <div className="flex-1 flex gap-5 overflow-hidden mt-3">
        {subView === 'building_room' ? (
          /* =========================================================
             SUBVIEW 1: FULL 2D BUILDING & ROOM FLOORPLAN
             ========================================================= */
          <div className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl relative overflow-hidden flex flex-col shadow-2xl">
            <svg
              ref={svgRef}
              onClick={handleCanvasClick}
              onMouseMove={handleSvgMouseMove}
              className={`w-full h-full select-none ${
                selectedEndpoint ? 'cursor-crosshair' : selectedTool === 'unplug' ? 'cursor-pointer' : 'cursor-default'
              }`}
              viewBox="0 0 1100 620"
              preserveAspectRatio="xMidYMid meet"
            >
              <defs>
                {/* Raised floor pattern */}
                <pattern id="raised-floor" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="1" />
                  <rect x="36" y="36" width="3" height="3" fill="#334155" opacity="0.4" />
                </pattern>

                {/* Cable Ladder Tray Pattern */}
                <pattern id="cable-ladder" width="20" height="12" patternUnits="userSpaceOnUse">
                  <rect x="0" y="0" width="20" height="12" fill="none" stroke="#475569" strokeWidth="1" />
                  <line x1="0" y1="6" x2="20" y2="6" stroke="#64748b" strokeWidth="1.5" />
                </pattern>
              </defs>

              {/* Floor Background with Raised Floor Grid */}
              <rect x="20" y="20" width="1060" height="580" fill="#090d16" />
              <rect x="20" y="20" width="1060" height="580" fill="url(#raised-floor)" opacity="0.75" />

              {/* Room Walls & Perimeter Border */}
              <rect x="20" y="20" width="1060" height="580" fill="none" stroke="#334155" strokeWidth="12" rx="16" />

              {/* Overhead Cable Ladder Tray */}
              <rect x="180" y="70" width="820" height="24" fill="url(#cable-ladder)" opacity="0.8" rx="4" />
              <text x="590" y="86" fill="#94a3b8" fontSize="10" fontFamily="monospace" textAnchor="middle">
                TRAY KABEL GANTUNG (OVERHEAD CABLE LADDER)
              </text>

              {/* Technician Door */}
              <g transform="translate(60, 560)">
                <rect x="0" y="0" width="100" height="40" fill="#1e293b" stroke="#475569" strokeWidth="2" rx="4" />
                <text x="50" y="24" fill="#94a3b8" fontSize="9" fontFamily="sans-serif" fontWeight="bold" textAnchor="middle">
                  PINTU AKSES NOC
                </text>
              </g>

              {/* Air Conditioning Split Unit */}
              <g transform="translate(860, 32)">
                <rect x="0" y="0" width="160" height="42" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.5" rx="6" />
                <circle cx="18" cy="21" r="5" fill="#38bdf8" />
                <text x="32" y="18" fill="#e2e8f0" fontSize="11" fontWeight="bold" fontFamily="sans-serif">
                  AC SERVER ROOM
                </text>
                <text x="32" y="32" fill="#38bdf8" fontSize="10" fontFamily="monospace">
                  19°C • FAN AUTO
                </text>
              </g>

              {/* ========================================================
                  SECTION A: PLN BREAKER PANEL & WALL POWER SOCKETS
                  ======================================================== */}
              <g transform="translate(50, 45)">
                <rect x="0" y="0" width="180" height="140" fill="#0f172a" stroke="#475569" strokeWidth="2" rx="8" />
                <rect x="10" y="10" width="160" height="24" fill="#1e293b" rx="4" />
                <text x="90" y="26" fill="#e2e8f0" fontSize="10" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
                  PANEL PLN 5500VA
                </text>

                {/* Voltmeter */}
                <rect x="20" y="44" width="70" height="24" fill="#020617" stroke="#334155" rx="4" />
                <text
                  x="55"
                  y="60"
                  fill={isMcbOn ? '#10b981' : '#f43f5e'}
                  fontSize="12"
                  fontWeight="bold"
                  fontFamily="monospace"
                  textAnchor="middle"
                >
                  {isMcbOn ? '220 V' : '0 V'}
                </text>

                {/* MCB Switch */}
                <g onClick={togglePlnMcb} className="cursor-pointer">
                  <rect
                    x="105"
                    y="44"
                    width="55"
                    height="24"
                    fill={isMcbOn ? '#065f46' : '#881337'}
                    stroke={isMcbOn ? '#10b981' : '#f43f5e'}
                    rx="4"
                  />
                  <text
                    x="132"
                    y="60"
                    fill="#ffffff"
                    fontSize="10"
                    fontWeight="bold"
                    fontFamily="monospace"
                    textAnchor="middle"
                  >
                    {isMcbOn ? 'ON' : 'OFF'}
                  </text>
                </g>

                {/* Wall Socket 1: Desk */}
                <g
                  onClick={() =>
                    handleEndpointClick({
                      type: 'pln_socket',
                      portId: 'socket-wall-desk',
                      label: 'Stop Kontak Meja (220V)'
                    })
                  }
                  className="cursor-pointer"
                >
                  <rect
                    x="20"
                    y="80"
                    width="140"
                    height="24"
                    fill={selectedEndpoint?.portId === 'socket-wall-desk' ? '#f59e0b' : '#1e293b'}
                    stroke={selectedTool === 'power' ? '#10b981' : '#475569'}
                    strokeWidth={selectedTool === 'power' ? '2' : '1'}
                    rx="4"
                  />
                  <Zap className="w-3.5 h-3.5" x="26" y="85" fill="#10b981" />
                  <text x="46" y="96" fill="#cbd5e1" fontSize="9" fontFamily="sans-serif">
                    Stop Kontak Meja
                  </text>
                  <circle cx="145" cy="92" r="4" fill={isMcbOn ? '#10b981' : '#64748b'} />
                </g>

                {/* Wall Socket 2: Rack */}
                <g
                  onClick={() =>
                    handleEndpointClick({
                      type: 'pln_socket',
                      portId: 'socket-wall-rack',
                      label: 'Stop Kontak Rak (220V)'
                    })
                  }
                  className="cursor-pointer"
                >
                  <rect
                    x="20"
                    y="110"
                    width="140"
                    height="24"
                    fill={selectedEndpoint?.portId === 'socket-wall-rack' ? '#f59e0b' : '#1e293b'}
                    stroke={selectedTool === 'power' ? '#10b981' : '#475569'}
                    strokeWidth={selectedTool === 'power' ? '2' : '1'}
                    rx="4"
                  />
                  <Zap className="w-3.5 h-3.5" x="26" y="115" fill="#10b981" />
                  <text x="46" y="126" fill="#cbd5e1" fontSize="9" fontFamily="sans-serif">
                    Stop Kontak Rak
                  </text>
                  <circle cx="145" cy="122" r="4" fill={isMcbOn ? '#10b981' : '#64748b'} />
                </g>
              </g>

              {/* ========================================================
                  SECTION B: OPERATOR WORK DESK & UPSTREAM ISP MODEM
                  ======================================================== */}
              <g transform="translate(60, 230)">
                <rect x="0" y="0" width="340" height="240" fill="#0f172a" stroke="#334155" strokeWidth="2" rx="10" />
                <rect x="10" y="10" width="320" height="26" fill="#1e293b" rx="6" />
                <text x="170" y="27" fill="#cbd5e1" fontSize="11" fontWeight="bold" fontFamily="sans-serif" textAnchor="middle">
                  MEJA OPERATOR & UPSTREAM ISP INDUK
                </text>

                {/* Fiber Drop Cable from street */}
                <path d="M -40 80 L 30 80" stroke="#000000" strokeWidth="3" />
                <circle cx="30" cy="80" r="3" fill="#f59e0b" />
                <text x="-35" y="72" fill="#f59e0b" fontSize="8" fontFamily="monospace">
                  DROP FIBER ISP INDUK
                </text>

                {/* Modem Enclosure */}
                <rect x="30" y="60" width="280" height="74" fill="#ffffff" stroke="#cbd5e1" strokeWidth="2" rx="8" />
                <rect x="30" y="60" width="280" height="22" fill="#f1f5f9" rx="8" />

                <text x="45" y="75" fill="#0284c7" fontSize="10" fontWeight="bold" fontFamily="monospace">
                  ZTE
                </text>
                <text x="75" y="75" fill="#334155" fontSize="9" fontWeight="bold" fontFamily="sans-serif">
                  ZXHN F609 GPON ONT (Provider Induk)
                </text>
                <text x="290" y="75" fill="#059669" fontSize="8" fontFamily="monospace" textAnchor="end">
                  1000M PON
                </text>

                {/* LEDs */}
                <g transform="translate(45, 88)">
                  <circle cx="0" cy="0" r="3.5" fill={isModemPowered ? '#10b981' : '#64748b'} />
                  <text x="8" y="3" fill="#64748b" fontSize="8" fontFamily="monospace">PWR</text>

                  <circle cx="45" cy="0" r="3.5" fill={isModemPowered ? '#10b981' : '#64748b'} />
                  <text x="53" y="3" fill="#64748b" fontSize="8" fontFamily="monospace">PON</text>

                  <circle cx="90" cy="0" r="3.5" fill={isModemConnectedToRouter ? '#0ea5e9' : '#64748b'} />
                  <text x="98" y="3" fill="#64748b" fontSize="8" fontFamily="monospace">LAN1</text>
                </g>

                {/* Modem Ports */}
                <g
                  onClick={() =>
                    handleEndpointClick({
                      type: 'upstream_modem',
                      portId: 'modem-pwr',
                      label: 'Modem ISP (DC 12V Power)'
                    })
                  }
                  className="cursor-pointer"
                >
                  <rect
                    x="45"
                    y="102"
                    width="60"
                    height="20"
                    fill={selectedEndpoint?.portId === 'modem-pwr' ? '#f59e0b' : '#0f172a'}
                    stroke={selectedTool === 'power' ? '#10b981' : '#64748b'}
                    strokeWidth={selectedTool === 'power' ? '2' : '1'}
                    rx="4"
                  />
                  <text x="75" y="115" fill="#ffffff" fontSize="8" fontFamily="monospace" textAnchor="middle">
                    DC 12V
                  </text>
                </g>

                <g
                  onClick={() =>
                    handleEndpointClick({
                      type: 'upstream_modem',
                      portId: 'modem-lan1',
                      label: 'Modem ISP (Port LAN 1 RJ45)'
                    })
                  }
                  className="cursor-pointer"
                >
                  <rect
                    x="115"
                    y="102"
                    width="85"
                    height="20"
                    fill={selectedEndpoint?.portId === 'modem-lan1' ? '#f59e0b' : '#0f172a'}
                    stroke={selectedTool === 'lan' ? '#3b82f6' : '#64748b'}
                    strokeWidth={selectedTool === 'lan' ? '2' : '1'}
                    rx="4"
                  />
                  <text x="157" y="115" fill="#38bdf8" fontSize="8" fontFamily="monospace" textAnchor="middle">
                    LAN 1 (GE)
                  </text>
                </g>

                <g
                  onClick={() =>
                    handleEndpointClick({
                      type: 'upstream_modem',
                      portId: 'modem-lan2',
                      label: 'Modem ISP (Port LAN 2 RJ45)'
                    })
                  }
                  className="cursor-pointer"
                >
                  <rect
                    x="210"
                    y="102"
                    width="85"
                    height="20"
                    fill={selectedEndpoint?.portId === 'modem-lan2' ? '#f59e0b' : '#0f172a'}
                    stroke={selectedTool === 'lan' ? '#3b82f6' : '#64748b'}
                    strokeWidth={selectedTool === 'lan' ? '2' : '1'}
                    rx="4"
                  />
                  <text x="252" y="115" fill="#94a3b8" fontSize="8" fontFamily="monospace" textAnchor="middle">
                    LAN 2 (GE)
                  </text>
                </g>

                {/* PC Screen */}
                <rect x="30" y="148" width="280" height="78" fill="#020617" stroke="#1e293b" strokeWidth="2" rx="6" />
                <rect x="30" y="148" width="280" height="16" fill="#0f172a" rx="6" />
                <text x="40" y="159" fill="#94a3b8" fontSize="8" fontFamily="monospace">
                  NOC Console Monitor (Telkom Upstream)
                </text>
                <text x="40" y="178" fill="#22c55e" fontSize="9" fontFamily="monospace">
                  IP WAN: {serverBuilding.upstreamModem.ipAddress}
                </text>
                <text x="40" y="193" fill="#38bdf8" fontSize="9" fontFamily="monospace">
                  GATEWAY: {isModemConnectedToRouter ? '103.144.20.254 (0.9ms)' : 'NO LINK'}
                </text>
                <text x="40" y="208" fill={isFullPipelineOnline ? '#10b981' : '#f59e0b'} fontSize="9" fontFamily="monospace">
                  STATUS: {isFullPipelineOnline ? 'ONLINE - ROUTING TRANSIT' : 'STANDBY - CHECK CABLES'}
                </text>
              </g>

              {/* ========================================================
                  SECTION C: 19" 42U SERVER RACK (DYNAMIC DEVICES)
                  ======================================================== */}
              <g transform="translate(470, 110)">
                <rect x="0" y="0" width="380" height="425" fill="#0b0f19" stroke="#475569" strokeWidth="4" rx="12" />
                <rect x="10" y="10" width="360" height="26" fill="#1e293b" rx="6" />
                <text x="190" y="27" fill="#f1f5f9" fontSize="11" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
                  APC NetShelter SX 42U - RACK #01 ({serverRack.devices.length} Perangkat)
                </text>

                {/* Dynamic Mounted Rack Devices */}
                {Object.values(rackDeviceLayout).map(({ device: dev, relY, height: devHeight, ports }) => {
                  const isPoweredAndMcb = dev.isPowered && isMcbOn
                  const borderColor = isPoweredAndMcb
                    ? dev.type === 'core_router'
                      ? '#38bdf8'
                      : dev.type === 'gpon_olt'
                        ? '#10b981'
                        : dev.type === 'ups_battery'
                          ? '#34d399'
                          : '#cbd5e1'
                    : '#334155'

                  return (
                    <g key={dev.id} transform={`translate(20, ${relY})`}>
                      {/* Device Chassis Box */}
                      <rect
                        x="0"
                        y="0"
                        width="340"
                        height={devHeight}
                        fill="#0f172a"
                        stroke={borderColor}
                        strokeWidth="1.5"
                        rx="6"
                      />

                      {/* U-Slot Badge */}
                      <rect x="8" y="7" width="28" height="15" fill="#1e293b" rx="3" />
                      <text
                        x="22"
                        y="18"
                        fill="#94a3b8"
                        fontSize="8"
                        fontFamily="monospace"
                        textAnchor="middle"
                        fontWeight="bold"
                      >
                        U{dev.uSlot}
                      </text>

                      {/* Brand & Model Name */}
                      <text
                        x="40"
                        y="18"
                        fill={borderColor}
                        fontSize="9.5"
                        fontWeight="bold"
                        fontFamily="monospace"
                      >
                        {dev.brand} {dev.model.length > 16 ? dev.model.slice(0, 15) + '…' : dev.model}
                      </text>

                      {/* Wattage / Throughput specs */}
                      {devHeight >= 46 && (
                        <text x="40" y="32" fill="#64748b" fontSize="8" fontFamily="monospace">
                          {dev.maxThroughputMbps.toLocaleString()} Mbps • {dev.powerWatts}W
                        </text>
                      )}

                      {/* Power Status LED */}
                      <circle
                        cx="14"
                        cy={devHeight - 12}
                        r="3"
                        fill={isPoweredAndMcb ? '#22c55e' : '#475569'}
                        className={isPoweredAndMcb ? 'animate-pulse' : ''}
                      />

                      {/* Power Switch Button */}
                      <g
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleDevicePower(dev.id)
                        }}
                        className="cursor-pointer"
                      >
                        <title>Nyalakan/Matikan Daya</title>
                        <rect
                          x="22"
                          y={devHeight - 20}
                          width="18"
                          height="15"
                          fill={dev.isPowered ? '#064e3b' : '#1e293b'}
                          stroke={dev.isPowered ? '#10b981' : '#475569'}
                          strokeWidth="0.8"
                          rx="3"
                        />
                        <text
                          x="31"
                          y={devHeight - 9}
                          fill={dev.isPowered ? '#34d399' : '#94a3b8'}
                          fontSize="7.5"
                          fontWeight="bold"
                          textAnchor="middle"
                        >
                          ⚡
                        </text>
                      </g>

                      {/* Unmount Button */}
                      <g
                        onClick={(e) => {
                          e.stopPropagation()
                          unmountRackDevice(dev.id)
                        }}
                        className="cursor-pointer"
                      >
                        <title>Bongkar Perangkat dari Rak</title>
                        <rect
                          x="44"
                          y={devHeight - 20}
                          width="18"
                          height="15"
                          fill="#1e293b"
                          stroke="#475569"
                          strokeWidth="0.8"
                          rx="3"
                        />
                        <text
                          x="53"
                          y={devHeight - 9}
                          fill="#f87171"
                          fontSize="8"
                          fontWeight="bold"
                          textAnchor="middle"
                        >
                          ✕
                        </text>
                      </g>

                      {/* Interactive Ports */}
                      {dev.ports.map((p) => {
                        const portInfo = ports[p.id]
                        if (!portInfo) return null

                        const isConnected = roomCables.some(
                          (c) =>
                            (c.from.deviceId === dev.id && c.from.portId === p.id) ||
                            (c.to.deviceId === dev.id && c.to.portId === p.id)
                        )

                        const isSelected = selectedEndpoint?.deviceId === dev.id && selectedEndpoint?.portId === p.id

                        let strokeColor = '#64748b'
                        let textColor = '#94a3b8'
                        let portTypeBadge = p.name.slice(0, 6)

                        if (p.type === 'power_ac') {
                          strokeColor = selectedTool === 'power' ? '#10b981' : '#475569'
                          textColor = '#10b981'
                          portTypeBadge = p.isInput ? 'PWR IN' : 'PWR OUT'
                        } else if (p.type === 'copper_rj45') {
                          strokeColor = selectedTool === 'lan' ? '#3b82f6' : '#475569'
                          textColor = '#38bdf8'
                          portTypeBadge = p.name.includes('WAN') ? 'WAN' : 'LAN'
                        } else if (p.type === 'fiber_sfp' || p.type === 'fiber_pon' || p.type === 'fiber_sc') {
                          strokeColor = selectedTool === 'fiber' ? '#f59e0b' : '#475569'
                          textColor = '#facc15'
                          portTypeBadge = p.name.includes('UPLINK')
                            ? 'UPLINK'
                            : p.name.includes('PON')
                              ? p.name.slice(0, 5)
                              : p.name.includes('Core')
                                ? `SC ${p.name.replace(/[^0-9]/g, '') || '1'}`
                                : 'OPTIC'
                        }

                        return (
                          <g
                            key={p.id}
                            onClick={() =>
                              handleEndpointClick({
                                type: 'rack_device',
                                deviceId: dev.id,
                                portId: p.id,
                                label: `${dev.brand} ${dev.name} (${p.name})`
                              })
                            }
                            className="cursor-pointer"
                          >
                            <rect
                              x={portInfo.relX}
                              y={portInfo.relY}
                              width={portInfo.width}
                              height={portInfo.height}
                              fill={isSelected ? '#f59e0b' : isConnected ? '#091322' : '#020617'}
                              stroke={isSelected ? '#f59e0b' : isConnected ? textColor : strokeColor}
                              strokeWidth={isSelected ? 2 : isConnected ? 1.5 : 1}
                              rx="3"
                            />
                            <text
                              x={portInfo.relX + portInfo.width / 2}
                              y={portInfo.relY + 14}
                              fill={isSelected ? '#000000' : textColor}
                              fontSize="8"
                              fontWeight="bold"
                              fontFamily="monospace"
                              textAnchor="middle"
                            >
                              {portTypeBadge}
                            </text>
                            {isConnected && (
                              <circle
                                cx={portInfo.relX + portInfo.width - 5}
                                cy={portInfo.relY + 5}
                                r="2"
                                fill={dev.isPowered && isMcbOn ? '#22c55e' : '#64748b'}
                                className={dev.isPowered && isMcbOn ? 'animate-pulse' : ''}
                              />
                            )}
                          </g>
                        )
                      })}
                    </g>
                  )
                })}

                {/* Empty Rack Area / Add Device & Detail View */}
                {(() => {
                  const lowestMountedSlot = Object.values(rackDeviceLayout).reduce(
                    (min, d) => Math.min(min, d.device.uSlot),
                    42
                  )
                  const maxRackDevBottom = Math.max(
                    290,
                    ...Object.values(rackDeviceLayout).map((d) => d.relY + d.height)
                  )
                  const emptyTop = maxRackDevBottom + 8
                  const emptyHeight = Math.max(65, 415 - emptyTop)

                  return (
                    <g transform={`translate(20, ${emptyTop})`}>
                      <rect
                        x="0"
                        y="0"
                        width="340"
                        height={emptyHeight}
                        fill="#020617"
                        stroke="#1e293b"
                        strokeDasharray="4 4"
                        rx="8"
                      />
                      <text
                        x="170"
                        y={emptyHeight > 75 ? 26 : 20}
                        fill="#64748b"
                        fontSize="9.5"
                        fontFamily="sans-serif"
                        textAnchor="middle"
                      >
                        SLOT RAK U1 S/D U{Math.max(1, lowestMountedSlot - 1)} TERSEDIA ({Math.max(1, lowestMountedSlot - 1)}U KOSONG)
                      </text>

                      <g
                        onClick={() => setSelectedSlotForMounting(Math.max(1, lowestMountedSlot - 1))}
                        className="cursor-pointer"
                      >
                        <rect
                          x="25"
                          y={emptyHeight > 75 ? 42 : 30}
                          width="140"
                          height="24"
                          fill="#064e3b"
                          stroke="#10b981"
                          rx="5"
                        />
                        <text
                          x="95"
                          y={emptyHeight > 75 ? 57 : 45}
                          fill="#34d399"
                          fontSize="9"
                          fontWeight="bold"
                          fontFamily="monospace"
                          textAnchor="middle"
                        >
                          + Pasang Dari Gudang
                        </text>
                      </g>

                      <g
                        onClick={() => setServerBuildingSubView('rack_closeup')}
                        className="cursor-pointer"
                      >
                        <rect
                          x="175"
                          y={emptyHeight > 75 ? 42 : 30}
                          width="140"
                          height="24"
                          fill="#1e293b"
                          stroke="#38bdf8"
                          rx="5"
                        />
                        <text
                          x="245"
                          y={emptyHeight > 75 ? 57 : 45}
                          fill="#38bdf8"
                          fontSize="9"
                          fontWeight="bold"
                          fontFamily="monospace"
                          textAnchor="middle"
                        >
                          [ Detail Rak 42U ]
                        </text>
                      </g>
                    </g>
                  )
                })()}
              </g>

              {/* ========================================================
                  SECTION D: ODF WALL PASSTHROUGH
                  ======================================================== */}
              <g transform="translate(900, 240)">
                <rect x="0" y="0" width="150" height="180" fill="#0f172a" stroke="#475569" strokeWidth="2" rx="8" />
                <rect x="8" y="8" width="134" height="24" fill="#1e293b" rx="4" />
                <text x="75" y="24" fill="#e2e8f0" fontSize="9" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
                  ODF WALL PASSTHROUGH
                </text>

                <g
                  onClick={() =>
                    handleEndpointClick({
                      type: 'odf_wall',
                      portId: 'wall-feeder-1',
                      label: 'ODF Wall (Feeder Keluar ke Kota)'
                    })
                  }
                  className="cursor-pointer"
                >
                  <rect
                    x="15"
                    y="45"
                    width="120"
                    height="26"
                    fill={selectedEndpoint?.portId === 'wall-feeder-1' ? '#f59e0b' : '#020617'}
                    stroke={selectedTool === 'fiber' ? '#f59e0b' : '#334155'}
                    strokeWidth={selectedTool === 'fiber' ? '2' : '1'}
                    rx="4"
                  />
                  <text x="75" y="61" fill="#facc15" fontSize="9" fontFamily="monospace" textAnchor="middle">
                    CORE 1 (FEEDER OUT)
                  </text>
                </g>

                <g
                  onClick={() =>
                    handleEndpointClick({
                      type: 'odf_wall',
                      portId: 'wall-feeder-2',
                      label: 'ODF Wall (Core 2 Feeder)'
                    })
                  }
                  className="cursor-pointer"
                >
                  <rect
                    x="15"
                    y="80"
                    width="120"
                    height="26"
                    fill={selectedEndpoint?.portId === 'wall-feeder-2' ? '#f59e0b' : '#020617'}
                    stroke={selectedTool === 'fiber' ? '#f59e0b' : '#334155'}
                    strokeWidth={selectedTool === 'fiber' ? '2' : '1'}
                    rx="4"
                  />
                  <text x="75" y="96" fill="#94a3b8" fontSize="9" fontFamily="monospace" textAnchor="middle">
                    CORE 2 (BACKUP)
                  </text>
                </g>

                <path d="M 135 58 L 180 58" stroke="#f59e0b" strokeWidth="4" />
                <text x="75" y="145" fill="#38bdf8" fontSize="8" fontFamily="sans-serif" textAnchor="middle">
                  Menuju Tiang & ODC
                </text>
                <text x="75" y="160" fill="#38bdf8" fontSize="8" fontFamily="sans-serif" textAnchor="middle">
                  di Peta Kota 2D
                </text>
              </g>

              {/* ========================================================
                  SECTION E: RENDER STRUCTURED ORTHOGONAL CABLES (GARIS BERATURAN)
                  ======================================================== */}
              {roomCables.map((cable) => {
                const pStart = getEndpointCoord(cable.from)
                const pEnd = getEndpointCoord(cable.to)

                // Use custom waypoints if saved, otherwise generate clean structured orthogonal route
                const points =
                  cable.points && cable.points.length >= 2
                    ? cable.points
                    : generateDefaultOrthogonalPoints(pStart, pEnd, cable.type)

                const pathData = buildPathD(points)

                return (
                  <g
                    key={cable.id}
                    onClick={() => {
                      if (selectedTool === 'unplug') {
                        removeRoomCable(cable.id)
                      }
                    }}
                    className={selectedTool === 'unplug' ? 'cursor-pointer hover:opacity-60' : ''}
                  >
                    {/* Shadow / Conduit glow line */}
                    <path
                      d={pathData}
                      fill="none"
                      stroke={cable.color}
                      strokeWidth={cable.type === 'power' ? '7' : cable.type === 'lan' ? '6' : '5'}
                      strokeLinejoin="round"
                      strokeLinecap="round"
                      opacity="0.25"
                    />

                    {/* Main Structured Line (Garis Beraturan) */}
                    <path
                      d={pathData}
                      fill="none"
                      stroke={cable.color}
                      strokeWidth={cable.type === 'power' ? '3.5' : cable.type === 'lan' ? '2.5' : '2'}
                      strokeLinejoin="round"
                      strokeLinecap="round"
                      strokeDasharray={cable.type === 'fiber' ? '8 4' : 'none'}
                    />

                    {/* Waypoint Junction Pin Dots */}
                    {points.map((pt, idx) => (
                      <circle
                        key={`pt-${cable.id}-${idx}`}
                        cx={pt.x}
                        cy={pt.y}
                        r={idx === 0 || idx === points.length - 1 ? 3.5 : 2}
                        fill="#ffffff"
                        opacity={idx === 0 || idx === points.length - 1 ? 0.9 : 0.6}
                      />
                    ))}
                  </g>
                )
              })}

              {/* ========================================================
                  SECTION F: ACTIVE INTERACTIVE CABLE DRAWING PREVIEW
                  ======================================================== */}
              {selectedEndpoint && currentAnchorPoint && cursorPos && (
                <g>
                  {/* Waypoints line segments drawn so far */}
                  {drawingWaypoints.length > 0 && (
                    <path
                      d={buildPathD([getEndpointCoord(selectedEndpoint), ...drawingWaypoints])}
                      fill="none"
                      stroke="#38bdf8"
                      strokeWidth="2.5"
                      strokeLinejoin="round"
                      strokeLinecap="round"
                      strokeDasharray="4 4"
                    />
                  )}

                  {/* Dynamic live preview segment from last point to cursor */}
                  <line
                    x1={currentAnchorPoint.x}
                    y1={currentAnchorPoint.y}
                    x2={cursorPos.x}
                    y2={cursorPos.y}
                    stroke="#f59e0b"
                    strokeWidth="2.5"
                    strokeDasharray="4 4"
                  />

                  {/* Placed waypoint handle circles */}
                  {drawingWaypoints.map((pt, idx) => (
                    <g key={`w-handle-${idx}`}>
                      <circle cx={pt.x} cy={pt.y} r="5" fill="#38bdf8" />
                      <circle cx={pt.x} cy={pt.y} r="8" fill="none" stroke="#38bdf8" strokeWidth="1" strokeDasharray="2 2" />
                    </g>
                  ))}

                  {/* Active cursor crosshair & target indicator */}
                  <circle cx={cursorPos.x} cy={cursorPos.y} r="6" fill="#f59e0b" opacity="0.8" />
                  <circle cx={cursorPos.x} cy={cursorPos.y} r="12" fill="none" stroke="#f59e0b" strokeWidth="1.5" className="animate-ping" />
                </g>
              )}
            </svg>
          </div>
        ) : (
          /* =========================================================
             SUBVIEW 2: 42U PHYSICAL SERVER RACK CLOSE-UP VIEW
             ========================================================= */
          <div className="flex-1 bg-slate-900/90 border-2 border-slate-700 rounded-2xl p-4 overflow-y-auto flex flex-col items-center relative shadow-2xl">
            <div className="w-full max-w-2xl bg-slate-950 border border-slate-800 rounded-xl p-2.5 mb-3 flex items-center justify-between text-xs font-mono text-slate-400">
              <span className="font-bold text-slate-200">APC NetShelter SX 42U - Rack #01</span>
              <span className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${isMcbOn ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`} />
                <span>PLN Tegangan: {isMcbOn ? '220V 50Hz' : 'OFF (0V)'}</span>
              </span>
            </div>

            <div className="w-full max-w-2xl bg-black/80 border-x-4 border-slate-700 rounded-b-xl flex flex-col relative p-2 shadow-inner">
              {uSlots.map((u) => {
                const deviceAtSlot = serverRack.devices.find((d) => d.uSlot === u)
                const isCoveredByTaller = serverRack.devices.some(
                  (d) => d.uSlot < u && u < d.uSlot + d.uHeight
                )

                if (isCoveredByTaller) return null

                if (deviceAtSlot) {
                  const heightPx = deviceAtSlot.uHeight * 46

                  return (
                    <div
                      key={`u-${u}`}
                      style={{ height: `${heightPx}px` }}
                      className={`w-full rounded-lg border my-1 p-2 flex items-center justify-between transition-all select-none relative ${
                        deviceAtSlot.isPowered && isMcbOn
                          ? 'bg-slate-900/95 border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                          : 'bg-slate-950/90 border-slate-800 opacity-60'
                      }`}
                    >
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

                      <div className="flex items-center gap-1.5 bg-slate-950/80 p-1.5 rounded-lg border border-slate-800">
                        {deviceAtSlot.ports.map((port) => {
                          const isConnected =
                            roomCables.some(
                              (c) =>
                                (c.from.deviceId === deviceAtSlot.id && c.from.portId === port.id) ||
                                (c.to.deviceId === deviceAtSlot.id && c.to.portId === port.id)
                            ) ||
                            serverRack.patchCables.some(
                              (c) =>
                                (c.fromDeviceId === deviceAtSlot.id && c.fromPortId === port.id) ||
                                (c.toDeviceId === deviceAtSlot.id && c.toPortId === port.id)
                            )

                          const isSelectedForRoomCable =
                            selectedEndpoint?.deviceId === deviceAtSlot.id &&
                            selectedEndpoint?.portId === port.id

                          return (
                            <button
                              key={port.id}
                              onClick={() =>
                                handleEndpointClick({
                                  type: 'rack_device',
                                  deviceId: deviceAtSlot.id,
                                  portId: port.id,
                                  label: `${deviceAtSlot.name} (${port.name})`
                                })
                              }
                              title={`${port.name} (${port.type.toUpperCase()})`}
                              className={`w-8 h-8 rounded flex flex-col items-center justify-center text-[8px] font-mono border transition-all ${
                                isSelectedForRoomCable
                                  ? 'bg-amber-400 border-amber-300 text-black font-bold animate-pulse'
                                  : isConnected
                                    ? port.type === 'power_ac'
                                      ? 'bg-emerald-950 border-emerald-400 text-emerald-300'
                                      : port.type === 'copper_rj45'
                                        ? 'bg-blue-950 border-blue-400 text-blue-300'
                                        : 'bg-amber-950 border-amber-400 text-amber-300 shadow-[0_0_8px_#f59e0b]'
                                    : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500'
                              }`}
                            >
                              <span>{port.name.slice(0, 3)}</span>
                              <span
                                className={`w-1.5 h-1.5 rounded-full mt-0.5 ${
                                  isConnected && deviceAtSlot.isPowered && isMcbOn
                                    ? 'bg-emerald-400 animate-pulse'
                                    : 'bg-slate-700'
                                }`}
                              />
                            </button>
                          )
                        })}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleDevicePower(deviceAtSlot.id)}
                          className={`p-1.5 rounded-lg border transition-all ${
                            deviceAtSlot.isPowered
                              ? 'bg-emerald-950 text-emerald-400 border-emerald-500/50'
                              : 'bg-slate-950 text-slate-500 border-slate-800'
                          }`}
                        >
                          <Power className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => unmountRackDevice(deviceAtSlot.id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )
                }

                return (
                  <div
                    key={`u-${u}`}
                    onClick={() => setSelectedSlotForMounting(u)}
                    className="w-full h-8 border border-dashed border-slate-800 hover:border-cyan-500/60 rounded my-0.5 px-3 flex items-center justify-between text-[10px] font-mono text-slate-600 hover:text-cyan-400 hover:bg-cyan-950/20 cursor-pointer transition-colors"
                  >
                    <span>U{u}</span>
                    <span className="flex items-center gap-1 opacity-0 hover:opacity-100">
                      <Plus className="w-3 h-3" /> Pasang Alat
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* 5. SIDE DRAWER: ACTIVE CABLES LIST & DRAWING MANAGER */}
        <div className="w-80 bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between shrink-0 shadow-xl overflow-hidden">
          <div className="flex flex-col h-full overflow-hidden">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 shrink-0">
              <h2 className="text-xs font-bold text-slate-200 uppercase font-mono flex items-center gap-2">
                <Cable className="w-4 h-4 text-cyan-400" />
                <span>Koneksi Kabel Terpasang ({roomCables.length})</span>
              </h2>
            </div>

            {/* Cable List Scrollable */}
            <div className="flex-1 overflow-y-auto space-y-2.5 mt-3 pr-1">
              {roomCables.length === 0 ? (
                <div className="text-center py-10 text-slate-500 text-xs">
                  Belum ada kabel terhubung. Pilih alat kabel di atas untuk mulai menggambar jalur kabel.
                </div>
              ) : (
                roomCables.map((cable) => (
                  <div
                    key={cable.id}
                    className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 flex flex-col justify-between transition-all"
                  >
                    <div className="flex items-center justify-between text-[11px] mb-1.5 font-mono">
                      <span
                        className={`px-1.5 py-0.2 rounded font-bold uppercase text-[9px] ${
                          cable.type === 'power'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/60'
                            : cable.type === 'lan'
                              ? 'bg-blue-950 text-blue-300 border border-blue-800/60'
                              : 'bg-amber-950 text-amber-300 border border-amber-800/60'
                        }`}
                      >
                        {cable.type.toUpperCase()}
                      </span>

                      <div className="flex items-center gap-1">
                        {/* Redraw Path Button */}
                        <button
                          onClick={() => handleStartRedrawCable(cable)}
                          title="Gambar Ulang Jalur Kabel Ini"
                          className="text-slate-400 hover:text-cyan-400 p-1 hover:bg-slate-800 rounded text-[10px] font-sans flex items-center gap-1"
                        >
                          <CornerDownRight className="w-3 h-3" />
                          <span>Ubah Jalur</span>
                        </button>

                        {/* Unplug Button */}
                        <button
                          onClick={() => removeRoomCable(cable.id)}
                          className="text-slate-500 hover:text-rose-400 p-1 hover:bg-slate-800 rounded"
                          title="Cabut Kabel"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="text-xs text-slate-200 font-semibold truncate leading-tight">
                      {cable.from.label}
                    </div>
                    <div className="text-[10px] text-slate-400 flex items-center gap-1 my-0.5">
                      <ArrowRight className="w-3 h-3 text-cyan-400 shrink-0" />
                      <span className="truncate">{cable.to.label}</span>
                    </div>

                    <div className="text-[9px] font-mono text-slate-500 mt-1 flex items-center justify-between border-t border-slate-900 pt-1">
                      <span>Jalur: {cable.points?.length ? `${cable.points.length} titik beraturan` : 'Siku Otomatis'}</span>
                      <span className="text-emerald-400">● Terkoneksi</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Mount Modal if clicked an empty slot */}
          {selectedSlotForMounting && (
            <div className="mt-3 pt-3 border-t border-slate-800 shrink-0">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-200">Pasang di Slot U{selectedSlotForMounting}:</span>
                <button
                  onClick={() => setSelectedSlotForMounting(null)}
                  className="text-xs text-slate-500 hover:text-slate-300"
                >
                  Batal
                </button>
              </div>
              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {mountableCatalog.map((item) => {
                  const qty = inventory[item.id] || 0
                  return (
                    <button
                      key={item.id}
                      disabled={qty <= 0}
                      onClick={() => {
                        mountRackDevice(item.id, selectedSlotForMounting)
                        setSelectedSlotForMounting(null)
                      }}
                      className={`w-full text-left p-2 rounded-lg text-xs flex items-center justify-between transition-all ${
                        qty > 0
                          ? 'bg-slate-950 hover:bg-slate-800 text-slate-200 border border-slate-800'
                          : 'bg-slate-950/40 text-slate-600 border border-transparent cursor-not-allowed'
                      }`}
                    >
                      <span className="truncate">{item.name} ({item.rackHeightU}U)</span>
                      <span className="font-mono text-[10px] ml-2 text-cyan-400 font-bold shrink-0">
                        {qty} pcs
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
