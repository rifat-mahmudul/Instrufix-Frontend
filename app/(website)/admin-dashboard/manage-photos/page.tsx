"use client";
import Image from "next/image";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { CSSProperties, useState } from "react";

interface PhotoEntryProps {
  id: string;
  userName: string;
  userEmail: string;
  userAvatar: string;
  userDescription: string;
  images: string[];
  status: "under_review" | "approved" | "rejected";
}

interface ApiPhotoEntry {
  _id: string;
  image: string[];
  business: {
    businessInfo: {
      name: string;
      image: string[];
      address: string;
      phone: string;
      email: string;
      website: string;
      description: string;
    };
    _id: string;
  } | null;
  user: {
    _id: string;
    name: string;
    email: string;
  } | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

const fetchPhotos = async (
  token?: string,
  status?: string,
  sortBy?: string,
  timeRange?: string,
): Promise<PhotoEntryProps[]> => {
  const queryParams = new URLSearchParams();
  if (status && status !== "all") queryParams.append("photoType", status);
  if (sortBy && sortBy !== "asc-latest") queryParams.append("sortBy", sortBy);
  if (timeRange && timeRange !== "all")
    queryParams.append("timeRange", timeRange);

  const url = `${process.env.NEXT_PUBLIC_API_URL}/picture/get-all-pictures${queryParams.toString() ? `?${queryParams}` : ""}`;

  const response = await fetch(url, {
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch photos");
  }

  const data = await response.json();

  return data.data.map((entry: ApiPhotoEntry) => ({
    id: entry._id,
    userName: entry.user?.name || "Unknown User",
    userEmail: entry.user?.email || "",
    userAvatar: entry.business?.businessInfo.image[0],
    userDescription: entry.business?.businessInfo.description || "$$$",
    images: entry.image.length > 0 ? entry.image : "",
    status:
      entry.status === "pending"
        ? "under_review"
        : (entry.status as "under_review" | "approved" | "rejected"),
  })) as PhotoEntryProps[];
};

const togglePhotoStatus = async ({
  id,
  status,
  token,
}: {
  id: string;
  status: "approved" | "rejected";
  token?: string;
}): Promise<void> => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/picture/toggle-status/${id}`,
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
    throw new Error(`Failed to update photo status to ${status}`);
  }
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

export default function Component() {
  const { data: session } = useSession();
  const token = session?.user?.accessToken;
  const queryClient = useQueryClient();

  const [photoType, setPhotoType] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("asc-latest");
  const [timeRange, setTimeRange] = useState<string>("all");

  const {
    data: photoEntries = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["photos", token, photoType, sortBy, timeRange],
    queryFn: () => fetchPhotos(token, photoType, sortBy, timeRange),
  });

  const mutation = useMutation({
    mutationFn: togglePhotoStatus,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["photos", token, photoType, sortBy, timeRange],
      });
      toast.success(`Photo ${variables.status} successfully!`);
    },
    onError: (error) => {
      toast.error(`Error: ${(error as Error).message}`);
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
            Manage Photos
          </h1>
          <p className="text-base text-[#485150] mt-3">
            Monitor platform activity, manage submissions, and keep your
            community running smoothly.
          </p>
        </div>
      </header>
      <main className="flex-1 p-6 md:p-8">
        <div className="w-full grid gap-6">
          <div className="flex justify-between">
            <div className="w-[30%]">
              <label
                htmlFor="photos-type"
                className="text-base text-[#485150] font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 mb-3"
              >
                Photo Type
              </label>
              <Select value={photoType} onValueChange={setPhotoType}>
                <SelectTrigger id="photos-type" className="w-full">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-[30%]">
              <label
                htmlFor="sort-by"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Sort By
              </label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger id="sort-by" className="w-full">
                  <SelectValue placeholder="Latest" />
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
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Time Range
              </label>
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger id="time-range" className="w-full">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="7">Last 7 Days</SelectItem>
                  <SelectItem value="last-30">Last 30 Days</SelectItem>
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
              <div>Error loading photos: {(error as Error).message}</div>
            ) : (
              photoEntries.map((entry) => (
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
                    <div className="grid gap-0.5">
                      <div className="font-semibold text-[#485150] text-xl">
                        {entry.userName}
                      </div>
                      <div className="text-sm text-gray-700 mb-2">
                        {entry?.userEmail}
                      </div>
                      <div className="text-sm text-[#8D9A99] dark:text-gray-400">
                        {entry.userDescription}
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
                  <CardContent className="flex items-end">
                    <div className="flex w-[70%] gap-4 flex-wrap">
                      {entry.images.map((imageSrc, index) => (
                        <Image
                          key={index}
                          src={imageSrc}
                          width={150}
                          height={150}
                          alt={`Photo ${index + 1} from ${entry.userName}`}
                          className="rounded-lg object-cover aspect-square"
                        />
                      ))}
                    </div>
                    <div className="w-[30%] flex flex-col justify-between">
                      {entry.status === "under_review" && (
                        <div className="flex justify-end gap-2">
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
                    </div>
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
