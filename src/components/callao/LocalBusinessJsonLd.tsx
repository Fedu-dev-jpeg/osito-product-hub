import { branches, INSTAGRAM_URL, originUrl, SITE_LEGAL_NAME, SITE_NAME } from "@/lib/site";
import { useShop } from "@/lib/shop-store";

export function LocalBusinessJsonLd() {
  const { settings, locations } = useShop();
  const origin = originUrl();
  const list = locations.length ? locations.filter((item) => item.active) : branches;
  const graph = list.map((branch) => ({
    "@type": "StationeryStore",
    "@id": origin ? `${origin}/#${branch.id}` : `#${branch.id}`,
    name: SITE_NAME,
    legalName: settings.legalName || SITE_LEGAL_NAME,
    url: origin || undefined,
    telephone: branch.phoneE164,
    email: settings.email,
    image: origin ? `${origin}/og-cover.webp` : undefined,
    address: {
      "@type": "PostalAddress",
      streetAddress: branch.address,
      addressLocality: branch.neighborhood,
      addressRegion: "CABA",
      addressCountry: "AR",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: branch.geo.lat,
      longitude: branch.geo.lng,
    },
    openingHours: branch.openingHours,
    sameAs: [settings.instagramUrl || INSTAGRAM_URL, settings.facebookUrl].filter(Boolean),
  }));

  const json = {
    "@context": "https://schema.org",
    "@graph": graph,
  };

  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }} />
  );
}
