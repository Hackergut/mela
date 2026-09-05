import * as React from "react"
import { CheckIcon, ChevronDownIcon, SearchIcon, XIcon } from "lucide-react"

import { cn } from "@/lib/utils"

import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

/**
 * Combobox — accessible select-with-search built on the official shadcn
 * Command + Popover pattern (compatible with the existing Radix stack).
 *
 * Props:
 *  - options: Array<{ value, label, disabled? }> (plain strings also accepted)
 *  - value / onValueChange: string (single) or string[] (multiple)
 *  - multiple: enable multi-select
 *  - placeholder, searchPlaceholder, empty: copy strings
 *  - renderValue?: (option) => ReactNode — custom trigger label
 *  - triggerClassName, contentClassName, align, disabled
 */

function normalizeOption(option) {
  if (typeof option === "string") {
    return { value: option, label: option, disabled: false }
  }
  return {
    value: option?.value,
    label: option?.label ?? option?.value,
    disabled: option?.disabled ?? false,
  }
}

function isSelected(value, optionValue, multiple) {
  if (multiple) {
    return Array.isArray(value) && value.includes(optionValue)
  }
  return value === optionValue
}

function ComboboxTriggerLabel({ selected, placeholder, renderValue }) {
  if (selected.length === 0) {
    return <span className="text-muted-foreground">{placeholder}</span>
  }
  if (renderValue) {
    return renderValue(selected.length === 1 ? selected[0] : selected)
  }
  return (
    <span className="truncate">
      {selected.map((option) => option.label).join(", ")}
    </span>
  )
}

function Combobox({
  options = [],
  value,
  onValueChange,
  multiple = false,
  placeholder = "Select an option",
  searchPlaceholder = "Search...",
  empty = "No results found.",
  renderValue,
  className,
  triggerClassName,
  contentClassName,
  align = "start",
  disabled = false,
  ...props
}) {
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState("")

  const normalized = React.useMemo(
    () => options.map(normalizeOption).filter((option) => option.value != null),
    [options]
  )

  const selected = React.useMemo(() => {
    if (multiple) {
      const values = Array.isArray(value) ? value : value != null ? [value] : []
      return values
        .map((v) => normalized.find((option) => option.value === v))
        .filter(Boolean)
    }
    const found = normalized.find((option) => option.value === value)
    return found ? [found] : []
  }, [value, multiple, normalized])

  const handleSelect = (optionValue) => {
    if (multiple) {
      const values = Array.isArray(value) ? [...value] : value != null ? [value] : []
      const index = values.indexOf(optionValue)
      if (index === -1) {
        values.push(optionValue)
      } else {
        values.splice(index, 1)
      }
      onValueChange?.(values)
      return
    }
    onValueChange?.(optionValue === value ? "" : optionValue)
    setOpen(false)
  }

  const hasSelection = selected.length > 0

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <div className={cn("flex w-full min-w-0 items-center gap-2", className)} {...props}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className={cn(
              "w-full justify-between gap-2 font-normal",
              !hasSelection && "text-muted-foreground",
              triggerClassName
            )}
          >
            <span className="flex min-w-0 flex-1 items-center gap-2">
              <SearchIcon className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              <ComboboxTriggerLabel
                selected={selected}
                placeholder={placeholder}
                renderValue={renderValue}
              />
            </span>
            <span className="flex shrink-0 items-center gap-1">
              {hasSelection ? (
                <span
                  role="button"
                  tabIndex={-1}
                  aria-label="Clear selection"
                  className="flex size-4 items-center justify-center rounded-sm opacity-50 transition-opacity hover:opacity-100"
                  onClick={(event) => {
                    event.preventDefault()
                    event.stopPropagation()
                    onValueChange?.(multiple ? [] : "")
                  }}
                >
                  <XIcon className="size-4" aria-hidden="true" />
                </span>
              ) : null}
              <ChevronDownIcon
                className={cn(
                  "size-4 shrink-0 text-muted-foreground transition-transform duration-200",
                  open && "rotate-180"
                )}
                aria-hidden="true"
              />
            </span>
          </Button>
        </PopoverTrigger>
      </div>
      <PopoverContent align={align} className={cn("w-[var(--radix-popover-trigger-width)] p-0", contentClassName)}>
        <Command shouldFilter={!search}>
          <CommandInput
            value={search}
            onValueChange={setSearch}
            placeholder={searchPlaceholder}
          />
          <CommandList>
            <CommandEmpty>{empty}</CommandEmpty>
            <CommandGroup>
              {normalized
                .filter((option) =>
                  option.label.toLowerCase().includes(search.toLowerCase())
                )
                .map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.label}
                    disabled={option.disabled}
                    onSelect={() => handleSelect(option.value)}
                  >
                    <CheckIcon
                      className={cn(
                        "size-4",
                        isSelected(value, option.value, multiple)
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                      aria-hidden="true"
                    />
                    {option.label}
                  </CommandItem>
                ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

export { Combobox }
