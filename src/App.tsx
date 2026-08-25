import React, { useEffect, useState } from 'react'
import {
  tauriApi,
  SystemOverview,
  ScanResult,
  DuplicateScanResult,
  PrivacyShieldState,
} from '@/lib/tauri-bridge'
import {
  Sparkles,
  Shield,
  HardDrive,
  Cpu,
  Activity,
  RefreshCw,
  Trash2,
  CheckCircle2,
  CopyCheck,
  FolderOpen,
  Lock,
  Eye,
  AlertTriangle,
} from 'lucide-react'

export function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'cleaner' | 'duplicates' | 'privacy'>('dashboard')
  const [overview, setOverview] = useState<SystemOverview | null>(null)
  const [loadingOverview, setLoadingOverview] = useState(true)

  // Cleaner state
  const [scanning, setScanning] = useState(false)
  const [cleaning, setCleaning] = useState(false)
  const [scanResult, setScanResult] = useState<ScanResult | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [cleanStatus, setCleanStatus] = useState<string | null>(null)

  // Duplicates state
  const [dupDir, setDupDir] = useState<string>('D:\\Developer\\wiradigital.id\\taukudu')
  const [dupScanning, setDupScanning] = useState(false)
  const [dupResult, setDupResult] = useState<DuplicateScanResult | null>(null)
  const [selectedDupPaths, setSelectedDupPaths] = useState<Set<string>>(new Set())
  const [dupStatus, setDupStatus] = useState<string | null>(null)

  // Privacy Shield state
  const [privacyState, setPrivacyState] = useState<PrivacyShieldState | null>(null)
  const [loadingPrivacy, setLoadingPrivacy] = useState(false)
  const [privacyFeedback, setPrivacyFeedback] = useState<string | null>(null)

  const fetchOverview = async () => {
    setLoadingOverview(true)
    try {
      const data = await tauriApi.getSystemOverview()
      setOverview(data)
    } catch (err) {
      console.error('Failed to load system overview from Rust:', err)
    } finally {
      setLoadingOverview(false)
    }
  }

  const handleRunScan = async () => {
    setScanning(true)
    setCleanStatus(null)
    try {
      const result = await tauriApi.scanCleaners()
      setScanResult(result)
      if (result.categories.length > 0) {
        setSelectedCategory(result.categories[0].category)
      }
    } catch (err) {
      console.error('Scan failed:', err)
      setCleanStatus('Scan failed: ' + String(err))
    } finally {
      setScanning(false)
    }
  }

  const handleCleanNow = async () => {
    if (!scanResult) return
    setCleaning(true)
    try {
      const allPaths = scanResult.categories.flatMap((c) => c.items.map((i) => i.path))
      const res = await tauriApi.cleanTargets(allPaths)
      setCleanStatus(`Successfully cleaned ${res.deleted_files} files (${formatBytes(res.deleted_bytes)} reclaimed)`)
      await handleRunScan()
    } catch (err) {
      console.error('Clean execution failed:', err)
      setCleanStatus('Cleaning failed: ' + String(err))
    } finally {
      setCleaning(false)
    }
  }

  const handleScanDuplicates = async () => {
    if (!dupDir) return
    setDupScanning(true)
    setDupStatus(null)
    setSelectedDupPaths(new Set())
    try {
      const res = await tauriApi.scanDuplicates({
        directory: dupDir,
        min_file_size: 1024,
        max_file_size: null,
        exclude_patterns: ['target', 'node_modules', '.git'],
        extension_filter: [],
        max_depth: 30,
      })
      setDupResult(res)
      const toSelect = new Set<string>()
      res.groups.forEach((g) => {
        g.files.slice(1).forEach((f) => toSelect.add(f.path))
      })
      setSelectedDupPaths(toSelect)
    } catch (err) {
      console.error('Duplicate scan error:', err)
      setDupStatus('Duplicate scan error: ' + String(err))
    } finally {
      setDupScanning(false)
    }
  }

  const handleDeleteSelectedDuplicates = async () => {
    if (selectedDupPaths.size === 0) return
    try {
      const count = await tauriApi.deleteDuplicateFiles(Array.from(selectedDupPaths))
      setDupStatus(`Successfully deleted ${count} duplicate files`)
      await handleScanDuplicates()
    } catch (err) {
      console.error('Failed to delete duplicates:', err)
      setDupStatus('Deletion failed: ' + String(err))
    }
  }

  const fetchPrivacySettings = async () => {
    setLoadingPrivacy(true)
    try {
      const state = await tauriApi.getPrivacyShieldState()
      setPrivacyState(state)
    } catch (err) {
      console.error('Failed to load privacy state:', err)
    } finally {
      setLoadingPrivacy(false)
    }
  }

  const handleTogglePrivacy = async (id: string, currentlyEnabled: boolean) => {
    try {
      await tauriApi.applyPrivacySetting(id, !currentlyEnabled)
      setPrivacyFeedback(`Updated policy for ${id}`)
      await fetchPrivacySettings()
    } catch (err) {
      console.error(`Failed to apply privacy setting ${id}:`, err)
      setPrivacyFeedback(`Error: ${String(err)}`)
    }
  }

  const handleProtectAllPrivacy = async () => {
    if (!privacyState) return
    try {
      for (const s of privacyState.settings) {
        if (!s.is_enabled) {
          await tauriApi.applyPrivacySetting(s.id, true)
        }
      }
      setPrivacyFeedback('All privacy shields successfully applied!')
      await fetchPrivacySettings()
    } catch (err) {
      console.error('Batch protect failed:', err)
      setPrivacyFeedback(`Error applying all: ${String(err)}`)
    }
  }

  useEffect(() => {
    fetchOverview()
  }, [])

  const formatBytes = (bytes: number) => {
    if (!bytes || bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const activeCategorySummary = scanResult?.categories.find((c) => c.category === selectedCategory)

  return (
    <div className="flex h-screen bg-[#0a0a10] text-[#e4e4e7] overflow-hidden font-sans">
      {/* Sidebar Navigation */}
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
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg font-medium text-sm transition ${
                activeTab === 'dashboard'
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
              }`}
            >
              <Activity className="w-4 h-4" />
              Dashboard
            </button>
            <button
              onClick={() => {
                setActiveTab('cleaner')
                if (!scanResult && !scanning) handleRunScan()
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg font-medium text-sm transition ${
                activeTab === 'cleaner'
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              System Cleaner
            </button>
            <button
              onClick={() => {
                setActiveTab('duplicates')
                if (!dupResult && !dupScanning) handleScanDuplicates()
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg font-medium text-sm transition ${
                activeTab === 'duplicates'
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
              }`}
            >
              <CopyCheck className="w-4 h-4" />
              Duplicate Finder
            </button>
            <button
              onClick={() => {
                setActiveTab('privacy')
                if (!privacyState && !loadingPrivacy) fetchPrivacySettings()
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg font-medium text-sm transition ${
                activeTab === 'privacy'
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
              }`}
            >
              <Shield className="w-4 h-4" />
              Privacy Shield
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
            {activeTab === 'dashboard'
              ? 'System Overview & Health'
              : activeTab === 'cleaner'
              ? 'Deep System Cleaner (Rules-Engine)'
              : activeTab === 'duplicates'
              ? 'Multi-Stage Duplicate Finder (Czkawka Concept)'
              : 'OS Privacy & Telemetry Shield'}
          </div>
          <div className="flex items-center gap-3">
            {activeTab === 'dashboard' ? (
              <button
                onClick={fetchOverview}
                disabled={loadingOverview}
                className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-md bg-white/[0.05] hover:bg-white/[0.08] text-zinc-300 transition cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingOverview ? 'animate-spin' : ''}`} />
                Refresh Stats
              </button>
            ) : activeTab === 'cleaner' ? (
              <button
                onClick={handleRunScan}
                disabled={scanning || cleaning}
                className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-md bg-white/[0.05] hover:bg-white/[0.08] text-zinc-300 transition cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${scanning ? 'animate-spin' : ''}`} />
                Rescan
              </button>
            ) : activeTab === 'duplicates' ? (
              <button
                onClick={handleScanDuplicates}
                disabled={dupScanning}
                className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-md bg-white/[0.05] hover:bg-white/[0.08] text-zinc-300 transition cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${dupScanning ? 'animate-spin' : ''}`} />
                Scan Duplicates
              </button>
            ) : (
              <button
                onClick={fetchPrivacySettings}
                disabled={loadingPrivacy}
                className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-md bg-white/[0.05] hover:bg-white/[0.08] text-zinc-300 transition cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingPrivacy ? 'animate-spin' : ''}`} />
                Refresh Policies
              </button>
            )}
          </div>
        </header>

        {activeTab === 'dashboard' ? (
          <div className="p-8 max-w-5xl space-y-8">
            <div className="p-6 rounded-2xl bg-gradient-to-r from-[#16161a] to-[#1e1e28] border border-[#2a2a36] relative overflow-hidden">
              <div className="relative z-10 flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-white mb-1">
                    Ready to optimize your workstation
                  </h2>
                  <p className="text-sm text-zinc-400">
                    Fast parallel directory traversal & BleachBit-compatible cleaning rules.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setActiveTab('cleaner')
                    handleRunScan()
                  }}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-semibold text-sm shadow-lg shadow-amber-500/20 transition flex items-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  Quick Scan Now
                </button>
              </div>
            </div>

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
        ) : activeTab === 'cleaner' ? (
          /* Cleaner Page */
          <div className="p-8 max-w-6xl space-y-6">
            <div className="p-6 rounded-2xl bg-[#16161a] border border-[#2a2a36] flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-white">
                  {scanning
                    ? 'Scanning system with Rayon parallel engine...'
                    : scanResult
                    ? `Found ${scanResult.total_files} junk files (${formatBytes(scanResult.total_bytes)})`
                    : 'System Cleaner Ready'}
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  {cleanStatus || 'Select categories below to inspect and reclaim disk space.'}
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleRunScan}
                  disabled={scanning || cleaning}
                  className="px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-zinc-200 text-xs font-medium transition cursor-pointer"
                >
                  Rescan
                </button>
                <button
                  onClick={handleCleanNow}
                  disabled={scanning || cleaning || !scanResult || scanResult.total_files === 0}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-semibold text-xs transition flex items-center gap-2 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  {cleaning ? 'Cleaning...' : 'Clean All Now'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider px-1">
                  Categories
                </div>
                {scanResult?.categories.map((cat) => (
                  <button
                    key={cat.category}
                    onClick={() => setSelectedCategory(cat.category)}
                    className={`w-full text-left p-3.5 rounded-xl border transition flex justify-between items-center ${
                      selectedCategory === cat.category
                        ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                        : 'bg-[#16161a] border-[#2a2a36] text-zinc-300 hover:border-zinc-700'
                    }`}
                  >
                    <div>
                      <div className="text-sm font-semibold capitalize">{cat.category}</div>
                      <div className="text-xs text-zinc-500">{cat.total_files} files found</div>
                    </div>
                    <div className="text-xs font-mono font-bold text-zinc-300">
                      {formatBytes(cat.total_bytes)}
                    </div>
                  </button>
                ))}
              </div>

              <div className="md:col-span-2 space-y-2">
                <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider px-1">
                  Target Files Breakdown ({activeCategorySummary?.category || 'None'})
                </div>
                <div className="p-4 rounded-xl bg-[#16161a] border border-[#2a2a36] min-h-[350px] max-h-[500px] overflow-y-auto space-y-2">
                  {activeCategorySummary && activeCategorySummary.items.length > 0 ? (
                    activeCategorySummary.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-lg bg-black/20 border border-white/[0.03] flex justify-between items-center text-xs"
                      >
                        <div className="truncate mr-4 max-w-[420px]">
                          <div className="font-medium text-zinc-200 truncate">{item.path}</div>
                          <div className="text-[10px] text-zinc-500">{item.subcategory}</div>
                        </div>
                        <div className="text-zinc-400 font-mono font-medium shrink-0">
                          {formatBytes(item.size_bytes)}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-zinc-500 py-16">
                      <CheckCircle2 className="w-8 h-8 mb-2 text-zinc-600" />
                      <p className="text-sm">No files detected in this category</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : activeTab === 'duplicates' ? (
          /* Duplicate Finder Page */
          <div className="p-8 max-w-6xl space-y-6">
            <div className="p-6 rounded-2xl bg-[#16161a] border border-[#2a2a36] flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-white">
                  {dupScanning
                    ? 'Scanning with Blake3 Multi-Stage Hasher...'
                    : dupResult
                    ? `Found ${dupResult.total_duplicates} duplicate files (${formatBytes(dupResult.reclaimable_space)} reclaimable)`
                    : 'Duplicate Finder Ready'}
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  {dupStatus || `Scanned ${dupResult?.files_scanned || 0} files in ${dupResult?.scan_duration_ms || 0}ms`}
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleScanDuplicates}
                  disabled={dupScanning}
                  className="px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-zinc-200 text-xs font-medium transition cursor-pointer"
                >
                  Rescan
                </button>
                <button
                  onClick={handleDeleteSelectedDuplicates}
                  disabled={dupScanning || selectedDupPaths.size === 0}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-semibold text-xs transition flex items-center gap-2 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Selected ({selectedDupPaths.size})
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-[#16161a] border border-[#2a2a36]">
              <FolderOpen className="w-4 h-4 text-zinc-400" />
              <input
                type="text"
                value={dupDir}
                onChange={(e) => setDupDir(e.target.value)}
                placeholder="Target Directory Path..."
                className="flex-1 bg-transparent border-none text-xs text-zinc-200 focus:outline-none"
              />
              <button
                onClick={handleScanDuplicates}
                disabled={dupScanning}
                className="px-3 py-1 rounded-lg bg-white/[0.08] hover:bg-white/[0.12] text-xs font-medium text-white transition cursor-pointer"
              >
                Scan Folder
              </button>
            </div>

            <div className="space-y-4">
              {dupResult && dupResult.groups.length > 0 ? (
                dupResult.groups.map((group, gIdx) => (
                  <div
                    key={gIdx}
                    className="p-4 rounded-xl bg-[#16161a] border border-[#2a2a36] space-y-2.5"
                  >
                    <div className="flex justify-between items-center text-xs pb-2 border-b border-white/[0.05]">
                      <div className="font-mono text-zinc-400 text-[11px]">
                        Hash (Blake3): <span className="text-zinc-300">{group.hash.slice(0, 16)}...</span>
                      </div>
                      <div className="text-xs text-amber-400 font-semibold font-mono">
                        {formatBytes(group.size)} each ({group.files.length} copies)
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      {group.files.map((file, fIdx) => {
                        const isSelected = selectedDupPaths.has(file.path)
                        return (
                          <div
                            key={fIdx}
                            className={`p-2.5 rounded-lg border flex items-center justify-between text-xs transition ${
                              isSelected
                                ? 'bg-amber-500/10 border-amber-500/30'
                                : 'bg-black/20 border-white/[0.03]'
                            }`}
                          >
                            <label className="flex items-center gap-3 cursor-pointer truncate mr-4">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={(e) => {
                                  const next = new Set(selectedDupPaths)
                                  if (e.target.checked) next.add(file.path)
                                  else next.delete(file.path)
                                  setSelectedDupPaths(next)
                                }}
                                className="rounded border-zinc-700 text-amber-500 focus:ring-0 cursor-pointer"
                              />
                              <span className="text-zinc-200 truncate">{file.path}</span>
                            </label>
                            <span className="text-[10px] text-zinc-500 shrink-0 font-mono">
                              {fIdx === 0 ? '(Original / Keep)' : '(Duplicate)'}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-12 rounded-xl bg-[#16161a] border border-[#2a2a36] flex flex-col items-center justify-center text-zinc-500">
                  <CheckCircle2 className="w-8 h-8 mb-2 text-zinc-600" />
                  <p className="text-sm">No duplicate files found</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Privacy Shield Page */
          <div className="p-8 max-w-6xl space-y-6">
            <div className="p-6 rounded-2xl bg-[#16161a] border border-[#2a2a36] flex justify-between items-center">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-bold text-white">
                    Privacy Protection Score: {privacyState?.score_percentage || 0}%
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {privacyState?.protected_count || 0} / {privacyState?.total_count || 0} Protected
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mt-1">
                  {privacyFeedback || 'Disable diagnostic telemetry, advertising tracking IDs, and background data collectors.'}
                </p>
              </div>
              <button
                onClick={handleProtectAllPrivacy}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs shadow-lg shadow-amber-500/20 transition flex items-center gap-2 cursor-pointer"
              >
                <Lock className="w-4 h-4" />
                Protect All Now
              </button>
            </div>

            {/* Privacy Toggles List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {privacyState?.settings.map((setting) => (
                <div
                  key={setting.id}
                  className={`p-4 rounded-xl border transition flex justify-between items-start ${
                    setting.is_enabled
                      ? 'bg-[#16161a] border-emerald-500/30'
                      : 'bg-[#16161a] border-[#2a2a36]'
                  }`}
                >
                  <div className="mr-4 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-white">{setting.label}</span>
                      {setting.requires_admin && (
                        <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-[10px] text-zinc-400 font-mono">
                          Admin
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-400 leading-relaxed">{setting.description}</p>
                  </div>

                  <button
                    onClick={() => handleTogglePrivacy(setting.id, setting.is_enabled)}
                    className={`shrink-0 relative inline-flex h-6 w-11 items-center rounded-full transition cursor-pointer ${
                      setting.is_enabled ? 'bg-emerald-500' : 'bg-zinc-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                        setting.is_enabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
