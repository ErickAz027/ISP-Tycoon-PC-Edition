# ISP Tycoon — PC Edition

> **Game simulasi & tycoon untuk membangun dan mengelola penyedia layanan internet (ISP) dari nol.**

[![Electron](https://img.shields.io/badge/Electron-31-47848F?logo=electron&logoColor=white)](https://www.electronjs.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Zustand](https://img.shields.io/badge/Zustand-4-433E38?logo=react&logoColor=white)](https://zustand-demo.pmnd.rs/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)
[![Platform](https://img.shields.io/badge/Platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey)](#)

---

## 📖 Tentang Project

**ISP Tycoon** adalah game desktop bergenre *tycoon / business simulation* di mana kamu berperan sebagai pemilik sebuah penyedia layanan internet. Mulai dari usaha kecil RT/RW Net, bangun infrastruktur fisik (tiang, kabel fiber optik, ODC/ODP, rak server, OLT), jual paket internet ke pelanggan, kelola bandwidth transit dan arus kas, lalu kembangkan bisnis menjadi ISP berskala carrier.

Game ini menekankan **detail teknis yang realistis** — perangkat keras dari merek asli (MikroTik, ZTE, Huawei, Cisco, FiberHome, Corning), topologi jaringan yang benar, hingga rentetan peristiwa insiden yang harus kamu selesaikan.

> ⚠️ **Status: Prototype aktif** (`v0.1.0`) — fitur dan keseimbangan gameplay masih terus berkembang.

---

## ✨ Fitur Utama

### 🎮 Dua Mode Permainan
- **Mode Realistis** — bangun infrastruktur dari tingkat jalan: peta kota 2D, tiang, kabel, rak server, dan perangkat fisik.
- **Mode Arcade** — kelola jaringan lewat peta topologi node & kabel yang lebih ringkas dan cepat.

### 🗺️ Peta Kota 2D (Mode Realistis)
- Sewa gedung / POP, kantor komersial, dan area perumahan.
- Bangun **tiang beton**, tarik **kabel feeder / distribution / drop**.
- Pasang **ODC** (Optical Distribution Cabinet) dan **mount ODP** di tiang.
- Rumah pelanggan tersambung ke ODP dengan radius jangkauan sinyal.

### 🖥️ Ruang Rak Server 42U
- Tata letak perangkat per-**U slot** (hingga 42U) di dalam rak.
- **Patch cable** antar perangkat (fiber SFP, copper RJ45, power AC).
- Koneksi listrik (**PLN / MCB**), **modem upstream**, dan **ODF wall passthrough** ke feeder kota.
- Perangkat: `upstream_gateway`, `core_router`, `gpon_olt`, `odf_patch_panel`, `ups_battery`.

### 🛒 Toko & Gudang
- Beli perangkat keras dari merek nyata: **MikroTik, ZTE, Huawei, Cisco, FiberHome, Corning, PT Varia**, dll.
- Katalog dibagi tiga kelas: **Entry** → **Enterprise** → **Carrier**.
- Kategori: perangkat sipil outdoor, hardware rak, kabel & aksesori.
- Kelola stok inventori dan logistik tiang/kabel.

### 📊 Monitor NOC
- Grafik telemetri bergaya **MRTG**: demand, usage, kapasitas.
- Metrik **ping**, **packet loss**, **concurrency factor**, dan throughput.
- Indikator **kepuasan pelanggan (satisfaction)** dan **reputasi**.
- Panel **alert** real-time untuk gangguan jaringan.

### 📦 Paket & Pelanggan
- Buat paket internet (residential / business / gaming) dengan kecepatan & harga sendiri.
- Target jumlah pelanggan dan target SLA per paket.
- Rumah pelanggan dari tier berbeda: *residential*, *gamer*, *business*.

### 💰 Keuangan & Transit
- **Arus kas** (cash), revenue & expense harian.
- Sewa **bandwidth transit upstream** (per Mbps) dan biaya listrik per kWh.
- Biaya sewa gedung dan maintenance hardware.
- Dukungan mata uang **IDR / USD**.

### 🚨 Sistem Insiden & Event
- Event jaringan dengan pilihan keputusan (setiap pilihan punya biaya, dampak reputasi & kepuasan).
- Insiden seperti lonjakan trafik, penurunan kapasitas, dan gangguan node.

### ⏱️ Simulasi Waktu
- Tick loop simulasi dengan kontrol kecepatan **1x / 2x / 5x** dan **pause**.

### 💾 Penyimpanan
- **Save / Load** ke file JSON di `userData` melalui Electron IPC.

### 🔊 Lain-lain
- Sound engine (bisa di-mute) dan hotkey global.

---

## 🎮 Kontrol & Hotkey

| Tombol | Aksi |
| :---: | :--- |
| `Space` | Pause / Resume simulasi |
| `1` | Kecepatan 1x |
| `2` | Kecepatan 2x |
| `5` | Kecepatan 5x |
| 🖱️ Klik | Pilih / interaksi pada peta, node, dan perangkat |
| 🔄 Mode | Beralih antara Mode Realistis ⇄ Arcade dari Top Bar |

---

## 🚀 Cara Menjalankan

### Prasyarat
- [Node.js](https://nodejs.org/) **v18+** (disarankan v20)
- npm (sudah termasuk dalam Node.js)

### Instalasi & Development
```bash
# 1. Clone repository
git clone https://github.com/ErickAz027/ISP-Tycoon-PC-Edition.git
cd ISP-Tycoon-PC-Edition

# 2. Install dependency
npm install

# 3. Jalankan dalam mode development (hot reload)
npm run dev
```

### Build Production
```bash
# Build saja (tanpa packaging installer)
npm run build

# Build + buat installer per platform
npm run build:win     # Windows
npm run build:mac     # macOS
npm run build:linux   # Linux
```

### Preview Build
```bash
npm start
```

### Perintah Lain
```bash
npm run lint          # ESLint (auto-fix)
npm run format        # Prettier
npm run typecheck     # Type-check Node + Web
```

---

## 🧱 Tech Stack

| Teknologi | Kegunaan |
| :--- | :--- |
| [Electron](https://www.electronjs.org/) | Framework aplikasi desktop |
| [electron-vite](https://electron-vite.org/) | Build tool & dev server |
| [React 18](https://react.dev/) | Library UI |
| [TypeScript](https://www.typescriptlang.org/) | Bahasa dengan static typing |
| [TailwindCSS](https://tailwindcss.com/) | Styling utility-first |
| [Zustand](https://github.com/pmndrs/zustand) | Manajemen state global |
| [@xyflow/react](https://reactflow.dev/) | Editor topologi jaringan (node graph) |
| [Recharts](https://recharts.org/) | Grafik telemetri NOC |
| [lucide-react](https://lucide.dev/) | Ikon |

---

## 📁 Struktur Project

```
isp/
├── src/
│   ├── main/                 # Proses utama Electron
│   │   └── index.ts          # Window, IPC handler save/load game
│   ├── preload/              # Bridge aman main ↔ renderer
│   │   ├── index.ts
│   │   └── index.d.ts
│   └── renderer/             # Aplikasi React (UI game)
│       ├── index.html
│       └── src/
│           ├── App.tsx            # Root + routing tab + hotkey global
│           ├── components/
│           │   ├── layout/        # TopBar, Sidebar
│           │   ├── views/         # CityMapView, ServerRackView, StoreView,
│           │   │                  #   TopologyView, DashboardView, PlansView, FinanceView
│           │   ├── modals/        # IncidentModal
│           │   └── views/topology/# Node, inspector, dll.
│           ├── hooks/
│           │   └── useGameLoop.ts # Loop simulasi berbasis tick
│           ├── store/
│           │   ├── useGameStore.ts   # State global (Zustand)
│           │   └── storeCatalog.ts   # Katalog toko & data awal peta
│           ├── types/
│           │   └── game.ts        # Definisi tipe seluruh game
│           └── utils/
│               └── soundEngine.ts # Efek suara
├── package.json
├── electron.vite.config.ts
├── tailwind.config.js
└── tsconfig*.json
```

---

## 📸 Screenshot

> Ganti placeholder di bawah dengan screenshot asli. Simpan gambar di folder `docs/` lalu sesuaikan path-nya.

| Peta Kota 2D | Ruang Rak Server |
| :---: | :---: |
| ![Peta Kota](docs/screenshot-map.png) | ![Rak Server](docs/screenshot-rack.png) |

| Monitor NOC | Topologi Jaringan |
| :---: | :---: |
| ![Monitor NOC](docs/screenshot-noc.png) | ![Topologi](docs/screenshot-topology.png) |

<!--
Cara menambahkan screenshot:
1. Buat folder `docs/` di root project.
2. Simpan file gambar (mis. `screenshot-map.png`).
3. Ganti placeholder di atas dengan file kamu.
-->

---

## 🗺️ Roadmap

- [x] Mode Realistis & Arcade
- [x] Peta kota 2D + sistem kabel fiber
- [x] Ruang rak server 42U + patch cable
- [x] Toko & inventori hardware
- [x] Monitor NOC & telemetri
- [x] Paket, pelanggan & keuangan
- [x] Sistem insiden
- [x] Save / Load
- [ ] Balancing ekonomi & kesulitan
- [ ] Autentikasi & kompetisi antar-ISP
- [ ] Sistem riset & upgrade teknologi
- [ ] Multi-bahasa (i18n)

---

## 📄 Lisensi

Project ini dilisensikan di bawah **GNU General Public License v3.0** — lihat file [LICENSE](LICENSE) untuk detail.

---

## 👤 Kredit

Dikembangkan oleh **[@ErickAz027](https://github.com/ErickAz027)**.

Dibangun dengan [Electron](https://www.electronjs.org/), [React](https://react.dev/), dan [Vite](https://vitejs.dev/).
