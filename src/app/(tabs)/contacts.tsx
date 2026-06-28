import { router } from "expo-router";
import { Typography } from "heroui-native";
import { useMemo, useState, type JSX } from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
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
import { CONTACTS, type ContactDetailData } from "@/data/contacts";

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
 * Contact list row
 * ------------------------------------------------------------------ */

function ContactRow({ contact, onPress }: { contact: ContactData; onPress: () => void }): JSX.Element {
  const hasOverdue = contact.actionItems?.some((a) => a.overdue);

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
      </View>

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
          {contact.lastActivity && (
            <Typography type="body-sm" color="muted" className="text-xs">
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

  const organizations = useMemo(
    () => Array.from(new Set(CONTACTS.map((c) => c.company))).sort(),
    [],
  );

  const visible = useMemo(
    () =>
      CONTACTS.filter((c) => matchesFilters(c, filters)).sort((a, b) =>
        a.name.localeCompare(b.name),
      ),
    [filters],
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

      <FlatList
        data={visible}
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
