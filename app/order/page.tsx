"use client";

import { OrderTable } from "@/components/order";
import { getMenus} from "@/api/menus"; 
import { useState, useEffect } from "react";
import { type Menu } from "../types";
import svg from 'react-svg';
import Image from 'next/image';

function Page() {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  

  
  useEffect(() => {
      const fetchMenus = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await getMenus({ available_only: true });
            setMenus(response.data.data.menus);
            
          } catch (e) {
                const errorMessage = e instanceof Error ? e.message : "不明なエラー";
                console.error("致命的なエラー:", e);
                setError(errorMessage);
            } finally {
          setIsLoading(false);
            }
      };
    fetchMenus();
    }, []);

    return (
      <div>
        <svg xmlns="http://www.w3.org/2000/svg" src="/logo.svg" className="w-16 h-16 mx-auto mb-8" />
        <div className="min-h-screen p-4">
          <div className="px-4 py-0 flex justify-center items-center w-fit mx-auto mb-8">
                <h2 className="text-xl text-black font-bold fontsize-xl">ドリンク</h2>
          </div>
          {isLoading && (
              <div className="text-center text-gray-700 mt-8">
                  データを読み込み中...
              </div>
          )}
          {error && (
              <div className="text-center text-red-600 font-bold mt-8 p-4 bg-red-100 rounded-lg mx-auto w-fit">
                エラーが発生しました: {error}
              </div>
          )}
          {!isLoading && !error && (
              <div className="mt-8">
                <OrderTable item={menus} />
              </div>
          )}
        </div>
      </div>
    );
}

export default Page;
