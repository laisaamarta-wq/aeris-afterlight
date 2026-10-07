/* =====================================================================
   AERIS° — catalog data
   ---------------------------------------------------------------------
   Every product, collection, journal story and store lives here as plain
   data. Replace placeholders with real products without touching layout.

   Images: `img` keys resolve through /assets.js (written at build time)
   to /img/<key>.webp, /img/<key>-sm.webp and, for product shots,
   /img/<key>-cut.webp (background removed, used for floating views).

   3D: set `model3d.glb` to a .glb/.gltf path to enable the 360° / 3D view
   on the product page. Hotspot `n` = position inside the model's bounding
   box (-0.5…0.5 on x, y, z; z +0.5 is the front).
   ===================================================================== */

export const BRAND = {
  name: 'AERIS',
  mark: 'AERIS°',
  tagline: 'Technical clothing. Riga, since 2021.',
  email: 'studio@aeris.lv',
  care: 'care@aeris.lv',
  phone: '+371 6700 2711',
  freeShippingFrom: 300,
  shipping: { standard: 12, express: 24 },
};

export const CATEGORIES = [
  { key: 'outerwear', name: 'Outerwear', blurb: 'Shells, liners and coats' },
  { key: 'shirts', name: 'Shirts & Overshirts', blurb: 'Poplin and twill' },
  { key: 'jersey-knit', name: 'Jersey & Knitwear', blurb: 'Loopback and merino' },
  { key: 'trousers', name: 'Trousers', blurb: 'Tailored and technical' },
  { key: 'dresses', name: 'Dresses', blurb: 'Rib-knit columns' },
  { key: 'footwear', name: 'Footwear', blurb: 'Trail-built runners' },
  { key: 'accessories', name: 'Accessories', blurb: 'Bags and small goods' },
];

export const COLLECTIONS = [
  {
    key: 'afterlight', no: '01', name: 'Afterlight', season: 'SS27', pieces: 12,
    released: '2027-03-12', hero: '200', wide: '202',
    lede: 'Twelve pieces for the hour after sunset, when the light is soft and the air turns cold.',
    body: [
      'Afterlight was photographed on a salt flat in the twenty minutes after the sun goes down. Colour drains out of the landscape, the horizon stays warm, and everything you wear has to work twice as hard.',
      'The drop is built around one shell, one liner and one coat, with the shirts, knits and trousers that sit under them. Everything layers, everything is cut to be worn for years, and the palette — stone, sand, bone, graphite — is designed so any two pieces work together.',
    ],
  },
];

const S5 = ['XS', 'S', 'M', 'L', 'XL'];
const stock = (a) => Object.fromEntries(S5.map((s, i) => [s, a[i]]));

