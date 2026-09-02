export interface Book {
  id: string;
  title: string;
  author: string;
  pages?: number;
  available: boolean;
  hasCover: boolean;
  coverUrl?: string;
}

export interface ApiBook {
  _id: string;
  title: string;
  author: string;
  available: boolean;
  pages?: number;
  coverImage?: { data?: unknown; contentType?: string };
}
