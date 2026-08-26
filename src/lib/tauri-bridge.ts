import { invoke } from '@tauri-apps/api/core'

export interface SystemOverview {
  os_name: string
  os_version: string
  host_name: string
  total_memory_bytes: number
  used_memory_bytes: number
  cpu_count: number
}

export interface ScannedItem {
  path: string
  size_bytes: number
  subcategory: string
  category: string
  needs_admin: boolean
}

export interface CategoryScanSummary {
  category: string
  total_files: number
  total_bytes: number
  items: ScannedItem[]
}

export interface ScanResult {
  categories: CategoryScanSummary[]
  total_files: number
  total_bytes: number
}

export interface CleanExecutionResult {
  deleted_files: number
  deleted_bytes: number
  failed_files: number
  errors: string[]
}

export interface ProcessBlockerInfo {
  pid: number
  name: string
  display_name: string
  category: string
  blocked_paths: string[]
}

export interface BlockerSummary {
  blockers: ProcessBlockerInfo[]
  total_blockers: number
  has_blocking_processes: boolean
}

export interface DuplicateFile {
  path: string
  size: number
  last_modified: number
}

export interface DuplicateGroup {
  hash: string
  size: number
  files: DuplicateFile[]
}

export interface DuplicateScanResult {
  groups: DuplicateGroup[]
  total_duplicates: number
  reclaimable_space: number
  scan_duration_ms: number
  files_scanned: number
}

export interface DuplicateScanOptions {
  directory: string
  min_file_size: number
  max_file_size: number | null
  exclude_patterns: string[]
  extension_filter: string[]
  max_depth: number | null
}

export interface EmptyFolderItem {
  path: string
  name: string
}

export interface EmptyFolderScanResult {
  folders: EmptyFolderItem[]
  total_count: number
  scan_duration_ms: number
}

export interface LargeFileItem {
  path: string
  name: string
  size_bytes: number
  last_modified: number
}

export interface LargeFileScanResult {
  files: LargeFileItem[]
  total_count: number
  total_size_bytes: number
  scan_duration_ms: number
}

export interface PrivacySetting {
  id: string
  category: string
  label: string
  description: string
  requires_admin: boolean
  is_enabled: boolean
}

export interface PrivacyShieldState {
  settings: PrivacySetting[]
  protected_count: number
  total_count: number
  score_percentage: number
}

export interface DiskDriveInfo {
  name: string
  mount_point: string
  total_space_bytes: number
  available_space_bytes: number
  used_space_bytes: number
  file_system: string
  is_removable: boolean
}

export interface DiskTreemapNode {
  name: string
  path: string
  size: number
  children: DiskTreemapNode[]
}

export interface FileTypeBreakdown {
  extension: string
  count: number
  total_size_bytes: number
}

export interface DiskAnalysisResult {
  tree: DiskTreemapNode
  file_types: FileTypeBreakdown[]
  total_size_bytes: number
}

export interface StartupItem {
  id: string
  name: string
  command: string
  location: string
  is_enabled: boolean
  impact_rating: string
}

export interface BloatwareApp {
  id: string
  name: string
  package_name: string
  publisher: string
  category: string
  description: string
  is_installed: boolean
}

export interface MalwareThreat {
  id: string
  path: string
  file_name: string
  size: number
  detection_name: string
  severity: string
  source: string
  details: string
  selected: boolean
}

export interface MalwareScanResult {
  threats: MalwareThreat[]
  files_scanned: number
  duration_ms: number
  scan_type: string
}

export interface MalwareActionResult {
  success_count: number
  failure_count: number
  details: string[]
}

export interface ServiceItemInfo {
  name: string
  display_name: string
  status: string
  start_type: string
  description: string
  is_microsoft: boolean
  recommendation: string
}

export interface DriverPackageInfo {
  id: string
  published_name: string
  original_name: string
  provider: string
  class_name: string
  version: string
  date: string
  is_superseded: boolean
}

export interface InstalledProgramInfo {
  id: string
  name: string
  publisher: string
  version: string
  install_location: string
  uninstall_string: string
  estimated_size_bytes: number
}

export interface ShredderResult {
  files_shredded: number
  bytes_shredded: number
  failed_files: number
  errors: string[]
}

export interface ProcessItem {
  pid: number
  name: string
  cpu_usage: number
  memory_bytes: number
}

export interface PerformanceSnapshot {
  cpu_usage_percent: number
  total_memory_bytes: number
  used_memory_bytes: number
  memory_usage_percent: number
  top_processes: ProcessItem[]
  process_count: number
  uptime_seconds: number
}

export interface HistoryRecord {
  id: string
  timestamp: string
  action_type: string
  total_space_saved_bytes: number
  total_items_cleaned: number
  duration_ms: number
  details_summary: string
}

export interface NetworkItemInfo {
  id: string
  item_type: string
  label: string
  detail: string
  is_selected: boolean
}

export interface ActiveConnectionInfo {
  protocol: string
  local_address: string
  foreign_address: string
  state: string
  pid: number
}

export interface RegistryIssue {
  id: string
  category: string
  key_path: string
  value_name: string
  issue_description: string
  target_file: string
  is_selected: boolean
}

export interface RegistryScanResult {
  issues: RegistryIssue[]
  total_found: number
  duration_ms: number
}

export interface RegistryFixResult {
  fixed_count: number
  failed_count: number
  errors: string[]
}

