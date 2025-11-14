"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import MaidCafe_Logo from "@/public/MaidCafe_Logo_minify.svg";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getUserById } from "@/api/users";
import type { User } from "@/app/types";
import { useRouter } from "next/navigation";
import { updateUserState } from "@/api/update-user-state";

export default function WelcomePage() {
  const [user, setUser] = useState<User | null>(null);
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userId = localStorage.getItem("userId");
        if (userId) {
          const fetchedUser = await getUserById(userId);
          if (fetchedUser.data.success) {
            setUser(fetchedUser.data.data);
          }
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    if (!user) return;

    const timer = setTimeout(() => setShowWelcome(true), 50);
    return () => clearTimeout(timer);
  }, [user]);

  const router = useRouter();

  const handleClick = async () => {
    try {
      const userId =
        typeof window !== "undefined" ? localStorage.getItem("userId") : null;
      if (!userId) {
        console.error("ユーザーIDが見つかりません");
        return;
      }
      try {
        await updateUserState(userId, "order");
      } catch (statusError) {
        console.error("ステータス更新に失敗しました:", statusError);
      }
      router.push("/order");
    } catch (error) {
      console.error("エラーが発生しました:", error);
    }
  };

  return (
    <div className="flex flex-col items-center gap-8 p-6">
      <Image
        src={MaidCafe_Logo}
        width={300}
        alt="MaidCafe_Logo"
        className="mx-auto"
      />
      <div
        className={`flex w-full max-w-xl flex-col items-center gap-8 text-center transition-all duration-700 ease-out ${
          showWelcome
            ? "translate-y-0 opacity-100"
            : "translate-y-4 opacity-0 pointer-events-none"
        }`}
        aria-hidden={!showWelcome}
      >
        <p className="text-base/relaxed">
          <span className="font-bold">メイドカフェへようこそ ♡</span>
          <br />
          本日はご来店いただき、ありがとうございます。
          <br />
          <br />
          ここは、KADOKAWAドワンゴ情報工科学院
          <br />
          名古屋校の1年生が運営する
          <br />
          <span className="font-bold">オリジナルシステム</span>
          で動くメイドカフェです。
          <br />
          <br />
          <span className="font-bold">
            {user?.name}
            {user?.honorific}
          </span>
          の体験のすべてを、
          <br />
          <span className="font-bold">アイデアと技術</span>
          で特別にしてくれます。
          <br />
          <br />
          <span className="font-bold">{user?.honorific}</span>
          にプレゼントしたカードのQRコードは
          <br />
          読み込むタイミングで変化しますので,
          <br />
          ぜひ何度も読み込んでみてください！
          <br />
          <br />
          技術構成などについての解説展示も
          <br />
          ブース内にご用意しておりますので、
          <br />
          ぜひご覧くださいませ。
          <br />
          <br />
          <span className="font-bold">ごゆっくりお楽しみください♡</span>
        </p>

        <Button
          onClick={handleClick}
          className="w-full max-w-100"
          size="lg"
          asChild
        >
          <Link href="/order">注文へ進む</Link>
        </Button>
      </div>
    </div>
  );
}
