import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const productName = searchParams.get('name');

  if (!productName) {
    return NextResponse.json({ error: 'Product name parameter is required.' }, { status: 400 });
  }

  try {
    const filePath = path.join(process.cwd(), 'waltermart_products_1.json');
    const fileContents = await fs.readFile(filePath, 'utf8');
    const products = JSON.parse(fileContents);

    const lowerCaseProductName = productName.toLowerCase();

    const filteredProducts = products.filter((product: any) => {
      // Ensure product.name exists and is a string before calling toLowerCase
      return product.name && typeof product.name === 'string' && product.name.toLowerCase().includes(lowerCaseProductName);
    });

    // Limit to 5 results if more than 5
    const limitedProducts = filteredProducts.slice(0, 5);

    return NextResponse.json(limitedProducts);
  } catch (error) {
    console.error('Error searching products:', error);
    return NextResponse.json({ error: 'Failed to retrieve products.' }, { status: 500 });
  }
}
