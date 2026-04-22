import React from "react";
import { useRouter } from "expo-router";

import { Pill } from "@/components/primitives/Pill";
import {
  IdentityCard,
  SettingsRow,
  SettingsScaffold,
  SettingsSection,
} from "@/components/settings";
import { useLocalDisplayName, useMesh, usePreferences, useWallet } from "@/src/hooks";

function shortValue(value: string) {
  if (value.length <= 18) return value;
  return `${value.slice(0, 12)}…`;
}

export default function SettingsScreen() {
  const router = useRouter();
  const { wallet, mode } = useWallet();
  const { connectionState, nodeCount } = useMesh();
  const { privacy } = usePreferences();
  const alias = wallet?.identity ?? "Anonymous";
  const { displayName } = useLocalDisplayName(wallet?.address ?? null, alias);

  return (
    <SettingsScaffold
      eyebrow="Control plane"
      subtitle="Identity, transport, privacy defaults, custody, and branch truth."
      title="Settings"
      trailing={<Pill label={connectionState} tone={connectionState === "Live" ? "green" : connectionState === "Silent" ? "amber" : "neutral"} />}
    >
      <IdentityCard
        address={wallet?.address ?? null}
        alias={wallet?.identity ?? null}
        connectionState={connectionState}
        displayName={displayName}
        mode={mode}
        onPress={() => router.push("/settings/identity" as Parameters<typeof router.push>[0])}
        peerCount={nodeCount}
      />

      <SettingsSection
        title="Identity"
        description="Local label and address tools."
      >
        <SettingsRow
          iconName="identity-chip"
          iconTone="cyan"
          label="Identity tools"
          onPress={() => router.push("/settings/identity" as Parameters<typeof router.push>[0])}
          showSeparator={false}
          sublabel="Label, alias, QR card, and address copy"
          value={shortValue(displayName)}
        />
      </SettingsSection>

      <SettingsSection
        title="Mesh transport"
        description="BLE controls are live. LXMF mode is still staged."
      >
        <SettingsRow
          iconName="radio"
          iconTone="cyan"
          label="Network"
          onPress={() => router.push("/settings/network" as Parameters<typeof router.push>[0])}
          showSeparator={false}
          sublabel={`${nodeCount} ${nodeCount === 1 ? "peer" : "peers"} visible on the BLE seam`}
          value={connectionState}
        />
      </SettingsSection>

      <SettingsSection
        title="Privacy defaults"
        description="Saved on this device and used by the send flow."
      >
        <SettingsRow
          iconName="shield"
          iconTone="purple"
          label="Privacy & Stealth"
          onPress={() => router.push("/settings/privacy" as Parameters<typeof router.push>[0])}
          showSeparator={false}
          sublabel="Stealth default, privacy lane, and key rotation cadence"
          value={privacy.stealthByDefault ? "Stealth on" : privacy.privacyMode}
        />
      </SettingsSection>

      <SettingsSection
        title="Beacon registry"
        description="Preview surface for future beacon participation."
      >
        <SettingsRow
          iconName="beacon"
          iconTone="amber"
          label="Beacon node"
          onPress={() => router.push("/settings/beacon" as Parameters<typeof router.push>[0])}
          showSeparator={false}
          sublabel="Role preview, stake intent, and earnings lane"
          value="Preview"
        />
      </SettingsSection>

      <SettingsSection
        title="Wallet safety"
        description="Export stays honest about local vs external custody."
      >
        <SettingsRow
          iconName="download-cloud"
          iconTone="green"
          label="Wallet export"
          onPress={() => router.push("/settings/wallet-export" as Parameters<typeof router.push>[0])}
          showSeparator={false}
          sublabel="Reveal private key only when local custody allows it"
          value={mode === "local" ? "Local" : mode === "mwa" ? "External" : "Fixture"}
        />
      </SettingsSection>

      <SettingsSection
        title="About"
        description="Version, runtime truth, and source links."
      >
        <SettingsRow
          iconName="info"
          iconTone="neutral"
          label="About AnonMesh"
          onPress={() => router.push("/settings/about" as Parameters<typeof router.push>[0])}
          showSeparator={false}
          sublabel="Recovery status and technology truth"
          value="v1.0.0"
        />
      </SettingsSection>
    </SettingsScaffold>
  );
}
