import * as React from "react"
import { DirectionProvider as RadixDirectionProvider, useDirection } from "@radix-ui/react-direction"

function DirectionProvider({ dir, direction, children }) {
  return (
    <RadixDirectionProvider dir={direction ?? dir}>
      {children}
    </RadixDirectionProvider>
  )
}

export { DirectionProvider, useDirection }
