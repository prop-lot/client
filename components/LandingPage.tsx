import Image from 'next/image';

const LandingPage = () => {
  return (
    <main className="pt-8">
      <section className="max-w-screen-xl mx-auto px-[20px] xl:px-0">
        <div className="flex flex-col items-center">
          <Image src='/logoName.svg' height={300} width={300} alt="proplot-title-image" />
          <Image src='/PropLotTaxiDrivingGif.gif' height={500} width={500} alt="proplot-loading-image" className='mt-[74px]' />
          <button
            className={`!bg-black !text-white !font-londrina !border-none !text-[22px] !rounded-[4px] !pt-[12px] !pb-[12px] !pl-[16px] !pr-[16px] mt-[52px]`}
            onClick={() => {
              window.location.href = "https://nouns.proplot.wtf"
            }}
          >
            {`Take me to Nouns DAO's Lot`}
          </button>
        </div>
      </section>
    </main>
  );
};

export default LandingPage;
