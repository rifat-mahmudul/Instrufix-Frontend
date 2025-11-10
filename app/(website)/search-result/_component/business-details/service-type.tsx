/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";
import React from "react";

interface Service {
  newInstrumentName: string;
  pricingType: string;
  price: string;
  minPrice: string;
  maxPrice: string;
  selectedInstrumentsGroup: string;
  instrumentFamily: string;
}

interface MusicLesson {
  newInstrumentName: string;
  pricingType: string;
  price: string;
  minPrice: string;
  maxPrice: string;
  selectedInstrumentsGroupMusic: string;
}

interface Business {
  services: Service[];
  musicLessons: MusicLesson[];
  buyInstruments: boolean;
  sellInstruments: boolean;
  offerMusicLessons: boolean;
  rentInstruments: boolean;
  businessInfo: {
    website: string;
  };
}

interface ServiceTypeProps {
  singleBusiness: Business;
  expandedSections: {
    repair: boolean;
    lessons: boolean;
    otherService: boolean;
  };
  toggleSection: (section: "repair" | "lessons" | "otherService") => void;
  groupedServices: Record<string, Service[]>;
  formatPrice: (service: Service | MusicLesson) => string;
}

const ServiceType: React.FC<ServiceTypeProps> = ({
  singleBusiness,
  expandedSections,
  toggleSection,
  groupedServices,
  formatPrice,
}) => {
  const groupedLessons = singleBusiness.musicLessons.reduce(
    (acc: Record<string, MusicLesson[]>, lesson) => {
      const family = "Strings";
      if (!acc[family]) acc[family] = [];
      acc[family].push(lesson);
      return acc;
    },
    {}
  );

  const renderGroupedItems = (
    groupedData: Record<string, any[]>,
    isLesson = false
  ) => (
    <div className="space-y-4">
      {Object.entries(groupedData).map(([family, items]) => {
        const groupedByInstrument = items.reduce(
          (acc: Record<string, any[]>, item) => {
            const key = isLesson
              ? item.selectedInstrumentsGroupMusic
              : item.selectedInstrumentsGroup;
            if (!acc[key]) acc[key] = [];
            acc[key].push(item);
            return acc;
          },
          {}
        );

        return (
          <div key={family}>
            <h4 className="font-medium text-primary text-xl mb-2">{family}</h4>

            <div className="grid lg:grid-cols-2 gap-x-12">
              {Object.entries(groupedByInstrument).map(
                ([groupName, groupItems]) => (
                  <div key={groupName}>
                    <div className="font-medium text-lg mt-2">{groupName}</div>

                    {groupItems.map((item, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center py-1"
                      >
                        <div className="text-gray-700">
                          {item.newInstrumentName}
                        </div>
                        <div className="font-medium text-xs text-gray-700">
                          {formatPrice(item)}
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="pt-8 space-y-8 border-b border-gray-200 pb-10">
      <h2 className="text-xl font-semibold mb-4">Service Type</h2>

      {/* 🔧 Repair Services */}
      {singleBusiness.services.length > 0 && (
        <div className="shadow-[0px_2px_12px_0px_#003D3914] p-8 rounded-lg">
          <button
            onClick={() => toggleSection("repair")}
            className="w-full flex items-center justify-between text-left mb-4"
          >
            <h3 className="font-medium text-2xl">Repair</h3>
            {expandedSections.repair ? (
              <ChevronUp className="w-5 h-5" />
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}
          </button>

          {expandedSections.repair && renderGroupedItems(groupedServices)}
        </div>
      )}

      {/* 🎵 Music Lessons */}
      {singleBusiness.musicLessons.length > 0 && (
        <div className="shadow-[0px_2px_12px_0px_#003D3914] p-8 rounded-lg">
          <button
            onClick={() => toggleSection("lessons")}
            className="w-full flex items-center justify-between text-left mb-4"
          >
            <h3 className="font-medium text-2xl">Lessons</h3>
            {expandedSections.lessons ? (
              <ChevronUp className="w-5 h-5" />
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}
          </button>

          {expandedSections.lessons && renderGroupedItems(groupedLessons, true)}
        </div>
      )}

      {/* 💼 Other Services */}
      <div className="shadow-[0px_2px_12px_0px_#003D3914] p-4 rounded-lg">
        <button
          onClick={() => toggleSection("otherService")}
          className="w-full flex items-center justify-between text-left"
        >
          <h3 className="font-medium text-2xl">Other Services</h3>
          {expandedSections.otherService ? (
            <ChevronUp className="w-5 h-5" />
          ) : (
            <ChevronDown className="w-5 h-5" />
          )}
        </button>

        {expandedSections.otherService && (
          <div className="py-4 text-gray-700 leading-relaxed">
            The business provides{" "}
            {singleBusiness.buyInstruments && (
              <span className="font-semibold">buying, </span>
            )}
            {singleBusiness.sellInstruments && (
              <span className="font-semibold">selling, </span>
            )}
            {singleBusiness.offerMusicLessons && (
              <span className="font-semibold">trading, </span>
            )}
            {singleBusiness.rentInstruments && (
              <span className="font-semibold">rental </span>
            )}
            services. Please{" "}
            <Link
              href={singleBusiness.businessInfo.website}
              target="_blank"
              className="text-primary font-semibold"
            >
              contact the business
            </Link>{" "}
            to get a personalized quote.
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiceType;
