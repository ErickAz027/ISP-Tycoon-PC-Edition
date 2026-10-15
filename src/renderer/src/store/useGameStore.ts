import { create } from 'zustand'
import {
  MapToolMode,
  MapBuilding,
  MapHouse,
  MapPole,
  MapOdc,
  MapOdp,
  MapCable,
  RackDevice,
  RackPort,
  RackPatchCable,
  RoomCableType,
  RoomCableEndpoint,
  RoomCable,
  UpstreamModemDevice,
  PlnBreakerBox,
  OdfWallPassthrough,
  InternetPlan,
  NetworkMetrics,
  MetricHistoryPoint,
  AlertMessage,
  FinanceState,
  GameTime,
  StoreItem,
  HardwareNode,
  NetworkEdge,
  HardwareTemplate,
  GameIncident,
  HardwareNodeType
} from '../types/game'
import { STORE_CATALOG, INITIAL_MAP_BUILDINGS, INITIAL_MAP_HOUSES } from './storeCatalog'
import { sound } from '../utils/soundEngine'

export const HARDWARE_CATALOG: HardwareTemplate[] = [
  {
    type: 'upstream',
    name: 'Tier-1 Global Transit (10 Gbps)',
    description: 'Direct backbone fiber link with Tier-1 international tier providers.',
    maxThroughputMbps: 10000,
    portCapacity: 4,
    cost: 7500,
    upkeepCostPerDay: 450,
    powerWatts: 450
  },
  {
    type: 'upstream',
    name: 'Tier-2 Regional IXP (2.5 Gbps)',
    description: 'Regional internet exchange transit peering for low local latency.',
    maxThroughputMbps: 2500,
    portCapacity: 4,
    cost: 2500,
    upkeepCostPerDay: 150,
    powerWatts: 200
  },
  {
    type: 'core_router',
    name: 'Core Router CloudEngine 10G',
    description: 'High-throughput carrier grade BGP/OSPF edge router with 10Gbps ports.',
    maxThroughputMbps: 10000,
    portCapacity: 12,
    cost: 3800,
    upkeepCostPerDay: 60,
    powerWatts: 220
  },
  {
    type: 'core_router',
    name: 'Edge Router CCR-3000',
    description: 'Mid-range rackmount router with hardware accelerated packet forwarding.',
    maxThroughputMbps: 3000,
    portCapacity: 8,
    cost: 1400,
    upkeepCostPerDay: 25,
    powerWatts: 90
  },
  {
    type: 'olt',
    name: 'GPON OLT Chassis (16-Port)',
    description: 'Chassis optical terminal supporting up to 1,024 optical subscribers.',
    maxThroughputMbps: 2500,
    portCapacity: 16,
    cost: 2200,
    upkeepCostPerDay: 40,
    powerWatts: 140
  },
  {
    type: 'olt',
    name: 'GPON OLT Mini (4-Port)',
    description: 'Compact 4-port 1U OLT for suburban cluster deployments.',
    maxThroughputMbps: 1000,
    portCapacity: 4,
    cost: 850,
    upkeepCostPerDay: 15,
    powerWatts: 50
  },
  {
    type: 'odp',
    name: 'Passive Fiber ODP (16-Way)',
    description: 'Passive optical distribution box mounted on utility poles.',
    maxThroughputMbps: 500,
    portCapacity: 16,
    cost: 180,
    upkeepCostPerDay: 2,
    powerWatts: 0
  }
]

const INITIAL_NODES: HardwareNode[] = [
  {
    id: 'node-upstream-1',
    name: 'Tier-2 Regional Peering',
    type: 'upstream',
    tier: 2,
    maxThroughputMbps: 2500,
    currentThroughputMbps: 0,
    portCapacity: 4,
    connectedPorts: 1,
    cost: 2500,
    upkeepCostPerDay: 150,
    powerWatts: 200,
    status: 'online',
    healthPct: 100,
    level: 1,
    position: { x: 100, y: 220 }
  },
  {
    id: 'node-router-1',
    name: 'Core CCR-3000',
    type: 'core_router',
    maxThroughputMbps: 3000,
    currentThroughputMbps: 0,
    portCapacity: 8,
    connectedPorts: 2,
    cost: 1400,
    upkeepCostPerDay: 25,
    powerWatts: 90,
    status: 'online',
    healthPct: 100,
    level: 1,
    position: { x: 420, y: 220 }
  },
  {
    id: 'node-olt-1',
    name: 'GPON OLT Mini #1',
    type: 'olt',
    maxThroughputMbps: 1000,
    currentThroughputMbps: 0,
    portCapacity: 4,
    connectedPorts: 1,
    cost: 850,
    upkeepCostPerDay: 15,
    powerWatts: 50,
    status: 'online',
    healthPct: 100,
    level: 1,
    position: { x: 740, y: 150 }
  },
  {
    id: 'node-odp-1',
    name: 'Cluster A ODP-01',
    type: 'odp',
    maxThroughputMbps: 500,
    currentThroughputMbps: 0,
    portCapacity: 16,
    connectedPorts: 0,
    cost: 180,
    upkeepCostPerDay: 2,
    powerWatts: 0,
    status: 'online',
    healthPct: 100,
    level: 1,
    position: { x: 1060, y: 150 }
  }
]

const INITIAL_EDGES: NetworkEdge[] = [
  { id: 'edge-up-router', source: 'node-upstream-1', target: 'node-router-1', bandwidthMbps: 2500 },
  { id: 'edge-router-olt', source: 'node-router-1', target: 'node-olt-1', bandwidthMbps: 1000 },
  { id: 'edge-olt-odp', source: 'node-olt-1', target: 'node-odp-1', bandwidthMbps: 500 }
]

export interface GameState {
  companyName: string
  time: GameTime
  metrics: NetworkMetrics
  history: MetricHistoryPoint[]
  finance: FinanceState
  alerts: AlertMessage[]
  activeTab: 'map' | 'rack' | 'store' | 'dashboard' | 'plans' | 'finance' | 'topology'
  isMuted: boolean

  // Game Mode: 'realistic' (2D map + physical rack) vs 'arcade' (React Flow topology)
  gameMode: 'realistic' | 'arcade'
  serverRoomViewMode: '2d' | '3d'
  setGameMode: (mode: 'realistic' | 'arcade') => void
  setServerRoomViewMode: (mode: '2d' | '3d') => void

  // 1. Inventory (Realistic Mode)
  inventory: Record<string, number>

  // 2. 2D Map State (Realistic Mode)
  mapToolMode: MapToolMode
  mapBuildings: MapBuilding[]
  mapHouses: MapHouse[]
  mapPoles: MapPole[]
  mapOdcs: MapOdc[]
  mapOdps: MapOdp[]
  mapCables: MapCable[]
  cableStartPoint: { type: 'building' | 'odc' | 'pole'; id: string; x: number; y: number } | null
  inspectedMapObject: { type: string; id: string } | null

  // 3. Physical Server Room & Building (42U Rack & Realistic Infrastructure)
  serverRack: {
    hasRack: boolean
    devices: RackDevice[]
    patchCables: RackPatchCable[]
  }
  selectedPortForPatching: { deviceId: string; portId: string } | null

  serverBuilding: {
    plnBreaker: PlnBreakerBox
    upstreamModem: UpstreamModemDevice
    odfPassthrough: OdfWallPassthrough
    roomCables: RoomCable[]
    selectedCableTool: RoomCableType | 'unplug' | null
    selectedEndpoint: RoomCableEndpoint | null
    subView: 'building_room' | 'rack_closeup'
  }

  // 4. Arcade Mode Topology State
  nodes: HardwareNode[]
  edges: NetworkEdge[]
  inspectedNodeId: string | null
  activeIncident: GameIncident | null

  // 5. Plans & Economy
  plans: InternetPlan[]

  // Navigation & General Actions
  setActiveTab: (tab: 'map' | 'rack' | 'store' | 'dashboard' | 'plans' | 'finance' | 'topology') => void
  setCompanyName: (name: string) => void
  setSpeed: (speed: number) => void
  togglePause: () => void
  toggleMute: () => void
  setMapToolMode: (mode: MapToolMode) => void
  inspectMapObject: (obj: { type: string; id: string } | null) => void

  // Store & Inventory Actions
  buyStoreItem: (itemId: string, multiplier?: number) => void