export interface RegistryBackupEntry {
  id: string
  filename: string
  key_path: string
  file_size_bytes: number
  created_at: string
  backup_file_path: string
}

export interface RegistryBackupSummary {
  backup_dir: string
  backups: RegistryBackupEntry[]
  total_backups: number
}

export interface BrokenShortcutItem {
  id: string
  shortcut_path: string
  filename: string
  target_path?: string | null
  broken_reason: string
  location_type: string
}

export interface BrokenShortcutScanResult {
  items: BrokenShortcutItem[]
  total_scanned: number
  total_broken: number
  scan_duration_ms: number
}

export interface BrokenShortcutCleanResult {
  deleted_count: number
  failed_count: number
  errors: string[]
}

export interface DatabaseTargetInfo {
  id: string
  app_name: string
  db_name: string
  file_path: string
  size_bytes: number
  wal_size_bytes: number
  estimated_reclaimable_bytes: number
  is_locked: boolean
}

export interface DatabaseScanSummary {
  databases: DatabaseTargetInfo[]
  total_databases_found: number
  total_estimated_reclaimable_bytes: number
  scan_duration_ms: number
}

export interface DatabaseVacuumResult {
  file_path: string
  size_before_bytes: number
  size_after_bytes: number
  bytes_reclaimed: number
  is_successful: boolean
  error_message?: string | null
}

export interface DatabaseOptimizeSummary {
  optimized_count: number
  failed_count: number
  total_bytes_reclaimed: number
  results: DatabaseVacuumResult[]
}

export interface OrphanEnvItem {
  id: string
  variable_name: string
  raw_value: string
  expanded_value: string
  scope: string
  entry_type: string
  missing_reason: string
}

export interface EnvCleanerScanResult {
  items: OrphanEnvItem[]
  total_scanned: number
  total_orphans: number
  scan_duration_ms: number
}

export interface EnvCleanerCleanResult {
  cleaned_count: number
  failed_count: number
  errors: string[]
}

export interface CacheTargetDetail {
  id: string
  name: string
  category: string
  file_path: string
  size_bytes: number
  exists: boolean
}

export interface CacheRebuildScanSummary {
  items: CacheTargetDetail[]
  total_size_bytes: number
  total_files: number
  scan_duration_ms: number
}

export interface CacheRebuildExecutionResult {
  purged_files_count: number
  bytes_reclaimed: number
  explorer_restarted: boolean
  font_service_signaled: boolean
  errors: string[]
}

export interface GamingTargetDetail {
  id: string
  group: string
  title: string
  detail: string
  path: string
  size_bytes: number
  file_count: number
}

export interface GamingScanSummary {
  targets: GamingTargetDetail[]
  total_size_bytes: number
  total_items: number
  scan_duration_ms: number
}

export interface GamingCleanResult {
  cleaned_count: number
  bytes_freed: number
  failed_count: number
  errors: string[]
}

export interface EventLogTarget {
  id: string
  name: string
  category: string
  file_path: string
  size_bytes: number
  is_channel: boolean
}

export interface EventLogScanSummary {
  targets: EventLogTarget[]
  total_size_bytes: number
  total_logs_count: number
  scan_duration_ms: number
}

export interface EventLogCleanResult {
  cleared_count: number
  bytes_freed: number
  failed_count: number
  errors: string[]
}

export interface WinUpdateTarget {
  id: string
  name: string
  description: string
  file_path: string
  size_bytes: number
  file_count: number
  needs_service_stop: boolean
}

export interface WinUpdateScanSummary {
  targets: WinUpdateTarget[]
  total_size_bytes: number
  total_files_count: number
  scan_duration_ms: number
}

export interface WinUpdateCleanResult {
  cleaned_targets_count: number
  bytes_freed: number
  services_restarted: boolean
  failed_count: number
  errors: string[]
}

export interface ProcessMemoryItem {
  pid: number
  name: string
  memory_bytes: number
  virtual_memory_bytes: number
  is_optimizable: boolean
}

export interface MemoryOptimizerSnapshot {
  total_ram_bytes: number
  used_ram_bytes: number
  free_ram_bytes: number
  usage_percentage: number
  total_processes: number
  top_processes: ProcessMemoryItem[]
  snapshot_duration_ms: number
}

export interface MemoryTrimResult {
  trimmed_processes_count: number
  memory_before_bytes: number
  memory_after_bytes: number
  memory_freed_bytes: number
  failed_count: number
  errors: string[]
}

export interface SafetyRating {
  key: string
  name: string
  publisher: string
  safety_score: number
  classification: string
  recommendation: string
  description: string
}

export interface SafetyRatingSummary {
  total_ratings_known: number
  ratings: SafetyRating[]
}

export interface HostsEntryItem {
  ip_address: string
  hostname: string
  is_commented: boolean
  is_telemetry_block: boolean
  raw_line: string
}

export interface HostsFileSummary {
  hosts_file_path: string
  is_writable: boolean
  total_entries: number
  telemetry_blocked_count: number
  entries: HostsEntryItem[]
  scan_duration_ms: number
}

export interface HostsApplyResult {
  success: boolean
  backup_file_path?: string | null
  blocked_domains_count: number
  message: string
}

export interface DevCacheTarget {
  id: string
  ecosystem: string
  name: string
  description: string
  file_path: string
  size_bytes: number
  file_count: number
}

export interface DevCacheScanSummary {
  targets: DevCacheTarget[]
  total_size_bytes: number
  total_targets_count: number
  scan_duration_ms: number
}

