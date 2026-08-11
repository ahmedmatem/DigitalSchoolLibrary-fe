import { Component, input, output } from '@angular/core';
import {
  RouterLink,
  RouterLinkActive,
} from '@angular/router';

@Component({
  selector: 'sl-app-header',
  imports: [
    RouterLink,
    RouterLinkActive,
  ],
  templateUrl: './app-header.html',
  styleUrl: './app-header.scss',
})
export class AppHeader {
  readonly authenticated = input(false);

  readonly displayName = input<string | null>(null);

  readonly role = input<'Student' | 'Teacher' | 'Admin' | null>(null);

  readonly menuClick = output<void>();
}