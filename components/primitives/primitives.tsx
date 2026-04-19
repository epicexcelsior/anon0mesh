import { LinearGradient } from "expo-linear-gradient";
import * as haptics from "@/src/design-system/haptics";
import * as sound from "@/src/design-system/sound";
import React, { useEffect } from "react";
import {
  StyleProp,
  StyleSheet,
  Switch,
  Text,
  View,
  ViewStyle,
} from "react-native";
import { Pressable } from "react-native-gesture-handler";
import Animated, {
  Easing,
  FadeIn,
  LinearTransition,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

import { appMotion } from "@/src/design-system/motion";
import { appTheme as theme } from "@/src/design-system/theme";

type ListIconTone = "cyan" | "amber" | "green" | "red" | "purple" | "neutral";

const TONE_BG: Record<ListIconTone, string> = {
  cyan: theme.colors.cyanSoft,
  amber: theme.colors.amberSoft,
  green: theme.colors.greenSoft,
  red: theme.colors.redSoft,
  purple: theme.colors.purpleSoft,
  neutral: "rgba(255, 255, 255, 0.06)",
};

const TONE_FG: Record<ListIconTone, string> = {
  cyan: theme.colors.cyan,
  amber: theme.colors.amber,
  green: theme.colors.green,
  red: theme.colors.red,
  purple: theme.colors.purple,
  neutral: theme.colors.textPrimary,
};

const TONE_BORDER: Record<ListIconTone, string> = {
  cyan: "rgba(0, 218, 243, 0.18)",
  amber: "rgba(255, 191, 0, 0.2)",
  green: "rgba(60, 227, 106, 0.2)",
  red: "rgba(204, 102, 102, 0.22)",
  purple: "rgba(139, 95, 191, 0.24)",
  neutral: "rgba(255, 255, 255, 0.08)",
};

const SURFACE_GRADIENTS = {
  cyan: theme.component.surface.gradients.cyan,
  default: theme.component.surface.gradients.default,
  proof: theme.component.surface.gradients.proof,
  soft: theme.component.surface.gradients.soft,
  success: theme.component.surface.gradients.success,
} as const;

export function AnimatedSection({
  children,
  delay = 0,
  style,
}: {
  children: React.ReactNode;
  delay?: number;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Animated.View
      entering={FadeIn.duration(appMotion.duration.standard)
        .delay(delay)
        .easing(appMotion.easing.standard)
        .withInitialValues({
          opacity: 0,
          transform: [{ translateY: appMotion.travel.section }],
        })}
      layout={LinearTransition.duration(appMotion.duration.standard).easing(
        appMotion.easing.standard,
      )}
      style={style}
    >
      {children}
    </Animated.View>
  );
}

export function SurfaceCard({
  accent = "default",
  children,
  style,
}: {
  accent?: "default" | "cyan" | "proof" | "soft" | "success";
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <LinearGradient
      colors={SURFACE_GRADIENTS[accent]}
      end={{ x: 0.92, y: 1 }}
      start={{ x: 0.08, y: 0 }}
      style={[
        styles.surfaceCardBase,
        accent === "cyan" && styles.surfaceCardCyan,
        accent === "proof" && styles.surfaceCardProof,
        accent === "soft" && styles.surfaceCardSoft,
        accent === "success" && styles.surfaceCardSuccess,
        style,
      ]}
    >
      <View style={styles.surfaceCardHighlight} />
      {children}
    </LinearGradient>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  trailing,
}: {
  eyebrow?: string;
  title: string;
  trailing?: React.ReactNode;
}) {
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionCopy}>
        {eyebrow ? <Text style={styles.sectionEyebrow}>{eyebrow}</Text> : null}
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {trailing}
    </View>
  );
}

export function MetricPill({
  children,
  tone = "default",
}: {
  children: React.ReactNode;
  tone?: "default" | "cyan" | "amber" | "green";
}) {
  return (
    <View
      style={[
        styles.metricPill,
        tone === "cyan" && styles.metricPillCyan,
        tone === "amber" && styles.metricPillAmber,
        tone === "green" && styles.metricPillGreen,
      ]}
    >
      {children}
    </View>
  );
}

