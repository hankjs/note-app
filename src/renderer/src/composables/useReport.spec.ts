import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { useReport } from './useReport'
import { useSetup } from '../../../../test/utils/component'

describe('useReport', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    // ensure clean DOM
    const existed = document.getElementById('report-container')
    if (existed && existed.parentNode) {
      existed.parentNode.removeChild(existed)
    }
  })

  afterEach(() => {
    vi.useRealTimers()
    const existed = document.getElementById('report-container')
    if (existed && existed.parentNode) {
      existed.parentNode.removeChild(existed)
    }
  })

  it('creates container, sets content, and schedules cleanup', () => {
    const { report } = useSetup(() => {
      const { report } = useReport()
      return { report }
    })
    report('Hello World')

    const el = document.getElementById('report-container')
    expect(el).not.toBeNull()
    expect(el!.innerHTML).toBe('Hello World')

    // advance time to trigger cleanup
    vi.advanceTimersByTime(1000)
    expect(document.getElementById('report-container')).toBeNull()
  })

  it('reuses container and resets timer on consecutive calls', () => {
    const { report } = useSetup(() => {
      const { report } = useReport()
      return { report }
    })
    report('First')

    const el1 = document.getElementById('report-container')
    expect(el1).not.toBeNull()
    expect(el1!.innerHTML).toBe('First')

    // call again before previous timeout fires
    report('Second')
    const el2 = document.getElementById('report-container')
    expect(el2).not.toBeNull()
    expect(el2!.innerHTML).toBe('Second')

    // previous timer cleared; cleanup should still happen after latest 1000ms
    vi.advanceTimersByTime(999)
    // Not yet cleaned
    expect(document.getElementById('report-container')).not.toBeNull()

    vi.advanceTimersByTime(1)
    expect(document.getElementById('report-container')).toBeNull()
  })
})


