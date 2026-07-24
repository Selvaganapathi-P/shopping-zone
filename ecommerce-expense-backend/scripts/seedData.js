// Real-world catalog seed — 500+ products across all major categories
// Each variant = separate product (color × storage × RAM combinations)

const r = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const rating = () => +(3.8 + Math.random() * 1.15).toFixed(1);
const reviews = () => r(120, 18000);

// ─── UNSPLASH image pools per subcategory ───────────────────────────────────
const IMG = {
  mobile:    ["photo-1610945415295-d9bbf067e59c","photo-1511707171634-5f897ff02aa9","photo-1574944985070-8f3ebc6b79d2","photo-1585060544812-6b45742d762f","photo-1598300042247-d088f8ab3a91","photo-1598965402089-897ce52e8355"],
  laptop:    ["photo-1593642632559-0c6d3fc62b89","photo-1496181133206-80ce9b88a853","photo-1525547719571-a2d4ac8945e2","photo-1588872657578-7efd1f1555ed","photo-1541807084-5c52b6b3adef","photo-1603302576837-37561b2e2302"],
  tablet:    ["photo-1544244015-0df4b3ffc6b0","photo-1592750475338-74b7b21085ab","photo-1632726040841-7dcf52b3a68d","photo-1623126908029-58cb08a2b272"],
  watch:     ["photo-1434493789847-2f02dc6ca35d","photo-1523275335684-37898b6baf30","photo-1546868871-7041f2a55e12","photo-1579586337278-3befd40fd17a"],
  earbuds:   ["photo-1588423771073-b8903fbb85b5","photo-1590658268037-6bf12165a8df","photo-1608043152269-423dbba4e7e1","photo-1583394838336-acd977736f90"],
  headphones:["photo-1505740420928-5e560c06d30e","photo-1484704849700-f032a568e944","photo-1583394838336-acd977736f90","photo-1613040809024-b4ef7ba99bc3"],
  speaker:   ["photo-1608043152269-423dbba4e7e1","photo-1545454675-3531b543be5d","photo-1558618666-fcd25c85cd64"],
  tv:        ["photo-1593359677879-a4bb92f829e1","photo-1540655037529-dec987208707","photo-1522869635100-9f4c5e86aa37"],
  camera:    ["photo-1502920917128-1aa500764cbd","photo-1516035069371-29a1b244cc32","photo-1452780212132-6e3f42cdbbbd"],
  gaming:    ["photo-1607016284318-d1384bf4eda3","photo-1592840496694-26d035b52b48","photo-1606144042614-b2417e99c4e3"],
  keyboard:  ["photo-1541140532154-b024d705b90a","photo-1587829741301-dc798b83add3","photo-1587170884985-0e4a3a4a6e83"],
  mouse:     ["photo-1527864550417-7fd91fc51a46","photo-1623820919239-0d0ff10797a1","photo-1612836696857-b2155fef5fc3"],
  monitor:   ["photo-1527443224154-c4a3942d3acf","photo-1585792180666-f7347c490ee2","photo-1547082299-de196ea013d6"],
  shirt:     ["photo-1602810318383-e386cc2a3ccf","photo-1603252109303-2751441dd157","photo-1620012253295-c15cc3e65df4"],
  jeans:     ["photo-1542272604-787c3835535d","photo-1475178626620-a4d074967452","photo-1565084888279-aca607ecce0c"],
  dress:     ["photo-1515372039744-b8f02a3ae446","photo-1583496661160-fb5218f5a7b2","photo-1539109136881-3be0616acf4b"],
  shoes:     ["photo-1542291026-7eec264c27ff","photo-1460353581641-37baddab0fa2","photo-1491553895911-0055eca6402d"],
  sneakers:  ["photo-1542291026-7eec264c27ff","photo-1595950653106-6c9ebd614d3a","photo-1600185365926-3a2ce3cdb9eb"],
  bag:       ["photo-1548036328-c9fa89d128fa","photo-1553062407-98eeb64c6a62","photo-1584917865442-de89df76afd3"],
  kitchen:   ["photo-1556909114-f6e7ad7d3136","photo-1585664811087-47f65abbad64","photo-1556909172-54557c7e4fb7"],
  furniture: ["photo-1555041469-a586c61ea9bc","photo-1555041468-ef14ce3a3f01","photo-1493663284031-b7e3aaa4b3ce"],
  mattress:  ["photo-1631049307264-da0ec9d70304","photo-1555041469-a586c61ea9bc"],
  skincare:  ["photo-1596462502278-27bfdc403348","photo-1556228578-626d59e7e874","photo-1598440947619-2c35fc9aa908"],
  haircare:  ["photo-1522338242992-e1a54906a8da","photo-1571781926291-c477ebfd024b"],
  makeup:    ["photo-1586495777744-4e6232bf5b2d","photo-1512496015851-a90fb38ba796"],
  book:      ["photo-1544716278-ca5e3f4abd8c","photo-1512820790803-83ca734da794","photo-1589829085413-56de8ae18c73"],
  sports:    ["photo-1544367567-0f2fcb009e0b","photo-1534438327276-14e5300c3a48","photo-1517963879433-6ad2b056d712"],
  cricket:   ["photo-1531415074968-036ba1b575da"],
  football:  ["photo-1570498839593-e565b39455fc"],
  cycling:   ["photo-1558618666-fcd25c85cd64","photo-1571188654248-7a89213915f7"],
  supplement:["photo-1517838277536-f5f99be501cd","photo-1571019613454-1cb2f99b2d8b"],
  grocery:   ["photo-1542838132-92c53300491e","photo-1506617420156-8e4536971650"],
  snacks:    ["photo-1561043433-aaf687c4cf04","photo-1559181567-c3190100191c"],
  jewellery: ["photo-1611085583191-a3b181a88401","photo-1602173574767-37ac01994b2a"],
  luggage:   ["photo-1553062407-98eeb64c6a62","photo-1571624436279-b272aff752b5"],
};

const img = (key, i = 0) => `https://images.unsplash.com/${IMG[key][i % IMG[key].length]}?w=500&q=80`;
const imgs = (key, count = 4) => Array.from({ length: count }, (_, i) => img(key, i + 1));

let _sku = 10000;
const sku = (prefix) => `${prefix}-${++_sku}`;

// ════════════════════════════════════════════════════════════════════════════
// ELECTRONICS — MOBILES
// ════════════════════════════════════════════════════════════════════════════
const MOBILES = [];

