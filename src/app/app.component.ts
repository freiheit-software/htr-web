import { Component } from '@angular/core';

@Component({
  selector: 'htr-root',
  template: `
    <router-outlet></router-outlet>
  `,
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'htr-web';
}
