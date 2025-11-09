import React from 'react';

type Item = {
  id: string;
  name: string;
};

type Props = {
  item: Item[];
};

export function OrderTable({ item }: Props) {
  // itemの数が6未満の場合に、ダミーデータで6つになるよう補完する（任意）
  // ただし、ここでは渡されたitemをそのまま使用することを優先します。

  return (
    // font-zen-maru を適用して、コンポーネント全体のフォントを変更
    <div className="min-h-screen p-4 rounded-lg shadow-xl
          bg-gradient-to-tr
          from-[#FBAFB7]
          via-[#E7D1D9]
          to-[#A8EAEF]
          font-zen-maru">

      <div className="bg-[#ffa9a9]/80 backdrop-blur-sm
          px-4 py-1 rounded-full
          flex justify-center items-center
          w-fit mx-auto mb-8">

          <h2 className="text-xl text-white font-bold">注文リスト</h2>
      </div>
      <div className="px-4 py-1 justify-center items-center w-fit mx-auto">
          <h2 className="text-xl font-bold">ドリンク</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-8">

        {item.slice(0, 8).map((product, index) => (
          <div key={product.id || index}
               className="bg-white p-4 rounded-lg shadow-md hover:shadow-xl transition duration-300">

            <h3 className="text-lg font-semibold text-gray-800 truncate">
            </h3>
            <img src={"/cocacola.png"} alt="Coca-Cola" className="px-4 py-2 justify-center items-center mx-auto"/>

            <h3 className="text-xl item-center w-fit mx-auto font-bold">{product.name}</h3>

            <button className="mt-3 w-full bg-yellow-500 text-white py-1 rounded hover:bg-pink-600 transition">
              これにする?
            </button>
          </div>
        ))}
      </div>
      <div className="bg-[#c7f0ff] p-6 rounded-lg shadow-md flex flex-col justify-between w-full mx-auto max-w-md h-full">
        <div className="flex space-x-2 items-center">
          <input type="text" placeholder="注文したドリンク名" className="border border-gray-300 rounded-md bg-white px-2 py-1 flex-grow fontcolor:black font-bold"/>
          <button className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-pink-600 transition whitespace-nowrap">
            ご注文確認
          </button>
        </div>
      </div>
    </div>
  );
};
