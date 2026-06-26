import { router } from "expo-router";
import { Typography } from "heroui-native";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type JSX,
} from "react";
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScopedTheme } from "uniwind";
import type { ContactData } from "@/components";
import { InitialsAvatar, Tag } from "@/components";
import { CONTACTS } from "@/data/contacts";
import { clearRecents, getRecentIds, recordRecent } from "@/data/recents";
import { TONE_HEX } from "@/theme/tokens";
import { Icon } from "./ui/Icon";

/* ------------------------------------------------------------------ *
 * Contact row (shared between Recents and Results sections)
 * ------------------------------------------------------------------ */

function SearchContactRow({
  contact,
  onPress,
  showClock,
}: {
  contact: ContactData;
  onPress: () => void;
  showClock?: boolean;
}): JSX.Element {
  const hasOverdue = contact.actionItems?.some((a) => a.overdue);

  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center px-5 py-3 gap-3 active:bg-surface-secondary"
    >
      {/* Avatar */}
      <View>
        <InitialsAvatar initials={contact.initials} size="md" />
        {hasOverdue && (
          <View
            className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-danger"
            style={{ borderWidth: 2, borderColor: "#ffffff" }}
          />
        )}
      </View>

      {/* Text */}
      <View className="flex-1 gap-0.5">
        <View className="flex-row items-center justify-between gap-2">
          <Typography weight="semibold" className="text-sm flex-1" numberOfLines={1}>
            {contact.name}
          </Typography>
          <Tag label={contact.tag} />
        </View>
        <View className="flex-row items-center justify-between gap-2">
          <Typography type="body-sm" color="muted" className="text-xs flex-1" numberOfLines={1}>
            {contact.company}
          </Typography>
          {showClock && (
            <Icon name="activity" size="sm" color={TONE_HEX.muted} />
          )}
        </View>
      </View>
    </Pressable>
  );
}

/* ------------------------------------------------------------------ *
 * Hairline separator
 * ------------------------------------------------------------------ */

function RowSep(): JSX.Element {
  return (
    <View style={{ marginHorizontal: 20 }}>
      <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: "#e4e4e7" }} />
    </View>
  );
}

/* ------------------------------------------------------------------ *
 * Section header
 * ------------------------------------------------------------------ */

function SectionHeader({
  title,
  action,
  onAction,
}: {
  title: string;
  action?: string;
  onAction?: () => void;
}): JSX.Element {
  return (
    <View
      style={{
        flexDirection: "row", alignItems: "center", justifyContent: "space-between",
        paddingHorizontal: 20, paddingTop: 20, paddingBottom: 6,
      }}
    >
      <Typography
        style={{
          fontSize: 11, fontWeight: "700", color: TONE_HEX.muted,
          letterSpacing: 0.8, textTransform: "uppercase",
        }}
      >
        {title}
      </Typography>
      {action && onAction && (
        <Pressable onPress={onAction} hitSlop={8}>
          <Typography style={{ fontSize: 13, color: TONE_HEX.accent }}>
            {action}
          </Typography>
        </Pressable>
      )}
    </View>
  );
}

/* ------------------------------------------------------------------ *
 * Main overlay
 * ------------------------------------------------------------------ */

