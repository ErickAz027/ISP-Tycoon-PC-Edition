import { StoreItem, MapBuilding, MapHouse } from '../types/game'

export const STORE_CATALOG: StoreItem[] = [
  // ==========================================
  // KELAS 1: ENTRY TIER (RT/RW NET & SME STARTUP)
  // ==========================================
  {
    id: 'item-pole-7m',
    brand: 'PT Varia',
    model: 'Concrete Pole 7M-150daN',
    name: 'Tiang Beton 7 Meter',
    hardwareClass: 'entry',
    category: 'civil_outdoor',
    description: 'Tiang beton pratekan standar Telkom/PLN untuk tarikan kabel fiber optik udara di jalan perumahan.',
    cost: 95,
    unit: 'pcs',
    quantityPerBuy: 1,
    iconName: 'Pole'
  },
  {
    id: 'item-cable-dist-500m',
    brand: 'FiberHome',
    model: 'FIG-8 8C G.652D',
    name: 'Kabel Distribusi 8-Core (500m)',
    hardwareClass: 'entry',
    category: 'civil_outdoor',
    description: 'Kabel fiber optik udara Figure-8 self-supporting dengan kawat penggantung baja untuk menghubungkan tiang ke ODP.',
    cost: 160,
    unit: 'meters',
    quantityPerBuy: 500,
    iconName: 'Cable'
  },
  {
    id: 'item-odp-8',
    brand: 'FiberHome',
    model: 'ODP-SOLID-8C',
    name: 'ODP Pole Mount 8-Port',
    hardwareClass: 'entry',
    category: 'civil_outdoor',
    description: 'Optical Distribution Point 8 port drop wire dengan PLC splitter 1:8 internal untuk perumahan.',
    cost: 45,
    unit: 'pcs',
    quantityPerBuy: 1,
    iconName: 'Radio'
  },
  {
    id: 'item-router-mikrotik-ccr2004',
    brand: 'MikroTik',
    model: 'CCR2004-1G-12S+2XS',
    name: 'Core Router CCR2004 10G',
    hardwareClass: 'entry',
    category: 'rack_hardware',
    description: 'Router BGP/OSPF favorit ISP pemula. Ditenagai prosesor Annapurna Labs Alpine v2 4-core, 12x port 10G SFP+, 2x port 25G SFP28.',
    cost: 595,
    unit: 'pcs',
    quantityPerBuy: 1,
    rackHeightU: 1,
    throughputMbps: 10000,
    powerWatts: 45,
    portCount: 8,
    portTypeDescription: '12x SFP+ 10G, 2x SFP28 25G',
    iconName: 'Router'
  },
  {
    id: 'item-olt-zte-c320',
    brand: 'ZTE',
    model: 'ZXA10 C320 Mini-OLT',
    name: 'GPON OLT ZTE C320 (8-Port)',
    hardwareClass: 'entry',
    category: 'rack_hardware',
    description: 'Mini GPON OLT compact 2U dengan kapasitas hingga 1,024 ONT. Dilengkapi kartu pengendali SMXA dan 8-port GPON Class C+.',
    cost: 1150,
    unit: 'pcs',
    quantityPerBuy: 1,
    rackHeightU: 2,
    throughputMbps: 2500,
    powerWatts: 75,
    portCount: 8,
    portTypeDescription: '8x GPON Class C+, 2x GE/10GE Uplink',
    iconName: 'Cpu'
  },

  // ==========================================
  // KELAS 2: ENTERPRISE TIER (REGIONAL ISP CARRIER)
  // ==========================================
  {
    id: 'item-cable-feeder-1000m',
    brand: 'ZTT International',
    model: 'ADSS 24C Single-Jacket',
    name: 'Kabel Feeder 24-Core (1,000m)',
    hardwareClass: 'enterprise',
    category: 'civil_outdoor',
    description: 'Kabel backbone ADSS (All-Dielectric Self-Supporting) tahan petir untuk tarikan dari gedung server ke ODC jalanan.',
    cost: 420,
    unit: 'meters',
    quantityPerBuy: 1000,
    iconName: 'Cable'
  },
  {
    id: 'item-odc-48',
    brand: 'Huawei',
    model: 'FAT-ODC-48C',
    name: 'Outdoor Optical Cabinet (ODC 48-Port)',
    hardwareClass: 'enterprise',
    category: 'civil_outdoor',
    description: 'Lemari distribusi outdoor anti karat IP65 dengan kapasitas terminasi 48 adapter SC/UPC dan parking lot splitter.',
    cost: 480,
    unit: 'pcs',
    quantityPerBuy: 1,
    iconName: 'Box'
  },
  {
    id: 'item-odp-16',
    brand: 'CommScope',
    model: 'FIST-GCO2-16',
    name: 'ODP Pole Mount 16-Port High-Density',
    hardwareClass: 'enterprise',
    category: 'civil_outdoor',
    description: 'ODP tangguh berkapasitas 16 rumah dengan tray manajemen fiber presisi untuk mencegah microbending.',
    cost: 110,
    unit: 'pcs',
    quantityPerBuy: 1,
    iconName: 'Radio'
  },
  {
    id: 'item-router-mikrotik-ccr2216',
    brand: 'MikroTik',
    model: 'CCR2216-1G-12XS-2XQ',
    name: 'Flagship Core Router CCR2216 100G',
    hardwareClass: 'enterprise',
    category: 'rack_hardware',
    description: 'Router 100Gbps kelas enterprise dengan CPU 16-Core Marvell ARM64 dan chip switch hardware offloading Marvell Aldrin 2.',
    cost: 1795,
    unit: 'pcs',
    quantityPerBuy: 1,
    rackHeightU: 1,
    throughputMbps: 25000,
    powerWatts: 128,
    portCount: 8,
    portTypeDescription: '2x 100G QSFP28, 12x 25G SFP28, 1x Gigabit',
    iconName: 'Router'
  },
  {
    id: 'item-olt-huawei-ma5800',
    brand: 'Huawei',
    model: 'SmartAX MA5800-X7',
    name: 'GPON/XGS-PON OLT Huawei MA5800-X7',
    hardwareClass: 'enterprise',
    category: 'rack_hardware',
    description: 'Next-Gen OLT dengan arsitektur terdistribusi kelas carrier. Mendukung GPON, 10G XGS-PON, dan 40G TWDM-PON siap pakai.',
    cost: 3850,
    unit: 'pcs',
    quantityPerBuy: 1,
    rackHeightU: 4,
    throughputMbps: 10000,
    powerWatts: 380,
    portCount: 16,
    portTypeDescription: '16x GPON/XGS-PON Combo, 4x 10GE Uplink',
    iconName: 'Cpu'
  },

  // ==========================================
  // KELAS 3: CARRIER GRADE (TELCO TIER-1 CORE)
  // ==========================================
  {
    id: 'item-router-cisco-asr9001',
    brand: 'Cisco',
    model: 'ASR 9001 Aggregation Router',
    name: 'Carrier Edge Router Cisco ASR 9001',
    hardwareClass: 'carrier',
    category: 'rack_hardware',
    description: 'Router core carrier-grade dengan throughput kawat hingga 120 Gbps, redundant power supply, dan Cisco IOS XR modular OS.',
    cost: 14500,
    unit: 'pcs',
    quantityPerBuy: 1,
    rackHeightU: 2,
    throughputMbps: 50000,
    powerWatts: 350,
    portCount: 8,
    portTypeDescription: '4x 10GE SFP+, 2x Modular Port Adapter slots',
    iconName: 'Server'
  },
  {
    id: 'item-router-juniper-mx204',
    brand: 'Juniper Networks',
    model: 'MX204 3-D Universal Edge',
    name: 'Core BGP Router Juniper MX204 (400G)',
    hardwareClass: 'carrier',
    category: 'rack_hardware',
    description: 'Standar de facto transit Tier-1 global. Mendukung 400 Gbps full duplex dengan Trio chipset, telemetri streaming, dan MACsec.',
    cost: 18500,
    unit: 'pcs',
    quantityPerBuy: 1,
    rackHeightU: 1,
    throughputMbps: 100000,
    powerWatts: 400,
    portCount: 8,
    portTypeDescription: '4x 100GbE QSFP28, 8x 10GbE SFP+',
    iconName: 'Server'
  },
  {
    id: 'item-olt-nokia-7360',
    brand: 'Nokia',
    model: '7360 ISAM FX-16',
    name: 'Telco OLT Nokia 7360 ISAM (High-Density)',
    hardwareClass: 'carrier',
    category: 'rack_hardware',
    description: 'Sasis OLT telco multi-terabit dengan 16 slot kartu akses optik, mendukung puluhan ribu pelanggan FTTH dengan zero-downtime controller.',
    cost: 9800,
    unit: 'pcs',
    quantityPerBuy: 1,
    rackHeightU: 6,
    throughputMbps: 40000,
    powerWatts: 750,
    portCount: 16,
    portTypeDescription: '16x Service Line Cards, Dual Redundant NT matrix',
    iconName: 'Cpu'
  },

  // ==========================================
  // DATACENTER RACK & AKSESORIS KABEL
  // ==========================================
  {
    id: 'item-rack-42u',
    brand: 'APC by Schneider Electric',
    model: 'NetShelter SX 42U 600x1070mm',
    name: 'Server Rack Enclosure 42U',
    hardwareClass: 'enterprise',
    category: 'rack_hardware',
    description: 'Rak server standar industri 19 inci dengan sistem grounding terintegrasi, pintu berlubang 65% ventilasi udara, dan pengunci kode.',
    cost: 1450,
    unit: 'pcs',
    quantityPerBuy: 1,
    rackHeightU: 42,
    iconName: 'Server'
  },
  {
    id: 'item-ups-apc-3000va',
    brand: 'APC by Schneider Electric',
    model: 'Smart-UPS RT 3000VA On-Line 2U',
    name: 'Rackmount UPS 3000VA On-Line (2U)',
    hardwareClass: 'enterprise',
    category: 'rack_hardware',
    description: 'Double conversion on-line UPS pure sine wave untuk menyuplai daya cadangan tanpa jeda transfer saat listrik PLN padam.',
    cost: 1150,
    unit: 'pcs',
    quantityPerBuy: 1,
    rackHeightU: 2,
    powerWatts: 30,
    iconName: 'Zap'
  },
  {
    id: 'item-odf-panduit-24p',
    brand: 'Panduit',
    model: 'Opti-Core 1U 24-Port SC/UPC',
    name: 'ODF Optical Distribution Frame 24-Port (1U)',
    hardwareClass: 'entry',
    category: 'rack_hardware',
    description: 'Patch panel fiber optik 1U sebagai titik terminasi kabel feeder luar gedung sebelum dihubungkan ke port OLT.',
    cost: 240,
    unit: 'pcs',
    quantityPerBuy: 1,
    rackHeightU: 1,
    powerWatts: 0,
    portCount: 12,
    portTypeDescription: '24x Adapter SC/UPC Simplex Single-Mode',
    iconName: 'Share2'
  },
  {
    id: 'item-patch-cord-fiber',
    brand: 'Corning',
    model: 'ClearCurve Simplex LC-SC 2M',
    name: 'Patch Cord Fiber Optik LC-SC (Isi 5 Pcs)',
    hardwareClass: 'entry',
    category: 'cables_accessories',
    description: 'Kabel jumper fiber optik kuning single-mode OS2 berdaya redam ultra rendah untuk menghubungkan perangkat di dalam rak.',
    cost: 45,
    unit: 'pack',
    quantityPerBuy: 5,
    iconName: 'Cable'
  },
  {
    id: 'item-cable-power-ac',
    brand: 'Schneider Electric',
    model: 'Heavy Duty C13-Schuko 220V 1.8M',
    name: 'Kabel Daya Listrik AC 220V (Isi 3 Pcs)',
    hardwareClass: 'entry',
    category: 'cables_accessories',
    description: 'Kabel daya AC tebal standar server Schuko ke C13 16A dengan pelindung grounding tahan panas untuk menyuplai daya dari stop kontak PLN / PDU ke perangkat.',
    cost: 25,
    unit: 'pack',
    quantityPerBuy: 3,
    iconName: 'Zap'
  },
  {
    id: 'item-cable-lan-cat6',
    brand: 'Belden',
    model: 'DataTwist Cat6 UTP RJ45 Patch 3M',
    name: 'Kabel LAN UTP Cat6 RJ45 (Isi 3 Pcs)',
    hardwareClass: 'entry',
    category: 'cables_accessories',
    description: 'Kabel jaringan Ethernet Cat6 Gigabit berkecepatan 1000 Mbps untuk menghubungkan modem upstream ISP ke WAN router atau koneksi LAN NOC.',
    cost: 30,
    unit: 'pack',
    quantityPerBuy: 3,
    iconName: 'Cable'
  }
]

