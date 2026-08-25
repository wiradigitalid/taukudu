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
  ContextMenuEntryInfo,
  FirewallAuditSummary,
  CveScanSummary,
  SoftwareUpdateSummary,
  ScheduleSummary,
  BreachMonitorSummary,
  LeftoversScanResult,
  LeftoverFolderItem,
  RestorePointSummary,
  RestorePointItem,
  RecycleBinSummary,
  RecycleBinCleanResult,
  BlockerSummary,
  ProcessBlockerInfo,
  ThreatMonitorSummary,
  FlaggedConnection,
  BrowserCacheScanSummary,
  BrowserProfileCacheTarget,
  DeleteProbeSummary,
  DeletePathProbeResult,
  GranularDeletedFileEntry,
  DeletionLogStats,
  TrimHistorySummary,
  TrimRecord,
  AppSettings,
  CleanerConfig,
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
  Hammer,
  MousePointerClick,
  ShieldCheck,
  Flame,
  AlertOctagon,
  ArrowUpCircle,
  CalendarClock,
  Clock,
  Mail,
  UserCheck,
  Plus,
  FolderSearch,
  RotateCcw,
  BookmarkCheck,
  AlertTriangle,
  PowerOff,
  Radio,
  Compass,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { LANGUAGES } from '@/lib/languages'