const mobileDef = [
  // Samsung
  { brand:"Samsung", series:"Galaxy S25 Series", model:"Galaxy S25 Ultra", storage:["256GB","512GB","1TB"], ram:["12GB","16GB"], colors:["Titanium Black","Titanium Gray","Titanium Violet","Titanium Blue"], base:109999, mrpAdd:15000, desc:"6.9-inch QHD+ Dynamic AMOLED, 200MP camera, Snapdragon 8 Elite, 5000mAh, S-Pen." },
  { brand:"Samsung", series:"Galaxy S25 Series", model:"Galaxy S25+",      storage:["256GB","512GB"],       ram:["12GB"],        colors:["Icy Blue","Mint","Navy","Silver Shadow"],                          base:89999,  mrpAdd:12000, desc:"6.7-inch FHD+ Dynamic AMOLED 2X, 50MP triple camera, Snapdragon 8 Elite, 4900mAh." },
  { brand:"Samsung", series:"Galaxy S25 Series", model:"Galaxy S25",       storage:["128GB","256GB"],       ram:["12GB"],        colors:["Icy Blue","Mint","Navy","Silver Shadow"],                          base:74999,  mrpAdd:10000, desc:"6.2-inch FHD+ Dynamic AMOLED 2X, 50MP camera, Snapdragon 8 Elite, 4000mAh." },
  { brand:"Samsung", series:"Galaxy A Series",   model:"Galaxy A55 5G",    storage:["128GB","256GB"],       ram:["8GB","12GB"],  colors:["Awesome Navy","Awesome Lilac","Awesome Iceblue","Awesome Lemon"],  base:34999,  mrpAdd:5000,  desc:"6.6-inch Super AMOLED, 50MP OIS camera, Exynos 1480, 5000mAh, 25W charging." },
  { brand:"Samsung", series:"Galaxy A Series",   model:"Galaxy A35 5G",    storage:["128GB","256GB"],       ram:["8GB"],         colors:["Awesome Navy","Awesome Lilac","Awesome Iceblue"],                  base:24999,  mrpAdd:4000,  desc:"6.6-inch Super AMOLED, 50MP camera, Exynos 1380, 5000mAh, 25W charging." },
  { brand:"Samsung", series:"Galaxy M Series",   model:"Galaxy M55 5G",    storage:["128GB","256GB"],       ram:["8GB","12GB"],  colors:["Midnight Black","Emerald Brown","Blue"],                           base:26999,  mrpAdd:4000,  desc:"6.7-inch Super AMOLED+, 50MP OIS, Snapdragon 7 Gen 1, 5000mAh, 45W charging." },
  { brand:"Samsung", series:"Galaxy M Series",   model:"Galaxy M35 5G",    storage:["128GB"],               ram:["8GB"],         colors:["Thunder Grey","Celestial Blue","Satin Ash"],                       base:19999,  mrpAdd:3000,  desc:"6.6-inch Super AMOLED, 50MP camera, Exynos 1380, 6000mAh, 25W charging." },
  { brand:"Samsung", series:"Galaxy Z Series",   model:"Galaxy Z Fold 6",  storage:["256GB","512GB"],       ram:["12GB"],        colors:["Navy","Pink","Silver Shadow","Crafted Black"],                     base:164999, mrpAdd:20000, desc:"7.6-inch main display, Snapdragon 8 Gen 3, 50MP triple camera, 4400mAh." },
  { brand:"Samsung", series:"Galaxy Z Series",   model:"Galaxy Z Flip 6",  storage:["256GB","512GB"],       ram:["12GB"],        colors:["Silver Shadow","Yellow","Blue","Craft Black"],                     base:109999, mrpAdd:15000, desc:"6.7-inch FHD+ AMOLED, Snapdragon 8 Gen 3, 50MP dual camera, 4000mAh." },
  // Apple
  { brand:"Apple",   series:"iPhone 16 Series",  model:"iPhone 16 Pro Max",storage:["256GB","512GB","1TB"], ram:["8GB"],         colors:["Black Titanium","White Titanium","Natural Titanium","Desert Titanium"], base:159900, mrpAdd:10000, desc:"6.9-inch Super Retina XDR ProMotion, A18 Pro chip, 48MP triple camera, titanium design." },
  { brand:"Apple",   series:"iPhone 16 Series",  model:"iPhone 16 Pro",    storage:["128GB","256GB","512GB"],ram:["8GB"],        colors:["Black Titanium","White Titanium","Natural Titanium","Desert Titanium"], base:119900, mrpAdd:10000, desc:"6.3-inch Super Retina XDR ProMotion, A18 Pro chip, 48MP camera system." },
  { brand:"Apple",   series:"iPhone 16 Series",  model:"iPhone 16",        storage:["128GB","256GB","512GB"],ram:["8GB"],        colors:["Ultramarine","Teal","Pink","White","Black"],                        base:79900,  mrpAdd:8000,  desc:"6.1-inch Super Retina XDR, A18 chip, 48MP dual camera, Action Button." },
  { brand:"Apple",   series:"iPhone 15 Series",  model:"iPhone 15",        storage:["128GB","256GB","512GB"],ram:["6GB"],        colors:["Black","Blue","Green","Yellow","Pink"],                             base:69900,  mrpAdd:8000,  desc:"6.1-inch Super Retina XDR, A16 Bionic, 48MP main camera, Dynamic Island." },
  // OnePlus
  { brand:"OnePlus", series:"OnePlus 13 Series", model:"OnePlus 13",       storage:["256GB","512GB"],       ram:["12GB","16GB"], colors:["Midnight Ocean","Arctic Dawn","Black Eclipse"],                    base:69999,  mrpAdd:8000,  desc:"6.82-inch AMOLED ProXDR, Snapdragon 8 Elite, Hasselblad 50MP triple, 6000mAh, 100W." },
  { brand:"OnePlus", series:"OnePlus Nord Series",model:"OnePlus Nord 4",   storage:["128GB","256GB"],       ram:["8GB","12GB"], colors:["Mercurial Silver","Obsidian Midnight","Oasis Green"],              base:29999,  mrpAdd:4000,  desc:"6.74-inch AMOLED 120Hz, Snapdragon 7+ Gen 3, 50MP camera, 5500mAh, 100W SUPERVOOC." },
  { brand:"OnePlus", series:"OnePlus Nord Series",model:"OnePlus Nord CE 4",storage:["128GB","256GB"],       ram:["8GB"],        colors:["Dark Chrome","Celadon Marble"],                                    base:24999,  mrpAdd:3500,  desc:"6.67-inch AMOLED 120Hz, Snapdragon 7s Gen 2, 50MP camera, 5500mAh, 100W." },
  // Xiaomi
  { brand:"Xiaomi",  series:"Xiaomi 14 Series",  model:"Xiaomi 14",        storage:["256GB","512GB"],       ram:["12GB"],        colors:["Black","White","Jade Green","Rock Blue"],                          base:69999,  mrpAdd:8000,  desc:"6.36-inch AMOLED 120Hz, Snapdragon 8 Gen 3, Leica 50MP triple camera, 4610mAh, 90W." },
  { brand:"Xiaomi",  series:"Redmi Note Series",  model:"Redmi Note 13 Pro+",storage:["256GB"],             ram:["8GB","12GB"], colors:["Midnight Black","Aurora Purple","Fusion White"],                   base:29999,  mrpAdd:4000,  desc:"6.67-inch AMOLED 120Hz, Dimensity 7200 Ultra, 200MP OIS camera, 5000mAh, 120W." },
  { brand:"Xiaomi",  series:"Redmi Note Series",  model:"Redmi Note 13 Pro", storage:["128GB","256GB"],     ram:["8GB"],        colors:["Midnight Black","Scarlet Red","Icy Blue"],                          base:24999,  mrpAdd:3500,  desc:"6.67-inch AMOLED 120Hz, Snapdragon 7s Gen 2, 200MP camera, 5100mAh, 67W." },
  { brand:"Xiaomi",  series:"Redmi Series",       model:"Redmi 13C",        storage:["64GB","128GB"],       ram:["4GB","6GB"],   colors:["Starlight Black","Startrail Green","Starblast Blue"],              base:8999,   mrpAdd:2000,  desc:"6.74-inch HD+ display, MediaTek Helio G85, 50MP camera, 5000mAh, 18W charging." },
  // Google
  { brand:"Google",  series:"Pixel 9 Series",    model:"Pixel 9 Pro XL",   storage:["256GB","512GB","1TB"], ram:["16GB"],        colors:["Obsidian","Porcelain","Hazel","Rose Quartz"],                      base:109999, mrpAdd:12000, desc:"6.8-inch Super Actua OLED, Google Tensor G4, 50MP triple Zeiss camera, 5060mAh." },
  { brand:"Google",  series:"Pixel 9 Series",    model:"Pixel 9 Pro",      storage:["128GB","256GB","512GB"],ram:["16GB"],       colors:["Obsidian","Porcelain","Hazel","Rose Quartz"],                      base:99999,  mrpAdd:10000, desc:"6.3-inch Super Actua OLED, Tensor G4, 50MP Zeiss triple camera, 4700mAh." },
  { brand:"Google",  series:"Pixel 9 Series",    model:"Pixel 9",          storage:["128GB","256GB"],       ram:["12GB"],        colors:["Obsidian","Porcelain","Wintergreen","Peony"],                      base:79999,  mrpAdd:8000,  desc:"6.3-inch Actua OLED, Tensor G4, 50MP dual camera, 4700mAh, 24h+ battery life." },
  // Motorola
  { brand:"Motorola",series:"Edge Series",       model:"Motorola Edge 50 Pro",storage:["256GB"],            ram:["12GB"],        colors:["Black Beauty","Moonlight Pearl","Luxe Lavender"],                  base:31999,  mrpAdd:5000,  desc:"6.7-inch pOLED 144Hz, Snapdragon 7 Gen 3, 50MP triple camera, 4500mAh, 125W TurboPower." },
  { brand:"Motorola",series:"Moto G Series",     model:"Moto G85 5G",      storage:["128GB","256GB"],       ram:["8GB","12GB"], colors:["Urban Grey","Cobalt Blue","Olive Green","Marshmallow Blue"],       base:19999,  mrpAdd:3000,  desc:"6.67-inch pOLED 120Hz, Snapdragon 6s Gen 3, 50MP OIS camera, 5000mAh, 33W." },
  // Nothing
  { brand:"Nothing", series:"Phone Series",      model:"Nothing Phone 2a", storage:["128GB","256GB"],       ram:["8GB","12GB"], colors:["Black","White","Special Blue"],                                    base:23999,  mrpAdd:4000,  desc:"6.7-inch AMOLED 120Hz, Dimensity 7200 Pro, 50MP dual camera, 5000mAh, 45W." },
  // Realme
  { brand:"Realme",  series:"GT Series",         model:"Realme GT 6",      storage:["256GB","512GB"],       ram:["12GB","16GB"], colors:["Fluid Silver","Razor Green","Razor Black"],                        base:34999,  mrpAdd:5000,  desc:"6.78-inch AMOLED 120Hz, Snapdragon 8s Gen 3, 50MP Sony LYT-808 camera, 5500mAh, 120W." },
  { brand:"Realme",  series:"Narzo Series",       model:"Realme Narzo 70 Pro",storage:["128GB","256GB"],    ram:["8GB"],        colors:["Glass Black","Glass Green"],                                       base:19999,  mrpAdd:3000,  desc:"6.67-inch AMOLED 120Hz, Dimensity 7050, 50MP OIS camera, 5000mAh, 67W." },
  // vivo
  { brand:"vivo",    series:"V Series",           model:"vivo V30 Pro",     storage:["256GB"],              ram:["12GB"],        colors:["Peacock Green","Linen Brown"],                                     base:34999,  mrpAdd:5000,  desc:"6.78-inch AMOLED 120Hz, Dimensity 8200, 50MP ZEISS portrait camera, 5000mAh, 80W." },
  { brand:"vivo",    series:"Y Series",           model:"vivo Y200 Pro",    storage:["128GB","256GB"],      ram:["8GB"],        colors:["Titanium Gold","Sunset Breeze"],                                   base:22999,  mrpAdd:3500,  desc:"6.78-inch AMOLED 120Hz, Snapdragon 695, 64MP OIS camera, 5000mAh, 44W FlashCharge." },
];

mobileDef.forEach(({ brand, series, model, storage, ram, colors, base, mrpAdd, desc }) => {
  storage.forEach((stor) => {
    ram.forEach((ramOpt) => {
      colors.forEach((color) => {
        const price = base + (stor.includes("512") ? 5000 : stor.includes("1TB") ? 12000 : 0)
                           + (ramOpt.includes("16") ? 4000 : 0);
        MOBILES.push({
          name: `${brand} ${model} ${stor}/${ramOpt} ${color}`,
          brand, category: "Electronics", subcategory: "Mobiles",
          series, model, variant: `${stor}/${ramOpt}`, color,
          price, mrp: price + mrpAdd,
          stock: r(10, 200), rating: rating(), reviewCount: reviews(),
          image: img("mobile"), images: imgs("mobile"),
          description: desc,
          tags: [brand.toLowerCase(), "smartphone", "mobile", model.toLowerCase(), series.toLowerCase(), stor, color.toLowerCase()],
          specs: { storage: stor, ram: ramOpt, color },
          sku: sku("MOB"), warranty: "1 Year Manufacturer Warranty",
          isFeatured: price > 80000, isBestSeller: price < 35000, isNewArrival: series.includes("16") || series.includes("25"),
        });
      });
    });
  });
});

// ════════════════════════════════════════════════════════════════════════════
// ELECTRONICS — LAPTOPS
// ════════════════════════════════════════════════════════════════════════════
const LAPTOPS = [];

