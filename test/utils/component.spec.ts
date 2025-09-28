import { describe, expect, it, vi } from "vitest";
import { type InjectionKey, type Ref, inject, onMounted, onUnmounted, provide, ref } from "vue";
import { useSetup } from "./component";

const HANK = "Hank";

describe("useSetup", () => {
  describe("Reactive", () => {
    it("should reactive", () => {
      const setup = () => {
        const name = ref(HANK);
        return {
          name,
        };
      };
      const { name } = useSetup(setup);
      expect(name.value).toBe(HANK);
    });
  });

  describe("Lifecycle", () => {
    it("should onMounted/onUnmonuted", () => {
      const mounted = vi.fn();
      const unmounted = vi.fn();

      const { $wrapper } = useSetup(() => {
        onMounted(mounted);
        onUnmounted(unmounted);
      });

      expect(mounted).toHaveBeenCalled();
      expect(unmounted).not.toHaveBeenCalled();

      $wrapper.unmount();
      expect(unmounted).toHaveBeenCalled();
    });

    describe("Provide/Inject", () => {
      it("使用@vue/test-utils的功能，通过InjectionKey获取Provide", () => {
        const nameKey: InjectionKey<Ref<string>> = Symbol("name");

        const { name } = useSetup(
          () => ({
            name: inject(nameKey)!,
          }),
          {
            options: {
              global: {
                provide: {
                  [nameKey as any]: ref(HANK),
                },
              },
            },
          },
        ); // end useSetup

        expect(name.value).toBe(HANK);
      });

      it("通过Wrapper获取Provide", () => {
        const nameKey: InjectionKey<Ref<string>> = Symbol("name");
        function useNameContextProvide() {
          provide(nameKey, ref(HANK));
        }

        const { name } = useSetup(
          () => ({
            name: inject(nameKey)!,
          }),
          {
            wrapper: () => {
              useNameContextProvide();
            },
          },
        ); // end useSetup

        expect(name.value).toBe(HANK);
      });
    });
  });
});