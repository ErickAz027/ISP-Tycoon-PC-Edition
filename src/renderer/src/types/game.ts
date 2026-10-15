// ISP TYCOON - COMPLETE GAME TYPE DEFINITIONS

export type GameMode = 'realistic' | 'arcade'
export type HardwareClass = 'entry' | 'enterprise' | 'carrier'
export type StoreItemCategory = 'civil_outdoor' | 'rack_hardware' | 'cables_accessories'

// ==========================================
// 1. HARDWARE STORE & INVENTORY TYPES
// ==========================================

export interface StoreItem {
  id: string
  brand: string // e.g. "MikroTik", "Huawei", "Cisco", "ZTE", "Corning"
  model: string // e.g. "CCR2004-1G-12S+2XS", "SmartAX MA5800-X7", "ASR 9001"
  name: string
  hardwareClass: HardwareClass
  category: StoreItemCategory
  description: string
  cost: number
  unit: string // e.g. "pcs", "meters", "pack"
  quantityPerBuy: number
  rackHeightU?: number // e.g. 1U, 2U, 4U
  throughputMbps?: number
  powerWatts?: number
  portCount?: number
  portTypeDescription?: string
  iconName: string
}

export interface InventoryItem {
  itemId: string
  quantity: number
}

// ==========================================
// 2. 2D PLAYABLE CITY MAP TYPES (REALISTIC MODE)
// ==========================================

export type MapToolMode =
  | 'select'
  | 'lease_building'
  | 'build_pole'
  | 'string_cable'
  | 'place_odc'
  | 'mount_odp'
  | 'demolish'

export interface MapBuilding {
  id: string
  name: string
  type: 'server_pop' | 'commercial_office' | 'residential_cluster' | 'empty_lot'
  x: number
  y: number
  width: number
  height: number
  isLeasedByPlayer: boolean
  monthlyRent: number
  hasRackRoom: boolean
}

export interface MapHouse {
  id: string
  address: string
  x: number
  y: number
  tier: 'residential' | 'gamer' | 'business'
  budgetMax: number
  speedRequired: number
  connectedOdpId?: string
  isSubscribed: boolean
  activePlanId?: string
}

export interface MapPole {
  id: string
  x: number
  y: number
  mountedOdpId?: string
}

export interface MapOdc {
  id: string
  name: string
  x: number
  y: number
  capacityPorts: number
  connectedPorts: number
  feederCableId?: string
}

export interface MapOdp {
  id: string
  name: string
  x: number
  y: number
  poleId?: string
  capacityPorts: number
  connectedHousesCount: number
  coverageRadius: number
  distributionCableId?: string
  hasSignal: boolean
}

export interface MapCable {
  id: string
  type: 'feeder' | 'distribution' | 'drop'
  fromType: 'building' | 'odc' | 'pole'
  fromId: string
  toType: 'building' | 'odc' | 'pole'
  toId: string
  lengthMeters: number
  cores: number
  hasSignal: boolean
}

// ==========================================
// 3. PHYSICAL SERVER BUILDING & ROOM TYPES (2D / 3D)
// ==========================================

export type RoomCableType = 'power' | 'lan' | 'fiber'

export interface RoomCableEndpoint {
  type: 'pln_socket' | 'upstream_modem' | 'rack_device' | 'odf_wall'
  deviceId?: string // Rack device ID if type === 'rack_device'
  portId: string // e.g. 'socket_wall_desk', 'pwr_dc', 'lan1', 'ether1_wan', 'sfp1', 'odf_feeder_1'
  label: string
}

export interface RoomCable {
  id: string
  type: RoomCableType
  from: RoomCableEndpoint
  to: RoomCableEndpoint
  color: string
  isActive: boolean
}

export interface UpstreamModemDevice {
  id: string
  brand: string // e.g. 'ZTE'
  model: string // e.g. 'ZXHN F609 GPON ONT'
  name: string
  ispProviderName: string // e.g. 'Telkom Wholesale / IndiHome'
  isPowered: boolean
  hasPonLight: boolean
  throughputMbps: number
  ipAddress: string
  ports: {
    id: string
    name: string
    type: 'power_dc' | 'fiber_pon' | 'copper_rj45'
    connectedCableId?: string
  }[]
}

