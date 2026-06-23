import path from "node:path";
import { fileURLToPath } from "node:url";
import { normalizeProjectMedia, type ProjectMedia } from "../../src/lib/recordingSession";

type ProjectLike = {
	media?: unknown;
	videoPath?: unknown;
	[key: string]: unknown;
};

function isProjectLike(project: unknown): project is ProjectLike {
	return Boolean(project && typeof project === "object" && !Array.isArray(project));
}

function normalizeVideoSourcePath(videoPath?: string | null): string | null {
	if (typeof videoPath !== "string") {
		return null;
	}

	const trimmed = videoPath.trim();
	if (!trimmed) {
		return null;
	}

	if (/^file:\/\//i.test(trimmed)) {
		try {
			return fileURLToPath(trimmed);
		} catch {
			// Fall through and keep best-effort string path below.
		}
	}

	return trimmed;
}

function isAbsoluteVideoPath(videoPath: string): boolean {
	return path.isAbsolute(videoPath) || path.win32.isAbsolute(videoPath);
}

export function resolveProjectMediaPath(projectFilePath: string, mediaPath: string): string {
	const normalizedPath = normalizeVideoSourcePath(mediaPath) ?? mediaPath;
	if (isAbsoluteVideoPath(normalizedPath)) {
		return normalizedPath;
	}

	return path.resolve(path.dirname(projectFilePath), normalizedPath);
}

export function resolveProjectMediaPathsForLoad(
	project: unknown,
	projectFilePath: string,
): unknown {
	if (!isProjectLike(project)) {
		return project;
	}

	const normalizedMedia =
		normalizeProjectMedia(project.media) ??
		(typeof project.videoPath === "string"
			? ({ screenVideoPath: project.videoPath } satisfies ProjectMedia)
			: null);
	if (!normalizedMedia) {
		return project;
	}

	const resolvedMedia: ProjectMedia = {
		...normalizedMedia,
		screenVideoPath: resolveProjectMediaPath(projectFilePath, normalizedMedia.screenVideoPath),
		...(normalizedMedia.webcamVideoPath
			? {
					webcamVideoPath: resolveProjectMediaPath(
						projectFilePath,
						normalizedMedia.webcamVideoPath,
					),
				}
			: {}),
	};

	return {
		...project,
		media: resolvedMedia,
		...(typeof project.videoPath === "string" && !normalizeProjectMedia(project.media)
			? { videoPath: resolvedMedia.screenVideoPath }
			: {}),
	};
}
