import { useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import { Pagination } from "swiper/modules";
import carouselPoster from "../../assets/carouselThumb.png";

import video1 from "../../assets/videos/vid1.mp4";
import video2 from "../../assets/videos/vid2.mp4";
import video3 from "../../assets/videos/vid3.mp4";
import video4 from "../../assets/videos/vid4.mp4";

const slides = [
  {
    id: 0,
    mp4: video3,
    poster: carouselPoster,
    title: "Rent Using Your Credits",
    subtitle: "Your can use blue credits or red credits or even both to rent",
  },
  {
    id: 1,
    mp4: video1,
    poster: carouselPoster,
    title: "Earn Red Credit",
    subtitle: "List your unused items now and earn a red cache credit",
  },
  {
    id: 2,
    mp4: video2,
    poster: carouselPoster,
    title: "Don't have any items?",
    subtitle: "Your can also buy credits from the buy credits page.",
  },
  {
    id: 3,
    mp4: video4,
    poster: carouselPoster,
    title: "Withdraw Money",
    subtitle: "You can withdraw your money any time used for buying credits",
  },
];

export default function VideoCarousel() {
  const swiperRef = useRef(null);
  const videoRefs = useRef([]);
  const [currentIndex, setCurrentIndex] = useState(0); // ✅ added state

  const handleSlideChange = (swiper) => {
    setCurrentIndex(swiper.activeIndex); // ✅ track active index for overlay

    // pause and reset all videos
    videoRefs.current.forEach((video) => {
      if (video) {
        video.pause();
        video.currentTime = 0;
      }
    });

    // play active video
    const activeVideo = videoRefs.current[swiper.activeIndex];
    if (activeVideo) {
      activeVideo.play().catch(() => {});
    }
  };

  return (
    <div className="w-full md:w-fit flex md:justify-start justify-center mt-10 px-2 sm:px-0">
      <div className="relative w-full max-w-[580px] aspect-[768/544] border-4 border-green-600 rounded-2xl shadow-xl">
        
        {/* overlay text ABOVE swiper */}
        <div
          className="absolute -top-10 left-3/9 -translate-x-1/2 
                     md:top-5 md:left-5 md:translate-x-0 
                     bg-green-900/50 md:bg-black/50 backdrop-blur-xs text-white 
                     px-3 py-2 rounded-md z-20"
        >
          <h3 className="text-sm md:text-base font-bold">
            {slides[currentIndex]?.title}
          </h3>
          <p className="text-xs max-w-48">
            {slides[currentIndex]?.subtitle}
          </p>
        </div>

        <Swiper
          modules={[Pagination]}
          slidesPerView={1}
          pagination={{ clickable: true }}
          loop={false}
          onSwiper={(swiper) => (swiperRef.current = swiper)}
          onSlideChange={handleSlideChange}
          className="w-full h-full rounded-2xl overflow-hidden"
        >
          {slides.map((slide, idx) => (
            <SwiperSlide
              key={slide.id}
              className="flex justify-center items-center bg-white"
            >
              <video
                ref={(el) => (videoRefs.current[idx] = el)}
                src={slide.mp4}
                poster={slide.poster}
                className="w-full h-full object-contain"
                muted
                autoPlay={idx === 0}
                playsInline
                onEnded={() => swiperRef.current?.slideNext()}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
}
