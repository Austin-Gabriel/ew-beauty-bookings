/**
 * Mock pros — single source of truth for the Discover feed in dev mode.
 * Replace with real data when the backend lands.
 */
export type Pro = {
  id: string;
  name: string;
  avatar: string;
  portfolio: string[];
  headline: string;
  neighborhood: "Bed-Stuy" | "Crown Heights" | "Fort Greene";
  travelRadiusMi: number;
  specializations: string[];
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
      PHOTO("1519415943484-c6c1b4e7c1d3"),
    ],
    headline: "Knotless braids in Brooklyn",
    neighborhood: "Bed-Stuy",
    travelRadiusMi: 5,
    specializations: ["Knotless braids", "Box braids", "Color"],
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
  },
  {
    id: "joelle-pierre",
    name: "Joelle Pierre",
    avatar: PHOTO("1544005313-94ddf0286df2"),
    portfolio: [
      PHOTO("1503342217505-b0a15ec3261c"),
      PHOTO("1504703395950-b89145a5425b"),
    ],
    headline: "Silk press, no heat damage",
    neighborhood: "Crown Heights",
    travelRadiusMi: 6,
    specializations: ["Silk press", "Trims", "Wash & Style"],
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
  },
  {
    id: "marcus-bell",
    name: "Marcus Bell",
    avatar: PHOTO("1500648767791-00dcc994a43e"),
    portfolio: [
      PHOTO("1605497788044-5a32c7078486"),
      PHOTO("1599351431202-1e0f0137899a"),
    ],
    headline: "Sharp lines, clean fades",
    neighborhood: "Fort Greene",
    travelRadiusMi: 8,
    specializations: ["Tapers", "Beard sculpt", "Line-ups"],
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
  },
  {
    id: "kemi-adesanya",
    name: "Kemi Adesanya",
    avatar: PHOTO("1438761681033-6461ffad8d80"),
    portfolio: [
      PHOTO("1612200143316-32a8e8ab1e5a"),
      PHOTO("1487412947147-5cebf100ffc2"),
    ],
    headline: "Sisterlocks specialist",
    neighborhood: "Bed-Stuy",
    travelRadiusMi: 4,
    specializations: ["Sisterlocks", "Loc maintenance", "Retwist"],
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
  },
  {
    id: "dani-rivera",
    name: "Dani Rivera",
    avatar: PHOTO("1502685104226-ee32379fefbe"),
    portfolio: [
      PHOTO("1604654894610-df63bc536371"),
      PHOTO("1610992015732-2449b76344bc"),
    ],
    headline: "Editorial nails, gel & structure",
    neighborhood: "Crown Heights",
    travelRadiusMi: 5,
    specializations: ["Gel-X", "Structure gel", "Nail art"],
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
  },
  {
    id: "tomi-balogun",
    name: "Tomi Balogun",
    avatar: PHOTO("1487412720507-e7ab37603c6f"),
    portfolio: [
      PHOTO("1522335789203-aabd1fc54bc9"),
      PHOTO("1503104834685-7205e8607eb9"),
    ],
    headline: "Soft glam & bridal makeup",
    neighborhood: "Fort Greene",
    travelRadiusMi: 10,
    specializations: ["Soft glam", "Bridal", "Editorial"],
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
  },
  {
    id: "ife-johnson",
    name: "Ife Johnson",
    avatar: PHOTO("1524504388940-b1c1722653e1"),
    portfolio: [
      PHOTO("1554519515-242161756769"),
      PHOTO("1581084324492-c8076f130f86"),
    ],
    headline: "Color specialist — vivids & balayage",
    neighborhood: "Bed-Stuy",
    travelRadiusMi: 6,
    specializations: ["Color", "Balayage", "Toner"],
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
  },
  {
    id: "naima-davis",
    name: "Naima Davis",
    avatar: PHOTO("1534528741775-53994a69daeb"),
    portfolio: [
      PHOTO("1520975916090-3105956dac38"),
      PHOTO("1487222480400-7c8b6d2b7d49"),
    ],
    headline: "Boho braids & curated styles",
    neighborhood: "Crown Heights",
    travelRadiusMi: 7,
    specializations: ["Boho braids", "Goddess locs", "Twists"],
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

export const NEIGHBORHOODS = ["Bed-Stuy", "Crown Heights", "Fort Greene"] as const;
