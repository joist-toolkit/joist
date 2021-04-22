import { Injector, service } from '@joist/di';
import { expect } from '@open-wc/testing';

import { JoistDi, get } from './di';
import { getEnvironmentRef, clearEnvironment } from './environment';

describe('environment', () => {
  afterEach(clearEnvironment);

  it('should create a global Injector instance', () => {
    expect(getEnvironmentRef()).to.be.instanceOf(Injector);
  });

  it('should use the root injector when creating services', () => {
    @service()
    class MyService {}

    class MyElement extends JoistDi(HTMLElement) {
      @get(MyService)
      myService!: MyService;
    }

    customElements.define('environment-test-1', MyElement);

    const el = new MyElement();

    expect(el.myService).to.equal(getEnvironmentRef().get(MyService));
  });
});
