"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Star, FileText, MessageCircle } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton"; // Add this import
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useBusinessContext } from "@/lib/business-context";
import { getMyReview } from "@/lib/api";
import { useState } from "react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

interface User {
  _id: string;
  name: string;
  email: string;
  imageLink: string | null;
}

interface Report {
  reportMessage: {
    isReport: boolean;
  };
  isReport: boolean;
}

interface Reply {
  _id: string;
  text: string;
  repliedBy: string;
  repliedAt: string;
}

interface Review {
  _id: string;
  rating: number;
  feedback: string;
  image: string[];
  status: "pending" | "approved" | "rejected";
  user: User;
  business: string;
  googlePlaceId: string | null;
  createdAt: string;
  updatedAt: string;
  report: Report;
  __v: number;
  reply?: Reply[];
}

interface ReviewsResponse {
  success: boolean;
  data: Review[];
}

interface ReplyResponse {
  success: boolean;
  message: string;
  data: {
    reply: Reply[];
  };
}

// Loading Skeleton Component
function ReviewsSkeleton() {
  return (
    <div className="space-y-6 bg-white">
      {/* Header Skeleton */}
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>

      {/* Rating Summary Card Skeleton */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-8">
            {/* Overall Rating Skeleton */}
            <div className="flex items-center gap-3">
              <Skeleton className="h-14 w-14 rounded-lg" />
              <div>
                <Skeleton className="h-8 w-16 mb-1" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>

            {/* Rating Distribution Skeleton */}
            <div className="flex-1 space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-4 w-12" />
                  <div className="flex-1">
                    <Skeleton className="h-2 w-full rounded-full" />
                  </div>
                  <Skeleton className="h-4 w-8" />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reviews List Skeleton */}
      <div className="space-y-6">
        {[...Array(3)].map((_, index) => (
          <Card key={index} className="border border-gray-200 overflow-hidden">
            <CardContent className="p-6">
              <div className="space-y-4">
                {/* Review Header Skeleton */}
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-5 w-16 rounded-full" />
                      </div>
                      <Skeleton className="h-3 w-24" />
                      <div className="flex items-center gap-1 mt-1">
                        <Skeleton className="h-4 w-20" />
                      </div>
                    </div>
                  </div>
                  <Skeleton className="h-8 w-16" />
                </div>

                {/* Review Content Skeleton */}
                <div className="pl-13">
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4" />

                  {/* Images Skeleton */}
                  <div className="flex gap-2 mt-3">
                    <Skeleton className="h-16 w-16 rounded-lg" />
                    <Skeleton className="h-16 w-16 rounded-lg" />
                  </div>
                </div>

                {/* Reply Input Skeleton */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex gap-3">
                    <Skeleton className="flex-1 h-10" />
                    <Skeleton className="h-10 w-20" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function ReviewsComponent() {
  const { selectedBusinessId } = useBusinessContext();
  const queryClient = useQueryClient();
  const [replyText, setReplyText] = useState<{ [key: string]: string }>({});
  const session = useSession();
  const token = session?.data?.user?.accessToken;

  const { data, isLoading, error } = useQuery<ReviewsResponse>({
    queryKey: ["reviews", selectedBusinessId],
    queryFn: () => getMyReview(selectedBusinessId as string),
  });

  // Reply mutation
  const replyMutation = useMutation({
    mutationFn: async ({
      reviewId,
      reply,
    }: {
      reviewId: string;
      reply: string;
    }) => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/review/reply/${reviewId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ reply }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to submit reply");
      }

      return data as ReplyResponse;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["reviews", selectedBusinessId],
      });
      toast.success("Reply submitted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleReplySubmit = (reviewId: string) => {
    const reply = replyText[reviewId];
    if (!reply?.trim()) {
      toast.error("Please enter a reply");
      return;
    }

    replyMutation.mutate({ reviewId, reply });

    // Clear the reply input for this review
    setReplyText((prev) => ({ ...prev, [reviewId]: "" }));
  };

  // Calculate rating distribution from API data
  const ratingDistribution = (data?.data ?? []).reduce(
    (acc, review) => {
      const rating = Math.min(5, Math.max(1, review.rating));
      const index = 5 - rating;

      if (acc[index]) {
        acc[index].count++;
      }
      return acc;
    },
    [
      { stars: 5, count: 0, percentage: 0 },
      { stars: 4, count: 0, percentage: 0 },
      { stars: 3, count: 0, percentage: 0 },
      { stars: 2, count: 0, percentage: 0 },
      { stars: 1, count: 0, percentage: 0 },
    ],
  );

  // Calculate percentages
  const totalReviews = ratingDistribution.reduce(
    (sum, item) => sum + item.count,
    0,
  );
  const ratingDistributionWithPercentages = ratingDistribution.map((item) => ({
    ...item,
    percentage:
      totalReviews > 0 ? Math.round((item.count / totalReviews) * 100) : 0,
  }));

  // Calculate average rating
  const averageRating =
    (data?.data ?? []).reduce((sum, review) => sum + review.rating, 0) /
    ((data?.data ?? []).length || 1);

  // Format date function
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Show skeleton while loading
  if (isLoading) {
    return <ReviewsSkeleton />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h3 className="text-lg font-medium text-red-600">
            Error loading reviews
          </h3>
          <p className="text-sm text-gray-500 mt-2">Please try again later</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-white">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-gray-900">Reviews</h1>
          <p className="text-gray-600 text-sm">
            Improve your customer engagement by replying to customer reviews
          </p>
        </div>

        {/* Filter Dropdowns */}
        <div className="flex gap-3">
          <Select defaultValue="all">
            <SelectTrigger className="w-32 text-sm">
              <SelectValue placeholder="All Reviews" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Reviews</SelectItem>
              <SelectItem value="5star">5 Star</SelectItem>
              <SelectItem value="4star">4 Star</SelectItem>
            </SelectContent>
          </Select>

          <Select defaultValue="latest">
            <SelectTrigger className="w-24 text-sm">
              <SelectValue placeholder="Latest" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="latest">Latest</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Rating Summary */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-8">
            {/* Overall Rating */}
            <div className="flex items-center gap-3">
              <div className="bg-yellow-500 p-3 rounded-lg">
                <Star className="h-8 w-8 text-white fill-white" />
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-900">
                  {averageRating.toFixed(1)}
                </div>
                <div className="text-sm text-gray-600">
                  {totalReviews} {totalReviews === 1 ? "Review" : "Reviews"}
                </div>
              </div>
            </div>

            {/* Rating Distribution */}
            <div className="flex-1 space-y-2">
              {ratingDistributionWithPercentages.map((item) => (
                <div key={item.stars} className="flex items-center gap-3">
                  <div className="text-sm text-gray-600 w-12">
                    {item.stars} Star
                  </div>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-teal-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                  <div className="text-sm text-gray-600 w-12 text-right">
                    {item.count}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reviews List */}
      <div className="space-y-6">
        {data?.data?.length ? (
          data.data.map((review) => (
            <Card
              key={review._id}
              className="border border-gray-200 overflow-hidden"
            >
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Review Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={review.user.imageLink || ""} />
                        <AvatarFallback className="bg-gradient-to-br from-yellow-400 to-yellow-500 text-white font-semibold">
                          {review.user.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-gray-900">
                            {review.user.name}
                          </h4>
                          <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                            {review.status}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">
                          {formatDate(review.createdAt)}
                        </p>
                        <div className="flex items-center gap-1 mt-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < review.rating
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "fill-gray-200 text-gray-200"
                              }`}
                            />
                          ))}
                          <span className="ml-2 text-sm font-medium text-gray-700">
                            {review.rating.toFixed(1)}
                          </span>
                        </div>
                      </div>
                    </div>
                    {review.report?.isReport ? (
                      <span className="text-xs px-2 py-1 bg-red-50 text-red-600 rounded-full">
                        Reported
                      </span>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-500 hover:text-gray-700 text-sm"
                      >
                        Report
                      </Button>
                    )}
                  </div>

                  {/* Review Content */}
                  <div className="pl-13">
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {review.feedback}
                    </p>

                    {/* Review Images */}
                    {review.image && review.image.length > 0 && (
                      <div className="flex gap-2 mt-3">
                        {review.image.map((img, index) => (
                          <img
                            key={index}
                            src={img}
                            alt={`Review image ${index + 1}`}
                            className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Display existing replies */}
                  {review.reply && review.reply.length > 0 && (
                    <div className="ml-13 mt-4 space-y-3">
                      {review.reply.map((reply) => (
                        <div
                          key={reply._id}
                          className="flex gap-3 pl-4 border-l-2 border-teal-200"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <MessageCircle className="h-3 w-3 text-teal-500" />
                              <span className="text-xs font-medium text-teal-600">
                                Your Reply
                              </span>
                              <span className="text-xs text-gray-400">
                                {formatDate(reply.repliedAt)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                              {reply.text}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Business Reply Input Section */}
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex gap-3">
                      <Input
                        placeholder="Write your reply..."
                        className="flex-1 text-sm border-gray-200 focus-visible:ring-teal-500"
                        value={replyText[review._id] || ""}
                        onChange={(e) =>
                          setReplyText((prev) => ({
                            ...prev,
                            [review._id]: e.target.value,
                          }))
                        }
                        disabled={replyMutation.isPending}
                      />
                      <Button
                        className="bg-teal-500 hover:bg-teal-600 text-white px-6 transition-colors"
                        onClick={() => handleReplySubmit(review._id)}
                        disabled={
                          replyMutation.isPending ||
                          !replyText[review._id]?.trim()
                        }
                      >
                        {replyMutation.isPending ? (
                          <span className="flex items-center gap-2">
                            <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Sending...
                          </span>
                        ) : (
                          "Reply"
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-64 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
            <FileText className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">
              No Reviews Yet
            </h3>
            <p className="text-sm text-gray-500">
              There are no reviews to display for this business
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
