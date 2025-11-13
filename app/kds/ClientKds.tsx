"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { Order, OrderState, Menu, User } from "@/app/types";
import { getOrders, updateOrderState } from "@/api/orders";
import { getMenuById } from "@/api/menus";
import { getUserById } from "@/api/users";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

const statusLabels: Record<OrderState, string> = {
  pending: "待機中",
  preparing: "提供待ち",
  served: "提供済み",
};

const ClientKds = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [menuCache, setMenuCache] = useState<Record<number, Menu>>({});
  const [userCache, setUserCache] = useState<Record<string, User>>({});
  const menuCacheRef = useRef<Record<number, Menu>>({});
  const userCacheRef = useRef<Record<string, User>>({});
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const fetchingMenus = useRef<Set<number>>(new Set());
  const fetchingUsers = useRef<Set<string>>(new Set());
  const searchParams = useSearchParams();
  const currentState = (searchParams.get("state") as OrderState) || "pending";

  const nextState = (current: OrderState): OrderState | null => {
    switch (current) {
      case "pending":
        return "preparing";
      case "preparing":
        return "served";
      case "served":
      default:
        return "served";
    }
  };

  const parseDateString = (dateString: string): Date => {
    return new Date(dateString);
  };

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString("ja-JP", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Tokyo",
    });
  };

  const fetchMenu = useCallback(async (menuId: number) => {
    if (menuCacheRef.current[menuId] || fetchingMenus.current.has(menuId)) {
      return;
    }

    fetchingMenus.current.add(menuId);

    try {
      const res = await getMenuById(menuId);
      if (res.data) {
        const menu = res.data.data;
        menuCacheRef.current[menuId] = menu;
        setMenuCache((prev) => ({ ...prev, [menuId]: menu }));
      }
    } catch (error) {
      console.error("Failed to fetch menu:", error);
    } finally {
      fetchingMenus.current.delete(menuId);
    }
  }, []);

  const fetchUser = useCallback(async (userId: string) => {
    if (userCacheRef.current[userId] || fetchingUsers.current.has(userId)) {
      return;
    }

    fetchingUsers.current.add(userId);

    try {
      const res = await getUserById(userId);
      if (res.data) {
        const user = res.data.data;
        userCacheRef.current[userId] = user;
        setUserCache((prev) => ({ ...prev, [userId]: user }));
      }
    } catch (error) {
      console.error("Failed to fetch user:", error);
    } finally {
      fetchingUsers.current.delete(userId);
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getOrders({ state: currentState });
        if (res.data) {
          const fetchedOrders: Order[] = res.data.data.orders || [];
          setOrders(fetchedOrders);
          fetchedOrders.forEach((order) => {
            fetchMenu(order.menu_id);
            fetchUser(order.user_id);
          });
        }
      } catch (error) {
        console.error("Failed to fetch orders:", error);
      }
    };

    fetchData();
    pollingRef.current = setInterval(fetchData, 3000);

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, [currentState, fetchMenu, fetchUser]);

  const advanceOrder = useCallback(
    async (orderId: number) => {
      const next = nextState(currentState);
      if (!next) return;

      const originalOrders = orders;
      const optimisticOrders = orders.filter((o) => o.id !== orderId);
      setOrders(optimisticOrders);

      try {
        await updateOrderState(orderId, next);
        toast.success("ステータスを更新しました", {
          description: `注文を「${statusLabels[next]}」に移動しました。`,
        });
      } catch (error) {
        console.error("Failed to update order state:", error);
        setOrders(originalOrders);
        toast.error("ステータス更新に失敗しました", {
          description: "問題が発生しました。もう一度お試しください。",
        });
      }
    },
    [currentState, orders],
  );

  const advanceOldest = useCallback(() => {
    const sortedOrders = [...orders].sort(
      (a, b) =>
        parseDateString(a.created_at).getTime() -
        parseDateString(b.created_at).getTime(),
    );
    if (sortedOrders.length > 0) {
      const target = sortedOrders[0];
      void advanceOrder(target.id);
    }
  }, [orders, advanceOrder]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === "Space") {
        event.preventDefault();
        advanceOldest();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [advanceOldest]);

  const displayed = [...orders].sort(
    (a, b) =>
      parseDateString(a.created_at).getTime() -
      parseDateString(b.created_at).getTime(),
  );

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <header className="sticky top-0 z-10 bg-background/80 py-4 backdrop-blur-md">
        <div className="container mx-auto px-4 md:px-6">
          <h1 className="text-center text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {statusLabels[currentState]}
          </h1>
        </div>
      </header>
      <main className="flex-1 p-4 md:p-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {displayed.map((order, index) => {
            const menu = menuCache[order.menu_id];
            const user = userCache[order.user_id];
            const createdAt = parseDateString(order.created_at);
            const isOldest = index === 0;

            return (
              <Card
                key={order.id}
                className={cn(
                  "flex h-full transform-gpu flex-col overflow-hidden shadow-lg transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-2xl active:scale-95",
                  isOldest && "ring-2 ring-blue-500 ring-offset-2 ring-offset-background",
                )}
                onClick={() => advanceOrder(order.id)}
              >
                <CardContent className="flex flex-1 flex-col p-4">
                  <div className="relative mb-4 aspect-video w-full">
                    {menu?.image_url ? (
                      <Image
                        src={menu.image_url}
                        alt={menu.name}
                        fill
                        className="rounded-md object-contain"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center rounded-md bg-secondary">
                        <p className="text-sm text-muted-foreground">No Image</p>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="mb-2 text-xl font-bold tracking-tight">
                      {menu?.name || "Loading..."}
                    </h3>
                    {user && (
                      <p className="mb-3 font-mono text-lg text-muted-foreground">
                        Seat: {user.seat_id}
                      </p>
                    )}
                  </div>
                  <div className="mt-auto pt-4">
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>ID: {order.id}</span>
                      <span>{formatTime(createdAt)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default ClientKds;
