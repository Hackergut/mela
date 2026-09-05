import * as React from "react"
import { ArrowDownIcon } from "lucide-react"

import { cn } from "@/lib/utils"

import { Button } from "@/components/ui/button"

/**
 * Self-contained MessageScroller (React 18 compatible port of the official
 * shadcn/ui message-scroller, which depends on @shadcn/react / React 19).
 *
 * API:
 *   <MessageScrollerProvider>            // optional context wrapper
 *     <MessageScroller>                  // root container (relative, full)
 *       <MessageScrollerViewport>        // the scrollable area
 *         <BubbleGroup>...</BubbleGroup>
 *       </MessageScrollerViewport>
 *       <MessageScrollerScrollButton />  // floating jump-to-bottom button
 *     </MessageScroller>
 *   </MessageScrollerProvider>
 */

const MessageScrollerContext = React.createContext(null)

function useMessageScrollerContext() {
  const context = React.useContext(MessageScrollerContext)
  if (!context) {
    throw new Error(
      "Message scroller components must be wrapped in <MessageScrollerProvider />."
    )
  }
  return context
}

/** Returns whether the viewport is scrolled to (near) the bottom. */
function useMessageScrollerVisibility() {
  const { isAtBottom } = useMessageScrollerContext()
  return { isAtBottom }
}

function MessageScrollerProvider(props) {
  const viewportRef = React.useRef(null)
  const [isAtBottom, setIsAtBottom] = React.useState(true)

  const scrollToBottom = React.useCallback((behavior = "smooth") => {
    const viewport = viewportRef.current
    if (!viewport) return
    viewport.scrollTo({ top: viewport.scrollHeight, behavior })
  }, [])

  // Track scroll position and stickiness.
  React.useEffect(() => {
    const viewport = viewportRef.current
    if (!viewport) return

    let frame = 0
    const handleScroll = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const distance = viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight
        setIsAtBottom(distance < 24)
      })
    }

    handleScroll()
    viewport.addEventListener("scroll", handleScroll, { passive: true })
    window.addEventListener("resize", handleScroll)
    return () => {
      cancelAnimationFrame(frame)
      viewport.removeEventListener("scroll", handleScroll)
      window.removeEventListener("resize", handleScroll)
    }
  }, [])

  // Keep pinned to the bottom when new content arrives while stuck.
  React.useEffect(() => {
    const viewport = viewportRef.current
    if (!viewport || !isAtBottom) return

    const observer = new MutationObserver(() => {
      viewport.scrollTop = viewport.scrollHeight
    })
    observer.observe(viewport, { childList: true, subtree: true, characterData: true })
    return () => observer.disconnect()
  }, [isAtBottom])

  const value = React.useMemo(
    () => ({ viewportRef, isAtBottom, scrollToBottom }),
    [isAtBottom, scrollToBottom]
  )

  return (
    <MessageScrollerContext.Provider value={value} {...props} />
  )
}

function MessageScroller({ className, ...props }) {
  return (
    <div
      data-slot="message-scroller"
      className={cn(
        "group/message-scroller relative flex size-full min-h-0 flex-col overflow-hidden",
        className
      )}
      {...props}
    />
  )
}

function MessageScrollerViewport({ className, ...props }) {
  const { viewportRef, isAtBottom, scrollToBottom } = useMessageScrollerContext()

  // On mount, jump instantly to the latest message.
  React.useEffect(() => {
    scrollToBottom("auto")
  }, [scrollToBottom])

  return (
    <div
      ref={viewportRef}
      data-slot="message-scroller-viewport"
      data-at-bottom={isAtBottom ? "true" : "false"}
      className={cn(
        "min-h-0 w-full flex-1 overflow-y-auto overscroll-contain scroll-smooth",
        className
      )}
      {...props}
    />
  )
}

function MessageScrollerScrollButton({
  className,
  children,
  ...props
}) {
  const { isAtBottom, scrollToBottom } = useMessageScrollerContext()

  return (
    <div
      data-slot="message-scroller-scroll-button"
      data-visible={(!isAtBottom).toString()}
      className={cn(
        "pointer-events-none absolute inset-x-0 bottom-0 flex h-16 justify-center bg-gradient-to-b from-transparent to-background/80 items-end pb-3 transition-all duration-150 data-[visible=false]:translate-y-4 data-[visible=false]:opacity-0 data-[visible=true]:translate-y-0 data-[visible=true]:opacity-100",
        className
      )}
      {...props}
    >
      <Button
        type="button"
        variant="outline"
        size="icon"
        aria-label="Scroll to bottom"
        className="pointer-events-auto rounded-full shadow-lg"
        onClick={() => scrollToBottom("smooth")}
      >
        {children ?? <ArrowDownIcon className="size-4" />}
      </Button>
    </div>
  )
}

export {
  MessageScrollerProvider,
  MessageScroller,
  MessageScrollerViewport,
  MessageScrollerScrollButton,
  useMessageScrollerVisibility,
}
