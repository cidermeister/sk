"use client";

import { TributeData } from "@/components/galaxy/Star";
import { X, Calendar, Music } from "lucide-react";
import Image from "next/image";

interface TributePopupProps {
  tribute: TributeData;
  onClose: () => void;
}

export function TributePopup({ tribute, onClose }: TributePopupProps) {
  const showPhotos = process.env.NEXT_PUBLIC_SHOW_PHOTOS === "true";

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="fixed inset-y-0 right-0 w-full md:w-96 bg-space-900/95 backdrop-blur-xl border-l border-white/10 p-6 z-50 transform transition-transform duration-300 flex flex-col shadow-2xl overflow-y-auto">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
      >
        <X className="w-6 h-6" />
      </button>

      <div className="mt-8 mb-6">
        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-aurora to-aurora-purple mb-2">
          {tribute.name}
        </h2>
        <div className="flex items-center text-sm text-gray-400 gap-2">
          <Calendar className="w-4 h-4" />
          <span>{formatDate(tribute.birthDate)} - {formatDate(tribute.passingDate)}</span>
        </div>
      </div>

      {showPhotos && tribute.photoUrl && (
        <div className="mb-6 rounded-xl overflow-hidden border border-white/10 bg-black relative aspect-square">
          <Image
            src={tribute.photoUrl}
            alt={`Memory of ${tribute.name}`}
            fill
            className="object-cover"
          />
        </div>
      )}

      {tribute.audioUrl && (
        <div className="bg-space-800/50 p-4 rounded-xl border border-white/10 mb-6">
          <div className="flex items-center gap-2 mb-3 text-sm text-gray-300">
            <Music className="w-4 h-4 text-aurora" />
            <span>Voice Memory</span>
          </div>
          <audio
            src={tribute.audioUrl}
            controls
            className="w-full h-10"
            style={{ colorScheme: "dark" }}
          />
        </div>
      )}

      <div className="mt-auto pt-6 border-t border-white/10 text-center text-sm text-gray-500">
        A star shining bright in the Galaxy Memorial
      </div>
    </div>
  );
}
