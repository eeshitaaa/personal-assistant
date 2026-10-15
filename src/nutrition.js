export const NUTRIENTS = [
  ["calories", "Energy", "kcal"],
  ["protein", "Protein", "g"],
  ["carbs", "Carbs", "g"],
  ["fat", "Fat", "g"],
  ["fiber", "Fibre", "g"],
  ["sugar", "Sugar", "g"],
  ["sodium", "Sodium", "mg"],
  ["calcium", "Calcium", "mg"],
  ["iron", "Iron", "mg"],
  ["potassium", "Potassium", "mg"],
  ["vitaminC", "Vitamin C", "mg"],
];
// Rounded generic composition estimates per 100 g. Preparation/brands vary.
const rows = [
  [
    "oats",
    "Oats, dry",
    389,
    16.9,
    66.3,
    6.9,
    10.6,
    0.9,
    2,
    54,
    4.7,
    429,
    0,
    "vegan",
  ],
  [
    "milk",
    "Milk, whole",
    61,
    3.2,
    4.8,
    3.3,
    0,
    5.1,
    43,
    113,
    0.03,
    132,
    0,
    "vegetarian",
  ],
  [
    "yogurt",
    "Yogurt, plain",
    61,
    3.5,
    4.7,
    3.3,
    0,
    4.7,
    46,
    121,
    0.05,
    155,
    0.5,
    "vegetarian",
  ],
  [
    "banana",
    "Banana, peeled",
    89,
    1.1,
    22.8,
    0.3,
    2.6,
    12.2,
    1,
    5,
    0.3,
    358,
    8.7,
    "vegan",
  ],
  [
    "apple",
    "Apple, with skin",
    52,
    0.3,
    13.8,
    0.2,
    2.4,
    10.4,
    1,
    6,
    0.1,
    107,
    4.6,
    "vegan",
  ],
  [
    "rice",
    "Rice, white, cooked",
    130,
    2.7,
    28.2,
    0.3,
    0.4,
    0.1,
    1,
    10,
    0.2,
    35,
    0,
    "vegan",
  ],
  [
    "lentils",
    "Lentils / dal, cooked, unsalted",
    116,
    9,
    20.1,
    0.4,
    7.9,
    1.8,
    2,
    19,
    3.3,
    369,
    1.5,
    "vegan",
  ],
  [
    "chickpeas",
    "Chickpeas / chana, cooked, unsalted",
    164,
    8.9,
    27.4,
    2.6,
    7.6,
    4.8,
    7,
    49,
    2.9,
    291,
    1.3,
    "vegan",
  ],
  [
    "tofu",
    "Tofu, firm",
    144,
    17.3,
    2.8,
    8.7,
    2.3,
    0.6,
    14,
    683,
    2.7,
    237,
    0,
    "vegan",
  ],
  [
    "paneer",
    "Paneer, plain (approximate)",
    265,
    18.3,
    1.2,
    20.8,
    0,
    1.2,
    18,
    208,
    0.2,
    104,
    0,
    "vegetarian",
  ],
  [
    "egg",
    "Egg, hard-boiled, peeled",
    155,
    12.6,
    1.1,
    10.6,
    0,
    1.1,
    124,
    50,
    1.2,
    126,
    0,
    "omnivore",
  ],
  [
    "chicken",
    "Chicken breast, cooked, skinless",
    165,
    31,
    0,
    3.6,
    0,
    0,
    74,
    15,
    1,
    256,
    0,
    "omnivore",
  ],
  [
    "salmon",
    "Salmon, cooked",
    206,
    22.1,
    0,
    12.4,
    0,
    0,
    61,
    15,
    0.3,
    384,
    0,
    "omnivore",
  ],
  [
    "spinach",
    "Spinach, raw",
    23,
    2.9,
    3.6,
    0.4,
    2.2,
    0.4,
    79,
    99,
    2.7,
    558,
    28.1,
    "vegan",
  ],
  [
    "tomato",
    "Tomato, raw",
    18,
    0.9,
    3.9,
    0.2,
    1.2,
    2.6,
    5,
    10,
    0.3,
    237,
    13.7,
    "vegan",
  ],
  [
    "broccoli",
    "Broccoli, cooked, unsalted",
    35,
    2.4,
    7.2,
    0.4,
    3.3,
    1.4,
    41,
    40,
    0.7,
    293,
    64.9,
    "vegan",
  ],
  [
    "potato",
    "Potato, boiled",
    87,
    1.9,
    20.1,
    0.1,
    1.8,
    0.9,
    4,
    5,
    0.3,
    379,
    13,
    "vegan",
  ],
  [
    "bread",
    "Whole-wheat bread",
    247,
    13,
    41,
    4.2,
    7,
    5.6,
    400,
    107,
    2.4,
    248,
    0,
    "vegan",
  ],
  [
    "almonds",
    "Almonds, unsalted",
    579,
    21.2,
    21.6,
    49.9,
    12.5,
    4.4,
    1,
    269,
    3.7,
    733,
    0,
    "vegan",
  ],
  ["oil", "Olive oil", 884, 0, 0, 100, 0, 0, 2, 1, 0.6, 1, 0, "vegan"],
  [
    "flour",
    "Whole-wheat flour / atta, dry",
    340,
    13.2,
    72,
    2.5,
    10.7,
    0.4,
    5,
    34,
    3.6,
    363,
    0,
    "vegan",
  ],
  [
    "peanuts",
    "Peanuts, dry-roasted, unsalted",
    587,
    24.4,
    21.3,
    49.7,
    8.4,
    4.9,
    6,
    58,
    1.6,
    634,
    0,
    "vegan",
  ],
  [
    "quinoa",
    "Quinoa, cooked",
    120,
    4.4,
    21.3,
    1.9,
    2.8,
    0.9,
    7,
    17,
    1.5,
    172,
    0,
    "vegan",
  ],
  [
    "carrot",
    "Carrot, raw",
    41,
    0.9,
    9.6,
    0.2,
    2.8,
    4.7,
    69,
    33,
    0.3,
    320,
    5.9,
    "vegan",
  ],
];
export const FOODS = rows.map(([id, name, ...values]) => ({
  id,
  name,
  diet: values[11],
  source: "Starter estimate · generic food, per 100 g",
  nutrients: Object.fromEntries(NUTRIENTS.map(([key], i) => [key, values[i]])),
}));
const ingredient = (id, grams) => ({
  food: FOODS.find((f) => f.id === id),
  grams,
});
const recipe = (id, name, meal, diet, minutes, items, steps, tags = []) => ({
  id,
  name,
  meal,
  diet,
  minutes,
  servings: 1,
  ingredients: items.map(([id, g]) => ingredient(id, g)),
  steps,
  tags,
});
export const RECIPES = [
  recipe(
    "overnight",
    "Banana overnight oats",
    "Breakfast",
    "vegetarian",
    5,
    [
      ["oats", 50],
      ["milk", 150],
      ["banana", 100],
      ["almonds", 10],
    ],
    [
      "Mix oats and milk in a covered jar. Refrigerate overnight.",
      "Top with sliced banana and almonds before eating.",
    ],
    ["milk", "nuts", "oats"],
  ),
  recipe(
    "toast",
    "Egg & spinach toast",
    "Breakfast",
    "omnivore",
    10,
    [
      ["egg", 100],
      ["bread", 70],
      ["spinach", 40],
      ["tomato", 80],
    ],
    [
      "Toast the bread. Wilt spinach in a non-stick pan with a splash of water.",
      "Slice the cooked eggs. Layer with spinach and tomato.",
    ],
    ["egg", "wheat"],
  ),
  recipe(
    "chilla",
    "Lentil pancakes",
    "Breakfast",
    "vegan",
    25,
    [
      ["lentils", 180],
      ["flour", 30],
      ["tomato", 50],
      ["oil", 5],
    ],
    [
      "Mash cooked lentils with flour, chopped tomato, spices and enough water for a thick batter.",
      "Brush a non-stick pan with the measured oil. Cook small pancakes until set and golden on both sides.",
    ],
    ["wheat"],
  ),
  recipe(
    "dalbowl",
    "Dal, rice & greens",
    "Lunch",
    "vegan",
    20,
    [
      ["lentils", 200],
      ["rice", 150],
      ["spinach", 80],
      ["oil", 5],
    ],
    [
      "Warm cooked lentils with water, cumin and turmeric. Add spinach and simmer until wilted.",
      "Serve with cooked rice. Stir the measured oil into the dal.",
    ],
  ),
  recipe(
    "chana",
    "Chana salad bowl",
    "Lunch",
    "vegan",
    10,
    [
      ["chickpeas", 180],
      ["tomato", 100],
      ["carrot", 80],
      ["oil", 5],
    ],
    [
      "Rinse and drain cooked chickpeas. Chop tomato and grate carrot.",
      "Toss with measured oil, lemon juice and herbs to taste.",
    ],
  ),
  recipe(
    "chickenbowl",
    "Chicken & rice bowl",
    "Lunch",
    "omnivore",
    20,
    [
      ["chicken", 140],
      ["rice", 180],
      ["broccoli", 150],
      ["oil", 5],
    ],
    [
      "Warm the cooked chicken and rice separately until steaming hot.",
      "Steam broccoli, then plate with chicken, rice and measured oil.",
    ],
    [],
  ),
  recipe(
    "paneer",
    "Paneer & greens plate",
    "Dinner",
    "vegetarian",
    20,
    [
      ["paneer", 120],
      ["spinach", 100],
      ["tomato", 100],
      ["rice", 150],
      ["oil", 5],
    ],
    [
      "Sauté chopped tomato in the measured oil. Add spinach and cook until wilted.",
      "Add cubed paneer and warm through. Serve with cooked rice.",
    ],
    ["milk"],
  ),
  recipe(
    "tofubowl",
    "Tofu & quinoa bowl",
    "Dinner",
    "vegan",
    20,
    [
      ["tofu", 150],
      ["quinoa", 180],
      ["broccoli", 120],
      ["oil", 5],
    ],
    [
      "Pan-sear cubed tofu with the measured oil until heated through.",
      "Steam broccoli. Serve with cooked quinoa and herbs.",
    ],
    ["soy"],
  ),
  recipe(
    "salmonplate",
    "Salmon & potatoes",
    "Dinner",
    "omnivore",
    25,
    [
      ["salmon", 140],
      ["potato", 220],
      ["broccoli", 150],
    ],
    [
      "Cook salmon thoroughly; use the cooked portion weight shown here.",
      "Boil potatoes and steam broccoli, then serve with lemon and herbs.",
    ],
    ["fish"],
  ),
  recipe(
    "yogurtbowl",
    "Yogurt, apple & almonds",
    "Snack",
    "vegetarian",
    5,
    [
      ["yogurt", 180],
      ["apple", 150],
      ["almonds", 15],
    ],
    ["Chop the apple and spoon over yogurt.", "Add chopped almonds."],
    ["milk", "nuts"],
  ),
  recipe(
    "bananabites",
    "Banana & peanut bites",
    "Snack",
    "vegan",
    5,
    [
      ["banana", 120],
      ["peanuts", 25],
    ],
    ["Slice the banana. Serve with measured roasted peanuts."],
    ["peanuts"],
  ),
  recipe(
    "hummus",
    "Chickpea mash & carrots",
    "Snack",
    "vegan",
    10,
    [
      ["chickpeas", 100],
      ["carrot", 120],
      ["oil", 5],
    ],
    [
      "Mash cooked chickpeas with measured oil, lemon and a splash of water.",
      "Serve with carrot sticks.",
    ],
  ),
];
export const MEALS = ["Breakfast", "Lunch", "Dinner", "Snack"];
export function nutritionTotal(items) {
  const total = Object.fromEntries(NUTRIENTS.map(([k]) => [k, 0]));
  const missing = Object.fromEntries(NUTRIENTS.map(([k]) => [k, 0]));
  for (const item of items) {
    const grams = Number(item.grams);
    if (!Number.isFinite(grams) || grams <= 0) continue;
    for (const [key] of NUTRIENTS) {
      const value = item.food?.nutrients?.[key];
      if (typeof value === "number" && Number.isFinite(value))
        total[key] += (value * grams) / 100;
      else missing[key]++;
    }
  }
  return { total, missing };
}
export function scaledIngredients(recipe, portions = 1) {
  return recipe.ingredients.map((item) => ({
    ...item,
    grams: (Number(item.grams) * portions) / recipe.servings,
  }));
}
export function profileTargets(profile) {
  const { age, height, weight, sex, activity } = profile;
  if (
    ![age, height, weight].every(
      (v) => Number.isFinite(Number(v)) && Number(v) > 0,
    ) ||
    !["female", "male"].includes(sex)
  )
    return null;
  if (
    age < 19 ||
    age > 78 ||
    height < 120 ||
    height > 230 ||
    weight < 35 ||
    weight > 250 ||
    profile.special
  )
    return null;
  const factor = { low: 1.2, light: 1.375, moderate: 1.55, high: 1.725 }[
    activity
  ];
  if (!factor) return null;
  const calories = Math.round(
    (10 * weight + 6.25 * height - 5 * age + (sex === "male" ? 5 : -161)) *
      factor,
  );
  if (calories < 1200 || calories > 5000) return null;
  return {
    calories,
    protein: Math.round((calories * 0.2) / 4),
    carbs: Math.round((calories * 0.5) / 4),
    fat: Math.round((calories * 0.3) / 9),
    fiber: Math.round((calories / 1000) * 14),
  };
}
export function eligibleRecipes(recipes, profile) {
  const aliases = {
    dairy: ["milk", "yogurt", "paneer", "cheese", "butter", "whey", "casein"],
    gluten: ["wheat", "flour", "bread", "oats"],
    nuts: ["almond", "peanut", "cashew", "walnut", "pistachio"],
    eggs: ["egg"],
    soya: ["soy", "tofu"],
    soy: ["soy", "tofu"],
    fish: ["fish", "salmon"],
  };
  const excluded = (profile.avoid || "")
    .toLowerCase()
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean)
    .flatMap((word) => aliases[word] || [word]);
  return recipes.filter(
    (r) =>
      (profile.diet === "omnivore" ||
        r.diet === profile.diet ||
        (profile.diet === "vegetarian" && r.diet === "vegan")) &&
      r.minutes <= Number(profile.cookTime || 60) &&
      !excluded.some((word) =>
        [r.name, ...(r.tags || []), ...r.ingredients.map((i) => i.food.name)]
          .join(" ")
          .toLowerCase()
          .includes(word),
      ),
  );
}
export function buildPlan(recipes, profile) {
  const pool = eligibleRecipes(recipes, profile),
    target = profileTargets(profile);
  const days = Array.from({ length: 7 }, (_, day) => ({
    day: day + 1,
    meals: MEALS.map((meal, i) => {
      const options = pool.filter((r) => r.meal === meal);
      const r = options[day % options.length];
      if (!r) return { meal, recipe: null, portions: 1 };
      const energy = nutritionTotal(scaledIngredients(r)).total.calories;
      const ratio = [0.25, 0.3, 0.3, 0.15][i];
      const portions =
        target && energy
          ? Math.max(
              0.5,
              Math.min(
                3,
                Math.round(((target.calories * ratio) / energy) * 4) / 4,
              ),
            )
          : 1;
      return { meal, recipe: r, portions };
    }),
  }));
  const count = Number(profile.workoutDays || 3),
    minutes = Number(profile.workoutMinutes || 20);
  const positions = {
    2: [0, 3],
    3: [0, 2, 4],
    4: [0, 1, 3, 5],
    5: [0, 1, 3, 4, 5],
  }[count] || [0, 2, 4];
  const strength =
    profile.equipment === "gym"
      ? "Light goblet squat, seated row, chest press and hip hinge"
      : profile.equipment === "dumbbells"
        ? "Goblet squat, dumbbell row, floor press and Romanian deadlift"
        : "Chair squat, wall push-up, glute bridge and bird-dog";
  const gentle = profile.experience === "beginner";
  return {
    createdAt: new Date().toISOString(),
    profile: { ...profile },
    days,
    workouts: Array.from({ length: 7 }, (_, day) => ({
      day: day + 1,
      active: positions.includes(day),
      title: positions.includes(day)
        ? profile.workoutStyle === "cardio"
          ? "Easy cardio"
          : profile.workoutStyle === "strength"
            ? "Full-body strength"
            : positions.indexOf(day) % 2 === 0
              ? "Full-body strength"
              : "Easy cardio"
        : "Rest / easy movement",
      detail: positions.includes(day)
        ? profile.workoutStyle === "cardio" ||
          (profile.workoutStyle === "mixed" && positions.indexOf(day) % 2 === 1)
          ? `${minutes} minutes of ${profile.cardio || "walking"} at a pace where you can talk. Start with 5 easy minutes and finish gently.`
          : `${minutes} minutes including a 5-minute warm-up. ${strength}. ${gentle ? "1–2" : "2–3"} sets of 8–12 comfortable repetitions, resting 60–90 seconds. Stop before form breaks.`
        : "Rest, or a comfortable short walk and gentle mobility if you feel like it.",
    })),
  };
}
export function localDay(date = new Date()) {
  const p = new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  return ["year", "month", "day"]
    .map((k) => p.find((i) => i.type === k).value)
    .join("-");
}
