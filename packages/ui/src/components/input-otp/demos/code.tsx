"use client";

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
  type InputOTPStatus,
} from "@fewtone/ui/components/input-otp/input-otp";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@fewtone/ui/components/select/select";
import { Spinner } from "@fewtone/ui/components/spinner/spinner";
import { duration, ease, swap } from "@fewtone/ui/lib/motion";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useId, useState } from "react";

type Size = "sm" | "md" | "lg";

/** How long the pretend server takes to check a code, in ms */
const CHECK = 600;
const RIGHT = "123456";

/*
 * A six-digit code in two groups of three, with the size in the top-right corner. Once all six digits are
 * in, the code is checked for a moment, then the boxes run their success wave (123456) or the field shakes
 * its head (anything else), so the whole range shows here. The message under it swaps through the blur in
 * a polite live region; change a digit and it waits again. An empty row at the bottom, as tall as the
 * setting's row, keeps the code centred.
 */
export default function InputOTPCode() {
  const id = useId();
  const reduce = useReducedMotion();
  const [size, setSize] = useState<Size>("md");
  const [code, setCode] = useState("");
  const [result, setResult] = useState<InputOTPStatus | "checking" | null>(null);

  useEffect(() => {
    if (code.length < RIGHT.length) {
      setResult(null);
      return;
    }
    setResult("checking");
    const timer = setTimeout(() => setResult(code === RIGHT ? "success" : "error"), CHECK);
    return () => clearTimeout(timer);
  }, [code]);

  const message =
    result === "checking" ? (
      <span className="flex items-center gap-2 text-muted-foreground">
        <Spinner size="sm" aria-hidden />
        Checking the code…
      </span>
    ) : result === "success" ? (
      <span className="flex items-center gap-2 text-foreground">
        <svg viewBox="0 0 24 24" fill="none" aria-hidden className="size-(--size-icon-sm)">
          <motion.path
            d="M5 12.5l4.5 4.5L19 7.5"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: reduce ? 1 : 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: duration.slow, ease: ease.out, delay: reduce ? 0 : duration.instant }}
          />
        </svg>
        Code verified
      </span>
    ) : result === "error" ? (
      <span className="text-destructive">That code isn’t right. Try {RIGHT}.</span>
    ) : (
      <span className="text-muted-foreground">
        Type or paste the 6 digits. {RIGHT} works; anything else fails.
      </span>
    );

  return (
    <div className="flex w-full flex-col gap-6 self-stretch">
      <div className="-mt-6 -mr-6 flex items-center justify-end gap-2">
        <label htmlFor={`${id}-size`} className="text-sm text-muted-foreground">
          Size
        </label>
        <Select value={size} onValueChange={(value) => setSize(value as Size)}>
          <SelectTrigger id={`${id}-size`} size="sm" className="w-28">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="sm">Small</SelectItem>
            <SelectItem value="md">Medium</SelectItem>
            <SelectItem value="lg">Large</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center gap-3">
        <span id={`${id}-label`} className="text-sm font-medium">
          Verification code
        </span>
        <InputOTP
          size={size}
          value={code}
          onValueChange={setCode}
          status={result === "success" || result === "error" ? result : undefined}
          aria-labelledby={`${id}-label`}
          aria-describedby={`${id}-message`}
        >
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
          </InputOTPGroup>
          <InputOTPSeparator />
          <InputOTPGroup>
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>
        <div id={`${id}-message`} aria-live="polite" className="grid text-sm">
          <AnimatePresence initial={false} mode="popLayout">
            <motion.p
              key={result ?? "waiting"}
              initial={reduce ? { opacity: 0 } : swap.initial}
              animate={reduce ? { opacity: 1 } : swap.animate}
              exit={reduce ? { opacity: 0 } : swap.exit}
              transition={reduce ? { duration: 0 } : { duration: duration.base, ease: ease.out }}
              className="col-start-1 row-start-1 justify-self-center"
            >
              {message}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>

      <div aria-hidden className="-mb-6 h-(--size-control-sm)" />
    </div>
  );
}
