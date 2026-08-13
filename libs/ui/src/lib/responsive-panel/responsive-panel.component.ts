import {
  Component,
  effect,
  ElementRef,
  HostListener,
  inject,
  input,
  output,
  viewChild,
} from '@angular/core';
import { BreakpointObserver } from '@angular/cdk/layout';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

const NARROW_QUERY = '(max-width: 1024px)';
const FOCUSABLE_SELECTOR =
  'button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

@Component({
  selector: 'lib-responsive-panel',
  templateUrl: './responsive-panel.component.html',
  styleUrl: './responsive-panel.component.scss',
})
export class ResponsivePanelComponent {
  readonly open = input(false);
  readonly heading = input('');
  readonly closeLabel = input.required<string>();
  readonly closed = output<void>();

  private readonly breakpointObserver = inject(BreakpointObserver);
  protected readonly isNarrow = toSignal(
    this.breakpointObserver.observe([NARROW_QUERY]).pipe(map((result) => result.matches)),
    { initialValue: false },
  );

  private readonly panelRef = viewChild<ElementRef<HTMLElement>>('panel');
  private lastFocused: HTMLElement | null = null;

  constructor() {
    // Effect 1: Focus lifecycle (only depends on open() transitions)
    effect(() => {
      if (this.open()) {
        this.lastFocused = document.activeElement as HTMLElement | null;
        this.focusableElements()[0]?.focus();
      } else {
        this.lastFocused?.focus?.();
        this.lastFocused = null;
      }
    });

    // Effect 2: Scroll lock (always reflects current open && isNarrow state)
    effect(() => {
      document.body.style.overflow = this.open() && this.isNarrow() ? 'hidden' : '';
    });
  }

  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    if (this.open()) this.closed.emit();
  }

  protected onTrapKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Tab' || !this.isNarrow()) return;
    const focusables = this.focusableElements();
    if (focusables.length === 0) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  private focusableElements(): HTMLElement[] {
    const root = this.panelRef()?.nativeElement;
    return root ? Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)) : [];
  }
}
