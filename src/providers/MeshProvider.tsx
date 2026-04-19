// MeshProvider — providers/ seam for BLE mesh lifecycle.
// Wraps the infrastructure-layer MeshBLEContext so app/ never imports infrastructure directly (D15).
//
// - MeshProvider: mount in the root provider tree; starts BLE scan and exposes adapter + bleError via context.
// - useMeshBLE: low-level access to the BLE context (adapter + bleError). Used by higher-level hooks.
//
// UI consumers should use `useMesh` from `src/hooks/useMesh.ts`, not this context directly.
export { MeshBLEProvider as MeshProvider, useMeshBLE } from "@/src/infrastructure/ble";
