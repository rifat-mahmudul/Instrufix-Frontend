import PathTracker from "@/components/shared/PathTracker";
import React from "react";
import ClaimReviewBusiness from "../claim-my-business/_components/ClaimReviewBusiness";

const page = () => {
  return (
    <div className="container pt-8 pb-16">
      <div>
        <PathTracker
          title={"Search for a business to review"}
        />
      </div>

      <div>
        <ClaimReviewBusiness />
      </div>
    </div>
  );
};

export default page;
