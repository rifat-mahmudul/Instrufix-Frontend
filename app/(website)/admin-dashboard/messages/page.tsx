"use client";

import type React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect, useRef } from "react";
import { getMyChat, getMessages, sendMessage } from "@/lib/api";
import { initSocket } from "@/lib/socket";
import { useSession } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Paperclip, ArrowLeft } from "lucide-react";

export default function InboxPage() {
  const queryClient = useQueryClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedChat, setSelectedChat] = useState<any>(null);
  const [newMessage, setNewMessage] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [liveMessages, setLiveMessages] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const socketRef = useRef<any>(null);
  const currentChatRef = useRef<string | null>(null);
  const { data: session } = useSession();
  const myUserId = session?.user?.id;

  // Mobile view state - true shows chat list, false shows selected chat
  const [showChatList, setShowChatList] = useState(true);

  // Ref for the messages scroll area
  const messagesScrollAreaRef = useRef<HTMLDivElement>(null);

  // Get my chats
  const { data: chats = [] } = useQuery({
    queryKey: ["chats"],
    queryFn: () => getMyChat(myUserId as string).then((res) => res.data),
    enabled: !!myUserId,
  });

  console.log("User id: ", myUserId);

  const params = {
    userId: myUserId as string,
    chatId: selectedChat?._id,
  };

  // Get DB messages for selected chat
  const { data: messages = [] } = useQuery({
    queryKey: ["messages", selectedChat?._id],
    queryFn: () =>
      selectedChat ? getMessages(params).then((res) => res.data) : [],
    enabled: !!selectedChat,
  });

  // Initialize socket connection once
  useEffect(() => {
    if (!myUserId) return;

    const socket = initSocket();
    socketRef.current = socket;

    // Listen for messages globally
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    socket.on("message", (msg: any) => {
      console.log("New message received via socket:", msg);

      // Only update if the message is for the currently selected chat
      if (msg?.chat === currentChatRef.current) {
        setLiveMessages((prev) => {
          // Check if message already exists to avoid duplicates
          const messageExists = prev.some(
            (existingMsg) =>
              existingMsg._id === msg._id ||
              (existingMsg.message === msg.message &&
                existingMsg.senderId === msg.senderId &&
                Math.abs(
                  new Date(
                    existingMsg.createdAt || existingMsg.date,
                  ).getTime() - new Date(msg.createdAt || msg.date).getTime(),
                ) < 1000),
          );
          if (messageExists) {
            return prev;
          }
          return [...prev, msg];
        });
      }

      // Update the chat list to show latest message
      queryClient.invalidateQueries({ queryKey: ["chats"] });
    });

    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected");
    });

    return () => {
      socket.off("message");
      socket.off("connect");
      socket.off("disconnect");
      socket.disconnect();
    };
  }, [myUserId, queryClient]);

  // Handle chat selection and room joining
  useEffect(() => {
    if (!selectedChat || !socketRef.current) return;

    const socket = socketRef.current;

    // Leave previous room if exists
    if (currentChatRef.current) {
      socket.emit("leaveChat", currentChatRef.current);
      console.log(`Left chat room: ${currentChatRef.current}`);
    }

    // Update current chat reference
    currentChatRef.current = selectedChat._id;

    // Join new room
    socket.emit("joinChat", selectedChat._id);
    console.log(`Joined chat room: ${selectedChat._id}`);

    // Load messages from database and set as live messages
    if (messages.length > 0) {
      setLiveMessages(messages);
    } else {
      // If messages from query are not ready, fetch them directly
      getMessages(selectedChat._id).then((res) => {
        setLiveMessages(res.data);
      });
    }
  }, [selectedChat, messages]);

  // Send a message mutation
  const sendMutation = useMutation({
    mutationFn: (formData: FormData) =>
      sendMessage({ data: formData }).then((res) => res.data),
    onSuccess: () => {
      // Don't add to liveMessages here as it will come through socket
      setNewMessage("");
      // Optionally invalidate chats to update last message
      queryClient.invalidateQueries({ queryKey: ["chats"] });
    },
    onError: (error) => {
      console.error("Failed to send message:", error);
    },
  });

  const handleSend = () => {
    if (!newMessage.trim()) return;
    if (!myUserId || !selectedChat) return;

    console.log("this is the bussiness id",selectedChat.bussinessId)

    const payload = {
      receiverId: selectedChat.bussinessId.user,
      senderId: myUserId,
      chat: selectedChat._id,
      message: newMessage,
    };

    const formData = new FormData();
    formData.append("data", JSON.stringify(payload));
    sendMutation.mutate(formData);
  };

  console.log("handel seleted", handleSend)

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (date: string) => {
    const messageDate = new Date(date);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - messageDate.getTime()) / (1000 * 60 * 60),
    );

    if (diffInHours < 1) return "now";
    if (diffInHours < 24) return `${diffInHours}h`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d`;
    if (diffInHours < 720) return `${Math.floor(diffInHours / 168)}w`;
    return `${Math.floor(diffInHours / 720)}m`;
  };

  const getInitials = (name?: string | null) => {
    if (!name) return "NA";
    return name
      .split(" ")
      .filter(Boolean)
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Handle chat selection for mobile
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleChatSelect = (chat: any) => {
    setSelectedChat(chat);
    setShowChatList(false); // Hide chat list on mobile
  };

  // Handle back to chat list on mobile
  const handleBackToChatList = () => {
    setShowChatList(true);
    setSelectedChat(null);
  };

  // Auto-scroll to bottom when new messages arrive or chat changes
  useEffect(() => {
    if (messagesScrollAreaRef.current) {
      const scrollContent = messagesScrollAreaRef.current.querySelector(
        "[data-radix-scroll-area-viewport]",
      ) as HTMLElement;
      if (scrollContent) {
        scrollContent.scrollTop = scrollContent.scrollHeight;
      }
    }
  }, [liveMessages, selectedChat]); // Added selectedChat to dependencies

  console.log("Chats left: ", chats[0]);

  console.log("Selected chat: ", selectedChat);

  return (
    <div className="flex gap-5 h-[70vh] bg-white container">
      {/* Left Sidebar - Chat List */}
      <div
        className={`w-full md:w-80 border-gray-200 flex flex-col ${showChatList ? "block" : "hidden md:flex"}`}
      >
        <ScrollArea className="flex-1">
          <div className="divide-y divide-gray-100">
            {chats?.length > 0 ? (
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              chats.map((chat: any) => (
                <div
                  key={chat._id}
                  className={`p-4 rounded-xl cursor-pointer hover:bg-[#F7F8F8] transition-colors ${
                    selectedChat?._id === chat._id ? "bg-[#F7F8F8]" : ""
                  }`}
                  onClick={() => handleChatSelect(chat)}
                >
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage
                        src={chat?.businessId?.businessInfo?.image[0]}
                      />
                      <AvatarFallback className="bg-gray-200 text-gray-600">
                        {getInitials(chat?.businessId?.businessInfo?.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {chat?.businessId?.businessInfo?.name}
                        </p>
                        <span className="text-xs text-gray-500">
                          {chat.lastMessage &&
                            formatTime(chat.lastMessage.date)}
                        </span>
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
                <p className="mb-4 text-gray-500">You have no messages yet.</p>
                <a
                  href="/search-result"
                  className="inline-block px-4 py-2 bg-[#00998E] text-white rounded-lg hover:bg-[#008A7E] transition-colors"
                >
                  Go to Search Results
                </a>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Right Chat Window */}
      <div
        className={`flex-1 flex flex-col border rounded-lg ${showChatList ? "hidden md:flex" : "flex"}`}
      >
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="px-4 py-2 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {/* Back button for mobile */}
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
                      {selectedChat?.bussinessId?.businessInfo?.name}
                    </h2>
                    <p className="text-sm text-gray-500 hidden sm:block">
                      {selectedChat?.bussinessId?.businessInfo?.email}
                    </p>
                  </div>
                </div>
                <Avatar className="h-12 w-12 mt-1">
                  <AvatarImage
                    src={selectedChat?.bussinessId?.businessInfo?.image[0]}
                  />
                  <AvatarFallback className="bg-gray-200 text-gray-600 text-xs">
                    {getInitials(
                      selectedChat?.senderId?.name ||
                        selectedChat?.userId?.name,
                    )}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>

            {/* Messages Area */}
            <ScrollArea className="flex-1 p-4" ref={messagesScrollAreaRef}>
              <div className="space-y-4">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {liveMessages?.map((msg: any, index: number) => {
                  const isMyMessage =
                    msg?.senderId?._id === myUserId ||
                    msg?.senderId === myUserId;
                  return (
                    <div
                      key={msg?._id || `msg-${index}`}
                      className={`flex ${isMyMessage ? "justify-end" : "justify-start"}`}
                    >
                      <div className="flex items-start space-x-2 max-w-xs lg:max-w-md">
                        {!isMyMessage && (
                          <Avatar className="h-8 w-8 mt-1">
                            <AvatarImage src={msg.senderId?.image} />
                            <AvatarFallback className="bg-gray-200 text-gray-600 text-xs">
                              {getInitials(
                                msg?.senderId?.name ||
                                  selectedChat?.userId?.name,
                              )}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <div
                          className={`px-4 py-2 rounded-2xl ${
                            isMyMessage
                              ? "bg-[#00998E] text-white rounded-br-md"
                              : "bg-gray-100 text-gray-900 rounded-bl-md"
                          }`}
                        >
                          <p className="text-sm">{msg?.message}</p>
                        </div>
                        {isMyMessage && (
                          <Avatar className="h-8 w-8 mt-1">
                            <AvatarImage src={msg.senderId?.imageLink} />
                            <AvatarFallback className="bg-gray-200 text-gray-600 text-xs">
                              {getInitials(
                                msg?.senderId?.name ||
                                  selectedChat?.userId?.name,
                              )}
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
                  disabled={!newMessage.trim() || sendMutation.isPending}
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
