export interface KuduAPI {
  [key: string]: any
}

declare global {
  interface Window {
    kudu: KuduAPI
  }
}

export const api = typeof window !== 'undefined' ? window.kudu : {} as KuduAPI