export const INITIAL_MAP_BUILDINGS: MapBuilding[] = [
  {
    id: 'bldg-lot-a',
    name: 'Ruko Sentra Blok A (Kantor NOC)',
    type: 'empty_lot',
    x: 80,
    y: 80,
    width: 140,
    height: 110,
    isLeasedByPlayer: true,
    monthlyRent: 350,
    hasRackRoom: true
  },
  {
    id: 'bldg-lot-b',
    name: 'Kompleks Ruko Timur Blok B',
    type: 'empty_lot',
    x: 680,
    y: 80,
    width: 140,
    height: 110,
    isLeasedByPlayer: false,
    monthlyRent: 500,
    hasRackRoom: true
  },
  {
    id: 'bldg-office-park',
    name: 'Cyber Commercial Plaza',
    type: 'commercial_office',
    x: 380,
    y: 80,
    width: 180,
    height: 120,
    isLeasedByPlayer: false,
    monthlyRent: 1200,
    hasRackRoom: false
  }
]

export const INITIAL_MAP_HOUSES: MapHouse[] = [
  // Neighborhood West (dekat Lot A)
  { id: 'house-w-1', address: 'Jl. Merpati No. 1', x: 80, y: 260, tier: 'residential', budgetMax: 35, speedRequired: 20, isSubscribed: false },
  { id: 'house-w-2', address: 'Jl. Merpati No. 2', x: 150, y: 260, tier: 'residential', budgetMax: 40, speedRequired: 30, isSubscribed: false },
  { id: 'house-w-3', address: 'Jl. Merpati No. 3', x: 220, y: 260, tier: 'gamer', budgetMax: 70, speedRequired: 100, isSubscribed: false },
  { id: 'house-w-4', address: 'Jl. Merpati No. 4', x: 80, y: 350, tier: 'residential', budgetMax: 30, speedRequired: 20, isSubscribed: false },
  { id: 'house-w-5', address: 'Jl. Merpati No. 5', x: 150, y: 350, tier: 'residential', budgetMax: 45, speedRequired: 50, isSubscribed: false },
  { id: 'house-w-6', address: 'Jl. Merpati No. 6', x: 220, y: 350, tier: 'business', budgetMax: 120, speedRequired: 100, isSubscribed: false },

  // Neighborhood Central
  { id: 'house-c-1', address: 'Jl. Cendrawasih No. 10', x: 380, y: 260, tier: 'gamer', budgetMax: 80, speedRequired: 100, isSubscribed: false },
  { id: 'house-c-2', address: 'Jl. Cendrawasih No. 12', x: 450, y: 260, tier: 'residential', budgetMax: 40, speedRequired: 50, isSubscribed: false },
  { id: 'house-c-3', address: 'Jl. Cendrawasih No. 14', x: 520, y: 260, tier: 'residential', budgetMax: 35, speedRequired: 20, isSubscribed: false },
  { id: 'house-c-4', address: 'Jl. Cendrawasih No. 16', x: 380, y: 350, tier: 'business', budgetMax: 150, speedRequired: 200, isSubscribed: false },
  { id: 'house-c-5', address: 'Jl. Cendrawasih No. 18', x: 450, y: 350, tier: 'gamer', budgetMax: 75, speedRequired: 100, isSubscribed: false },
  { id: 'house-c-6', address: 'Jl. Cendrawasih No. 20', x: 520, y: 350, tier: 'residential', budgetMax: 45, speedRequired: 50, isSubscribed: false },

  // Neighborhood East (dekat Lot B)
  { id: 'house-e-1', address: 'Perumahan Graha Timur No. 1', x: 680, y: 260, tier: 'residential', budgetMax: 40, speedRequired: 30, isSubscribed: false },
  { id: 'house-e-2', address: 'Perumahan Graha Timur No. 2', x: 750, y: 260, tier: 'business', budgetMax: 130, speedRequired: 100, isSubscribed: false },
  { id: 'house-e-3', address: 'Perumahan Graha Timur No. 3', x: 820, y: 260, tier: 'gamer', budgetMax: 85, speedRequired: 150, isSubscribed: false },
  { id: 'house-e-4', address: 'Perumahan Graha Timur No. 4', x: 680, y: 350, tier: 'residential', budgetMax: 35, speedRequired: 20, isSubscribed: false },
  { id: 'house-e-5', address: 'Perumahan Graha Timur No. 5', x: 750, y: 350, tier: 'residential', budgetMax: 50, speedRequired: 50, isSubscribed: false },
  { id: 'house-e-6', address: 'Perumahan Graha Timur No. 6', x: 820, y: 350, tier: 'residential', budgetMax: 45, speedRequired: 50, isSubscribed: false }
]
