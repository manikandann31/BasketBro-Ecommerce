#!/usr/bin/env node
import { readFile, access } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const value = (flag, fallback) => {
  const index = args.indexOf(flag);
  return index >= 0 && args[index + 1] ? args[index + 1] : fallback;
};

const apiBase = value("--api", process.env.BASKETBRO_API_URL || "https://basketbro-api.onrender.com").replace(/\/$/, "");
const manifestPath = path.resolve(value("--manifest", path.join(here, "product-images.json")));
const imageRoot = path.resolve(value("--images", path.dirname(manifestPath)));
const token = process.env.BASKETBRO_ADMIN_TOKEN;

if (!token) {
  console.error("Missing BASKETBRO_ADMIN_TOKEN environment variable.");
  process.exit(1);
}

const allowed = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);
const mimeTypes = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif"
};

function validateEntry(entry) {
  if (!Number.isInteger(Number(entry.productId)) || Number(entry.productId) <= 0) {
    throw new Error(`Invalid productId: ${entry.productId}`);
  }
  if (!Array.isArray(entry.files) || entry.files.length < 1 || entry.files.length > 10) {
    throw new Error(`Product ${entry.productId}: files must contain 1 to 10 filenames`);
  }
}

const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
if (!Array.isArray(manifest) || manifest.length === 0) {
  throw new Error("Manifest must be a non-empty JSON array.");
}

const seen = new Set();
let success = 0;
let failed = 0;

for (const entry of manifest) {
  try {
    validateEntry(entry);
    const id = Number(entry.productId);
    if (seen.has(id)) throw new Error(`Duplicate productId ${id} in manifest`);
    seen.add(id);

    const form = new FormData();
    for (const filename of entry.files) {
      if (typeof filename !== "string" || filename !== path.basename(filename)) {
        throw new Error(`Invalid filename: ${filename}`);
      }
      const ext = path.extname(filename).toLowerCase();
      if (!allowed.has(ext)) throw new Error(`Unsupported image type: ${filename}`);
      const filePath = path.join(imageRoot, filename);
      await access(filePath);
      const bytes = await readFile(filePath);
      if (bytes.byteLength > 5 * 1024 * 1024) {
        throw new Error(`${filename} exceeds the 5 MB upload limit`);
      }
      form.append("files", new Blob([bytes], { type: mimeTypes[ext] }), filename);
    }

    const response = await fetch(`${apiBase}/api/products/${id}/images`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: form
    });
    const responseText = await response.text();
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${responseText.slice(0, 500)}`);
    }
    success++;
    console.log(`[OK] Product ${id}: uploaded ${entry.files.length} image(s)`);
  } catch (error) {
    failed++;
    console.error(`[FAILED] Product ${entry.productId ?? "unknown"}: ${error.message}`);
  }
}

console.log(`Finished. Successful products: ${success}; failed products: ${failed}.`);
if (failed > 0) process.exitCode = 1;