export const PRODUCTS = [
  {
    id: 'AFT-01', slug: 'meridian-shell', no: '01', name: 'Meridian Shell', type: 'Technical shell jacket',
    category: 'outerwear', collection: 'afterlight', price: 680, badge: 'Signature', isNew: true, featured: 1,
    tagline: 'A three-layer shell that keeps out rain and wind without the stiffness.',
    tech: ['Waterproof · 20,000 mm', 'Recycled nylon'],
    colors: [
      { key: 'stone', name: 'Stone', hex: '#b5ada3', img: '10' },
      { key: 'graphite', name: 'Graphite', hex: '#3a393c', img: '11' },
    ],
    media: { model: '12', detail: '13' },
    model3d: {
      glb: '/models/meridian-shell.glb',
      hotspots: [
        { id: 'hood', label: 'Hood', title: 'Structured hood', lines: ['Laminated brim keeps its shape', 'One-hand volume adjuster'], n: [0, 0.44, 0.1] },
        { id: 'zip', label: 'Zip', title: 'Two-way front zip', lines: ['Water-resistant coil', 'Storm flap with magnetic close'], n: [0.02, 0.05, 0.5] },
        { id: 'pocket', label: 'Pocket', title: 'Chest pocket', lines: ['Bonded zip, no stitch holes', 'Fits a phone in a case'], n: [0.2, 0.18, 0.46] },
        { id: 'seams', label: 'Seams', title: 'Taped seams', lines: ['13 mm three-layer tape', 'Every seam sealed'], n: [-0.3, 0.2, 0.3] },
        { id: 'cuff', label: 'Cuff', title: 'Adjustable cuff', lines: ['Low-profile hook-and-loop tab', 'Sits under a glove'], n: [0.44, -0.3, 0.2] },
        { id: 'fabric', label: 'Fabric', title: '3-layer recycled nylon', lines: ['40D face, PFAS-free finish', '20,000 mm · 30,000 g/m²/24h'], n: [-0.18, -0.12, 0.5] },
      ],
    },
    sizes: S5,
    stock: { stone: stock([3, 6, 2, 0, 4]), graphite: stock([5, 8, 7, 3, 1]) },
    composition: '100% recycled polyamide face · PU membrane · polyester backer',
    description: 'Our core shell, cut for daily wear in a city that sees rain most days of the year. A three-layer recycled nylon with a PFAS-free membrane, a hood that keeps its shape, and a longer back hem for cycling. It packs into its own hood and weighs less than a paperback.',
    details: ['Two-way front zip with storm flap', 'Two bonded chest pockets', 'Adjustable hood, hem and cuffs', 'Longer back hem', 'Packs into the hood'],
    fit: { note: 'Relaxed fit with room for a knit or liner underneath. True to size.', model: 'Model is 175 cm and wears S.' },
    dimensions: { size: 'M', rows: [['Chest width', '62 cm'], ['Body length (back)', '78 cm'], ['Sleeve from centre back', '88 cm'], ['Weight', '480 g']] },
    care: ['Machine wash at 30°C, gentle cycle', 'Close all zips before washing', 'Tumble dry low to restore water repellency', 'Do not dry clean or iron'],
    origin: 'Made in Vilnius, LT',
    specs: [
      ['Form', 'Hooded shell, dropped shoulder, longer back hem'],
      ['Material', '3-layer recycled nylon, 40D, PFAS-free membrane'],
      ['Weight', '480 g in size M'],
      ['Fit', 'Relaxed — room for a mid-layer'],
      ['Construction', 'Fully taped seams, bonded pockets, two-way zip'],
      ['Origin', 'Assembled in Vilnius, LT'],
    ],
    tags: ['waterproof', 'recycled', 'packable'], date: '2027-03-12',
  },
  {
    id: 'AFT-02', slug: 'drift-liner', no: '02', name: 'Drift Liner', type: 'Insulated liner jacket',
    category: 'outerwear', collection: 'afterlight', price: 420, isNew: true, featured: 4,
    tagline: 'A light quilted layer that works on its own or under the shell.',
    tech: ['Recycled fill', 'Snap front'],
    colors: [
      { key: 'sand', name: 'Sand', hex: '#cbb79b', img: '20' },
      { key: 'ink', name: 'Ink', hex: '#24262e', img: '21' },
    ],
    media: { model: '22', detail: '23' }, model3d: null,
    sizes: S5,
    stock: { sand: stock([2, 5, 6, 4, 2]), ink: stock([0, 3, 5, 5, 3]) },
    composition: 'Shell 100% recycled polyamide · fill 100% recycled polyester, 80 g/m²',
    description: 'A collarless liner with 6 cm channel quilting and a clean snap front. Thin enough to wear under the Meridian Shell, finished well enough to wear alone over a shirt from October to April.',
    details: ['Collarless round neck', 'Matte metal snap front', 'Two side pockets with hidden snaps', 'Bound edges'],
    fit: { note: 'Regular, slightly boxy. Size up to wear over heavy knits.', model: 'Model is 188 cm and wears L.' },
    dimensions: { size: 'M', rows: [['Chest width', '58 cm'], ['Body length', '70 cm'], ['Sleeve from centre back', '84 cm'], ['Weight', '390 g']] },
    care: ['Machine wash at 30°C', 'Tumble dry low with two dryer balls', 'Do not iron'],
    origin: 'Made in Vilnius, LT',
    specs: [['Form', 'Collarless quilted liner'], ['Material', 'Recycled nylon, 80 g/m² recycled fill'], ['Weight', '390 g in size M'], ['Fit', 'Regular, slightly boxy'], ['Construction', '6 cm channel quilting, bound edges'], ['Origin', 'Vilnius, LT']],
    tags: ['insulated', 'recycled', 'layering'], date: '2027-03-12',
  },
  {
    id: 'AFT-03', slug: 'dusk-coat', no: '03', name: 'Dusk Coat', type: 'Wool-cashmere car coat',
    category: 'outerwear', collection: 'afterlight', price: 890, isNew: true, featured: 3,
    tagline: 'A long, quiet coat in a dense wool-cashmere that blocks the wind.',
    tech: ['80% wool · 20% cashmere', 'Hidden placket'],
    colors: [
      { key: 'bone', name: 'Bone', hex: '#e8e2d6', img: '30' },
      { key: 'charcoal', name: 'Charcoal', hex: '#45444a', img: '31' },
    ],
    media: { model: '32', detail: '33' }, model3d: null,
    sizes: S5,
    stock: { bone: stock([1, 3, 2, 2, 0]), charcoal: stock([2, 4, 4, 3, 2]) },
    composition: '80% virgin wool · 20% cashmere · lining 100% cupro',
    description: 'A single-breasted car coat with a hidden placket, a narrow collar and dropped shoulders. The 620 g/m² wool-cashmere is milled in Biella and brushed on the face, so it reads soft but holds a sharp line.',
    details: ['Hidden button placket', 'Two angled side pockets', 'Half cupro lining', 'Back vent'],
    fit: { note: 'Relaxed, below the knee. Cut to sit over a liner or a suit jacket.', model: 'Model is 177 cm and wears S.' },
    dimensions: { size: 'M', rows: [['Chest width', '64 cm'], ['Body length', '112 cm'], ['Sleeve from centre back', '86 cm'], ['Weight', '1.9 kg']] },
    care: ['Dry clean only', 'Brush after wear', 'Store on a wide hanger'],
    origin: 'Fabric milled in Biella, IT · made in Riga, LV',
    specs: [['Form', 'Single-breasted car coat, below knee'], ['Material', '80/20 wool-cashmere, 620 g/m²'], ['Weight', '1.9 kg in size M'], ['Fit', 'Relaxed'], ['Construction', 'Hidden placket, half cupro lining'], ['Origin', 'Biella, IT · Riga, LV']],
    tags: ['wool', 'cashmere'], date: '2027-03-12',
  },
  {
    id: 'AFT-04', slug: 'field-overshirt', no: '04', name: 'Field Overshirt', type: 'Twill overshirt',
    category: 'shirts', collection: 'afterlight', price: 290, isNew: true, featured: 6,
    tagline: 'A heavy twill overshirt with two bellow pockets and a snap front.',
    tech: ['Cotton-nylon twill', '320 g/m²'],
    colors: [
      { key: 'clay', name: 'Clay', hex: '#9c7259', img: '40' },
      { key: 'stone', name: 'Stone', hex: '#b5ada3', img: '41' },
    ],
    media: { model: '42', detail: '43' }, model3d: null,
    sizes: S5,
    stock: { clay: stock([4, 6, 6, 5, 3]), stone: stock([3, 5, 0, 4, 2]) },
    composition: '70% organic cotton · 30% recycled polyamide',
    description: 'Somewhere between a shirt and a jacket. The 320 g/m² cotton-nylon twill is dense enough to block a breeze and softens with wear. Two flapped bellow pockets on the chest, matte snaps, a straight hem you can leave out.',
    details: ['Point collar', 'Matte snap front', 'Two bellow chest pockets with flaps', 'Double-needle topstitching'],
    fit: { note: 'Boxy. Size down for a closer fit.', model: 'Model is 183 cm and wears M.' },
    dimensions: { size: 'M', rows: [['Chest width', '60 cm'], ['Body length', '74 cm'], ['Sleeve from centre back', '85 cm'], ['Weight', '640 g']] },
    care: ['Machine wash at 30°C', 'Line dry', 'Warm iron on reverse'],
    origin: 'Made in Łódź, PL',
    specs: [['Form', 'Overshirt, point collar'], ['Material', '70/30 organic cotton, recycled nylon twill'], ['Weight', '640 g in size M'], ['Fit', 'Boxy'], ['Construction', 'Double-needle seams, bellow pockets'], ['Origin', 'Łódź, PL']],
    tags: ['cotton', 'layering'], date: '2027-03-12',
  },
  {
    id: 'AFT-05', slug: 'vector-shirt', no: '05', name: 'Vector Shirt', type: 'Technical poplin shirt',
    category: 'shirts', collection: 'afterlight', price: 210, featured: 9,
    tagline: 'A crisp, quick-drying poplin shirt with a concealed placket.',
    tech: ['Nylon-cotton poplin', 'Quick dry'],
    colors: [
      { key: 'bone', name: 'Bone', hex: '#e8e2d6', img: '50' },
      { key: 'slate', name: 'Slate', hex: '#6f7a85', img: '51' },
    ],
    media: { model: '52', detail: '53' }, model3d: null,
    sizes: S5,
    stock: { bone: stock([6, 8, 9, 7, 4]), slate: stock([3, 4, 6, 4, 2]) },
    composition: '58% recycled polyamide · 42% organic cotton',
    description: 'A boxy shirt in a lightweight nylon-cotton poplin with a soft sheen. It resists creasing, dries in under an hour and keeps a clean line under a jacket. Concealed placket, hidden chest pocket, curved hem.',
    details: ['Concealed button placket', 'Hidden chest pocket', 'Curved hem', 'Mother-of-pearl buttons'],
    fit: { note: 'Relaxed, boxy. True to size.', model: 'Model is 180 cm and wears M.' },
    dimensions: { size: 'M', rows: [['Chest width', '58 cm'], ['Body length', '76 cm'], ['Sleeve from centre back', '86 cm'], ['Weight', '230 g']] },
    care: ['Machine wash at 30°C', 'Hang to dry', 'Cool iron if needed'],
    origin: 'Made in Łódź, PL',
    specs: [['Form', 'Boxy shirt, concealed placket'], ['Material', 'Nylon-cotton poplin, 110 g/m²'], ['Weight', '230 g in size M'], ['Fit', 'Relaxed'], ['Construction', 'Single-needle seams, curved hem'], ['Origin', 'Łódź, PL']],
    tags: ['quick-dry', 'travel'], date: '2027-02-02',
  },
  {
    id: 'AFT-06', slug: 'halo-hoodie', no: '06', name: 'Halo Hoodie', type: 'Heavyweight hoodie',
    category: 'jersey-knit', collection: 'afterlight', price: 260, featured: 2,
    tagline: 'A 480 g/m² loopback hoodie with a double-layer hood that holds its shape.',
    tech: ['480 g/m² loopback', 'Organic cotton'],
    colors: [
      { key: 'stone', name: 'Stone', hex: '#b5ada3', img: '60' },
      { key: 'graphite', name: 'Graphite', hex: '#3a393c', img: '61' },
    ],
    media: { model: '62', detail: '63' }, model3d: null,
    sizes: S5,
    stock: { stone: stock([5, 9, 8, 6, 5]), graphite: stock([4, 7, 9, 8, 6]) },
    composition: '100% organic cotton loopback',
    description: 'Knitted in Porto from organic cotton and garment-washed for a soft hand. The hood is double-layered with no drawcord, so it stands up around the neck. Dropped shoulders, wide rib cuffs and hem, slightly cropped.',
    details: ['Double-layer hood', 'Kangaroo pocket', 'Wide 2×2 rib cuffs and hem', 'Flatlock side seams'],
    fit: { note: 'Boxy and slightly cropped. Size up for a longer body.', model: 'Model is 182 cm and wears M.' },
    dimensions: { size: 'M', rows: [['Chest width', '62 cm'], ['Body length', '68 cm'], ['Sleeve from centre back', '84 cm'], ['Weight', '940 g']] },
    care: ['Machine wash at 30°C inside out', 'Dry flat', 'Do not tumble dry'],
    origin: 'Knitted and sewn in Porto, PT',
    specs: [['Form', 'Hoodie, dropped shoulder'], ['Material', '100% organic cotton loopback, 480 g/m²'], ['Weight', '940 g in size M'], ['Fit', 'Boxy, slightly cropped'], ['Construction', 'Flatlock seams, double-layer hood'], ['Origin', 'Porto, PT']],
    tags: ['cotton', 'organic'], date: '2027-01-15',
  },
  {
    id: 'AFT-07', slug: 'strata-knit', no: '07', name: 'Strata Knit', type: 'Merino mock neck',
    category: 'jersey-knit', collection: 'afterlight', price: 240, featured: 7,
    tagline: 'A fine-gauge merino mock neck you can wear on its own or under everything.',
    tech: ['Extra-fine merino', '16 gauge'],
    colors: [
      { key: 'bone', name: 'Bone', hex: '#e8e2d6', img: '70' },
      { key: 'ink', name: 'Ink', hex: '#24262e', img: '71' },
    ],
    media: { model: '72', detail: '73' }, model3d: null,
    sizes: S5,
    stock: { bone: stock([3, 4, 5, 3, 1]), ink: stock([4, 6, 6, 4, 3]) },
    composition: '100% extra-fine merino wool, 17.5 micron, mulesing-free',
    description: 'Knitted on 16-gauge machines from 17.5-micron merino, with fully fashioned shoulders that follow the body instead of being cut. Warm, breathable and thin enough to sit under a shirt.',
    details: ['Mock neck', 'Fully fashioned shoulders', 'Ribbed cuffs and hem'],
    fit: { note: 'Slim relaxed. True to size.', model: 'Model is 174 cm and wears S.' },
    dimensions: { size: 'M', rows: [['Chest width', '52 cm'], ['Body length', '66 cm'], ['Sleeve from centre back', '82 cm'], ['Weight', '260 g']] },
    care: ['Hand wash cold or wool cycle', 'Dry flat', 'Fold, do not hang'],
    origin: 'Knitted in Biella, IT',
    specs: [['Form', 'Mock neck, fully fashioned'], ['Material', '17.5 µm merino, 16 gauge'], ['Weight', '260 g in size M'], ['Fit', 'Slim relaxed'], ['Construction', 'Linked seams, fully fashioned'], ['Origin', 'Biella, IT']],
    tags: ['merino', 'wool'], date: '2027-01-15',
  },
  {
    id: 'AFT-08', slug: 'axis-trouser', no: '08', name: 'Axis Trouser', type: 'Double-pleat trouser',
    category: 'trousers', collection: 'afterlight', price: 320, isNew: true, featured: 5,
    tagline: 'A wide, high-waisted trouser with double pleats and a fluid drape.',
    tech: ['Wool-blend twill', 'Hidden hook'],
    colors: [
      { key: 'graphite', name: 'Graphite', hex: '#3a393c', img: '80' },
      { key: 'sand', name: 'Sand', hex: '#cbb79b', img: '81' },
    ],
    media: { model: '82', detail: '83' }, model3d: null,
    sizes: S5,
    stock: { graphite: stock([3, 5, 6, 4, 2]), sand: stock([2, 3, 3, 2, 0]) },
    composition: '72% wool · 26% polyester · 2% elastane',
    description: 'A high-waisted trouser with double front pleats, an extended waistband and pressed creases. The wool-blend twill has a small amount of stretch and drapes like a heavier fabric.',
    details: ['Double front pleats', 'Extended waistband with hidden hook', 'Side seam pockets, two back welt pockets', 'Pressed creases'],
    fit: { note: 'High waist, wide leg, full length. Hem can be shortened in store.', model: 'Model is 176 cm and wears S. Inseam 82 cm.' },
    dimensions: { size: 'M', rows: [['Waist', '78 cm'], ['Rise', '33 cm'], ['Inseam', '82 cm'], ['Leg opening', '27 cm']] },
    care: ['Dry clean or hand wash cold', 'Steam to refresh creases'],
    origin: 'Made in Łódź, PL',
    specs: [['Form', 'Wide leg, double pleat'], ['Material', '72/26/2 wool-poly-elastane twill'], ['Weight', '540 g in size M'], ['Fit', 'High waist, wide'], ['Construction', 'Extended waistband, pressed creases'], ['Origin', 'Łódź, PL']],
    tags: ['tailoring', 'wool'], date: '2027-03-12',
  },
  {
    id: 'AFT-09', slug: 'orbit-cargo', no: '09', name: 'Orbit Cargo', type: 'Parachute cargo trouser',
    category: 'trousers', collection: 'afterlight', price: 290, featured: 8,
    tagline: 'A relaxed nylon cargo with articulated knees and bungee hems.',
    tech: ['Recycled nylon', 'Water-repellent'],
    colors: [
      { key: 'stone', name: 'Stone', hex: '#b5ada3', img: '90' },
      { key: 'ink', name: 'Ink', hex: '#24262e', img: '91' },
    ],
    media: { model: '92', detail: '93' }, model3d: null,
    sizes: S5,
    stock: { stone: stock([4, 6, 7, 5, 3]), ink: stock([5, 7, 8, 6, 4]) },
    composition: '100% recycled polyamide, PFAS-free water-repellent finish',
    description: 'A relaxed trouser in a matte recycled nylon that sheds light rain. Bellow cargo pockets sit flat when empty, articulated knees keep the shape when you sit, and bungee hems let you taper or stack.',
    details: ['Adjustable side tabs', 'Two bellow cargo pockets', 'Articulated knees', 'Bungee drawcord hems with toggles'],
    fit: { note: 'Relaxed through hip and thigh, tapers when cinched.', model: 'Model is 186 cm and wears M.' },
    dimensions: { size: 'M', rows: [['Waist', '82 cm'], ['Rise', '30 cm'], ['Inseam', '80 cm'], ['Leg opening', '24 cm (cinched)']] },
    care: ['Machine wash at 30°C', 'Line dry', 'Do not iron'],
    origin: 'Made in Łódź, PL',
    specs: [['Form', 'Parachute cargo'], ['Material', 'Recycled nylon, 160 g/m²'], ['Weight', '410 g in size M'], ['Fit', 'Relaxed'], ['Construction', 'Articulated knees, bellow pockets'], ['Origin', 'Łódź, PL']],
    tags: ['water-repellent', 'recycled'], date: '2027-02-02',
  },
  {
    id: 'AFT-10', slug: 'lumen-dress', no: '10', name: 'Lumen Dress', type: 'Rib-knit midi dress',
    category: 'dresses', collection: 'afterlight', price: 380, isNew: true, featured: 10,
    tagline: 'A long-sleeve rib-knit column that moves with you.',
    tech: ['Viscose-wool rib', 'Mock neck'],
    colors: [
      { key: 'bone', name: 'Bone', hex: '#e8e2d6', img: '100' },
      { key: 'charcoal', name: 'Charcoal', hex: '#45444a', img: '101' },
    ],
    media: { model: '102', detail: '103' }, model3d: null,
    sizes: S5,
    stock: { bone: stock([2, 3, 3, 1, 0]), charcoal: stock([3, 4, 4, 3, 2]) },
    composition: '64% viscose · 30% merino wool · 6% elastane',
    description: 'A mock-neck midi dress knitted in a fine 2×2 rib. The viscose-wool blend is soft against the skin and recovers its shape after a day of wear. Wear it alone or under the Dusk Coat.',
    details: ['Mock neck', 'Fine 2×2 rib', 'Long sleeves', 'Midi length'],
    fit: { note: 'Body-skimming. True to size.', model: 'Model is 180 cm and wears S.' },
    dimensions: { size: 'M', rows: [['Bust (relaxed)', '42 cm'], ['Length', '118 cm'], ['Sleeve from centre back', '80 cm'], ['Weight', '520 g']] },
    care: ['Hand wash cold', 'Dry flat', 'Do not hang'],
    origin: 'Knitted in Biella, IT',
    specs: [['Form', 'Column midi, mock neck'], ['Material', 'Viscose-merino-elastane rib'], ['Weight', '520 g in size M'], ['Fit', 'Body-skimming'], ['Construction', 'Knitted to shape, linked seams'], ['Origin', 'Biella, IT']],
    tags: ['knit', 'merino'], date: '2027-03-12',
  },
  {
    id: 'AFT-11', slug: 'terrain-runner', no: '11', name: 'Terrain Runner', type: 'Trail-built sneaker',
    category: 'footwear', collection: 'afterlight', price: 340, featured: 11,
    tagline: 'A low trail runner with a grippy outsole and a city profile.',
    tech: ['Engineered mesh', 'Grip outsole'],
    colors: [
      { key: 'bone', name: 'Bone', hex: '#e8e2d6', img: '110' },
      { key: 'graphite', name: 'Graphite', hex: '#3a393c', img: '111' },
    ],
    media: { model: '112', detail: '113' }, model3d: null,
    sizes: ['38', '39', '40', '41', '42', '43', '44', '45'],
    stock: {
      bone: { 38: 2, 39: 3, 40: 4, 41: 5, 42: 4, 43: 3, 44: 1, 45: 0 },
      graphite: { 38: 1, 39: 2, 40: 4, 41: 6, 42: 6, 43: 4, 44: 3, 45: 2 },
    },
    composition: 'Upper recycled polyester mesh, suede · midsole EVA blend · outsole rubber',
    description: 'A low-profile runner built on a trail last. Engineered mesh with suede overlays, a cushioned EVA midsole and a lugged rubber outsole that grips wet stone. Made to walk cities all day.',
    details: ['Engineered mesh upper', 'Suede overlays', 'Removable cork-blend insole', 'Lugged rubber outsole'],
    fit: { note: 'True to size. Half sizes: size up.', model: '' },
    dimensions: { size: '42', rows: [['Weight (one shoe)', '310 g'], ['Heel-to-toe drop', '8 mm'], ['Stack height', '28 mm']] },
    care: ['Brush suede when dry', 'Spot clean mesh with mild soap', 'Air dry away from heat'],
    origin: 'Made in Felgueiras, PT',
    specs: [['Form', 'Low trail runner'], ['Material', 'Recycled mesh, suede, rubber'], ['Weight', '310 g per shoe (42)'], ['Fit', 'True to size'], ['Construction', 'Cemented sole, 8 mm drop'], ['Origin', 'Felgueiras, PT']],
    tags: ['footwear', 'grip'], date: '2027-02-02',
  },
  {
    id: 'AFT-12', slug: 'pod-crossbody', no: '12', name: 'Pod Crossbody', type: 'Structured crossbody bag',
    category: 'accessories', collection: 'afterlight', price: 260, featured: 12,
    tagline: 'A rounded 2.5 L crossbody in coated recycled nylon.',
    tech: ['2.5 L', 'Water-resistant zip'],
    colors: [
      { key: 'stone', name: 'Stone', hex: '#b5ada3', img: '120' },
      { key: 'black', name: 'Black', hex: '#1b1b1d', img: '121' },
    ],
    media: { model: '122', detail: '123' }, model3d: null,
    sizes: ['One size'],
    stock: { stone: { 'One size': 7 }, black: { 'One size': 2 } },
    composition: 'Coated recycled polyamide · recycled nylon webbing · aluminium buckle',
    description: 'A structured crossbody that holds its rounded shape when empty. Coated recycled nylon wipes clean, the top zip keeps out rain, and the webbing strap releases with one hand.',
    details: ['Water-resistant top zip', 'Inner slip pocket and key clip', 'Quick-release aluminium buckle', 'Strap adjusts 70–130 cm'],
    fit: { note: '24 × 15 × 8 cm. Fits a phone, wallet, keys and a small notebook.', model: '' },
    dimensions: { size: 'One size', rows: [['Width', '24 cm'], ['Height', '15 cm'], ['Depth', '8 cm'], ['Volume', '2.5 L'], ['Weight', '340 g']] },
    care: ['Wipe clean with a damp cloth', 'Do not machine wash'],
    origin: 'Made in Kaunas, LT',
    specs: [['Form', 'Rounded crossbody, 2.5 L'], ['Material', 'Coated recycled nylon'], ['Weight', '340 g'], ['Fit', 'Strap 70–130 cm'], ['Construction', 'Welded panels, quick-release buckle'], ['Origin', 'Kaunas, LT']],
    tags: ['bag', 'water-resistant'], date: '2027-02-02',
  },
];