const laptopDef = [
  { brand:"Apple",   series:"MacBook Pro",    model:"MacBook Pro 16 M4 Max", storage:["512GB","1TB","2TB"], ram:["48GB","64GB","128GB"], colors:["Space Black","Silver"],             base:299900, mrpAdd:20000, desc:"16.2-inch Liquid Retina XDR, Apple M4 Max chip, 24-core GPU, 22-hr battery, ProRes." },
  { brand:"Apple",   series:"MacBook Pro",    model:"MacBook Pro 14 M4 Pro", storage:["512GB","1TB"],      ram:["24GB","48GB"],         colors:["Space Black","Silver"],             base:189900, mrpAdd:15000, desc:"14.2-inch Liquid Retina XDR, Apple M4 Pro, 20-core GPU, MagSafe 3, up to 22hr." },
  { brand:"Apple",   series:"MacBook Air",    model:"MacBook Air 15 M3",     storage:["256GB","512GB","1TB"],ram:["8GB","16GB","24GB"],  colors:["Midnight","Starlight","Space Gray","Silver"], base:134900, mrpAdd:12000, desc:"15.3-inch Liquid Retina, Apple M3, 18-hr battery, fanless design, MagSafe 3." },
  { brand:"Apple",   series:"MacBook Air",    model:"MacBook Air 13 M3",     storage:["256GB","512GB"],    ram:["8GB","16GB"],           colors:["Midnight","Starlight","Space Gray","Silver"], base:114900, mrpAdd:10000, desc:"13.6-inch Liquid Retina, Apple M3, up to 18hr battery, 1080p FaceTime HD camera." },
  { brand:"Dell",    series:"XPS Series",     model:"Dell XPS 15 9530",      storage:["512GB","1TB","2TB"],ram:["16GB","32GB","64GB"],  colors:["Platinum Silver","Graphite"],       base:149999, mrpAdd:20000, desc:"15.6-inch 3.5K OLED, Core i9-13900H, RTX 4070, premium aluminum chassis." },
  { brand:"Dell",    series:"XPS Series",     model:"Dell XPS 14 9440",      storage:["512GB","1TB"],      ram:["16GB","32GB"],          colors:["Platinum Silver"],                 base:129999, mrpAdd:18000, desc:"14.5-inch 2.8K OLED, Core Ultra 7 155H, RTX 4050, Intel Evo Certified." },
  { brand:"Dell",    series:"Inspiron",       model:"Dell Inspiron 15 3530",  storage:["512GB","1TB"],      ram:["16GB","32GB"],          colors:["Carbon Black","Platinum Silver"],  base:59999,  mrpAdd:8000,  desc:"15.6-inch FHD, Core i5-1335U, Intel Iris Xe, Office-focused slim laptop." },
  { brand:"Dell",    series:"Alienware",      model:"Alienware m18 R2",      storage:["1TB","2TB"],        ram:["32GB","64GB"],          colors:["Dark Metallic Moon"],              base:249999, mrpAdd:30000, desc:"18-inch QHD 165Hz, Core i9-14900HX, RTX 4090 16GB, Cherry MX Ultra-Low keyboard." },
  { brand:"HP",      series:"Spectre",        model:"HP Spectre x360 14",    storage:["512GB","1TB","2TB"],ram:["16GB","32GB"],          colors:["Nightfall Black","Nocturne Blue"], base:129999, mrpAdd:15000, desc:"13.5-inch 2.8K OLED 120Hz, Core Ultra 7, Intel Arc Xe, 360° hinge, pen included." },
  { brand:"HP",      series:"OMEN",           model:"HP OMEN 16 2024",       storage:["512GB","1TB"],      ram:["16GB","32GB"],          colors:["Shadow Black"],                    base:99999,  mrpAdd:12000, desc:"16.1-inch QHD 240Hz, Core i7-14700HX, RTX 4070, OMEN Tempest Cooling." },
  { brand:"HP",      series:"Pavilion",       model:"HP Pavilion 15 2024",   storage:["512GB","1TB"],      ram:["16GB"],                 colors:["Natural Silver","Warm Gold"],      base:59999,  mrpAdd:8000,  desc:"15.6-inch FHD IPS, Core i5-1335U / Ryzen 5 7530U, everyday performance laptop." },
  { brand:"HP",      series:"Envy",           model:"HP Envy x360 15",       storage:["512GB","1TB"],      ram:["16GB","32GB"],          colors:["Natural Silver"],                  base:89999,  mrpAdd:10000, desc:"15.6-inch 2.8K OLED, Ryzen 7 8745HS, Radeon 780M, 2-in-1 convertible design." },
  { brand:"Lenovo",  series:"ThinkPad",       model:"ThinkPad X1 Carbon Gen 12",storage:["512GB","1TB"],   ram:["16GB","32GB","64GB"],  colors:["Deep Black"],                      base:149999, mrpAdd:18000, desc:"14-inch 2.8K OLED, Core Ultra 7 165U, Intel vPro, 57Wh battery, military-grade." },
  { brand:"Lenovo",  series:"Legion",         model:"Legion Pro 7i Gen 9",   storage:["1TB","2TB"],        ram:["32GB","64GB"],          colors:["Eclipse Black","Luna Grey"],       base:189999, mrpAdd:20000, desc:"16-inch QHD+ 240Hz, Core i9-14900HX, RTX 4090 16GB, Legion AI Chip." },
  { brand:"Lenovo",  series:"IdeaPad",        model:"Lenovo IdeaPad Slim 5i", storage:["512GB","1TB"],     ram:["16GB"],                 colors:["Cloud Grey","Abyssal Blue"],       base:59999,  mrpAdd:8000,  desc:"15.6-inch FHD IPS, Core i5-1335U, Iris Xe Graphics, 60Wh battery." },
  { brand:"Asus",    series:"ROG",            model:"Asus ROG Zephyrus G16", storage:["1TB","2TB"],        ram:["16GB","32GB"],          colors:["Eclipse Gray","Platinum White"],   base:179999, mrpAdd:20000, desc:"16-inch 2.5K OLED 240Hz, Core Ultra 9 185H, RTX 4090, 90Wh battery." },
  { brand:"Asus",    series:"ZenBook",        model:"Asus ZenBook 14 OLED",  storage:["512GB","1TB"],      ram:["16GB","32GB"],          colors:["Ponder Blue","Foggy Silver"],      base:79999,  mrpAdd:10000, desc:"14-inch 2.8K OLED 120Hz, Ryzen 7 8845HS / Core Ultra 7, lightweight 1.2kg." },
  { brand:"MSI",     series:"Raider",         model:"MSI Raider GE78 HX",    storage:["1TB","2TB"],        ram:["32GB","64GB"],          colors:["Core Black"],                      base:249999, mrpAdd:25000, desc:"17-inch QHD 240Hz, Core i9-14900HX, RTX 4090, per-key RGB, 99.9Wh battery." },
  { brand:"Microsoft",series:"Surface",       model:"Surface Laptop 7",      storage:["256GB","512GB","1TB"],ram:["16GB","32GB","64GB"], colors:["Platinum","Black","Dune","Sapphire"],base:99999, mrpAdd:12000, desc:"15-inch PixelSense Flow 120Hz, Snapdragon X Elite, Copilot+ PC, 22hr battery." },
  { brand:"Acer",    series:"Predator",       model:"Predator Helios Neo 16", storage:["512GB","1TB"],      ram:["16GB","32GB"],          colors:["Abyssal Black"],                   base:89999,  mrpAdd:10000, desc:"16-inch QHD 165Hz IPS, Core i7-13700HX, RTX 4070, 90Wh battery." },
];

laptopDef.forEach(({ brand, series, model, storage, ram, colors, base, mrpAdd, desc }) => {
  storage.forEach((stor) => {
    ram.forEach((ramOpt) => {
      colors.forEach((color) => {
        const price = base + (stor.includes("2TB") ? 20000 : stor.includes("1TB") ? 10000 : 0)
                           + (ramOpt.includes("64") ? 25000 : ramOpt.includes("48") ? 15000 : ramOpt.includes("32") ? 8000 : 0);
        LAPTOPS.push({
          name: `${brand} ${model} ${ramOpt} ${stor} ${color}`,
          brand, category: "Electronics", subcategory: "Laptops",
          series, model, variant: `${ramOpt}/${stor}`, color,
          price, mrp: price + mrpAdd,
          stock: r(5, 80), rating: rating(), reviewCount: reviews(),
          image: img("laptop"), images: imgs("laptop"),
          description: desc,
          tags: [brand.toLowerCase(), "laptop", model.toLowerCase(), series.toLowerCase(), stor, color.toLowerCase()],
          specs: { storage: stor, ram: ramOpt, color },
          sku: sku("LAP"), warranty: "1 Year Manufacturer Warranty",
          isFeatured: price > 120000, isBestSeller: price < 70000,
        });
      });
    });
  });
});

// ════════════════════════════════════════════════════════════════════════════
// ELECTRONICS — TABLETS
// ════════════════════════════════════════════════════════════════════════════
const TABLETS = [
  // Apple iPad
  ...["iPad Pro 13 M4","iPad Pro 11 M4"].flatMap(model =>
    ["256GB","512GB","1TB"].flatMap(stor =>
      ["Space Black","Silver"].map(color => ({
        name: `Apple ${model} ${stor} WiFi ${color}`,
        brand:"Apple", category:"Electronics", subcategory:"Tablets",
        series:"iPad Pro", model, variant:`${stor} WiFi`, color,
        price: model.includes("13") ? 99900 + (stor==="512GB"?15000:stor==="1TB"?35000:0) : 79900 + (stor==="512GB"?15000:stor==="1TB"?35000:0),
        mrp: model.includes("13") ? 109900 : 89900,
        stock: r(15,80), rating: rating(), reviewCount: reviews(),
        image: img("tablet"), images: imgs("tablet"),
        description: `Ultra Retina XDR OLED display, Apple M4 chip, Apple Pencil Pro compatible, landscape front camera.`,
        tags:["apple","ipad","tablet","ios","m4"], specs:{ storage: stor, color }, sku: sku("TAB"), warranty:"1 Year",
        isFeatured: true,
      }))
    )
  ),
  ...["iPad Air 13 M2","iPad Air 11 M2"].flatMap(model =>
    ["128GB","256GB","512GB"].flatMap(stor =>
      ["Blue","Purple","Starlight","Space Gray"].map(color => ({
        name: `Apple ${model} ${stor} WiFi ${color}`,
        brand:"Apple", category:"Electronics", subcategory:"Tablets",
        series:"iPad Air", model, variant:`${stor} WiFi`, color,
        price: model.includes("13") ? 79900 + (stor==="256GB"?8000:stor==="512GB"?20000:0) : 59900 + (stor==="256GB"?8000:stor==="512GB"?20000:0),
        mrp: model.includes("13") ? 89900 : 69900,
        stock: r(20,100), rating: rating(), reviewCount: reviews(),
        image: img("tablet"), images: imgs("tablet"),
        description:`Liquid Retina display, Apple M2 chip, Touch ID, USB-C, 10hr battery, Apple Pencil compatible.`,
        tags:["apple","ipad","tablet","m2"], specs:{ storage: stor, color }, sku: sku("TAB"), warranty:"1 Year",
      }))
    )
  ),
  // Samsung Tab
  ...["Galaxy Tab S9 Ultra","Galaxy Tab S9+","Galaxy Tab S9"].flatMap(model =>
    ["128GB","256GB","512GB"].flatMap(stor =>
      ["Graphite","Beige"].map(color => ({
        name: `Samsung ${model} ${stor} WiFi ${color}`,
        brand:"Samsung", category:"Electronics", subcategory:"Tablets",
        series:"Galaxy Tab S9", model, variant:`${stor} WiFi`, color,
        price: model.includes("Ultra")?89999:model.includes("+")?74999:59999,
        mrp: model.includes("Ultra")?99999:model.includes("+")?84999:69999,
        stock: r(10,60), rating: rating(), reviewCount: reviews(),
        image: img("tablet"), images: imgs("tablet"),
        description:`Dynamic AMOLED 2X display, Snapdragon 8 Gen 2, IP68, S-Pen included, DeX mode.`,
        tags:["samsung","galaxy tab","tablet","android"], specs:{ storage: stor, color }, sku: sku("TAB"), warranty:"1 Year",
      }))
    )
  ),
];

// ════════════════════════════════════════════════════════════════════════════
// ELECTRONICS — SMARTWATCHES
// ════════════════════════════════════════════════════════════════════════════
const WATCHES = [
  ...["Apple Watch Series 10 45mm","Apple Watch Series 10 42mm","Apple Watch Ultra 2"].flatMap(model =>
    ["Jet Black","Rose Gold","Silver","Natural Titanium","Gold"].slice(0, model.includes("Ultra")?2:3).map(color => ({
      name: `Apple ${model} ${color}`,
      brand:"Apple", category:"Electronics", subcategory:"Smart Watches",
      series:"Apple Watch", model, variant:"GPS", color,
      price: model.includes("Ultra")?89900:model.includes("45")?45900:41900,
      mrp: model.includes("Ultra")?99900:model.includes("45")?49900:45900,
      stock: r(20,100), rating: rating(), reviewCount: reviews(),
      image: img("watch"), images: imgs("watch"),
      description:`Always-On Retina display, health monitoring, ECG, crash detection, IP6X dust resistance.`,
      tags:["apple watch","smartwatch","fitness tracker","ecg"], specs:{ color }, sku: sku("WAT"), warranty:"1 Year",
      isFeatured: model.includes("Ultra"),
    }))
  ),
  ...["Samsung Galaxy Watch 7 44mm","Samsung Galaxy Watch 7 40mm","Samsung Galaxy Watch Ultra"].flatMap(model =>
    ["Cream","Green","Silver","White","Titanium White","Titanium Silver"].slice(0,3).map(color => ({
      name: `Samsung ${model} ${color}`,
      brand:"Samsung", category:"Electronics", subcategory:"Smart Watches",
      series:"Galaxy Watch", model, variant:"Bluetooth", color,
      price: model.includes("Ultra")?64999:model.includes("44")?29999:26999,
      mrp: model.includes("Ultra")?74999:model.includes("44")?34999:31999,
      stock: r(15,80), rating: rating(), reviewCount: reviews(),
      image: img("watch"), images: imgs("watch"),
      description:`BioActive Sensor, sleep tracking, HR monitoring, IP68, up to 40hr battery.`,
      tags:["samsung","galaxy watch","smartwatch","fitness"], specs:{ color }, sku: sku("WAT"), warranty:"1 Year",
    }))
  ),
  ...["Garmin Fenix 7 Pro","Garmin Forerunner 965","Garmin Venu 3"].flatMap(model =>
    ["Titanium","Black","Graphite","Ivory"].slice(0,2).map(color => ({
      name: `Garmin ${model} ${color}`,
      brand:"Garmin", category:"Electronics", subcategory:"Smart Watches",
      series:"Garmin", model, variant:"GPS", color,
      price: model.includes("Fenix")?69999:model.includes("965")?54999:34999,
      mrp: model.includes("Fenix")?79999:model.includes("965")?59999:39999,
      stock: r(10,50), rating: rating(), reviewCount: reviews(),
      image: img("watch"), images: imgs("watch"),
      description:`Multisport GPS, solar charging, advanced training metrics, mapping, 18+ day battery.`,
      tags:["garmin","smartwatch","gps","sports watch"], specs:{ color }, sku: sku("WAT"), warranty:"1 Year",
    }))
  ),
];

