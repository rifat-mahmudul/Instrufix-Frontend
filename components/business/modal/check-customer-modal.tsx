import { Button } from "@/components/ui/button";
import Link from "next/link";
import React from "react";

interface LoginModalProps {
  isLoginModalOpen: boolean;
  setIsLoginModalOpen: (value: boolean) => void;
}

const CheckCustomerModal: React.FC<LoginModalProps> = ({
  isLoginModalOpen,
  setIsLoginModalOpen,
}) => {
  if (!isLoginModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={() => setIsLoginModalOpen(false)}
      ></div>

      {/* Modal Content */}
      <div className="relative bg-white w-full max-w-2xl rounded-2xl shadow-lg p-6 z-10 animate-fadeIn text-center">
        <h2 className="text-2xl font-semibold text-center mb-4">
          Business Account Required
        </h2>

        <p className="text-gray-500 mb-4">
          This feature is exclusively available for business accounts. Regular
          customer accounts cannot add or manage business listings.
        </p>

        <p className="text-gray-600">
          If you need to add a business, please create a business account.
        </p>

        <div>
          <Link href={"/"}>
            <Button className="mt-5 font-semibold">Back To Home</Button>
          </Link>
        </div>

        <button
          onClick={() => setIsLoginModalOpen(false)}
          className="absolute top-3 right-4 text-gray-500 hover:text-gray-700 text-xl"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default CheckCustomerModal;
