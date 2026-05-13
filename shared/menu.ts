import type { MenuItem } from "./types";

const SIZE_GROUP = {
  id: "size" as const,
  label: "Size",
  required: true,
  multi: false,
  options: [
    { id: "small", label: "Small", priceDelta: 0 },
    { id: "medium", label: "Medium", priceDelta: 150 },
    { id: "large", label: "Large", priceDelta: 300 },
  ],
};

const SPICE_GROUP = {
  id: "spice" as const,
  label: "Spice level",
  required: true,
  multi: false,
  options: [
    { id: "mild", label: "Mild", priceDelta: 0 },
    { id: "medium", label: "Medium", priceDelta: 0 },
    { id: "spicy", label: "Spicy", priceDelta: 0 },
    { id: "extra-spicy", label: "Extra spicy", priceDelta: 0 },
  ],
};

const ICE_GROUP = {
  id: "ice" as const,
  label: "Ice",
  required: false,
  multi: false,
  options: [
    { id: "no-ice", label: "No ice", priceDelta: 0 },
    { id: "light-ice", label: "Light ice", priceDelta: 0 },
    { id: "regular-ice", label: "Regular ice", priceDelta: 0 },
  ],
};

const MILK_GROUP = {
  id: "milk" as const,
  label: "Milk",
  required: false,
  multi: false,
  options: [
    { id: "whole", label: "Whole", priceDelta: 0 },
    { id: "oat", label: "Oat", priceDelta: 75 },
    { id: "almond", label: "Almond", priceDelta: 75 },
    { id: "none", label: "Black / no milk", priceDelta: 0 },
  ],
};

