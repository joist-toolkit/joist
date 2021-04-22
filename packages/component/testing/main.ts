import { InjectorBase, JoistDi } from '@joist/component';
import { Provider, ProviderToken } from '@joist/di';

type TestBedBase = HTMLElement & InjectorBase;

class TestBed {
  constructor(private host: TestBedBase) {
    document.body.appendChild(this.host);
  }

  create<T extends HTMLElement>(CEC: new (...args: any[]) => T): T {
    return this.host.appendChild(new CEC());
  }

  get<T>(token: ProviderToken<T>) {
    return this.host.injector.get(token);
  }

  clean() {
    document.removeChild(this.host);

    document.body.appendChild(this.host);
  }
}

class Host extends JoistDi(HTMLElement) {
  constructor() {
    super();

    this.injector.parent = undefined;
  }
}

customElements.define('joist-test-bed', Host);

export function defineTestBed(providers: Provider<any>[] = []) {
  const host = new Host();

  host.injector.options = { providers };

  return new TestBed(host);
}
