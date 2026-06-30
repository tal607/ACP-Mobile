import { router } from "expo-router";
import { Typography } from "heroui-native";
import { useMemo, useState, type JSX } from "react";
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
import {
  type ContactData,
  CreateContactSheet,
  type FilterState,
  countActiveFilters,
  EMPTY_FILTERS,
  FilterSheet,
  Icon,
  InitialsAvatar,
  SearchOverlay,
  Tag,
} from "@/components";
import {
  CONTACTS,
  type ContactDetailData,
  type SavedView,
  SAVED_VIEWS,
} from "@/data/contacts";
import { isFavorite, useIsFavorite, useFavoritesVersion } from "@/data/favorites";
import { FAVORITE_GOLD, TONE_HEX } from "@/theme/tokens";

/* ------------------------------------------------------------------ *
 * Filtering — map the FilterState onto the contact records.
 * Only the fields that map cleanly onto ContactData are applied.
 * ------------------------------------------------------------------ */

function matchesFilters(c: ContactDetailData, f: FilterState): boolean {
  if (f.staffMembers.length && !(c.assignedTo && f.staffMembers.includes(c.assignedTo))) return false;
  if (f.organizations.length && !f.organizations.includes(c.company)) return false;
  if (f.types.length && !f.types.includes(c.tag)) return false;
  if (f.stages.length && !(c.status?.stage && f.stages.includes(c.status.stage))) return false;
  if (f.dataRoomStatus.length && !(c.status?.dataRoom && f.dataRoomStatus.includes(c.status.dataRoom))) return false;
  if (f.leadSources.length && !(c.leadSource && f.leadSources.includes(c.leadSource))) return false;
  if (f.classifications.length && !(c.classification && f.classifications.includes(c.classification))) return false;
  if (f.country.length && !(c.country && f.country.includes(c.country))) return false;
  if (f.tags.length && !(c.tags && f.tags.some((t) => f.tags.includes(t)))) return false;
  if (f.location && !(c.location ?? "").toLowerCase().includes(f.location.toLowerCase())) return false;
  return true;
}

/* ------------------------------------------------------------------ *
 * Views bottom sheet
 * ------------------------------------------------------------------ */

function ViewsSheet({
  visible,
  views,
  activeViewId,
  onSelect,
  onClose,
}: {
  visible: boolean;
  views: SavedView[];
  activeViewId: string;
  onSelect: (id: string) => void;
  onClose: () => void;
}): JSX.Element {
  const [query, setQuery] = useState("");

  const filtered = useMemo(
    () =>
      views.filter((v) =>
        v.name.toLowerCase().includes(query.toLowerCase()),
      ),
    [views, query],
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <ScopedTheme theme="light">
        <View style={{ flex: 1, justifyContent: "flex-end" }}>
          {/* Backdrop */}
          <Pressable
            style={[
              StyleSheet.absoluteFill,
              { backgroundColor: "rgba(0,0,0,0.35)" },
            ]}
            onPress={onClose}
          />

          <View
            className="bg-background rounded-t-3xl overflow-hidden"
            style={{ maxHeight: "72%" }}
          >
            {/* Drag handle */}
            <View className="items-center pt-3 pb-1">
              <View
                className="w-10 rounded-full"
                style={{ height: 4, backgroundColor: "#d4d4d8" }}
              />
            </View>

            {/* Title + close */}
            <View className="flex-row items-center justify-between px-5 pt-2 pb-3">
              <Typography weight="semibold" style={{ fontSize: 17 }}>
                Views
              </Typography>
              <Pressable
                onPress={onClose}
                className="h-8 w-8 items-center justify-center rounded-full"
                style={{ backgroundColor: "#f4f4f5" }}
              >
                <Icon name="close" size="sm" tone="muted" />
              </Pressable>
            </View>

            {/* Search */}
            <View
              style={{
                marginHorizontal: 20,
                marginBottom: 10,
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
                backgroundColor: "#f2f2f2",
                borderRadius: 12,
                paddingHorizontal: 12,
                paddingVertical: 10,
              }}
            >
              <Icon name="search" size="sm" tone="muted" />
              <TextInput
                style={{ flex: 1, fontSize: 14, color: TONE_HEX.foreground }}
                placeholder="Search views..."
                placeholderTextColor={TONE_HEX.muted}
                value={query}
                onChangeText={setQuery}
                autoCorrect={false}
                autoCapitalize="none"
              />
            </View>

            {/* View list */}
            <FlatList
              data={filtered}
              keyExtractor={(v) => v.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 44 }}
              renderItem={({ item }) => {
                const active = item.id === activeViewId;
                return (
                  <Pressable
                    className="flex-row items-center justify-between px-5 active:bg-surface-secondary"
                    style={{
                      paddingVertical: 8,
                      backgroundColor: active
                        ? `${TONE_HEX.accent}10`
                        : undefined,
                    }}
                    onPress={() => onSelect(item.id)}
                  >
                    <Typography
                      weight={active ? "semibold" : undefined}
                      style={{
                        fontSize: 15,
                        color: active ? TONE_HEX.accent : TONE_HEX.foreground,
                      }}
                    >
                      {item.name}
                    </Typography>
                    {active && (
                      <Icon name="check" size="sm" tone="accent" />
                    )}
                  </Pressable>
                );
              }}
              ListEmptyComponent={
                <View style={{ alignItems: "center", paddingVertical: 32 }}>
                  <Typography type="body-sm" color="muted">
                    No views match
                  </Typography>
                </View>
              }
            />
          </View>
        </View>
      </ScopedTheme>
    </Modal>
  );
}

