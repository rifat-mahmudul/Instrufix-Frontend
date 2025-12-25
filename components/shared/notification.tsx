"use client";

import React, { useEffect, useState } from "react";
import { initSocket } from "@/lib/socket";
import { useSession } from "next-auth/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getAllNotification, deleteNotification } from "@/lib/api";
import {
  Bell,
  AlertTriangle,
  Image as ImageIcon,
  ClipboardList,
  ClipboardCheck,
  CopyCheck,
  CheckCircle,
  MessageSquareWarning,
  MoreVertical,
  Trash,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Menu } from "@headlessui/react";
import { Skeleton } from "@/components/ui/skeleton";

type NotificationType =
  | "new_business_submitted"
  | "business_submission"
  | "business_review"
  | "review_reported"
  | "picture_status_update"
  | "review_image_uploaded"
  | "business_saved"
  | "business_deleted"
  | "default";

type Notification = {
  _id: string;
  title: string;
  message: string;
  type: NotificationType;
  createdAt: string;
};

type NotificationStyle = {
  bg: string;
  icon: JSX.Element;
};

const styleMap: Record<NotificationType, NotificationStyle> = {
  new_business_submitted: {
    bg: "bg-[#e0f2f1]",
    icon: <Bell className="text-teal-600" />,
  },
  business_submission: {
    bg: "bg-[#e0f2f1]",
    icon: <CheckCircle className="text-teal-700" />,
  },
  business_review: {
    bg: "bg-green-50",
    icon: <ClipboardCheck className="text-green-600" />,
  },
  review_reported: {
    bg: "bg-[#fff8e1]",
    icon: <AlertTriangle className="text-yellow-600" />,
  },
  picture_status_update: {
    bg: "bg-[#f8effd]",
    icon: <ImageIcon className="text-purple-600" />,
  },
  review_image_uploaded: {
    bg: "bg-blue-50",
    icon: <CopyCheck className="text-blue-600" />,
  },
  business_saved: {
    bg: "bg-indigo-50",
    icon: <ClipboardList className="text-indigo-600" />,
  },
  business_deleted: {
    bg: "bg-red-50",
    icon: <AlertTriangle className="text-red-600" />,
  },
  default: {
    bg: "bg-slate-50",
    icon: <MessageSquareWarning className="text-slate-600" />,
  },
};

const Notifications = () => {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const queryClient = useQueryClient();

  const [live, setLive] = useState<Notification[]>([]);

  const {
    data: allNotifications = [],
    isLoading,
    isFetching,
  } = useQuery<Notification[]>({
    queryKey: ["all-notifications"],
    queryFn: async () => {
      const res = await getAllNotification();
      return res?.notify || [];
    },
  });

  useEffect(() => {
    const socket = initSocket();

    if (userId) {
      socket.emit("joinNotification", userId);
    }

    socket.on("new_notification", (n: Notification) => {
      setLive((prev) => [n, ...prev]);
    });

    return () => {
      socket.off("new_notification");
      socket.disconnect();
    };
  }, [userId]);

  const notifications = [...live, ...allNotifications];

  const deleteOne = async (id: string) => {
    try {
      await deleteNotification(id);

      queryClient.setQueryData<Notification[]>(
        ["all-notifications"],
        (old = []) => old.filter((n) => n._id !== id)
      );

      setLive((prev) => prev.filter((n) => n._id !== id));
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Notifications</h2>
        {notifications.length > 0 && (
          <button className="font-semibold text-teal-600 hover:underline">
            Mark All Read
          </button>
        )}
      </div>

      {isLoading || isFetching ? (
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="rounded-lg p-4 flex items-center gap-4 bg-slate-100 dark:bg-slate-800 animate-pulse"
            >
              <Skeleton className="w-10 h-10 rounded-full" />
              <div className="flex flex-col flex-1 space-y-2">
                <Skeleton className="h-6 w-5/6 rounded-md" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-full rounded-md" />
                  <Skeleton className="h-4 w-4/5 rounded-md" />
                </div>
                <Skeleton className="h-3 w-1/4 rounded-md self-end" />
              </div>
            </div>
          ))}
        </div>
      ) : notifications.length > 0 ? (
        <div className="space-y-2">
          {notifications.map((n) => {
            const style =
              styleMap[n.type as NotificationType] || styleMap.default;
            const time = formatDistanceToNow(new Date(n.createdAt), {
              addSuffix: true,
            });

            return (
              <div
                key={n._id}
                className={`rounded-lg p-4 flex justify-between items-center ${style.bg}`}
              >
                <div className="flex gap-3">
                  <div className="pt-1">{style.icon}</div>
                  <div>
                    <p className="font-semibold">{n.title}</p>
                    <p className="text-sm text-gray-700">{n.message}</p>
                    <p className="text-xs text-gray-500 mt-1">{time}</p>
                  </div>
                </div>
                <Menu as="div" className="relative">
                  <Menu.Button className="p-1 rounded hover:bg-gray-100 text-gray-500">
                    <MoreVertical className="w-5 h-5" />
                  </Menu.Button>
                  <Menu.Items className="absolute right-0 mt-2 w-32 bg-white border rounded shadow-md z-10">
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={() => deleteOne(n._id)}
                          className={`w-full px-3 py-2 text-left text-red-600 flex items-center gap-2 ${
                            active ? "bg-gray-100" : ""
                          }`}
                        >
                          <Trash />
                          Delete
                        </button>
                      )}
                    </Menu.Item>
                  </Menu.Items>
                </Menu>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-24 h-24 mb-4 text-gray-300">
            <Bell className="w-full h-full" />
          </div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            No Notifications Yet
          </h3>
        </div>
      )}
    </div>
  );
};

export default Notifications;
