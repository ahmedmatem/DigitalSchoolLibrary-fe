import {
  Component,
  input,
} from '@angular/core';

@Component({
  selector: 'sl-generic-viewer',
  standalone: true,
  templateUrl: './generic-viewer.html',
  styleUrl: './generic-viewer.scss',
})
export class GenericViewer {
  readonly url = input.required<string>();

  readonly title = input.required<string>();

  readonly typeLabel = input<string>('Ресурс');

  openResource(): void {
    window.open(
      this.url(),
      '_blank',
      'noopener,noreferrer'
    );
  }
}