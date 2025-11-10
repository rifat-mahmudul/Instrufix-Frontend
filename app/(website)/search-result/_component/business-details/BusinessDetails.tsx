/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Star,
  SaveIcon,
  Share2Icon,
  LocateIcon,
  Loader2,
  Copy,
  X,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Search,
} from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import ReviewModal from "@/components/modals/ReviewModal";
import ReviewSubmittedModal from "@/components/modals/ReviewSubmittedModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSession } from "next-auth/react";
import AddPhotoModal from "../modal/AddPhotoModal";
import { useMap } from "react-leaflet";
import ReactDOMServer from "react-dom/server";
import { DivIcon } from "leaflet";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import LoginModal from "@/components/business/modal/login-modal";
import ClaimModal from "../modal/claim-modal";
import AddPhotoSuccessModal from "@/components/modals/add-photo-modal";
import BusinessGalleryModal from "../modal/BusinessGalleryModal";
import ServiceType from "./service-type";
import WorkingHours from "./working-hours";
import ContactInfo from "./contact-info";
import Location from "./location";

interface Review {
  _id: string;
  rating: number;
  feedback: string;
  image: string[];
  status: string;
  user: {
    _id: string;
    name: string;
    email: string;
    imageLink: string;
  } | null;
  business: string;
  googlePlaceId: string;
  createdAt: string;
  updatedAt: string;
  report: {
    isReported: boolean;
    reportMessage: string;
  };
}

interface BusinessProfileProps {
  singleBusiness: {
    _id: string;
    businessInfo: {
      name: string;
      image: string[];
      address: string;
      phone: string;
      email: string;
      website: string;
      description: string;
    };
    user: {
      _id: string;
      name: string;
      email: string;
    };
    services: Array<{
      newInstrumentName: string;
      pricingType: string;
      price: string;
      minPrice: string;
      maxPrice: string;
      selectedInstrumentsGroup: string;
      instrumentFamily: string;
    }>;
    musicLessons: Array<{
      newInstrumentName: string;
      pricingType: string;
      price: string;
      minPrice: string;
      maxPrice: string;
      selectedInstrumentsGroupMusic: string;
    }>;
    businessHours: Array<{
      day: string;
      startTime: string;
      startMeridiem: string;
      endTime: string;
      endMeridiem: string;
      enabled: boolean;
    }>;
    buyInstruments: boolean;
    sellInstruments: boolean;
    offerMusicLessons: boolean;
    rentInstruments: boolean;
    review: Review[];
    isVerified: boolean;
    isClaimed: boolean;
    status: string;
    images: string[];
  };
}

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  businessName: string;
  businessId: string;
}

