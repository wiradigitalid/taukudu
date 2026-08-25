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
  PerformanceSnapshot,
  HistoryRecord,
  NetworkItemInfo,
  ActiveConnectionInfo,
  RegistryIssue,
  GameModeStatus,
  GameOptimizationItem,
  TrimDriveStatus,
  DiskRepairOutput,
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
  Gauge,
  XCircle,
  History,
  Settings,
  Globe,
  Moon,
  Sun,
  Wifi,
  Database,
  Gamepad2,
  ShieldCheck,
  Hammer,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { LANGUAGES } from '@/lib/languages'

export function App() {
  const { t, i18n } = useTranslation()
  const [activeTab, setActiveTab] = useState<'dashboard' | 'cleaner' | 'duplicates' | 'disk' | 'repair' | 'game' | 'registry' | 'startup' | 'debloat' | 'services' | 'drivers' | 'network' | 'uninstaller' | 'shredder' | 'perf' | 'history' | 'settings' | 'malware' | 'privacy'>('dashboard')
  const [overview, setOverview] = useState<SystemOverview | null>(null)
  const [loadingOverview, setLoadingOverview] = useState(true)

  // Settings State
  const [themeMode, setThemeMode] = useState<'dark' | 'light'>('dark')
  const [currentLang, setCurrentLang] = useState<string>('en')
  const [settingsFeedback, setSettingsFeedback] = useState<string | null>(null)

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

  // Disk Maintenance & Repair state
  const [trimDrives, setTrimDrives] = useState<TrimDriveStatus[]>([])
  const [trimFeedback, setTrimFeedback] = useState<string | null>(null)
  const [runningRepair, setRunningRepair] = useState<string | null>(null)
  const [repairResults, setRepairResults] = useState<Record<string, DiskRepairOutput>>({})

  // Game Mode state
  const [gameStatus, setGameStatus] = useState<GameModeStatus | null>(null)
  const [gameOpts, setGameOpts] = useState<GameOptimizationItem[]>([])
  const [gameFeedback, setGameFeedback] = useState<string | null>(null)

  // Registry state
  const [registryIssues, setRegistryIssues] = useState<RegistryIssue[]>([])
  const [selectedRegistryIds, setSelectedRegistryIds] = useState<Set<string>>(new Set())
  const [scanningRegistry, setScanningRegistry] = useState(false)
  const [fixingRegistry, setFixingRegistry] = useState(false)
  const [registryFeedback, setRegistryFeedback] = useState<string | null>(null)

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

  // Network state
  const [networkItems, setNetworkItems] = useState<NetworkItemInfo[]>([])
  const [activeConns, setActiveConns] = useState<ActiveConnectionInfo[]>([])
  const [networkFeedback, setNetworkFeedback] = useState<string | null>(null)

  // Uninstaller state
  const [programsList, setProgramsList] = useState<InstalledProgramInfo[]>([])
  const [loadingPrograms, setLoadingPrograms] = useState(false)
  const [uninstallerFeedback, setUninstallerFeedback] = useState<string | null>(null)

  // Shredder state
  const [shredPath, setShredPath] = useState<string>('')
  const [shredding, setShredding] = useState(false)
  const [shredFeedback, setShredFeedback] = useState<string | null>(null)

  // Performance Monitor state
  const [perfSnapshot, setPerfSnapshot] = useState<PerformanceSnapshot | null>(null)
  const [loadingPerf, setLoadingPerf] = useState(false)
  const [perfFeedback, setPerfFeedback] = useState<string | null>(null)

  // History state
  const [historyList, setHistoryList] = useState<HistoryRecord[]>([])
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [historyFeedback, setHistoryFeedback] = useState<string | null>(null)

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

  const fetchTrimInfo = async () => {
    try {
      const data = await tauriApi.getTrimInfo()
      setTrimDrives(data)
    } catch (err) {
      console.error('TRIM error:', err)
    }
  }

  const handleRunTrim = async (driveLetter: string) => {
    try {
      const res = await tauriApi.runDiskTrim(driveLetter)
      setTrimFeedback(res)
      await fetchTrimInfo()
    } catch (err) {
      setTrimFeedback(`TRIM error: ${String(err)}`)
    }
  }

  const handleRunSfc = async () => {
    setRunningRepair('sfc')
    try {
      const res = await tauriApi.runSfcScan()
      setRepairResults((prev) => ({ ...prev, sfc: res }))
    } catch (err) {
      console.error('SFC error:', err)
    } finally {
      setRunningRepair(null)
    }
  }

  const handleRunDism = async () => {
    setRunningRepair('dism')
    try {
      const res = await tauriApi.runDismScan()
      setRepairResults((prev) => ({ ...prev, dism: res }))
    } catch (err) {
      console.error('DISM error:', err)
    } finally {
      setRunningRepair(null)
    }
  }

  const handleRunChkdsk = async (letter: string = 'C') => {
    setRunningRepair('chkdsk')
    try {
      const res = await tauriApi.runChkdskScan(letter)
      setRepairResults((prev) => ({ ...prev, chkdsk: res }))
    } catch (err) {
      console.error('CHKDSK error:', err)
    } finally {
      setRunningRepair(null)
    }
  }

  const fetchGameMode = async () => {
    try {
      const st = await tauriApi.getGameModeStatus()
      setGameStatus(st)
      const opts = await tauriApi.getGameOptimizations()
      setGameOpts(opts)
    } catch (err) {
      console.error('Game mode error:', err)
    }
  }

  const handleToggleGameMode = async () => {
    if (!gameStatus) return
    try {
      const next = !gameStatus.is_active
      const res = await tauriApi.toggleGameMode(next)
      setGameStatus(res)
      setGameFeedback(next ? 'Ultimate Game Mode Activated!' : 'Game Mode Deactivated.')
      await fetchGameMode()
    } catch (err) {
      setGameFeedback(`Game mode error: ${String(err)}`)
    }
  }

  const handleScanRegistry = async () => {
    setScanningRegistry(true)
    setRegistryFeedback(null)
    setSelectedRegistryIds(new Set())
    try {
      const res = await tauriApi.scanRegistryIssues()
      setRegistryIssues(res.issues)
      const ids = new Set(res.issues.map((i) => i.id))
      setSelectedRegistryIds(ids)
      setRegistryFeedback(`Found ${res.total_found} registry issues in ${res.duration_ms}ms`)
    } catch (err) {
      setRegistryFeedback(`Registry scan error: ${String(err)}`)
    } finally {
      setScanningRegistry(false)
    }
  }

  const handleFixSelectedRegistry = async () => {
    if (selectedRegistryIds.size === 0) return
    setFixingRegistry(true)
    try {
      const targets: [string, string][] = registryIssues
        .filter((i) => selectedRegistryIds.has(i.id))
        .map((i) => [i.key_path, i.value_name])

      const res = await tauriApi.fixRegistryTargets(targets)
      setRegistryFeedback(`Fixed ${res.fixed_count} registry entries successfully.`)
      await handleScanRegistry()
    } catch (err) {
      setRegistryFeedback(`Fix registry error: ${String(err)}`)
    } finally {
      setFixingRegistry(false)
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

  const fetchNetwork = async () => {
    try {
      const items = await tauriApi.getNetworkItems()
      setNetworkItems(items)
      const conns = await tauriApi.getActiveConnections()
      setActiveConns(conns)
    } catch (err) {
      console.error('Network fetch error:', err)
    }
  }

  const handleFlushDns = async () => {
    try {
      await tauriApi.flushDnsCache()
      setNetworkFeedback('Successfully flushed DNS Resolver Cache.')
    } catch (err) {
      setNetworkFeedback(`Flush DNS error: ${String(err)}`)
    }
  }

  const handleFlushArp = async () => {
    try {
      await tauriApi.flushArpCache()
      setNetworkFeedback('Successfully flushed ARP Protocol Table.')
    } catch (err) {
      setNetworkFeedback(`Flush ARP error: ${String(err)}`)
    }
  }

  const handleResetWinsock = async () => {
    try {
      await tauriApi.resetTcpStack()
      setNetworkFeedback('Successfully reset TCP/IP Stack (Winsock).')
    } catch (err) {
      setNetworkFeedback(`Winsock error: ${String(err)}`)
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

  const fetchPerformanceSnapshot = async () => {
    setLoadingPerf(true)
    try {
      const snap = await tauriApi.getPerformanceSnapshot()
      setPerfSnapshot(snap)
    } catch (err) {
      console.error('Performance snapshot error:', err)
    } finally {
      setLoadingPerf(false)
    }
  }

  const handleKillProcess = async (pid: number, name: string) => {
    try {
      await tauriApi.killProcess(pid)
      setPerfFeedback(`Terminated process ${name} (PID ${pid})`)
      await fetchPerformanceSnapshot()
    } catch (err) {
      setPerfFeedback(`Kill error: ${String(err)}`)
    }
  }

  const fetchHistory = async () => {
    setLoadingHistory(true)
    try {
      const records = await tauriApi.getHistoryRecords()
      setHistoryList(records)
    } catch (err) {
      console.error('History fetch error:', err)
    } finally {
      setLoadingHistory(false)
    }
  }

  const handleClearHistory = async () => {
    try {
      await tauriApi.clearHistoryRecords()
      setHistoryFeedback('History records cleared.')
      await fetchHistory()
    } catch (err) {
      setHistoryFeedback(`Clear error: ${String(err)}`)
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

  const handleChangeLanguage = (langCode: string) => {
    setCurrentLang(langCode)
    i18n.changeLanguage(langCode)
    setSettingsFeedback(`Language updated to ${langCode}`)
  }

  const handleToggleTheme = (mode: 'dark' | 'light') => {
    setThemeMode(mode)
    const root = document.documentElement
    root.classList.remove('dark', 'light')
    root.classList.add(mode)
    setSettingsFeedback(`Theme set to ${mode} mode`)
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
    <div className={`flex h-screen ${themeMode === 'dark' ? 'bg-[#0a0a10] text-[#e4e4e7]' : 'bg-gray-50 text-gray-900'} overflow-hidden font-sans`}>
      {/* Sidebar Navigation */}
      <aside className={`w-64 border-r ${themeMode === 'dark' ? 'border-[#1f2937]/50 bg-[#0f0f16]' : 'border-gray-200 bg-white'} flex flex-col justify-between p-4`}>
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
                setActiveTab('repair')
                if (trimDrives.length === 0) fetchTrimInfo()
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg font-medium text-sm transition cursor-pointer ${
                activeTab === 'repair'
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
              }`}
            >
              <Hammer className="w-4 h-4" />
              Disk Maintenance
            </button>
            <button
              onClick={() => {
                setActiveTab('game')
                if (!gameStatus) fetchGameMode()
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg font-medium text-sm transition cursor-pointer ${
                activeTab === 'game'
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
              }`}
            >
              <Gamepad2 className="w-4 h-4" />
              Game Mode
            </button>
            <button
              onClick={() => {
                setActiveTab('registry')
                if (registryIssues.length === 0 && !scanningRegistry) handleScanRegistry()
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg font-medium text-sm transition cursor-pointer ${
                activeTab === 'registry'
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
              }`}
            >
              <Database className="w-4 h-4" />
              Registry Fixer
            </button>
            <button
              onClick={() => {
                setActiveTab('network')
                if (networkItems.length === 0) fetchNetwork()
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg font-medium text-sm transition cursor-pointer ${
                activeTab === 'network'
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
              }`}
            >
              <Wifi className="w-4 h-4" />
              Network Optimizer
            </button>
            <button
              onClick={() => {
                setActiveTab('perf')
                if (!perfSnapshot && !loadingPerf) fetchPerformanceSnapshot()
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg font-medium text-sm transition cursor-pointer ${
                activeTab === 'perf'
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
              }`}
            >
              <Gauge className="w-4 h-4" />
              Performance Monitor
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
                setActiveTab('history')
                if (historyList.length === 0 && !loadingHistory) fetchHistory()
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg font-medium text-sm transition cursor-pointer ${
                activeTab === 'history'
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
              }`}
            >
              <History className="w-4 h-4" />
              Cleaning History
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
            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg font-medium text-sm transition cursor-pointer ${
                activeTab === 'settings'
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
              }`}
            >
              <Settings className="w-4 h-4" />
              Settings & i18n
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
        <header className={`h-14 border-b ${themeMode === 'dark' ? 'border-[#1f2937]/40 bg-[#0a0a10]/80' : 'border-gray-200 bg-white/80'} px-8 flex items-center justify-between backdrop-blur`}>
          <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            {activeTab === 'dashboard'
              ? 'System Overview & Health'
              : activeTab === 'cleaner'
              ? 'Deep System Cleaner (Rules-Engine)'
              : activeTab === 'duplicates'
              ? 'Multi-Stage Duplicate Finder (Czkawka Concept)'
              : activeTab === 'disk'
              ? 'Disk Space & Treemap Analyzer'
              : activeTab === 'repair'
              ? 'SSD TRIM & Filesystem Integrity Repair'
              : activeTab === 'game'
              ? 'Game Mode Latency & Power Optimization'
              : activeTab === 'registry'
              ? 'Windows Registry Orphan Cleaner'
              : activeTab === 'network'
              ? 'Network Cache & TCP/IP Stack Optimizer'
              : activeTab === 'perf'
              ? 'Real-Time Hardware & Process Performance Monitor'
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
              : activeTab === 'history'
              ? 'Cleaning History & Audit Trail (SQLite)'
              : activeTab === 'settings'
              ? 'Application Settings & Internationalization'
              : activeTab === 'malware'
              ? 'YARA & Heuristic Malware Scanner'
              : 'OS Privacy & Telemetry Shield'}
          </div>
          <div className="flex items-center gap-3">
            {activeTab === 'repair' ? (
              <button
                onClick={fetchTrimInfo}
                className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-md bg-white/[0.05] hover:bg-white/[0.08] text-zinc-300 transition cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Refresh Disks
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
        ) : activeTab === 'repair' ? (
          /* Disk Maintenance & Repair Page */
          <div className="p-8 max-w-6xl space-y-6">
            {/* TRIM Section */}
            <div className="p-6 rounded-2xl bg-[#16161a] border border-[#2a2a36] flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-white">SSD Storage TRIM Optimization</h2>
                <p className="text-xs text-zinc-400 mt-1">
                  {trimFeedback || 'Send ReTrim command to SSDs and NVMe drives to reclaim erased flash blocks.'}
                </p>
              </div>
              <button
                onClick={() => handleRunTrim('C')}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs transition cursor-pointer"
              >
                TRIM System Drive (C:)
              </button>
            </div>

            {/* System File & Disk Integrity Tools */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* SFC Tool */}
              <div className="p-5 rounded-xl bg-[#16161a] border border-[#2a2a36] space-y-3 flex flex-col justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-blue-400" />
                    <span className="text-sm font-semibold text-white">System File Checker (SFC)</span>
                  </div>
                  <p className="text-xs text-zinc-400">Verifies integrity of protected Windows OS system binaries.</p>
                </div>
                {repairResults.sfc && (
                  <div className="text-[11px] p-2 rounded bg-black/30 text-zinc-300 font-mono">
                    {repairResults.sfc.summary}
                  </div>
                )}
                <button
                  onClick={handleRunSfc}
                  disabled={runningRepair === 'sfc'}
                  className="w-full py-2 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-xs font-semibold text-white transition cursor-pointer"
                >
                  {runningRepair === 'sfc' ? 'Verifying Files...' : 'Run SFC Check'}
                </button>
              </div>

              {/* DISM Tool */}
              <div className="p-5 rounded-xl bg-[#16161a] border border-[#2a2a36] space-y-3 flex flex-col justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-purple-400" />
                    <span className="text-sm font-semibold text-white">DISM Component Store</span>
                  </div>
                  <p className="text-xs text-zinc-400">Checks Windows component store health and repairability.</p>
                </div>
                {repairResults.dism && (
                  <div className="text-[11px] p-2 rounded bg-black/30 text-zinc-300 font-mono">
                    {repairResults.dism.summary}
                  </div>
                )}
                <button
                  onClick={handleRunDism}
                  disabled={runningRepair === 'dism'}
                  className="w-full py-2 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-xs font-semibold text-white transition cursor-pointer"
                >
                  {runningRepair === 'dism' ? 'Checking Store...' : 'Run DISM Health Check'}
                </button>
              </div>

              {/* CHKDSK Tool */}
              <div className="p-5 rounded-xl bg-[#16161a] border border-[#2a2a36] space-y-3 flex flex-col justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <HardDrive className="w-4 h-4 text-emerald-400" />
                    <span className="text-sm font-semibold text-white">CHKDSK Volume Scan</span>
                  </div>
                  <p className="text-xs text-zinc-400">Scans volume filesystem metadata for corrupt sectors.</p>
                </div>
                {repairResults.chkdsk && (
                  <div className="text-[11px] p-2 rounded bg-black/30 text-zinc-300 font-mono">
                    {repairResults.chkdsk.summary}
                  </div>
                )}
                <button
                  onClick={() => handleRunChkdsk('C')}
                  disabled={runningRepair === 'chkdsk'}
                  className="w-full py-2 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-xs font-semibold text-white transition cursor-pointer"
                >
                  {runningRepair === 'chkdsk' ? 'Scanning Volume...' : 'Run CHKDSK Scan'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8 text-xs text-zinc-400">Section active</div>
        )}
      </main>
    </div>
  )
}
