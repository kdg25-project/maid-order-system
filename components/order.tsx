import React, { useState } from 'react';

import { useRouter } from 'next/navigation';

type Item = {
  name: string;
  id: number;
  stock: number;
  image: string;
};

type Props = {
  item: Item[];
};

export function OrderTable({ item }: Props) {
  const router = useRouter();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

  const [confirmedOrderName, setConfirmedOrderName] = useState('');

  const handleItemSelect = (product: Item) => {
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


      setConfirmedOrderName(selectedItem.name);
    }
    handleCloseModal();
  };

  const handleOpenOrderCheckModal = () => {

    if (confirmedOrderName) {

      router.push('/order_conf');
    }
  };


  const isOrderConfirmed = !!confirmedOrderName;

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-8">
        {item.slice(0, 8).map((product, index) => (
          <div key={product.id || index}
            className="bg-white p-4 rounded-lg shadow-md hover:shadow-xl transition duration-300">

            <h3 className="text-lg font-semibold text-gray-800 truncate">
            </h3>
            <img src={product.image} alt={product.name} className="px-4 py-2 justify-center items-center mx-auto" />

            <h3 className="text-xl item-center w-fit mx-auto font-bold">{product.name}</h3>

            <button
              onClick={() => handleItemSelect(product)}
              className="mt-3 w-full bg-yellow-500 fontcolor:black py-1 rounded-full hover:bg-yellow-600 transition">
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
              <img src={selectedItem.image} alt={selectedItem.name}
                className="w-full max-h-48 object-contain block mx-auto" />
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
        <div className="flex space-space-x-2 items-center">

          <div
            className="border border-white rounded-md bg-white px-2 py-1 flex-grow font-bold p-4 text-gray-800"
          >

            {confirmedOrderName || "注文したドリンク名"}
          </div>
          <button
            onClick={handleOpenOrderCheckModal}

            disabled={!isOrderConfirmed}

            className={`
              fontcolor:black px-3 py-1 rounded-full transition whitespace-nowrap p-4
              ${isOrderConfirmed
                ? 'bg-yellow-500 hover:bg-yellow-600'
                : 'bg-yellow-500 hover:bg-yellow-600 cursor-not-allowed'}
            `}
          >
            ご注文確認
          </button>
        </div>
      </div>
    </div>
  );
};
