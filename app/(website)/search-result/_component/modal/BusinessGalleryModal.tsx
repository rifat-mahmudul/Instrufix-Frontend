// components/business/BusinessGalleryModal.tsx
"use client";

import { useState, useMemo } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";

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

interface Picture {
  _id: string;
  image: string[];
  user: {
    _id: string;
    name: string;
    email: string;
    imageLink?: string;
  };
  status: string;
  createdAt: string;
}

interface BusinessGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const BusinessGalleryModal = ({
  isOpen,
  onClose,
}: BusinessGalleryModalProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { id } = useParams();

  // Fetch reviews from API
  const { data: reviewsData, isLoading: reviewsLoading } = useQuery({
    queryKey: ["review", id],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/review/${id}`,
      );
      const response = await res.json();
      return response.data || [];
    },
    enabled: !!id,
  });

  // Fetch pictures from API
  const { data: picturesData, isLoading: picturesLoading } = useQuery({
    queryKey: ["pictures", id],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/picture/get-all-pictures-by-business/${id}`,
      );
      const response = await res.json();
      return response.data || [];
    },
    enabled: !!id,
  });

  // Combine all images from both reviews and pictures
  const galleryItems = useMemo(() => {
    const items: Array<{
      imageUrl: string;
      user: {
        _id: string;
        name: string;
        email: string;
        imageLink?: string;
      } | null;
      rating?: number;
      createdAt: string;
      reviewId?: string;
      feedback?: string;
      source: "review" | "picture";
    }> = [];

    // Process reviews
    if (reviewsData && Array.isArray(reviewsData)) {
      reviewsData.forEach((review: Review) => {
        if (
          review.image &&
          review.image.length > 0 &&
          review.status === "approved"
        ) {
          review.image.forEach((img) => {
            if (img && img.trim() !== "") {
              items.push({
                imageUrl: img,
                user: review.user,
                rating: review.rating,
                createdAt: review.createdAt,
                reviewId: review._id,
                feedback: review.feedback,
                source: "review",
              });
            }
          });
        }
      });
    }

    // Process pictures
    if (picturesData && Array.isArray(picturesData)) {
      picturesData.forEach((picture: Picture) => {
        if (
          picture.image &&
          picture.image.length > 0 &&
          picture.status === "approved"
        ) {
          picture.image.forEach((img) => {
            if (img && img.trim() !== "") {
              items.push({
                imageUrl: img,
                user: picture.user,
                createdAt: picture.createdAt,
                source: "picture",
              });
            }
          });
        }
      });
    }

    // Sort by createdAt (newest first)
    return items.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [reviewsData, picturesData]);

  console.log("galleryItems: ", galleryItems);

  const nextItem = () => {
    if (galleryItems.length > 0) {
      setCurrentIndex((prev) => (prev + 1) % galleryItems.length);
    }
  };

  const prevItem = () => {
    if (galleryItems.length > 0) {
      setCurrentIndex(
        (prev) => (prev - 1 + galleryItems.length) % galleryItems.length,
      );
    }
  };

  const currentItem = galleryItems[currentIndex];

  if (reviewsLoading || picturesLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-xl w-full max-h-[80vh] overflow-auto p-4">
          <div className="flex justify-center items-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl w-full max-h-[80vh] overflow-auto p-4">
        {/* Image Section */}
        <div className="relative mb-4 mt-6">
          {galleryItems.length > 0 ? (
            <>
              <Image
                src={currentItem.imageUrl}
                alt={`Gallery image ${currentIndex + 1}`}
                width={1000}
                height={1000}
                className="w-full h-[300px] object-cover rounded-lg"
                priority
              />

              {galleryItems.length > 1 && (
                <>
                  <Button
                    onClick={prevItem}
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 h-8 w-8"
                    variant="secondary"
                    size="icon"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={nextItem}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8"
                    variant="secondary"
                    size="icon"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>

                  <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
                    {currentIndex + 1} / {galleryItems.length}
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500">
              No images available
            </div>
          )}
        </div>

        {/* User Information Section - Only show for items that have user data */}
        {currentItem && currentItem.user && (
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center overflow-hidden">
                {currentItem.user.imageLink ? (
                  <Image
                    src={currentItem.user.imageLink}
                    alt={currentItem.user.name}
                    width={48}
                    height={48}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-teal-800 font-bold text-lg">
                    {currentItem.user.name?.[0]?.toUpperCase() || "U"}
                  </span>
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-sm">
                  {currentItem.user.name || "Anonymous User"}
                </h3>
                <p className="text-xs text-gray-500">
                  {new Date(currentItem?.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Rating Stars - Only show for review items */}
            {currentItem.source === "review" && currentItem.rating && (
              <div className="flex items-center gap-1 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${
                      star <= currentItem.rating!
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
            )}

            {/* Feedback - Only show for review items */}
            {currentItem.source === "review" && currentItem.feedback && (
              <p className="text-sm text-gray-700 mb-2">
                {currentItem.feedback}
              </p>
            )}
          </div>
        )}

        {/* No items message */}
        {galleryItems.length === 0 && (
          <div className="text-center py-4 text-gray-500">
            No images available for this business.
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default BusinessGalleryModal;
