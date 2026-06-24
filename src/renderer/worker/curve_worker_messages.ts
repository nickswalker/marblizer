// Message protocol between WorkerCurveRenderer (main thread) and
// curve_worker.ts (worker). Operations cross this boundary as the flat
// Float32Array format from op_buffer.ts rather than as live Operation
// instances, since structured clone would otherwise strip their prototypes
// (and so their atPoint methods) — see decodeOperations in op_buffer.ts.

export interface PlainColor {
    r: number;
    g: number;
    b: number;
}

export type MainToWorkerMessage =
    | { type: "init"; canvas: OffscreenCanvas; width: number; height: number }
    | { type: "setSize"; width: number; height: number }
    | { type: "applyOperations"; data: Float32Array; count: number; baseColor: PlainColor | null }
    | { type: "reset" }
    | { type: "save"; requestId: number };

export type WorkerToMainMessage =
    | { type: "saved"; requestId: number; blob: Blob };
