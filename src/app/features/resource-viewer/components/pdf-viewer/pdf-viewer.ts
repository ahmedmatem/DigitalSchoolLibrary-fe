import {
  Component,
  computed,
  inject,
  input,
} from '@angular/core';

import {
  DomSanitizer,
} from '@angular/platform-browser';

@Component({
  selector: 'sl-pdf-viewer',
  standalone: true,
  templateUrl: './pdf-viewer.html',
  styleUrl: './pdf-viewer.scss',
})
export class PdfViewer {
  private readonly sanitizer = inject(DomSanitizer);

  readonly url =
    input.required<string>();

  readonly safeUrl = computed(() =>
    this.sanitizer.bypassSecurityTrustResourceUrl(
      this.url()
    )
  );

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