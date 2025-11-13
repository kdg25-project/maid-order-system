"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import type { User } from "@/app/types";

export default function RedirectPage(props: { userdata: User }) {
  const router = useRouter();
  useEffect(() => {
    localStorage.setItem("userId", props.userdata.id);
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
          `https://instax.kdgn.tech/picture/${props.userdata.id})`,
        );
        break;
      default:
        router.push("/");
    }
  }, [router, props.userdata]);
  return null;
}
