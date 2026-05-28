export type FactionKey = "HOLO" | "VOID" | "BIT";

export type Faction = {
  name: string;
  color: string;
  tag: FactionKey;
  blurb: string;
};

export const FACTIONS: Record<FactionKey, Faction> = {
  HOLO: { name: "Holo Idols", color: "#FF2BD6", tag: "HOLO", blurb: "Hologram-pop saints. They beam their songs across the void." },
  VOID: { name: "Void Hunters", color: "#7BFF52", tag: "VOID", blurb: "Mask-warriors of the unlit highways. They settle debts in starlight." },
  BIT:  { name: "Bit Shamans",  color: "#52F0FF", tag: "BIT",  blurb: "Glitch-priests who read futures in dropped packets." },
};

export type Character = {
  id: string;
  num: string;
  name: string;
  role: string;
  faction: FactionKey;
  color: string;
  element: string;
  homeworld: string;
  artifact: string;
  debut: string;
  bio: string;
  quote: string;
  stats: { Voltage: number; Charisma: number; Stealth: number; Combat: number; Cosmic: number };
};

export const CHARACTERS: Character[] = [
  { id: "neoni", num: "01", name: "NEONI", role: "Voltage Mistress", faction: "HOLO", color: "#FF2BD6",
    element: "Plasma", homeworld: "Neon Belt 7", artifact: "Twin-Tail Antenna", debut: "V0.1 / 24.11",
    bio: "Neoni broadcasts at frequencies your bones can hear. She arrived in the upper Belt with a karaoke machine fused to her vertebrae and no memory before the chorus. She is loud, on purpose.",
    quote: "Turn it up till the moon flinches.",
    stats: { Voltage: 98, Charisma: 96, Stealth: 14, Combat: 62, Cosmic: 78 } },
  { id: "hoju", num: "02", name: "HOJU", role: "Tigerstride Sage", faction: "VOID", color: "#FF8A1F",
    element: "Ember", homeworld: "Old Sambo", artifact: "Lacquered Tiger Mask", debut: "V0.1 / 24.11",
    bio: "Eldest of the Void Hunters. Wears the tiger mask of a magistrate two thousand years dead. He measures problems in cups of tea.",
    quote: "A patient blade is a fed blade.",
    stats: { Voltage: 22, Charisma: 70, Stealth: 64, Combat: 95, Cosmic: 88 } },
  { id: "momo", num: "03", name: "MOMOJANG", role: "Bloom Drifter", faction: "HOLO", color: "#FFB1C8",
    element: "Pollen", homeworld: "Peach Garden 4", artifact: "Petal Visor", debut: "V0.2 / 24.12",
    bio: "A sweetness courier. She runs blooms between the orbital greenhouses and is famous for never delivering on time, but always delivering perfect.",
    quote: "Late is just early for next time.",
    stats: { Voltage: 60, Charisma: 88, Stealth: 70, Combat: 30, Cosmic: 58 } },
  { id: "gami", num: "04", name: "GAMI", role: "Crimson Edge", faction: "VOID", color: "#FF3D6E",
    element: "Iron", homeworld: "Slag Ring", artifact: "Slit Oni Mask", debut: "V0.1 / 24.11",
    bio: "Made themselves out of scrap, twice. They are exactly the right amount of dangerous for any given room.",
    quote: "Settle it. Then settle the rest.",
    stats: { Voltage: 44, Charisma: 38, Stealth: 80, Combat: 92, Cosmic: 50 } },
  { id: "saemi", num: "05", name: "SAEMI", role: "Tidewalker", faction: "BIT", color: "#52F0FF",
    element: "Liquid", homeworld: "Salt Channel", artifact: "Comet Pail", debut: "V0.2 / 24.12",
    bio: "Reads currents — tidal, ocean, packet, gossip. If your secret is wet, she's already heard it.",
    quote: "The whisper goes where the water goes.",
    stats: { Voltage: 52, Charisma: 60, Stealth: 90, Combat: 40, Cosmic: 82 } },
  { id: "byeol", num: "06", name: "BYEOL", role: "Nova Whisper", faction: "BIT", color: "#C9B8FF",
    element: "Starlight", homeworld: "Pale Cradle", artifact: "Lullaby Sphere", debut: "V0.1 / 24.11",
    bio: "A starchild. Folds light into sleep, and sleep into prophecy. Has been seven, forever.",
    quote: "Close your eyes. I'll keep them.",
    stats: { Voltage: 30, Charisma: 75, Stealth: 88, Combat: 18, Cosmic: 99 } },
  { id: "kkoma", num: "07", name: "KKOMA", role: "Tinker Imp", faction: "BIT", color: "#7BFF52",
    element: "Spark", homeworld: "Scrap Heap β", artifact: "Wrench-of-Many-Sockets", debut: "V0.2 / 24.12",
    bio: "Tiny. Loud. Makes very small things go very fast. Has personally voided the warranty on every ship in the fleet.",
    quote: "I CAN FIX. NOT PROMISE.",
    stats: { Voltage: 86, Charisma: 64, Stealth: 72, Combat: 48, Cosmic: 40 } },
  { id: "runa", num: "08", name: "RUNA", role: "Lunar Conduit", faction: "HOLO", color: "#A4D6FF",
    element: "Silver", homeworld: "Selene Loop", artifact: "Tide-Marked Mirror", debut: "V0.3 / 25.02",
    bio: "Half-moon devotee. Choreographs the orbital ceremonies. Speaks in choreography even when not dancing.",
    quote: "Step left. Then mean it.",
    stats: { Voltage: 70, Charisma: 92, Stealth: 56, Combat: 54, Cosmic: 84 } },
  { id: "dok2", num: "09", name: "DOK-2", role: "Rust Knight", faction: "VOID", color: "#FF6A2C",
    element: "Steel", homeworld: "Foundry Rim", artifact: "Three-Pronged Mace", debut: "V0.3 / 25.02",
    bio: "A dokkaebi welded to a service mech welded to a dokkaebi. Honor system is original, body is third-party.",
    quote: "I oxidize on principle.",
    stats: { Voltage: 60, Charisma: 40, Stealth: 30, Combat: 96, Cosmic: 44 } },
  { id: "shibi", num: "10", name: "SHIBI", role: "Shadow Drifter", faction: "BIT", color: "#9D4DFF",
    element: "Ash", homeworld: "Unknown", artifact: "Nine-Tailed Cloak", debut: "V0.3 / 25.02",
    bio: "Cat or fox, depending on the lighting. Walks through closed doors as a courtesy, not a power.",
    quote: "Knock if you must.",
    stats: { Voltage: 48, Charisma: 80, Stealth: 99, Combat: 60, Cosmic: 92 } },
];