export interface DevCacheCleanResult {
  cleaned_targets_count: number
  bytes_freed: number
  failed_count: number
  errors: string[]
}

export interface PhysicalDriveHealth {
  device_id: string
  model: string
  media_type: string
  bus_type: string
  size_bytes: number
  status: string
  health_status: string
  operational_status: string
  temperature_celsius?: number | null
  wear_percentage?: number | null
  serial_number: string
}

export interface DriveHealthSummary {
  drives: PhysicalDriveHealth[]
  total_drives: number
  has_failing_drive: boolean
  scan_duration_ms: number
}

export interface BugcheckStopCode {
  code_hex: string
  symbol: string
  description: string
  common_causes: string
  recommended_fix: string
}

export interface MinidumpCrashReport {
  id: string
  filename: string
  file_path: string
  size_bytes: number
  crash_time_formatted: string
  stop_code_hex: string
  stop_code_symbol: string
  stop_code_description: string
  faulting_module?: string | null
  recommended_fix: string
}

export interface BsodDumpAnalysisSummary {
  crash_reports: MinidumpCrashReport[]
  total_crashes_detected: number
  latest_crash_date?: string | null
  scan_duration_ms: number
}

export interface BatteryDiagnosticInfo {
  has_battery: boolean
  device_name: string
  manufacturer: string
  chemistry: string
  design_capacity_mwh: number
  full_charge_capacity_mwh: number
  current_capacity_mwh: number
  health_percentage: number
  charge_level_percentage: number
  estimated_runtime_minutes?: number | null
  status: string
  is_ac_connected: boolean
}

export interface PowerPlanScheme {
  guid: string
  name: string
  is_active: boolean
}

export interface PowerSummary {
  battery: BatteryDiagnosticInfo
  power_plans: PowerPlanScheme[]
  active_plan_name: string
  scan_duration_ms: number
}

export interface ShadowCopyItem {
  id: string
  shadow_id: string
  volume_name: string
  creation_time: string
  provider: string
}

export interface ShadowStorageAllocation {
  volume: string
  used_space_bytes: number
  allocated_space_bytes: number
  max_space_bytes: number
}

export interface VssSummary {
  shadow_copies: ShadowCopyItem[]
  storage_allocations: ShadowStorageAllocation[]
  total_shadows: number
  total_used_bytes: number
  scan_duration_ms: number
}

export interface VssPurgeResult {
  success: boolean
  shadows_purged: number
  bytes_freed: number
  message: string
}

export interface DefenderExclusionItem {
  id: string
  exclusion_type: string
  value: string
  risk_level: string
  risk_reason: string
}

export interface DefenderAuditSummary {
  is_antivirus_enabled: boolean
  is_realtime_protection_enabled: boolean
  is_cloud_protection_enabled: boolean
  is_tamper_protection_enabled: boolean
  antimalware_version: string
  signature_updated_date: string
  total_exclusions: number
  high_risk_exclusions_count: number
  exclusions: DefenderExclusionItem[]
  scan_duration_ms: number
}

export interface DefenderRemediationResult {
  success: boolean
  removed_exclusions_count: number
  failed_count: number
  errors: string[]
}

export interface GameModeStatus {
  is_active: boolean
  active_power_plan: string
  game_dvr_disabled: boolean
  background_indexing_paused: boolean
  memory_cleaned_mb: number
  detected_game?: string | null
  auto_detect_enabled: boolean
}

export interface GameOptimizationItem {
  id: string
  title: string
  description: string
  category: string
  is_applied: boolean
}

export interface TrimDriveStatus {
  drive_letter: string
  media_type: string
  trim_enabled: boolean
  last_status: string
}

export interface TrimRecord {
  drive_letter: string
  timestamp_secs: number
  date_formatted: string
  is_throttled: boolean
}

export interface TrimHistorySummary {
  records: TrimRecord[]
  total_trimmed_drives: number
}

export interface DiskRepairOutput {
  tool: string
  success: boolean
  exit_code: number
  output: string
  summary: string
}

export interface ContextMenuEntryInfo {
  id: string
  name: string
  hive: string
  scope: string
  key_path: string
  command: string
  source: string
  is_enabled: boolean
}

export interface ContextMenuScanResult {
  entries: ContextMenuEntryInfo[]
  total_found: number
}

export interface FirewallRuleInfo {
  name: string
  display_name: string
  direction: string
  action: string
  is_enabled: boolean
  profile: string
  local_port: string
  remote_port: string
  protocol: string
  program: string
  risk_level: string
  risk_reason: string
}

export interface FirewallAuditSummary {
  rules: FirewallRuleInfo[]
  total_rules: number
  high_risk_count: number
  open_inbound_ports: number[]
}

export interface CveItem {
  cve_id: string
  package_name: string
  installed_version: string
  fixed_version: string
  severity: string
  description: string
  published_date: string
  is_remediated: boolean
  is_filtered_false_positive: boolean
  filter_reason?: string | null
}

export interface CveScanSummary {
  vulnerabilities: CveItem[]
  total_cves: number
  critical_count: number
  high_count: number
  filtered_false_positives_count: number
}

export interface UpdatablePackage {
  id: string
  name: string
  current_version: string
  available_version: string
  source: string
  severity: string
}

export interface SoftwareUpdateSummary {
  packages: UpdatablePackage[]
  total_outdated: number
  major_count: number
  manager_name: string
  is_manager_available: boolean
}

