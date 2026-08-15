import {
  Component,
  input,
  output,
} from '@angular/core';

import {
  LucideSearch,
  LucideX,
} from '@lucide/angular';

@Component({
  selector: 'sl-search-field',
  imports: [
    LucideSearch,
    LucideX,
  ],
  templateUrl: './search-field.html',
  styleUrl: './search-field.scss',
})
export class SearchField {
  readonly value = input('');
  readonly placeholder = input('Търсене...');
  readonly disabled = input(false);

  readonly valueChange = output<string>();

  onInput(event: Event): void {
    const inputElement = event.target as HTMLInputElement;

    this.valueChange.emit(inputElement.value);
  }

  clear(): void {
    this.valueChange.emit('');
  }
}