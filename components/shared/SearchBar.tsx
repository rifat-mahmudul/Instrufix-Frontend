"use client";
import { Input } from "@/components/ui/input";
import { Search, X, MapPin } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef, KeyboardEvent } from "react";
import { useFilterStore } from "@/zustand/stores/search-store";
import { Button } from "../ui/button";
import { useSearchStore } from "../home/states/useSearchStore";

interface PlaceResult {
  display_name: string;
  address: {
    city?: string;
    town?: string;
    village?: string;
    state?: string;
    state_code?: string;
  };
}

interface SearchBarProps {
  variant?: "desktop" | "mobile";
  onResultClick?: () => void;
}

const SearchBar = ({ variant = "desktop", onResultClick }: SearchBarProps) => {
  const router = useRouter();
  const { search, setSearch } = useFilterStore();
  const { location, setLocation } = useSearchStore();
  const [searchQuery, setSearchQuery] = useState<string>(search);
  const [locationSuggestions, setLocationSuggestions] = useState<string[]>([]);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [isLoadingLocations, setIsLoadingLocations] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<"search" | "location" | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  // Update local state when store changes
  useEffect(() => {
    setSearchQuery(search);
  }, [search]);

  // Handle click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowLocationDropdown(false);
        setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // OpenStreetMap location suggestions
  useEffect(() => {
    if (!location || location.length < 2) {
      setLocationSuggestions([]);
      setShowLocationDropdown(false);
      if (activeDropdown === "location") {
        setActiveDropdown(null);
      }
      return;
    }

    const fetchLocations = async () => {
      setIsLoadingLocations(true);
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?city=${encodeURIComponent(
            location
          )}&format=json&addressdetails=1&limit=10`
        );
        const data: PlaceResult[] = await response.json();

        const formattedResults = data
          .map((place) => {
            const city = place.address.city || place.address.town || place.address.village;
            let state = place.address.state_code
              ? place.address.state_code.toUpperCase()
              : "";

            if (!state && place.address.state) {
              state = place.address.state.slice(0, 2).toUpperCase();
            }

            if (!city) return "";
            return state ? `${city}, ${state}` : city;
          })
          .filter((v) => v.trim() !== "");

        const uniqueResults = Array.from(new Set(formattedResults));
        setLocationSuggestions(uniqueResults);
        setShowLocationDropdown(uniqueResults.length > 0);
        if (uniqueResults.length > 0) {
          setActiveDropdown("location");
        }
      } catch (error) {
        console.error("Error fetching locations:", error);
        setLocationSuggestions([]);
      } finally {
        setIsLoadingLocations(false);
      }
    };

    const timeoutId = setTimeout(fetchLocations, 400);
    return () => clearTimeout(timeoutId);
  }, [location, activeDropdown]);

  const handleLocationSelect = (selected: string) => {
    setLocation(selected);
    setShowLocationDropdown(false);
    setActiveDropdown(null);
  };

  const handleSearch = () => {
    if (searchQuery.trim() || location.trim()) {
      // উভয় সার্চ টার্ম এবং লোকেশন স্টোরে সংরক্ষণ করুন
      setSearch(searchQuery.trim());
      // লোকেশনটি সার্চ স্টোরে সংরক্ষণ করুন (যদি আপনার ফিল্টার স্টোরে লোকেশন ফিল্ড থাকে)
      // অথবা URL-এ প্যারামিটার হিসেবে পাঠান
      
      // URL তৈরি করুন যেখানে সার্চ টার্ম এবং লোকেশন উভয়ই থাকবে
      const searchParams = new URLSearchParams();
      if (searchQuery.trim()) {
        searchParams.append('q', searchQuery.trim());
      }
      if (location.trim()) {
        searchParams.append('location', location.trim());
      }
      
      router.push(`/search-result?${searchParams.toString()}`);
      onResultClick?.();
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSearch();
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearch("");
    setActiveDropdown(null);
  };

  const clearLocation = () => {
    setLocation("");
    setShowLocationDropdown(false);
    setActiveDropdown(null);
  };

  const handleLocationFocus = () => {
    if (locationSuggestions.length > 0) {
      setShowLocationDropdown(true);
      setActiveDropdown("location");
    }
  };

  const shouldShowLocationDropdown = showLocationDropdown && activeDropdown === "location";

  // Styles
  const containerClass =
    variant === "mobile"
      ? "relative"
      : "hidden md:flex flex-1 max-w-2xl mx-auto items-center relative bg-[#F7F8F8] rounded-lg";
  const inputContainerClass =
    variant === "mobile" ? "flex flex-col" : "flex items-center w-full";
  const searchInputClass =
    variant === "mobile"
      ? "flex-1 border-none focus-visible:ring-0 focus-visible:ring-offset-0 text-gray-800 px-4 bg-transparent outline-none"
      : "pl-10 w-full h-[48px] focus-visible:ring-0 focus-visible:ring-offset-0 text-gray-800 bg-[#F7F8F8] rounded-lg border border-gray-200 shadow-inner rounded-none rounded-l-lg border-none";
  const locationInputClass =
    variant === "mobile"
      ? "flex-1 border-none focus-visible:ring-0 focus-visible:ring-offset-0 text-gray-800 px-4 bg-transparent outline-none "
      : "pl-10 w-full md:w-48 h-[48px] border-none focus-visible:ring-0 focus-visible:ring-offset-0 text-gray-800 bg-[#F7F8F8] rounded-lg shadow-inner rounded-none";
  const locationDropdownClass =
    "absolute z-50 mt-1 w-full bg-white rounded-lg shadow-lg border border-gray-200 max-h-[200px] overflow-y-auto";

  return (
    <div className={containerClass} ref={searchRef}>
      <div className={inputContainerClass}>
        {/* Search Input */}
        <div className="flex-1 relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 h-5 w-5" />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Guitar, strings, restringing..."
              className={searchInputClass}
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        <div className="h-[35px] border-r border-r-gray-300"></div>

        {/* Location Input */}
        <div className="flex-1 md:flex-none relative">
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 h-5 w-5" />
            <Input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              onKeyDown={handleKeyPress}
              onFocus={handleLocationFocus}
              placeholder="Location"
              className={locationInputClass}
            />
            {location && (
              <button
                onClick={clearLocation}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* Location Suggestions Dropdown */}
          {shouldShowLocationDropdown && (
            <div className={locationDropdownClass}>
              {isLoadingLocations ? (
                <div className="p-4 text-center">Loading locations...</div>
              ) : locationSuggestions.length === 0 ? (
                <div className="p-4 text-gray-500">No locations found</div>
              ) : (
                <ul>
                  {locationSuggestions.map((item, index) => (
                    <li
                      key={index}
                      className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleLocationSelect(item)}
                    >
                      <div className="p-3 flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span>{item}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        {/* Search Button */}
        <div>
          <Button className="h-[48px] -ml-1" onClick={handleSearch}>
            <Search />
          </Button>
        </div>

        {variant === "mobile" && (
          <button
            onClick={handleSearch}
            className="bg-[#00998E] text-white rounded-lg px-4 py-2 hover:bg-teal-700 transition-colors"
          >
            <Search className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
};

export default SearchBar;