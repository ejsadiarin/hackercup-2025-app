"use client";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import RouteMap from "@/features/map/component/RouteMap";
import GroceryListItem from "../components/grocery-list-item";
import ProductPanel from "../components/product-panel";

interface GroceryItem {
  id: number;
  name: string;
  price: number;
}

interface Product {
  id: number;
  name: string;
  price: number | string;
  image?: string;
  cover_image?: string;
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
  const [autocompleteResults, setAutocompleteResults] = useState<Product[]>([]);

  const handleAddItem = (itemName?: string, itemPrice?: number) => {
    const nameToAdd = itemName || newItem;
    const priceToAdd = itemPrice || 0;
    if (!nameToAdd.trim()) return;
    const id = Date.now();
    setItems((prev) => [
      ...prev,
      { id, name: nameToAdd.trim(), price: priceToAdd },
    ]);
    setNewItem("");
    setAutocompleteResults([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleAddItem();
  };

  const handleRemoveItem = (id: number) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  // Fetch products for main panel
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

          const mapped = data.map((p) => ({
            id: p.id,
            name: p.name,
            price: p.unit_price || 0,
            cover_image: p.cover_image
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

    if (items.length > 0) fetchProducts();
    else setSearchResults([]);
  }, [items]);

  // Autocomplete suggestions
  useEffect(() => {
    if (!newItem.trim()) {
      setAutocompleteResults([]);
      return;
    }

    const fetchAutocomplete = async () => {
      try {
        const res = await fetch(
          `/api/products/search?name=${encodeURIComponent(newItem.trim())}`
        );
        if (!res.ok) return;
        const data: any[] = await res.json();

        const mapped = data.map((p) => ({
          id: p.id,
          name: p.name,
          price: p.unit_price || 0,
          cover_image: p.cover_image
            ? `https://cdn.waltermartdelivery.com.ph/${p.cover_image}`
            : undefined,
        }));

        setAutocompleteResults(mapped);
      } catch (err) {
        console.error(err);
      }
    };

    fetchAutocomplete();
  }, [newItem]);

  const totalPrice = items.reduce((sum, i) => sum + i.price, 0);

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

      {/* Total Price */}
      <div className="mt-4 font-semibold text-gray-700">
        Total: ₱{totalPrice.toFixed(2)}
      </div>

      {/* Add New Item */}
      <div className="relative flex flex-col mt-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleAddItem()}
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

        {/* Autocomplete dropdown */}
        {autocompleteResults.length > 0 && (
          <ul className="absolute top-full left-0 right-0 bg-white border border-gray-300 shadow-md z-10 max-h-60 overflow-auto mt-1 rounded-md">
            {autocompleteResults.map((p) => (
              <li
                key={p.id}
                className="px-4 py-2 cursor-pointer hover:bg-gray-100 flex justify-between"
                onClick={() => handleAddItem(p.name, Number(p.price))}
              >
                <span>{p.name}</span>
                <span>₱{Number(p.price).toFixed(2)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