/* ------------------------------------------------------------------ *
 * Contact list row
 * ------------------------------------------------------------------ */

function ContactRow({ contact, onPress }: { contact: ContactData; onPress: () => void }): JSX.Element {
  const hasOverdue = contact.actionItems?.some((a) => a.overdue);
  const favorite = useIsFavorite(contact.id);

  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center px-5 py-3 gap-3 active:bg-surface-secondary"
    >
      <View>
        <InitialsAvatar initials={contact.initials} size="md" />
        {hasOverdue && (
          <View
            className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-danger"
            style={{ borderWidth: 2, borderColor: "#ffffff" }}
          />
        )}
        {favorite && (
          <View
            className="absolute -bottom-0.5 -right-0.5 items-center justify-center rounded-full"
            style={{ height: 16, width: 16, backgroundColor: "#ffffff" }}
          >
            <Icon name="favoriteFilled" size={11} color={FAVORITE_GOLD} />
          </View>
        )}
      </View>

      <View className="flex-1">
        <View className="flex-row items-center justify-between gap-2">
          <Typography weight="semibold" className="text-sm flex-1" numberOfLines={1} style={{ lineHeight: 18 }}>
            {contact.name}
          </Typography>
          <Tag label={contact.tag} />
        </View>
        <View className="flex-row items-center justify-between gap-2">
          <Typography type="body-sm" color="muted" className="text-xs flex-1" numberOfLines={1}>
            {contact.email}
          </Typography>
          {contact.lastActivity && (
            <Typography color="muted" style={{ fontSize: 11 }}>
              {contact.lastActivity}
            </Typography>
          )}
        </View>
      </View>
    </Pressable>
  );
}

function RowSep(): JSX.Element {
  return (
    <View style={{ marginHorizontal: 20 }}>
      <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: "#e4e4e7" }} />
    </View>
  );
}

/* ------------------------------------------------------------------ *
 * Contacts tab
 * ------------------------------------------------------------------ */

