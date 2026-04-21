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
      subtitle="Tune identity, transport, privacy defaults, wallet safety, and branch runtime truth from one authored surface."
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
        description="Local label, alias, QR, and address tools. Wallet identity stays key-derived on this branch."
      >
        <SettingsRow
          iconName="identity-chip"
          iconTone="cyan"
          label="Identity tools"
          onPress={() => router.push("/settings/identity" as Parameters<typeof router.push>[0])}
          showSeparator={false}
          sublabel="Local label, alias, QR card, and address copy surface"
          value={displayName}
        />
      </SettingsSection>

      <SettingsSection
        title="Mesh transport"
        description="BLE controls are live. LXMF mode persists locally while native runtime remains staged."
      >
        <SettingsRow
          iconName="radio"
          iconTone="cyan"
          label="Network"
          onPress={() => router.push("/settings/network" as Parameters<typeof router.push>[0])}
          showSeparator={false}
          sublabel={`${nodeCount} ${nodeCount === 1 ? "peer" : "peers"} visible · direct BLE seam`}
          value={connectionState}
        />
      </SettingsSection>

      <SettingsSection
        title="Privacy defaults"
        description="Preferences save on this device now and seed send-flow choices without overclaiming full stealth settlement."
      >
        <SettingsRow
          iconName="shield"
          iconTone="purple"
          label="Privacy & Stealth"
          onPress={() => router.push("/settings/privacy" as Parameters<typeof router.push>[0])}
          showSeparator={false}
          sublabel="Stealth default, transfer privacy lane, and key rotation cadence"
          value={privacy.stealthByDefault ? "Stealth on" : privacy.privacyMode}
        />
      </SettingsSection>

      <SettingsSection
        title="Beacon registry"
        description="Preview surface for beacon participation. Runtime and staking path stay clearly marked as placeholder."
      >
        <SettingsRow
          iconName="beacon"
          iconTone="amber"
          label="Beacon node"
          onPress={() => router.push("/settings/beacon" as Parameters<typeof router.push>[0])}
          showSeparator={false}
          sublabel="Role preview, stake intent, and future earnings lane"
          value="Preview"
        />
      </SettingsSection>

      <SettingsSection
        title="Wallet safety"
        description="Export surface stays honest about local vs external custody and biometric requirements."
      >
        <SettingsRow
          iconName="download-cloud"
          iconTone="green"
          label="Wallet export"
          onPress={() => router.push("/settings/wallet-export" as Parameters<typeof router.push>[0])}
          showSeparator={false}
          sublabel="Reveal private key only when local custody and device auth allow it"
          value={mode === "local" ? "Local" : mode === "mwa" ? "External" : "Fixture"}
        />
      </SettingsSection>

      <SettingsSection
        title="About"
        description="Branch version, live-vs-staged runtime summary, repo links, and license surface."
      >
        <SettingsRow
          iconName="info"
          iconTone="neutral"
          label="About AnonMesh"
          onPress={() => router.push("/settings/about" as Parameters<typeof router.push>[0])}
          showSeparator={false}
          sublabel="Recovery lane status, source links, and technology truth"
          value="v1.0.0"
        />
      </SettingsSection>
    </SettingsScaffold>
  );
}
