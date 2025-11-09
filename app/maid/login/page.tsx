'use client'

import { ChangeEvent, FormEvent, Suspense, useCallback, useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Loader2, QrCode, UploadCloud, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { QRCodeScan } from "@/components/maid/qrcode/qrcode-scan"
import { ImageCropDialog } from "@/components/maid/image-crop"
import { AlertMessage } from "@/components/maid/alert-message"
import { MaidCredentials, createMaid, credentialsFromSearchParams, credentialsFromUrl, dataUrlToFile, fetchMaidProfile, loadMaidCredentials, saveMaidCredentials, updateMaidProfile } from "@/lib/maid-auth"
import { Maid } from "../types"

type LoginStatus =
  | "waiting_params"
  | "checking_existing"
  | "creating_profile"
  | "needs_setup"
  | "updating_profile"
  | "redirecting"
  | "error"

type DerivedCredentialState = {
  credentials: MaidCredentials | null
  status: LoginStatus
  error: string | null
  hasQueryCredentials: boolean
}

const deriveCredentialState = (params: { get: (name: string) => string | null }): DerivedCredentialState => {
  const idParam = params.get("id")?.trim()
  const keyParam = params.get("key")?.trim()

  if (idParam && keyParam) {
    const parsed = credentialsFromSearchParams(params)
    if (parsed) {
      return {
        credentials: parsed,
        status: "checking_existing",
        error: null,
        hasQueryCredentials: true,
      }
    }
  }

  if (idParam || keyParam) {
    return {
      credentials: null,
      status: "error",
      error: "再度ログインをしてください。",
      hasQueryCredentials: true,
    }
  }

  return {
    credentials: null,
    status: "waiting_params",
    error: null,
    hasQueryCredentials: false,
  }
}

function MaidLoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const searchParamsKey = searchParams.toString()
  const derivedCredentialState = useMemo(
    () => deriveCredentialState(new URLSearchParams(searchParamsKey)),
    [searchParamsKey],
  )

  const [status, setStatus] = useState<LoginStatus>(derivedCredentialState.status)
  const [credentials, setCredentials] = useState<MaidCredentials | null>(derivedCredentialState.credentials)
  const [maidProfile, setMaidProfile] = useState<Maid | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(derivedCredentialState.error)
  const [setupFormName, setSetupFormName] = useState("")
  const [setupFormImageFile, setSetupFormImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [hasRedirected, setHasRedirected] = useState(false)
  const [bootstrapToken, setBootstrapToken] = useState(0)
  const [isQRDrawerOpen, setQRDrawerOpen] = useState(false)
  const [hasScannedQRCode, setHasScannedQRCode] = useState(false)
  const [isCropperOpen, setCropperOpen] = useState(false)
  const [cropSourceImage, setCropSourceImage] = useState<string | null>(null)
  const [selectedImageName, setSelectedImageName] = useState("profile.jpg")
  const [isMissingImageDialogOpen, setMissingImageDialogOpen] = useState(false)

  useEffect(() => {
    let cancelled = false

    const updateStateFromSource = () => {
      if (cancelled) return

      if (derivedCredentialState.credentials) {
        saveMaidCredentials(derivedCredentialState.credentials)
        setCredentials(derivedCredentialState.credentials)
        setStatus("checking_existing")
        setErrorMessage(null)
        return
      }

      if (derivedCredentialState.hasQueryCredentials) {
        setCredentials(null)
        setStatus("error")
        setErrorMessage(derivedCredentialState.error)
        return
      }

      const stored = loadMaidCredentials()
      if (stored) {
        setCredentials(stored)
        setStatus("checking_existing")
        setErrorMessage(null)
        return
      }

      setCredentials(null)
      setStatus(derivedCredentialState.status)
      setErrorMessage(derivedCredentialState.error)
    }

    if (typeof queueMicrotask === "function") {
      queueMicrotask(updateStateFromSource)
    } else {
      Promise.resolve().then(updateStateFromSource)
    }

    return () => {
      cancelled = true
    }
  }, [derivedCredentialState])

  const setupForm = useMemo(
    () => ({
      name: setupFormName || maidProfile?.name || "",
      imageFile: setupFormImageFile,
    }),
    [setupFormName, setupFormImageFile, maidProfile]
  )

  const redirectToDashboard = useCallback(() => {
    if (hasRedirected) return
    setHasRedirected(true)
    setStatus("redirecting")
    router.replace("/maid")
  }, [hasRedirected, router])

  const isProfileComplete = useCallback((profile: Maid | null) => {
    if (!profile) return false
    return Boolean(profile.name?.trim())
  }, [])

  useEffect(() => {
    if (!credentials) return
    if (status !== "checking_existing" && status !== "creating_profile") return

    let cancelled = false

    const bootstrap = async () => {
      try {
        if (status === "checking_existing") {
          const existing = await fetchMaidProfile(credentials)
          if (cancelled) return
          if (existing) {
            setMaidProfile(existing)
            if (isProfileComplete(existing)) {
              redirectToDashboard()
              return
            }
            setStatus("needs_setup")
            return
          }

          setStatus("creating_profile")
          return
        }

        if (status === "creating_profile") {
          const created = await createMaid(credentials)
          if (cancelled) return
          setMaidProfile(created)
          if (isProfileComplete(created)) {
            redirectToDashboard()
          } else {
            setStatus("needs_setup")
          }
        }
      } catch (error) {
        if (cancelled) return
        const message =
          error instanceof Error
            ? error.message
            : "情報の取得中に問題が発生しました。しばらくしてから再度お試しください。"
        setErrorMessage(message)
        setStatus("error")
      }
    }

    bootstrap()
    return () => {
      cancelled = true
    }
  }, [credentials, bootstrapToken, isProfileComplete, redirectToDashboard, status])

  useEffect(() => {
    return () => {
      if (imagePreview?.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview)
      }
    }
  }, [imagePreview])

  const submitInitialProfile = useCallback(
    async (allowWithoutImage = false) => {
      if (!credentials) return

      const resolvedName = setupForm.name.trim()
      if (!resolvedName) {
        setErrorMessage("名前を入力してください。")
        return
      }

      if (!setupForm.imageFile && !allowWithoutImage) {
        setErrorMessage(null)
        setMissingImageDialogOpen(true)
        return
      }

      try {
        setErrorMessage(null)
        setStatus("updating_profile")
        const updated = await updateMaidProfile(credentials, {
          name: resolvedName,
          image: setupForm.imageFile ?? null,
        })
        setMaidProfile(updated)
        redirectToDashboard()
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "プロフィールの登録に失敗しました。ネットワーク環境を確認してください。"
        setErrorMessage(message)
        setStatus("needs_setup")
      }
    },
    [credentials, redirectToDashboard, setupForm],
  )

  const handleInitialProfileSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      void submitInitialProfile()
    },
    [submitInitialProfile],
  )

  const handleConfirmSkipImage = useCallback(() => {
    setMissingImageDialogOpen(false)
    void submitInitialProfile(true)
  }, [submitInitialProfile])

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    setSelectedImageName(file.name || "profile.jpg")
    const reader = new FileReader()
    reader.onloadend = () => {
      setCropSourceImage(reader.result as string)
      setCropperOpen(true)
    }
    reader.readAsDataURL(file)
    event.target.value = ""
  }

  const handleCropComplete = (croppedImage: string) => {
    const croppedFile = dataUrlToFile(croppedImage, selectedImageName) ?? null
    if (!croppedFile) {
      setErrorMessage("画像の切り抜きに失敗しました。再度お試しください。")
      setCropperOpen(false)
      setCropSourceImage(null)
      return
    }
    setSetupFormImageFile(croppedFile)
    setImagePreview(croppedImage)
    setCropperOpen(false)
    setCropSourceImage(null)
  }

  const handleCropCancel = () => {
    setCropperOpen(false)
    setCropSourceImage(null)
  }

  const handleQRScan = (result: string) => {
    setQRDrawerOpen(false)
    const parsed = credentialsFromUrl(result)
    if (!parsed) {
      setStatus("error")
      setErrorMessage("再度スキャンをしてください。")
      return
    }

    setHasScannedQRCode(true)
    saveMaidCredentials(parsed)
    setCredentials(parsed)
    setMaidProfile(null)
    setSetupFormName("")
    setSetupFormImageFile(null)
    setImagePreview(null)
    setErrorMessage(null)
    setStatus("checking_existing")
    setBootstrapToken((prev) => prev + 1)
  }

  const statusLabel = useMemo(() => {
    switch (status) {
      case "waiting_params":
        return ""
      case "checking_existing":
        return "情報を確認しています..."
      case "creating_profile":
        return "アカウントを作成しています..."
      case "needs_setup":
        return ""
      case "updating_profile":
        return "プロフィールを登録しています..."
      case "redirecting":
        return "ダッシュボードへ移動しています..."
      case "error":
        return ""
      default:
        return ""
    }
  }, [status])

  const previewImageSrc = imagePreview ?? maidProfile?.image_url ?? null
  const isSetupInProgress = status === "updating_profile"
  const shouldShowQRButton =
    !hasScannedQRCode && (status === "error" || status === "waiting_params")
  const shouldShowStatusPanel = status !== "error" && Boolean(statusLabel)
  const shouldShowErrorPanel = Boolean(errorMessage)

  return (
    <>
      <main className="flex min-h-screen items-center justify-center bg-linear-to-b from-rose-50 via-white to-white px-4 py-10">
        <Card className="w-full max-w-md border-rose-100/80 bg-white/90 text-center shadow-lg backdrop-blur">
          <CardHeader className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-wide text-rose-400">ダッシュボード</p>
            <CardTitle className="text-2xl text-gray-900">QRログイン</CardTitle>
            <CardDescription className="text-gray-500">
              {status === "needs_setup"
                ? "初回登録が必要です。プロフィールを入力してください。"
                : "端末のQRコードリーダーからスキャンすると自動でログインできます。"}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-5 text-left">
            {shouldShowQRButton && (
              <div className="space-y-2">
                <Button variant="outline" className="w-full gap-2" onClick={() => setQRDrawerOpen(true)}>
                  <QrCode className="h-4 w-4" />
                  QRコードを読み取る
                </Button>
              </div>
            )}

            {shouldShowErrorPanel && (
              <Alert variant="destructive" className="rounded-md border border-red-200 bg-red-50/70 px-4 py-3">
                <AlertTitle className="text-xs font-semibold tracking-wide text-red-500">エラー</AlertTitle>
                <AlertDescription className="text-sm text-red-700">{errorMessage}</AlertDescription>
              </Alert>
            )}

            {shouldShowStatusPanel && (
              <Alert className="rounded-md border border-dashed border-blue-100/80 bg-blue-50/40 px-4 py-3">
                <AlertTitle className="text-xs font-semibold tracking-wide text-blue-400">{statusLabel}</AlertTitle>
              </Alert>
            )}

            {status !== "needs_setup" && status !== "error" && status !== "redirecting" && status !== "waiting_params" && (
              <div className="flex justify-center py-4">
                <Loader2 className="h-8 w-8 animate-spin text-rose-400" />
              </div>
            )}

            {status === "needs_setup" && (
              <form className="space-y-5" onSubmit={handleInitialProfileSubmit}>
                <div className="flex flex-col items-center gap-3">
                  <div className="relative">
                    <Avatar className="h-24 w-24 border-2 border-rose-200">
                      {previewImageSrc && (
                        <AvatarImage src={previewImageSrc} alt="プロフィール画像プレビュー" className="object-cover" />
                      )}
                      <AvatarFallback className="bg-rose-50 text-rose-300">
                        <User className="h-10 w-10" />
                      </AvatarFallback>
                    </Avatar>
                    <Button
                      asChild
                      variant="default"
                      size="icon-sm"
                      className="absolute bottom-0 right-0 rounded-full bg-rose-500 text-white shadow-md hover:bg-rose-600"
                    >
                      <label className="cursor-pointer">
                        <UploadCloud className="h-4 w-4" />
                        <span className="sr-only">プロフィール画像をアップロード</span>
                        <input type="file" accept="image/*" className="sr-only" onChange={handleImageChange} />
                      </label>
                    </Button>
                  </div>
                  <p className="text-sm text-gray-500 text-center">プロフィール画像を選択してください。</p>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600">名前</p>
                  <Input
                    value={setupForm.name}
                    onChange={(event) => {
                      if (errorMessage) setErrorMessage(null)
                      setSetupFormName(event.target.value)
                    }}
                    placeholder="例: 田中太郎"
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isSetupInProgress}>
                  {isSetupInProgress && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  登録してダッシュボードへ
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </main>
      <QRCodeScan open={isQRDrawerOpen} onOpenChange={setQRDrawerOpen} onScan={handleQRScan} />
      <ImageCropDialog
        open={isCropperOpen}
        image={cropSourceImage ?? undefined}
        onCancel={handleCropCancel}
        onComplete={handleCropComplete}
      />
      <AlertMessage
        open={isMissingImageDialogOpen}
        onOpenChange={setMissingImageDialogOpen}
        title="プロフィール画像が未設定です"
        description="プロフィール画像を設定せずに登録しますか？後から変更できます。"
        confirmLabel="画像なしで登録"
        cancelLabel="戻る"
        showCancel
        onConfirm={handleConfirmSkipImage}
      />
    </>
  )
}

export default function MaidLoginPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-linear-to-b from-rose-50 via-white to-white px-4 py-10">
          <Card className="w-full max-w-md border-rose-100/80 bg-white/90 text-center shadow-lg backdrop-blur">
            <CardContent className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-rose-400" />
            </CardContent>
          </Card>
        </main>
      }
    >
      <MaidLoginContent />
    </Suspense>
  )
}
