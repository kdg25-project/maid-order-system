import { Drawer, DrawerContent, DrawerFooter, DrawerHeader, DrawerTitle, DrawerClose } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
}

export const HONORIFIC_OPTIONS = ["ご主人様", "お嬢様"] as const;
export const DEFAULT_HONORIFIC = HONORIFIC_OPTIONS[0];

export function UserEdit({ open, onOpenChange, form, onFormChange, onSave }: UserEditProps) {
  const selectedHonorific = form.honorific || DEFAULT_HONORIFIC;

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>ユーザー情報を編集</DrawerTitle>
        </DrawerHeader>
        <div className="space-y-4 px-4 pb-4">
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
        <DrawerFooter>
          <Button onClick={onSave}>保存</Button>
          <DrawerClose asChild>
            <Button variant="outline">キャンセル</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
