/**
 * Mock pros — single source of truth for the Discover feed in dev mode.
 * Replace with real data when the backend lands.
 */
export type ProfessionalType =
  | "Hairdresser"
  | "Barber"
  | "Loctician"
  | "Nail Tech"
  | "Makeup Artist"
  | "Lash Tech"
  | "Esthetician"
  | "Tattoo Artist";

export type Pro = {
  id: string;
  name: string;
  avatar: string;
  portfolio: string[];
  headline: string;
  neighborhood: "Bed-Stuy" | "Crown Heights" | "Fort Greene" | "Williamsburg" | "Park Slope" | "Bushwick" | "Prospect Heights" | "Newark Central" | "Atlanta West End";
  /** Whether this pro auto-accepts bookings (instant confirm) or requires manual approval. */
  autoAccept: boolean;
  /** Broader area used by the search/distance system (city + state). */
  area: { city: string; state: string };
  /** Mock straight-line distance from this pro to the area's center, in miles.
   *  Used by formatProLocation to render "1.2 mi" / "0.8 mi from search area". */
  distanceMi: number;
  travelRadiusMi: number;
  specializations: string[];
  /** Pro type — what they ARE (drives the Discover chip filter). */
  professionalType: ProfessionalType;
  /** Service style — what THIS card is showcasing (per-card label). */
  category:
    | "Braids"
    | "Silk press"
    | "Barbering"
    | "Locs"
    | "Color"
    | "Nails"
    | "Makeup"
    | "Wash & Style";
  services: { name: string; priceFrom: number }[];
  rating: number;
  reviewCount: number;
  certified: boolean;
  online: boolean;
  newOnEwa: boolean;
  priceFrom: number;
};

const PHOTO = (seed: string) =>
  `https://images.unsplash.com/photo-${seed}?auto=format&fit=crop&w=900&q=70`;

