"use client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  ChevronDown,
  Menu,
  Bell,
  Inbox,
  Bookmark,
  User2Icon,
  Settings,
  LogOut,
} from "lucide-react";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { getAllNotification, getUserProfile } from "@/lib/api";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { usePathname } from "next/navigation";
import SearchBar from "./SearchBar";

const Navbar = () => {
  const { data: session, status: sessionStatus } = useSession();
  const { data: userData } = useQuery({
    queryKey: ["userData", session?.user?.email],
    queryFn: getUserProfile,
    select: (data) => data.data,
    enabled: sessionStatus === "authenticated",
  });

  const pathname = usePathname();

  const { data: notifications = [] } = useQuery({
    queryKey: ["all-notifications"],
    queryFn: async () => {
      const res = await getAllNotification();
      return res?.notify || [];
    },
  });

  const notificationCount = notifications.length;

  // Check if search bar should be shown (show on all pages except landing page)
  const shouldShowSearchBar = pathname !== "/";

  return (
    <nav className="p-4 border-b sticky top-0 z-50 bg-white">
      <div className="container flex items-center justify-between gap-10 h-14">
        {/* Logo */}
        <Link href={"/"}>
          {" "}
          <button>
            <h1 className="font-bold text-3xl lg:text-5xl">Instrufix</h1>
          </button>
        </Link>

        {/* Search Bar (hidden on mobile, visible on desktop) */}
        {shouldShowSearchBar && <SearchBar variant="desktop" />}

        {/* Mobile Sign Up Button and Menu (visible on mobile only) */}
        <div className="md:hidden flex items-center gap-3">
          {sessionStatus === "unauthenticated" && (
            <Link href="/auth/signup">
              <Button
                variant="outline"
                className="hover:bg-[#00998E] border-primary text-[#00998E] hover:text-white rounded-lg px-4 py-2 bg-transparent"
              >
                Sign Up
              </Button>
            </Link>
          )}

          {sessionStatus === "authenticated" && (
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center h-10 w-10 bg-[#F7F8F8] rounded-full relative">
                <Link
                  href={`${
                    session?.user?.userType === "user"
                      ? "/customer-dashboard/settings/notifications"
                      : session?.user?.userType === "admin"
                      ? "/admin-dashboard/settings"
                      : "/business-dashboard/settings/notifications"
                  }`}
                >
                  <Bell className="h-5 w-5" />
                  {notificationCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
                      {notificationCount > 99 ? "99+" : notificationCount}
                    </span>
                  )}
                </Link>
              </div>
            </div>
          )}

          <Sheet>
            <SheetTrigger>
              <Menu className="h-6 w-6 text-gray-700" />
            </SheetTrigger>
            <SheetContent
              side="right"
              className="bg-white text-gray-900 border-gray-200 w-80"
            >
              <div className="flex flex-col space-y-6 p-4">
                {/* Mobile Search Bar */}
                {shouldShowSearchBar && (
                  <SearchBar
                    variant="mobile"
                    onResultClick={() => {
                      (
                        document.querySelector(
                          '[data-state="open"]'
                        ) as HTMLElement | null
                      )?.click();
                    }}
                  />
                )}

                {/* User Profile Section (if authenticated) */}
                {sessionStatus === "authenticated" && (
                  <div className="flex flex-col space-y-4 border-b border-gray-200 pb-4">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={userData?.imageLink} />
                        <AvatarFallback className="uppercase">
                          {(() => {
                            const name = userData?.name?.trim();
                            if (!name) return "";
                            const parts = name.split(" ");
                            if (parts.length === 1) {
                              return parts[0][0];
                            } else {
                              return `${parts[0][0]}${parts[1][0]}`;
                            }
                          })()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{userData?.name}</span>
                    </div>

                    <div className="flex gap-3">
                      <div className="flex items-center justify-center h-12 w-12 bg-[#F7F8F8] rounded-full">
                        <Inbox className="h-6 w-6" />
                      </div>
                      <div className="flex items-center justify-center h-12 w-12 bg-[#F7F8F8] rounded-full">
                        <Bookmark className="h-6 w-6" />
                      </div>
                    </div>
                  </div>
                )}

                {/* Mobile Dropdowns */}
                <DropdownMenu>
                  <DropdownMenuTrigger className="w-full justify-between text-gray-900 hover:text-primary flex items-center p-2 rounded-lg hover:bg-gray-50">
                    For Customer <ChevronDown className="h-4 w-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-white text-gray-900 border-gray-200 w-full">
                    <DropdownMenuItem className="hover:bg-gray-100 cursor-pointer">
                      Write a Review
                    </DropdownMenuItem>
                    <DropdownMenuItem className="hover:bg-gray-100 cursor-pointer">
                      Add a Business
                    </DropdownMenuItem>
                    {sessionStatus === "unauthenticated" && (
                      <DropdownMenuItem className="hover:bg-gray-100 focus:bg-gray-100 cursor-pointer">
                        <Link href="/auth/login">Log In</Link>
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger className="w-full justify-between text-gray-900 hover:text-primary flex items-center p-2 rounded-lg hover:bg-gray-50">
                    For Business <ChevronDown className="h-4 w-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-white text-gray-900 border-gray-200 w-full">
                    <DropdownMenuItem className="hover:bg-gray-100 cursor-pointer">
                      Add my Business
                    </DropdownMenuItem>
                    <DropdownMenuItem className="hover:bg-gray-100 cursor-pointer">
                      Claim my Business
                    </DropdownMenuItem>
                    {sessionStatus === "unauthenticated" && (
                      <DropdownMenuItem className="hover:bg-gray-100 cursor-pointer">
                        <Link href="/auth/login">Log In</Link>
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Mobile Auth Buttons or User Actions */}
                {sessionStatus === "unauthenticated" ? (
                  <div className="flex flex-col gap-3 pt-4 border-t border-gray-200">
                    <Link href="/auth/signup">
                      <Button
                        variant="outline"
                        className="hover:bg-[#00998E] border-primary text-[#00998E] hover:text-white w-full rounded-lg px-4 py-2 bg-transparent"
                      >
                        Sign Up
                      </Button>
                    </Link>
                    <Link href="/auth/login">
                      <Button
                        variant="outline"
                        className="hover:bg-[#00998E] border-primary text-[#00998E] hover:text-white w-full rounded-lg px-4 py-2 bg-transparent"
                      >
                        Log In
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3 pt-4 border-t border-gray-200">
                    <Link
                      href="/customer-dashboard/profile"
                      className="flex gap-2 items-center p-2 rounded-lg hover:bg-gray-50"
                    >
                      <User2Icon className="h-6 w-6" />
                      View Profile
                    </Link>
                    <Link
                      href="/customer-dashboard/settings"
                      className="flex gap-2 items-center p-2 rounded-lg hover:bg-gray-50"
                    >
                      <Settings className="h-6 w-6" />
                      Settings
                    </Link>
                    <div
                      className="flex gap-2 items-center p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                      onClick={() => signOut()}
                    >
                      <LogOut className="h-6 w-6" />
                      Log Out
                    </div>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Desktop Navigation (hidden on small screens) */}
        <div className="hidden md:flex items-center space-x-4 ml-4">
          {sessionStatus === "unauthenticated" && (
            <div className="flex gap-5 items-center">
              <DropdownMenu>
                <DropdownMenuTrigger className="hover:text-primary flex gap-1 items-center outline-none">
                  For Customer <ChevronDown className="ml-1 h-4 w-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-white border-gray-700 border-none">
                  <Link href={"/review-a-business"}>
                    <DropdownMenuItem className="hover:bg-gray-100 focus:bg-gray-100 cursor-pointer">
                      Write a Review
                    </DropdownMenuItem>
                  </Link>
                  <Link href={"/add-a-business"}>
                    <DropdownMenuItem className="hover:bg-gray-100 focus:bg-gray-100 cursor-pointer">
                      Add a Business
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuItem className="hover:bg-gray-100 focus:bg-gray-100 cursor-pointer">
                    <Link href="/auth/login">Log In</Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <DropdownMenu>
                <DropdownMenuTrigger className="hover:text-primary flex gap-1 items-center outline-none">
                  For Business <ChevronDown className="ml-1 h-4 w-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-white border-gray-700 border-none">
                  <Link href={"/add-my-business"}>
                    <DropdownMenuItem className="hover:bg-gray-100 focus:bg-gray-100 cursor-pointer">
                      Add my Business
                    </DropdownMenuItem>
                  </Link>
                  <Link href={"/claim-my-business"}>
                    {" "}
                    <DropdownMenuItem className="hover:bg-gray-100 focus:bg-gray-100 cursor-pointer">
                      Claim my Business
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuItem className="hover:bg-gray-100 focus:bg-gray-100 cursor-pointer">
                    <Link href="/auth/login">Log In</Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}

          {sessionStatus === "unauthenticated" ? (
            <div className="flex gap-3">
              <Link href="/auth/signup">
                <Button
                  variant="outline"
                  className="hover:bg-[#00998E] border-primary text-[#00998E] hover:text-white rounded-lg px-6 py-2 bg-transparent"
                >
                  Signup
                </Button>
              </Link>
              <Link href="/auth/login">
                <Button
                  variant="outline"
                  className="hover:bg-[#00998E] border-primary text-[#00998E] hover:text-white rounded-lg px-6 py-2 bg-transparent"
                >
                  Login
                </Button>
              </Link>
            </div>
          ) : (
            <div className="flex gap-3">
              <div className="flex items-center justify-center h-12 w-12 bg-[#F7F8F8] rounded-full">
                <Link
                  href={
                    session?.user?.userType === "admin"
                      ? "/admin-dashboard/messages"
                      : session?.user?.userType === "user"
                      ? "/customer-dashboard/messages"
                      : session?.user?.userType === "businessMan"
                      ? "/business-dashboard/messages"
                      : "/customer-dashboard/messages"
                  }
                >
                  <Inbox className="h-6 w-6" />
                </Link>
              </div>
              {session?.user?.userType === "user" && (
                <Link href={"/customer-dashboard/saved"}>
                  <div className="flex items-center justify-center h-12 w-12 bg-[#F7F8F8] rounded-full">
                    <Bookmark className="h-6 w-6" />
                  </div>
                </Link>
              )}
              <div className="flex items-center justify-center h-12 w-12 bg-[#F7F8F8] rounded-full relative">
                <Link href={`/notifications`}>
                  <Bell className="h-6 w-6" />
                  {notificationCount > 0 && (
                    <span
                      className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white bg-red-600 rounded-full"
                      style={{ transform: "translate(50%, -50%)" }}
                    >
                      {notificationCount > 99 ? "99+" : notificationCount}
                    </span>
                  )}
                </Link>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger className="hover:text-primary flex gap-1 items-center outline-none">
                  <Avatar>
                    <AvatarImage src={userData?.imageLink} />
                    <AvatarFallback className="uppercase">
                      {(() => {
                        const name = userData?.name?.trim();
                        if (!name) return "";
                        const parts = name.split(" ");
                        if (parts.length === 1) {
                          return parts[0][0];
                        } else {
                          return `${parts[0][0]}${parts[1][0]}`;
                        }
                      })()}
                    </AvatarFallback>
                  </Avatar>
                  {userData?.name}
                  <ChevronDown className="ml-1 h-4 w-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-white border-gray-700 border-none">
                  <DropdownMenuItem className="hover:bg-[#F7F8F8] cursor-pointer">
                    <Link
                      href={
                        userData?.userType === "user"
                          ? "/customer-dashboard/profile"
                          : userData?.userType === "admin"
                          ? "/admin-dashboard/settings"
                          : "/business-dashboard/profile"
                      }
                      className="flex gap-2 items-center"
                    >
                      <User2Icon className="h-6 w-6" />
                      {"View Profile"}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="hover:bg-gray-700 cursor-pointer">
                    <Link
                      href="/customer-dashboard/settings"
                      className="flex gap-2 items-center"
                    >
                      <Settings className="h-6 w-6" />
                      {"Settings"}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="hover:bg-gray-700 cursor-pointer">
                    <div
                      className="flex gap-2 items-center"
                      onClick={() => signOut()}
                    >
                      <LogOut className="h-6 w-6" />
                      {"Log Out"}
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
