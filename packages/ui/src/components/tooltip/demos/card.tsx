import { Button } from "@fewtone/ui/components/button/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@fewtone/ui/components/tooltip/tooltip";
import { DownloadIcon, Share2Icon, Undo2Icon } from "lucide-react";

const actions = [
  { label: "Undo", icon: Undo2Icon },
  { label: "Share", icon: Share2Icon },
  { label: "Download", icon: DownloadIcon },
];

/** The index card's preview: the toolbar without the side setting */
export default function TooltipCard() {
  return (
    <TooltipProvider>
      <div className="flex items-center gap-1">
        {actions.map(({ label, icon: Icon }) => (
          <Tooltip key={label}>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" aria-label={label}>
                <Icon aria-hidden />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{label}</TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
}
