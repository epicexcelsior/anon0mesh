import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { appTheme as theme } from "@/src/design-system/theme";

const SECTIONS = [
  {
    title: "LXMF",
    body: "Lightweight Extensible Message Format is an application protocol layered on top of Reticulum. It provides a store-and-forward message routing scheme with delivery guarantees across intermittent links. AnonMesh uses LXMF bundles to carry transaction announcements peer-to-peer.",
  },
  {
    title: "Reticulum",
    body: "Reticulum is a cryptography-based networking stack designed for reliable communication over high-latency, low-bandwidth links. It provides end-to-end encryption, path finding, and routing without relying on fixed infrastructure.",
  },
  {
    title: "BLE Mesh",
    body: "Bluetooth Low Energy advertisement beacons allow nodes to discover each other without pairing. AnonMesh uses BLE to discover peers within radio range and to relay LXMF bundles hop-by-hop when nodes are out of each other's direct range.",
  },
  {
    title: "Solana Stealth",
    body: "Transactions are constructed using Solana stealth address primitives. The sender derives a one-time address from the recipient's public scan key, breaking the on-chain link between identities. Settlement only touches the chain once a path to a cluster RPC is available.",
  },
] as const;

export function TechDrawerContent() {
  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.heading}>Under the hood</Text>
      {SECTIONS.map((s) => (
        <View key={s.title} style={styles.section}>
          <Text style={styles.sectionTitle}>{s.title}</Text>
          <Text style={styles.sectionBody}>{s.body}</Text>
        </View>
      ))}
      <View style={styles.footer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: {
    padding: theme.spacing.xxl,
    gap: theme.spacing.xxl,
  },
  heading: {
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.headingBold,
    fontSize: theme.type.title,
  },
  section: {
    gap: theme.spacing.sm,
  },
  sectionTitle: {
    color: theme.colors.cyan,
    fontFamily: theme.fonts.bodyMedium,
    fontSize: theme.type.caption,
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  sectionBody: {
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.body,
    fontSize: theme.type.body,
    lineHeight: 22,
  },
  footer: { height: 32 },
});