  // 2D Map Infrastructure Actions
  leaseBuilding: (buildingId: string) => void
  buildPole: (x: number, y: number) => void
  placeOdc: (x: number, y: number) => void
  mountOdp: (poleId: string) => void
  startStringingCable: (point: { type: 'building' | 'odc' | 'pole'; id: string; x: number; y: number }) => void
  finishStringingCable: (point: { type: 'building' | 'odc' | 'pole'; id: string; x: number; y: number }) => void
  cancelStringingCable: () => void
  demolishObject: (type: string, id: string) => void

  // Server Building & Physical Room Actions
  togglePlnMcb: () => void
  toggleModemPower: () => void
  setServerBuildingSubView: (view: 'building_room' | 'rack_closeup') => void
  setSelectedCableTool: (tool: RoomCableType | 'unplug' | null) => void
  selectCableEndpoint: (endpoint: RoomCableEndpoint | null) => void
  connectRoomCable: (from: RoomCableEndpoint, to: RoomCableEndpoint, type: RoomCableType) => void
  removeRoomCable: (cableId: string) => void

  // Server Rack Actions
  mountRackDevice: (templateId: string, uSlot: number) => void
  unmountRackDevice: (deviceId: string) => void
  toggleDevicePower: (deviceId: string) => void
  startPatchingCable: (deviceId: string, portId: string) => void
  connectPatchCable: (targetDeviceId: string, targetPortId: string) => void
  removePatchCable: (cableId: string) => void

  // Arcade Topology Actions
  addNode: (template: HardwareTemplate, position?: { x: number; y: number }) => void
  removeNode: (id: string) => void
  updateNodePosition: (id: string, position: { x: number; y: number }) => void
  addEdge: (source: string, target: string) => void
  removeEdge: (id: string) => void
  inspectNode: (id: string | null) => void
  upgradeNode: (id: string) => void
  rebootNode: (id: string) => void

  // Plans & Finance Actions
  addPlan: (plan: Omit<InternetPlan, 'id' | 'activeSubscribers' | 'targetSubscribers' | 'unlocked'>) => void
  updatePlan: (id: string, updates: Partial<InternetPlan>) => void
  deletePlan: (id: string) => void
  leaseUpstreamBandwidth: (amountMbps: number) => void
  changeCurrency: (currency: 'USD' | 'IDR') => void

  // Incidents
  resolveIncident: (choiceId: string) => void
  dismissIncident: () => void

  // Simulation Tick
  tick: () => void

  // Persistence
  saveToDisk: () => Promise<boolean>
  loadFromDisk: () => Promise<boolean>
  resetGame: () => void
  addAlert: (message: string, type: 'info' | 'warning' | 'danger' | 'success') => void
  clearAlerts: () => void
}

const INITIAL_FINANCE: FinanceState = {
  cash: 18500,
  currency: 'USD',
  dailyRevenue: 0,
  dailyExpense: 0,
  buildingRentDaily: 0,
  leasedUpstreamMbps: 1000,
  upstreamCostPerMbps: 0.12,
  hardwareMaintenanceCost: 0,
  powerCostPerKWh: 0.14
}

const INITIAL_TIME: GameTime = {
  tickCount: 0,
  day: 1,
  hour: 8,
  minute: 0,
  speed: 1,
  isPaused: false
}

const INITIAL_PLANS: InternetPlan[] = [
  {
    id: 'plan-basic',
    name: 'Home Fiber 20M',
    speedMbps: 20,
    monthlyPrice: 25,
    activeSubscribers: 0,
    targetSubscribers: 0,
    tierType: 'residential',
    slaTargetPct: 98.0,
    unlocked: true
  },
  {
    id: 'plan-fast',
    name: 'Family Fast 50M',
    speedMbps: 50,
    monthlyPrice: 40,
    activeSubscribers: 0,
    targetSubscribers: 0,
    tierType: 'residential',
    slaTargetPct: 99.0,
    unlocked: true
  },
  {
    id: 'plan-gamer',
    name: 'Gamer Ultra 100M',
    speedMbps: 100,
    monthlyPrice: 65,
    activeSubscribers: 0,
    targetSubscribers: 0,
    tierType: 'gaming',
    slaTargetPct: 99.8,
    unlocked: true
  }
]

export const INITIAL_STARTER_DEVICES: RackDevice[] = [
  {
    id: 'dev-router-mikrotik',
    brand: 'MikroTik',
    model: 'CCR2004-1G-12S+2XS',
    name: 'Core Router CCR2004 10G',
    type: 'core_router',
    uSlot: 38,
    uHeight: 1,
    maxThroughputMbps: 10000,
    powerWatts: 45,
    isPowered: true,
    healthPct: 100,
    ports: [
      { id: 'pwr-1', name: 'PWR 220V', type: 'power_ac', isInput: true },
      { id: 'wan-1', name: 'WAN (ether1)', type: 'copper_rj45', isInput: true },
      { id: 'lan-1', name: 'LAN (ether2)', type: 'copper_rj45', isInput: false },
      { id: 'sfp-1', name: 'SFP+ 10G (sfp1)', type: 'fiber_sfp', isInput: false },
      { id: 'sfp-2', name: 'SFP+ 10G (sfp2)', type: 'fiber_sfp', isInput: false }
    ]
  },
  {
    id: 'dev-olt-zte',
    brand: 'ZTE',
    model: 'ZXA10 C320 Mini-OLT',
    name: 'GPON OLT ZTE C320',
    type: 'gpon_olt',
    uSlot: 35,
    uHeight: 2,
    maxThroughputMbps: 2500,
    powerWatts: 75,
    isPowered: true,
    healthPct: 100,
    ports: [
      { id: 'pwr-1', name: 'PWR 220V', type: 'power_ac', isInput: true },
      { id: 'uplink-1', name: 'UPLINK 10G (XG1)', type: 'fiber_sfp', isInput: true },
      { id: 'pon-1', name: 'PON 1 (Class C+)', type: 'fiber_pon', isInput: false },
      { id: 'pon-2', name: 'PON 2 (Class C+)', type: 'fiber_pon', isInput: false },
      { id: 'pon-3', name: 'PON 3 (Class C+)', type: 'fiber_pon', isInput: false },
      { id: 'pon-4', name: 'PON 4 (Class C+)', type: 'fiber_pon', isInput: false }
    ]
  },
  {
    id: 'dev-odf-panduit',
    brand: 'Panduit',
    model: 'Opti-Core 1U 24-Port SC/UPC',
    name: 'ODF Patch Panel 24-Port',
    type: 'odf_patch_panel',
    uSlot: 40,
    uHeight: 1,
    maxThroughputMbps: 10000,
    powerWatts: 0,
    isPowered: true,
    healthPct: 100,
    ports: [
      { id: 'sc-1', name: 'ODF Core 1', type: 'fiber_sc', isInput: true },
      { id: 'sc-2', name: 'ODF Core 2', type: 'fiber_sc', isInput: true }
    ]
  }
]

