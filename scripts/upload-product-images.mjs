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
const mimeTypes = { ".jpg":"image/jpeg", ".jpeg":"image/jpeg", ".png":"image/png", ".webp":"image/webp", ".gif":"image/gif" };
const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
if (!Array.isArray(manifest) || manifest.length === 0) throw new Error("Manifest must be a non-empty JSON array.");

const catalogResponse = await fetch(`${apiBase}/api/products`);
if (!catalogResponse.ok) throw new Error(`Could not load product catalog: HTTP ${catalogResponse.status}`);
const catalog = await catalogResponse.json();
const byName = new Map(catalog.map(p => [String(p.name).trim().toLowerCase(), p]));
const seen = new Set();
let success = 0, failed = 0;

for (const entry of manifest) {
  try {
    if (!entry.productName || !Array.isArray(entry.files) || entry.files.length < 1 || entry.files.length > 10) {
      throw new Error("Entry needs productName and 1 to 10 image filenames");
    }
    const product = byName.get(String(entry.productName).trim().toLowerCase());
    if (!product) throw new Error(`Product not found in live catalog: ${entry.productName}`);
    if (seen.has(product.id)) throw new Error(`Duplicate mapping for product ID ${product.id}`);
    seen.add(product.id);

    const form = new FormData();
    for (const filename of entry.files) {
      if (typeof filename !== "string" || filename !== path.basename(filename)) throw new Error(`Invalid filename: ${filename}`);
      const ext = path.extname(filename).toLowerCase();
      if (!allowed.has(ext)) throw new Error(`Unsupported image type: ${filename}`);
      const filePath = path.join(imageRoot, filename);
      await access(filePath);
      const bytes = await readFile(filePath);
      if (bytes.byteLength > 5 * 1024 * 1024) throw new Error(`${filename} exceeds 5 MB`);
      form.append("files", new Blob([bytes], { type: mimeTypes[ext] }), filename);
    }

    const response = await fetch(`${apiBase}/api/products/${product.id}/images`, {
      method: "POST", headers: { Authorization: `Bearer ${token}` }, body: form
    });
    const body = await response.text();
    if (!response.ok) throw new Error(`HTTP ${response.status}: ${body.slice(0, 400)}`);
    success++;
    console.log(`[OK] ${product.name} (ID ${product.id})`);
  } catch (error) {
    failed++;
    console.error(`[FAILED] ${entry.productName ?? "unknown"}: ${error.message}`);
  }
}
console.log(`Finished. Successful: ${success}; failed: ${failed}.`);
if (failed) process.exitCode = 1;