export function SearchOverlay({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}): JSX.Element {
  const [query, setQuery] = useState("");
  // Snapshot of recent IDs taken each time the overlay opens
  const [recentIds, setRecentIds] = useState<readonly string[]>([]);
  const inputRef = useRef<TextInput>(null);

  // Refresh recents + reset query every time the overlay opens
  useEffect(() => {
    if (visible) {
      setQuery("");
      setRecentIds(getRecentIds());
      // Small delay so the modal animation finishes before focusing
      const t = setTimeout(() => inputRef.current?.focus(), 100);
      return () => clearTimeout(t);
    }
  }, [visible]);

  /* ---- data derivation ---- */

  const recentContacts = useMemo(
    () =>
      recentIds
        .map((id) => CONTACTS.find((c) => c.id === id))
        .filter((c): c is ContactData => c !== undefined),
    [recentIds],
  );

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return CONTACTS.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.company.toLowerCase().includes(q) ||
        (c.email?.toLowerCase().includes(q) ?? false),
    ).sort((a, b) => {
      // Contacts whose name starts with the query rank first
      const aStarts = a.name.toLowerCase().startsWith(q) ? 0 : 1;
      const bStarts = b.name.toLowerCase().startsWith(q) ? 0 : 1;
      if (aStarts !== bStarts) return aStarts - bStarts;
      return a.name.localeCompare(b.name);
    });
  }, [query]);

  /* ---- handlers ---- */

  const openContact = useCallback(
    (id: string) => {
      recordRecent(id);
      onClose();
      // Small delay lets the modal close before pushing the route
      setTimeout(() => router.push(`/contact/${id}`), 50);
    },
    [onClose],
  );

  const handleClearRecents = useCallback(() => {
    clearRecents();
    setRecentIds([]);
  }, []);

  /* ---- empty state ---- */

  const noQuery = query.trim().length === 0;
  const noResults = !noQuery && results.length === 0;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={false}
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <ScopedTheme theme="light">
        <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: "#ffffff" }}>

          {/* ── Search bar row ── */}
          <View
            style={{
              flexDirection: "row", alignItems: "center",
              paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12, gap: 10,
            }}
          >
            {/* Input pill */}
            <View
              style={{
                flex: 1, flexDirection: "row", alignItems: "center", gap: 8,
                backgroundColor: "#f2f2f2", borderRadius: 12,
                paddingHorizontal: 12, paddingVertical: 10,
              }}
            >
              <Icon name="search" size="sm" tone="muted" />
              <TextInput
                ref={inputRef}
                style={{ flex: 1, fontSize: 16, color: TONE_HEX.foreground }}
                placeholder="Search contacts..."
                placeholderTextColor={TONE_HEX.muted}
                value={query}
                onChangeText={setQuery}
                autoCorrect={false}
                autoCapitalize="none"
                returnKeyType="search"
              />
              {query.length > 0 && (
                <Pressable hitSlop={8} onPress={() => setQuery("")}>
                  <View
                    style={{
                      width: 18, height: 18, borderRadius: 9,
                      backgroundColor: TONE_HEX.muted,
                      alignItems: "center", justifyContent: "center",
                    }}
                  >
                    <Icon name="close" size="sm" color="#ffffff" />
                  </View>
                </Pressable>
              )}
            </View>

            {/* Cancel */}
            <Pressable onPress={onClose} hitSlop={8}>
              <Typography
                style={{ fontSize: 16, color: TONE_HEX.accent, fontWeight: "500" }}
              >
                Cancel
              </Typography>
            </Pressable>
          </View>

          {/* ── Divider ── */}
          <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: "#e4e4e7" }} />

          {/* ── Content ── */}

          {/* No query: show Recents */}
          {noQuery && (
            recentContacts.length > 0 ? (
              <FlatList
                data={recentContacts}
                keyExtractor={(c) => c.id}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                ListHeaderComponent={
                  <SectionHeader
                    title="Recents"
                    action="Clear"
                    onAction={handleClearRecents}
                  />
                }
                ItemSeparatorComponent={RowSep}
                contentContainerStyle={{ paddingBottom: 40 }}
                renderItem={({ item }) => (
                  <SearchContactRow
                    contact={item}
                    showClock
                    onPress={() => openContact(item.id)}
                  />
                )}
              />
            ) : (
              <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 8, paddingBottom: 80 }}>
                <Icon name="search" size="lg" tone="muted" />
                <Typography type="body-sm" color="muted">
                  Search for a contact by name, company, or email
                </Typography>
              </View>
            )
          )}

          {/* Has query: show results */}
          {!noQuery && !noResults && (
            <FlatList
              data={results}
              keyExtractor={(c) => c.id}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              ListHeaderComponent={
                <SectionHeader title={`${results.length} result${results.length !== 1 ? "s" : ""}`} />
              }
              ItemSeparatorComponent={RowSep}
              contentContainerStyle={{ paddingBottom: 40 }}
              renderItem={({ item }) => (
                <SearchContactRow
                  contact={item}
                  onPress={() => openContact(item.id)}
                />
              )}
            />
          )}

          {/* Has query but no results */}
          {noResults && (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 8, paddingBottom: 80 }}>
              <Icon name="contacts" size="lg" tone="muted" />
              <Typography type="body-sm" color="muted">
                No contacts match "{query}"
              </Typography>
            </View>
          )}

        </SafeAreaView>
      </ScopedTheme>
    </Modal>
  );
}