export type Lore = { idx: string; title: string; body: string; accent: string };
export const LORE: Lore[] = [
  { idx: "CH 01", title: "The Long Static", body: "A thousand-year radio silence ended when a karaoke transmission punched through the Pale Cradle nebula. Nobody knows who sang first. Everybody pretends they do.", accent: "#FF2BD6" },
  { idx: "CH 02", title: "Mask, Then Face", body: "The dokkaebi who survived the static came back wrong-shaped: half folk, half satellite. They wore the old lacquered masks of home and the new chrome of wherever they had been.", accent: "#7BFF52" },
  { idx: "CH 03", title: "The Spacekkabbi Pact", body: "Three factions, one fragile peace. The Holo Idols keep the broadcast alive; the Void Hunters keep the roads honest; the Bit Shamans keep the future from arriving early.", accent: "#52F0FF" },
];

export type Relationship = { a: string; b: string; type: "duet" | "oath" | "pact" | "rival" };
export const RELATIONSHIPS: Relationship[] = [
  { a: "neoni", b: "momo",  type: "duet" },
  { a: "neoni", b: "runa",  type: "duet" },
  { a: "momo",  b: "runa",  type: "duet" },
  { a: "hoju",  b: "gami",  type: "oath" },
  { a: "gami",  b: "dok2",  type: "oath" },
  { a: "hoju",  b: "dok2",  type: "oath" },
  { a: "saemi", b: "byeol", type: "pact" },
  { a: "byeol", b: "kkoma", type: "pact" },
  { a: "saemi", b: "kkoma", type: "pact" },
  { a: "shibi", b: "byeol", type: "pact" },
  { a: "shibi", b: "gami",  type: "rival" },
  { a: "shibi", b: "neoni", type: "rival" },
  { a: "kkoma", b: "dok2",  type: "rival" },
  { a: "hoju",  b: "runa",  type: "rival" },
];

export type NewsItem = { date: string; tag: string; title: string };
export const NEWS: NewsItem[] = [
  { date: "25.05.21", tag: "DROP",   title: "Vol. 4 Codex Patch — Two new dokkaebi enter the broadcast" },
  { date: "25.05.18", tag: "EVENT",  title: "Live: Neoni @ Neon Belt 7 — main-stage hologram concert" },
  { date: "25.05.12", tag: "LORE",   title: "The Salt Channel Logs, an oral history from Saemi" },
  { date: "25.05.07", tag: "GOODS",  title: "Limited: Hoju Tea Set restock — 48 hours only" },
  { date: "25.04.29", tag: "FANART", title: "Featured: this month's top community submissions" },
];

