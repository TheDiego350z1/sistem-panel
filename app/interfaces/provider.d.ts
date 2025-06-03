export interface ProvidersResponse {
  data: Provider[];
  links: Links;
  meta: Meta;
}

export interface Provider {
  id: number;
  name: string;
  email: string;
  address: string;
  phone: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface Links {
  first: string;
  last: string;
  prev: any;
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
