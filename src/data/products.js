const surRonLightBeeColors = [
  {
    id: "black-yellow",
    name: "Black / Yellow",
    hex: "#d6ff34",
    image:
      "https://motoebikes.com/wp-content/uploads/2025/04/image1-2.webp",
  },
  {
    id: "pink",
    name: "Pink",
    hex: "#ff64c8",
    image:
      "https://motoebikes.com/wp-content/uploads/2025/05/New-Project-3-e1748007341664.png",
  },
  {
    id: "blue-lime",
    name: "Blue / Lime",
    hex: "#2d6fff",
    image:
      "https://motoebikes.com/wp-content/uploads/2025/11/image0-1.webp",
  },
  {
    id: "silver-orange",
    name: "Silver / Orange",
    hex: "#d6d6d6",
    image:
      "https://motoebikes.com/wp-content/uploads/2023/07/Sur-Ron-LBX-Silver-Orange_Facing.jpg",
  },
  {
    id: "black-orange",
    name: "Black / Orange",
    hex: "#ff6b1a",
    image:
      "https://motoebikes.com/wp-content/uploads/2023/07/Sur-Ron-LBX-BlackOrange_Facing-1.jpg",
  },
];

const talariaStingRColors = [
  {
    id: "matte-black",
    name: "Matte Black",
    hex: "#151515",
    image:
      "https://talaria.us.com/wp-content/uploads/2025/07/talaria-sting-r-mx4-electric-dirt-bike-factory-tl-004-bk-t-talaria.jpg",
  },
  {
    id: "electric-blue",
    name: "Electric Blue",
    hex: "#265dff",
    image:
      "https://talaria.us.com/wp-content/uploads/2025/07/talaria-sting-r-mx4-electric-dirt-bike-factory-tl-004-bk-t-talaria-4.jpg",
  },
];

const eRideProColors = [
  {
    id: "graphite-black",
    name: "Graphite Black",
    hex: "#202020",
    image:
      "https://motoebikes.com/wp-content/uploads/2024/10/Right-Side-scaled.jpg",
  },
];

const ultraBeeColors = [
  {
    id: "forest-green",
    name: "Forest Green",
    hex: "#4f6b4c",
    image:
      "https://www.sur-ron-usa.com/wp-content/uploads/2023/03/sur-ron-ultra-bee-forest-green-1.png",
  },
  {
    id: "pure-black",
    name: "Pure Black",
    hex: "#0e0e0e",
    image:
      "https://www.sur-ron-usa.com/wp-content/uploads/2023/03/sur-ron-ultra-bee-pure-black-eddition.png",
  },
];

const talariaX3Colors = [
  {
    id: "black-grey",
    name: "Black / Grey",
    hex: "#4c4c4c",
    image:
      "https://talaria.us.com/wp-content/uploads/2025/07/talaria-x3-xxx.jpg",
  },
  {
    id: "red",
    name: "Red",
    hex: "#dd2424",
    image:
      "https://talaria.us.com/wp-content/uploads/2025/07/talaria-x3-xxxa.jpg",
  },
  {
    id: "grey",
    name: "Grey",
    hex: "#a8abb3",
    image:
      "https://talaria.us.com/wp-content/uploads/2025/07/talaria-x3w.jpg",
  },
];

const eboxColors = [
  {
    id: "black",
    name: "Black",
    hex: "#111111",
    image:
      "https://eboxdragster.com/wp-content/uploads/2024/08/EBOX2V2-Black.webp",
  },
  {
    id: "orange",
    name: "Orange",
    hex: "#ff7b18",
    image:
      "https://eboxdragster.com/wp-content/uploads/2024/08/EBOX2V2-Black.webp",
  },
  {
    id: "teal",
    name: "Teal",
    hex: "#24c8b4",
    image:
      "https://eboxdragster.com/wp-content/uploads/2024/08/EBOX2V2-Black.webp",
  },
  {
    id: "white",
    name: "White",
    hex: "#f4f4f4",
    image:
      "https://eboxdragster.com/wp-content/uploads/2024/08/EBOX2V2-Black.webp",
  },
];

