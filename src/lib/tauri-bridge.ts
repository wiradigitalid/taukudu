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
}
