import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MatToolbarModule],
  template: `
    <mat-toolbar color="primary" class="gap-4 !flex-wrap">
      <span class="font-bold">澎湖租車後台</span>
      <nav class="flex gap-3 text-sm">
        <a routerLink="/dashboard" routerLinkActive="underline">總覽</a>
        <a routerLink="/vehicles" routerLinkActive="underline">車輛管理</a>
        <a routerLink="/dispatch" routerLinkActive="underline">調度看板</a>
        <a routerLink="/bookings" routerLinkActive="underline">訂單管理</a>
        <a routerLink="/maintenance" routerLinkActive="underline">保養管理</a>
      </nav>
    </mat-toolbar>
    <main class="max-w-6xl mx-auto">
      <router-outlet />
    </main>
  `,
})
export class App {}
