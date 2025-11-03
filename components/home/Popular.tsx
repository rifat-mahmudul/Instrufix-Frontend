"use client";
import { getAllbusiness } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import "@smastrom/react-rating/style.css";

// Import Swiper styles and modules
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import Link from "next/link";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";

interface BusinessItem {
  email: string;
  name: string;
  image: string[];
}

interface Service {
  newInstrumentName: string;
}

interface Business {
  _id: string;
  review: string;
  businessInfo: BusinessItem;
  services: Service[];
}

// Skeleton component
const SkeletonCard = () => {
  return (
    <div className="bg-white rounded-lg border border-gray-100 shadow-md p-6 h-full animate-pulse">
      <div className="flex flex-col gap-5 h-full">
        {/* Profile Image Skeleton */}
        <div className="flex-shrink-0 overflow-hidden rounded-lg bg-gray-200 h-[250px] w-full"></div>

        {/* Content Skeleton */}
        <div className="flex-1 flex flex-col">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="flex-1">
              {/* Title Skeleton */}
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>

              {/* Rating Skeleton */}
              <div className="flex items-center gap-1 my-3">
                <div className="h-4 w-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-8"></div>
              </div>

              {/* Services Skeleton */}
              <div className="flex items-center gap-2">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  {[...Array(2)].map((_, i) => (
                    <div
                      key={i}
                      className="h-12 bg-gray-200 rounded-lg w-20"
                    ></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Popular = () => {
  const { data: allBusiness = [], isLoading } = useQuery({
    queryKey: ["popular-instruments"],
    queryFn: async () => {
      const response = await getAllbusiness();
      return response.data;
    },
  });

  return (
    <section className="pt-20 pb-10">
      <div className="container">
        <div className="text-center">
          <h1 className="text-[40px] font-bold">
            Popular Instrument Repair Shops
          </h1>
          <p className="text-[20px] text-gray-600 font-medium">
            Explore the most popular music instrument repair shops in your area
          </p>
        </div>

        <div className="mt-10 pb-10">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, index) => (
                <SkeletonCard key={index} />
              ))}
            </div>
          ) : (
            <Swiper
              modules={[Autoplay]}
              spaceBetween={25}
              slidesPerView={1}
              breakpoints={{
                640: {
                  slidesPerView: 1,
                },
                768: {
                  slidesPerView: 2,
                },
                1024: {
                  slidesPerView: 4,
                },
              }}
              autoplay={{
                delay: 3000,
                disableOnInteraction: false,
              }}
              loop={true}
            >
              {allBusiness?.slice(0, 12)?.map((business: Business) => (
                <SwiperSlide key={business?._id}>
                  <Link href={`search-result/${business?._id}`}>
                    <div className="bg-white rounded-lg border border-gray-100 shadow-[0px_2px_12px_0px_#003D3914] p-6 h-full">
                      <div className="space-y-5 h-full">
                        {/* Profile Image Slider with Arrows */}
                        <div className="flex-shrink-0 overflow-hidden rounded-lg relative group">
                          <Swiper
                            modules={[Navigation, Autoplay]}
                            navigation={{
                              nextEl: `.next-${business?._id}`,
                              prevEl: `.prev-${business?._id}`,
                            }}
                            autoplay={{
                              delay: 4000,
                              disableOnInteraction: false,
                            }}
                            loop={business?.businessInfo?.image?.length > 1}
                            className="w-full h-[250px] rounded-lg"
                          >
                            {business?.businessInfo?.image?.map(
                              (img, index) => (
                                <SwiperSlide key={index}>
                                  <Image
                                    src={img}
                                    alt={`${
                                      business?.businessInfo?.name
                                    } - Image ${index + 1}`}
                                    width={1000}
                                    height={1000}
                                    className="rounded-lg object-cover w-full h-full group-hover:scale-105 transition duration-500"
                                  />
                                </SwiperSlide>
                              )
                            )}
                          </Swiper>

                          {/* Custom Arrow Buttons */}
                          {business?.businessInfo?.image?.length > 1 && (
                            <>
                              <button
                                className={`prev-${business?._id} absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-2 rounded-full transition-all duration-200 opacity-0 group-hover:opacity-100 z-10`}
                              >
                                <ChevronLeft className="h-4 w-4" />
                              </button>
                              <button
                                className={`next-${business?._id} absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-2 rounded-full transition-all duration-200 opacity-0 group-hover:opacity-100 z-10`}
                              >
                                <ChevronRight className="h-4 w-4" />
                              </button>
                            </>
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 flex flex-col">
                          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-gray-900">
                                {business?.businessInfo?.name}
                              </h3>

                              <div className="my-3 flex items-center gap-2">
                                {business?.review?.length === 0 ? (
                                  <span className="text-sm text-gray-500">
                                    No reviews
                                  </span>
                                ) : business?.review?.length === 1 ? (
                                  <div className="flex items-center gap-1">
                                    {/* Single 5-star */}
                                    <Star className="fill-yellow-400 text-yellow-400 font-bold h-4 w-4" />
                                    <span className="text-sm text-gray-700">
                                      5.0
                                    </span>
                                    <span className="text-xs flex items-center gap-1">
                                      (
                                      <Image
                                        src="/images/google.jpeg"
                                        alt="google"
                                        width={1000}
                                        height={1000}
                                        className="h-4 w-4"
                                      />
                                      )
                                    </span>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-1">
                                    <Star className="fill-yellow-400 text-yellow-400 font-bold h-4 w-4" />
                                    <span>{business?.review?.length}</span>
                                    <span className="text-xs flex items-center gap-1">
                                      (
                                      <Image
                                        src="/images/google.jpeg"
                                        alt="google"
                                        width={1000}
                                        height={1000}
                                        className="h-4 w-4"
                                      />
                                      )
                                    </span>
                                  </div>
                                )}
                              </div>

                              {/* Services */}
                              <div className="flex items-center gap-2">
                                <div className="flex items-center gap-2 mb-2">
                                  {business?.services
                                    ?.slice(0, 2)
                                    ?.map((service, index) => (
                                      <button
                                        className="h-[52px] px-5 rounded-lg bg-[#F8F8F8]"
                                        key={index}
                                      >
                                        {service?.newInstrumentName}
                                      </button>
                                    ))}
                                </div>
                              </div>

                              <div>
                                <Link href={`search-result/${business?._id}`}>
                                  <button className="text-primary mt-2 font-semibold">
                                    See More
                                  </button>
                                </Link>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </SwiperSlide>
              ))}
            </Swiper>
          )}
        </div>
      </div>
    </section>
  );
};

export default Popular;
