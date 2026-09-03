export interface Book {
  _id?: string;
  title: string;
  author: string;
  pages?: number;
  available: boolean;
  synopsis?: string;
  category?: string;
  publishedYear?: number;
  isbn?: string;
  coverImage?: {
    contentType?: string;
  };
}