export const INITIAL_SERVER_BUILDING = {
  plnBreaker: {
    id: 'pln-main-mcb',
    name: 'Panel MCB PLN 5500VA',
    isMcbOn: true,
    voltage: 220,
    sockets: [
      { id: 'socket-wall-desk', name: 'Stop Kontak Meja (220V)', type: 'power_ac' as const },
      { id: 'socket-wall-rack', name: 'Stop Kontak Rak (220V)', type: 'power_ac' as const }
    ]
  },
  upstreamModem: {
    id: 'modem-isp-upstream',
    brand: 'ZTE',
    model: 'ZXHN F609 GPON ONT',
    name: 'Modem ONT GPON ISP Induk',
    ispProviderName: 'Telkom Wholesale / IndiHome Metro-E',
    isPowered: true,
    hasPonLight: true,
    throughputMbps: 1000,
    ipAddress: '103.144.20.1/29',
    ports: [
      { id: 'modem-pwr', name: 'DC 12V In', type: 'power_dc' as const },
      { id: 'modem-pon', name: 'PON Optical In', type: 'fiber_pon' as const },
      { id: 'modem-lan1', name: 'LAN 1 (GE 1G)', type: 'copper_rj45' as const },
      { id: 'modem-lan2', name: 'LAN 2 (GE 1G)', type: 'copper_rj45' as const },
      { id: 'modem-lan3', name: 'LAN 3 (GE 1G)', type: 'copper_rj45' as const },
      { id: 'modem-lan4', name: 'LAN 4 (GE 1G)', type: 'copper_rj45' as const }
    ]
  },
  odfPassthrough: {
    id: 'odf-wall-passthrough',
    name: 'ODF Wall Passthrough (Kabel Keluar ke Peta Kota)',
    ports: [
      { id: 'wall-feeder-1', name: 'Core 1 (Out to City Poles)', type: 'fiber_sc' as const, leadsToCityFeeder: true },
      { id: 'wall-feeder-2', name: 'Core 2 (Out to City Poles)', type: 'fiber_sc' as const, leadsToCityFeeder: true },
      { id: 'wall-feeder-3', name: 'Core 3 (Backup)', type: 'fiber_sc' as const, leadsToCityFeeder: false },
      { id: 'wall-feeder-4', name: 'Core 4 (Backup)', type: 'fiber_sc' as const, leadsToCityFeeder: false }
    ]
  },
  roomCables: [
    {
      id: 'cable-pwr-modem',
      type: 'power' as const,
      from: { type: 'pln_socket' as const, portId: 'socket-wall-desk', label: 'Stop Kontak Meja' },
      to: { type: 'upstream_modem' as const, portId: 'modem-pwr', label: 'Modem ISP (DC 12V)' },
      color: '#10b981',
      isActive: true
    },
    {
      id: 'cable-pwr-router',
      type: 'power' as const,
      from: { type: 'pln_socket' as const, portId: 'socket-wall-rack', label: 'Stop Kontak Rak' },
      to: { type: 'rack_device' as const, deviceId: 'dev-router-mikrotik', portId: 'pwr-1', label: 'MikroTik CCR2004 (PWR)' },
      color: '#10b981',
      isActive: true
    },
    {
      id: 'cable-pwr-olt',
      type: 'power' as const,
      from: { type: 'pln_socket' as const, portId: 'socket-wall-rack', label: 'Stop Kontak Rak' },
      to: { type: 'rack_device' as const, deviceId: 'dev-olt-zte', portId: 'pwr-1', label: 'ZTE C320 OLT (PWR)' },
      color: '#10b981',
      isActive: true
    },
    {
      id: 'cable-lan-modem-router',
      type: 'lan' as const,
      from: { type: 'upstream_modem' as const, portId: 'modem-lan1', label: 'Modem ISP (LAN 1)' },
      to: { type: 'rack_device' as const, deviceId: 'dev-router-mikrotik', portId: 'wan-1', label: 'Core Router (WAN)' },
      color: '#3b82f6',
      isActive: true
    },
    {
      id: 'cable-fiber-router-olt',
      type: 'fiber' as const,
      from: { type: 'rack_device' as const, deviceId: 'dev-router-mikrotik', portId: 'sfp-1', label: 'Core Router (SFP+)' },
      to: { type: 'rack_device' as const, deviceId: 'dev-olt-zte', portId: 'uplink-1', label: 'ZTE OLT (Uplink)' },
      color: '#f59e0b',
      isActive: true
    },
    {
      id: 'cable-fiber-olt-odf',
      type: 'fiber' as const,
      from: { type: 'rack_device' as const, deviceId: 'dev-olt-zte', portId: 'pon-1', label: 'ZTE OLT (PON 1)' },
      to: { type: 'odf_wall' as const, portId: 'wall-feeder-1', label: 'ODF Wall (Feeder Out)' },
      color: '#eab308',
      isActive: true
    }
  ],
  selectedCableTool: null as RoomCableType | 'unplug' | null,
  selectedEndpoint: null as RoomCableEndpoint | null,
  subView: 'building_room' as 'building_room' | 'rack_closeup'
}