// ════════════════════════════════════════════════════════════════════════════
// ELECTRONICS — EARBUDS & HEADPHONES
// ════════════════════════════════════════════════════════════════════════════
const AUDIO = [
  ...["AirPods Pro (2nd Gen)","AirPods 4","AirPods Max"].flatMap(model =>
    (model.includes("Max") ? ["Midnight","Starlight","Blue","Purple","Orange"] : ["White"]).map(color => ({
      name: `Apple ${model} ${color}`,
      brand:"Apple", category:"Electronics", subcategory: model.includes("Max") ? "Headphones" : "Earbuds",
      series:"AirPods", model, variant:"Wireless", color,
      price: model.includes("Max")?59900:model.includes("Pro")?26900:14900,
      mrp: model.includes("Max")?69900:model.includes("Pro")?29900:17900,
      stock: r(50,300), rating: rating(), reviewCount: reviews(),
      image: model.includes("Max") ? img("headphones") : img("earbuds"),
      images: imgs(model.includes("Max") ? "headphones" : "earbuds"),
      description:`Active Noise Cancellation, Adaptive Transparency, Spatial Audio, H2 chip.`,
      tags:["apple","airpods","earbuds","anc","wireless"], specs:{ color }, sku: sku("AUD"), warranty:"1 Year",
      isFeatured: model.includes("Max"),
    }))
  ),
  ...["Sony WH-1000XM6","Sony WF-1000XM5","Sony WH-1000XM5"].flatMap(model =>
    ["Black","Platinum Silver","Midnight Blue"].slice(0,2).map(color => ({
      name: `Sony ${model} ${color}`,
      brand:"Sony", category:"Electronics", subcategory: model.startsWith("Sony WF") ? "Earbuds" : "Headphones",
      series:"Sony XM Series", model, variant:"Wireless", color,
      price: model.includes("XM6")?39999:model.includes("WF")?24999:29999,
      mrp: model.includes("XM6")?44999:model.includes("WF")?29999:34999,
      stock: r(30,150), rating: rating(), reviewCount: reviews(),
      image: model.startsWith("Sony WF") ? img("earbuds") : img("headphones"),
      images: imgs(model.startsWith("Sony WF") ? "earbuds" : "headphones"),
      description:`Industry-leading noise cancellation, LDAC, multipoint connection, Speak-to-Chat.`,
      tags:["sony","headphones","anc","wireless","hi-res"], specs:{ color }, sku: sku("AUD"), warranty:"1 Year",
    }))
  ),
  ...["Bose QuietComfort 45","Bose QuietComfort Ultra Earbuds","Bose QuietComfort Earbuds II"].flatMap(model =>
    ["Black","White Smoke"].map(color => ({
      name: `Bose ${model} ${color}`,
      brand:"Bose", category:"Electronics", subcategory: model.includes("Earbud") ? "Earbuds" : "Headphones",
      series:"Bose QuietComfort", model, variant:"Wireless", color,
      price: model.includes("QC 45")||model.includes("45")?29999:model.includes("Ultra")?34999:27999,
      mrp: 34999,
      stock: r(20,100), rating: rating(), reviewCount: reviews(),
      image: model.includes("Earbud") ? img("earbuds") : img("headphones"),
      images: imgs(model.includes("Earbud") ? "earbuds" : "headphones"),
      description:`World-class noise cancellation, Immersive Audio, CustomTune technology.`,
      tags:["bose","headphones","anc","wireless"], specs:{ color }, sku: sku("AUD"), warranty:"1 Year",
    }))
  ),
  ...["Sennheiser Momentum 4","JBL Live 770NC","Jabra Elite 10"].flatMap(model =>
    ["Black","White","Beige","Navy"].slice(0,2).map(color => ({
      name: `${model.split(" ")[0]} ${model.split(" ").slice(1).join(" ")} ${color}`,
      brand: model.split(" ")[0], category:"Electronics", subcategory:"Headphones",
      series: model.split(" ").slice(0,-1).join(" "), model, variant:"Wireless", color,
      price: model.includes("Sennheiser")?32999:model.includes("JBL")?14999:22999,
      mrp: model.includes("Sennheiser")?37999:model.includes("JBL")?17999:26999,
      stock: r(20,120), rating: rating(), reviewCount: reviews(),
      image: img("headphones"), images: imgs("headphones"),
      description:`Premium ANC headphones with Hi-Res audio, multipoint Bluetooth, long battery life.`,
      tags:["headphones","wireless","anc",model.split(" ")[0].toLowerCase()], specs:{ color }, sku: sku("AUD"), warranty:"1 Year",
    }))
  ),
];

// ════════════════════════════════════════════════════════════════════════════
// ELECTRONICS — TELEVISIONS
// ════════════════════════════════════════════════════════════════════════════
const TVS = [];
const tvDef = [
  { brand:"LG",      sizes:["55","65","75","83"], models:["LG C4 OLED","LG G4 OLED"],     basePrice:[109999,149999,219999,299999], desc:"OLED evo panel, α9 AI Processor, Dolby Vision IQ, 120Hz HDMI 2.1." },
  { brand:"Samsung", sizes:["55","65","75"],       models:["Samsung QN90D Neo QLED"],       basePrice:[99999,149999,219999],         desc:"Neo QLED 4K, Quantum Matrix Technology, Real Depth Enhancer, Object Tracking Sound." },
  { brand:"Sony",    sizes:["55","65","75"],       models:["Sony Bravia 9","Sony Bravia 7"], basePrice:[129999,189999,279999],        desc:"QD-OLED / Mini LED, XR Processor, Google TV, HDMI 2.1 eARC." },
  { brand:"OnePlus", sizes:["55","65"],            models:["OnePlus TV 65 Y4 Pro"],          basePrice:[54999,74999],                 desc:"4K LED, 144Hz, QLED, OnePlus Connect, Far-field voice control." },
  { brand:"TCL",     sizes:["55","65","75"],       models:["TCL C845 QD-Mini LED"],          basePrice:[59999,89999,129999],          desc:"4K QD-Mini LED 144Hz, Dolby Vision IQ, HDR10+, AiPQ Engine." },
];
tvDef.forEach(({ brand, sizes, models, basePrice, desc }) => {
  models.forEach(model => {
    sizes.forEach((size, i) => {
      TVS.push({
        name: `${brand} ${size}-inch ${model.replace(brand,"").trim()}`,
        brand, category:"Electronics", subcategory:"Televisions",
        series: model, model: `${size}-inch ${model}`, variant:`${size}"`, color:"Black",
        price: basePrice[i], mrp: basePrice[i] + 15000,
        stock: r(5,40), rating: rating(), reviewCount: reviews(),
        image: img("tv"), images: imgs("tv"),
        description: desc,
        tags:[brand.toLowerCase(),"tv","television","4k","oled","qled",`${size} inch`], specs:{ size:`${size}"` }, sku: sku("TV"), warranty:"1 Year Panel + 1 Year Comprehensive",
        isFeatured: parseInt(size) >= 65,
      });
    });
  });
});

// ════════════════════════════════════════════════════════════════════════════
// ELECTRONICS — GAMING
// ════════════════════════════════════════════════════════════════════════════
const GAMING = [
  { name:"Sony PlayStation 5 (Disc Edition)", brand:"Sony", subcategory:"Gaming Consoles", model:"PS5", price:54990, mrp:59990, desc:"AMD Zen 2, RDNA 2, 1TB SSD, 4K@120fps, DualSense haptics, ray tracing.", image:img("gaming") },
  { name:"Sony PlayStation 5 Slim (Disc)", brand:"Sony", subcategory:"Gaming Consoles", model:"PS5 Slim", price:44990, mrp:49990, desc:"Slimmer PS5 design, 1TB SSD, 4K gaming, DualSense controller included.", image:img("gaming") },
  { name:"Microsoft Xbox Series X", brand:"Microsoft", subcategory:"Gaming Consoles", model:"Xbox Series X", price:49990, mrp:54990, desc:"12 TFLOPS GPU, 1TB SSD, 4K@120fps, Quick Resume, Game Pass ready.", image:img("gaming") },
  { name:"Microsoft Xbox Series S 1TB", brand:"Microsoft", subcategory:"Gaming Consoles", model:"Xbox Series S", price:34990, mrp:39990, desc:"1440p gaming, 1TB SSD, all-digital, Xbox Game Pass compatible.", image:img("gaming") },
  { name:"Nintendo Switch OLED", brand:"Nintendo", subcategory:"Gaming Consoles", model:"Switch OLED", price:29990, mrp:34990, desc:"7-inch OLED screen, dock included, 64GB storage, enhanced audio, wired LAN port.", image:img("gaming") },
  { name:"Nintendo Switch 2", brand:"Nintendo", subcategory:"Gaming Consoles", model:"Switch 2", price:39990, mrp:44990, desc:"Next-gen Nintendo console, magnetic Joy-Con 2, 4K dock mode, backward compatible.", image:img("gaming") },
  ...["Razer DeathAdder V3 Pro","Razer Viper V3 Pro","Logitech G Pro X Superlight 2","Logitech G502 X Plus","SteelSeries Aerox 5"].map(m => ({
    name: m, brand: m.split(" ")[0], subcategory:"Gaming Mouse", model: m, color:"Black",
    price: m.includes("Razer")||m.includes("Superlight")?14999:m.includes("Logitech")?12999:11999,
    mrp: 17999, desc:"Ultra-lightweight gaming mouse with high-precision sensor, wireless, programmable buttons.",
    image: img("mouse"),
  })),
  ...["Razer BlackWidow V4 Pro","Corsair K100 RGB Air","HyperX Alloy Origins 65","SteelSeries Apex Pro TKL"].map(m => ({
    name: m, brand: m.split(" ")[0], subcategory:"Gaming Keyboards", model: m, color:"Black",
    price: m.includes("Corsair")||m.includes("Razer")?14999:9999, mrp:18999,
    desc:"Mechanical gaming keyboard, programmable RGB, anti-ghosting, tactile switches.",
    image: img("keyboard"),
  })),
  ...["Razer BlackShark V2 Pro","SteelSeries Arctis Nova Pro","HyperX Cloud Alpha Wireless","Logitech G Pro X 2"].map(m => ({
    name: m, brand: m.split(" ")[0], subcategory:"Gaming Headsets", model: m, color:"Black",
    price: m.includes("Nova")?24999:m.includes("Razer")?14999:12999, mrp:18999,
    desc:"Premium gaming headset with spatial audio, noise-cancelling mic, wireless connectivity.",
    image: img("headphones"),
  })),
].map(p => ({
  ...p,
  category:"Electronics", series: p.subcategory, variant: p.variant || "Standard", color: p.color || "Black",
  stock: r(10,80), rating: rating(), reviewCount: reviews(),
  images: imgs(p.subcategory.includes("Mouse") ? "mouse" : p.subcategory.includes("Key") ? "keyboard" : p.subcategory.includes("Head") ? "headphones" : "gaming"),
  tags:[p.brand?.toLowerCase(),"gaming",p.subcategory.toLowerCase().replace(" ","")],
  specs:{}, sku: sku("GAM"), warranty:"1 Year",
}));

// ════════════════════════════════════════════════════════════════════════════
// FASHION — SHIRTS / TOPS
// ════════════════════════════════════════════════════════════════════════════
const FASHION = [];

