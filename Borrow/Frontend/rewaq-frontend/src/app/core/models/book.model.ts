export interface Book {
  _id: string;
  title: string;
  author: string;
  pages?: number;
  available: boolean;
  coverImage?: {
    data: any;
    contentType: string;
  };
}
