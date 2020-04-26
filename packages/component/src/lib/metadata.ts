import { ProviderToken, Provider } from '@lit-kit/di';

export const COMPONENT_METADATA_KEY = 'litKitComponentMetadata';
export const COMPONENT_DEF_KEY = 'litKitComponentDef';

export type TemplateEvent = (event: string, ...args: unknown[]) => (e: Event) => void;

export interface TemplateCtx<T> {
  state: T;
  run: TemplateEvent;
  dispatch: (eventName: string, detail?: any) => () => void;
}

export type TemplateDef<T> = (ctx: TemplateCtx<T>) => unknown;

export interface ComponentDef<T> {
  template: TemplateDef<T>;
  initialState?: T;
  useShadowDom?: boolean;
  observedAttributes?: string[];
  use?: Provider<any>[];
}

export class ComponentMetadata {
  handlers: { [key: string]: Function } = {};
  props: string[] = [];
}

export function getComponentMetadata(provider: ProviderToken<any>): ComponentMetadata {
  const metadata = provider[COMPONENT_METADATA_KEY];

  if (!metadata) {
    provider[COMPONENT_METADATA_KEY] = new ComponentMetadata();
  }

  return provider[COMPONENT_METADATA_KEY];
}

export function getComponentDef<T>(provider: ProviderToken<any>): ComponentDef<T> {
  const def = provider[COMPONENT_DEF_KEY];

  if (!def) {
    throw new Error(`${provider} is not a component. add the @Component decorator.`);
  }

  return provider[COMPONENT_DEF_KEY];
}