const apolloCityColors = [
  {
    id: "space-grey",
    name: "Space Grey",
    hex: "#5d6166",
    image:
      "https://apolloscooters.co/cdn/shop/files/CityPro-new2023_afc1bb3a-4cea-4b53-bfdb-0530456272c0.png?v=1738181231&width=1080",
  },
];

const niuKQi3Colors = [
  {
    id: "space-grey",
    name: "Space Grey",
    hex: "#53565b",
    image: "https://shop.niu.com/cdn/shop/products/1500_480x480.jpg?v=1741076118",
  },
];

const segwayGt2Colors = [
  {
    id: "super-black",
    name: "Super Black",
    hex: "#171717",
    image: "https://support.segway.com/upload/product/202206/16559768651846.png",
  },
];

const swytchGoColors = [
  {
    id: "go-black",
    name: "Black Power Pack",
    hex: "#1d1d1d",
    image: "https://www.swytchbike.com/cdn/shop/files/GoFullConversion_2048x.png",
  },
];

const bafangM625Colors = [
  {
    id: "black",
    name: "Black",
    hex: "#1b1b1b",
    image:
      "https://www.bafang-e.com/fileadmin/_processed_/b/a/csm_M625_MMG321.7501000.C_01_9dc4c9b7c8.png",
  },
];