export function App() {
  const { t, i18n } = useTranslation()
  const [activeTab, setActiveTab] = useState<'dashboard' | 'cleaner' | 'browsers' | 'recyclebin' | 'threats' | 'duplicates' | 'leftovers' | 'restore' | 'disk' | 'repair' | 'firewall' | 'cve' | 'breach' | 'updater' | 'schedules' | 'game' | 'contextmenu' | 'registry' | 'startup' | 'debloat' | 'services' | 'drivers' | 'network' | 'uninstaller' | 'shredder' | 'perf' | 'history' | 'settings' | 'malware' | 'privacy'>('dashboard')
  const [overview, setOverview] = useState<SystemOverview | null>(null)
  const [loadingOverview, setLoadingOverview] = useState(true)

  // Settings State
  const [themeMode, setThemeMode] = useState<'dark' | 'light'>('dark')
  const [currentLang, setCurrentLang] = useState<string>('en')
  const [appSettings, setAppSettings] = useState<AppSettings | null>(null)
  const [newExclusion, setNewExclusion] = useState('')
  const [settingsFeedback, setSettingsFeedback] = useState<string | null>(null)

  // Cleaner state
  const [scanning, setScanning] = useState(false)
  const [cleaning, setCleaning] = useState(false)
  const [scanResult, setScanResult] = useState<ScanResult | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [cleanStatus, setCleanStatus] = useState<string | null>(null)
  const [blockerSummary, setBlockerSummary] = useState<BlockerSummary | null>(null)
  const [checkingBlockers, setCheckingBlockers] = useState(false)
  const [probeSummary, setProbeSummary] = useState<DeleteProbeSummary | null>(null)
  const [probingAccess, setProbingAccess] = useState(false)

  // Browser Profile Caches state
  const [browserCaches, setBrowserCaches] = useState<BrowserCacheScanSummary | null>(null)
  const [loadingBrowserCaches, setLoadingBrowserCaches] = useState(false)
  const [browserFeedback, setBrowserFeedback] = useState<string | null>(null)

  // Recycle Bin state
  const [recycleSummary, setRecycleSummary] = useState<RecycleBinSummary | null>(null)
  const [loadingRecycle, setLoadingRecycle] = useState(false)
  const [emptyingRecycle, setEmptyingRecycle] = useState(false)
  const [recycleFeedback, setRecycleFeedback] = useState<string | null>(null)

  // Threat Monitor state
  const [threatSummary, setThreatSummary] = useState<ThreatMonitorSummary | null>(null)
  const [loadingThreats, setLoadingThreats] = useState(false)
  const [threatFeedback, setThreatFeedback] = useState<string | null>(null)
  const [newBlacklistCidr, setNewBlacklistCidr] = useState('')
  const [newBlacklistCat, setNewBlacklistCat] = useState('Suspicious Staging')

  // Duplicates state
  const [dupDir, setDupDir] = useState<string>('D:\\Developer\\wiradigital.id\\taukudu')
  const [dupScanning, setDupScanning] = useState(false)
  const [dupResult, setDupResult] = useState<DuplicateScanResult | null>(null)
  const [selectedDupPaths, setSelectedDupPaths] = useState<Set<string>>(new Set())
  const [dupStatus, setDupStatus] = useState<string | null>(null)

  // Uninstall Leftovers state
  const [leftoversScanning, setLeftoversScanning] = useState(false)
  const [leftoversResult, setLeftoversResult] = useState<LeftoversScanResult | null>(null)
  const [selectedLeftoverPaths, setSelectedLeftoverPaths] = useState<Set<string>>(new Set())
  const [leftoversFeedback, setLeftoversFeedback] = useState<string | null>(null)
  const [cleaningLeftovers, setCleaningLeftovers] = useState(false)

  // Restore Point state
  const [restoreSummary, setRestoreSummary] = useState<RestorePointSummary | null>(null)
  const [loadingRestore, setLoadingRestore] = useState(false)
  const [newRestoreDesc, setNewRestoreDesc] = useState('TauKudu System Optimization Checkpoint')
  const [creatingRestore, setCreatingRestore] = useState(false)
  const [restoreFeedback, setRestoreFeedback] = useState<string | null>(null)

  // Disk Analyzer state
  const [drives, setDrives] = useState<DiskDriveInfo[]>([])
  const [selectedDrivePath, setSelectedDrivePath] = useState<string>('D:\\')
  const [analyzingDisk, setAnalyzingDisk] = useState(false)
  const [diskAnalysis, setDiskAnalysis] = useState<DiskAnalysisResult | null>(null)

  // Disk Maintenance & Repair state
  const [trimDrives, setTrimDrives] = useState<TrimDriveStatus[]>([])
  const [trimHistory, setTrimHistory] = useState<TrimHistorySummary | null>(null)
  const [trimFeedback, setTrimFeedback] = useState<string | null>(null)
  const [runningRepair, setRunningRepair] = useState<string | null>(null)
  const [repairResults, setRepairResults] = useState<Record<string, DiskRepairOutput>>({})

  // Firewall Audit state
  const [firewallSummary, setFirewallSummary] = useState<FirewallAuditSummary | null>(null)
  const [loadingFirewall, setLoadingFirewall] = useState(false)
  const [firewallFeedback, setFirewallFeedback] = useState<string | null>(null)

  // CVE Vulnerability Scanner state
  const [cveSummary, setCveSummary] = useState<CveScanSummary | null>(null)
  const [loadingCve, setLoadingCve] = useState(false)

  // Breach Monitor state
  const [breachSummary, setBreachSummary] = useState<BreachMonitorSummary | null>(null)
  const [newEmail, setNewEmail] = useState<string>('')
  const [breachFeedback, setBreachFeedback] = useState<string | null>(null)

  // Software Updater state
  const [updateSummary, setUpdateSummary] = useState<SoftwareUpdateSummary | null>(null)
  const [loadingUpdates, setLoadingUpdates] = useState(false)
  const [updateFeedback, setUpdateFeedback] = useState<string | null>(null)

  // Schedules state
  const [scheduleSummary, setScheduleSummary] = useState<ScheduleSummary | null>(null)
  const [scheduleFeedback, setScheduleFeedback] = useState<string | null>(null)

  // Context Menu state
  const [ctxEntries, setCtxEntries] = useState<ContextMenuEntryInfo[]>([])
  const [loadingCtx, setLoadingCtx] = useState(false)
  const [ctxFeedback, setCtxFeedback] = useState<string | null>(null)

  // Game Mode state
  const [gameStatus, setGameStatus] = useState<GameModeStatus | null>(null)
  const [gameOpts, setGameOpts] = useState<GameOptimizationItem[]>([])
  const [customGames, setCustomGames] = useState<string[]>([])
  const [newCustomGame, setNewCustomGame] = useState('')
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

  // History & Deletion Log state
  const [historyList, setHistoryList] = useState<HistoryRecord[]>([])
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [historyFeedback, setHistoryFeedback] = useState<string | null>(null)
  const [granularLogs, setGranularLogs] = useState<GranularDeletedFileEntry[]>([])
  const [deletionLogStats, setDeletionLogStats] = useState<DeletionLogStats | null>(null)
  const [logSearchQuery, setLogSearchQuery] = useState('')
  const [activeHistoryView, setActiveHistoryView] = useState<'sessions' | 'files'>('sessions')

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
      // Check for process blockers
      const allPaths = result.categories.flatMap((c) => c.items.map((i) => i.path))
      const blockers = await tauriApi.checkCleanerBlockers(allPaths)
      setBlockerSummary(blockers)
    } catch (err) {
      console.error('Scan failed:', err)
      setCleanStatus('Scan failed: ' + String(err))
    } finally {
      setScanning(false)
    }
  }

  const handleCloseBlocker = async (pid: number, name: string) => {
    try {
      await tauriApi.closeCleanerBlocker(pid)
      setCleanStatus(`Closed blocking process: ${name}`)
      if (scanResult) {
        const allPaths = scanResult.categories.flatMap((c) => c.items.map((i) => i.path))
        const blockers = await tauriApi.checkCleanerBlockers(allPaths)
        setBlockerSummary(blockers)
      }
    } catch (err) {
      setCleanStatus(`Failed to close blocker: ${String(err)}`)
    }
  }

  const handleProbeAccess = async () => {
    if (!scanResult) return
    setProbingAccess(true)
    try {
      const allPaths = scanResult.categories.flatMap((c) => c.items.map((i) => i.path))
      const res = await tauriApi.probeDeleteAccess(allPaths)
      setProbeSummary(res)
      setCleanStatus(`Probed ${res.total_probed} paths: ${res.accessible_count} accessible, ${res.in_use_count} in-use, ${res.permission_denied_count} permission-denied`)
    } catch (err) {
      setCleanStatus(`Probe error: ${String(err)}`)
    } finally {
      setProbingAccess(false)
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

  const fetchRecycleBin = async () => {
    setLoadingRecycle(true)
    try {
      const res = await tauriApi.getRecycleBinSummary()
      setRecycleSummary(res)
    } catch (err) {
      console.error('Recycle bin fetch error:', err)
    } finally {
      setLoadingRecycle(false)
    }
  }

  const handleEmptyRecycleBin = async () => {
    setEmptyingRecycle(true)
    setRecycleFeedback(null)
    try {
      const res = await tauriApi.emptyRecycleBinFast()
      setRecycleFeedback(`Emptied ${res.payloads_deleted} files, reclaimed ${formatBytes(res.bytes_freed)}.`)
      await fetchRecycleBin()
    } catch (err) {
      console.error('Empty recycle bin error:', err)
      setRecycleFeedback('Emptying failed: ' + String(err))
    } finally {
      setEmptyingRecycle(false)
    }
  }

  const fetchThreats = async () => {
    setLoadingThreats(true)
    try {
      const res = await tauriApi.auditActiveThreats()
      setThreatSummary(res)
    } catch (err) {
      console.error('Audit threats error:', err)
    } finally {
      setLoadingThreats(false)
    }
  }

  const handleAddBlacklistCidr = async () => {
    if (!newBlacklistCidr) return
    try {
      const total = await tauriApi.addThreatBlacklistCidr(newBlacklistCidr, newBlacklistCat, 'Custom administrator blacklist rule')
      setThreatFeedback(`Added ${newBlacklistCidr} to threat blacklist (${total} active rules).`)
      setNewBlacklistCidr('')
      await fetchThreats()
    } catch (err) {
      setThreatFeedback(`Add CIDR error: ${String(err)}`)
    }
  }

  const handleTerminateThreat = async (pid: number, name: string) => {
    try {
      await tauriApi.terminateThreatProcess(pid)
      setThreatFeedback(`Terminated malicious/compromised process ${name} (PID: ${pid})`)
      await fetchThreats()
    } catch (err) {
      setThreatFeedback(`Terminate process error: ${String(err)}`)
    }
  }

  const fetchBrowserCaches = async () => {
    setLoadingBrowserCaches(true)
    try {
      const res = await tauriApi.discoverBrowserCacheTargets()
      setBrowserCaches(res)
    } catch (err) {
      console.error('Discover browser caches error:', err)
    } finally {
      setLoadingBrowserCaches(false)
    }
  }

  const handleCleanSingleBrowserCache = async (path: string, label: string) => {
    try {
      const res = await tauriApi.cleanTargets([path])
      setBrowserFeedback(`Cleaned ${label}: freed ${formatBytes(res.deleted_bytes)} (${res.deleted_files} files)`)
      await fetchBrowserCaches()
    } catch (err) {
      setBrowserFeedback(`Clean cache error: ${String(err)}`)
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

  const handleScanLeftovers = async () => {
    setLeftoversScanning(true)
    setLeftoversFeedback(null)
    setSelectedLeftoverPaths(new Set())
    try {
      const res = await tauriApi.scanUninstallLeftovers()
      setLeftoversResult(res)
      const toSelect = new Set<string>()
      res.items.forEach((i) => toSelect.add(i.path))
      setSelectedLeftoverPaths(toSelect)
      setLeftoversFeedback(`Found ${res.total_count} leftover folders (${formatBytes(res.total_size_bytes)}) in ${res.scan_duration_ms}ms`)
    } catch (err) {
      console.error('Leftovers scan error:', err)
      setLeftoversFeedback('Scan error: ' + String(err))
    } finally {
      setLeftoversScanning(false)
    }
  }

  const handleDeleteSelectedLeftovers = async () => {
    if (selectedLeftoverPaths.size === 0) return
    setCleaningLeftovers(true)
    try {
      const res = await tauriApi.deleteUninstallLeftovers(Array.from(selectedLeftoverPaths))
      setLeftoversFeedback(`Purged ${res.success_count} leftover folders, freed ${formatBytes(res.bytes_freed)}.`)
      await handleScanLeftovers()
    } catch (err) {
      console.error('Delete leftovers error:', err)
      setLeftoversFeedback('Deletion failed: ' + String(err))
    } finally {
      setCleaningLeftovers(false)
    }
  }

  const fetchRestorePoints = async () => {
    setLoadingRestore(true)
    try {
      const res = await tauriApi.getRestorePoints()
      setRestoreSummary(res)
    } catch (err) {
      console.error('Fetch restore points error:', err)
    } finally {
      setLoadingRestore(false)
    }
  }

  const handleCreateRestorePoint = async () => {
    if (!newRestoreDesc) return
    setCreatingRestore(true)
    setRestoreFeedback(null)
    try {
      const res = await tauriApi.createRestorePoint(newRestoreDesc)
      setRestoreFeedback(res.message)
      if (res.success) {
        await fetchRestorePoints()
      }
    } catch (err) {
      setRestoreFeedback(`Failed to create restore point: ${String(err)}`)
    } finally {
      setCreatingRestore(false)
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
      const hist = await tauriApi.getTrimHistorySummary()
      setTrimHistory(hist)
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

  const fetchFirewall = async () => {
    setLoadingFirewall(true)
    try {
      const sum = await tauriApi.auditFirewall()
      setFirewallSummary(sum)
    } catch (err) {
      console.error('Firewall audit error:', err)
    } finally {
      setLoadingFirewall(false)
    }
  }

  const handleToggleFirewallRule = async (rule: import('@/lib/tauri-bridge').FirewallRuleInfo) => {
    try {
      await tauriApi.toggleFirewallRule(rule.name, !rule.is_enabled)
      setFirewallFeedback(`Updated rule: ${rule.display_name}`)
      await fetchFirewall()
    } catch (err) {
      setFirewallFeedback(`Firewall error: ${String(err)}`)
    }
  }

  const fetchCveScan = async () => {
    setLoadingCve(true)
    try {
      const sum = await tauriApi.scanCves()
      setCveSummary(sum)
    } catch (err) {
      console.error('CVE scan error:', err)
    } finally {
      setLoadingCve(false)
    }
  }

  const fetchBreaches = async () => {
    try {
      const sum = await tauriApi.getBreachSummary()
      setBreachSummary(sum)
    } catch (err) {
      console.error('Breach summary error:', err)
    }
  }

  const handleAddEmail = async () => {
    if (!newEmail || !newEmail.includes('@')) return
    try {
      const sum = await tauriApi.addBreachEmail(newEmail)
      setBreachSummary(sum)
      setNewEmail('')
      setBreachFeedback(`Added ${newEmail} to monitored accounts`)
    } catch (err) {
      setBreachFeedback(`Add error: ${String(err)}`)
    }
  }

  const handleRemoveEmail = async (email: string) => {
    try {
      const sum = await tauriApi.removeBreachEmail(email)
      setBreachSummary(sum)
      setBreachFeedback(`Removed ${email} from monitoring`)
    } catch (err) {
      setBreachFeedback(`Remove error: ${String(err)}`)
    }
  }

  const handleAcknowledgeBreach = async (id: string) => {
    try {
      const sum = await tauriApi.acknowledgeBreachIncident(id)
      setBreachSummary(sum)
      setBreachFeedback('Acknowledged security incident.')
    } catch (err) {
      setBreachFeedback(`Acknowledge error: ${String(err)}`)
    }
  }

  const fetchSoftwareUpdates = async () => {
    setLoadingUpdates(true)
    try {
      const sum = await tauriApi.checkSoftwareUpdates()
      setUpdateSummary(sum)
    } catch (err) {
      console.error('Update check error:', err)
    } finally {
      setLoadingUpdates(false)
    }
  }

  const handleUpgradeAll = async () => {
    try {
      setUpdateFeedback('Triggering bulk upgrade via winget...')
      const res = await tauriApi.upgradeAllSoftwarePackages()
      setUpdateFeedback(`Updated ${res.updated_count} packages successfully!`)
      await fetchSoftwareUpdates()
    } catch (err) {
      setUpdateFeedback(`Upgrade error: ${String(err)}`)
    }
  }

  const handleUpgradeSingle = async (pkgId: string) => {
    try {
      setUpdateFeedback(`Upgrading ${pkgId}...`)
      await tauriApi.upgradeSoftwarePackage(pkgId)
      setUpdateFeedback(`Upgraded ${pkgId} successfully.`)
      await fetchSoftwareUpdates()
    } catch (err) {
      setUpdateFeedback(`Upgrade error: ${String(err)}`)
    }
  }

  const fetchSchedules = async () => {
    try {
      const sum = await tauriApi.getSchedules()
      setScheduleSummary(sum)
    } catch (err) {
      console.error('Schedules error:', err)
    }
  }

  const handleToggleSchedule = async (id: string, currentlyEnabled: boolean) => {
    try {
      await tauriApi.toggleSchedule(id, !currentlyEnabled)
      setScheduleFeedback(`Updated schedule ${id}`)
      await fetchSchedules()
    } catch (err) {
      setScheduleFeedback(`Schedule error: ${String(err)}`)
    }
  }

  const fetchContextMenu = async () => {
    setLoadingCtx(true)
    try {
      const res = await tauriApi.getContextMenuEntries()
      setCtxEntries(res.entries)
    } catch (err) {
      console.error('Context menu fetch error:', err)
    } finally {
      setLoadingCtx(false)
    }
  }

  const handleToggleContextMenu = async (item: ContextMenuEntryInfo) => {
    try {
      await tauriApi.toggleContextMenuEntry(item.key_path, !item.is_enabled)
      setCtxFeedback(`Updated context menu state for ${item.name}`)
      await fetchContextMenu()
    } catch (err) {
      setCtxFeedback(`Context menu error: ${String(err)}`)
    }
  }

  const fetchGameMode = async () => {
    try {
      const st = await tauriApi.getGameModeStatus()
      setGameStatus(st)
      const opts = await tauriApi.getGameOptimizations()
      setGameOpts(opts)
      const customs = await tauriApi.getCustomGameProcesses()
      setCustomGames(customs)
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

  const handleToggleAutoDetect = async () => {
    if (!gameStatus) return
    try {
      const res = await tauriApi.toggleGameAutoDetect(!gameStatus.auto_detect_enabled)
      setGameStatus(res)
      setGameFeedback(`Auto game detection ${res.auto_detect_enabled ? 'enabled' : 'disabled'}`)
    } catch (err) {
      setGameFeedback(`Auto detect error: ${String(err)}`)
    }
  }

  const handleAddCustomGame = async () => {
    if (!newCustomGame) return
    try {
      const updated = await tauriApi.addCustomGameProcess(newCustomGame)
      setCustomGames(updated)
      setNewCustomGame('')
      setGameFeedback(`Added ${newCustomGame} to custom games list`)
      await fetchGameMode()
    } catch (err) {
      setGameFeedback(`Add custom game error: ${String(err)}`)
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
      const stats = await tauriApi.getDeletionLogStats()
      setDeletionLogStats(stats)
      const logs = await tauriApi.queryDeletionLog(undefined, logSearchQuery, undefined, 200)
      setGranularLogs(logs)
    } catch (err) {
      console.error('History fetch error:', err)
    } finally {
      setLoadingHistory(false)
    }
  }

  const handleClearHistory = async () => {
    try {
      await tauriApi.clearHistoryRecords()
      await tauriApi.clearDeletionLog()
      setHistoryFeedback('All cleaning history and granular deletion audit logs cleared.')
      await fetchHistory()
    } catch (err) {
      setHistoryFeedback(`Clear error: ${String(err)}`)
    }
  }

  const handleSearchGranularLogs = async (query: string) => {
    setLogSearchQuery(query)
    try {
      const logs = await tauriApi.queryDeletionLog(undefined, query, undefined, 200)
      setGranularLogs(logs)
    } catch (err) {
      console.error('Search log error:', err)
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

  const fetchAppSettings = async () => {
    try {
      const s = await tauriApi.getAppSettings()
      setAppSettings(s)
      setThemeMode((s.theme as 'dark' | 'light') || 'dark')
      setCurrentLang(s.language || 'en')
    } catch (err) {
      console.error('Fetch settings error:', err)
    }
  }

  const handleUpdateCleanerSetting = async <K extends keyof CleanerConfig>(key: K, val: CleanerConfig[K]) => {
    if (!appSettings) return
    const next: AppSettings = {
      ...appSettings,
      cleaner: {
        ...appSettings.cleaner,
        [key]: val,
      },
    }
    try {
      const saved = await tauriApi.updateAppSettings(next)
      setAppSettings(saved)
      setSettingsFeedback(`Updated ${String(key)} setting.`)
    } catch (err) {
      setSettingsFeedback(`Update error: ${String(err)}`)
    }
  }

  const handleToggleSetting = async (key: keyof AppSettings, val: any) => {
    if (!appSettings) return
    const next: AppSettings = {
      ...appSettings,
      [key]: val,
    }
    try {
      const saved = await tauriApi.updateAppSettings(next)
      setAppSettings(saved)
      setSettingsFeedback(`Updated ${key} setting.`)
    } catch (err) {
      setSettingsFeedback(`Update error: ${String(err)}`)
    }
  }

  const handleAddExclusion = async () => {
    if (!newExclusion) return
    try {
      const updated = await tauriApi.addExclusionPath(newExclusion)
      if (appSettings) {
        setAppSettings({ ...appSettings, exclusions: updated })
      }
      setNewExclusion('')
      setSettingsFeedback(`Added exclusion: ${newExclusion}`)
    } catch (err) {
      setSettingsFeedback(`Add exclusion error: ${String(err)}`)
    }
  }

  const handleRemoveExclusion = async (path: string) => {
    try {
      const updated = await tauriApi.removeExclusionPath(path)
      if (appSettings) {
        setAppSettings({ ...appSettings, exclusions: updated })
      }
      setSettingsFeedback(`Removed exclusion: ${path}`)
    } catch (err) {
      setSettingsFeedback(`Remove exclusion error: ${String(err)}`)
    }
  }

  const handleChangeLanguage = (langCode: string) => {
    setCurrentLang(langCode)
    i18n.changeLanguage(langCode)
    handleToggleSetting('language', langCode)
    setSettingsFeedback(`Language updated to ${langCode}`)
  }

  const handleToggleTheme = (mode: 'dark' | 'light') => {
    setThemeMode(mode)
    const root = document.documentElement
    root.classList.remove('dark', 'light')
    root.classList.add(mode)
    handleToggleSetting('theme', mode)
    setSettingsFeedback(`Theme set to ${mode} mode`)
  }

  useEffect(() => {
    fetchOverview()
    fetchAppSettings()
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
                setActiveTab('browsers')
                if (!browserCaches && !loadingBrowserCaches) fetchBrowserCaches()
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg font-medium text-sm transition cursor-pointer ${
                activeTab === 'browsers'
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
              }`}
            >
              <Compass className="w-4 h-4" />
              Browser Caches
            </button>
            <button
              onClick={() => {
                setActiveTab('recyclebin')
                if (!recycleSummary && !loadingRecycle) fetchRecycleBin()
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg font-medium text-sm transition cursor-pointer ${
                activeTab === 'recyclebin'
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
              }`}
            >
              <Trash2 className="w-4 h-4" />
              Fast Recycle Bin
            </button>
            <button
              onClick={() => {
                setActiveTab('threats')
                if (!threatSummary && !loadingThreats) fetchThreats()
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg font-medium text-sm transition cursor-pointer ${
                activeTab === 'threats'
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
              }`}
            >
              <Radio className="w-4 h-4" />
              Live Threat Monitor
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
                setActiveTab('leftovers')
                if (!leftoversResult && !leftoversScanning) handleScanLeftovers()
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg font-medium text-sm transition cursor-pointer ${
                activeTab === 'leftovers'
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
              }`}
            >
              <FolderSearch className="w-4 h-4" />
              Uninstall Leftovers
            </button>
            <button
              onClick={() => {
                setActiveTab('restore')
                if (!restoreSummary && !loadingRestore) fetchRestorePoints()
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg font-medium text-sm transition cursor-pointer ${
                activeTab === 'restore'
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
              }`}
            >
              <RotateCcw className="w-4 h-4" />
              System Restore
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
                setActiveTab('firewall')
                if (!firewallSummary && !loadingFirewall) fetchFirewall()
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg font-medium text-sm transition cursor-pointer ${
                activeTab === 'firewall'
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
              }`}
            >
              <Flame className="w-4 h-4" />
              Firewall Audit
            </button>
            <button
              onClick={() => {
                setActiveTab('cve')
                if (!cveSummary && !loadingCve) fetchCveScan()
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg font-medium text-sm transition cursor-pointer ${
                activeTab === 'cve'
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
              }`}
            >
              <AlertOctagon className="w-4 h-4" />
              CVE Scanner
            </button>
            <button
              onClick={() => {
                setActiveTab('breach')
                if (!breachSummary) fetchBreaches()
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg font-medium text-sm transition cursor-pointer ${
                activeTab === 'breach'
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
              }`}
            >
              <Mail className="w-4 h-4" />
              Breach Monitor
            </button>
            <button
              onClick={() => {
                setActiveTab('updater')
                if (!updateSummary && !loadingUpdates) fetchSoftwareUpdates()
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg font-medium text-sm transition cursor-pointer ${
                activeTab === 'updater'
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
              }`}
            >
              <ArrowUpCircle className="w-4 h-4" />
              Software Updater
            </button>
            <button
              onClick={() => {
                setActiveTab('schedules')
                if (!scheduleSummary) fetchSchedules()
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg font-medium text-sm transition cursor-pointer ${
                activeTab === 'schedules'
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
              }`}
            >
              <CalendarClock className="w-4 h-4" />
              Schedules
            </button>
            <button
              onClick={() => {
                setActiveTab('contextmenu')
                if (ctxEntries.length === 0 && !loadingCtx) fetchContextMenu()
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg font-medium text-sm transition cursor-pointer ${
                activeTab === 'contextmenu'
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
              }`}
            >
              <MousePointerClick className="w-4 h-4" />
              Context Menu
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
              : activeTab === 'browsers'
              ? 'Chromium & Gecko Multi-Profile Browser Caches'
              : activeTab === 'recyclebin'
              ? 'Fast Recycle Bin Turbo Cleaner (Multi-Drive)'
              : activeTab === 'threats'
              ? 'Live C2 & Malicious Outbound Threat Monitor'
              : activeTab === 'duplicates'
              ? 'Multi-Stage Duplicate Finder (Czkawka Concept)'
              : activeTab === 'leftovers'
              ? 'Uninstalled Software Leftovers Cleaner'
              : activeTab === 'restore'
              ? 'Windows System Restore Points Management'
              : activeTab === 'disk'
              ? 'Disk Space & Treemap Analyzer'
              : activeTab === 'repair'
              ? 'SSD TRIM & Filesystem Integrity Repair'
              : activeTab === 'firewall'
              ? 'Windows Firewall & Open Port Security Audit'
              : activeTab === 'cve'
              ? 'System Vulnerability (CVE) Audit'
              : activeTab === 'breach'
              ? 'Account & Email Breach Exposure Monitor'
              : activeTab === 'updater'
              ? 'Bulk Desktop Software Updater (Winget/Choco/Scoop)'
              : activeTab === 'schedules'
              ? 'Automated Background Maintenance Schedules'
              : activeTab === 'contextmenu'
              ? 'Explorer Right-Click Context Menu Manager'
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
            {activeTab === 'browsers' ? (
              <button
                onClick={fetchBrowserCaches}
                className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-md bg-white/[0.05] hover:bg-white/[0.08] text-zinc-300 transition cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Rescan Browsers
              </button>
            ) : activeTab === 'recyclebin' ? (
              <button
                onClick={fetchRecycleBin}
                className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-md bg-white/[0.05] hover:bg-white/[0.08] text-zinc-300 transition cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Refresh Bin
              </button>
            ) : activeTab === 'threats' ? (
              <button
                onClick={fetchThreats}
                className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-md bg-white/[0.05] hover:bg-white/[0.08] text-zinc-300 transition cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Rescan Threats
              </button>
            ) : activeTab === 'leftovers' ? (
              <button
                onClick={handleScanLeftovers}
                className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-md bg-white/[0.05] hover:bg-white/[0.08] text-zinc-300 transition cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Rescan Leftovers
              </button>
            ) : activeTab === 'restore' ? (
              <button
                onClick={fetchRestorePoints}
                className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-md bg-white/[0.05] hover:bg-white/[0.08] text-zinc-300 transition cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Refresh Checkpoints
              </button>
            ) : activeTab === 'game' ? (
              <button
                onClick={fetchGameMode}
                className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-md bg-white/[0.05] hover:bg-white/[0.08] text-zinc-300 transition cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Refresh Game Status
              </button>
            ) : activeTab === 'history' ? (
              <button
                onClick={fetchHistory}
                className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-md bg-white/[0.05] hover:bg-white/[0.08] text-zinc-300 transition cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Refresh Logs
              </button>
            ) : activeTab === 'schedules' ? (
              <button
                onClick={fetchSchedules}
                className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-md bg-white/[0.05] hover:bg-white/[0.08] text-zinc-300 transition cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Refresh Schedules
              </button>
            ) : activeTab === 'breach' ? (
              <button
                onClick={fetchBreaches}
                className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-md bg-white/[0.05] hover:bg-white/[0.08] text-zinc-300 transition cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Check Exposures
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
        ) : activeTab === 'cleaner' ? (
          /* System Cleaner Page with Blocker Alert */
          <div className="p-8 max-w-6xl space-y-6">
            <div className="p-6 rounded-2xl bg-[#16161a] border border-[#2a2a36] flex justify-between items-center">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-bold text-white">
                    System Cleaner: {scanResult?.total_files || 0} Temporary Files Found
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    {formatBytes(scanResult?.total_bytes || 0)} Reclaimable
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mt-1">
                  {cleanStatus || 'Deep file cleaner powered by BleachBit CleanerML rules and ripgrep multi-threaded traversal.'}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleRunScan}
                  disabled={scanning}
                  className="px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] text-zinc-300 font-semibold text-xs transition flex items-center gap-2 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${scanning ? 'animate-spin' : ''}`} />
                  {scanning ? 'Scanning...' : 'Rescan System'}
                </button>
                <button
                  onClick={handleProbeAccess}
                  disabled={probingAccess || !scanResult || scanResult.total_files === 0}
                  className="px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] text-amber-400 font-semibold text-xs transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <ShieldCheck className={`w-3.5 h-3.5 ${probingAccess ? 'animate-spin' : ''}`} />
                  {probingAccess ? 'Probing Locks...' : 'Probe Access'}
                </button>
                <button
                  onClick={handleCleanNow}
                  disabled={cleaning || !scanResult || scanResult.total_files === 0}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition flex items-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer disabled:opacity-50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  {cleaning ? 'Cleaning...' : 'Clean All Now'}
                </button>
              </div>
            </div>

            {/* Active Process Blocker Warning Bar */}
            {blockerSummary && blockerSummary.has_blocking_processes && (
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-2">
                <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Active Processes Holding Cleaner Locks ({blockerSummary.total_blockers})</span>
                </div>
                <p className="text-[11px] text-zinc-300">
                  The following applications are currently open and may lock files from being cleaned. Close them to ensure a thorough cleaning:
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  {blockerSummary.blockers.map((b) => (
                    <div
                      key={b.pid}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/40 border border-amber-500/20 text-xs text-white"
                    >
                      <span className="font-semibold">{b.display_name}</span>
                      <span className="text-[10px] text-zinc-500 font-mono">(PID: {b.pid})</span>
                      <button
                        onClick={() => handleCloseBlocker(b.pid, b.display_name)}
                        className="ml-1 px-2 py-0.5 rounded bg-red-500/20 hover:bg-red-500/30 text-red-400 text-[10px] font-bold transition cursor-pointer flex items-center gap-1"
                      >
                        <PowerOff className="w-2.5 h-2.5" />
                        Close App
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Cleaner Categories Breakdown */}
            {scanResult && scanResult.categories.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {scanResult.categories.map((cat) => (
                  <div
                    key={cat.category}
                    className="p-4 rounded-xl bg-[#16161a] border border-[#2a2a36] space-y-2"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-bold text-white capitalize">{cat.category}</span>
                      <span className="text-xs font-mono font-bold text-amber-400">
                        {formatBytes(cat.total_bytes)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs text-zinc-400">
                      <span>{cat.total_files} junk files</span>
                      <span className="text-[10px] text-zinc-500">{cat.items.length} sub-rules applied</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center rounded-2xl bg-[#16161a] border border-[#2a2a36] space-y-3">
                <Sparkles className="w-8 h-8 text-zinc-600 mx-auto" />
                <p className="text-xs text-zinc-400">
                  {scanning ? 'Running deep parallel scan across system locations...' : 'System is clean. No temporary files detected.'}
                </p>
              </div>
            )}
          </div>
        ) : activeTab === 'browsers' ? (
          /* Browser Profile Caches Page */
          <div className="p-8 max-w-6xl space-y-6">
            <div className="p-6 rounded-2xl bg-[#16161a] border border-[#2a2a36] flex justify-between items-center">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-bold text-white">
                    Browser Profile Caches: {browserCaches?.browsers_detected.length || 0} Browsers Detected
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    {browserCaches?.total_targets || 0} Cache Targets
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mt-1">
                  {browserFeedback || `Detected installations: ${browserCaches?.browsers_detected.join(', ') || 'Scanning...'}`}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={fetchBrowserCaches}
                  disabled={loadingBrowserCaches}
                  className="px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] text-zinc-300 font-semibold text-xs transition flex items-center gap-2 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingBrowserCaches ? 'animate-spin' : ''}`} />
                  {loadingBrowserCaches ? 'Scanning...' : 'Rescan Profiles'}
                </button>
              </div>
            </div>

            {/* Browser Cache Targets List */}
            {browserCaches && browserCaches.targets.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {browserCaches.targets.map((t, idx) => (
                  <div
                    key={`${t.path}-${idx}`}
                    className={`p-4 rounded-xl border flex justify-between items-center transition ${
                      t.exists ? 'bg-[#16161a] border-[#2a2a36]' : 'bg-[#16161a]/40 border-white/[0.02]'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-white">{t.browser_name}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-800 text-zinc-300">
                          {t.profile_name}
                        </span>
                        <span className={`text-[10px] font-semibold ${t.exists ? 'text-emerald-400' : 'text-zinc-600'}`}>
                          {t.exists ? '• Present' : '• Empty'}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400">{t.cache_type}</p>
                      <p className="text-[10px] text-zinc-500 font-mono truncate max-w-sm">{t.path}</p>
                    </div>
                    {t.exists && (
                      <button
                        onClick={() => handleCleanSingleBrowserCache(t.path, `${t.browser_name} (${t.profile_name})`)}
                        className="px-3 py-1.5 rounded-lg bg-white/[0.05] hover:bg-red-500/20 hover:text-red-400 text-xs font-semibold transition cursor-pointer flex items-center gap-1.5"
                      >
                        <Trash2 className="w-3 h-3" />
                        Clean
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center rounded-2xl bg-[#16161a] border border-[#2a2a36] space-y-3">
                <Compass className="w-8 h-8 text-zinc-600 mx-auto" />
                <p className="text-xs text-zinc-400">
                  {loadingBrowserCaches ? 'Enumerating Chromium & Gecko browser profiles...' : 'No active browser cache directories found.'}
                </p>
              </div>
            )}
          </div>
        ) : activeTab === 'recyclebin' ? (
          /* Fast Recycle Bin Page */
          <div className="p-8 max-w-6xl space-y-6">
            <div className="p-6 rounded-2xl bg-[#16161a] border border-[#2a2a36] flex justify-between items-center">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-bold text-white">
                    Recycle Bin: {recycleSummary?.total_items || 0} Deleted Items ({formatBytes(recycleSummary?.total_bytes || 0)})
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {recycleSummary?.drives.length || 0} Drives Detected
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mt-1">
                  {recycleFeedback || 'Direct multi-drive $Recycle.Bin fast unlink without slow Explorer COM walk.'}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={fetchRecycleBin}
                  disabled={loadingRecycle}
                  className="px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] text-zinc-300 font-semibold text-xs transition flex items-center gap-2 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingRecycle ? 'animate-spin' : ''}`} />
                  {loadingRecycle ? 'Inspecting...' : 'Inspect Bin'}
                </button>
                <button
                  onClick={handleEmptyRecycleBin}
                  disabled={emptyingRecycle || (recycleSummary?.total_items === 0)}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs transition flex items-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer disabled:opacity-50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  {emptyingRecycle ? 'Emptying...' : 'Empty Recycle Bin Now'}
                </button>
              </div>
            </div>

            {/* Per-Drive Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recycleSummary?.drives.map((d) => (
                <div key={d.drive_letter} className="p-5 rounded-xl bg-[#16161a] border border-[#2a2a36] space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-white">Drive ({d.drive_letter}:)</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${d.is_accessible ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                      {d.is_accessible ? 'Ready' : 'Access Denied'}
                    </span>
                  </div>
                  <div className="text-lg font-mono font-bold text-amber-400">
                    {formatBytes(d.total_bytes)}
                  </div>
                  <p className="text-xs text-zinc-400">
                    {d.items_count} deleted payload files
                  </p>
                  <p className="text-[10px] text-zinc-500 font-mono truncate">
                    {d.path}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ) : activeTab === 'threats' ? (
          /* Live Outbound Threat Monitor Page */
          <div className="p-8 max-w-6xl space-y-6">
            <div className="p-6 rounded-2xl bg-[#16161a] border border-[#2a2a36] flex justify-between items-center">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-bold text-white">
                    Live Threat Monitor: {threatSummary?.flagged_threats_count || 0} Suspicious Outbound Sockets
                  </h2>
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                    (threatSummary?.flagged_threats_count || 0) > 0
                      ? 'bg-red-500/10 text-red-400 border-red-500/20 animate-pulse'
                      : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  }`}>
                    {(threatSummary?.flagged_threats_count || 0) > 0 ? 'Threat Detected' : 'All Sockets Clean'}
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mt-1">
                  {threatFeedback || `Audited ${threatSummary?.total_connections_scanned || 0} active TCP connections against ${threatSummary?.monitored_blacklist_entries || 0} C2, Tor, and Botnet CIDR ranges.`}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={fetchThreats}
                  disabled={loadingThreats}
                  className="px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] text-zinc-300 font-semibold text-xs transition flex items-center gap-2 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingThreats ? 'animate-spin' : ''}`} />
                  {loadingThreats ? 'Auditing...' : 'Rescan Sockets'}
                </button>
              </div>
            </div>

            {/* Add Blacklist CIDR Form */}
            <div className="p-5 rounded-xl bg-[#16161a] border border-[#2a2a36] space-y-3">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-red-400" />
                Add Threat Intelligence Range (CIDR)
              </h3>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={newBlacklistCidr}
                  onChange={(e) => setNewBlacklistCidr(e.target.value)}
                  placeholder="Enter IPv4 CIDR (e.g. 198.51.100.0/24)..."
                  className="flex-1 px-3 py-2 rounded-lg bg-black/40 border border-zinc-700 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                />
                <input
                  type="text"
                  value={newBlacklistCat}
                  onChange={(e) => setNewBlacklistCat(e.target.value)}
                  placeholder="Threat category..."
                  className="w-48 px-3 py-2 rounded-lg bg-black/40 border border-zinc-700 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                />
                <button
                  onClick={handleAddBlacklistCidr}
                  className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-400 text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Blacklist Rule
                </button>
              </div>
            </div>

            {/* Flagged Connections List */}
            {threatSummary && threatSummary.flagged_connections.length > 0 ? (
              <div className="space-y-3">
                {threatSummary.flagged_connections.map((fc) => (
                  <div
                    key={fc.id}
                    className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex justify-between items-center"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2.5">
                        <span className="text-sm font-bold text-red-400">{fc.process_name}</span>
                        <span className="text-[10px] font-mono text-zinc-400">(PID: {fc.pid})</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-red-500/20 text-red-300">
                          {fc.threat_category}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-300">
                        Destination: <span className="font-mono text-amber-400">{fc.remote_addr}</span> — Reason: {fc.risk_reason}
                      </p>
                    </div>
                    <button
                      onClick={() => handleTerminateThreat(fc.pid, fc.process_name)}
                      className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition cursor-pointer flex items-center gap-1 shadow-lg shadow-red-600/20"
                    >
                      <PowerOff className="w-3.5 h-3.5" />
                      Terminate Process
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center rounded-2xl bg-[#16161a] border border-[#2a2a36] space-y-3">
                <ShieldCheck className="w-8 h-8 text-emerald-500 mx-auto" />
                <p className="text-xs text-zinc-400">
                  {loadingThreats ? 'Auditing active sockets against threat intelligence database...' : 'No suspicious C2 or malicious outbound network connections detected.'}
                </p>
              </div>
            )}
          </div>
        ) : activeTab === 'leftovers' ? (
          /* Uninstall Leftovers Page */
          <div className="p-8 max-w-6xl space-y-6">
            <div className="p-6 rounded-2xl bg-[#16161a] border border-[#2a2a36] flex justify-between items-center">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-bold text-white">
                    Uninstalled Software Leftovers: {leftoversResult?.total_count || 0} Orphan Folders
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    {formatBytes(leftoversResult?.total_size_bytes || 0)} Reclaimable
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mt-1">
                  {leftoversFeedback || 'Scans AppData, LocalAppData, ProgramData, and Program Files for leftover directories from uninstalled apps.'}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleScanLeftovers}
                  disabled={leftoversScanning}
                  className="px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] text-zinc-300 font-semibold text-xs transition flex items-center gap-2 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${leftoversScanning ? 'animate-spin' : ''}`} />
                  {leftoversScanning ? 'Scanning...' : 'Scan Leftovers'}
                </button>
                <button
                  onClick={handleDeleteSelectedLeftovers}
                  disabled={cleaningLeftovers || selectedLeftoverPaths.size === 0}
                  className="px-4 py-2 rounded-xl bg-red-500 hover:bg-red-400 text-white font-semibold text-xs transition flex items-center gap-2 shadow-lg shadow-red-500/20 cursor-pointer disabled:opacity-50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  {cleaningLeftovers ? 'Purging...' : `Purge Selected (${selectedLeftoverPaths.size})`}
                </button>
              </div>
            </div>

            {leftoversResult && leftoversResult.items.length > 0 ? (
              <div className="space-y-2">
                {leftoversResult.items.map((item) => (
                  <div
                    key={item.id}
                    className={`p-4 rounded-xl border flex justify-between items-center transition ${
                      selectedLeftoverPaths.has(item.path) ? 'bg-[#16161a] border-amber-500/30' : 'bg-[#16161a] border-[#2a2a36]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={selectedLeftoverPaths.has(item.path)}
                        onChange={(e) => {
                          const next = new Set(selectedLeftoverPaths)
                          if (e.target.checked) next.add(item.path)
                          else next.delete(item.path)
                          setSelectedLeftoverPaths(next)
                        }}
                        className="rounded border-zinc-700 text-amber-500 focus:ring-amber-500 cursor-pointer"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-white">{item.folder_name}</span>
                          <span className="text-[10px] font-mono text-zinc-500">({item.file_count} files)</span>
                        </div>
                        <p className="text-[11px] text-zinc-400 font-mono mt-0.5">{item.path}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-mono font-bold text-amber-400">{formatBytes(item.size_bytes)}</span>
                      <p className="text-[10px] text-zinc-500">Orphan directory</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center rounded-2xl bg-[#16161a] border border-[#2a2a36] space-y-3">
                <FolderSearch className="w-8 h-8 text-zinc-600 mx-auto" />
                <p className="text-xs text-zinc-400">
                  {leftoversScanning ? 'Scanning system directories for orphaned leftover folders...' : 'No uninstall leftover folders found.'}
                </p>
              </div>
            )}
          </div>
        ) : activeTab === 'restore' ? (
          /* System Restore Points Page */
          <div className="p-8 max-w-6xl space-y-6">
            <div className="p-6 rounded-2xl bg-[#16161a] border border-[#2a2a36] flex justify-between items-center">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-bold text-white">
                    Windows System Restore Points ({restoreSummary?.total_count || 0})
                  </h2>
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                    restoreSummary?.is_protection_enabled
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                  }`}>
                    {restoreSummary?.is_protection_enabled ? 'Protection Active' : 'Protection Check Required'}
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mt-1">
                  {restoreFeedback || 'Create snapshot recovery checkpoints before aggressive system optimization, deep cleaning, or driver purges.'}
                </p>
              </div>
            </div>

            {/* Create Restore Point Form */}
            <div className="p-5 rounded-xl bg-[#16161a] border border-[#2a2a36] space-y-3">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <BookmarkCheck className="w-4 h-4 text-amber-500" />
                Create New Checkpoint
              </h3>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={newRestoreDesc}
                  onChange={(e) => setNewRestoreDesc(e.target.value)}
                  placeholder="Enter restore point description..."
                  className="flex-1 px-3 py-2 rounded-lg bg-black/40 border border-zinc-700 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                />
                <button
                  onClick={handleCreateRestorePoint}
                  disabled={creatingRestore || !newRestoreDesc}
                  className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-xs font-semibold flex items-center gap-2 transition cursor-pointer disabled:opacity-50"
                >
                  <RotateCcw className={`w-3.5 h-3.5 ${creatingRestore ? 'animate-spin' : ''}`} />
                  {creatingRestore ? 'Creating Checkpoint...' : 'Create Restore Point'}
                </button>
              </div>
            </div>

            {/* Existing restore points */}
            {restoreSummary && restoreSummary.restore_points.length > 0 ? (
              <div className="space-y-2">
                {restoreSummary.restore_points.map((pt) => (
                  <div
                    key={pt.sequence_number}
                    className="p-4 rounded-xl bg-[#16161a] border border-[#2a2a36] flex justify-between items-center"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2.5">
                        <span className="text-xs font-mono text-zinc-500">#{pt.sequence_number}</span>
                        <span className="text-sm font-semibold text-white">{pt.description}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-zinc-800 text-zinc-300">
                          {pt.restore_point_type}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400 font-mono">
                        Created: {pt.creation_time || 'System Checkpoint'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center rounded-2xl bg-[#16161a] border border-[#2a2a36] space-y-3">
                <RotateCcw className="w-8 h-8 text-zinc-600 mx-auto" />
                <p className="text-xs text-zinc-400">
                  {loadingRestore ? 'Querying Windows System Restore points...' : 'No system restore points recorded yet.'}
                </p>
              </div>
            )}
          </div>
        ) : activeTab === 'schedules' ? (
          /* Schedules Page */
          <div className="p-8 max-w-6xl space-y-6">
            <div className="p-6 rounded-2xl bg-[#16161a] border border-[#2a2a36] flex justify-between items-center">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-bold text-white">Automated Scan & Clean Schedules</h2>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {scheduleSummary?.active_count || 0} / {scheduleSummary?.total_schedules || 0} Active
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mt-1">
                  {scheduleFeedback || `Next scheduled run: ${scheduleSummary?.next_scheduled_run || 'None configured'}`}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {scheduleSummary?.schedules.map((s) => (
                <div
                  key={s.id}
                  className={`p-4 rounded-xl border flex justify-between items-center transition ${
                    s.is_enabled ? 'bg-[#16161a] border-emerald-500/30' : 'bg-[#16161a] border-[#2a2a36]'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <span className="text-sm font-semibold text-white">{s.name}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-zinc-800 text-zinc-300">
                        {s.frequency}
                      </span>
                      <span className="text-xs font-mono text-zinc-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {String(s.hour).padStart(2, '0')}:{String(s.minute).padStart(2, '0')}
                      </span>
                      {s.auto_clean && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          Auto-Clean
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-400">
                      Categories: {s.categories.join(', ')}
                    </p>
                  </div>

                  <button
                    onClick={() => handleToggleSchedule(s.id, s.is_enabled)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                      s.is_enabled
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-zinc-800 text-zinc-400'
                    }`}
                  >
                    {s.is_enabled ? 'Active' : 'Disabled'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : activeTab === 'breach' ? (
          /* Breach Monitor Page */
          <div className="p-8 max-w-6xl space-y-6">
            <div className="p-6 rounded-2xl bg-[#16161a] border border-[#2a2a36] flex justify-between items-center">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-bold text-white">
                    Credential Exposures: {breachSummary?.unacknowledged_count || 0} Unacknowledged Incidents
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    {breachSummary?.total_emails || 0} Accounts Monitored
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mt-1">
                  {breachFeedback || 'Track whether your email addresses or accounts have appeared in known corporate data exposures.'}
                </p>
              </div>
            </div>

            {/* Add Email input */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-[#16161a] border border-[#2a2a36]">
              <Mail className="w-4 h-4 text-zinc-400" />
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="Add email address to monitor (e.g. name@domain.com)..."
                className="flex-1 bg-transparent border-none text-xs text-zinc-200 focus:outline-none"
              />
              <button
                onClick={handleAddEmail}
                className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Email
              </button>
            </div>

            {/* Monitored accounts list */}
            <div className="space-y-4">
              {breachSummary?.monitored_emails.map((acc) => (
                <div key={acc.email} className="p-5 rounded-xl bg-[#16161a] border border-[#2a2a36] space-y-3">
                  <div className="flex justify-between items-center pb-2 border-b border-white/[0.05]">
                    <div className="flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-emerald-400" />
                      <span className="text-sm font-bold text-white">{acc.email}</span>
                      <span className="text-[10px] text-zinc-500">Monitored since {acc.added_at}</span>
                    </div>
                    <button
                      onClick={() => handleRemoveEmail(acc.email)}
                      className="text-xs text-zinc-500 hover:text-red-400 transition cursor-pointer"
                    >
                      Stop Monitoring
                    </button>
                  </div>

                  {acc.breaches.length > 0 ? (
                    <div className="space-y-2">
                      {acc.breaches.map((b) => (
                        <div
                          key={b.id}
                          className={`p-3 rounded-lg border flex justify-between items-center text-xs ${
                            b.is_acknowledged ? 'bg-black/20 border-white/[0.03]' : 'bg-red-500/10 border-red-500/30'
                          }`}
                        >
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-white">{b.title}</span>
                              <span className="font-mono text-[10px] text-zinc-400">({b.domain})</span>
                              <span className="text-[10px] text-zinc-500">Date: {b.breach_date}</span>
                            </div>
                            <p className="text-xs text-zinc-400">
                              Compromised data: {b.compromised_data.join(', ')}
                            </p>
                          </div>

                          {!b.is_acknowledged ? (
                            <button
                              onClick={() => handleAcknowledgeBreach(b.id)}
                              className="px-3 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/30 font-semibold text-[11px] transition cursor-pointer"
                            >
                              Acknowledge
                            </button>
                          ) : (
                            <span className="text-[11px] text-zinc-500 font-mono">Acknowledged</span>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-4 text-center text-xs text-zinc-500">
                      No security breach exposures found for this account.
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : activeTab === 'game' ? (
          /* Game Mode Page */
          <div className="p-8 max-w-6xl space-y-6">
            <div className="p-6 rounded-2xl bg-[#16161a] border border-[#2a2a36] flex justify-between items-center">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-bold text-white">
                    Ultimate Game Mode & Latency Optimizer
                  </h2>
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                    gameStatus?.is_active
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse'
                      : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                  }`}>
                    {gameStatus?.is_active ? 'Game Mode Active' : 'Normal Desktop Mode'}
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mt-1">
                  {gameFeedback || `Power plan: ${gameStatus?.active_power_plan || 'Balanced'}`}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleToggleGameMode}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-lg ${
                    gameStatus?.is_active
                      ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700'
                      : 'bg-amber-500 hover:bg-amber-400 text-black shadow-amber-500/20'
                  }`}
                >
                  <Gamepad2 className="w-4 h-4" />
                  {gameStatus?.is_active ? 'Deactivate Game Mode' : 'Activate Ultimate Game Mode'}
                </button>
              </div>
            </div>

            {/* Live Game Detection Status */}
            <div className="p-5 rounded-xl bg-[#16161a] border border-[#2a2a36] flex justify-between items-center">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm font-semibold text-white">Automatic Game Detection</span>
                  {gameStatus?.detected_game && (
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono">
                      Running: {gameStatus.detected_game}
                    </span>
                  )}
                </div>
                <p className="text-xs text-zinc-400">
                  Monitors active foreground games (Steam, Riot, Blizzard, Epic, EA) and automatically tunes latency.
                </p>
              </div>
              <button
                onClick={handleToggleAutoDetect}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  gameStatus?.auto_detect_enabled
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-zinc-800 text-zinc-400'
                }`}
              >
                {gameStatus?.auto_detect_enabled ? 'Auto-Detect ON' : 'Auto-Detect OFF'}
              </button>
            </div>

            {/* Custom Game Process Input */}
            <div className="p-5 rounded-xl bg-[#16161a] border border-[#2a2a36] space-y-3">
              <h3 className="text-sm font-semibold text-white">Custom Game Executables</h3>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={newCustomGame}
                  onChange={(e) => setNewCustomGame(e.target.value)}
                  placeholder="Add custom game executable (e.g. game.exe)..."
                  className="flex-1 px-3 py-2 rounded-lg bg-black/40 border border-zinc-700 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                />
                <button
                  onClick={handleAddCustomGame}
                  className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Custom Game
                </button>
              </div>
              {customGames.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {customGames.map((cg) => (
                    <span key={cg} className="px-2.5 py-1 rounded bg-black/30 border border-zinc-700 text-xs text-zinc-300 font-mono">
                      {cg}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Applied Optimizations List */}
            <div className="space-y-3">
              {gameOpts.map((opt) => (
                <div
                  key={opt.id}
                  className={`p-4 rounded-xl border flex justify-between items-center ${
                    opt.is_applied ? 'bg-[#16161a] border-amber-500/30' : 'bg-[#16161a] border-[#2a2a36]'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-white">{opt.title}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-zinc-800 text-zinc-300">
                        {opt.category}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400">{opt.description}</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                    opt.is_applied ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'text-zinc-500'
                  }`}>
                    {opt.is_applied ? 'Optimized' : 'Inactive'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : activeTab === 'history' ? (
          /* Cleaning History & Granular Deletion Log Page */
          <div className="p-8 max-w-6xl space-y-6">
            <div className="p-6 rounded-2xl bg-[#16161a] border border-[#2a2a36] flex justify-between items-center">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-bold text-white">
                    Cleaning History & File Deletion Ledger
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {historyList.length} Sessions Logged ({deletionLogStats?.total_logged_files || 0} Files)
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mt-1">
                  {historyFeedback || `SQLite Audit Store + JSONL ledger (${formatBytes(deletionLogStats?.log_file_size_bytes || 0)} audit file size).`}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleClearHistory}
                  disabled={historyList.length === 0 && (deletionLogStats?.total_logged_files === 0)}
                  className="px-4 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-400 font-semibold text-xs transition flex items-center gap-2 border border-red-500/30 cursor-pointer disabled:opacity-50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Clear All History & Logs
                </button>
              </div>
            </div>

            {/* View Switcher Tabs */}
            <div className="flex border-b border-[#2a2a36] gap-6 text-sm font-semibold">
              <button
                onClick={() => setActiveHistoryView('sessions')}
                className={`pb-3 transition cursor-pointer flex items-center gap-2 ${
                  activeHistoryView === 'sessions'
                    ? 'text-amber-400 border-b-2 border-amber-400'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <History className="w-4 h-4" />
                Session History ({historyList.length})
              </button>
              <button
                onClick={() => setActiveHistoryView('files')}
                className={`pb-3 transition cursor-pointer flex items-center gap-2 ${
                  activeHistoryView === 'files'
                    ? 'text-amber-400 border-b-2 border-amber-400'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <FileCode className="w-4 h-4" />
                Granular File Ledger ({granularLogs.length})
              </button>
            </div>

            {activeHistoryView === 'sessions' ? (
              /* Session Cards */
              historyList.length > 0 ? (
                <div className="space-y-3">
                  {historyList.map((rec) => (
                    <div
                      key={rec.id}
                      className="p-4 rounded-xl bg-[#16161a] border border-[#2a2a36] flex justify-between items-center"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2.5">
                          <span className="text-sm font-bold text-white">{rec.details_summary}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-zinc-800 text-zinc-300">
                            {rec.action_type}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-400">
                          Timestamp: {rec.timestamp} • Duration: {rec.duration_ms}ms
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-bold text-amber-400 font-mono">
                          {formatBytes(rec.total_space_saved_bytes)}
                        </span>
                        <p className="text-[10px] text-zinc-500">{rec.total_items_cleaned} items deleted</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center rounded-2xl bg-[#16161a] border border-[#2a2a36] space-y-3">
                  <History className="w-8 h-8 text-zinc-600 mx-auto" />
                  <p className="text-xs text-zinc-400">
                    {loadingHistory ? 'Loading session records from SQLite store...' : 'No cleaning history records found.'}
                  </p>
                </div>
              )
            ) : (
              /* Granular Files Ledger */
              <div className="space-y-4">
                <input
                  type="text"
                  value={logSearchQuery}
                  onChange={(e) => handleSearchGranularLogs(e.target.value)}
                  placeholder="Search deleted file path or category in audit ledger..."
                  className="w-full px-3 py-2 rounded-lg bg-black/40 border border-zinc-700 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                />

                {granularLogs.length > 0 ? (
                  <div className="space-y-2">
                    {granularLogs.map((entry) => (
                      <div
                        key={entry.id}
                        className="p-3 rounded-lg bg-[#16161a] border border-white/[0.04] flex justify-between items-center text-xs"
                      >
                        <div className="space-y-0.5 truncate max-w-2xl">
                          <div className="flex items-center gap-2">
                            <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-[10px] font-mono text-zinc-300">
                              {entry.cleaner_category}
                            </span>
                            <span className="font-mono text-zinc-300 truncate">{entry.path}</span>
                          </div>
                          <p className="text-[10px] text-zinc-500 font-mono">Session: {entry.session_id}</p>
                        </div>
                        <span className="text-[10px] text-zinc-500 font-mono shrink-0">{entry.timestamp}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-12 text-center rounded-2xl bg-[#16161a] border border-[#2a2a36] space-y-3">
                    <FileCode className="w-8 h-8 text-zinc-600 mx-auto" />
                    <p className="text-xs text-zinc-400">No granular file deletion entries matched the query.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : activeTab === 'settings' ? (
          /* Settings & Preferences Page */
          <div className="p-8 max-w-5xl space-y-6">
            <div className="p-6 rounded-2xl bg-[#16161a] border border-[#2a2a36] flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-white">Application Settings & Preferences</h2>
                <p className="text-xs text-zinc-400 mt-1">
                  {settingsFeedback || 'Configure theme, internationalization language, cleaner policies, and path exclusions.'}
                </p>
              </div>
            </div>

            {/* General & UI Preferences */}
            <div className="p-6 rounded-2xl bg-[#16161a] border border-[#2a2a36] space-y-4">
              <h3 className="text-sm font-semibold text-white">Appearance & Localization</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Theme Selector */}
                <div className="p-4 rounded-xl bg-black/40 border border-zinc-800 space-y-2">
                  <span className="text-xs font-semibold text-zinc-300">Theme Mode</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleToggleTheme('dark')}
                      className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer ${
                        themeMode === 'dark'
                          ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                          : 'bg-zinc-800 text-zinc-400 hover:text-white'
                      }`}
                    >
                      <Moon className="w-3.5 h-3.5" />
                      Dark Theme
                    </button>
                    <button
                      onClick={() => handleToggleTheme('light')}
                      className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer ${
                        themeMode === 'light'
                          ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                          : 'bg-zinc-800 text-zinc-400 hover:text-white'
                      }`}
                    >
                      <Sun className="w-3.5 h-3.5" />
                      Light Theme
                    </button>
                  </div>
                </div>

                {/* Language Selector */}
                <div className="p-4 rounded-xl bg-black/40 border border-zinc-800 space-y-2">
                  <span className="text-xs font-semibold text-zinc-300">Display Language</span>
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-amber-500" />
                    <select
                      value={currentLang}
                      onChange={(e) => handleChangeLanguage(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-xs text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                    >
                      {LANGUAGES.map((lang) => (
                        <option key={lang.code} value={lang.code}>
                          {lang.name} ({lang.nativeName})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Cleaner Policy Toggles */}
            <div className="p-6 rounded-2xl bg-[#16161a] border border-[#2a2a36] space-y-3">
              <h3 className="text-sm font-semibold text-white">Cleaner Engine Safeguards</h3>
              <div className="space-y-2">
                <label className="flex items-center justify-between p-3 rounded-xl bg-black/30 border border-white/[0.03] cursor-pointer">
                  <span className="text-xs text-zinc-300">Close active browsers automatically before cleaning cache</span>
                  <input
                    type="checkbox"
                    checked={appSettings?.cleaner.close_browsers_before_clean || false}
                    onChange={(e) => handleUpdateCleanerSetting('close_browsers_before_clean', e.target.checked)}
                    className="rounded border-zinc-700 text-amber-500 focus:ring-amber-500 cursor-pointer"
                  />
                </label>
                <label className="flex items-center justify-between p-3 rounded-xl bg-black/30 border border-white/[0.03] cursor-pointer">
                  <span className="text-xs text-zinc-300">Create Windows System Restore Point checkpoint before cleaning</span>
                  <input
                    type="checkbox"
                    checked={appSettings?.cleaner.create_restore_point_before_clean || false}
                    onChange={(e) => handleUpdateCleanerSetting('create_restore_point_before_clean', e.target.checked)}
                    className="rounded border-zinc-700 text-amber-500 focus:ring-amber-500 cursor-pointer"
                  />
                </label>
                <label className="flex items-center justify-between p-3 rounded-xl bg-black/30 border border-white/[0.03] cursor-pointer">
                  <span className="text-xs text-zinc-300">Maintain append-only granular deletion audit ledger (JSONL)</span>
                  <input
                    type="checkbox"
                    checked={appSettings?.cleaner.keep_deletion_log ?? true}
                    onChange={(e) => handleUpdateCleanerSetting('keep_deletion_log', e.target.checked)}
                    className="rounded border-zinc-700 text-amber-500 focus:ring-amber-500 cursor-pointer"
                  />
                </label>
              </div>
            </div>

            {/* Path Exclusions */}
            <div className="p-6 rounded-2xl bg-[#16161a] border border-[#2a2a36] space-y-4">
              <h3 className="text-sm font-semibold text-white">Scanner Path Exclusions</h3>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={newExclusion}
                  onChange={(e) => setNewExclusion(e.target.value)}
                  placeholder="Enter directory name or pattern to exclude (e.g. D:\Projects\MyData)..."
                  className="flex-1 px-3 py-2 rounded-lg bg-black/40 border border-zinc-700 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                />
                <button
                  onClick={handleAddExclusion}
                  className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Exclusion
                </button>
              </div>

              {appSettings && appSettings.exclusions.length > 0 && (
                <div className="space-y-1.5 pt-2">
                  {appSettings.exclusions.map((ex) => (
                    <div key={ex} className="flex justify-between items-center p-2.5 rounded-lg bg-black/30 border border-zinc-800 text-xs font-mono">
                      <span className="text-zinc-300">{ex}</span>
                      <button
                        onClick={() => handleRemoveExclusion(ex)}
                        className="text-[11px] text-zinc-500 hover:text-red-400 transition cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="p-8 text-xs text-zinc-400">Section active</div>
        )}
      </main>
    </div>
  )
}