export type Faq = { q: string; a: string };
export const FAQS: Faq[] = [
  { q: "What is SPACEKKABBI?", a: "A growing universe of space-faring dokkaebi — Korean folk spirits reborn at the edge of the broadcast belt. Each character has their own story, voice, and faction." },
  { q: "How do I join the community?", a: "Hop into our Discord or Twitter and say hi. Most active members start by submitting fanart, joining a faction channel, or reading the codex through." },
  { q: "Can I make fanart and original stories?", a: "Yes — please. Tag your work #spacekkabbi so we can find it. Featured pieces rotate into the gallery monthly. Commercial use of the official designs requires a license." },
  { q: "When do new characters drop?", a: "A new codex volume drops roughly every season (~3 months). Patch notes and lore additions are announced in #broadcast." },
  { q: "Is there merch?", a: "Yes — limited drops through the store. Some characters get full runs, some get one-off enamel pins, some get nothing because they asked not to." },
];

export type Product = {
  id: string;
  name: string;
  cat: string;
  price: number;
  char: string;
  color: string;
  badge: string;
  blurb: string;
};

export const PRODUCTS: Product[] = [
  { id: "p-neoni-charm", name: "Neoni Acrylic Charm", cat: "CHARM", price: 14, char: "NEONI", color: "#FF2BD6", badge: "NEW", blurb: "Double-sided 6cm holo-foil charm. Glows under blacklight." },
  { id: "p-hoju-tea", name: "Hoju Tigerstride Tea Set", cat: "GOODS", price: 68, char: "HOJU", color: "#FF8A1F", badge: "LIMITED · 48H", blurb: "Ceramic pot + 2 cups, lacquered tiger mark. Drinkable." },
  { id: "p-momo-hoodie", name: "Momojang Bloom Hoodie", cat: "APPAREL", price: 92, char: "MOMOJANG", color: "#FFB1C8", badge: "PRE-ORDER", blurb: "Heavyweight 400gsm fleece, peach embroidery on chest." },
  { id: "p-gami-pin", name: "Crimson Edge Enamel Pin", cat: "PIN", price: 18, char: "GAMI", color: "#FF3D6E", badge: "", blurb: "Hard enamel, rubber backing. 38mm split mask form." },
  { id: "p-saemi-tide", name: "Saemi Tide-Logs Zine", cat: "PRINT", price: 24, char: "SAEMI", color: "#52F0FF", badge: "", blurb: "48-page A5 zine. Oral history of the Salt Channel." },
  { id: "p-byeol-poster", name: "Nova Whisper Poster", cat: "PRINT", price: 32, char: "BYEOL", color: "#C9B8FF", badge: "GLOW", blurb: "50×70cm matte poster with glow-in-the-dark stars." },
  { id: "p-kkoma-tee", name: "Kkoma \"VOID WARRANTY\" Tee", cat: "APPAREL", price: 38, char: "KKOMA", color: "#7BFF52", badge: "", blurb: "Boxy fit, 280gsm cotton, screen-printed back." },
  { id: "p-runa-mirror", name: "Runa Pocket Mirror", cat: "GOODS", price: 16, char: "RUNA", color: "#A4D6FF", badge: "", blurb: "Tide-marked silver, fits in any pocket." },
  { id: "p-dok2-keychain", name: "DOK-2 Rust Knight Keychain", cat: "CHARM", price: 12, char: "DOK-2", color: "#FF6A2C", badge: "", blurb: "Cast metal with antique-rust finish. Heavy." },
  { id: "p-shibi-plush", name: "Shibi Shadow Plush", cat: "PLUSH", price: 56, char: "SHIBI", color: "#9D4DFF", badge: "NEW", blurb: "22cm chibi plush, 9-tail removable cloak." },
  { id: "p-mask-set", name: "Dokkaebi Mask Sticker Pack", cat: "STICKER", price: 9, char: "ALL", color: "#FFD25C", badge: "BUNDLE", blurb: "10 vinyl die-cut stickers, weatherproof." },
  { id: "p-codex-book", name: "Codex Vol. 4 Artbook", cat: "PRINT", price: 88, char: "ALL", color: "#9D4DFF", badge: "FLAGSHIP", blurb: "180-page hardcover. Concept art + faction lore." },
];

export const CONST_POSITIONS: Record<string, { x: number; y: number }> = {
  neoni: { x: 70, y: 28 },
  momo:  { x: 82, y: 50 },
  runa:  { x: 66, y: 60 },
  hoju:  { x: 18, y: 70 },
  gami:  { x: 30, y: 82 },
  dok2:  { x: 10, y: 86 },
  saemi: { x: 24, y: 32 },
  byeol: { x: 42, y: 42 },
  kkoma: { x: 12, y: 50 },
  shibi: { x: 48, y: 70 },
};
