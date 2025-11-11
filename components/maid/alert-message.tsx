"use client"

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"

interface AlertMessageProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm?: () => void
  showCancel?: boolean
}

export function AlertMessage({
  open,
  onOpenChange,
  title = "エラー",
  description,
  confirmLabel = "OK",
  cancelLabel = "キャンセル",
  onConfirm,
  showCancel = false,
}: AlertMessageProps) {
  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm()
    }
    onOpenChange(false)
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          {showCancel && (
            <AlertDialogCancel onClick={() => onOpenChange(false)}>
              {cancelLabel}
            </AlertDialogCancel>
          )}
          <AlertDialogAction onClick={handleConfirm}>
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export { AlertMessage as ConfirmDialog }
