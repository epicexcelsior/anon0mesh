import React from "react";
import { StyleSheet, View } from "react-native";
import { Tabs } from "expo-router";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";

import BottomNav from "@/components/primitives/BottomNav";
import type { AppTab } from "@/components/primitives/BottomNav";
import { DevEntryFAB } from "@/components/dev/DevEntryFAB";
import { MeshStatusStrip } from "@/components/mesh/MeshStatusStrip";

function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const routeName = state.routes[state.index]?.name as AppTab | undefined;
  const active: AppTab = routeName && ["home", "messages", "settings"].includes(routeName)
    ? routeName
    : "home";

  return (
    <BottomNav
      active={active}
      onSelect={(tab) => navigation.navigate(tab)}
    />
  );
}

export default function TabsLayout() {
  return (
    <View style={styles.root}>
      <MeshStatusStrip />
      <Tabs
        screenOptions={{ headerShown: false }}
        tabBar={(props) => <CustomTabBar {...props} />}
      >
        <Tabs.Screen name="home" />
        <Tabs.Screen name="messages" />
        <Tabs.Screen name="settings" />
      </Tabs>
      <DevEntryFAB />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
