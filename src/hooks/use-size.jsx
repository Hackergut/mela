import * as React from "react"

// A single ResizeObserver can efficiently serve every responsive image. The
// previous implementation allocated one native observer per image, which made
// product grids noticeably more expensive to mount and resize.
const callbacks = new WeakMap()
let sharedObserver = null

function getObserver() {
  if (sharedObserver || typeof ResizeObserver === "undefined") return sharedObserver
  sharedObserver = new ResizeObserver((entries) => {
    for (const entry of entries) callbacks.get(entry.target)?.(entry.contentRect)
  })
  return sharedObserver
}

export function useSize(ref) {
  const [size, setSize] = React.useState(null)

  React.useLayoutEffect(() => {
    const element = ref.current
    if (!element) return undefined

    const update = ({ width, height }) => {
      setSize((previous) => (
        previous && previous.width === width && previous.height === height
          ? previous
          : { width, height }
      ))
    }

    update(element.getBoundingClientRect())
    const observer = getObserver()
    if (!observer) return undefined

    callbacks.set(element, update)
    observer.observe(element)
    return () => {
      observer.unobserve(element)
      callbacks.delete(element)
    }
  }, [ref])

  return size
}
