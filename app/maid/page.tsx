"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Loader2,
  LogOut,
  ScanQrCode,
  ToggleLeft,
  UserPen,
  User as UserIcon,
  Sparkle,
  Camera,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  User,
  Maid,
  MaidsApiResponse,
  Menu,
  MenusApiResponse,
} from "@/app/types";
import { UserEdit } from "@/components/maid/user-edit";
import { QRCodeScan } from "@/components/maid/qrcode/qrcode-scan";
import { ProfileEdit } from "@/components/maid/profile-edit";
import { AlertMessage } from "@/components/maid/alert-message";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  clearMaidCredentials,
  credentialsFromUrl,
  dataUrlToFile,
  fetchAssignedUsers,
  fetchMaidProfile,
  loadMaidCredentials,
  MaidCredentials,
  saveMaidCredentials,
  updateMaidActiveStatus,
  updateMaidProfile,
  updateUserInfo,
} from "@/lib/maid-auth";
import { useForceMaidDeactivate } from "@/lib/force-maid-deactivate";
import { cn } from "@/lib/utils";
import { InstaxCamera } from "@/components/maid/instax-camera";
import InstaxSeatInput from "@/components/maid/instax-seat-input";
import InstaxConfirmUser from "@/components/maid/instax-confirm-user";
import { fetchUserBySeat, postInstaxBySeat } from "@/lib/maid-auth";
import InstaxSaved from "@/components/maid/instax-saved";

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

type QuickActionId =
  | "workable_toggle"
  | "qrcode"
  | "edit_profile"
  | "logout"
  | "instax";

type QuickAction = {
  id: QuickActionId;
  label: string;
  description: string;
  accent: string;
  icon: LucideIcon;
  disabled?: boolean;
  loading?: boolean;
};

const staticQuickActions: QuickAction[] = [
  {
    id: "instax",
    label: "チェキ撮影",
    description: "チェキを撮影",
    accent: "bg-sky-50 text-sky-600 border-sky-100",
    icon: Camera,
  },
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
];

const servedStats = {
  total: 14,
};

const orderStateStyles = {
  pending: {
    label: "待機中",
    className: "border-black-100 bg-black-50 text-black-600",
  },
  preparing: {
    label: "準備中",
    className: "border-orange-100 bg-orange-50 text-orange-600",
  },
  served: {
    label: "提供済み",
    className: "border-emerald-100 bg-emerald-50 text-emerald-600",
  },
} as const;

const getElapsedMinutes = (isoString: string) => {
  const timestamp = new Date(isoString).getTime();
  if (Number.isNaN(timestamp)) {
    return 0;
  }
  const diffMs = Date.now() - timestamp;
  return Math.max(0, Math.floor(diffMs / 60000));
};

const formatElapsedTime = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours > 0 && remainingMinutes > 0) {
    return `${hours}時間${remainingMinutes}分`;
  }

  if (hours > 0) {
    return `${hours}時間`;
  }

  return `${remainingMinutes}分`;
};

