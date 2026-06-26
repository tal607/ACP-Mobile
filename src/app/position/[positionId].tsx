import { router, useLocalSearchParams } from "expo-router";
import { Chip, Separator, Surface, Typography } from "heroui-native";
import { useMemo, useState, type JSX } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScopedTheme } from "uniwind";
import { Icon } from "@/components";
import { CONTACTS, type Transaction } from "@/data/contacts";
import { TONE_HEX, type IconName, type Tone } from "@/theme/tokens";

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

const fmtFull = (n: number): string => `$${n.toLocaleString("en-US")}`;

/* ------------------------------------------------------------------ *
 * Transaction type -> icon + tone
 * ------------------------------------------------------------------ */

const TX_STYLE: Record<Transaction["type"], { icon: IconName; tone: Tone; label: string }> = {
  Distribution: { icon: "arrowDown", tone: "success", label: "Distribution" },
  Contribution: { icon: "arrowUp", tone: "accent", label: "Contribution" },
  "Capital Call": { icon: "arrowUp", tone: "warning", label: "Capital Call" },
};

/* ------------------------------------------------------------------ *
 * Segment control
 * ------------------------------------------------------------------ */

const SEGMENTS = [
  { id: "all" as const, label: "All" },
  { id: "distributions" as const, label: "Distributions" },
  { id: "capital_calls" as const, label: "Capital Calls" },
  { id: "capital_flow" as const, label: "Capital Flow" },
] as const;

type SegmentId = (typeof SEGMENTS)[number]["id"];

const SEGMENT_FILTER: Record<SegmentId, (tx: Transaction) => boolean> = {
  all: () => true,
  distributions: (tx) => tx.type === "Distribution",
  capital_calls: (tx) => tx.type === "Capital Call",
  capital_flow: (tx) => tx.type === "Contribution",
};

/* ------------------------------------------------------------------ *
 * Transaction detail bottom sheet
 * ------------------------------------------------------------------ */

function SheetRow({
  label,
  value,
  bold,
  valueColor,
}: {
  label: string;
  value: string;
  bold?: boolean;
  valueColor?: string;
}): JSX.Element {
  return (
    <View className="flex-row items-center justify-between py-3">
      <Typography type="body-sm" color={bold ? undefined : "muted"}>
        {label}
      </Typography>
      <Typography
        type="body-sm"
        weight={bold ? "semibold" : undefined}
        style={valueColor ? { color: valueColor } : undefined}
      >
        {value}
      </Typography>
    </View>
  );
}

