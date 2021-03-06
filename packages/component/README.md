# @joist/component

### Installation

```BASH
npm i @joist/component @joist/di
```

### Component

Components are created via the "component" decorator and defining a custom element.
The render function will be called whenver a components [state](#component-state) is updated.
You can register your custom element either by passing in a `tagName` or my manually calling `customElements.define`

```TS
import { component, JoistElement } from '@joist/component';

@component({
  tagName: 'app-root', // register now
  state: {
    title: 'Hello World'
  },
  render({ state, host }) {
    host.innerHTML = state.title;
  }
})
class AppElement extends JoistElement {}

// register later: customElements.define('app-root', AppElement);
```

Once your component templates become more complicated you will probably reach for a view library.
Joist ships with out of the box support for lit-html.

```BASH
npm i lit-html
```

```TS
import { component, JoistElement } from '@joist/component';
import { template, html } from '@joist/component/lit-html';

@component({
  tagName: 'app-root',
  state: {
    title: 'Hello World'
  },
  render: template(({ state }) => {
    return html`
      <h1>${state.title}</h1>
    `
  })
})
class AppElement extends JoistElement {}
```

### Component Styling

When you are using shadow dom you can apply styles with the component `styles` property.
Joist components will leverage [Constructable Stylessheets](https://developers.google.com/web/updates/2019/02/constructable-stylesheets) when available but allows renderers to fall back for browsers without support

```TS
import { component, JoistElement } from '@joist/component';
import { template, html } from '@joist/component/lit-html';

@component({
  tagName: 'app-root',
  shadowDom: 'open',
  state: {
    title: 'Hello World'
  },
  styles: [`
    :host {
      display: block;
    }

    h1 {
      color: red;
    }
  `],
  render: template(({ state }) => {
    return html`
      <h1>${state.title}</h1>
    `
  })
})
class AppElement extends JoistElement {}
```

### Dependency injection (DI)

Sometimes you have code that you want to share between elements.
One method of doing this is with Joist's built in dependency injector.
The `@get` decorator will map a class property to an instance of a service.
One service can also inject another as an argument via the `@inject` decorator.
The `@service` decorator ensures that your class will be treated as a global singleton.

Property based DI with `@get` is "lazy", meaning that the service won't be instantiated until the first time it is requested.

```TS
import { component, JoistElement, get } from '@joist/component';
import { service, inject } from '@joist/di'

@service()
class FooService {
  sayHello() {
    return 'Hello World';
  }
}

@service()
class BarService {
  constructor(@inject(FooService) private foo: FooService) {}

  sayHello() {
    return this.foo.sayHello();
  }
}

@component({
  tagName: 'app-root',
})
class AppElement extends JoistElement {
  @get(BarService)
  private myService!: BarService;

  connectedCallback() {
    super.connectedCallback();

    console.log(this.myservice.sayHello());
  }
}
```

### Component State

A component render function is only run when a component's state is updated.
A component's state can be accessed and updated via it's `State` instance which is available using `@get`

```TS
import { component, State, JoistElement, get } from '@joist/component';

@component<number>({
  tagName: 'app-root',
  state: 0,
  render({ state, host }) {
    host.innerHTML = state.toString();
  }
})
class AppElement extends JoistElement {
  @get(State)
  private state!: State<number>;

  connectedCallback() {
    super.connectedCallback();

    setInterval(() => this.update(), 1000);
  }

  private update() {
    const { value } = this.state;

    this.state.setValue(value + 1);
  }
}
```

### Async Component State

Component state can be set asynchronously. This means that you can pass a Promise to `setState` and `patchState`.

```TS
import { component, State, JoistElement, get } from '@joist/component';
import { service } from '@joist/di';

@service()
class UserService {
  fetchUsers() {
    return fetch('https://reqres.in/api/users').then(res => res.json());
  }
}

interface AppState {
  loading: boolean;
  data: any[];
}

@component<AppState>({
  tagName: 'app-root',
  state: {
    loading: false,
    data: []
  },
  render({ state, host }) {
    host.innerHTML = JSON.stringify(state);
  }
})
class AppElement extends JoistElement {
  @get(State)
  private state!: State<AppState>;

  @get(UserService)
  private user!: UserService;

  connectedCallback() {
    super.connectedCallback();

    this.state.setValue({ data: [], loading: true });

    const res: Promise<AppState> = this.user.fetchUsers().then(data => {
      return { loading: false, data }
    });

    this.state.setValue(res);
  }
}
```

### Component Properties

Since joist just uses custom elements any properties on your element will work.
You can use custom getters and setters or decorate your props with `@property` which will cause `onPropChanges` to be called.

```TS
import { component, State, JoistElement, property, get } from '@joist/component';

@component({
  tagName: 'app-root',
  state: ''
  render({ state, host }) {
    host.innerHTML = state;
  },
})
class AppElement extends JoistElement {
  @get(State)
  private state!: State<string>;

  @property()
  public greeting = '';

  onPropChanges() {
    this.state.setValue(this.greeting);
  }
}
```

When on prop changes is called you will get a list of current changes. This, coupled with explicit state updates, gives you give fine grained control over when your component updates.

```TS
import { component, State, JoistElement, property, get, PropChange } from '@joist/component';

@component({
  tagName: 'app-root',
  state: ''
  render({ state, host }) {
    host.innerHTML = state;
  },
})
class AppElement extends JoistElement {
  @get(State)
  private state!: State<string>;

  @property()
  public foo = '';

  @property()
  public bar = '';

  @property()
  public baz = '';

  onPropChanges(changes: PropChange[]) {
    const keys = changes.map((change) => change.key);

    if (keys.includes('foo')) {
      this.state.patchValue(this.foo);
    }
  }
}
```

You can also provide validation functions to proeprty decorators for runtime safety.

```TS
import { component, JoistElement, property } from '@joist/component';

function isString(val: unknown) {
  if (typeof val === 'string') {
    return null;
  }

  return { message: 'error' };
}

function isLongerThan(length: number) {
  return function (val: string) {
    if (val.length > length) {
      return null;
    }

    return { message: 'Incorrect length' };
  }
}

@component()
class MyElement extends JoistElement {
  @property(isString, isLongerThan(2))
  public hello = 'Hello World';
}
```

### Component Handlers

Component handlers allow components to respond to actions in a components view.
Decorate component methods with `@handle('name')` to handle whatever is run.
Multiple methods can be mapped to the same key. And a single method can be mappped to multiple 'actions'.
A handler can also match using a RegExp.

```TS
import { component, State, handle, JoistElement, get } from '@joist/component';
import { template, html } from '@joist/component/lit-html';

@component<number>({
  tagName: 'app-root',
  state: 0,
  render: template(({ state, run }) => {
    return html`
      <button @click=${run('dec')}>Decrement</button>
      <span>${state}</span>
      <button @click=${run('inc')}>Increment</button>
    `
  })
})
class AppElement extends JoistElement {
  @get(State)
  private state!: State<number>;

  @handle('inc') increment() {
    return this.state.setValue(this.state.value + 1);
  }

  @handle('dec') decrement() {
    return this.state.setValue(this.state.value - 1);
  }

  @handle('inc')
  @handle('dec')
  either() {
    console.log('CALLED WHEN EITHER IS RUN')
  }

  @handle(/.*/)
  debug(e: Event, payload: any, name: string) {
    console.log('CALLED WHEN REGEX MATCHES');
    console.log('TRIGGERING EVENT', e);
    console.log('payload', payload);
    console.log('matched name', name);
  }
}
```

In addition to knowing WHEN something is being called sometimes you also want to know after your handlers are done doing whatever cool things they did.
Joist handlers can return a Promise and you can listen for when handlers have "settled".
The `onComplete` callback will be passed the initial action as well as any results from your various handlers.
In the below example, since `State.setValue` returns a promise we can just return it. Now we can track when events are dispatched and when those action's handlers have been completed.

```TS
import { component, State, handle, JoistElement, get, HandlerCtx } from '@joist/component';
import { template, html } from '@joist/component/lit-html';

@component({
  tagName: 'app-root',
  state: 0,
  render: template(({ state, run }) => {
    return html`
      <button @click=${run('dec', -1)}>Decrement</button>
      <span>${state}</span>
      <button @click=${run('inc', 1)}>Increment</button>
    `
  })
})
class AppElement extends JoistElement {
  @get(State)
  private state!: State<number>;

  @handle('inc')
  @handle('dec')
  updateCount(_: Event, val: number) {
    return this.state.setValue(this.state.value + val);
  }

  onComplete({ action }: HandlerCtx, res: any[]) {
    console.log({ action, payload, state: this.state.value });
  }
}
```

### Dispatching Events

In addition to calling `this.dispatchEvent` you can also use the dispatch function passed to your render function.

```TS
import { component, handle, JoistElement } from '@joist/component';
import { template, html } from '@joist/component/lit-html';

@component({
  tagName: 'app-root',
  render: template(({ dispatch }) => {
    return html`
      <button @click=${dispatch('custom_event')}>
        Custom Event
      </button>
    `
  })
})
class AppElement extends JoistElement {}
```

### Testing

When Joist elements attach to a document the check to see if they have a marked parent Injector and inherit from it.
Joist ships with a test harness that helps you creates scoped injectors.

```TS
import { defineTestBed } from '@joist/component/testing'
import { expect } from '@open-wc/testing'

import { AppElement } from './app.element';

describe('AppElement', () => {
  let el: AppElement;

  beforeEach(() => {
    el = defineTestBed().create(AppElement);
  });

  it('should work', () => {
    expect(el).to.be.instanceOf(AppElement);
  });
});
```

If you want to make use of mock providers you just have to pass them to your TestBed.

```TS
import { defineTestBed } from '@joist/component/testing'
import { expect } from '@open-wc/testing'

import { AppElement } from './app.element';
import { Myservice } from './my.service'

describe('AppElement', () => {
  let el: AppElement;

  beforeEach(() => {
    const testBed = defineTestBed([
      {
        provide: MyService,
        use: class {
          sayHello() {
            return 'GOTCHA!';
          }
        }
      },
    ]);

    el = testBed.create(AppElement)
  });

  it('should work', () => {
    expect(el.service.sayHello()).to.equal('GOTCHA!');
  });
});

```

### Use with Vanilla Custom ELements

Joist components are an opinionated way to write elements.
If you are not a fan of how it handles state management or anything else you can use the individual parts in any combination you like!
Individual features of JoistElement are exposed as mixins making it easy to apply functionality to other classes.

#### Use DI with any base class

You can use Joist's DI immplementation with any base class that you like.
The `withInjector` can be applied to a class which will make that class an `InjectorBase`.

```TS
import { service } from '@joist/di';
import { JoistDi, get } from '@joist/di/dom';

@service()
class FooService {
  sayHello(name: string) {
    return `Hello, ${name}`;
  }
}

export class MyElement extends JoistDi(HTMLElement) {
  @get(FooService)
  foo!: FooService;
}

customElements.define('my-element', MyElement)
```

#### Use properties and render however you want!

Much like DI, Joist's properties feature can be applied to any base class.
This means you can define properties and define how you want to handler rendering.

```TS
import { component, property, withPropChanges } from '@joist/component';
import { render, html } from 'lit-html';

@component({
  tagName: 'my-element',
  shadowDom: 'open'
})
export class MyElement extends withPropChanges(HTMLElement) {
  @property()
  public count = 0;

  onPropChanges() {
    this.render();
  }

  private template() {
    return html`
      <button @click=${() => this.count--}>Decrement</button>
      <span>${this.count}</span>
      <button @click=${() => this.count++}>Increment</button>
    `
  }

  private render() {
    render(this.template(), this.shadowRoot || this);
  }
}
```
