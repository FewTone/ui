import axe from "axe-core";

/**
 * Accessibility violations inside a rendered node, as readable strings ("rule: help").
 * Colour contrast is off: jsdom has no layout or computed colours, so it can't be measured here.
 */
export async function axeViolations(node: Element): Promise<string[]> {
  const result = await axe.run(node, { rules: { "color-contrast": { enabled: false } } });
  return result.violations.map((violation) => `${violation.id}: ${violation.help}`);
}
