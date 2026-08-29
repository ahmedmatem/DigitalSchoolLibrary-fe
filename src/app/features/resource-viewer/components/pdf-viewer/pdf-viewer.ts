import {
  Component,
  input,
} from '@angular/core';

@Component({
  selector: 'sl-pdf-viewer',
  standalone: true,
  templateUrl: './pdf-viewer.html',
  styleUrl: './pdf-viewer.scss',
})
export class PdfViewer {
  readonly url =
    input.required<string>();

  readonly title =
    input<string>('PDF документ');

  openInNewWindow(): void {
    window.open(
      this.url(),
      '_blank',
      'noopener,noreferrer'
    );
  }
}