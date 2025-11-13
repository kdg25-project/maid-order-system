import Image from "next/image";
import MaidCafe_Logo from "@/public/MaidCafe_Logo_minify.svg";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function WelcomePage() {
  return (
    <div className="flex flex-col items-center gap-8 p-6">
      <Image
        src={MaidCafe_Logo}
        width={300}
        alt="MaidCafe_Logo"
        className="mx-auto"
      />
      <p className="text-center text-base/relaxed">
        <span className="font-bold">メイドカフェへようこそ ♡</span>
        <br />
        本日はご来店いただき、ありがとうございます。
        <br />
        <br />
        ここは、KADOKAWAドワンゴ情報工科学院
        <br />
        名古屋校1年生たちがつくった、
        <br />
        <span className="font-bold">オリジナルWebアプリ</span>
        で動くメイドカフェです。
        <br />
        <br />
        ご主人さま・お嬢さまの体験のすべてを、
        <br />
        学生たちの<span className="font-bold">アイデアと技術</span>で
        <br />
        特別なひとときにできるよう、
        <br />
        <span className="font-bold">心をこめて</span>おもてなししています。
        <br />
        <br />
        このサイトも、メイドカフェのしくみも、
        <br />
        すべて学生の<span className="font-bold">手作り</span>です。
        <br />
        どうぞ最後まで、
        <br />
        <span className="font-bold">ごゆっくりお楽しみください♡</span>
      </p>

      <Button className="w-full max-w-100" size="lg" asChild>
        <Link href="/order">注文へ進む</Link>
      </Button>
    </div>
  );
}
