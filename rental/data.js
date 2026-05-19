/** 客戶租借流程 · 假資料 */
export const costumes = [
  {
    id: 1,
    name: "敦煌飛天舞服",
    category: "民族舞",
    tagline: "飄逸水袖 · 舞台焦點",
    emoji: "🪽",
    hue: "tiffany",
    pricePerDay: 320,
    sizes: ["S", "M", "L"],
    stock: { S: 10, M: 20, L: 5 },
    accessories: ["金色頭飾", "飛天披肩"],
    description: "經典敦煌系列，含水袖與漸層披帛。適合學校成果展、民族舞賽事。",
    highlights: ["含專用衣架袋", "可加購頭飾套組", "檔期熱門款"]
  },
  {
    id: 2,
    name: "原民羽飾套裝",
    category: "原住民舞",
    tagline: "部落風采 · 完整配件",
    emoji: "🪶",
    hue: "purple",
    pricePerDay: 380,
    sizes: ["S", "M", "L"],
    stock: { S: 6, M: 4, L: 3 },
    accessories: ["羽毛頭飾", "原民腰帶"],
    description: "排灣、阿美風格演出服，附羽飾與腰飾。建議提前 7 天預約。",
    highlights: ["配件需一併歸還", "限量尺寸", "教學團體優惠"]
  },
  {
    id: 3,
    name: "兒童芭蕾粉 Tutu",
    category: "芭蕾",
    tagline: "粉嫩仙氣 · 兒童專屬",
    emoji: "🩰",
    hue: "tiffany",
    pricePerDay: 220,
    sizes: ["XS", "S", "M"],
    stock: { XS: 12, S: 15, M: 10 },
    accessories: ["髮飾組", "舞鞋套"],
    description: "兒童芭蕾演出經典粉紗裙，輕量好穿。適合教室發表會。",
    highlights: ["多尺寸齊全", "易洗滌材質", "可團體批次"]
  },
  {
    id: 4,
    name: "街舞寬鬆套裝",
    category: "街舞",
    tagline: "街頭律動 · 鬆弛有型",
    emoji: "⚡",
    hue: "purple",
    pricePerDay: 260,
    sizes: ["S", "M", "L", "XL"],
    stock: { S: 8, M: 12, L: 9, XL: 6 },
    accessories: ["棒球帽", "腰鏈"],
    description: "寬版上衣搭配束口褲，適合 Hip-hop、K-pop 編舞。",
    highlights: ["男女皆可", "耐穿面料", "快速出貨"]
  },
  {
    id: 5,
    name: "國風水袖服",
    category: "古典舞",
    tagline: "長袖翩然 · 國風美學",
    emoji: "🌸",
    hue: "tiffany",
    pricePerDay: 300,
    sizes: ["S", "M", "L"],
    stock: { S: 7, M: 6, L: 4 },
    accessories: ["髮簪", "腰封"],
    description: "古典舞、國風編舞熱門款。水袖長度可依身高微調。",
    highlights: ["含防皺袋", "檔期建議早訂", "可搭配披肩"]
  },
  {
    id: 6,
    name: "現代黑金流蘇服",
    category: "現代舞",
    tagline: "黑金質感 · 當代舞台",
    emoji: "✨",
    hue: "purple",
    pricePerDay: 340,
    sizes: ["S", "M", "L"],
    stock: { S: 5, M: 5, L: 3 },
    accessories: ["流蘇腰鍊"],
    description: "現代舞、當代編舞專用。黑金配色在燈光下極具層次。",
    highlights: ["舞台感強", "限量 L 碼", "商演熱門"]
  }
];

export function getCostumeById(id) {
  return costumes.find(c => c.id === Number(id));
}
