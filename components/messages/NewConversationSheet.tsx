import BottomSheet, { BottomSheetFlatList } from "@gorhom/bottom-sheet";
import React, { forwardRef, useState, useMemo } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { AppTextInput } from "@/components/primitives/AppTextInput";
import { Icon } from "@/components/primitives/Icon";
import { Sheet } from "@/components/primitives/Sheet";
import { appTheme as theme } from "@/src/design-system/theme";
import { usePeers } from "@/src/hooks";
import type { Peer } from "@/src/domain/entities/Peer";

interface NewConversationSheetProps {
  onSelectPeer: (peerId: string) => void;
}

function getInitial(alias: string): string {
  return alias.trim().charAt(0).toUpperCase() || "?";
}

function PeerRow({
  peer,
  onPress,
}: {
  peer: Peer;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={onPress}
      style={styles.peerRow}
    >
      <View style={styles.peerAvatar}>
        <Text style={styles.peerInitial}>{getInitial(peer.alias)}</Text>
      </View>
      <Text style={styles.peerAlias} numberOfLines={1}>
        {peer.alias}
      </Text>
    </TouchableOpacity>
  );
}

function NoPeersEmpty({ hasSearch }: { hasSearch: boolean }) {
  return (
    <View style={styles.empty}>
      <Icon name="users" size={28} color={theme.colors.textMuted} />
      <Text style={styles.emptyText}>
        {hasSearch ? "No peers found" : "No peers in range"}
      </Text>
    </View>
  );
}

export const NewConversationSheet = forwardRef<
  BottomSheet,
  NewConversationSheetProps
>(function NewConversationSheet({ onSelectPeer }, ref) {
  const { peers } = usePeers();
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return peers;
    return peers.filter((p) =>
      p.alias.toLowerCase().includes(q) || p.id.toLowerCase().includes(q),
    );
  }, [peers, search]);

  function handleClose() {
    if (ref && typeof ref !== "function" && ref.current) {
      ref.current.close();
    }
    setSearch("");
  }

  return (
    <Sheet ref={ref} snapPoints={[480]} title="New conversation">
      {/* Close button row */}
      <View style={styles.sheetHeader}>
        <TouchableOpacity
          activeOpacity={0.7}
          hitSlop={8}
          onPress={handleClose}
          style={styles.closeBtn}
        >
          <Icon name="x" size={18} color={theme.colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <AppTextInput
        placeholder="Search peers…"
        value={search}
        onChangeText={setSearch}
        autoCapitalize="none"
        returnKeyType="search"
      />

      {/* Peer list */}
      {filtered.length === 0 ? (
        <NoPeersEmpty hasSearch={search.trim().length > 0} />
      ) : (
        <BottomSheetFlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <PeerRow
              peer={item}
              onPress={() => {
                setSearch("");
                onSelectPeer(item.id);
              }}
            />
          )}
          style={styles.peerList}
          showsVerticalScrollIndicator={false}
        />
      )}
    </Sheet>
  );
});

const styles = StyleSheet.create({
  sheetHeader: {
    alignItems: "flex-end",
    marginTop: -theme.spacing.md,
  },
  closeBtn: {
    alignItems: "center",
    backgroundColor: theme.colors.surfaceContainerHigh,
    borderColor: theme.colors.line,
    borderRadius: theme.radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    height: 32,
    justifyContent: "center",
    width: 32,
  },
  peerList: {
    maxHeight: 300,
  },
  peerRow: {
    alignItems: "center",
    borderBottomColor: theme.colors.line,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.md,
  },
  peerAvatar: {
    alignItems: "center",
    backgroundColor: theme.colors.cyanSoft,
    borderRadius: theme.radius.pill,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  peerInitial: {
    color: theme.colors.cyan,
    fontFamily: theme.fonts.bodyMedium,
    fontSize: theme.type.caption,
  },
  peerAlias: {
    color: theme.colors.textPrimary,
    flex: 1,
    fontFamily: theme.fonts.bodyMedium,
    fontSize: theme.type.body,
  },
  empty: {
    alignItems: "center",
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.xxxl,
  },
  emptyText: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.body,
    fontSize: theme.type.body,
    textAlign: "center",
  },
});
