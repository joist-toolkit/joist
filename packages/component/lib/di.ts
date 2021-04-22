import { Injector, Provider, ProviderToken } from '@joist/di';

import { getEnvironmentRef } from './environment';

const ROOT_ATTR = '__joist__injector__';

export interface InjectorBase {
  injector: Injector;
}

export function get<T>(token: ProviderToken<T>) {
  return function (target: InjectorBase, key: string) {
    Object.defineProperty(target, key, {
      get(this: InjectorBase) {
        return this.injector.get(token);
      },
    });
  };
}

export interface JoistDiConfig {
  providers: Provider<any>[];
}

export function JoistDi<T extends new (...args: any[]) => HTMLElement>(
  Base: T,
  { providers }: JoistDiConfig = { providers: [] }
) {
  return class Injected extends Base implements InjectorBase {
    public injector = new Injector({ providers }, getEnvironmentRef());

    constructor(..._: any[]) {
      super();

      this.setAttribute(ROOT_ATTR, 'true');
    }

    connectedCallback() {
      if (!!super.connectedCallback) {
        super.connectedCallback();
      }

      const parent = this.parentElement?.closest<InjectorBase & HTMLElement>(`[${ROOT_ATTR}]`);

      if (parent && parent.injector) {
        this.injector.parent = parent.injector;
      }
    }

    disconnectedCallback() {
      if (!!super.disconnectedCallback) {
        super.disconnectedCallback();
      }

      this.injector.parent = undefined;
    }
  };
}
