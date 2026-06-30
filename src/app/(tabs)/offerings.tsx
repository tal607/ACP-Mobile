import { Button, Typography } from "heroui-native";
import { useState, type JSX } from "react";
import { Pressable, ScrollView, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { OfferingCard, Icon, MetricCard } from "@/components";
import { OFFERINGS, type OfferingStatus } from "@/data/offerings";
import { TONE_HEX } from "@/theme/tokens";

/* ------------------------------------------------------------------ *
 * Helpers
 * ------------------------------------------------------------------ */

const fmtShort = (n: number): string => {
  if (n >= 1_000_000) {
    const v = n / 1_000_000;
    return `$${v % 1 === 0 ? v : v.toFixed(1)}M`;
  }
  if (n >= 1_000) {
    const v = n / 1_000;
    return `$${v % 1 === 0 ? v : v.toFixed(1)}K`;
  }
  return `$${n.toLocaleString()}`;
};

// Derive statuses present in the data, preserving a logical order
const STATUS_ORDER: OfferingStatus[] = ["Active", "Closed", "Draft"];
const AVAILABLE_STATUSES = STATUS_ORDER.filter((s) =>
  OFFERINGS.some((o) => o.status === s)
);
const FILTER_OPTIONS = ["All", ...AVAILABLE_STATUSES] as const;
type FilterOption = (typeof FILTER_OPTIONS)[number];

/* ------------------------------------------------------------------ *
 * Screen
 * ------------------------------------------------------------------ */

export default function OfferingsScreen(): JSX.Element {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterOption>("All");

  const activeCount = OFFERINGS.filter((o) => o.status === "Active").length;
  const totalCommitments = OFFERINGS.reduce((s, o) => s + o.commitments, 0);
  const totalProspects = OFFERINGS.reduce((s, o) => s + o.prospectsCount, 0);

  const filtered = OFFERINGS.filter((o) => {
    const matchesSearch = o.name
      .toLowerCase()
      .includes(query.toLowerCase().trim());
    const matchesFilter = filter === "All" || o.status === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background">
      {/* Header */}
      <View className="px-5 pt-4 pb-3">
        <Typography weight="bold" style={{ fontSize: 24 }}>
          Offerings
        </Typography>
        <Typography type="body-sm" color="muted" style={{ marginTop: 2 }}>
          {OFFERINGS.length} total · {activeCount} active
        </Typography>
      </View>

      {/* Search bar */}
      <View className="px-5 pb-3">
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "#f4f4f5",
            borderRadius: 12,
            paddingHorizontal: 10,
            paddingVertical: 8,
            gap: 8,
          }}
        >
          <Icon name="search" size="sm" tone="muted" />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search offerings…"
            placeholderTextColor={TONE_HEX.muted}
            returnKeyType="search"
            style={{
              flex: 1,
              fontSize: 15,
              color: TONE_HEX.foreground,
              padding: 0,
            }}
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery("")} hitSlop={8}>
              <Icon name="close" size={14} tone="muted" />
            </Pressable>
          )}
        </View>
      </View>

      {/* Summary strip */}
      <View className="flex-row gap-2 px-5 pb-3">
        <MetricCard
          label="Total raised"
          value={fmtShort(totalCommitments)}
          style={{ flex: 1 }}
        />
        <MetricCard
          label="Total prospects"
          value={String(totalProspects)}
          style={{ flex: 1 }}
        />
      </View>

      {/* Filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ flexGrow: 0 }}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: 10,
          gap: 8,
        }}
      >
        {FILTER_OPTIONS.map((option) => {
          const selected = filter === option;
          return (
            <Button
              key={option}
              variant={selected ? "primary" : "secondary"}
              size="sm"
              className="rounded-full"
              onPress={() => setFilter(option)}
            >
              <Button.Label className={selected ? "" : "text-foreground"}>
                {option}
              </Button.Label>
            </Button>
          );
        })}
      </ScrollView>

      {/* Offering list */}
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: 100,
          gap: 10,
        }}
      >
        {filtered.length === 0 ? (
          <View className="items-center justify-center py-16 gap-2">
            <Icon name="search" size="lg" tone="muted" />
            <Typography type="body-sm" color="muted">
              No offerings found
            </Typography>
          </View>
        ) : (
          filtered.map((o) => <OfferingCard key={o.id} offering={o} />)
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
