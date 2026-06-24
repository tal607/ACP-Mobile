import { Typography } from "heroui-native";
import type { JSX } from "react";
import { Screen } from "@/components";

export default function CalendarTab(): JSX.Element {
  return (
    <Screen>
      <Typography className="text-3xl" weight="bold">
        Calendar
      </Typography>
      <Typography type="body-sm" color="muted">
        Meetings & calendar coming soon.
      </Typography>
    </Screen>
  );
}
