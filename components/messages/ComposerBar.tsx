import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { Feather } from "@expo/vector-icons";

import { AppTextInput } from "@/components/primitives/AppTextInput";
import { DepthButton } from "@/components/primitives/DepthButton";
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
    <View style={styles.bar}>
      <AppTextInput
        multiline
        placeholder="Message…"
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
            size={18}
            color={canSend ? theme.colors.textOnAccent : theme.colors.textMuted}
          />
        }
        style={styles.sendBtn}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    alignItems: "flex-end",
    borderTopColor: theme.colors.line,
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.background,
  },
  inputContainer: {
    flex: 1,
  },
  input: {
    minHeight: 44,
    maxHeight: 100,
    paddingVertical: theme.spacing.sm,
  },
  sendBtn: {
    marginBottom: theme.spacing.xxs,
  },
});
