import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { BreakpointObserver } from '@angular/cdk/layout';
import { ConnectedPosition, OverlayModule } from '@angular/cdk/overlay';
import { NgFor, NgIf } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavContainer, MatSidenavModule } from '@angular/material/sidenav';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter, map } from 'rxjs/operators';
import { ZH_TW } from './core/i18n/zh-tw';
import { ThemeSwitcherComponent } from '@car-rental/theme-pack';

interface NavLeaf {
  route: string;
  label: string;
  icon: string;
}

interface NavGroup {
  label: string;
  icon: string;
  children: NavLeaf[];
}

type NavEntry = NavLeaf | NavGroup;

function isNavGroup(entry: NavEntry): entry is NavGroup {
  return 'children' in entry;
}

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    NgFor,
    NgIf,
    MatSidenavModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    OverlayModule,
    ThemeSwitcherComponent,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  protected readonly t = ZH_TW;
  protected readonly isNavGroup = isNavGroup;

  protected readonly navItems: NavEntry[] = [
    { route: '/dashboard', label: this.t.nav.dashboard, icon: '◉' },
    {
      label: this.t.nav.productGroup,
      icon: '◫',
      children: [
        { route: '/vehicles', label: this.t.nav.vehicles, icon: '◫' },
        { route: '/maintenance', label: this.t.nav.maintenance, icon: '◎' },
        { route: '/add-ons', label: this.t.nav.addOns, icon: '◇' },
      ],
    },
    { route: '/bookings', label: this.t.nav.bookings, icon: '◍' },
    {
      label: this.t.nav.pricingGroup,
      icon: '◈',
      children: [
        { route: '/pricing', label: this.t.nav.pricing, icon: '◈' },
        { route: '/coupons', label: this.t.nav.coupons, icon: '◆' },
      ],
    },
    {
      label: this.t.nav.partnerGroup,
      icon: '◐',
      children: [
        { route: '/partners', label: this.t.nav.partners, icon: '◐' },
        { route: '/commission', label: this.t.nav.commission, icon: '◑' },
      ],
    },
  ];

  private readonly navLeaves: NavLeaf[] = this.navItems.flatMap((entry) =>
    isNavGroup(entry) ? entry.children : [entry],
  );

  protected isMobile = false;
  protected isSidenavOpen = true;
  protected currentTitle = String(this.t.nav.dashboard);
  protected currentGroupLabel: string | null = null;
  protected openGroupLabel: string | null = null;
  protected collapsed = false;

  protected readonly flyoutPositions: ConnectedPosition[] = [
    { originX: 'end', originY: 'top', overlayX: 'start', overlayY: 'top', offsetX: 8 },
    { originX: 'end', originY: 'bottom', overlayX: 'start', overlayY: 'bottom', offsetX: 8 },
  ];

  @ViewChild(MatSidenavContainer) private sidenavContainer?: MatSidenavContainer;

  private readonly breakpointObserver = inject(BreakpointObserver);
  private readonly router = inject(Router);

  ngOnInit(): void {
    this.breakpointObserver.observe(['(max-width: 900px)']).subscribe((result) => {
      this.isMobile = result.matches;
      this.isSidenavOpen = !result.matches;
      if (this.isMobile) {
        this.collapsed = false;
      }
    });

    this.router.events
      .pipe(
        filter((event) => event.type === 1),
        map(() => this.router.url),
      )
      .subscribe((url) => {
        const active = this.navLeaves.find(
          (item) => item.route === url || url.startsWith(`${item.route}/`),
        );
        this.currentTitle = active?.label ?? this.t.nav.dashboard;

        const activeGroup = active
          ? this.navItems.find(
              (entry): entry is NavGroup => isNavGroup(entry) && entry.children.includes(active),
            )
          : undefined;
        this.currentGroupLabel = activeGroup?.label ?? null;

        if (activeGroup) {
          this.openGroupLabel = activeGroup.label;
        }
      });
  }

  protected toggleSidenav(): void {
    this.isSidenavOpen = !this.isSidenavOpen;
  }

  protected toggleCollapsed(): void {
    this.collapsed = !this.collapsed;
    this.openGroupLabel = null;
  }

  protected onSidenavTransitionEnd(): void {
    this.sidenavContainer?.updateContentMargins();
  }

  protected onNavClick(): void {
    if (this.isMobile) {
      this.isSidenavOpen = false;
    }
  }

  protected toggleGroup(label: string): void {
    this.openGroupLabel = this.openGroupLabel === label ? null : label;
  }

  protected isGroupActive(group: NavGroup): boolean {
    const url = this.router.url;
    return group.children.some(
      (child) => child.route === url || url.startsWith(`${child.route}/`),
    );
  }
}
