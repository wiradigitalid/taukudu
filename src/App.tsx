import React, { useEffect, useState } from 'react'
import {
  tauriApi,
  SystemOverview,
  ScanResult,
  DuplicateScanResult,
  PrivacyShieldState,
  DiskDriveInfo,
  DiskAnalysisResult,
  StartupItem,
  BloatwareApp,
  MalwareScanResult,
  ServiceItemInfo,
  DriverPackageInfo,
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
  PieChart,
  Folder,
  FileCode,
  Zap,
  PackageMinus,
  Bug,
  ShieldAlert,
  Archive,
  Server,
  Wrench,
} from 'lucide-react'

export function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'cleaner' | 'duplicates' | 'disk' | 'startup' | 'debloat' | 'services' | 'drivers' | 'malware' | 'privacy'>('dashboard')
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

  // Disk Analyzer state
  const [drives, setDrives] = useState<DiskDriveInfo[]>([])
  const [selectedDrivePath, setSelectedDrivePath] = useState<string>('D:\\')
  const [analyzingDisk, setAnalyzingDisk] = useState(false)
  const [diskAnalysis, setDiskAnalysis] = useState<DiskAnalysisResult | null>(null)

  // Startup state
  const [startupItems, setStartupItems] = useState<StartupItem[]>([])
  const [loadingStartup, setLoadingStartup] = useState(false)
  const [startupFeedback, setStartupFeedback] = useState<string | null>(null)

  // Debloater state
  const [bloatList, setBloatList] = useState<BloatwareApp[]>([])
  const [selectedBloat, setSelectedBloat] = useState<Set<string>>(new Set())
  const [removingBloat, setRemovingBloat] = useState(false)
  const [bloatFeedback, setBloatFeedback] = useState<string | null>(null)

  // Services state
  const [servicesList, setServicesList] = useState<ServiceItemInfo[]>([])
  const [loadingServices, setLoadingServices] = useState(false)
  const [servicesFeedback, setServicesFeedback] = useState<string | null>(null)

  // Drivers state
  const [driversList, setDriversList] = useState<DriverPackageInfo[]>([])
  const [loadingDrivers, setLoadingDrivers] = useState(false)
  const [driversFeedback, setDriversFeedback] = useState<string | null>(null)

  // Malware Scanner state
  const [malwareScanning, setMalwareScanning] = useState(false)
  const [malwareResult, setMalwareResult] = useState<MalwareScanResult | null>(null)
  const [selectedThreatPaths, setSelectedThreatPaths] = useState<Set<string>>(new Set())
  const [malwareStatus, setMalwareStatus] = useState<string | null>(null)

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

  const fetchDrivesAndAnalyze = async (targetPath?: string) => {
    setAnalyzingDisk(true)
    try {
      const driveList = await tauriApi.getDrives()
      setDrives(driveList)
      const path = targetPath || (driveList.length > 0 ? driveList[0].mount_point : 'D:\\')
      setSelectedDrivePath(path)
      const res = await tauriApi.analyzeDiskDirectory(path, 3)
      setDiskAnalysis(res)
    } catch (err) {
      console.error('Disk analysis error:', err)
    } finally {
      setAnalyzingDisk(false)
    }
  }

  const fetchStartupItems = async () => {
    setLoadingStartup(true)
    try {
      const items = await tauriApi.getStartupItems()
      setStartupItems(items)
    } catch (err) {
      console.error('Startup items error:', err)
    } finally {
      setLoadingStartup(false)
    }
  }

  const handleToggleStartup = async (item: StartupItem) => {
    try {
      await tauriApi.toggleStartupItem(item.id, !item.is_enabled)
      setStartupFeedback(`Updated startup state for ${item.name}`)
      await fetchStartupItems()
    } catch (err) {
      setStartupFeedback(`Error: ${String(err)}`)
    }
  }

  const fetchBloatware = async () => {
    try {
      const list = await tauriApi.getBloatwareList()
      setBloatList(list)
    } catch (err) {
      console.error('Bloatware fetch error:', err)
    }
  }

  const handleRemoveSelectedBloat = async () => {
    if (selectedBloat.size === 0) return
    setRemovingBloat(true)
    try {
      const pkgs = Array.from(selectedBloat)
      await tauriApi.removeBloatware(pkgs)
      setBloatFeedback(`Removed ${pkgs.length} bloatware packages.`)
      setSelectedBloat(new Set())
      await fetchBloatware()
    } catch (err) {
      setBloatFeedback(`Removal error: ${String(err)}`)
    } finally {
      setRemovingBloat(false)
    }
  }

  const fetchServices = async () => {
    setLoadingServices(true)
    try {
      const list = await tauriApi.getServices()
      setServicesList(list)
    } catch (err) {
      console.error('Services fetch error:', err)
    } finally {
      setLoadingServices(false)
    }
  }

  const handleOptimizeService = async (svc: ServiceItemInfo) => {
    try {
      const newType = svc.start_type === 'Disabled' ? 'Automatic' : 'Disabled'
      await tauriApi.setServiceStartMode(svc.name, newType)
      setServicesFeedback(`Updated ${svc.name} start type to ${newType}`)
      await fetchServices()
    } catch (err) {
      setServicesFeedback(`Service error: ${String(err)}`)
    }
  }

  const fetchDrivers = async () => {
    setLoadingDrivers(true)
    try {
      const list = await tauriApi.getDriverPackages()
      setDriversList(list)
    } catch (err) {
      console.error('Driver fetch error:', err)
    } finally {
      setLoadingDrivers(false)
    }
  }

  const handleDeleteDriver = async (publishedName: string) => {
    try {
      await tauriApi.deleteDriver(publishedName)
      setDriversFeedback(`Deleted driver package ${publishedName}`)
      await fetchDrivers()
    } catch (err) {
      setDriversFeedback(`Driver error: ${String(err)}`)
    }
  }

  const handleRunMalwareScan = async (type: string = 'quick') => {
    setMalwareScanning(true)
    setMalwareStatus(null)
    setSelectedThreatPaths(new Set())
    try {
      const res = await tauriApi.scanMalware(type)
      setMalwareResult(res)
      const paths = new Set(res.threats.map((t) => t.path))
      setSelectedThreatPaths(paths)
    } catch (err) {
      console.error('Malware scan error:', err)
      setMalwareStatus('Scan error: ' + String(err))
    } finally {
      setMalwareScanning(false)
    }
  }

  const handleQuarantineThreats = async () => {
    if (selectedThreatPaths.size === 0) return
    try {
      const res = await tauriApi.quarantineThreats(Array.from(selectedThreatPaths))
      setMalwareStatus(`Quarantined ${res.success_count} threats successfully.`)
      await handleRunMalwareScan('quick')
    } catch (err) {
      setMalwareStatus('Quarantine failed: ' + String(err))
    }
  }

  const handleDeleteThreats = async () => {
    if (selectedThreatPaths.size === 0) return
    try {
      const res = await tauriApi.deleteThreats(Array.from(selectedThreatPaths))
      setMalwareStatus(`Deleted ${res.success_count} threat files permanently.`)
      await handleRunMalwareScan('quick')
    } catch (err) {
      setMalwareStatus('Delete threats failed: ' + String(err))
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
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg font-medium text-sm transition cursor-pointer ${
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
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg font-medium text-sm transition cursor-pointer ${
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
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg font-medium text-sm transition cursor-pointer ${
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
                setActiveTab('disk')
                if (drives.length === 0 && !analyzingDisk) fetchDrivesAndAnalyze()
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg font-medium text-sm transition cursor-pointer ${
                activeTab === 'disk'
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
              }`}
            >
              <PieChart className="w-4 h-4" />
              Disk Analyzer
            </button>
            <button
              onClick={() => {
                setActiveTab('startup')
                if (startupItems.length === 0 && !loadingStartup) fetchStartupItems()
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg font-medium text-sm transition cursor-pointer ${
                activeTab === 'startup'
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
              }`}
            >
              <Zap className="w-4 h-4" />
              Startup Manager
            </button>
            <button
              onClick={() => {
                setActiveTab('debloat')
                if (bloatList.length === 0) fetchBloatware()
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg font-medium text-sm transition cursor-pointer ${
                activeTab === 'debloat'
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
              }`}
            >
              <PackageMinus className="w-4 h-4" />
              Debloater
            </button>
            <button
              onClick={() => {
                setActiveTab('services')
                if (servicesList.length === 0 && !loadingServices) fetchServices()
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg font-medium text-sm transition cursor-pointer ${
                activeTab === 'services'
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
              }`}
            >
              <Server className="w-4 h-4" />
              Services Manager
            </button>
            <button
              onClick={() => {
                setActiveTab('drivers')
                if (driversList.length === 0 && !loadingDrivers) fetchDrivers()
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg font-medium text-sm transition cursor-pointer ${
                activeTab === 'drivers'
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
              }`}
            >
              <Wrench className="w-4 h-4" />
              Driver Cleaner
            </button>
            <button
              onClick={() => {
                setActiveTab('malware')
                if (!malwareResult && !malwareScanning) handleRunMalwareScan('quick')
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg font-medium text-sm transition cursor-pointer ${
                activeTab === 'malware'
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
              }`}
            >
              <Bug className="w-4 h-4" />
              Malware Scanner
            </button>
            <button
              onClick={() => {
                setActiveTab('privacy')
                if (!privacyState && !loadingPrivacy) fetchPrivacySettings()
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg font-medium text-sm transition cursor-pointer ${
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
              : activeTab === 'disk'
              ? 'Disk Space & Treemap Analyzer'
              : activeTab === 'startup'
              ? 'Windows Startup Programs'
              : activeTab === 'debloat'
              ? 'Windows OEM & Bloatware Removal'
              : activeTab === 'services'
              ? 'Windows Background Services'
              : activeTab === 'drivers'
              ? 'DriverStore & Obsolete Drivers Purge'
              : activeTab === 'malware'
              ? 'YARA & Heuristic Malware Scanner'
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
            ) : activeTab === 'disk' ? (
              <button
                onClick={() => fetchDrivesAndAnalyze(selectedDrivePath)}
                disabled={analyzingDisk}
                className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-md bg-white/[0.05] hover:bg-white/[0.08] text-zinc-300 transition cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${analyzingDisk ? 'animate-spin' : ''}`} />
                Analyze Drive
              </button>
            ) : activeTab === 'services' ? (
              <button
                onClick={fetchServices}
                disabled={loadingServices}
                className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-md bg-white/[0.05] hover:bg-white/[0.08] text-zinc-300 transition cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingServices ? 'animate-spin' : ''}`} />
                Refresh Services
              </button>
            ) : activeTab === 'drivers' ? (
              <button
                onClick={fetchDrivers}
                disabled={loadingDrivers}
                className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-md bg-white/[0.05] hover:bg-white/[0.08] text-zinc-300 transition cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingDrivers ? 'animate-spin' : ''}`} />
                Scan Drivers
              </button>
            ) : activeTab === 'malware' ? (
              <button
                onClick={() => handleRunMalwareScan('quick')}
                disabled={malwareScanning}
                className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-md bg-white/[0.05] hover:bg-white/[0.08] text-zinc-300 transition cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${malwareScanning ? 'animate-spin' : ''}`} />
                Quick Scan
              </button>
            ) : activeTab === 'startup' ? (
              <button
                onClick={fetchStartupItems}
                disabled={loadingStartup}
                className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-md bg-white/[0.05] hover:bg-white/[0.08] text-zinc-300 transition cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingStartup ? 'animate-spin' : ''}`} />
                Refresh Startups
              </button>
            ) : activeTab === 'debloat' ? (
              <button
                onClick={fetchBloatware}
                className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-md bg-white/[0.05] hover:bg-white/[0.08] text-zinc-300 transition cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Refresh Apps
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
                    className={`w-full text-left p-3.5 rounded-xl border transition flex justify-between items-center cursor-pointer ${
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
        ) : activeTab === 'disk' ? (
          /* Disk Analyzer Page */
          <div className="p-8 max-w-6xl space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {drives.map((d, i) => {
                const isSelected = selectedDrivePath === d.mount_point
                const usagePercent = Math.round((d.used_space_bytes / d.total_space_bytes) * 100)
                return (
                  <button
                    key={i}
                    onClick={() => fetchDrivesAndAnalyze(d.mount_point)}
                    className={`p-4 rounded-xl border text-left transition cursor-pointer ${
                      isSelected
                        ? 'bg-amber-500/10 border-amber-500/30'
                        : 'bg-[#16161a] border-[#2a2a36] hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <HardDrive className="w-4 h-4 text-blue-400" />
                        <span className="text-sm font-bold text-white">{d.name || d.mount_point}</span>
                      </div>
                      <span className="text-xs font-mono text-zinc-400">{d.file_system}</span>
                    </div>
                    <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden mb-2">
                      <div
                        className="bg-blue-500 h-full rounded-full"
                        style={{ width: `${usagePercent}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[11px] text-zinc-500">
                      <span>{formatBytes(d.used_space_bytes)} used</span>
                      <span>{formatBytes(d.available_space_bytes)} free</span>
                    </div>
                  </button>
                )
              })}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-2">
                <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider px-1">
                  Folder Size Breakdown ({selectedDrivePath})
                </div>
                <div className="p-4 rounded-xl bg-[#16161a] border border-[#2a2a36] min-h-[350px] max-h-[500px] overflow-y-auto space-y-2">
                  {analyzingDisk ? (
                    <div className="h-full flex flex-col items-center justify-center text-zinc-500 py-16">
                      <RefreshCw className="w-8 h-8 mb-2 animate-spin text-zinc-600" />
                      <p className="text-sm">Calculating disk space usage...</p>
                    </div>
                  ) : diskAnalysis?.tree.children && diskAnalysis.tree.children.length > 0 ? (
                    diskAnalysis.tree.children.map((child, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-lg bg-black/20 border border-white/[0.03] flex justify-between items-center text-xs"
                      >
                        <div className="flex items-center gap-2.5 truncate mr-4">
                          <Folder className="w-4 h-4 text-amber-400 shrink-0" />
                          <span className="font-medium text-zinc-200 truncate">{child.name}</span>
                        </div>
                        <div className="text-zinc-400 font-mono font-medium shrink-0">
                          {formatBytes(child.size)}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-zinc-500 py-16">
                      <CheckCircle2 className="w-8 h-8 mb-2 text-zinc-600" />
                      <p className="text-sm">No folders detected</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider px-1">
                  By Extension
                </div>
                <div className="p-4 rounded-xl bg-[#16161a] border border-[#2a2a36] min-h-[350px] max-h-[500px] overflow-y-auto space-y-2">
                  {diskAnalysis?.file_types && diskAnalysis.file_types.length > 0 ? (
                    diskAnalysis.file_types.slice(0, 15).map((ft, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-lg bg-black/20 border border-white/[0.03] flex justify-between items-center text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <FileCode className="w-3.5 h-3.5 text-zinc-400" />
                          <span className="font-mono text-zinc-300 font-semibold">{ft.extension}</span>
                          <span className="text-[10px] text-zinc-500">({ft.count})</span>
                        </div>
                        <span className="font-mono text-zinc-400 font-medium">
                          {formatBytes(ft.total_size_bytes)}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-zinc-500 py-16">
                      <p className="text-xs">No extensions</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : activeTab === 'services' ? (
          /* Services Manager Page */
          <div className="p-8 max-w-6xl space-y-6">
            <div className="p-6 rounded-2xl bg-[#16161a] border border-[#2a2a36] flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-white">Windows Background Services ({servicesList.length})</h2>
                <p className="text-xs text-zinc-400 mt-1">
                  {servicesFeedback || 'Review background services and toggle telemetry/update services to save memory.'}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {servicesList.map((svc) => (
                <div
                  key={svc.name}
                  className="p-4 rounded-xl bg-[#16161a] border border-[#2a2a36] flex justify-between items-center"
                >
                  <div className="space-y-1 truncate mr-4">
                    <div className="flex items-center gap-2.5">
                      <span className="text-sm font-semibold text-white truncate">{svc.display_name}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-800 text-zinc-400">
                        {svc.name}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          svc.status === 'Running'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-zinc-800 text-zinc-400'
                        }`}
                      >
                        {svc.status}
                      </span>
                      {svc.recommendation === 'safe_to_disable' && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          Recommended to Disable
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-400 truncate">{svc.description || 'No description available'}</p>
                  </div>

                  <button
                    onClick={() => handleOptimizeService(svc)}
                    className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                      svc.start_type === 'Disabled'
                        ? 'bg-zinc-800 text-zinc-400'
                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}
                  >
                    {svc.start_type}
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : activeTab === 'drivers' ? (
          /* Driver Cleaner Page */
          <div className="p-8 max-w-6xl space-y-6">
            <div className="p-6 rounded-2xl bg-[#16161a] border border-[#2a2a36] flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-white">DriverStore Packages ({driversList.length})</h2>
                <p className="text-xs text-zinc-400 mt-1">
                  {driversFeedback || 'Scan and remove obsolete OEM driver packages to reclaim gigabytes of storage.'}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {driversList.map((drv) => (
                <div
                  key={drv.id}
                  className={`p-4 rounded-xl border flex justify-between items-center transition ${
                    drv.is_superseded ? 'bg-[#16161a] border-amber-500/30' : 'bg-[#16161a] border-[#2a2a36]'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <span className="text-sm font-semibold text-white">{drv.original_name}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-800 text-zinc-400">
                        {drv.published_name}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-800 text-zinc-300">
                        {drv.provider}
                      </span>
                      {drv.is_superseded && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          Superseded / Stale
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-500 font-mono">
                      Class: {drv.class_name} • Version: {drv.version} • Date: {drv.date}
                    </p>
                  </div>

                  <button
                    onClick={() => handleDeleteDriver(drv.published_name)}
                    className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-semibold transition cursor-pointer flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Purge
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : activeTab === 'malware' ? (
          /* Malware Scanner Page */
          <div className="p-8 max-w-6xl space-y-6">
            <div className="p-6 rounded-2xl bg-[#16161a] border border-[#2a2a36] flex justify-between items-center">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-bold text-white">
                    {malwareScanning
                      ? 'Scanning filesystem with heuristic YARA-X engine...'
                      : malwareResult
                      ? `Found ${malwareResult.threats.length} potential security threats`
                      : 'Malware & Threat Scanner Ready'}
                  </h2>
                </div>
                <p className="text-xs text-zinc-400 mt-1">
                  {malwareStatus ||
                    `Scanned ${malwareResult?.files_scanned || 0} files across persistence and user paths in ${
                      malwareResult?.duration_ms || 0
                    }ms`}
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => handleRunMalwareScan('quick')}
                  disabled={malwareScanning}
                  className="px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-zinc-200 text-xs font-medium transition cursor-pointer"
                >
                  Quick Scan
                </button>
                <button
                  onClick={handleQuarantineThreats}
                  disabled={malwareScanning || selectedThreatPaths.size === 0}
                  className="px-4 py-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:bg-amber-500/30 text-xs font-semibold transition flex items-center gap-2 cursor-pointer"
                >
                  <Archive className="w-4 h-4" />
                  Quarantine ({selectedThreatPaths.size})
                </button>
                <button
                  onClick={handleDeleteThreats}
                  disabled={malwareScanning || selectedThreatPaths.size === 0}
                  className="px-4 py-2 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 text-xs font-semibold transition flex items-center gap-2 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Threats
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {malwareResult && malwareResult.threats.length > 0 ? (
                malwareResult.threats.map((threat) => {
                  const isSelected = selectedThreatPaths.has(threat.path)
                  return (
                    <div
                      key={threat.id}
                      className={`p-4 rounded-xl border transition flex items-start justify-between ${
                        isSelected
                          ? 'bg-red-500/10 border-red-500/30'
                          : 'bg-[#16161a] border-[#2a2a36]'
                      }`}
                    >
                      <label className="flex items-start gap-3 cursor-pointer mr-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            const next = new Set(selectedThreatPaths)
                            if (e.target.checked) next.add(threat.path)
                            else next.delete(threat.path)
                            setSelectedThreatPaths(next)
                          }}
                          className="mt-1 rounded border-zinc-700 text-red-500 focus:ring-0 cursor-pointer"
                        />
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-white">{threat.detection_name}</span>
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase ${
                                threat.severity === 'critical'
                                  ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                  : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              }`}
                            >
                              {threat.severity}
                            </span>
                            <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-[10px] text-zinc-400 font-mono">
                              {threat.source}
                            </span>
                          </div>
                          <p className="text-xs text-zinc-300 font-mono">{threat.path}</p>
                          <p className="text-xs text-zinc-500">{threat.details}</p>
                        </div>
                      </label>
                      <span className="text-xs font-mono text-zinc-400 shrink-0">
                        {formatBytes(threat.size)}
                      </span>
                    </div>
                  )
                })
              ) : (
                <div className="p-12 rounded-xl bg-[#16161a] border border-[#2a2a36] flex flex-col items-center justify-center text-zinc-500">
                  <ShieldAlert className="w-8 h-8 mb-2 text-emerald-500" />
                  <p className="text-sm font-semibold text-zinc-300">No threats detected</p>
                  <p className="text-xs text-zinc-500 mt-1">Your persistence and user directories appear clean.</p>
                </div>
              )}
            </div>
          </div>
        ) : activeTab === 'startup' ? (
          /* Startup Manager Page */
          <div className="p-8 max-w-6xl space-y-6">
            <div className="p-6 rounded-2xl bg-[#16161a] border border-[#2a2a36] flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-white">Startup Applications ({startupItems.length})</h2>
                <p className="text-xs text-zinc-400 mt-1">
                  {startupFeedback || 'Disable unneeded autostart programs to improve system boot times.'}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {startupItems.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-xl bg-[#16161a] border border-[#2a2a36] flex justify-between items-center"
                >
                  <div className="space-y-1 truncate mr-4">
                    <div className="flex items-center gap-2.5">
                      <span className="text-sm font-semibold text-white truncate">{item.name}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-800 text-zinc-400">
                        {item.location}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          item.impact_rating === 'High'
                            ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                            : item.impact_rating === 'Medium'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        }`}
                      >
                        {item.impact_rating} Impact
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500 font-mono truncate">{item.command}</p>
                  </div>

                  <button
                    onClick={() => handleToggleStartup(item)}
                    className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                      item.is_enabled
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-zinc-800 text-zinc-400'
                    }`}
                  >
                    {item.is_enabled ? 'Enabled' : 'Disabled'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : activeTab === 'debloat' ? (
          /* Debloater Page */
          <div className="p-8 max-w-6xl space-y-6">
            <div className="p-6 rounded-2xl bg-[#16161a] border border-[#2a2a36] flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-white">Windows Bloatware Removal</h2>
                <p className="text-xs text-zinc-400 mt-1">
                  {bloatFeedback || 'Safely uninstall pre-installed OEM and promotional Windows UWP packages.'}
                </p>
              </div>
              <button
                onClick={handleRemoveSelectedBloat}
                disabled={removingBloat || selectedBloat.size === 0}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-semibold text-xs shadow-lg shadow-amber-500/20 transition flex items-center gap-2 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                {removingBloat ? 'Removing...' : `Uninstall Selected (${selectedBloat.size})`}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {bloatList.map((app) => {
                const isSelected = selectedBloat.has(app.package_name)
                return (
                  <div
                    key={app.id}
                    className={`p-4 rounded-xl border transition flex justify-between items-start ${
                      isSelected ? 'bg-amber-500/10 border-amber-500/30' : 'bg-[#16161a] border-[#2a2a36]'
                    }`}
                  >
                    <label className="flex items-start gap-3 cursor-pointer mr-4">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          const next = new Set(selectedBloat)
                          if (e.target.checked) next.add(app.package_name)
                          else next.delete(app.package_name)
                          setSelectedBloat(next)
                        }}
                        className="mt-1 rounded border-zinc-700 text-amber-500 focus:ring-0 cursor-pointer"
                      />
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-white">{app.name}</span>
                          <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-[10px] text-zinc-400 uppercase font-mono">
                            {app.category}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-400">{app.description}</p>
                      </div>
                    </label>
                  </div>
                )
              })}
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
