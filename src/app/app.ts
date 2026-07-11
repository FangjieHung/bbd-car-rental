import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ZH_TW } from './core/i18n/zh-tw';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MatToolbarModule],
  template: `
    <mat-toolbar color="primary" class="gap-4 !flex-wrap">
      <span class="font-bold">{{ t.app.title }}</span>
      <nav class="flex gap-3 text-sm">
        <a routerLink="/dashboard" routerLinkActive="underline">{{ t.nav.dashboard }}</a>
        <a routerLink="/vehicles" routerLinkActive="underline">{{ t.nav.vehicles }}</a>
        <a routerLink="/dispatch" routerLinkActive="underline">{{ t.nav.dispatch }}</a>
        <a routerLink="/bookings" routerLinkActive="underline">{{ t.nav.bookings }}</a>
        <a routerLink="/maintenance" routerLinkActive="underline">{{ t.nav.maintenance }}</a>
      </nav>
    </mat-toolbar>
    <main class="max-w-6xl mx-auto">
      <router-outlet />
    </main>
  `,
})
export class App {
  protected readonly t = ZH_TW;
}