export default function ContactsTab(): JSX.Element {
  const [searchOpen, setSearchOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>(EMPTY_FILTERS);

  // Views state
  const [activeViewId, setActiveViewId] = useState("all");
  const [viewsSheetOpen, setViewsSheetOpen] = useState(false);

  const handleSelectView = (id: string) => {
    setActiveViewId(id);
    setViewsSheetOpen(false);
  };

  const activeViewName =
    SAVED_VIEWS.find((v) => v.id === activeViewId)?.name ?? "All";

  const organizations = useMemo(
    () => Array.from(new Set(CONTACTS.map((c) => c.company))).sort(),
    [],
  );

  // Re-sort/re-render whenever favorites change (reactive store subscription).
  const favVersion = useFavoritesVersion();

  const visible = useMemo(
    () =>
      CONTACTS.filter((c) => matchesFilters(c, filters)).sort((a, b) => {
        const fa = isFavorite(a.id);
        const fb = isFavorite(b.id);
        if (fa !== fb) return fa ? -1 : 1;
        return a.name.localeCompare(b.name);
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [filters, favVersion],
  );

  const activeCount = countActiveFilters(filters);

  const open = (id: string) => router.push(`/contact/${id}`);

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background">
      <CreateContactSheet visible={createOpen} onClose={() => setCreateOpen(false)} />
      <SearchOverlay visible={searchOpen} onClose={() => setSearchOpen(false)} />
      <FilterSheet
        visible={filterOpen}
        onClose={() => setFilterOpen(false)}
        onApply={(f) => {
          setFilters(f);
          setFilterOpen(false);
        }}
        initialFilters={filters}
        organizations={organizations}
      />
      <ViewsSheet
        visible={viewsSheetOpen}
        views={SAVED_VIEWS}
        activeViewId={activeViewId}
        onSelect={handleSelectView}
        onClose={() => setViewsSheetOpen(false)}
      />

      {/* Header */}
      <View className="px-5 pt-2 pb-3 gap-3">
        <Typography className="text-3xl" weight="bold">
          Contacts
        </Typography>

        {/* Search + filter row */}
        <View className="flex-row items-center gap-2">
          <Pressable
            onPress={() => setSearchOpen(true)}
            style={{
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              backgroundColor: "#f2f2f2",
              borderRadius: 12,
              paddingHorizontal: 12,
              paddingVertical: 10,
            }}
          >
            <Icon name="search" size="sm" tone="muted" />
            <Typography type="body-sm" color="muted" className="flex-1">
              Search contacts...
            </Typography>
          </Pressable>

          <Pressable
            onPress={() => setFilterOpen(true)}
            className="h-10 w-10 rounded-xl border border-border items-center justify-center"
          >
            <Icon name="filter" size="md" />
            {activeCount > 0 && (
              <View className="absolute -top-1 -right-1 h-4 min-w-4 px-1 rounded-full bg-accent items-center justify-center">
                <Typography style={{ fontSize: 10, color: "#ffffff", fontWeight: "700" }}>
                  {activeCount}
                </Typography>
              </View>
            )}
          </Pressable>
        </View>
      </View>

      {/* Current view selector */}
      <View style={{ paddingHorizontal: 20, paddingBottom: 12 }}>
        <Pressable
          onPress={() => setViewsSheetOpen(true)}
          style={{
            flexDirection: "row",
            alignItems: "center",
            alignSelf: "flex-start",
            gap: 4,
            backgroundColor: "#f2f2f2",
            borderRadius: 8,
            paddingHorizontal: 9,
            paddingVertical: 5,
          }}
        >
          <Typography style={{ fontSize: 12, color: TONE_HEX.muted }}>
            View:
          </Typography>
          <Typography weight="semibold" style={{ fontSize: 12 }}>
            {activeViewName}
          </Typography>
          <Icon name="chevronDown" size="sm" tone="muted" />
        </Pressable>
      </View>

      <FlatList
        data={visible}
        extraData={favVersion}
        keyExtractor={(c) => c.id}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={RowSep}
        contentContainerStyle={{ paddingBottom: 100 }}
        renderItem={({ item }) => <ContactRow contact={item} onPress={() => open(item.id)} />}
        ListEmptyComponent={
          <View style={{ alignItems: "center", justifyContent: "center", gap: 8, paddingTop: 80 }}>
            <Icon name="contacts" size="lg" tone="muted" />
            <Typography type="body-sm" color="muted">
              No contacts match these filters
            </Typography>
          </View>
        }
      />

      {/* Floating action button */}
      <Pressable
        onPress={() => setCreateOpen(true)}
        style={{
          position: "absolute",
          bottom: 100,
          right: 20,
          height: 56,
          width: 56,
          borderRadius: 28,
          backgroundColor: "#2f54eb",
          alignItems: "center",
          justifyContent: "center",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.18,
          shadowRadius: 8,
          elevation: 6,
        }}
      >
        <Icon name="addContact" size="md" color="#ffffff" />
      </Pressable>
    </SafeAreaView>
  );
}
