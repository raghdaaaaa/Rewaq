import { Component, OnInit, OnDestroy } from '@angular/core';
import { BorrowingService } from '../../core/services/borrowing.service';
import { CommonModule } from '@angular/common';
import { Borrowing } from '../../core/models/borrowing.model';
import { Subscription } from 'rxjs';

interface ActiveBorrowing extends Borrowing {
  dueDate: Date;
  isUrgent: boolean;
  isOverdue: boolean;
  progress: number;
  coverUrl: string;
  bookTitle: string;
  bookAuthor: string;
  dueDateLabel: string;
}

interface HistoryBorrowing extends Borrowing {
  status: 'on-time' | 'late';
  coverUrl: string;
  bookTitle: string;
  bookAuthor: string;
  returnedOnTime: boolean;
}

@Component({
  selector: 'app-my-borrowings',
  templateUrl: './my-borrowings.component.html',
  styleUrls: ['./my-borrowings.component.css'],
  standalone: false
})
export class MyBorrowingsComponent implements OnInit, OnDestroy {
  isLoading: boolean = true;
  successMessage: string = '';
  errorMessage: string = '';
  returningId: string | null = null;

  activeBorrowings: ActiveBorrowing[] = [];
  historyBorrowings: HistoryBorrowing[] = [];

  private subscription: Subscription | null = null;

  constructor(private borrowingService: BorrowingService) { }

  ngOnInit(): void {
    // ============================================================
    // 🔧 MOCK DATA MODE — UI TESTING ONLY
    // this.loadBorrowings() is temporarily disabled so the page
    // renders instantly with fake data, without touching the backend.
    // TODO: remove this whole block and uncomment loadBorrowings()
    // before the final commit.
    // ============================================================

    // this.loadBorrowings();

    this.isLoading = false;

    this.activeBorrowings = [
      {
        _id: 'mock-1',
        userId: 'mock-user',
        bookId: {
          _id: 'mock-book-1',
          title: 'The Architecture of Tor',
          author: 'Elena Rostova',
          available: false
        },
        startDate: '2024-10-12',
        endDate: null,
        dueDate: new Date('2024-10-26'),
        isUrgent: true,
        isOverdue: false,
        progress: 90,
        coverUrl: 'assets/images/book-placeholder.svg',
        bookTitle: 'The Architecture of Tor',
        bookAuthor: 'Elena Rostova',
        dueDateLabel: 'In 2 Days'
      },
      {
        _id: 'mock-2',
        userId: 'mock-user',
        bookId: {
          _id: 'mock-book-2',
          title: 'Silent Spring',
          author: 'Rachel Carson',
          available: false
        },
        startDate: '2024-10-18',
        endDate: null,
        dueDate: new Date('2024-11-01'),
        isUrgent: false,
        isOverdue: false,
        progress: 40,
        coverUrl: 'assets/images/book-placeholder.svg',
        bookTitle: 'Silent Spring',
        bookAuthor: 'Rachel Carson',
        dueDateLabel: 'Nov 01, 2024'
      },
      {
        _id: 'mock-3',
        userId: 'mock-user',
        bookId: {
          _id: 'mock-book-3',
          title: 'Design Systems Handbook',
          author: 'InVision',
          available: false
        },
        startDate: '2024-10-20',
        endDate: null,
        dueDate: new Date('2024-11-10'),
        isUrgent: false,
        isOverdue: false,
        progress: 15,
        coverUrl: 'assets/images/book-placeholder.svg',
        bookTitle: 'Design Systems Handbook',
        bookAuthor: 'InVision',
        dueDateLabel: 'Nov 10, 2024'
      }
    ] as any;

    this.historyBorrowings = [
      {
        _id: 'mock-4',
        userId: 'mock-user',
        bookId: {
          _id: 'mock-book-4',
          title: 'The Zen of Formatting',
          author: 'Mastering Whitespace',
          available: true
        },
        startDate: '2024-09-01',
        endDate: '2024-09-14',
        coverUrl: 'assets/images/book-placeholder.svg',
        bookTitle: 'The Zen of Formatting',
        bookAuthor: 'Mastering Whitespace',
        status: 'on-time',
        returnedOnTime: true
      },
      {
        _id: 'mock-5',
        userId: 'mock-user',
        bookId: {
          _id: 'mock-book-5',
          title: 'Dune Chronic',
          author: 'Frank Herbert',
          available: true
        },
        startDate: '2024-08-15',
        endDate: '2024-08-30',
        coverUrl: 'assets/images/book-placeholder.svg',
        bookTitle: 'Dune Chronic',
        bookAuthor: 'Frank Herbert',
        status: 'late',
        returnedOnTime: false
      }
    ] as any;

    // ============================================================
    // END MOCK DATA MODE
    // ============================================================
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  loadBorrowings(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.subscription = this.borrowingService.getMyActiveBooks().subscribe({
      next: (data: any) => {
        if (data && data.borrowings && data.borrowings.length > 0) {
          this.activeBorrowings = data.borrowings.map((b: Borrowing, i: number) => this.mapToActiveBorrowing(b, i));
        } else {
          this.activeBorrowings = [];
        }
        this.loadHistory();
      },
      error: (err) => {
        if (err.empty) {
          this.activeBorrowings = [];
        } else {
          this.errorMessage = err.error?.msg || 'Failed to load active borrowings';
          this.activeBorrowings = [];
        }
        this.loadHistory();
      }
    });
  }

  loadHistory(): void {
    this.borrowingService.getMyHistory().subscribe({
      next: (data: any) => {
        if (data && data.borrowings && data.borrowings.length > 0) {
          this.historyBorrowings = data.borrowings.map((b: Borrowing) => this.mapToHistoryBorrowing(b));
        } else {
          this.historyBorrowings = [];
        }
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = err.error?.msg || 'Failed to load borrowing history';
        this.historyBorrowings = [];
        this.isLoading = false;
      }
    });
  }

  private mapToActiveBorrowing(borrowing: Borrowing, index: number): ActiveBorrowing {
    const startDate = new Date(borrowing.startDate);
    const dueDate = new Date(startDate);
    dueDate.setDate(dueDate.getDate() + 14);
    const now = new Date();

    const isOverdue = now > dueDate;
    const diffDays = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 3600 * 24));
    const isUrgent = !isOverdue && diffDays <= 2;