function TransactionDetailSheet({
  tx,
  fundName,
  fundClass,
  onClose,
}: {
  tx: Transaction | null;
  fundName: string;
  fundClass: string;
  onClose: () => void;
}): JSX.Element {
  const visible = tx !== null;
  const style = tx ? TX_STYLE[tx.type] : TX_STYLE.Distribution;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <ScopedTheme theme="light">
        <View style={{ flex: 1, justifyContent: "flex-end" }}>
          {/* Backdrop */}
          <Pressable
            style={[StyleSheet.absoluteFill, { backgroundColor: "rgba(0,0,0,0.35)" }]}
            onPress={onClose}
          />

          {tx && (
            <View
              className="bg-background rounded-t-3xl overflow-hidden"
              style={{ maxHeight: "78%" }}
            >
              {/* Drag handle */}
              <View className="items-center pt-3 pb-1">
                <View
                  className="w-10 rounded-full"
                  style={{ height: 4, backgroundColor: "#d4d4d8" }}
                />
              </View>

              {/* Close button */}
              <Pressable
                onPress={onClose}
                className="absolute top-3 right-4 h-8 w-8 items-center justify-center rounded-full"
                style={{ backgroundColor: "#f4f4f5" }}
              >
                <Icon name="close" size="sm" tone="muted" />
              </Pressable>

              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 44 }}
              >
                {/* Header: icon + type label + date + status chip */}
                <View className="flex-row items-center px-5 pt-4 pb-2 gap-3">
                  <View
                    className="h-10 w-10 rounded-full items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${TONE_HEX[style.tone]}18` }}
                  >
                    <Icon name={style.icon} size="md" tone={style.tone} />
                  </View>
                  <View className="flex-1 gap-0.5">
                    <Typography weight="semibold" style={{ fontSize: 15 }}>
                      {style.label}
                    </Typography>
                    <Typography type="body-xs" color="muted">
                      {tx.dateLabel}
                    </Typography>
                  </View>
                  <Chip
                    variant="soft"
                    color={tx.status === "Completed" ? "success" : "warning"}
                    size="sm"
                  >
                    <Chip.Label className="text-xs">{tx.status}</Chip.Label>
                  </Chip>
                </View>

                {/* Fund + class */}
                <View className="px-5 pb-4 gap-0.5">
                  <Typography type="body-sm" color="muted">
                    {fundName}
                  </Typography>
                  <Typography type="body-xs" color="muted">
                    {fundClass}
                  </Typography>
                </View>

                <Separator />

                {/* Type-specific sections */}
                <View className="px-5">

                  {/* ── DISTRIBUTION ── */}
                  {tx.type === "Distribution" && (
                    <>
                      <Typography
                        weight="semibold"
                        style={{ fontSize: 13, paddingTop: 16, paddingBottom: 4 }}
                      >
                        Distribution Details
                      </Typography>
                      <Separator />
                      <SheetRow label="Distribution" value={fmtFull(tx.amount)} />
                      <Separator />
                      <SheetRow label="Total" value={fmtFull(tx.amount)} bold />
                      <Separator />
                      {tx.paymentMethod != null && (
                        <>
                          <SheetRow label="Payment" value={tx.paymentMethod} />
                          <Separator />
                        </>
                      )}
                      <SheetRow
                        label="Remaining amount to pay"
                        value={tx.remainingToPay != null ? fmtFull(tx.remainingToPay) : "-"}
                        valueColor={
                          tx.remainingToPay != null && tx.remainingToPay > 0
                            ? TONE_HEX.warning
                            : undefined
                        }
                      />
                    </>
                  )}

                  {/* ── CAPITAL CALL ── */}
                  {tx.type === "Capital Call" && (
                    <>
                      <Typography
                        weight="semibold"
                        style={{ fontSize: 13, paddingTop: 16, paddingBottom: 4 }}
                      >
                        Capital Call Details
                      </Typography>
                      <Separator />
                      <SheetRow label="Amount" value={fmtFull(tx.amount)} />
                      <Separator />
                      <SheetRow label="Total" value={fmtFull(tx.amount)} bold />
                      <Separator />
                      {tx.contributionReceived != null && (
                        <>
                          <SheetRow
                            label="Contribution Received"
                            value={fmtFull(tx.contributionReceived)}
                            valueColor={
                              tx.contributionReceived > 0 ? TONE_HEX.success : undefined
                            }
                          />
                          <Separator />
                        </>
                      )}
                      {tx.balanceRemaining != null && (
                        <>
                          <SheetRow
                            label="Balance Remaining"
                            value={fmtFull(tx.balanceRemaining)}
                            valueColor={
                              tx.balanceRemaining > 0 ? TONE_HEX.warning : TONE_HEX.success
                            }
                          />
                          <Separator />
                        </>
                      )}
                      {tx.period != null && (
                        <>
                          <SheetRow label="Period" value={tx.period} />
                          <Separator />
                        </>
                      )}
                      {tx.dueDate != null && (
                        <SheetRow label="Due Date" value={tx.dueDate} />
                      )}
                    </>
                  )}

                  {/* ── CONTRIBUTION / CAPITAL FLOW ── */}
                  {tx.type === "Contribution" && (
                    <>
                      <Typography
                        weight="semibold"
                        style={{ fontSize: 13, paddingTop: 16, paddingBottom: 4 }}
                      >
                        Allocation Details
                      </Typography>
                      <Separator />
                      <SheetRow label="Amount" value={fmtFull(tx.amount)} />
                      {tx.allocationType != null && (
                        <>
                          <Separator />
                          <SheetRow label="Allocation Type" value={tx.allocationType} />
                        </>
                      )}
                      <Separator />
                      <SheetRow label="Total" value={fmtFull(tx.amount)} bold />
                      {tx.receivedDate != null && (
                        <>
                          <Separator />
                          <SheetRow label="Effective Date" value={tx.dateLabel} />
                          <Separator />
                          <SheetRow label="Received Date" value={tx.receivedDate} />
                        </>
                      )}
                    </>
                  )}
                </View>

                {/* Note */}
                <View style={{ marginTop: 16 }}>
                  <Separator />
                </View>
                <View className="px-5 pt-4">
                  <Typography
                    weight="semibold"
                    style={{ fontSize: 13, marginBottom: 6 }}
                  >
                    Note
                  </Typography>
                  <Typography type="body-sm" color="muted">
                    {tx.note ?? "-"}
                  </Typography>
                </View>
              </ScrollView>
            </View>
          )}
        </View>
      </ScopedTheme>
    </Modal>
  );
}

