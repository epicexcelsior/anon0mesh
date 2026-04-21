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
import { MessagePeerRow } from "@/components/messages/MessagePeerRow";
import { Sheet } from "@/components/primitives/Sheet";
import { appTheme as theme } from "@/src/design-system/theme";
import { usePeers } from "@/src/hooks";

interface NewConversationSheetProps {
  onSelectPeer: (peerId: string) => void;
}

function NoPeersEmpty({ hasSearch }: { hasSearch: boolean }) {
  return (
    <View style={styles.empty}>
      <Icon name="users" size={28} color={theme.colors.textMuted} />
      <Text style={styles.emptyText}>
        {hasSearch ? "No peers found" : "No peers in range"}
      </Text>
      <Text style={styles.emptySubtext}>
        {hasSearch
          ? "Try a different alias or public key fragment."
          : "The live peer graph appears here even while message delivery stays fixture-backed."}
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
    const rankedPeers = [...peers].sort((left, right) => {
      if (left.isTrusted !== right.isTrusted) {
        return Number(right.isTrusted) - Number(left.isTrusted);
      }
      if (left.signalStrength !== right.signalStrength) {
        return right.signalStrength - left.signalStrength;
      }
      return right.lastSeen - left.lastSeen;
    });

    const q = search.trim().toLowerCase();
    if (!q) return rankedPeers;
    return rankedPeers.filter((p) =>
      p.alias.toLowerCase().includes(q) ||
      p.id.toLowerCase().includes(q) ||
      p.publicKey.toLowerCase().includes(q),
    );
  }, [peers, search]);

  function handleClose() {
    if (ref && typeof ref !== "function" && ref.current) {
      ref.current.close();
    }
    setSearch("");
  }

  return (
    <Sheet ref={ref} snapPoints={[560]} title="New conversation">
      <View style={styles.sheetHeader}>
        <Text style={styles.sheetBody}>
          Choose from the current peer graph. Threads still use fixture-backed message delivery until LXMF runtime lands.
        </Text>
        <TouchableOpacity
          accessibilityLabel="Close"
          accessibilityRole="button"
          activeOpacity={0.7}
          hitSlop={8}
          onPress={handleClose}
          style={styles.closeBtn}
        >
          <Icon name="x" size={18} color={theme.colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <AppTextInput
        placeholder="Search peers or IDs…"
        value={search}
        onChangeText={setSearch}
        autoCapitalize="none"
        returnKeyType="search"
      />

      {filtered.length === 0 ? (
        <NoPeersEmpty hasSearch={search.trim().length > 0} />
      ) : (
        <BottomSheetFlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <MessagePeerRow
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
    flexDirection: "row",
    gap: theme.spacing.md,
    justifyContent: "space-between",
    marginTop: -theme.spacing.md,
  },
  sheetBody: {
    color: theme.colors.textSecondary,
    flex: 1,
    fontFamily: theme.fonts.body,
    fontSize: theme.type.caption,
    lineHeight: theme.type.caption * 1.6,
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
    maxHeight: 320,
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
  emptySubtext: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.body,
    fontSize: theme.type.caption,
    lineHeight: theme.type.caption * 1.6,
    maxWidth: 280,
    textAlign: "center",
  },
});
