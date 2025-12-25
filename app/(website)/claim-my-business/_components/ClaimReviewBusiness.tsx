"use client";
import LoginModal from "@/components/business/modal/login-modal";
import ReviewModal from "@/components/modals/ReviewModal";
import ReviewSubmittedModal from "@/components/modals/ReviewSubmittedModal";
import AddBusinessSection from "@/components/shared/AddBusinessSection";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton"; // Import Shadcn Skeleton
import { getAllbusiness } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { Search, Star } from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useState } from "react";

interface BusinessItem {
  email: string;
  name: string;
  image: string[];
}

interface Service {
  serviceName: string;
}

interface Business {
  _id: string;
  businessInfo: BusinessItem;
  instrumentInfo: Service[];
}

const ClaimReviewBusiness = () => {
  const pathname = usePathname();
  const route = useRouter();
  const session = useSession();
  const status = session?.status;
  const [businessID, setBusinessID] = useState<string>();
  const [isOpen, setIsOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const { data: allBusiness = [], isLoading } = useQuery({
    queryKey: ["get-all-business"],
    queryFn: async () => await getAllbusiness().then((res) => res.data),
  });

  // ✅ Filter businesses based on search query
  const filteredBusiness = allBusiness.filter((business: Business) =>
    business?.businessInfo?.name
      ?.toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  // ✅ Pagination applied to filtered list
  const totalPages = Math.ceil(filteredBusiness.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentBusiness = filteredBusiness.slice(startIndex, endIndex);

  const handleSearch = () => {
    setCurrentPage(1); // reset to first page after search
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Skeleton loader for business cards
  const BusinessCardSkeleton = () => (
    <div className="bg-white rounded-lg shadow-[0px_2px_12px_0px_#003d3924] p-6">
      <div className="flex flex-col lg:flex-row items-start lg:items-center gap-5">
        {/* Profile Image Skeleton */}
        <div className="flex-shrink-0 overflow-hidden rounded-lg w-full sm:w-auto">
          <Skeleton className="w-full sm:w-[200px] h-[200px] rounded-lg" />
        </div>

        {/* Content Skeleton */}
        <div className="flex-1 w-full">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="w-full">
              {/* Business Name Skeleton */}
              <Skeleton className="h-6 w-3/4 mb-2" />

              {/* Rating Skeleton */}
              <div className="flex items-center gap-1 my-3">
                <Skeleton className="h-4 w-4 rounded-full" />
                <Skeleton className="h-4 w-10 ml-1" />
              </div>

              {/* Services Skeleton */}
              <div className="flex flex-wrap items-center gap-2 mb-2">
                {[...Array(3)].map((_, index) => (
                  <Skeleton key={index} className="h-[48px] w-20 rounded-lg" />
                ))}
              </div>
            </div>

            {/* Action Button Skeleton */}
            <div className="mt-4 lg:mt-0 w-full sm:w-auto">
              <Skeleton className="w-full sm:w-[180px] h-[48px] rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Skeleton for search section
  const SearchSectionSkeleton = () => (
    <div className="mb-10">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Skeleton className="h-[48px] w-full rounded-md" />
        </div>
        <Skeleton className="w-32 h-[48px] rounded-md" />
      </div>
    </div>
  );

  return (
    <div className="mt-8">
      <div>
        {/* Search Section */}
        {isLoading ? (
          <SearchSectionSkeleton />
        ) : (
          <div className="mb-10">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  placeholder="Search for your business"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 border border-gray-200 bg-gray-50 h-[48px] focus:outline-none w-full rounded-md"
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                />
              </div>
              <Button
                onClick={handleSearch}
                className="bg-teal-600 hover:bg-teal-700 text-white px-8 h-[48px]"
              >
                Search
              </Button>
            </div>
          </div>
        )}

        {/* Instructors List */}
        <div className="space-y-6">
          {isLoading ? (
            // Show 3 skeleton cards while loading
            [...Array(3)].map((_, index) => (
              <BusinessCardSkeleton key={index} />
            ))
          ) : (
            <>
              {/* No Results */}
              {filteredBusiness.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500">
                    No instructors found matching your search.
                  </p>
                </div>
              )}

              {currentBusiness.map((business: Business) => (
                <div
                  key={business?._id}
                  className="bg-white rounded-lg shadow-[0px_2px_12px_0px_#003d3924] p-6"
                >
                  <div className="flex flex-col lg:flex-row items-start lg:items-center gap-5">
                    {/* Profile Image */}
                    <div className="flex-shrink-0 overflow-hidden rounded-lg w-full sm:w-auto">
                      <Link href={`/search-result/${business?._id}`}>
                        <Image
                          src={business?.businessInfo?.image?.[0]}
                          alt="business.png"
                          width={1000}
                          height={1000}
                          className="rounded-lg object-cover w-full sm:w-[200px] h-[200px] hover:scale-105 transition"
                        />
                      </Link>
                    </div>

                    {/* Content */}
                    <div className="flex-1 w-full">
                      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                        <div>
                          <Link href={`/search-result/${business?._id}`}>
                            <h3 className="text-lg font-semibold text-gray-900">
                              {business?.businessInfo?.name}
                            </h3>
                          </Link>

                          {/* Rating */}
                          <div className="flex items-center gap-1 my-3">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm font-medium">{"3.7"}</span>
                          </div>

                          {/* Services */}
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            {business?.instrumentInfo?.map((service, index) => (
                              <button
                                className="h-[48px] px-5 rounded-lg bg-[#F8F8F8]"
                                key={index}
                              >
                                {service?.serviceName}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Action Button */}
                        <div className="mt-4 lg:mt-0 w-full sm:w-auto">
                          {pathname === "/claim-my-business" && (
                            <button
                              onClick={() => {
                                if (status === "unauthenticated") {
                                  return setLoginModalOpen(true);
                                }
                                route.push(
                                  `/claim-my-business/${business?._id}`
                                );
                              }}
                              className="w-full sm:w-[180px] bg-[#e0f2f1] h-[48px] text-[#139a8e] px-5 rounded-lg"
                            >
                              Claim Business
                            </button>
                          )}

                          {pathname === "/review-a-business" && (
                            <button
                              onClick={() => {
                                if (status === "unauthenticated") {
                                  return setLoginModalOpen(true);
                                }
                                setIsOpen(true);
                                setBusinessID(business?._id);
                              }}
                              className="w-full sm:w-[180px] bg-[#e0f2f1] h-[48px] text-[#139a8e] px-5 rounded-lg"
                            >
                              Review Business
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        {/* Pagination */}
        {!isLoading && totalPages > 1 && (
          <div className="flex flex-wrap items-center justify-center gap-2 mt-8">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => handlePageChange(page)}
                className={
                  currentPage === page ? "bg-teal-600 hover:bg-teal-700" : ""
                }
              >
                {page}
              </Button>
            ))}
            {currentPage < totalPages && (
              <Button
                onClick={() => handlePageChange(currentPage + 1)}
                className="bg-teal-600 hover:bg-teal-700 text-white ml-2"
              >
                Next Page
              </Button>
            )}
          </div>
        )}

        {/* Add Business Section */}
        <AddBusinessSection />

        {isOpen && (
          <ReviewModal
            setIsModalOpen={setIsModalOpen}
            setIsOpen={setIsOpen}
            businessID={businessID}
          />
        )}

        {isModalOpen && (
          <ReviewSubmittedModal setIsModalOpen={setIsModalOpen} />
        )}

        {loginModalOpen && (
          <LoginModal
            isLoginModalOpen={loginModalOpen}
            setIsLoginModalOpen={() => setLoginModalOpen(false)}
          />
        )}
      </div>
    </div>
  );
};

export default ClaimReviewBusiness;
