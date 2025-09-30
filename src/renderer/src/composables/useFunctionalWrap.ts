import { h, nextTick, ref, unref, watch } from "vue";
import type { Ref, FunctionalComponent, UnwrapRef, Component } from "vue";

export function useFunctionalWrap<CompInstance = unknown, Props extends Record<string, any> = any>(
  comp: unknown,
  props: Partial<Props> = {},
) {
  const compRef = ref<CompInstance>({} as CompInstance);

  async function getCompInstance() {
    await nextTick();
    const comp = unref(compRef);
    if (Object.keys(comp).length === 0) {
      console.error("未获取组件实例!");
    }
    return comp;
  }

  watch(
    () => props,
    async () => {
      if (props) {
        // console.log('table onMounted', { ...props });
        await nextTick();
        const instance = await getCompInstance();
        instance?.setProps?.(props);
      }
    },
    {
      deep: true,
      flush: "post",
    },
  );

  const methods = new Proxy<Ref<UnwrapRef<CompInstance>>>(compRef as Ref<UnwrapRef<CompInstance>>, {
    get(target, key: string) {
      if (Reflect.has(target, key)) {
        return unref(target);
      }
      if (target.value && Reflect.has(target.value, key)) {
        return Reflect.get(target.value, key);
      }
      return async (...rest) => {
        const comp = await getCompInstance();
        return comp?.[key]?.(...rest);
      };
    },
  });

  const CompRender: FunctionalComponent = (compProps, { attrs, slots }) => {
    return h(
      comp as Component<{ ref: Ref<UnwrapRef<CompInstance>> } & Partial<Props>>,
      {
        ref: compRef as Ref<UnwrapRef<CompInstance>>,
        ...attrs,
        ...props,
        ...compProps,
      },
      slots,
    );
  };

  return [CompRender, unref(methods)] as const;
}
