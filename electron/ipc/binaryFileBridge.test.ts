import { describe, expect, it } from "vitest";
import {
	BINARY_IPC_FILE_TOO_LARGE_CODE,
	canReadFileThroughBinaryIpc,
	createBinaryIpcFileTooLargeResult,
	formatByteSize,
	MAX_BINARY_IPC_FILE_BYTES,
} from "./binaryFileBridge";

describe("formatByteSize", () => {
	it("formats binary byte sizes for diagnostics", () => {
		expect(formatByteSize(0)).toBe("0 B");
		expect(formatByteSize(1024)).toBe("1.0 KB");
		expect(formatByteSize(512 * 1024 * 1024)).toBe("512.0 MB");
		expect(formatByteSize(1_200_923_886)).toBe("1.1 GB");
	});
});

describe("canReadFileThroughBinaryIpc", () => {
	it("allows files at the configured limit and rejects larger files", () => {
		expect(canReadFileThroughBinaryIpc(MAX_BINARY_IPC_FILE_BYTES)).toBe(true);
		expect(canReadFileThroughBinaryIpc(MAX_BINARY_IPC_FILE_BYTES + 1)).toBe(false);
	});

	it("rejects invalid sizes", () => {
		expect(canReadFileThroughBinaryIpc(Number.NaN)).toBe(false);
		expect(canReadFileThroughBinaryIpc(-1)).toBe(false);
	});
});

describe("createBinaryIpcFileTooLargeResult", () => {
	it("returns a structured failure without including file contents", () => {
		const result = createBinaryIpcFileTooLargeResult("/tmp/recording.mp4", 1_200_923_886);

		expect(result).toEqual({
			success: false,
			code: BINARY_IPC_FILE_TOO_LARGE_CODE,
			path: "/tmp/recording.mp4",
			sizeBytes: 1_200_923_886,
			maxBytes: MAX_BINARY_IPC_FILE_BYTES,
			message:
				"Video file is too large to load through OpenScreen's binary IPC bridge (1.1 GB; limit 512.0 MB).",
			error: BINARY_IPC_FILE_TOO_LARGE_CODE,
		});
		expect("data" in result).toBe(false);
	});
});
