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


export default function BusinessDashboardLayout() {
  const pathname = usePathname();

  const tabs = [
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
  })

  const { selectedBusinessId, setSelectedBusinessId } = useBusinessContext()


  return (
    <section className="border-b py-4">
      <div className="container flex justify-between items-center">
        <nav className="flex lg:space-x-6 space-x-2">
          {tabs.map((tab) => {
            const isActive =
              pathname === tab.href || pathname.startsWith(`${tab.href}/`);
            return (
              <Link
                key={tab.name}
                href={tab.href}
                className={`py-1 text-sm font-medium ${isActive
                  ? "text-teal-600 border-b-2 border-teal-600"
                  : "text-gray-700 hover:text-teal-600"
                  }`}
              >
                {tab.name}
              </Link>
            );
          })}
        </nav>
        <div className="">
          <Select
            value={selectedBusinessId}
            onValueChange={(value) => setSelectedBusinessId(value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Business" />
            </SelectTrigger>
            <SelectContent>
              {myBusinesses?.map((business: { _id: string, name: string, businessInfo: { name: string, } }) => (
                <SelectItem key={business._id} value={business._id}>
                  {business.businessInfo.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </section>
  );
}
