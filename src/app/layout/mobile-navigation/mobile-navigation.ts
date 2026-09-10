import {
  Component,
  computed,
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
  LucideSparkles,
  LucideLogOut,
  LucideFolderCog,
  LucidePlus,
} from '@lucide/angular';

import { IconButton } from '../../shared/ui/icon-button/icon-button';
import { getAppNavigation } from '../../core/navigation/app-navigation.config';

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
    LucideSparkles,
    LucideLogOut,
    LucideFolderCog,
    LucidePlus,
  ],
  templateUrl: './mobile-navigation.html',
  styleUrl: './mobile-navigation.scss',
})
export class MobileNavigation {
  readonly open = input(false);

  readonly authenticated = input(false);

  readonly displayName = input<string | null>(null);

  readonly role = input<'Student' | 'Teacher' | 'Admin' | null>(null);

  readonly navigationItems = computed(
    () => getAppNavigation(this.role())
  );

  readonly close = output<void>();
  
  readonly logout = output<void>();
}