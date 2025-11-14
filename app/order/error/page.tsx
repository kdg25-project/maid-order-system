"use client";

import Image from "next/image";
import logoSrc from "@/public/logo.svg";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function ErrorContent() {
  const searchParams = useSearchParams();
  const reason = searchParams.get("reason") || "トラブルがおきました";

  return (
    <div>
      <div
        className="min-h-screen p-4 rounded-lg shadow-xl
            bg-gradient-to-tr
            from-[#FBAFB7]
            via-[#E7D1D9]
            to-[#A8EAEF]"
      >
        <div className="h-10" />
        <Image
          src={logoSrc}
          alt="logo"
          width={128}
          height={64}
          className="w-64 h-32 mx-auto"
        />
        <div className="h-20" />
        <div className="flex justify-center">
          <Image
            src="/error.png"
            alt="error"
            width={128}
            height={64}
            className="w-40 h-40 mx-auto"
          />
        </div>
        <div className="h-16" />
        <p className="flex justify-center font-bold text-gray-600">
          トラブルがおきました
        </p>
        <p className="flex justify-center text-gray-600 text-center px-4">
          {reason}
        </p>
        <p className="flex justify-center text-gray-600 mt-2">
          スタッフをよんでください
        </p>
      </div>
    </div>
  );
}

function Page() {
  return (
    <Suspense
      fallback={
        <div>
          <div
            className="min-h-screen p-4 rounded-lg shadow-xl
              bg-gradient-to-tr
              from-[#FBAFB7]
              via-[#E7D1D9]
              to-[#A8EAEF]"
          >
            <div className="h-10" />
            <Image
              src={logoSrc}
              alt="logo"
              width={128}
              height={64}
              className="w-64 h-32 mx-auto"
            />
          </div>
        </div>
      }
    >
      <ErrorContent />
    </Suspense>
  );
}

export default Page;
