"use client";

import React, { useState, useEffect, useRef } from "react";
import { Input } from "../ui/input";
import { MapPin, X } from "lucide-react";

interface LocationAutocompleteProps {
  location: string;
  setLocation: (location: string) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  placeholder?: string;
}

interface PlaceResult {
  display_name: string;
  address: {
    city?: string;
    town?: string;
    village?: string;
    state?: string;
    state_code?: string;
    country?: string;
  };
}

export function LocationAutocomplete({
  location,
  setLocation,
  onKeyDown,
  placeholder = "Search city...",
}: LocationAutocompleteProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch city suggestions from OpenStreetMap (Nominatim)
  useEffect(() => {
    if (!location || location.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const fetchLocations = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?city=${encodeURIComponent(
            location
          )}&format=json&addressdetails=1&limit=10`
        );
        const data: PlaceResult[] = await response.json();

        const formattedResults = data
          .map((place) => {
            const city =
              place.address.city ||
              place.address.town ||
              place.address.village;

            // Try to get 2-letter state code (capitalized)
            let state = place.address.state_code
              ? place.address.state_code.toUpperCase()
              : "";

            // If no state_code, use first two letters of state name
            if (!state && place.address.state) {
              state = place.address.state.slice(0, 2).toUpperCase();
            }

            if (!city) return "";

            // Combine city and short state
            return state ? `${city}, ${state}` : city;
          })
          .filter((v) => v.trim() !== "");

        // Remove duplicates
        const uniqueResults = Array.from(new Set(formattedResults));

        setSuggestions(uniqueResults);
        setShowSuggestions(uniqueResults.length > 0);
      } catch (error) {
        console.error("Error fetching locations:", error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    };

    const timeoutId = setTimeout(fetchLocations, 400);
    return () => clearTimeout(timeoutId);
  }, [location]);

  const handleLocationSelect = (selected: string) => {
    setLocation(selected);
    setShowSuggestions(false);
  };

  const clearLocation = () => {
    setLocation("");
    setShowSuggestions(false);
  };

  const handleFocus = () => {
    if (suggestions.length > 0) setShowSuggestions(true);
  };

  return (
    <div className="relative">
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 h-5 w-5" />
        <Input
          ref={inputRef}
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          onKeyDown={onKeyDown}
          onFocus={handleFocus}
          placeholder={placeholder}
          className="pl-10 w-full h-[48px] border-none focus-visible:ring-0 focus-visible:ring-offset-0 text-gray-800 bg-[#F7F8F8] rounded-lg border border-gray-200 shadow-inner"
        />
        {location && (
          <button
            onClick={clearLocation}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            aria-label="Clear location"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && (
        <div className="absolute z-20 mt-1 w-full bg-white rounded-lg shadow-lg border border-gray-200 max-h-[300px] overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center">Loading locations...</div>
          ) : suggestions.length === 0 ? (
            <div className="p-4 text-gray-500">No locations found</div>
          ) : (
            <ul>
              {suggestions.map((item, index) => (
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
  );
}
