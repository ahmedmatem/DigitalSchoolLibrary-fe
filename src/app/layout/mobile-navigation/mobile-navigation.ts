import {
  Component,
  input,
  output,
} from '@angular/core';

import {
  RouterLink,
  RouterLinkActive,
} from '@angular/router';

import {
  LucideX,
  LucideBookOpen,
  LucideBookmark,
  LucideGraduationCap,
  LucideShield,
  LucideUser,
  LucideLogIn,
} from '@lucide/angular';

import { IconButton } from '../../shared/ui/icon-button/icon-button';

@Component({
  selector: 'sl-mobile-navigation',
  imports: [
    RouterLink,
    RouterLinkActive,
    IconButton,

    LucideX,
    LucideBookOpen,
    LucideBookmark,
    LucideGraduationCap,
    LucideShield,
    LucideUser,
    LucideLogIn,
  ],
  templateUrl: './mobile-navigation.html',
  styleUrl: './mobile-navigation.scss',
})
export class MobileNavigation {
  readonly open = input(false);

  readonly authenticated = input(false);

  readonly displayName = input<string | null>(null);

  readonly role = input<'Student' | 'Teacher' | 'Admin' | null>(null);

  readonly close = output<void>();
}