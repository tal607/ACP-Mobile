import { Button } from "heroui-native";
import type { ComponentProps, JSX } from "react";
import { Icon } from "./Icon";
import type { IconName } from "@/theme/tokens";

type SecondaryButtonProps = ComponentProps<typeof Button> & {
  /** Optional leading icon (semantic name). */
  icon?: IconName;
  children: string;
};

/**
 * Filled secondary button (subtle gray fill) — neutral dark icon + label.
 * Used for secondary actions next to a PrimaryButton (e.g. Email beside Join).
 */
export function SecondaryButton({ icon, children, className, ...props }: SecondaryButtonProps): JSX.Element {
  return (
    <Button variant="secondary" className={`rounded-full ${className ?? ""}`} {...props}>
      {icon && <Icon name={icon} size="md" tone="foreground" />}
      <Button.Label className="text-foreground">{children}</Button.Label>
    </Button>
  );
}
