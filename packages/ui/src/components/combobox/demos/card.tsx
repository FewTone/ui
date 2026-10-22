import { Combobox, type ComboboxOption } from "@fewtone/ui/components/combobox/combobox";

const frameworks: ComboboxOption[] = [
  { value: "next", label: "Next.js" },
  { value: "astro", label: "Astro" },
  { value: "nuxt", label: "Nuxt" },
];

/** The index card's preview: one field. The page itself opens on one value and several, with a size setting. */
export default function ComboboxCard() {
  return (
    <Combobox
      aria-label="Framework"
      options={frameworks}
      defaultValue="next"
      placeholder="Pick a framework"
      className="max-w-56"
    />
  );
}
