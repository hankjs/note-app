import { useFunctionalWrap } from "@/composables/useFunctionalWrap";
import Comp from "./index.vue";

export function useModal(props?: any) {
  type Instance = InstanceType<typeof Comp>;
  return useFunctionalWrap<Instance>(Comp, props);
}
