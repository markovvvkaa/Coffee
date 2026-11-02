import { useEffect, useState } from 'react'

export function readStorage(key: string): string | null {
  try { return window.localStorage.getItem(key) } catch { return null }
}
export function writeStorage(key: string, value: unknown): void {
  try { window.localStorage.setItem(key, JSON.stringify(value)) } catch {}
}

export function useStoredState<T>(key: string, parse: (raw: string | null) => T) {
  const [value, setValue] = useState<T>(() => parse(readStorage(key)))
  useEffect(() => writeStorage(key, value), [key, value])
  return [value, setValue] as const
}
