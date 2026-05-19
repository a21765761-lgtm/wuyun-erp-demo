/** ERP 原始庫存（各尺寸件數） */
export const inventory = [
  {
    id: 1,
    name: "敦煌飛天舞服",
    category: "民族舞",
    location: "A區-3層-12格",
    sizes: { S: 10, M: 20, L: 5 },
    sharedAccessories: [1, 2]
  },
  {
    id: 2,
    name: "原民羽飾套裝",
    category: "原住民舞",
    location: "B區-2層-05格",
    sizes: { S: 6, M: 4, L: 3 },
    sharedAccessories: [3]
  },
  {
    id: 3,
    name: "兒童芭蕾粉 Tutu",
    category: "芭蕾",
    location: "C區-1層-08格",
    sizes: { XS: 12, S: 15, M: 10 },
    sharedAccessories: [1]
  },
  {
    id: 4,
    name: "街舞寬鬆套裝",
    category: "街舞",
    location: "A區-2層-03格",
    sizes: { S: 8, M: 12, L: 9, XL: 6 },
    sharedAccessories: [2]
  },
  {
    id: 5,
    name: "國風水袖服",
    category: "古典舞",
    location: "B區-3層-11格",
    sizes: { S: 7, M: 6, L: 4 },
    sharedAccessories: [1, 2]
  },
  {
    id: 6,
    name: "現代黑金流蘇服",
    category: "現代舞",
    location: "A區-1層-06格",
    sizes: { S: 5, M: 5, L: 3 },
    sharedAccessories: [2]
  }
];

export function getCostumeById(id) {
  return inventory.find(c => c.id === Number(id));
}
