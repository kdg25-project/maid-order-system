export default function Home() {
  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-bl from-[#FBAFB7] via-[#E7D1D9] to-[#A8EAEF]">
      <p className="text-3xl font-semibold text-pink-500 border-2 border-pink-300 bg-pink-100 px-8 py-5 rounded-2xl shadow-lg hover:scale-105 transition-transform duration-300">
        QRコードをスキャンしてやり直してください
      </p>
    </div>
  );
}