const shirtDef = [
  { brand:"Allen Solly", model:"Men's Slim Fit Oxford Shirt", colors:["White","Light Blue","Pink","Lavender","Black"], sizes:["S","M","L","XL","XXL"], price:1499, mrp:2499, desc:"100% cotton Oxford weave, slim fit, spread collar, single chest pocket, machine washable." },
  { brand:"Van Heusen",  model:"Men's Regular Fit Formal Shirt", colors:["White","Sky Blue","Off-White","Grey"], sizes:["S","M","L","XL","XXL"], price:1299, mrp:2199, desc:"Cotton-polyester blend, wrinkle-resistant, full sleeve, spread collar." },
  { brand:"Raymond",     model:"Men's Premium Cotton Shirt", colors:["White","Blue","Mint Green","Peach"], sizes:["S","M","L","XL","XXL"], price:1799, mrp:2999, desc:"Premium cotton, regular fit, full sleeves, spread collar, easy iron." },
  { brand:"Arrow",       model:"Men's Slim Fit Shirt", colors:["White","Light Blue","Stripes Blue/White"], sizes:["S","M","L","XL"], price:2199, mrp:3499, desc:"100% cotton, slim fit, spread collar, no iron technology." },
  { brand:"Peter England",model:"Men's Casual Shirt", colors:["Navy","White","Yellow","Grey"], sizes:["S","M","L","XL","XXL"], price:999, mrp:1799, desc:"Cotton blend, slim fit, full sleeve, patch pocket, casual wear." },
  { brand:"H&M",         model:"Women's Oversized Shirt", colors:["White","Light Blue","Beige","Black"], sizes:["XS","S","M","L","XL"], price:1299, mrp:1999, desc:"Cotton blend, oversized fit, long sleeves, relaxed collar, casual wear." },
  { brand:"Zara",        model:"Women's Satin Shirt", colors:["White","Beige","Pink","Green"], sizes:["XS","S","M","L","XL"], price:2999, mrp:4499, desc:"Satin fabric, relaxed fit, square neck, long sleeves, elegant design." },
  { brand:"Nike",        model:"Men's Dri-FIT T-Shirt", colors:["Black","White","Navy","Red","Grey"], sizes:["S","M","L","XL","XXL","3XL"], price:1299, mrp:1999, desc:"100% polyester Dri-FIT fabric, crew neck, standard fit, moisture-wicking." },
  { brand:"Adidas",      model:"Men's Essentials T-Shirt", colors:["Black","White","Navy","Green","Red"], sizes:["S","M","L","XL","XXL"], price:999, mrp:1799, desc:"Cotton jersey, regular fit, crew neck, ribbed collar, Adidas badge." },
  { brand:"Puma",        model:"Men's Active Polo", colors:["Black","White","Navy","Red"], sizes:["S","M","L","XL","XXL"], price:1199, mrp:1799, desc:"Polyester, moisture-wicking, polo collar, 3-button placket, dryCELL technology." },
];

shirtDef.forEach(({ brand, model, colors, sizes, price, mrp, desc }) => {
  colors.forEach(color => {
    sizes.forEach(size => {
      FASHION.push({
        name: `${brand} ${model} - ${color} - ${size}`,
        brand, category:"Fashion", subcategory:"Shirts & Tops",
        series:"Men's Formals", model, variant:size, color, size,
        price, mrp, stock: r(20,200), rating: rating(), reviewCount: reviews(),
        image: img("shirt"), images: imgs("shirt"),
        description: desc,
        tags:[brand.toLowerCase(),"shirt","top",color.toLowerCase(),size.toLowerCase(),"men"],
        specs:{ color, size }, sku: sku("FSH"), warranty:"No Warranty",
      });
    });
  });
});

// Jeans
const jeansDef = [
  { brand:"Levi's", model:"511 Slim Fit Jeans", colors:["Dark Blue","Black","Light Blue","Stone Wash"], sizes:["28","30","32","34","36"], price:3499, mrp:4999, desc:"99% cotton 1% elastane, slim through hip and thigh, zip fly with button." },
  { brand:"Levi's", model:"501 Original Fit Jeans", colors:["Dark Blue","Light Blue","Black"], sizes:["28","30","32","34","36","38"], price:3999, mrp:5499, desc:"100% cotton, straight leg, original fit, button fly, Levi's classic." },
  { brand:"Lee",    model:"Lee Regular Fit Jeans", colors:["Blue","Dark Navy","Black"], sizes:["30","32","34","36","38"], price:2499, mrp:3999, desc:"Denim, regular fit, mid-rise, 5-pocket styling, zip fly." },
  { brand:"Wrangler",model:"Men's Regular Straight Jeans", colors:["Blue Denim","Black","Dark Grey"], sizes:["30","32","34","36","38"], price:1999, mrp:3499, desc:"Denim, regular straight fit, 5-pocket, durable stitching." },
  { brand:"H&M", model:"Women's Skinny Jeans", colors:["Dark Blue","Black","Light Blue"], sizes:["XS","S","M","L","XL"], price:1999, mrp:2999, desc:"Cotton blend, skinny fit, high waist, 5-pocket styling." },
];
jeansDef.forEach(({ brand, model, colors, sizes, price, mrp, desc }) => {
  colors.forEach(color => {
    sizes.forEach(size => {
      FASHION.push({
        name: `${brand} ${model} - ${color} - W${size}`,
        brand, category:"Fashion", subcategory:"Jeans & Trousers",
        series:"Denim", model, variant:size, color, size,
        price, mrp, stock: r(15,150), rating: rating(), reviewCount: reviews(),
        image: img("jeans"), images: imgs("jeans"),
        description: desc,
        tags:[brand.toLowerCase(),"jeans","denim",color.toLowerCase()],
        specs:{ color, size }, sku: sku("FJN"), warranty:"No Warranty",
      });
    });
  });
});

// Shoes & Sneakers
const shoesDef = [
  { brand:"Nike", model:"Air Max 270", colors:["Black/White","White/Volt","Triple White","Black/Red"], sizes:["UK6","UK7","UK8","UK9","UK10","UK11"], price:10995, mrp:12995, desc:"Max Air heel unit, breathable mesh, foam midsole, high-rebound rubber outsole.", key:"sneakers" },
  { brand:"Nike", model:"Air Force 1 '07", colors:["White","Black","Triple Black","Royal Blue"], sizes:["UK6","UK7","UK8","UK9","UK10"], price:7995, mrp:9995, desc:"Leather upper, pivot point rubber outsole, Air-Sole unit, iconic cupsole.", key:"sneakers" },
  { brand:"Nike", model:"React Infinity Run FK 3", colors:["Black","White","Ghost","Crimson"], sizes:["UK6","UK7","UK8","UK9","UK10","UK11"], price:10995, mrp:12495, desc:"React foam, rocker shape, wide base, wide toe box for injury prevention.", key:"shoes" },
  { brand:"Adidas", model:"Ultraboost 23", colors:["Core Black","Cloud White","Wonder White"], sizes:["UK6","UK7","UK8","UK9","UK10","UK11"], price:15999, mrp:19999, desc:"Primeknit+ upper, Boost midsole, Continental rubber outsole, Torsion System.", key:"sneakers" },
  { brand:"Adidas", model:"Stan Smith", colors:["Cloud White/Green","Cloud White/Navy","Triple White"], sizes:["UK5","UK6","UK7","UK8","UK9","UK10"], price:7499, mrp:8999, desc:"Leather upper, serrated 3-Stripes, Ortholite sockliner, the original tennis sneaker.", key:"sneakers" },
  { brand:"Puma", model:"RS-X Toys", colors:["White-Puma Black","Puma White-Rose Gold"], sizes:["UK6","UK7","UK8","UK9","UK10"], price:5999, mrp:7999, desc:"Mesh and synthetic upper, Running System technology, cushioned RS foam.", key:"sneakers" },
  { brand:"Reebok", model:"Classic Leather", colors:["White","Black","Chalk"], sizes:["UK5","UK6","UK7","UK8","UK9","UK10"], price:5499, mrp:6999, desc:"Full grain leather upper, low-cut silhouette, EVA midsole, rubber outsole.", key:"shoes" },
  { brand:"New Balance", model:"990v6", colors:["Grey","Black","Navy"], sizes:["UK6","UK7","UK8","UK9","UK10","UK11"], price:17999, mrp:21999, desc:"Made in USA, ENCAP midsole, pigskin upper, premier running shoe.", key:"sneakers" },
  { brand:"Woodland", model:"Men's Hiking Boots", colors:["Camel","Dark Brown","Olive Green"], sizes:["UK6","UK7","UK8","UK9","UK10"], price:3999, mrp:5999, desc:"Genuine leather upper, Vibram outsole, waterproof treatment, ankle support.", key:"shoes" },
  { brand:"Bata", model:"Men's Formal Oxford", colors:["Black","Brown"], sizes:["UK6","UK7","UK8","UK9","UK10"], price:1999, mrp:3499, desc:"Genuine leather upper, cushioned footbed, formal Oxford styling.", key:"shoes" },
];
shoesDef.forEach(({ brand, model, colors, sizes, price, mrp, desc, key }) => {
  colors.forEach(color => {
    sizes.forEach(size => {
      FASHION.push({
        name: `${brand} ${model} - ${color} - ${size}`,
        brand, category:"Fashion", subcategory:"Footwear",
        series:brand+" Footwear", model, variant:size, color, size,
        price, mrp, stock: r(10,100), rating: rating(), reviewCount: reviews(),
        image: img(key), images: imgs(key),
        description: desc,
        tags:[brand.toLowerCase(),"shoes","footwear",color.toLowerCase(),size.toLowerCase()],
        specs:{ color, size }, sku: sku("FSH"), warranty:"No Warranty",
      });
    });
  });
});

// ════════════════════════════════════════════════════════════════════════════
// HOME & KITCHEN
// ════════════════════════════════════════════════════════════════════════════
const HOME = [];

