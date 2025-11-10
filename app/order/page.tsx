"use client";

import {OrderTable} from "@/components/order";
import {useState} from "react"; // useStateはPageコンポーネントでは使われていませんが、importは残しておきます

function Page() {
  const products = [
    {id:1, name:"キラキラ輝く美味しいコーラ", image:"/cocacola.png", stock: 10},
    {id:2, name:"キラキラ輝く美味しいコーラ", image:"/cocacola.png", stock: 10},
    {id:3, name:"キラキラ輝く美味しいコーラ", image:"/cocacola.png", stock: 10},
    {id:4, name:"キラキラ輝く美味しいコーラ", image:"/cocacola.png", stock: 10},
    {id:5, name:"キラキラ輝く美味しいコーラ", image:"/cocacola.png", stock: 10},
    {id:6, name:"キラキラ輝く美味しいコーラ", image:"/cocacola.png", stock: 10},
    {id:7, name:"キラキラ輝く美味しいコーラ", image:"/cocacola.png", stock: 10},
    {id:8, name:"キラキラ輝く美味しいコーラ", image:"/cocacola.png", stock: 10},
  ];
  return (
    <div>
    <div className="min-h-screen p-4 rounded-lg shadow-xl
            bg-gradient-to-tr
            from-[#FBAFB7]
            via-[#E7D1D9]
            to-[#A8EAEF]">
      <div className="bg-[#ffa9a9]/80 backdrop-blur-sm
            px-4 py-1 rounded-full
            flex justify-center items-center
            w-fit mx-auto mb-8">
        <h2 className="text-xl text-white font-bold">注文リスト</h2>
      </div>
      <div className="px-4 py-1 justify-center items-center w-fit mx-auto">
        <h2 className="text-4xl font-bold">ドリンク</h2>
      </div>
      <OrderTable item={products} />
      </div>

    </div>
  );
}

export default Page;
