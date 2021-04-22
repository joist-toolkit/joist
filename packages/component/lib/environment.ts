import { Injector, Provider } from '@joist/di';

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
