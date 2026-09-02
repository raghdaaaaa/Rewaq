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

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  registerForm: FormGroup = this.fb.group(
    {
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern('^\\+?[0-9]{8,15}$')]],
      role: ['user', Validators.required],
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

    const { confirmPassword, ...rawFormData } = this.registerForm.value;
    const formData = {
      ...rawFormData,
      name: rawFormData.name?.trim(),
      email: rawFormData.email?.trim(),
      phone: rawFormData.phone?.trim(),
    };

    this.authService.register(formData).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        if (response.token) {
          localStorage.setItem('token', response.token);
          this.router.navigate(['/dashboard']);
        } else {
          this.router.navigate(['/login']);
        }
      },
      error: (err) => {
        this.isLoading = false;
        const errObj = err.error || {};
        const errMsg = errObj.error_message || errObj.message || '';

        if (errMsg.includes('duplicate key') || errObj.error_name === 'MongoServerError') {
          if (errMsg.includes('email')) {
            this.errorMessage = 'Email is already registered. Please login or use another email.';
          } else if (errMsg.includes('phone')) {
            this.errorMessage = 'Phone number is already registered.';
          } else {
            this.errorMessage = 'This account information is already registered.';
          }
        }
        else if (errObj.error_name === 'ValidationError') {
          if (errMsg.includes('Email is already registered')) {
            this.errorMessage = 'Email is already registered. Please login instead.';
          } else if (errMsg.includes('Invalid email format')) {
            this.errorMessage = 'Invalid email format.';
          } else if (errMsg.includes('Invalid phone format')) {
            this.errorMessage = 'Invalid phone format.';
          } else {
            this.errorMessage = errMsg;
          }
        }
        else if (errObj.msg && errObj.msg !== 'Error middleware') {
          this.errorMessage = errObj.msg;
        } else {
          this.errorMessage =
            errObj.message || 'Failed to register, please check your information and try again.';
        }
      },
    });
  }

  isNumberKey(event: KeyboardEvent): boolean {
    const char = event.key;
    if (char === '+' || (char >= '0' && char <= '9') || event.key.length > 1) {
      return true;
    }
    return false;
  }
}
