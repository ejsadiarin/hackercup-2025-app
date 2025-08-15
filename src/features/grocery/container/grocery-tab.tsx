"use client";
import { useState } from "react";
import { cn } from "@/lib/utils";
import RouteMap from "@/features/map/component/RouteMap";
import GroceryListItem from "../components/grocery-list-item";

interface GroceryItem {
  id: number;
  name: string;
}

export default function GroceryTab() {
  const [items, setItems] = useState<GroceryItem[]>([]);
  const [newItem, setNewItem] = useState("");
  const [origin, setOrigin] = useState<{ lat: number; lng: number }>();
  const [destination, setDestination] = useState<{
    lat: number;
    lng: number;
  }>();

  // Add a new grocery item
  const handleAddItem = () => {
    if (!newItem.trim()) return;
    const id = Date.now(); // temporary unique id
    setItems((prev) => [...prev, { id, name: newItem.trim() }]);
    setNewItem("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleAddItem();
  };

  // Remove an item
  const handleRemoveItem = (id: number) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className="flex flex-col gap-4 pb-12">
      {/* Placeholder for map at the top */}
      <RouteMap
        origin={origin}
        destination={destination}
        travelMode="DRIVING"
        showTraffic={true}
        onOriginChange={(loc) => setOrigin({ lat: loc.lat, lng: loc.lng })}
        onDestinationChange={(loc) =>
          setDestination({ lat: loc.lat, lng: loc.lng })
        }
      />

      {/* Shopping List Title */}
      <h1 className="font-bold text-4xl mt-10">Shopping List</h1>

      {/* Grocery List Items */}
      {items.map((item) => (
        <GroceryListItem
          key={item.id}
          item={item}
          onRemove={() => handleRemoveItem(item.id)}
        />
      ))}

      {/* Add New Item */}
      <div className="flex items-center gap-2 mt-4">
        <button
          onClick={handleAddItem}
          className={cn(
            "flex items-center justify-center w-6 h-6 rounded-md",
            "bg-[#A600A9] text-white font-bold hover:bg-[#a600a9c8] transition-colors"
          )}
        >
          +
        </button>
        <input
          type="text"
          placeholder="Add a new item"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyDown={handleKeyDown}
          className="border-b-2 border-black outline-none px-2 py-1 flex-1"
        />
      </div>

      {/* Placeholder for AI agent */}
      <div className="mt-20 flex flex-col items-center justify-center border-2 border-dashed border-gray-400 h-64 w-full rounded-lg">
        <p className="text-gray-500 text-center">
          AI Agent integration screen will appear here
        </p>
      </div>
    </div>
  );
}
