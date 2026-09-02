import { Book } from './book';
import { User } from './user';

export interface Borrowing {
  _id: string;
  bookId: string;
  userId: string;
  book: Book;
  user: User;
  borrowedDate: Date;
  returnDate: Date;
  returnedDate?: Date;
  status: 'borrowed' | 'returned' | 'overdue';
  createdAt?: Date;
  updatedAt?: Date;
}