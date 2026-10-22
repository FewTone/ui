import { Badge } from "@fewtone/ui/components/badge/badge";
import { Button } from "@fewtone/ui/components/button/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@fewtone/ui/components/card/card";
import { Input } from "@fewtone/ui/components/input/input";
import { ArrowUpRightIcon } from "lucide-react";
import { useId } from "react";

/*
 * The range at a glance, each named underneath: a form card with every part, a small card with an action, and a
 * whole card as a link (hover it: the surface lifts a step).
 */
export default function CardOverview() {
  const id = useId();

  return (
    <ul className="grid w-full max-w-3xl items-start gap-x-6 gap-y-8 md:grid-cols-2">
      <li className="flex flex-col items-center gap-2 md:row-span-2">
        <Card className="w-full">
          <CardHeader>
            <CardTitle asChild>
              <h3>Create project</h3>
            </CardTitle>
            <CardDescription>Deploy a new project in a few clicks.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <label htmlFor={`${id}-name`} className="text-sm font-medium">
                Name
              </label>
              <Input id={`${id}-name`} placeholder="My project" />
            </div>
            <div className="grid gap-2">
              <label htmlFor={`${id}-repo`} className="text-sm font-medium">
                Repository
              </label>
              <Input id={`${id}-repo`} placeholder="github.com/you/project" />
            </div>
          </CardContent>
          <CardFooter className="justify-end">
            <Button variant="outline">Cancel</Button>
            <Button>Deploy</Button>
          </CardFooter>
        </Card>
        <span className="text-xs text-muted-foreground">Default</span>
      </li>

      <li className="flex flex-col items-center gap-2">
        <Card size="sm" className="w-full">
          <CardHeader>
            <CardTitle asChild>
              <h3>Team plan</h3>
            </CardTitle>
            <CardDescription>8 of 10 seats used</CardDescription>
            <CardAction>
              <Badge variant="secondary">Active</Badge>
            </CardAction>
          </CardHeader>
          <CardFooter>
            <Button variant="outline" size="sm">
              Manage seats
            </Button>
          </CardFooter>
        </Card>
        <span className="text-xs text-muted-foreground">Small, with an action</span>
      </li>

      <li className="flex flex-col items-center gap-2">
        <Card asChild size="sm" className="w-full">
          <a href="https://github.com/FewTone/ui" target="_blank" rel="noreferrer">
            <CardHeader>
              <CardTitle asChild>
                <h3>Source on GitHub</h3>
              </CardTitle>
              <CardDescription>Browse the code and open issues.</CardDescription>
              <CardAction>
                <ArrowUpRightIcon aria-hidden className="size-(--size-icon-md) text-muted-foreground" />
              </CardAction>
            </CardHeader>
          </a>
        </Card>
        <span className="text-xs text-muted-foreground">Link</span>
      </li>
    </ul>
  );
}
