"use client"

import { useState } from "react";
import { Drawer, DrawerContent, DrawerFooter, DrawerHeader, DrawerTitle, DrawerClose } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { QRCodeScanner } from "@/components/maid/qrcode/qrcode-scanner";
import { AlertMessage } from "@/components/maid/alert-message";

interface QRCodeScanProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onScan: (result: string) => void;
}

export function QRCodeScan({ open, onOpenChange, onScan }: QRCodeScanProps) {
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  return (
    <>
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>QRコード読み込み</DrawerTitle>
          </DrawerHeader>
          <div className="px-4 pb-4">
            <QRCodeScanner 
              onScan={onScan}
              onError={(error) => {
                if (error.name === "NotAllowedError" || error.name === "NotFoundError") {
                  setAlertMessage(`カメラの起動に失敗しました。権限を確認してください。${error}`);
                } else {
                  setAlertMessage(`QRコードの読み込み中にエラーが発生しました。${error}`);
                }
                setAlertOpen(true)
              }}
            />
          </div>
          <DrawerFooter>
            <DrawerClose asChild>
              <Button variant="outline">キャンセル</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
      
      <AlertMessage
        open={alertOpen}
        onOpenChange={setAlertOpen}
        description={alertMessage}
      />
    </>
  );
}
