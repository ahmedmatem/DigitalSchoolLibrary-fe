import {
  Component,
} from '@angular/core';

import {
  RouterLink,
} from '@angular/router';


@Component({
  selector: 'sl-access-denied',

  standalone: true,

  imports: [
    RouterLink,
  ],

  templateUrl: './access-denied.html',
  styleUrl: './access-denied.scss',
})
export class AccessDenied {
}