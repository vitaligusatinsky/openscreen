import path from "node:path";
import { describe, expect, it } from "vitest";
import { resolveProjectMediaPath, resolveProjectMediaPathsForLoad } from "./projectMediaPaths";

describe("resolveProjectMediaPath", () => {
	it("resolves relative media paths from the project file directory", () => {
		expect(resolveProjectMediaPath("/Users/me/project/example.openscreen", "recording.mp4")).toBe(
			"/Users/me/project/recording.mp4",
		);
	});

	it("keeps absolute and file URL media paths absolute", () => {
		expect(resolveProjectMediaPath("/Users/me/project/example.openscreen", "/tmp/source.mp4")).toBe(
			"/tmp/source.mp4",
		);
		expect(
			resolveProjectMediaPath(
				"/Users/me/project/example.openscreen",
				"file:///Users/me/project/source%20video.mp4",
			),
		).toBe("/Users/me/project/source video.mp4");
	});

	it("keeps Windows absolute media paths when tests run on POSIX", () => {
		expect(
			resolveProjectMediaPath("/Users/me/project/example.openscreen", "C:\\Videos\\source.mp4"),
		).toBe("C:\\Videos\\source.mp4");
	});
});

describe("resolveProjectMediaPathsForLoad", () => {
	it("returns a project with resolved media paths for the editor", () => {
		const projectFilePath = path.join("/Users/me/project", "example.openscreen");
		const project = {
			version: 2,
			media: {
				screenVideoPath: "screen.mp4",
				webcamVideoPath: "webcam.mp4",
				cursorCaptureMode: "editable-overlay",
			},
			editor: {},
		};

		expect(resolveProjectMediaPathsForLoad(project, projectFilePath)).toEqual({
			version: 2,
			media: {
				screenVideoPath: "/Users/me/project/screen.mp4",
				webcamVideoPath: "/Users/me/project/webcam.mp4",
				cursorCaptureMode: "editable-overlay",
			},
			editor: {},
		});
	});

	it("normalizes legacy videoPath projects into media", () => {
		expect(
			resolveProjectMediaPathsForLoad(
				{ version: 1, videoPath: "screen.webm", editor: {} },
				"/Users/me/project/example.openscreen",
			),
		).toEqual({
			version: 1,
			videoPath: "/Users/me/project/screen.webm",
			media: {
				screenVideoPath: "/Users/me/project/screen.webm",
			},
			editor: {},
		});
	});
});
