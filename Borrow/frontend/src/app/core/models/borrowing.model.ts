import { Book } from './book.model';

export interface Borrowing {
  _id: string;
  startDate: string;
  endDate: string | null;
  userId: string;
  bookId: Book;
}
