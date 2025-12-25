"use client";
import AddBusiness from "@/components/business/common/AddBusiness";
import CheckCustomerModal from "@/components/business/modal/check-customer-modal";
import LoginModal from "@/components/business/modal/login-modal";
import PathTracker from "@/components/shared/PathTracker";
import { useSession } from "next-auth/react";
import React, { useEffect, useState } from "react";

const AddMyBusiness = () => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [isCheckCustomerModal, setIsCheckCustomerModal] =
    useState<boolean>(false);
  const session = useSession();
  const status = session?.status;
  const role = session?.data?.user?.userType;

  useEffect(() => {
    if (status === "loading") {
      setTimeout(() => {
        setIsLoginModalOpen(false);
      }, 1000);
    }

    if (status === "unauthenticated") {
      setInterval(() => {
        setIsLoginModalOpen(true);
      }, 1000);
    }

    if (role === "user") {
      setInterval(() => {
        setIsCheckCustomerModal(true);
      }, 1000);
    }
  }, [status, role]);

  return (
    <div className="container pt-8 pb-16">
      <div>
        <PathTracker
          title={"Please fill out all the details of the business."}
        />
      </div>

      <div className=" border-b border-gray-200 pt-8"></div>

      <div className="pt-8">
        <AddBusiness />
      </div>

      <LoginModal
        isLoginModalOpen={isLoginModalOpen}
        setIsLoginModalOpen={() => setIsLoginModalOpen(false)}
      />

      <CheckCustomerModal
        isLoginModalOpen={isCheckCustomerModal}
        setIsLoginModalOpen={() => setIsCheckCustomerModal(false)}
      />
    </div>
  );
};

export default AddMyBusiness;
