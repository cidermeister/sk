"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { TributeData } from "@/components/galaxy/Star";

interface SearchProps {
  tributes: TributeData[];
  onSelect: (tribute: TributeData) => void;
}

export function SearchBar({ tributes, onSelect }: SearchProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const filtered = query.length > 0
    ? tributes.filter(t => t.name.toLowerCase().includes(query.toLowerCase()))
    : [];

  return (
    <div className="absolute top-20 left-1/2 -translate-x-1/2 w-full max-w-md z-40 px-4">
      <div className="relative">
        <div className="flex items-center bg-space-900/80 backdrop-blur-md border border-white/20 rounded-full px-4 py-2 shadow-lg">
          <Search className="w-5 h-5 text-gray-400 mr-2" />
          <input
            type="text"
            placeholder="Search for a star..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            className="bg-transparent border-none outline-none text-white w-full placeholder:text-gray-500"
          />
        </div>

        {isOpen && filtered.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-space-800/95 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden shadow-2xl max-h-60 overflow-y-auto">
            {filtered.map(tribute => (
              <button
                key={tribute.id}
                className="w-full text-left px-4 py-3 hover:bg-white/5 border-b border-white/5 last:border-none text-white transition-colors"
                onClick={() => {
                  onSelect(tribute);
                  setQuery("");
                  setIsOpen(false);
                }}
              >
                {tribute.name}
              </button>
            ))}
          </div>
        )}

        {isOpen && query.length > 0 && filtered.length === 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-space-800/95 backdrop-blur-xl border border-white/10 rounded-xl p-4 text-center text-gray-400 shadow-2xl">
            No stars found for &quot;{query}&quot;
          </div>
        )}
      </div>
    </div>
  );
}