const rawProducts = [
  {
    id: 1,
    slug: "sur-ron-light-bee",
    name: "Sur-Ron Light Bee",
    brand: "Sur-Ron",
    category: "Bike",
    tagline: "Lightweight electric off-road performance with bold color options.",
    price: 3999,
    range: 60,
    speed: 51,
    motor: "Mid-frame motor",
    battery: "60V / 40Ah battery pack",
    weight: "47 kg",
    frame: "Aluminium alloy double-cradle frame",
    color: "Black / Yellow",
    accent: "linear-gradient(135deg, #d5ff39 0%, #0d0d0d 100%)",
    image: surRonLightBeeColors[0].image,
    gallery: surRonLightBeeColors.map((variant) => variant.image),
    colorOptions: surRonLightBeeColors,
    description:
      "The Sur-Ron Light Bee blends electric punch, low weight, and dirt-bike stance into a compact machine built for quick trails, urban play, and standout looks.",
    features: [
      "Color-selectable frame options",
      "4-piston hydraulic braking system",
      "200 mm travel front suspension",
      "19-inch front / 18-inch rear wheel setup",
    ],
    review: {
      quote:
        "One of the sharpest-looking Light Bee builds around, and the lightweight chassis makes it seriously fun.",
      author: "Rider review",
    },
  },
  {
    id: 2,
    slug: "talaria-sting-r-mx4",
    name: "Talaria Sting R MX4",
    brand: "Talaria",
    category: "Bike",
    tagline: "A popular high-power trail bike with gearbox drive and sharp MX stance.",
    price: 3999,
    range: 52,
    speed: 55,
    motor: "DC IPM improved motor",
    battery: "60V / 45Ah lithium battery",
    weight: "66 kg",
    frame: "Lightweight alloy chassis",
    color: "Matte Black",
    accent: "linear-gradient(135deg, #265dff 0%, #0f0f0f 100%)",
    image: talariaStingRColors[0].image,
    gallery: talariaStingRColors.map((variant) => variant.image),
    colorOptions: talariaStingRColors,
    description:
      "The Talaria Sting R MX4 is one of the most popular electric dirt bikes in the category, known for its quiet gearbox drive, strong battery life, and agile off-road handling.",
    features: [
      "Gearbox drive instead of belt reduction",
      "Regenerative braking adjustment",
      "220 mm upgraded brake rotors",
      "Fast-charge capable 45Ah battery",
    ],
    review: {
      quote:
        "It feels planted, quick, and way more refined than most people expect the first time they ride one.",
      author: "Trail rider feedback",
    },
  },
  {
    id: 3,
    slug: "e-ride-pro-ss-2-0",
    name: "E Ride Pro SS 2.0",
    brand: "E Ride Pro",
    category: "Bike",
    tagline: "Big power, big range, and one of the hottest names in electric off-road right now.",
    price: 4899,
    range: 90,
    speed: 60,
    motor: "Mid-frame motor",
    battery: "72V / 40Ah 2.88kWh pack",
    weight: "85 kg",
    frame: "Alloy frame",
    color: "Graphite Black",
    accent: "linear-gradient(135deg, #ff3030 0%, #181818 100%)",
    image: eRideProColors[0].image,
    gallery: eRideProColors.map((variant) => variant.image),
    colorOptions: eRideProColors,
    description:
      "The E Ride Pro SS 2.0 has become a standout choice for riders chasing more speed and range, with a 72V setup and strong suspension package built for serious off-road use.",
    features: [
      "12kW peak power",
      "USD telescopic forks",
      "Hydraulic 230 mm front disc brake",
      "Fast 20% to 90% charging window",
    ],
    review: {
      quote:
        "The power jump is obvious straight away, and the bike still feels balanced enough to throw around.",
      author: "Off-road community review",
    },
  },
  {
    id: 4,
    slug: "sur-ron-ultra-bee",
    name: "Sur-Ron Ultra Bee",
    brand: "Sur-Ron",
    category: "Bike",
    tagline: "A mid-size powerhouse built for riders who want more torque and full-size presence.",
    price: 5000,
    range: 87,
    speed: 56,
    motor: "12.5kW peak output powertrain",
    battery: "74V high-capacity power system",
    weight: "85 kg",
    frame: "Performance off-road chassis",
    color: "Forest Green",
    accent: "linear-gradient(135deg, #5d7b52 0%, #111111 100%)",
    image: ultraBeeColors[0].image,
    gallery: ultraBeeColors.map((variant) => variant.image),
    colorOptions: ultraBeeColors,
    soldOut: true,
    description:
      "The Ultra Bee sits above the Light Bee with more power, more range, and a larger chassis, making it a favorite for riders stepping into harder trail and motocross terrain.",
    features: [
      "12.5kW peak power",
      "Traction control system",
      "Sport / Eco / Daily ride modes",
      "Forest Green and Pure Black finishes",
    ],
    review: {
      quote:
        "It has the punch people want from an e-moto, but still feels controlled instead of wild in a bad way.",
      author: "Weekend MX rider",
    },
  },
  {
    id: 5,
    slug: "talaria-x3-xxx",
    name: "Talaria X3 (XXX)",
    brand: "Talaria",
    category: "Bike",
    tagline: "A smaller, lighter, and wildly popular compact electric bike for daily riding and play.",
    price: 2799,
    range: 43,
    speed: 32,
    motor: "Air-cooled DC IPM motor",
    battery: "25Ah or 40Ah 60V battery",
    weight: "50 kg",
    frame: "Lightweight compact chassis",
    color: "Black / Grey",
    accent: "linear-gradient(135deg, #df3030 0%, #3a3a3a 100%)",
    image: talariaX3Colors[0].image,
    gallery: talariaX3Colors.map((variant) => variant.image),
    colorOptions: talariaX3Colors,
    description:
      "The Talaria X3, also known as the XXX, is one of the most talked-about compact electric bikes thanks to its lower weight, punchy power delivery, and multiple battery options.",
    features: [
      "Black / Grey, Grey, or Red finishes",
      "25Ah or 40Ah battery options",
      "4-piston hydraulic brakes",
      "Compact 17-inch rear and 19-inch front wheel setup",
    ],
    review: {
      quote:
        "It's the bike people keep recommending when someone wants something lighter and easier to live with than a full-size e-moto.",
      author: "Urban rider review",
    },
  },
  {
    id: 6,
    slug: "ebox-2-v2",
    name: "EBOX 2 V2",
    brand: "EBOX",
    category: "Bike",
    tagline: "A hugely popular electric minibike with big fun, easy tuning, and serious pit-bike energy.",
    price: 1499,
    range: 25,
    speed: 32,
    motor: "2.0kW electric powertrain",
    battery: "60V 18.2Ah lithium battery",
    weight: "45 kg",
    frame: "Double cradle steel chassis",
    color: "Black",
    accent: "linear-gradient(135deg, #ff7b18 0%, #111111 100%)",
    image: eboxColors[0].image,
    gallery: eboxColors.map((variant) => variant.image),
    colorOptions: eboxColors,
    soldOut: true,
    description:
      "The EBOX 2 V2 has become a go-to electric minibike for riders who want a small package with a strong punch, simple adjustability, and a ton of personality.",
    features: [
      "Black, Orange, Teal, and White colorways",
      "Top speed and acceleration adjustment",
      "USD forks with mono rear shock",
      "14-inch front and 12-inch rear wheel setup",
    ],
    review: {
      quote: "For pure fun factor, it's hard to beat. Small bike, huge grin.",
      author: "Pit bike rider",
    },
  },
  {
    id: 7,
    slug: "apollo-city",
    name: "Apollo City",
    brand: "Apollo",
    category: "Scooter",
    tagline: "One of the best-known premium commuter scooters with long range and comfort-first tuning.",
    price: 1099,
    range: 43,
    speed: 32,
    motor: "Dual 500W motors",
    battery: "48V 20Ah battery",
    weight: "Not listed",
    frame: "Commuter scooter frame with triple spring suspension",
    color: "Space Grey",
    accent: "linear-gradient(135deg, #666b71 0%, #181818 100%)",
    image: apolloCityColors[0].image,
    gallery: apolloCityColors.map((variant) => variant.image),
    colorOptions: apolloCityColors,
    description:
      "The Apollo City is a premium long-range commuter scooter built around comfort, regen braking, and smart app features, making it one of the most recognizable choices in the category.",
    features: [
      "Up to 43 miles of range",
      "Triple spring suspension",
      "Power RBS regenerative braking",
      "IP66 water resistance",
    ],
    review: {
      quote:
        "This is the scooter people mention when they want something comfortable, fast, and built for real daily use.",
      author: "Commuter review",
    },
  },
  {
    id: 8,
    slug: "niu-kqi3-max",
    name: "NIU KQi3 Max",
    brand: "NIU",
    category: "Scooter",
    tagline: "A very popular all-round commuter scooter with excellent everyday range and clean design.",
    price: 999,
    range: 40,
    speed: 20,
    motor: "450W rated / 900W max power motor",
    battery: "13Ah battery",
    weight: "46.3 lb",
    frame: "Aerospace-grade aluminum scooter chassis",
    color: "Space Grey",
    accent: "linear-gradient(135deg, #61656c 0%, #151515 100%)",
    image: niuKQi3Colors[0].image,
    gallery: niuKQi3Colors.map((variant) => variant.image),
    colorOptions: niuKQi3Colors,
    description:
      "The NIU KQi3 Max is one of the most widely recommended commuter scooters thanks to its polished ride feel, strong braking, and practical 40-mile class range.",
    features: [
      "Up to 40.4 miles range",
      "Dual disc plus regenerative braking",
      "9.5-inch self-healing tubeless tires",
      "Bluetooth app connectivity",
    ],
    review: {
      quote:
        "Simple, reliable, and easy to recommend if you want a clean commuter scooter without weird compromises.",
      author: "Everyday rider review",
    },
  },
  {
    id: 9,
    slug: "segway-gt2",
    name: "Segway GT2",
    brand: "Segway",
    category: "Scooter",
    tagline: "A flagship super scooter for riders who want huge speed, dual-motor punch, and serious range.",
    price: 3999,
    range: 55,
    speed: 43,
    motor: "Dual 1500W motors",
    battery: "1512Wh battery pack",
    weight: "116 lb",
    frame: "Super scooter chassis with front and rear suspension",
    color: "Super Black",
    accent: "linear-gradient(135deg, #272727 0%, #8d0000 100%)",
    image: segwayGt2Colors[0].image,
    gallery: segwayGt2Colors.map((variant) => variant.image),
    colorOptions: segwayGt2Colors,
    description:
      "The Segway GT2 is one of the best-known performance scooters on the market, bringing dual-motor acceleration, long range, and superscooter hardware to the category.",
    features: [
      "43.5 mph top speed",
      "55.9 miles max range",
      "Dual-wheel drive",
      "Front and rear disc brakes",
    ],
    review: {
      quote:
        "It's over the top in the best way. If someone wants a scooter that feels like a machine, this is the one they bring up.",
      author: "Performance scooter rider",
    },
  },
  {
    id: 10,
    slug: "swytch-go-kit",
    name: "Swytch GO Conversion Kit",
    brand: "Swytch",
    category: "Conversion Kit",
    tagline: "One of the best-known conversion kits for turning a regular bike into an e-bike with minimal fuss.",
    price: 349,
    range: 60,
    speed: 20,
    motor: "Front motor wheel system",
    battery: "Frame-mounted GO power pack",
    weight: "Lightweight modular kit",
    frame: "Fits step-over, folding, road, hybrid, and mountain bikes",
    color: "Black Power Pack",
    accent: "linear-gradient(135deg, #f24b3d 0%, #191919 100%)",
    image: swytchGoColors[0].image,
    gallery: swytchGoColors.map((variant) => variant.image),
    colorOptions: swytchGoColors,
    description:
      "The Swytch GO kit is one of the most popular entry points into e-bike conversion, designed to work with a huge range of bike types while keeping installation approachable.",
    features: [
      "Up to 60 miles claimed range",
      "Velcro strap frame connection",
      "Fits mountain, road, hybrid, folding, and commuter bikes",
      "Motor wheel, pedal sensor, and power pack included",
    ],
    review: {
      quote:
        "If you already love your bike and just want electric assist, Swytch is the name most people know first.",
      author: "Cycling conversion review",
    },
  },
  {
    id: 11,
    slug: "bafang-m625-kit",
    name: "Bafang M625 Drive Kit",
    brand: "Bafang",
    category: "Conversion Kit",
    tagline: "A high-torque mid-drive system for riders building powerful custom e-bikes.",
    price: 1199,
    range: 45,
    speed: 28,
    motor: "Mid-drive motor",
    battery: "50.4V compatible system",
    weight: "5.4 kg motor unit",
    frame: "20 to 29-inch compatible bike builds",
    color: "Black",
    accent: "linear-gradient(135deg, #2e2e2e 0%, #7c0000 100%)",
    image: bafangM625Colors[0].image,
    gallery: bafangM625Colors.map((variant) => variant.image),
    colorOptions: bafangM625Colors,
    description:
      "For riders building a serious custom e-bike, the Bafang M625 is a respected high-torque mid-drive system that pushes well beyond lightweight commuter conversion territory.",
    features: [
      "Up to 160Nm max torque",
      "750W or 1000W rated power",
      "20 to 29-inch wheel compatibility",
      "IPX6-rated motor housing",
    ],
    review: {
      quote:
        "If someone wants real mid-drive power in a conversion build, Bafang is always part of the conversation.",
      author: "Custom build community",
    },
  },
];

export const salePercent = 90;

export const products = rawProducts.map((product) => ({
  ...product,
  originalPrice: product.price,
  price: Math.max(1, Math.round(product.price * 0.1)),
  salePercent,
}));

export const reviews = [
  {
    name: "Daniel K.",
    title: "Design Director",
    rating: 5,
    text: "The finish quality and UI feel more like consumer tech than a bike shop purchase.",
  },
  {
    name: "Amina J.",
    title: "Daily Commuter",
    rating: 5,
    text: "Fast, comfortable, and the range estimate is shockingly accurate in real city traffic.",
  },
  {
    name: "Victor L.",
    title: "Trail Rider",
    rating: 4,
    text: "Power delivery is smooth and the chassis stays planted even when the terrain gets rough.",
  },
];