/* ------------------------------------------------------------------ *
 * Transaction row (tappable)
 * ------------------------------------------------------------------ */

function TransactionRow({
  tx,
  showSeparator,
  onPress,
}: {
  tx: Transaction;
  showSeparator: boolean;
  onPress: () => void;
}): JSX.Element {
  const style = TX_STYLE[tx.type];
  const isInflow = tx.type === "Distribution";

  return (
    <>
      {showSeparator && <Separator />}
      <Pressable
        className="flex-row items-center px-4 py-3.5 gap-3 active:bg-surface-secondary"
        onPress={onPress}
      >
        {/* Type + date + optional note snippet */}
        <View className="flex-1 gap-0.5">
          <Typography weight="semibold" className="text-sm">
            {style.label}
          </Typography>
          <Typography type="body-xs" color="muted">
            {tx.dateLabel}
          </Typography>
          {tx.note && (
            <Typography
              type="body-xs"
              color="muted"
              style={{ fontSize: 11 }}
              numberOfLines={1}
            >
              {tx.note}
            </Typography>
          )}
        </View>

        {/* Amount + status chip */}
        <View className="items-end gap-1.5">
          <Typography
            weight="semibold"
            className="text-sm"
            style={{ color: isInflow ? TONE_HEX.success : TONE_HEX.foreground }}
          >
            {isInflow ? "+" : ""}
            {fmtFull(tx.amount)}
          </Typography>
          <Chip
            variant="soft"
            color={tx.status === "Completed" ? "success" : "warning"}
            size="sm"
          >
            <Chip.Label className="text-xs">{tx.status}</Chip.Label>
          </Chip>
        </View>

        {/* Chevron signals drilldown */}
        <Icon name="chevron" size="sm" tone="muted" />
      </Pressable>
    </>
  );
}

/* ------------------------------------------------------------------ *
 * Position / Transactions page
 * ------------------------------------------------------------------ */

