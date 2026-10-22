"use client";

import {
  CommandEmpty,
  type CommandFilter,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandProvider,
  useCommandInput,
  useGlidingHeight,
} from "@fewtone/ui/components/command/command";
import { blur, duration, ease, spring } from "@fewtone/ui/lib/motion";
import { cn } from "@fewtone/ui/lib/utils";
import { ChevronDownIcon, XIcon } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Popover as PopoverPrimitive } from "radix-ui";
import {
  type ComponentProps,
  Fragment,
  type KeyboardEvent,
  type ReactNode,
  useMemo,
  useRef,
  useState,
} from "react";

/*
 * Combobox: type to filter and pick, right in the field (roadmap, 2026-10-16). The field is the text input,
 * styled like Select's trigger; the options open in a list below it. The list is Command (filtering and
 * ranking, groups, the gliding highlight and height, the keyboard) inside a Radix Popover (placement, flipping,
 * Escape and clicks outside).
 * - One value, or several (`multiple`), shown as chips in the field.
 * - The keyboard stays in the field (WAI-ARIA's editable combobox with list autocomplete): typing or ArrowDown
 *   opens the list, the arrows move, Enter picks, Escape closes, and Backspace in an empty field removes the
 *   last chip. Home and End stay with the text.
 * - Motion (.agents/rules/motion.md):
 *   - the chosen option's check draws itself in and erases the way it came (Checkbox's stroke)
 *   - chips come and go through the blur while the others glide into place, and the field's height glides
 *     when they wrap onto another line (the height pattern, never a spring)
 *   - the list opens out of the field and closes back into it through the blur (popover-in/out)
 *   Nothing animates on first paint. With reduced motion everything jumps or only fades.
 * - One value: the field shows the chosen label. Typing searches from it; leaving without picking puts the
 *   label back, and clearing the text clears the choice.
 */

export type ComboboxOption = {
  value: string;
  /** What the field and the list show, and what the search matches */
  label: string;
  /** More words the search matches */
  keywords?: string[];
  disabled?: boolean;
  /** Options with the same group are listed together under it as a heading */
  group?: string;
};

type ComboboxBaseProps = Omit<
  ComponentProps<"input">,
  "value" | "defaultValue" | "onChange" | "size" | "type" | "multiple" | "children"
> & {
  options: ComboboxOption[];
  /** Shown when nothing matches */
  emptyText?: ReactNode;
  size?: "sm" | "md";
  /** Custom content for an option in the list (the field still shows its label) */
  renderOption?: (option: ComboboxOption) => ReactNode;
  /** Scores an option's label against the search; 0 hides it */
  filter?: CommandFilter;
  /** Called with the search as it changes */
  onSearchChange?: (search: string) => void;
};

type ComboboxSingleProps = {
  multiple?: false;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
};

type ComboboxMultipleProps = {
  multiple: true;
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
};

export type ComboboxProps = ComboboxBaseProps & (ComboboxSingleProps | ComboboxMultipleProps);

const sizes = {
  // Rows are the input's height; chips sit centred in them, so wrapped lines keep the same rhythm
  sm: { field: "min-h-(--size-control-sm) rounded-md", row: "h-7", chip: "my-0.5" },
  md: { field: "min-h-(--size-control-md)", row: "h-8", chip: "my-1" },
} as const;

const asList = (value?: string | string[]) =>
  value === undefined ? undefined : Array.isArray(value) ? value : value ? [value] : [];

/** The same check as Checkbox: it draws itself in, and erases the way it came */
const CHECK = "M5 12.5l4.5 4.5L19 7.5";

function Check({ shown, reduce }: { shown: boolean; reduce: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className="size-(--size-icon-sm) text-current">
      <motion.path
        d={CHECK}
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={false}
        animate={{ pathLength: shown ? 1 : 0, opacity: shown ? 1 : 0 }}
        transition={
          reduce
            ? { duration: 0 }
            : shown
              ? { pathLength: { duration: duration.base, ease: ease.out }, opacity: { duration: 0 } }
              : { duration: duration.fast, ease: ease.in }
        }
      />
    </svg>
  );
}

