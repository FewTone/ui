import { Button } from "@fewtone/ui/components/button/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@fewtone/ui/components/dialog/dialog";

const terms = [
  {
    title: "Your account",
    body: "You're responsible for what happens under your account. Keep your password safe and tell us if someone else gets in.",
  },
  {
    title: "Your content",
    body: "What you make stays yours. You give us permission to store and show it only so the service can work.",
  },
  {
    title: "Fair use",
    body: "Don't overload the service, try to break it, or use it to send spam. We may slow down or pause accounts that do.",
  },
  {
    title: "Payments",
    body: "Paid plans renew each month until you cancel. Cancelling stops the next charge; the current month stays paid.",
  },
  {
    title: "Privacy",
    body: "We collect only what the service needs, and never sell it. The privacy policy lists what we keep and for how long.",
  },
  {
    title: "Changes",
    body: "If these terms change in a way that matters, we'll tell you by email at least 30 days before they apply.",
  },
  {
    title: "Ending",
    body: "You can close your account at any time. We'll delete your content within 30 days, unless the law says we must keep it.",
  },
];

/*
 * Long content scrolls inside the dialog, between a header and a footer that stay in place. The scrolling
 * area takes focus, so the arrow keys scroll it.
 */
export default function DialogScrolling() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Read the terms</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Terms of service</DialogTitle>
          <DialogDescription>Please read these before you continue.</DialogDescription>
        </DialogHeader>
        <section
          // biome-ignore lint/a11y/noNoninteractiveTabindex: a scrolling area must be reachable from the keyboard
          tabIndex={0}
          aria-label="Terms"
          className="grid max-h-72 gap-4 overflow-y-auto rounded-md text-sm outline-ring focus-visible:outline-(length:--focus-ring-width) focus-visible:outline-offset-(--focus-ring-offset)"
        >
          {terms.map((term, index) => (
            <div key={term.title} className="grid gap-1">
              <h3 className="font-medium">
                {index + 1}. {term.title}
              </h3>
              <p className="text-muted-foreground">{term.body}</p>
            </div>
          ))}
        </section>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Decline</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button>Accept</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
