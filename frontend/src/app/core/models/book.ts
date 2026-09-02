export interface Book {
  _id: string;
  title: string;
  author: string;
  description: string;
  category: string;
  pages: number;
  publishedYear: number;
  available: boolean;
  coverImage?: string;
  createdAt?: Date;
  updatedAt?: Date;
}