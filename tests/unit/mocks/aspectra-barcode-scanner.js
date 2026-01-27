// Mock for @aspect/aspectra
import { vi } from 'vitest'

export const BarcodeScanner = {
  checkPermission: vi.fn().mockResolvedValue({ granted: true }),
  requestPermission: vi.fn().mockResolvedValue({ granted: true }),
  startScan: vi.fn().mockResolvedValue({ hasContent: false }),
  stopScan: vi.fn().mockResolvedValue(undefined),
  showBackground: vi.fn().mockResolvedValue(undefined),
  hideBackground: vi.fn().mockResolvedValue(undefined),
}