export const MENU: MenuItem[] = [
  // ─── Mains ──────────────────────────────────────────────
  {
    id: "spicy-chicken-sandwich",
    name: "Spicy Chicken Sandwich",
    description:
      "Buttermilk-fried chicken thigh, pickled slaw, gochujang aioli on a brioche bun.",
    category: "mains",
    basePrice: 1395,
    image:
      "https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=900&q=80&auto=format&fit=crop",
    tags: ["spicy", "popular"],
    modifiers: [SPICE_GROUP],
  },
  {
    id: "smash-burger",
    name: "Double Smash Burger",
    description:
      "Two crispy-edged beef patties, American cheese, caramelized onions, house sauce.",
    category: "mains",
    basePrice: 1495,
    image:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=900&q=80&auto=format&fit=crop",
    tags: ["popular"],
    modifiers: [
      {
        id: "extras",
        label: "Add-ons",
        required: false,
        multi: true,
        options: [
          { id: "bacon", label: "Bacon", priceDelta: 200 },
          { id: "extra-patty", label: "Extra patty", priceDelta: 350 },
          { id: "egg", label: "Fried egg", priceDelta: 150 },
        ],
      },
    ],
  },
  {
    id: "miso-salmon-bowl",
    name: "Miso Salmon Bowl",
    description:
      "Glazed salmon, jasmine rice, avocado, cucumber, edamame, sesame-ginger dressing.",
    category: "mains",
    basePrice: 1695,
    image:
      "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=900&q=80&auto=format&fit=crop",
    tags: ["healthy", "gluten-free"],
    modifiers: [],
  },
  {
    id: "margherita-flatbread",
    name: "Margherita Flatbread",
    description:
      "Wood-fired crust, San Marzano tomato, fior di latte, fresh basil, olive oil.",
    category: "mains",
    basePrice: 1295,
    image:
      "https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=900&q=80&auto=format&fit=crop",
    tags: ["vegetarian"],
    modifiers: [],
  },
  {
    id: "kale-caesar",
    name: "Kale Caesar",
    description:
      "Tuscan kale, shaved parmesan, sourdough croutons, lemon-anchovy dressing.",
    category: "mains",
    basePrice: 1195,
    image:
      "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=900&q=80&auto=format&fit=crop",
    tags: ["vegetarian"],
    modifiers: [
      {
        id: "extras",
        label: "Add a protein",
        required: false,
        multi: false,
        options: [
          { id: "chicken", label: "Grilled chicken", priceDelta: 450 },
          { id: "salmon", label: "Seared salmon", priceDelta: 650 },
          { id: "tofu", label: "Crispy tofu", priceDelta: 350 },
        ],
      },
    ],
  },

  // ─── Sides ──────────────────────────────────────────────
  {
    id: "truffle-fries",
    name: "Truffle Fries",
    description: "Hand-cut fries, truffle oil, parmesan, chives.",
    category: "sides",
    basePrice: 695,
    image:
      "https://images.unsplash.com/photo-1639024471283-03518883512d?w=900&q=80&auto=format&fit=crop",
    tags: ["vegetarian", "popular"],
    modifiers: [],
  },
  {
    id: "mac-and-cheese",
    name: "Three-Cheese Mac",
    description: "Cavatappi, gruyère, cheddar, parmesan, crispy panko top.",
    category: "sides",
    basePrice: 795,
    image:
      "https://images.unsplash.com/photo-1543339494-b4cd4f7ba686?w=900&q=80&auto=format&fit=crop",
    tags: ["vegetarian"],
    modifiers: [],
  },
  {
    id: "brussels",
    name: "Charred Brussels Sprouts",
    description: "Roasted brussels, maple-bacon glaze, pickled chili.",
    category: "sides",
    basePrice: 745,
    image:
      "https://images.unsplash.com/photo-1600335895229-6e75511892c8?w=900&q=80&auto=format&fit=crop",
    tags: [],
    modifiers: [],
  },
  {
    id: "side-salad",
    name: "House Salad",
    description: "Mixed greens, cherry tomato, cucumber, shallot vinaigrette.",
    category: "sides",
    basePrice: 595,
    image:
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=900&q=80&auto=format&fit=crop",
    tags: ["vegan", "gluten-free"],
    modifiers: [],
  },

  // ─── Drinks ─────────────────────────────────────────────
  {
    id: "still-water",
    name: "Still Water",
    description: "Bottled mineral water.",
    category: "drinks",
    basePrice: 295,
    image:
      "https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=900&q=80&auto=format&fit=crop",
    tags: [],
    modifiers: [SIZE_GROUP],
  },
  {
    id: "sparkling-water",
    name: "Sparkling Water",
    description: "Italian sparkling mineral water.",
    category: "drinks",
    basePrice: 345,
    image:
      "https://images.unsplash.com/photo-1523362628745-0c100150b504?w=900&q=80&auto=format&fit=crop",
    tags: [],
    modifiers: [SIZE_GROUP],
  },
  {
    id: "iced-latte",
    name: "Iced Latte",
    description: "Double espresso over ice with cold milk.",
    category: "drinks",
    basePrice: 525,
    image:
      "https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=900&q=80&auto=format&fit=crop",
    tags: ["popular"],
    modifiers: [SIZE_GROUP, MILK_GROUP, ICE_GROUP],
  },
  {
    id: "lemonade",
    name: "House Lemonade",
    description: "Fresh-squeezed lemon, cane sugar, mint.",
    category: "drinks",
    basePrice: 445,
    image:
      "https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=900&q=80&auto=format&fit=crop",
    tags: [],
    modifiers: [SIZE_GROUP, ICE_GROUP],
  },

  // ─── Desserts ───────────────────────────────────────────
  {
    id: "chocolate-mousse",
    name: "Dark Chocolate Mousse",
    description: "70% valrhona, whipped cream, sea salt, cocoa nibs.",
    category: "desserts",
    basePrice: 795,
    image:
      "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=900&q=80&auto=format&fit=crop",
    tags: ["vegetarian"],
    modifiers: [],
  },
  {
    id: "olive-oil-cake",
    name: "Olive Oil Cake",
    description: "Citrus glaze, candied lemon, crème fraîche.",
    category: "desserts",
    basePrice: 745,
    image:
      "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=900&q=80&auto=format&fit=crop",
    tags: ["vegetarian"],
    modifiers: [],
  },
];

export function findItem(id: string): MenuItem | undefined {
  return MENU.find((m) => m.id === id);
}
