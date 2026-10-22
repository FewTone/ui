import { InputOTP, InputOTPGroup, InputOTPSlot } from "@fewtone/ui/components/input-otp/input-otp";

/** The index card's preview: a short code that fits the tile. The page itself opens on six digits. */
export default function InputOTPCard() {
  return (
    <InputOTP aria-label="Verification code" defaultValue="42">
      <InputOTPGroup>
        <InputOTPSlot index={0} />
        <InputOTPSlot index={1} />
        <InputOTPSlot index={2} />
        <InputOTPSlot index={3} />
      </InputOTPGroup>
    </InputOTP>
  );
}
