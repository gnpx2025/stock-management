import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthSessionService, safeReturnUrl } from '@erp/core';
import { LanguageService, TranslatePipe } from '@erp/i18n';
import {
  ErpButtonComponent,
  ErpFormFieldComponent,
  ErpIconComponent,
  ErpPrefixDirective,
  ErpSuffixDirective,
} from '@erp/ui';

@Component({
  selector: 'app-login',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    ErpButtonComponent,
    ErpFormFieldComponent,
    ErpIconComponent,
    ErpPrefixDirective,
    ErpSuffixDirective,
    TranslatePipe,
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class LoginPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthSessionService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  protected readonly language = inject(LanguageService);

  protected readonly form = this.fb.nonNullable.group({
    usernameOrEmail: ['', Validators.required],
    password: ['', Validators.required],
  });

  protected readonly errorMessage = signal<string | null>(null);
  protected readonly submitting = signal(false);
  protected readonly hidePassword = signal(true);

  protected readonly usernameError = computed(() => {
    this.language.language();
    const control = this.form.controls.usernameOrEmail;
    return control.invalid && control.touched
      ? this.language.t(
          'auth.login.usernameRequired',
          'Username or email is required.',
        )
      : undefined;
  });

  protected readonly passwordError = computed(() => {
    this.language.language();
    const control = this.form.controls.password;
    return control.invalid && control.touched
      ? this.language.t('auth.login.passwordRequired', 'Password is required.')
      : undefined;
  });

  protected readonly passwordToggleLabel = computed(() => {
    this.language.language();
    return this.hidePassword()
      ? this.language.t('auth.login.showPassword', 'Show password')
      : this.language.t('auth.login.hidePassword', 'Hide password');
  });

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
        return this.language.t(
          'auth.login.error.rateLimited',
          'Too many login attempts. Please try again later.',
        );
      }
      if (error.status === 401 || error.status === 400) {
        return this.language.t(
          'auth.login.error.invalid',
          'Invalid username or password.',
        );
      }
    }
    return this.language.t(
      'auth.login.error.generic',
      'Unable to sign in. Check your connection and try again.',
    );
  }
}
