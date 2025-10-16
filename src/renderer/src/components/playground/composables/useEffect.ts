import { MultiWatchSources, onMounted, onUnmounted, watch, watchEffect } from "vue"

type effect = () => void | (() => void)

/**
 * vue3 实现 react useEffect
 * @param effect 
 */
export function useEffect(effect: effect, deps: MultiWatchSources) {
  // 存储清理函数
  let cleanupFn: void | (() => void)

  // 执行副作用函数
  const executeEffect = () => {
    // 如果有清理函数，先执行
    if (cleanupFn) {
      cleanupFn()
    }
    // 执行副作用并获取清理函数
    cleanupFn = effect()
  }

  if (deps === undefined) {
    // 没有依赖数组，每次更新都执行
    watchEffect(executeEffect)
  } else if (deps.length === 0) {
    // 空依赖数组，只在挂载时执行一次
    onMounted(executeEffect)
    // 组件卸载时执行清理
    onUnmounted(() => {
      if (cleanupFn) cleanupFn()
    })
  } else {
    // 有依赖数组，当依赖变化时执行
    watch(deps, executeEffect, { immediate: true })
    onUnmounted(() => {
      if (cleanupFn) cleanupFn()
    })
  }
}