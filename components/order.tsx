import React, { useState } from 'react';

type Item = {
  name: string;
  stock: number;
  image: string;
};

type Props = {
  item: Item[];
};

export function OrderTable({ item }: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [orderInput, setOrderInput] = useState('');


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
      console.log(`${selectedItem.name} が注文に追加されました。`);

      setOrderInput(selectedItem.name);
    }
    handleCloseModal();
  };

  const handleOpenOrderCheckModal = () => {
    if (item.length > 0) {
      setSelectedItem(item[0]);
      setIsModalOpen(true);
    }
  };


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
          <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-xs transform transition-all duration-300 scale-100" onClick={(e) => e.stopPropagation()}>

            <img src={selectedItem.image} alt={selectedItem.name} className="w-full h-auto mb-4"/>
            <h4 className="text-sm font-extralight items-center mx-auto">*画像はイメージです</h4>

            <h3 className="text-2xl font-bold mb-4">{selectedItem.name}</h3>
            <p className="mx-auto py-4 px-4 p-8">深いコクとお口の中に、はじける刺激で、ご主人様を心身ともにリフレッシュして、ハッピーを届けてくれるドリンクだょ。</p>

            <div className="flex justify-between space-x-4">
              <button
                onClick={handleConfirmOrder}
                className="w-1/2 bg-yellow-500 text-black font-semibold rounded-xl hover:bg-yellow-600">
                これにする
              </button>
              <button onClick={handleCloseModal} className="w-1/2 bg-gray-300 text-gray-800 font-semibold rounded-xl hover:bg-gray-400">
                しない
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-[#c7f0ff] p-6 rounded-lg shadow-md flex flex-col justify-between w-full mx-auto max-w-md h-full">
        <div className="flex space-space-x-2 items-center">
          <input
            type="text"
            placeholder="注文したドリンク名"
            value={orderInput}
            onChange={(e) => setOrderInput(e.target.value)}
            className="border border-white rounded-md bg-white px-2 py-1 flex-grow fontcolor:black font-bold p-4"
          />
          <button
            onClick={handleOpenOrderCheckModal}
            className="bg-yellow-500 fontcolor:black px-3 py-1 rounded-full hover:bg-yellow-600 transition whitespace-nowrap p-4">
            ご注文確認
          </button>
        </div>
      </div>
    </div>
  );
};
