import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';
import { BookService } from '../../services/book.service';
import { BorrowingService } from '../../services/borrowing.service';
import { UserService } from '../../services/user.service';
import { Book } from '../../models/book';
import { Borrowing } from '../../models/borrowing';
import { User } from '../../models/user';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
})
export class DashboardComponent implements OnInit {
  authService = inject(AuthService);
  private bookService = inject(BookService);
  private borrowingService = inject(BorrowingService);
  private userService = inject(UserService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  currentYear = new Date().getFullYear();

  activeTab = signal<'inventory' | 'users' | 'browse' | 'my-borrowings' | 'book-details'>('browse');
  previousTab = signal<'inventory' | 'browse' | 'my-borrowings'>('browse');

  selectedBookDetail = signal<Book | null>(null);

  // Books State
  books = signal<Book[]>([]);
  bookSearchQuery = signal<string>('');
  bookFilter = signal<'all' | 'available' | 'borrowed'>('all');
  isLoadingBooks = signal<boolean>(false);

  // Results from GET /books/search
  searchResults = signal<Book[]>([]);
  isSearchActive = signal<boolean>(false);
  private bookSearchTimer: any;

  // Users State
  users = signal<User[]>([]);
  userSearchQuery = signal<string>('');
  isLoadingUsers = signal<boolean>(false);

  // Borrowings State
  myBorrowings = signal<Borrowing[]>([]);
  isLoadingBorrowings = signal<boolean>(false);

  // Action loading states & alerts
  actionLoadingId = signal<string | null>(null);
  notification = signal<{ type: 'success' | 'danger'; text: string } | null>(null);

  // Modals state
  showAddBookModal = signal<boolean>(false);
  showEditBookModal = signal<boolean>(false);
  selectedBookForEdit = signal<Book | null>(null);

  showAddUserModal = signal<boolean>(false);
  showEditUserModal = signal<boolean>(false);
  selectedUserForEdit = signal<User | null>(null);

  // My Profile
  showProfileModal = signal<boolean>(false);
  isLoadingProfile = signal<boolean>(false);
  isSavingProfile = signal<boolean>(false);

  // Book Forms
  addBookForm: FormGroup = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(2)]],
    author: ['', [Validators.required, Validators.minLength(2)]],
    pages: [null, [Validators.required, Validators.min(1)]],
    category: [''],
    publishedYear: [null],
    isbn: [''],
    synopsis: [''],
  });
  selectedAddBookFile: File | null = null;
  addBookPreview: string | null = null;

  editBookForm: FormGroup = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(2)]],
    author: ['', [Validators.required, Validators.minLength(2)]],
    pages: [null, [Validators.required, Validators.min(1)]],
    available: [true, Validators.required],
    category: [''],
    publishedYear: [null],
    isbn: [''],
    synopsis: [''],
  });
  selectedEditBookFile: File | null = null;
  editBookPreview: string | null = null;

  // User Forms
  addUserForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, Validators.pattern('^\\+?[0-9]{8,15}$')]],
    role: ['user', Validators.required],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  editUserForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, Validators.pattern('^\\+?[0-9]{8,15}$')]],
    role: ['user', Validators.required],
    password: [''],
  });

  // Profile form 
  profileForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, Validators.pattern('^\\+?[0-9]{8,15}$')]],
    password: ['', [Validators.minLength(6)]],
  });

  // Computed Books Filter
  filteredBooks = computed(() => {
    let list = this.isSearchActive() ? this.searchResults() : this.books();

    const filter = this.bookFilter();
    if (filter === 'available') {
      list = list.filter((b) => b.available);
    } else if (filter === 'borrowed') {
      list = list.filter((b) => !b.available);
    }

    return list;
  });

  // Computed Users Filter
  filteredUsers = computed(() => {
    let list = this.users();
    const query = this.userSearchQuery().trim().toLowerCase();
    if (query) {
      list = list.filter(
        (u) =>
          (u.name && u.name.toLowerCase().includes(query)) ||
          (u.email && u.email.toLowerCase().includes(query)) ||
          (u.phone && u.phone.includes(query)) ||
          ((u._id || u.id) && (u._id || u.id)!.toLowerCase().includes(query))
      );
    }
    return list;
  });

  // Borrowing Search & Computed Filter
  borrowingSearchQuery = signal<string>('');
  filteredBorrowings = computed(() => {
    let list = this.myBorrowings();
    const query = this.borrowingSearchQuery().trim().toLowerCase();
    if (query) {
      list = list.filter((loan) => {
        const title = loan.bookId?.title?.toLowerCase() || '';
        const author = loan.bookId?.author?.toLowerCase() || '';
        return title.includes(query) || author.includes(query);
      });
    }
    return list;
  });

  // Computed Stats for Inventory 
  stats = computed(() => {
    const all = this.books();
    const total = all.length;
    const borrowed = all.filter((b) => !b.available).length;
    const available = total - borrowed;
    const utilization = total > 0 ? Math.round((borrowed / total) * 100) : 0;
    return {
      total,
      borrowed,
      available,
      utilization,
    };
  });

  ngOnInit(): void {
    const url = this.router.url;

    if (url.includes('/admin/users')) {
      if (!this.authService.isAdmin()) {
        this.router.navigate(['/dashboard']);
        this.activeTab.set('browse');
      } else {
        this.activeTab.set('users');
        this.loadUsers();
      }
    } else if (url.includes('/admin')) {
      if (!this.authService.isAdmin()) {
        this.router.navigate(['/dashboard']);
        this.activeTab.set('browse');
      } else {
        this.activeTab.set('inventory');
      }
    } else if (url.includes('/my-borrowings')) {
      this.activeTab.set('my-borrowings');
    } else {
      this.activeTab.set('browse');
    }

    this.loadBooks();
    this.loadMyBorrowings();
  }

  setTab(tab: 'inventory' | 'users' | 'browse' | 'my-borrowings' | 'book-details'): void {
    // Strict protection 
    if ((tab === 'inventory' || tab === 'users') && !this.authService.isAdmin()) {
      this.notify('Access denied: Administrator privileges required', 'danger');
      this.router.navigate(['/dashboard']);
      this.activeTab.set('browse');
      return;
    }

    this.activeTab.set(tab);

    if (tab === 'inventory') {
      this.router.navigate(['/admin/inventory']);
      this.loadBooks();
    } else if (tab === 'users') {
      this.router.navigate(['/admin/users']);
      this.loadUsers();
    } else if (tab === 'browse') {
      this.router.navigate(['/dashboard']);
      this.loadBooks();
    } else if (tab === 'my-borrowings') {
      this.router.navigate(['/my-borrowings']);
      this.loadMyBorrowings();
    }
  }


  // Book Details Navigation 

  openBookDetails(book: Book, from: 'inventory' | 'browse' | 'my-borrowings' = 'browse'): void {
    this.selectedBookDetail.set(book);
    this.previousTab.set(from);
    this.activeTab.set('book-details');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  backLabel(): string {
    const from = this.previousTab();
    if (from === 'inventory') return 'Back to Admin Books';
    if (from === 'my-borrowings') return 'Back to My Borrowings';
    return 'Back to Browse';
  }

  backFromBookDetails(): void {
    this.activeTab.set(this.previousTab());
  }

  getBookSynopsis(book?: Book | null): string {
    return book?.synopsis?.trim() || '';
  }

  getBookPublishedYear(book?: Book | null): string {
    return book?.publishedYear ? String(book.publishedYear) : '—';
  }

  getBookIsbn(book?: Book | null): string {
    return book?.isbn?.trim() || '—';
  }

  getBookCategoryName(book?: Book | null): string {
    return book?.category?.trim() || 'Uncategorized';
  }

  // Books CRUD & Operations
  loadBooks(): void {
    this.isLoadingBooks.set(true);
    this.bookService.getAllBooks().subscribe({
      next: (data) => {
        this.books.set(data || []);
        // Also refresh selectedBookDetail if open
        if (this.selectedBookDetail()) {
          const updated = data.find((b) => b._id === this.selectedBookDetail()?._id);
          if (updated) this.selectedBookDetail.set(updated);
        }
        this.isLoadingBooks.set(false);

        // keep search results in step after an add, edit or delete
        if (this.isSearchActive()) {
          this.runBookSearch(this.bookSearchQuery().trim());
        }
      },
      error: () => {
        this.isLoadingBooks.set(false);
        this.notify('Failed to load books collection', 'danger');
      },
    });
  }

  onBookSearch(query: string): void {
    this.bookSearchQuery.set(query);
    clearTimeout(this.bookSearchTimer);

    const term = query.trim();

    if (!term) {
      this.isSearchActive.set(false);
      this.searchResults.set([]);
      return;
    }

    this.bookSearchTimer = setTimeout(() => this.runBookSearch(term), 350);
  }

  private runBookSearch(term: string): void {
    this.isLoadingBooks.set(true);
    this.bookService.searchBooks(term).subscribe({
      next: (data) => {
        this.searchResults.set(data || []);
        this.isSearchActive.set(true);
        this.isLoadingBooks.set(false);
      },
      error: () => {
        this.isLoadingBooks.set(false);
        this.isSearchActive.set(false);
        this.notify('Search failed, showing the full collection', 'danger');
      },
    });
  }

  setBookFilter(filter: 'all' | 'available' | 'borrowed'): void {
    this.bookFilter.set(filter);
  }

  exportBooks(): void {
    this.bookService.exportToCsv(this.filteredBooks());
    this.notify('Exporting books list as CSV file...', 'success');
  }

  openAddBookModal(): void {
    this.addBookForm.reset({
      pages: null,
      category: '',
      publishedYear: null,
      isbn: '',
      synopsis: '',
    });
    this.selectedAddBookFile = null;
    this.addBookPreview = null;
    this.showAddBookModal.set(true);
  }

  closeAddBookModal(): void {
    this.showAddBookModal.set(false);
  }

  onAddBookFile(event: any): void {
    const file = event.target.files?.[0];
    if (file) {
      this.selectedAddBookFile = file;
      const reader = new FileReader();
      reader.onload = () => (this.addBookPreview = reader.result as string);
      reader.readAsDataURL(file);
    }
  }

  submitAddBook(): void {
    if (this.addBookForm.invalid) {
      this.addBookForm.markAllAsTouched();
      return;
    }

    const formData = new FormData();
    formData.append('title', this.addBookForm.value.title);
    formData.append('author', this.addBookForm.value.author);
    formData.append('pages', this.addBookForm.value.pages);
    if (this.addBookForm.value.category) formData.append('category', this.addBookForm.value.category);
    if (this.addBookForm.value.publishedYear) formData.append('publishedYear', this.addBookForm.value.publishedYear);
    if (this.addBookForm.value.isbn) formData.append('isbn', this.addBookForm.value.isbn);
    if (this.addBookForm.value.synopsis) formData.append('synopsis', this.addBookForm.value.synopsis);

    if (this.selectedAddBookFile) {
      formData.append('coverImage', this.selectedAddBookFile);
    }

    this.bookService.addBook(formData).subscribe({
      next: () => {
        this.notify(`Book "${this.addBookForm.value.title}" successfully added!`, 'success');
        this.closeAddBookModal();
        this.loadBooks();
      },
      error: (err) => {
        this.notify(err.error?.msg || 'Failed to add book', 'danger');
      },
    });
  }

  openEditBookModal(book: Book, event?: Event): void {
    if (event) event.stopPropagation();
    this.selectedBookForEdit.set(book);
    this.editBookForm.patchValue({
      title: book.title,
      author: book.author,
      pages: book.pages ?? null,
      available: book.available,
      category: book.category || '',
      publishedYear: book.publishedYear ?? null,
      isbn: book.isbn || '',
      synopsis: book.synopsis || '',
    });
    this.selectedEditBookFile = null;
    this.editBookPreview = this.bookService.getBookCoverUrl(book._id);
    this.showEditBookModal.set(true);
  }

  closeEditBookModal(): void {
    this.showEditBookModal.set(false);
    this.selectedBookForEdit.set(null);
  }

  onEditBookFile(event: any): void {
    const file = event.target.files?.[0];
    if (file) {
      this.selectedEditBookFile = file;
      const reader = new FileReader();
      reader.onload = () => (this.editBookPreview = reader.result as string);
      reader.readAsDataURL(file);
    }
  }

  submitEditBook(): void {
    const book = this.selectedBookForEdit();
    if (!book || !book._id || this.editBookForm.invalid) {
      this.editBookForm.markAllAsTouched();
      return;
    }

    const formData = new FormData();
    formData.append('title', this.editBookForm.value.title);
    formData.append('author', this.editBookForm.value.author);
    formData.append('pages', this.editBookForm.value.pages);
    formData.append('available', this.editBookForm.value.available);
    if (this.editBookForm.value.category) formData.append('category', this.editBookForm.value.category);
    if (this.editBookForm.value.publishedYear) formData.append('publishedYear', this.editBookForm.value.publishedYear);
    if (this.editBookForm.value.isbn) formData.append('isbn', this.editBookForm.value.isbn);
    if (this.editBookForm.value.synopsis) formData.append('synopsis', this.editBookForm.value.synopsis);

    if (this.selectedEditBookFile) {
      formData.append('coverImage', this.selectedEditBookFile);
    }

    this.bookService.updateBook(book._id, formData).subscribe({
      next: () => {
        this.notify(`Book "${this.editBookForm.value.title}" updated successfully!`, 'success');
        this.closeEditBookModal();
        this.loadBooks();
      },
      error: (err) => {
        this.notify(err.error?.msg || 'Failed to update book', 'danger');
      },
    });
  }

  deleteBook(book: Book, event?: Event): void {
    if (event) event.stopPropagation();
    if (!book._id) return;
    if (!confirm(`Are you sure you want to permanently delete "${book.title}"?`)) return;

    this.bookService.deleteBook(book._id).subscribe({
      next: () => {
        this.notify(`Book "${book.title}" deleted.`, 'success');
        if (this.selectedBookDetail()?._id === book._id) {
          this.activeTab.set(this.previousTab());
        }
        this.loadBooks();
      },
      error: (err) => {
        this.notify(err.error?.msg || 'Failed to delete book', 'danger');
      },
    });
  }

  // Users CRUD & Operations 
  loadUsers(): void {
    if (!this.authService.isAdmin()) return;
    this.isLoadingUsers.set(true);
    this.userService.getAllUsers().subscribe({
      next: (data) => {
        this.users.set(data || []);
        this.isLoadingUsers.set(false);
      },
      error: () => {
        this.isLoadingUsers.set(false);
        this.notify('Failed to load users list', 'danger');
      },
    });
  }

  onUserSearch(query: string): void {
    this.userSearchQuery.set(query);
  }

  openAddUserModal(): void {
    this.addUserForm.reset({ role: 'user' });
    this.showAddUserModal.set(true);
  }

  closeAddUserModal(): void {
    this.showAddUserModal.set(false);
  }

  submitAddUser(): void {
    if (this.addUserForm.invalid) {
      this.addUserForm.markAllAsTouched();
      return;
    }

    this.userService.addUser(this.addUserForm.value).subscribe({
      next: () => {
        this.notify(`User "${this.addUserForm.value.name}" added successfully!`, 'success');
        this.closeAddUserModal();
        this.loadUsers();
      },
      error: (err) => {
        this.notify(err.error?.msg || err.error?.error_message || 'Failed to add user', 'danger');
      },
    });
  }

  openEditUserModal(user: User): void {
    this.selectedUserForEdit.set(user);
    this.editUserForm.patchValue({
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      role: user.role || 'user',
      password: '',
    });
    this.showEditUserModal.set(true);
  }

  closeEditUserModal(): void {
    this.showEditUserModal.set(false);
    this.selectedUserForEdit.set(null);
  }

  submitEditUser(): void {
    const user = this.selectedUserForEdit();
    const userId = user?._id || user?.id;
    if (!userId || this.editUserForm.invalid) {
      this.editUserForm.markAllAsTouched();
      return;
    }

    const updateData: any = {
      name: this.editUserForm.value.name,
      email: this.editUserForm.value.email,
      phone: this.editUserForm.value.phone,
      role: this.editUserForm.value.role,
    };
    if (this.editUserForm.value.password && this.editUserForm.value.password.trim() !== '') {
      updateData.password = this.editUserForm.value.password;
    }

    this.userService.updateUser(userId, updateData).subscribe({
      next: () => {
        this.notify(`User "${updateData.name}" updated successfully!`, 'success');
        this.closeEditUserModal();
        this.loadUsers();
      },
      error: (err) => {
        this.notify(err.error?.msg || 'Failed to update user', 'danger');
      },
    });
  }

  deleteUser(user: User): void {
    const userId = user._id || user.id;
    if (!userId) return;

    if (!confirm(`Are you sure you want to delete user account "${user.name}"?`)) return;

    this.userService.deleteUser(userId).subscribe({
      next: () => {
        this.notify(`User "${user.name}" removed from the system.`, 'success');
        this.loadUsers();
      },
      error: (err) => {
        this.notify(err.error?.msg || 'Failed to delete user account', 'danger');
      },
    });
  }


  // My Profile

  openProfileModal(): void {
    this.profileForm.reset({ name: '', email: '', phone: '', password: '' });
    this.showProfileModal.set(true);
    this.isLoadingProfile.set(true);
    this.userService.getMe().subscribe({
      next: (user) => {
        this.profileForm.patchValue({
          name: user.name || '',
          email: user.email || '',
          phone: user.phone || '',
          password: '',
        });
        this.isLoadingProfile.set(false);
      },
      error: () => {
        const current = this.authService.currentUser();
        this.profileForm.patchValue({
          name: current?.name || '',
          email: current?.email || '',
          phone: current?.phone || '',
          password: '',
        });
        this.isLoadingProfile.set(false);
      },
    });
  }

  closeProfileModal(): void {
    this.showProfileModal.set(false);
  }

  submitProfile(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    const data: any = {
      name: this.profileForm.value.name?.trim(),
      email: this.profileForm.value.email?.trim().toLowerCase(),
      phone: this.profileForm.value.phone?.trim(),
    };

    const password = this.profileForm.value.password;
    if (password && password.trim() !== '') {
      data.password = password;
    }

    this.isSavingProfile.set(true);

    this.userService.updateMe(data).subscribe({
      next: (updated) => {
        this.isSavingProfile.set(false);

        const token = this.authService.getToken();
        if (token) {
          this.authService.saveSession(token, updated);
        }

        this.notify('Your profile has been updated', 'success');
        this.closeProfileModal();
      },
      error: (err) => {
        this.isSavingProfile.set(false);
        const errObj = err.error || {};
        this.notify(
          errObj.error_message || errObj.msg || 'Failed to update your profile',
          'danger',
        );
      },
    });
  }

  deleteMyAccount(): void {
    const name = this.authService.currentUser()?.name || 'your account';

    if (
      !confirm(
        `Permanently delete the account for ${name}?\n\nThis cannot be undone and you will be signed out immediately.`,
      )
    ) {
      return;
    }

    this.isSavingProfile.set(true);

    this.userService.deleteMe().subscribe({
      next: () => {
        this.isSavingProfile.set(false);
        this.closeProfileModal();
        this.authService.logout();
      },
      error: (err) => {
        this.isSavingProfile.set(false);
        const errObj = err.error || {};
        this.notify(
          errObj.error_message || errObj.msg || 'Failed to delete your account',
          'danger',
        );
      },
    });
  }

  // Borrowing Operations

  loadMyBorrowings(): void {
    this.isLoadingBorrowings.set(true);
    this.borrowingService.getMyBooks().subscribe({
      next: (res) => {
        this.myBorrowings.set(res.borrowings || []);
        this.isLoadingBorrowings.set(false);
      },
      error: () => {
        this.myBorrowings.set([]);
        this.isLoadingBorrowings.set(false);
      },
    });
  }

  borrowBook(book?: Book | null): void {
    if (!book || !book._id || !book.available) return;
    this.actionLoadingId.set(book._id);

    this.borrowingService.borrowBook(book._id).subscribe({
      next: () => {
        this.actionLoadingId.set(null);
        this.notify(`Successfully borrowed "${book.title}"!`, 'success');
        this.loadBooks();
        this.loadMyBorrowings();
      },
      error: (err) => {
        this.actionLoadingId.set(null);
        this.notify(err.error?.msg || 'Could not borrow book', 'danger');
      },
    });
  }

  returnBook(borrowing: Borrowing): void {
    if (!borrowing._id) return;
    this.actionLoadingId.set(borrowing._id);

    this.borrowingService.returnBook(borrowing._id).subscribe({
      next: () => {
        this.actionLoadingId.set(null);
        const title = (borrowing.bookId as Book)?.title || 'Book';
        this.notify(`"${title}" returned successfully!`, 'success');
        this.loadBooks();
        this.loadMyBorrowings();
      },
      error: (err) => {
        this.actionLoadingId.set(null);
        this.notify(err.error?.msg || 'Failed to return book', 'danger');
      },
    });
  }

  isBookBorrowedByMe(bookId?: string): boolean {
    if (!bookId) return false;
    return this.myBorrowings().some((b) => {
      const bId = typeof b.bookId === 'string' ? b.bookId : b.bookId?._id;
      return bId === bookId;
    });
  }

  // Helpers
  getBookCover(book?: Book | string | null): string {
    if (!book) return '/LibraryPhoto.png';
    const id = typeof book === 'string' ? book : book._id;
    if (!id) return '/LibraryPhoto.png';
    return this.bookService.getBookCoverUrl(id);
  }

  getUserInitials(name?: string): string {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }

  getBookInitial(title?: string): string {
    if (!title) return 'B';
    return title.trim().charAt(0).toUpperCase();
  }

  getShortId(id?: string): string {
    if (!id) return '#0000';
    return '#' + id.slice(-4).toUpperCase();
  }

  getBookCategory(book: Book): string[] {
    return book.category ? [book.category] : [];
  }

  onBorrowingSearch(query: string): void {
    this.borrowingSearchQuery.set(query);
  }

  notify(text: string, type: 'success' | 'danger'): void {
    this.notification.set({ text, type });
    setTimeout(() => {
      if (this.notification()?.text === text) {
        this.notification.set(null);
      }
    }, 4500);
  }

  dismissNotification(): void {
    this.notification.set(null);
  }

  logout(): void {
    this.authService.logout();
  }
}
