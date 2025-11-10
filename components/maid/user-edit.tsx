import { Drawer, DrawerContent, DrawerFooter, DrawerHeader, DrawerTitle, DrawerClose } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Maid {
  id: string;
  name: string;
}

interface UserEditForm {
  name: string;
  seat_id: number;
  maid_id: string;
}

interface UserEditProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: UserEditForm;
  onFormChange: (form: UserEditForm) => void;
  maids: Maid[];
  onSave: () => void;
}

export function UserEdit({ open, onOpenChange, form, onFormChange, maids, onSave }: UserEditProps) {
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
              <label className="text-sm font-medium">担当メイド</label>
              <Select
                value={form.maid_id}
                onValueChange={(value) => onFormChange({ ...form, maid_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="メイドを選択" />
                </SelectTrigger>
                <SelectContent>
                  {maids.map((maid) => (
                    <SelectItem key={maid.id} value={maid.id}>
                      {maid.name}
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
