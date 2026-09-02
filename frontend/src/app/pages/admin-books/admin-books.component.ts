import { ChangeDetectionStrategy, Component, OnInit, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BookService, CreateBookRequest } from '../../core/services/book.service';
import { Book } from '../../models/book.model';
import { NavbarComponent } from '../../shared/navbar/navbar.component';

type BookFilter = 'All Books' | 'Available' | 'Borrowed';

@Component({
  selector: 'app-admin-books',
  imports: [FormsModule, NavbarComponent],
  templateUrl: './admin-books.component.html',
  styleUrl: './admin-books.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminBooksComponent implements OnInit {
  readonly bookService = inject(BookService);
  readonly books = this.bookService.books;
  readonly loading = this.bookService.loading;
  readonly error = this.bookService.error;
  readonly pageSize = 8;
  searchTerm = '';
  activeFilter: BookFilter = 'All Books';
  currentPage = 1;
  showModal = false;
  activeAction = '';
  newBook: CreateBookRequest = { title: '', author: '', pages: undefined, available: true };

  readonly filteredBooks = computed(() => {
    const term = this.searchTerm.trim().toLowerCase();
    return this.books().filter((book) => {
      const matchesStatus = this.activeFilter === 'All Books' || (this.activeFilter === 'Available' ? book.available : !book.available);
      return matchesStatus && (!term || `${book.title} ${book.author} ${book.id}`.toLowerCase().includes(term));
    });
  });
  readonly pageCount = computed(() => Math.max(1, Math.ceil(this.filteredBooks().length / this.pageSize)));
  readonly pageNumbers = computed(() => Array.from({ length: Math.min(3, this.pageCount()) }, (_, index) => index + 1));
  readonly pagedBooks = computed(() => {
    const page = Math.min(this.currentPage, this.pageCount());
    return this.filteredBooks().slice((page - 1) * this.pageSize, page * this.pageSize);
  });
  readonly startEntry = computed(() => this.filteredBooks().length ? (Math.min(this.currentPage, this.pageCount()) - 1) * this.pageSize + 1 : 0);
  readonly endEntry = computed(() => Math.min(this.currentPage * this.pageSize, this.filteredBooks().length));
  readonly summaries = computed(() => {
    const books = this.books();
    const available = books.filter((book) => book.available).length;
    const borrowed = books.length - available;
    const availability = books.length ? Math.round((available / books.length) * 100) : 0;
    return [
      { label: 'Total Volumes', value: String(books.length), note: 'Books returned by API', tone: 'aqua' as const, icon: '▣' },
      { label: 'Available', value: String(available), note: 'Available in the catalogue', tone: 'aqua' as const, icon: '▤' },
      { label: 'Borrowed', value: String(borrowed), note: 'Marked unavailable by backend', tone: 'warning' as const, icon: '△' },
      { label: 'Availability', value: `${availability}%`, note: 'Calculated from API data', tone: 'dark' as const, icon: '◌' }
    ];
  });

  ngOnInit(): void { this.bookService.loadBooks(); }
  setFilter(filter: BookFilter): void { this.activeFilter = filter; this.currentPage = 1; }
  resetPage(): void { this.currentPage = 1; }
  toggleAction(id: string): void { this.activeAction = this.activeAction === id ? '' : id; }
  changePage(page: number): void { this.currentPage = Math.min(Math.max(page, 1), this.pageCount()); }
  status(book: Book): string { return book.available ? 'Available' : 'Borrowed'; }
  addBook(): void {
    if (!this.newBook.title.trim() || !this.newBook.author.trim()) return;
    this.bookService.createBook({ ...this.newBook, pages: this.newBook.pages ? Number(this.newBook.pages) : undefined }).subscribe({
      next: () => { this.newBook = { title: '', author: '', pages: undefined, available: true }; this.showModal = false; }
    });
  }
  setAvailability(book: Book, available: boolean): void { this.bookService.updateAvailability(book.id, available).subscribe({ next: () => this.activeAction = '' }); }
  removeBook(book: Book): void {
    if (window.confirm(`Delete “${book.title}” from the catalogue?`)) this.bookService.deleteBook(book.id).subscribe({ next: () => this.activeAction = '' });
  }
  exportList(): void {
    const content = this.filteredBooks().map((book) => [book.id, book.title, book.author, book.pages ?? '', book.available].join(',')).join('\n');
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([`ID,Title,Author,Pages,Available\n${content}`], { type: 'text/csv' }));
    link.download = 'rewaq-books.csv'; link.click(); URL.revokeObjectURL(link.href);
  }
}
