import { describe, it, expect, beforeEach } from 'vitest';
import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ResponsivePanelComponent } from './responsive-panel.component';
import { of } from 'rxjs';
import { BreakpointObserver } from '@angular/cdk/layout';

@Component({
  imports: [ResponsivePanelComponent],
  template: `
    <button type="button" class="trigger" (click)="open.set(true)">開啟</button>
    <lib-responsive-panel
      [open]="open()"
      [heading]="heading()"
      closeLabel="關閉面板"
      (closed)="onClosed()"
    >
      <p class="content">內容</p>
      <button type="button" class="content-action">動作</button>
    </lib-responsive-panel>
  `,
})
class HostComponent {
  readonly open = signal(false);
  readonly heading = signal('標題');
  closedCount = 0;
  onClosed(): void {
    this.closedCount++;
  }
}

describe('ResponsivePanelComponent', () => {
  let fixture: ReturnType<typeof TestBed.createComponent<HostComponent>>;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HostComponent] });
    fixture = TestBed.createComponent(HostComponent);
  });

  it('open 為 false 時不渲染投影內容', () => {
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.content')).toBeNull();
  });

  it('open 為 true 時渲染投影內容與標題', () => {
    fixture.componentInstance.open.set(true);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.content')?.textContent).toContain('內容');
    expect(fixture.nativeElement.textContent).toContain('標題');
  });

  it('點關閉鈕發出 closed', () => {
    fixture.componentInstance.open.set(true);
    fixture.detectChanges();

    const closeButton: HTMLButtonElement = fixture.nativeElement.querySelector(
      '.responsive-panel__close',
    );
    closeButton.click();
    fixture.detectChanges();

    expect(fixture.componentInstance.closedCount).toBe(1);
  });

  it('關閉鈕的 aria-label 來自 closeLabel input', () => {
    fixture.componentInstance.open.set(true);
    fixture.detectChanges();

    const closeButton: HTMLButtonElement = fixture.nativeElement.querySelector(
      '.responsive-panel__close',
    );
    expect(closeButton.getAttribute('aria-label')).toBe('關閉面板');
  });
});

function provideBreakpoint(matches: boolean) {
  return {
    provide: BreakpointObserver,
    useValue: { observe: () => of({ matches, breakpoints: {} }) },
  };
}

describe('ResponsivePanelComponent 響應式行為', () => {
  function createFixture(narrow: boolean) {
    TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [provideBreakpoint(narrow)],
    });
    const fixture = TestBed.createComponent(HostComponent);
    fixture.componentInstance.open.set(true);
    fixture.detectChanges();
    return fixture;
  }

  it('窄螢幕：具 role=dialog 與 aria-modal，且有遮罩', () => {
    const fixture = createFixture(true);
    const panel: HTMLElement = fixture.nativeElement.querySelector('.responsive-panel');

    expect(panel.getAttribute('role')).toBe('dialog');
    expect(panel.getAttribute('aria-modal')).toBe('true');
    expect(fixture.nativeElement.querySelector('.responsive-panel__backdrop')).not.toBeNull();
  });

  it('窄螢幕：點遮罩發出 closed', () => {
    const fixture = createFixture(true);
    const backdrop: HTMLElement = fixture.nativeElement.querySelector(
      '.responsive-panel__backdrop',
    );

    backdrop.click();
    fixture.detectChanges();

    expect(fixture.componentInstance.closedCount).toBe(1);
  });

  it('寬螢幕：無 role/aria-modal，無遮罩', () => {
    const fixture = createFixture(false);
    const panel: HTMLElement = fixture.nativeElement.querySelector('.responsive-panel');

    expect(panel.hasAttribute('role')).toBe(false);
    expect(panel.hasAttribute('aria-modal')).toBe(false);
    expect(fixture.nativeElement.querySelector('.responsive-panel__backdrop')).toBeNull();
  });

  it('開啟時按 Esc 發出 closed', () => {
    const fixture = createFixture(false);

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    fixture.detectChanges();

    expect(fixture.componentInstance.closedCount).toBe(1);
  });

  it('關閉時按 Esc 不動作', () => {
    TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [provideBreakpoint(false)],
    });
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    fixture.detectChanges();

    expect(fixture.componentInstance.closedCount).toBe(0);
  });
});
