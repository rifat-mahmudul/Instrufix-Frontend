"use client";
import React, { useEffect, useState } from "react";
import BusinessHours from "../BusinessHours";
import BusinessInform from "../BusinessInform";
import Service from "../Service";
import { useMutation, useQuery } from "@tanstack/react-query";
import { addBusiness, getAllInstrument, updateBusiness } from "@/lib/api";
import { Loader } from "lucide-react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useBusinessContext } from "@/lib/business-context";
import axios from "axios";
import LoginModal from "../modal/login-modal";
import BusinessSuccessModal from "../modal/bussiness-success-modal";
import LogOutBusinessSuccessModal from "../modal/log-out-business-success-modal";
import TrackSubmissionModal from "../modal/track-submission-modal";

interface ServiceType {
  newInstrumentName: string;
  pricingType: string;
  minPrice: string;
  maxPrice: string;
  price: string;
  selectedInstrumentsGroup?: string;
  instrumentFamily?: string;
  selectedInstrumentsGroupMusic?: string;
}

type OptionKey = "buy" | "sell" | "trade" | "rent";

const daysOfWeek = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const defaultTime = {
  startTime: "09:00",
  startMeridiem: "AM",
  endTime: "05:00",
  endMeridiem: "PM",
};

const AddBusiness = () => {
  const session = useSession();
  const isLoggedIn = session?.status;
  const pathName = usePathname();

  const { selectedBusinessId } = useBusinessContext();

  // modal control
  const [serviceModal, setServiceModal] = useState(false);
  const [instrumentFamily, setInstrumentFamily] = useState<string>("");
  const [ServiceModalMusic, setServiceModalMusic] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isBusinessSuccessModalOpen, setIsBusinessSuccessModalOpen] =
    useState(false);
  const [
    isLogoutBusinessSuccessModalOpen,
    setIsLogoutBusinessSuccessModalOpen,
  ] = useState(false);
  const [isTrackSubmissionModalOpen, setIsTrackSubmissionModalOpen] =
    useState(false);

  // control instrument family
  const [selectedInstruments, setSelectedInstruments] = useState<string[]>([]);
  const [selectedInstrumentsMusic, setSelectedInstrumentsMusic] = useState<
    string[]
  >([]);

  //control selected instrument group
  const [selectedInstrumentsGroup, setSelectedInstrumentsGroup] = useState("");
  const [selectedInstrumentsGroupMusic, setSelectedInstrumentsGroupMusic] =
    useState<string>("");

  //service Modal related
  const [newInstrumentName, setNewInstrumentName] = useState("");
  const [pricingType, setPricingType] = useState("exact");
  const [price, setPrice] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selected, setSelected] = useState<ServiceType[]>([]);
  const [selectedMusic, setSelectedMusic] = useState<ServiceType[]>([]);

  const handleAddInstrument = () => {
    setSelected((prev) => [
      ...prev,
      {
        newInstrumentName: newInstrumentName,
        pricingType: pricingType,
        price: price,
        minPrice: minPrice,
        maxPrice: maxPrice,
        selectedInstrumentsGroup: selectedInstrumentsGroup,
        instrumentFamily: instrumentFamily,
      },
    ]);
    setNewInstrumentName("");
    setPricingType("");
    setPrice("");
    setMinPrice("");
    setMaxPrice("");

    setServiceModal(false);
  };

  const handleAddInstrumentMusic = () => {
    setSelectedMusic((prev) => [
      ...prev,
      {
        newInstrumentName: newInstrumentName,
        pricingType: pricingType,
        price: price,
        minPrice: minPrice,
        maxPrice: maxPrice,
        selectedInstrumentsGroupMusic: selectedInstrumentsGroupMusic,
        instrumentFamily: instrumentFamily,
      },
    ]);
    setNewInstrumentName("");
    setPricingType("");
    setPrice("");
    setMinPrice("");
    setMaxPrice("");

    setServiceModalMusic(false);
  };

  const { data: allInstrument } = useQuery({
    queryKey: ["get-all-instrument"],
    queryFn: async () => {
      const res = await getAllInstrument();
      return res?.data;
    },
  });

  // buy / cell/ trade / rent related state

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selectedOptions, setSelectedOptions] = useState<
    Record<OptionKey, boolean>
  >({
    buy: false,
    sell: false,
    trade: false,
    rent: false,
  });

  //business hour
  const [businessHours, setBusinessHours] = React.useState(
    daysOfWeek.map((day) => ({
      day,
      enabled: false, // default to false
      ...defaultTime,
    }))
  );

  //get single Business by selected ID
  const {
    data: singleBusiness = {},
    // isLoading,
    refetch,
  } = useQuery({
    queryKey: ["get-single-business", selectedBusinessId],
    queryFn: async () => {
      const res = await axios(
        `${process.env.NEXT_PUBLIC_API_URL}/business/${selectedBusinessId}`
      );
      return res?.data?.data;
    },
  });

  //all services here
  const allServices = singleBusiness?.services;

  const musicLessons = singleBusiness?.musicLessons;

  const businessHoursEnables = singleBusiness?.businessHours;

  //business information related
  const [images, setImages] = useState<string[]>([]);
  const [businessMan, setBusinessName] = useState("");
  const [addressName, setAddressName] = useState("");
  const [description, setDescription] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");

  // show all data initially
  useEffect(() => {
    if (
      pathName === "/business-dashboard/profile" &&
      singleBusiness?.businessInfo
    ) {
      //business info
      setBusinessName(singleBusiness.businessInfo.name || "");
      setAddressName(singleBusiness.businessInfo.address || "");
      setDescription(singleBusiness.businessInfo.description || "");
      setPhoneNumber(singleBusiness.businessInfo.phone || "");
      setEmail(singleBusiness.businessInfo.email || "");
      setWebsite(singleBusiness.businessInfo.website || "");
      if (singleBusiness.businessInfo.image) {
        setImages(singleBusiness.businessInfo.image);
      }

      // Set selected instruments from services
      const selectedGroups = allServices
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((item: any) => item?.selectedInstrumentsGroup)
        .filter(Boolean);

      setSelectedInstruments(selectedGroups);

      const selectedMusicGroups = musicLessons
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((item: any) => item?.selectedInstrumentsGroupMusic)
        .filter(Boolean);
      setSelectedInstrumentsMusic(selectedMusicGroups);

      if (businessHoursEnables && Array.isArray(businessHoursEnables)) {
        const updatedHours = daysOfWeek.map((day) => {
          const found = businessHoursEnables.find(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (item: any) => item.day === day
          );
          return found
            ? {
                day: found.day,
                enabled: found.enabled,
                startTime: found.startTime || defaultTime.startTime,
                startMeridiem: found.startMeridiem || defaultTime.startMeridiem,
                endTime: found.endTime || defaultTime.endTime,
                endMeridiem: found.endMeridiem || defaultTime.endMeridiem,
              }
            : {
                day,
                enabled: false,
                ...defaultTime,
              };
        });

        setBusinessHours(updatedHours);
      }

      if (singleBusiness) {
        setSelectedOptions({
          buy: singleBusiness?.buyInstruments || false,
          sell: singleBusiness?.sellInstruments || false,
          trade: singleBusiness?.tradeInstruments || false,
          rent: singleBusiness?.rentInstruments || false,
        });
      }

      // Set services for instrument pricing list
      if (singleBusiness?.services?.length > 0) {
        setSelected(singleBusiness.services);

        // Extract all unique instrument group names from services
        const instrumentGroups = singleBusiness.services.map(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (s: any) => s.selectedInstrumentsGroup
        );

        // Prefill selected instruments
        setSelectedInstruments(instrumentGroups);

        // Set the first instrument group as selected for pricing list view
        setSelectedInstrumentsGroup(instrumentGroups[0]);
      }

      if (singleBusiness?.musicLessons?.length > 0) {
        setSelectedMusic(singleBusiness.musicLessons);

        const musicGroups = singleBusiness.musicLessons.map(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (s: any) => s.selectedInstrumentsGroupMusic
        );

        setSelectedInstrumentsMusic(musicGroups);
        setSelectedInstrumentsGroupMusic(musicGroups[0]);
      }
    }
  }, [
    singleBusiness,
    pathName,
    allServices,
    musicLessons,
    businessHoursEnables,
  ]);

  const handleUploadImage = () => {
    const input = document.getElementById("image_input");
    if (input) {
      input.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const imageURLs = Array.from(files).map((file) =>
      URL.createObjectURL(file)
    );

    // Combine with existing images
    setImages((prev) => [...prev, ...imageURLs]);
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handelOkay = () => {
    setIsTrackSubmissionModalOpen(true);
    setIsLogoutBusinessSuccessModalOpen(false);
  };

  //post form data
  const { mutateAsync: addBusinessData, isPending } = useMutation({
    mutationKey: ["add-business"],
    mutationFn: async (data: FormData) => {
      const res = await addBusiness(data);
      if (!res.success) {
        throw new Error(
          res.response.data.message || "Business creation failed"
        );
      }
      return res;
    },
    onSuccess: () => {
      return pathName === "/add-my-business" ||
        pathName === "/business-dashboard/add-my-business"
        ? setIsBusinessSuccessModalOpen(true)
        : setIsLogoutBusinessSuccessModalOpen(true);
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (error: any) => {
      toast.error(error?.message || "Failed to add business!");
    },
  });

  //post form data
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isLoggedIn === "unauthenticated") {
      return setIsLoginModalOpen(true);
    }

    const formData = new FormData();
    const imageInput = document.getElementById(
      "image_input"
    ) as HTMLInputElement;
    const imageFiles = imageInput?.files ? Array.from(imageInput.files) : [];

    imageFiles.forEach((file) => {
      formData.append("image", file);
    });

    const businessData = {
      businessInfo: {
        name: businessMan,
        address: addressName,
        description,
        phone: phoneNumber,
        email,
        website,
      },
      services: selected.map((service) => ({
        newInstrumentName: service.newInstrumentName,
        pricingType: service.pricingType,
        price: service.price,
        minPrice: service.minPrice,
        maxPrice: service.maxPrice,
        selectedInstrumentsGroup: service.selectedInstrumentsGroup,
        instrumentFamily: service.instrumentFamily,
      })),
      musicLessons: selectedMusic.map((lesson) => ({
        newInstrumentName: lesson.newInstrumentName,
        pricingType: lesson.pricingType,
        price: lesson.price,
        minPrice: lesson.minPrice,
        maxPrice: lesson.maxPrice,
        selectedInstrumentsGroupMusic: lesson.selectedInstrumentsGroupMusic,
      })),
      businessHours: businessHours.map((hour) => ({
        day: hour.day, // Must match enum values exactly
        startTime: hour.startTime,
        startMeridiem: hour.startMeridiem,
        endTime: hour.endTime,
        endMeridiem: hour.endMeridiem,
        enabled: hour.enabled,
      })),
      buyInstruments: selectedOptions.buy,
      sellInstruments: selectedOptions.sell,
      offerMusicLessons: selectedMusic.length > 0,
      status: "pending",
      isVerified: false,
    };

    formData.append("data", JSON.stringify(businessData));

    await addBusinessData(formData);
  };

  const handleLogOutSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData();
    const imageInput = document.getElementById(
      "image_input"
    ) as HTMLInputElement;
    const imageFiles = imageInput?.files ? Array.from(imageInput.files) : [];

    imageFiles.forEach((file) => {
      formData.append("image", file);
    });

    const businessData = {
      businessInfo: {
        name: businessMan,
        address: addressName,
        description,
        phone: phoneNumber,
        email,
        website,
      },
      services: selected.map((service) => ({
        newInstrumentName: service.newInstrumentName,
        pricingType: service.pricingType,
        price: service.price,
        minPrice: service.minPrice,
        maxPrice: service.maxPrice,
        selectedInstrumentsGroup: service.selectedInstrumentsGroup,
        instrumentFamily: service.instrumentFamily,
      })),
      musicLessons: selectedMusic.map((lesson) => ({
        newInstrumentName: lesson.newInstrumentName,
        pricingType: lesson.pricingType,
        price: lesson.price,
        minPrice: lesson.minPrice,
        maxPrice: lesson.maxPrice,
        selectedInstrumentsGroupMusic: lesson.selectedInstrumentsGroupMusic,
      })),
      businessHours: businessHours.map((hour) => ({
        day: hour.day, // Must match enum values exactly
        startTime: hour.startTime,
        startMeridiem: hour.startMeridiem,
        endTime: hour.endTime,
        endMeridiem: hour.endMeridiem,
        enabled: hour.enabled,
      })),
      buyInstruments: selectedOptions.buy,
      sellInstruments: selectedOptions.sell,
      offerMusicLessons: selectedMusic.length > 0,
      status: "pending",
      isVerified: false,
    };

    formData.append("data", JSON.stringify(businessData));

    await addBusinessData(formData);
  };

  //update form data
  const { mutateAsync: updateBusinessData, isPending: isUpdating } =
    useMutation({
      mutationKey: ["update-business"],
      mutationFn: async ({
        id,
        formData,
      }: {
        id: string;
        formData: FormData;
      }) => {
        const res = await updateBusiness(id, formData);
        if (!res.success) {
          throw new Error(res.error || "Business update failed");
        }
        return res;
      },
      onSuccess: () => {
        toast.success("Business updated successfully!");
        refetch();
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onError: (error: any) => {
        toast.error(error?.message || "Failed to update business!");
      },
    });

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!selectedBusinessId) return toast.error("Business ID missing!");

    const formData = new FormData();

    // Add newly selected image files from input
    const imageInput = document.getElementById(
      "image_input"
    ) as HTMLInputElement;
    const imageFiles = imageInput?.files ? Array.from(imageInput.files) : [];

    imageFiles.forEach((file) => {
      formData.append("image", file);
    });

    // ✅ Keep existing image URLs when updating
    const businessData = {
      businessInfo: {
        name: businessMan,
        address: addressName,
        description,
        phone: phoneNumber,
        email,
        website,
        image: images, // 👈 include existing image URLs
      },
      services: selected.map((service) => ({
        newInstrumentName: service.newInstrumentName,
        pricingType: service.pricingType,
        price: service.price,
        minPrice: service.minPrice,
        maxPrice: service.maxPrice,
        selectedInstrumentsGroup: service.selectedInstrumentsGroup,
        instrumentFamily: service.instrumentFamily,
      })),
      musicLessons: selectedMusic.map((lesson) => ({
        newInstrumentName: lesson.newInstrumentName,
        pricingType: lesson.pricingType,
        price: lesson.price,
        minPrice: lesson.minPrice,
        maxPrice: lesson.maxPrice,
        selectedInstrumentsGroupMusic: lesson.selectedInstrumentsGroupMusic,
      })),
      businessHours: businessHours.map((hour) => ({
        day: hour.day,
        startTime: hour.startTime,
        startMeridiem: hour.startMeridiem,
        endTime: hour.endTime,
        endMeridiem: hour.endMeridiem,
        enabled: hour.enabled,
      })),
      buyInstruments: selectedOptions.buy,
      sellInstruments: selectedOptions.sell,
      offerMusicLessons: selectedMusic.length > 0,
      status: "pending",
      isVerified: false,
    };

    formData.append("data", JSON.stringify(businessData));

    await updateBusinessData({ id: selectedBusinessId, formData });
  };

  // if (isLoading)
  //   return (
  //     <div className="min-h-[calc(100vh-500px)] flex flex-col items-center justify-center">
  //       Loading...
  //     </div>
  //   );

  return (
    <div>
      <form
        onSubmit={
          pathName === "/business-dashboard/profile"
            ? handleUpdate
            : pathName === "/add-my-business"
            ? handleSubmit
            : handleLogOutSubmit
        }
      >
        {/* business information */}
        <div>
          <div>
            <h1 className="text-[28px] font-semibold">
              1. Business Information
            </h1>
            <p className="text-[#485150] text-[16px]">
              Complete the following fields to provide key details about the
              business
            </p>
          </div>

          <BusinessInform
            website={website}
            email={email}
            phoneNumber={phoneNumber}
            description={description}
            addressName={addressName}
            businessMan={businessMan}
            handleFileChange={handleFileChange}
            handleUploadImage={handleUploadImage}
            images={images}
            handleRemoveImage={handleRemoveImage}
            setAddressName={setAddressName}
            setBusinessName={setBusinessName}
            setDescription={setDescription}
            setEmail={setEmail}
            setPhoneNumber={setPhoneNumber}
            setWebsite={setWebsite}
          />
        </div>

        {/* divider */}
        <div className=" border-b border-gray-200 pt-12"></div>

        {/* services offered */}
        <div className="pt-10">
          <Service
            allInstrument={allInstrument}
            serviceModal={serviceModal}
            setServiceModal={setServiceModal}
            serviceModalMusic={ServiceModalMusic}
            setServiceModalMusic={setServiceModalMusic}
            selectedInstruments={selectedInstruments}
            setSelectedInstruments={setSelectedInstruments}
            selectedInstrumentsMusic={selectedInstrumentsMusic}
            setSelectedInstrumentsMusic={setSelectedInstrumentsMusic}
            selectedInstrumentsGroup={selectedInstrumentsGroup}
            setSelectedInstrumentsGroup={setSelectedInstrumentsGroup}
            selectedInstrumentsGroupMusic={selectedInstrumentsGroupMusic}
            setSelectedInstrumentsGroupMusic={setSelectedInstrumentsGroupMusic}
            newInstrumentName={newInstrumentName}
            setNewInstrumentName={setNewInstrumentName}
            pricingType={pricingType}
            setPricingType={setPricingType}
            price={price}
            setPrice={setPrice}
            handleAddInstrument={handleAddInstrument}
            handleAddInstrumentMusic={handleAddInstrumentMusic}
            minPrice={minPrice}
            setMinPrice={setMinPrice}
            maxPrice={maxPrice}
            setMaxPrice={setMaxPrice}
            selected={selected}
            setSelected={setSelected}
            selectedMusic={selectedMusic}
            setSelectedMusic={setSelectedMusic}
            selectedOptions={selectedOptions}
            setSelectedOptions={setSelectedOptions}
            setInstrumentFamily={setInstrumentFamily}
          />
        </div>

        {/* divider */}
        <div className=" border-b border-gray-200 pt-12"></div>

        {/* Business Hours */}
        <div className="pt-10">
          <div>
            <h1 className="text-[28px] font-semibold">3. Business Hours</h1>
            <p className="text-[#485150] text-[16px]">
              Let your customers know when your shop is open throughout the week
            </p>
          </div>

          <div>
            <BusinessHours
              businessHours={businessHours}
              setBusinessHours={setBusinessHours}
            />
          </div>
        </div>

        {/* divider */}
        <div className=" border-b border-gray-200 pt-12"></div>

        {/* Submit for Verification */}
        <div className="pt-10">
          <div>
            <h1 className="text-[28px] font-semibold">
              4. Submit for Verification
            </h1>
            <p className="text-[#485150] text-[16px]">
              Once you’ve filled out all the information (business details,
              instrument families, services, and pricing), click{" "}
              <strong>Submit</strong> to send the business details for
              verification.
            </p>

            <ul className=" list-disc text-[#485150] text-[16px] ml-5">
              <li>
                Your submission will be reviewed by the admin team for accuracy
                and completeness.
              </li>
              <li>
                You’ll receive an email notification once the business is
                approved and listed on the website.
              </li>
            </ul>
          </div>
        </div>

        {/* submit button */}
        <div className="pt-10 text-center">
          {pathName === "/business-dashboard/profile" ? (
            <button
              type="submit"
              className={`flex-1 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition w-[228px] h-[48px] ${
                isUpdating && "opacity-70"
              }`}
            >
              {isUpdating ? (
                <span className="flex items-center justify-center">
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </span>
              ) : (
                "Update"
              )}
            </button>
          ) : (
            <button
              type="submit"
              className={`flex-1 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition w-[228px] h-[48px] ${
                isPending && "opacity-70"
              }`}
            >
              {isPending ? (
                <span className="flex items-center justify-center">
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </span>
              ) : (
                "Submit"
              )}
            </button>
          )}
        </div>
      </form>

      {isLoginModalOpen && (
        <LoginModal
          isLoginModalOpen={isLoginModalOpen}
          setIsLoginModalOpen={setIsLoginModalOpen}
        />
      )}

      {isBusinessSuccessModalOpen && (
        <BusinessSuccessModal
          isBusinessSuccessModalOpen={isBusinessSuccessModalOpen}
          setIsBusinessSuccessModalOpen={setIsBusinessSuccessModalOpen}
        />
      )}

      {isLogoutBusinessSuccessModalOpen && (
        <LogOutBusinessSuccessModal
          isLogoutBusinessSuccessModalOpen={isLogoutBusinessSuccessModalOpen}
          setIsLogoutBusinessSuccessModalOpen={
            setIsLogoutBusinessSuccessModalOpen
          }
          handelOkay={handelOkay}
        />
      )}

      {isTrackSubmissionModalOpen && (
        <TrackSubmissionModal
          isModalOpen={isTrackSubmissionModalOpen}
          setIsModalOpen={setIsTrackSubmissionModalOpen}
        />
      )}
    </div>
  );
};

export default AddBusiness;
