import { JoistDi } from '@joist/component';

export interface AppState {
  title: string;
}

export class AppElement extends JoistDi(HTMLElement) {
  title = 'Hello World';

  connectedCallback() {
    super.connectedCallback();

    const title = document.createElement('h1');

    title.innerHTML = this.title;

    this.append(title);
  }
}

customElements.define('app-root', AppElement);
