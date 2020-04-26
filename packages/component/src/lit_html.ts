import { Provider } from '@lit-kit/di';
import { render, RenderOptions } from 'lit-html';

import { Renderer } from './lib/renderer';

export class LitHtmlRenderer extends Renderer {
  render<TemplateResult>(
    templateResult: TemplateResult,
    container: Element | DocumentFragment,
    options: Partial<RenderOptions>
  ) {
    render(templateResult, container, options);
  }
}

export function withLitHtml(): Provider<Renderer> {
  return { provide: Renderer, useClass: LitHtmlRenderer };
}
