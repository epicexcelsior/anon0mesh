import type { AudioPlayer } from "expo-audio";
import { useEffect } from "react";
import { AppState, type AppStateStatus } from "react-native";

import { soundCatalog, type SoundEvent } from "@/src/design-system/soundCatalog";

type ExpoAudioModule = Pick<
  typeof import("expo-audio"),
  "createAudioPlayer" | "setAudioModeAsync" | "setIsAudioActiveAsync"
>;

let muted = false;
let mountedSessions = 0;
let audioActive = false;
let audioModePromise: Promise<void> | null = null;
let appStateSubscription: ReturnType<typeof AppState.addEventListener> | null = null;
let audioModule: ExpoAudioModule | null = null;
let audioModulePromise: Promise<ExpoAudioModule | null> | null = null;
let audioModuleUnavailable = false;

const players = new Map<SoundEvent, AudioPlayer>();

async function loadAudioModule() {
  if (audioModule) return audioModule;
  if (audioModuleUnavailable) return null;

  if (!audioModulePromise) {
    audioModulePromise = import("expo-audio")
      .then((module) => {
        if (
          typeof module.createAudioPlayer !== "function" ||
          typeof module.setAudioModeAsync !== "function" ||
          typeof module.setIsAudioActiveAsync !== "function"
        ) {
          audioModuleUnavailable = true;
          return null;
        }
        audioModule = {
          createAudioPlayer: module.createAudioPlayer,
          setAudioModeAsync: module.setAudioModeAsync,
          setIsAudioActiveAsync: module.setIsAudioActiveAsync,
        };
        return audioModule;
      })
      .catch(() => {
        audioModuleUnavailable = true;
        return null;
      });
  }

  return audioModulePromise;
}

function hasConfiguredSounds() {
  return Object.values(soundCatalog).some((d) => Boolean(d.source));
}

function syncAudioActivity(nextState: AppStateStatus) {
  if (!hasConfiguredSounds()) return;

  const shouldBeActive = !muted && nextState === "active";
  if (audioActive === shouldBeActive) return;

  audioActive = shouldBeActive;
  if (audioModule) {
    void audioModule.setIsAudioActiveAsync(shouldBeActive).catch(() => undefined);
    return;
  }

  void loadAudioModule().then((m) =>
    m?.setIsAudioActiveAsync(shouldBeActive).catch(() => undefined),
  );
}

function ensurePlayer(event: SoundEvent) {
  const existing = players.get(event);
  if (existing) return existing;

  const definition = soundCatalog[event];
  if (!definition.source || !audioModule) return null;

  const player = audioModule.createAudioPlayer(definition.source, {
    downloadFirst: true,
    keepAudioSessionActive: true,
  });
  player.loop = false;
  player.volume = definition.volume;
  players.set(event, player);
  return player;
}

async function prepareSounds() {
  if (!hasConfiguredSounds()) return;

  const module = await loadAudioModule();
  if (!module) return;

  if (!audioModePromise) {
    audioModePromise = module
      .setAudioModeAsync({
        allowsRecording: false,
        interruptionMode: "mixWithOthers",
        playsInSilentMode: false,
        shouldPlayInBackground: false,
        shouldRouteThroughEarpiece: false,
      })
      .catch(() => undefined);
  }

  await audioModePromise;

  for (const event of Object.keys(soundCatalog) as SoundEvent[]) {
    ensurePlayer(event);
  }

  if (!appStateSubscription) {
    appStateSubscription = AppState.addEventListener("change", syncAudioActivity);
  }

  syncAudioActivity(AppState.currentState);
}

function teardownSounds() {
  appStateSubscription?.remove();
  appStateSubscription = null;

  for (const player of players.values()) {
    player.remove();
  }
  players.clear();

  audioActive = false;
  audioModePromise = null;
  if (audioModule) {
    void audioModule.setIsAudioActiveAsync(false).catch(() => undefined);
  }
}

function fire(event: SoundEvent) {
  if (muted) return;

  const player = ensurePlayer(event);
  if (!player) return;

  try {
    void player.seekTo(0).catch(() => undefined);
    player.play();
  } catch {
    // Ignore; UI must keep responding.
  }
}

export function useSoundSession() {
  useEffect(() => {
    mountedSessions += 1;
    void prepareSounds();

    return () => {
      mountedSessions = Math.max(0, mountedSessions - 1);
      if (mountedSessions === 0) teardownSounds();
    };
  }, []);
}

export function setSoundsMuted(value: boolean) {
  muted = value;
  syncAudioActivity(AppState.currentState);
}

export function isSoundsMuted() {
  return muted;
}

export function playSheetTransition(previousIndex: number, nextIndex: number) {
  if (previousIndex < 0 && nextIndex >= 0) sheetOpen();
  else if (previousIndex >= 0 && nextIndex < 0) sheetClose();
}

export function tabTap() { fire("tabTap"); }
export function sheetOpen() { fire("sheetOpen"); }
export function sheetClose() { fire("sheetClose"); }
export function sliderThreshold() { fire("sliderThreshold"); }
export function sliderConfirm() { fire("sliderConfirm"); }
export function successResolve() { fire("successResolve"); }
export function buttonTap() { fire("buttonTap"); }
export function toggleOn() { fire("toggleOn"); }
export function toggleOff() { fire("toggleOff"); }
export function warning() { fire("warning"); }
