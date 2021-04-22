import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators';

import { JoistDi } from '@joist/component';

export interface AppState {
  title: string;
}

@customElement('app-root')
export class AppElement extends JoistDi(LitElement) {
  title = 'Hello World';

  render() {
    return html`<h1>${this.title}</h1>`;
  }
}
