import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { appTheme as theme } from "@/src/design-system/theme";

const SECTIONS = [
  {
    title: "LXMF",
    body: "Lightweight Extensible Message Format rides on top of Reticulum and is built for store-and-forward delivery across intermittent links. AnonMesh keeps the LXMF interface ready here while the native runtime finishes landing.",
  },
  {
    title: "Reticulum",
    body: "Reticulum is a cryptography-based networking stack designed for reliable communication over high-latency, low-bandwidth links. It provides end-to-end encryption, path finding, and routing without relying on fixed infrastructure.",
  },
  {
    title: "BLE Mesh",
    body: "Bluetooth Low Energy advertisement beacons allow nodes to discover each other without pairing. In this recovery build, BLE drives local peer discovery today while broader relay behavior keeps maturing.",
  },
  {
    title: "Solana Stealth",
    body: "The intended privacy path derives one-time settlement addresses from recipient keys before final settlement. The seam and UI are present in this build, but the full stealth transfer route is not live end to end yet.",
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
