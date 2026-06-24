import { Typography } from "heroui-native";
import type { JSX } from "react";
import { Screen } from "@/components";

export default function ContactsTab(): JSX.Element {
  return (
    <Screen>
      <Typography className="text-3xl" weight="bold">
        Contacts
      </Typography>
      <Typography type="body-sm" color="muted">
        Contact list coming soon.
      </Typography>
    </Screen>
  );
}
