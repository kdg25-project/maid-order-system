"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import type { User } from "@/app/types";

export default function RedirectPage(props: { userdata: User }) {
  localStorage.setItem("userId", props.userdata.id);
  const router = useRouter();
  useEffect(() => {
    switch (props.userdata.status) {
      case "welcome":
        router.push("/welcome");
        break;
      case "order":
        router.push("/order");
        break;
      case "eating":
        router.push("/order/success");
        break;
      case "instax_waiting":
      case "instax_draw":
      case "instax_complete":
      case "leaving":
        window.location.assign(
          `https://instax.kdgn.tech/picture/${localStorage.getItem("userId")})`,
        );
        break;
      default:
        router.push("/");
    }
  }, [router, props.userdata.status]);
  return null;
}
