function Page() {
  const confmessage = "かしこまりました \n ご主人様/お嬢様";
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

          <h1 className="text-2xl font-bold text-white p-6 w-full md-auto">メイド喫茶</h1>

        </div>
        <div className="flex justify-center items-center w-full mx-auto md-auto">

          <h2 className="whitespace-pre-wrap text-xl font-medium text-black p-6 ">{confmessage}</h2>
        </div>
        <div className="flex justify-center">
          <img
            src={"/maid_illust.png"}
            alt={"maid_illust"}
            className="max-w-xs mx-auto"
            />
        </div>
      </div>
    </div>
  );
}
export default Page;
