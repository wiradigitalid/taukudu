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
  scanDuplicates: async (options: DuplicateScanOptions): Promise<DuplicateScanResult> => {
    return await invoke('scan_duplicates', { options })
  },
  deleteDuplicateFiles: async (paths: string[]): Promise<number> => {
    return await invoke('delete_duplicate_files', { paths })
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
}
