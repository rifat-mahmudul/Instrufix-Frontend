"use client";
import PathTracker from "@/components/shared/PathTracker";
import React, { useEffect, useState } from "react";
import ClaimReviewBusiness from "./ClaimReviewBusiness";
import { useSession } from "next-auth/react";
import LoginModal from "@/components/business/modal/login-modal";
import CheckCustomerModal from "@/components/business/modal/check-customer-modal";

const ClaimBusiness = () => {
  const session = useSession();
  const status = session?.status;
  const role = session?.data?.user?.userType;
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [isCheckCustomerModal, setIsCheckCustomerModal] =
    useState<boolean>(false);

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
          title={"Search and claim your business to gain exclusive rights."}
        />
      </div>

      <div>
        <ClaimReviewBusiness />
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

export default ClaimBusiness;
