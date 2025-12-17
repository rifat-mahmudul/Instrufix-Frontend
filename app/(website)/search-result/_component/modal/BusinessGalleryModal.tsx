// components/business/BusinessGalleryModal.tsx
"use client";

import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";

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
    imageLink?: string;
  } | null;
  createdAt: string;
}

interface BusinessGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  singleBusiness: {
    businessInfo: {
      name: string;
      image: string[];
    };
    images: string[];
    review: Review[];
  };
}

const BusinessGalleryModal = ({
  isOpen,
  onClose,
  singleBusiness,
}: BusinessGalleryModalProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Combine all images
  const allImages = [
    ...singleBusiness.businessInfo.image,
    ...(singleBusiness.images || []),
  ].filter((img) => img && img.trim() !== "");

  // Get approved reviews
  const approvedReviews = singleBusiness.review.filter(
    (review) => review.status === "approved"
  );

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex(
      (prev) => (prev - 1 + allImages.length) % allImages.length
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl w-full max-h-[80vh] overflow-auto p-4">
        {/* Image Section */}
        <div className="relative mb-4 mt-6">
          {allImages.length > 0 ? (
            <>
              <Image
                src={allImages[currentImageIndex]}
                alt={`${singleBusiness.businessInfo.name} - Image ${
                  currentImageIndex + 1
                }`}
                width={1000}
                height={1000}
                className="w-full h-[300px] rounded-lg"
              />

              {allImages.length > 1 && (
                <>
                  <Button
                    onClick={prevImage}
                    className="absolute left-2 top-1/2 h-8 w-8"
                    variant="secondary"
                    size="icon"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={nextImage}
                    className="absolute right-2 top-1/2 h-8 w-8"
                    variant="secondary"
                    size="icon"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>

                  <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
                    {currentImageIndex + 1} / {allImages.length}
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500">
              No image available
            </div>
          )}
        </div>

        {/* Reviews Section */}
        <div>
          <div className="space-y-4">
            {approvedReviews.map((review) => (
              <div
                key={review._id}
                className="border-b border-gray-200 pb-4 last:border-b-0"
              >
                <div className="flex items-center gap-3 mb-2">
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
                  <div>
                    <h3 className="font-semibold text-sm">
                      {review.user?.name || "Anonymous User"}
                    </h3>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-3 h-3 ${
                            star <= review.rating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="text-xs text-gray-500 mb-2">
                  {new Date(review.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}

            {approvedReviews.length === 0 && (
              <div className="text-center py-4 text-gray-500">
                No reviews yet.
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BusinessGalleryModal;
