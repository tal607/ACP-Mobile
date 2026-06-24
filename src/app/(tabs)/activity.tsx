import { Typography } from "heroui-native";
import type { JSX } from "react";
import { Screen } from "@/components";

export default function ActivityTab(): JSX.Element {
  return (
    <Screen>
      <Typography className="text-3xl" weight="bold">
        Activity
      </Typography>
      <Typography type="body-sm" color="muted">
        Activity feed coming soon.
      </Typography>
    </Screen>
  );
}
