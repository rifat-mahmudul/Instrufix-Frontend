"use client";

import { getMyBusinesses } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useBusinessContext } from "@/lib/business-context";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export default function BusinessDashboardLayout() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const tabs = [
    { name: "Add My Business", href: "/business-dashboard/add-my-business" },
    { name: "Profile", href: "/business-dashboard/profile" },
    { name: "Dashboard", href: "/business-dashboard/bd-dashboard" },
    { name: "Reviews", href: "/business-dashboard/reviews" },
    { name: "Messages", href: "/business-dashboard/messages" },
    { name: "Settings", href: "/business-dashboard/settings" },
  ];

  const { data: myBusinesses } = useQuery({
    queryKey: ["myBusinesses"],
    queryFn: getMyBusinesses,
    select: (data) => data?.data,
  });

  const { selectedBusinessId, setSelectedBusinessId } = useBusinessContext();

  return (
    <section className="border-b py-4">
      <div className="container flex justify-between items-center">
        {/* Desktop Navigation - hidden on mobile */}
        <nav className="hidden sm:flex lg:space-x-6 space-x-2">
          {tabs.map((tab) => {
            const isActive =
              pathname === tab.href || pathname.startsWith(`${tab.href}/`);
            return (
              <Link
                key={tab.name}
                href={tab.href}
                className={`py-1 text-sm font-medium ${
                  isActive
                    ? "text-teal-600 border-b-2 border-teal-600"
                    : "text-gray-700 hover:text-teal-600"
                }`}
              >
                {tab.name}
              </Link>
            );
          })}
        </nav>

        {/* Mobile Hamburger Menu - only for phones */}
        <div className="sm:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 hover:bg-gray-100 rounded-md"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Business Select */}
        <div className="">
          <Select
            value={selectedBusinessId}
            onValueChange={(value) => setSelectedBusinessId(value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Business" />
            </SelectTrigger>
            <SelectContent>
              {myBusinesses?.map(
                (business: {
                  _id: string;
                  name: string;
                  businessInfo: { name: string };
                }) => (
                  <SelectItem key={business._id} value={business._id}>
                    {business.businessInfo.name}
                  </SelectItem>
                )
              )}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Mobile Menu Dropdown - only for phones */}
      {mobileMenuOpen && (
        <div className="container sm:hidden mt-4">
          <nav className="flex flex-col space-y-1">
            {tabs.map((tab) => {
              const isActive =
                pathname === tab.href || pathname.startsWith(`${tab.href}/`);
              return (
                <Link
                  key={tab.name}
                  href={tab.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`py-2 px-2 text-sm font-medium ${
                    isActive
                      ? "text-teal-600 border-l-2 border-teal-600 bg-teal-50"
                      : "text-gray-700 hover:text-teal-600 hover:bg-gray-50"
                  }`}
                >
                  {tab.name}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </section>
  );
}