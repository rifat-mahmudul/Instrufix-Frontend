/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Star,
  ChevronDown,
  ChevronUp,
  SaveIcon,
  Share2Icon,
  LocateIcon,
  MessageCircleCodeIcon,
  Globe,
  Phone,
  Loader2,
  Copy,
  X,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Search,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import ReviewModal from "@/components/modals/ReviewModal";
import ReviewSubmittedModal from "@/components/modals/ReviewSubmittedModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSession } from "next-auth/react";
import AddPhotoModal from "./modal/AddPhotoModal";
import "leaflet/dist/leaflet.css";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import ReactDOMServer from "react-dom/server";
import { DivIcon } from "leaflet";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import LoginModal from "@/components/business/modal/login-modal";
import ClaimModal from "./modal/claim-modal";
import AddPhotoSuccessModal from "@/components/modals/add-photo-modal";

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
}: {
  images: string[];
  businessName: string;
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Remove duplicates and filter out empty/null images
  const uniqueImages = useMemo(() => {
    return Array.from(
      new Set(images.filter((img) => img && img.trim() !== ""))
    );
  }, [images]);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % uniqueImages.length);
  };

  const prevImage = () => {
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
      <div className="relative rounded-lg overflow-hidden h-[172px] w-[172px]">
        <Image
          src={uniqueImages[currentImageIndex]}
          alt={`${businessName} - Image ${currentImageIndex + 1}`}
          width={172}
          height={172}
          className="rounded-lg object-cover h-full w-full"
          onError={(e) => {
            // Fallback if image fails to load
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
              onClick={() => goToImage(index)}
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
              <span className="text-teal-800 font-semibold">
                {review.user?.name?.[0]?.toUpperCase() || "U"}
              </span>
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
            <span className="text-gray-500">
              ({singleBusiness.review.length} Reviews ){" "}
              <span className="text-xs">by google</span>
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
            Write A Review
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
          <div className="pt-8 space-y-8 border-b border-gray-200 pb-10">
            <h2 className="text-xl font-semibold mb-4">Service Type</h2>

            {/* Repair Services */}
            {singleBusiness.services.length > 0 && (
              <div className="shadow-[0px_2px_12px_0px_#003D3914] p-4 rounded-lg">
                <button
                  onClick={() => toggleSection("repair")}
                  className="w-full flex items-center justify-between text-left  mb-4"
                >
                  <h3 className="font-medium text-2xl">Repair</h3>
                  {expandedSections.repair ? (
                    <ChevronUp className="w-5 h-5" />
                  ) : (
                    <ChevronDown className="w-5 h-5" />
                  )}
                </button>

                {expandedSections.repair && (
                  <div className="space-y-4">
                    {Object.entries(groupedServices).map(
                      ([family, services]: [string, any]) => (
                        <div key={family}>
                          <h4 className="font-medium text-primary text-xl">
                            {family}
                          </h4>
                          <div className="space-y-2 grid lg:grid-cols-2 gap-x-10">
                            {(
                              Object.entries(
                                services.reduce(
                                  (
                                    acc: Record<string, any[]>,
                                    service: any
                                  ) => {
                                    const group =
                                      service.selectedInstrumentsGroup;
                                    if (!acc[group]) {
                                      acc[group] = [];
                                    }
                                    acc[group].push(service);
                                    return acc;
                                  },
                                  {} as Record<string, any[]>
                                )
                              ) as [string, any[]][]
                            ).map(
                              ([groupName, groupServices]: [string, any[]]) => (
                                <div key={groupName} className="mb-3">
                                  {/* Group Name */}
                                  <div className="font-medium text-gray-700 mt-2">
                                    {groupName}
                                  </div>

                                  {/* Group এর ভিতরের services */}
                                  {groupServices.map(
                                    (service: any, index: number) => (
                                      <div
                                        key={index}
                                        className="flex justify-between items-center py-1 text-sm"
                                      >
                                        <div>
                                          <div className="text-gray-500">
                                            {service.newInstrumentName}
                                          </div>
                                        </div>
                                        <div className="font-medium text-xs text-gray-500">
                                          {formatPrice(service)}
                                        </div>
                                      </div>
                                    )
                                  )}
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Music Lessons */}
            {singleBusiness.musicLessons.length > 0 && (
              <div className="shadow-[0px_2px_12px_0px_#003D3914] p-4 rounded-lg">
                <button
                  onClick={() => toggleSection("lessons")}
                  className="w-full flex items-center justify-between text-left"
                >
                  <h3 className="font-medium text-lg">Lessons</h3>
                  {expandedSections.lessons ? (
                    <ChevronUp className="w-5 h-5" />
                  ) : (
                    <ChevronDown className="w-5 h-5" />
                  )}
                </button>

                {expandedSections.lessons && (
                  <div className="py-4">
                    <p className="text-sm text-gray-600 mb-4">
                      These are hourly rates for lessons, contact the business
                      for more details
                    </p>
                    <div className="space-y-4">
                      <h4 className="font-medium text-teal-600">Strings</h4>
                      <div className="space-y-2">
                        {singleBusiness.musicLessons.map((lesson, index) => (
                          <div
                            key={index}
                            className="flex justify-between items-center py-1"
                          >
                            <div className="font-medium">
                              {lesson.selectedInstrumentsGroupMusic}
                            </div>
                            <div className="font-semibold">
                              {formatPrice(lesson)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* other services */}
            <div className="shadow-[0px_2px_12px_0px_#003D3914] p-4 rounded-lg">
              <button
                onClick={() => toggleSection("otherService")}
                className="w-full flex items-center justify-between text-left"
              >
                <h3 className="font-medium text-lg">Other Services</h3>
                {expandedSections.otherService ? (
                  <ChevronUp className="w-5 h-5" />
                ) : (
                  <ChevronDown className="w-5 h-5" />
                )}
              </button>

              {expandedSections.otherService && (
                <div className="py-4">
                  <h1>
                    The business provides{" "}
                    {singleBusiness?.buyInstruments && (
                      <span className="font-semibold">buying,</span>
                    )}{" "}
                    {singleBusiness?.sellInstruments && (
                      <span className="font-semibold">selling,</span>
                    )}{" "}
                    {singleBusiness?.offerMusicLessons && (
                      <span className="font-semibold">trading</span>
                    )}{" "}
                    {singleBusiness?.rentInstruments && (
                      <span>
                        & <span className="font-semibold">rental </span>
                      </span>
                    )}
                    services. Please{" "}
                    <Link href={"/"}>
                      <span className="text-teal-600">
                        contact the business
                      </span>
                    </Link>{" "}
                    to get a personalized quote.
                  </h1>
                </div>
              )}
            </div>
          </div>

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
          <div className="border-b border-gray-300 pb-8">
            <h3 className="text-lg font-semibold mb-4">Contact Info</h3>
            <div className="space-y-5">
              {singleBusiness.isClaimed && (
                <button
                  onClick={handleMessage}
                  className=" flex items-center gap-2"
                >
                  <span className="text-[#139a8e]">
                    <MessageCircleCodeIcon />
                  </span>
                  <span className="text-gray-600 hover:text-[#139a8e]">
                    Message Business
                  </span>
                </button>
              )}
              <div>
                <Link
                  href={singleBusiness.businessInfo.website}
                  className="flex items-center gap-2 font-medium"
                >
                  <span>
                    <Globe className="text-[#139a8e] " />
                  </span>
                  <span className="text-gray-600 hover:text-[#139a8e]">
                    {singleBusiness.businessInfo.website}
                  </span>
                </Link>
              </div>

              <div>
                <Link href={""}>
                  <div className="flex items-center gap-2 font-medium">
                    <span>
                      <Phone className="text-[#139a8e] " />
                    </span>
                    <span className="text-gray-600 hover:text-[#139a8e]">
                      {singleBusiness.businessInfo.phone}
                    </span>
                  </div>
                </Link>
              </div>
            </div>
          </div>

          {/* Working Hours */}
          <div className="border-b border-gray-300 pb-6">
            <h3 className="text-lg font-semibold mb-4">Working Hours</h3>
            <div className="space-y-2">
              {singleBusiness.businessHours.map((hour, index) => (
                <div key={index} className="flex flex-col">
                  <span className="font-medium text-[#139a8e]">
                    {hour.day.slice(0, 3)}
                  </span>
                  <span
                    className={`${
                      hour.enabled ? "text-gray-700" : "text-red-500"
                    } font-medium`}
                  >
                    {hour.enabled
                      ? `${formatTime(
                          hour.startTime,
                          hour.startMeridiem
                        )} - ${formatTime(hour.endTime, hour.endMeridiem)}`
                      : "Closed"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h1 className="text-xl font-bold mb-2">Location</h1>

            <h1 className="text-primary font-medium mb-5">
              {singleBusiness?.businessInfo?.address}
            </h1>

            {/* Location */}
            <div className="h-[300px] w-[300px]">
              <style jsx global>{`
                .leaflet-control-container {
                  display: none !important;
                }
              `}</style>

              {coords && (
                <MapContainer
                  center={[coords.lat, coords.lng]}
                  zoom={15} // adjust zoom here
                  scrollWheelZoom={true}
                  className="h-full w-full rounded-xl shadow-lg"
                >
                  <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                    attribution=""
                  />
                  <Marker
                    position={[coords.lat, coords.lng]}
                    icon={customMarker}
                  >
                    <Popup>{singleBusiness.businessInfo.name}</Popup>
                  </Marker>

                  {/* Optional: reset view */}
                  <SetMapView coords={coords} zoom={15} />
                </MapContainer>
              )}
            </div>

            <div className="mt-8">
              <Button
                onClick={() => {
                  // Encode the business address for Google Maps
                  const encodedAddress = encodeURIComponent(
                    singleBusiness.businessInfo.address
                  );
                  const googleMapsUrl = `https://www.google.com/maps/dir//${encodedAddress}`;

                  // Open Google Maps in a new tab
                  window.open(googleMapsUrl, "_blank", "noopener,noreferrer");
                }}
                className="w-full bg-primary/20 hover:bg-primary/15 text-primary"
              >
                Get Directions
              </Button>
            </div>
          </div>
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
