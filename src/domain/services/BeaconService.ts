export type BeaconMode = "silent" | "passive" | "active";

export interface BeaconService {
  getMode(): Promise<BeaconMode>;
  setMode(mode: BeaconMode): Promise<void>;
  isAdvertising(): Promise<boolean>;
}
