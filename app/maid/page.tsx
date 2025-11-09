'use client'

import { useMemo, useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { LogOut, ScanQrCode, UserPen, User } from "lucide-react";
import { UserApiResponse, Maid, MaidsApiResponse, Menu, MenusApiResponse } from './types';
import { UserEdit } from '@/components/maid/user-edit';
import { QRCodeScan } from '@/components/maid/qrcode/qrcode-scan';
import { ProfileEdit } from '@/components/maid/profile-edit';
import { AlertMessage } from '@/components/maid/alert-message';
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { clearMaidCredentials, credentialsFromUrl, dataUrlToFile, fetchMaidProfile, loadMaidCredentials, MaidCredentials, saveMaidCredentials, updateMaidProfile } from '@/lib/maid-auth';
import { cn } from '@/lib/utils'

const orderResponse = {
  success: true,
  message: "OK",
  data: {
    orders: [
      {
        id: 1,
        user_id: "101",
        menu_id: 1,
        state: "pending" as const,
        created_at: "2025-11-06T10:00:00.000Z",
        updated_at: "2025-11-06T10:30:00.000Z",
      },
      {
        id: 2,
        user_id: "102",
        menu_id: 2,
        state: "preparing" as const,
        created_at: "2025-11-06T10:05:00.000Z",
        updated_at: "2025-11-06T10:28:00.000Z",
      },
      {
        id: 3,
        user_id: "103",
        menu_id: 3,
        state: "served" as const,
        created_at: "2025-11-06T10:12:00.000Z",
        updated_at: "2025-11-06T10:29:30.000Z",
      },
    ],
  },
};

const activeUsers: UserApiResponse[] = [
  {
    success: true,
    message: 'OK',
    data: {
      id: '101',
      name: 'お嬢',
      status: null,
      maid_id: '1',
      instax_maid_id: null,
      seat_id: 1,
      is_valid: true,
      created_at: '2025-01-15T10:00:00.000Z',
      updated_at: '2025-01-16T10:00:00.000Z',
    },
  },
  {
    success: true,
    message: 'OK',
    data: {
      id: '102',
      name: 'ご主人',
      status: null,
      maid_id: '1',
      instax_maid_id: null,
      seat_id: 2,
      is_valid: true,
      created_at: '2025-01-16T09:30:00.000Z',
      updated_at: '2025-01-16T10:05:00.000Z',
    },
  },
  {
    success: true,
    message: 'OK',
    data: {
      id: '103',
      name: null,
      status: null,
      maid_id: '1',
      instax_maid_id: null,
      seat_id: 3,
      is_valid: true,
      created_at: '2025-01-16T09:50:00.000Z',
      updated_at: '2025-01-16T10:10:00.000Z',
    },
  },
];

const quickActions = [
  {
    id: "qrcode",
    label: "QRコード読み込み",
    description: "QRコードをスキャン",
    accent: "bg-indigo-50 text-indigo-500 border-indigo-100",
    icon: ScanQrCode,
  },
  {
    id: "edit_profile",
    label: "プロフィール編集",
    description: "自分のプロフィールを編集",
    accent: "bg-emerald-50 text-emerald-600 border-emerald-100",
    icon: UserPen,
  },
  {
    id: "logout",
    label: "ログアウト",
    description: "システムからログアウト",
    accent: "bg-rose-50 text-rose-500 border-rose-100",
    icon: LogOut,
  },
] as const;

const servedStats = {
  total: 14,
};

const orderStateStyles = {
  pending: {
    label: '待機中',
    className: 'border-black-100 bg-black-50 text-black-600',
  },
  preparing: {
    label: '準備中',
    className: 'border-orange-100 bg-orange-50 text-orange-600',
  },
  served: {
    label: '提供済み',
    className: 'border-emerald-100 bg-emerald-50 text-emerald-600',
  },
} as const

const getElapsedMinutes = (isoString: string) => {
  const timestamp = new Date(isoString).getTime()
  if (Number.isNaN(timestamp)) {
    return 0
  }
  const diffMs = Date.now() - timestamp
  return Math.max(0, Math.floor(diffMs / 60000))
}

export default function Home() {
  const router = useRouter()
  const [Users, setUsers] = useState<UserApiResponse[]>(activeUsers)
  const [maids, setMaids] = useState<Maid[]>([])
  const [menus, setMenus] = useState<Menu[]>([])
  const [isDrawerOpen, setDrawerOpen] = useState(false)
  const [isQRDrawerOpen, setQRDrawerOpen] = useState(false)
  const [isProfileDrawerOpen, setProfileDrawerOpen] = useState(false)
  const [isLogoutConfirmOpen, setLogoutConfirmOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertTitle, setAlertTitle] = useState("エラー");
  const [credentials, setCredentials] = useState<MaidCredentials | null>(null);
  const [maidProfile, setMaidProfile] = useState<Maid | null>(null);
  const [isProfileLoading, setProfileLoading] = useState(true);
  const [isProfileSaving, setProfileSaving] = useState(false);
  const [form, setForm] = useState<{ name: string; seat_id: number; maid_id: string }>({
    name: "",
    seat_id: 1,
    maid_id: "1",
  })
  const [profileForm, setProfileForm] = useState<{ name: string; image: string }>({
    name: "",
    image: "",
  })

  const showAlert = useCallback((title: string, message: string) => {
    setAlertTitle(title)
    setAlertMessage(message)
    setAlertOpen(true)
  }, [])

  useEffect(() => {
    const stored = loadMaidCredentials()
    if (!stored) {
      router.replace('/maid/login')
      return
    }
    setCredentials(stored)
  }, [router])

  useEffect(() => {
    if (!credentials) return
    let cancelled = false
    const loadProfile = async () => {
      setProfileLoading(true)
      try {
        const profile = await fetchMaidProfile(credentials)
        if (cancelled) return
        if (!profile) {
          showAlert('エラー', '情報が見つかりません。再度ログインをしてください。')
          router.replace(`/maid/login?id=${encodeURIComponent(credentials.id)}&key=${encodeURIComponent(credentials.apiKey)}`)
          return
        }
        setMaidProfile(profile)
      } catch (error) {
        if (cancelled) return
        const message = error instanceof Error ? error.message : '情報の取得に失敗しました。'
        showAlert('エラー', message)
      } finally {
        if (!cancelled) {
          setProfileLoading(false)
        }
      }
    }
    loadProfile()
    return () => {
      cancelled = true
    }
  }, [credentials, router, showAlert])

  useEffect(() => {
    if (!maidProfile) return
    setProfileForm({
      name: maidProfile.name ?? "",
      image: maidProfile.image_url ?? "",
    })
  }, [maidProfile])

  useEffect(() => {
    const fetchMenus = async () => {
      try {
        const response = await fetch('https://api.kdgn.tech/api/menus')
        const data: MenusApiResponse = await response.json()
        setMenus(data.data.menus)
      } catch (error) {
        showAlert('エラー', `メニューの取得中にエラーが発生しました。${error}`)
      }
    }
    fetchMenus()
  }, [showAlert])

  useEffect(() => {
    const fetchMaids = async () => {
      try {
        const response = await fetch('https://api.kdgn.tech/api/maids')
        const data: MaidsApiResponse = await response.json()
        if (data.success && data.data) {
          setMaids(data.data)
        }
      } catch (error) {
        showAlert('エラー', `メイドリストの取得中にエラーが発生しました。${error}`)
      }
    }
    fetchMaids()
  }, [showAlert])

  const menuLookup = useMemo(() => {
    return menus.reduce<Record<number, Menu>>((acc, menu) => {
      acc[menu.id] = menu
      return acc
    }, {})
  }, [menus])

  const userLookupLocal = useMemo(() => {
    return Users.reduce<Record<string, (typeof Users)[number]["data"]>>((acc, g) => {
      acc[g.data.id] = g.data
      return acc
    }, {})
  }, [Users])

  const openEditor = (id: string) => {
    const g = Users.find((x) => x.data.id === id)
    if (!g) return
    setEditingId(id)
    setForm({
      name: g.data.name ?? "",
      seat_id: g.data.seat_id ?? 1,
      maid_id: g.data.maid_id ?? "1",
    })
    setDrawerOpen(true)
  }

  const handleSave = () => {
    if (editingId == null) return
    setUsers(prev => prev.map(x => {
      if (x.data.id !== editingId) return x
      return {
        ...x,
        data: {
          ...x.data,
          name: form.name.trim() === '' ? null : form.name.trim(),
          seat_id: form.seat_id,
          maid_id: form.maid_id,
          updated_at: new Date().toISOString(),
        }
      }
    }))
    setDrawerOpen(false)
    setEditingId(null)
  }

  const handleQRScan = (result: string) => {
    setQRDrawerOpen(false)
    const parsed = credentialsFromUrl(result)
    if (!parsed) {
      showAlert('QRコードエラー', '再度スキャンしてください。')
      return
    }
    saveMaidCredentials(parsed)
    setCredentials(parsed)
    router.push(`/maid/login?id=${encodeURIComponent(parsed.id)}&key=${encodeURIComponent(parsed.apiKey)}`)
  }

  const handleProfileSave = async (nextForm: { name: string; image: string }) => {
    if (!credentials) {
      showAlert('エラー', 'ログイン情報が見つかりません。再度ログインをしてください。')
      router.replace('/maid/login')
      return
    }
    if (isProfileSaving) return

    const trimmedName = nextForm.name.trim()
    if (!trimmedName) {
      showAlert('エラー', '名前を入力してください。')
      return
    }

    setProfileDrawerOpen(false)
    setProfileForm(nextForm)

    const imageFile = nextForm.image.startsWith('data:')
      ? dataUrlToFile(nextForm.image, 'profile.jpg')
      : null

    try {
      setProfileSaving(true)
      const updated = await updateMaidProfile(credentials, {
        name: trimmedName,
        image: imageFile,
      })
      setMaidProfile(updated)
      setProfileForm({
        name: updated.name ?? "",
        image: updated.image_url ?? "",
      })
      showAlert('完了', 'プロフィールを更新しました。')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'プロフィールの更新に失敗しました。'
      showAlert('エラー', message)
      if (maidProfile) {
        setProfileForm({
          name: maidProfile.name ?? "",
          image: maidProfile.image_url ?? "",
        })
      }
    } finally {
      setProfileSaving(false)
    }
  }

  const handleQuickAction = (actionId: string) => {
    if (actionId === 'qrcode') {
      setQRDrawerOpen(true)
    } else if (actionId === 'edit_profile') {
      setProfileDrawerOpen(true)
    } else if (actionId === 'logout') {
      setLogoutConfirmOpen(true)
    }
  }

  const handleLogoutConfirm = () => {
    clearMaidCredentials()
    setCredentials(null)
    setMaidProfile(null)
    setProfileForm({
      name: "",
      image: "",
    })
    router.replace('/maid/login')
  }

  const profileDisplayName = profileForm.name || (isProfileLoading ? "" : "メイド")
  const profileImageSrc: string | null = profileForm.image || null

  return (
    <main className="min-h-screen bg-linear-to-b from-rose-50 via-white to-white">
      <div className="mx-auto flex min-h-screen max-w-md flex-col gap-6 px-4 pb-8 pt-4">
        <section
          className="flex items-center gap-4 rounded-2xl border border-rose-100 bg-white/90 px-5 py-5 shadow-sm backdrop-blur"
          aria-busy={isProfileLoading}
        >
          <div className="h-16 w-16 shrink-0 rounded-full">
            {isProfileLoading ? (
              <div className="h-full w-full animate-pulse rounded-full bg-rose-100" aria-hidden="true" />
            ) : profileImageSrc ? (
              <Image
                src={profileImageSrc}
                alt="プロフィール画像"
                width={64}
                height={64}
                className="h-16 w-16 rounded-full object-cover"
                priority
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center rounded-full border-2 border-rose-200 bg-rose-50 text-rose-300">
                <User className="h-8 w-8" />
              </div>
            )}
          </div>
          <div className="space-y-1">
            {isProfileLoading ? (
              <>
                <div className="h-4 w-24 animate-pulse rounded-full bg-rose-100" aria-hidden="true" />
                <div className="h-6 w-36 animate-pulse rounded-full bg-rose-100" aria-hidden="true" />
              </>
            ) : (
              <>
                <p className="text-sm font-bold uppercase text-rose-400">
                  ダッシュボード
                </p>
                <p className="text-xl font-semibold tracking-tight">
                  ようこそ！{profileDisplayName}さん！
                </p>
              </>
            )}
          </div>
        </section>

        <section className="grid grid-cols-2 gap-3">
          {quickActions.map((action) => {
            const Icon = action.icon
            return (
              <Button
                key={action.id}
                type="button"
                onClick={() => handleQuickAction(action.id)}
                variant="outline"
                className={cn(
                  "h-auto w-full flex-col items-start justify-start gap-1.5 rounded-2xl border px-4 py-3 text-left text-sm font-medium shadow-sm transition hover:scale-[1.01] active:scale-[0.98]",
                  action.accent,
                )}
              >
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-white/70 p-1">
                    <Icon className="size-4" />
                  </span>
                  {action.label}
                </div>
                <span className="text-xs text-black/60">
                  {action.description}
                </span>
              </Button>
            )
          })}
        </section>

        <Card className="border-none bg-linear-to-br from-rose-600 to-rose-300 text-white shadow-lg">
          <CardHeader className="text-white/90">
            <CardTitle className="text-lg font-semibold">
              接客した組数
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-5xl font-semibold">{servedStats.total}組</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-3">
            <div>
              <CardTitle className="text-lg font-semibold">
                提供待ちリスト
              </CardTitle>
              <CardDescription>
                現在の提供待ち一覧
              </CardDescription>
            </div>
            <Badge variant="outline">
              残り {orderResponse.data.orders.length}件
            </Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            {orderResponse.data.orders.map((order) => {
              const menu = menuLookup[order.menu_id]
              const user = userLookupLocal[order.user_id]
              const elapsedMinutes = getElapsedMinutes(order.created_at)
              const seatLabel = user
                ? `席番号: ${user.seat_id ?? '-'}番`
                : '席情報なし'
              const stateStyle = orderStateStyles[order.state] ?? orderStateStyles.pending

              return (
                <div
                  key={order.id}
                  className="flex flex-col gap-3 rounded-2xl border border-dashed px-4 py-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <p className="text-base font-semibold leading-tight">
                        {menu?.name}
                      </p>
                    </div>
                    <Badge variant="secondary" className={stateStyle.className}>
                      {stateStyle.label}
                    </Badge>
                  </div>
                  <p className="text-xs font-normal text-muted-foreground">
                    {seatLabel} ・ 約{elapsedMinutes}分 経過
                  </p>
                </div>
              )
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">
                接客中のユーザー
              </CardTitle>
              <CardDescription>
                現在接客中のユーザー一覧
              </CardDescription>
            </div>
            <Badge variant="outline">
              現在 {Users.length}組
            </Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            {Users.map((user) => {
              const displayName = user.data.name ? `${user.data.name}様` : '名前未登録'
              const elapsedMinutes = getElapsedMinutes(user.data.created_at)

              return (
                <div
                  key={user.data.id}
                  className="rounded-2xl border px-4 py-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-base font-semibold">
                      {displayName}
                    </p>
                    <Button size="sm" variant="outline" onClick={() => openEditor(user.data.id)}>
                      編集
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    席番号: {user.data.seat_id ?? '-'}番 ・ 約{elapsedMinutes}分 滞在
                  </p>
                </div>
              )
            })}
          </CardContent>
        </Card>

        <UserEdit
          open={isDrawerOpen}
          onOpenChange={(open) => {
            setDrawerOpen(open)
            if (!open) setEditingId(null)
          }}
          form={form}
          onFormChange={setForm}
          maids={maids}
          onSave={handleSave}
        />

        <QRCodeScan
          open={isQRDrawerOpen}
          onOpenChange={setQRDrawerOpen}
          onScan={handleQRScan}
        />

        <ProfileEdit
          open={isProfileDrawerOpen}
          onOpenChange={setProfileDrawerOpen}
          form={profileForm}
          onFormChange={setProfileForm}
          onSave={handleProfileSave}
        />

        <AlertMessage
          open={isLogoutConfirmOpen}
          onOpenChange={setLogoutConfirmOpen}
          title="ログアウト"
          description="ログアウトしますか？"
          confirmLabel="ログアウト"
          cancelLabel="キャンセル"
          showCancel={true}
          onConfirm={handleLogoutConfirm}
        />

        <AlertMessage
          open={alertOpen}
          onOpenChange={setAlertOpen}
          title={alertTitle}
          description={alertMessage}
        />

        <footer className="text-center text-xs text-muted-foreground">
          &copy; 2025 Maid Order System
        </footer>
      </div>
    </main>
  );
}