export const MOCK_PROS: Pro[] = [
  {
    id: "amara-okafor",
    name: "Amara Okafor",
    avatar: PHOTO("1531123897727-8f129e1688ce"),
    portfolio: [
      PHOTO("1522337360788-8b13dee7a37e"),
      PHOTO("1517256064527-09c73fc73e38"),
      PHOTO("1580618672591-eb180b1a973f"),
    ],
    headline: "Knotless braids in Brooklyn",
    neighborhood: "Bed-Stuy",
    area: { city: "Brooklyn", state: "NY" },
    distanceMi: 1.2,
    travelRadiusMi: 5,
    specializations: ["Knotless braids", "Box braids", "Color"],
    professionalType: "Hairdresser",
    category: "Braids",
    services: [
      { name: "Medium knotless", priceFrom: 220 },
      { name: "Small knotless", priceFrom: 280 },
    ],
    rating: 4.9,
    reviewCount: 47,
    certified: true,
    online: true,
    newOnEwa: false,
    priceFrom: 220,
    autoAccept: true,
  },
  {
    id: "joelle-pierre",
    name: "Joelle Pierre",
    area: { city: "Brooklyn", state: "NY" },
    distanceMi: 2.8,
    avatar: PHOTO("1544005313-94ddf0286df2"),
    portfolio: [
      PHOTO("1503342217505-b0a15ec3261c"),
      PHOTO("1504703395950-b89145a5425b"),
    ],
    headline: "Silk press, no heat damage",
    neighborhood: "Crown Heights",
    travelRadiusMi: 6,
    specializations: ["Silk press", "Trims", "Wash & Style"],
    professionalType: "Hairdresser",
    category: "Silk press",
    services: [
      { name: "Silk press", priceFrom: 130 },
      { name: "Wash & style", priceFrom: 90 },
    ],
    rating: 4.95,
    reviewCount: 81,
    certified: true,
    online: true,
    newOnEwa: false,
    priceFrom: 90,
    autoAccept: true,
  },
  {
    id: "marcus-bell",
    name: "Marcus Bell",
    area: { city: "Brooklyn", state: "NY" },
    distanceMi: 0.8,
    avatar: PHOTO("1500648767791-00dcc994a43e"),
    portfolio: [
      PHOTO("1605497788044-5a32c7078486"),
      PHOTO("1599351431202-1e0f0137899a"),
    ],
    headline: "Sharp lines, clean fades",
    neighborhood: "Fort Greene",
    travelRadiusMi: 8,
    specializations: ["Tapers", "Beard sculpt", "Line-ups"],
    professionalType: "Barber",
    category: "Barbering",
    services: [
      { name: "Cut + line-up", priceFrom: 65 },
      { name: "Beard sculpt", priceFrom: 35 },
    ],
    rating: 4.85,
    reviewCount: 62,
    certified: false,
    online: false,
    newOnEwa: false,
    priceFrom: 65,
    autoAccept: false,
  },
  {
    id: "kemi-adesanya",
    name: "Kemi Adesanya",
    area: { city: "Brooklyn", state: "NY" },
    distanceMi: 3.4,
    avatar: PHOTO("1438761681033-6461ffad8d80"),
    portfolio: [
      PHOTO("1605497788044-5a32c7078486"),
      PHOTO("1487412947147-5cebf100ffc2"),
    ],
    headline: "Sisterlocks specialist",
    neighborhood: "Bed-Stuy",
    travelRadiusMi: 4,
    specializations: ["Sisterlocks", "Loc maintenance", "Retwist"],
    professionalType: "Loctician",
    category: "Locs",
    services: [
      { name: "Retwist", priceFrom: 95 },
      { name: "Sisterlocks install", priceFrom: 850 },
    ],
    rating: 5.0,
    reviewCount: 23,
    certified: true,
    online: false,
    newOnEwa: true,
    priceFrom: 95,
    autoAccept: false,
  },
  {
    id: "dani-rivera",
    name: "Dani Rivera",
    area: { city: "Brooklyn", state: "NY" },
    distanceMi: 2.1,
    avatar: PHOTO("1502685104226-ee32379fefbe"),
    portfolio: [
      PHOTO("1604654894610-df63bc536371"),
      PHOTO("1610992015732-2449b76344bc"),
    ],
    headline: "Editorial nails, gel & structure",
    neighborhood: "Crown Heights",
    travelRadiusMi: 5,
    specializations: ["Gel-X", "Structure gel", "Nail art"],
    professionalType: "Nail Tech",
    category: "Nails",
    services: [
      { name: "Gel-X full set", priceFrom: 110 },
      { name: "Gel manicure", priceFrom: 55 },
    ],
    rating: 4.8,
    reviewCount: 38,
    certified: true,
    online: true,
    newOnEwa: false,
    priceFrom: 55,
    autoAccept: true,
  },
  {
    id: "tomi-balogun",
    name: "Tomi Balogun",
    area: { city: "Brooklyn", state: "NY" },
    distanceMi: 4.2,
    avatar: PHOTO("1487412720507-e7ab37603c6f"),
    portfolio: [
      PHOTO("1522335789203-aabd1fc54bc9"),
      PHOTO("1503104834685-7205e8607eb9"),
    ],
    headline: "Soft glam & bridal makeup",
    neighborhood: "Fort Greene",
    travelRadiusMi: 10,
    specializations: ["Soft glam", "Bridal", "Editorial"],
    professionalType: "Makeup Artist",
    category: "Makeup",
    services: [
      { name: "Soft glam", priceFrom: 150 },
      { name: "Bridal", priceFrom: 350 },
    ],
    rating: 4.92,
    reviewCount: 104,
    certified: true,
    online: true,
    newOnEwa: false,
    priceFrom: 150,
    autoAccept: true,
  },
  {
    id: "ife-johnson",
    name: "Ife Johnson",
    area: { city: "Brooklyn", state: "NY" },
    distanceMi: 1.9,
    avatar: PHOTO("1524504388940-b1c1722653e1"),
    portfolio: [
      PHOTO("1554519515-242161756769"),
      PHOTO("1581084324492-c8076f130f86"),
    ],
    headline: "Color specialist — vivids & balayage",
    neighborhood: "Bed-Stuy",
    travelRadiusMi: 6,
    specializations: ["Color", "Balayage", "Toner"],
    professionalType: "Hairdresser",
    category: "Color",
    services: [
      { name: "Single process", priceFrom: 120 },
      { name: "Balayage", priceFrom: 280 },
    ],
    rating: 4.78,
    reviewCount: 29,
    certified: true,
    online: false,
    newOnEwa: true,
    priceFrom: 120,
    autoAccept: false,
  },
  {
    id: "naima-davis",
    name: "Naima Davis",
    area: { city: "Newark", state: "NJ" },
    distanceMi: 0.6,
    avatar: PHOTO("1534528741775-53994a69daeb"),
    portfolio: [
      PHOTO("1520975916090-3105956dac38"),
      PHOTO("1559599101-f09722fb4948"),
    ],
    headline: "Boho braids & curated styles",
    neighborhood: "Newark Central",
    travelRadiusMi: 7,
    specializations: ["Boho braids", "Goddess locs", "Twists"],
    professionalType: "Hairdresser",
    category: "Braids",
    services: [
      { name: "Boho knotless", priceFrom: 260 },
      { name: "Goddess locs", priceFrom: 320 },
    ],
    rating: 4.88,
    reviewCount: 51,
    certified: false,
    online: true,
    newOnEwa: false,
    priceFrom: 260,
    autoAccept: true,
  },
  {
    id: "sade-williams",
    name: "Sade Williams",
    area: { city: "Brooklyn", state: "NY" },
    distanceMi: 1.8,
    avatar: PHOTO("1494790108377-be9c29b29330"),
    portfolio: [
      PHOTO("1522337360788-8b13dee7a37e"),
      PHOTO("1580618672591-eb180b1a973f"),
    ],
    headline: "Lash extensions & brow sculpt",
    neighborhood: "Williamsburg",
    travelRadiusMi: 5,
    specializations: ["Classic lashes", "Volume lashes", "Brow lamination"],
    professionalType: "Lash Tech",
    category: "Makeup",
    services: [
      { name: "Classic full set", priceFrom: 140 },
      { name: "Volume full set", priceFrom: 200 },
    ],
    rating: 4.91,
    reviewCount: 67,
    certified: true,
    online: true,
    newOnEwa: false,
    priceFrom: 140,
    autoAccept: true,
  },
  {
    id: "zara-osei",
    name: "Zara Osei",
    area: { city: "Brooklyn", state: "NY" },
    distanceMi: 2.5,
    avatar: PHOTO("1507003211169-0a1dd7228f2d"),
    portfolio: [
      PHOTO("1605497788044-5a32c7078486"),
      PHOTO("1599351431202-1e0f0137899a"),
    ],
    headline: "Wash & style, natural hair care",
    neighborhood: "Park Slope",
    travelRadiusMi: 6,
    specializations: ["Wash & style", "Twist-outs", "Blow-outs"],
    professionalType: "Hairdresser",
    category: "Wash & Style",
    services: [
      { name: "Wash & style", priceFrom: 85 },
      { name: "Deep condition + style", priceFrom: 110 },
    ],
    rating: 4.82,
    reviewCount: 44,
    certified: true,
    online: false,
    newOnEwa: true,
    priceFrom: 85,
    autoAccept: false,
  },
  {
    id: "khalil-brown",
    name: "Khalil Brown",
    area: { city: "Brooklyn", state: "NY" },
    distanceMi: 1.4,
    avatar: PHOTO("1506794778202-cad84cf45f1d"),
    portfolio: [
      PHOTO("1605497788044-5a32c7078486"),
      PHOTO("1599351431202-1e0f0137899a"),
    ],
    headline: "Precision fades & beard work",
    neighborhood: "Bushwick",
    travelRadiusMi: 7,
    specializations: ["Fades", "Beard trim", "Designs"],
    professionalType: "Barber",
    category: "Barbering",
    services: [
      { name: "Skin fade + lineup", priceFrom: 55 },
      { name: "Beard sculpt", priceFrom: 30 },
    ],
    rating: 4.87,
    reviewCount: 73,
    certified: false,
    online: true,
    newOnEwa: false,
    priceFrom: 55,
    autoAccept: true,
  },
  {
    id: "nia-grant",
    name: "Nia Grant",
    area: { city: "Brooklyn", state: "NY" },
    distanceMi: 2.0,
    avatar: PHOTO("1488426862026-3ee34a7d66df"),
    portfolio: [
      PHOTO("1522335789203-aabd1fc54bc9"),
      PHOTO("1503104834685-7205e8607eb9"),
    ],
    headline: "Gel nails & custom nail art",
    neighborhood: "Prospect Heights",
    travelRadiusMi: 5,
    specializations: ["Gel-X", "Chrome nails", "Hand-painted art"],
    professionalType: "Nail Tech",
    category: "Nails",
    services: [
      { name: "Gel-X set", priceFrom: 100 },
      { name: "Gel manicure", priceFrom: 50 },
    ],
    rating: 4.93,
    reviewCount: 58,
    certified: true,
    online: true,
    newOnEwa: true,
    priceFrom: 50,
    autoAccept: false,
  },
];

export const SERVICE_CATEGORIES = [
  "Braids",
  "Silk press",
  "Barbering",
  "Locs",
  "Color",
  "Nails",
  "Makeup",
  "Wash & Style",
] as const;

export const NEIGHBORHOODS = ["Bed-Stuy", "Crown Heights", "Fort Greene", "Williamsburg", "Park Slope", "Bushwick", "Prospect Heights"] as const;

export const PROFESSIONAL_TYPES: readonly ProfessionalType[] = [
  "Hairdresser",
  "Barber",
  "Loctician",
  "Nail Tech",
  "Makeup Artist",
  "Lash Tech",
  "Esthetician",
  "Tattoo Artist",
] as const;