    let progress = 0;
    if (now >= dueDate) {
      progress = 100;
    } else if (now > startDate) {
      const total = dueDate.getTime() - startDate.getTime();
      const current = now.getTime() - startDate.getTime();
      progress = Math.round((current / total) * 100);
    }

    const book = borrowing.bookId;
    const coverUrl = book?.coverImage?.data
      ? `data:${book.coverImage.contentType};base64,${book.coverImage.data}`
      : 'assets/images/book-placeholder.svg';

    let dueDateLabel: string;
    if (isOverdue) {
      dueDateLabel = 'Overdue';
    } else if (isUrgent) {
      dueDateLabel = `In ${diffDays} Day${diffDays !== 1 ? 's' : ''}`;
    } else {
      dueDateLabel = dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }

    return {
      ...borrowing,
      dueDate,
      isUrgent,
      isOverdue,
      progress,
      coverUrl,
      bookTitle: book?.title || 'Unknown Title',
      bookAuthor: book?.author || 'Unknown Author',
      dueDateLabel
    };
  }

  private mapToHistoryBorrowing(borrowing: Borrowing): HistoryBorrowing {
    const book = borrowing.bookId;
    const coverUrl = book?.coverImage?.data
      ? `data:${book.coverImage.contentType};base64,${book.coverImage.data}`
      : 'assets/images/book-placeholder.svg';

    const returnedOnTime = borrowing.endDate && borrowing.startDate
      ? new Date(borrowing.endDate) <= new Date(new Date(borrowing.startDate).getTime() + 14 * 24 * 60 * 60 * 1000)
      : true;

    return {
      ...borrowing,
      status: returnedOnTime ? 'on-time' : 'late',
      coverUrl,
      bookTitle: book?.title || 'Unknown Title',
      bookAuthor: book?.author || 'Unknown Author',
      returnedOnTime
    };
  }

  returnBook(borrowing: ActiveBorrowing): void {
    this.returningId = borrowing._id;
    this.errorMessage = '';
    this.successMessage = '';

    this.borrowingService.returnBook(borrowing._id).subscribe({
      next: (response: any) => {
        this.successMessage = response.msg || 'Book returned successfully!';
        this.activeBorrowings = this.activeBorrowings.filter(b => b._id !== borrowing._id);
        if (response.borrowing) {
          const returned = this.mapToHistoryBorrowing(response.borrowing);
          this.historyBorrowings = [returned, ...this.historyBorrowings];
        }
        this.returningId = null;
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (err) => {
        this.errorMessage = err.error?.msg || 'Failed to return book';
        this.returningId = null;
        setTimeout(() => this.errorMessage = '', 5000);
      }
    });
  }
}