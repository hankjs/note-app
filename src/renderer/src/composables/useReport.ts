/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { onUnmounted, ref } from 'vue'

const getElement = (): HTMLElement => {
  let element = document.getElementById('report-container')

  if (element === null) {
    element = document.createElement('div')
    element.id = 'report-container'
    element.style.position = 'fixed'
    element.style.top = '50%'
    element.style.left = '50%'
    element.style.fontSize = '32px'
    element.style.transform = 'translate(-50%, -50px)'
    element.style.padding = '20px'
    element.style.background = 'rgba(240, 240, 240, 0.4)'
    element.style.borderRadius = '20px'

    if (document.body) {
      document.body.appendChild(element)
    }
  }

  return element
}

export function useReport(): (content: string) => ReturnType<typeof setTimeout> {
  const timer = ref<ReturnType<typeof setTimeout> | null>(null)

  const cleanup = () => {
    if (timer.value !== null) {
      clearTimeout(timer.value)
      timer.value = null
    }

    if (document.body) {
      const el = document.getElementById('report-container')
      if (el) {
        document.body.removeChild(el)
      }
    }
  }

  onUnmounted(() => {
    cleanup()
  })

  return (content: string) => {
    // eslint-disable-next-line no-console
    console.log(content)
    const element = getElement()
    if (timer.value !== null) {
      clearTimeout(timer.value)
    }
    element.innerHTML = content
    timer.value = setTimeout(cleanup, 1000)
    return timer.value
  }
}
