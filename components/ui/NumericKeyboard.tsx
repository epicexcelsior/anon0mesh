import { VP } from "@/constants/void-protocol";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface NumericKeyboardProps {
  readonly onPress: (key: string) => void;
  readonly onBackspace: () => void;
  readonly onDone?: () => void;
  readonly showDoneButton?: boolean;
  readonly onPercentage?: (percentage: number) => void;
  readonly maxAmount?: number;
}

export default function NumericKeyboard({
  onPress,
  onBackspace,
  onDone,
  showDoneButton = true,
  onPercentage,
  maxAmount,
}: NumericKeyboardProps) {
  const keys = [
    ["1", "2", "3"],
    ["4", "5", "6"],
    ["7", "8", "9"],
    [".", "0", "back"],
  ];

  const percentages = [10, 20, 50, "MAX"];

  const renderPercentageButton = (value: number | string) => {
    const isMax = value === "MAX";
    const displayText = isMax ? "Max" : `${value}%`;

    return (
      <TouchableOpacity
        key={String(value)}
        style={styles.percentButton}
        onPress={() => {
          if (!onPercentage || !maxAmount) return;
          const percentage = isMax ? 100 : (value as number);
          onPercentage(percentage);
        }}
        activeOpacity={0.7}
      >
        <Text style={styles.percentText}>{displayText}</Text>
      </TouchableOpacity>
    );
  };

  const renderKey = (key: string) => {
    const isBackspace = key === "back";

    return (
      <TouchableOpacity
        key={key}
        style={styles.keyButton}
        onPress={() => {
          if (isBackspace) {
            onBackspace();
          } else {
            onPress(key);
          }
        }}
        activeOpacity={0.7}
      >
        <Text style={styles.keyText}>{isBackspace ? "\u232B" : key}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.mainLayout}>
        {/* Number Keys Grid */}
        <View style={styles.keysGrid}>
          {keys.map((row) => (
            <View key={row.join("-")} style={styles.row}>
              {row.map(renderKey)}
            </View>
          ))}
        </View>

        {/* Percentage Buttons Column */}
        {onPercentage && (
          <View style={styles.percentColumn}>
            {percentages.map(renderPercentageButton)}
          </View>
        )}
      </View>

      {showDoneButton && onDone && (
        <TouchableOpacity
          style={styles.doneButton}
          onPress={onDone}
          activeOpacity={0.8}
        >
          <Text style={styles.doneText}>Done</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 6,
    paddingBottom: 6,
  },
  mainLayout: {
    flexDirection: "row",
    gap: 10,
  },
  percentColumn: {
    justifyContent: "space-between",
    flex: 1,
    gap: 5,
  },
  percentButton: {
    flex: 1,
    minHeight: 42,
    borderRadius: VP.radius.sm,
    backgroundColor: VP.colors.accent.cyanMuted,
    justifyContent: "center",
    alignItems: "center",
  },
  percentText: {
    fontSize: 14,
    fontFamily: "SpaceGrotesk-Bold",
    color: VP.colors.accent.cyan,
  },
  keysGrid: {
    flex: 3,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  keyButton: {
    flex: 1,
    height: 42,
    marginHorizontal: 2,
    borderRadius: VP.radius.sm,
    borderWidth: 1,
    borderColor: VP.colors.accent.cyanMuted,
    backgroundColor: VP.colors.surface,
    justifyContent: "center",
    alignItems: "center",
  },
  keyText: {
    fontSize: 20,
    fontFamily: "SpaceGrotesk-SemiBold",
    color: VP.colors.text.primary,
  },
  doneButton: {
    borderRadius: VP.radius.sm,
    backgroundColor: VP.colors.accent.cyan,
    paddingVertical: 8,
    alignItems: "center",
    marginTop: 5,
  },
  doneText: {
    fontSize: 14,
    fontFamily: "SpaceGrotesk-Bold",
    color: VP.colors.text.inverse,
  },
});
