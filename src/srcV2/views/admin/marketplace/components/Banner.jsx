// import nft1 from "assets/img/nfts/NftBanner1.png";

import { colors } from "theme/theme";

const Banner1 = () => {
  return (
    <div
      className="flex w-full flex-col rounded-[20px] bg-cover px-[30px] py-[30px] md:px-[64px] md:py-[56px]"
      style={{ background: colors.Orange }}
    >
      <div className="w-full">
        <h4 className="mb-[14px] text-xl font-bold text-white w-full md:text-3xl md:leading-[42px]">
          Discover, collect, and sell extraordinary NFTs
        </h4>
        <p className="mb-[40px] text-base font-medium text-[#E3DAFF] w-full">
          Enter in this creative world. Discover now the latest NFTs or start
          creating your own!
        </p>

        <div className="mt-[36px] flex items-center justify-between gap-4 sm:justify-start 2xl:gap-10">
          <button className="text-black linear rounded-xl bg-white px-4 py-2 text-center text-base font-medium transition duration-200 hover:!bg-white/80 active:!bg-white/70">
            Discover now
          </button>
          <button
            href=" "
            className="text-base font-medium text-lightPrimary hover:text-lightPrimary 2xl:ml-2"
          >
            Watch Video
          </button>
        </div>
      </div>
    </div>
  );
};

export default Banner1;
