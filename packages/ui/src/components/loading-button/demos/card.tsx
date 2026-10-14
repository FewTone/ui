import { LoadingButton } from "@fewtone/ui/components/loading-button/loading-button";

/** The index card's preview: one button, mid-save. The page itself opens on buttons you can try. */
export default function LoadingButtonCard() {
  return (
    <LoadingButton state="loading" loadingText="Saving…">
      Save changes
    </LoadingButton>
  );
}
