import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { Icon } from "@/components/primitives/Icon";
import { appTheme as theme } from "@/src/design-system/theme";

type IconName = React.ComponentProps<typeof Icon>["name"];

const SECTIONS: { icon: IconName; tone: string; title: string; body: string }[] = [
  {
    icon: "bluetooth",
    tone: "cyan",
    title: "BLE Mesh",
    body: "Phones discover each other directly. No router. No pairing.",
  },
  {
    icon: "share-2",
    tone: "cyan",
    title: "Reticulum",
    body: "Encrypted routing across weak or intermittent links.",
  },
  {
    icon: "send",
    tone: "cyan",
    title: "LXMF",
    body: "Store-and-forward messaging. Survives outages, settles later.",
  },
  {
    icon: "eye-off",
    tone: "purple",
    title: "Solana stealth",
    body: "One-time addresses per transfer. Sender, receiver, and amount stay private.",
  },
  {
    icon: "shield",
    tone: "purple",
    title: "Arcium MPC",
    body: "Privacy computation where no single party sees the data.",
  },
];

const TONE_MAP: Record<string, string> = {
  cyan: theme.colors.cyan,
  purple: theme.colors.purple,
};
const TONE_BG_MAP: Record<string, string> = {
  cyan: theme.colors.cyanSoft,
  purple: theme.colors.purpleSoft,
};

export function TechDrawerContent() {
  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.heading}>Under the hood</Text>
      <Text style={styles.intro}>
        A quick look at what moves your messages and payments across the mesh.
      </Text>
      {SECTIONS.map((s) => (
        <View key={s.title} style={styles.section}>
          <View style={[styles.iconWrap, { backgroundColor: TONE_BG_MAP[s.tone] }]}>
            <Icon color={TONE_MAP[s.tone]} name={s.icon} size={18} />
          </View>
          <View style={styles.sectionText}>
            <Text style={styles.sectionTitle}>{s.title}</Text>
            <Text style={styles.sectionBody}>{s.body}</Text>
          </View>
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
    gap: theme.spacing.lg,
  },
  heading: {
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.headingBold,
    fontSize: theme.type.title,
  },
  intro: {
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.body,
    fontSize: theme.type.body,
    lineHeight: 22,
    marginBottom: theme.spacing.sm,
  },
  section: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: theme.spacing.md,
  },
  iconWrap: {
    alignItems: "center",
    borderRadius: theme.radius.sm,
    flexShrink: 0,
    height: 36,
    justifyContent: "center",
    marginTop: 2,
    width: 36,
  },
  sectionText: {
    flex: 1,
    gap: 4,
  },
  sectionTitle: {
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.headingBold,
    fontSize: theme.type.body,
  },
  sectionBody: {
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.body,
    fontSize: theme.type.caption,
    lineHeight: 19,
  },
  footer: { height: 32 },
});
