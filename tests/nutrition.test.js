import test from "node:test";
import assert from "node:assert/strict";
import {
  FOODS,
  RECIPES,
  NUTRIENTS,
  nutritionTotal,
  scaledIngredients,
  profileTargets,
  eligibleRecipes,
  buildPlan,
  localDay,
} from "../src/nutrition.js";
const profile = {
  age: 30,
  height: 165,
  weight: 60,
  sex: "female",
  activity: "light",
  diet: "vegan",
  avoid: "peanuts",
  cookTime: 30,
  workoutDays: 3,
  workoutMinutes: 20,
  equipment: "none",
  workoutStyle: "mixed",
  experience: "beginner",
};
test("weighed meals use grams, not assumed servings", () => {
  const r = nutritionTotal([
    { food: FOODS.find((f) => f.id === "rice"), grams: 150 },
    { food: FOODS.find((f) => f.id === "lentils"), grams: 200 },
  ]);
  assert.equal(r.total.calories, 427);
  assert.equal(r.total.protein, 22.05);
  assert.equal(r.total.carbs, 82.5);
});
test("recipe scaling supports recipe yield and fractional portions without mutations", () => {
  const r = { ...RECIPES[0], servings: 4 };
  const old = JSON.stringify(r);
  const base = nutritionTotal(r.ingredients).total;
  const scaled = nutritionTotal(scaledIngredients(r, 2)).total;
  for (const [key] of NUTRIENTS) assert.equal(scaled[key], base[key] / 2);
  assert.equal(JSON.stringify(r), old);
});
test("missing micronutrients remain missing rather than counted as zero", () => {
  const r = nutritionTotal([
    { food: { nutrients: { calories: 100, protein: 5 } }, grams: 50 },
  ]);
  assert.equal(r.total.calories, 50);
  assert.equal(r.missing.calories, 0);
  assert.equal(r.missing.iron, 1);
});
test("adult maintenance equation and off states", () => {
  assert.equal(profileTargets(profile).calories, 1815);
  for (const changes of [
    { age: 12 },
    { special: true },
    { weight: "no" },
    { height: 0 },
    { sex: "" },
    { age: 100 },
    { activity: "invalid" },
  ])
    assert.equal(profileTargets({ ...profile, ...changes }), null);
});
test("recipe plan honors vegan, exclusions, cooking time, workout days", () => {
  const pool = eligibleRecipes(RECIPES, profile);
  assert(pool.length > 0);
  assert(
    pool.every(
      (r) =>
        r.diet === "vegan" && !r.tags.includes("peanuts") && r.minutes <= 30,
    ),
  );
  const plan = buildPlan(RECIPES, profile);
  assert.equal(plan.days.length, 7);
  assert.equal(plan.workouts.filter((w) => w.active).length, 3);
  for (const day of plan.days)
    for (const m of day.meals)
      assert(m.recipe === null || pool.some((r) => r.id === m.recipe.id));
});
test("unmatched meals stay empty instead of violating restrictions", () => {
  const plan = buildPlan(RECIPES, { ...profile, avoid: "", cookTime: 1 });
  assert(plan.days.every((d) => d.meals.every((m) => m.recipe === null)));
});
test("local diary dates have stable ISO format", () =>
  assert.match(localDay(new Date("2026-10-15T12:00:00Z")), /^2026-10-15$/));
