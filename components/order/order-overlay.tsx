"use client";

import Image from "next/image";
import { Button } from "../ui/button";
import { createOrder } from "@/api/orders";
import { getUserById } from "@/api/users";
import { updateUserState } from "@/api/update-user-state";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  image_url: string;
  name: string;
  description: string;
  cancelClick: () => void;
  biscoffStock: number;
  menu_id: number;
};

export default function OrderOverlay(props: Props) {
  const router = useRouter();
  const [isOrdering, setIsOrdering] = useState(false);

  const handleOrder = async () => {
    if (isOrdering) return;

    setIsOrdering(true);

    try {
      const userId = localStorage.getItem("userId");

      if (!userId) {
        router.push(
          "/order/error?reason=" +
            encodeURIComponent("ユーザー情報が見つかりません"),
        );
        return;
      }

      const userResponse = await getUserById(userId);

      if (!userResponse.data.success) {
        router.push(
          "/order/error?reason=" +
            encodeURIComponent("ユーザー情報の取得に失敗しました"),
        );
        return;
      }

      const user = userResponse.data.data;

      if (user.status !== "order") {
        router.push(
          "/order/error?reason=" +
            encodeURIComponent(
              "注文できる状態ではありません\nスタッフにお知らせください",
            ),
        );
        return;
      }

      const orderResponse = await createOrder({
        user_id: userId,
        menu_id: props.menu_id,
      });

      if (!orderResponse.data.success) {
        router.push(
          "/order/error?reason=" +
            encodeURIComponent(
              orderResponse.data.message || "注文に失敗しました",
            ),
        );
        return;
      }

      try {
        await updateUserState(userId, "eating");
      } catch (statusError) {
        console.error("ステータス更新に失敗しました:", statusError);
        // 注文自体は成功しているため、successページへ遷移
      }

      router.push("/order/success");
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "予期しないエラーが発生しました\nスタッフにお知らせください";
      router.push("/order/error?reason=" + encodeURIComponent(errorMessage));
    } finally {
      setIsOrdering(false);
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
        onClick={props.cancelClick}
      />
      <div className="flex flex-col w-[90vw] max-w-lg items-center bg-white fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 p-6 rounded-2xl shadow-lg gap-4 z-50">
        <div className="flex flex-row gap-4">
          <Image
            className="shrink-0 h-48 w-24 object-contain"
            src={props.image_url}
            alt={props.name + "の画像"}
            width={96}
            height={192}
          />
          <div className="grow flex flex-col gap-4">
            <h1 className="text-2xl font-bold">{props.name}</h1>
            <p className="max-h-36 overflow-hidden">{props.description}</p>
          </div>
        </div>
        <p className="text-sm text-gray-500">※画像はイメージです</p>
        {props.biscoffStock <= 0 ? null : (
          <div className="flex flex-col p-2 items-center border rounded-2xl">
            <div className="flex flex-row gap-3 items-center">
              <Image
                src="/biscoff.avif"
                width={50}
                height={25}
                alt="Lotus Biscoff一個の画像"
              />
              <p className="text-sm">
                ロータスビスコフ
                <br />
                1個付き
              </p>
            </div>
            <p className="text-xs text-gray-500">※数量限定</p>
          </div>
        )}
        <div className="flex flex-row gap-4 w-full">
          <Button
            onClick={props.cancelClick}
            className="flex-1"
            variant="outline"
          >
            キャンセル
          </Button>

          <Button
            onClick={handleOrder}
            className="flex-1 font-bold"
            disabled={isOrdering}
          >
            {isOrdering ? "注文中..." : "これにする"}
          </Button>
        </div>
      </div>
    </>
  );
}
