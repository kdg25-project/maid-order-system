'use client'

import { Scanner } from '@yudiel/react-qr-scanner'

interface QRCodeScannerProps {
  onScan: (result: string) => void
  onError?: (error: Error) => void
}

export function QRCodeScanner({ onScan, onError }: QRCodeScannerProps) {
  return (
    <div className="relative w-full space-y-4 max-w-[500px] mx-auto">
      <div className="w-full rounded-lg overflow-hidden">
        <Scanner
          onScan={(result) => {
            if (result && result.length > 0) {
              const text = result[0].rawValue
              onScan(text)
            }
          }}
          onError={(error) => {
            onError?.(error as Error)
          }}
          sound={false}
          styles={{
            container: {
              width: '100%',
            },
          }}
          components={{
            finder: true,
          }}
        />
      </div>
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          QRコードをカメラの枠内にかざしてください。
        </p>
      </div>
    </div>
  )
}
