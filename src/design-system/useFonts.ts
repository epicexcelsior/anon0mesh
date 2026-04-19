import { useFonts as useExpoFonts } from "expo-font";

export function useFonts() {
  const [loaded, error] = useExpoFonts({
    "Manrope-Light": require("@/components/fonts/Manrope/static/Manrope-Light.otf"),
    "Manrope-Regular": require("@/components/fonts/Manrope/static/Manrope-Regular.otf"),
    "Manrope-Medium": require("@/components/fonts/Manrope/static/Manrope-Medium.otf"),
    "Manrope-SemiBold": require("@/components/fonts/Manrope/static/Manrope-SemiBold.otf"),
    "Manrope-Bold": require("@/components/fonts/Manrope/static/Manrope-Bold.otf"),
    "SpaceGrotesk-Light": require("@/components/fonts/Space_Grotesk/static/SpaceGrotesk-Light.ttf"),
    "SpaceGrotesk-Regular": require("@/components/fonts/Space_Grotesk/static/SpaceGrotesk-Regular.ttf"),
    "SpaceGrotesk-Medium": require("@/components/fonts/Space_Grotesk/static/SpaceGrotesk-Medium.ttf"),
    "SpaceGrotesk-SemiBold": require("@/components/fonts/Space_Grotesk/static/SpaceGrotesk-SemiBold.ttf"),
    "SpaceGrotesk-Bold": require("@/components/fonts/Space_Grotesk/static/SpaceGrotesk-Bold.ttf"),
    "JetBrainsMono-Regular": require("@/components/fonts/JetBrainsMono-Regular.ttf"),
    "JetBrainsMono-Medium": require("@/components/fonts/JetBrainsMono-Medium.ttf"),
  });

  return { loaded, error };
}
