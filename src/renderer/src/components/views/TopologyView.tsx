import React, { useMemo, useState, useCallback } from 'react'
import {
  ReactFlow,
  Controls,
  Background,
  MiniMap,
  Node,
  Edge,
  Connection,
  NodeChange
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import {
  Plus,
  Zap,
  ShoppingBag,
  Info
} from 'lucide-react'
import { useGameStore, HARDWARE_CATALOG } from '../../store/useGameStore'
import { HardwareNodeComponent } from './topology/HardwareNodeComponent'
import { NodeInspectorDrawer } from './topology/NodeInspectorDrawer'
import { HardwareTemplate } from '../../types/game'

export const TopologyView: React.FC = () => {
  const nodes = useGameStore((s) => s.nodes)
  const edges = useGameStore((s) => s.edges)
  const addNodeAction = useGameStore((s) => s.addNode)
  const updateNodePosition = useGameStore((s) => s.updateNodePosition)
  const addEdgeAction = useGameStore((s) => s.addEdge)
  const removeEdgeAction = useGameStore((s) => s.removeEdge)
  const inspectNode = useGameStore((s) => s.inspectNode)
  const cash = useGameStore((s) => s.finance.cash)

  const [isShopOpen, setIsShopOpen] = useState(false)

  // Custom node types registration
  const nodeTypes = useMemo(
    () => ({
      hardwareNode: HardwareNodeComponent
    }),
    []
  )

  // Map Zustand nodes to ReactFlow nodes
  const flowNodes: Node[] = useMemo(() => {
    return nodes.map((node) => ({
      id: node.id,
      type: 'hardwareNode',
      position: node.position,
      data: node as any
    }))
  }, [nodes])

  // Map Zustand edges to ReactFlow edges
  const flowEdges: Edge[] = useMemo(() => {
    return edges.map((edge) => {
      const sourceNode = nodes.find((n) => n.id === edge.source)
      const isSevered = sourceNode?.status === 'unlinked' || sourceNode?.status === 'offline'

      return {
        id: edge.id,
        source: edge.source,
        target: edge.target,
        animated: !isSevered,
        style: {
          stroke: isSevered ? '#ef4444' : '#06b6d4',
          strokeWidth: 2.5
        }
      }
    })
  }, [edges, nodes])

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      changes.forEach((change) => {
        if (change.type === 'position' && change.position) {
          updateNodePosition(change.id, change.position)
        }
      })
    },
    [updateNodePosition]
  )

  const onConnect = useCallback(
    (params: Connection) => {
      if (params.source && params.target) {
        addEdgeAction(params.source, params.target)
      }
    },
    [addEdgeAction]
  )

  const onEdgeClick = useCallback(
    (_: any, edge: Edge) => {
      if (window.confirm('Disconnect this fiber optic cable?')) {
        removeEdgeAction(edge.id)
      }
    },
    [removeEdgeAction]
  )

  const handleBuyNode = (template: HardwareTemplate) => {
    addNodeAction(template)
  }

  return (
    <div className="flex-1 flex h-full relative overflow-hidden bg-slate-950 select-none">
      {/* Topology Canvas */}
      <div className="flex-1 h-full relative" onClick={() => inspectNode(null)}>
        <ReactFlow
          nodes={flowNodes}
          edges={flowEdges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onConnect={onConnect}
          onEdgeClick={onEdgeClick}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          minZoom={0.2}
          maxZoom={2}
          proOptions={{ hideAttribution: true }}
          className="bg-slate-950"
        >
          <Background color="#1e293b" gap={20} size={1} />
          <Controls className="!bg-slate-900 !border-slate-800 !text-slate-200" />
          <MiniMap
            nodeColor="#06b6d4"
            maskColor="rgba(3, 7, 18, 0.7)"
            className="!bg-slate-900 !border-slate-800 !rounded-lg"
          />
        </ReactFlow>

        {/* Floating Quick Action / Helper */}
        <div className="absolute top-4 left-4 z-10 flex items-center gap-3 bg-slate-900/90 backdrop-blur-md px-3.5 py-2.5 rounded-xl border border-slate-800 text-xs font-mono text-slate-300 shadow-lg">
          <Info className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>Click node to Inspect / Upgrade. Connect: Drag Right (out) to Left (in).</span>
        </div>

        {/* Floating Toggle Shop Button */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            setIsShopOpen(!isShopOpen)
          }}
          className="absolute top-4 right-4 z-10 flex items-center gap-2 px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs shadow-lg transition-all"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>{isShopOpen ? 'Close Catalog' : 'Hardware Catalog'}</span>
        </button>
      </div>

      {/* Node Inspector Drawer */}
      <NodeInspectorDrawer />

      {/* Hardware Shop Sidebar */}
      <div
        className={`w-80 bg-slate-900/98 border-l border-slate-800 flex flex-col z-20 transition-all backdrop-blur-md ${
          isShopOpen ? 'translate-x-0' : 'translate-x-full absolute right-0 top-0 bottom-0'
        }`}
      >
        {/* Shop Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-bold text-slate-100">Hardware Catalog</h2>
          </div>
          <button
            onClick={() => setIsShopOpen(false)}
            className="text-xs text-slate-400 hover:text-slate-200"
          >
            Close
          </button>
        </div>

        {/* Hardware Catalog Items */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {HARDWARE_CATALOG.map((item, idx) => {
            const canAfford = cash >= item.cost

            return (
              <div
                key={idx}
                className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-3 hover:border-slate-700 transition-all shadow-sm"
              >
                <div className="flex items-start justify-between mb-1.5">
                  <div>
                    <div className="text-xs font-bold text-slate-200 leading-tight">{item.name}</div>
                    <div className="text-[10px] text-cyan-400 font-mono uppercase font-semibold">
                      {item.type.replace('_', ' ')}
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-400">
                    ${item.cost.toLocaleString()}
                  </span>
                </div>

                <p className="text-[11px] text-slate-400 leading-snug mb-2">{item.description}</p>

                <div className="grid grid-cols-2 gap-1.5 text-[10px] font-mono text-slate-400 mb-2.5 bg-slate-900/70 p-1.5 rounded-lg border border-slate-800/50">
                  <div>
                    <span>Speed:</span>{' '}
                    <strong className="text-slate-200">{item.maxThroughputMbps.toLocaleString()}M</strong>
                  </div>
                  <div>
                    <span>Ports:</span> <strong className="text-slate-200">{item.portCapacity}</strong>
                  </div>
                  <div>
                    <span>Upkeep:</span> <strong className="text-slate-300">${item.upkeepCostPerDay}/d</strong>
                  </div>
                  <div className="flex items-center gap-1">
                    <Zap className="w-3 h-3 text-amber-400" />
                    <span>{item.powerWatts}W</span>
                  </div>
                </div>

                <button
                  onClick={() => handleBuyNode(item)}
                  disabled={!canAfford}
                  className={`w-full py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    canAfford
                      ? 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-sm'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{canAfford ? 'Deploy Hardware' : 'Insufficient Funds'}</span>
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
