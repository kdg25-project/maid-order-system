import { useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, Pencil } from "lucide-react";
import Image from "next/image";
import { ImageCropDialog } from "@/components/maid/image-crop";

interface ProfileEditProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: {
    name: string;
    image: string;
  };
  onFormChange: (form: { name: string; image: string }) => void;
  onSave: (form: { name: string; image: string }) => void;
}

export function ProfileEdit({ open, onOpenChange, form, onFormChange, onSave }: ProfileEditProps) {
  const [srcImage, setSrcImage] = useState<string>("");
  const [showCropper, setShowCropper] = useState(false);
  const [tempForm, setTempForm] = useState(form);
  const [prevOpen, setPrevOpen] = useState(open);

  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setTempForm(form);
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSrcImage(reader.result as string);
        setShowCropper(true);
      };
      reader.readAsDataURL(file);
    }
    e.target.value = "";
  }

  const handleCropComplete = (croppedImage: string) => {
    setTempForm((prev) => ({ ...prev, image: croppedImage }));
    setShowCropper(false);
    setSrcImage("");
  };

  const handleCropCancel = () => {
    setShowCropper(false);
    setSrcImage("");
  };

  const handleSave = () => {
    onFormChange(tempForm);
    onSave(tempForm);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>プロフィール編集</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="relative">
                {tempForm.image ? (
                  <Image
                    src={tempForm.image}
                    alt="プロフィール画像"
                    width={80}
                    height={80}
                    className="h-20 w-20 rounded-full object-cover border-2 border-rose-200"
                  />
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-rose-200 bg-rose-50 text-rose-300">
                    <User className="h-8 w-8" />
                  </div>
                )}
                <label className="absolute bottom-0 right-0 rounded-full bg-rose-500 p-1.5 text-white shadow-md hover:bg-rose-600 cursor-pointer">
                  <Pencil className="size-3" />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </label>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">名前</label>
              <Input
                placeholder="名前を入力"
                value={tempForm.name}
                onChange={(e) => setTempForm({ ...tempForm, name: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter className="flex flex-row justify-end gap-2">
            <Button onClick={handleSave}>保存</Button>
            <DialogClose asChild>
              <Button variant="outline">キャンセル</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ImageCropDialog
        open={showCropper}
        image={srcImage}
        onCancel={handleCropCancel}
        onComplete={handleCropComplete}
      />
    </>
  );
}