export interface PlnBreakerBox {
  id: string
  name: string
  isMcbOn: boolean
  voltage: number // 220V
  sockets: {
    id: string
    name: string
    type: 'power_ac'
    connectedCableId?: string
  }[]
}

export interface OdfWallPassthrough {
  id: string
  name: string
  ports: {
    id: string
    name: string
    type: 'fiber_sc'
    connectedCableId?: string
    leadsToCityFeeder: boolean
  }[]
}

export interface RackPort {
  id: string
  name: string
  type: 'power_ac' | 'copper_rj45' | 'fiber_sfp' | 'fiber_pon' | 'fiber_sc'
  isInput: boolean
  connectedCableId?: string
}

export interface RackDevice {
  id: string
  brand: string
  model: string
  name: string
  type: 'upstream_gateway' | 'core_router' | 'gpon_olt' | 'odf_patch_panel' | 'ups_battery'
  uSlot: number // 1 to 42
  uHeight: number
  maxThroughputMbps: number
  powerWatts: number
  isPowered: boolean
  healthPct: number
  ports: RackPort[]
}

export interface RackPatchCable {
  id: string
  fromDeviceId: string
  fromPortId: string
  toDeviceId: string
  toPortId: string
  color: string
  bandwidthMbps: number
}

// ==========================================
// 4. ARCADE MODE TOPOLOGY TYPES
// ==========================================

export type HardwareNodeType = 'upstream' | 'core_router' | 'olt' | 'odp'

export interface HardwareNode {
  id: string
  name: string
  type: HardwareNodeType
  tier?: number
  maxThroughputMbps: number
  currentThroughputMbps: number
  portCapacity: number
  connectedPorts: number
  cost: number
  upkeepCostPerDay: number
  powerWatts: number
  status: 'online' | 'degraded' | 'offline' | 'unlinked'
  healthPct: number
  level: number
  isRebooting?: boolean
  rebootRemainingTicks?: number
  position: { x: number; y: number }
}

export interface NetworkEdge {
  id: string
  source: string
  target: string
  bandwidthMbps?: number
}

export interface HardwareTemplate {
  type: HardwareNodeType
  name: string
  description: string
  maxThroughputMbps: number
  portCapacity: number
  cost: number
  upkeepCostPerDay: number
  powerWatts: number
}

// ==========================================
// 5. PLANS, ECONOMY & TELEMETRY
// ==========================================

export interface InternetPlan {
  id: string
  name: string
  speedMbps: number
  monthlyPrice: number
  activeSubscribers: number
  targetSubscribers: number
  tierType: 'residential' | 'business' | 'gaming'
  slaTargetPct: number
  unlocked: boolean
}

export interface NetworkMetrics {
  totalDemandMbps: number
  totalUpstreamCapacityMbps: number
  totalCoreRouterCapacityMbps: number
  effectiveCapacityMbps: number
  usedBandwidthMbps: number
  concurrencyFactor: number
  packetLossPct: number
  pingMs: number
  satisfactionPct: number
  reputation: number
  activeHousesCovered: number
  totalSubscribersCount: number
}

export interface MetricHistoryPoint {
  time: string
  demand: number
  usage: number
  capacity: number
  ping: number
  packetLoss: number
}

export interface AlertMessage {
  id: string
  timestamp: string
  type: 'info' | 'warning' | 'danger' | 'success'
  message: string
}

export interface FinanceState {
  cash: number
  currency: 'USD' | 'IDR'
  dailyRevenue: number
  dailyExpense: number
  buildingRentDaily: number
  leasedUpstreamMbps: number
  upstreamCostPerMbps: number
  hardwareMaintenanceCost: number
  powerCostPerKWh: number
}

export interface GameTime {
  tickCount: number
  day: number
  hour: number
  minute: number
  speed: number // 0: paused, 1: 1x, 2: 2x, 5: 5x
  isPaused: boolean
}

export interface IncidentChoice {
  id: string
  label: string
  description: string
  cost: number
  reputationImpact?: number
  satisfactionImpact?: number
  resolveMessage: string
}

export interface GameIncident {
  id: string
  title: string
  description: string
  severity: 'critical' | 'major' | 'minor' | 'opportunity'
  affectedNodeId?: string
  trafficSpikeMbps?: number
  capacityLossPct?: number
  choices: IncidentChoice[]
  timestamp: string
}
