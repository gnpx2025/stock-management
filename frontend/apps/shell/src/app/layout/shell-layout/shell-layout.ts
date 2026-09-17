import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  HostListener,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterOutlet } from '@angular/router';
import { TranslatePipe } from '@erp/i18n';
import { fromEvent } from 'rxjs';
import { GlobalLoaderComponent } from '../global-loader/global-loader';
import { ShellSidebarComponent } from '../shell-sidebar/shell-sidebar';
import { ShellTopbarComponent } from '../shell-topbar/shell-topbar';

const NAV_DRAWER_MQ = '(max-width: 56rem)';

@Component({
  selector: 'app-shell-layout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterOutlet,
    GlobalLoaderComponent,
    ShellSidebarComponent,
    ShellTopbarComponent,
    TranslatePipe,
  ],
  templateUrl: './shell-layout.html',
  styleUrl: './shell-layout.scss',
})
export class ShellLayoutComponent {
  private readonly destroyRef = inject(DestroyRef);

  protected readonly navOpen = signal(false);

  constructor() {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return;
    }

    const mq = window.matchMedia(NAV_DRAWER_MQ);
    const sync = (): void => {
      if (!mq.matches) {
        this.navOpen.set(false);
      }
    };
    sync();

    fromEvent<MediaQueryListEvent>(mq, 'change')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(sync);
  }

  protected toggleNav(): void {
    this.navOpen.update((open) => !open);
  }

  protected closeNav(): void {
    this.navOpen.set(false);
  }

  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    this.closeNav();
  }
}