export const useGameStore = create<GameState>((set, get) => ({
  companyName: 'Apex Fiber Networks',
  time: INITIAL_TIME,
  metrics: {
    totalDemandMbps: 0,
    totalUpstreamCapacityMbps: 1000,
    totalCoreRouterCapacityMbps: 0,
    effectiveCapacityMbps: 0,
    usedBandwidthMbps: 0,
    concurrencyFactor: 0.3,
    packetLossPct: 0,
    pingMs: 14,
    satisfactionPct: 100,
    reputation: 80,
    activeHousesCovered: 0,
    totalSubscribersCount: 0
  },
  history: [],
  finance: INITIAL_FINANCE,
  alerts: [
    {
      id: 'init-alert-1',
      timestamp: 'Day 1 - 08:00',
      type: 'info',
      message: 'Selamat datang di ISP Tycoon! Sewa Ruko NOC di peta atau beli perangkat dari Toko Hardware.'
    }
  ],
  activeTab: 'map',
  isMuted: false,

  gameMode: 'realistic',
  serverRoomViewMode: '2d',
  setGameMode: (mode) => {
    sound.playClick()
    set({
      gameMode: mode,
      activeTab: mode === 'realistic' ? 'map' : 'topology'
    })
  },
  setServerRoomViewMode: (mode) => {
    sound.playClick()
    set({ serverRoomViewMode: mode })
  },

  // Inventory (Realistic Mode)
  inventory: {
    'item-pole-7m': 6,
    'item-cable-dist-500m': 500,
    'item-cable-feeder-1000m': 1000,
    'item-odc-48': 1,
    'item-odp-8': 2,
    'item-cable-power-ac': 4,
    'item-cable-lan-cat6': 4,
    'item-patch-cord-fiber': 6
  },

  // 2D Map State
  mapToolMode: 'select',
  mapBuildings: INITIAL_MAP_BUILDINGS,
  mapHouses: INITIAL_MAP_HOUSES,
  mapPoles: [],
  mapOdcs: [],
  mapOdps: [],
  mapCables: [],
  cableStartPoint: null,
  inspectedMapObject: null,

  // Physical Server Rack & Building
  serverRack: {
    hasRack: true,
    devices: INITIAL_STARTER_DEVICES,
    patchCables: []
  },
  selectedPortForPatching: null,
  serverBuilding: INITIAL_SERVER_BUILDING,

  // Arcade Mode Topology
  nodes: INITIAL_NODES,
  edges: INITIAL_EDGES,
  inspectedNodeId: null,
  activeIncident: null,

  plans: INITIAL_PLANS,

  setActiveTab: (tab) => {
    sound.playClick()
    set({ activeTab: tab })
  },
  setCompanyName: (name) => set({ companyName: name }),
  setSpeed: (speed) => {
    sound.playClick()
    set((state) => ({ time: { ...state.time, speed, isPaused: speed === 0 } }))
  },
  togglePause: () => {
    sound.playClick()
    set((state) => ({
      time: {
        ...state.time,
        isPaused: !state.time.isPaused,
        speed: state.time.isPaused ? (state.time.speed === 0 ? 1 : state.time.speed) : 0
      }
    }))
  },
  toggleMute: () => {
    const isMuted = sound.toggleMute()
    set({ isMuted })
  },
  setMapToolMode: (mode) => {
    sound.playClick()
    set({ mapToolMode: mode, cableStartPoint: null })
  },
  inspectMapObject: (obj) => {
    sound.playClick()
    set({ inspectedMapObject: obj })
  },

  // Store & Inventory
  buyStoreItem: (itemId, multiplier = 1) => {
    const state = get()
    const item = STORE_CATALOG.find((i) => i.id === itemId)
    if (!item) return

    const totalCost = item.cost * multiplier
    if (state.finance.cash < totalCost) {
      state.addAlert(`Kas tidak mencukupi untuk membeli ${item.name}! Butuh $${totalCost.toLocaleString()}`, 'warning')
      return
    }

    sound.playCash()
    const addedQty = item.quantityPerBuy * multiplier
    const currentQty = state.inventory[itemId] || 0

    let updatedRack = { ...state.serverRack }
    if (itemId === 'item-rack-42u') {
      updatedRack.hasRack = true
    }

    set({
      finance: {
        ...state.finance,
        cash: state.finance.cash - totalCost
      },
      inventory: {
        ...state.inventory,
        [itemId]: currentQty + addedQty
      },
      serverRack: updatedRack
    })

    state.addAlert(`Membeli ${addedQty} ${item.unit} ${item.name} (-$${totalCost.toLocaleString()})`, 'success')
  },

  // 2D Map Actions
  leaseBuilding: (buildingId) => {
    const state = get()
    const bldg = state.mapBuildings.find((b) => b.id === buildingId)
    if (!bldg || bldg.isLeasedByPlayer) return

    sound.playDeploy()
    set({
      mapBuildings: state.mapBuildings.map((b) =>
        b.id === buildingId ? { ...b, isLeasedByPlayer: true } : b
      ),
      finance: {
        ...state.finance,
        buildingRentDaily: state.finance.buildingRentDaily + Math.round(bldg.monthlyRent / 30)
      }
    })
    state.addAlert(`Menyewa ${bldg.name}! Sekarang kamu bisa memasang rak server dan menarik kabel feeder ke jalan.`, 'success')
  },

  buildPole: (x, y) => {
    const state = get()
    const poleCount = state.inventory['item-pole-7m'] || 0
    if (poleCount <= 0) {
      state.addAlert('Tiang beton habis di gudang! Beli tiang di Toko Hardware terlebih dahulu.', 'warning')
      return
    }

    sound.playDeploy()
    const newPole: MapPole = {
      id: `pole-${Date.now().toString().slice(-4)}`,
      x,
      y
    }

    set({
      inventory: {
        ...state.inventory,
        'item-pole-7m': poleCount - 1
      },
      mapPoles: [...state.mapPoles, newPole]
    })
    state.addAlert(`Menanam tiang beton di koordinat (${Math.round(x)}, ${Math.round(y)})`, 'info')
  },

  placeOdc: (x, y) => {
    const state = get()
    const odcCount = state.inventory['item-odc-48'] || 0
    if (odcCount <= 0) {
      state.addAlert('Lemari ODC habis di gudang! Beli ODC di Toko Hardware terlebih dahulu.', 'warning')
      return
    }

    sound.playDeploy()
    const newOdc: MapOdc = {
      id: `odc-${Date.now().toString().slice(-4)}`,
      name: `ODC-${state.mapOdcs.length + 1}`,
      x,
      y,
      capacityPorts: 48,
      connectedPorts: 0
    }

    set({
      inventory: {
        ...state.inventory,
        'item-odc-48': odcCount - 1
      },
      mapOdcs: [...state.mapOdcs, newOdc]
    })
    state.addAlert(`Memasang lemari distribusi ${newOdc.name}`, 'info')
  },

  mountOdp: (poleId) => {
    const state = get()
    const odpCount = (state.inventory['item-odp-8'] || 0) + (state.inventory['item-odp-16'] || 0)
    if (odpCount <= 0) {
      state.addAlert('Kotak ODP habis di gudang! Beli ODP di Toko Hardware.', 'warning')
      return
    }

    const pole = state.mapPoles.find((p) => p.id === poleId)
    if (!pole) return
    if (pole.mountedOdpId) {
      state.addAlert('Tiang ini sudah terpasang kotak ODP!', 'warning')
      return
    }

    sound.playDeploy()
    const use16 = (state.inventory['item-odp-16'] || 0) > 0
    const itemKey = use16 ? 'item-odp-16' : 'item-odp-8'
    const capacity = use16 ? 16 : 8

    const newOdp: MapOdp = {
      id: `odp-${Date.now().toString().slice(-4)}`,
      name: `ODP-${state.mapOdps.length + 1}`,
      x: pole.x,
      y: pole.y,
      poleId,
      capacityPorts: capacity,
      connectedHousesCount: 0,
      coverageRadius: 130,
      hasSignal: false
    }

    set({
      inventory: {
        ...state.inventory,
        [itemKey]: state.inventory[itemKey] - 1
      },
      mapOdps: [...state.mapOdps, newOdp],
      mapPoles: state.mapPoles.map((p) => (p.id === poleId ? { ...p, mountedOdpId: newOdp.id } : p))
    })
    state.addAlert(`Memasang ${newOdp.name} (${capacity} Port) pada tiang. Radius sinyal aktif!`, 'success')
  },

  startStringingCable: (point) => {
    sound.playClick()
    set({ cableStartPoint: point })
  },

  finishStringingCable: (target) => {
    const state = get()
    if (!state.cableStartPoint) return
    if (state.cableStartPoint.id === target.id) {
      set({ cableStartPoint: null })
      return
    }

    const dx = target.x - state.cableStartPoint.x
    const dy = target.y - state.cableStartPoint.y
    const distanceMeters = Math.max(10, Math.round(Math.sqrt(dx * dx + dy * dy)))

    const isFeeder = state.cableStartPoint.type === 'building' || target.type === 'building'
    const cableInventoryKey = isFeeder ? 'item-cable-feeder-1000m' : 'item-cable-dist-500m'
    const availableCable = state.inventory[cableInventoryKey] || 0

    if (availableCable < distanceMeters) {
      state.addAlert(
        `Kabel ${isFeeder ? 'Feeder' : 'Distribusi'} tidak cukup di gudang! Butuh ${distanceMeters}m, tersedia ${availableCable}m.`,
        'warning'
      )
      set({ cableStartPoint: null })
      return
    }

    sound.playConnect()
    const newCable: MapCable = {
      id: `cable-${Date.now().toString().slice(-4)}`,
      type: isFeeder ? 'feeder' : 'distribution',
      fromType: state.cableStartPoint.type,
      fromId: state.cableStartPoint.id,
      toType: target.type,
      toId: target.id,
      lengthMeters: distanceMeters,
      cores: isFeeder ? 24 : 8,
      hasSignal: false
    }

    set({
      inventory: {
        ...state.inventory,
        [cableInventoryKey]: availableCable - distanceMeters
      },
      mapCables: [...state.mapCables, newCable],
      cableStartPoint: null
    })
    state.addAlert(`Berhasil menarik ${distanceMeters}m kabel fiber optik ${newCable.type}!`, 'success')
  },

  cancelStringingCable: () => {
    set({ cableStartPoint: null })
  },

  demolishObject: (type, id) => {
    sound.playClick()
    const state = get()
    if (type === 'pole') {
      set({
        mapPoles: state.mapPoles.filter((p) => p.id !== id),
        mapOdps: state.mapOdps.filter((o) => o.poleId !== id),
        mapCables: state.mapCables.filter((c) => c.fromId !== id && c.toId !== id)
      })
      state.addAlert('Membongkar tiang dan memotong kabel yang terpasang.', 'info')
    } else if (type === 'odc') {
      set({
        mapOdcs: state.mapOdcs.filter((o) => o.id !== id),
        mapCables: state.mapCables.filter((c) => c.fromId !== id && c.toId !== id)
      })
      state.addAlert('Membongkar lemari ODC.', 'info')
    } else if (type === 'cable') {
      set({
        mapCables: state.mapCables.filter((c) => c.id !== id)
      })
      state.addAlert('Memotong bentangan kabel optik.', 'info')
    }
  },

  // Server Rack Actions
  mountRackDevice: (templateId, uSlot) => {
    const state = get()
    const item = STORE_CATALOG.find((i) => i.id === templateId)
    if (!item || !item.rackHeightU) return

    const qtyInInventory = state.inventory[templateId] || 0
    if (qtyInInventory <= 0) {
      state.addAlert(`Tidak ada ${item.name} di gudang! Beli dari toko terlebih dahulu.`, 'warning')
      return
    }

    const isOccupied = state.serverRack.devices.some((d) => {
      const dEnd = d.uSlot + d.uHeight - 1
      const newEnd = uSlot + item.rackHeightU! - 1
      return !(newEnd < d.uSlot || uSlot > dEnd)
    })

    if (isOccupied) {
      state.addAlert(`Slot U${uSlot} sudah terisi oleh perangkat lain!`, 'warning')
      return
    }

    sound.playDeploy()

    const ports: RackPort[] = [
      { id: 'pwr-1', name: 'PWR 220V', type: 'power_ac', isInput: true }
    ]

    if (item.id.includes('router')) {
      ports.push(
        { id: 'wan-1', name: 'WAN (ether1)', type: 'copper_rj45', isInput: true },
        { id: 'lan-1', name: 'LAN (ether2)', type: 'copper_rj45', isInput: false },
        { id: 'sfp-1', name: 'SFP+ 10G (sfp1)', type: 'fiber_sfp', isInput: false },
        { id: 'sfp-2', name: 'SFP+ 10G (sfp2)', type: 'fiber_sfp', isInput: false }
      )
    } else if (item.id.includes('olt')) {
      ports.push(
        { id: 'uplink-1', name: 'UPLINK 10G (XG1)', type: 'fiber_sfp', isInput: true },
        { id: 'pon-1', name: 'PON 1 (Class C+)', type: 'fiber_pon', isInput: false },
        { id: 'pon-2', name: 'PON 2 (Class C+)', type: 'fiber_pon', isInput: false },
        { id: 'pon-3', name: 'PON 3 (Class C+)', type: 'fiber_pon', isInput: false },
        { id: 'pon-4', name: 'PON 4 (Class C+)', type: 'fiber_pon', isInput: false }
      )
    } else if (item.id.includes('ups')) {
      ports.push(
        { id: 'out-1', name: 'UPS OUT 1 (220V)', type: 'power_ac', isInput: false },
        { id: 'out-2', name: 'UPS OUT 2 (220V)', type: 'power_ac', isInput: false }
      )
    } else if (item.id.includes('odf')) {
      ports.push(
        { id: 'sc-1', name: 'ODF Core 1', type: 'fiber_sc', isInput: true },
        { id: 'sc-2', name: 'ODF Core 2', type: 'fiber_sc', isInput: true },
        { id: 'sc-3', name: 'ODF Core 3', type: 'fiber_sc', isInput: true },
        { id: 'sc-4', name: 'ODF Core 4', type: 'fiber_sc', isInput: true }
      )
    } else {
      ports.push(
        { id: 'p-1', name: 'PORT 1', type: 'fiber_sfp', isInput: true },
        { id: 'p-2', name: 'PORT 2', type: 'fiber_sfp', isInput: false }
      )
    }

    const newDevice: RackDevice = {
      id: `dev-${item.id.replace('item-', '')}-${Date.now().toString().slice(-4)}`,
      brand: item.brand,
      model: item.model,
      name: item.name.split(' (')[0],
      type:
        item.id.includes('upstream')
          ? 'upstream_gateway'
          : item.id.includes('router')
            ? 'core_router'
            : item.id.includes('olt')
              ? 'gpon_olt'
              : item.id.includes('odf')
                ? 'odf_patch_panel'
                : 'ups_battery',
      uSlot,
      uHeight: item.rackHeightU,
      maxThroughputMbps: item.throughputMbps || 1000,
      powerWatts: item.powerWatts || 50,
      isPowered: true,
      healthPct: 100,
      ports
    }

    set({
      inventory: {
        ...state.inventory,
        [templateId]: qtyInInventory - 1
      },
      serverRack: {
        ...state.serverRack,
        devices: [...state.serverRack.devices, newDevice]
      }
    })
    state.addAlert(`Memasang ${newDevice.brand} ${newDevice.model} di slot U${uSlot}!`, 'success')
  },

  unmountRackDevice: (deviceId) => {
    sound.playClick()
    const state = get()
    const device = state.serverRack.devices.find((d) => d.id === deviceId)
    if (!device) return

    set({
      serverRack: {
        ...state.serverRack,
        devices: state.serverRack.devices.filter((d) => d.id !== deviceId),
        patchCables: state.serverRack.patchCables.filter(
          (c) => c.fromDeviceId !== deviceId && c.toDeviceId !== deviceId
        )
      },
      serverBuilding: {
        ...state.serverBuilding,
        roomCables: state.serverBuilding.roomCables.filter(
          (c) => c.from.deviceId !== deviceId && c.to.deviceId !== deviceId
        )
      }
    })
    state.addAlert(`Membongkar ${device.name} dari rak server.`, 'info')
  },

  toggleDevicePower: (deviceId) => {
    sound.playClick()
    set((state) => ({
      serverRack: {
        ...state.serverRack,
        devices: state.serverRack.devices.map((d) =>
          d.id === deviceId ? { ...d, isPowered: !d.isPowered } : d
        )
      }
    }))
  },

  // Server Building Actions
  togglePlnMcb: () => {
    sound.playClick()
    const state = get()
    const newStatus = !state.serverBuilding.plnBreaker.isMcbOn
    set({
      serverBuilding: {
        ...state.serverBuilding,
        plnBreaker: {
          ...state.serverBuilding.plnBreaker,
          isMcbOn: newStatus
        }
      }
    })
    state.addAlert(
      newStatus
        ? '⚡ Saklar MCB PLN 5500VA dinyalakan (ON) - Arus listrik 220V aktif!'
        : '⚠️ Saklar MCB PLN 5500VA dimatikan (OFF) - Perangkat kehilangan daya AC!',
      newStatus ? 'success' : 'warning'
    )
  },

  toggleModemPower: () => {
    sound.playClick()
    const state = get()
    const newStatus = !state.serverBuilding.upstreamModem.isPowered
    set({
      serverBuilding: {
        ...state.serverBuilding,
        upstreamModem: {
          ...state.serverBuilding.upstreamModem,
          isPowered: newStatus
        }
      }
    })
    state.addAlert(
      newStatus ? 'Modem ONT ISP Induk dinyalakan.' : 'Modem ONT ISP Induk dimatikan.',
      newStatus ? 'info' : 'warning'
    )
  },

  setServerBuildingSubView: (view) => {
    sound.playClick()
    set((state) => ({
      serverBuilding: {
        ...state.serverBuilding,
        subView: view
      }
    }))
  },

  setSelectedCableTool: (tool) => {
    sound.playClick()
    set((state) => ({
      serverBuilding: {
        ...state.serverBuilding,
        selectedCableTool: tool,
        selectedEndpoint: null
      }
    }))
  },

  selectCableEndpoint: (endpoint) => {
    sound.playClick()
    set((state) => ({
      serverBuilding: {
        ...state.serverBuilding,
        selectedEndpoint: endpoint
      }
    }))
  },

  connectRoomCable: (from, to, type) => {
    const state = get()
    if (from.type === to.type && from.deviceId === to.deviceId && from.portId === to.portId) {
      return
    }

    let invKey = ''
    if (type === 'power') invKey = 'item-cable-power-ac'
    if (type === 'lan') invKey = 'item-cable-lan-cat6'
    if (type === 'fiber') invKey = 'item-patch-cord-fiber'

    const available = state.inventory[invKey] || 0
    if (available <= 0) {
      state.addAlert(`Kabel ${type.toUpperCase()} di gudang habis! Beli kabel di Toko Hardware terlebih dahulu.`, 'warning')
      return
    }

    let color = '#3b82f6'
    if (type === 'power') color = '#10b981'
    if (type === 'fiber') color = '#f59e0b'

    const newCable: RoomCable = {
      id: `rcable-${type}-${Date.now().toString().slice(-5)}`,
      type,
      from,
      to,
      color,
      isActive: true
    }

    sound.playConnect()
    set({
      inventory: {
        ...state.inventory,
        [invKey]: available - 1
      },
      serverBuilding: {
        ...state.serverBuilding,
        roomCables: [...state.serverBuilding.roomCables, newCable],
        selectedEndpoint: null
      }
    })
    state.addAlert(`Menghubungkan kabel ${type.toUpperCase()} dari ${from.label} ke ${to.label}!`, 'success')
  },

  removeRoomCable: (cableId) => {
    sound.playClick()
    const state = get()
    const cable = state.serverBuilding.roomCables.find((c) => c.id === cableId)
    if (!cable) return

    let invKey = ''
    if (cable.type === 'power') invKey = 'item-cable-power-ac'
    if (cable.type === 'lan') invKey = 'item-cable-lan-cat6'
    if (cable.type === 'fiber') invKey = 'item-patch-cord-fiber'

    set({
      inventory: {
        ...state.inventory,
        [invKey]: (state.inventory[invKey] || 0) + 1
      },
      serverBuilding: {
        ...state.serverBuilding,
        roomCables: state.serverBuilding.roomCables.filter((c) => c.id !== cableId)
      }
    })
    state.addAlert(`Mencabut kabel dan mengembalikannya ke gudang inventaris.`, 'info')
  },

  startPatchingCable: (deviceId, portId) => {
    sound.playClick()
    set({ selectedPortForPatching: { deviceId, portId } })
  },

  connectPatchCable: (targetDeviceId, targetPortId) => {
    const state = get()
    if (!state.selectedPortForPatching) return
    const { deviceId: fromDevId, portId: fromPortId } = state.selectedPortForPatching

    if (fromDevId === targetDeviceId && fromPortId === targetPortId) {
      set({ selectedPortForPatching: null })
      return
    }

    sound.playConnect()
    const newPatchCable: RackPatchCable = {
      id: `patch-${Date.now().toString().slice(-4)}`,
      fromDeviceId: fromDevId,
      fromPortId: fromPortId,
      toDeviceId: targetDeviceId,
      toPortId: targetPortId,
      color: '#facc15',
      bandwidthMbps: 10000
    }

    set({
      serverRack: {
        ...state.serverRack,
        patchCables: [...state.serverRack.patchCables, newPatchCable]
      },
      selectedPortForPatching: null
    })
    state.addAlert(`Menancapkan kabel patch jumper fiber optik antar port!`, 'success')
  },

  removePatchCable: (cableId) => {
    sound.playClick()
    set((state) => ({
      serverRack: {
        ...state.serverRack,
        patchCables: state.serverRack.patchCables.filter((c) => c.id !== cableId)
      }
    }))
  },

  // Arcade Mode Actions
  addNode: (template, position) => {
    const state = get()
    if (state.finance.cash < template.cost) {
      state.addAlert(`Kas tidak mencukupi untuk membeli ${template.name}! Butuh $${template.cost.toLocaleString()}`, 'warning')
      return
    }

    sound.playDeploy()
    const newNodeId = `node-${template.type}-${Date.now().toString().slice(-4)}`
    const defaultPositions: Record<HardwareNodeType, { x: number; y: number }> = {
      upstream: { x: 120, y: 150 + Math.random() * 200 },
      core_router: { x: 440, y: 150 + Math.random() * 200 },
      olt: { x: 760, y: 150 + Math.random() * 200 },
      odp: { x: 1080, y: 150 + Math.random() * 200 }
    }

    const newNode: HardwareNode = {
      id: newNodeId,
      name: `${template.name.split(' (')[0]} #${state.nodes.length + 1}`,
      type: template.type,
      maxThroughputMbps: template.maxThroughputMbps,
      currentThroughputMbps: 0,
      portCapacity: template.portCapacity,
      connectedPorts: 0,
      cost: template.cost,
      upkeepCostPerDay: template.upkeepCostPerDay,
      powerWatts: template.powerWatts,
      status: 'online',
      healthPct: 100,
      level: 1,
      position: position || defaultPositions[template.type]
    }

    set((s) => ({
      finance: { ...s.finance, cash: s.finance.cash - template.cost },
      nodes: [...s.nodes, newNode]
    }))
    state.addAlert(`Memasang perangkat arcade: ${newNode.name}`, 'success')
  },

  removeNode: (id) =>
    set((state) => {
      sound.playClick()
      const nodeToRemove = state.nodes.find((n) => n.id === id)
      if (!nodeToRemove) return state
      const refund = Math.round(nodeToRemove.cost * 0.4)
      return {
        finance: { ...state.finance, cash: state.finance.cash + refund },
        nodes: state.nodes.filter((n) => n.id !== id),
        edges: state.edges.filter((e) => e.source !== id && e.target !== id)
      }
    }),

  updateNodePosition: (id, position) =>
    set((state) => ({
      nodes: state.nodes.map((n) => (n.id === id ? { ...n, position } : n))
    })),

  addEdge: (source, target) =>
    set((state) => {
      const exists = state.edges.some(
        (e) => (e.source === source && e.target === target) || (e.source === target && e.target === source)
      )
      if (exists || source === target) return state
      sound.playConnect()
      return {
        edges: [
          ...state.edges,
          { id: `edge-${source}-${target}`, source, target, bandwidthMbps: 2500 }
        ]
      }
    }),

  removeEdge: (id) => {
    sound.playClick()
    set((state) => ({
      edges: state.edges.filter((e) => e.id !== id)
    }))
  },

  inspectNode: (id) => set({ inspectedNodeId: id }),
  upgradeNode: (id) => {
    const state = get()
    const node = state.nodes.find((n) => n.id === id)
    if (!node || node.level >= 3) return
    const cost = Math.round(node.cost * 0.6)
    if (state.finance.cash < cost) return
    sound.playDeploy()
    set({
      finance: { ...state.finance, cash: state.finance.cash - cost },
      nodes: state.nodes.map((n) =>
        n.id === id
          ? { ...n, level: n.level + 1, maxThroughputMbps: Math.round(n.maxThroughputMbps * 1.5) }
          : n
      )
    })
  },
  rebootNode: (id) => {
    sound.playClick()
    set((state) => ({
      nodes: state.nodes.map((n) => (n.id === id ? { ...n, healthPct: 100 } : n))
    }))
  },

  // Plans & Finance Actions
  addPlan: (planData) =>
    set((state) => {
      sound.playDeploy()
      const newPlan: InternetPlan = {
        ...planData,
        id: `plan-${Date.now()}`,
        activeSubscribers: 0,
        targetSubscribers: 0,
        unlocked: true
      }
      return {
        plans: [...state.plans, newPlan]
      }
    }),

  updatePlan: (id, updates) =>
    set((state) => ({
      plans: state.plans.map((p) => (p.id === id ? { ...p, ...updates } : p))
    })),

  deletePlan: (id) => {
    sound.playClick()
    set((state) => ({
      plans: state.plans.filter((p) => p.id !== id)
    }))
  },

  leaseUpstreamBandwidth: (amountMbps) =>
    set((state) => ({
      finance: {
        ...state.finance,
        leasedUpstreamMbps: Math.max(0, state.finance.leasedUpstreamMbps + amountMbps)
      }
    })),

  changeCurrency: (currency) => set((state) => ({ finance: { ...state.finance, currency } })),

  resolveIncident: (choiceId) => set({ activeIncident: null }),
  dismissIncident: () => set({ activeIncident: null }),

  // HIGH-FREQUENCY SIMULATION TICK
  tick: () => {
    const state = get()
    if (state.time.isPaused) return

    let { minute, hour, day, tickCount } = state.time
    minute += 15
    let dayPassed = false
    if (minute >= 60) {
      minute = 0
      hour += 1
      if (hour >= 24) {
        hour = 0
        day += 1
        dayPassed = true
      }
    }
    tickCount += 1

    const concurrencyMultiplier = getTimeOfDayMultiplier(hour, minute)

    if (state.gameMode === 'realistic') {
      // REALISTIC MODE: Power -> Upstream Modem -> LAN Cable -> Core Router -> Fiber Patch -> OLT -> Fiber -> ODF Wall -> Feeder -> ODC -> ODP -> Houses
      const bldg = state.serverBuilding
      const devices = state.serverRack.devices
      const roomCables = bldg.roomCables
      const isMcbOn = bldg.plnBreaker.isMcbOn

      // 1. Upstream Modem Power: Has power cable to active PLN socket while MCB is ON
      const modemHasPowerCable = roomCables.some(
        (c) =>
          c.type === 'power' &&
          ((c.from.type === 'upstream_modem' && c.from.portId === 'modem-pwr' && c.to.type === 'pln_socket') ||
           (c.to.type === 'upstream_modem' && c.to.portId === 'modem-pwr' && c.from.type === 'pln_socket'))
      )
      const isModemOnline = isMcbOn && modemHasPowerCable && bldg.upstreamModem.isPowered

      // 2. Core Router: Has power cable to active PLN socket / UPS while MCB is ON
      const routerDev = devices.find((d) => d.type === 'core_router')
      const routerHasPowerCable = routerDev && roomCables.some(
        (c) =>
          c.type === 'power' &&
          ((c.from.type === 'rack_device' && c.from.deviceId === routerDev.id && c.from.portId === 'pwr-1') ||
           (c.to.type === 'rack_device' && c.to.deviceId === routerDev.id && c.to.portId === 'pwr-1'))
      )
      const isRouterOnline = isMcbOn && !!routerHasPowerCable && (routerDev ? routerDev.isPowered : false)

      // 3. WAN Link between Upstream Modem & Core Router (LAN Cable Cat6)
      const isModemConnectedToRouter = isModemOnline && isRouterOnline && roomCables.some(
        (c) =>
          c.type === 'lan' &&
          ((c.from.type === 'upstream_modem' && c.to.type === 'rack_device' && c.to.deviceId === routerDev?.id) ||
           (c.to.type === 'upstream_modem' && c.from.type === 'rack_device' && c.from.deviceId === routerDev?.id))
      )

      // 4. GPON OLT: Has power cable to active socket while MCB is ON
      const oltDev = devices.find((d) => d.type === 'gpon_olt')
      const oltHasPowerCable = oltDev && roomCables.some(
        (c) =>
          c.type === 'power' &&
          ((c.from.type === 'rack_device' && c.from.deviceId === oltDev.id && c.from.portId === 'pwr-1') ||
           (c.to.type === 'rack_device' && c.to.deviceId === oltDev.id && c.to.portId === 'pwr-1'))
      )
      const isOltOnline = isMcbOn && !!oltHasPowerCable && (oltDev ? oltDev.isPowered : false)

      // 5. Router to OLT connection (Fiber patchcord)
      const isRouterConnectedToOlt = isRouterOnline && isOltOnline && (
        roomCables.some(
          (c) =>
            c.type === 'fiber' &&
            ((c.from.deviceId === routerDev?.id && c.to.deviceId === oltDev?.id) ||
             (c.to.deviceId === routerDev?.id && c.from.deviceId === oltDev?.id))
        ) ||
        state.serverRack.patchCables.some(
          (p) =>
            (p.fromDeviceId === routerDev?.id && p.toDeviceId === oltDev?.id) ||
            (p.fromDeviceId === oltDev?.id && p.toDeviceId === routerDev?.id)
        )
      )

      // 6. OLT to ODF Wall Passthrough connection (Fiber patchcord to City Feeder)
      const isOltConnectedToOdfWall = isOltOnline && (
        roomCables.some(
          (c) =>
            c.type === 'fiber' &&
            ((c.from.deviceId === oltDev?.id && c.to.type === 'odf_wall') ||
             (c.to.deviceId === oltDev?.id && c.from.type === 'odf_wall'))
        ) ||
        state.serverRack.patchCables.some(
          (p) =>
            (p.fromDeviceId === oltDev?.id && devices.find((d) => d.id === p.toDeviceId)?.type === 'odf_patch_panel') ||
            (p.toDeviceId === oltDev?.id && devices.find((d) => d.id === p.fromDeviceId)?.type === 'odf_patch_panel')
        )
      )

      // Complete pipeline status
      const hasRackThroughput = isModemConnectedToRouter && isRouterConnectedToOlt && isOltConnectedToOdfWall
      const coreCapacityMbps = hasRackThroughput
        ? Math.min(bldg.upstreamModem.throughputMbps, routerDev?.maxThroughputMbps || 0, oltDev?.maxThroughputMbps || 0)
        : 0

      const leasedBldg = state.mapBuildings.find((b) => b.isLeasedByPlayer)
      let activeOdps = new Set<string>()

      const updatedCables = state.mapCables.map((cable) => {
        let signal = false
        if (hasRackThroughput && leasedBldg) {
          if (cable.fromId === leasedBldg.id || cable.toId === leasedBldg.id) {
            signal = true
          }
        }
        return { ...cable, hasSignal: signal }
      })

      const updatedOdcs = state.mapOdcs.map((odc) => {
        const isFed = updatedCables.some(
          (c) => (c.fromId === odc.id || c.toId === odc.id) && c.hasSignal
        )
        return { ...odc, connectedPorts: isFed ? 1 : 0 }
      })

      const updatedOdps = state.mapOdps.map((odp) => {
        const hasCableSignal = updatedCables.some(
          (c) =>
            (c.fromId === odp.id || c.toId === odp.id || c.fromId === odp.poleId || c.toId === odp.poleId) &&
            c.hasSignal
        )
        if (hasCableSignal) {
          activeOdps.add(odp.id)
        }
        return { ...odp, hasSignal: hasCableSignal }
      })

      let totalCoveredHouses = 0
      let totalSubscribers = 0
      let totalDemandMbps = 0

      const updatedHouses = state.mapHouses.map((house) => {
        const coveringOdp = updatedOdps.find((odp) => {
          if (!odp.hasSignal) return false
          const dx = odp.x - house.x
          const dy = odp.y - house.y
          return Math.sqrt(dx * dx + dy * dy) <= odp.coverageRadius
        })

        let isCovered = !!coveringOdp
        let isSubscribed = house.isSubscribed
        let activePlanId = house.activePlanId

        if (isCovered) {
          totalCoveredHouses += 1
          if (!isSubscribed) {
            const affordablePlan = state.plans.find(
              (p) => p.monthlyPrice <= house.budgetMax && p.speedMbps >= house.speedRequired
            )
            if (affordablePlan) {
              isSubscribed = true
              activePlanId = affordablePlan.id
            }
          }
        } else {
          isSubscribed = false
          activePlanId = undefined
        }

        if (isSubscribed && activePlanId) {
          totalSubscribers += 1
          const plan = state.plans.find((p) => p.id === activePlanId)
          if (plan) {
            totalDemandMbps += Math.round(plan.speedMbps * (0.08 + concurrencyMultiplier * 0.12))
          }
        }

        return {
          ...house,
          connectedOdpId: coveringOdp?.id,
          isSubscribed,
          activePlanId
        }
      })

      const effectiveCapacity = hasRackThroughput
        ? Math.min(state.finance.leasedUpstreamMbps, coreCapacityMbps)
        : 0
      const usedBandwidth = Math.min(totalDemandMbps, effectiveCapacity)

      let packetLossPct = 0
      let pingMs = 12
      if (effectiveCapacity <= 0 && totalSubscribers > 0) {
        packetLossPct = 100
        pingMs = 999
      } else if (totalDemandMbps > effectiveCapacity && effectiveCapacity > 0) {
        const overloadRatio = (totalDemandMbps - effectiveCapacity) / effectiveCapacity
        packetLossPct = Math.min(99.9, Math.round(overloadRatio * 40 * 10) / 10)
        pingMs = Math.round(15 + overloadRatio * 200)
      }

      let newCash = state.finance.cash
      let dailyRevenue = state.finance.dailyRevenue
      let dailyExpense = state.finance.dailyExpense

      const totalPowerWatts = devices.reduce((sum, d) => sum + (d.isPowered ? d.powerWatts : 0), 0)
      const powerDaily = Math.round(((totalPowerWatts * 24) / 1000) * state.finance.powerCostPerKWh)
      const rentDaily = state.finance.buildingRentDaily
      const upstreamDaily = Math.round(state.finance.leasedUpstreamMbps * state.finance.upstreamCostPerMbps)
      const totalDailyExpenses = powerDaily + rentDaily + upstreamDaily

      const monthlyGrossRevenue = updatedHouses.reduce((sum, h) => {
        if (!h.isSubscribed || !h.activePlanId) return sum
        const plan = state.plans.find((p) => p.id === h.activePlanId)
        return sum + (plan ? plan.monthlyPrice : 0)
      }, 0)
      const totalDailyRevenue = Math.round(monthlyGrossRevenue / 30)

      let newAlerts = [...state.alerts]
      if (dayPassed || (hour === 0 && minute === 0)) {
        dailyRevenue = totalDailyRevenue
        dailyExpense = totalDailyExpenses
        const netDaily = dailyRevenue - dailyExpense
        newCash += netDaily
        sound.playCash()

        newAlerts.unshift({
          id: `bill-${day}-${Date.now()}`,
          timestamp: `Hari ${day} - 00:00`,
          type: netDaily >= 0 ? 'success' : 'warning',
          message: `Settlement Harian: Pendapatan +$${dailyRevenue} | OPEX -$${dailyExpense} | Net: ${netDaily >= 0 ? '+' : ''}$${netDaily}`
        })
      }

      if (newAlerts.length > 25) newAlerts = newAlerts.slice(0, 25)

      const timeLabel = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
      let updatedHistory = [
        ...state.history,
        {
          time: timeLabel,
          demand: totalDemandMbps,
          usage: usedBandwidth,
          capacity: effectiveCapacity,
          ping: Math.round(pingMs),
          packetLoss: packetLossPct
        }
      ]
      if (updatedHistory.length > 40) updatedHistory = updatedHistory.slice(updatedHistory.length - 40)

      set({
        time: { ...state.time, tickCount, day, hour, minute },
        metrics: {
          totalDemandMbps,
          totalUpstreamCapacityMbps: state.finance.leasedUpstreamMbps,
          totalCoreRouterCapacityMbps: coreCapacityMbps,
          effectiveCapacityMbps: effectiveCapacity,
          usedBandwidthMbps: usedBandwidth,
          concurrencyFactor: Math.round(concurrencyMultiplier * 100) / 100,
          packetLossPct,
          pingMs,
          satisfactionPct: packetLossPct > 5 ? 40 : 96,
          reputation: Math.max(10, Math.min(100, 80 + totalSubscribers * 2 - (packetLossPct > 0 ? 10 : 0))),
          activeHousesCovered: totalCoveredHouses,
          totalSubscribersCount: totalSubscribers
        },
        mapHouses: updatedHouses,
        mapCables: updatedCables,
        mapOdcs: updatedOdcs,
        mapOdps: updatedOdps,
        history: updatedHistory,
        alerts: newAlerts,
        finance: {
          ...state.finance,
          cash: newCash,
          dailyRevenue,
          dailyExpense: totalDailyExpenses
        }
      })
    } else {
      // ARCADE MODE: Direct Node-to-Node Topology Evaluation
      const upstreams = state.nodes.filter((n) => n.type === 'upstream' && n.status === 'online')
      const routers = state.nodes.filter((n) => n.type === 'core_router' && n.status === 'online')

      const totalUpstream = upstreams.reduce((s, n) => s + n.maxThroughputMbps, 0) + state.finance.leasedUpstreamMbps
      const totalRouter = routers.reduce((s, n) => s + n.maxThroughputMbps, 0)
      const effectiveCap = routers.length === 0 ? 0 : Math.min(totalUpstream, totalRouter)

      let totalDemand = 0
      state.plans.forEach((plan) => {
        totalDemand += Math.round(plan.activeSubscribers * plan.speedMbps * (0.08 + concurrencyMultiplier * 0.12))
      })

      const usedBw = Math.min(totalDemand, effectiveCap)
      let packetLoss = totalDemand > effectiveCap && effectiveCap > 0 ? Math.min(99.9, ((totalDemand - effectiveCap) / effectiveCap) * 40) : 0
      let ping = Math.round(14 + (usedBw / Math.max(1, effectiveCap)) * 10)

      let newCash = state.finance.cash
      let dailyRevenue = state.finance.dailyRevenue
      let dailyExpense = state.finance.dailyExpense

      const timeLabel = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
      let updatedHistory = [
        ...state.history,
        {
          time: timeLabel,
          demand: totalDemand,
          usage: usedBw,
          capacity: effectiveCap,
          ping,
          packetLoss: Math.round(packetLoss * 10) / 10
        }
      ]
      if (updatedHistory.length > 40) updatedHistory = updatedHistory.slice(updatedHistory.length - 40)

      set({
        time: { ...state.time, tickCount, day, hour, minute },
        metrics: {
          ...state.metrics,
          totalDemandMbps: totalDemand,
          effectiveCapacityMbps: effectiveCap,
          usedBandwidthMbps: usedBw,
          packetLossPct: Math.round(packetLoss * 10) / 10,
          pingMs: ping
        },
        history: updatedHistory
      })
    }
  },

  // Persistence
  saveToDisk: async () => {
    sound.playClick()
    const state = get()
    const serialized = JSON.stringify({
      companyName: state.companyName,
      time: state.time,
      finance: state.finance,
      inventory: state.inventory,
      gameMode: state.gameMode,
      mapBuildings: state.mapBuildings,
      mapHouses: state.mapHouses,
      mapPoles: state.mapPoles,
      mapOdcs: state.mapOdcs,
      mapOdps: state.mapOdps,
      mapCables: state.mapCables,
      serverRack: state.serverRack,
      serverBuilding: state.serverBuilding,
      nodes: state.nodes,
      edges: state.edges,
      plans: state.plans,
      alerts: state.alerts
    })

    try {
      if (window.gameAPI && typeof window.gameAPI.saveGame === 'function') {
        const res = await window.gameAPI.saveGame(serialized)
        if (res.success) {
          get().addAlert(`Data game berhasil disimpan ke desktop.`, 'success')
          return true
        }
      } else {
        localStorage.setItem('isp-tycoon-save', serialized)
        get().addAlert(`Data game berhasil disimpan.`, 'success')
        return true
      }
    } catch (e) {
      console.error(e)
    }
    return false
  },

  loadFromDisk: async () => {
    sound.playClick()
    try {
      let rawData: string | null = null
      if (window.gameAPI && typeof window.gameAPI.loadGame === 'function') {
        const res = await window.gameAPI.loadGame()
        if (res.success && res.data) rawData = res.data
      } else {
        rawData = localStorage.getItem('isp-tycoon-save')
      }

      if (rawData) {
        const parsed = JSON.parse(rawData)
        set({
          companyName: parsed.companyName || 'Apex Fiber Networks',
          time: parsed.time || INITIAL_TIME,
          finance: parsed.finance || INITIAL_FINANCE,
          inventory: parsed.inventory || {},
          gameMode: parsed.gameMode || 'realistic',
          mapBuildings: parsed.mapBuildings || INITIAL_MAP_BUILDINGS,
          mapHouses: parsed.mapHouses || INITIAL_MAP_HOUSES,
          mapPoles: parsed.mapPoles || [],
          mapOdcs: parsed.mapOdcs || [],
          mapOdps: parsed.mapOdps || [],
          mapCables: parsed.mapCables || [],
          serverRack: parsed.serverRack || { hasRack: true, devices: INITIAL_STARTER_DEVICES, patchCables: [] },
          serverBuilding: parsed.serverBuilding || INITIAL_SERVER_BUILDING,
          nodes: parsed.nodes || INITIAL_NODES,
          edges: parsed.edges || INITIAL_EDGES,
          plans: parsed.plans || INITIAL_PLANS,
          alerts: parsed.alerts || []
        })
        get().addAlert(`Data simulasi berhasil dimuat!`, 'success')
        return true
      }
    } catch (e) {
      console.error(e)
    }
    return false
  },

  resetGame: () => {
    sound.playClick()
    set({
      companyName: 'Apex Fiber Networks',
      time: INITIAL_TIME,
      finance: INITIAL_FINANCE,
      inventory: {
        'item-pole-7m': 6,
        'item-cable-dist-500m': 500,
        'item-cable-feeder-1000m': 1000,
        'item-odc-48': 1,
        'item-odp-8': 2,
        'item-cable-power-ac': 4,
        'item-cable-lan-cat6': 4,
        'item-patch-cord-fiber': 6
      },
      mapBuildings: INITIAL_MAP_BUILDINGS,
      mapHouses: INITIAL_MAP_HOUSES,
      mapPoles: [],
      mapOdcs: [],
      mapOdps: [],
      mapCables: [],
      serverRack: { hasRack: true, devices: INITIAL_STARTER_DEVICES, patchCables: [] },
      serverBuilding: INITIAL_SERVER_BUILDING,
      nodes: INITIAL_NODES,
      edges: INITIAL_EDGES,
      cableStartPoint: null,
      inspectedMapObject: null,
      selectedPortForPatching: null,
      plans: INITIAL_PLANS,
      alerts: [
        {
          id: `reset-${Date.now()}`,
          timestamp: 'Hari 1 - 08:00',
          type: 'info',
          message: 'Simulasi direset ke kondisi awal prototype.'
        }
      ]
    })
  },

  addAlert: (message, type) =>
    set((state) => ({
      alerts: [
        {
          id: `alert-${Date.now()}`,
          timestamp: `Hari ${state.time.day} - ${state.time.hour}:${state.time.minute.toString().padStart(2, '0')}`,
          type,
          message
        },
        ...state.alerts
      ].slice(0, 30)
    })),

  clearAlerts: () => {
    sound.playClick()
    set({ alerts: [] })
  }
}))

function getTimeOfDayMultiplier(hour: number, minute: number): number {
  const hourlyCurve = [
    0.18, 0.12, 0.08, 0.07, 0.09, 0.15,
    0.32, 0.52, 0.68, 0.72, 0.70, 0.75,
    0.80, 0.72, 0.68, 0.70, 0.76, 0.88,
    0.98, 1.00, 0.95, 0.85, 0.60, 0.35
  ]
  const current = hourlyCurve[hour] ?? 0.5
  const nextHour = (hour + 1) % 24
  const next = hourlyCurve[nextHour] ?? 0.5
  const progress = minute / 60
  return current + (next - current) * progress
}
