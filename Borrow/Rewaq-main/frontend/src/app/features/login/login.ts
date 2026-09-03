import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  errorMessage: string = '';
  isLoading: boolean = false;
  showPassword: boolean = false;

  togglePassword(input?: HTMLInputElement) {
    const caret = input ? input.selectionStart : null;
    this.showPassword = !this.showPassword;

    if (input) {
      setTimeout(() => {
        input.focus();
        if (caret !== null) {
          try {
            input.setSelectionRange(caret, caret);
          } catch {
          }
        }
      });
    }
  }

  onLogin() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const credentials = {
      email: this.loginForm.value.email?.trim().toLowerCase(),
      password: this.loginForm.value.password,
    };

    this.authService.login(credentials).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        if (response.token) {
          this.authService.saveSession(response.token, response.user);
        }

        const returnUrl = this.route.snapshot.queryParams['returnUrl'];
        if (returnUrl) {
          this.router.navigateByUrl(returnUrl);
        } else if (this.authService.isAdmin()) {
          this.router.navigate(['/admin/inventory']);
        } else {
          this.router.navigate(['/dashboard']);
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage =
          err.error?.msg ||
          err.error?.message ||
          'Invalid email or password. Please check your credentials and try again.';
      },
    });
  }
}
