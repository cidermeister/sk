"use client";

import { useState } from "react";
import { GalaxyScene } from "@/components/galaxy/GalaxyScene";
import { SearchBar } from "@/components/galaxy/SearchBar";
import { TributePopup } from "@/components/galaxy/TributePopup";
import { TributeData } from "@/components/galaxy/Star";
import { calculateStarPosition } from "@/components/galaxy/utils";

export function GalaxyClient({ tributes }: { tributes: TributeData[] }) {
  const [selectedTribute, setSelectedTribute] = useState<TributeData | null>(null);
  const [targetPosition, setTargetPosition] = useState<[number, number, number] | null>(null);

  const handleStarClick = (tribute: TributeData, position: [number, number, number]) => {
    setSelectedTribute(tribute);
    setTargetPosition(position);
  };

  const handleSearchSelect = (tribute: TributeData) => {
    // Find the index to calculate the position
    const index = tributes.findIndex(t => t.id === tribute.id);
    if (index !== -1) {
      const position = calculateStarPosition(tribute.birthDate, index, tribute.id);
      setSelectedTribute(tribute);
      setTargetPosition(position);
    }
  };

  return (
    <>
      <SearchBar tributes={tributes} onSelect={handleSearchSelect} />
      <GalaxyScene
        tributes={tributes}
        onStarClick={handleStarClick}
        targetPosition={targetPosition}
      />
      {selectedTribute && (
        <TributePopup
          tribute={selectedTribute}
          onClose={() => {
            setSelectedTribute(null);
            setTargetPosition(null);
          }}
        />
      )}
    </>
  );
}
