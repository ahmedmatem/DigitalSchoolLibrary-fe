import {
  Component,
  input,
} from '@angular/core';

@Component({
  selector: 'sl-video-viewer',
  standalone: true,
  templateUrl: './video-viewer.html',
  styleUrl: './video-viewer.scss',
})
export class VideoViewer {
  readonly url = input.required<string>();

  readonly title = input<string>('Видео ресурс');
}