export type ProductCategory = 'StarterKit' | 'Software' | 'PhysicalGoods' | 'Subscription' | 'Other';
export type ProductStatus = 'active' | 'out_of_stock' | 'discontinued';

export interface Product {
  _id: string;
  productName: string;
  companyRef: string;
  price: number;
  category: ProductCategory;
  imageUrl?: string;
  description?: string;
  status: ProductStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CompanyProductsResponse {
  status: 'success';
  data: {
    company: {
      _id: string;
      companyName: string;
      slug: string;
      category: string;
    };
    products: Product[];
    count: number;
  };
}