export function InfoRow({
  detail,
  leading,
  title,
  trailing,
}: {
  detail: string;
  leading?: React.ReactNode;
  title: string;
  trailing?: React.ReactNode;
}) {
  return (
    <View style={styles.infoRow}>
      {leading ? <View style={styles.infoLeading}>{leading}</View> : null}
      <View style={styles.infoCopy}>
        <Text style={styles.infoTitle}>{title}</Text>
        <Text style={styles.infoDetail}>{detail}</Text>
      </View>
      {trailing ? <View style={styles.infoTrailing}>{trailing}</View> : null}
    </View>
  );
}

export function PrimaryActionButton({
  icon,
  label,
  onPress,
}: {
  icon?: React.ReactNode;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={() => {
        haptics.tap();
        onPress();
      }}
      style={({ pressed }) => [styles.primaryButton, pressed && styles.buttonPressed]}
    >
      <LinearGradient
        colors={[theme.colors.cyanAccent, theme.colors.cyan]}
        end={{ x: 1, y: 1 }}
        start={{ x: 0, y: 0 }}
        style={styles.primaryButtonFill}
      >
        {icon}
        <Text style={styles.primaryButtonText}>{label}</Text>
      </LinearGradient>
    </Pressable>
  );
}

export function ListGroup({
  children,
  label,
  style,
}: {
  children: React.ReactNode;
  label?: string;
  style?: StyleProp<ViewStyle>;
}) {
  const items = React.Children.toArray(children).filter(Boolean);

  return (
    <View style={[styles.listGroupWrap, style]}>
      {label ? <Text style={styles.listGroupLabel}>{label}</Text> : null}
      <LinearGradient
        colors={[theme.colors.surfaceListTop, theme.colors.surfaceListBottom]}
        end={{ x: 0.92, y: 1 }}
        start={{ x: 0.08, y: 0 }}
        style={styles.listGroupCard}
      >
        <View style={styles.listGroupHighlight} />
        {items.map((child, index) => (
          <View key={index}>
            {child}
            {index < items.length - 1 ? (
              <View style={styles.listDivider} />
            ) : null}
          </View>
        ))}
      </LinearGradient>
    </View>
  );
}

