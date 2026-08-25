import { invoke } from '@tauri-apps/api/core'

export interface SystemOverview {
  os_name: string
  os_version: string
  host_name: string
  total_memory_bytes: number
  used_memory_bytes: number
  cpu_count: number
}

export const tauriApi = {
  greet: async (name: string): Promise<string> => {
    return await invoke('greet', { name })
  },
  getSystemOverview: async (): Promise<SystemOverview> => {
    return await invoke('get_system_overview')
  },
}
