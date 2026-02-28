"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export default function CustomerDashboardLayout() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const tabs = [
    { name: "Profile", href: "/customer-dashboard/profile" },
    { name: "My Contributions", href: "/customer-dashboard/my-contributions" },
    { name: "Messages", href: "/customer-dashboard/messages" },
    { name: "Saved", href: "/customer-dashboard/saved" },
    { name: "Settings", href: "/customer-dashboard/settings" },
  ];

  return (
    <section className="border-b py-4">
      <div className="container">
        {/* Desktop Navigation - hidden on mobile */}
        <nav className="hidden md:flex lg:space-x-6 space-x-2">
          {tabs.map((tab) => {
            const isActive =
              pathname === tab.href || pathname.startsWith(`${tab.href}/`);
            return (
              <Link
                key={tab.name}
                href={tab.href}
                className={`py-1 text-sm font-medium whitespace-nowrap ${
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

        {/* Mobile Header */}
        <div className="flex md:hidden items-center justify-between">
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
          <span className="text-sm font-medium text-gray-500">Menu</span>
          <div className="w-5" /> {/* Spacer for alignment */}
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4">
            <nav className="flex flex-col space-y-1">
              {tabs.map((tab) => {
                const isActive =
                  pathname === tab.href || pathname.startsWith(`${tab.href}/`);
                return (
                  <Link
                    key={tab.name}
                    href={tab.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`py-2 px-2 text-sm font-medium rounded ${
                      isActive
                        ? "text-teal-600 bg-teal-50 border-l-2 border-teal-600"
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
      </div>
    </section>
  );
}
