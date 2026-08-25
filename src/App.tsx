import React, { useEffect, useState } from 'react'
import { tauriApi, SystemOverview } from '@/lib/tauri-bridge'
import { Sparkles, Shield, HardDrive, Cpu, Activity, RefreshCw } from 'lucide-react'

export function App() {
  const [overview, setOverview] = useState<SystemOverview | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchOverview = async () => {
    setLoading(true)
    try {
      const data = await tauriApi.getSystemOverview()
      setOverview(data)
    } catch (err) {
      console.error('Failed to load system overview from Rust:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOverview()
  }, [])

  const formatBytes = (bytes: number) => {
    if (!bytes || bytes === 0) return '0 GB'
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB'
  }

  return (
    <div className="flex h-screen bg-[#0a0a10] text-[#e4e4e7] overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-64 border-r border-[#1f2937]/50 bg-[#0f0f16] flex flex-col justify-between p-4">
        <div>
          <div className="flex items-center gap-3 px-2 py-4 mb-6 border-b border-[#1f2937]/40">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-500 font-bold">
              T
            </div>
            <div>
              <h1 className="text-sm font-bold text-white tracking-wide">TauKudu</h1>
              <p className="text-[10px] text-zinc-500 font-mono">v0.1.0 (Rust+Tauri)</p>
            </div>
          </div>

          <nav className="space-y-1">
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg bg-amber-500/10 text-amber-400 font-medium text-sm border border-amber-500/20">
              <Activity className="w-4 h-4" />
              Dashboard
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04] transition text-sm">
              <Sparkles className="w-4 h-4" />
              Clean up
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04] transition text-sm">
              <HardDrive className="w-4 h-4" />
              Disk & Duplicates
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04] transition text-sm">
              <Shield className="w-4 h-4" />
              Security & Privacy
            </button>
          </nav>
        </div>

        <div className="pt-4 border-t border-[#1f2937]/40 text-[11px] text-zinc-500 flex justify-between items-center">
          <span>Engine: Pure Rust</span>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        <header className="h-14 border-b border-[#1f2937]/40 px-8 flex items-center justify-between bg-[#0a0a10]/80 backdrop-blur">
          <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            System Overview & Health
          </div>
          <button
            onClick={fetchOverview}
            disabled={loading}
            className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-md bg-white/[0.05] hover:bg-white/[0.08] text-zinc-300 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh Stats
          </button>
        </header>

        <div className="p-8 max-w-5xl space-y-8">
          {/* Hero Banner */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-[#16161a] to-[#1e1e28] border border-[#2a2a36] relative overflow-hidden">
            <div className="relative z-10 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-white mb-1">
                  Ready to optimize your workstation
                </h2>
                <p className="text-sm text-zinc-400">
                  Powered by BleachBit rules, Czkawka deduplication, and ripgrep parallel engine.
                </p>
              </div>
              <button className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-semibold text-sm shadow-lg shadow-amber-500/20 transition flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                One-Click Clean
              </button>
            </div>
          </div>

          {/* Real-time Hardware Metrics from Rust */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-5 rounded-xl bg-[#16161a] border border-[#2a2a36]">
              <div className="flex items-center gap-3 text-zinc-400 text-xs font-medium mb-3">
                <HardDrive className="w-4 h-4 text-blue-400" />
                Operating System
              </div>
              <div className="text-lg font-bold text-white">
                {overview?.os_name || 'Loading...'}
              </div>
              <div className="text-xs text-zinc-500 mt-1">
                Build: {overview?.os_version || 'N/A'} ({overview?.host_name})
              </div>
            </div>

            <div className="p-5 rounded-xl bg-[#16161a] border border-[#2a2a36]">
              <div className="flex items-center gap-3 text-zinc-400 text-xs font-medium mb-3">
                <Cpu className="w-4 h-4 text-emerald-400" />
                CPU Cores
              </div>
              <div className="text-lg font-bold text-white">
                {overview?.cpu_count ? `${overview.cpu_count} Logical Cores` : 'Loading...'}
              </div>
              <div className="text-xs text-zinc-500 mt-1">
                Parallel Rayon Traversal Ready
              </div>
            </div>

            <div className="p-5 rounded-xl bg-[#16161a] border border-[#2a2a36]">
              <div className="flex items-center gap-3 text-zinc-400 text-xs font-medium mb-3">
                <Activity className="w-4 h-4 text-purple-400" />
                Physical Memory
              </div>
              <div className="text-lg font-bold text-white">
                {overview ? `${formatBytes(overview.used_memory_bytes)} / ${formatBytes(overview.total_memory_bytes)}` : 'Loading...'}
              </div>
              <div className="text-xs text-zinc-500 mt-1">
                Usage: {overview ? Math.round((overview.used_memory_bytes / overview.total_memory_bytes) * 100) : 0}% Active
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
