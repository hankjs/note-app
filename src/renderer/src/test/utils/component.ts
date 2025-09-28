import { type ComponentMountingOptions, mount } from "@vue/test-utils";
import { type SetupContext, type VNodeProps, h } from "vue";

type SetupFn<V, P> = (props?: P, context?: SetupContext) => V;
type ComponentOrSetup<V, P> =
  | SetupFn<V, P>
  | {
      setup: SetupFn<V, P>;
      [k: string]: any;
    };

/**
 * test-utils 封装，直接使用setup，不用重复处理组件mount
 * @param comp
 * @param options
 */
export function useSetup<V, P extends VNodeProps = any>(
  comp: ComponentOrSetup<V, P>,
  options?: {
    /** Comp使用的Props */
    props?: P;
    wrapper?: ComponentOrSetup<any, any>;
    /** test-utils mount options */
    options?: ComponentMountingOptions<any>;
  },
) {
  let setupFn: SetupFn<V, P>;
  let compOptions: any;
  if (typeof comp === "function") {
    setupFn = comp;
    compOptions = {};
  } else {
    setupFn = comp.setup;
    compOptions = comp;
  }

  /** 真正渲染的组件 */
  const Comp = {
    render() {},
    ...compOptions,
    name: "ProvideChild",
    setup(props: P, context: SetupContext) {
      const v = setupFn(props, context);
      return {
        hooks: () => v,
      };
    },
  };

  /** 为了处理provide之类需要父组件的功能，添加了一层Wrapper */
  let wrapperSetupFn: SetupFn<V, P>;
  let wrapperCompOptions: any;
  const wrapper = options?.wrapper;
  if (typeof wrapper === "function") {
    wrapperSetupFn = wrapper;
    wrapperCompOptions = {};
  } else {
    wrapperSetupFn = wrapper?.setup ?? (() => {});
    wrapperCompOptions = wrapper ?? {};
  }
  const Wrapper = {
    ...wrapperCompOptions,
    setup(props: P, context: SetupContext) {
      const v = wrapperSetupFn(props, context);
      return {
        hooks: () => v,
      };
    },
    render() {
      return h(Comp, options?.props);
    },
  };

  const $wrapper = mount(Wrapper, options?.options);
  const $vm = $wrapper.findComponent(Comp);

  return {
    $wrapper,
    $vm,
    ...($vm.vm.hooks() as V),
  };
}