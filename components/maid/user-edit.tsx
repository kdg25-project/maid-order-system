import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertMessage } from "@/components/maid/alert-message";
import { useState } from "react";

interface UserEditForm {
  name: string;
  seat_id: number;
  honorific: string;
}

interface UserEditProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: UserEditForm;
  onFormChange: (form: UserEditForm) => void;
  onSave: () => void;
  onLeave?: () => void;
  isLeaving?: boolean;
}

export const HONORIFIC_OPTIONS = ["ご主人様", "お嬢様"] as const;
export const DEFAULT_HONORIFIC = HONORIFIC_OPTIONS[0];

export function UserEdit({ open, onOpenChange, form, onFormChange, onSave, onLeave, isLeaving }: UserEditProps) {
  const selectedHonorific = form.honorific || DEFAULT_HONORIFIC;
  const [isLeaveConfirmOpen, setLeaveConfirmOpen] = useState(false);

  const handleLeaveClick = () => {
    setLeaveConfirmOpen(true);
  };

  const handleLeaveConfirm = () => {
    setLeaveConfirmOpen(false);
    onLeave?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>ユーザー情報を編集</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">名前</label>
            <Input
              placeholder="例: 田中太郎"
              value={form.name}
              onChange={(e) => onFormChange({ ...form, name: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">席番号</label>
              <Input
                type="number"
                min={1}
                value={form.seat_id}
                onChange={(e) => onFormChange({ ...form, seat_id: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">敬称</label>
              <Select
                value={selectedHonorific}
                onValueChange={(value) => onFormChange({ ...form, honorific: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="敬称を選択" />
                </SelectTrigger>
                <SelectContent>
                  {HONORIFIC_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <DialogFooter className="flex flex-row justify-end gap-2">
          {onLeave && (
            <Button
              onClick={handleLeaveClick}
              variant="destructive"
              disabled={isLeaving}
            >
              {isLeaving ? "退店処理中..." : "退店"}
            </Button>
          )}
          <Button onClick={onSave}>保存</Button>
          <DialogClose asChild>
            <Button variant="outline">キャンセル</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>

      <AlertMessage
        open={isLeaveConfirmOpen}
        onOpenChange={setLeaveConfirmOpen}
        title="退店確認"
        description="このユーザーを退店状態にしますか？"
        confirmLabel="退店"
        cancelLabel="キャンセル"
        showCancel={true}
        onConfirm={handleLeaveConfirm}
      />
    </Dialog>
  );
}
