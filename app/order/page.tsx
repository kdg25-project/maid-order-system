import { getMenus } from "@/api/menus";
import Image from "next/image";
import MaidCafe_Logo from "@/public/MaidCafe_Logo_minify.svg";
import OrderCard from "@/components/order/order-card";
import { Menu } from "../types";
import DrinkText from "@/public/drink_text.svg";

export default async function OrderPage() {
  const res = await getMenus();
  const menus = res.data.data.menus;

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <Image src={MaidCafe_Logo} width={200} alt="メイドカフェのロゴ"></Image>
      <h2>
        <Image src={DrinkText} width={100} alt="ドリンクと書かれた文字"></Image>
      </h2>
      <p className="font-bold">メニューをタップして選択</p>
      <div className="grid grid-cols-2 gap-4">
        {menus
          .filter((menu: Menu) => menu.name !== "Lotus Biscoff")
          .map((menu: Menu) => (
            <OrderCard
              key={menu.id}
              name={menu.name}
              image_url={menu.image_url}
              description={menu.description}
              stock={menu.stock}
              biscoffStock={
                menus.filter((menu: Menu) => menu.name === "Lotus Biscoff")[0]
                  .stock
              }
              menu_id={menu.id}
            />
          ))}
      </div>
    </div>
  );
}
