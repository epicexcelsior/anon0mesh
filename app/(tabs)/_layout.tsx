import { Tabs } from "expo-router";
import VoidTabBar from "@/components/ui/VoidTabBar";

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <VoidTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      {/* Hidden index route — handles initial redirect logic */}
      <Tabs.Screen
        name="index"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      <Tabs.Screen name="chat" />
      <Tabs.Screen name="wallet" />
      <Tabs.Screen name="mesh" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}
