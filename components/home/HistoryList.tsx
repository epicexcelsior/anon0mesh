import { useRouter } from "expo-router";
import React from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";

import { Icon } from "@/components/primitives/Icon";
import { TxRow } from "@/components/shared/TxRow";
import type { Transaction } from "@/src/domain/entities/Transaction";
import { appTheme as theme } from "@/src/design-system/theme";

interface HistoryListProps {
  transactions: Transaction[];
}

const LIST_BOTTOM_PADDING = theme.component.nav.barHeight + theme.spacing.xxxl;

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

  const sorted = [...transactions].sort((left, right) => right.createdAt - left.createdAt);

  return (
    <FlatList
      contentContainerStyle={[
        styles.list,
        sorted.length === 0 && styles.emptyContainer,
      ]}
      data={sorted}
      keyExtractor={keyExtractor}
      ListEmptyComponent={EmptyState}
      renderItem={({ item }) => (
        <TxRow
          onPress={() => router.push({ pathname: "/history/[txId]", params: { txId: item.id } })}
          tx={item}
        />
      )}
      showsVerticalScrollIndicator={false}
      style={styles.scroll}
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
    paddingBottom: LIST_BOTTOM_PADDING,
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
