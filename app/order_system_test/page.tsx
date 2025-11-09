"use client";

import {OrderTable} from "@/components/order";
import {UseState} from "react";

function Page() {
  const products = [
    {id:1, name:"コカコーラ"},
    {id:2, name:"コカコーラ"},
    {id:3, name:"コカコーラ"},
    {id:4, name:"コカコーラ"},
    {id:5, name:"コカコーラ"},
    {id:6, name:"コカコーラ"},
    {id:7, name:"コカコーラ"},
    {id:8, name:"コカコーラ"},
  ]
  return <OrderTable item={products} />
}

export default Page;
