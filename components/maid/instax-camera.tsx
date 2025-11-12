"use client"

import { useEffect, useRef, useState } from "react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { X as XIcon, Camera as CameraIcon } from "lucide-react"
import Image from "next/image"

interface InstaxCameraProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onError?: (error: Error) => void
  onCapture?: (dataUrl: string) => void
  onConfirm?: (dataUrl: string) => void
}

export function InstaxCamera({ open, onOpenChange, onError, onCapture, onConfirm }: InstaxCameraProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const overlayRef = useRef<HTMLDivElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [loading, setLoading] = useState(false)
  const [permissionError, setPermissionError] = useState<string | null>(null)
  const [capturedDataUrl, setCapturedDataUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return

    let mounted = true
    setLoading(true)
    setPermissionError(null)

    const start = async () => {
      try {
        if (!navigator?.mediaDevices?.getUserMedia) {
          throw new Error("このブラウザはカメラをサポートしていません。")
        }

        const constraints: MediaStreamConstraints = {
          video: {
            facingMode: "environment",
          },
          audio: false,
        }

        const stream = await navigator.mediaDevices.getUserMedia(constraints)
        if (!mounted) {
          stream.getTracks().forEach((t) => t.stop())
          return
        }
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play().catch(() => {})
        }
      } catch (err) {
        const e = err as Error
        setPermissionError(e.message)
        onError?.(e)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    void start()

    return () => {
      mounted = false
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop())
        streamRef.current = null
      }
      setCapturedDataUrl(null)
    }
  }, [open, onError])

  const handleCapture = async () => {
    const video = videoRef.current
    const overlay = overlayRef.current
    if (!video || !overlay) return
    try {
      const videoRect = video.getBoundingClientRect()
      const overlayRect = overlay.getBoundingClientRect()

      const vw = video.videoWidth
      const vh = video.videoHeight
      if (!vw || !vh) throw new Error("カメラの解像度が取得できませんでした。")

      const cw = videoRect.width
      const ch = videoRect.height
      const scale = Math.max(cw / vw, ch / vh)
      const renderedW = vw * scale
      const renderedH = vh * scale
      const offsetX = (renderedW - cw) / 2
      const offsetY = (renderedH - ch) / 2

      const relLeft = overlayRect.left - videoRect.left
      const relTop = overlayRect.top - videoRect.top

      const srcX = (relLeft + offsetX) / scale
      const srcY = (relTop + offsetY) / scale
      const srcW = overlayRect.width / scale
      const srcH = overlayRect.height / scale

      const canvas = document.createElement("canvas")
      canvas.width = Math.round(srcW)
      canvas.height = Math.round(srcH)
      const ctx = canvas.getContext("2d")
      if (!ctx) throw new Error("CanvasContext の取得に失敗しました。")

      ctx.drawImage(video, srcX, srcY, srcW, srcH, 0, 0, canvas.width, canvas.height)

      const dataUrl = canvas.toDataURL("image/jpeg", 0.92)
      setCapturedDataUrl(dataUrl)
      onCapture?.(dataUrl)
    } catch (err) {
      const e = err as Error
      onError?.(e)
    }
  }

  const handleConfirm = () => {
    if (!capturedDataUrl) return
    try {
      onConfirm?.(capturedDataUrl)
    } finally {
      onOpenChange(false)
    }
  }

  const handleRetake = () => {
    setCapturedDataUrl(null)
    requestAnimationFrame(() => {
      const video = videoRef.current
      if (video && streamRef.current) {
        try {
          video.srcObject = streamRef.current
          void video.play().catch(() => {})
        } catch {
          // ignore
        }
      }
    })
  }

  const handleClose = () => {
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="top-0 left-0 translate-x-0 translate-y-0 w-full h-full max-w-none max-h-none rounded-none p-0"
        showCloseButton={false}
      >
        <DialogTitle className="sr-only">チェキ撮影</DialogTitle>
        <div className="relative flex h-full w-full items-center justify-center bg-black">
          {/* video preview */}
          {!capturedDataUrl && (
            <video
              ref={videoRef}
              className="object-cover w-full h-full"
              playsInline
              muted
              controls={false}
            />
          )}

          {/* overlay box to show framing with cheki ratio 1:1.391 */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div
              ref={overlayRef}
              className="border border-white/80 bg-transparent"
              style={{
                width: "84%",
                height: `calc(84% / 1.391)`,
                maxHeight: "92%",
              }}
            />
          </div>

          {/* top bar with close */}
          <div className="absolute top-4 left-4 z-50">
            <button
              onClick={handleClose}
              className="rounded-full bg-black/40 p-2 text-white"
            >
              <XIcon className="size-4" />
            </button>
          </div>

          {/* capture / controls or preview actions */}
          <div className="absolute bottom-8 left-0 right-0 z-50 flex items-center justify-center gap-4">
            {!capturedDataUrl ? (
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleCapture}
                  className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-white bg-white/20 text-white"
                  aria-label="撮影"
                >
                  <CameraIcon className="size-7" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Button variant="outline" onClick={handleRetake}>再撮影</Button>
                <Button onClick={handleConfirm}>確定</Button>
              </div>
            )}
          </div>

          {capturedDataUrl && (
            <div className="absolute inset-0 z-40 flex items-center justify-center p-4">
                <Image
                  src={capturedDataUrl!}
                  alt="captured"
                  width={800}
                  height={800}
                  unoptimized
                  className="block max-h-[70vh] max-w-full object-contain"
                  style={{ objectFit: "contain" }}
                />
              </div>
          )}

          {loading && (
            <div className="absolute inset-0 z-40 flex items-center justify-center">
              <div className="rounded-lg bg-black/60 px-4 py-2 text-white">カメラを準備中...</div>
            </div>
          )}

          {permissionError && (
            <div className="absolute inset-0 z-40 flex items-center justify-center">
              <div className="rounded-lg bg-black/60 px-4 py-2 text-white">{permissionError}</div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
