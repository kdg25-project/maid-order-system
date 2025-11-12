"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import type { User } from "@/app/types";

export default function RedirectPage(props: { userdata: User }) {
  localStorage.setItem("userId", props.userdata.id);
  const router = useRouter();
  useEffect(() => {
    if (props.userdata.status === "welcome") router.push("/welcome");
  }, [router, props.userdata.status]);
  return null;
}