export interface UpdateExecutionResult {
  success: boolean
  updated_count: number
  output: string
}

export interface ScheduleItem {
  id: string
  name: string
  frequency: string
  hour: number
  minute: number
  day_of_week?: number
  day_of_month?: number
  categories: string[]
  is_enabled: boolean
  auto_clean: boolean
  last_run_at?: string
}

export interface ScheduleSummary {
  schedules: ScheduleItem[]
  total_schedules: number
  active_count: number
  next_scheduled_run?: string
}

export interface BreachIncident {
  id: string
  title: string
  domain: string
  breach_date: string
  compromised_accounts: number
  compromised_data: string[]
  is_acknowledged: boolean
}

export interface MonitoredEmailStatus {
  email: string
  breaches: BreachIncident[]
  added_at: string
}

export interface BreachMonitorSummary {
  monitored_emails: MonitoredEmailStatus[]
  total_emails: number
  total_breaches: number
  unacknowledged_count: number
}

export interface LeftoverFolderItem {
  id: string
  path: string
  folder_name: string
  parent_directory: string
  size_bytes: number
  file_count: number
  last_modified: number
  is_selected: boolean
}

export interface LeftoversScanResult {
  items: LeftoverFolderItem[]
  total_count: number
  total_size_bytes: number
  scan_duration_ms: number
}

export interface LeftoversCleanResult {
  success_count: number
  failed_count: number
  bytes_freed: number
  errors: string[]
}

export interface RestorePointItem {
  sequence_number: number
  description: string
  restore_point_type: string
  creation_time: string
}

export interface RestorePointSummary {
  is_protection_enabled: boolean
  restore_points: RestorePointItem[]
  total_count: number
  last_created_time?: string
}

export interface RestorePointResult {
  success: boolean
  message: string
}

export interface RecycleBinItemDetail {
  id: string
  original_path: string
  file_name: string
  size_bytes: number
  deleted_timestamp: string
  drive_letter: string
  payload_path: string
}

export interface RecycleBinDriveStat {
  drive_letter: string
  path: string
  items_count: number
  total_bytes: number
  is_accessible: boolean
}

export interface RecycleBinSummary {
  drives: RecycleBinDriveStat[]
  items: RecycleBinItemDetail[]
  total_items: number
  total_bytes: number
  scan_duration_ms: number
}

export interface RecycleBinCleanResult {
  payloads_deleted: number
  orphan_metadata_deleted: number
  bytes_freed: number
  failed_count: number
  shell_sync_status: number
  errors: string[]
}

export interface FlaggedConnection {
  id: string
  protocol: string
  local_addr: string
  remote_addr: string
  remote_ip: string
  remote_port: number
  pid: number
  process_name: string
  threat_category: string
  risk_reason: string
  timestamp: string
}

export interface ThreatMonitorSummary {
  total_connections_scanned: number
  flagged_threats_count: number
  flagged_connections: FlaggedConnection[]
  monitored_blacklist_entries: number
  is_monitoring_active: boolean
}

export interface BrowserProfileCacheTarget {
  browser_key: string
  browser_name: string
  profile_name: string
  cache_type: string
  path: string
  exists: boolean
}

export interface BrowserCacheScanSummary {
  browsers_detected: string[]
  targets: BrowserProfileCacheTarget[]
  total_targets: number
}

export interface DeletePathProbeResult {
  path: string
  status: string
  error_code: number
  is_deletable: boolean
  reason: string
}

export interface DeleteProbeSummary {
  total_probed: number
  accessible_count: number
  in_use_count: number
  permission_denied_count: number
  results: DeletePathProbeResult[]
}

export interface GranularDeletedFileEntry {
  id: string
  session_id: string
  path: string
  size_bytes: number
  cleaner_category: string
  timestamp: string
}

export interface DeletionLogStats {
  total_logged_files: number
  total_bytes_logged: number
  log_file_size_bytes: number
  log_file_path: string
}

export interface CleanerConfig {
  skip_recent_minutes: number
  secure_delete: boolean
  close_browsers_before_clean: boolean
  create_restore_point_before_clean: boolean
  protect_recycle_bin: boolean
  keep_deletion_log: boolean
}

export interface AppSettings {
  theme: string
  language: string
  minimize_to_tray: boolean
  show_notification_on_complete: boolean
  show_threat_notifications: boolean
  run_at_startup: boolean
  auto_update: boolean
  backup_path: string
  cleaner: CleanerConfig
  exclusions: string[]
  ignored_software_updates: string[]
}

export interface MetricLine {
  name: string
  type: string
  help: string
  labels: Record<string, string>
  value: number
}

export interface PrometheusMetricsSummary {
  metrics: MetricLine[]
  raw_prometheus_text: string
}

export interface WindowGeometryState {
  x?: number
  y?: number
  width: number
  height: number
  is_maximized: boolean
}

export interface AntivirusProductInfo {
  name: string
  is_enabled: boolean
  real_time_protection: boolean
  signatures_up_to_date: boolean
}

export interface BitlockerVolumeInfo {
  mount_point: string
  volume_status: string
  protection_on: boolean
}

export interface HotfixPatchInfo {
  hotfix_id: string
  description: string
  installed_on: string
}

export interface SecurityPostureSummary {
  is_elevated_admin: boolean
  antivirus_products: AntivirusProductInfo[]
  primary_antivirus?: string | null
  bitlocker_volumes: BitlockerVolumeInfo[]
  recent_hotfixes: HotfixPatchInfo[]
  last_patch_date?: string | null
  days_since_last_patch?: number | null
  firewall_enabled: boolean
  screen_lock_enabled: boolean
  password_complexity_required: boolean
  windows_hello_enrolled: boolean
}

