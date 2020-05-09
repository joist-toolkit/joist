import { defineElement, ElementInstance, Component } from '@joist/component';
import { html } from 'lit-html';

import { litHtml } from './lit_html_renderer';

describe('lit-html', () => {
  @Component({
    providers: [litHtml()],
    render() {
      return html`<h1>Hello World</h1>`;
    },
  })
  class MyComponent {}

  customElements.define('lit-html-1', defineElement(MyComponent));

  it('should correctly render HTML using lit-html', () => {
    const el = document.createElement('lit-html-1') as ElementInstance<MyComponent>;

    expect(el.querySelector('h1')).toBeDefined();
  });
});
