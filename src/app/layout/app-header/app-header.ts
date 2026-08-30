import {
  Component,
  computed,
  ElementRef,
  HostListener,
  inject,
  output,
  signal,
} from '@angular/core';

import {
  Router,
  RouterLink,
  RouterLinkActive,
} from '@angular/router';

import {
  LucideBookmark,
  LucideFolderCog,
  LucideLogOut,
  LucideMenu,
  LucidePlus,
  LucideShieldCheck,
  LucideUserRound,
} from '@lucide/angular';

import {
  finalize,
} from 'rxjs';

import {
  AuthStateService,
} from '../../core/auth/services/auth-state.service';

import {
  AUTH_ROLES,
  AuthRole,
} from '../../core/auth/constants/auth-roles';

import {
  IconButton,
} from '../../shared/ui/icon-button/icon-button';


@Component({
  selector: 'sl-app-header',

  imports: [
    RouterLink,
    RouterLinkActive,

    IconButton,

    LucideMenu,
    LucideUserRound,
    LucideBookmark,
    LucidePlus,
    LucideShieldCheck,
    LucideFolderCog,
    LucideLogOut,
  ],

  templateUrl: './app-header.html',
  styleUrl: './app-header.scss',
})
export class AppHeader {

  private readonly authState = inject(AuthStateService);

  private readonly router = inject(Router);

  private readonly elementRef = inject(ElementRef<HTMLElement>);


  readonly menuClick = output<void>();


  readonly profileMenuOpen = signal(false);

  readonly loggingOut = signal(false);


  readonly authenticated = this.authState.isAuthenticated;

  readonly currentUser = this.authState.currentUser;


  readonly displayName = computed(
    () => this.currentUser()?.fullName ?? null
  );


  readonly role = computed<AuthRole | null>(() => {

    const roles = this.currentUser()?.roles ?? [];


    if (roles.includes(AUTH_ROLES.Admin)) {
      return AUTH_ROLES.Admin;
    }

    if (roles.includes(AUTH_ROLES.Teacher)) {
      return AUTH_ROLES.Teacher;
    }

    if (roles.includes(AUTH_ROLES.Student)) {
      return AUTH_ROLES.Student;
    }

    return null;
  });


  readonly roleLabel = computed(() => {

    const role = this.role();
    const user = this.currentUser();

    if (role === AUTH_ROLES.Admin) {
      return 'Администратор';
    }

    if (role === AUTH_ROLES.Teacher) {
      return 'Учител';
    }

    if (role === AUTH_ROLES.Student && user?.gradeNumber) {
      return `${user.gradeNumber}. клас · ученик`;
    }

    if (role === AUTH_ROLES.Student) {
      return 'Ученик';
    }

    return '';
  });


  readonly initials = computed(() => {

    const user = this.currentUser();

    if (!user) {
      return 'U';
    }

    const first = user.firstName?.charAt(0) ?? '';

    const last = user.lastName?.charAt(0) ?? '';

    return `${first}${last}`.toUpperCase();
  });


  toggleProfileMenu(event: MouseEvent): void {

    event.stopPropagation();

    this.profileMenuOpen.update(
      open => !open
    );
  }


  closeProfileMenu(): void {

    this.profileMenuOpen.set(false);
  }


  logout(): void {

    if (this.loggingOut()) {
      return;
    }

    this.loggingOut.set(true);


    this.authState
      .logout()
      .pipe(
        finalize(() => {
          this.loggingOut.set(false);
        })
      )
      .subscribe({

        next: () => {

          this.closeProfileMenu();

          void this.router.navigate(['/']);
        },

        error: () => {

          this.closeProfileMenu();
        },
      });
  }


  @HostListener(
    'document:click',
    ['$event']
  )
  onDocumentClick(event: MouseEvent): void {

    const target = event.target as Node | null;

    if (
      target &&
      !this.elementRef.nativeElement.contains(target)
    ) {
      this.closeProfileMenu();
    }
  }


  @HostListener('document:keydown.escape')
  onEscape(): void {

    this.closeProfileMenu();
  }
}