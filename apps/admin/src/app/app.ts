import { Component, inject, OnInit } from '@angular/core';
import { BreakpointObserver } from '@angular/cdk/layout';
import { NgFor } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter, map } from 'rxjs/operators';
import { ZH_TW } from './core/i18n/zh-tw';
import { ThemeSwitcherComponent } from '@car-rental/theme-pack';

interface NavItem {
  route: string;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    NgFor,
    MatSidenavModule,
    MatButtonModule,
    MatIconModule,
    ThemeSwitcherComponent,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  protected readonly t = ZH_TW;

  protected readonly navItems: NavItem[] = [
    { route: '/dashboard', label: this.t.nav.dashboard, icon: '◉' },
    { route: '/vehicles', label: this.t.nav.vehicles, icon: '◫' },
    { route: '/dispatch', label: this.t.nav.dispatch, icon: '◌' },
    { route: '/bookings', label: this.t.nav.bookings, icon: '◍' },
    { route: '/maintenance', label: this.t.nav.maintenance, icon: '◎' },
  ];

  protected isMobile = false;
  protected isSidenavOpen = true;
  protected currentTitle = String(this.t.nav.dashboard);

  private readonly breakpointObserver = inject(BreakpointObserver);
  private readonly router = inject(Router);

  ngOnInit(): void {
    this.breakpointObserver.observe(['(max-width: 900px)']).subscribe((result) => {
      this.isMobile = result.matches;
      this.isSidenavOpen = !result.matches;
    });

    this.router.events
      .pipe(
        filter((event) => event.type === 1),
        map(() => this.router.url),
      )
      .subscribe((url) => {
        const active = this.navItems.find(
          (item) => item.route === url || url.startsWith(`${item.route}/`),
        );
        this.currentTitle = active?.label ?? this.t.nav.dashboard;
      });
  }

  protected toggleSidenav(): void {
    this.isSidenavOpen = !this.isSidenavOpen;
  }

  protected onNavClick(): void {
    if (this.isMobile) {
      this.isSidenavOpen = false;
    }
  }
}