const applianceDef = [
  { brand:"Prestige", model:"Induction Cooktop PDIC 2.0", price:2499, mrp:3499, subcategory:"Kitchen Appliances", desc:"1900W, 8 preset menus, feather touch, auto-off, 2-year warranty.", image:"kitchen" },
  { brand:"Philips",  model:"Air Fryer HD9200 4.1L", price:7999, mrp:10999, subcategory:"Kitchen Appliances", desc:"Rapid Air 1400W, 7 programs, dishwasher-safe basket, rapid-cooking.", image:"kitchen" },
  { brand:"Philips",  model:"Air Fryer XXL HD9860 7L", price:13999, mrp:17999, subcategory:"Kitchen Appliances", desc:"7L dual layer, 2000W, Smart Sensing Technology, Fat Removal Technology.", image:"kitchen" },
  { brand:"Bosch",    model:"Dishwasher SMS66GI01I 12-Place", price:34999, mrp:44999, subcategory:"Kitchen Appliances", desc:"12 place settings, A+++ energy rating, AquaStop, ExtraDry, 5 programs.", image:"kitchen" },
  { brand:"Whirlpool",model:"Microwave Oven 20L Solo", price:7999, mrp:10999, subcategory:"Kitchen Appliances", desc:"20L, 700W, 5 power levels, defrost, child lock, auto-cook menus.", image:"kitchen" },
  { brand:"IFB",      model:"Steam 20 SC3 Microwave 20L", price:14999, mrp:18999, subcategory:"Kitchen Appliances", desc:"20L, steam clean, 51 autocook menus, multi-stage cooking, Tactile control.", image:"kitchen" },
  { brand:"LG",       model:"Refrigerator GL-T302RPZY 284L", price:29999, mrp:37999, subcategory:"Home Appliances", desc:"3-Star, frost-free, Smart Inverter Compressor, Moist Balance Crisper, DoorCooling+.", image:"kitchen" },
  { brand:"Samsung",  model:"Refrigerator RT39T50 363L", price:34999, mrp:42999, subcategory:"Home Appliances", desc:"3-Star, frost-free, All-Around Cooling, Deodorizer, Digital Inverter Compressor.", image:"kitchen" },
  { brand:"Godrej",   model:"Refrigerator RF GF 2552PTH 255L", price:24999, mrp:31999, subcategory:"Home Appliances", desc:"2-Star, frost-free, Nano Shield Technology, VersaSpace shelves, 10yr compressor.", image:"kitchen" },
  { brand:"IFB",      model:"Front Load Washing Machine 7kg", price:29999, mrp:38000, subcategory:"Home Appliances", desc:"1200RPM, 10 wash programs, in-built heater, AI Wash, 4-year comprehensive warranty.", image:"kitchen" },
  { brand:"LG",       model:"Front Load Washing Machine FHM1408BDL 8kg", price:39999, mrp:49000, subcategory:"Home Appliances", desc:"1400RPM, AI Direct Drive, Steam, 6 Motion DD, TurboWash 360, 5-star rating.", image:"kitchen" },
  { brand:"Dyson",    model:"V15 Detect Absolute", price:54900, mrp:61900, subcategory:"Home Appliances", desc:"240AW suction, laser dust detection, HEPA filtration, LCD screen, 60-min runtime.", image:"kitchen" },
  { brand:"Eureka Forbes",model:"Aquaguard Reviva RO+UV+MTDS", price:12999, mrp:16999, subcategory:"Home Appliances", desc:"RO+UV+MTDS, 7-stage purification, 7L storage, mineral fortification, 15 LPH.", image:"kitchen" },
  { brand:"Pigeon",   model:"Contura 750W Mixer Grinder", price:2499, mrp:3999, subcategory:"Kitchen Appliances", desc:"750W, 3 SS jars, 3-speed + pulse, poly-carbonate lid, 2-year warranty.", image:"kitchen" },
  { brand:"Prestige", model:"Popular Plus 5L Pressure Cooker", price:1299, mrp:1799, subcategory:"Cookware", desc:"Aluminum, 5L, safety valve, hard anodized, ISI marked, 5-year warranty.", image:"kitchen" },
  { brand:"Hawkins",  model:"Contura 3L Pressure Cooker", price:1999, mrp:2699, subcategory:"Cookware", desc:"Hard-anodized, 3L, Contura body, cool-touch handles, 5-year warranty.", image:"kitchen" },
  { brand:"Wonderchef",model:"Granite Non-Stick Cookset 5pc", price:3499, mrp:4999, subcategory:"Cookware", desc:"5-piece: kadai, frypan, saucepan, tawa + lids, PFOA-free granite coating.", image:"kitchen" },
  { brand:"Milton",   model:"Thermosteel Flask 750ml", price:799, mrp:1299, subcategory:"Storage", desc:"Double-wall stainless steel, 24hr hot/cold, leak-proof, BPA-free, comes in gift box.", image:"kitchen" },
  { brand:"Borosil",  model:"Glass Mixing Bowl Set 3pc", price:799, mrp:1299, subcategory:"Storage", desc:"Borosilicate glass, microwave/oven/dishwasher safe, airtight lids, 0.5L/1.5L/3L.", image:"kitchen" },
  { brand:"Tupperware",model:"Fridge Smart Container 4pc", price:2499, mrp:3499, subcategory:"Storage", desc:"BPA-free, airtight, modular, microwave safe, dishwasher safe, 4-piece set.", image:"kitchen" },
];

applianceDef.forEach(({ brand, model, price, mrp, subcategory, desc, image }) => {
  ["Standard"].forEach(variant => {
    HOME.push({
      name: `${brand} ${model}`,
      brand, category:"Home & Kitchen", subcategory,
      series: brand, model, variant, color:"",
      price, mrp, stock: r(10,80), rating: rating(), reviewCount: reviews(),
      image: img(image), images: imgs(image),
      description: desc,
      tags:[brand.toLowerCase(),subcategory.toLowerCase().split(" ")[0],model.toLowerCase()],
      specs:{}, sku: sku("HKT"), warranty:"1 Year Manufacturer Warranty",
    });
  });
});

// Furniture
const furnitureDef = [
  { brand:"IKEA",  model:"KALLAX 4x2 Shelf Unit", price:9999, mrp:12999, subcategory:"Furniture", colors:["White","Black-Brown","Birch"], desc:"Particleboard, 147x77cm, 8 cubby holes, can be hung or freestanding.", image:"furniture" },
  { brand:"IKEA",  model:"MALM Bed Frame Queen", price:19999, mrp:24999, subcategory:"Furniture", colors:["White","Black-Brown","Oak Veneer"], desc:"Particleboard, Queen size 160x200cm, slatted bed base included, adjustable side tables.", image:"furniture" },
  { brand:"Nilkamal",model:"Montoya 6-Seater Dining Set", price:24999, mrp:34999, subcategory:"Furniture", colors:["Walnut","Wenge","Natural"], desc:"Engineered wood, tempered glass top, 6 chairs, metallic legs, easy assembly.", image:"furniture" },
  { brand:"Godrej Interio",model:"Slimline 2-Door Wardrobe", price:29999, mrp:39999, subcategory:"Furniture", colors:["Slate","Walnut","Ivory"], desc:"MDF, 2 doors, full-length mirror, 4 shelves + hanging rod, 5-year warranty.", image:"furniture" },
  { brand:"Wakefit",model:"Orthopaedic Memory Foam Mattress Queen", price:14999, mrp:19999, subcategory:"Mattresses", colors:["White"], desc:"8-inch, dual comfort foam, orthopaedic zone, removable cover, 10-year warranty.", image:"mattress" },
  { brand:"Wakefit",model:"Orthopaedic Memory Foam Mattress King", price:17999, mrp:23999, subcategory:"Mattresses", colors:["White"], desc:"8-inch, dual comfort foam, king size 183x198cm, orthopaedic support zone.", image:"mattress" },
  { brand:"Sunday",model:"The Classic Orthopedic Mattress Queen", price:19999, mrp:26999, subcategory:"Mattresses", colors:["White"], desc:"Natural latex + memory foam, zoned support, organic cotton cover, 10-year warranty.", image:"mattress" },
];
furnitureDef.forEach(({ brand, model, price, mrp, subcategory, colors, desc, image }) => {
  colors.forEach(color => {
    HOME.push({
      name: `${brand} ${model}${colors.length > 1 ? " - "+color : ""}`,
      brand, category:"Home & Kitchen", subcategory,
      series: brand, model, variant: color, color,
      price, mrp, stock: r(5,30), rating: rating(), reviewCount: reviews(),
      image: img(image), images: imgs(image),
      description: desc,
      tags:[brand.toLowerCase(),subcategory.toLowerCase(),color.toLowerCase()],
      specs:{ color }, sku: sku("FRN"), warranty:"1 Year",
    });
  });
});

// ════════════════════════════════════════════════════════════════════════════
// BEAUTY & PERSONAL CARE
// ════════════════════════════════════════════════════════════════════════════
const BEAUTY = [];

const beautyDef = [
  // Skincare
  { brand:"Minimalist", model:"10% Niacinamide Face Serum 30ml", price:599, mrp:799, sub:"Skin Care", desc:"10% niacinamide + zinc, controls sebum, minimises pores, no parabens.", image:"skincare" },
  { brand:"Minimalist", model:"Vitamin C 10% Brightening Serum 30ml", price:599, mrp:799, sub:"Skin Care", desc:"Ethyl ascorbic acid, brightening, anti-oxidant, no added fragrance.", image:"skincare" },
  { brand:"Minimalist", model:"AHA 25% + BHA 2% Exfoliating Peel", price:499, mrp:699, sub:"Skin Care", desc:"Chemical exfoliant, fades dark spots, improves texture, use twice weekly.", image:"skincare" },
  { brand:"Cetaphil",   model:"Gentle Skin Cleanser 500ml", price:749, mrp:999, sub:"Skin Care", desc:"Soap-free, non-comedogenic, hydrating, suitable for sensitive skin.", image:"skincare" },
  { brand:"Cetaphil",   model:"Moisturizing Cream 250g", price:599, mrp:799, sub:"Skin Care", desc:"24h moisturization, ceramides, niacinamide, for dry and sensitive skin.", image:"skincare" },
  { brand:"L'Oreal",    model:"Revitalift Vitamin C Serum 30ml", price:999, mrp:1499, sub:"Skin Care", desc:"2% pure vitamin C, anti-wrinkle, brightening, dermatologist tested.", image:"skincare" },
  { brand:"Plum",       model:"Green Tea Face Wash 100ml", price:299, mrp:399, sub:"Skin Care", desc:"Green tea + willow bark, pore-minimizing, oil-control, SLS-free.", image:"skincare" },
  { brand:"Mamaearth",  model:"Ubtan Face Pack 100g", price:299, mrp:399, sub:"Skin Care", desc:"Turmeric + saffron, brightens skin, removes tan, no harmful chemicals.", image:"skincare" },
  { brand:"Forest Essentials",model:"Facial Cleanser Milk 100ml", price:1295, mrp:1495, sub:"Skin Care", desc:"Rose petal & milk cream, ayurvedic, sulfate-free, gentle cleansing.", image:"skincare" },
  { brand:"Himalaya",   model:"Purifying Neem Face Wash 150ml", price:189, mrp:249, sub:"Skin Care", desc:"Neem + turmeric, purifies skin, controls acne, removes excess oil.", image:"skincare" },
  // Hair Care
  { brand:"Mamaearth",  model:"Onion Hair Oil 250ml", price:349, mrp:499, sub:"Hair Care", desc:"Onion + redensyl, controls hair fall, promotes growth, toxin-free.", image:"haircare" },
  { brand:"WOW",        model:"Apple Cider Vinegar Shampoo 300ml", price:499, mrp:699, sub:"Hair Care", desc:"DHT blocker, reduces dandruff, sulfate-free, paraben-free, adds shine.", image:"haircare" },
  { brand:"TRESemmé",   model:"Keratin Smooth Shampoo 340ml", price:299, mrp:399, sub:"Hair Care", desc:"Keratin + marula oil, tames frizz, smooth and glossy finish.", image:"haircare" },
  { brand:"Pantene",    model:"Pro-V Long Black Shampoo 340ml", price:299, mrp:399, sub:"Hair Care", desc:"Pro-Vitamin B5, strengthens hair, reduces breakage, nourishing formula.", image:"haircare" },
  { brand:"Dove",       model:"Intense Repair Shampoo 340ml", price:279, mrp:369, sub:"Hair Care", desc:"Keratin Actives, repairs 3-months of damage in 3 weeks, nourishing.", image:"haircare" },
  { brand:"L'Oreal",    model:"Total Repair 5 Shampoo 640ml", price:499, mrp:699, sub:"Hair Care", desc:"Pro-Keratin + Ceramide, 5 damage problems, strengthens + smooths.", image:"haircare" },
  // Makeup
  { brand:"Maybelline",  model:"Fit Me Matte+Poreless Foundation 30ml", price:449, mrp:699, sub:"Makeup", desc:"Natural matte finish, 24h oil control, 15 shades, SPF 22.", image:"makeup" },
  { brand:"Maybelline",  model:"Colossal Kajal Black 0.35g", price:99, mrp:149, sub:"Makeup", desc:"Intense black, 12h stay, smudge-proof, ophthalmologist tested.", image:"makeup" },
  { brand:"Lakme",       model:"Eyeconic Kajal Black", price:175, mrp:225, sub:"Makeup", desc:"Ultra-black kohl formula, 12h wear, soft texture, smudge-proof.", image:"makeup" },
  { brand:"Nykaa",       model:"All Day Matte Lipstick", price:349, mrp:499, sub:"Makeup", desc:"4g, 24h wear, high-pigment, non-drying, 32 shades available.", image:"makeup" },
  { brand:"Sugar",       model:"Matte Attack Transferproof Lipstick", price:499, mrp:699, sub:"Makeup", desc:"100% transfer proof, 12h stay, matte finish, available in 30 shades.", image:"makeup" },
  { brand:"M.A.C",       model:"Ruby Woo Retro Matte Lipstick 3g", price:1799, mrp:1999, sub:"Makeup", desc:"Iconic vivid blue-red, matte texture, highly pigmented, long-wearing.", image:"makeup" },
  // Grooming
  { brand:"Braun",       model:"Series 9 Pro Electric Shaver 9465cc", price:24999, mrp:31999, sub:"Men's Grooming", desc:"5 sync blades, SmartCare Center, 100% waterproof, 60min runtime.", image:"skincare" },
  { brand:"Philips",     model:"Trimmer BT5515/15 Series 5000", price:1999, mrp:2999, sub:"Men's Grooming", desc:"DuraPower technology, 13 length settings, 60-min runtime, USB charging.", image:"skincare" },
  { brand:"Gillette",    model:"Fusion ProGlide Power Razor", price:699, mrp:999, sub:"Men's Grooming", desc:"5 anti-friction blades, Flexball handle, lubricating strip, precision trimmer.", image:"skincare" },
  { brand:"Bombay Shaving Company",model:"Shaving Kit 5-piece", price:999, mrp:1499, sub:"Men's Grooming", desc:"Pre-shave scrub, shaving gel, after-shave balm, razor + brush, gift set.", image:"skincare" },
];

