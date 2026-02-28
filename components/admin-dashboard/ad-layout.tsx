"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export default function AdminDashboardLayout() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const tabs = [
    { name: "Dashboard", href: "/admin-dashboard/dashboard" },
    {
      name: "Business Submissions",
      href: "/admin-dashboard/business-submissions",
    },
    { name: "Business Claims", href: "/admin-dashboard/business-claims" },
    { name: "Manage Photos", href: "/admin-dashboard/manage-photos" },
    { name: "Manage Reviews", href: "/admin-dashboard/manage-reviews" },
    { name: "Manage Users", href: "/admin-dashboard/manage-users" },
    { name: "Manage Services", href: "/admin-dashboard/manage-services" },
    { name: "Messages", href: "/admin-dashboard/messages" },
    { name: "Settings", href: "/admin-dashboard/settings" },
  ];

  return (
    <section className="border-b py-4">
      <div className="container">
        {/* Desktop Navigation - hidden on mobile */}
        <nav className="hidden md:flex lg:space-x-6 space-x-2 overflow-x-auto pb-2">
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
          <span className="text-sm font-medium text-gray-500">Admin Menu</span>
          <div className="w-5" /> {/* Spacer for alignment */}
        </div>

        {/* Mobile Menu Popup - Left Side */}
        {mobileMenuOpen && (
          <>
            <div 
              className="fixed inset-0 bg-black/30 z-40 md:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="fixed left-0 top-0 h-full w-80 bg-white shadow-lg z-50 md:hidden overflow-y-auto">
              <div className="p-4 border-b flex justify-between items-center">
                <h3 className="font-semibold text-gray-700">Admin Menu</h3>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 hover:bg-gray-100 rounded-md"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <nav className="flex flex-col p-2">
                {tabs.map((tab) => {
                  const isActive =
                    pathname === tab.href || pathname.startsWith(`${tab.href}/`);
                  return (
                    <Link
                      key={tab.name}
                      href={tab.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`py-3 px-4 text-sm font-medium rounded ${
                        isActive
                          ? "text-teal-600 bg-teal-50 border-l-4 border-teal-600"
                          : "text-gray-700 hover:text-teal-600 hover:bg-gray-50"
                      }`}
                    >
                      {tab.name}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </>
        )}
      </div>
    </section>
  );
}