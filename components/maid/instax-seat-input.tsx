"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import Image from "next/image"

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  dataUrl: string | null
  onConfirm: (seatId: number) => void
  onCancel?: () => void
}

export function InstaxSeatInput({ open, onOpenChange, dataUrl, onConfirm, onCancel }: Props) {
  const [seat, setSeat] = useState<string>("")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) {
      queueMicrotask(() => {
        setSeat("")
        setError(null)
      })
    }
  }, [open])

  const handleClose = () => {
    onOpenChange(false)
    onCancel?.()
  }

  const handleConfirm = () => {
    const n = Number(seat)
    if (!Number.isFinite(n) || n <= 0 || !Number.isInteger(n)) {
      setError("1以上の整数で入力してください。")
      return
    }
    setError(null)
    onConfirm(n)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogTitle className="sr-only">席番号入力</DialogTitle>
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">席番号を入力してください</h3>

          {dataUrl && (
            <div className="mx-auto w-full max-w-sm">
              <Image src={dataUrl} alt="preview" width={600} height={600} unoptimized className="rounded-md object-contain" />
            </div>
          )}

          <div>
            <label className="mb-1 block text-sm font-medium">席番号</label>
            <input
              type="number"
              inputMode="numeric"
              min={1}
              value={seat}
              onChange={(e) => setSeat(e.target.value)}
              className="w-full rounded-md border px-3 py-2"
              placeholder="例: 12"
            />
            {error && <p className="mt-1 text-sm text-rose-600">{error}</p>}
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleClose}>キャンセル</Button>
            <Button onClick={handleConfirm}>確定して次へ</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default InstaxSeatInput
