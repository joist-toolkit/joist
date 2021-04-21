import { WithDi } from '@joist/component';
import { expect } from '@open-wc/testing';

import { defineTestBed } from './main';

describe('testing', () => {
  it('should create a new instance of a custom element with the correct injector root', () => {
    class Foo extends WithDi(HTMLElement) {}

    customElements.define('testing-0', Foo);

    class MyService {
      title = 'foo';
    }

    const testbed = defineTestBed([
      {
        provide: MyService,
        use: class {
          title = 'bar';
        },
      },
    ]);

    const el = testbed.create(Foo);

    expect(el.injector.get(MyService).title).to.equal('bar');
  });
});
