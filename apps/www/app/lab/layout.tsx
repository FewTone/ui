import { notFound } from "next/navigation";

/** The Lab is our internal workbench. It only exists in development. */
export default function LabLayout({ children }: LayoutProps<"/lab">) {
  if (process.env.NODE_ENV === "production") notFound();
  return children;
}
