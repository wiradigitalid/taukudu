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
  InstalledProgramInfo,
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
  Package,
  FileX2,
} from 'lucide-react'

export function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'cleaner' | 'duplicates' | 'disk' | 'startup' | 'debloat' | 'services' | 'drivers' | 'uninstaller' | 'shredder' | 'malware' | 'privacy'>('dashboard')
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

  // Uninstaller state
  const [programsList, setProgramsList] = useState<InstalledProgramInfo[]>([])
  const [loadingPrograms, setLoadingPrograms] = useState(false)
  const [uninstallerFeedback, setUninstallerFeedback] = useState<string | null>(null)

  // Shredder state
  const [shredPath, setShredPath] = useState<string>('')
  const [shredding, setShredding] = useState(false)
  const [shredFeedback, setShredFeedback] = useState<string | null>(null)

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

  const fetchPrograms = async () => {
    setLoadingPrograms(true)
    try {
      const list = await tauriApi.getInstalledPrograms()
      setProgramsList(list)
    } catch (err) {
      console.error('Programs fetch error:', err)
    } finally {
      setLoadingPrograms(false)
    }
  }

  const handleUninstallProgram = async (prog: InstalledProgramInfo) => {
    try {
      setUninstallerFeedback(`Triggering uninstaller for ${prog.name}...`)
      await tauriApi.uninstallProgram(prog.uninstall_string)
      setUninstallerFeedback(`Completed uninstaller command for ${prog.name}`)
      await fetchPrograms()
    } catch (err) {
      setUninstallerFeedback(`Uninstall error: ${String(err)}`)
    }
  }

  const handleShredTarget = async () => {
    if (!shredPath) return
    setShredding(true)
    try {
      const res = await tauriApi.shredFiles([shredPath], 3)
      setShredFeedback(`Successfully destroyed file (${formatBytes(res.bytes_shredded)} overwritten)`)
      setShredPath('')
    } catch (err) {
      setShredFeedback(`Shredding failed: ${String(err)}`)
    } finally {
      setShredding(false)
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
                setActiveTab('uninstaller')
                if (programsList.length === 0 && !loadingPrograms) fetchPrograms()
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg font-medium text-sm transition cursor-pointer ${
                activeTab === 'uninstaller'
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
              }`}
            >
              <Package className="w-4 h-4" />
              Uninstaller
            </button>
            <button
              onClick={() => setActiveTab('shredder')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg font-medium text-sm transition cursor-pointer ${
                activeTab === 'shredder'
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
              }`}
            >
              <FileX2 className="w-4 h-4" />
              File Shredder
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
              : activeTab === 'uninstaller'
              ? 'Clean Software Uninstaller'
              : activeTab === 'shredder'
              ? 'Cryptographic File Shredder (DoD 5220.22-M)'
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
            ) : activeTab === 'uninstaller' ? (
              <button
                onClick={fetchPrograms}
                disabled={loadingPrograms}
                className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-md bg-white/[0.05] hover:bg-white/[0.08] text-zinc-300 transition cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingPrograms ? 'animate-spin' : ''}`} />
                Refresh Programs
              </button>
            ) : (
              <button
                onClick={fetchOverview}
                className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-md bg-white/[0.05] hover:bg-white/[0.08] text-zinc-300 transition cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Refresh
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
        ) : activeTab === 'uninstaller' ? (
          /* Uninstaller Page */
          <div className="p-8 max-w-6xl space-y-6">
            <div className="p-6 rounded-2xl bg-[#16161a] border border-[#2a2a36] flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-white">Installed Desktop Programs ({programsList.length})</h2>
                <p className="text-xs text-zinc-400 mt-1">
                  {uninstallerFeedback || 'Clean uninstall applications with leftover inspection.'}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {programsList.map((prog) => (
                <div
                  key={prog.id}
                  className="p-4 rounded-xl bg-[#16161a] border border-[#2a2a36] flex justify-between items-center"
                >
                  <div className="space-y-1 truncate mr-4">
                    <div className="flex items-center gap-2.5">
                      <span className="text-sm font-semibold text-white truncate">{prog.name}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-800 text-zinc-400">
                        v{prog.version}
                      </span>
                      <span className="text-xs text-zinc-400 font-medium">{prog.publisher}</span>
                    </div>
                    <p className="text-xs text-zinc-500 font-mono truncate">{prog.install_location || prog.uninstall_string}</p>
                  </div>

                  <button
                    onClick={() => handleUninstallProgram(prog)}
                    className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Uninstall
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : activeTab === 'shredder' ? (
          /* File Shredder Page */
          <div className="p-8 max-w-5xl space-y-6">
            <div className="p-6 rounded-2xl bg-[#16161a] border border-[#2a2a36]">
              <h2 className="text-lg font-bold text-white mb-1">Cryptographic File Shredder</h2>
              <p className="text-xs text-zinc-400">
                Permanently destroy sensitive files using DoD 5220.22-M multi-pass pseudo-random overwrite before filesystem unlinking.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#16161a] border border-[#2a2a36] space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300">Target File Path</label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={shredPath}
                    onChange={(e) => setShredPath(e.target.value)}
                    placeholder="Enter full file path to destroy permanently (e.g. C:\secret.docx)..."
                    className="flex-1 px-4 py-2.5 rounded-xl bg-black/30 border border-zinc-700 text-xs text-white focus:outline-none focus:border-red-500"
                  />
                  <button
                    onClick={handleShredTarget}
                    disabled={shredding || !shredPath}
                    className="px-6 py-2.5 rounded-xl bg-red-500 hover:bg-red-400 disabled:opacity-50 text-white font-semibold text-xs transition flex items-center gap-2 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                    {shredding ? 'Shredding...' : 'Shred File Permanently'}
                  </button>
                </div>
              </div>

              {shredFeedback && (
                <div className="p-3 rounded-lg bg-white/[0.04] border border-white/[0.06] text-xs text-amber-400">
                  {shredFeedback}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="p-8 text-xs text-zinc-400">Section loaded</div>
        )}
      </main>
    </div>
  )
}
