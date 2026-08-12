/**
 * Maintenance script: blank out image_url values that point to web pages
 * (Google Drive links, news galleries, etc.) rather than directly to images.
 *
 * The frontend (SmartImage) gracefully falls back to a placeholder when an
 * image URL fails to load, but keeping obviously-wrong URLs out of the DB
 * avoids wasted requests and broken previews in the admin panel.
 *
 * Run:  npx tsx scripts/cleanupImageUrls.ts
 * Safe to re-run (idempotent).
 */
import "dotenv/config";
import prisma from "../src/config/prisma";

// Patterns that identify a URL as a non-image page:
//  - Google Drive share/file pages
//  - "gallery" style web pages
const IS_NON_IMAGE = (url: string) => {
  const lower = url.toLowerCase();
  return (
    lower.includes("drive.google.com") ||
    lower.includes("/file/d/") ||
    lower.includes("google.com/file") ||
    lower.includes("geonet.org.nz") ||
    /^https?:\/\/[^/]+\/gallery/i.test(lower)
  );
};

async function main() {
  const [newsRows, emergencyRows] = await Promise.all([
    prisma.news.findMany({ select: { id: true, title: true, image_url: true } }),
    prisma.emergency.findMany({
      select: { id: true, title: true, image_url: true },
    }),
  ]);

  const brokenNews = newsRows.filter(
    (n) => n.image_url && IS_NON_IMAGE(n.image_url),
  );
  const brokenEmergencies = emergencyRows.filter(
    (e) => e.image_url && IS_NON_IMAGE(e.image_url),
  );

  console.log(`Scanned ${newsRows.length} news and ${emergencyRows.length} emergencies.`);

  for (const n of brokenNews) {
    await prisma.news.update({ where: { id: n.id }, data: { image_url: null } });
    console.log(`  - NULLED news image_url (id ${n.id}, "${n.title}")`);
  }
  for (const e of brokenEmergencies) {
    await prisma.emergency.update({
      where: { id: e.id },
      data: { image_url: null },
    });
    console.log(
      `  - NULLED emergency image_url (id ${e.id}, "${e.title}")`,
    );
  }

  const summary =
    brokenNews.length + brokenEmergencies.length === 0
      ? "No broken image URLs found."
      : "Cleanup complete.";
  console.log(summary);
}

main()
  .catch((err) => {
    console.error("Cleanup failed:", err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });