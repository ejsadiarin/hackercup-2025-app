"use client";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import RouteMap from "@/features/map/component/RouteMap";
import GroceryListItem from "../components/grocery-list-item";
import ProductPanel from "../components/product-panel";

interface GroceryItem {
  id: number;
  name: string;
}

interface Product {
  id: number;
  name: string;
  price: number;
  image?: string;
}

export default function GroceryTab() {
  const [items, setItems] = useState<GroceryItem[]>([]);
  const [newItem, setNewItem] = useState("");
  const [origin, setOrigin] = useState<{ lat: number; lng: number }>();
  const [destination, setDestination] = useState<{
    lat: number;
    lng: number;
  }>();
  const [searchResults, setSearchResults] = useState<Product[]>([]);

  const handleAddItem = () => {
    if (!newItem.trim()) return;
    const id = Date.now();
    setItems((prev) => [...prev, { id, name: newItem.trim() }]);
    setNewItem("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleAddItem();
  };

  const handleRemoveItem = (id: number) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  // Fetch products from API based on shopping list items
  useEffect(() => {
    const fetchProducts = async () => {
      const results: Product[] = [];

      for (const item of items) {
        try {
          const res = await fetch(
            `/api/products/search?name=${encodeURIComponent(item.name)}`
          );
          if (!res.ok) continue;
          const data: any[] = await res.json();

          // Map API data to Product type
          const mapped = data.map((p) => ({
            id: p.id,
            name: p.name,
            price: p.unit_price || 0,
            image: p.cover_image
              ? `https://cdn.waltermartdelivery.com.ph/${p.cover_image}`
              : undefined,
          }));

          results.push(...mapped);
        } catch (err) {
          console.error(err);
        }
      }

      setSearchResults(results);
    };

    if (items.length > 0) {
      fetchProducts();
    } else {
      setSearchResults([]);
    }
  }, [items]);

  return (
    <div className="flex flex-col gap-4 pb-12">
      {/* Map */}
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

      {/* Shopping List */}
      <h1 className="font-bold text-4xl mt-10">Shopping List</h1>
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

      {/* Product Panel */}
      <div className="mt-10">
        <ProductPanel products={searchResults} />
      </div>
    </div>
  );
}
