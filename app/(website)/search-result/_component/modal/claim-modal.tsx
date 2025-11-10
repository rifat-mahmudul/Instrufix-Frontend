import Link from "next/link";
import React from "react";

interface LoginModalProps {
  isClaimModalOpen: boolean;
  setIsClaimModalOpen: (value: boolean) => void;
}

const ClaimModal: React.FC<LoginModalProps> = ({
  isClaimModalOpen,
  setIsClaimModalOpen,
}) => {
  if (!isClaimModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={() => setIsClaimModalOpen(false)}
      ></div>

      {/* Modal Content */}
      <div className="relative bg-white w-full max-w-2xl rounded-2xl shadow-lg p-6 z-10 animate-fadeIn text-center">
        <h2 className="text-2xl font-semibold text-center mb-4">
          Claim this business
        </h2>

        <p className="text-gray-500">
          To claim this business, please click the button below and follow the
          steps on the next page.
        </p>

        <div className="flex items-center gap-5 mt-7">
          <button
            onClick={() => setIsClaimModalOpen(false)}
            className="border border-primary py-3 rounded-lg w-1/2 hover:bg-primary hover:text-white"
          >
            cancel
          </button>

          <Link
            href={"/claim-my-business"}
            className="bg-primary text-white py-3 rounded-lg w-1/2 font-semibold"
          >
            <button>Claim Business</button>
          </Link>
        </div>

        <button
          onClick={() => setIsClaimModalOpen(false)}
          className="absolute top-3 right-4 text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default ClaimModal;
