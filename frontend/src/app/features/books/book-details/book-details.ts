import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { BookService } from '../../../core/services/book';
import { AuthService } from '../../../core/services/auth';
import { BorrowingService } from '../../../core/services/borrowing';
import { Book } from '../../../core/models/book';

@Component({
  selector: 'app-book-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './book-details.html',  // مش .component.html
  styleUrls: ['./book-details.css']
})
export class BookDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private bookService = inject(BookService);
  private authService = inject(AuthService);
  private borrowingService = inject(BorrowingService);

  book = signal<Book | null>(null);
  isLoading = signal(true);
  isBorrowing = signal(false);

  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadBook(id);
    }
  }

  loadBook(id: string) {
    this.isLoading.set(true);
    this.bookService.getBook(id).subscribe({
      next: (data) => {
        this.book.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading book:', err);
        this.isLoading.set(false);
        this.router.navigate(['/books']);
      }
    });
  }

  borrowBook() {
    if (!this.isLoggedIn) {
      this.router.navigate(['/login']);
      return;
    }

    const book = this.book();
    if (!book) return;

    this.isBorrowing.set(true);
    this.borrowingService.borrowBook(book._id).subscribe({
      next: () => {
        this.isBorrowing.set(false);
        const updatedBook = { ...book, available: false };
        this.book.set(updatedBook);
        alert('Book borrowed successfully!');
      },
      error: (err) => {
        this.isBorrowing.set(false);
        alert(err.error?.message || 'Failed to borrow book');
      }
    });
  }

  goBack() {
    this.router.navigate(['/books']);
  }
}