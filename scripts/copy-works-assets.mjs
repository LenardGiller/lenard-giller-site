// One-time (re-runnable) copy of source project images into src/assets/works/<slug>/.
// Source folders live outside the deployed site (see .gitignore) and are the
// original, full-resolution files Lenard organized by project. Large raster
// formats get downsized/converted to jpeg via `sips` on the way in so the repo
// and Astro's build don't have to deal with 100MB+ camera TIFFs directly.
import { readdirSync, statSync, mkdirSync, copyFileSync, rmSync } from "node:fs";
import { join, extname, basename } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const MAX_DIMENSION = 2400;
const JPEG_QUALITY = 85;
const CONVERT_EXT = new Set([".jpg", ".jpeg", ".png", ".tif", ".tiff"]);
const PASSTHROUGH_EXT = new Set([".avif"]);

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const SOURCE_ROOT = join(ROOT, "works/my work/projects 1-13");
const DEST_ROOT = join(ROOT, "src/assets/works");

const SLUGS = {
	"01.sediment": "sediment",
	"02.Buying Brass": "buying-brass",
	"03.It remains where it falls, unless otherwise agreed upon with the municipality":
		"it-remains-where-it-falls",
	"04.action at a distance": "action-at-a-distance",
	"05.systems:structures": "systems-structures",
	"06.Detour is method": "detour-is-method",
	"07.Untitled": "untitled",
	"08.Adaptations": "adaptations",
	"09.Revisions": "revisions",
	"10.Actors": "actors",
	"11.dreamworks 35mm": "dreamworks-35mm",
	"12.DreamWorks": "dreamworks",
	"13.Productions": "productions",
};

const IMAGE_EXT = new Set([...CONVERT_EXT, ...PASSTHROUGH_EXT]);

function sanitize(name) {
	const ext = extname(name);
	const base = basename(name, ext);
	const clean = base
		.trim()
		.replace(/[^a-zA-Z0-9]+/g, "-")
		.replace(/-+/g, "-")
		.replace(/^-|-$/g, "");
	return clean || "image";
}

function convertToJpeg(srcPath, destPath) {
	const result = spawnSync("sips", [
		"-s",
		"format",
		"jpeg",
		"-s",
		"formatOptions",
		String(JPEG_QUALITY),
		"-Z",
		String(MAX_DIMENSION),
		srcPath,
		"--out",
		destPath,
	]);
	if (result.status !== 0) {
		throw new Error(`sips failed for ${srcPath}: ${result.stderr}`);
	}
}

function collectImages(dir) {
	const entries = readdirSync(dir).sort((a, b) => a.localeCompare(b));
	const files = [];
	for (const entry of entries) {
		if (entry === ".DS_Store") continue;
		const full = join(dir, entry);
		const stat = statSync(full);
		if (stat.isDirectory()) {
			files.push(...collectImages(full));
		} else if (IMAGE_EXT.has(extname(entry).toLowerCase())) {
			files.push(full);
		}
	}
	return files;
}

let totalCopied = 0;

for (const [folder, slug] of Object.entries(SLUGS)) {
	const srcDir = join(SOURCE_ROOT, folder);
	const destDir = join(DEST_ROOT, slug);

	rmSync(destDir, { recursive: true, force: true });
	mkdirSync(destDir, { recursive: true });

	const images = collectImages(srcDir);
	images.forEach((filePath, index) => {
		const prefix = String(index + 1).padStart(3, "0");
		const ext = extname(filePath).toLowerCase();
		const name = sanitize(basename(filePath));
		if (CONVERT_EXT.has(ext)) {
			convertToJpeg(filePath, join(destDir, `${prefix}_${name}.jpg`));
		} else {
			copyFileSync(filePath, join(destDir, `${prefix}_${name}${ext}`));
		}
	});

	console.log(`${slug}: ${images.length} image(s)`);
	totalCopied += images.length;
}

console.log(`\nDone. ${totalCopied} images copied into src/assets/works/`);
