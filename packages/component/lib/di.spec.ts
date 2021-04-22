import { expect } from '@open-wc/testing';
import { get, JoistDi } from './di';

describe('di', () => {
  it('should get an instance of a service', () => {
    class MyService {}

    class MyElement extends JoistDi(HTMLElement) {
      @get(MyService) myService!: MyService;
    }

    customElements.define('di-test-1', MyElement);

    expect(new MyElement().myService).of.be.instanceOf(MyService);
  });

  it('should use a parent injector if available', () => {
    class MyService {}

    class Parent extends JoistDi(HTMLElement) {
      @get(MyService) myService!: MyService;
    }

    class Child extends JoistDi(HTMLElement) {
      @get(MyService) myService!: MyService;
    }

    customElements.define('di-test-2', Parent);
    customElements.define('di-test-3', Child);

    const parent = new Parent();
    const child = new Child();

    document.body.appendChild(parent);

    parent.appendChild(child);

    expect(parent.myService === child.myService).to.be.true;

    document.body.removeChild(parent);
  });

  it('should apply local providers', () => {
    class MyService {}
    class MockService implements MyService {}

    class Parent extends JoistDi(HTMLElement, {
      providers: [{ provide: MyService, use: MockService }],
    }) {
      @get(MyService) myService!: MyService;
    }

    class Child extends JoistDi(HTMLElement) {
      @get(MyService) myService!: MyService;
    }

    customElements.define('di-test-4', Parent);
    customElements.define('di-test-5', Child);

    const parent = new Parent();
    const child = new Child();

    document.body.appendChild(parent);

    parent.appendChild(child);

    expect(parent.myService === child.myService).to.be.true;
    expect(child.myService).to.be.instanceOf(MockService);

    document.body.removeChild(parent);
  });
});
