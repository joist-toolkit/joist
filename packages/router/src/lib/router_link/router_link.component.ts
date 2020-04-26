import {
  Component,
  StateRef,
  State,
  Prop,
  OnPropChanges,
  ElRef,
  OnConnected,
  OnDisconnected,
  defineElement,
} from '@lit-kit/component';

import { RouterRef, Router } from '../router';

export type RouterLinkState = HTMLAnchorElement | null;

export class ActiveOptions {
  pathMatch: 'full' | 'startsWith' = 'startsWith';
  className: string = 'active';

  constructor(seed?: Partial<ActiveOptions>) {
    Object.assign(this, seed);
  }
}

@Component<RouterLinkState>({
  initialState: null,
  template: (ctx) => ctx.state,
})
export class RouterLinkComponent implements OnPropChanges, OnConnected, OnDisconnected {
  @Prop() path: string = '';
  @Prop() activeOptions: ActiveOptions = new ActiveOptions();

  private normalizedPath: string = '';
  private removeListener?: Function;

  constructor(
    @StateRef private state: State<RouterLinkState>,
    @RouterRef private router: Router,
    @ElRef private elRef: HTMLElement
  ) {}

  connectedCallback() {
    this.removeListener = this.router.listen(() => {
      this.setActiveClass();
    });
  }

  disconnectedCallback() {
    if (this.removeListener) {
      this.removeListener();
    }
  }

  onPropChanges(key: string) {
    if (key === 'path') {
      this.normalizedPath = this.router.normalize(this.path);

      const anchor = this.state.value || document.createElement('a');

      anchor.href = this.path;
      anchor.onclick = (e) => {
        e.preventDefault();

        this.router.navigate(this.path);
      };

      if (!this.state.value) {
        anchor.innerHTML = this.elRef.innerHTML;
        this.state.setValue(anchor);
      }
    }

    this.setActiveClass();
  }

  private setActiveClass() {
    const fragment = this.router.getFragment();
    const { className, pathMatch } = this.activeOptions;

    if (pathMatch === 'full') {
      if (fragment === this.normalizedPath) {
        this.elRef.classList.add(className);
      } else {
        this.elRef.classList.remove(className);
      }
    } else if (fragment.startsWith(this.normalizedPath)) {
      this.elRef.classList.add(className);
    } else {
      this.elRef.classList.remove(className);
    }
  }
}

export const RouterLinkElement = defineElement(RouterLinkComponent);
