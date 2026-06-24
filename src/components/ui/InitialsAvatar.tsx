import { Avatar, Typography } from "heroui-native";
import type { JSX } from "react";

/** Soft-accent avatar showing initials (e.g. "DM"). Used for contacts/meetings. */
export function InitialsAvatar({
  initials,
  size = "md",
}: {
  initials: string;
  size?: "sm" | "md" | "lg";
}): JSX.Element {
  return (
    <Avatar size={size} variant="soft" color="accent">
      <Avatar.Fallback>
        <Typography type="body-sm" weight="semibold" className="text-accent-soft-foreground">
          {initials}
        </Typography>
      </Avatar.Fallback>
    </Avatar>
  );
}