beautyDef.forEach(({ brand, model, price, mrp, sub, desc, image }) => {
  BEAUTY.push({
    name: `${brand} ${model}`,
    brand, category:"Beauty & Personal Care", subcategory: sub,
    series: brand, model, variant:"Standard", color:"",
    price, mrp, stock: r(50,500), rating: rating(), reviewCount: reviews(),
    image: img(image), images: imgs(image),
    description: desc,
    tags:[brand.toLowerCase(),sub.toLowerCase().replace(/ /g,"-"),model.toLowerCase()],
    specs:{}, sku: sku("BTY"), warranty:"No Warranty",
    isBestSeller: price < 500,
  });
});

// ════════════════════════════════════════════════════════════════════════════
// BOOKS
// ════════════════════════════════════════════════════════════════════════════
const bookDef = [
  // Self Help / Business
  { name:"Atomic Habits", brand:"James Clear", sub:"Self Help", price:399, mrp:599, desc:"Framework for building good habits and breaking bad ones. #1 bestseller.", tags:["habits","productivity","bestseller"] },
  { name:"The Psychology of Money", brand:"Morgan Housel", sub:"Finance", price:349, mrp:499, desc:"19 short stories exploring the strange ways people think about money.", tags:["finance","money","investing"] },
  { name:"Rich Dad Poor Dad", brand:"Robert Kiyosaki", sub:"Finance", price:299, mrp:399, desc:"What the rich teach their kids about money that the poor and middle class do not.", tags:["finance","money","investing"] },
  { name:"Zero to One", brand:"Peter Thiel", sub:"Business", price:349, mrp:499, desc:"Notes on startups and how to build the future. Essential entrepreneurship reading.", tags:["startup","business","entrepreneurship"] },
  { name:"The Lean Startup", brand:"Eric Ries", sub:"Business", price:449, mrp:599, desc:"Build-Measure-Learn framework. How today's entrepreneurs use continuous innovation.", tags:["startup","business","agile"] },
  { name:"Deep Work", brand:"Cal Newport", sub:"Self Help", price:349, mrp:499, desc:"Rules for focused success in a distracted world. Professional activities performed in deep focus.", tags:["productivity","focus","self-help"] },
  { name:"Can't Hurt Me", brand:"David Goggins", sub:"Self Help", price:599, mrp:799, desc:"Master your mind and defy the odds. Navy SEAL memoir about mental toughness.", tags:["motivation","fitness","memoir"] },
  { name:"Ikigai", brand:"Francesc Miralles & Héctor García", sub:"Self Help", price:299, mrp:399, desc:"The Japanese secret to a long and happy life. Purpose, passion, mission, vocation.", tags:["japanese","philosophy","happiness"] },
  { name:"The 5 AM Club", brand:"Robin Sharma", sub:"Self Help", price:349, mrp:499, desc:"Own your morning, elevate your life. 20/20/20 morning formula.", tags:["morning routine","productivity","self-help"] },
  { name:"Sapiens: A Brief History of Humankind", brand:"Yuval Noah Harari", sub:"History", price:499, mrp:699, desc:"How Homo sapiens conquered the world. Covers cognitive, agricultural and scientific revolutions.", tags:["history","science","bestseller"] },
  { name:"Thinking, Fast and Slow", brand:"Daniel Kahneman", sub:"Psychology", price:499, mrp:699, desc:"Two systems that drive the way we think — intuition vs deliberate thinking.", tags:["psychology","decision making","cognitive"] },
  { name:"The Alchemist", brand:"Paulo Coelho", sub:"Fiction", price:299, mrp:399, desc:"Inspirational tale of Santiago's journey to find treasure. Translated into 80 languages.", tags:["fiction","spirituality","bestseller"] },
  { name:"Wings of Fire", brand:"APJ Abdul Kalam", sub:"Biography", price:199, mrp:299, desc:"Autobiography of India's Missile Man and President. Inspirational journey.", tags:["biography","india","science"] },
  { name:"The White Tiger", brand:"Aravind Adiga", sub:"Fiction", price:299, mrp:399, desc:"Booker Prize winner. Dark comedy about India's class struggle and entrepreneurship.", tags:["fiction","india","booker prize"] },
  { name:"Midnight's Children", brand:"Salman Rushdie", sub:"Fiction", price:499, mrp:699, desc:"Booker Prize winner. Magical realism, post-colonial India's journey through Saleem Sinai.", tags:["fiction","india","magical realism"] },
  // Programming / Tech
  { name:"Clean Code", brand:"Robert C. Martin", sub:"Programming", price:3499, mrp:4499, desc:"A handbook of agile software craftsmanship. Writing readable, maintainable code.", tags:["programming","software engineering","coding"] },
  { name:"The Pragmatic Programmer", brand:"Andrew Hunt & David Thomas", sub:"Programming", price:3299, mrp:4299, desc:"Your journey to mastery. Tips and tricks for software developers.", tags:["programming","software engineering","career"] },
  { name:"JavaScript: The Good Parts", brand:"Douglas Crockford", sub:"Programming", price:1999, mrp:2499, desc:"The best practices and good parts of the JavaScript language. O'Reilly.", tags:["javascript","programming","web"] },
  { name:"Designing Data-Intensive Applications", brand:"Martin Kleppmann", sub:"Programming", price:3999, mrp:5499, desc:"The big ideas behind reliable, scalable, and maintainable systems.", tags:["databases","distributed systems","backend"] },
  { name:"Introduction to Algorithms (CLRS)", brand:"Cormen et al.", sub:"Computer Science", price:4999, mrp:6999, desc:"The definitive textbook on algorithms. Used in top universities worldwide.", tags:["algorithms","computer science","textbook"] },
];

const BOOKS = bookDef.map(({ name, brand, sub, price, mrp, desc, tags }) => ({
  name, brand, category:"Books", subcategory: sub,
  series: sub, model: name, variant:"Paperback", color:"",
  price, mrp, stock: r(100,1000), rating: rating(), reviewCount: reviews(),
  image: img("book"), images: imgs("book"),
  description: desc,
  tags: ["book","paperback",...tags],
  specs:{ format:"Paperback" }, sku: sku("BKS"), warranty:"No Warranty",
}));

// ════════════════════════════════════════════════════════════════════════════
// SPORTS & FITNESS
// ════════════════════════════════════════════════════════════════════════════
const SPORTS = [];

const sportsDef = [
  { brand:"Yonex",    model:"Astrox 88D Play Badminton Racket", sub:"Badminton", price:4999, mrp:6500, desc:"Carbon graphite, 4U/G5, head-heavy balance, max 28lbs tension, attack-type." },
  { brand:"Yonex",    model:"Voltric Z-Force II Badminton Racket", sub:"Badminton", price:8999, mrp:11999, desc:"High modulus graphite, super extra stiff, head heavy, 4U, for advanced players." },
  { brand:"Victor",   model:"Thruster F Badminton Racket", sub:"Badminton", price:6499, mrp:8999, desc:"Nano fortify material, stiff shaft, attack type, head heavy, 4U/G5." },
  { brand:"Nivia",    model:"Football Force 32 Size 5", sub:"Football", price:999, mrp:1499, desc:"PU outer casing, butyl bladder, machine-stitched, FIFA basic approved, water-resistant." },
  { brand:"Adidas",   model:"Tiro Club Training Football", sub:"Football", price:1299, mrp:1899, desc:"Thermally bonded construction, butyl bladder, TPU covering, size 5." },
  { brand:"Decathlon",model:"Domyos Yoga Mat 8mm TPE", sub:"Yoga", price:1499, mrp:1999, desc:"TPE foam, 8mm, non-slip, alignment line, carrying strap, 183x61cm." },
  { brand:"Boldfit",  model:"6mm Yoga Mat with Strap", sub:"Yoga", price:599, mrp:999, desc:"NBR foam, 6mm, non-slip surface, carrying strap, 183x61cm, 20 colors." },
  { brand:"Cosco",    model:"Vibe Basketball Size 7", sub:"Basketball", price:1299, mrp:1899, desc:"Rubber outer, butyl bladder, deep channel design, indoor/outdoor." },
  { brand:"SG",       model:"RSD Xtreme Cricket Bat", sub:"Cricket", price:3999, mrp:5999, desc:"English willow, Grade 3, custom handle, premium edge thickness, full size." },
  { brand:"MRF",      model:"Genius Virat Kohli Edition Cricket Bat", sub:"Cricket", price:5999, mrp:8999, desc:"English willow Grade 2, low middle profile, ideal for hard-hitting batsman." },
  { brand:"Lifelong", model:"LLWM27 Treadmill 1.5HP", sub:"Gym Equipment", price:19999, mrp:27999, desc:"1.5HP motor, 12 preset programs, max 12km/h, fold-able, 90kg max." },
  { brand:"Powermax", model:"TDM-100S Treadmill 2HP", sub:"Gym Equipment", price:29999, mrp:39999, desc:"2HP motor, 15 programs, max 16km/h, MP3+speaker, 110kg max weight." },
  { brand:"Kobo",     model:"Rubber Hex Dumbbell Set 10kg", sub:"Gym Equipment", price:1999, mrp:2999, desc:"Rubber hex dumbbells, pair set, anti-roll design, chrome handle, 10kg each." },
  { brand:"Boldfit",  model:"Resistance Bands Set 5pc", sub:"Gym Equipment", price:799, mrp:1299, desc:"5 levels 10-50lbs, latex, door anchor + handles + ankle straps included." },
  { brand:"Asics",    model:"Gel-Kayano 31 Running Shoes", sub:"Running", price:14999, mrp:18999, desc:"Gel forefoot + rearfoot, LYTE TRUSS, engineered knit, stability shoe." },
  { brand:"Skechers", model:"Go Run Pulse Running Shoes", sub:"Running", price:3999, mrp:5999, desc:"Air-cooled memory foam, machine washable, 5Gen cushioning, lightweight." },
  { brand:"Fitbit",   model:"Charge 6 Fitness Tracker", sub:"Fitness Trackers", price:13999, mrp:16999, desc:"Built-in Google Maps, ECG app, 7-day battery, sleep tracking, 40+ exercise modes." },
  { brand:"Mi",       model:"Smart Band 8 Pro", sub:"Fitness Trackers", price:4499, mrp:5999, desc:"1.74-inch AMOLED, 14-day battery, SpO2, heart rate, 150 workout modes." },
  { brand:"Nivia",    model:"Ultra Cricket Helmet Senior", sub:"Cricket", price:1799, mrp:2499, desc:"ABS shell, steel grill, foam padding, ventilation ports, adjustable size." },
  { brand:"Proline",  model:"Adjustable Skip Rope", sub:"Gym Equipment", price:399, mrp:699, desc:"Adjustable, foam handles, ball-bearing, PVC rope, suitable all ages." },
];

