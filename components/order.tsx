import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loadMaidCredentials } from "@/lib/maid-auth";
import { easyFetch } from "@/lib/easyFetch";
import { Menu } from "@/app/types"; 
import Image from 'next/image';


type Props = {
  item: Menu[];
};

export function OrderTable({item}: Props) {
  const router = useRouter();

  

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Menu | null>(null);

  const [confirmedOrders, setConfirmedOrders] = useState<Menu[]>([]);

  const handleItemSelect = (product: Menu) => {
    setSelectedItem(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
  };

  const handleConfirmOrder = () => {
    if (selectedItem) {
      console.log(`注文確定: ${selectedItem.name}`);


      setConfirmedOrders(prevOrders => [...prevOrders, selectedItem]);
    }
    handleCloseModal();
  };

  const handleOpenOrderCheckModal = () => {

    if (confirmedOrders.length > 0) {
      router.push('order/success');
    }
  };

  const isOrderConfirmed = confirmedOrders.length > 0;

  const confirmedOrderNames = confirmedOrders.map(order => order.name).join('、');

  return (
    <div>
      <div className="grid grid-cols-2 gap-4 p-8">
        {item.slice(0, 8).map((product, index) => (
          <div key={product.id || index}
            className="bg-white p-4 rounded-lg shadow-md transition hover:bg-gray-100 duration-300 h-full">
            <Image src={product.image_url ?? ''} alt={product.name} width={200} height={200} className="px-4 flex flex-col justify-between py-2 items-bottom h-auto w-auto mx-auto" />

            <h3 className="text-xl item-center w-fit mx-auto font-bold">{product.name}</h3>

            <button
              onClick={() => handleItemSelect(product)}
              className="mt-3 w-full bg-yellow-500 text-black py-1 rounded-full hover:bg-yellow-600 transition items-bottom">
              これにする?
            </button>
          </div>
        ))}
      </div>


      {isModalOpen && selectedItem && (
        <div className="fixed inset-0 z-50 bg-gray-900/70 flex items-center justify-center p-4" onClick={handleCloseModal}>
          <div
            className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-md transform transition-all duration-300 scale-100 flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full mb-4">
              <Image src={selectedItem.image_url ?? ''} alt={selectedItem.name} width={200} height={200}
                className="w-full max-h-48 object-contain block mx-auto items-bottom" />
            </div>

            <div className="w-full">
              <h3 className="text-2xl font-bold mb-4 text-center">{selectedItem.name}</h3>
              <p className="mb-4 text-center">深いコクとお口の中に、はじける刺激で、ご主人様を心身ともにリフレッシュして、ハッピーを届けてくれるドリンクだょ。</p>
              <h4 className="text-sm font-extralight text-center mx-auto mb-4">*画像はイメージです</h4>
              <div className="flex flex-col space-y-2 px-4">
                <button
                  onClick={handleConfirmOrder}
                  className="w-full bg-yellow-500 text-black font-semibold py-2 rounded-xl hover:bg-yellow-600">
                  これにする
                </button>
                <button
                  onClick={handleCloseModal}
                  className="w-full bg-gray-300 text-gray-800 font-semibold py-2 rounded-xl hover:bg-gray-400">
                  しない
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-[#c7f0ff] p-6 rounded-lg shadow-md flex flex-col justify-between w-full mx-auto max-w-md h-full">
        <div className="flex space-x-2 items-center">

          <div
            className="border border-white rounded-xl bg-white px-2 py-1 flex-grow font-bold p-4 text-gray-800"
          >
            {confirmedOrderNames || "注文したドリンク名"}
          </div>
          <div className="flex flex-col space-y-2 px-4">

          </div>
          <button
            onClick={handleOpenOrderCheckModal}

            disabled={!isOrderConfirmed}

            className={`px-3 py-1 rounded-full transition whitespace-nowrap p-4
              ${isOrderConfirmed
                ? 'bg-yellow-500 hover:bg-yellow-600 text-black'
                : 'bg-yellow-500 cursor-not-allowed text-gray-700'}
            `}
          >
            ご注文確認
          </button>
        </div>
        {confirmedOrders.length > 0 && (
          <p className="mt-2 text-sm text-gray-700 text-center">
          </p>
        )}
      </div>
    </div>
  );
};
