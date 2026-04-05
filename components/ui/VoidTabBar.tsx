import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { VP } from "@/constants/void-protocol";
import {
  ChatCircle,
  Wallet,
  Broadcast,
  User,
} from "phosphor-react-native";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";

const TAB_ICONS: Record<string, typeof ChatCircle> = {
  chat: ChatCircle,
  wallet: Wallet,
  mesh: Broadcast,
  profile: User,
};

const TAB_LABELS: Record<string, string> = {
  chat: "Chat",
  wallet: "Wallet",
  mesh: "Mesh",
  profile: "Profile",
};

export default function VoidTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  return (
    <View style={styles.container}>
      <View style={styles.topBorder} />
      <View style={styles.tabRow}>
        {state.routes.map((route, index) => {
          // Skip the index route (it's just the redirect logic)
          if (route.name === "index") return null;

          const isFocused = state.index === index;
          const Icon = TAB_ICONS[route.name] ?? ChatCircle;
          const label = TAB_LABELS[route.name] ?? route.name;
          const color = isFocused
            ? VP.colors.nav.active
            : VP.colors.nav.inactive;

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              style={styles.tab}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={label}
            >
              <Icon
                size={24}
                color={color}
                weight={isFocused ? "fill" : "regular"}
              />
              <Text style={[styles.label, { color }]}>{label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: VP.colors.nav.background,
  },
  topBorder: {
    height: 1,
    backgroundColor: VP.colors.ghostBorder,
  },
  tabRow: {
    flexDirection: "row",
    paddingTop: 8,
    paddingBottom: 24,
    paddingHorizontal: 8,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 4,
    minHeight: 44,
  },
  label: {
    fontSize: 10,
    fontFamily: "SpaceGrotesk-Medium",
    marginTop: 4,
    letterSpacing: 0.5,
  },
});
