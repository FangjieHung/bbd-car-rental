import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ZH_TW } from './core/i18n/zh-tw';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <header class="sticky top-0 z-10 bg-cream-50/95 backdrop-blur-sm">
      <div class="max-w-6xl mx-auto flex flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
        <span class="font-display font-extrabold text-lg tracking-tight">{{ t.app.title }}</span>
        <nav class="flex flex-wrap items-center gap-1.5">
          <a class="v-nav-pill" routerLink="/dashboard" routerLinkActive="active">{{ t.nav.dashboard }}</a>
          <a class="v-nav-pill" routerLink="/vehicles" routerLinkActive="active">{{ t.nav.vehicles }}</a>
          <a class="v-nav-pill" routerLink="/dispatch" routerLinkActive="active">{{ t.nav.dispatch }}</a>
          <a class="v-nav-pill" routerLink="/bookings" routerLinkActive="active">{{ t.nav.bookings }}</a>
          <a class="v-nav-pill" routerLink="/maintenance" routerLinkActive="active">{{ t.nav.maintenance }}</a>
        </nav>
      </div>
    </header>
    <main class="max-w-6xl mx-auto px-4 pb-10">
      <router-outlet />
    </main>
  `,
})
export class App {
  protected readonly t = ZH_TW;
}
