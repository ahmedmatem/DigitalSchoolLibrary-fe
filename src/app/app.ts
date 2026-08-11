import { Component, signal } from '@angular/core';
import { AppShell } from './layout/app-shell/app-shell';

@Component({
  selector: 'sl-root',
  imports: [AppShell],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  
}
