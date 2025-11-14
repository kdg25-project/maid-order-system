"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface SeatNumberDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (seatId: number) => void
  onCancel?: () => void
  isSubmitting?: boolean
}

export function SeatNumberDialog({
  open,
  onOpenChange,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: SeatNumberDialogProps) {
  const [seat, setSeat] = useState("")
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
    if (isSubmitting) return
    onCancel?.()
    onOpenChange(false)
  }

  const handleConfirm = () => {
    const parsed = Number(seat)
    if (!Number.isInteger(parsed) || parsed <= 0) {
      setError("1以上の整数で入力してください。")
      return
    }
    setError(null)
    onSubmit(parsed)
  }

  return (
    <Dialog open={open} onOpenChange={(next) => (next ? onOpenChange(true) : handleClose())}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>席番号を入力</DialogTitle>
          <DialogDescription>
            QRコードから読み取ったユーザーを割り当てる席番号を入力してください。
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">席番号</label>
            <Input
              type="number"
              min={1}
              inputMode="numeric"
              value={seat}
              disabled={isSubmitting}
              onChange={(event) => setSeat(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault()
                  handleConfirm()
                }
              }}
            />
            {error && <p className="mt-1 text-sm text-rose-600">{error}</p>}
          </div>
        </div>

        <DialogFooter className="sm:justify-end">
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
            キャンセル
          </Button>
          <Button onClick={handleConfirm} disabled={isSubmitting}>
            {isSubmitting ? "登録中..." : "登録する"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default SeatNumberDialog
