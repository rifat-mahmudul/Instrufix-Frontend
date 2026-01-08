/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
import { getSession } from "next-auth/react";
import { ReviewType } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
});

// Add request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    const session = await getSession();
    const TOKEN = session?.user?.accessToken;
    if (TOKEN) {
      config.headers.Authorization = `Bearer ${TOKEN}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// User API

// Get user Profile
export const getUserProfile = async () => {
  try {
    const response = await api.get(`/user/profile`);
    return response.data;
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
};

// Update user profile
export async function updateUserProfile(data: any) {
  try {
    const response = await api.put(`/user/update-profile`, data);
    return response.data;
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
}

// Deactivate account
export async function deactivateAccount({
  deactivedReason,
}: {
  deactivedReason: string;
}) {
  try {
    const response = await api.put(`/user/deactive-account`, deactivedReason);
    return response.data;
  } catch (error) {
    console.error("Error deactivating account:", error);
    throw error;
  }
}

// Change password
export async function changePassword(data: any) {
  try {
    const response = await api.post(`/auth/change-password`, data);
    return response.data;
  } catch (error) {
    console.error("Error changing password:", error);
    throw error;
  }
}

// Get user review
export async function getUserReview() {
  try {
    const response = await api.get(`/review/my-review`);
    return response.data;
  } catch (error) {
    console.error("Error fetching user review:", error);
    return error;
  }
}

// Get user photos
export async function getUserPhotos() {
  try {
    const response = await api.get(`/picture/get-all-pictures-by-user`);
    return response.data;
  } catch (error) {
    console.error("Error fetching user photos:", error);
    return error;
  }
}

// Get user businesses
export async function getUserBusinesses() {
  try {
    const response = await api.get(`/business/my-add-business`);
    return response.data;
  } catch (error) {
    console.error("Error fetching user businesses:", error);
    return error;
  }
}

// Business API
export async function getMyBusinesses() {
  try {
    const response = await api.get(`business/my-approved-business`);
    return response.data;
  } catch (error) {
    console.error("Error fetching my businesses:", error);
    return error;
  }
}

// Message API

// Get my chat (for user/customer)
export async function getMyChat(userId: string) {
  try {
    const response = await api.get(`/chat/my-chat/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching my chat:", error);
    return error;
  }
}

// get chat by businessMan
export async function getChatByBusinessMan(businessId: string) {
  try {
    const response = await api.get(`/chat/business-chat/${businessId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching chat by business man:", error);
    return error;
  }
}

// get messages
export async function getMessages(chatId: string) {
  try {
    const response = await api.get(`/message/${chatId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching messages:", error);
    return error;
  }
}

// Send message
export async function sendMessage({ data }: any) {
  try {
    const response = await api.post(`/message/send-message`, data);
    return response.data;
  } catch (error) {
    console.error("Error sending message:", error);
    return error;
  }
}

//add a business
export async function addBusiness(payload: any, queryType: string) {
  try {
    const response = await api.post(`/business/create?type=${queryType}`, payload);
    return response.data;
  } catch (error) {
    console.error("Error sending message:", error);
    return error;
  }
}

//get all business
export async function getAllbusiness() {
  try {
    const res = await api.get("/business");
    return res.data;
  } catch (error) {
    console.error("error fetching all business", error);
    throw error;
  }
}

//get single business
export async function getSingleBusiness(params: string | string[]) {
  try {
    const res = await api.get(`/business/${params}`);
    return res.data;
  } catch (error) {
    console.error("error fetching single business", error);
    return error;
  }
}

// update a business
export async function updateBusiness(id: string, formData: FormData) {
  try {
    const response = await api.patch(`/business/update/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error updating business:", error);
    return {
      success: false,
      error: "Failed to update business",
    };
  }
}

// get business stats
export async function getBusinessStats() {
  try {
    const response = await api.get(`/business/my-Dashboard`);
    return response.data;
  } catch (error) {
    console.error("Error fetching business stats:", error);
    return error;
  }
}

// Admin claim business api

export async function getAllBusinessClaims(query?: {
  claimType?: string;
  time?: string;
  sortBy?: string;
}) {
  try {
    const response = await api.get("/claim-bussiness", {
      params: query,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching business claims:", error);
    throw error; // Better to throw, so React Query can handle it properly
  }
}

export async function updateBusinessClaimStatus(
  claimId: string,
  status: string
) {
  try {
    const response = await api.put(`/claim-bussiness/claim/${claimId}`, {
      status,
    });
    return response.data;
  } catch (error) {
    console.error("Error updating business claim status:", error);
    throw error; // Better to throw, so React Query can handle it properly
  }
}

// Saved API

export async function getSavedBusiness() {
  try {
    const response = await api.get(`/saved-business/my-saved-business`);
    return response.data;
  } catch (error) {
    console.error("Error fetching saved business:", error);
    return error;
  }
}

//post a review
export async function addReview(data: ReviewType) {
  try {
    const formData = new FormData();

    // Send non-file data as JSON string
    formData.append(
      "data",
      JSON.stringify({
        rating: data.rating,
        feedback: data.feedback,
        business: data.business,
      })
    );

    // Append each file
    data.image.forEach((file) => {
      formData.append("image", file);
    });

    const res = await api.post("/review/create", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return res.data;
  } catch (error) {
    console.error("Error submitting review:", error);
    throw error;
  }
}

//get all instrument
export async function getAllInstrument() {
  try {
    const response = await api.get(`/instrument-family`);
    return response.data;
  } catch (error) {
    console.error("Error fetching saved business:", error);
    return error;
  }
}

//get all instrument types
export async function getInstrumentTypes(selectedInstrumentsGroup : string, selectedInstrumentsGroupMusic : string) {
  try {
    const response = await api.get(`/instrument-family?name=${selectedInstrumentsGroup || selectedInstrumentsGroupMusic}&`);
    return response.data;
  } catch (error) {
    console.error("Error fetching saved business:", error);
    return error;
  }
}

//get all notification
export async function getAllNotification() {
  try {
    const response = await api.get(`/notification`);
    return response.data;
  } catch (error) {
    console.error("Error fetching notification:", error);
    return error;
  }
}

//delete notification
export async function deleteNotification(id: string) {
  try {
    const response = await api.delete(`/notification/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching notification:", error);
    return error;
  }
}


//get my review
export async function getMyReview(id : string) {
  try {
    const response = await api.get(`/review/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching notification:", error);
    return error;
  }
}