const ShareModal = ({
  isOpen,
  onClose,
  businessName,
  businessId,
}: ShareModalProps) => {
  const [copied, setCopied] = useState(false);

  const shareLink = `${window.location.origin}/search-result/${businessId}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    toast.success("Link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Share {businessName}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="text-gray-600 mb-4">
          Copy the link below to share this business with others
        </p>

        <div className="flex gap-2">
          <Input value={shareLink} readOnly className="flex-1" />
          <Button
            onClick={handleCopy}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Copy className="h-4 w-4" />
            {copied ? "Copied!" : "Copy"}
          </Button>
        </div>

        <div className="mt-6 flex justify-end">
          <Button onClick={onClose} className="bg-[#139a8e] hover:bg-[#0d7a70]">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

type SectionKey = "repair" | "lessons" | "otherService";

// Updated Image Slider Component
const ImageSlider = ({
  images,
  businessName,
  onImageClick,
}: {
  images: string[];
  businessName: string;
  onImageClick: () => void;
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Remove duplicates and filter out empty/null images
  const uniqueImages = useMemo(() => {
    return Array.from(
      new Set(images.filter((img) => img && img.trim() !== ""))
    );
  }, [images]);

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation(); // Event bubbling বন্ধ করতে
    setCurrentImageIndex((prev) => (prev + 1) % uniqueImages.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation(); // Event bubbling বন্ধ করতে
    setCurrentImageIndex(
      (prev) => (prev - 1 + uniqueImages.length) % uniqueImages.length
    );
  };

  const goToImage = (index: number) => {
    setCurrentImageIndex(index);
  };

  if (!uniqueImages || uniqueImages.length === 0) {
    return (
      <div className="flex-shrink-0">
        <div className="rounded-lg bg-gray-200 h-[172px] w-[172px] flex items-center justify-center">
          <span className="text-gray-500">No Image</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-shrink-0 relative group">
      <div
        className="relative rounded-lg overflow-hidden h-[172px] w-[172px] cursor-pointer"
        onClick={onImageClick} // শুধুমাত্র parent div-এ click handler
      >
        <Image
          src={uniqueImages[currentImageIndex]}
          alt={`${businessName} - Image ${currentImageIndex + 1}`}
          width={172}
          height={172}
          className="rounded-lg object-cover h-full w-full"
          // Image element থেকে onClick remove করা হয়েছে
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = "/images/placeholder-business.jpg";
          }}
        />

        {/* Navigation Arrows - Show only if multiple images */}
        {uniqueImages.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-1 top-1/2 transform -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-1 rounded-full transition-all duration-200 opacity-0 group-hover:opacity-100 z-10"
            >
              <ChevronLeft className="h-3 w-3" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-1 top-1/2 transform -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-1 rounded-full transition-all duration-200 opacity-0 group-hover:opacity-100 z-10"
            >
              <ChevronRight className="h-3 w-3" />
            </button>
          </>
        )}

        {/* Image Counter */}
        {uniqueImages.length > 1 && (
          <div className="absolute top-1 right-1 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded-full z-10">
            {currentImageIndex + 1} / {uniqueImages.length}
          </div>
        )}
      </div>

      {/* Dot Indicators */}
      {uniqueImages.length > 1 && (
        <div className="flex justify-center mt-2 space-x-1">
          {uniqueImages.map((_, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.stopPropagation(); // Event bubbling বন্ধ করতে
                goToImage(index);
              }}
              className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${
                index === currentImageIndex
                  ? "bg-[#139a8e]"
                  : "bg-gray-300 hover:bg-gray-400"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const BusinessDetails: React.FC<BusinessProfileProps> = ({
  singleBusiness,
}) => {
  const [expandedSections, setExpandedSections] = useState<{
    repair: boolean;
    lessons: boolean;
    otherService: boolean;
  }>({
    repair: true,
    lessons: false,
    otherService: false,
  });

  const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isAddPhoto, setIsAddPhotoOpen] = useState(false);
  const [photoSuccessModal, setPhotoSuccessModal] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("mostRecent");
  const [filteredReviews, setFilteredReviews] = useState<Review[]>([]);

  const session = useSession();
  const token = session?.data?.user?.accessToken;
  const userId = session?.data?.user?.id;

  const role = session?.data?.user?.userType;
  const status = session?.status;
  const router = useRouter();

  const address = singleBusiness.businessInfo.address;

  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    null
  );

  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);

  useEffect(() => {
    const fetchLocation = async () => {
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
          address
        )}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
      );
      const data = await res.json();

      if (data.status === "OK") {
        setCoords(data.results[0].geometry.location);
      } else {
        console.error("Geocode error:", data.status);
      }
    };

    fetchLocation();
  }, [address]);

  // Calculate star distribution
  const calculateStarDistribution = () => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

    singleBusiness.review.forEach((review) => {
      if (review.rating >= 1 && review.rating <= 5) {
        distribution[review.rating as keyof typeof distribution]++;
      }
    });

    return distribution;
  };

  const starDistribution = calculateStarDistribution();

  // Filter and sort reviews
  useEffect(() => {
    let reviews = singleBusiness.review.filter(
      (review) =>
        review.status === "approved" &&
        review.feedback.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Apply sorting
    switch (sortBy) {
      case "mostRecent":
        reviews = reviews.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
      case "highestRated":
        reviews = reviews.sort((a, b) => b.rating - a.rating);
        break;
      case "lowestRated":
        reviews = reviews.sort((a, b) => a.rating - b.rating);
        break;
      default:
        break;
    }

    setFilteredReviews(reviews);
  }, [singleBusiness.review, searchQuery, sortBy]);

  // Custom icon
  const customMarker = new DivIcon({
    html: ReactDOMServer.renderToString(
      <MapPin fill="#139a8e" className="text-white w-8 h-8" />
    ),
    className: "", // remove default styles
    iconSize: [24, 24],
    iconAnchor: [12, 24], // bottom center
  });

  // Optional: auto-fit map view to coordinates
  const SetMapView = ({
    coords,
    zoom,
  }: {
    coords: { lat: number; lng: number };
    zoom: number;
  }) => {
    const map = useMap();
    if (coords) {
      map.setView([coords.lat, coords.lng], zoom);
    }
    return null;
  };

  const toggleSection = (section: SectionKey) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const formatPrice = (service: any) => {
    if (service.pricingType === "exact") {
      return `$${service.price}`;
    } else if (service.pricingType === "range") {
      return `$${service.minPrice} - $${service.maxPrice}`;
    } else if (service.pricingType === "hourly") {
      return `$${service.price}/hr`;
    }
    return "Contact for pricing";
  };

  const formatTime = (time: string, meridiem: string) => {
    return `${time} ${meridiem}`;
  };

  const handleSaveBusiness = async () => {
    if (status === "unauthenticated") {
      return setIsLoginModalOpen(true);
    }

    setIsSaving(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/saved-business/create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            savedBusiness: singleBusiness._id,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to save business");
      }

      toast.success(data.message || "Business saved successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to save business");
      console.error("Error saving business:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // Calculate average rating
  const calculateAverageRating = () => {
    if (singleBusiness.review.length === 0) return "0.0";

    const totalRating = singleBusiness.review.reduce((sum, review) => {
      return sum + review.rating;
    }, 0);

    return (totalRating / singleBusiness.review.length).toFixed(1);
  };

  const averageRating = calculateAverageRating();

  // Group services by instrument family
  const groupedServices = singleBusiness.services.reduce(
    (acc: any, service) => {
      const family = service.instrumentFamily;
      if (!acc[family]) {
        acc[family] = [];
      }
      acc[family].push(service);
      return acc;
    },
    {}
  );

  // ReviewItem component
  const ReviewItem = ({ review }: { review: Review }) => {
    const [expanded, setExpanded] = useState(false);
    const needsTruncation = review.feedback.length > 150;

    return (
      <div className="border shadow-md rounded-lg p-4 border-gray-200 py-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
              {review?.user?.imageLink ? (
                <Image
                  src={review?.user?.imageLink || ""}
                  alt="img.png"
                  width={1000}
                  height={1000}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <span className="text-teal-800 font-semibold text-xs">
                  {review.user?.name?.[0]?.toUpperCase() || "U"}
                </span>
              )}
            </div>
          </div>

          <div className="flex-1">
            <div className="mb-2">
              <h1 className="text-sm font-medium text-gray-900 mb-1">
                {review.user?.name || "Anonymous User"}
              </h1>
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${
                      star <= review.rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="text-sm text-gray-500 mb-2">
              {new Date(review.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>

            <p className="text-gray-700">
              {needsTruncation && !expanded
                ? `${review.feedback.substring(0, 150)}...`
                : review.feedback}
              {needsTruncation && (
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="text-teal-600 hover:text-teal-800 ml-1 font-medium"
                >
                  {expanded ? "Show less" : "Read more"}
                </button>
              )}
            </p>

            {review.image.length > 0 && (
              <div className="flex gap-2 mt-3">
                {review.image.map((img, index) => (
                  <div key={index} className="w-20 h-20 relative">
                    <Image
                      src={img}
                      alt={`Review image ${index + 1}`}
                      fill
                      className="object-cover rounded-md"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const { mutateAsync: chatCreation } = useMutation({
    mutationKey: ["create-chat"],
    mutationFn: async (data: { userId: string; bussinessId: string }) => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/chat/create`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(data),
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to create chat");
        }

        const result = await response.json();
        console.log("✅ Server response:", result);
        return result;
      } catch (error) {
        console.error("❌ Error creating chat:", error);
        throw error;
      }
    },
  });

  const handleReview = () => {
    if (status === "unauthenticated") {
      return setIsLoginModalOpen(true);
    }

    setIsOpen(true);
  };

  const handleAddPhoto = () => {
    if (status === "unauthenticated") {
      return setIsLoginModalOpen(true);
    }

    setIsAddPhotoOpen(true);
  };

  const handleMessage = async () => {
    if (!userId) {
      toast.error("You must be logged in to send a message.");
      return;
    }

    const data = {
      userId: userId,
      bussinessId: singleBusiness._id,
    };

    try {
      await chatCreation(data);
    } catch (error) {
      console.log(error);
    } finally {
      if (role === "user") {
        router.push("/customer-dashboard/messages");
      }
      if (role === "businessMan") {
        router.push("/business-dashboard/messages");
      }
      if (role === "admin") {
        router.push("/admin-dashboard/messages");
      }
    }
  };

  // Combine all images from businessInfo.image and images array
  const allBusinessImages = [
    ...singleBusiness.businessInfo.image,
    ...(singleBusiness.images || []),
  ];

  return (
    <div>
      {/* Business Header */}
      <div className="flex items-center gap-6 border-b border-gray-200 pb-8">
        {/* Business Image Slider */}
        <ImageSlider
          images={allBusinessImages}
          businessName={singleBusiness.businessInfo.name}
          onImageClick={() => setIsGalleryModalOpen(true)}
        />

        <BusinessGalleryModal
          isOpen={isGalleryModalOpen}
          onClose={() => setIsGalleryModalOpen(false)}
          singleBusiness={singleBusiness}
        />

        {/* Business Info */}
        <div className="flex-1">
          <div className="flex items-center gap-5">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {singleBusiness.businessInfo.name}
            </h1>

            <h1 className="text-teal-500 font-medium">
              {singleBusiness.isClaimed ? (
                <button>Claimed</button>
              ) : (
                <button onClick={() => setIsClaimModalOpen(true)}>
                  Unclaimed
                </button>
              )}
            </h1>
          </div>
          <div className="flex items-center gap-2 mb-2">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="text-gray-600 font-medium">{averageRating}</span>
            <span className="text-gray-500 flex items-center gap-2">
              ( {singleBusiness.review.length} Reviews
              <span>
                <Image
                  src="/images/google.jpeg"
                  alt="google"
                  width={1000}
                  height={1000}
                  className="h-4 w-4"
                />
              </span>
              ){" "}
            </span>
          </div>
          <div className="text-gray-600 mb-1">
            {singleBusiness.businessInfo.address}
          </div>
          <div className="text-gray-600">
            {singleBusiness.businessHours[0].startTime} AM -{" "}
            {singleBusiness.businessHours[0].endTime} PM
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-5">
          <button
            onClick={handleReview}
            className="bg-[#e0f2f1] hover:bg-[#139a8e] flex items-center gap-2 px-5 py-3 rounded-lg text-[#139a8e] hover:text-white font-semibold"
          >
            <Star className="w-4 h-4 mr-1" />
            Write a Review
          </button>
          <button
            onClick={handleAddPhoto}
            className="bg-[#e0f2f1] hover:bg-[#139a8e] flex items-center gap-2 px-5 py-3 rounded-lg text-[#139a8e] hover:text-white font-semibold"
          >
            <LocateIcon className="w-4 h-4 mr-1" />
            Add Photo
          </button>
          <button
            onClick={() => setIsShareModalOpen(true)}
            className="bg-[#e0f2f1] hover:bg-[#139a8e] flex items-center gap-2 px-5 py-3 rounded-lg text-[#139a8e] hover:text-white font-semibold"
          >
            <Share2Icon className="w-4 h-4 mr-1" />
            Share
          </button>
          <button
            onClick={handleSaveBusiness}
            disabled={isSaving}
            className="bg-[#e0f2f1] hover:bg-[#139a8e] flex items-center gap-2 px-5 py-3 rounded-lg text-[#139a8e] hover:text-white font-semibold disabled:opacity-50"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 mr-1 animate-spin" />
            ) : (
              <SaveIcon className="w-4 h-4 mr-1" />
            )}
            Save
          </button>
        </div>
      </div>

      {isOpen && (
        <ReviewModal
          businessID={singleBusiness?._id}
          setIsModalOpen={setIsModalOpen}
          setIsOpen={setIsOpen}
        />
      )}

      {isModalOpen && <ReviewSubmittedModal setIsModalOpen={setIsModalOpen} />}

      {isAddPhoto && (
        <AddPhotoModal
          setIsAddPhotoOpen={setIsAddPhotoOpen}
          businessID={singleBusiness?._id}
          setPhotoSuccessModal={setPhotoSuccessModal}
        />
      )}

      {photoSuccessModal && (
        <AddPhotoSuccessModal setIsModalOpen={setPhotoSuccessModal} />
      )}

      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        businessName={singleBusiness.businessInfo.name}
        businessId={singleBusiness._id}
      />

      <div className="flex pt-8 pb-16">
        {/* Left Column */}
        <div className="flex-1 border-r border-gray-200 pr-8">
          {/* About this Business */}
          <div className="border-b border-gray-200 pb-8">
            <h2 className="text-xl font-semibold mb-4">About this Business</h2>
            <p className="text-gray-700 leading-relaxed">
              {singleBusiness.businessInfo.description}
            </p>
          </div>

          {/* Service Type */}
          <ServiceType
            expandedSections={expandedSections}
            formatPrice={formatPrice}
            groupedServices={groupedServices}
            singleBusiness={singleBusiness}
            toggleSection={toggleSection}
          />

          {/* Rating & Reviews */}
          <div className="pt-8">
            <h2 className="text-xl font-semibold mb-4">Rating & Reviews</h2>

            {/* Overall Rating */}
            <div className="flex items-center gap-2 mb-6">
              <div className="text-4xl font-bold">
                <Image
                  src={"/images/Star.png"}
                  alt="star.png"
                  width={1000}
                  height={1000}
                  className="w-12 h-12"
                />
              </div>
              <div>
                <div>
                  <h1 className="font-bold text-2xl">{averageRating}</h1>
                </div>
                <div className="text-sm text-gray-600">
                  {singleBusiness.review.length} Reviews
                </div>
              </div>
            </div>

            {/* Star Distribution - Following Figma Design */}
            <div className="mb-8">
              {[5, 4, 3, 2, 1].map((star) => {
                const count =
                  starDistribution[star as keyof typeof starDistribution];
                const percentage =
                  singleBusiness.review.length > 0
                    ? (count / singleBusiness.review.length) * 100
                    : 0;

                return (
                  <div key={star} className="flex items-center gap-5 mb-2">
                    <div className="text-sm font-medium">{star} Star</div>
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 w-12">
                      ({count})
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Search and Sort Controls */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              {/* Search Input */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search reviews"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full"
                />
              </div>

              {/* Sort Dropdown */}
              <div className="mb-1">
                <div className="text-sm text-gray-600 whitespace-nowrap">
                  Sort by
                </div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="text-sm focus:outline-none bg-transparent border-none "
                >
                  <option value="mostRecent">Most Recent</option>
                  <option value="highestRated">Highest Rated</option>
                  <option value="lowestRated">Lowest Rated</option>
                </select>
              </div>
            </div>

            {/* Reviews List */}
            {filteredReviews.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {searchQuery
                  ? "No reviews match your search."
                  : "No reviews yet. Be the first to leave a review!"}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredReviews.map((review) => (
                  <ReviewItem key={review._id} review={review} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-8  pl-8">
          {/* Contact Info */}
          <ContactInfo
            singleBusiness={singleBusiness}
            handleMessage={handleMessage}
          />

          {/* Working Hours */}
          <WorkingHours
            singleBusiness={singleBusiness}
            formatTime={formatTime}
          />

          {/* location */}
          <Location
            singleBusiness={singleBusiness}
            SetMapView={SetMapView}
            coords={coords}
            customMarker={customMarker}
          />
        </div>

        {isLoginModalOpen && (
          <LoginModal
            isLoginModalOpen={isLoginModalOpen}
            setIsLoginModalOpen={setIsLoginModalOpen}
          />
        )}

        {isClaimModalOpen && (
          <ClaimModal
            isClaimModalOpen={isClaimModalOpen}
            setIsClaimModalOpen={setIsClaimModalOpen}
          />
        )}
      </div>
    </div>
  );
};

export default BusinessDetails;
