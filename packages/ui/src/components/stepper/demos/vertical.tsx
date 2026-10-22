import {
  Stepper,
  StepperDescription,
  StepperIndicator,
  StepperItem,
  StepperSeparator,
  StepperTitle,
  StepperTrigger,
} from "@fewtone/ui/components/stepper/stepper";

const steps = [
  { title: "Create your account", description: "Your name and a work email." },
  { title: "Invite your team", description: "Add the people you work with." },
  { title: "Connect a project", description: "Pick a repository to start from." },
  { title: "Go live", description: "Publish when you're ready." },
];

/*
 * Down the side, with a line under each title. Press any step: the lines fill or empty one after another on the
 * way there.
 */
export default function StepperVertical() {
  return (
    <Stepper defaultValue={2} orientation="vertical" aria-label="Setup" className="w-full max-w-xs">
      {steps.map(({ title, description }, index) => (
        <StepperItem key={title} step={index + 1}>
          <StepperTrigger>
            <StepperIndicator />
            <StepperTitle>{title}</StepperTitle>
            <StepperDescription>{description}</StepperDescription>
          </StepperTrigger>
          <StepperSeparator />
        </StepperItem>
      ))}
    </Stepper>
  );
}