export const JOURNAL = [
  {
    slug: 'material-futures', no: '01', title: 'Material Futures', kicker: 'Materials', date: '2027-03-02', read: '6 min', img: '210',
    lede: 'Why we spent two years on one shell fabric, and what we test before anything reaches the shop.',
    body: [
      'Every AERIS garment starts with a fabric we can measure. For the Meridian Shell that meant two years of sampling with a mill in Taiwan and a laminator in Lithuania until we had a three-layer recycled nylon that hit 20,000 mm of water resistance without a fluorinated finish.',
      'We test each lot before it is cut: hydrostatic head, breathability, abrasion and seam slippage. A fabric that fails one test goes back. It costs us time, but it is the only way to make a shell you can wear for ten winters.',
      'Recycled does not mean compromised. Our nylon is made from post-industrial waste, re-polymerised into new yarn with the same strength as virgin fibre. The difference is where it starts, not how it performs.',
    ],
    products: ['meridian-shell', 'orbit-cargo', 'pod-crossbody'],
  },
  {
    slug: 'the-new-uniform', no: '02', title: 'The New Uniform', kicker: 'Style', date: '2027-02-18', read: '4 min', img: '211',
    lede: 'Five pieces, worn every day for a month in Riga. Notes on building a wardrobe that does more with less.',
    body: [
      'We asked three people from the studio to wear the same five pieces for a month: an overshirt, a shirt, a knit, a trouser and a shell. No other clothes, apart from socks.',
      'The rules were simple. Everything had to work together, survive a bike commute and look right at dinner. What came out of it was a way of dressing we now design for: fewer pieces, better fabrics, a palette that never clashes.',
      'The Field Overshirt became the piece everyone reached for first. The Axis Trouser needed one change — a slightly higher rise — which made it into production.',
    ],
    products: ['field-overshirt', 'axis-trouser', 'vector-shirt'],
  },
  {
    slug: 'afterlight', no: '03', title: 'Afterlight', kicker: 'Campaign', date: '2027-03-12', read: '3 min', img: '212',
    lede: 'Twenty minutes after sunset on a salt flat. How we shot Drop 01.',
    body: [
      'The salt flat gives you about twenty minutes. After the sun drops, the sky turns peach at the horizon and blue above, and a thin film of water mirrors all of it.',
      'We shot every look in that window across four evenings, with no artificial light. The palette of the drop — stone, sand, bone, graphite — was chosen to sit inside those colours rather than fight them.',
      'The result is the quietest campaign we have made, and the one closest to how the clothes feel to wear.',
    ],
    products: ['dusk-coat', 'lumen-dress', 'drift-liner'],
  },
  {
    slug: 'objects-in-motion', no: '04', title: 'Objects in Motion', kicker: 'Design', date: '2027-01-28', read: '5 min', img: '213',
    lede: 'On pattern cutting for movement: why our coats are cut longer at the back and our trousers bend at the knee.',
    body: [
      'Clothes are designed standing still and worn in motion. We fit every sample on a person walking, cycling and reaching — then we change the pattern.',
      'That is why the Meridian Shell is 4 cm longer at the back, why the Orbit Cargo has darted, pre-bent knees, and why the Dusk Coat has a back vent that opens only when you stride.',
      'None of these details show in a still photograph. All of them show after a week of wear.',
    ],
    products: ['meridian-shell', 'orbit-cargo', 'dusk-coat'],
  },
];

