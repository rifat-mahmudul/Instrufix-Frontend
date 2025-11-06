import Image from "next/image";
import React from "react";
interface ReviewModalProps {
  setIsModalOpen: (isOpen: boolean) => void;
}

const AddPhotoSuccessModal: React.FC<ReviewModalProps> = ({
  setIsModalOpen,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-4">
      <div className="bg-white w-full max-w-md lg:max-w-2xl rounded-lg shadow-lg p-6 ">
        <div className="text-center">
          <h1 className="text-[28px] font-semibold">Photo Submitted</h1>
          <p className="text-lg text-gray-600 mt-3">
            Your submission will be reviewed by the admin team before getting
            posted
          </p>
        </div>

        <div className="flex justify-center my-5">
            <Image 
            src={'/images/review-submit.png'}
            alt="review-submit"
            width={1000}
            height={1000}
            className="h-[128px] w-[128px]"
            />
        </div>

        <div>
            <button onClick={() => setIsModalOpen(false)} className="h-[48px] bg-teal-600 w-full text-center rounded-lg text-white">Okay</button>
        </div>
      </div>
    </div>
  );
};

export default AddPhotoSuccessModal;
