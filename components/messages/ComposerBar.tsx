import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";

import { AppTextInput } from "@/components/primitives/AppTextInput";
import { DepthButton } from "@/components/primitives/DepthButton";
import { GlassSurface } from "@/components/primitives/GlassSurface";
import { Pill } from "@/components/primitives/Pill";
import * as haptics from "@/src/design-system/haptics";
import * as sound from "@/src/design-system/sound";
import { appTheme as theme } from "@/src/design-system/theme";

interface ComposerBarProps {
  onSend: (text: string) => Promise<void>;
  sending: boolean;
}

export function ComposerBar({ onSend, sending }: ComposerBarProps) {
  const [text, setText] = useState("");

  const canSend = text.trim().length > 0 && !sending;

  async function handleSend() {
    const trimmed = text.trim();
    if (!trimmed) return;
    haptics.confirm();
    sound.buttonTap();
    setText("");
    await onSend(trimmed);
  }

  return (
    <View style={styles.wrap}>
      <GlassSurface style={styles.shell} variant="strong">
        <View style={styles.helperRow}>
          <Text style={styles.helperText}>
            {sending
              ? "Queueing on this device until the fixture thread settles."
              : "Private thread shell is live. Delivery remains fixture-backed here."}
          </Text>
          <Pill label={sending ? "Queueing" : "Private"} tone={sending ? "amber" : "cyan"} />
        </View>

        <View style={styles.bar}>
          <AppTextInput
            multiline
            placeholder="Write a private note..."
            value={text}
            onChangeText={setText}
            containerStyle={styles.inputContainer}
            style={styles.input}
          />
          <DepthButton
            variant="primary"
            tone="cyan"
            size="md"
            disabled={!canSend}
            onPress={handleSend}
            icon={
              <Feather
                name="send"
                size={16}
                color={canSend ? theme.colors.textOnAccent : theme.colors.textMuted}
              />
            }
            label="Send"
            style={styles.sendBtn}
          />
        </View>
      </GlassSurface>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.sm,
  },
  shell: {
    borderRadius: theme.radius.xl,
    gap: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
  },
  helperRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: theme.spacing.sm,
    justifyContent: "space-between",
  },
  helperText: {
    color: theme.colors.textSecondary,
    flex: 1,
    fontFamily: theme.fonts.body,
    fontSize: theme.type.caption,
    lineHeight: theme.type.caption * 1.5,
  },
  bar: {
    alignItems: "flex-end",
    flexDirection: "row",
    gap: theme.spacing.sm,
  },
  inputContainer: {
    flex: 1,
  },
  input: {
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderRadius: theme.radius.lg,
    maxHeight: 112,
    minHeight: 56,
    paddingTop: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    textAlignVertical: "top",
  },
  sendBtn: {
    minWidth: 108,
  },
});
