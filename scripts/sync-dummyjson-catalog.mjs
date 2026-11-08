#!/usr/bin/env node
/**
 * Sync the BasketBro demo catalogue with real sample records/images from DummyJSON.
 * Existing BasketBro product IDs, prices, stock and category assignments are retained.
 * Product names, brands, ratings and primary image URLs are replaced from DummyJSON.
 * Image URLs are stored directly (DummyJSON CDN); no manual downloads or Cloudinary upload.
 */
const API = (process.env.BASKETBRO_API_URL || "https://basketbro-api.onrender.com").replace(/\/$/, "");
const TOKEN = process.env.BASKETBRO_ADMIN_TOKEN;
const DRY_RUN = process.argv.includes("--dry-run");
if (!TOKEN) throw new Error("Set BASKETBRO_ADMIN_TOKEN in your terminal environment.");

const categorySources = {
  "Computers": ["laptops"],
  "Mobiles": ["smartphones"],
  "Accessories": ["mobile-accessories", "mens-watches", "womens-watches", "sunglasses"],
  "Electronics": ["tablets", "vehicle"],
  "Home Appliances": ["kitchen-accessories", "furniture"],
  "Fashion": ["mens-shirts", "tops", "womens-dresses", "mens-shoes", "womens-shoes", "womens-bags"],
  "Home & Kitchen": ["home-decoration", "furniture", "kitchen-accessories"],
  "Books": [],
  "Sports": ["sports-accessories"],
  "Beauty": ["beauty", "skin-care", "fragrances"]
};

async function getJson(url, options = {}) {
  const response = await fetch(url, options);
  if (!response.ok) throw new Error(`${response.status} ${response.statusText} from ${url}`);
  return response.json();
}

const [basketProducts, sourceData] = await Promise.all([
  getJson(`${API}/api/products`),
  getJson("https://dummyjson.com/products?limit=0")
]);
const sources = sourceData.products || [];
const used = new Set();
let updated = 0, skipped = 0, failed = 0;

for (const product of basketProducts) {
  try {
    const categoryName = product.category?.name;
    const slugs = categorySources[categoryName] || [];
    const candidate = sources.find(item =>
      slugs.includes(item.category) && !used.has(item.id) &&
      (item.images?.length || item.thumbnail)
    );

    if (!candidate) {
      console.log(`[SKIP] ${product.name}: no unused DummyJSON match for ${categoryName}`);
      skipped++;
      continue;
    }

    used.add(candidate.id);
    const imageUrl = candidate.images?.[0] || candidate.thumbnail;
    const payload = {
      name: candidate.title,
      brand: candidate.brand || "Generic",
      price: product.price,
      rating: Number(candidate.rating) || product.rating,
      quantity: product.quantity,
      image: imageUrl,
      category: { id: product.category.id }
    };

    if (DRY_RUN) {
      console.log(`[DRY RUN] ${product.name} -> ${payload.name} | ${imageUrl}`);
      updated++;
      continue;
    }

    const result = await fetch(`${API}/api/products/${product.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${TOKEN}`
      },
      body: JSON.stringify(payload)
    });
    if (!result.ok) throw new Error(`API returned ${result.status}: ${(await result.text()).slice(0, 250)}`);
    console.log(`[UPDATED] ID ${product.id}: ${product.name} -> ${payload.name}`);
    updated++;
  } catch (error) {
    failed++;
    console.error(`[FAILED] ID ${product.id} ${product.name}: ${error.message}`);
  }
}

console.log(`\nFinished: ${updated} updated/planned, ${skipped} skipped, ${failed} failed.`);
if (DRY_RUN) console.log("Dry run only: no BasketBro records were changed.");
if (failed) process.exitCode = 1;
