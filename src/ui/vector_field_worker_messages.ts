// Message protocol between the main-thread WorkerFieldRenderer (in
// vector_field_overlay.ts) and vector_field_worker.ts. The preview Operation
// crosses this boundary pre-encoded via op_buffer.ts's wire format, since a
// live Operation instance (with its atPoint closure) can't survive
// postMessage's structured clone — see decodeOperations.

export type MainToFieldWorkerMessage =
    | { type: "init"; canvas: OffscreenCanvas; width: number; height: number; dpr: number }
    | { type: "resize"; width: number; height: number; dpr: number }
    | { type: "spacing"; value: number }
    | { type: "operation"; data: Float32Array | null; count: number }
    | { type: "draw" };