sportsDef.forEach(({ brand, model, sub, price, mrp, desc }) => {
  SPORTS.push({
    name: `${brand} ${model}`,
    brand, category:"Sports & Fitness", subcategory: sub,
    series: brand, model, variant:"Standard", color:"",
    price, mrp, stock: r(20,200), rating: rating(), reviewCount: reviews(),
    image: img("sports"), images: imgs("sports"),
    description: desc,
    tags:[brand.toLowerCase(),sub.toLowerCase(),model.toLowerCase(),"sports"],
    specs:{}, sku: sku("SPT"), warranty:"1 Year",
  });
});

// ════════════════════════════════════════════════════════════════════════════
// GROCERIES & FOOD
// ════════════════════════════════════════════════════════════════════════════
const GROCERY = [
  { name:"Tata Tea Gold 500g", brand:"Tata Tea", sub:"Beverages", price:229, mrp:299, desc:"Premium Assam tea blend, rich aroma and taste, long-leaf tea." },
  { name:"Nescafé Classic Instant Coffee 200g", brand:"Nescafé", sub:"Beverages", price:399, mrp:499, desc:"100% pure soluble coffee, rich aroma, strong taste, 200g glass jar." },
  { name:"India Gate Basmati Rice Feast 5kg", brand:"India Gate", sub:"Staples", price:499, mrp:649, desc:"Long-grain Basmati, aged for 2 years, fluffy texture, authentic aroma." },
  { name:"Fortune Sunflower Oil 5L", brand:"Fortune", sub:"Oils", price:699, mrp:849, desc:"Refined sunflower oil, low cholesterol, rich in Vitamin E, light texture." },
  { name:"Aashirvaad Atta 10kg", brand:"Aashirvaad", sub:"Staples", price:499, mrp:599, desc:"100% whole wheat atta, superior quality, soft rotis, high fiber." },
  { name:"Maggi 2-Minute Noodles Masala 8 Pack", brand:"Maggi", sub:"Instant Food", price:99, mrp:128, desc:"Classic masala flavour, quick cooking, 8 pack, tastemaker included." },
  { name:"Amul Pure Ghee 1L", brand:"Amul", sub:"Dairy", price:549, mrp:649, desc:"Pure desi ghee, 1L tin, farm fresh buffalo milk, rich yellow color." },
  { name:"Haldiram's Aloo Bhujia 1kg", brand:"Haldiram's", sub:"Snacks", price:249, mrp:299, desc:"Crispy fried potato noodles, classic Indian snack, 1kg party pack." },
  { name:"Bournvita 1kg", brand:"Cadbury", sub:"Beverages", price:399, mrp:499, desc:"Malt food drink, chocolate flavour, 5 vital signs of growth, 1kg jar." },
  { name:"Kissan Mixed Fruit Jam 500g", brand:"Kissan", sub:"Spreads", price:139, mrp:179, desc:"Real fruits, no artificial colour, wholesome nutrition, family favourite." },
  { name:"Everest Garam Masala 100g", brand:"Everest", sub:"Masala & Spices", price:99, mrp:129, desc:"Blend of 27 aromatic spices, adds rich flavour to all Indian dishes." },
  { name:"Daawat Super Basmati 5kg", brand:"Daawat", sub:"Staples", price:449, mrp:599, desc:"Super premium Basmati, extra-long grain, aged 2+ years, restaurant-style." },
  { name:"Oreo Original Cream Biscuits 300g", brand:"Oreo", sub:"Snacks", price:99, mrp:120, desc:"Classic chocolate sandwich biscuit, cream filling, twist-lick-dunk." },
  { name:"Britannia Good Day Butter Cookies 600g", brand:"Britannia", sub:"Snacks", price:89, mrp:110, desc:"Butter-rich cookies, light texture, everyday snack favourite." },
  { name:"Yoga Bar Multigrain Energy Bar 40g x 6", brand:"Yoga Bar", sub:"Health Food", price:299, mrp:390, desc:"Oats + nuts + seeds, high protein, no added sugar, gluten-free options." },
  { name:"Saffola Active Refined Oil 5L", brand:"Saffola", sub:"Oils", price:749, mrp:899, desc:"Oryzanol-rich oil, blended with rice bran and sunflower oil, heart-healthy." },
  { name:"Tata Sampann Moong Dal 1kg", brand:"Tata Sampann", sub:"Pulses", price:129, mrp:169, desc:"Split green moong dal, unpolished, nutrient-rich, good source of protein." },
  { name:"MTR Upma Ready Mix 500g", brand:"MTR", sub:"Instant Food", price:149, mrp:199, desc:"Ready-to-cook upma mix, authentic South Indian taste, just add water." },
  { name:"Kellogg's Chocos 700g", brand:"Kellogg's", sub:"Cereals", price:249, mrp:329, desc:"Choco flavour puffs, chocolate glazed whole wheat, high iron + vitamins." },
  { name:"Lay's India's Magic Masala 48g x 10", brand:"Lay's", sub:"Snacks", price:250, mrp:300, desc:"India's favourite potato chips, magic masala flavour, 10-pack." },
].map(({ name, brand, sub, price, mrp, desc }) => ({
  name, brand, category:"Groceries", subcategory: sub,
  series: brand, model: name, variant:"Standard", color:"",
  price, mrp, stock: r(100,1000), rating: rating(), reviewCount: reviews(),
  image: img("grocery"), images: imgs("grocery"),
  description: desc,
  tags:[brand.toLowerCase(),"grocery",sub.toLowerCase()],
  specs:{}, sku: sku("GRC"), warranty:"No Warranty",
  isBestSeller: price < 200,
}));

// ════════════════════════════════════════════════════════════════════════════
// JEWELLERY & WATCHES
// ════════════════════════════════════════════════════════════════════════════
const JEWELLERY = [
  ...["Tanishq Mia 14KT Yellow Gold Diamond Ring","Tanishq 22KT Gold Mangalsutra 5g","Tanishq 22KT Kundan Necklace Set"].map(name => ({
    name, brand:"Tanishq", sub:"Jewellery", price:12999+(Math.random()*30000|0), mrp:15999+(Math.random()*35000|0), desc:"Hallmarked 22KT / 14KT gold, BIS certified, certificate of authenticity included.", image:"jewellery",
  })),
  ...["PC Jeweller 18KT Diamond Pendant","PC Jeweller Silver Bracelet 925"].map(name => ({
    name, brand:"PC Jeweller", sub:"Jewellery", price:4999+(Math.random()*15000|0), mrp:7999+(Math.random()*18000|0), desc:"Certified diamond / sterling silver, hallmarked, lifetime exchange offer.", image:"jewellery",
  })),
  { name:"Fossil Gen 6 Hybrid Smartwatch", brand:"Fossil", sub:"Watches", price:14999, mrp:19999, desc:"36mm stainless steel, activity tracking, notifications, 2-week battery, Alexa built-in.", image:"watch" },
  { name:"Titan Neo III Analog Watch", brand:"Titan", sub:"Watches", price:4999, mrp:6999, desc:"Stainless steel case, mineral glass, 50m water resistance, day-date display.", image:"watch" },
  { name:"Casio G-Shock GA-2100 CasiOak", brand:"Casio", sub:"Watches", price:9999, mrp:12999, desc:"Carbon core guard structure, 200m water resistance, shock resistant, world time.", image:"watch" },
  { name:"Fastrack Analog Blue Dial Watch", brand:"Fastrack", sub:"Watches", price:1499, mrp:2499, desc:"Stainless steel, mineral glass, water resistant 30m, leather strap.", image:"watch" },
  { name:"Seiko Presage Cocktail Time", brand:"Seiko", sub:"Watches", price:24999, mrp:31999, desc:"Automatic movement, Seiko in-house calibre, hardlex crystal, cocktail time inspiration.", image:"watch" },
].map(({ name, brand, sub, price, mrp, desc, image }) => ({
  name, brand, category:"Jewellery & Watches", subcategory: sub,
  series: brand, model: name, variant:"Standard", color:"",
  price, mrp, stock: r(5,50), rating: rating(), reviewCount: reviews(),
  image: img(image), images: imgs(image),
  description: desc,
  tags:[brand.toLowerCase(),sub.toLowerCase(),"luxury"],
  specs:{}, sku: sku("JWL"), warranty:"1 Year",
}));

// ════════════════════════════════════════════════════════════════════════════
// TRAVEL & LUGGAGE
// ════════════════════════════════════════════════════════════════════════════
const LUGGAGE = [
  ...["American Tourister Airforce 55cm Cabin","American Tourister Linex 68cm Medium","American Tourister Moonlight 78cm Large"].flatMap(model =>
    ["Black","Grey","Navy Blue","Coral Red"].map(color => ({
      name: `${model} - ${color}`,
      brand:"American Tourister", sub:"Luggage", price:model.includes("55")?4999:model.includes("68")?6999:8999,
      mrp:model.includes("55")?7999:model.includes("68")?10999:13999,
      desc:"4-spinner wheels, TSA combination lock, expandable, polycarbonate/ABS shell.",
      image:"luggage", color,
    }))
  ),
  ...["Samsonite Proxis 55cm","Samsonite Neopod 69cm","Samsonite Cosmolite 75cm"].flatMap(model =>
    ["Black","Electric Blue","Silver"].map(color => ({
      name: `${model} - ${color}`,
      brand:"Samsonite", sub:"Luggage", price:model.includes("55")?14999:model.includes("69")?19999:24999,
      mrp:model.includes("55")?19999:model.includes("69")?26999:32999,
      desc:"Curv material, 4 dual-spinner wheels, TSA lock, ultra-lightweight.",
      image:"luggage", color,
    }))
  ),
  ...["Wildcraft 55L Backpack","Wildcraft 40L Hiking Pack","Skybags Footloose 30L"].flatMap(model =>
    ["Black","Blue","Green"].map(color => ({
      name: `${model} - ${color}`, brand: model.startsWith("Sky") ? "Skybags" : "Wildcraft",
      sub:"Backpacks", price:model.includes("55L")?2999:model.includes("40")?2499:1999,
      mrp:model.includes("55L")?4499:model.includes("40")?3999:2999,
      desc:"Water-resistant, multiple compartments, padded straps, laptop sleeve.",
      image:"bag", color,
    }))
  ),
].map(({ name, brand, sub, price, mrp, desc, image, color }) => ({
  name, brand, category:"Travel & Luggage", subcategory: sub,
  series: brand, model: name, variant: color, color,
  price, mrp, stock: r(10,60), rating: rating(), reviewCount: reviews(),
  image: img(image), images: imgs(image),
  description: desc,
  tags:[brand.toLowerCase(),"travel","luggage",sub.toLowerCase(),color.toLowerCase()],
  specs:{ color }, sku: sku("LUG"), warranty:"Warranty varies",
}));

// ════════════════════════════════════════════════════════════════════════════
// MERGE ALL + MARK TRENDING / BESTSELLERS
// ════════════════════════════════════════════════════════════════════════════
const ALL = [
  ...MOBILES, ...LAPTOPS, ...TABLETS, ...WATCHES, ...AUDIO, ...TVS, ...GAMING,
  ...FASHION, ...HOME, ...BEAUTY, ...BOOKS, ...SPORTS, ...GROCERY, ...JEWELLERY, ...LUGGAGE,
];

// Randomly mark trending / new arrival on 15% of products
ALL.forEach((p, i) => {
  if (i % 7 === 0) p.isTrending = true;
  if (i % 11 === 0) p.isNewArrival = true;
  if (!p.isBestSeller && i % 5 === 0) p.isBestSeller = true;
});

module.exports = ALL;