export function ListRow({
  iconBackground,
  iconColor,
  iconNode,
  iconTone = "neutral",
  onPress,
  subtitle,
  title,
  trailing,
}: {
  iconBackground?: string;
  iconColor?: string;
  iconNode: (color: string, size: number) => React.ReactNode;
  iconTone?: ListIconTone;
  onPress?: () => void;
  subtitle?: string;
  title: string;
  trailing?: React.ReactNode;
}) {
  const bg = iconBackground ?? TONE_BG[iconTone];
  const fg = iconColor ?? TONE_FG[iconTone];

  const inner = (
    <View style={styles.listRow}>
      <View style={[styles.listRowIcon, { backgroundColor: bg }]}>
        {iconNode(fg, 18)}
      </View>
      <View style={styles.listRowCopy}>
        <Text style={styles.listRowTitle}>{title}</Text>
        {subtitle ? (
          <Text numberOfLines={2} style={styles.listRowSubtitle}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {trailing ? <View style={styles.listRowTrailing}>{trailing}</View> : null}
    </View>
  );

  if (!onPress) {
    return inner;
  }

  return (
    <Pressable
      android_ripple={{ color: "rgba(255,255,255,0.04)" }}
      onPress={
        onPress
          ? () => {
              haptics.tap();
              onPress();
            }
          : undefined
      }
      style={({ pressed }) => [pressed && styles.listRowPressed]}
    >
      {inner}
    </Pressable>
  );
}

export function ListToggleRow({
  iconNode,
  iconTone = "purple",
  onValueChange,
  subtitle,
  title,
  value,
}: {
  iconNode: (color: string, size: number) => React.ReactNode;
  iconTone?: ListIconTone;
  onValueChange: (next: boolean) => void;
  subtitle?: string;
  title: string;
  value: boolean;
}) {
  const bg = TONE_BG[iconTone];
  const fg = TONE_FG[iconTone];

  return (
    <View style={styles.listRow}>
      <View style={[styles.listRowIcon, { backgroundColor: bg }]}>
        {iconNode(fg, 18)}
      </View>
      <View style={styles.listRowCopy}>
        <Text style={styles.listRowTitle}>{title}</Text>
        {subtitle ? (
          <Text numberOfLines={2} style={styles.listRowSubtitle}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      <Switch
        ios_backgroundColor={theme.colors.surfaceContainerHigh}
        onValueChange={(next) => {
          haptics.tap();
          if (next) sound.toggleOn();
          else sound.toggleOff();
          onValueChange(next);
        }}
        thumbColor={value ? theme.colors.cyan : theme.colors.onSurfaceVariant}
        trackColor={{
          false: theme.colors.surfaceContainerHigh,
          true: theme.colors.cyanGlow,
        }}
        value={value}
      />
    </View>
  );
}

export function CountBadge({
  tone = "cyan",
  value,
}: {
  tone?: ListIconTone;
  value: number | string;
}) {
  return (
    <View style={[styles.countBadge, { backgroundColor: TONE_FG[tone] }]}>
      <Text style={styles.countBadgeText}>{value}</Text>
    </View>
  );
}

export function StatePill({
  label,
  tone = "neutral",
}: {
  label: string;
  tone?: ListIconTone;
}) {
  return (
    <View
      style={[
        styles.statePill,
        {
          backgroundColor: TONE_BG[tone],
          borderColor: TONE_BORDER[tone],
        },
      ]}
    >
      <Text style={[styles.statePillText, { color: TONE_FG[tone] }]}>
        {label}
      </Text>
    </View>
  );
}

export function IdentityRow({
  accessory,
  avatarLabel,
  avatarTone = "cyan",
  detail,
  detailLines = 1,
  meta,
  onPress,
  online = false,
  surfaceColor = theme.colors.surfaceMuted,
  title,
}: {
  accessory?: React.ReactNode;
  avatarLabel: string;
  avatarTone?: ListIconTone;
  detail?: string;
  detailLines?: number;
  meta?: string;
  onPress?: () => void;
  online?: boolean;
  surfaceColor?: string;
  title: string;
}) {
  const inner = (
    <View style={styles.identityRow}>
      <View style={[styles.identityAvatar, { backgroundColor: TONE_BG[avatarTone] }]}>
        <Text style={styles.identityAvatarText}>{avatarLabel}</Text>
        {online ? (
          <View
            style={[
              styles.identityPresenceDot,
              { borderColor: surfaceColor },
            ]}
          />
        ) : null}
      </View>
      <View style={styles.identityCopy}>
        <Text numberOfLines={1} style={styles.identityTitle}>
          {title}
        </Text>
        {detail ? (
          <Text numberOfLines={detailLines} style={styles.identityDetail}>
            {detail}
          </Text>
        ) : null}
      </View>
      {meta || accessory ? (
        <View style={styles.identityTrailing}>
          {meta ? (
            <Text numberOfLines={1} style={styles.identityMeta}>
              {meta}
            </Text>
          ) : null}
          {accessory ? <View style={styles.identityAccessory}>{accessory}</View> : null}
        </View>
      ) : null}
    </View>
  );

  if (!onPress) {
    return inner;
  }

  return (
    <Pressable
      android_ripple={{ color: "rgba(255,255,255,0.04)" }}
      onPress={() => {
        haptics.tap();
        onPress();
      }}
      style={({ pressed }) => [pressed && styles.listRowPressed]}
    >
      {inner}
    </Pressable>
  );
}

export function ActivityRow({
  amount,
  amountTone = "neutral",
  detail,
  iconNode,
  iconTone = "neutral",
  meta,
  onLongPress,
  onPress,
  title,
}: {
  amount: string;
  amountTone?: ListIconTone;
  detail: string;
  iconNode: (color: string, size: number) => React.ReactNode;
  iconTone?: ListIconTone;
  meta?: string;
  onLongPress?: () => void;
  onPress?: () => void;
  title: string;
}) {
  const inner = (
    <View style={styles.activityRow}>
      <View style={[styles.activityIcon, { backgroundColor: TONE_BG[iconTone] }]}>
        {iconNode(TONE_FG[iconTone], 16)}
      </View>
      <View style={styles.activityCopy}>
        <Text numberOfLines={1} style={styles.activityTitle}>
          {title}
        </Text>
        <Text numberOfLines={2} style={styles.activityDetail}>
          {detail}
        </Text>
      </View>
      <View style={styles.activityTrailing}>
        <Text numberOfLines={1} style={[styles.activityAmount, { color: TONE_FG[amountTone] }]}>
          {amount}
        </Text>
        {meta ? (
          <Text numberOfLines={1} style={styles.activityMeta}>
            {meta}
          </Text>
        ) : null}
      </View>
    </View>
  );

  if (!onPress && !onLongPress) {
    return inner;
  }

  return (
    <Pressable
      android_ripple={{ color: "rgba(255,255,255,0.04)" }}
      onLongPress={onLongPress}
      onPress={
        onPress
          ? () => {
              haptics.tap();
              onPress();
            }
          : undefined
      }
      style={({ pressed }) => [pressed && styles.listRowPressed]}
    >
      {inner}
    </Pressable>
  );
}

export function SecondaryActionButton({
  icon,
  label,
  onPress,
}: {
  icon?: React.ReactNode;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={() => {
        haptics.tap();
        onPress();
      }}
      style={({ pressed }) => [styles.secondaryButton, pressed && styles.buttonPressed]}
    >
      {icon}
      <Text style={styles.secondaryButtonText}>{label}</Text>
    </Pressable>
  );
}

// ---------------------------------------------------------------------------
// Skeleton shimmer primitives
// ---------------------------------------------------------------------------

function useShimmer() {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [progress]);

  return progress;
}

export function SkeletonRect({
  height = 16,
  radius = theme.radius.sm,
  style,
  width,
}: {
  height?: number;
  radius?: number;
  style?: StyleProp<ViewStyle>;
  width?: number | `${number}%`;
}) {
  const shimmer = useShimmer();

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: 0.4 + shimmer.value * 0.25,
  }));

  return (
    <Animated.View
      style={[
        {
          backgroundColor: theme.colors.surfaceElevated,
          borderRadius: radius,
          height,
          width: width ?? "100%",
        },
        animatedStyle,
        style,
      ]}
    />
  );
}

