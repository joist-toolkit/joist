import { Service } from '@lit-kit/di';

@Service()
export abstract class Renderer {
  render<O>(result: any, container: Element | DocumentFragment, _options: O): void {
    if (container.lastChild) {
      container.removeChild(container.lastChild);
    }

    container.appendChild(result);
  }
}
