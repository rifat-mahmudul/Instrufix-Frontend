"use client";

import Image from "next/image";
import React, { useState } from "react";
import { Button } from "../ui/button";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const AddBusinessSection = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string>("");
  const router = useRouter();
  const session = useSession();
  const authStatus = session?.status;

  const handleAddBusinessClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (authStatus === "authenticated") {
      setIsModalOpen(true);
    } else {
      router.push("/add-a-business");
    }
  };

  const handleOptionSelect = (option: string) => {
    setSelectedOption(option);
  };

  const handleContinue = () => {
    if (selectedOption === "I'm a customer") {
      window.location.href = "/add-a-business";
    } else if (
      selectedOption === "I'm the business owner" ||
      selectedOption === "I work at the business"
    ) {
      window.location.href = "/add-my-business";
    }
    setIsModalOpen(false);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedOption("");
  };

  return (
    <>
      <div className="border border-gray-200 bg-gray-50 mt-10 p-5 rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex gap-6 items-start md:items-center">
          <div>
            <Image
              src={"/images/location.png"}
              alt="location.png"
              width={1000}
              height={1000}
              className="w-[48px] h-[60px]"
            />
          </div>

          <div>
            <h1 className="font-semibold text-xl">
              Can&apos;t find your business?
            </h1>
            <p className="text-[#485150] text-[16px] mt-2">
              Adding your business to Instrufix is completely free!
            </p>
          </div>
        </div>

        <div className="w-full md:w-auto">
          <Button
            onClick={handleAddBusinessClick}
            className="w-full md:w-auto bg-teal-600 hover:bg-teal-700 text-white px-8 h-[48px]"
          >
            Add Business
          </Button>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                What&apos;s your relationship to the business?
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="space-y-3 mb-6">
              <div
                className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                  selectedOption === "I work at the business"
                    ? "border-teal-600 bg-teal-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                onClick={() => handleOptionSelect("I work at the business")}
              >
                <div className="flex items-center">
                  <div
                    className={`w-4 h-4 rounded-full border mr-3 flex items-center justify-center ${
                      selectedOption === "I work at the business"
                        ? "border-teal-600 bg-teal-600"
                        : "border-gray-400"
                    }`}
                  >
                    {selectedOption === "I work at the business" && (
                      <div className="w-2 h-2 rounded-full bg-white"></div>
                    )}
                  </div>
                  <span>I work at the business</span>
                </div>
              </div>

              <div
                className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                  selectedOption === "I'm the business owner"
                    ? "border-teal-600 bg-teal-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                onClick={() => handleOptionSelect("I'm the business owner")}
              >
                <div className="flex items-center">
                  <div
                    className={`w-4 h-4 rounded-full border mr-3 flex items-center justify-center ${
                      selectedOption === "I'm the business owner"
                        ? "border-teal-600 bg-teal-600"
                        : "border-gray-400"
                    }`}
                  >
                    {selectedOption === "I'm the business owner" && (
                      <div className="w-2 h-2 rounded-full bg-white"></div>
                    )}
                  </div>
                  <span>I&apos;m the business owner</span>
                </div>
              </div>

              <div
                className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                  selectedOption === "I'm a customer"
                    ? "border-teal-600 bg-teal-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                onClick={() => handleOptionSelect("I'm a customer")}
              >
                <div className="flex items-center">
                  <div
                    className={`w-4 h-4 rounded-full border mr-3 flex items-center justify-center ${
                      selectedOption === "I'm a customer"
                        ? "border-teal-600 bg-teal-600"
                        : "border-gray-400"
                    }`}
                  >
                    {selectedOption === "I'm a customer" && (
                      <div className="w-2 h-2 rounded-full bg-white"></div>
                    )}
                  </div>
                  <span>I&lsquo;m a customer</span>
                </div>
              </div>
            </div>

            <Button
              onClick={handleContinue}
              disabled={!selectedOption}
              className={`w-full h-[48px] ${
                selectedOption
                  ? "bg-teal-600 hover:bg-teal-700 text-white"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              Add Business
            </Button>
          </div>
        </div>
      )}
    </>
  );
};

export default AddBusinessSection;