export function SkeletonCircle({
  size = 36,
  style,
}: {
  size?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const shimmer = useShimmer();

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: 0.4 + shimmer.value * 0.25,
  }));

  return (
    <Animated.View
      style={[
        {
          backgroundColor: theme.colors.surfaceElevated,
          borderRadius: size / 2,
          height: size,
          width: size,
        },
        animatedStyle,
        style,
      ]}
    />
  );
}

export function SkeletonRow({ style }: { style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[styles.skeletonRow, style]}>
      <SkeletonCircle size={36} />
      <View style={styles.skeletonRowCopy}>
        <SkeletonRect height={14} width="60%" />
        <SkeletonRect height={11} width="40%" />
      </View>
      <SkeletonRect height={14} width={64} />
    </View>
  );
}

export function SkeletonHero({ style }: { style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[styles.skeletonHero, style]}>
      <SkeletonRect height={12} width={80} />
      <SkeletonRect height={48} width="55%" radius={theme.radius.md} />
      <SkeletonRect height={14} width={120} />
    </View>
  );
}

export function EmptyState({
  action,
  body,
  icon,
  onAction,
  title,
}: {
  action?: string;
  body: string;
  icon: React.ReactNode;
  onAction?: () => void;
  title: string;
}) {
  return (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconWrap}>{icon}</View>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyBody}>{body}</Text>
      {action && onAction ? (
        <Pressable
          onPress={() => {
            haptics.tap();
            onAction();
          }}
          style={({ pressed }) => [
            styles.emptyAction,
            pressed && styles.buttonPressed,
          ]}
        >
          <Text style={styles.emptyActionText}>{action}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function ErrorState({
  body,
  onRetry,
  title = "Something went wrong",
}: {
  body?: string;
  onRetry?: () => void;
  title?: string;
}) {
  return (
    <View style={styles.emptyState}>
      <View style={[styles.emptyIconWrap, styles.errorIconWrap]}>
        <Text style={styles.errorIcon}>!</Text>
      </View>
      <Text style={styles.emptyTitle}>{title}</Text>
      {body ? <Text style={styles.emptyBody}>{body}</Text> : null}
      {onRetry ? (
        <Pressable
          onPress={() => {
            haptics.tap();
            onRetry();
          }}
          style={({ pressed }) => [
            styles.emptyAction,
            pressed && styles.buttonPressed,
          ]}
        >
          <Text style={styles.emptyActionText}>Try again</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  surfaceCard: {
    backgroundColor: theme.colors.surface,
  },
  surfaceCardBase: {
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    overflow: "hidden",
    padding: theme.spacing.xl,
    position: "relative",
    ...theme.shadow.soft,
  },
  surfaceCardHighlight: {
    backgroundColor: theme.depth.restHighlight,
    height: 1,
    left: theme.spacing.lg,
    position: "absolute",
    right: theme.spacing.lg,
    top: 0,
  },
  surfaceCardCyan: {
    borderColor: "rgba(0, 218, 243, 0.16)",
  },
  surfaceCardProof: {
    borderColor: "rgba(0, 218, 243, 0.14)",
  },
  surfaceCardSoft: {
    borderColor: theme.colors.line,
  },
  surfaceCardSuccess: {
    borderColor: "rgba(60, 227, 106, 0.16)",
  },
  sectionHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  sectionCopy: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  sectionEyebrow: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.bodyMedium,
    fontSize: theme.type.caption,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  sectionTitle: {
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.heading,
    fontSize: theme.type.section,
  },
  metricPill: {
    alignItems: "center",
    backgroundColor: theme.colors.surfaceElevated,
    borderColor: theme.colors.lineStrong,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    flexDirection: "row",
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  metricPillCyan: {
    backgroundColor: theme.colors.cyanSoft,
    borderColor: "rgba(0, 218, 243, 0.18)",
  },
  metricPillAmber: {
    backgroundColor: theme.colors.amberSoft,
    borderColor: "rgba(255, 191, 0, 0.2)",
  },
  metricPillGreen: {
    backgroundColor: theme.colors.greenSoft,
    borderColor: "rgba(60, 227, 106, 0.2)",
  },
  infoRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: theme.spacing.md,
    minHeight: theme.component.rows.info.minHeight,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  infoLeading: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 2,
  },
  infoCopy: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  infoTitle: {
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.bodyMedium,
    fontSize: theme.type.body,
  },
  infoDetail: {
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.body,
    fontSize: theme.type.caption,
    lineHeight: 20,
  },
  infoTrailing: {
    alignItems: "flex-end",
    justifyContent: "center",
  },
  buttonPressed: {
    opacity: theme.feedback.buttonPressedOpacity,
    transform: [
      { scale: appMotion.press.compression.scale },
      { translateY: appMotion.press.compression.translateY },
    ],
  },
  primaryButton: {
    borderRadius: theme.radius.md,
    overflow: "hidden",
  },
  primaryButtonFill: {
    alignItems: "center",
    borderColor: "rgba(255, 255, 255, 0.08)",
    borderWidth: 1,
    flexDirection: "row",
    gap: theme.spacing.sm,
    justifyContent: "center",
    minHeight: 56,
    paddingHorizontal: theme.spacing.xl,
  },
  primaryButtonText: {
    color: theme.colors.background,
    fontFamily: theme.fonts.bodyMedium,
    fontSize: theme.type.bodyLg,
  },
  secondaryButton: {
    alignItems: "center",
    backgroundColor: theme.colors.backgroundRaised,
    borderColor: theme.colors.lineStrong,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    flexDirection: "row",
    gap: theme.spacing.sm,
    justifyContent: "center",
    minHeight: 56,
    paddingHorizontal: theme.spacing.lg,
  },
  secondaryButtonText: {
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.bodyMedium,
    fontSize: theme.type.body,
  },
  countBadge: {
    alignItems: "center",
    borderRadius: theme.radius.pill,
    minHeight: theme.component.rows.badge.minHeight,
    justifyContent: "center",
    minWidth: theme.component.rows.badge.minWidth,
    paddingHorizontal: theme.spacing.xs,
  },
  countBadgeText: {
    color: theme.colors.textOnAccent,
    fontFamily: theme.fonts.bodyMedium,
    fontSize: theme.type.caption,
  },
  statePill: {
    alignItems: "center",
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: theme.component.rows.statePill.minHeight,
    paddingHorizontal: theme.spacing.sm,
  },
  statePillText: {
    fontFamily: theme.fonts.bodyMedium,
    fontSize: theme.type.micro,
    letterSpacing: 0.2,
  },
  identityRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: theme.spacing.md,
    minHeight: theme.component.rows.identity.minHeight,
    paddingHorizontal: theme.component.rows.identity.paddingX,
    paddingVertical: theme.component.rows.identity.paddingY,
  },
  identityAvatar: {
    alignItems: "center",
    borderRadius: theme.radius.md,
    borderColor: "rgba(255, 255, 255, 0.06)",
    borderWidth: 1,
    height: theme.component.rows.identity.avatarSize,
    justifyContent: "center",
    position: "relative",
    width: theme.component.rows.identity.avatarSize,
  },
  identityAvatarText: {
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.bodyMedium,
    fontSize: theme.type.body,
  },
  identityPresenceDot: {
    backgroundColor: theme.colors.green,
    borderRadius: 6,
    borderWidth: 2,
    bottom: -2,
    height: theme.component.rows.identity.presenceDotSize,
    position: "absolute",
    right: -2,
    width: theme.component.rows.identity.presenceDotSize,
  },
  identityCopy: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  identityTitle: {
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.bodyMedium,
    fontSize: theme.type.bodyLg,
  },
  identityDetail: {
    color: theme.colors.textTertiary,
    fontFamily: theme.fonts.body,
    fontSize: theme.type.body,
    lineHeight: 19,
  },
  identityTrailing: {
    alignItems: "flex-end",
    gap: theme.spacing.xs,
    justifyContent: "center",
    minWidth: theme.component.rows.identity.trailingMinWidth,
  },
  identityMeta: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.body,
    fontSize: theme.type.caption,
  },
  identityAccessory: {
    alignItems: "flex-end",
  },
  listGroupWrap: {
    gap: theme.spacing.sm,
  },
  listGroupLabel: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.bodyMedium,
    fontSize: theme.type.caption,
    letterSpacing: 0.45,
    paddingHorizontal: theme.spacing.xs,
    textTransform: "uppercase",
  },
  listGroupCard: {
    borderColor: theme.colors.line,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    overflow: "hidden",
    position: "relative",
  },
  listGroupHighlight: {
    backgroundColor: theme.depth.restHighlight,
    height: 1,
    left: theme.spacing.lg,
    position: "absolute",
    right: theme.spacing.lg,
    top: 0,
  },
  listDivider: {
    backgroundColor: theme.colors.hairline,
    height: 1,
    marginLeft: theme.component.rows.list.dividerInset,
  },
  listRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: theme.spacing.md,
    minHeight: theme.component.rows.list.minHeight,
    paddingHorizontal: theme.component.rows.list.paddingX,
    paddingVertical: theme.component.rows.list.paddingY,
  },
  listRowPressed: {
    backgroundColor: theme.feedback.listPressedWash,
  },
  listRowIcon: {
    alignItems: "center",
    borderRadius: theme.radius.pill,
    height: theme.component.rows.list.iconSize,
    justifyContent: "center",
    width: theme.component.rows.list.iconSize,
  },
  listRowCopy: {
    flex: 1,
    gap: 2,
  },
  listRowTitle: {
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.bodyMedium,
    fontSize: theme.type.bodyLg,
  },
  listRowSubtitle: {
    color: theme.colors.textTertiary,
    fontFamily: theme.fonts.body,
    fontSize: theme.type.caption,
    lineHeight: 18,
  },
  listRowTrailing: {
    alignItems: "flex-end",
    flexDirection: "row",
    gap: theme.spacing.xs,
  },
  activityRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: theme.spacing.md,
    minHeight: theme.component.rows.activity.minHeight,
    paddingHorizontal: theme.component.rows.activity.paddingX,
    paddingVertical: theme.component.rows.activity.paddingY,
  },
  activityIcon: {
    alignItems: "center",
    borderRadius: theme.radius.pill,
    height: theme.component.rows.activity.iconSize,
    justifyContent: "center",
    width: theme.component.rows.activity.iconSize,
  },
  activityCopy: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  activityTitle: {
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.bodyMedium,
    fontSize: theme.type.body,
  },
  activityDetail: {
    color: theme.colors.textTertiary,
    fontFamily: theme.fonts.body,
    fontSize: theme.type.caption,
    lineHeight: 18,
  },
  activityTrailing: {
    alignItems: "flex-end",
    gap: 2,
    justifyContent: "center",
    minWidth: theme.component.rows.activity.trailingMinWidth,
  },
  activityAmount: {
    fontFamily: theme.fonts.bodyMedium,
    fontSize: theme.type.body,
  },
  activityMeta: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.body,
    fontSize: theme.type.caption,
  },
  skeletonRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: theme.spacing.md,
    minHeight: theme.component.rows.list.minHeight,
    paddingHorizontal: theme.component.rows.list.paddingX,
    paddingVertical: theme.component.rows.list.paddingY,
  },
  skeletonRowCopy: {
    flex: 1,
    gap: theme.spacing.sm,
  },
  skeletonHero: {
    alignItems: "center",
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.xxl,
  },
  emptyState: {
    alignItems: "center",
    gap: theme.spacing.md,
    paddingHorizontal: theme.spacing.xxl,
    paddingVertical: theme.spacing.huge,
  },
  emptyIconWrap: {
    alignItems: "center",
    backgroundColor: theme.colors.surfaceMuted,
    borderColor: theme.colors.line,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    height: 56,
    justifyContent: "center",
    marginBottom: theme.spacing.sm,
    width: 56,
  },
  errorIconWrap: {
    backgroundColor: theme.colors.errorContainer,
    borderColor: theme.colors.errorOutline,
  },
  errorIcon: {
    color: theme.colors.red,
    fontFamily: theme.fonts.headingBold,
    fontSize: theme.type.title,
  },
  emptyTitle: {
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.heading,
    fontSize: theme.type.bodyLg,
    textAlign: "center",
  },
  emptyBody: {
    color: theme.colors.textTertiary,
    fontFamily: theme.fonts.body,
    fontSize: theme.type.body,
    lineHeight: 22,
    textAlign: "center",
  },
  emptyAction: {
    backgroundColor: theme.colors.surfaceMuted,
    borderColor: theme.colors.lineStrong,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    marginTop: theme.spacing.sm,
    minHeight: 44,
    justifyContent: "center",
    paddingHorizontal: theme.spacing.xl,
  },
  emptyActionText: {
    color: theme.colors.cyan,
    fontFamily: theme.fonts.bodyMedium,
    fontSize: theme.type.body,
  },
});
