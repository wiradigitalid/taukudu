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
  RecycleBinItemDetail,
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
  PrometheusMetricsSummary,
  MetricLine,
  SecurityPostureSummary,
  ThreatBlacklistSummary,
  ThreatBlacklistData,
  LogEntry,
  LogStats,
  EmptyFolderScanResult,
  LargeFileScanResult,
  AppReleaseInfo,
  GpuDiagnosticInfo,
  YaraRuleFileEntry,
  YaraRulesMetadata,
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
  BarChart3,
  Info,
  Link2Off,
  ExternalLink,
  Terminal,
  Search,
  FolderX,
  FileUp,
  Battery,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { LANGUAGES } from '@/lib/languages'

export function App() {
  const { t, i18n } = useTranslation()
  const [activeTab, setActiveTab] = useState<'dashboard' | 'cleaner' | 'browsers' | 'recyclebin' | 'threats' | 'duplicates' | 'emptyfolders' | 'largefiles' | 'leftovers' | 'restore' | 'disk' | 'repair' | 'drivehealth' | 'bsod' | 'power' | 'vss' | 'firewall' | 'cve' | 'breach' | 'updater' | 'schedules' | 'game' | 'gamingcleaner' | 'eventlogs' | 'winupdate' | 'contextmenu' | 'registry' | 'shortcuts' | 'databases' | 'env' | 'cache' | 'ram' | 'safety' | 'hosts' | 'devcache' | 'startup' | 'debloat' | 'services' | 'drivers' | 'network' | 'uninstaller' | 'shredder' | 'perf' | 'metrics' | 'history' | 'logs' | 'settings' | 'about' | 'malware' | 'privacy'>('dashboard')
  const [overview, setOverview] = useState<SystemOverview | null>(null)
  const [loadingOverview, setLoadingOverview] = useState(true)

  // Settings State
  const [themeMode, setThemeMode] = useState<'dark' | 'light'>('dark')
  const [currentLang, setCurrentLang] = useState<string>('en')
  const [appSettings, setAppSettings] = useState<AppSettings | null>(null)
  const [newExclusion, setNewExclusion] = useState('')
  const [settingsFeedback, setSettingsFeedback] = useState<string | null>(null)
  const [appReleaseInfo, setAppReleaseInfo] = useState<AppReleaseInfo | null>(null)
  const [checkingAppRelease, setCheckingAppRelease] = useState(false)
  const [gpuInfo, setGpuInfo] = useState<GpuDiagnosticInfo | null>(null)
  const [loadingGpu, setLoadingGpu] = useState(false)

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
  const [threatBlacklistSummary, setThreatBlacklistSummary] = useState<ThreatBlacklistSummary | null>(null)
  const [loadingThreats, setLoadingThreats] = useState(false)
  const [threatFeedback, setThreatFeedback] = useState<string | null>(null)
  const [newBlacklistCidr, setNewBlacklistCidr] = useState('')
  const [newBlacklistCat, setNewBlacklistCat] = useState('Suspicious Staging')
  const [newBlacklistDomain, setNewBlacklistDomain] = useState('')

  // Duplicates state
  const [dupDir, setDupDir] = useState<string>('D:\\Developer\\wiradigital.id\\taukudu')
  const [dupScanning, setDupScanning] = useState(false)
  const [dupResult, setDupResult] = useState<DuplicateScanResult | null>(null)
  const [selectedDupPaths, setSelectedDupPaths] = useState<Set<string>>(new Set())
  const [dupStatus, setDupStatus] = useState<string | null>(null)

  // Empty Folders state
  const [emptyFolderDir, setEmptyFolderDir] = useState<string>('D:\\Developer\\wiradigital.id\\taukudu')
  const [emptyFolderScanning, setEmptyFolderScanning] = useState(false)
  const [emptyFolderResult, setEmptyFolderResult] = useState<EmptyFolderScanResult | null>(null)
  const [selectedEmptyFolderPaths, setSelectedEmptyFolderPaths] = useState<Set<string>>(new Set())
  const [emptyFolderFeedback, setEmptyFolderFeedback] = useState<string | null>(null)

  // Large Files state
  const [largeFilesDir, setLargeFilesDir] = useState<string>('D:\\Developer\\wiradigital.id\\taukudu')
  const [largeFilesMinSize, setLargeFilesMinSize] = useState<number>(52_428_800) // 50MB default
  const [largeFilesScanning, setLargeFilesScanning] = useState(false)
  const [largeFilesResult, setLargeFilesResult] = useState<LargeFileScanResult | null>(null)
  const [selectedLargeFilePaths, setSelectedLargeFilePaths] = useState<Set<string>>(new Set())
  const [largeFilesFeedback, setLargeFilesFeedback] = useState<string | null>(null)

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
  const [registryBackups, setRegistryBackups] = useState<import('@/lib/tauri-bridge').RegistryBackupEntry[]>([])
  const [loadingBackups, setLoadingBackups] = useState(false)

  // Broken Shortcuts state
  const [brokenShortcuts, setBrokenShortcuts] = useState<import('@/lib/tauri-bridge').BrokenShortcutItem[]>([])
  const [selectedShortcutIds, setSelectedShortcutIds] = useState<Set<string>>(new Set())
  const [scanningShortcuts, setScanningShortcuts] = useState(false)
  const [cleaningShortcuts, setCleaningShortcuts] = useState(false)
  const [shortcutsFeedback, setShortcutsFeedback] = useState<string | null>(null)

  // Database Optimizer state
  const [databaseScanResult, setDatabaseScanResult] = useState<import('@/lib/tauri-bridge').DatabaseScanSummary | null>(null)
  const [selectedDatabaseIds, setSelectedDatabaseIds] = useState<Set<string>>(new Set())
  const [scanningDatabases, setScanningDatabases] = useState(false)
  const [optimizingDatabases, setOptimizingDatabases] = useState(false)
  const [databaseFeedback, setDatabaseFeedback] = useState<string | null>(null)

  // Environment Cleaner state
  const [envScanResult, setEnvScanResult] = useState<import('@/lib/tauri-bridge').EnvCleanerScanResult | null>(null)
  const [selectedEnvIds, setSelectedEnvIds] = useState<Set<string>>(new Set())
  const [scanningEnv, setScanningEnv] = useState(false)
  const [cleaningEnv, setCleaningEnv] = useState(false)
  const [envFeedback, setEnvFeedback] = useState<string | null>(null)

  // Icon & Font Cache Rebuilder state
  const [iconFontCacheSummary, setIconFontCacheSummary] = useState<import('@/lib/tauri-bridge').CacheRebuildScanSummary | null>(null)
  const [scanningIconFont, setScanningIconFont] = useState(false)
  const [rebuildingIconFont, setRebuildingIconFont] = useState(false)
  const [restartExplorerCheck, setRestartExplorerCheck] = useState(true)
  const [iconFontFeedback, setIconFontFeedback] = useState<string | null>(null)

  // Gaming Cleaner state
  const [gamingScanResult, setGamingScanResult] = useState<import('@/lib/tauri-bridge').GamingScanSummary | null>(null)
  const [selectedGamingIds, setSelectedGamingIds] = useState<Set<string>>(new Set())
  const [scanningGaming, setScanningGaming] = useState(false)
  const [cleaningGaming, setCleaningGaming] = useState(false)
  const [gamingFeedback, setGamingFeedback] = useState<string | null>(null)

  // Event Logs & Crash Dumps state
  const [eventLogsSummary, setEventLogsSummary] = useState<import('@/lib/tauri-bridge').EventLogScanSummary | null>(null)
  const [selectedEventLogIds, setSelectedEventLogIds] = useState<Set<string>>(new Set())
  const [scanningEventLogs, setScanningEventLogs] = useState(false)
  const [clearingEventLogs, setClearingEventLogs] = useState(false)
  const [eventLogsFeedback, setEventLogsFeedback] = useState<string | null>(null)

  // Windows Update Cleaner state
  const [winUpdateSummary, setWinUpdateSummary] = useState<import('@/lib/tauri-bridge').WinUpdateScanSummary | null>(null)
  const [selectedWinUpdateIds, setSelectedWinUpdateIds] = useState<Set<string>>(new Set())
  const [scanningWinUpdate, setScanningWinUpdate] = useState(false)
  const [cleaningWinUpdate, setCleaningWinUpdate] = useState(false)
  const [winUpdateFeedback, setWinUpdateFeedback] = useState<string | null>(null)

  // Memory RAM Optimizer state
  const [memorySnapshot, setMemorySnapshot] = useState<import('@/lib/tauri-bridge').MemoryOptimizerSnapshot | null>(null)
  const [loadingMemorySnapshot, setLoadingMemorySnapshot] = useState(false)
  const [trimmingMemory, setTrimmingMemory] = useState(false)
  const [memoryFeedback, setMemoryFeedback] = useState<string | null>(null)

  // Startup state
  const [startupItems, setStartupItems] = useState<StartupItem[]>([])
  const [loadingStartup, setLoadingStartup] = useState(false)
  const [startupFeedback, setStartupFeedback] = useState<string | null>(null)

  // Safety Intelligence state
  const [safetySummary, setSafetySummary] = useState<import('@/lib/tauri-bridge').SafetyRatingSummary | null>(null)
  const [loadingSafety, setLoadingSafety] = useState(false)
  const [safetySearchQuery, setSafetySearchQuery] = useState('')
  const [safetyFeedback, setSafetyFeedback] = useState<string | null>(null)

  // Hosts Security state
  const [hostsSummary, setHostsSummary] = useState<import('@/lib/tauri-bridge').HostsFileSummary | null>(null)
  const [loadingHosts, setLoadingHosts] = useState(false)
  const [applyingHosts, setApplyingHosts] = useState(false)
  const [hostsFeedback, setHostsFeedback] = useState<string | null>(null)

  // Developer Package Caches state
  const [devCacheSummary, setDevCacheSummary] = useState<import('@/lib/tauri-bridge').DevCacheScanSummary | null>(null)
  const [selectedDevCacheIds, setSelectedDevCacheIds] = useState<Set<string>>(new Set())
  const [scanningDevCache, setScanningDevCache] = useState(false)
  const [cleaningDevCache, setCleaningDevCache] = useState(false)
  const [devCacheFeedback, setDevCacheFeedback] = useState<string | null>(null)

  // Physical Drive SMART Health state
  const [driveHealthSummary, setDriveHealthSummary] = useState<import('@/lib/tauri-bridge').DriveHealthSummary | null>(null)
  const [loadingDriveHealth, setLoadingDriveHealth] = useState(false)
  const [driveHealthFeedback, setDriveHealthFeedback] = useState<string | null>(null)

  // BSOD Crash Dump Analyzer state
  const [bsodSummary, setBsodSummary] = useState<import('@/lib/tauri-bridge').BsodDumpAnalysisSummary | null>(null)
  const [bugcheckDb, setBugcheckDb] = useState<import('@/lib/tauri-bridge').BugcheckStopCode[]>([])
  const [loadingBsod, setLoadingBsod] = useState(false)
  const [bsodFeedback, setBsodFeedback] = useState<string | null>(null)

  // Battery & Power Diagnostics state
  const [powerSummary, setPowerSummary] = useState<import('@/lib/tauri-bridge').PowerSummary | null>(null)
  const [loadingPower, setLoadingPower] = useState(false)
  const [powerFeedback, setPowerFeedback] = useState<string | null>(null)

  // Volume Shadow Copies (VSS) state
  const [vssSummary, setVssSummary] = useState<import('@/lib/tauri-bridge').VssSummary | null>(null)
  const [loadingVss, setLoadingVss] = useState(false)
  const [purgingVss, setPurgingVss] = useState(false)
  const [vssFeedback, setVssFeedback] = useState<string | null>(null)

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

  // Prometheus Metrics state
  const [prometheusMetrics, setPrometheusMetrics] = useState<PrometheusMetricsSummary | null>(null)
  const [loadingMetrics, setLoadingMetrics] = useState(false)
  const [metricsFeedback, setMetricsFeedback] = useState<string | null>(null)

  // History & Deletion Log state
  const [historyList, setHistoryList] = useState<HistoryRecord[]>([])
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [historyFeedback, setHistoryFeedback] = useState<string | null>(null)
  const [granularLogs, setGranularLogs] = useState<GranularDeletedFileEntry[]>([])
  const [deletionLogStats, setDeletionLogStats] = useState<DeletionLogStats | null>(null)
  const [logSearchQuery, setLogSearchQuery] = useState('')
  const [activeHistoryView, setActiveHistoryView] = useState<'sessions' | 'files'>('sessions')

  // Application Diagnostic Logs state
  const [appLogs, setAppLogs] = useState<LogEntry[]>([])
  const [appLogStats, setAppLogStats] = useState<LogStats | null>(null)
  const [loadingAppLogs, setLoadingAppLogs] = useState(false)
  const [logFilterLevel, setLogFilterLevel] = useState<string>('ALL')
  const [appLogFeedback, setAppLogFeedback] = useState<string | null>(null)

  // Malware Scanner state
  const [malwareScanning, setMalwareScanning] = useState(false)
  const [malwareResult, setMalwareResult] = useState<MalwareScanResult | null>(null)
  const [selectedThreatPaths, setSelectedThreatPaths] = useState<Set<string>>(new Set())
  const [malwareStatus, setMalwareStatus] = useState<string | null>(null)
  const [yaraRules, setYaraRules] = useState<YaraRuleFileEntry[]>([])
  const [yaraMetadata, setYaraMetadata] = useState<YaraRulesMetadata | null>(null)
  const [activeMalwareSubTab, setActiveMalwareSubTab] = useState<'scanner' | 'rules'>('scanner')
  const [newRuleName, setNewRuleName] = useState('')
  const [newRuleContent, setNewRuleContent] = useState('')

  // Privacy Shield & Security Posture state
  const [privacyState, setPrivacyState] = useState<PrivacyShieldState | null>(null)
  const [securityPosture, setSecurityPosture] = useState<SecurityPostureSummary | null>(null)
  const [loadingPrivacy, setLoadingPrivacy] = useState(false)
  const [privacyFeedback, setPrivacyFeedback] = useState<string | null>(null)

  const fetchOverview = async () => {
    setLoadingOverview(true)
    try {
      const data = await tauriApi.getSystemOverview()
      setOverview(data)
      const posture = await tauriApi.collectSecurityPosture()
      setSecurityPosture(posture)
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
      const blSummary = await tauriApi.getThreatBlacklistSummary()
      setThreatBlacklistSummary(blSummary)
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

  const handleAddBlacklistDomain = async () => {
    if (!newBlacklistDomain) return
    try {
      const sum = await tauriApi.addThreatBlacklistDomain(newBlacklistDomain)
      setThreatBlacklistSummary(sum)
      setNewBlacklistDomain('')
      setThreatFeedback(`Added ${newBlacklistDomain} to monitored blacklist.`)
    } catch (err) {
      setThreatFeedback(`Add domain error: ${String(err)}`)
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

  const handleScanEmptyFolders = async () => {
    if (!emptyFolderDir) return
    setEmptyFolderScanning(true)
    setEmptyFolderFeedback(null)
    setSelectedEmptyFolderPaths(new Set())
    try {
      const res = await tauriApi.scanEmptyFolders(emptyFolderDir)
      setEmptyFolderResult(res)
      const toSelect = new Set<string>()
      res.folders.forEach((f) => toSelect.add(f.path))
      setSelectedEmptyFolderPaths(toSelect)
      setEmptyFolderFeedback(`Found ${res.total_count} empty folders in ${res.scan_duration_ms}ms`)
    } catch (err) {
      console.error('Empty folder scan error:', err)
      setEmptyFolderFeedback('Scan error: ' + String(err))
    } finally {
      setEmptyFolderScanning(false)
    }
  }

  const handleDeleteEmptyFolders = async () => {
    if (selectedEmptyFolderPaths.size === 0) return
    try {
      const count = await tauriApi.deleteDuplicateFiles(Array.from(selectedEmptyFolderPaths))
      setEmptyFolderFeedback(`Deleted ${count} empty folders successfully.`)
      await handleScanEmptyFolders()
    } catch (err) {
      setEmptyFolderFeedback('Deletion error: ' + String(err))
    }
  }

  const handleScanLargeFiles = async () => {
    if (!largeFilesDir) return
    setLargeFilesScanning(true)
    setLargeFilesFeedback(null)
    setSelectedLargeFilePaths(new Set())
    try {
      const res = await tauriApi.scanLargeFiles(largeFilesDir, largeFilesMinSize)
      setLargeFilesResult(res)
      setLargeFilesFeedback(`Found ${res.total_count} large files (${formatBytes(res.total_size_bytes)}) in ${res.scan_duration_ms}ms`)
    } catch (err) {
      console.error('Large files scan error:', err)
      setLargeFilesFeedback('Scan error: ' + String(err))
    } finally {
      setLargeFilesScanning(false)
    }
  }

  const handleDeleteSelectedLargeFiles = async () => {
    if (selectedLargeFilePaths.size === 0) return
    try {
      const count = await tauriApi.deleteDuplicateFiles(Array.from(selectedLargeFilePaths))
      setLargeFilesFeedback(`Deleted ${count} large files successfully.`)
      await handleScanLargeFiles()
    } catch (err) {
      setLargeFilesFeedback('Deletion error: ' + String(err))
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

  const fetchRegistryBackups = async () => {
    setLoadingBackups(true)
    try {
      const res = await tauriApi.listRegistryBackups()
      setRegistryBackups(res.backups)
    } catch (err) {
      console.error('List backups error:', err)
    } finally {
      setLoadingBackups(false)
    }
  }

  const handleFixSelectedRegistry = async () => {
    if (selectedRegistryIds.size === 0) return
    setFixingRegistry(true)
    try {
      const selectedIssues = registryIssues.filter((i) => selectedRegistryIds.has(i.id))
      // First export safety registry backups for touched root keys
      for (const issue of selectedIssues) {
        try {
          await tauriApi.exportRegistryKeyBackup(issue.key_path, issue.category)
        } catch (e) {
          console.warn('Backup non-critical warning:', e)
        }
      }

      const targets: [string, string][] = selectedIssues.map((i) => [i.key_path, i.value_name])

      const res = await tauriApi.fixRegistryTargets(targets)
      setRegistryFeedback(`Fixed ${res.fixed_count} registry entries successfully (pre-fix backups saved).`)
      await handleScanRegistry()
      await fetchRegistryBackups()
    } catch (err) {
      setRegistryFeedback(`Fix registry error: ${String(err)}`)
    } finally {
      setFixingRegistry(false)
    }
  }

  const handleRestoreRegistryBackup = async (filePath: string) => {
    try {
      const msg = await tauriApi.restoreRegistryBackup(filePath)
      setRegistryFeedback(msg)
      await fetchRegistryBackups()
    } catch (err) {
      setRegistryFeedback(`Restore backup error: ${String(err)}`)
    }
  }

  const handleDeleteRegistryBackup = async (filePath: string) => {
    try {
      await tauriApi.deleteRegistryBackup(filePath)
      setRegistryFeedback(`Deleted backup file.`)
      await fetchRegistryBackups()
    } catch (err) {
      setRegistryFeedback(`Delete backup error: ${String(err)}`)
    }
  }

  const handleScanShortcuts = async () => {
    setScanningShortcuts(true)
    setShortcutsFeedback(null)
    setSelectedShortcutIds(new Set())
    try {
      const res = await tauriApi.scanBrokenShortcuts()
      setBrokenShortcuts(res.items)
      const allIds = new Set(res.items.map((i) => i.id))
      setSelectedShortcutIds(allIds)
      setShortcutsFeedback(`Scanned ${res.total_scanned} shortcuts: found ${res.total_broken} broken/invalid links in ${res.scan_duration_ms}ms`)
    } catch (err) {
      setShortcutsFeedback(`Shortcut scan error: ${String(err)}`)
    } finally {
      setScanningShortcuts(false)
    }
  }

  const handleDeleteSelectedShortcuts = async () => {
    if (selectedShortcutIds.size === 0) return
    setCleaningShortcuts(true)
    try {
      const pathsToDelete = brokenShortcuts
        .filter((i) => selectedShortcutIds.has(i.id))
        .map((i) => i.shortcut_path)

      const res = await tauriApi.deleteBrokenShortcuts(pathsToDelete)
      setShortcutsFeedback(`Successfully deleted ${res.deleted_count} broken shortcuts (${res.failed_count} failed).`)
      await handleScanShortcuts()
    } catch (err) {
      setShortcutsFeedback(`Delete error: ${String(err)}`)
    } finally {
      setCleaningShortcuts(false)
    }
  }

  const handleScanDatabases = async () => {
    setScanningDatabases(true)
    setDatabaseFeedback(null)
    setSelectedDatabaseIds(new Set())
    try {
      const res = await tauriApi.scanSqliteDatabases()
      setDatabaseScanResult(res)
      const allIds = new Set(res.databases.map((d) => d.id))
      setSelectedDatabaseIds(allIds)
      setDatabaseFeedback(`Found ${res.total_databases_found} SQLite databases (${formatBytes(res.total_estimated_reclaimable_bytes)} estimated reclaimable space) in ${res.scan_duration_ms}ms`)
    } catch (err) {
      setDatabaseFeedback(`Database scan error: ${String(err)}`)
    } finally {
      setScanningDatabases(false)
    }
  }

  const handleVacuumSelectedDatabases = async () => {
    if (!databaseScanResult || selectedDatabaseIds.size === 0) return
    setOptimizingDatabases(true)
    try {
      const targets = databaseScanResult.databases
        .filter((d) => selectedDatabaseIds.has(d.id))
        .map((d) => d.file_path)

      const res = await tauriApi.vacuumSqliteDatabases(targets)
      setDatabaseFeedback(`Successfully vacuumed and defragmented ${res.optimized_count} databases (${formatBytes(res.total_bytes_reclaimed)} reclaimed).`)
      await handleScanDatabases()
    } catch (err) {
      setDatabaseFeedback(`Vacuum error: ${String(err)}`)
    } finally {
      setOptimizingDatabases(false)
    }
  }

  const handleScanEnvironment = async () => {
    setScanningEnv(true)
    setEnvFeedback(null)
    setSelectedEnvIds(new Set())
    try {
      const res = await tauriApi.scanEnvironmentOrphans()
      setEnvScanResult(res)
      const allIds = new Set(res.items.map((i) => i.id))
      setSelectedEnvIds(allIds)
      setEnvFeedback(`Scanned ${res.total_scanned} environment entries: found ${res.total_orphans} dead PATH/variable references in ${res.scan_duration_ms}ms`)
    } catch (err) {
      setEnvFeedback(`Environment scan error: ${String(err)}`)
    } finally {
      setScanningEnv(false)
    }
  }

  const handleCleanSelectedEnv = async () => {
    if (!envScanResult || selectedEnvIds.size === 0) return
    setCleaningEnv(true)
    try {
      const itemsToClean = envScanResult.items.filter((i) => selectedEnvIds.has(i.id))
      const res = await tauriApi.cleanEnvironmentOrphans(itemsToClean)
      setEnvFeedback(`Successfully cleaned ${res.cleaned_count} invalid environment entries (${res.failed_count} failed).`)
      await handleScanEnvironment()
    } catch (err) {
      setEnvFeedback(`Clean error: ${String(err)}`)
    } finally {
      setCleaningEnv(false)
    }
  }

  const handleScanIconFontCaches = async () => {
    setScanningIconFont(true)
    setIconFontFeedback(null)
    try {
      const res = await tauriApi.scanIconFontCaches()
      setIconFontCacheSummary(res)
      setIconFontFeedback(`Found ${res.total_files} cache files totaling ${formatBytes(res.total_size_bytes)} in ${res.scan_duration_ms}ms`)
    } catch (err) {
      setIconFontFeedback(`Scan error: ${String(err)}`)
    } finally {
      setScanningIconFont(false)
    }
  }

  const handleRebuildAndPurgeCaches = async () => {
    setRebuildingIconFont(true)
    try {
      const res = await tauriApi.rebuildAndPurgeCaches(restartExplorerCheck)
      setIconFontFeedback(`Successfully purged ${res.purged_files_count} cache files (${formatBytes(res.bytes_reclaimed)} freed). ${res.explorer_restarted ? 'Explorer restarted.' : ''} ${res.font_service_signaled ? 'Font cache service refreshed.' : ''}`)
      await handleScanIconFontCaches()
    } catch (err) {
      setIconFontFeedback(`Rebuild error: ${String(err)}`)
    } finally {
      setRebuildingIconFont(false)
    }
  }

  const handleScanGaming = async () => {
    setScanningGaming(true)
    setGamingFeedback(null)
    setSelectedGamingIds(new Set())
    try {
      const res = await tauriApi.scanGamingCleaner()
      setGamingScanResult(res)
      const allIds = new Set(res.targets.map((t) => t.id))
      setSelectedGamingIds(allIds)
      setGamingFeedback(`Found ${res.total_items} game cache/redist targets totaling ${formatBytes(res.total_size_bytes)} in ${res.scan_duration_ms}ms`)
    } catch (err) {
      setGamingFeedback(`Gaming scan error: ${String(err)}`)
    } finally {
      setScanningGaming(false)
    }
  }

  const handleCleanSelectedGaming = async () => {
    if (!gamingScanResult || selectedGamingIds.size === 0) return
    setCleaningGaming(true)
    try {
      const targets = gamingScanResult.targets
        .filter((t) => selectedGamingIds.has(t.id))
        .map((t) => t.path)

      const res = await tauriApi.cleanGamingTargets(targets)
      setGamingFeedback(`Successfully freed ${formatBytes(res.bytes_freed)} across ${res.cleaned_count} gaming directories (${res.failed_count} failed).`)
      await handleScanGaming()
    } catch (err) {
      setGamingFeedback(`Clean error: ${String(err)}`)
    } finally {
      setCleaningGaming(false)
    }
  }

  const handleScanEventLogs = async () => {
    setScanningEventLogs(true)
    setEventLogsFeedback(null)
    setSelectedEventLogIds(new Set())
    try {
      const res = await tauriApi.scanWindowsEventLogs()
      setEventLogsSummary(res)
      const allIds = new Set(res.targets.map((t) => t.id))
      setSelectedEventLogIds(allIds)
      setEventLogsFeedback(`Found ${res.total_logs_count} event log channels and crash dump files (${formatBytes(res.total_size_bytes)} total) in ${res.scan_duration_ms}ms`)
    } catch (err) {
      setEventLogsFeedback(`Scan error: ${String(err)}`)
    } finally {
      setScanningEventLogs(false)
    }
  }

  const handleClearSelectedEventLogs = async () => {
    if (!eventLogsSummary || selectedEventLogIds.size === 0) return
    setClearingEventLogs(true)
    try {
      const targets = eventLogsSummary.targets.filter((t) => selectedEventLogIds.has(t.id))
      const res = await tauriApi.cleanWindowsEventLogs(targets)
      setEventLogsFeedback(`Successfully cleared ${res.cleared_count} event logs and dump targets (${formatBytes(res.bytes_freed)} freed).`)
      await handleScanEventLogs()
    } catch (err) {
      setEventLogsFeedback(`Clear error: ${String(err)}`)
    } finally {
      setClearingEventLogs(false)
    }
  }

  const handleScanWinUpdates = async () => {
    setScanningWinUpdate(true)
    setWinUpdateFeedback(null)
    setSelectedWinUpdateIds(new Set())
    try {
      const res = await tauriApi.scanWindowsUpdates()
      setWinUpdateSummary(res)
      const allIds = new Set(res.targets.map((t) => t.id))
      setSelectedWinUpdateIds(allIds)
      setWinUpdateFeedback(`Found ${res.total_files_count} cached update files (${formatBytes(res.total_size_bytes)} total) in ${res.scan_duration_ms}ms`)
    } catch (err) {
      setWinUpdateFeedback(`Scan error: ${String(err)}`)
    } finally {
      setScanningWinUpdate(false)
    }
  }

  const handleCleanSelectedWinUpdates = async () => {
    if (!winUpdateSummary || selectedWinUpdateIds.size === 0) return
    setCleaningWinUpdate(true)
    try {
      const paths = winUpdateSummary.targets
        .filter((t) => selectedWinUpdateIds.has(t.id))
        .map((t) => t.file_path)

      const res = await tauriApi.cleanWindowsUpdates(paths)
      setWinUpdateFeedback(`Successfully purged ${formatBytes(res.bytes_freed)} across ${res.cleaned_targets_count} update targets (${res.failed_count} failed). ${res.services_restarted ? 'Windows Update services refreshed.' : ''}`)
      await handleScanWinUpdates()
    } catch (err) {
      setWinUpdateFeedback(`Clean error: ${String(err)}`)
    } finally {
      setCleaningWinUpdate(false)
    }
  }

  const fetchMemorySnapshot = async () => {
    setLoadingMemorySnapshot(true)
    setMemoryFeedback(null)
    try {
      const snap = await tauriApi.getMemoryOptimizerSnapshot()
      setMemorySnapshot(snap)
      setMemoryFeedback(`RAM Usage: ${snap.usage_percentage.toFixed(1)}% (${formatBytes(snap.used_ram_bytes)} / ${formatBytes(snap.total_ram_bytes)}) across ${snap.total_processes} processes`)
    } catch (err) {
      setMemoryFeedback(`Memory snapshot error: ${String(err)}`)
    } finally {
      setLoadingMemorySnapshot(false)
    }
  }

  const handleTrimMemory = async () => {
    setTrimmingMemory(true)
    try {
      const res = await tauriApi.trimMemoryWorkingSets()
      setMemoryFeedback(`Successfully trimmed working sets of ${res.trimmed_processes_count} processes (${formatBytes(res.memory_freed_bytes)} RAM freed).`)
      await fetchMemorySnapshot()
    } catch (err) {
      setMemoryFeedback(`Trim error: ${String(err)}`)
    } finally {
      setTrimmingMemory(false)
    }
  }

  const fetchSafetyIntelligence = async () => {
    setLoadingSafety(true)
    setSafetyFeedback(null)
    try {
      const sum = await tauriApi.getSafetyIntelligenceSummary()
      setSafetySummary(sum)
      setSafetyFeedback(`Loaded ${sum.total_ratings_known} curated program & startup safety classifications.`)
    } catch (err) {
      setSafetyFeedback(`Error loading safety db: ${String(err)}`)
    } finally {
      setLoadingSafety(false)
    }
  }

  const fetchHostsSummary = async () => {
    setLoadingHosts(true)
    setHostsFeedback(null)
    try {
      const sum = await tauriApi.scanHostsFileSecurity()
      setHostsSummary(sum)
      setHostsFeedback(`Hosts file: ${sum.total_entries} entries (${sum.telemetry_blocked_count} telemetry endpoints blocked). ${sum.is_writable ? 'Writable' : 'Read-only (elevation required)'}`)
    } catch (err) {
      setHostsFeedback(`Hosts scan error: ${String(err)}`)
    } finally {
      setLoadingHosts(false)
    }
  }

  const handleToggleHostsTelemetryBlock = async (enableBlock: boolean) => {
    setApplyingHosts(true)
    try {
      const res = await tauriApi.applyHostsTelemetryBlock(enableBlock)
      setHostsFeedback(res.message)
      await fetchHostsSummary()
    } catch (err) {
      setHostsFeedback(`Hosts error: ${String(err)}`)
    } finally {
      setApplyingHosts(false)
    }
  }

  const handleScanDevCaches = async () => {
    setScanningDevCache(true)
    setDevCacheFeedback(null)
    setSelectedDevCacheIds(new Set())
    try {
      const res = await tauriApi.scanDeveloperCaches()
      setDevCacheSummary(res)
      const allIds = new Set(res.targets.map((t) => t.id))
      setSelectedDevCacheIds(allIds)
      setDevCacheFeedback(`Found ${res.total_targets_count} developer cache repositories (${formatBytes(res.total_size_bytes)} total) in ${res.scan_duration_ms}ms`)
    } catch (err) {
      setDevCacheFeedback(`Dev cache scan error: ${String(err)}`)
    } finally {
      setScanningDevCache(false)
    }
  }

  const handleCleanSelectedDevCaches = async () => {
    if (!devCacheSummary || selectedDevCacheIds.size === 0) return
    setCleaningDevCache(true)
    try {
      const paths = devCacheSummary.targets
        .filter((t) => selectedDevCacheIds.has(t.id))
        .map((t) => t.file_path)

      const res = await tauriApi.cleanDeveloperCaches(paths)
      setDevCacheFeedback(`Successfully cleaned ${formatBytes(res.bytes_freed)} across ${res.cleaned_targets_count} developer cache directories (${res.failed_count} failed).`)
      await handleScanDevCaches()
    } catch (err) {
      setDevCacheFeedback(`Clean error: ${String(err)}`)
    } finally {
      setCleaningDevCache(false)
    }
  }

  const fetchDriveHealth = async () => {
    setLoadingDriveHealth(true)
    setDriveHealthFeedback(null)
    try {
      const sum = await tauriApi.inspectPhysicalDrivesHealth()
      setDriveHealthSummary(sum)
      setDriveHealthFeedback(`Inspected ${sum.total_drives} storage drives. ${sum.has_failing_drive ? 'Warning: Drive health degraded!' : 'All physical drives report Healthy.'}`)
    } catch (err) {
      setDriveHealthFeedback(`Inspection error: ${String(err)}`)
    } finally {
      setLoadingDriveHealth(false)
    }
  }

  const fetchBsodAnalysis = async () => {
    setLoadingBsod(true)
    setBsodFeedback(null)
    try {
      const sum = await tauriApi.analyzeBsodCrashDumps()
      setBsodSummary(sum)
      const codes = await tauriApi.getKnownBugcheckCodes()
      setBugcheckDb(codes)
      setBsodFeedback(`Detected ${sum.total_crashes_detected} Minidump & kernel crash dumps. Latest crash: ${sum.latest_crash_date || 'None'}`)
    } catch (err) {
      setBsodFeedback(`BSOD analysis error: ${String(err)}`)
    } finally {
      setLoadingBsod(false)
    }
  }

  const fetchPowerDiagnostics = async () => {
    setLoadingPower(true)
    setPowerFeedback(null)
    try {
      const sum = await tauriApi.getPowerDiagnosticsSummary()
      setPowerSummary(sum)
      setPowerFeedback(`Active power plan: ${sum.active_plan_name}. ${sum.battery.has_battery ? `Battery health: ${sum.battery.health_percentage.toFixed(1)}%` : 'Running on AC Desktop Line.'}`)
    } catch (err) {
      setPowerFeedback(`Power error: ${String(err)}`)
    } finally {
      setLoadingPower(false)
    }
  }

  const handleSetActivePowerPlan = async (guid: string, planName: string) => {
    try {
      const msg = await tauriApi.setActivePowerScheme(guid)
      setPowerFeedback(`Switched power plan to ${planName}`)
      await fetchPowerDiagnostics()
    } catch (err) {
      setPowerFeedback(`Power scheme error: ${String(err)}`)
    }
  }

  const fetchVssSummary = async () => {
    setLoadingVss(true)
    setVssFeedback(null)
    try {
      const sum = await tauriApi.scanVssShadowCopies()
      setVssSummary(sum)
      setVssFeedback(`Found ${sum.total_shadows} Volume Shadow Copies (${formatBytes(sum.total_used_bytes)} used storage).`)
    } catch (err) {
      setVssFeedback(`VSS scan error: ${String(err)}`)
    } finally {
      setLoadingVss(false)
    }
  }

  const handlePurgeVss = async (purgeAll: boolean) => {
    setPurgingVss(true)
    try {
      const res = await tauriApi.purgeVssShadowCopies(purgeAll)
      setVssFeedback(res.message)
      await fetchVssSummary()
    } catch (err) {
      setVssFeedback(`Purge error: ${String(err)}`)
    } finally {
      setPurgingVss(false)
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

  const fetchPrometheusMetrics = async () => {
    setLoadingMetrics(true)
    try {
      const res = await tauriApi.collectPrometheusMetrics()
      setPrometheusMetrics(res)
    } catch (err) {
      console.error('Fetch metrics error:', err)
    } finally {
      setLoadingMetrics(false)
    }
  }

  const fetchAppLogs = async (level?: string) => {
    setLoadingAppLogs(true)
    try {
      const lvl = level || (logFilterLevel === 'ALL' ? undefined : logFilterLevel)
      const logs = await tauriApi.queryAppLogs(150, lvl)
      setAppLogs(logs)
      const stats = await tauriApi.getAppLogStats()
      setAppLogStats(stats)
    } catch (err) {
      console.error('Fetch app logs error:', err)
    } finally {
      setLoadingAppLogs(false)
    }
  }

  const handleClearAppLogs = async () => {
    try {
      await tauriApi.clearAppLogs()
      setAppLogFeedback('Cleared diagnostic application log file.')
      await fetchAppLogs()
    } catch (err) {
      setAppLogFeedback(`Clear logs error: ${String(err)}`)
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

  const fetchYaraRules = async () => {
    try {
      const rules = await tauriApi.listYaraRuleFiles()
      setYaraRules(rules)
      const meta = await tauriApi.getYaraRulesMetadata()
      setYaraMetadata(meta)
    } catch (err) {
      console.error('Fetch YARA rules error:', err)
    }
  }

  const handleSaveYaraRule = async () => {
    if (!newRuleName || !newRuleContent) return
    const filename = newRuleName.endsWith('.yar') ? newRuleName : `${newRuleName}.yar`
    try {
      const meta = await tauriApi.saveYaraRuleFile(filename, newRuleContent)
      setYaraMetadata(meta)
      setNewRuleName('')
      setNewRuleContent('')
      setMalwareStatus(`Saved custom YARA rule: ${filename}`)
      await fetchYaraRules()
    } catch (err) {
      setMalwareStatus(`Save YARA rule error: ${String(err)}`)
    }
  }

  const handleDeleteYaraRule = async (filename: string) => {
    try {
      const meta = await tauriApi.deleteYaraRuleFile(filename)
      setYaraMetadata(meta)
      setMalwareStatus(`Deleted YARA rule: ${filename}`)
      await fetchYaraRules()
    } catch (err) {
      setMalwareStatus(`Delete YARA rule error: ${String(err)}`)
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

  const handleCheckAppUpdate = async () => {
    setCheckingAppRelease(true)
    try {
      const info = await tauriApi.checkAppUpdates()
      setAppReleaseInfo(info)
      setSettingsFeedback(info.is_update_available ? `Update available: v${info.latest_version}` : `TauKudu is up to date (v${info.current_version})`)
    } catch (err) {
      setSettingsFeedback(`Check update error: ${String(err)}`)
    } finally {
      setCheckingAppRelease(false)
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

  const fetchGpuDiagnostics = async () => {
    setLoadingGpu(true)
    try {
      const g = await tauriApi.getGpuDiagnostics()
      setGpuInfo(g)
    } catch (err) {
      console.error('Fetch GPU diagnostics error:', err)
    } finally {
      setLoadingGpu(false)
    }
  }

  const handleToggleGpuAcceleration = async (disable: boolean) => {
    try {
      const g = await tauriApi.setGpuHardwareAcceleration(disable)
      setGpuInfo(g)
      setSettingsFeedback(`GPU hardware acceleration ${disable ? 'disabled (Software Mode)' : 'enabled (Hardware Mode)'}. Relaunch to take full effect.`)
    } catch (err) {
      setSettingsFeedback(`GPU toggle error: ${String(err)}`)
    }
  }

  useEffect(() => {
    fetchOverview()
    fetchAppSettings()
    fetchGpuDiagnostics()
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
                setActiveTab('emptyfolders')
                if (!emptyFolderResult && !emptyFolderScanning) handleScanEmptyFolders()
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg font-medium text-sm transition cursor-pointer ${
                activeTab === 'emptyfolders'
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
              }`}
            >
              <FolderX className="w-4 h-4" />
              Empty Folders
            </button>
            <button
              onClick={() => {
                setActiveTab('largefiles')
                if (!largeFilesResult && !largeFilesScanning) handleScanLargeFiles()
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg font-medium text-sm transition cursor-pointer ${
                activeTab === 'largefiles'
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
              }`}
            >
              <FileUp className="w-4 h-4" />
              Large File Finder
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
                setActiveTab('drivehealth')
                if (!driveHealthSummary && !loadingDriveHealth) fetchDriveHealth()
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg font-medium text-sm transition cursor-pointer ${
                activeTab === 'drivehealth'
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
              }`}
            >
              <HardDrive className="w-4 h-4" />
              S.M.A.R.T. Drive Health
            </button>
            <button
              onClick={() => {
                setActiveTab('bsod')
                if (!bsodSummary && !loadingBsod) fetchBsodAnalysis()
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg font-medium text-sm transition cursor-pointer ${
                activeTab === 'bsod'
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
              BSOD Crash Analyzer
            </button>
            <button
              onClick={() => {
                setActiveTab('power')
                if (!powerSummary && !loadingPower) fetchPowerDiagnostics()
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg font-medium text-sm transition cursor-pointer ${
                activeTab === 'power'
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
              }`}
            >
              <Battery className="w-4 h-4" />
              Battery & Power
            </button>
            <button
              onClick={() => {
                setActiveTab('vss')
                if (!vssSummary && !loadingVss) fetchVssSummary()
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg font-medium text-sm transition cursor-pointer ${
                activeTab === 'vss'
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
              }`}
            >
              <History className="w-4 h-4" />
              Shadow Copies (VSS)
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
                setActiveTab('gamingcleaner')
                if (!gamingScanResult && !scanningGaming) handleScanGaming()
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg font-medium text-sm transition cursor-pointer ${
                activeTab === 'gamingcleaner'
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
              }`}
            >
              <Gamepad2 className="w-4 h-4" />
              Gaming Clean
            </button>
            <button
              onClick={() => {
                setActiveTab('eventlogs')
                if (!eventLogsSummary && !scanningEventLogs) handleScanEventLogs()
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg font-medium text-sm transition cursor-pointer ${
                activeTab === 'eventlogs'
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
              }`}
            >
              <FileCode className="w-4 h-4" />
              Event Logs
            </button>
            <button
              onClick={() => {
                setActiveTab('winupdate')
                if (!winUpdateSummary && !scanningWinUpdate) handleScanWinUpdates()
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg font-medium text-sm transition cursor-pointer ${
                activeTab === 'winupdate'
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
              }`}
            >
              <ArrowUpCircle className="w-4 h-4" />
              Windows Update
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
                setActiveTab('shortcuts')
                if (brokenShortcuts.length === 0 && !scanningShortcuts) handleScanShortcuts()
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg font-medium text-sm transition cursor-pointer ${
                activeTab === 'shortcuts'
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
              }`}
            >
              <Link2Off className="w-4 h-4" />
              Broken Shortcuts
            </button>
            <button
              onClick={() => {
                setActiveTab('databases')
                if (!databaseScanResult && !scanningDatabases) handleScanDatabases()
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg font-medium text-sm transition cursor-pointer ${
                activeTab === 'databases'
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
              }`}
            >
              <Database className="w-4 h-4" />
              Database VACUUM
            </button>
            <button
              onClick={() => {
                setActiveTab('env')
                if (!envScanResult && !scanningEnv) handleScanEnvironment()
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg font-medium text-sm transition cursor-pointer ${
                activeTab === 'env'
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
              }`}
            >
              <Wrench className="w-4 h-4" />
              Environment PATH
            </button>
            <button
              onClick={() => {
                setActiveTab('cache')
                if (!iconFontCacheSummary && !scanningIconFont) handleScanIconFontCaches()
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg font-medium text-sm transition cursor-pointer ${
                activeTab === 'cache'
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
              }`}
            >
              <RotateCcw className="w-4 h-4" />
              Icon & Font Cache
            </button>
            <button
              onClick={() => {
                setActiveTab('ram')
                if (!memorySnapshot && !loadingMemorySnapshot) fetchMemorySnapshot()
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg font-medium text-sm transition cursor-pointer ${
                activeTab === 'ram'
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
              }`}
            >
              <Gauge className="w-4 h-4" />
              Memory RAM Trimmer
            </button>
            <button
              onClick={() => {
                setActiveTab('safety')
                if (!safetySummary && !loadingSafety) fetchSafetyIntelligence()
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg font-medium text-sm transition cursor-pointer ${
                activeTab === 'safety'
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              Safety Advisor
            </button>
            <button
              onClick={() => {
                setActiveTab('hosts')
                if (!hostsSummary && !loadingHosts) fetchHostsSummary()
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg font-medium text-sm transition cursor-pointer ${
                activeTab === 'hosts'
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
              }`}
            >
              <ShieldAlert className="w-4 h-4" />
              Hosts Telemetry Block
            </button>
            <button
              onClick={() => {
                setActiveTab('devcache')
                if (!devCacheSummary && !scanningDevCache) handleScanDevCaches()
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg font-medium text-sm transition cursor-pointer ${
                activeTab === 'devcache'
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
              }`}
            >
              <FileCode className="w-4 h-4" />
              Developer Caches
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
                setActiveTab('metrics')
                if (!prometheusMetrics && !loadingMetrics) fetchPrometheusMetrics()
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg font-medium text-sm transition cursor-pointer ${
                activeTab === 'metrics'
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              Prometheus Metrics
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
              onClick={() => {
                setActiveTab('logs')
                if (appLogs.length === 0 && !loadingAppLogs) fetchAppLogs()
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg font-medium text-sm transition cursor-pointer ${
                activeTab === 'logs'
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
              }`}
            >
              <Terminal className="w-4 h-4" />
              Diagnostic Logs
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
            <button
              onClick={() => setActiveTab('about')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg font-medium text-sm transition cursor-pointer ${
                activeTab === 'about'
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
              }`}
            >
              <Info className="w-4 h-4" />
              About TauKudu
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
              : activeTab === 'emptyfolders'
              ? 'Empty Folder Scanner & Removal'
              : activeTab === 'largefiles'
              ? 'Large File Hunter & Analyzer'
              : activeTab === 'leftovers'
              ? 'Uninstalled Software Leftovers Cleaner'
              : activeTab === 'restore'
              ? 'Windows System Restore Points Management'
              : activeTab === 'disk'
              ? 'Disk Space & Treemap Analyzer'
              : activeTab === 'repair'
              ? 'SSD TRIM & Filesystem Integrity Repair'
              : activeTab === 'drivehealth'
              ? 'Physical Storage S.M.A.R.T. Health & Wear Monitor'
              : activeTab === 'bsod'
              ? 'BSOD Crash Dump & Bugcheck Stop Code Analyzer'
              : activeTab === 'power'
              ? 'Battery Health, Capacity & Power Scheme Manager'
              : activeTab === 'vss'
              ? 'Volume Shadow Copy (VSS) & System Storage Quota'
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
              : activeTab === 'gamingcleaner'
              ? 'Gaming Launchers, DirectX Shaders & Steam Redistributables'
              : activeTab === 'eventlogs'
              ? 'Windows Event Logs (.evtx), Crash Dumps & Diagnostics'
              : activeTab === 'winupdate'
              ? 'Windows Update & SoftwareDistribution Cache Cleaner'
              : activeTab === 'registry'
              ? 'Windows Registry Orphan Cleaner'
              : activeTab === 'shortcuts'
              ? 'Broken & Invalid Desktop / Start Menu Shortcuts'
              : activeTab === 'databases'
              ? 'Browser & App SQLite Database VACUUM & Optimizer'
              : activeTab === 'env'
              ? 'Windows Environment Variables & Dead PATH Cleaner'
              : activeTab === 'cache'
              ? 'Windows Explorer Icon, Thumbnail & Font Cache Rebuilder'
              : activeTab === 'ram'
              ? 'Real-Time Memory RAM Optimizer & Working Set Trimmer'
              : activeTab === 'safety'
              ? 'Offline Program & Startup Safety Intelligence Advisor'
              : activeTab === 'hosts'
              ? 'Windows Hosts File Security & Telemetry Blocker'
              : activeTab === 'devcache'
              ? 'Developer Ecosystem & Package Cache Sweeper'
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
              : activeTab === 'metrics'
              ? 'Prometheus OpenMetrics Telemetry Exporter'
              : activeTab === 'logs'
              ? 'Application Diagnostics & Activity Logging'
              : activeTab === 'settings'
              ? 'Application Settings & Internationalization'
              : activeTab === 'about'
              ? 'About TauKudu & Open-Source Integrity'
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
            ) : activeTab === 'emptyfolders' ? (
              <button
                onClick={handleScanEmptyFolders}
                className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-md bg-white/[0.05] hover:bg-white/[0.08] text-zinc-300 transition cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Rescan Empty Folders
              </button>
            ) : activeTab === 'largefiles' ? (
              <button
                onClick={handleScanLargeFiles}
                className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-md bg-white/[0.05] hover:bg-white/[0.08] text-zinc-300 transition cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Rescan Large Files
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
            ) : activeTab === 'logs' ? (
              <button
                onClick={() => fetchAppLogs()}
                className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-md bg-white/[0.05] hover:bg-white/[0.08] text-zinc-300 transition cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Refresh Logs
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
            ) : activeTab === 'metrics' ? (
              <button
                onClick={fetchPrometheusMetrics}
                className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-md bg-white/[0.05] hover:bg-white/[0.08] text-zinc-300 transition cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Refresh Metrics
              </button>
            ) : activeTab === 'schedules' ? (
              <button
                onClick={fetchSchedules}
                className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-md bg-white/[0.05] hover:bg-white/[0.08] text-zinc-300 transition cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Refresh Schedules
              </button>
            ) : activeTab === 'malware' ? (
              <button
                onClick={() => handleRunMalwareScan('quick')}
                className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-md bg-white/[0.05] hover:bg-white/[0.08] text-zinc-300 transition cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Rescan Malware
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

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-[#16161a] border border-[#2a2a36]">
                <div className="flex items-center gap-2 text-zinc-400 text-xs font-medium mb-2">
                  <HardDrive className="w-4 h-4 text-blue-400" />
                  Operating System
                </div>
                <div className="text-base font-bold text-white truncate">
                  {overview?.os_name || 'Loading...'}
                </div>
                <div className="text-[11px] text-zinc-500 mt-1">
                  Build: {overview?.os_version || 'N/A'}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#16161a] border border-[#2a2a36]">
                <div className="flex items-center gap-2 text-zinc-400 text-xs font-medium mb-2">
                  <Cpu className="w-4 h-4 text-emerald-400" />
                  CPU Cores
                </div>
                <div className="text-base font-bold text-white">
                  {overview?.cpu_count ? `${overview.cpu_count} Logical Cores` : 'Loading...'}
                </div>
                <div className="text-[11px] text-zinc-500 mt-1">
                  Parallel Rayon Traversal Ready
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#16161a] border border-[#2a2a36]">
                <div className="flex items-center gap-2 text-zinc-400 text-xs font-medium mb-2">
                  <Activity className="w-4 h-4 text-purple-400" />
                  Physical Memory
                </div>
                <div className="text-base font-bold text-white">
                  {overview ? `${formatBytes(overview.used_memory_bytes)} / ${formatBytes(overview.total_memory_bytes)}` : 'Loading...'}
                </div>
                <div className="text-[11px] text-zinc-500 mt-1">
                  Usage: {overview ? Math.round((overview.used_memory_bytes / overview.total_memory_bytes) * 100) : 0}% Active
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#16161a] border border-[#2a2a36]">
                <div className="flex items-center gap-2 text-zinc-400 text-xs font-medium mb-2">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  Security Posture
                </div>
                <div className="text-base font-bold text-white truncate">
                  {securityPosture?.primary_antivirus || (securityPosture?.is_elevated_admin ? 'Elevated Admin' : 'Active Protected')}
                </div>
                <div className="text-[11px] text-zinc-500 mt-1">
                  {securityPosture?.is_elevated_admin ? 'Admin Privilege: YES' : 'Standard User Mode'}
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

            {/* Detailed Deleted Items from $I Metadata */}
            {recycleSummary && recycleSummary.items.length > 0 && (
              <div className="p-5 rounded-xl bg-[#16161a] border border-[#2a2a36] space-y-3">
                <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                  Deleted Items in Bin (Parsed from $I Windows Metadata)
                </h3>
                <div className="space-y-1.5 max-h-72 overflow-y-auto">
                  {recycleSummary.items.slice(0, 50).map((item) => (
                    <div key={item.id} className="flex justify-between items-center p-2 rounded-lg bg-black/30 text-xs font-mono">
                      <div className="space-y-0.5 truncate max-w-xl">
                        <span className="text-white font-semibold">{item.file_name}</span>
                        <p className="text-[10px] text-zinc-500 truncate">{item.original_path}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-amber-400">{formatBytes(item.size_bytes)}</span>
                        <p className="text-[10px] text-zinc-500">{item.deleted_timestamp}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
        ) : activeTab === 'duplicates' ? (
          /* Duplicate Finder Page */
          <div className="p-8 max-w-6xl space-y-6">
            <div className="p-6 rounded-2xl bg-[#16161a] border border-[#2a2a36] flex justify-between items-center">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-bold text-white">
                    Duplicate Finder (Czkawka 3-Stage Blake3)
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono">
                    {dupResult ? `${dupResult.total_duplicates} duplicates (${formatBytes(dupResult.reclaimable_space)})` : 'Ready'}
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mt-1">
                  {dupStatus || `Scanned ${dupResult?.files_scanned || 0} files in ${dupResult?.scan_duration_ms || 0}ms.`}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleScanDuplicates}
                  disabled={dupScanning}
                  className="px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] text-zinc-300 font-semibold text-xs transition flex items-center gap-2 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${dupScanning ? 'animate-spin' : ''}`} />
                  {dupScanning ? 'Hashing Files...' : 'Scan Duplicates'}
                </button>
                <button
                  onClick={handleDeleteSelectedDuplicates}
                  disabled={selectedDupPaths.size === 0}
                  className="px-4 py-2 rounded-xl bg-red-500 hover:bg-red-400 text-white font-semibold text-xs transition flex items-center gap-2 shadow-lg shadow-red-500/20 cursor-pointer disabled:opacity-50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Purge Selected ({selectedDupPaths.size})
                </button>
              </div>
            </div>

            {/* Target Directory Input */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-[#16161a] border border-[#2a2a36]">
              <FolderOpen className="w-4 h-4 text-amber-400" />
              <input
                type="text"
                value={dupDir}
                onChange={(e) => setDupDir(e.target.value)}
                placeholder="Enter search directory path (e.g. D:\Projects)..."
                className="flex-1 bg-transparent border-none text-xs text-zinc-200 focus:outline-none font-mono"
              />
            </div>

            {/* Duplicate Groups */}
            {dupResult && dupResult.groups.length > 0 ? (
              <div className="space-y-3">
                {dupResult.groups.map((group, gIdx) => (
                  <div key={group.hash || gIdx} className="p-4 rounded-xl bg-[#16161a] border border-[#2a2a36] space-y-2">
                    <div className="flex justify-between items-center pb-2 border-b border-white/[0.05]">
                      <div className="flex items-center gap-2">
                        <CopyCheck className="w-4 h-4 text-amber-400" />
                        <span className="text-xs font-mono font-semibold text-white truncate max-w-md">
                          Blake3: {group.hash.slice(0, 16)}...
                        </span>
                        <span className="text-[10px] text-zinc-500 font-mono">({group.files.length} clones)</span>
                      </div>
                      <span className="text-xs font-mono font-bold text-amber-400">
                        {formatBytes(group.size)} each
                      </span>
                    </div>

                    <div className="space-y-1.5 pt-1">
                      {group.files.map((file, fIdx) => (
                        <div
                          key={file.path}
                          className="flex items-center justify-between p-2 rounded-lg bg-black/30 border border-white/[0.02] text-xs font-mono"
                        >
                          <div className="flex items-center gap-2.5 truncate max-w-2xl">
                            <input
                              type="checkbox"
                              checked={selectedDupPaths.has(file.path)}
                              onChange={(e) => {
                                const next = new Set(selectedDupPaths)
                                if (e.target.checked) next.add(file.path)
                                else next.delete(file.path)
                                setSelectedDupPaths(next)
                              }}
                              className="rounded border-zinc-700 text-amber-500 focus:ring-amber-500 cursor-pointer"
                            />
                            <span className={fIdx === 0 ? 'text-emerald-400 truncate' : 'text-zinc-300 truncate'}>
                              {fIdx === 0 ? '[Original] ' : '[Duplicate] '} {file.path}
                            </span>
                          </div>
                          <span className="text-[10px] text-zinc-500 shrink-0">
                            {formatBytes(file.size)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center rounded-2xl bg-[#16161a] border border-[#2a2a36] space-y-3">
                <CopyCheck className="w-8 h-8 text-zinc-600 mx-auto" />
                <p className="text-xs text-zinc-400">
                  {dupScanning ? 'Scanning and generating multi-stage Blake3 file hashes...' : 'No duplicate files found in selected directory.'}
                </p>
              </div>
            )}
          </div>
        ) : activeTab === 'emptyfolders' ? (
          /* Empty Folders Page */
          <div className="p-8 max-w-6xl space-y-6">
            <div className="p-6 rounded-2xl bg-[#16161a] border border-[#2a2a36] flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-white">
                  Empty Folder Cleaner: {emptyFolderResult?.total_count || 0} Empty Directories
                </h2>
                <p className="text-xs text-zinc-400 mt-1">
                  {emptyFolderFeedback || `Scanned recursively in ${emptyFolderResult?.scan_duration_ms || 0}ms.`}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleScanEmptyFolders}
                  disabled={emptyFolderScanning}
                  className="px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] text-zinc-300 font-semibold text-xs transition flex items-center gap-2 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${emptyFolderScanning ? 'animate-spin' : ''}`} />
                  {emptyFolderScanning ? 'Scanning...' : 'Scan Empty Folders'}
                </button>
                <button
                  onClick={handleDeleteEmptyFolders}
                  disabled={selectedEmptyFolderPaths.size === 0}
                  className="px-4 py-2 rounded-xl bg-red-500 hover:bg-red-400 text-white font-semibold text-xs transition flex items-center gap-2 shadow-lg shadow-red-500/20 cursor-pointer disabled:opacity-50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete Selected ({selectedEmptyFolderPaths.size})
                </button>
              </div>
            </div>

            {/* Target Directory Input */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-[#16161a] border border-[#2a2a36]">
              <FolderX className="w-4 h-4 text-amber-400" />
              <input
                type="text"
                value={emptyFolderDir}
                onChange={(e) => setEmptyFolderDir(e.target.value)}
                placeholder="Enter search directory path..."
                className="flex-1 bg-transparent border-none text-xs text-zinc-200 focus:outline-none font-mono"
              />
            </div>

            {/* Empty Folders List */}
            {emptyFolderResult && emptyFolderResult.folders.length > 0 ? (
              <div className="space-y-2">
                {emptyFolderResult.folders.map((folder) => (
                  <div
                    key={folder.path}
                    className="p-3.5 rounded-xl bg-[#16161a] border border-[#2a2a36] flex justify-between items-center"
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={selectedEmptyFolderPaths.has(folder.path)}
                        onChange={(e) => {
                          const next = new Set(selectedEmptyFolderPaths)
                          if (e.target.checked) next.add(folder.path)
                          else next.delete(folder.path)
                          setSelectedEmptyFolderPaths(next)
                        }}
                        className="rounded border-zinc-700 text-amber-500 focus:ring-amber-500 cursor-pointer"
                      />
                      <div>
                        <span className="text-sm font-semibold text-white">{folder.name}</span>
                        <p className="text-[11px] text-zinc-400 font-mono">{folder.path}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center rounded-2xl bg-[#16161a] border border-[#2a2a36] space-y-3">
                <FolderX className="w-8 h-8 text-zinc-600 mx-auto" />
                <p className="text-xs text-zinc-400">
                  {emptyFolderScanning ? 'Traversing directory trees...' : 'No empty folders detected.'}
                </p>
              </div>
            )}
          </div>
        ) : activeTab === 'largefiles' ? (
          /* Large File Finder Page */
          <div className="p-8 max-w-6xl space-y-6">
            <div className="p-6 rounded-2xl bg-[#16161a] border border-[#2a2a36] flex justify-between items-center">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-bold text-white">
                    Large File Finder: {largeFilesResult?.total_count || 0} Files
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono">
                    {formatBytes(largeFilesResult?.total_size_bytes || 0)} Total
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mt-1">
                  {largeFilesFeedback || `Scanned in ${largeFilesResult?.scan_duration_ms || 0}ms.`}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleScanLargeFiles}
                  disabled={largeFilesScanning}
                  className="px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] text-zinc-300 font-semibold text-xs transition flex items-center gap-2 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${largeFilesScanning ? 'animate-spin' : ''}`} />
                  {largeFilesScanning ? 'Scanning...' : 'Scan Large Files'}
                </button>
                <button
                  onClick={handleDeleteSelectedLargeFiles}
                  disabled={selectedLargeFilePaths.size === 0}
                  className="px-4 py-2 rounded-xl bg-red-500 hover:bg-red-400 text-white font-semibold text-xs transition flex items-center gap-2 shadow-lg shadow-red-500/20 cursor-pointer disabled:opacity-50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete Selected ({selectedLargeFilePaths.size})
                </button>
              </div>
            </div>

            {/* Target Directory & Preset Threshold Input */}
            <div className="flex gap-3">
              <div className="flex-1 flex items-center gap-3 p-3 rounded-xl bg-[#16161a] border border-[#2a2a36]">
                <FileUp className="w-4 h-4 text-amber-400" />
                <input
                  type="text"
                  value={largeFilesDir}
                  onChange={(e) => setLargeFilesDir(e.target.value)}
                  placeholder="Enter search directory path..."
                  className="flex-1 bg-transparent border-none text-xs text-zinc-200 focus:outline-none font-mono"
                />
              </div>
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#16161a] border border-[#2a2a36]">
                <span className="text-xs text-zinc-400">Min Size:</span>
                <select
                  value={largeFilesMinSize}
                  onChange={(e) => setLargeFilesMinSize(Number(e.target.value))}
                  className="bg-zinc-900 border border-zinc-700 rounded text-xs text-white px-2 py-1 focus:outline-none"
                >
                  <option value={10_485_760}>10 MB</option>
                  <option value={52_428_800}>50 MB</option>
                  <option value={104_857_600}>100 MB</option>
                  <option value={524_288_000}>500 MB</option>
                  <option value={1_073_741_824}>1 GB</option>
                </select>
              </div>
            </div>

            {/* Large Files List */}
            {largeFilesResult && largeFilesResult.files.length > 0 ? (
              <div className="space-y-2">
                {largeFilesResult.files.map((file) => (
                  <div
                    key={file.path}
                    className="p-3.5 rounded-xl bg-[#16161a] border border-[#2a2a36] flex justify-between items-center"
                  >
                    <div className="flex items-center gap-3 truncate max-w-2xl">
                      <input
                        type="checkbox"
                        checked={selectedLargeFilePaths.has(file.path)}
                        onChange={(e) => {
                          const next = new Set(selectedLargeFilePaths)
                          if (e.target.checked) next.add(file.path)
                          else next.delete(file.path)
                          setSelectedLargeFilePaths(next)
                        }}
                        className="rounded border-zinc-700 text-amber-500 focus:ring-amber-500 cursor-pointer"
                      />
                      <div className="truncate">
                        <span className="text-sm font-semibold text-white">{file.name}</span>
                        <p className="text-[11px] text-zinc-400 font-mono truncate">{file.path}</p>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-bold text-amber-400 shrink-0">
                      {formatBytes(file.size_bytes)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center rounded-2xl bg-[#16161a] border border-[#2a2a36] space-y-3">
                <FileUp className="w-8 h-8 text-zinc-600 mx-auto" />
                <p className="text-xs text-zinc-400">
                  {largeFilesScanning ? 'Scanning for oversized files...' : 'No large files detected exceeding threshold.'}
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
        ) : activeTab === 'metrics' ? (
          /* Prometheus Metrics Page */
          <div className="p-8 max-w-6xl space-y-6">
            <div className="p-6 rounded-2xl bg-[#16161a] border border-[#2a2a36] flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-white">Prometheus OpenMetrics Telemetry Exporter</h2>
                <p className="text-xs text-zinc-400 mt-1">
                  {metricsFeedback || 'Standardized metrics formatted for local observability, Grafana dashboards, and system profiling.'}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={fetchPrometheusMetrics}
                  disabled={loadingMetrics}
                  className="px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] text-zinc-300 font-semibold text-xs transition flex items-center gap-2 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingMetrics ? 'animate-spin' : ''}`} />
                  {loadingMetrics ? 'Scraping Metrics...' : 'Scrape Metrics'}
                </button>
              </div>
            </div>

            {/* Metrics Breakdown Cards */}
            {prometheusMetrics && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {prometheusMetrics.metrics.slice(0, 6).map((m) => (
                    <div key={m.name} className="p-4 rounded-xl bg-[#16161a] border border-[#2a2a36] space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-semibold text-white truncate max-w-xs">{m.name}</span>
                        <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-[10px] font-mono text-amber-400 uppercase">
                          {m.type}
                        </span>
                      </div>
                      <div className="text-base font-mono font-bold text-amber-400">{m.value}</div>
                      <p className="text-[10px] text-zinc-500">{m.help}</p>
                    </div>
                  ))}
                </div>

                {/* Raw Prometheus Text Preview */}
                <div className="p-5 rounded-xl bg-[#16161a] border border-[#2a2a36] space-y-2">
                  <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Raw OpenMetrics Payload Preview</h3>
                  <pre className="p-4 rounded-lg bg-black/60 border border-zinc-800 text-[11px] font-mono text-zinc-300 overflow-x-auto max-h-80 select-all">
                    {prometheusMetrics.raw_prometheus_text}
                  </pre>
                </div>
              </div>
            )}
          </div>
        ) : activeTab === 'logs' ? (
          /* Application Diagnostic Logs Page */
          <div className="p-8 max-w-6xl space-y-6">
            <div className="p-6 rounded-2xl bg-[#16161a] border border-[#2a2a36] flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-white">Application Diagnostic Logs</h2>
                <p className="text-xs text-zinc-400 mt-1">
                  {appLogFeedback || `Log File: ${appLogStats?.log_file_path || 'taukudu.log'} (${formatBytes(appLogStats?.log_file_size_bytes || 0)}) • ${appLogStats?.error_count || 0} errors / ${appLogStats?.warn_count || 0} warnings recorded.`}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => fetchAppLogs()}
                  disabled={loadingAppLogs}
                  className="px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] text-zinc-300 font-semibold text-xs transition flex items-center gap-2 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingAppLogs ? 'animate-spin' : ''}`} />
                  {loadingAppLogs ? 'Reloading...' : 'Reload Logs'}
                </button>
                <button
                  onClick={handleClearAppLogs}
                  disabled={appLogs.length === 0}
                  className="px-4 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 text-xs font-semibold transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Clear Logs
                </button>
              </div>
            </div>

            {/* Level Filter Switcher */}
            <div className="flex gap-2">
              {['ALL', 'INFO', 'WARN', 'ERROR'].map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => {
                    setLogFilterLevel(lvl)
                    fetchAppLogs(lvl === 'ALL' ? undefined : lvl)
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    logFilterLevel === lvl
                      ? 'bg-amber-500 text-black font-bold'
                      : 'bg-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>

            {/* Logs List */}
            {appLogs.length > 0 ? (
              <div className="space-y-1.5 font-mono text-[11px]">
                {appLogs.map((log, idx) => (
                  <div
                    key={`${log.timestamp}-${idx}`}
                    className={`p-3 rounded-lg border flex justify-between items-start gap-4 ${
                      log.level === 'ERROR'
                        ? 'bg-red-500/10 border-red-500/30 text-red-300'
                        : log.level === 'WARN'
                        ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                        : 'bg-[#16161a] border-white/[0.04] text-zinc-300'
                    }`}
                  >
                    <div className="space-y-0.5 flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                          log.level === 'ERROR'
                            ? 'bg-red-500 text-white'
                            : log.level === 'WARN'
                            ? 'bg-amber-500 text-black'
                            : 'bg-zinc-800 text-zinc-400'
                        }`}>
                          {log.level}
                        </span>
                        {log.source && <span className="text-zinc-500">[{log.source}]</span>}
                        <span className="text-zinc-500 text-[10px]">{log.timestamp}</span>
                      </div>
                      <p className="break-all mt-1">{log.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center rounded-2xl bg-[#16161a] border border-[#2a2a36] space-y-3">
                <Terminal className="w-8 h-8 text-zinc-600 mx-auto" />
                <p className="text-xs text-zinc-400">No application diagnostic logs recorded.</p>
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

            {/* GPU & Hardware Acceleration Control */}
            <div className="p-6 rounded-2xl bg-[#16161a] border border-[#2a2a36] space-y-3">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-semibold text-white">GPU Hardware Acceleration & Graphics Fallback</h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Adapter: {gpuInfo?.adapter_name || 'Generic'} • Driver: {gpuInfo?.driver_version || 'N/A'} • Mode: <span className="text-amber-400 font-semibold">{gpuInfo?.rendering_mode || 'Auto'}</span>
                  </p>
                </div>
                <button
                  onClick={() => handleToggleGpuAcceleration(!gpuInfo?.is_hardware_acceleration_disabled)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                    gpuInfo?.is_hardware_acceleration_disabled
                      ? 'bg-amber-500 text-black font-bold'
                      : 'bg-zinc-800 text-zinc-300 hover:text-white'
                  }`}
                >
                  {gpuInfo?.is_hardware_acceleration_disabled ? 'Enable Hardware GPU' : 'Force Software Fallback'}
                </button>
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
        ) : activeTab === 'about' ? (
          /* About Page */
          <div className="p-8 max-w-5xl space-y-6">
            <div className="p-6 rounded-2xl bg-[#16161a] border border-[#2a2a36] flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-500 font-extrabold text-2xl">
                  T
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">TauKudu v0.1.0</h2>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    High-Performance Native System Optimizer, Security Suite, and Deep Cleaner.
                  </p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                Pure Rust + Tauri v2
              </span>
            </div>

            {/* Architecture Stack & Concepts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-xl bg-[#16161a] border border-[#2a2a36] space-y-2">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Engine Architecture
                </h3>
                <ul className="text-xs text-zinc-400 space-y-1.5 list-disc list-inside">
                  <li><strong className="text-zinc-200">Rust Core:</strong> Native Win32 syscalls via windows-rs & winreg</li>
                  <li><strong className="text-zinc-200">BleachBit Rules:</strong> 100+ XML CleanerML parser & pattern matcher</li>
                  <li><strong className="text-zinc-200">Czkawka Concept:</strong> 3-stage Blake3 deduplication engine</li>
                  <li><strong className="text-zinc-200">ripgrep Traversal:</strong> Parallel multi-core Rayon directory walk</li>
                  <li><strong className="text-zinc-200">Local Ledger:</strong> SQLite audit trail + append-only JSONL</li>
                </ul>
              </div>

              <div className="p-5 rounded-xl bg-[#16161a] border border-[#2a2a36] space-y-2">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Globe className="w-4 h-4 text-blue-400" />
                  Privacy & Telemetry Guarantee
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  TauKudu guarantees 100% offline local execution. Zero telemetry, zero analytics tracking, and zero data uploads by default. All scanning, registry fixes, and audit trails remain strictly on your local machine.
                </p>
              </div>
            </div>

            {/* Open Source Links */}
            <div className="p-5 rounded-xl bg-[#16161a] border border-[#2a2a36] flex justify-between items-center">
              <div className="space-y-0.5">
                <span className="text-sm font-semibold text-white">Release & Update Center</span>
                <p className="text-xs text-zinc-500">
                  {appReleaseInfo ? `Latest version: v${appReleaseInfo.latest_version} (Checked: ${appReleaseInfo.checked_at.slice(0, 10)})` : 'Official release builds verified via GitHub release signatures.'}
                </p>
              </div>
              <button
                onClick={handleCheckAppUpdate}
                disabled={checkingAppRelease}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${checkingAppRelease ? 'animate-spin' : ''}`} />
                {checkingAppRelease ? 'Checking...' : 'Check for Updates'}
              </button>
            </div>

            {/* Open Source Links */}
            <div className="p-5 rounded-xl bg-[#16161a] border border-[#2a2a36] flex justify-between items-center">
              <div className="space-y-0.5">
                <span className="text-sm font-semibold text-white">Open Source Community</span>
                <p className="text-xs text-zinc-500">Released under the MIT License • Built for precision and performance.</p>
              </div>
              <a
                href="https://github.com/wiradigitalid/taukudu"
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] text-zinc-200 text-xs font-semibold flex items-center gap-2 transition cursor-pointer"
              >
                <span>GitHub Repository</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        ) : activeTab === 'malware' ? (
          /* Malware Scanner Page */
          <div className="p-8 max-w-6xl space-y-6">
            <div className="p-6 rounded-2xl bg-[#16161a] border border-[#2a2a36] flex justify-between items-center">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-bold text-white">
                    Heuristic Malware & Threat Scanner ({malwareResult?.threats.length || 0} Detections)
                  </h2>
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                    (malwareResult?.threats.length || 0) > 0
                      ? 'bg-red-500/10 text-red-400 border-red-500/20 animate-pulse'
                      : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  }`}>
                    {(malwareResult?.threats.length || 0) > 0 ? 'Threats Found' : 'System Secure'}
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mt-1">
                  {malwareStatus || `Scanned ${malwareResult?.files_scanned || 0} critical binaries & persistence hooks in ${malwareResult?.duration_ms || 0}ms.`}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleRunMalwareScan('quick')}
                  disabled={malwareScanning}
                  className="px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] text-zinc-300 font-semibold text-xs transition flex items-center gap-2 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${malwareScanning ? 'animate-spin' : ''}`} />
                  {malwareScanning ? 'Scanning...' : 'Quick Scan'}
                </button>
                <button
                  onClick={() => handleRunMalwareScan('full')}
                  disabled={malwareScanning}
                  className="px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] text-zinc-300 font-semibold text-xs transition flex items-center gap-2 cursor-pointer"
                >
                  <Search className="w-3.5 h-3.5" />
                  Full System Scan
                </button>
                <button
                  onClick={handleQuarantineThreats}
                  disabled={selectedThreatPaths.size === 0}
                  className="px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/30 font-semibold text-xs transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Archive className="w-3.5 h-3.5" />
                  Quarantine Selected ({selectedThreatPaths.size})
                </button>
                <button
                  onClick={handleDeleteThreats}
                  disabled={selectedThreatPaths.size === 0}
                  className="px-4 py-2 rounded-xl bg-red-500 hover:bg-red-400 text-white font-semibold text-xs transition flex items-center gap-2 shadow-lg shadow-red-500/20 cursor-pointer disabled:opacity-50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete Permanently
                </button>
              </div>
            </div>

            {/* Sub-view Switcher (Threat Scanner vs YARA Rules Manager) */}
            <div className="flex border-b border-[#2a2a36] gap-6 text-sm font-semibold">
              <button
                onClick={() => setActiveMalwareSubTab('scanner')}
                className={`pb-3 transition cursor-pointer flex items-center gap-2 ${
                  activeMalwareSubTab === 'scanner'
                    ? 'text-amber-400 border-b-2 border-amber-400'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <Bug className="w-4 h-4" />
                Threat Scanner ({malwareResult?.threats.length || 0})
              </button>
              <button
                onClick={() => {
                  setActiveMalwareSubTab('rules')
                  if (yaraRules.length === 0) fetchYaraRules()
                }}
                className={`pb-3 transition cursor-pointer flex items-center gap-2 ${
                  activeMalwareSubTab === 'rules'
                    ? 'text-amber-400 border-b-2 border-amber-400'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <FileCode className="w-4 h-4" />
                YARA Rules Store ({yaraMetadata?.rules_count || yaraRules.length})
              </button>
            </div>

            {activeMalwareSubTab === 'scanner' ? (
              /* Threats List */
              malwareResult && malwareResult.threats.length > 0 ? (
                <div className="space-y-3">
                  {malwareResult.threats.map((threat) => (
                    <div
                      key={threat.id}
                      className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex justify-between items-center"
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={selectedThreatPaths.has(threat.path)}
                          onChange={(e) => {
                            const next = new Set(selectedThreatPaths)
                            if (e.target.checked) next.add(threat.path)
                            else next.delete(threat.path)
                            setSelectedThreatPaths(next)
                          }}
                          className="rounded border-zinc-700 text-red-500 focus:ring-red-500 cursor-pointer"
                        />
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2.5">
                            <span className="text-sm font-bold text-red-400">{threat.detection_name}</span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-red-500/20 text-red-300">
                              {threat.severity}
                            </span>
                            <span className="text-xs font-mono text-zinc-400">({formatBytes(threat.size)})</span>
                          </div>
                          <p className="text-xs text-zinc-300 font-mono">{threat.path}</p>
                          <p className="text-[11px] text-zinc-400">{threat.details}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center rounded-2xl bg-[#16161a] border border-[#2a2a36] space-y-3">
                  <ShieldCheck className="w-8 h-8 text-emerald-500 mx-auto" />
                  <p className="text-xs text-zinc-400">
                    {malwareScanning ? 'Inspecting memory locations and critical system executables...' : 'No masquerading system binaries or deceptive executables detected.'}
                  </p>
                </div>
              )
            ) : (
              /* YARA Rules Manager View */
              <div className="space-y-4">
                <div className="p-5 rounded-xl bg-[#16161a] border border-[#2a2a36] space-y-3">
                  <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Add Custom YARA Threat Signature</h3>
                  <input
                    type="text"
                    value={newRuleName}
                    onChange={(e) => setNewRuleName(e.target.value)}
                    placeholder="Rule filename (e.g. custom_trojan.yar)..."
                    className="w-full px-3 py-2 rounded-lg bg-black/40 border border-zinc-700 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                  />
                  <textarea
                    value={newRuleContent}
                    onChange={(e) => setNewRuleContent(e.target.value)}
                    placeholder="Enter YARA rule syntax (rule Name { strings: ... condition: ... })..."
                    rows={4}
                    className="w-full px-3 py-2 rounded-lg bg-black/40 border border-zinc-700 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                  />
                  <button
                    onClick={handleSaveYaraRule}
                    className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Save Rule Signature
                  </button>
                </div>

                {/* Rules List */}
                <div className="space-y-2">
                  {yaraRules.map((rule) => (
                    <div
                      key={rule.filename}
                      className="p-3.5 rounded-xl bg-[#16161a] border border-[#2a2a36] flex justify-between items-center"
                    >
                      <div className="space-y-0.5">
                        <span className="text-xs font-mono font-bold text-amber-400">{rule.filename}</span>
                        <p className="text-[11px] text-zinc-400">Size: {rule.size_bytes} bytes</p>
                      </div>
                      <button
                        onClick={() => handleDeleteYaraRule(rule.filename)}
                        className="text-xs text-zinc-500 hover:text-red-400 transition cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : activeTab === 'disk' ? (
          /* Disk Analyzer Page */
          <div className="p-8 max-w-6xl space-y-6">
            <div className="p-6 rounded-2xl bg-[#16161a] border border-[#2a2a36] flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-white">Disk Treemap & Space Distribution</h2>
                <p className="text-xs text-zinc-400 mt-1">
                  Recursive sizing and file type distribution on drive {selectedDrivePath} ({formatBytes(diskAnalysis?.total_size_bytes || 0)} analyzed).
                </p>
              </div>
              <button
                onClick={() => fetchDrivesAndAnalyze(selectedDrivePath)}
                disabled={analyzingDisk}
                className="px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] text-zinc-300 font-semibold text-xs transition flex items-center gap-2 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${analyzingDisk ? 'animate-spin' : ''}`} />
                {analyzingDisk ? 'Analyzing...' : 'Rescan Drive'}
              </button>
            </div>

            {/* Drives Selector Bar */}
            <div className="flex gap-3">
              {drives.map((d) => (
                <button
                  key={d.mount_point}
                  onClick={() => fetchDrivesAndAnalyze(d.mount_point)}
                  className={`flex-1 p-4 rounded-xl border text-left transition cursor-pointer ${
                    selectedDrivePath === d.mount_point
                      ? 'bg-[#16161a] border-amber-500/40 text-amber-400 shadow-lg shadow-amber-500/10'
                      : 'bg-[#16161a] border-[#2a2a36] text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-sm text-white">{d.mount_point}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300">{d.file_system}</span>
                  </div>
                  <div className="text-xs font-mono font-semibold text-amber-400">
                    {formatBytes(d.available_space_bytes)} free / {formatBytes(d.total_space_bytes)}
                  </div>
                </button>
              ))}
            </div>

            {/* File Type Breakdown */}
            {diskAnalysis && diskAnalysis.file_types.length > 0 && (
              <div className="p-5 rounded-xl bg-[#16161a] border border-[#2a2a36] space-y-3">
                <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Storage by File Type</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {diskAnalysis.file_types.map((ft) => (
                    <div key={ft.extension} className="p-3 rounded-lg bg-black/40 border border-zinc-800">
                      <span className="text-xs font-mono font-bold text-amber-400 uppercase">.{ft.extension}</span>
                      <div className="text-sm font-bold text-white mt-0.5">{formatBytes(ft.total_size_bytes)}</div>
                      <p className="text-[10px] text-zinc-500">{ft.count} files</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : activeTab === 'repair' ? (
          /* Disk Maintenance & Repair Page */
          <div className="p-8 max-w-6xl space-y-6">
            <div className="p-6 rounded-2xl bg-[#16161a] border border-[#2a2a36] flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-white">SSD TRIM & Filesystem Integrity Repair</h2>
                <p className="text-xs text-zinc-400 mt-1">
                  {trimFeedback || 'Run SSD ReTrim, SFC file checker, DISM component store repair, and volume CHKDSK.'}
                </p>
              </div>
            </div>

            {/* TRIM Action Cards */}
            <div className="p-5 rounded-xl bg-[#16161a] border border-[#2a2a36] space-y-3">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                SSD Solid State Drive ReTrim
              </h3>
              <div className="flex gap-4">
                {trimDrives.map((td) => (
                  <div key={td.drive_letter} className="flex-1 p-4 rounded-xl bg-black/30 border border-zinc-800 flex justify-between items-center">
                    <div>
                      <span className="text-sm font-bold text-white">Drive ({td.drive_letter})</span>
                      <p className="text-xs text-zinc-400 mt-0.5">{td.last_status}</p>
                    </div>
                    <button
                      onClick={() => handleRunTrim(td.drive_letter)}
                      className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs transition cursor-pointer"
                    >
                      ReTrim Drive
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* System Repair Tools */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 rounded-xl bg-[#16161a] border border-[#2a2a36] space-y-2">
                <h3 className="text-sm font-semibold text-white">SFC Integrity Check</h3>
                <p className="text-xs text-zinc-400">Verifies Windows core system file integrity via System File Checker.</p>
                <button
                  onClick={handleRunSfc}
                  disabled={runningRepair === 'sfc'}
                  className="w-full py-2 rounded-lg bg-white/[0.05] hover:bg-white/[0.08] text-zinc-200 text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <RefreshCw className={`w-3 h-3 ${runningRepair === 'sfc' ? 'animate-spin' : ''}`} />
                  {runningRepair === 'sfc' ? 'Running SFC...' : 'Verify System Files'}
                </button>
              </div>

              <div className="p-5 rounded-xl bg-[#16161a] border border-[#2a2a36] space-y-2">
                <h3 className="text-sm font-semibold text-white">DISM Component Store</h3>
                <p className="text-xs text-zinc-400">Checks Windows Component Store corruption using Deployment Image Servicing.</p>
                <button
                  onClick={handleRunDism}
                  disabled={runningRepair === 'dism'}
                  className="w-full py-2 rounded-lg bg-white/[0.05] hover:bg-white/[0.08] text-zinc-200 text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <RefreshCw className={`w-3 h-3 ${runningRepair === 'dism' ? 'animate-spin' : ''}`} />
                  {runningRepair === 'dism' ? 'Checking DISM...' : 'Check Image Health'}
                </button>
              </div>

              <div className="p-5 rounded-xl bg-[#16161a] border border-[#2a2a36] space-y-2">
                <h3 className="text-sm font-semibold text-white">CHKDSK Volume Scan</h3>
                <p className="text-xs text-zinc-400">Performs live non-invasive read scan for NTFS volume anomalies.</p>
                <button
                  onClick={() => handleRunChkdsk('C')}
                  disabled={runningRepair === 'chkdsk'}
                  className="w-full py-2 rounded-lg bg-white/[0.05] hover:bg-white/[0.08] text-zinc-200 text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <RefreshCw className={`w-3 h-3 ${runningRepair === 'chkdsk' ? 'animate-spin' : ''}`} />
                  {runningRepair === 'chkdsk' ? 'Scanning Volume...' : 'Scan C: Volume'}
                </button>
              </div>
            </div>
          </div>
        ) : activeTab === 'drivehealth' ? (
          /* S.M.A.R.T. Drive Health & Life Inspector Page */
          <div className="p-8 max-w-6xl space-y-6">
            <div className="p-6 rounded-2xl bg-[#16161a] border border-[#2a2a36] flex justify-between items-center">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-bold text-white">Physical Storage S.M.A.R.T. Health</h2>
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                    driveHealthSummary?.has_failing_drive
                      ? 'bg-red-500/10 text-red-400 border-red-500/20'
                      : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  }`}>
                    {driveHealthSummary?.has_failing_drive ? 'Drive Alert Detected' : 'All Drives Healthy'}
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mt-1">
                  {driveHealthFeedback || `Inspected ${driveHealthSummary?.total_drives || 0} physical drives via MSFT_PhysicalDisk & Win32_DiskDrive.`}
                </p>
              </div>
              <button
                onClick={fetchDriveHealth}
                disabled={loadingDriveHealth}
                className="px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] text-zinc-300 font-semibold text-xs transition flex items-center gap-2 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingDriveHealth ? 'animate-spin' : ''}`} />
                {loadingDriveHealth ? 'Inspecting...' : 'Re-Inspect Drives'}
              </button>
            </div>

            {/* Drives List */}
            {driveHealthSummary && driveHealthSummary.drives.length > 0 ? (
              <div className="space-y-3">
                {driveHealthSummary.drives.map((d) => (
                  <div
                    key={d.device_id}
                    className="p-5 rounded-xl bg-[#16161a] border border-[#2a2a36] space-y-3"
                  >
                    <div className="flex justify-between items-center pb-2 border-b border-white/[0.05]">
                      <div className="flex items-center gap-3">
                        <HardDrive className="w-5 h-5 text-amber-400" />
                        <div>
                          <span className="text-sm font-bold text-white">{d.model}</span>
                          <span className="text-[10px] text-zinc-500 font-mono ml-2">({d.device_id})</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-800 text-zinc-300 uppercase">
                          {d.bus_type} • {d.media_type}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          d.health_status === 'Healthy'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : 'bg-red-500/10 text-red-400 border-red-500/20'
                        }`}>
                          {d.health_status}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
                      <div className="p-3 rounded-lg bg-black/30 border border-white/[0.03]">
                        <span className="text-zinc-500 text-[10px]">Total Capacity</span>
                        <p className="text-white font-semibold text-sm mt-0.5">{formatBytes(d.size_bytes)}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-black/30 border border-white/[0.03]">
                        <span className="text-zinc-500 text-[10px]">Operational Status</span>
                        <p className="text-emerald-400 font-semibold text-sm mt-0.5">{d.operational_status}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-black/30 border border-white/[0.03]">
                        <span className="text-zinc-500 text-[10px]">Temperature</span>
                        <p className="text-amber-400 font-semibold text-sm mt-0.5">
                          {d.temperature_celsius ? `${d.temperature_celsius} °C` : 'N/A'}
                        </p>
                      </div>
                      <div className="p-3 rounded-lg bg-black/30 border border-white/[0.03]">
                        <span className="text-zinc-500 text-[10px]">Estimated Life / Health</span>
                        <p className="text-emerald-400 font-semibold text-sm mt-0.5">
                          {d.wear_percentage ? `${d.wear_percentage}% Good` : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center rounded-2xl bg-[#16161a] border border-[#2a2a36] space-y-3">
                <HardDrive className="w-8 h-8 text-zinc-600 mx-auto" />
                <p className="text-xs text-zinc-400">
                  {loadingDriveHealth ? 'Querying physical drive controllers...' : 'Click "Re-Inspect Drives" to read S.M.A.R.T. disk telemetry.'}
                </p>
              </div>
            )}
          </div>
        ) : activeTab === 'bsod' ? (
          /* BSOD Crash Dump & Bugcheck Analyzer Page */
          <div className="p-8 max-w-6xl space-y-6">
            <div className="p-6 rounded-2xl bg-[#16161a] border border-[#2a2a36] flex justify-between items-center">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-bold text-white">BSOD Crash Dump & Stop Code Analyzer</h2>
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                    (bsodSummary?.total_crashes_detected || 0) > 0
                      ? 'bg-red-500/10 text-red-400 border-red-500/20'
                      : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  }`}>
                    {(bsodSummary?.total_crashes_detected || 0) > 0 ? `${bsodSummary?.total_crashes_detected} Crashes Recorded` : 'No Crash Dumps Found'}
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mt-1">
                  {bsodFeedback || `Analyzed Minidump and kernel crash dumps with ${bugcheckDb.length} known stop code diagnostics.`}
                </p>
              </div>
              <button
                onClick={fetchBsodAnalysis}
                disabled={loadingBsod}
                className="px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] text-zinc-300 font-semibold text-xs transition flex items-center gap-2 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingBsod ? 'animate-spin' : ''}`} />
                {loadingBsod ? 'Analyzing...' : 'Rescan Dumps'}
              </button>
            </div>

            {/* Crash Reports List */}
            {bsodSummary && bsodSummary.crash_reports.length > 0 ? (
              <div className="space-y-3">
                {bsodSummary.crash_reports.map((cr) => (
                  <div
                    key={cr.id}
                    className="p-5 rounded-xl bg-[#16161a] border border-red-500/30 space-y-3"
                  >
                    <div className="flex justify-between items-center pb-2 border-b border-white/[0.05]">
                      <div className="flex items-center gap-3">
                        <AlertTriangle className="w-5 h-5 text-red-400" />
                        <div>
                          <span className="text-sm font-bold text-white">{cr.stop_code_symbol}</span>
                          <span className="text-[10px] text-zinc-500 font-mono ml-2">({cr.stop_code_hex})</span>
                        </div>
                      </div>
                      <div className="text-right font-mono text-xs text-zinc-400">
                        <span>{cr.crash_time_formatted}</span>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-xs">
                      <p className="text-zinc-300">{cr.stop_code_description}</p>
                      {cr.faulting_module && (
                        <p className="text-[11px] text-zinc-500 font-mono">
                          Probable Cause: <span className="text-amber-400 font-semibold">{cr.faulting_module}</span>
                        </p>
                      )}
                      <div className="p-3 rounded-lg bg-black/40 border border-white/[0.05] space-y-1">
                        <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Recommended Troubleshooting Action</span>
                        <p className="text-zinc-300 text-xs">{cr.recommended_fix}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center rounded-2xl bg-[#16161a] border border-[#2a2a36] space-y-3">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                <p className="text-xs text-zinc-400">
                  {loadingBsod ? 'Scanning Minidump and MEMORY.DMP headers...' : 'System is running stable. No BSOD kernel crash dumps detected.'}
                </p>
              </div>
            )}
          </div>
        ) : activeTab === 'power' ? (
          /* Battery Health & Power Scheme Diagnostics Page */
          <div className="p-8 max-w-6xl space-y-6">
            <div className="p-6 rounded-2xl bg-[#16161a] border border-[#2a2a36] flex justify-between items-center">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-bold text-white">Battery Health & Power Schemes</h2>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Active Plan: {powerSummary?.active_plan_name || 'Balanced'}
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mt-1">
                  {powerFeedback || `Battery wear and powercfg diagnostics.`}
                </p>
              </div>
              <button
                onClick={fetchPowerDiagnostics}
                disabled={loadingPower}
                className="px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] text-zinc-300 font-semibold text-xs transition flex items-center gap-2 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingPower ? 'animate-spin' : ''}`} />
                {loadingPower ? 'Querying...' : 'Refresh Power Info'}
              </button>
            </div>

            {/* Battery Status Card */}
            {powerSummary && (
              <div className="p-5 rounded-xl bg-[#16161a] border border-[#2a2a36] space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-white/[0.05]">
                  <div className="flex items-center gap-2.5">
                    <Battery className="w-5 h-5 text-amber-400" />
                    <span className="text-sm font-bold text-white">{powerSummary.battery.device_name}</span>
                    <span className="text-[10px] text-zinc-500 font-mono">({powerSummary.battery.manufacturer})</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-zinc-800 text-zinc-300">
                    {powerSummary.battery.status}
                  </span>
                </div>

                {powerSummary.battery.has_battery ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
                    <div className="p-3 rounded-lg bg-black/30 border border-white/[0.03]">
                      <span className="text-zinc-500 text-[10px]">Battery Health / Max Capacity</span>
                      <p className="text-emerald-400 font-semibold text-sm mt-0.5">
                        {powerSummary.battery.health_percentage.toFixed(1)}% Good
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-black/30 border border-white/[0.03]">
                      <span className="text-zinc-500 text-[10px]">Current Charge</span>
                      <p className="text-amber-400 font-semibold text-sm mt-0.5">
                        {powerSummary.battery.charge_level_percentage}%
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-black/30 border border-white/[0.03]">
                      <span className="text-zinc-500 text-[10px]">Design Capacity</span>
                      <p className="text-white font-semibold text-sm mt-0.5">
                        {powerSummary.battery.design_capacity_mwh} mWh
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-black/30 border border-white/[0.03]">
                      <span className="text-zinc-500 text-[10px]">Full Charge Capacity</span>
                      <p className="text-white font-semibold text-sm mt-0.5">
                        {powerSummary.battery.full_charge_capacity_mwh} mWh
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-zinc-400">
                    Desktop computer detected: Connected to continuous AC power supply. Battery degradation monitoring is not required.
                  </p>
                )}
              </div>
            )}

            {/* Available Power Schemes */}
            {powerSummary && powerSummary.power_plans.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Configured Windows Power Plans</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {powerSummary.power_plans.map((p) => (
                    <div
                      key={p.guid}
                      className={`p-4 rounded-xl border flex justify-between items-center ${
                        p.is_active ? 'bg-amber-500/5 border-amber-500/30' : 'bg-[#16161a] border-[#2a2a36]'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <span className="text-sm font-bold text-white">{p.name}</span>
                        <p className="text-[10px] text-zinc-500 font-mono truncate max-w-[180px]">{p.guid}</p>
                      </div>
                      <button
                        onClick={() => handleSetActivePowerPlan(p.guid, p.name)}
                        disabled={p.is_active}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                          p.is_active
                            ? 'bg-amber-500 text-black font-bold'
                            : 'bg-white/[0.05] hover:bg-white/[0.08] text-zinc-300'
                        }`}
                      >
                        {p.is_active ? 'Active' : 'Activate'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : activeTab === 'vss' ? (
          /* Volume Shadow Copy (VSS) & Quota Page */
          <div className="p-8 max-w-6xl space-y-6">
            <div className="p-6 rounded-2xl bg-[#16161a] border border-[#2a2a36] flex justify-between items-center">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-bold text-white">Volume Shadow Copy (VSS) Storage</h2>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono">
                    {formatBytes(vssSummary?.total_used_bytes || 0)} Used
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mt-1">
                  {vssFeedback || `Found ${vssSummary?.total_shadows || 0} volume shadow snapshots.`}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={fetchVssSummary}
                  disabled={loadingVss}
                  className="px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] text-zinc-300 font-semibold text-xs transition flex items-center gap-2 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingVss ? 'animate-spin' : ''}`} />
                  {loadingVss ? 'Scanning...' : 'Rescan VSS'}
                </button>
                <button
                  onClick={() => handlePurgeVss(false)}
                  disabled={purgingVss || (vssSummary?.total_shadows === 0)}
                  className="px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] text-zinc-300 font-semibold text-xs transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Purge Oldest
                </button>
                <button
                  onClick={() => handlePurgeVss(true)}
                  disabled={purgingVss || (vssSummary?.total_shadows === 0)}
                  className="px-4 py-2 rounded-xl bg-red-500 hover:bg-red-400 text-white font-semibold text-xs transition flex items-center gap-2 shadow-lg shadow-red-500/20 cursor-pointer disabled:opacity-50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Purge All Shadows
                </button>
              </div>
            </div>

            {/* Storage Allocations */}
            {vssSummary && vssSummary.storage_allocations.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {vssSummary.storage_allocations.map((alloc, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-[#16161a] border border-[#2a2a36] space-y-2 text-xs font-mono">
                    <span className="text-sm font-bold text-white">{alloc.volume}</span>
                    <div className="space-y-1 text-zinc-400">
                      <div className="flex justify-between">
                        <span>Used Shadow Storage:</span>
                        <span className="text-amber-400 font-bold">{formatBytes(alloc.used_space_bytes)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Allocated Space:</span>
                        <span>{formatBytes(alloc.allocated_space_bytes)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Max Quota:</span>
                        <span>{formatBytes(alloc.max_space_bytes)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Shadow Copies List */}
            {vssSummary && vssSummary.shadow_copies.length > 0 ? (
              <div className="space-y-2">
                {vssSummary.shadow_copies.map((s) => (
                  <div
                    key={s.id}
                    className="p-3.5 rounded-xl bg-[#16161a] border border-[#2a2a36] flex justify-between items-center text-xs"
                  >
                    <div className="space-y-0.5 truncate max-w-xl">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white">{s.volume_name}</span>
                        <span className="text-[10px] text-zinc-500 font-mono">ID: {s.shadow_id}</span>
                      </div>
                      <p className="text-[11px] text-zinc-400">{s.provider}</p>
                    </div>
                    <div className="text-right font-mono text-xs text-zinc-400">
                      <span>{s.creation_time}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center rounded-2xl bg-[#16161a] border border-[#2a2a36] space-y-3">
                <History className="w-8 h-8 text-zinc-600 mx-auto" />
                <p className="text-xs text-zinc-400">
                  {loadingVss ? 'Querying volume shadow copy service (VSS)...' : 'No volume shadow snapshots consuming storage on disk.'}
                </p>
              </div>
            )}
          </div>
        ) : activeTab === 'firewall' ? (
          /* Firewall Audit Page */
          <div className="p-8 max-w-6xl space-y-6">
            <div className="p-6 rounded-2xl bg-[#16161a] border border-[#2a2a36] flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-white">
                  Windows Firewall Audit: {firewallSummary?.rules.length || 0} Inbound Rules
                </h2>
                <p className="text-xs text-zinc-400 mt-1">
                  {firewallFeedback || `Detected ${firewallSummary?.high_risk_count || 0} potentially permissive rules & ${firewallSummary?.open_inbound_ports.length || 0} listening ports.`}
                </p>
              </div>
              <button
                onClick={fetchFirewall}
                disabled={loadingFirewall}
                className="px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] text-zinc-300 font-semibold text-xs transition flex items-center gap-2 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingFirewall ? 'animate-spin' : ''}`} />
                {loadingFirewall ? 'Auditing...' : 'Re-Audit Firewall'}
              </button>
            </div>

            {/* Rules List */}
            {firewallSummary && firewallSummary.rules.length > 0 ? (
              <div className="space-y-2">
                {firewallSummary.rules.map((rule) => (
                  <div
                    key={rule.name}
                    className={`p-3.5 rounded-xl border flex justify-between items-center ${
                      rule.risk_level === 'High' ? 'bg-red-500/10 border-red-500/30' : 'bg-[#16161a] border-[#2a2a36]'
                    }`}
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-white">{rule.display_name}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-800 text-zinc-300 uppercase">
                          {rule.protocol} {rule.local_port || 'Any'}
                        </span>
                        {rule.risk_level === 'High' && (
                          <span className="px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 text-[10px] font-bold">
                            High Risk: {rule.risk_reason}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-zinc-500 font-mono">{rule.program || 'System Wide'}</p>
                    </div>
                    <button
                      onClick={() => handleToggleFirewallRule(rule)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                        rule.is_enabled
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-zinc-800 text-zinc-400'
                      }`}
                    >
                      {rule.is_enabled ? 'Allowed' : 'Blocked'}
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center rounded-2xl bg-[#16161a] border border-[#2a2a36] space-y-3">
                <Flame className="w-8 h-8 text-zinc-600 mx-auto" />
                <p className="text-xs text-zinc-400">Loading Windows Firewall configuration rules...</p>
              </div>
            )}
          </div>
        ) : activeTab === 'cve' ? (
          /* CVE Scanner Page */
          <div className="p-8 max-w-6xl space-y-6">
            <div className="p-6 rounded-2xl bg-[#16161a] border border-[#2a2a36] flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-white">System Vulnerability & CVE Security Audit</h2>
                <p className="text-xs text-zinc-400 mt-1">
                  Evaluates installed runtime libraries and components against advisory memory-safety CVE listings.
                </p>
              </div>
              <button
                onClick={fetchCveScan}
                disabled={loadingCve}
                className="px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] text-zinc-300 font-semibold text-xs transition flex items-center gap-2 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingCve ? 'animate-spin' : ''}`} />
                {loadingCve ? 'Auditing CVEs...' : 'Scan CVEs'}
              </button>
            </div>

            {/* CVE Items */}
            {cveSummary && cveSummary.vulnerabilities.length > 0 ? (
              <div className="space-y-3">
                {cveSummary.vulnerabilities.map((cve) => (
                  <div key={cve.cve_id} className="p-4 rounded-xl bg-[#16161a] border border-[#2a2a36] space-y-1.5">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-bold text-amber-400">{cve.cve_id}</span>
                        <span className="text-sm font-semibold text-white">({cve.package_name})</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-red-500/20 text-red-400 font-bold uppercase">
                          {cve.severity}
                        </span>
                      </div>
                      <span className="text-[11px] text-zinc-500 font-mono">Published: {cve.published_date}</span>
                    </div>
                    <p className="text-xs text-zinc-400 leading-relaxed">{cve.description}</p>
                    <div className="text-[11px] text-zinc-500 font-mono pt-1">
                      Installed: {cve.installed_version} • Fixed in: <span className="text-emerald-400">{cve.fixed_version}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center rounded-2xl bg-[#16161a] border border-[#2a2a36] space-y-3">
                <ShieldCheck className="w-8 h-8 text-emerald-500 mx-auto" />
                <p className="text-xs text-zinc-400">
                  {loadingCve ? 'Evaluating system advisories...' : 'No unpatched CVE security vulnerabilities detected in runtime environment.'}
                </p>
              </div>
            )}
          </div>
        ) : activeTab === 'updater' ? (
          /* Software Updater Page */
          <div className="p-8 max-w-6xl space-y-6">
            <div className="p-6 rounded-2xl bg-[#16161a] border border-[#2a2a36] flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-white">
                  Bulk Software Updater ({updateSummary?.total_outdated || 0} Updates Available)
                </h2>
                <p className="text-xs text-zinc-400 mt-1">
                  {updateFeedback || `Package manager: ${updateSummary?.manager_name || 'winget'} (Available: ${updateSummary?.is_manager_available ? 'YES' : 'NO'})`}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={fetchSoftwareUpdates}
                  disabled={loadingUpdates}
                  className="px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] text-zinc-300 font-semibold text-xs transition flex items-center gap-2 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingUpdates ? 'animate-spin' : ''}`} />
                  {loadingUpdates ? 'Checking...' : 'Check Updates'}
                </button>
                <button
                  onClick={handleUpgradeAll}
                  disabled={!updateSummary || updateSummary.total_outdated === 0}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition flex items-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer disabled:opacity-50"
                >
                  <ArrowUpCircle className="w-3.5 h-3.5" />
                  Upgrade All Packages
                </button>
              </div>
            </div>

            {/* Outdated Packages */}
            {updateSummary && updateSummary.packages.length > 0 ? (
              <div className="space-y-2">
                {updateSummary.packages.map((pkg) => (
                  <div
                    key={pkg.id}
                    className="p-4 rounded-xl bg-[#16161a] border border-[#2a2a36] flex justify-between items-center"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-white">{pkg.name}</span>
                        <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-[10px] font-mono text-zinc-400 uppercase">
                          {pkg.source}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400 font-mono">
                        {pkg.current_version} ➔ <span className="text-emerald-400 font-bold">{pkg.available_version}</span>
                      </p>
                    </div>
                    <button
                      onClick={() => handleUpgradeSingle(pkg.id)}
                      className="px-3 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.08] text-xs font-semibold text-zinc-200 transition cursor-pointer"
                    >
                      Update
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center rounded-2xl bg-[#16161a] border border-[#2a2a36] space-y-3">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                <p className="text-xs text-zinc-400">
                  {loadingUpdates ? 'Inspecting package repositories...' : 'All desktop software packages are up-to-date.'}
                </p>
              </div>
            )}
          </div>
        ) : activeTab === 'contextmenu' ? (
          /* Context Menu Page */
          <div className="p-8 max-w-6xl space-y-6">
            <div className="p-6 rounded-2xl bg-[#16161a] border border-[#2a2a36] flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-white">Explorer Context Menu Manager</h2>
                <p className="text-xs text-zinc-400 mt-1">
                  {ctxFeedback || `Found ${ctxEntries.length} right-click context menu shell extensions in Windows Registry.`}
                </p>
              </div>
              <button
                onClick={fetchContextMenu}
                disabled={loadingCtx}
                className="px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] text-zinc-300 font-semibold text-xs transition flex items-center gap-2 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingCtx ? 'animate-spin' : ''}`} />
                {loadingCtx ? 'Scanning...' : 'Rescan Entries'}
              </button>
            </div>

            {/* Entries List */}
            {ctxEntries.length > 0 ? (
              <div className="space-y-2">
                {ctxEntries.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-xl bg-[#16161a] border border-[#2a2a36] flex justify-between items-center"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-white">{item.name}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-800 text-zinc-300">
                          {item.scope}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-500 font-mono truncate max-w-xl">{item.command || item.key_path}</p>
                    </div>
                    <button
                      onClick={() => handleToggleContextMenu(item)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                        item.is_enabled
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-zinc-800 text-zinc-400'
                      }`}
                    >
                      {item.is_enabled ? 'Active' : 'Disabled'}
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center rounded-2xl bg-[#16161a] border border-[#2a2a36] space-y-3">
                <MousePointerClick className="w-8 h-8 text-zinc-600 mx-auto" />
                <p className="text-xs text-zinc-400">Loading context menu shell handlers...</p>
              </div>
            )}
          </div>
        ) : activeTab === 'registry' ? (
          /* Registry Cleaner & Backup Manager Page */
          <div className="p-8 max-w-6xl space-y-6">
            <div className="p-6 rounded-2xl bg-[#16161a] border border-[#2a2a36] flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-white">Windows Registry Orphan Cleaner & Rollback</h2>
                <p className="text-xs text-zinc-400 mt-1">
                  {registryFeedback || `Found ${registryIssues.length} orphaned registry entries • ${registryBackups.length} safety snapshots available.`}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleScanRegistry}
                  disabled={scanningRegistry}
                  className="px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] text-zinc-300 font-semibold text-xs transition flex items-center gap-2 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${scanningRegistry ? 'animate-spin' : ''}`} />
                  {scanningRegistry ? 'Scanning...' : 'Scan Registry'}
                </button>
                <button
                  onClick={fetchRegistryBackups}
                  disabled={loadingBackups}
                  className="px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] text-zinc-300 font-semibold text-xs transition flex items-center gap-2 cursor-pointer"
                >
                  <History className="w-3.5 h-3.5" />
                  {loadingBackups ? 'Loading...' : 'View Backups'}
                </button>
                <button
                  onClick={handleFixSelectedRegistry}
                  disabled={fixingRegistry || selectedRegistryIds.size === 0}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs transition flex items-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer disabled:opacity-50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Fix Selected ({selectedRegistryIds.size})
                </button>
              </div>
            </div>

            {/* Backups Tray */}
            {registryBackups.length > 0 && (
              <div className="p-5 rounded-xl bg-amber-500/5 border border-amber-500/20 space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4" />
                    Automatic Pre-Fix .reg Snapshots ({registryBackups.length})
                  </h3>
                  <span className="text-[10px] text-zinc-400 font-mono">Location: Documents/TauKudu Backups/Registry</span>
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {registryBackups.map((bak) => (
                    <div
                      key={bak.id}
                      className="p-2.5 rounded-lg bg-black/40 border border-white/[0.05] flex justify-between items-center text-xs"
                    >
                      <div className="space-y-0.5 truncate max-w-lg">
                        <span className="font-semibold text-white">{bak.filename}</span>
                        <p className="text-[10px] text-zinc-400 font-mono truncate">{bak.key_path}</p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-[10px] text-zinc-500 font-mono">{bak.created_at}</span>
                        <button
                          onClick={() => handleRestoreRegistryBackup(bak.backup_file_path)}
                          className="px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 text-[11px] font-semibold border border-amber-500/30 transition cursor-pointer"
                        >
                          Restore .reg
                        </button>
                        <button
                          onClick={() => handleDeleteRegistryBackup(bak.backup_file_path)}
                          className="p-1 rounded text-zinc-500 hover:text-red-400 transition cursor-pointer"
                          title="Delete snapshot"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Issues List */}
            {registryIssues.length > 0 ? (
              <div className="space-y-2">
                {registryIssues.map((issue) => (
                  <div
                    key={issue.id}
                    className="p-3.5 rounded-xl bg-[#16161a] border border-[#2a2a36] flex justify-between items-center"
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={selectedRegistryIds.has(issue.id)}
                        onChange={(e) => {
                          const next = new Set(selectedRegistryIds)
                          if (e.target.checked) next.add(issue.id)
                          else next.delete(issue.id)
                          setSelectedRegistryIds(next)
                        }}
                        className="rounded border-zinc-700 text-amber-500 focus:ring-amber-500 cursor-pointer"
                      />
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-white">{issue.value_name}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-800 text-amber-400">
                            {issue.category}
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-400 font-mono">{issue.issue_description}</p>
                        <p className="text-[10px] text-zinc-500 font-mono truncate max-w-xl">{issue.key_path}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center rounded-2xl bg-[#16161a] border border-[#2a2a36] space-y-3">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                <p className="text-xs text-zinc-400">
                  {scanningRegistry ? 'Scanning registry hives...' : 'Windows Registry is clean. No orphan entries detected.'}
                </p>
              </div>
            )}
          </div>
        ) : activeTab === 'shortcuts' ? (
          /* Broken Shortcuts Cleaner Page */
          <div className="p-8 max-w-6xl space-y-6">
            <div className="p-6 rounded-2xl bg-[#16161a] border border-[#2a2a36] flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-white">Broken & Invalid Shortcuts Cleaner</h2>
                <p className="text-xs text-zinc-400 mt-1">
                  {shortcutsFeedback || `Scanned desktop and start menu: ${brokenShortcuts.length} broken shortcuts detected.`}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleScanShortcuts}
                  disabled={scanningShortcuts}
                  className="px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] text-zinc-300 font-semibold text-xs transition flex items-center gap-2 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${scanningShortcuts ? 'animate-spin' : ''}`} />
                  {scanningShortcuts ? 'Scanning...' : 'Scan Shortcuts'}
                </button>
                <button
                  onClick={handleDeleteSelectedShortcuts}
                  disabled={cleaningShortcuts || selectedShortcutIds.size === 0}
                  className="px-4 py-2 rounded-xl bg-red-500 hover:bg-red-400 text-white font-semibold text-xs transition flex items-center gap-2 shadow-lg shadow-red-500/20 cursor-pointer disabled:opacity-50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete Selected ({selectedShortcutIds.size})
                </button>
              </div>
            </div>

            {/* Shortcuts List */}
            {brokenShortcuts.length > 0 ? (
              <div className="space-y-2">
                {brokenShortcuts.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-xl bg-[#16161a] border border-[#2a2a36] flex justify-between items-center"
                  >
                    <div className="flex items-center gap-3 truncate max-w-2xl">
                      <input
                        type="checkbox"
                        checked={selectedShortcutIds.has(item.id)}
                        onChange={(e) => {
                          const next = new Set(selectedShortcutIds)
                          if (e.target.checked) next.add(item.id)
                          else next.delete(item.id)
                          setSelectedShortcutIds(next)
                        }}
                        className="rounded border-zinc-700 text-amber-500 focus:ring-amber-500 cursor-pointer shrink-0"
                      />
                      <div className="space-y-0.5 truncate">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-white truncate">{item.filename}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-800 text-amber-400 shrink-0">
                            {item.location_type}
                          </span>
                        </div>
                        <p className="text-[11px] text-red-400 font-mono truncate">{item.broken_reason}</p>
                        <p className="text-[10px] text-zinc-500 font-mono truncate">
                          Target: {item.target_path || 'N/A (Corrupt/Missing)'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center rounded-2xl bg-[#16161a] border border-[#2a2a36] space-y-3">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                <p className="text-xs text-zinc-400">
                  {scanningShortcuts ? 'Scanning shortcut paths across user & system hives...' : 'All shortcuts point to valid destinations. No broken links.'}
                </p>
              </div>
            )}
          </div>
        ) : activeTab === 'databases' ? (
          /* Database Optimizer (VACUUM) Page */
          <div className="p-8 max-w-6xl space-y-6">
            <div className="p-6 rounded-2xl bg-[#16161a] border border-[#2a2a36] flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-white">Browser & Application Database Optimizer (VACUUM)</h2>
                <p className="text-xs text-zinc-400 mt-1">
                  {databaseFeedback || `Found ${databaseScanResult?.total_databases_found || 0} SQLite databases (${formatBytes(databaseScanResult?.total_estimated_reclaimable_bytes || 0)} reclaimable).`}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleScanDatabases}
                  disabled={scanningDatabases}
                  className="px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] text-zinc-300 font-semibold text-xs transition flex items-center gap-2 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${scanningDatabases ? 'animate-spin' : ''}`} />
                  {scanningDatabases ? 'Scanning...' : 'Scan Databases'}
                </button>
                <button
                  onClick={handleVacuumSelectedDatabases}
                  disabled={optimizingDatabases || selectedDatabaseIds.size === 0}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs transition flex items-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer disabled:opacity-50"
                >
                  <Database className="w-3.5 h-3.5" />
                  Defragment & VACUUM ({selectedDatabaseIds.size})
                </button>
              </div>
            </div>

            {/* Databases List */}
            {databaseScanResult && databaseScanResult.databases.length > 0 ? (
              <div className="space-y-2">
                {databaseScanResult.databases.map((db) => (
                  <div
                    key={db.id}
                    className="p-3.5 rounded-xl bg-[#16161a] border border-[#2a2a36] flex justify-between items-center"
                  >
                    <div className="flex items-center gap-3 truncate max-w-2xl">
                      <input
                        type="checkbox"
                        checked={selectedDatabaseIds.has(db.id)}
                        disabled={db.is_locked}
                        onChange={(e) => {
                          const next = new Set(selectedDatabaseIds)
                          if (e.target.checked) next.add(db.id)
                          else next.delete(db.id)
                          setSelectedDatabaseIds(next)
                        }}
                        className="rounded border-zinc-700 text-amber-500 focus:ring-amber-500 cursor-pointer shrink-0 disabled:opacity-30"
                      />
                      <div className="space-y-0.5 truncate">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-white truncate">{db.db_name}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-800 text-amber-400 shrink-0">
                            {db.app_name}
                          </span>
                          {db.is_locked && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-red-500/20 text-red-400 border border-red-500/30 shrink-0">
                              App Running (Locked)
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-zinc-500 font-mono truncate">{db.file_path}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-mono font-bold text-amber-400">
                        ~{formatBytes(db.estimated_reclaimable_bytes)}
                      </span>
                      <p className="text-[10px] text-zinc-500 font-mono">
                        Size: {formatBytes(db.size_bytes)} {db.wal_size_bytes > 0 ? `(+${formatBytes(db.wal_size_bytes)} WAL)` : ''}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center rounded-2xl bg-[#16161a] border border-[#2a2a36] space-y-3">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                <p className="text-xs text-zinc-400">
                  {scanningDatabases ? 'Inspecting SQLite database headers across profile directories...' : 'No fragmented SQLite databases found.'}
                </p>
              </div>
            )}
          </div>
        ) : activeTab === 'env' ? (
          /* Environment Variables & PATH Cleaner Page */
          <div className="p-8 max-w-6xl space-y-6">
            <div className="p-6 rounded-2xl bg-[#16161a] border border-[#2a2a36] flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-white">Windows Environment Variables & PATH Cleaner</h2>
                <p className="text-xs text-zinc-400 mt-1">
                  {envFeedback || `Found ${envScanResult?.total_orphans || 0} orphaned directories in PATH and developer variables.`}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleScanEnvironment}
                  disabled={scanningEnv}
                  className="px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] text-zinc-300 font-semibold text-xs transition flex items-center gap-2 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${scanningEnv ? 'animate-spin' : ''}`} />
                  {scanningEnv ? 'Scanning...' : 'Scan Environment'}
                </button>
                <button
                  onClick={handleCleanSelectedEnv}
                  disabled={cleaningEnv || selectedEnvIds.size === 0}
                  className="px-4 py-2 rounded-xl bg-red-500 hover:bg-red-400 text-white font-semibold text-xs transition flex items-center gap-2 shadow-lg shadow-red-500/20 cursor-pointer disabled:opacity-50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Clean Selected ({selectedEnvIds.size})
                </button>
              </div>
            </div>

            {/* Orphan Items List */}
            {envScanResult && envScanResult.items.length > 0 ? (
              <div className="space-y-2">
                {envScanResult.items.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-xl bg-[#16161a] border border-[#2a2a36] flex justify-between items-center"
                  >
                    <div className="flex items-center gap-3 truncate max-w-2xl">
                      <input
                        type="checkbox"
                        checked={selectedEnvIds.has(item.id)}
                        onChange={(e) => {
                          const next = new Set(selectedEnvIds)
                          if (e.target.checked) next.add(item.id)
                          else next.delete(item.id)
                          setSelectedEnvIds(next)
                        }}
                        className="rounded border-zinc-700 text-amber-500 focus:ring-amber-500 cursor-pointer shrink-0"
                      />
                      <div className="space-y-0.5 truncate">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-white truncate">{item.variable_name}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-zinc-800 text-amber-400 shrink-0">
                            {item.scope}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-800 text-zinc-400 shrink-0">
                            {item.entry_type}
                          </span>
                        </div>
                        <p className="text-[11px] text-red-400 font-mono truncate">{item.missing_reason}</p>
                        <p className="text-[10px] text-zinc-500 font-mono truncate">
                          Value: {item.raw_value}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center rounded-2xl bg-[#16161a] border border-[#2a2a36] space-y-3">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                <p className="text-xs text-zinc-400">
                  {scanningEnv ? 'Reading registry hives (HKCU/HKLM Environment) and validating paths...' : 'All PATH directories and environment variables are valid.'}
                </p>
              </div>
            )}
          </div>
        ) : activeTab === 'cache' ? (
          /* Icon, Thumbnail & Font Cache Rebuilder Page */
          <div className="p-8 max-w-6xl space-y-6">
            <div className="p-6 rounded-2xl bg-[#16161a] border border-[#2a2a36] flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-white">Icon, Thumbnail & Font Cache Rebuilder</h2>
                <p className="text-xs text-zinc-400 mt-1">
                  {iconFontFeedback || `Scanned cache hives: ${iconFontCacheSummary?.total_files || 0} database files (${formatBytes(iconFontCacheSummary?.total_size_bytes || 0)} total).`}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleScanIconFontCaches}
                  disabled={scanningIconFont}
                  className="px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] text-zinc-300 font-semibold text-xs transition flex items-center gap-2 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${scanningIconFont ? 'animate-spin' : ''}`} />
                  {scanningIconFont ? 'Scanning...' : 'Scan Caches'}
                </button>
                <button
                  onClick={handleRebuildAndPurgeCaches}
                  disabled={rebuildingIconFont || (iconFontCacheSummary?.total_files === 0)}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs transition flex items-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer disabled:opacity-50"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Purge & Rebuild Caches
                </button>
              </div>
            </div>

            {/* Restart Explorer Switch */}
            <div className="p-4 rounded-xl bg-white/[0.02] border border-[#2a2a36] flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-xs font-semibold text-white">Restart Windows Explorer during purge</span>
                <p className="text-[11px] text-zinc-400">
                  Required to release file locks on active iconcache_*.db and thumbcache_*.db files.
                </p>
              </div>
              <input
                type="checkbox"
                checked={restartExplorerCheck}
                onChange={(e) => setRestartExplorerCheck(e.target.checked)}
                className="rounded border-zinc-700 text-amber-500 focus:ring-amber-500 cursor-pointer"
              />
            </div>

            {/* Cache Items List */}
            {iconFontCacheSummary && iconFontCacheSummary.items.length > 0 ? (
              <div className="space-y-2">
                {iconFontCacheSummary.items.map((c) => (
                  <div
                    key={c.id}
                    className="p-3.5 rounded-xl bg-[#16161a] border border-[#2a2a36] flex justify-between items-center"
                  >
                    <div className="space-y-0.5 truncate max-w-xl">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-white">{c.name}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-800 text-amber-400">
                          {c.category}
                        </span>
                      </div>
                      <p className="text-[10px] text-zinc-500 font-mono truncate">{c.file_path}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-mono font-bold text-amber-400">
                        {formatBytes(c.size_bytes)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center rounded-2xl bg-[#16161a] border border-[#2a2a36] space-y-3">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                <p className="text-xs text-zinc-400">
                  {scanningIconFont ? 'Scanning Explorer and FontCache directories...' : 'Click "Scan Caches" to detect active cache databases.'}
                </p>
              </div>
            )}
          </div>
        ) : activeTab === 'gamingcleaner' ? (
          /* Gaming Ecosystem & Steam Shader Cleaner Page */
          <div className="p-8 max-w-6xl space-y-6">
            <div className="p-6 rounded-2xl bg-[#16161a] border border-[#2a2a36] flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-white">Gaming Launchers, Shaders & Steam Redistributables</h2>
                <p className="text-xs text-zinc-400 mt-1">
                  {gamingFeedback || `Found ${gamingScanResult?.total_items || 0} gaming cache targets (${formatBytes(gamingScanResult?.total_size_bytes || 0)} total).`}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleScanGaming}
                  disabled={scanningGaming}
                  className="px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] text-zinc-300 font-semibold text-xs transition flex items-center gap-2 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${scanningGaming ? 'animate-spin' : ''}`} />
                  {scanningGaming ? 'Scanning...' : 'Scan Gaming'}
                </button>
                <button
                  onClick={handleCleanSelectedGaming}
                  disabled={cleaningGaming || selectedGamingIds.size === 0}
                  className="px-4 py-2 rounded-xl bg-red-500 hover:bg-red-400 text-white font-semibold text-xs transition flex items-center gap-2 shadow-lg shadow-red-500/20 cursor-pointer disabled:opacity-50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Clean Selected ({selectedGamingIds.size})
                </button>
              </div>
            </div>

            {/* Gaming Targets List */}
            {gamingScanResult && gamingScanResult.targets.length > 0 ? (
              <div className="space-y-2">
                {gamingScanResult.targets.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-xl bg-[#16161a] border border-[#2a2a36] flex justify-between items-center"
                  >
                    <div className="flex items-center gap-3 truncate max-w-2xl">
                      <input
                        type="checkbox"
                        checked={selectedGamingIds.has(item.id)}
                        onChange={(e) => {
                          const next = new Set(selectedGamingIds)
                          if (e.target.checked) next.add(item.id)
                          else next.delete(item.id)
                          setSelectedGamingIds(next)
                        }}
                        className="rounded border-zinc-700 text-amber-500 focus:ring-amber-500 cursor-pointer shrink-0"
                      />
                      <div className="space-y-0.5 truncate">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-white truncate">{item.title}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-800 text-amber-400 shrink-0">
                            {item.group}
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-400 font-mono truncate">{item.detail}</p>
                        <p className="text-[10px] text-zinc-500 font-mono truncate">{item.path}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-mono font-bold text-amber-400">
                        {formatBytes(item.size_bytes)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center rounded-2xl bg-[#16161a] border border-[#2a2a36] space-y-3">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                <p className="text-xs text-zinc-400">
                  {scanningGaming ? 'Scanning Steam libraries, Epic Games, Ubisoft, EA, Battle.net, and GPU shader directories...' : 'No bloated game shader caches or redistributables found.'}
                </p>
              </div>
            )}
          </div>
        ) : activeTab === 'eventlogs' ? (
          /* Event Logs & Crash Dumps Cleaner Page */
          <div className="p-8 max-w-6xl space-y-6">
            <div className="p-6 rounded-2xl bg-[#16161a] border border-[#2a2a36] flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-white">Windows Event Logs (.evtx) & Crash Dumps</h2>
                <p className="text-xs text-zinc-400 mt-1">
                  {eventLogsFeedback || `Found ${eventLogsSummary?.total_logs_count || 0} event logs & diagnostics files (${formatBytes(eventLogsSummary?.total_size_bytes || 0)} total).`}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleScanEventLogs}
                  disabled={scanningEventLogs}
                  className="px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] text-zinc-300 font-semibold text-xs transition flex items-center gap-2 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${scanningEventLogs ? 'animate-spin' : ''}`} />
                  {scanningEventLogs ? 'Scanning...' : 'Scan Logs & Dumps'}
                </button>
                <button
                  onClick={handleClearSelectedEventLogs}
                  disabled={clearingEventLogs || selectedEventLogIds.size === 0}
                  className="px-4 py-2 rounded-xl bg-red-500 hover:bg-red-400 text-white font-semibold text-xs transition flex items-center gap-2 shadow-lg shadow-red-500/20 cursor-pointer disabled:opacity-50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Clear Selected ({selectedEventLogIds.size})
                </button>
              </div>
            </div>

            {/* Event Logs List */}
            {eventLogsSummary && eventLogsSummary.targets.length > 0 ? (
              <div className="space-y-2">
                {eventLogsSummary.targets.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-xl bg-[#16161a] border border-[#2a2a36] flex justify-between items-center"
                  >
                    <div className="flex items-center gap-3 truncate max-w-2xl">
                      <input
                        type="checkbox"
                        checked={selectedEventLogIds.has(item.id)}
                        onChange={(e) => {
                          const next = new Set(selectedEventLogIds)
                          if (e.target.checked) next.add(item.id)
                          else next.delete(item.id)
                          setSelectedEventLogIds(next)
                        }}
                        className="rounded border-zinc-700 text-amber-500 focus:ring-amber-500 cursor-pointer shrink-0"
                      />
                      <div className="space-y-0.5 truncate">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-white truncate">{item.name}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-800 text-amber-400 shrink-0">
                            {item.category}
                          </span>
                        </div>
                        <p className="text-[10px] text-zinc-500 font-mono truncate">{item.file_path}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-mono font-bold text-amber-400">
                        {formatBytes(item.size_bytes)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center rounded-2xl bg-[#16161a] border border-[#2a2a36] space-y-3">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                <p className="text-xs text-zinc-400">
                  {scanningEventLogs ? 'Scanning winevt Logs, crash dumps, and Windows Error Reports...' : 'No bloated Windows Event Logs or crash dumps found.'}
                </p>
              </div>
            )}
          </div>
        ) : activeTab === 'winupdate' ? (
          /* Windows Update Cleaner Page */
          <div className="p-8 max-w-6xl space-y-6">
            <div className="p-6 rounded-2xl bg-[#16161a] border border-[#2a2a36] flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-white">Windows Update & SoftwareDistribution Cleaner</h2>
                <p className="text-xs text-zinc-400 mt-1">
                  {winUpdateFeedback || `Found ${winUpdateSummary?.total_files_count || 0} cached update files (${formatBytes(winUpdateSummary?.total_size_bytes || 0)} total).`}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleScanWinUpdates}
                  disabled={scanningWinUpdate}
                  className="px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] text-zinc-300 font-semibold text-xs transition flex items-center gap-2 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${scanningWinUpdate ? 'animate-spin' : ''}`} />
                  {scanningWinUpdate ? 'Scanning...' : 'Scan Updates'}
                </button>
                <button
                  onClick={handleCleanSelectedWinUpdates}
                  disabled={cleaningWinUpdate || selectedWinUpdateIds.size === 0}
                  className="px-4 py-2 rounded-xl bg-red-500 hover:bg-red-400 text-white font-semibold text-xs transition flex items-center gap-2 shadow-lg shadow-red-500/20 cursor-pointer disabled:opacity-50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Purge Selected ({selectedWinUpdateIds.size})
                </button>
              </div>
            </div>

            {/* Targets List */}
            {winUpdateSummary && winUpdateSummary.targets.length > 0 ? (
              <div className="space-y-2">
                {winUpdateSummary.targets.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-xl bg-[#16161a] border border-[#2a2a36] flex justify-between items-center"
                  >
                    <div className="flex items-center gap-3 truncate max-w-2xl">
                      <input
                        type="checkbox"
                        checked={selectedWinUpdateIds.has(item.id)}
                        onChange={(e) => {
                          const next = new Set(selectedWinUpdateIds)
                          if (e.target.checked) next.add(item.id)
                          else next.delete(item.id)
                          setSelectedWinUpdateIds(next)
                        }}
                        className="rounded border-zinc-700 text-amber-500 focus:ring-amber-500 cursor-pointer shrink-0"
                      />
                      <div className="space-y-0.5 truncate">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-white truncate">{item.name}</span>
                          {item.needs_service_stop && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/20 text-amber-400 shrink-0">
                              Requires Service Pause
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-zinc-400 font-mono truncate">{item.description}</p>
                        <p className="text-[10px] text-zinc-500 font-mono truncate">{item.file_path}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-mono font-bold text-amber-400">
                        {formatBytes(item.size_bytes)}
                      </span>
                      <p className="text-[10px] text-zinc-500 font-mono">{item.file_count} files</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center rounded-2xl bg-[#16161a] border border-[#2a2a36] space-y-3">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                <p className="text-xs text-zinc-400">
                  {scanningWinUpdate ? 'Scanning SoftwareDistribution and DeliveryOptimization directories...' : 'No leftover Windows Update downloads found.'}
                </p>
              </div>
            )}
          </div>
        ) : activeTab === 'ram' ? (
          /* Memory RAM Optimizer & Working Set Trimmer Page */
          <div className="p-8 max-w-6xl space-y-6">
            <div className="p-6 rounded-2xl bg-[#16161a] border border-[#2a2a36] flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-white">Real-Time Memory RAM Optimizer</h2>
                <p className="text-xs text-zinc-400 mt-1">
                  {memoryFeedback || `RAM Load: ${memorySnapshot?.usage_percentage.toFixed(1) || 0}% (${formatBytes(memorySnapshot?.used_ram_bytes || 0)} used / ${formatBytes(memorySnapshot?.total_ram_bytes || 0)} total).`}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={fetchMemorySnapshot}
                  disabled={loadingMemorySnapshot}
                  className="px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] text-zinc-300 font-semibold text-xs transition flex items-center gap-2 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingMemorySnapshot ? 'animate-spin' : ''}`} />
                  {loadingMemorySnapshot ? 'Analyzing...' : 'Refresh RAM'}
                </button>
                <button
                  onClick={handleTrimMemory}
                  disabled={trimmingMemory}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs transition flex items-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer disabled:opacity-50"
                >
                  <Gauge className="w-3.5 h-3.5" />
                  Trim Working Sets
                </button>
              </div>
            </div>

            {/* RAM Progress Bar */}
            {memorySnapshot && (
              <div className="p-5 rounded-xl bg-[#16161a] border border-[#2a2a36] space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-white">Physical Memory Pressure</span>
                  <span className="text-amber-400 font-mono">{memorySnapshot.usage_percentage.toFixed(1)}%</span>
                </div>
                <div className="w-full h-3 rounded-full bg-zinc-800 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      memorySnapshot.usage_percentage > 85 ? 'bg-red-500' : memorySnapshot.usage_percentage > 65 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, Math.max(0, memorySnapshot.usage_percentage))}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-zinc-500 font-mono">
                  <span>Free: {formatBytes(memorySnapshot.free_ram_bytes)}</span>
                  <span>Used: {formatBytes(memorySnapshot.used_ram_bytes)}</span>
                  <span>Total: {formatBytes(memorySnapshot.total_ram_bytes)}</span>
                </div>
              </div>
            )}

            {/* Top Processes Memory Table */}
            {memorySnapshot && memorySnapshot.top_processes.length > 0 ? (
              <div className="space-y-2">
                <div className="px-3 py-1.5 text-xs font-semibold text-zinc-400 flex justify-between">
                  <span>Process Name & PID</span>
                  <span>Working Set (RAM)</span>
                </div>
                <div className="space-y-1.5 max-h-96 overflow-y-auto pr-1">
                  {memorySnapshot.top_processes.map((proc) => (
                    <div
                      key={proc.pid}
                      className="p-3 rounded-xl bg-[#16161a] border border-[#2a2a36] flex justify-between items-center text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="font-semibold text-white">{proc.name}</span>
                        <span className="font-mono text-[10px] text-zinc-500">PID: {proc.pid}</span>
                        {proc.is_optimizable ? (
                          <span className="px-1.5 py-0.5 rounded text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            Optimizable
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded text-[9px] bg-zinc-800 text-zinc-400">
                            Protected System
                          </span>
                        )}
                      </div>
                      <div className="text-right font-mono">
                        <span className="font-bold text-amber-400">{formatBytes(proc.memory_bytes)}</span>
                        <p className="text-[10px] text-zinc-600">Virtual: {formatBytes(proc.virtual_memory_bytes)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-12 text-center rounded-2xl bg-[#16161a] border border-[#2a2a36] space-y-3">
                <Gauge className="w-8 h-8 text-zinc-600 mx-auto" />
                <p className="text-xs text-zinc-400">
                  {loadingMemorySnapshot ? 'Analyzing running system processes memory...' : 'Click "Refresh RAM" to load working set details.'}
                </p>
              </div>
            )}
          </div>
        ) : activeTab === 'safety' ? (
          /* Safety Intelligence Advisor Page */
          <div className="p-8 max-w-6xl space-y-6">
            <div className="p-6 rounded-2xl bg-[#16161a] border border-[#2a2a36] flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-white">Offline Program & Startup Safety Advisor</h2>
                <p className="text-xs text-zinc-400 mt-1">
                  {safetyFeedback || `Loaded ${safetySummary?.total_ratings_known || 0} curated safety records across Windows components, applications, and bloatware.`}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={fetchSafetyIntelligence}
                  disabled={loadingSafety}
                  className="px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] text-zinc-300 font-semibold text-xs transition flex items-center gap-2 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingSafety ? 'animate-spin' : ''}`} />
                  {loadingSafety ? 'Loading...' : 'Refresh Database'}
                </button>
              </div>
            </div>

            {/* Search Box */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-[#16161a] border border-[#2a2a36]">
              <FolderSearch className="w-4 h-4 text-zinc-400" />
              <input
                type="text"
                value={safetySearchQuery}
                onChange={(e) => setSafetySearchQuery(e.target.value)}
                placeholder="Search known software, process name, or publisher (e.g. Spotify, OneDrive, CCleaner, McAfee)..."
                className="flex-1 bg-transparent border-none text-xs text-zinc-200 focus:outline-none"
              />
            </div>

            {/* Safety Items List */}
            {safetySummary && safetySummary.ratings.length > 0 ? (
              <div className="space-y-2">
                {safetySummary.ratings
                  .filter((r) => {
                    if (!safetySearchQuery) return true
                    const q = safetySearchQuery.toLowerCase()
                    return (
                      r.name.toLowerCase().includes(q) ||
                      r.publisher.toLowerCase().includes(q) ||
                      r.classification.toLowerCase().includes(q) ||
                      r.description.toLowerCase().includes(q)
                    )
                  })
                  .map((r) => (
                    <div
                      key={r.key}
                      className="p-4 rounded-xl bg-[#16161a] border border-[#2a2a36] flex justify-between items-center text-xs"
                    >
                      <div className="space-y-1 max-w-2xl">
                        <div className="flex items-center gap-2.5">
                          <span className="font-bold text-white text-sm">{r.name}</span>
                          <span className="text-[10px] text-zinc-500 font-mono">({r.publisher})</span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
                              r.safety_score >= 90
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : r.safety_score >= 70
                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                : 'bg-red-500/10 text-red-400 border border-red-500/20'
                            }`}
                          >
                            {r.classification}
                          </span>
                        </div>
                        <p className="text-zinc-400 text-xs">{r.description}</p>
                        <p className="text-[11px] text-amber-400 font-mono">Recommendation: {r.recommendation}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-sm font-bold font-mono">
                          <span className={r.safety_score >= 80 ? 'text-emerald-400' : r.safety_score >= 60 ? 'text-amber-400' : 'text-red-400'}>
                            {r.safety_score}/100
                          </span>
                        </div>
                        <p className="text-[10px] text-zinc-500">Trust Score</p>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="p-12 text-center rounded-2xl bg-[#16161a] border border-[#2a2a36] space-y-3">
                <ShieldCheck className="w-8 h-8 text-zinc-600 mx-auto" />
                <p className="text-xs text-zinc-400">
                  {loadingSafety ? 'Loading safety database...' : 'Click "Refresh Database" to view intelligence ratings.'}
                </p>
              </div>
            )}
          </div>
        ) : activeTab === 'hosts' ? (
          /* Hosts File Security & Telemetry Blocker Page */
          <div className="p-8 max-w-6xl space-y-6">
            <div className="p-6 rounded-2xl bg-[#16161a] border border-[#2a2a36] flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-white">Windows Hosts File Telemetry & Redirection Blocker</h2>
                <p className="text-xs text-zinc-400 mt-1">
                  {hostsFeedback || `Hosts file: ${hostsSummary?.total_entries || 0} entries (${hostsSummary?.telemetry_blocked_count || 0} telemetry domains blocked).`}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={fetchHostsSummary}
                  disabled={loadingHosts}
                  className="px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] text-zinc-300 font-semibold text-xs transition flex items-center gap-2 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingHosts ? 'animate-spin' : ''}`} />
                  {loadingHosts ? 'Reading...' : 'Refresh Hosts'}
                </button>
                <button
                  onClick={() => handleToggleHostsTelemetryBlock((hostsSummary?.telemetry_blocked_count || 0) === 0)}
                  disabled={applyingHosts}
                  className={`px-4 py-2 rounded-xl font-semibold text-xs transition flex items-center gap-2 shadow-lg cursor-pointer ${
                    (hostsSummary?.telemetry_blocked_count || 0) > 0
                      ? 'bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30'
                      : 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-emerald-500/20'
                  }`}
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  {(hostsSummary?.telemetry_blocked_count || 0) > 0 ? 'Disable Telemetry Block' : 'Block Windows Telemetry (0.0.0.0)'}
                </button>
              </div>
            </div>

            {/* Hosts Entries List */}
            {hostsSummary && hostsSummary.entries.length > 0 ? (
              <div className="space-y-2">
                <div className="px-3 py-1 text-xs text-zinc-500 font-mono flex justify-between">
                  <span>File Location: {hostsSummary.hosts_file_path}</span>
                  <span>{hostsSummary.entries.length} Total Lines</span>
                </div>
                <div className="space-y-1.5 max-h-96 overflow-y-auto pr-1">
                  {hostsSummary.entries.map((h, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-xl border flex justify-between items-center text-xs font-mono ${
                        h.is_telemetry_block && !h.is_commented
                          ? 'bg-emerald-500/5 border-emerald-500/20'
                          : h.is_commented
                          ? 'bg-black/20 border-white/[0.03] text-zinc-500'
                          : 'bg-[#16161a] border-[#2a2a36]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-amber-400 font-semibold">{h.ip_address}</span>
                        <span className="text-zinc-200">{h.hostname}</span>
                      </div>
                      <div>
                        {h.is_telemetry_block && !h.is_commented ? (
                          <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-400">
                            Telemetry Block Active
                          </span>
                        ) : h.is_commented ? (
                          <span className="text-[10px] text-zinc-600">Commented Line</span>
                        ) : (
                          <span className="text-[10px] text-zinc-400">Custom Host Mapping</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-12 text-center rounded-2xl bg-[#16161a] border border-[#2a2a36] space-y-3">
                <ShieldAlert className="w-8 h-8 text-zinc-600 mx-auto" />
                <p className="text-xs text-zinc-400">
                  {loadingHosts ? 'Reading System32/drivers/etc/hosts...' : 'Click "Refresh Hosts" to view active DNS mappings.'}
                </p>
              </div>
            )}
          </div>
        ) : activeTab === 'devcache' ? (
          /* Developer Ecosystem & Package Cache Sweeper Page */
          <div className="p-8 max-w-6xl space-y-6">
            <div className="p-6 rounded-2xl bg-[#16161a] border border-[#2a2a36] flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-white">Developer Ecosystem & Package Cache Sweeper</h2>
                <p className="text-xs text-zinc-400 mt-1">
                  {devCacheFeedback || `Found ${devCacheSummary?.total_targets_count || 0} package caches (${formatBytes(devCacheSummary?.total_size_bytes || 0)} total).`}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleScanDevCaches}
                  disabled={scanningDevCache}
                  className="px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] text-zinc-300 font-semibold text-xs transition flex items-center gap-2 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${scanningDevCache ? 'animate-spin' : ''}`} />
                  {scanningDevCache ? 'Scanning...' : 'Scan Dev Caches'}
                </button>
                <button
                  onClick={handleCleanSelectedDevCaches}
                  disabled={cleaningDevCache || selectedDevCacheIds.size === 0}
                  className="px-4 py-2 rounded-xl bg-red-500 hover:bg-red-400 text-white font-semibold text-xs transition flex items-center gap-2 shadow-lg shadow-red-500/20 cursor-pointer disabled:opacity-50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Sweep Selected ({selectedDevCacheIds.size})
                </button>
              </div>
            </div>

            {/* Dev Targets List */}
            {devCacheSummary && devCacheSummary.targets.length > 0 ? (
              <div className="space-y-2">
                {devCacheSummary.targets.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-xl bg-[#16161a] border border-[#2a2a36] flex justify-between items-center"
                  >
                    <div className="flex items-center gap-3 truncate max-w-2xl">
                      <input
                        type="checkbox"
                        checked={selectedDevCacheIds.has(item.id)}
                        onChange={(e) => {
                          const next = new Set(selectedDevCacheIds)
                          if (e.target.checked) next.add(item.id)
                          else next.delete(item.id)
                          setSelectedDevCacheIds(next)
                        }}
                        className="rounded border-zinc-700 text-amber-500 focus:ring-amber-500 cursor-pointer shrink-0"
                      />
                      <div className="space-y-0.5 truncate">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-white truncate">{item.name}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-800 text-amber-400 shrink-0">
                            {item.ecosystem}
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-400 font-mono truncate">{item.description}</p>
                        <p className="text-[10px] text-zinc-500 font-mono truncate">{item.file_path}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-mono font-bold text-amber-400">
                        {formatBytes(item.size_bytes)}
                      </span>
                      <p className="text-[10px] text-zinc-500 font-mono">{item.file_count} files</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center rounded-2xl bg-[#16161a] border border-[#2a2a36] space-y-3">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                <p className="text-xs text-zinc-400">
                  {scanningDevCache ? 'Scanning npm, yarn, pnpm, cargo, pip, gradle, and IDE caches...' : 'No bloated developer package caches found.'}
                </p>
              </div>
            )}
          </div>
        ) : activeTab === 'network' ? (
          /* Network Optimizer Page */
          <div className="p-8 max-w-6xl space-y-6">
            <div className="p-6 rounded-2xl bg-[#16161a] border border-[#2a2a36] flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-white">Network Cache & TCP/IP Stack Optimizer</h2>
                <p className="text-xs text-zinc-400 mt-1">
                  {networkFeedback || `Active sockets: ${activeConns.length} connections detected.`}
                </p>
              </div>
              <button
                onClick={fetchNetwork}
                className="px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] text-zinc-300 font-semibold text-xs transition flex items-center gap-2 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Refresh Network
              </button>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 rounded-xl bg-[#16161a] border border-[#2a2a36] space-y-2">
                <h3 className="text-sm font-semibold text-white">Flush DNS Resolver Cache</h3>
                <p className="text-xs text-zinc-400">Purges local DNS query records to resolve connectivity issues.</p>
                <button
                  onClick={handleFlushDns}
                  className="w-full py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-xs font-semibold transition cursor-pointer"
                >
                  Flush DNS
                </button>
              </div>

              <div className="p-5 rounded-xl bg-[#16161a] border border-[#2a2a36] space-y-2">
                <h3 className="text-sm font-semibold text-white">Purge ARP Protocol Table</h3>
                <p className="text-xs text-zinc-400">Clears Address Resolution Protocol routing cache across adapters.</p>
                <button
                  onClick={handleFlushArp}
                  className="w-full py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-xs font-semibold transition cursor-pointer"
                >
                  Purge ARP Table
                </button>
              </div>

              <div className="p-5 rounded-xl bg-[#16161a] border border-[#2a2a36] space-y-2">
                <h3 className="text-sm font-semibold text-white">Reset Winsock (TCP/IP Stack)</h3>
                <p className="text-xs text-zinc-400">Resets Windows socket catalog to default clean configuration.</p>
                <button
                  onClick={handleResetWinsock}
                  className="w-full py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-xs font-semibold transition cursor-pointer"
                >
                  Reset TCP/IP
                </button>
              </div>
            </div>
          </div>
        ) : activeTab === 'perf' ? (
          /* Performance Monitor Page */
          <div className="p-8 max-w-6xl space-y-6">
            <div className="p-6 rounded-2xl bg-[#16161a] border border-[#2a2a36] flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-white">Real-Time Performance & Process Monitor</h2>
                <p className="text-xs text-zinc-400 mt-1">
                  {perfFeedback || `Active Processes: ${perfSnapshot?.process_count || 0} • Uptime: ${Math.round((perfSnapshot?.uptime_seconds || 0) / 3600)}h.`}
                </p>
              </div>
              <button
                onClick={fetchPerformanceSnapshot}
                disabled={loadingPerf}
                className="px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] text-zinc-300 font-semibold text-xs transition flex items-center gap-2 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingPerf ? 'animate-spin' : ''}`} />
                {loadingPerf ? 'Sampling...' : 'Sample Stats'}
              </button>
            </div>

            {/* Live Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-xl bg-[#16161a] border border-[#2a2a36]">
                <span className="text-xs text-zinc-400 font-medium">CPU Utilization</span>
                <div className="text-2xl font-bold text-white font-mono mt-1">
                  {perfSnapshot ? `${perfSnapshot.cpu_usage_percent.toFixed(1)}%` : 'Loading...'}
                </div>
              </div>

              <div className="p-5 rounded-xl bg-[#16161a] border border-[#2a2a36]">
                <span className="text-xs text-zinc-400 font-medium">Physical Memory Usage</span>
                <div className="text-2xl font-bold text-white font-mono mt-1">
                  {perfSnapshot ? `${formatBytes(perfSnapshot.used_memory_bytes)} / ${formatBytes(perfSnapshot.total_memory_bytes)}` : 'Loading...'}
                </div>
              </div>
            </div>

            {/* Top Processes */}
            {perfSnapshot && (
              <div className="p-5 rounded-xl bg-[#16161a] border border-[#2a2a36] space-y-3">
                <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Top Memory & CPU Consumers</h3>
                <div className="space-y-1.5">
                  {perfSnapshot.top_processes.map((proc) => (
                    <div key={proc.pid} className="flex justify-between items-center p-2 rounded-lg bg-black/30 text-xs font-mono">
                      <div className="flex items-center gap-2">
                        <span className="text-white font-semibold">{proc.name}</span>
                        <span className="text-[10px] text-zinc-500">(PID: {proc.pid})</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-amber-400">{formatBytes(proc.memory_bytes)}</span>
                        <button
                          onClick={() => handleKillProcess(proc.pid, proc.name)}
                          className="px-2 py-0.5 rounded bg-red-500/20 hover:bg-red-500/30 text-red-400 text-[10px] font-bold transition cursor-pointer"
                        >
                          Kill
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : activeTab === 'startup' ? (
          /* Startup Programs Page */
          <div className="p-8 max-w-6xl space-y-6">
            <div className="p-6 rounded-2xl bg-[#16161a] border border-[#2a2a36] flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-white">Windows Startup Programs</h2>
                <p className="text-xs text-zinc-400 mt-1">
                  {startupFeedback || `Configured startup entries: ${startupItems.length} items.`}
                </p>
              </div>
              <button
                onClick={fetchStartupItems}
                disabled={loadingStartup}
                className="px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] text-zinc-300 font-semibold text-xs transition flex items-center gap-2 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingStartup ? 'animate-spin' : ''}`} />
                {loadingStartup ? 'Reading...' : 'Refresh Startup'}
              </button>
            </div>

            {/* Items */}
            {startupItems.length > 0 ? (
              <div className="space-y-2">
                {startupItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-xl bg-[#16161a] border border-[#2a2a36] flex justify-between items-center"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-white">{item.name}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-800 text-zinc-300">
                          {item.impact_rating} Impact
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400 font-mono truncate max-w-xl">{item.command}</p>
                    </div>
                    <button
                      onClick={() => handleToggleStartup(item)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
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
            ) : (
              <div className="p-12 text-center rounded-2xl bg-[#16161a] border border-[#2a2a36] space-y-3">
                <Zap className="w-8 h-8 text-zinc-600 mx-auto" />
                <p className="text-xs text-zinc-400">Loading startup applications...</p>
              </div>
            )}
          </div>
        ) : activeTab === 'debloat' ? (
          /* Debloater Page */
          <div className="p-8 max-w-6xl space-y-6">
            <div className="p-6 rounded-2xl bg-[#16161a] border border-[#2a2a36] flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-white">Windows OEM & Bloatware Removal</h2>
                <p className="text-xs text-zinc-400 mt-1">
                  {bloatFeedback || `Identified ${bloatList.length} pre-installed UWP & promotional packages.`}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={fetchBloatware}
                  className="px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] text-zinc-300 font-semibold text-xs transition flex items-center gap-2 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Refresh List
                </button>
                <button
                  onClick={handleRemoveSelectedBloat}
                  disabled={removingBloat || selectedBloat.size === 0}
                  className="px-4 py-2 rounded-xl bg-red-500 hover:bg-red-400 text-white font-semibold text-xs transition flex items-center gap-2 shadow-lg shadow-red-500/20 cursor-pointer disabled:opacity-50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Remove Selected ({selectedBloat.size})
                </button>
              </div>
            </div>

            {/* List */}
            {bloatList.length > 0 ? (
              <div className="space-y-2">
                {bloatList.map((app) => (
                  <div
                    key={app.id}
                    className="p-3.5 rounded-xl bg-[#16161a] border border-[#2a2a36] flex justify-between items-center"
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={selectedBloat.has(app.package_name)}
                        onChange={(e) => {
                          const next = new Set(selectedBloat)
                          if (e.target.checked) next.add(app.package_name)
                          else next.delete(app.package_name)
                          setSelectedBloat(next)
                        }}
                        className="rounded border-zinc-700 text-red-500 focus:ring-red-500 cursor-pointer"
                      />
                      <div>
                        <span className="text-sm font-semibold text-white">{app.name}</span>
                        <p className="text-xs text-zinc-400">{app.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center rounded-2xl bg-[#16161a] border border-[#2a2a36] space-y-3">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                <p className="text-xs text-zinc-400">No known OEM bloatware packages detected on this workstation.</p>
              </div>
            )}
          </div>
        ) : activeTab === 'services' ? (
          /* Services Page */
          <div className="p-8 max-w-6xl space-y-6">
            <div className="p-6 rounded-2xl bg-[#16161a] border border-[#2a2a36] flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-white">Windows Background Services</h2>
                <p className="text-xs text-zinc-400 mt-1">
                  {servicesFeedback || `Managing ${servicesList.length} background Windows services.`}
                </p>
              </div>
              <button
                onClick={fetchServices}
                disabled={loadingServices}
                className="px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] text-zinc-300 font-semibold text-xs transition flex items-center gap-2 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingServices ? 'animate-spin' : ''}`} />
                {loadingServices ? 'Querying...' : 'Refresh Services'}
              </button>
            </div>

            {/* List */}
            {servicesList.length > 0 ? (
              <div className="space-y-2">
                {servicesList.map((svc) => (
                  <div
                    key={svc.name}
                    className="p-4 rounded-xl bg-[#16161a] border border-[#2a2a36] flex justify-between items-center"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-white">{svc.display_name}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-800 text-zinc-300">
                          {svc.start_type}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400">{svc.description || svc.recommendation}</p>
                    </div>
                    <button
                      onClick={() => handleOptimizeService(svc)}
                      className="px-3 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.08] text-xs font-semibold text-zinc-200 transition cursor-pointer"
                    >
                      {svc.start_type === 'Disabled' ? 'Enable' : 'Disable'}
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center rounded-2xl bg-[#16161a] border border-[#2a2a36] space-y-3">
                <Server className="w-8 h-8 text-zinc-600 mx-auto" />
                <p className="text-xs text-zinc-400">Loading system services...</p>
              </div>
            )}
          </div>
        ) : activeTab === 'drivers' ? (
          /* Driver Cleaner Page */
          <div className="p-8 max-w-6xl space-y-6">
            <div className="p-6 rounded-2xl bg-[#16161a] border border-[#2a2a36] flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-white">DriverStore & Obsolete Driver Purge</h2>
                <p className="text-xs text-zinc-400 mt-1">
                  {driversFeedback || `Inspecting ${driversList.length} third-party driver packages installed in DriverStore.`}
                </p>
              </div>
              <button
                onClick={fetchDrivers}
                disabled={loadingDrivers}
                className="px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] text-zinc-300 font-semibold text-xs transition flex items-center gap-2 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingDrivers ? 'animate-spin' : ''}`} />
                {loadingDrivers ? 'Reading Drivers...' : 'Scan Drivers'}
              </button>
            </div>

            {/* List */}
            {driversList.length > 0 ? (
              <div className="space-y-2">
                {driversList.map((drv) => (
                  <div
                    key={drv.published_name}
                    className="p-4 rounded-xl bg-[#16161a] border border-[#2a2a36] flex justify-between items-center"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-white">{drv.original_name}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-800 text-zinc-300">
                          {drv.provider}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400 font-mono">
                        Published: {drv.published_name} • Date: {drv.date} • Class: {drv.class_name}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteDriver(drv.published_name)}
                      className="px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 text-xs font-semibold transition cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center rounded-2xl bg-[#16161a] border border-[#2a2a36] space-y-3">
                <Wrench className="w-8 h-8 text-zinc-600 mx-auto" />
                <p className="text-xs text-zinc-400">Loading installed third-party driver packages...</p>
              </div>
            )}
          </div>
        ) : activeTab === 'uninstaller' ? (
          /* Uninstaller Page */
          <div className="p-8 max-w-6xl space-y-6">
            <div className="p-6 rounded-2xl bg-[#16161a] border border-[#2a2a36] flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-white">Clean Software Uninstaller</h2>
                <p className="text-xs text-zinc-400 mt-1">
                  {uninstallerFeedback || `Found ${programsList.length} registered programs in Windows Registry.`}
                </p>
              </div>
              <button
                onClick={fetchPrograms}
                disabled={loadingPrograms}
                className="px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] text-zinc-300 font-semibold text-xs transition flex items-center gap-2 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingPrograms ? 'animate-spin' : ''}`} />
                {loadingPrograms ? 'Reading Registry...' : 'Refresh Programs'}
              </button>
            </div>

            {/* List */}
            {programsList.length > 0 ? (
              <div className="space-y-2">
                {programsList.map((prog) => (
                  <div
                    key={prog.id}
                    className="p-4 rounded-xl bg-[#16161a] border border-[#2a2a36] flex justify-between items-center"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-white">{prog.name}</span>
                        <span className="text-xs text-zinc-500 font-mono">v{prog.version}</span>
                      </div>
                      <p className="text-xs text-zinc-400">{prog.publisher}</p>
                    </div>
                    <button
                      onClick={() => handleUninstallProgram(prog)}
                      className="px-3 py-1.5 rounded-lg bg-red-500 hover:bg-red-400 text-white text-xs font-semibold transition cursor-pointer shadow-lg shadow-red-500/20"
                    >
                      Uninstall
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center rounded-2xl bg-[#16161a] border border-[#2a2a36] space-y-3">
                <Package className="w-8 h-8 text-zinc-600 mx-auto" />
                <p className="text-xs text-zinc-400">Loading installed Windows programs...</p>
              </div>
            )}
          </div>
        ) : activeTab === 'shredder' ? (
          /* File Shredder Page */
          <div className="p-8 max-w-5xl space-y-6">
            <div className="p-6 rounded-2xl bg-[#16161a] border border-[#2a2a36]">
              <h2 className="text-lg font-bold text-white">Cryptographic File Shredder (DoD 5220.22-M)</h2>
              <p className="text-xs text-zinc-400 mt-1">
                {shredFeedback || 'Permanently destroys files via 3-pass pseudo-random overwrite + zeroization prior to filesystem unlink.'}
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#16161a] border border-[#2a2a36] space-y-4">
              <h3 className="text-sm font-semibold text-white">Target File for Destruction</h3>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={shredPath}
                  onChange={(e) => setShredPath(e.target.value)}
                  placeholder="Enter full absolute file path to destroy (e.g. D:\sensitive.txt)..."
                  className="flex-1 px-3 py-2 rounded-lg bg-black/40 border border-zinc-700 text-xs text-white focus:outline-none focus:border-red-500 font-mono"
                />
                <button
                  onClick={handleShredTarget}
                  disabled={shredding || !shredPath}
                  className="px-5 py-2.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition cursor-pointer flex items-center gap-2 shadow-lg shadow-red-600/20 disabled:opacity-50"
                >
                  <FileX2 className={`w-4 h-4 ${shredding ? 'animate-spin' : ''}`} />
                  {shredding ? 'Shredding...' : 'Shred File Permanently'}
                </button>
              </div>
            </div>
          </div>
        ) : activeTab === 'privacy' ? (
          /* Privacy Shield Page */
          <div className="p-8 max-w-6xl space-y-6">
            <div className="p-6 rounded-2xl bg-[#16161a] border border-[#2a2a36] flex justify-between items-center">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-bold text-white">
                    Privacy Score: {privacyState?.score_percentage || 0}%
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {privacyState?.protected_count || 0} / {privacyState?.total_count || 0} Shields Active
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mt-1">
                  {privacyFeedback || 'Disable Windows telemetry, advertising IDs, diagnostic feedback, and location tracking.'}
                </p>
              </div>
              <button
                onClick={handleProtectAllPrivacy}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition flex items-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                Protect All Now
              </button>
            </div>

            {/* Policies List */}
            {privacyState && (
              <div className="space-y-2">
                {privacyState.settings.map((s) => (
                  <div
                    key={s.id}
                    className="p-4 rounded-xl bg-[#16161a] border border-[#2a2a36] flex justify-between items-center"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-white">{s.label}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-800 text-zinc-300 capitalize">
                          {s.category}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400">{s.description}</p>
                    </div>
                    <button
                      onClick={() => handleTogglePrivacy(s.id, s.is_enabled)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                        s.is_enabled
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-zinc-800 text-zinc-400'
                      }`}
                    >
                      {s.is_enabled ? 'Protected' : 'Exposed'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="p-8 text-xs text-zinc-400">Section active</div>
        )}
      </main>
    </div>
  )
}
