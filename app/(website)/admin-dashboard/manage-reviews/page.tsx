"use client";
import Image from "next/image";
import { Star } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, CSSProperties } from "react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ReviewEntryProps {
  id: string;
  userName: string;
  userAvatar: string;
  feedback: string; // Changed from userDescription
  images: string[];
  status: "under_review" | "approved" | "rejected";
  rating: number;
  businessName?: string; // Added business name
  createdAt: string; // Added createdAt for time display
}

interface User {
  _id: string;
  name: string;
  email: string;
}

interface Business {
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
}

interface Review {
  _id: string;
  rating: number;
  feedback: string;
  image: string[];
  status: "approved" | "pending" | "rejected";
  user: User;
  business: Business | null;
  report: { isReported: boolean; reportMessage: string };
  googlePlaceId: null | string;
  reply: Array<{
    text: string;
    repliedBy: string;
    repliedAt: string;
    _id: string;
  }>;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface ApiResponse {
  status: boolean;
  message: string;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  data: Review[];
}

const fetchReviews = async (
  token?: string,
  status?: string,
  sortBy?: string,
  timeRange?: string,
): Promise<ReviewEntryProps[]> => {
  const queryParams = new URLSearchParams();
  if (status && status !== "all") queryParams.append("reviewType", status);
  if (sortBy && sortBy !== "asc-latest") queryParams.append("sortBy", sortBy);
  if (timeRange && timeRange !== "all")
    queryParams.append("timeRange", timeRange);

  const url = `${process.env.NEXT_PUBLIC_API_URL}/review/all?${queryParams.toString()}`;

  const response = await fetch(url, {
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch reviews: ${response.statusText}`);
  }

  const data: ApiResponse = await response.json();

  return data.data.map((entry: Review) => ({
    id: entry._id,
    userName: entry.user?.name || "Unknown User",
    userAvatar: "",
    feedback: entry.feedback || "No feedback provided", // Use feedback field
    images: entry.image.length > 0 ? entry.image : [],
    status:
      entry.status === "pending"
        ? "under_review"
        : (entry.status as "under_review" | "approved" | "rejected"),
    rating: entry.rating,
    businessName: entry.business?.businessInfo?.name || "Unknown Business",
    createdAt: entry.createdAt,
  }));
};

const updateReviewStatus = async ({
  id,
  status,
  token,
}: {
  id: string;
  status: "approved" | "rejected";
  token?: string;
  // eslint-disable-next-line
}): Promise<any> => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/review/toggle/${id}`,
    {
      method: "PUT",
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    },
  );

  if (!response.ok) {
    throw new Error(`Failed to ${status} review: ${response.statusText}`);
  }

  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return await response.json();
  }
  return await response.text();
};

const SkeletonCard = () => {
  const skeletonStyle: CSSProperties = {
    backgroundColor: "#e0e0e0",
    borderRadius: "8px",
    animation: "pulse 1.5s infinite",
  };

  return (
    <Card className="relative border-none shadow-[#003D3914]">
      <CardHeader className="flex flex-row items-center gap-4 pb-4">
        <div
          style={{
            ...skeletonStyle,
            width: "40px",
            height: "40px",
            borderRadius: "50%",
          }}
        />
        <div className="grid gap-0.5">
          <div style={{ ...skeletonStyle, width: "150px", height: "20px" }} />
          <div style={{ ...skeletonStyle, width: "100px", height: "16px" }} />
        </div>
        <div className="ml-auto">
          <div
            style={{
              ...skeletonStyle,
              width: "100px",
              height: "32px",
              borderRadius: "16px",
            }}
          />
        </div>
      </CardHeader>
      <CardContent className="flex items-end">
        <div className="flex w-[70%] gap-4 flex-wrap">
          {Array(3)
            .fill(0)
            .map((_, index) => (
              <div
                key={index}
                style={{
                  ...skeletonStyle,
                  width: "150px",
                  height: "150px",
                  borderRadius: "8px",
                }}
              />
            ))}
        </div>
        <div className="w-[30%] flex flex-col justify-between">
          <div className="flex justify-end gap-2">
            <div
              style={{
                ...skeletonStyle,
                width: "80px",
                height: "36px",
                borderRadius: "8px",
              }}
            />
            <div
              style={{
                ...skeletonStyle,
                width: "80px",
                height: "36px",
                borderRadius: "8px",
              }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Helper function to format date
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
};

export default function ReviewsComponent() {
  const { data: session } = useSession();
  const token = session?.user?.accessToken;
  const queryClient = useQueryClient();

  const [reviewType, setReviewType] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("asc-latest");
  const [timeRange, setTimeRange] = useState<string>("all");

  const {
    data: reviewEntries = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["reviews", token, reviewType, sortBy, timeRange],
    queryFn: () => fetchReviews(token, reviewType, sortBy, timeRange),
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  const mutation = useMutation({
    mutationFn: updateReviewStatus,
    onMutate: async ({ id, status }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: ["reviews", token, reviewType, sortBy, timeRange],
      });

      // Snapshot the previous value
      const previousReviews = queryClient.getQueryData([
        "reviews",
        token,
        reviewType,
        sortBy,
        timeRange,
      ]) as ReviewEntryProps[];

      // Optimistically update the review status
      queryClient.setQueryData(
        ["reviews", token, reviewType, sortBy, timeRange],
        (old: ReviewEntryProps[] | undefined) => {
          if (!old) return old;
          return old.map((review) =>
            review.id === id ? { ...review, status } : review,
          );
        },
      );

      // Return context with the previous data
      return { previousReviews };
    },
    onSuccess: (data, variables) => {
      const message =
        typeof data === "object" && data.message
          ? data.message
          : `Review ${variables.status} successfully!`;
      toast.success(message);
    },
    onError: (error, variables, context) => {
      // Revert to previous state on error
      queryClient.setQueryData(
        ["reviews", token, reviewType, sortBy, timeRange],
        context?.previousReviews,
      );
      toast.error(
        `Failed to ${variables.status} review: ${(error as Error).message}`,
      );
    },
    onSettled: () => {
      // Always refetch after error or success to ensure data is correct
      queryClient.invalidateQueries({
        queryKey: ["reviews", token, reviewType, sortBy, timeRange],
      });
    },
  });

  const handleStatusChange = (id: string, status: "approved" | "rejected") => {
    mutation.mutate({ id, status, token });
  };

  return (
    <div className="flex flex-col min-h-screen">
      <style jsx global>{`
        @keyframes pulse {
          0% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
          100% {
            opacity: 1;
          }
        }
      `}</style>
      <header className="px-6 py-4">
        <div className="w-full">
          <h1 className="text-[28px] text-[#1D2020] font-bold">
            Manage Reviews
          </h1>
          <p className="text-base text-[#485150] mt-3">
            Monitor platform activity, manage submissions, and keep your
            community running smoothly.
          </p>
        </div>
      </header>
      <main className="flex-1 p-6 md:p-8">
        <div className="w-full grid gap-6">
          <div className="flex justify-between gap-4">
            <div className="w-[30%]">
              <label
                htmlFor="review-type"
                className="text-base text-[#485150] font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 mb-3 block"
              >
                Review Type
              </label>
              <Select value={reviewType} onValueChange={setReviewType}>
                <SelectTrigger id="review-type" className="w-full">
                  <SelectValue placeholder="Select Review Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Reviews</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-[30%]">
              <label
                htmlFor="sort-by"
                className="text-base text-[#485150] font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 mb-3 block"
              >
                Sort By
              </label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger id="sort-by" className="w-full">
                  <SelectValue placeholder="Select Sort Option" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asc-latest">Latest</SelectItem>
                  <SelectItem value="desc-oldest">Oldest</SelectItem>
                  <SelectItem value="az">A to Z</SelectItem>
                  <SelectItem value="za">Z to A</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-[30%]">
              <label
                htmlFor="time-range"
                className="text-base text-[#485150] font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 mb-3 block"
              >
                Time Range
              </label>
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger id="time-range" className="w-full">
                  <SelectValue placeholder="Select Time Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="7">Last 7 Days</SelectItem>
                  <SelectItem value="30">Last 30 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-6">
            {isLoading ? (
              Array(3)
                .fill(0)
                .map((_, index) => <SkeletonCard key={index} />)
            ) : error ? (
              <div className="text-red-600">
                Error loading reviews: {(error as Error).message}
              </div>
            ) : reviewEntries.length === 0 ? (
              <div className="text-center text-[#485150]">
                No reviews found for the selected filters.
              </div>
            ) : (
              reviewEntries.map((entry) => (
                <Card
                  key={entry.id}
                  className="relative border-none shadow-[#003D3914]"
                >
                  <CardHeader className="flex flex-row items-center gap-4 pb-4">
                    <Avatar className="w-10 h-10">
                      <AvatarImage
                        src={entry.userAvatar}
                        alt={entry.userName}
                      />
                      <AvatarFallback>
                        {entry.userName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid gap-0.5 flex-1">
                      <div className="flex items-center gap-2">
                        <div className="font-semibold text-[#485150] text-xl">
                          {entry.userName}
                        </div>
                        <span className="text-sm text-[#8D9A99]">
                          • {formatDate(entry.createdAt)}
                        </span>
                      </div>
                      <div className="text-sm text-[#8D9A99]">
                        Review for:{" "}
                        <span className="font-medium text-[#485150]">
                          {entry.businessName}
                        </span>
                      </div>
                    </div>
                    <div className="ml-auto">
                      {entry.status === "under_review" && (
                        <Badge
                          variant="outline"
                          className="bg-orange-100 h-[32px] px-5 text-orange-600 border-orange-200"
                        >
                          Under Review
                        </Badge>
                      )}
                      {entry.status === "approved" && (
                        <Badge
                          variant="outline"
                          className="bg-green-100 h-[32px] px-5 text-green-600 border-green-200"
                        >
                          Approved
                        </Badge>
                      )}
                      {entry.status === "rejected" && (
                        <Badge
                          variant="outline"
                          className="bg-red-100 h-[32px] px-5 text-red-600 border-red-200"
                        >
                          Rejected
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* Rating and Feedback Section */}
                    <div className="mb-4">
                      <div className="flex items-center space-x-1 mb-2">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < Math.floor(entry.rating)
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">
                          {entry.rating.toFixed(1)}
                        </span>
                      </div>

                      {/* Feedback Text */}
                      {entry.feedback &&
                        entry.feedback !== "No feedback provided" && (
                          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                            <p className="text-[#485150] italic">
                              &ldquo;{entry.feedback}&rdquo;
                            </p>
                          </div>
                        )}
                    </div>

                    {/* Images Section */}
                    {entry.images.length > 0 && (
                      <div className="flex items-end">
                        <div className="flex w-[70%] gap-4 flex-wrap">
                          {entry.images.map((imageSrc, index) => (
                            <Image
                              key={index}
                              src={imageSrc}
                              width={150}
                              height={150}
                              alt={`Review image ${index + 1} from ${entry.userName}`}
                              className="rounded-lg object-cover aspect-square"
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    {entry.status === "under_review" && (
                      <div className="flex justify-end gap-2 mt-4">
                        <Button
                          variant="outline"
                          className="text-red-600 border-red-200 hover:bg-red-50 bg-transparent"
                          onClick={() =>
                            handleStatusChange(entry.id, "rejected")
                          }
                          disabled={mutation.isPending}
                        >
                          Reject
                        </Button>
                        <Button
                          className="bg-emerald-500 hover:bg-emerald-600 text-white"
                          onClick={() =>
                            handleStatusChange(entry.id, "approved")
                          }
                          disabled={mutation.isPending}
                        >
                          Approve
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
