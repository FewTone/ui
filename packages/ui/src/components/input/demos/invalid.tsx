"use client";

import { Input } from "@fewtone/ui/components/input/input";
import { blur, duration, ease } from "@fewtone/ui/lib/motion";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useId, useState } from "react";

/*
 * The error follows the value: it shows while the username is too short and goes away as soon as it's long
 * enough. The border colour fades with it, and the message glides open and shut, sharpening in from the
 * library's blur. A polite live region
 * announces the change, and aria-describedby links the message while it's there.
 */
export default function InputInvalid() {
  const id = useId();
  const [username, setUsername] = useState("f");
  const reduce = useReducedMotion();
  const invalid = username.trim().length < 3;

  return (
    <div className="grid w-full max-w-xs">
      <div className="grid gap-2">
        <label htmlFor={id} className="text-sm font-medium">
          Username
        </label>
        <Input
          id={id}
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          aria-invalid={invalid || undefined}
          aria-describedby={invalid ? `${id}-error` : undefined}
          autoComplete="off"
        />
      </div>
      <div aria-live="polite">
        <AnimatePresence initial={false}>
          {invalid ? (
            <motion.div
              key="error"
              initial={{ opacity: 0, filter: blur.hidden, height: 0 }}
              animate={{ opacity: 1, filter: blur.shown, height: "auto" }}
              exit={{ opacity: 0, filter: blur.hidden, height: 0 }}
              transition={reduce ? { duration: 0 } : { duration: duration.base, ease: ease.out }}
              className="overflow-hidden"
            >
              <p id={`${id}-error`} className="pt-2 text-sm text-destructive">
                Use at least 3 characters.
              </p>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}
