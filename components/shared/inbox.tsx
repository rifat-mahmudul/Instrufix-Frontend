"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import type React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect, useRef } from "react";
import { getMessages } from "@/lib/api";
import { initSocket } from "@/lib/socket";
import { useSession } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Paperclip, ArrowLeft } from "lucide-react";
export interface Message {
  _id: string;
  senderId: string | { _id: string; name?: string; image?: string };
  receiverId: string;
  chat: string;
  message: string;
  createdAt: string;
  tempId?: string;
}

interface InboxConfig {
  // Data fetching
  fetchChats: (userId?: string, businessId?: string) => Promise<any>;
  queryKey: string[];

  // Chat display
  getChatName: (chat: any) => string;
  getChatEmail: (chat: any) => string;
  getChatImage: (chat: any) => string;
  getChatId: (chat: any) => string;

  // Message handling
  getReceiverId: (chat: any) => string;

  // UI
  emptyStateText: string;
  emptyStateLink: string;
  emptyStateLinkText: string;

  // Additional data (for business inbox)
  additionalData?: any;
}

interface InboxComponentProps {
  config: InboxConfig;
}

export default function InboxComponent({ config }: InboxComponentProps) {
  const queryClient = useQueryClient();
  const [selectedChat, setSelectedChat] = useState<any>(null);
  const [newMessage, setNewMessage] = useState("");
  const [liveMessages, setLiveMessages] = useState<Message[]>([]);
  const socketRef = useRef<any>(null);
  const currentChatRef = useRef<string | null>(null);
  const { data: session } = useSession();
  const myUserId = session?.user?.id;
  const [showChatList, setShowChatList] = useState(true);
  const messagesScrollAreaRef = useRef<HTMLDivElement>(null);

  // Get chats using the provided config
  const { data: chats = [], refetch } = useQuery({
    queryKey: config.queryKey,
    queryFn: () => config.fetchChats(myUserId as string, config.additionalData),
    enabled:
      !!myUserId && (config.additionalData ? !!config.additionalData : true),
  });

  console.log("Config:", config);

  // Refetch when additional data changes (for business inbox)
  useEffect(() => {
    if (config.additionalData) {
      refetch();
    }
  }, [config.additionalData, refetch]);

  // Initialize socket connection
  useEffect(() => {
    if (!myUserId) return;

    const socket = initSocket();
    socketRef.current = socket;
    console.log("Socket connecting...");

    socket.emit("joinNotification", myUserId);

    socket.on("newMessage", (msg: Message) => {
      console.log("New message received:", msg);

      if (msg?.chat === currentChatRef.current) {
        setLiveMessages((prev) => {
          // 1. If the message already exists by _id → ignore
          if (prev.some((m) => m._id === msg._id)) {
            return prev;
          }

          const getSenderId = (sender: string | { _id: string }) =>
            typeof sender === "object" ? sender._id : sender;

          // 2. If optimistic message exists with same sender + same text → replace
          const optimisticIndex = prev.findIndex(
            (m) =>
              m.tempId &&
              getSenderId(m.senderId) === getSenderId(msg.senderId) &&
              m.message === msg.message
          );

          if (optimisticIndex !== -1) {
            const updated = [...prev];
            updated[optimisticIndex] = msg;
            return updated;
          }

          // 3. Otherwise, append new message
          return [...prev, msg];
        });
      }

      queryClient.invalidateQueries({ queryKey: config.queryKey });
    });

    socket.on("connect_error", (err) => {
      console.error("Socket connection error:", err);
    });

    return () => {
      socket.off("newMessage");
      socket.off("connect_error");
      socket.disconnect();
    };
  }, [myUserId, queryClient, config.queryKey]);

  // Handle chat selection and room joining
  useEffect(() => {
    if (!selectedChat || !socketRef.current) return;

    const socket = socketRef.current;
    const chatId = config.getChatId(selectedChat);
    console.log(`Joining chat: ${chatId}`);

    // Clear current messages immediately
    setLiveMessages([]);

    if (currentChatRef.current && currentChatRef.current !== chatId) {
      socket.emit("leaveChat", currentChatRef.current);
      console.log(`Left previous chat: ${currentChatRef.current}`);
    }

    currentChatRef.current = chatId;

    // Join the new chat room
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    socket.emit("joinChat", chatId, (response: any) => {
      console.log("Join chat response:", response);
    });

    // Load messages after joining the room
    const params: any = { chatId, userId: myUserId };
    if (config.additionalData) {
      params.businessId = config.additionalData;
    }

    getMessages(params, config.additionalData)
      .then((res) => {
        console.log("Loaded messages:", res.data.length);
        setLiveMessages(res.data);
      })
      .catch((error) => {
        console.error("Error loading messages:", error);
      });
  }, [selectedChat, config, myUserId]);

  // Send message mutation
  // const sendMutation = useMutation({
  //   mutationFn: (formData: FormData) =>
  //     sendMessage({ data: formData }).then((res) => res.data),
  //   onSuccess: () => {
  //     setNewMessage("");
  //     queryClient.invalidateQueries({ queryKey: config.queryKey });
  //   },
  //   onError: (error) => {
  //     console.error("Failed to send message:", error);
  //   },
  // });

  const handleSend = () => {
    if (!newMessage.trim() || !myUserId || !selectedChat) return;

    const payload = {
      receiverId: config.getReceiverId(selectedChat),
      senderId: myUserId,
      chat: config.getChatId(selectedChat),
      message: newMessage,
    };

    const formData = new FormData();
    formData.append("data", JSON.stringify(payload));

    // Remove optimistic update, just send the message
    // sendMutation.mutate(formData);

    const socket = socketRef.current;
    if (socket) {
      socket.emit("sendMessage", {
        chatId: config.getChatId(selectedChat),
        senderId: myUserId,
        receiverId: config.getReceiverId(selectedChat),
        message: newMessage,
        image: null // TODO: Add image support
      });
    }

    setNewMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (date: string) => {
    const messageDate = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - messageDate.getTime();
    const diffInMinutes = Math.floor(diffMs / (1000 * 60));
    const diffInHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInHours < 24) {
      return messageDate.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    if (diffInHours < 720) return `${Math.floor(diffInHours / 168)}w ago`;
    return `${Math.floor(diffInHours / 720)}m ago`;
  };

  const getInitials = (name?: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .filter(Boolean)
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const markAsReadMutation = useMutation({
    mutationFn: (messageId: string) =>
      fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/message/update-message-status/${messageId}`,
        { method: "PUT" }
      ).then((res) => {
        if (!res.ok) {
          return res.text().then((text) => {
            throw new Error(text || "Failed to mark message as read");
          });
        }
        return; // nothing to return for 204 No Content
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: config.queryKey });
      console.log("Message marked as read");
    },
    onError: (err) => console.error("Failed to mark message as read:", err),
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleChatSelect = (chat: any) => {
    setSelectedChat(chat);
    setShowChatList(false);

    if (chat.lastMessage?.isRead === false) {
      chat.lastMessage.isRead = true;
      markAsReadMutation.mutate(chat.lastMessage._id);
    }
  };

  const handleBackToChatList = () => {
    setShowChatList(true);
    setSelectedChat(null);
  };

  // Auto-scroll to bottom with force refresh
  useEffect(() => {
    const scrollToBottom = () => {
      if (messagesScrollAreaRef.current) {
        const scrollContent = messagesScrollAreaRef.current.querySelector(
          "[data-radix-scroll-area-viewport]"
        ) as HTMLElement;
        if (scrollContent) {
          scrollContent.scrollTop = scrollContent.scrollHeight;
        }
      }
    };

    // Immediate scroll
    scrollToBottom();

    // Delayed scroll to ensure DOM is updated
    const timeout = setTimeout(scrollToBottom, 100);

    return () => clearTimeout(timeout);
  }, [liveMessages, selectedChat]);

  // Add this right before the return statement for debugging
  console.log("Current state:", {
    selectedChat: selectedChat ? config.getChatName(selectedChat) : null,
    liveMessagesCount: liveMessages.length,
    socketConnected: socketRef.current?.connected,
    currentRoom: currentChatRef.current,
    lastMessage: liveMessages[liveMessages.length - 1]?.message,
  });

  console.log("The chats: ", selectedChat);

  return (
    <div className="flex gap-5 h-[70vh] bg-white container">
      {/* Left Sidebar - Chat List */}
      <div
        className={`w-full md:w-80 border-gray-200 flex flex-col ${showChatList ? "block" : "hidden md:flex"
          }`}
      >
        <ScrollArea className="flex-1">
          <div className="divide-y divide-gray-100">
            {chats?.length > 0 ? (
              [...chats]
                .sort(
                  (a, b) =>
                    new Date(b.lastMessage?.date).getTime() -
                    new Date(a.lastMessage?.date).getTime()
                )
                .map((chat: any) => (
                  <div
                    key={config.getChatId(chat)}
                    className={`p-4 rounded-xl cursor-pointer hover:bg-[#F7F8F8] transition-colors ${config.getChatId(selectedChat) === config.getChatId(chat)
                      ? "bg-[#F7F8F8]"
                      : ""
                      }`}
                    onClick={() => handleChatSelect(chat)}
                  >
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={config.getChatImage(chat)} />
                        <AvatarFallback className="bg-gray-200 text-gray-600">
                          {getInitials(config.getChatName(chat))}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 relative">
                        {/* Chat name and last message */}
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {config.getChatName(chat)}
                          </p>

                          <div className="">
                            <span className="text-xs text-gray-500">
                              {chat.lastMessage &&
                                formatTime(chat.lastMessage.date)}
                            </span>

                            {/* Unread dot */}
                            {chat.lastMessage?.senderId !== myUserId &&
                              chat?.lastMessage?.isRead === false && (
                                <span className="h-2 w-2 bg-[#00998E] rounded-full inline-block ml-2" />
                              )}
                          </div>
                        </div>
                        <p className="text-sm text-gray-500 truncate mt-1 max-w-[230px]">
                          <span>
                            {chat.lastMessage?.senderId === myUserId
                              ? "You: "
                              : ""}
                          </span>
                          {chat.lastMessage?.message || "No messages yet"}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
            ) : (
              <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                <p className="mb-4 text-gray-500">{config.emptyStateText}</p>
                <a
                  href={config.emptyStateLink}
                  className="inline-block px-4 py-2 bg-[#00998E] text-white rounded-lg hover:bg-[#008A7E] transition-colors"
                >
                  {config.emptyStateLinkText}
                </a>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Right Chat Window */}
      <div
        className={`flex-1 flex flex-col border rounded-lg ${showChatList ? "hidden md:flex" : "flex"
          }`}
      >
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="px-4 py-2 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="md:hidden p-2"
                    onClick={handleBackToChatList}
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <div className="flex items-center gap-5">
                    <h2 className="text-lg font-medium text-gray-900 line-clamp-1 max-w-[200px]">
                      {config.getChatName(selectedChat)}
                    </h2>
                    <p className="text-sm text-gray-500 hidden sm:block">
                      {config.getChatEmail(selectedChat)}
                    </p>
                  </div>
                </div>
                <Avatar className="h-12 w-12 mt-1">
                  <AvatarImage src={config.getChatImage(selectedChat)} />
                  <AvatarFallback className="bg-gray-200 text-gray-600 text-xs">
                    {getInitials(config.getChatName(selectedChat))}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>

            {/* Messages Area */}
            <ScrollArea className="flex-1 p-4" ref={messagesScrollAreaRef}>
              <div className="space-y-4">
                {liveMessages?.map((msg: Message) => {
                  const isMyMessage =
                    (typeof msg.senderId === "object"
                      ? String(msg.senderId._id)
                      : String(msg.senderId)) === String(myUserId);
                  const senderName =
                    typeof msg.senderId === "object" ? msg.senderId.name : null;
                  const senderImage =
                    typeof msg.senderId === "object"
                      ? msg.senderId.image
                      : null;

                  return (
                    <div
                      key={msg._id}
                      className={`flex ${isMyMessage ? "justify-end" : "justify-start"
                        }`}
                    >
                      <div className="flex items-start space-x-2 max-w-xs lg:max-w-md">
                        {!isMyMessage && (
                          <Avatar className="h-8 w-8 mt-1">
                            <AvatarImage
                              src={
                                senderImage || config.getChatImage(selectedChat)
                              }
                            />
                            <AvatarFallback className="bg-gray-200 text-gray-600 text-xs">
                              {getInitials(
                                senderName || config.getChatName(selectedChat)
                              )}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <div
                          className={`px-4 py-2 rounded-2xl ${isMyMessage
                            ? "bg-[#00998E] text-white rounded-br-md"
                            : "bg-gray-100 text-gray-900 rounded-bl-md"
                            }`}
                        >
                          <p className="text-sm">{msg?.message}</p>
                        </div>
                        {isMyMessage && (
                          <Avatar className="h-8 w-8 mt-1">
                            <AvatarImage src={session?.user?.image as string} />
                            <AvatarFallback className="bg-gray-200 text-gray-600 text-xs">
                              {getInitials(session?.user?.name) || "ME"}
                            </AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center space-x-2">
                <div className="flex-1 relative">
                  <Input
                    className="pr-12 h-14 rounded-lg border-[#00998E] focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                    placeholder="Enter a message"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={handleKeyPress}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                  >
                    <Paperclip className="h-4 w-4 text-gray-400" />
                  </Button>
                </div>
                <Button
                  onClick={handleSend}
                  disabled={!newMessage.trim()}
                  className="h-10 w-10 rounded-full bg-[#00998E] hover:bg-[#008A7E] p-0"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Send className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Select a conversation
              </h3>
              <p className="text-gray-500">
                Choose a chat from the sidebar to start messaging
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