export interface ThreatBlacklistData {
  version: string
  updated_at: string
  domains: string[]
  ips: string[]
  cidrs: string[]
}

export interface ThreatBlacklistSummary {
  version: string
  updated_at: string
  total_domains: number
  total_ips: number
  total_cidrs: number
  file_path: string
}

export interface LogEntry {
  timestamp: string
  level: string
  message: string
  source?: string
}

export interface LogStats {
  log_file_path: string
  log_file_size_bytes: number
  total_lines: number
  error_count: number
  warn_count: number
}

export interface AppReleaseInfo {
  current_version: string
  latest_version: string
  is_update_available: boolean
  release_name: string
  release_notes: string
  published_at: string
  download_url: string
  checked_at: string
}

export interface GpuDiagnosticInfo {
  adapter_name: string
  driver_version: string
  driver_date: string
  is_hardware_acceleration_disabled: boolean
  marker_exists: boolean
  rendering_mode: string
}

export interface YaraRuleFileEntry {
  filename: string
  content: string
  size_bytes: number
  description?: string | null
}

export interface YaraRulesMetadata {
  version: string
  updated_at: string
  rules_count: number
  sha256_hash: string
  rules_directory: string
}

export const tauriApi = {
  greet: async (name: string): Promise<string> => {
    return await invoke('greet', { name })
  },
  getSystemOverview: async (): Promise<SystemOverview> => {
    return await invoke('get_system_overview')
  },
  scanCleaners: async (): Promise<ScanResult> => {
    return await invoke('scan_cleaners')
  },
  cleanTargets: async (paths: string[]): Promise<CleanExecutionResult> => {
    return await invoke('clean_targets', { paths })
  },
  checkCleanerBlockers: async (target_paths: string[] = []): Promise<BlockerSummary> => {
    return await invoke('check_cleaner_blockers', { targetPaths: target_paths })
  },
  closeCleanerBlocker: async (pid: number): Promise<void> => {
    return await invoke('close_cleaner_blocker', { pid })
  },
  probeDeleteAccess: async (paths: string[]): Promise<DeleteProbeSummary> => {
    return await invoke('probe_delete_access', { paths })
  },
  scanDuplicates: async (options: DuplicateScanOptions): Promise<DuplicateScanResult> => {
    return await invoke('scan_duplicates', { options })
  },
  deleteDuplicateFiles: async (paths: string[]): Promise<number> => {
    return await invoke('delete_duplicate_files', { paths })
  },
  scanEmptyFolders: async (directory: string): Promise<EmptyFolderScanResult> => {
    return await invoke('scan_empty_folders', { directory })
  },
  scanLargeFiles: async (directory: string, minSizeBytes: number): Promise<LargeFileScanResult> => {
    return await invoke('scan_large_files', { directory, minSizeBytes })
  },
  getPrivacyShieldState: async (): Promise<PrivacyShieldState> => {
    return await invoke('get_privacy_shield_state')
  },
  applyPrivacySetting: async (id: string, enable: boolean): Promise<void> => {
    return await invoke('apply_privacy_setting', { id, enable })
  },
  getDrives: async (): Promise<DiskDriveInfo[]> => {
    return await invoke('get_drives')
  },
  analyzeDiskDirectory: async (dir_path: string, max_depth: number = 3): Promise<DiskAnalysisResult> => {
    return await invoke('analyze_disk_directory', { dirPath: dir_path, maxDepth: max_depth })
  },
  getStartupItems: async (): Promise<StartupItem[]> => {
    return await invoke('get_startup_items')
  },
  toggleStartupItem: async (id: string, enable: boolean): Promise<void> => {
    return await invoke('toggle_startup_item', { id, enable })
  },
  getBloatwareList: async (): Promise<BloatwareApp[]> => {
    return await invoke('get_bloatware_list')
  },
  removeBloatware: async (package_names: string[]): Promise<string[]> => {
    return await invoke('remove_bloatware', { packageNames: package_names })
  },
  scanMalware: async (scan_type: string = 'quick', custom_path?: string): Promise<MalwareScanResult> => {
    return await invoke('scan_malware', { scanType: scan_type, customPath: custom_path })
  },
  quarantineThreats: async (file_paths: string[]): Promise<MalwareActionResult> => {
    return await invoke('quarantine_threats', { filePaths: file_paths })
  },
  deleteThreats: async (file_paths: string[]): Promise<MalwareActionResult> => {
    return await invoke('delete_threats', { filePaths: file_paths })
  },
  getServices: async (): Promise<ServiceItemInfo[]> => {
    return await invoke('get_services')
  },
  setServiceStartMode: async (service_name: string, start_type: string): Promise<void> => {
    return await invoke('set_service_start_mode', { serviceName: service_name, startType: start_type })
  },
  getDriverPackages: async (): Promise<DriverPackageInfo[]> => {
    return await invoke('get_driver_packages')
  },
  deleteDriver: async (published_name: string): Promise<void> => {
    return await invoke('delete_driver', { publishedName: published_name })
  },
  getInstalledPrograms: async (): Promise<InstalledProgramInfo[]> => {
    return await invoke('get_installed_programs')
  },
  uninstallProgram: async (cmd: string): Promise<void> => {
    return await invoke('uninstall_program', { cmd })
  },
  shredFiles: async (paths: string[], passes: number = 3): Promise<ShredderResult> => {
    return await invoke('shred_files', { paths, passes })
  },
  getPerformanceSnapshot: async (): Promise<PerformanceSnapshot> => {
    return await invoke('get_performance_snapshot')
  },
  killProcess: async (pid: number): Promise<void> => {
    return await invoke('kill_perf_process', { pid })
  },
  getHistoryRecords: async (): Promise<HistoryRecord[]> => {
    return await invoke('get_history_records')
  },
  clearHistoryRecords: async (): Promise<void> => {
    return await invoke('clear_history_records')
  },
  getNetworkItems: async (): Promise<NetworkItemInfo[]> => {
    return await invoke('get_network_cleanup_items')
  },
  flushDnsCache: async (): Promise<void> => {
    return await invoke('flush_dns_cache')
  },
  flushArpCache: async (): Promise<void> => {
    return await invoke('flush_arp_cache')
  },
  resetTcpStack: async (): Promise<void> => {
    return await invoke('reset_tcp_stack')
  },
  getActiveConnections: async (): Promise<ActiveConnectionInfo[]> => {
    return await invoke('get_active_connections')
  },
  scanRegistryIssues: async (): Promise<RegistryScanResult> => {
    return await invoke('scan_registry_issues')
  },
  fixRegistryTargets: async (targets: [string, string][]): Promise<RegistryFixResult> => {
    return await invoke('fix_registry_targets', { targets })
  },
  getGameModeStatus: async (): Promise<GameModeStatus> => {
    return await invoke('get_game_mode_status')
  },
  toggleGameMode: async (activate: boolean): Promise<GameModeStatus> => {
    return await invoke('toggle_game_mode', { activate })
  },
  getGameOptimizations: async (): Promise<GameOptimizationItem[]> => {
    return await invoke('get_game_optimizations')
  },
  toggleGameAutoDetect: async (enable: boolean): Promise<GameModeStatus> => {
    return await invoke('toggle_game_auto_detect', { enable })
  },
  addCustomGameProcess: async (processName: string): Promise<string[]> => {
    return await invoke('add_custom_game_process', { processName })
  },
  getCustomGameProcesses: async (): Promise<string[]> => {
    return await invoke('get_custom_game_processes')
  },
  getTrimInfo: async (): Promise<TrimDriveStatus[]> => {
    return await invoke('get_trim_info')
  },
  runDiskTrim: async (drive_letter: string): Promise<string> => {
    return await invoke('run_disk_trim', { driveLetter: drive_letter })
  },
  getTrimHistorySummary: async (): Promise<TrimHistorySummary> => {
    return await invoke('get_trim_history_summary')
  },
  isDriveTrimThrottled: async (drive_letter: string): Promise<boolean> => {
    return await invoke('is_drive_trim_throttled', { driveLetter: drive_letter })
  },
  runSfcScan: async (): Promise<DiskRepairOutput> => {
    return await invoke('run_sfc_scan')
  },
  runSfcRepair: async (): Promise<DiskRepairOutput> => {
    return await invoke('run_sfc_repair')
  },
  runDismRestoreHealth: async (): Promise<DiskRepairOutput> => {
    return await invoke('run_dism_restore_health')
  },
  runChkdskScan: async (drive_letter: string): Promise<DiskRepairOutput> => {
    return await invoke('run_chkdsk_scan', { driveLetter: drive_letter })
  },
  getContextMenuEntries: async (): Promise<ContextMenuScanResult> => {
    return await invoke('get_context_menu_entries')
  },
  toggleContextMenuEntry: async (key_path: string, enable: boolean): Promise<void> => {
    return await invoke('toggle_context_menu_entry', { keyPath: key_path, enable })
  },
  auditFirewall: async (): Promise<FirewallAuditSummary> => {
    return await invoke('audit_firewall')
  },
  toggleFirewallRule: async (rule_name: string, enable: boolean): Promise<void> => {
    return await invoke('toggle_firewall_rule', { ruleName: rule_name, enable })
  },
  scanCves: async (): Promise<CveScanSummary> => {
    return await invoke('scan_cves')
  },
  checkSoftwareUpdates: async (): Promise<SoftwareUpdateSummary> => {
    return await invoke('check_software_updates')
  },
  upgradeSoftwarePackage: async (package_id: string): Promise<UpdateExecutionResult> => {
    return await invoke('upgrade_software_package', { packageId: package_id })
  },
  upgradeAllSoftwarePackages: async (): Promise<UpdateExecutionResult> => {
    return await invoke('upgrade_all_software_packages')
  },
  getSchedules: async (): Promise<ScheduleSummary> => {
    return await invoke('get_schedules')
  },
  toggleSchedule: async (id: string, enable: boolean): Promise<void> => {
    return await invoke('toggle_schedule', { id, enable })
  },
  getBreachSummary: async (): Promise<BreachMonitorSummary> => {
    return await invoke('get_breach_summary')
  },
  addBreachEmail: async (email: string): Promise<BreachMonitorSummary> => {
    return await invoke('add_breach_email', { email })
  },
  removeBreachEmail: async (email: string): Promise<BreachMonitorSummary> => {
    return await invoke('remove_breach_email', { email })
  },
  acknowledgeBreachIncident: async (breach_id: string): Promise<BreachMonitorSummary> => {
    return await invoke('acknowledge_breach_incident', { breachId: breach_id })
  },
  scanUninstallLeftovers: async (): Promise<LeftoversScanResult> => {
    return await invoke('scan_uninstall_leftovers')
  },
  deleteUninstallLeftovers: async (paths: string[]): Promise<LeftoversCleanResult> => {
    return await invoke('delete_uninstall_leftovers', { paths })
  },
  getRestorePoints: async (): Promise<RestorePointSummary> => {
    return await invoke('get_restore_points')
  },
  createRestorePoint: async (description: string): Promise<RestorePointResult> => {
    return await invoke('create_restore_point', { description })
  },
  getRecycleBinSummary: async (): Promise<RecycleBinSummary> => {
    return await invoke('get_recycle_bin_summary')
  },
  emptyRecycleBinFast: async (): Promise<RecycleBinCleanResult> => {
    return await invoke('empty_recycle_bin_fast')
  },
  auditActiveThreats: async (): Promise<ThreatMonitorSummary> => {
    return await invoke('audit_active_threats')
  },
  addThreatBlacklistCidr: async (cidr: string, category: string, reason: string): Promise<number> => {
    return await invoke('add_threat_blacklist_cidr', { cidr, category, reason })
  },
  terminateThreatProcess: async (pid: number): Promise<void> => {
    return await invoke('terminate_threat_process', { pid })
  },
  discoverBrowserCacheTargets: async (): Promise<BrowserCacheScanSummary> => {
    return await invoke('discover_browser_cache_targets')
  },
  queryDeletionLog: async (
    sessionId?: string,
    searchQuery?: string,
    categoryFilter?: string,
    limit?: number
  ): Promise<GranularDeletedFileEntry[]> => {
    return await invoke('query_deletion_log', { sessionId, searchQuery, categoryFilter, limit })
  },
  getDeletionLogStats: async (): Promise<DeletionLogStats> => {
    return await invoke('get_deletion_log_stats')
  },
  clearDeletionLog: async (): Promise<void> => {
    return await invoke('clear_deletion_log')
  },
  getAppSettings: async (): Promise<AppSettings> => {
    return await invoke('get_app_settings')
  },
  updateAppSettings: async (settings: AppSettings): Promise<AppSettings> => {
    return await invoke('update_app_settings', { settings })
  },
  addExclusionPath: async (path: string): Promise<string[]> => {
    return await invoke('add_exclusion_path', { path })
  },
  removeExclusionPath: async (path: string): Promise<string[]> => {
    return await invoke('remove_exclusion_path', { path })
  },
  collectPrometheusMetrics: async (): Promise<PrometheusMetricsSummary> => {
    return await invoke('collect_prometheus_metrics')
  },
  getWindowState: async (): Promise<WindowGeometryState> => {
    return await invoke('get_window_state')
  },
  saveWindowState: async (state: WindowGeometryState): Promise<WindowGeometryState> => {
    return await invoke('save_window_state', { state })
  },
  collectSecurityPosture: async (): Promise<SecurityPostureSummary> => {
    return await invoke('collect_security_posture')
  },
  checkIsAdmin: async (): Promise<boolean> => {
    return await invoke('check_is_admin')
  },
  getThreatBlacklistSummary: async (): Promise<ThreatBlacklistSummary> => {
    return await invoke('get_threat_blacklist_summary')
  },
  getThreatBlacklistData: async (): Promise<ThreatBlacklistData> => {
    return await invoke('get_threat_blacklist_data')
  },
  updateThreatBlacklistData: async (data: ThreatBlacklistData): Promise<ThreatBlacklistSummary> => {
    return await invoke('update_threat_blacklist_data', { data })
  },
  addThreatBlacklistDomain: async (domain: string): Promise<ThreatBlacklistSummary> => {
    return await invoke('add_threat_blacklist_domain', { domain })
  },
  writeAppLog: async (level: string, message: string, source?: string): Promise<void> => {
    return await invoke('write_app_log', { level, message, source })
  },
  queryAppLogs: async (limit?: number, filterLevel?: string): Promise<LogEntry[]> => {
    return await invoke('query_app_logs', { limit, filterLevel })
  },
  getAppLogStats: async (): Promise<LogStats> => {
    return await invoke('get_app_log_stats')
  },
  clearAppLogs: async (): Promise<void> => {
    return await invoke('clear_app_logs')
  },
  getAppVersion: async (): Promise<string> => {
    return await invoke('get_app_version')
  },
  checkAppUpdates: async (): Promise<AppReleaseInfo> => {
    return await invoke('check_app_updates')
  },
  getGpuDiagnostics: async (): Promise<GpuDiagnosticInfo> => {
    return await invoke('get_gpu_diagnostics')
  },
  setGpuHardwareAcceleration: async (disable: boolean): Promise<GpuDiagnosticInfo> => {
    return await invoke('set_gpu_hardware_acceleration', { disable })
  },
  listYaraRuleFiles: async (): Promise<YaraRuleFileEntry[]> => {
    return await invoke('list_yara_rule_files')
  },
  getYaraRulesMetadata: async (): Promise<YaraRulesMetadata> => {
    return await invoke('get_yara_rules_metadata')
  },
  saveYaraRuleFile: async (filename: string, content: string): Promise<YaraRulesMetadata> => {
    return await invoke('save_yara_rule_file', { filename, content })
  },
  deleteYaraRuleFile: async (filename: string): Promise<YaraRulesMetadata> => {
    return await invoke('delete_yara_rule_file', { filename })
  },
  listRegistryBackups: async (): Promise<RegistryBackupSummary> => {
    return await invoke('list_registry_backups')
  },
  exportRegistryKeyBackup: async (keyPath: string, tag: string): Promise<RegistryBackupEntry> => {
    return await invoke('export_registry_key_backup', { keyPath, tag })
  },
  restoreRegistryBackup: async (filePath: string): Promise<string> => {
    return await invoke('restore_registry_backup', { filePath })
  },
  deleteRegistryBackup: async (filePath: string): Promise<void> => {
    return await invoke('delete_registry_backup', { filePath })
  },
  scanBrokenShortcuts: async (): Promise<BrokenShortcutScanResult> => {
    return await invoke('scan_broken_shortcuts')
  },
  deleteBrokenShortcuts: async (paths: string[]): Promise<BrokenShortcutCleanResult> => {
    return await invoke('delete_broken_shortcuts', { paths })
  },
  scanSqliteDatabases: async (): Promise<DatabaseScanSummary> => {
    return await invoke('scan_sqlite_databases')
  },
  vacuumSqliteDatabases: async (paths: string[]): Promise<DatabaseOptimizeSummary> => {
    return await invoke('vacuum_sqlite_databases', { paths })
  },
  scanEnvironmentOrphans: async (): Promise<EnvCleanerScanResult> => {
    return await invoke('scan_environment_orphans')
  },
  cleanEnvironmentOrphans: async (items: OrphanEnvItem[]): Promise<EnvCleanerCleanResult> => {
    return await invoke('clean_environment_orphans', { items })
  },
  scanIconFontCaches: async (): Promise<CacheRebuildScanSummary> => {
    return await invoke('scan_icon_font_caches')
  },
  rebuildAndPurgeCaches: async (restartExplorer: boolean): Promise<CacheRebuildExecutionResult> => {
    return await invoke('rebuild_and_purge_caches', { restartExplorer })
  },
  scanGamingCleaner: async (): Promise<GamingScanSummary> => {
    return await invoke('scan_gaming_cleaner')
  },
  cleanGamingTargets: async (paths: string[]): Promise<GamingCleanResult> => {
    return await invoke('clean_gaming_targets', { paths })
  },
  scanWindowsEventLogs: async (): Promise<EventLogScanSummary> => {
    return await invoke('scan_windows_event_logs')
  },
  cleanWindowsEventLogs: async (targets: EventLogTarget[]): Promise<EventLogCleanResult> => {
    return await invoke('clean_windows_event_logs', { targets })
  },
  scanWindowsUpdates: async (): Promise<WinUpdateScanSummary> => {
    return await invoke('scan_windows_updates')
  },
  cleanWindowsUpdates: async (paths: string[]): Promise<WinUpdateCleanResult> => {
    return await invoke('clean_windows_updates', { paths })
  },
  getMemoryOptimizerSnapshot: async (): Promise<MemoryOptimizerSnapshot> => {
    return await invoke('get_memory_optimizer_snapshot')
  },
  trimMemoryWorkingSets: async (): Promise<MemoryTrimResult> => {
    return await invoke('trim_memory_working_sets')
  },
  getSafetyIntelligenceSummary: async (): Promise<SafetyRatingSummary> => {
    return await invoke('get_safety_intelligence_summary')
  },
  lookupSafetyRating: async (query: string): Promise<SafetyRating | null> => {
    return await invoke('lookup_safety_rating', { query })
  },
  scanHostsFileSecurity: async (): Promise<HostsFileSummary> => {
    return await invoke('scan_hosts_file_security')
  },
  applyHostsTelemetryBlock: async (enableBlock: boolean): Promise<HostsApplyResult> => {
    return await invoke('apply_hosts_telemetry_block', { enableBlock })
  },
  scanDeveloperCaches: async (): Promise<DevCacheScanSummary> => {
    return await invoke('scan_developer_caches')
  },
  cleanDeveloperCaches: async (paths: string[]): Promise<DevCacheCleanResult> => {
    return await invoke('clean_developer_caches', { paths })
  },
  inspectPhysicalDrivesHealth: async (): Promise<DriveHealthSummary> => {
    return await invoke('inspect_physical_drives_health')
  },
  analyzeBsodCrashDumps: async (): Promise<BsodDumpAnalysisSummary> => {
    return await invoke('analyze_bsod_crash_dumps')
  },
  getKnownBugcheckCodes: async (): Promise<BugcheckStopCode[]> => {
    return await invoke('get_known_bugcheck_codes')
  },
  getPowerDiagnosticsSummary: async (): Promise<PowerSummary> => {
    return await invoke('get_power_diagnostics_summary')
  },
  setActivePowerScheme: async (guid: string): Promise<string> => {
    return await invoke('set_active_power_scheme', { guid })
  },
  scanVssShadowCopies: async (): Promise<VssSummary> => {
    return await invoke('scan_vss_shadow_copies')
  },
  purgeVssShadowCopies: async (purgeAll: boolean): Promise<VssPurgeResult> => {
    return await invoke('purge_vss_shadow_copies', { purgeAll })
  },
  auditWindowsDefenderSecurity: async (): Promise<DefenderAuditSummary> => {
    return await invoke('audit_windows_defender_security')
  },
  removeDefenderExclusion: async (exclusionType: string, value: string): Promise<DefenderRemediationResult> => {
    return await invoke('remove_defender_exclusion', { exclusionType, value })
  },
}
