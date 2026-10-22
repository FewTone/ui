import type { ItemMeta } from "../../registry/schema.ts";

export default {
  name: "input-otp",
  title: "Input OTP",
  description:
    "An accessible React one-time code input for Next.js and Tailwind: boxes that move on as you type and take a pasted code, built on Radix.",
  kind: "component",
  category: "Forms",
  tags: ["otp", "one-time code", "verification code", "pin", "2fa", "form"],
  keywords: [
    "react otp input",
    "react input otp",
    "shadcn input otp",
    "nextjs otp input",
    "tailwind otp input",
    "verification code input",
    "pin input react",
    "2fa code input",
    "one time password input",
  ],
  status: "stable",
  addedAt: "2026-10-16",
  updatedAt: "2026-10-21",
  files: ["input-otp.tsx"],
  usage: {
    code: `import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp"

export function VerificationCode() {
  return (
    <InputOTP aria-label="Verification code" name="code">
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
  )
}`,
  },
  demos: [
    {
      name: "code",
      title: "Six digits",
      description:
        "Type and the focus box glides on to the next box as each digit rises into place; paste a whole code and it fills in left to right. Once it's in, it's checked: 123456 runs a wave along the boxes, anything else shakes the field. Set status from your own check.",
    },
    {
      name: "pin",
      title: "PIN",
      description: 'type="password" draws a dot for each digit. Turn autocomplete off for a PIN.',
    },
  ],
  // The page opens on six digits with a size setting; the index card shows a shorter code
  preview: { card: "card" },
  api: [
    {
      name: "InputOTP",
      description:
        "Also accepts every Radix One-Time Password Field prop. The number of InputOTPSlots sets the code's length (shadcn's maxLength isn't needed), and the change callback is onValueChange.",
      props: [
        { name: "value", type: "string", description: "The code, when you control it." },
        { name: "defaultValue", type: "string", description: "The code at first." },
        {
          name: "onValueChange",
          type: "(value: string) => void",
          description: "Called with the whole code after every change.",
        },
        {
          name: "size",
          type: '"sm" | "md" | "lg"',
          default: '"md"',
          description: "32, 36 or 40px boxes, matching Input's heights.",
        },
        {
          name: "validationType",
          type: '"numeric" | "alpha" | "alphanumeric" | "none"',
          default: '"numeric"',
          description:
            "Which characters a box accepts; others are ignored. Use sanitizeValue with none for your own rule.",
        },
        {
          name: "type",
          type: '"text" | "password"',
          default: '"text"',
          description: "password hides each character behind a dot.",
        },
        {
          name: "autoSubmit",
          type: "boolean",
          default: "false",
          description: "Submits the form once every box is filled. onAutoSubmit is called first.",
        },
        {
          name: "autoComplete",
          type: '"one-time-code" | "off"',
          default: '"one-time-code"',
          description: "Lets the phone or a password manager fill in a code it received.",
        },
        {
          name: "name",
          type: "string",
          description: "Submits the code with a form, through a hidden input.",
        },
        {
          name: "status",
          type: '"success" | "error"',
          description:
            "The result of checking the code. success runs a wave along the boxes and makes their borders solid; error shakes the field and marks it invalid. Leave it unset while the code is typed or checked.",
        },
        {
          name: "aria-invalid",
          type: "boolean",
          description: "Marks the code as wrong without the shake: the boxes and focus box turn destructive.",
        },
        { name: "disabled", type: "boolean", default: "false", description: "Prevents typing." },
        {
          name: "placeholder",
          type: "string",
          description: "One character per box, shown while the code is empty.",
        },
      ],
    },
    {
      name: "InputOTPGroup",
      description: "Boxes that sit together, such as the first three digits. A div.",
      props: [],
    },
    {
      name: "InputOTPSlot",
      description:
        "One box. className styles the box; other props go to its input, which Radix names “Character 1 of 6”.",
      props: [
        {
          name: "index",
          type: "number",
          required: true,
          description: "The box's place in the code, from 0.",
        },
      ],
    },
    {
      name: "InputOTPSeparator",
      description: "A dash between groups (role separator). Pass children to draw something else.",
      props: [],
    },
  ],
  primitives: ["Radix One-Time Password Field"],
  related: ["input", "number-input", "button"],
  ai: {
    whenToUse:
      "Use InputOTP for one-time codes, verification codes and short PINs, where each character gets its own box. Use Input for passwords and other free text.",
  },
} satisfies ItemMeta;