export const STORES = [
  {
    key: 'riga', city: 'Riga', label: 'Flagship', img: '230',
    address: ['Tērbatas iela 32', 'LV-1011 Rīga, Latvia'],
    hours: [['Mon–Fri', '11:00–20:00'], ['Sat', '11:00–18:00'], ['Sun', '12:00–17:00']],
    phone: '+371 6700 2711', email: 'riga@aeris.lv',
    services: ['Hemming and alterations', 'Repair desk', 'Garment take-back'],
  },
  {
    key: 'berlin', city: 'Berlin', label: 'Store', img: '231',
    address: ['Linienstraße 140', '10115 Berlin, Germany'],
    hours: [['Mon–Sat', '11:00–19:00'], ['Sun', 'Closed']],
    phone: '+49 30 2804 1190', email: 'berlin@aeris.lv',
    services: ['Hemming', 'Garment take-back'],
  },
];

export const INFO = {
  shipping: {
    title: 'Shipping', sections: [
      ['Where we ship', 'We ship to the EU, the UK, Norway, Switzerland and the United States. Orders leave our warehouse in Riga within one working day.'],
      ['Costs and times', 'Standard delivery is €12 and takes 2–4 working days in the EU. Express is €24 and takes 1–2 working days. Standard delivery is free on orders over €300.'],
      ['Duties', 'Prices include VAT for EU orders. UK, Swiss, Norwegian and US orders are shipped duties paid.'],
    ],
  },
  returns: {
    title: 'Returns', sections: [
      ['30 days', 'Return unworn items with tags within 30 days of delivery for a full refund. Returns within the EU are free.'],
      ['How to return', 'Use the prepaid label in your parcel, or bring the item to our Riga or Berlin store. Refunds are issued to the original payment method within 5 working days of arrival.'],
      ['Exchanges', 'Need another size? Return the item and place a new order — this is the fastest way to get the right size.'],
    ],
  },
  care: {
    title: 'Care & repair', sections: [
      ['Wash less', 'Most of our garments need far less washing than you think. Air them out, brush wool, spot clean nylon.'],
      ['Repair desk', 'Every AERIS garment can be repaired for free in the first two years. Bring it to a store or send it to our Riga studio.'],
      ['Take-back', 'When you are done with a piece, return it to us. We resell what is wearable and recycle the rest through our partners.'],
    ],
  },
  sizing: {
    title: 'Size guide', sections: [
      ['How we size', 'Our tops are cut relaxed. If you are between sizes, choose the smaller one for a closer fit. Each product page lists measurements for size M and the size the model wears.'],
    ],
    table: {
      head: ['Size', 'Chest (body)', 'Waist (body)', 'Hip (body)'],
      rows: [['XS', '82–86 cm', '66–70 cm', '86–90 cm'], ['S', '87–92 cm', '71–76 cm', '91–96 cm'], ['M', '93–99 cm', '77–83 cm', '97–102 cm'], ['L', '100–106 cm', '84–90 cm', '103–108 cm'], ['XL', '107–114 cm', '91–98 cm', '109–115 cm']],
    },
  },
  privacy: {
    title: 'Privacy', sections: [
      ['What we collect', 'We collect what we need to deliver your order and nothing more: name, address, email and phone. Payment details are handled by our payment provider and never stored by us.'],
      ['Newsletter', 'If you subscribe, we email you about new drops and journal stories, about twice a month. Every email has an unsubscribe link.'],
      ['Contact', 'Questions about your data: privacy@aeris.lv.'],
    ],
  },
  terms: {
    title: 'Terms', sections: [
      ['Orders', 'A contract is formed when we confirm dispatch by email. Prices are in euros and include VAT for EU orders.'],
      ['Seller', 'AERIS Studio SIA, Tērbatas iela 32, Rīga, LV-1011, Latvia. Registration no. 40203348812.'],
    ],
  },
};
