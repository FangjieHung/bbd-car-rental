import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  template: `
    <div class="home-page max-w-2xl mx-auto p-4 sm:p-6">
      <h1 class="ui-text-title mb-4">民宿分銷平台</h1>
      <p>請透過您取得的專屬連結（例如 /p/您的代碼）進入代訂頁面。</p>
    </div>
  `,
})
export class HomeComponent {}
