import { Chip } from "heroui-native";
import type { JSX } from "react";
import { tagColor } from "@/theme/tokens";

/**
 * Status tag (e.g. "Prospect", "Investor"). Color is derived from the label via
 * the TAG_COLOR map in theme/tokens.ts — add new tags there in one place.
 */
export function Tag({ label }: { label: string }): JSX.Element {
  return (
    <Chip size="sm" variant="soft" color={tagColor(label)}>
      <Chip.Label>{label}</Chip.Label>
    </Chip>
  );
}
