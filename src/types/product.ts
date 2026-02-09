export interface Product {
  id: string;
  title: string;
  location: string;
  country: string;
  duration: string;
  price: number;
  originalPrice?: number;
  rating?: number;
  imageUrl: string;
  category: 'hotel' | 'golf' | 'tour' | 'convenience' | 'insurance';
}

export interface Review {
  id: string;
  productId: string;
  productTitle: string;
  rating: number;
  comment: string;
  images?: string[];
}
