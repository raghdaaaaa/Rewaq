import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BookService } from '../../../core/services/book';
import { Book } from '../../../core/models/book';

@Component({
  selector: 'app-browse-books',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './browse-books.html',  // مش .component.html
  styleUrls: ['./browse-books.css']
})
export class BrowseBooksComponent implements OnInit {
  private bookService = inject(BookService);
  
  books = signal<Book[]>([]);
  filteredBooks = signal<Book[]>([]);
  isLoading = signal(true);
  
  searchQuery = '';
  selectedCategory = '';
  categories = ['All', 'Architecture', 'Scientific', 'Technology', 'Fiction', 'Philosophy'];

  ngOnInit() {
    this.loadBooks();
  }

  loadBooks() {
    this.isLoading.set(true);
    this.bookService.getBooks().subscribe({
      next: (data) => {
        this.books.set(data);
        this.filteredBooks.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading books:', err);
        this.isLoading.set(false);
      }
    });
  }

  onSearch() {
    const query = this.searchQuery.toLowerCase().trim();
    const category = this.selectedCategory;

    this.filteredBooks.set(
      this.books().filter(book => {
        const matchesSearch = !query || 
          book.title.toLowerCase().includes(query) ||
          book.author.toLowerCase().includes(query) ||
          book.description?.toLowerCase().includes(query);
        
        const matchesCategory = !category || category === 'All' || 
          book.category === category;

        return matchesSearch && matchesCategory;
      })
    );
  }

  clearSearch() {
    this.searchQuery = '';
    this.selectedCategory = '';
    this.onSearch();
  }
}