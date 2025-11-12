"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import Image from "next/image"
import { User } from "@/app/types"

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: User | null
  dataUrl: string | null
  onConfirm: () => void
  onCancel?: () => void
}

export function InstaxConfirmUser({ open, onOpenChange, user, dataUrl, onConfirm, onCancel }: Props) {
  const handleClose = () => {
    onOpenChange(false)
    onCancel?.()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogTitle className="sr-only">ユーザー確認</DialogTitle>
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">ユーザー確認</h3>

          {dataUrl && (
            <div className="mx-auto w-full max-w-sm">
              <Image src={dataUrl} alt="preview" width={600} height={600} unoptimized className="rounded-md object-contain" />
            </div>
          )}

          <div>
            <p className="text-sm text-muted-foreground">以下のユーザーに紐づけます。よろしいですか？</p>
            <div className="mt-3 space-y-1">
              <p className="text-base font-medium">名前: {user?.name ?? "- 未登録 -"}</p>
              <p className="text-sm text-muted-foreground">席番号: {user?.seat_id ?? "-"}</p>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleClose}>キャンセル</Button>
            <Button onClick={() => {
              onConfirm()
              onOpenChange(false)
            }}>ユーザーに紐づけて保存</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default InstaxConfirmUser
