export const MAX_BINARY_IPC_FILE_BYTES = 512 * 1024 * 1024;
export const BINARY_IPC_FILE_TOO_LARGE_CODE = "FILE_TOO_LARGE_FOR_BINARY_IPC" as const;

export interface BinaryIpcFileTooLargeResult {
	success: false;
	code: typeof BINARY_IPC_FILE_TOO_LARGE_CODE;
	path: string;
	sizeBytes: number;
	maxBytes: number;
	message: string;
	error: string;
}

export function formatByteSize(bytes: number): string {
	if (!Number.isFinite(bytes) || bytes < 0) return "unknown size";

	const units = ["B", "KB", "MB", "GB", "TB"] as const;
	let value = bytes;
	let unitIndex = 0;

	while (value >= 1024 && unitIndex < units.length - 1) {
		value /= 1024;
		unitIndex += 1;
	}

	const formatted = unitIndex === 0 ? value.toFixed(0) : value.toFixed(1);
	return `${formatted} ${units[unitIndex]}`;
}

export function canReadFileThroughBinaryIpc(
	sizeBytes: number,
	maxBytes = MAX_BINARY_IPC_FILE_BYTES,
): boolean {
	return Number.isFinite(sizeBytes) && sizeBytes >= 0 && sizeBytes <= maxBytes;
}

export function createBinaryIpcFileTooLargeResult(
	filePath: string,
	sizeBytes: number,
	maxBytes = MAX_BINARY_IPC_FILE_BYTES,
): BinaryIpcFileTooLargeResult {
	const message = `Video file is too large to load through OpenScreen's binary IPC bridge (${formatByteSize(sizeBytes)}; limit ${formatByteSize(maxBytes)}).`;
	return {
		success: false,
		code: BINARY_IPC_FILE_TOO_LARGE_CODE,
		path: filePath,
		sizeBytes,
		maxBytes,
		message,
		error: BINARY_IPC_FILE_TOO_LARGE_CODE,
	};
}
