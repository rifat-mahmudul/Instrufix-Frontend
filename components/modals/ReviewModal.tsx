"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { ImageUp, Loader, X } from "lucide-react";
import Image from "next/image";
import { MdDelete } from "react-icons/md";
import ReactStars from "react-stars";
import { addReview } from "@/lib/api";
import { ReviewType } from "@/lib/types";

interface ReviewModalProps {
  setIsOpen: (isOpen: boolean) => void;
  setIsModalOpen: (isModalOpen: boolean) => void;
  businessID: string | undefined;
}

const ReviewModal: React.FC<ReviewModalProps> = ({
  setIsOpen,
  businessID,
  setIsModalOpen,
}) => {
  const [rating, setRating] = useState<number>();
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const maxImages = 5;

  const ratingChanged = (newRating: number) => {
    setRating(newRating);
    setError(null); // Clear error when user interacts
  };

  const handleUploadImage = () => {
    if (imageFiles.length >= maxImages) {
      setError(`You can only upload a maximum of ${maxImages} images.`);
      return;
    }
    const input = document.getElementById("image_input");
    if (input) input.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles = Array.from(files);
    const totalImages = imageFiles.length + newFiles.length;

    if (totalImages > maxImages) {
      setError(`You can only upload a maximum of ${maxImages} images.`);
      return;
    }

    const newPreviews = newFiles.map((file) => URL.createObjectURL(file));
    setImageFiles((prev) => [...prev, ...newFiles]);
    setImagePreviews((prev) => [...prev, ...newPreviews]);
    setError(null); // Clear error when files are added
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (!files) return;

    const newFiles = Array.from(files).filter((file) =>
      file.type.startsWith("image/")
    );
    const totalImages = imageFiles.length + newFiles.length;

    if (totalImages > maxImages) {
      setError(`You can only upload a maximum of ${maxImages} images.`);
      return;
    }

    if (newFiles.length === 0) {
      setError("Please drop valid image files.");
      return;
    }

    const newPreviews = newFiles.map((file) => URL.createObjectURL(file));
    setImageFiles((prev) => [...prev, ...newFiles]);
    setImagePreviews((prev) => [...prev, ...newPreviews]);
    setError(null); // Clear error when files are added
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleRemoveImage = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    setError(null); // Clear error when images are removed
  };

  const { mutateAsync: addReviewData, isPending } = useMutation({
    mutationKey: ["add-review"],
    mutationFn: async (data: ReviewType) => addReview(data),
    onSuccess: () => {
      setIsModalOpen(true);
      setIsOpen(false);
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message ||
        "Something went wrong while submitting your review.";
      setError(errorMessage);
      // Don't close the modal on error
    },
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null); // Clear previous errors
    const form = e.currentTarget;
    const feedback = (form.feedback as HTMLTextAreaElement).value;

    // Validation
    if (!rating) {
      setError("Please provide a rating.");
      return;
    }

    if (!feedback || feedback.trim().length === 0) {
      setError("Please write your feedback.");
      return;
    }

    try {
      const reviewData = {
        rating,
        feedback,
        business: businessID,
        image: imageFiles,
      };

      await addReviewData(reviewData);
    } catch (error) {
      console.log("Error submitting review:", error);
      // Error handling is done in onError callback
    }
  };

  const closeError = () => {
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/25 flex items-center justify-center px-4">
      <div className="bg-white w-full max-w-md lg:max-w-[720px] overflow-y-auto rounded-lg shadow-lg p-6 relative">
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-[28px] font-semibold">Write a Review </h1>
              <p className="text-lg text-gray-600">
                Please leave your feedback for this music repair shop
              </p>
            </div>

            {/* review */}
            <div className="flex justify-center">
              <ReactStars
                onChange={ratingChanged}
                count={5}
                value={rating}
                size={50}
                color2={"#f4c320"}
              />
            </div>

            {/* write feedback */}
            <div>
              <label className="block text-lg font-medium text-gray-700">
                Your Feedback
              </label>
              <textarea
                placeholder="Please write your feedback"
                name="feedback"
                maxLength={200}
                className="mt-2 w-full rounded-md border border-gray-300 bg-gray-50 px-4 py-2 text-sm focus:outline-none h-[100px]"
              />
              <p className="text-sm text-gray-500 mt-1">
                {200 -
                  ((
                    document.querySelector(
                      'textarea[name="feedback"]'
                    ) as HTMLTextAreaElement
                  )?.value.length || 0)}{" "}
                characters remaining
              </p>
            </div>

            {/* upload image */}
            <div className="w-full h-[102px]">
              <input
                type="file"
                name="image"
                id="image_input"
                className="hidden"
                multiple
                accept="image/*"
                onChange={handleFileChange}
              />
              <div
                className={`w-full h-full flex items-center justify-center flex-col gap-4 rounded-md cursor-pointer bg-[#F8F8F8] mt-4 text-teal-600 border border-dashed border-teal-600 ${
                  isDragging ? "bg-teal-100" : ""
                }`}
                onClick={handleUploadImage}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                <ImageUp className="text-5xl" />
                <p className="text-center text-xl">
                  Upload Photos or Drag & Drop (Max {maxImages})
                </p>
              </div>
            </div>

            {/* Image previews */}
            <div className="grid grid-cols-3 gap-5 lg:grid-cols-5">
              {imagePreviews.map((image, index) => (
                <div
                  key={index}
                  className="relative w-[102px] h-[102px] rounded-lg overflow-hidden mt-4"
                >
                  <Image
                    src={image}
                    alt={`image-${index}`}
                    width={1000}
                    height={1000}
                    className="w-full h-full object-cover"
                  />
                  <MdDelete
                    className="text-[2rem] text-white bg-[#000000ad] p-1 absolute top-1 right-1 rounded cursor-pointer"
                    onClick={() => handleRemoveImage(index)}
                  />
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 lg:max-w-md mx-auto">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex-1 border border-gray-300 py-2 rounded-md text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`flex-1 bg-teal-600 text-white py-2 rounded-md hover:bg-teal-700 transition ${
                  isPending && "opacity-70"
                }`}
                disabled={isPending}
              >
                {isPending ? (
                  <span className="flex items-center justify-center">
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </span>
                ) : (
                  "Submit"
                )}
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md relative">
                <div className="flex items-center">
                  <span className="flex-1">{error}</span>
                  <button
                    type="button"
                    onClick={closeError}
                    className="text-red-500 hover:text-red-700 ml-2"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewModal;
