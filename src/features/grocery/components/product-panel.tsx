"use client";

interface Product {
  id: number;
  name: string;
  price: number | string; // allow string from API
  cover_image?: string;
}

interface ProductPanelProps {
  products: Product[];
}

export default function ProductPanel({ products }: ProductPanelProps) {
  const totalPrice = products.reduce((sum, p) => {
    const price =
      typeof p.price === "string" ? parseFloat(p.price) : p.price || 0;
    return sum + price;
  }, 0);

  return (
    <div className="bg-gray-100 shadow-md rounded-lg p-4 w-full max-w-2xl flex flex-col">
      {/* Header */}
      <h2 className="font-bold text-xl mb-4">Products</h2>

      {/* Product List */}
      <div className="flex-1 max-h-64 overflow-y-auto space-y-2">
        {products.length === 0 ? (
          <p className="text-gray-500 text-center">No products added</p>
        ) : (
          products.map((product) => (
            <div
              key={product.id}
              className="flex items-center gap-4 p-2 bg-white rounded shadow-sm"
            >
              {/* Product Image */}
              <div className="w-12 h-12 bg-gray-300 rounded flex items-center justify-center">
                {product.cover_image ? (
                  <img
                    src={product.cover_image}
                    alt={product.name[0]}
                    className="w-full h-full object-cover rounded"
                  />
                ) : (
                  <span className="text-gray-500 text-sm">Img</span>
                )}
              </div>

              {/* Product Name */}
              <span className="flex-1 text-gray-800">{product.name}</span>

              {/* Product Price */}
              <span className="font-medium text-gray-700">
                ₱{parseFloat(product.price as any).toFixed(2)}
              </span>
            </div>
          ))
        )}
      </div>

      {/* Total Price at Bottom Left */}
      <div className="mt-4 text-gray-700 opacity-50 font-semibold">
        Total: ₱{totalPrice.toFixed(2)}
      </div>
    </div>
  );
}
