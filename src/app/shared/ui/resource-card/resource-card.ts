import {
  Component,
  input,
  output,
} from '@angular/core';

import {
  LucideBookmark,
  LucideBookmarkCheck,
  LucideFileText,
} from '@lucide/angular';

import { Chip } from '../chip/chip';
import { IconButton } from '../icon-button/icon-button';

import { ResourceCardVm } from './resource-card.model';

@Component({
  selector: 'sl-resource-card',
  imports: [
    Chip,
    IconButton,

    LucideBookmark,
    LucideBookmarkCheck,
    LucideFileText,
  ],
  templateUrl: './resource-card.html',
  styleUrl: './resource-card.scss',
})
export class ResourceCard {
  readonly resource = input.required<ResourceCardVm>();

  readonly openResource = output<string>();

  readonly savedChange = output<boolean>();

  toggleSaved(event: Event): void {
    event.stopPropagation();

    this.savedChange.emit(
      !this.resource().isSaved
    );
  }

  open(): void {
    this.openResource.emit(
      this.resource().id
    );
  }
}