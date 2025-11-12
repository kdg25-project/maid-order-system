"use client"

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  instaxId: number | null
  onClose?: () => void
}

export function InstaxSaved({ open, onOpenChange, instaxId, onClose }: Props) {
  const handleClose = () => {
    onOpenChange(false)
    onClose?.()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogTitle className="sr-only">チェキ保存完了</DialogTitle>
        <div className="space-y-6 text-center py-6">
          <h2 className="text-xl font-semibold">保存が完了しました</h2>
          <div className="mx-auto flex h-36 w-36 items-center justify-center rounded-full bg-rose-50 text-6xl font-bold text-rose-600">
            {instaxId ?? "--"}
          </div>
          <p className="text-sm text-muted-foreground">上の番号がチェキIDです。控えておくか、履歴からご確認ください。</p>
          <div className="flex justify-center">
            <Button onClick={handleClose}>閉じる</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default InstaxSaved
