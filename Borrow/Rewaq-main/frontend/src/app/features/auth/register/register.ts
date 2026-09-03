import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  errorMessage: string = '';
  isLoading: boolean = false;
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;

  togglePassword(input?: HTMLInputElement) {
    this.showPassword = !this.showPassword;
    this.restoreCaret(input);
  }

  toggleConfirmPassword(input?: HTMLInputElement) {
    this.showConfirmPassword = !this.showConfirmPassword;
    this.restoreCaret(input);
  }

  private restoreCaret(input?: HTMLInputElement) {
    if (!input) return;
    const caret = input.selectionStart;
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

  registerForm: FormGroup = this.fb.group(
    {
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern('^\\+?[0-9\\s-]{8,18}$')]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
    },
    { validators: this.passwordMatchValidator },
  );

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (!password || !confirmPassword) {
      return null;
    }

    if (password.value !== confirmPassword.value) {
      const errors = confirmPassword.errors || {};
      confirmPassword.setErrors({ ...errors, mismatch: true });
      return { mismatch: true };
    } else {
      if (confirmPassword.errors) {
        const { mismatch, ...remainingErrors } = confirmPassword.errors;
        confirmPassword.setErrors(Object.keys(remainingErrors).length ? remainingErrors : null);
      }
      return null;
    }
  }

  onSubmit() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const { confirmPassword, phone, ...rawFormData } = this.registerForm.value;
    const cleanPhone = phone ? phone.replace(/[\s-]/g, '').trim() : '';

    const payload = {
      name: rawFormData.name?.trim(),
      email: rawFormData.email?.trim().toLowerCase(),
      phone: cleanPhone,
      password: rawFormData.password,
      role: 'user',
    };

    this.authService.register(payload).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        if (response.token) {
          this.authService.saveSession(response.token, response.user);
          this.router.navigate(['/dashboard']);
        } else {
          this.router.navigate(['/login']);
        }
      },
      error: (err) => {
        this.isLoading = false;
        const errObj = err.error || {};
        const errMsg = errObj.error_message || errObj.message || errObj.msg || '';

        if (err.status === 409 || errObj.error_name === 'ConflictError' || errMsg.includes('duplicate key')) {
          if (errMsg.toLowerCase().includes('email')) {
            this.errorMessage = 'This email is already registered. Please login or use another email.';
          } else if (errMsg.toLowerCase().includes('phone')) {
            this.errorMessage = 'This phone number is already registered. Please use another phone number.';
          } else {
            this.errorMessage = 'This account information is already registered. Please login.';
          }
        } else if (err.status === 400 || errObj.error_name === 'ValidationError') {
          this.errorMessage = errMsg || 'Invalid data provided. Please check all fields.';
        } else if (err.status === 0) {
          this.errorMessage = 'Unable to connect to backend server. Please verify backend is running on port 5000.';
        } else {
          this.errorMessage =
            errMsg || 'Failed to register, please check your information and try again.';
        }
      },
    });
  }

  isNumberKey(event: KeyboardEvent): boolean {
    const char = event.key;
    if (char === '+' || char === '-' || char === ' ' || (char >= '0' && char <= '9') || event.key.length > 1) {
      return true;
    }
    return false;
  }
}
