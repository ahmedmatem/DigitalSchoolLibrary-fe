import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { AppHeader } from '../app-header/app-header';
import { MobileNavigation } from '../mobile-navigation/mobile-navigation';

@Component({
  selector: 'sl-app-shell',
  imports: [
    RouterOutlet,
    AppHeader,
    MobileNavigation,
  ],
  templateUrl: './app-shell.html',
  styleUrl: './app-shell.scss',
})
export class AppShell {
  readonly mobileMenuOpen = signal(false);

  openMobileMenu(): void {
    this.mobileMenuOpen.set(true);
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen.set(false);
  }
}