/** The text input, wired to the list by Command (it has to sit inside CommandProvider) */
function FieldInput({ open, onKeyDown, className, ...props }: ComponentProps<"input"> & { open: boolean }) {
  const field = useCommandInput({ onKeyDown, homeEnd: false });
  return (
    <input
      data-slot="combobox-input"
      type="text"
      autoComplete="off"
      autoCorrect="off"
      spellCheck={false}
      {...field}
      role="combobox"
      aria-expanded={open}
      className={cn(
        "w-full min-w-0 bg-transparent text-sm outline-hidden placeholder:text-muted-foreground disabled:cursor-not-allowed",
        className,
      )}
      {...props}
    />
  );
}

/**
 * A text field that filters a list of options as you type, for one value or several (`multiple`, shown as
 * chips). Give it a visible label (`<label htmlFor>` with its `id`) or an aria-label.
 */
function Combobox({
  multiple = false,
  value,
  defaultValue,
  onValueChange,
  options,
  placeholder,
  emptyText = "No results found.",
  size = "md",
  renderOption,
  filter,
  onSearchChange,
  className,
  name,
  disabled = false,
  onKeyDown,
  onBlur,
  ref,
  "aria-label": ariaLabel,
  "aria-invalid": ariaInvalid,
  ...props
}: ComboboxProps) {
  const [own, setOwn] = useState<string[]>(() => asList(defaultValue) ?? []);
  const values = asList(value) ?? own;
  const [open, setOpen] = useState(false);
  // The text typed in the field. With one value it only counts while editing; otherwise the label shows.
  const [text, setText] = useState("");
  const [editing, setEditing] = useState(false);
  const [active, setActive] = useState("");
  const field = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement | null>(null);
  const content = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion() ?? false;
  const look = sizes[size];
  useGlidingHeight(field, inner);

  const labels = useMemo(() => new Map(options.map((option) => [option.value, option.label])), [options]);
  const labelOf = (option: string) => labels.get(option) ?? option;
  // Options in groups of the same `group`, in the order each group first appears
  const sections = useMemo(() => {
    const out: { heading?: string; options: ComboboxOption[] }[] = [];
    for (const option of options) {
      const section = out.find((entry) => entry.heading === option.group);
      if (section) section.options.push(option);
      else out.push({ heading: option.group, options: [option] });
    }
    return out;
  }, [options]);

  const shownText = multiple || editing ? text : values[0] ? labelOf(values[0]) : "";
  const search = multiple || editing ? text : "";
  const invalid = ariaInvalid === true || ariaInvalid === "true";

  function commit(next: string[]) {
    setOwn(next);
    (onValueChange as ((value: string | string[]) => void) | undefined)?.(multiple ? next : (next[0] ?? ""));
  }

  function show() {
    if (disabled || open) return;
    // One value opens on the chosen option (Command centres it); several start at the top
    setActive(multiple ? "" : (values[0] ?? ""));
    setOpen(true);
  }

  function close() {
    // Clearing the text and leaving clears a single choice; otherwise its label comes back
    if (!multiple && editing && !text.trim() && values.length) commit([]);
    setEditing(false);
    setText("");
    setOpen(false);
  }

  function pick(option: string) {
    if (multiple) {
      // The list stays open, so the check can be seen drawing in or erasing
      commit(values.includes(option) ? values.filter((entry) => entry !== option) : [...values, option]);
      return;
    }
    commit([option]);
    setEditing(false);
    setText("");
    setOpen(false);
  }

  function onFieldKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;
    if ((event.key === "ArrowDown" || event.key === "ArrowUp") && !open) {
      event.preventDefault();
      show();
    } else if (event.key === "Backspace" && multiple && !text && values.length) {
      commit(values.slice(0, -1));
    }
    // Escape closes through the popover; Enter, the arrows and the rest go on to Command
  }

  const item = (option: ComboboxOption) => {
    const selected = values.includes(option.value);
    return (
      <CommandItem
        key={option.value}
        value={option.value}
        textValue={option.label}
        keywords={option.keywords}
        disabled={option.disabled}
        onSelect={pick}
        data-checked={selected}
        // Several: aria-selected says which are chosen. One: it follows the highlight, and the field shows the choice.
        {...(multiple ? { "aria-selected": selected } : {})}
        className="ps-2 pe-8"
      >
        {renderOption ? renderOption(option) : option.label}
        <span className="absolute end-2 flex size-(--size-icon-md) items-center justify-center">
          <Check shown={selected} reduce={reduce} />
        </span>
      </CommandItem>
    );
  };

  const hidden = reduce ? blur.shown : blur.hidden;

  return (
    <CommandProvider search={search} value={active} onValueChange={setActive} filter={filter}>
      <PopoverPrimitive.Root open={open} onOpenChange={(next) => (next ? show() : close())}>
        <PopoverPrimitive.Anchor asChild>
          {/* The input has the keyboard; a press anywhere else in the field focuses it and opens the list,
              and the chevron closes an open list */}
          {/* biome-ignore lint/a11y/noStaticElementInteractions: pointer convenience only; the input inside handles the keyboard */}
          <div
            ref={field}
            data-slot="combobox"
            data-state={open ? "open" : "closed"}
            data-size={size}
            data-invalid={invalid || undefined}
            data-disabled={disabled || undefined}
            onMouseDown={(event) => {
              const target = event.target as HTMLElement;
              const node = input.current;
              if (disabled || !node || target.closest("[data-slot=combobox-chip-remove]")) return;
              // With one value, the first press selects its label, so typing replaces it
              const selectLabel =
                !multiple && !editing && values.length > 0 && document.activeElement !== node;
              if (target !== node || selectLabel) {
                event.preventDefault();
                node.focus();
                if (selectLabel) node.select();
              }
              if (open && target.closest("[data-slot=combobox-chevron]")) close();
              else show();
            }}
            className={cn(
              "group relative w-full min-w-0 cursor-text rounded-lg border border-input bg-transparent text-sm shadow-xs",
              "transition duration-(--duration-fast) ease-out",
              "outline-ring has-focus-visible:border-ring has-focus-visible:outline-(length:--focus-ring-width) has-focus-visible:outline-offset-(--focus-ring-offset)",
              "data-invalid:border-destructive data-invalid:outline-destructive",
              "data-disabled:cursor-not-allowed data-disabled:opacity-(--opacity-disabled)",
              look.field,
              className,
            )}
          >
            <div ref={inner} className="relative flex flex-wrap items-center gap-x-1 py-px ps-1 pe-8">
              {multiple ? (
                // A chip that leaves pops out of the flow and fades through the blur where it was, while
                // the rest glide into place
                <AnimatePresence mode="popLayout" initial={false}>
                  {values.map((entry) => (
                    <motion.span
                      key={entry}
                      layout={reduce ? false : "position"}
                      data-slot="combobox-chip"
                      initial={{ opacity: 0, filter: hidden, scale: reduce ? 1 : 0.96 }}
                      animate={{
                        opacity: 1,
                        filter: blur.shown,
                        scale: 1,
                        transitionEnd: { filter: "none" },
                      }}
                      exit={{
                        opacity: 0,
                        filter: hidden,
                        scale: reduce ? 1 : 0.96,
                        transition: { duration: duration.fast, ease: ease.in },
                      }}
                      transition={{ duration: duration.base, ease: ease.out, layout: spring.snappy }}
                      className={cn(
                        "inline-flex h-6 max-w-full min-w-0 items-center gap-1 rounded-md bg-secondary ps-2 pe-1 text-xs font-medium text-secondary-foreground",
                        look.chip,
                      )}
                    >
                      <span className="truncate">{labelOf(entry)}</span>
                      {/* Out of the tab order: Backspace removes the last chip, and the list unpicks any */}
                      <button
                        type="button"
                        tabIndex={-1}
                        data-slot="combobox-chip-remove"
                        aria-label={`Remove ${labelOf(entry)}`}
                        disabled={disabled}
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => commit(values.filter((other) => other !== entry))}
                        className="inline-flex size-4 shrink-0 cursor-pointer items-center justify-center rounded-sm text-muted-foreground transition-colors duration-(--duration-fast) ease-out hover:text-foreground"
                      >
                        <XIcon aria-hidden className="size-3" />
                      </button>
                    </motion.span>
                  ))}
                </AnimatePresence>
              ) : null}
              <motion.span
                layout={multiple && !reduce ? "position" : false}
                transition={spring.snappy}
                className="flex min-w-16 flex-1"
              >
                <FieldInput
                  {...props}
                  ref={(node) => {
                    input.current = node;
                    if (typeof ref === "function") ref(node);
                    else if (ref) ref.current = node;
                  }}
                  open={open}
                  disabled={disabled}
                  aria-label={ariaLabel}
                  aria-invalid={ariaInvalid}
                  placeholder={multiple && values.length ? undefined : placeholder}
                  value={shownText}
                  onChange={(event) => {
                    setText(event.target.value);
                    if (!multiple) setEditing(true);
                    onSearchChange?.(event.target.value);
                    show();
                  }}
                  onKeyDown={onFieldKeyDown}
                  onBlur={(event) => {
                    onBlur?.(event);
                    const next = event.relatedTarget;
                    if (
                      next instanceof Node &&
                      (field.current?.contains(next) || content.current?.contains(next))
                    )
                      return;
                    close();
                  }}
                  className={cn(look.row, multiple && values.length ? "ps-1" : "ps-2")}
                />
              </motion.span>
            </div>
            <span
              data-slot="combobox-chevron"
              aria-hidden
              className={cn(
                "absolute end-3 top-px flex cursor-pointer items-center text-muted-foreground",
                look.row,
              )}
            >
              <ChevronDownIcon className="size-(--size-icon-md) shrink-0 transition-transform duration-(--duration-base) ease-out group-data-[state=open]:rotate-180" />
            </span>
          </div>
        </PopoverPrimitive.Anchor>
        <PopoverPrimitive.Portal>
          {/* Not a dialog: it only holds the listbox, and focus stays in the field */}
          {/* biome-ignore lint/a11y/useValidAriaRole: removes Radix's role="dialog" rather than setting one */}
          <PopoverPrimitive.Content
            ref={content}
            data-slot="combobox-content"
            role={undefined}
            align="start"
            sideOffset={4}
            onOpenAutoFocus={(event) => event.preventDefault()}
            onCloseAutoFocus={(event) => event.preventDefault()}
            onInteractOutside={(event) => {
              if (event.target instanceof Node && field.current?.contains(event.target))
                event.preventDefault();
            }}
            className={cn(
              "z-(--z-popover) flex max-h-(--radix-popover-content-available-height) w-(--radix-popover-trigger-width) flex-col overflow-hidden rounded-lg border border-border bg-popover text-popover-foreground shadow-md outline-hidden",
              "origin-(--radix-popover-content-transform-origin) data-[state=open]:animate-popover-in data-[state=closed]:animate-popover-out",
            )}
          >
            <CommandList label={ariaLabel ?? "Options"} aria-multiselectable={multiple || undefined}>
              <CommandEmpty>{emptyText}</CommandEmpty>
              {sections.map((section) =>
                section.heading ? (
                  <CommandGroup key={section.heading} heading={section.heading}>
                    {section.options.map(item)}
                  </CommandGroup>
                ) : (
                  <Fragment key="">{section.options.map(item)}</Fragment>
                ),
              )}
            </CommandList>
          </PopoverPrimitive.Content>
        </PopoverPrimitive.Portal>
      </PopoverPrimitive.Root>
      {name
        ? (multiple ? values : [values[0] ?? ""]).map((entry) => (
            <input key={entry} type="hidden" name={name} value={entry} disabled={disabled} />
          ))
        : null}
    </CommandProvider>
  );
}

export { Combobox };
