import React from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyHref = any;

import { Icon } from "@/components/primitives/Icon";
import { TxRow } from "@/components/shared/TxRow";
import type { Transaction } from "@/src/domain/entities/Transaction";
import { appTheme as theme } from "@/src/design-system/theme";

interface HistoryListProps {
  transactions: Transaction[];
}

function EmptyState() {
  return (
    <View style={styles.empty}>
      <Icon name="inbox" size={28} color={theme.colors.textMuted} />
      <Text style={styles.emptyText}>No transactions yet</Text>
    </View>
  );
}

function keyExtractor(item: Transaction) {
  return item.id;
}

export function HistoryList({ transactions }: HistoryListProps) {
  const router = useRouter();

  const sorted = [...transactions].sort((a, b) => b.createdAt - a.createdAt);

  return (
    <FlatList
      data={sorted}
      keyExtractor={keyExtractor}
      renderItem={({ item }) => (
        <TxRow
          tx={item}
          onPress={() => router.push(`/history/${item.id}` as AnyHref)}
        />
      )}
      ListEmptyComponent={EmptyState}
      contentContainerStyle={[
        styles.list,
        sorted.length === 0 && styles.emptyContainer,
      ]}
      style={styles.scroll}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  list: {
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
  },
  empty: {
    alignItems: "center",
    gap: theme.spacing.sm,
    justifyContent: "center",
    paddingVertical: theme.spacing.huge,
  },
  emptyText: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.body,
    fontSize: theme.type.body,
  },
});
