import { Button } from "heroui-native";
import type { ComponentProps, JSX } from "react";
import { Icon } from "./Icon";
import type { IconName } from "@/theme/tokens";

type PillButtonProps = ComponentProps<typeof Button> & {
  /** Optional leading icon (semantic name). */
  icon?: IconName;
  children: string;
};

/**
 * White, outlined pill button (the app's secondary/quick action).
 * Uses HeroUI's `secondary` variant (NOT `outline`) restyled with a border, which
 * keeps the look but avoids the web-only colorKit error that `outline` triggers.
 * Change the look of ALL pill buttons here.
 */
export function PillButton({ icon, children, className, ...props }: PillButtonProps): JSX.Element {
  return (
    <Button
      variant="secondary"
      size="sm"
      className={`bg-surface border border-border rounded-full ${className ?? ""}`}
      {...props}
    >
      {icon && <Icon name={icon} size="sm" />}
      <Button.Label className="text-foreground" numberOfLines={1}>
        {children}
      </Button.Label>
    </Button>
  );
}
