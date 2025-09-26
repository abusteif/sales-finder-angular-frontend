import { Component, ViewEncapsulation, effect } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavigationService } from '../../core/services/navigation.service';
import { AuthenticationStore } from '../../state/authentication.store';
import { ContactService, ContactRequest } from '../../core/services/contact.service';

@Component({
  selector: 'app-contact-us-page',
  standalone: false,
  templateUrl: './contact-us-page.component.html',
  styleUrl: './contact-us-page.component.css',
  encapsulation: ViewEncapsulation.None
})
export class ContactUsPageComponent {
  contactForm: FormGroup;
  isSubmitting = false;
  submitSuccess = false;
  submitError = false;
  errorMessage = '';
  isAuthenticated = false;

  constructor(
    private navigationService: NavigationService, 
    private authenticationStore: AuthenticationStore,
    private formBuilder: FormBuilder,
    private contactService: ContactService
  ) {
    this.contactForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      subject: ['', [Validators.required, Validators.minLength(5)]],
      message: ['', [Validators.required, Validators.minLength(10)]]
    });

    effect(() => {
      this.isAuthenticated = this.authenticationStore.isAuthenticated();
    });
  }

  onBackToHome() {
    this.navigationService.navigateToHome();
  }

  onViewAlerts() {
    this.navigationService.navigateToProtectedRoute('/alerts', {}, this.authenticationStore.isAuthenticated());
  }

  onSubmit() {
    if (this.contactForm.valid) {
      this.isSubmitting = true;
      this.submitError = false;
      this.submitSuccess = false;
      this.errorMessage = '';

      const contactData: ContactRequest = {
        name: this.contactForm.get('name')?.value.trim(),
        email: this.contactForm.get('email')?.value.trim(),
        subject: this.contactForm.get('subject')?.value.trim(),
        message: this.contactForm.get('message')?.value.trim()
      };

      this.contactService.submitContactForm(contactData).subscribe({
        next: (response) => {
          this.isSubmitting = false;
          this.submitSuccess = true;
          this.contactForm.reset();
          
          // Hide success message after 5 seconds
          setTimeout(() => {
            this.submitSuccess = false;
          }, 5000);
        },
        error: (error) => {
          this.isSubmitting = false;
          this.submitError = true;
          this.errorMessage = error.error?.message || 'An error occurred while sending your message. Please try again.';
          
          // Hide error message after 5 seconds
          setTimeout(() => {
            this.submitError = false;
            this.errorMessage = '';
          }, 5000);
        }
      });
    } else {
      // Mark all fields as touched to show validation errors
      this.contactForm.markAllAsTouched();
    }
  }

  getFieldError(fieldName: string): string {
    const field = this.contactForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) {
        return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
      }
      if (field.errors['email']) {
        return 'Please enter a valid email address';
      }
      if (field.errors['minlength']) {
        const minLength = field.errors['minlength'].requiredLength;
        return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} must be at least ${minLength} characters`;
      }
    }
    return '';
  }
}
