import { useRef, useState } from "react";
import Image from "next/image";
import ReactCrop, { Crop, PixelCrop, centerCrop, convertToPixelCrop, makeAspectCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ImageCropDialogProps {
  open: boolean;
  image?: string;
  onCancel: () => void;
  onComplete: (croppedImage: string) => void;
}

const getCenteredSquareCrop = (mediaWidth: number, mediaHeight: number) => {
  if (!mediaWidth || !mediaHeight) return;

  const sizePercent = (Math.min(mediaWidth, mediaHeight) / mediaWidth) * 100;

  return centerCrop(
    makeAspectCrop(
      {
        unit: "%",
        width: sizePercent,
      },
      1,
      mediaWidth,
      mediaHeight
    ),
    mediaWidth,
    mediaHeight
  );
};

export function ImageCropDialog({ open, image, onCancel, onComplete }: ImageCropDialogProps) {
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const imgRef = useRef<HTMLImageElement>(null);
  const [imageDimensions, setImageDimensions] = useState({ width: 500, height: 500 });

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth, naturalHeight } = e.currentTarget;
    const { width: renderedWidth, height: renderedHeight } = e.currentTarget.getBoundingClientRect();
    setImageDimensions({ width: naturalWidth, height: naturalHeight });
    const nextCrop = getCenteredSquareCrop(renderedWidth, renderedHeight);
    if (nextCrop) {
      setCrop(nextCrop);
      setCompletedCrop(convertToPixelCrop(nextCrop, renderedWidth, renderedHeight));
    }
  };

  const getCroppedImg = async () => {
    if (!completedCrop || !imgRef.current) return;

    const imageEl = imgRef.current;
    const canvas = document.createElement("canvas");
    const scaleX = imageEl.naturalWidth / imageEl.width;
    const scaleY = imageEl.naturalHeight / imageEl.height;

    canvas.width = completedCrop.width;
    canvas.height = completedCrop.height;
    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    ctx.drawImage(
      imageEl,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      completedCrop.width,
      completedCrop.height
    );

    return new Promise<string>((resolve) => {
      canvas.toBlob((blob) => {
        if (!blob) return;
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => {
          resolve(reader.result as string);
        };
      }, "image/jpeg");
    });
  };

  const handleConfirm = async () => {
    const croppedImage = await getCroppedImg();
    if (croppedImage) {
      onComplete(croppedImage);
    }
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      onCancel();
    }
  };

  if (!image) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>画像を切り抜く</DialogTitle>
        </DialogHeader>
        <div className="flex max-h-[60vh] justify-center overflow-auto">
          <ReactCrop
            crop={crop}
            onChange={(c) => setCrop(c)}
            onComplete={(c) => setCompletedCrop(c)}
            aspect={1}
            circularCrop
          >
            <Image
              ref={imgRef}
              src={image}
              alt="切り抜き画像"
              width={imageDimensions.width}
              height={imageDimensions.height}
              style={{ maxWidth: "100%", maxHeight: "50vh" }}
              onLoad={onImageLoad}
            />
          </ReactCrop>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            キャンセル
          </Button>
          <Button onClick={handleConfirm}>確定</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
