import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { AuthSessionService, safeReturnUrl } from '@erp/core';
import { ErpButtonComponent } from '@erp/ui';

@Component({
  selector: 'app-login',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    ErpButtonComponent,
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class LoginPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthSessionService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly form = this.fb.nonNullable.group({
    usernameOrEmail: ['', Validators.required],
    password: ['', Validators.required],
  });

  protected readonly errorMessage = signal<string | null>(null);
  protected readonly submitting = signal(false);
  protected readonly hidePassword = signal(true);

  protected get authenticating(): boolean {
    return this.submitting() || this.auth.status() === 'authenticating';
  }

  submit(): void {
    this.errorMessage.set(null);
    this.form.markAllAsTouched();

    if (this.form.invalid || this.authenticating) {
      return;
    }

    const { usernameOrEmail, password } = this.form.getRawValue();
    this.submitting.set(true);
    this.form.disable({ emitEvent: false });

    this.auth.login({ usernameOrEmail: usernameOrEmail.trim(), password }).subscribe({
      next: () => {
        this.submitting.set(false);
        const returnUrl = safeReturnUrl(
          this.route.snapshot.queryParamMap.get('returnUrl'),
        );
        void this.router.navigateByUrl(returnUrl);
      },
      error: (error: unknown) => {
        this.submitting.set(false);
        this.form.enable({ emitEvent: false });
        this.errorMessage.set(this.mapLoginError(error));
      },
    });
  }

  private mapLoginError(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 429) {
        return 'Too many login attempts. Please try again later.';
      }
      if (error.status === 401 || error.status === 400) {
        return 'Invalid username or password.';
      }
    }
    return 'Unable to sign in. Check your connection and try again.';
  }
}
