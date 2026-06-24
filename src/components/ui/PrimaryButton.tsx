import { Button } from "heroui-native";
import type { ComponentProps, JSX } from "react";
import { Icon } from "./Icon";
import { ON_COLOR, type IconName } from "@/theme/tokens";

type PrimaryButtonProps = ComponentProps<typeof Button> & {
  /** Optional leading icon (semantic name). */
  icon?: IconName;
  children: string;
};

/**
 * Accent (filled) primary button — white icon + label on the accent fill.
 * Change the look of ALL primary buttons here.
 */
export function PrimaryButton({ icon, children, className, ...props }: PrimaryButtonProps): JSX.Element {
  return (
    <Button variant="primary" className={`rounded-full ${className ?? ""}`} {...props}>
      {icon && <Icon name={icon} size="md" color={ON_COLOR} />}
      <Button.Label>{children}</Button.Label>
    </Button>
  );
}
