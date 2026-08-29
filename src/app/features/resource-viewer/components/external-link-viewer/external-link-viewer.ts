import {
  Component,
  input,
} from '@angular/core';

@Component({
  selector: 'sl-external-link-viewer',
  standalone: true,
  templateUrl: './external-link-viewer.html',
  styleUrl: './external-link-viewer.scss',
})
export class ExternalLinkViewer {
  readonly url = input.required<string>();

  readonly title = input.required<string>();

  openLink(): void {
    window.open(
      this.url(),
      '_blank',
      'noopener,noreferrer'
    );
  }
}