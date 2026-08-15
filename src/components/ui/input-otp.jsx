import React from "react";
import { OTPInput, OTPInputContext } from "input-otp"
import { Minus } from "lucide-react"

import { cn } from "@/lib/utils"

/**
 * @param {React.ComponentPropsWithoutRef<typeof OTPInput>} props
 * @param {React.ForwardedRef<HTMLInputElement>} ref
 */
const InputOTPRender = ({ className, containerClassName, ...props }, ref) => (
  <OTPInput
    ref={ref}
    containerClassName={cn("flex items-center gap-2 has-[:disabled]:opacity-50", containerClassName)}
    className={cn("disabled:cursor-not-allowed", className)}
    {...props}
  />
)
/** @type {React.ForwardRefExoticComponent<import("input-otp").OTPInputProps & React.RefAttributes<HTMLInputElement>>} */
const InputOTP = React.forwardRef(InputOTPRender)
InputOTP.displayName = "InputOTP"

/**
 * @param {React.HTMLAttributes<HTMLDivElement>} props
 * @param {React.ForwardedRef<HTMLDivElement>} ref
 */
const InputOTPGroupRender = ({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex items-center", className)} {...props} />
)
const InputOTPGroup = React.forwardRef(InputOTPGroupRender)
InputOTPGroup.displayName = "InputOTPGroup"

/**
 * @param {React.HTMLAttributes<HTMLDivElement> & { index: number }} props
 * @param {React.ForwardedRef<HTMLDivElement>} ref
 */
const InputOTPSlotRender = ({ index, className, ...props }, ref) => {
  const inputOTPContext = React.useContext(OTPInputContext)
  const { char, hasFakeCaret, isActive } = inputOTPContext.slots[index]

  return (
    <div
      ref={ref}
      className={cn(
        "relative flex h-9 w-9 items-center justify-center border-y border-r border-input text-sm shadow-sm transition-all first:rounded-l-md first:border-l last:rounded-r-md",
        isActive && "z-10 ring-1 ring-ring",
        className
      )}
      {...props}
    >
      {char}
      {hasFakeCaret && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-4 w-px animate-caret-blink bg-foreground duration-1000" />
        </div>
      )}
    </div>
  )
}
const InputOTPSlot = React.forwardRef(InputOTPSlotRender)
InputOTPSlot.displayName = "InputOTPSlot"

/**
 * @param {React.HTMLAttributes<HTMLDivElement>} props
 * @param {React.ForwardedRef<HTMLDivElement>} ref
 */
const InputOTPSeparatorRender = (props, ref) => (
  <div ref={ref} role="separator" {...props}>
    <Minus />
  </div>
)
const InputOTPSeparator = React.forwardRef(InputOTPSeparatorRender)
InputOTPSeparator.displayName = "InputOTPSeparator"

export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator }
