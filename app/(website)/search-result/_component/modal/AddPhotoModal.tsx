"use client";

import { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ImageUp, Loader, X } from "lucide-react";
import Image from "next/image";
import { MdDelete } from "react-icons/md";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

interface AddPhotoModalProps {
  setIsAddPhotoOpen: (isOpen: boolean) => void;
  setPhotoSuccessModal: (value: boolean) => void;
  businessID: string | undefined;
  onPhotoUpload?: (imageFiles: File[]) => void;
}

const AddPhotoModal: React.FC<AddPhotoModalProps> = ({
  setIsAddPhotoOpen,
  businessID,
  onPhotoUpload,
  setPhotoSuccessModal,
}) => {
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const session = useSession();
  const token = session?.data?.user?.accessToken;
  const userId = session?.data?.user?.id;
  const queryClient = useQueryClient();

  const handleUploadImage = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles = Array.from(files);

    if (imageFiles.length + newFiles.length > 10) {
      toast.warning("You can upload a maximum of 10 photos at once");
      return;
    }

    const newPreviews = newFiles.map((file) => URL.createObjectURL(file));

    setImageFiles((prev) => [...prev, ...newFiles]);
    setImagePreviews((prev) => [...prev, ...newPreviews]);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveImage = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => {
      const newPreviews = [...prev];
      URL.revokeObjectURL(newPreviews[index]);
      return newPreviews.filter((_, i) => i !== index);
    });
  };

  const { mutateAsync: uploadPhotos, isPending } = useMutation({
    mutationKey: ["upload-photos"],
    mutationFn: async (formData: FormData) => {
      if (!token) {
        throw new Error("No authentication token found");
      }

      if (!businessID) {
        throw new Error("Business ID is required");
      }

      if (!userId) {
        throw new Error("User ID is required - please log in again");
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/picture/upload-image`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Server error response:", errorText);

        try {
          const errorData = JSON.parse(errorText);
          throw new Error(
            errorData.message || `Server error: ${response.status}`
          );
        } catch {
          throw new Error(
            `Server error: ${response.status} ${response.statusText}`
          );
        }
      }

      const data = await response.json();
      return data;
    },
    onSuccess: () => {
      setPhotoSuccessModal(true);
      queryClient.invalidateQueries({ queryKey: ["get-single-business"] });
      setIsAddPhotoOpen(false);

      if (onPhotoUpload) {
        onPhotoUpload(imageFiles);
      }
    },
    onError: (error: Error) => {
      console.error("Upload error details:", error);
      toast.error(error.message || "Failed to upload photos");
    },
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (imageFiles.length === 0) {
      toast.warning("Please select at least one photo to upload");
      return;
    }

    if (!businessID) {
      toast.error("Business ID is missing");
      return;
    }

    if (!userId) {
      toast.error("User authentication required - please log in again");
      return;
    }

    try {
      const formData = new FormData();

      // Create a data object and stringify it as your backend expects
      const dataObject = {
        business: businessID,
        user: userId,
      };

      // Add the stringified data to FormData as 'data' field
      formData.append("data", JSON.stringify(dataObject));

      // Add each image file
      imageFiles.forEach((file) => {
        formData.append("image", file); // This should match what multer expects
      });

      await uploadPhotos(formData);
    } catch (error) {
      console.error("Error in handleSubmit:", error);
    }
  };

  const handleClose = () => {
    imagePreviews.forEach((preview) => URL.revokeObjectURL(preview));
    setIsAddPhotoOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/25 flex items-center justify-center px-4">
      <div className="bg-white w-full max-w-md lg:max-w-[720px] max-h-[80vh] overflow-y-auto rounded-lg shadow-lg p-6 relative">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X className="h-5 w-5" />
        </button>

        <form onSubmit={handleSubmit} encType="multipart/form-data">
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-[28px] font-semibold">Add Photos</h1>
              <p className="text-lg text-gray-600">
                Upload photos for this business
              </p>
            </div>

            <div className="w-full h-[102px]">
              <input
                ref={fileInputRef}
                type="file"
                name="image"
                id="image_input"
                className="hidden"
                multiple
                accept="image/*"
                onChange={handleFileChange}
              />
              <div
                className="w-full h-full flex items-center justify-center flex-col gap-4 rounded-md cursor-pointer bg-[#F8F8F8] mt-4 text-teal-600 border border-dashed border-teal-600"
                onClick={handleUploadImage}
              >
                <ImageUp className="text-5xl" />
                <p className="text-center text-xl">Upload Photos</p>
              </div>
              <p className="text-sm text-gray-500 mt-2 text-center">
                Maximum 10 photos at once
              </p>
            </div>

            {imagePreviews.length > 0 && (
              <div>
                <h3 className="text-lg font-medium mb-2">Selected Photos:</h3>
                <div className="grid grid-cols-3 gap-4 lg:grid-cols-5">
                  {imagePreviews.map((image, index) => (
                    <div
                      key={index}
                      className="relative w-full aspect-square rounded-lg overflow-hidden"
                    >
                      <Image
                        src={image}
                        alt={`Preview ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                      <button
                        type="button"
                        className="absolute top-1 right-1 bg-black/70 text-white p-1 rounded-full hover:bg-black/90"
                        onClick={() => handleRemoveImage(index)}
                      >
                        <MdDelete className="text-lg" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3 lg:max-w-md mx-auto pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 border border-gray-300 py-2 rounded-md text-gray-700 hover:bg-gray-100"
                disabled={isPending}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending || imageFiles.length === 0 || !userId}
                className={`flex-1 bg-teal-600 text-white py-2 rounded-md hover:bg-teal-700 transition ${
                  (isPending || imageFiles.length === 0 || !userId) &&
                  "opacity-70 cursor-not-allowed"
                }`}
              >
                {isPending ? (
                  <span className="flex items-center justify-center">
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </span>
                ) : (
                  `Upload ${imageFiles.length} Photo${
                    imageFiles.length !== 1 ? "s" : ""
                  }`
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      {}
    </div>
  );
};

export default AddPhotoModal;
