import { ProviderToken } from '@joist/di';

export const COMPONENT_HANDLERS_KEY = 'handlers';

export function getComponentHandlers(provider: ProviderToken<any>): Record<string, string[]> {
  return provider[COMPONENT_HANDLERS_KEY] || {};
}

export function Handle(action: string) {
  return function (instance: { constructor: ProviderToken<any>; [key: string]: any }, key: string) {
    const provider = instance.constructor;

    provider[COMPONENT_HANDLERS_KEY] = provider[COMPONENT_HANDLERS_KEY] || {};
    provider[COMPONENT_HANDLERS_KEY][action] = provider[COMPONENT_HANDLERS_KEY][action] || [];
    provider[COMPONENT_HANDLERS_KEY][action].push(key);
  };
}