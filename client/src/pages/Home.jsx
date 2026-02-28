import Banner from "../components/HomePage/Banner";
import FAQ from "../components/HomePage/FAQ";
import HowBrittooWorks from "../components/HomePage/HowBrittooWorks";
import RecentListings from "../components/HomePage/RecentListings";
import VideoCarousel from "../components/HomePage/VideoCarousel";

import Lottie from "lottie-react";
import greenRobot from "../assets/animations/green-robot.json";

const Home = ({ setProductType, setSearch }) => {
  return (
    <div className="bg-white">
      <Banner setProductType={setProductType} setSearch={setSearch}/>
      <div className="flex flex-col md:flex-row-reverse items-center justify-center gap-2 sm:gap-12 md:gap-28 mx-auto mt-12 md:mt-32">
        <div className="flex flex-col items-center md:items-start mb-8">
          <Lottie className="h-56 md:h-80" animationData={greenRobot} loop={true} />
          <h2 className="text-green-600 text-3xl md:text-4xl font-bold text-center md:text-left">A <span className="text-gray-600">Smarter</span> Way to  <br />Share & Earn</h2>
          <p className="text-xs md:text-sm text-gray-600 mt-2 md:mt-4 text-center md:text-left mx-3 md:mx-0">With Brittoo, you can rent using credits, earn by <br className="hidden md:block" /> sharing unused items, top up your credits whenever needed, <br className="hidden md:block" /> and withdraw earnings with ease.</p>
        </div>
        <VideoCarousel />
      </div>
      <RecentListings />
      <HowBrittooWorks />
      <FAQ />
    </div>
  );
};

export default Home;