export default function PositionPage(): JSX.Element {
  const { positionId, contactId, contactName } = useLocalSearchParams<{
    positionId: string;
    contactId: string;
    contactName: string;
  }>();

  const [activeSegment, setActiveSegment] = useState<SegmentId>("all");
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  const contact = CONTACTS.find((c) => c.id === contactId);
  const position = contact?.positions?.find((p) => p.id === positionId);

  const filteredTxs = useMemo(
    () => (position?.transactions ?? []).filter(SEGMENT_FILTER[activeSegment]),
    [activeSegment, position],
  );

  const grouped = useMemo(
    () =>
      filteredTxs.reduce<Record<number, Transaction[]>>((acc, tx) => {
        if (!acc[tx.year]) acc[tx.year] = [];
        acc[tx.year].push(tx);
        return acc;
      }, {}),
    [filteredTxs],
  );

  const years = useMemo(
    () => Object.keys(grouped).map(Number).sort((a, b) => b - a),
    [grouped],
  );

  if (!position) {
    return (
      <SafeAreaView
        edges={["top"]}
        className="flex-1 bg-background items-center justify-center gap-3"
      >
        <Typography type="body-sm" color="muted">
          Position not found
        </Typography>
        <Pressable onPress={() => (router.canGoBack() ? router.back() : router.replace("/(tabs)/contacts"))}>
          <Typography type="body-sm" style={{ color: TONE_HEX.accent }}>
            Go back
          </Typography>
        </Pressable>
      </SafeAreaView>
    );
  }

  const unfunded = position.commitment - position.contribution;

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background">
      {/* Nav bar */}
      <View className="flex-row items-center px-4 py-2 gap-2">
        <Pressable
          onPress={() => (router.canGoBack() ? router.back() : router.replace("/(tabs)/contacts"))}
          className="h-9 w-9 items-center justify-center rounded-full"
          style={{ backgroundColor: "#f0f0f0" }}
        >
          <Icon name="back" size="md" tone="foreground" />
        </Pressable>
        <Typography
          weight="semibold"
          className="text-base flex-1 text-center"
          numberOfLines={1}
        >
          {contactName ?? "Contact"}
        </Typography>
        {/* Spacer so title stays centered */}
        <View className="h-9 w-9" />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 48 }}
      >
        {/* Fund header */}
        <View className="px-5 pt-3 pb-5 gap-1">
          <View className="flex-row items-start justify-between gap-2">
            <Typography
              weight="bold"
              style={{ fontSize: 20, flex: 1 }}
              numberOfLines={2}
            >
              {position.fundName}
            </Typography>
            <Chip
              variant="soft"
              color={position.status === "Active" ? "success" : "default"}
              size="sm"
            >
              <Chip.Label className="text-xs">{position.status}</Chip.Label>
            </Chip>
          </View>
          <Typography type="body-sm" color="muted">
            {position.fundType} · Est. {position.vintage}
          </Typography>
          <Typography type="body-xs" color="muted" style={{ marginTop: 2 }}>
            {position.profile} · {position.class}
          </Typography>
        </View>

        {/* KPI summary row */}
        <View className="px-5 pb-6 flex-row gap-3">
          <Surface className="flex-1 gap-1 rounded-2xl">
            <Typography type="body-xs" color="muted" style={{ fontSize: 11 }}>
              COMMITTED
            </Typography>
            <Typography weight="bold" className="text-base">
              {fmtShort(position.commitment)}
            </Typography>
            {unfunded > 0 && (
              <Typography
                type="body-xs"
                style={{ color: TONE_HEX.warning, fontSize: 11 }}
              >
                {fmtShort(position.contribution)} funded
              </Typography>
            )}
          </Surface>

          <Surface className="flex-1 gap-1 rounded-2xl">
            <Typography type="body-xs" color="muted" style={{ fontSize: 11 }}>
              DISTRIBUTIONS
            </Typography>
            <Typography
              weight="bold"
              className="text-base"
              style={{ color: TONE_HEX.success }}
            >
              {fmtShort(position.distributions)}
            </Typography>
            <Typography type="body-xs" color="muted" style={{ fontSize: 11 }}>
              {(position.ownership * 100).toFixed(1)}% ownership
            </Typography>
          </Surface>

          {unfunded > 0 && (
            <Surface className="flex-1 gap-1 rounded-2xl">
              <Typography type="body-xs" color="muted" style={{ fontSize: 11 }}>
                UNFUNDED
              </Typography>
              <Typography
                weight="bold"
                className="text-base"
                style={{ color: TONE_HEX.warning }}
              >
                {fmtShort(unfunded)}
              </Typography>
            </Surface>
          )}
        </View>

        {/* Segment control — All / Distributions / Capital Calls / Capital Flow */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            gap: 6,
            paddingHorizontal: 20,
            paddingBottom: 16,
          }}
        >
          {SEGMENTS.map((seg) => {
            const active = activeSegment === seg.id;
            return (
              <Pressable
                key={seg.id}
                onPress={() => setActiveSegment(seg.id)}
                style={{
                  paddingHorizontal: 14,
                  paddingVertical: 6,
                  borderRadius: 999,
                  borderWidth: 1,
                  backgroundColor: active ? TONE_HEX.accent : "transparent",
                  borderColor: active ? TONE_HEX.accent : "#e4e4e7",
                }}
              >
                <Typography
                  type="body-sm"
                  weight={active ? "semibold" : undefined}
                  style={{
                    fontSize: 12,
                    color: active ? "#ffffff" : TONE_HEX.foreground,
                  }}
                >
                  {seg.label}
                </Typography>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Transactions grouped by year */}
        <View className="px-5 gap-5">
          {years.length === 0 ? (
            <View className="items-center py-10">
              <Typography type="body-sm" color="muted">
                No transactions
              </Typography>
            </View>
          ) : (
            years.map((year) => (
              <View key={year} className="gap-2">
                <Typography
                  type="body-xs"
                  color="muted"
                  weight="semibold"
                  style={{ fontSize: 12 }}
                >
                  {year}
                </Typography>
                <Surface className="p-0 rounded-2xl overflow-hidden">
                  {grouped[year].map((tx, i) => (
                    <TransactionRow
                      key={tx.id}
                      tx={tx}
                      showSeparator={i > 0}
                      onPress={() => setSelectedTx(tx)}
                    />
                  ))}
                </Surface>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Transaction detail bottom sheet */}
      <TransactionDetailSheet
        tx={selectedTx}
        fundName={position.fundName}
        fundClass={position.class}
        onClose={() => setSelectedTx(null)}
      />
    </SafeAreaView>
  );
}
