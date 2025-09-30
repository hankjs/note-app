import { useVModel } from "@vueuse/core"
import { computed, ref, watch } from "vue"

export function useInner<P extends object, K extends keyof P>(props: P, key: K, emit: any) {
  const refInner = ref<P[K]>(props[key])
  const modelValue = useVModel(props, key, emit)

  watch(modelValue, (value) => {
    if (value === refInner.value) {
      return
    }
    refInner.value = value
  })

  const value = computed({
    get: () => refInner.value,
    set: (value) => {
      refInner.value = value
      modelValue.value = value
    }
  })

  return value
}