export interface ProductsResponse {
  data: Product[];
  links: Links;
  meta: Meta;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  price: number;
  description: string;
  is_active: number;
  provider_id: number;
  created_at: string;
  updated_at: string;
}

export interface Links {
  first: string;
  last: string;
  prev: string;
  next: string;
}

export interface Meta {
  current_page: number;
  from: number;
  last_page: number;
  links: Link[];
  path: string;
  per_page: number;
  to: number;
  total: number;
}

export interface Link {
  url?: string;
  label: string;
  active: boolean;
}
