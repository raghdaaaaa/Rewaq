import { ChangeDetectionStrategy, Component, OnInit, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CreateUserRequest, UserService } from '../../core/services/user.service';
import { LibraryUser, UserRole } from '../../models/user.model';
import { NavbarComponent } from '../../shared/navbar/navbar.component';

@Component({
  selector: 'app-users',
  imports: [FormsModule, NavbarComponent],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UsersComponent implements OnInit {
  readonly userService = inject(UserService);
  readonly users = this.userService.users;
  readonly loading = this.userService.loading;
  readonly error = this.userService.error;
  readonly pageSize = 8;
  searchTerm = '';
  currentPage = 1;
  showModal = false;
  activeAction = '';
  newUser: CreateUserRequest = { name: '', email: '', phone: '', password: '', role: 'user' };
  readonly filteredUsers = computed(() => {
    const term = this.searchTerm.trim().toLowerCase();
    return this.users().filter((user) => !term || `${user.name} ${user.email} ${user.id}`.toLowerCase().includes(term));
  });
  readonly pageCount = computed(() => Math.max(1, Math.ceil(this.filteredUsers().length / this.pageSize)));
  readonly pageNumbers = computed(() => Array.from({ length: Math.min(3, this.pageCount()) }, (_, index) => index + 1));
  readonly pagedUsers = computed(() => {
    const page = Math.min(this.currentPage, this.pageCount());
    return this.filteredUsers().slice((page - 1) * this.pageSize, page * this.pageSize);
  });
  readonly startEntry = computed(() => this.filteredUsers().length ? (Math.min(this.currentPage, this.pageCount()) - 1) * this.pageSize + 1 : 0);
  readonly endEntry = computed(() => Math.min(this.currentPage * this.pageSize, this.filteredUsers().length));

  ngOnInit(): void { this.userService.loadUsers(); }
  resetPage(): void { this.currentPage = 1; }
  toggleAction(id: string): void { this.activeAction = this.activeAction === id ? '' : id; }
  changePage(page: number): void { this.currentPage = Math.min(Math.max(page, 1), this.pageCount()); }
  roleLabel(role: UserRole): string { return role === 'admin' ? 'Admin' : 'User'; }
  addUser(): void {
    if (!this.newUser.name.trim() || !this.newUser.email.trim() || !this.newUser.password) return;
    this.userService.createUser({ ...this.newUser }).subscribe({
      next: () => { this.newUser = { name: '', email: '', phone: '', password: '', role: 'user' }; this.showModal = false; }
    });
  }
  setRole(user: LibraryUser, role: UserRole): void { this.userService.updateRole(user.id, role).subscribe({ next: () => this.activeAction = '' }); }
  removeUser(user: LibraryUser): void {
    if (window.confirm(`Delete “${user.name}”?`)) this.userService.deleteUser(user.id).subscribe({ next: () => this.activeAction = '' });
  }
}
