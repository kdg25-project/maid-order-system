"use client";

import Image from "next/image";
import OrderOverlay from "./order-overlay";
import { useState } from "react";

type Props = {
  name: string;
  image_url: string;
  description?: string | null;
  stock: number;
  biscoffStock: number;
  menu_id: number;
};

export default function OrderCard(props: Props) {
  const [isHidden, setIsHidden] = useState(true);

  const toggleOverlay = () => {
    setIsHidden(!isHidden);
  };

  return props.stock > 0 ? (
    <>
      <div
        onClick={toggleOverlay}
        className="flex flex-col items-center bg-white rounded-3xl gap-2 p-4 shadow-md"
      >
        <Image
          className="w-auto h-auto max-h-24"
          width={96}
          height={96}
          src={props.image_url ?? "/no_image.png"}
          alt={props.name + "の画像"}
        />
        <p className="text-center font-bold h-12 overflow-hidden">
          {props.name}
        </p>
      </div>
      {isHidden ? (
        ""
      ) : (
        <OrderOverlay
          cancelClick={toggleOverlay}
          image_url={props.image_url}
          name={props.name}
          description={props.description ?? ""}
          biscoffStock={props.biscoffStock}
          menu_id={props.menu_id}
        />
      )}
    </>
  ) : (
    <></>
  );
}
