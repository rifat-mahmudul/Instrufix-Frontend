import { ImageUp, MapPin } from "lucide-react";
import Image from "next/image";
import React, { useState, useEffect, useRef } from "react";
import { MdDelete } from "react-icons/md";

interface BusinessInformProps {
  handleFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleUploadImage: () => void;
  images: string[];
  handleRemoveImage: (index: number) => void;
  setBusinessName: (name: string) => void;
  setAddressName: (address: string) => void;
  setDescription: (description: string) => void;
  setPhoneNumber: (phone: string) => void;
  setEmail: (email: string) => void;
  setWebsite: (website: string) => void;
  businessMan: string;
  addressName: string;
  description: string;
  phoneNumber: string;
  email: string;
  website: string;
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

const BusinessInform: React.FC<BusinessInformProps> = ({
  handleFileChange,
  handleUploadImage,
  images,
  handleRemoveImage,
  setBusinessName,
  setAddressName,
  setDescription,
  setPhoneNumber,
  setEmail,
  setWebsite,
  businessMan,
  addressName,
  description,
  phoneNumber,
  email,
  website,
}) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const addressInputRef = useRef<HTMLInputElement>(null);

  // Fetch location suggestions from OpenStreetMap (Nominatim)
  useEffect(() => {
    if (!addressName || addressName.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const fetchLocations = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
            addressName
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

            const fullAddress = place.display_name;

            // Prefer city, state format if available, otherwise use full address
            if (city && state) {
              return `${city}, ${state}`;
            } else if (city) {
              return city;
            } else {
              // Shorten the full address if it's too long
              return fullAddress.length > 50 
                ? fullAddress.substring(0, 50) + '...' 
                : fullAddress;
            }
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
  }, [addressName]);

  const handleLocationSelect = (selected: string) => {
    setAddressName(selected);
    setShowSuggestions(false);
  };

  const handleAddressFocus = () => {
    if (suggestions.length > 0) setShowSuggestions(true);
  };

  const handleAddressBlur = () => {
    // Delay hiding suggestions to allow for click
    setTimeout(() => setShowSuggestions(false), 200);
  };

  return (
    <div>
      {/* upload photos */}
      <div className="mt-8">
        <label className="text-[24px] font-medium">Business Photos</label>
        <div className="flex gap-5 flex-wrap">
          {/* Upload button */}
          <div className="w-[200px] h-[200px]">
            <input
              type="file"
              name="image"
              id="image_input"
              className="hidden"
              multiple
              accept="image/*"
              onChange={handleFileChange}
            />
            <div
              className="w-full h-full flex items-center justify-center flex-col gap-4 rounded-md cursor-pointer bg-[#F8F8F8] mt-4"
              onClick={handleUploadImage}
            >
              <ImageUp className="text-5xl" />
              <p className="text-center text-xl">Upload Photos</p>
            </div>
          </div>

          {/* Image previews */}
          {images.map((image, index) => (
            <div
              key={index}
              className="relative w-[200px] h-[200px] rounded-lg overflow-hidden mt-4"
            >
              <Image
                src={image}
                alt={`image-${index}`}
                width={1000}
                height={1000}
                className="w-full h-full object-cover"
              />
              <MdDelete
                className="text-[2rem] text-white bg-[#000000ad] p-1 absolute top-1 right-1 rounded cursor-pointer"
                onClick={() => handleRemoveImage(index)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* business details */}
      <div className="mt-10">
        <label className="text-[24px] font-medium">Business Details</label>

        <div className="space-y-6 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <div>
              <label className="block text-md font-medium text-gray-700">
                Name
              </label>
              <input
                type="text"
                placeholder="Business name"
                className="mt-1 w-full rounded-md border border-gray-300 bg-gray-50 px-4 py-2 text-sm focus:outline-none h-[48px]"
                value={businessMan}
                onChange={(e) => setBusinessName(e.target.value)}
              />
            </div>

            {/* Address with Autocomplete */}
            <div className="relative">
              <label className="block text-md font-medium text-gray-700">
                Address
              </label>
              <div className="relative">
                <input
                  ref={addressInputRef}
                  type="text"
                  placeholder="488 San Mateo Ave San Bruno, CA 94066"
                  className="mt-1 w-full rounded-md border border-gray-300 bg-gray-50 px-10 py-2 text-sm focus:outline-none h-[48px]"
                  value={addressName}
                  onChange={(e) => setAddressName(e.target.value)}
                  onFocus={handleAddressFocus}
                  onBlur={handleAddressBlur}
                />
                <MapPin
                  className="absolute top-[50%] left-3 -translate-y-1/2 text-gray-400"
                  size={18}
                />
              </div>

              {/* Suggestions Dropdown */}
              {showSuggestions && (
                <div className="absolute z-20 w-full bg-white rounded-md shadow-lg border border-gray-200 max-h-[300px] overflow-y-auto mt-1">
                  {isLoading ? (
                    <div className="p-3 text-center text-gray-500">Loading locations...</div>
                  ) : suggestions.length === 0 ? (
                    <div className="p-3 text-gray-500">No locations found</div>
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
                            <span className="text-sm">{item}</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-md font-medium text-gray-700">
              Description
            </label>
            <textarea
              rows={3}
              placeholder="Business description"
              className="mt-1 w-full rounded-md border border-gray-300 bg-gray-50 px-4 py-2 text-sm focus:outline-none h-[100px]"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Phone + Email */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-md font-medium text-gray-700">
                Phone Number
              </label>
              <input
                type="text"
                placeholder="(650) 877-0805"
                className="mt-1 w-full rounded-md border border-gray-300 bg-gray-50 px-4 py-2 text-sm focus:outline-none h-[48px]"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-md font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                placeholder="Business email"
                className="mt-1 w-full rounded-md border border-gray-300 bg-gray-50 px-4 py-2 text-sm focus:outline-none h-[48px]"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          {/* Website */}
          <div>
            <label className="block text-md font-medium text-gray-700">
              Website
            </label>
            <input
              type="url"
              placeholder="Business website"
              className="mt-1 w-full rounded-md border border-gray-300 bg-gray-50 px-4 py-2 text-sm focus:outline-none h-[48px]"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessInform;