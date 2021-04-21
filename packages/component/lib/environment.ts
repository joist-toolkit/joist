import { Injector, Provider, ProviderToken } from '@joist/di';

const ROOT_ATTR = '__joist__injector__root__';

let rootInjector: Injector | undefined;

export function defineEnvironment(providers: Provider<any>[] = []): Injector {
  rootInjector = new Injector({ providers });

  return rootInjector;
}

export function getEnvironmentRef(): Injector {
  if (rootInjector) {
    return rootInjector;
  }

  return defineEnvironment();
}

export function clearEnvironment(): void {
  rootInjector = undefined;
}

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

export function WithDi<T extends new (...args: any[]) => HTMLElement>(Base: T) {
  return class Injected extends Base implements InjectorBase {
    public injector = new Injector({}, getEnvironmentRef());

    constructor(..._: any[]) {
      super();

      this.setAttribute(ROOT_ATTR, 'true');
    }

    connectedCallback() {
      if (!!super.connectedCallback) {
        super.connectedCallback();
      }

      this.attachToDiTree();
    }

    attachToDiTree() {
      const parent = this.parentElement?.closest<InjectorBase & HTMLElement>(`[${ROOT_ATTR}]`);

      if (parent && parent.injector) {
        this.injector.parent = parent.injector;
      }
    }
  };
}
