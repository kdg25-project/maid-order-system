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

      {/* タイトル要素 (hello world) */}
      <div className="bg-[#ffa9a9]/80 backdrop-blur-sm
          px-4 py-1 rounded-full
          flex justify-center items-center
          w-fit mx-auto mb-8">
          {/* h-15 はスケール外のため削除し、代わりに mb-8 で下にマージンを設定 */}
          <h2 className="text-xl text-white font-bold">注文リスト</h2>
      </div>

      {/* --- 商品カードセクション --- */}
      {/* Gridでレイアウト: デフォルトは1列、画面がmdサイズ以上で3列にする */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* item配列をマップしてカードを生成 */}
        {item.slice(0, 6).map((product, index) => (
          // カード本体: 白い背景、角丸、影付き、ホバーエフェクト付き
          <div key={product.id || index}
               className="bg-white p-4 rounded-lg shadow-md hover:shadow-xl transition duration-300">

            {/* 商品名 */}
            <h3 className="text-lg font-semibold text-gray-800 truncate">
              {product.name}
            </h3>

            {/* ID / 詳細 */}
            <p className="text-sm text-gray-500 mt-1">
              商品ID: {product.id}
            </p>

            {/* ダミーの購入ボタンなど */}
            <button className="mt-3 w-full bg-yellow-500 text-white py-1 rounded hover:bg-pink-600 transition">
              詳細を見る
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
