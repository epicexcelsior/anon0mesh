import { componentTokens } from "@/src/design-system/tokens/component";
import { foundationTokens } from "@/src/design-system/tokens/foundation";
import { motionTokens } from "@/src/design-system/tokens/motion";
import { semanticTokens } from "@/src/design-system/tokens/semantic";
import { stateTokens } from "@/src/design-system/tokens/state";

type TokenTier = "foundation" | "semantic" | "component" | "state" | "motion";
type PrimitiveTokenValue = boolean | number | string | readonly string[];

export type TokenPreviewKind =
  | "boolean"
  | "color"
  | "duration"
  | "font"
  | "gradient"
  | "measurement"
  | "ratio"
  | "text";

export interface DesignTokenEntry {
  description?: string;
  id: string;
  name: string;
  path: string[];
  preview: TokenPreviewKind;
  tier: TokenTier;
  value: PrimitiveTokenValue;
}

export interface DesignTokenSection {
  description: string;
  id: TokenTier;
  title: string;
  tokens: DesignTokenEntry[];
}

type TokenBranch = {
  [key: string]:
    | PrimitiveTokenValue
    | TokenBranch
    | { [key: string]: PrimitiveTokenValue | TokenBranch };
};

const TOKEN_DESCRIPTIONS: Record<string, string> = {
  "component.button.sizes.lg.minHeight":
    "Primary CTA height. Sets the baseline for the send action and major confirmations.",
  "component.nav.barHeight":
    "Total floating nav height used for tab clearance and bottom-sheet inset calculations.",
  "component.rows.list.minHeight":
    "Default selectable list row height for settings and utility surfaces.",
  "component.rows.identity.minHeight":
    "Trusted-peer row height for messages and recipient selection.",
  "component.slider.threshold":
    "Commit threshold for the send slider. Above this ratio the transfer confirms.",
  "foundation.radius.pill":
    "Full-pill radius used by nav pills, state pills, and compact chips.",
  "foundation.spacing.lg":
    "Primary horizontal padding rhythm across cards, rows, and the nav shell.",
  "foundation.type.heroXl":
    "The main amount size. The single loudest type moment in the workbench.",
  "motion.duration.standard":
    "Default transition duration for screen changes and section choreography.",
  "motion.press.compression.scale":
    "Rest-to-pressed scale used by morphic buttons and any touch surface matching that feel.",
  "semantic.colors.cyan":
    "Live/action accent for active states and primary action surfaces.",
  "semantic.colors.surfaceProofTop":
    "Top stop for proof-confidence modules so trust surfaces feel distinct from utility cards.",
  "semantic.shadow.nav.elevation":
    "Android nav elevation. Kept separate from the clipped inner blur shell.",
  "state.depth.bottomInset":
    "Bottom inner shadow that makes buttons read as extruded surfaces at rest.",
  "state.feedback.disabledOpacity":
    "Default alpha for intentionally disabled controls.",
};

function isPrimitive(value: unknown): value is PrimitiveTokenValue {
  return (
    typeof value === "boolean" ||
    typeof value === "number" ||
    typeof value === "string" ||
    (Array.isArray(value) && value.every((entry) => typeof entry === "string"))
  );
}

function inferPreview(path: string[], value: PrimitiveTokenValue): TokenPreviewKind {
  const joined = path.join(".").toLowerCase();

  if (typeof value === "boolean") {
    return "boolean";
  }

  if (Array.isArray(value)) {
    return "gradient";
  }

  if (typeof value === "number") {
    if (joined.includes("duration")) {
      return "duration";
    }
    if (
      joined.includes("threshold") ||
      joined.includes("magnet") ||
      joined.includes("resistance") ||
      joined.includes("scale") ||
      joined.includes("opacity") ||
      joined.includes("mass")
    ) {
      return "ratio";
    }
    return "measurement";
  }

  if (typeof value === "string") {
    if (
      value.startsWith("#") ||
      value.startsWith("rgb") ||
      value === "transparent"
    ) {
      return "color";
    }

    if (joined.includes("font")) {
      return "font";
    }

    if (joined.includes("easing")) {
      return "text";
    }
  }

  return "text";
}

function flattenTokenBranch(
  tier: TokenTier,
  branch: TokenBranch,
  path: string[] = [],
): DesignTokenEntry[] {
  return Object.entries(branch)
    .flatMap(([key, value]) => {
      const nextPath = [...path, key];

      if (isPrimitive(value)) {
        const id = `${tier}.${nextPath.join(".")}`;

        return [
          {
            description: TOKEN_DESCRIPTIONS[id],
            id,
            name: key,
            path: nextPath,
            preview: inferPreview(nextPath, value),
            tier,
            value,
          } satisfies DesignTokenEntry,
        ];
      }

      return flattenTokenBranch(tier, value as TokenBranch, nextPath);
    })
    .sort((left, right) => left.id.localeCompare(right.id));
}

export const designSystemTokens = {
  foundation: foundationTokens,
  semantic: semanticTokens,
  component: componentTokens,
  state: stateTokens,
  motion: motionTokens,
} as const;

const motionCatalogTokens = {
  easing: {
    standard: "cubic-bezier(0.2, 0.9, 0.24, 1)",
    emphasis: "cubic-bezier(0.16, 1, 0.3, 1)",
    exit: "cubic-bezier(0.4, 0, 0.68, 1)",
  },
  duration: motionTokens.duration,
  press: motionTokens.press,
  spring: motionTokens.spring,
  travel: motionTokens.travel,
} as const;

export const designTokenSections: DesignTokenSection[] = [
  {
    id: "foundation",
    title: "Foundation",
    description: "Raw scales for spacing, radius, typography, fonts, and palette.",
    tokens: flattenTokenBranch("foundation", foundationTokens as TokenBranch),
  },
  {
    id: "semantic",
    title: "Semantic",
    description: "Intent-bearing colors and shadow roles used throughout the workbench.",
    tokens: flattenTokenBranch("semantic", semanticTokens as TokenBranch),
  },
  {
    id: "component",
    title: "Component",
    description: "Geometry, gradients, and recipe values for concrete UI building blocks.",
    tokens: flattenTokenBranch("component", componentTokens as TokenBranch),
  },
  {
    id: "state",
    title: "State",
    description: "Pressed, disabled, and depth-feedback values that control tactile feel.",
    tokens: flattenTokenBranch("state", stateTokens as TokenBranch),
  },
  {
    id: "motion",
    title: "Motion",
    description: "Durations, springs, and travel distances that define the app's timing language.",
    tokens: flattenTokenBranch("motion", motionCatalogTokens as TokenBranch),
  },
];

export type DesignSystemTokens = typeof designSystemTokens;
