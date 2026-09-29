// Company logos from Simple Icons (CC0). Each entry is an SVG path plus the brand colour.
// Logos identify market instruments and do not imply affiliation or endorsement.

import {
  siAirbnb, siAmd, siApple, siBoeing, siCocacola, siCoinbase, siGoogle, siIntel, siMastercard, siMcdonalds,
  siMeta, siNetflix, siNike, siNvidia, siPaypal, siShopify, siSpotify, siStarbucks, siTesla, siToyota, siUber, siVisa,
  type SimpleIcon,
} from "simple-icons";

export const companyLogos: Record<string, SimpleIcon> = {
  TSLA: siTesla, AAPL: siApple, NVDA: siNvidia, GOOGL: siGoogle, META: siMeta, NFLX: siNetflix, AMD: siAmd, INTC: siIntel,
  SHOP: siShopify, V: siVisa, MA: siMastercard, PYPL: siPaypal, COIN: siCoinbase, UBER: siUber, ABNB: siAirbnb, TM: siToyota,
  NKE: siNike, SBUX: siStarbucks, MCD: siMcdonalds, KO: siCocacola, SPOT: siSpotify, BA: siBoeing,
};
