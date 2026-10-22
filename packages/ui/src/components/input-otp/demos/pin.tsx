import { InputOTP, InputOTPGroup, InputOTPSlot } from "@fewtone/ui/components/input-otp/input-otp";
import { useId } from "react";

/** A four-digit PIN: type="password" draws a dot for each digit, and autocomplete is off */
export default function InputOTPPin() {
  const id = useId();
  return (
    <div className="grid justify-items-center gap-3">
      <span id={id} className="text-sm font-medium">
        PIN
      </span>
      <InputOTP type="password" autoComplete="off" aria-labelledby={id}>
        <InputOTPGroup>
          <InputOTPSlot index={0} />
          <InputOTPSlot index={1} />
          <InputOTPSlot index={2} />
          <InputOTPSlot index={3} />
        </InputOTPGroup>
      </InputOTP>
    </div>
  );
}
