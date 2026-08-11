import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { AppHeader } from '../app-header/app-header';

@Component({
  selector: 'sl-app-shell',
  imports: [
    RouterOutlet,
    AppHeader,
  ],
  templateUrl: './app-shell.html',
  styleUrl: './app-shell.scss',
})
export class AppShell {}