export default function Home() {
  const router = useRouter();
  const [assignedUsers, setAssignedUsers] = useState<User[]>([]);
  const [isUsersLoading, setUsersLoading] = useState(true);
  const [maids, setMaids] = useState<Maid[]>([]);
  const [menus, setMenus] = useState<Menu[]>([]);
  const [isMenusLoading, setMenusLoading] = useState(true);
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [isQRDrawerOpen, setQRDrawerOpen] = useState(false);
  const [isProfileDrawerOpen, setProfileDrawerOpen] = useState(false);
  const [isLogoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const [isLogoutProcessing, setLogoutProcessing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isUserSaving, setUserSaving] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertTitle, setAlertTitle] = useState("エラー");
  const [credentials, setCredentials] = useState<MaidCredentials | null>(null);
  const [maidProfile, setMaidProfile] = useState<Maid | null>(null);
  const [isProfileLoading, setProfileLoading] = useState(true);
  const [isProfileSaving, setProfileSaving] = useState(false);
  const [isActiveUpdating, setActiveUpdating] = useState(false);
  const [isInstaxProcessing, setInstaxProcessing] = useState(false);
  const [form, setForm] = useState<{
    name: string;
    seat_id: number;
    maid_id: string;
  }>({
    name: "",
    seat_id: 1,
    maid_id: "",
  });
  const [profileForm, setProfileForm] = useState<{
    name: string;
    image: string;
  }>({
    name: "",
    image: "",
  });
  const [editingInitialMaidId, setEditingInitialMaidId] = useState<string>("");
  const [isMaidChangeConfirmOpen, setMaidChangeConfirmOpen] = useState(false);
  const forceDeactivateMaid = useForceMaidDeactivate(credentials);
  const [isCameraOpen, setCameraOpen] = useState(false);
  const [capturedInstaxDataUrl, setCapturedInstaxDataUrl] = useState<string | null>(null);
  const [isSeatInputOpen, setSeatInputOpen] = useState(false);
  const [pendingSeatId, setPendingSeatId] = useState<number | null>(null);
  const [isConfirmOpen, setConfirmOpen] = useState(false);
  const [confirmUser, setConfirmUser] = useState<User | null>(null);
  const [savedInstaxId, setSavedInstaxId] = useState<number | null>(null);
  const [isSavedOpen, setSavedOpen] = useState(false);

  const closeEditor = () => {
    setDrawerOpen(false);
    setEditingId(null);
    setEditingInitialMaidId("");
    setMaidChangeConfirmOpen(false);
  };

  const showAlert = useCallback((title: string, message: string) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertOpen(true);
  }, []);

  const reloadAssignedUsers = useCallback(async () => {
    if (!credentials) return;
    setUsersLoading(true);
    try {
      const users = await fetchAssignedUsers(credentials);
      setAssignedUsers(users);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "割り当てユーザーの取得に失敗しました。";
      showAlert("エラー", message);
    } finally {
      setUsersLoading(false);
    }
  }, [credentials, showAlert]);

  useEffect(() => {
    const stored = loadMaidCredentials();
    if (!stored) {
      router.replace("/maid/login");
      return;
    }
    setCredentials(stored);
  }, [router]);

  useEffect(() => {
    if (!credentials) return;
    let cancelled = false;
    const loadProfile = async () => {
      setProfileLoading(true);
      try {
        const profile = await fetchMaidProfile(credentials);
        if (cancelled) return;
        if (!profile) {
          await forceDeactivateMaid();
          showAlert(
            "エラー",
            "情報が見つかりません。再度ログインをしてください。",
          );
          router.replace(
            `/maid/login?id=${encodeURIComponent(credentials.id)}&key=${encodeURIComponent(credentials.apiKey)}`,
          );
          return;
        }
        setMaidProfile(profile);
      } catch (error) {
        if (cancelled) return;
        await forceDeactivateMaid();
        const message =
          error instanceof Error ? error.message : "情報の取得に失敗しました。";
        showAlert("エラー", message);
      } finally {
        if (!cancelled) {
          setProfileLoading(false);
        }
      }
    };
    loadProfile();
    return () => {
      cancelled = true;
    };
  }, [credentials, forceDeactivateMaid, router, showAlert]);

  useEffect(() => {
    if (!maidProfile) return;
    setProfileForm({
      name: maidProfile.name ?? "",
      image: maidProfile.image_url ?? "",
    });
  }, [maidProfile]);

  useEffect(() => {
    const fetchMenus = async () => {
      setMenusLoading(true);
      try {
        const response = await fetch("https://api.kdgn.tech/api/menus");
        const data: MenusApiResponse = await response.json();
        setMenus(data.data.menus);
      } catch (error) {
        showAlert("エラー", `メニューの取得中にエラーが発生しました。${error}`);
      } finally {
        setMenusLoading(false);
      }
    };
    fetchMenus();
  }, [showAlert]);

  useEffect(() => {
    const fetchMaids = async () => {
      try {
        const response = await fetch("https://api.kdgn.tech/api/maids");
        const data: MaidsApiResponse = await response.json();
        if (data.success && data.data) {
          setMaids(data.data);
        }
      } catch (error) {
        showAlert(
          "エラー",
          `メイドリストの取得中にエラーが発生しました。${error}`,
        );
      }
    };
    fetchMaids();
  }, [showAlert]);

  useEffect(() => {
    if (!credentials) return;
    void reloadAssignedUsers();
  }, [credentials, reloadAssignedUsers]);

  const menuLookup = useMemo(() => {
    return menus.reduce<Record<number, Menu>>((acc, menu) => {
      acc[menu.id] = menu;
      return acc;
    }, {});
  }, [menus]);

  const userLookupLocal = useMemo(() => {
    return assignedUsers.reduce<Record<string, User>>((acc, user) => {
      acc[user.id] = user;
      return acc;
    }, {});
  }, [assignedUsers]);

  const openEditor = (id: string) => {
    const target = assignedUsers.find((user) => user.id === id);
    if (!target) return;
    const initialMaidId = target.maid_id ?? credentials?.id ?? "";
    setEditingId(id);
    setForm({
      name: target.name ?? "",
      seat_id: target.seat_id ?? 1,
      maid_id: initialMaidId,
    });
    setEditingInitialMaidId(initialMaidId);
    setDrawerOpen(true);
  };

  const executeUserSave = async () => {
    if (editingId == null) return;
    if (!credentials) {
      showAlert(
        "エラー",
        "ログイン情報が見つかりません。再度ログインをしてください。",
      );
      router.replace("/maid/login");
      return;
    }
    const trimmedName = form.name.trim();
    if (!trimmedName) {
      showAlert("エラー", "名前を入力してください。");
      return;
    }
    if (isUserSaving) return;
    const targetUserId = editingId;
    const maidChanged = editingInitialMaidId !== form.maid_id;

    const normalizedSeatId =
      Number.isFinite(form.seat_id) && form.seat_id > 0 ? form.seat_id : null;
    const normalizedMaidId =
      form.maid_id.trim() === "" ? null : form.maid_id.trim();

    try {
      setUserSaving(true);
      const updatedUser = await updateUserInfo(credentials, editingId, {
        name: trimmedName,
        seat_id: normalizedSeatId,
        maid_id: normalizedMaidId,
      });
      setAssignedUsers((prev) => {
        if (maidChanged) {
          return prev.filter((user) => user.id !== targetUserId);
        }
        return prev.map((user) =>
          user.id === targetUserId ? updatedUser : user,
        );
      });
      showAlert("完了", "ユーザー情報を更新しました。");
      closeEditor();
      if (maidChanged) {
        void reloadAssignedUsers();
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "ユーザー情報の更新に失敗しました。";
      showAlert("エラー", message);
    } finally {
      setUserSaving(false);
    }
  };

  const handleSave = () => {
    const trimmedName = form.name.trim();
    if (!trimmedName) {
      showAlert("エラー", "名前を入力してください。");
      return;
    }
    if (isUserSaving) return;
    if (editingInitialMaidId !== form.maid_id) {
      setMaidChangeConfirmOpen(true);
      return;
    }
    void executeUserSave();
  };

  const handleQRScan = (result: string) => {
    setQRDrawerOpen(false);
    const parsed = credentialsFromUrl(result);
    if (!parsed) {
      showAlert("QRコードエラー", "再度スキャンしてください。");
      return;
    }
    saveMaidCredentials(parsed);
    setCredentials(parsed);
    router.push(
      `/maid/login?id=${encodeURIComponent(parsed.id)}&key=${encodeURIComponent(parsed.apiKey)}`,
    );
  };

  const handleProfileSave = async (nextForm: {
    name: string;
    image: string;
  }) => {
    if (!credentials) {
      showAlert(
        "エラー",
        "ログイン情報が見つかりません。再度ログインをしてください。",
      );
      router.replace("/maid/login");
      return;
    }
    if (isProfileSaving) return;

    const trimmedName = nextForm.name.trim();
    if (!trimmedName) {
      showAlert("エラー", "名前を入力してください。");
      return;
    }

    setProfileDrawerOpen(false);
    setProfileForm(nextForm);

    const imageFile = nextForm.image.startsWith("data:")
      ? dataUrlToFile(nextForm.image, "profile.jpg")
      : null;

    try {
      setProfileSaving(true);
      const updated = await updateMaidProfile(credentials, {
        name: trimmedName,
        image: imageFile,
      });
      setMaidProfile(updated);
      setProfileForm({
        name: updated.name ?? "",
        image: updated.image_url ?? "",
      });
      showAlert("完了", "プロフィールを更新しました。");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "プロフィールの更新に失敗しました。";
      showAlert("エラー", message);
      if (maidProfile) {
        setProfileForm({
          name: maidProfile.name ?? "",
          image: maidProfile.image_url ?? "",
        });
      }
    } finally {
      setProfileSaving(false);
    }
  };

  const handleToggleWorkable = useCallback(async () => {
    if (!credentials) {
      showAlert(
        "エラー",
        "ログイン情報が見つかりません。再度ログインをしてください。",
      );
      router.replace("/maid/login");
      return;
    }
    if (!maidProfile) {
      showAlert("エラー", "メイド情報の取得が完了していません。");
      return;
    }
    if (isActiveUpdating) return;

    const nextState = !maidProfile.is_active;
    setActiveUpdating(true);
    try {
      const updated = await updateMaidActiveStatus(credentials, {
        is_active: nextState,
      });
      setMaidProfile(updated);
      showAlert(
        "完了",
        `稼働状態を${nextState ? "稼働中" : "休止中"}に更新しました。`,
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "稼働状態の更新に失敗しました。";
      showAlert("エラー", message);
    } finally {
      setActiveUpdating(false);
    }
  }, [credentials, isActiveUpdating, maidProfile, router, showAlert]);

  const handleQuickAction = (actionId: string) => {
    if (actionId === "workable_toggle") {
      void handleToggleWorkable();
    } else if (actionId === "qrcode") {
      setQRDrawerOpen(true);
    } else if (actionId === "edit_profile") {
      setProfileDrawerOpen(true);
    } else if (actionId === "instax") {
      setCapturedInstaxDataUrl(null)
      setPendingSeatId(null)
      setSeatInputOpen(true)
    } else if (actionId === "logout") {
      setLogoutConfirmOpen(true);
    }
  };

  const handleLogoutConfirm = async () => {
    if (isLogoutProcessing) return;

    if (credentials) {
      setLogoutProcessing(true);
      const pausedProfile = await forceDeactivateMaid({
        onError: (message) => {
          showAlert(
            "エラー",
            `稼働状態を休止に変更できませんでした。${message}`,
          );
        },
      });
      setLogoutProcessing(false);
      if (!pausedProfile) {
        setLogoutConfirmOpen(true);
        return;
      }
    }

    clearMaidCredentials();
    setCredentials(null);
    setMaidProfile(null);
    setAssignedUsers([]);
    setUsersLoading(true);
    setProfileForm({
      name: "",
      image: "",
    });
    router.replace("/maid/login");
  };

  const profileDisplayName =
    profileForm.name || (isProfileLoading ? "" : "メイド");
  const profileImageSrc: string | null = profileForm.image || null;
  const quickActionItems = useMemo<QuickAction[]>(() => {
    const isActive = maidProfile?.is_active ?? false;
    const label = maidProfile
      ? `稼働を${isActive ? "停止" : "開始"}`
      : "稼働状態を切り替え";
    const description = maidProfile
      ? `現在は${isActive ? "稼働中" : "休止中"}です`
      : isProfileLoading
        ? "稼働状態を取得しています"
        : "稼働状態を切り替えます";
    const accent = isActive
      ? "bg-amber-50 text-amber-600 border-amber-100"
      : "bg-emerald-50 text-emerald-600 border-emerald-100";

    return [
      {
        id: "workable_toggle",
        label,
        description,
        accent,
        icon: ToggleLeft,
        disabled: isProfileLoading || !maidProfile || isActiveUpdating,
        loading: isActiveUpdating,
      },
      ...staticQuickActions.map((a) =>
        a.id === "instax" ? { ...a, loading: isInstaxProcessing } : a,
      ),
    ];
  }, [isActiveUpdating, isProfileLoading, maidProfile, isInstaxProcessing]);

  const getMaidName = (maidId: string) => {
    if (!maidId) return "未設定";
    return maids.find((maid) => maid.id === maidId)?.name ?? "未設定";
  };

  const maidChangeDescription = `担当メイドを「${getMaidName(editingInitialMaidId)}」から「${getMaidName(form.maid_id)}」に変更します。よろしいですか？`;

  return (
    <main className="min-h-screen bg-linear-to-b from-rose-50 via-white to-white">
      <div className="mx-auto flex min-h-screen max-w-md flex-col gap-6 px-4 pb-8 pt-4">
        <section
          className="flex items-center gap-4 rounded-2xl border border-rose-100 bg-white/90 px-5 py-5 shadow-sm backdrop-blur"
          aria-busy={isProfileLoading}
        >
          <div className="h-16 w-16 shrink-0 rounded-full">
            {isProfileLoading ? (
              <div
                className="h-full w-full animate-pulse rounded-full bg-rose-100"
                aria-hidden="true"
              />
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
                <UserIcon className="h-8 w-8" />
              </div>
            )}
          </div>
          <div className="space-y-1">
            {isProfileLoading ? (
              <>
                <div
                  className="h-4 w-24 animate-pulse rounded-full bg-rose-100"
                  aria-hidden="true"
                />
                <div
                  className="h-6 w-36 animate-pulse rounded-full bg-rose-100"
                  aria-hidden="true"
                />
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
          {quickActionItems.map((action) => {
            const Icon = action.icon;
            return (
              <Button
                key={action.id}
                type="button"
                onClick={() => handleQuickAction(action.id)}
                variant="outline"
                disabled={action.disabled}
                className={cn(
                  "h-auto w-full flex-col items-start justify-start gap-1.5 rounded-2xl border px-4 py-3 text-left text-sm font-medium shadow-sm transition hover:scale-[1.01] active:scale-[0.98]",
                  action.accent,
                )}
              >
                <div className="flex items-center gap-2 whitespace-pre-line wrap-break-word">
                  <span className="rounded-full bg-white/70 p-1">
                    {action.loading ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Icon className="size-4" />
                    )}
                  </span>
                  {action.label}
                </div>
                <span className="text-xs text-black/60 whitespace-pre-line wrap-break-word">
                  {action.description}
                </span>
              </Button>
            );
          })}
        </section>

        <Card className="border-none bg-linear-to-br from-rose-600 to-rose-300 text-white shadow-lg">
          <CardHeader className="text-white/90">
            <CardTitle className="text-lg font-semibold">
              接客した人数
            </CardTitle>
          </CardHeader>
          <CardContent className="relative space-y-4 flex items-center justify-start">
            <p className="text-5xl font-semibold">{servedStats.total}人</p>
            <div className="absolute bottom-0 -right-5 opacity-80">
              <div className="relative bottom-8 right-28 SparkleAnimation1">
                <Sparkle
                  className="h-8 w-8 text-white fill-white"
                  strokeWidth={0.5}
                />
              </div>
              <div className="relative bottom-5 right-20 SparkleAnimation2">
                <Sparkle
                  className="h-10 w-10 text-white fill-white"
                  strokeWidth={0.5}
                />
              </div>
              <div className="relative top-0 right-10 SparkleAnimation3">
                <Sparkle
                  className="h-5 w-5 text-white fill-white"
                  strokeWidth={0.5}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-3">
            <div>
              <CardTitle className="text-lg font-semibold">
                提供待ちリスト
              </CardTitle>
            </div>
            <Badge variant="outline">
              残り {orderResponse.data.orders.length}件
            </Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            {orderResponse.data.orders.map((order) => {
              const menu = menuLookup[order.menu_id];
              const user = userLookupLocal[order.user_id];
              const elapsedMinutes = getElapsedMinutes(order.created_at);
              const elapsedTimeLabel = formatElapsedTime(elapsedMinutes);
              const seatLabel = user
                ? `席番号: ${user.seat_id ?? "-"}番`
                : "席情報なし";
              const stateStyle =
                orderStateStyles[order.state] ?? orderStateStyles.pending;

              return (
                <div
                  key={order.id}
                  className="flex flex-col gap-3 rounded-2xl border border-dashed px-4 py-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="text-base font-semibold leading-tight">
                        {isMenusLoading ? (
                          <div className="space-y-1" aria-hidden="true">
                            <div className="h-4 w-32 animate-pulse rounded-full bg-rose-100" />
                          </div>
                        ) : menu?.name ? (
                          menu.name
                        ) : (
                          <span className="inline-flex items-center gap-1 text-muted-foreground">
                            メニュー情報なし
                          </span>
                        )}
                      </div>
                    </div>
                    <Badge variant="secondary" className={stateStyle.className}>
                      {stateStyle.label}
                    </Badge>
                  </div>
                  <p className="text-xs font-normal text-muted-foreground">
                    {seatLabel} ・ 約{elapsedTimeLabel}経過
                  </p>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">割り当てられたユーザー</CardTitle>
            </div>
            <Badge variant="outline">現在 {assignedUsers.length}人</Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            {isUsersLoading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="rounded-2xl border px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <div
                      className="h-4 w-32 animate-pulse rounded-full bg-rose-100"
                      aria-hidden="true"
                    />
                    <div
                      className="h-8 w-16 animate-pulse rounded-full bg-rose-100"
                      aria-hidden="true"
                    />
                  </div>
                  <div
                    className="mt-2 h-3 w-40 animate-pulse rounded-full bg-rose-50"
                    aria-hidden="true"
                  />
                </div>
              ))
            ) : assignedUsers.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                現在割り当てられているユーザーはいません。
              </p>
            ) : (
              assignedUsers.map((user) => {
                const displayName = user.name ? `${user.name}様` : "名前未登録";
                const elapsedMinutes = getElapsedMinutes(user.created_at);
                const elapsedTimeLabel = formatElapsedTime(elapsedMinutes);

                return (
                  <div key={user.id} className="rounded-2xl border px-4 py-3">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-base font-semibold">{displayName}</p>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEditor(user.id)}
                      >
                        編集
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      席番号: {user.seat_id ?? "-"}番 ・ 約{elapsedTimeLabel}
                      滞在
                    </p>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        <UserEdit
          open={isDrawerOpen}
          onOpenChange={(open) => {
            if (open) {
              setDrawerOpen(true);
              return;
            }
            closeEditor();
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

        <InstaxCamera
          open={isCameraOpen}
          onOpenChange={setCameraOpen}
          onError={(err) => showAlert("エラー", `カメラの起動に失敗しました: ${err.message}`)}
          onConfirm={(dataUrl) => {
            setCapturedInstaxDataUrl(dataUrl)
            setCameraOpen(false)
            if (confirmUser) {
              setConfirmOpen(true)
              return
            }

            (async () => {
              if (!pendingSeatId) {
                setSeatInputOpen(true)
                return
              }
              if (!credentials) {
                showAlert("エラー", "ログイン情報が見つかりません。再ログインしてください。")
                router.replace("/maid/login")
                return
              }
              try {
                setInstaxProcessing(true)
                const user = await fetchUserBySeat(credentials, pendingSeatId)
                if (!user) {
                  showAlert("該当なし", `席番号 ${pendingSeatId} に割り当てられたユーザーが見つかりませんでした。`)
                  setCapturedInstaxDataUrl(null)
                  return
                }
                setConfirmUser(user)
                setConfirmOpen(true)
              } catch (err) {
                const e = err instanceof Error ? err : new Error(String(err))
                showAlert("エラー", `ユーザー取得に失敗しました: ${e.message}`)
              } finally {
                setInstaxProcessing(false)
              }
            })()
          }}
        />

        <InstaxSeatInput
          open={isSeatInputOpen}
          onOpenChange={setSeatInputOpen}
          dataUrl={capturedInstaxDataUrl}
          onConfirm={async (seatId) => {
            setSeatInputOpen(false)
            if (!credentials) {
              showAlert("エラー", "ログイン情報が見つかりません。再ログインしてください。")
              router.replace("/maid/login")
              return
            }
            try {
              setInstaxProcessing(true)
              const user = await fetchUserBySeat(credentials, seatId)
              if (!user) {
                showAlert("該当なし", `席番号 ${seatId} に割り当てられたユーザーが見つかりませんでした。`)
                setPendingSeatId(null)
                return
              }
              setConfirmUser(user)
              setPendingSeatId(seatId)
              setConfirmOpen(true)
            } catch (err) {
              const e = err instanceof Error ? err : new Error(String(err))
              showAlert("エラー", `ユーザー取得に失敗しました: ${e.message}`)
            } finally {
              setInstaxProcessing(false)
            }
          }}
          onCancel={() => {
            setCapturedInstaxDataUrl(null)
            setSeatInputOpen(false)
            setPendingSeatId(null)
          }}
        />

        <InstaxConfirmUser
          open={isConfirmOpen}
          onOpenChange={setConfirmOpen}
          user={confirmUser}
          dataUrl={capturedInstaxDataUrl}
          onProceed={() => {
            setConfirmOpen(false)
            setCameraOpen(true)
          }}
          onConfirm={async () => {
            if (!confirmUser?.seat_id) {
              showAlert("エラー", "ユーザーに席情報がありません。保存できません。")
              return
            }
            if (!credentials) {
              showAlert("エラー", "ログイン情報が見つかりません。再ログインしてください。")
              router.replace("/maid/login")
              return
            }
            const file = dataUrlToFile(capturedInstaxDataUrl ?? "", `instax-${Date.now()}.jpg`)
            if (!file) {
              showAlert("エラー", "画像データの変換に失敗しました。再撮影してください。")
              return
            }
            try {
              setInstaxProcessing(true)
              const instax = await postInstaxBySeat(credentials, confirmUser.seat_id, file)
              setSavedInstaxId(instax.id)
              setSavedOpen(true)
              setCapturedInstaxDataUrl(null)
              setConfirmUser(null)
              setConfirmOpen(false)
              setPendingSeatId(null)
              void reloadAssignedUsers()
            } catch (err) {
              const e = err instanceof Error ? err : new Error(String(err))
              showAlert("保存エラー", `チェキの保存に失敗しました: ${e.message}`)
            } finally {
              setInstaxProcessing(false)
            }
          }}
          onCancel={() => {
            setCapturedInstaxDataUrl(null)
            setPendingSeatId(null)
          }}
        />

        <InstaxSaved
          open={isSavedOpen}
          onOpenChange={setSavedOpen}
          instaxId={savedInstaxId}
          onClose={() => setSavedInstaxId(null)}
        />

        <ProfileEdit
          open={isProfileDrawerOpen}
          onOpenChange={setProfileDrawerOpen}
          form={profileForm}
          onFormChange={setProfileForm}
          onSave={handleProfileSave}
        />

        <AlertMessage
          open={isMaidChangeConfirmOpen}
          onOpenChange={setMaidChangeConfirmOpen}
          title="担当メイドの変更"
          description={maidChangeDescription}
          confirmLabel="変更を保存"
          cancelLabel="キャンセル"
          showCancel={true}
          onConfirm={() => {
            void executeUserSave();
          }}
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
      </div>
    </main>
  );
}
