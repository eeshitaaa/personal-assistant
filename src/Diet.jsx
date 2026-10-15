import { useEffect, useRef, useState } from "react";
import {
  FOODS,
  RECIPES,
  MEALS,
  NUTRIENTS,
  nutritionTotal,
  scaledIngredients,
  profileTargets,
  buildPlan,
  localDay,
} from "./nutrition";
import "./Diet.css";
const KEY = "assistant-nutrition-v1";
const blankProfile = {
  age: "",
  height: "",
  weight: "",
  sex: "",
  activity: "light",
  diet: "vegetarian",
  avoid: "",
  cookTime: 30,
  workoutDays: 3,
  workoutMinutes: 20,
  equipment: "none",
  experience: "beginner",
  workoutStyle: "mixed",
  cardio: "walking",
  special: false,
  limitations: "",
};
const emptyData = { logs: [], recipes: [], profile: blankProfile, plan: null };
function load() {
  try {
    const d = JSON.parse(localStorage.getItem(KEY));
    return d && Array.isArray(d.logs) && Array.isArray(d.recipes)
      ? { ...emptyData, ...d, profile: { ...blankProfile, ...d.profile } }
      : emptyData;
  } catch {
    return emptyData;
  }
}
const fmt = (n) =>
  Number(n || 0).toLocaleString(undefined, { maximumFractionDigits: 1 });
function Field({ label, children }) {
  return (
    <label className="diet-field">
      <span>{label}</span>
      {children}
    </label>
  );
}
function MacroStats({ items }) {
  const { total, missing } = nutritionTotal(items);
  return (
    <div className="diet-nutrient-grid">
      {NUTRIENTS.map(([key, label, unit]) => (
        <div key={key}>
          <span>{label}</span>
          <strong>
            {missing[key] ? "≥ " : ""}
            {fmt(total[key])}
            <small> {unit}</small>
          </strong>
          {missing[key] > 0 && <small>Partial data</small>}
        </div>
      ))}
    </div>
  );
}
function FoodPicker({ onAdd, extraFoods = [] }) {
  const [query, setQuery] = useState(""),
    [results, setResults] = useState([]),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const request = useRef(0);
  const [online, setOnline] = useState(false);
  useEffect(() => {
    let active = true;
    fetch("/api/foods")
      .then((r) => r.json())
      .then((d) => {
        if (active) setOnline(Boolean(d.configured));
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);
  const catalog = [
    ...new Map([...FOODS, ...extraFoods].map((f) => [f.id, f])).values(),
  ];
  const local = catalog.filter((f) =>
    f.name.toLowerCase().includes(query.trim().toLowerCase()),
  );
  async function search(e) {
    e.preventDefault();
    if (!online || query.trim().length < 2) return;
    const id = ++request.current;
    setBusy(true);
    setError("");
    setResults([]);
    try {
      const r = await fetch(`/api/foods?q=${encodeURIComponent(query.trim())}`);
      if (!r.headers.get("content-type")?.includes("application/json"))
        throw new SyntaxError("JSON unavailable");
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Food search is unavailable.");
      if (id === request.current) setResults(d.foods || []);
    } catch (err) {
      if (id === request.current)
        setError(
          err.message.includes("JSON") || err instanceof SyntaxError
            ? "Online food search needs the deployed server. Starter foods are available below."
            : err.message,
        );
    } finally {
      if (id === request.current) setBusy(false);
    }
  }
  return (
    <div className="food-picker">
      <form onSubmit={search} className="diet-search">
        <input
          aria-label="Search foods"
          placeholder="Try rice, dal, oats…"
          value={query}
          maxLength={100}
          onChange={(e) => {
            setQuery(e.target.value);
            request.current++;
            setBusy(false);
            setResults([]);
            setError("");
          }}
        />
        {online && (
          <button
            className="button secondary"
            disabled={busy || query.trim().length < 2}
          >
            {busy ? "Searching…" : "Search USDA"}
          </button>
        )}
      </form>
      <p className="diet-caption">
        Search built-in foods and your saved ingredients. Choose the preparation
        that matches your meal.
      </p>
      {error && (
        <p role="status" className="diet-notice">
          {error}
        </p>
      )}
      <div className="food-results">
        {[...results, ...local].slice(0, 30).map((food) => (
          <button key={food.id} onClick={() => onAdd({ food, grams: 100 })}>
            <span>
              {food.name}
              <small>{food.source}</small>
            </span>
            <b>+</b>
          </button>
        ))}
        {!local.length && !results.length && (
          <p>
            No matches. Try a simpler food name, or add a food from its label.
          </p>
        )}
      </div>
    </div>
  );
}
function Ingredients({ items, setItems }) {
  return (
    <div className="diet-ingredients">
      {items.map((item, i) => (
        <div key={`${item.food.id}-${i}`}>
          <span>{item.food.name}</span>
          <label>
            <input
              aria-label={`Grams of ${item.food.name}`}
              type="number"
              min="1"
              max="5000"
              step="1"
              required
              value={item.grams}
              onChange={(e) =>
                setItems(
                  items.map((v, j) =>
                    j === i ? { ...v, grams: e.target.value } : v,
                  ),
                )
              }
            />{" "}
            g
          </label>
          <button
            type="button"
            className="icon-button"
            aria-label={`Remove ${item.food.name}`}
            onClick={() => setItems(items.filter((_, j) => j !== i))}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
function CustomFood({ onAdd }) {
  const [open, setOpen] = useState(false);
  return (
    <details
      open={open}
      onToggle={(e) => setOpen(e.currentTarget.open)}
      className="custom-food"
    >
      <summary>Add a food from its nutrition label</summary>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const f = new FormData(e.currentTarget),
            nutrients = Object.fromEntries(
              NUTRIENTS.map(([k]) => [
                k,
                f.get(k) === "" ? null : Number(f.get(k)),
              ]),
            );
          onAdd({
            food: {
              id: crypto.randomUUID(),
              name: f.get("name").trim(),
              source: "Your nutrition label · per 100 g",
              nutrients,
            },
            grams: 100,
          });
          e.currentTarget.reset();
          setOpen(false);
        }}
      >
        <Field label="Food name">
          <input name="name" maxLength={120} required />
        </Field>
        <p className="diet-caption">
          Enter values per 100 g. Leave unknown nutrients blank; they will be
          marked as missing.
        </p>
        <div className="diet-form-grid">
          {NUTRIENTS.map(([k, label, unit]) => (
            <Field key={k} label={`${label} (${unit})`}>
              <input
                name={k}
                type="number"
                min="0"
                max={k === "calories" ? 1000 : 100000}
                step="any"
                required={k === "calories"}
              />
            </Field>
          ))}
        </div>
        <button className="button secondary">Add food</button>
      </form>
    </details>
  );
}
function Editor({ editor, onClose, onSave, foods }) {
  const [name, setName] = useState(editor.name || ""),
    [meal, setMeal] = useState(editor.meal || "Lunch"),
    [date, setDate] = useState(editor.date || localDay()),
    [items, setItems] = useState(editor.ingredients || []),
    [servings, setServings] = useState(editor.servings || 1),
    [minutes, setMinutes] = useState(editor.minutes || 20),
    [steps, setSteps] = useState(editor.steps?.join("\n") || ""),
    [diet, setDiet] = useState(editor.diet || "vegetarian"),
    [tags, setTags] = useState(editor.tags?.join(", ") || ""),
    [error, setError] = useState("");
  const recipe = editor.kind === "recipe";
  const ref = useRef(null);
  useEffect(() => {
    const previous = document.activeElement;
    ref.current?.querySelector("input")?.focus();
    function key(e) {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab") {
        const els = [
          ...ref.current.querySelectorAll(
            "button:not(:disabled), input, select, textarea, summary",
          ),
        ].filter((e) => e.getClientRects().length);
        if (e.shiftKey && document.activeElement === els[0]) {
          e.preventDefault();
          els.at(-1)?.focus();
        } else if (!e.shiftKey && document.activeElement === els.at(-1)) {
          e.preventDefault();
          els[0]?.focus();
        }
      }
    }
    document.addEventListener("keydown", key);
    return () => {
      document.removeEventListener("keydown", key);
      previous?.focus();
    };
  }, [onClose]);
  function save(e) {
    e.preventDefault();
    if (
      !items.length ||
      items.some(
        (i) =>
          !Number.isFinite(Number(i.grams)) ||
          Number(i.grams) <= 0 ||
          Number(i.grams) > 5000,
      )
    ) {
      setError("Add at least one food and valid weights (1–5,000 g).");
      return;
    }
    if (!name.trim()) {
      setError("Give this a name.");
      return;
    }
    onSave({
      ...editor,
      id: editor.id || crypto.randomUUID(),
      name: name.trim(),
      meal,
      date,
      ingredients: items.map((i) => ({ ...i, grams: Number(i.grams) })),
      servings: recipe ? Number(servings) : 1,
      minutes: Number(minutes),
      steps: steps
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
      diet,
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    });
  }
  return (
    <div className="diet-overlay">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="diet-editor-title"
        className="diet-editor"
        ref={ref}
      >
        <div className="diet-section-heading">
          <div>
            <p className="eyebrow">
              {recipe ? "MY RECIPE BOOK" : "MY FOOD DIARY"}
            </p>
            <h2 id="diet-editor-title">
              {editor.id
                ? "Edit"
                : recipe
                  ? "A recipe of my own"
                  : "What’s on my plate?"}
            </h2>
          </div>
          <button
            className="icon-button"
            aria-label="Close meal editor"
            onClick={onClose}
          >
            ×
          </button>
        </div>
        <form id="meal-form" onSubmit={save}>
          <div className="diet-form-grid">
            <Field label={recipe ? "Recipe name" : "Meal name"}>
              <input
                value={name}
                required
                maxLength={120}
                placeholder={recipe ? "My favourite dal" : "Lunch at home"}
                onChange={(e) => setName(e.target.value)}
              />
            </Field>
            <Field label="Meal">
              <select value={meal} onChange={(e) => setMeal(e.target.value)}>
                {MEALS.map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </select>
            </Field>
            {!recipe && (
              <Field label="Date">
                <input
                  type="date"
                  value={date}
                  required
                  onChange={(e) => setDate(e.target.value)}
                />
              </Field>
            )}
            {recipe && (
              <>
                <Field label="Recipe makes (servings)">
                  <input
                    type="number"
                    min="0.25"
                    max="100"
                    step="0.25"
                    value={servings}
                    required
                    onChange={(e) => setServings(e.target.value)}
                  />
                </Field>
                <Field label="Minutes">
                  <input
                    type="number"
                    min="1"
                    max="1440"
                    required
                    value={minutes}
                    onChange={(e) => setMinutes(e.target.value)}
                  />
                </Field>
                <Field label="Diet">
                  <select
                    value={diet}
                    onChange={(e) => setDiet(e.target.value)}
                  >
                    <option value="vegan">Vegan</option>
                    <option value="vegetarian">Vegetarian</option>
                    <option value="omnivore">
                      Includes eggs / meat / fish
                    </option>
                  </select>
                </Field>
                <Field label="Allergens / tags (comma-separated)">
                  <input
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="milk, wheat, nuts"
                  />
                </Field>
              </>
            )}
          </div>
          <Ingredients items={items} setItems={setItems} />
          {recipe && (
            <Field label="Method (one step per line)">
              <textarea
                rows="4"
                required
                value={steps}
                maxLength={8000}
                onChange={(e) => setSteps(e.target.value)}
              />
            </Field>
          )}
        </form>
        <FoodPicker
          extraFoods={foods}
          onAdd={(item) => setItems((v) => [...v, item])}
        />
        <CustomFood onAdd={(item) => setItems((v) => [...v, item])} />
        {items.length > 0 && (
          <>
            <h3>
              {recipe ? "Whole recipe" : "This meal"} · estimated nutrition
            </h3>
            <MacroStats items={items} />
          </>
        )}
        {error && (
          <p role="alert" className="diet-notice">
            {error}
          </p>
        )}
        <div className="diet-actions">
          <button className="button secondary" onClick={onClose}>
            Cancel
          </button>
          <button form="meal-form" className="button primary">
            {recipe ? "Save recipe" : "Save meal"}
          </button>
        </div>
      </section>
    </div>
  );
}
function RecipeCard({ recipe, onLog, onEdit, onDelete }) {
  const [portions, setPortions] = useState(1),
    [open, setOpen] = useState(false);
  const items = scaledIngredients(recipe, Number(portions) || 1),
    { total } = nutritionTotal(items);
  return (
    <article className="diet-recipe card">
      <div className="recipe-monogram" aria-hidden="true">
        {recipe.meal === "Breakfast"
          ? "☀"
          : recipe.meal === "Lunch"
            ? "◒"
            : recipe.meal === "Dinner"
              ? "☾"
              : "✧"}
        <span>{recipe.minutes} MIN</span>
      </div>
      <div className="recipe-body">
        <span className="eyebrow">
          {recipe.meal} · {recipe.diet}
          {recipe.custom ? " · MINE" : ""}
        </span>
        <h3>{recipe.name}</h3>
        <p className="diet-caption">
          {fmt(total.calories)} kcal · {fmt(total.protein)} g protein
        </p>
        <label className="portion-control">
          Servings{" "}
          <input
            aria-label={`Servings of ${recipe.name}`}
            type="number"
            min="0.25"
            max="20"
            step="0.25"
            value={portions}
            onChange={(e) => setPortions(e.target.value)}
          />
        </label>
        <div className="diet-actions">
          <button
            className="text-button"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? "Hide recipe" : "Ingredients & method"} <span>↗</span>
          </button>
          <button
            className="button secondary"
            disabled={
              !Number(portions) ||
              Number(portions) < 0.25 ||
              Number(portions) > 20
            }
            onClick={() => onLog(recipe, Number(portions))}
          >
            Log meal +
          </button>
        </div>
        {open && (
          <div className="recipe-details">
            <ul>
              {items.map((item, i) => (
                <li key={i}>
                  {fmt(item.grams)} g {item.food.name}
                </li>
              ))}
            </ul>
            <ol>
              {recipe.steps.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>
            <p className="diet-caption">
              Weights are for the preparation shown. Spices and lemon are not
              included in totals. Add oils, sauces and salt separately.
            </p>
            <MacroStats items={items} />
            {recipe.custom && (
              <div className="diet-actions">
                <button className="text-button" onClick={() => onEdit(recipe)}>
                  Edit my recipe
                </button>
                <button
                  className="text-button"
                  onClick={() => onDelete(recipe)}
                >
                  Delete recipe
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
export default function Diet({ onToast }) {
  const [data, setData] = useState(load),
    [tab, setTab] = useState("diary"),
    [date, setDate] = useState(localDay()),
    [editor, setEditor] = useState(null),
    [search, setSearch] = useState(""),
    [mealFilter, setMealFilter] = useState("All meals"),
    [profile, setProfile] = useState(() => load().profile),
    [error, setError] = useState(""),
    [planDay, setPlanDay] = useState(0);
  const allRecipes = [...RECIPES, ...data.recipes],
    targets = profileTargets(data.profile);
  const dayLogs = data.logs.filter((l) => l.date === date),
    items = dayLogs.flatMap((l) => l.ingredients),
    { total, missing } = nutritionTotal(items);
  function persist(next, message) {
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
      setData(next);
      setError("");
      if (message) onToast(message);
      return true;
    } catch {
      setError(
        "Could not save. Browser storage may be full or unavailable. Export your data before clearing storage.",
      );
      return false;
    }
  }
  function saveEntry(entry) {
    const { kind, ...value } = entry;
    const key = kind === "recipe" ? "recipes" : "logs";
    value.custom = key === "recipes";
    const next = {
      ...data,
      [key]: data[key].some((v) => v.id === entry.id)
        ? data[key].map((v) => (v.id === entry.id ? value : v))
        : [...data[key], value],
    };
    if (persist(next, kind === "recipe" ? "Recipe saved." : "Meal saved."))
      setEditor(null);
  }
  function logRecipe(recipe, portions) {
    setEditor({
      kind: "meal",
      name: recipe.name,
      meal: recipe.meal,
      date,
      ingredients: scaledIngredients(recipe, portions),
    });
  }
  function remove(key, id) {
    const removed = data[key].find((v) => v.id === id);
    if (
      persist(
        { ...data, [key]: data[key].filter((v) => v.id !== id) },
        "Removed.",
      )
    )
      setUndo({ key, item: removed });
  }
  const [undo, setUndo] = useState(null);
  function exportData() {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      }),
      url = URL.createObjectURL(blob),
      a = document.createElement("a");
    a.href = url;
    a.download = `my-food-${localDay()}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  function saveProfile(e) {
    e.preventDefault();
    persist(
      { ...data, profile, plan: null },
      "Profile saved. Generate a fresh plan when you’re ready.",
    );
  }
  const dailyEnergy = data.logs.reduce((days, log) => {
    days[log.date] =
      (days[log.date] || 0) + nutritionTotal(log.ingredients).total.calories;
    return days;
  }, {});
  const historyMax = Object.values(dailyEnergy).reduce(
    (max, value) => Math.max(max, value),
    targets?.calories || 2000,
  );
  const recipeMatches = allRecipes.filter(
    (r) =>
      (mealFilter === "All meals" || r.meal === mealFilter) &&
      [r.name, ...r.ingredients.map((i) => i.food.name)]
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  const chartItems = [
      ["protein", 4, "#d68793"],
      ["carbs", 4, "#e6c5a1"],
      ["fat", 9, "#9da88a"],
    ],
    macroEnergy = chartItems.reduce((s, [k, m]) => s + total[k] * m, 0);
  let cursor = 0;
  const gradient = chartItems
    .map(([k, m, color]) => {
      const start = cursor;
      cursor += macroEnergy ? ((total[k] * m) / macroEnergy) * 100 : 0;
      return `${color} ${start}% ${cursor}%`;
    })
    .join(",");
  return (
    <div className="diet-space">
      <div className="diet-tabs" role="tablist" aria-label="Diet sections">
        {[
          ["diary", "Food diary"],
          ["recipes", "Recipe book"],
          ["profile", "My profile"],
          ["plan", "My plan"],
        ].map(([id, label]) => (
          <button
            role="tab"
            id={`diet-tab-${id}`}
            aria-selected={tab === id}
            aria-controls="diet-panel"
            key={id}
            onClick={() => setTab(id)}
          >
            {label}
          </button>
        ))}
      </div>
      {error && (
        <p className="diet-notice" role="alert">
          {error}
        </p>
      )}
      {undo && (
        <div className="diet-notice" role="status">
          Item removed.{" "}
          <button
            className="text-button"
            onClick={() => {
              if (
                persist(
                  { ...data, [undo.key]: [...data[undo.key], undo.item] },
                  "Restored.",
                )
              )
                setUndo(null);
            }}
          >
            Undo
          </button>
        </div>
      )}
      <div id="diet-panel" role="tabpanel" aria-labelledby={`diet-tab-${tab}`}>
        {tab === "diary" && (
          <>
            <div className="diet-hero card">
              <div>
                <p className="eyebrow">A LITTLE CARE, EVERY DAY</p>
                <h2>Eat well. Feel like me.</h2>
                <p>My meals, my portions, my pace.</p>
                <button
                  className="button primary"
                  onClick={() => setEditor({ kind: "meal", date })}
                >
                  Log a meal +
                </button>
              </div>
              <div className="plate-art" aria-hidden="true">
                <span className="plate-leaf">✦</span>
                <i />
                <b>
                  good food.
                  <br />
                  good mood.
                </b>
              </div>
            </div>
            <div className="diet-daybar">
              <Field label="Food diary date">
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value || localDay())}
                />
              </Field>
              <button className="text-button" onClick={() => setTab("profile")}>
                {targets ? "Edit my targets ↗" : "Set my nutrition targets ↗"}
              </button>
            </div>
            <div className="diet-dashboard">
              <section className="card diet-summary">
                <div className="diet-section-heading">
                  <h2>On my plate</h2>
                  <span className="small-pill">{dayLogs.length} MEALS</span>
                </div>
                <div className="diet-energy">
                  <strong>
                    {missing.calories > 0 ? "≥ " : ""}
                    {fmt(total.calories)}
                  </strong>
                  <span>
                    kcal logged
                    {targets && <> / ~{targets.calories} estimated</>}
                  </span>
                </div>
                {["protein", "carbs", "fat", "fiber"].map((k) => (
                  <div className="diet-meter" key={k}>
                    <div>
                      <span>{NUTRIENTS.find((n) => n[0] === k)[1]}</span>
                      <span>
                        {missing[k] > 0 ? "≥ " : ""}
                        {fmt(total[k])} g{targets && ` / ~${targets[k]} g`}
                      </span>
                    </div>
                    <progress
                      aria-label={`${k} logged`}
                      value={total[k]}
                      max={targets?.[k] || Math.max(1, total[k])}
                    />
                  </div>
                ))}
                <p className="diet-caption">
                  {targets
                    ? "Targets are flexible estimates, not a score."
                    : "Save your profile for estimated daily targets."}
                </p>
              </section>
              <section className="card diet-chart">
                <h2>My macro mix</h2>
                {["protein", "carbs", "fat"].some((k) => missing[k] > 0) && (
                  <p className="diet-caption">
                    Some macro values are missing. This chart uses known values
                    only.
                  </p>
                )}
                <div
                  role="img"
                  aria-label={
                    macroEnergy
                      ? `Macro energy split: ${chartItems.map(([k, m]) => `${k} ${Math.round(((total[k] * m) / macroEnergy) * 100)}%`).join(", ")}`
                      : "No meals logged yet"
                  }
                  className="macro-donut"
                  style={{
                    background: macroEnergy
                      ? `conic-gradient(${gradient})`
                      : "var(--line)",
                  }}
                >
                  <div>
                    <strong>{macroEnergy ? "Today" : "Your plate"}</strong>
                    <span>{macroEnergy ? "energy split" : "starts here"}</span>
                  </div>
                </div>
                <div className="macro-legend">
                  {chartItems.map(([k, m, color]) => (
                    <span key={k}>
                      <i style={{ background: color }} />
                      {k}{" "}
                      <b>
                        {macroEnergy
                          ? Math.round(((total[k] * m) / macroEnergy) * 100)
                          : 0}
                        %
                      </b>
                    </span>
                  ))}
                </div>
                <p className="diet-caption">
                  Based on 4 kcal/g protein and carbs, 9 kcal/g fat. Rounded
                  food energy can differ.
                </p>
              </section>
            </div>
            <div className="diet-section-heading">
              <h2>Meals & little bites</h2>
              <button className="text-button" onClick={() => setTab("recipes")}>
                Find something to make ↗
              </button>
            </div>
            <div className="diet-meal-grid">
              {MEALS.map((meal) => (
                <section className="card diet-meal" key={meal}>
                  <div className="diet-section-heading">
                    <h3>{meal}</h3>
                    <button
                      className="icon-button"
                      aria-label={`Add ${meal.toLowerCase()}`}
                      onClick={() => setEditor({ kind: "meal", meal, date })}
                    >
                      +
                    </button>
                  </div>
                  {dayLogs
                    .filter((l) => l.meal === meal)
                    .map((log) => (
                      <article className="logged-meal" key={log.id}>
                        <button
                          className="logged-meal-name"
                          onClick={() => setEditor({ ...log, kind: "meal" })}
                        >
                          <strong>{log.name}</strong>
                          <span>
                            {fmt(
                              nutritionTotal(log.ingredients).total.calories,
                            )}{" "}
                            kcal · {log.ingredients.length} foods{" "}
                            <small>Edit ↗</small>
                          </span>
                        </button>
                        <button
                          className="icon-button"
                          aria-label={`Delete meal ${log.name}`}
                          onClick={() => remove("logs", log.id)}
                        >
                          ×
                        </button>
                      </article>
                    ))}
                  {!dayLogs.some((l) => l.meal === meal) && (
                    <p className="diet-caption">
                      Nothing logged yet. Add what you had.
                    </p>
                  )}
                </section>
              ))}
            </div>
            <details className="card diet-more">
              <summary>All tracked nutrients</summary>
              <MacroStats items={items} />
              {Object.values(missing).some((v) => v > 0) && (
                <p className="diet-caption">
                  Some foods have missing nutrient values. Totals marked “≥”
                  only include known values.
                </p>
              )}
              <p className="diet-caption">
                These are estimates. The app tracks the nutrients shown here,
                not every vitamin and mineral.
              </p>
            </details>
            <section className="card diet-history">
              <h2>The last 7 days</h2>
              <div
                className="diet-bars"
                role="group"
                aria-label="Daily logged calories for the last seven days"
              >
                {Array.from({ length: 7 }, (_, i) => {
                  const d = new Date();
                  d.setDate(d.getDate() - 6 + i);
                  const key = localDay(d),
                    energy = dailyEnergy[key] || 0,
                    max = historyMax;
                  return (
                    <button
                      key={key}
                      title={`${key}: ${fmt(energy)} kcal logged`}
                      aria-label={`${key}, ${fmt(energy)} kcal logged, open diary`}
                      onClick={() => setDate(key)}
                    >
                      <span>{fmt(energy)}</span>
                      <i
                        style={{
                          height: `${Math.max(2, (energy / max) * 110)}px`,
                        }}
                      />
                      <small>
                        {d.toLocaleDateString(undefined, { weekday: "short" })}
                      </small>
                    </button>
                  );
                })}
              </div>
              <p className="diet-caption">
                Logged energy only. Empty days mean no meals recorded.
              </p>
            </section>
          </>
        )}
        {tab === "recipes" && (
          <>
            <div className="diet-section-heading">
              <div>
                <p className="eyebrow">THE RECIPE BOOK</p>
                <h2>Something I’d actually eat.</h2>
                <p className="diet-caption">
                  Breakfast to dinner, and everything in between. Make the
                  portions yours.
                </p>
              </div>
              <button
                className="button primary"
                onClick={() => setEditor({ kind: "recipe" })}
              >
                My own recipe +
              </button>
            </div>
            <div className="diet-search">
              <input
                aria-label="Search recipes"
                placeholder="Search recipes or ingredients"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <select
                aria-label="Filter recipes by meal"
                value={mealFilter}
                onChange={(e) => setMealFilter(e.target.value)}
              >
                {["All meals", ...MEALS].map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </select>
            </div>
            <div className="diet-recipe-grid">
              {recipeMatches.map((r) => (
                <RecipeCard
                  key={r.id}
                  recipe={r}
                  onLog={logRecipe}
                  onEdit={(r) => setEditor({ ...r, kind: "recipe" })}
                  onDelete={(r) => remove("recipes", r.id)}
                />
              ))}
            </div>
            {!recipeMatches.length && (
              <p>No recipes match yet. Try another search or add your own.</p>
            )}
          </>
        )}
        {tab === "profile" && (
          <section className="card diet-profile">
            <div className="diet-section-heading">
              <div>
                <p className="eyebrow">A BIT ABOUT ME</p>
                <h2>What works for my body.</h2>
              </div>
              <span className="small-pill">SAVED ON THIS DEVICE</span>
            </div>
            <form onSubmit={saveProfile}>
              <div className="diet-form-grid">
                <Field label="Age (years)">
                  <input
                    type="number"
                    min="1"
                    max="120"
                    required
                    value={profile.age}
                    onChange={(e) =>
                      setProfile({ ...profile, age: e.target.value })
                    }
                  />
                </Field>
                <Field label="Height (cm)">
                  <input
                    type="number"
                    min="50"
                    max="250"
                    step="0.1"
                    required
                    value={profile.height}
                    onChange={(e) =>
                      setProfile({ ...profile, height: e.target.value })
                    }
                  />
                </Field>
                <Field label="Weight (kg)">
                  <input
                    type="number"
                    min="10"
                    max="400"
                    step="0.1"
                    required
                    value={profile.weight}
                    onChange={(e) =>
                      setProfile({ ...profile, weight: e.target.value })
                    }
                  />
                </Field>
                <Field label="Sex used for energy equation">
                  <select
                    value={profile.sex}
                    onChange={(e) =>
                      setProfile({ ...profile, sex: e.target.value })
                    }
                  >
                    <option value="">Choose / leave estimates off</option>
                    <option value="female">Female equation</option>
                    <option value="male">Male equation</option>
                  </select>
                </Field>
                <Field label="Usual activity">
                  <select
                    value={profile.activity}
                    onChange={(e) =>
                      setProfile({ ...profile, activity: e.target.value })
                    }
                  >
                    <option value="low">Mostly sitting</option>
                    <option value="light">Light activity</option>
                    <option value="moderate">Moderate activity</option>
                    <option value="high">Very active</option>
                  </select>
                </Field>
                <Field label="Food preference">
                  <select
                    value={profile.diet}
                    onChange={(e) =>
                      setProfile({ ...profile, diet: e.target.value })
                    }
                  >
                    <option value="vegan">Vegan</option>
                    <option value="vegetarian">Vegetarian</option>
                    <option value="omnivore">
                      Includes eggs / meat / fish
                    </option>
                  </select>
                </Field>
                <Field label="Avoid ingredients / allergens (comma-separated)">
                  <input
                    placeholder="milk, peanuts, wheat"
                    maxLength={500}
                    value={profile.avoid}
                    onChange={(e) =>
                      setProfile({ ...profile, avoid: e.target.value })
                    }
                  />
                </Field>
                <Field label="Cooking time per meal">
                  <select
                    value={profile.cookTime}
                    onChange={(e) =>
                      setProfile({ ...profile, cookTime: e.target.value })
                    }
                  >
                    {[10, 20, 30, 60].map((n) => (
                      <option value={n} key={n}>
                        {n} minutes or less
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
              <label className="diet-check">
                <input
                  type="checkbox"
                  checked={profile.special}
                  onChange={(e) =>
                    setProfile({ ...profile, special: e.target.checked })
                  }
                />
                Pregnant / breastfeeding, medical nutrition needs, or a history
                of disordered eating — keep automatic targets off
              </label>
              <h3>How I like to move</h3>
              <div className="diet-form-grid">
                {[
                  [
                    "workoutDays",
                    "Days per week",
                    [
                      [2, "2 days"],
                      [3, "3 days"],
                      [4, "4 days"],
                      [5, "5 days"],
                    ],
                  ],
                  [
                    "workoutMinutes",
                    "Session length",
                    [
                      [15, "15 minutes"],
                      [20, "20 minutes"],
                      [30, "30 minutes"],
                      [45, "45 minutes"],
                    ],
                  ],
                  [
                    "equipment",
                    "Equipment",
                    [
                      ["none", "No equipment"],
                      ["dumbbells", "Dumbbells"],
                      ["gym", "Gym"],
                    ],
                  ],
                  [
                    "experience",
                    "Experience",
                    [
                      ["beginner", "Starting out"],
                      ["regular", "Regularly active"],
                    ],
                  ],
                  [
                    "workoutStyle",
                    "Workout preference",
                    [
                      ["mixed", "Strength + cardio"],
                      ["strength", "Strength"],
                      ["cardio", "Cardio"],
                    ],
                  ],
                  [
                    "cardio",
                    "Cardio I enjoy",
                    [
                      ["walking", "Walking"],
                      ["cycling", "Cycling"],
                      ["dancing", "Dancing"],
                    ],
                  ],
                ].map(([key, label, options]) => (
                  <Field key={key} label={label}>
                    <select
                      value={profile[key]}
                      onChange={(e) =>
                        setProfile({ ...profile, [key]: e.target.value })
                      }
                    >
                      {options.map(([v, label]) => (
                        <option key={v} value={v}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </Field>
                ))}
              </div>
              <Field label="Injuries, pain or movement restrictions">
                <input
                  value={profile.limitations}
                  maxLength={500}
                  placeholder="Leave blank if none"
                  onChange={(e) =>
                    setProfile({ ...profile, limitations: e.target.value })
                  }
                />
              </Field>
              <p className="diet-caption">
                If you have restrictions, the app pauses automatic workout
                suggestions so you can plan with a qualified professional.
              </p>
              <button className="button primary">Save my profile</button>
            </form>
            <div className="diet-target-note">
              <h3>
                {targets
                  ? "My daily starting point"
                  : "Daily estimates are off"}
              </h3>
              {targets ? (
                <>
                  <p>
                    ~{targets.calories} kcal · {targets.protein} g protein ·{" "}
                    {targets.carbs} g carbs · {targets.fat} g fat ·{" "}
                    {targets.fiber} g fibre
                  </p>
                  <p className="diet-caption">
                    Maintenance energy: Mifflin–St Jeor resting estimate × an
                    activity factor. Macro starting split: 20% protein, 50%
                    carbs, 30% fat. Fibre: 14 g / 1,000 kcal. No weight-loss
                    deficit is applied. Individual needs vary.
                  </p>
                </>
              ) : (
                <p className="diet-caption">
                  Save a complete profile to estimate needs for generally
                  healthy adults aged 19–78. Estimates stay off for special
                  circumstances and measurements outside the supported range.
                  You can still log food.
                </p>
              )}
              <p className="diet-caption">
                <a
                  href="https://pubmed.ncbi.nlm.nih.gov/2305711/"
                  target="_blank"
                  rel="noreferrer"
                >
                  Energy equation
                </a>{" "}
                ·{" "}
                <a
                  href="https://www.nal.usda.gov/human-nutrition-and-food-safety/dri-calculator"
                  target="_blank"
                  rel="noreferrer"
                >
                  USDA nutrient recommendations
                </a>
                . This is a planning aid, not medical advice.
              </p>
            </div>
          </section>
        )}
        {tab === "plan" && (
          <>
            <section className="card diet-plan-intro">
              <p className="eyebrow">FOOD & MOVEMENT</p>
              <h2>A week that fits me.</h2>
              <p>
                Build a seven-day starting plan from my saved food preferences,
                cooking time, portions and workout choices.
              </p>
              <div className="diet-actions">
                <button
                  className="button primary"
                  disabled={!targets}
                  onClick={() => {
                    const plan = buildPlan(allRecipes, data.profile);
                    persist({ ...data, plan }, "Your week is ready.");
                    setPlanDay(0);
                  }}
                >
                  Make my weekly plan
                </button>
                <button
                  className="text-button"
                  onClick={() => setTab("profile")}
                >
                  Edit my preferences ↗
                </button>
              </div>
              {!targets && (
                <p className="diet-notice">
                  Save a supported adult profile before generating a plan. Food
                  logging and recipes work without one.
                </p>
              )}
              <p className="diet-caption">
                Recipe-based suggestions, not live AI. Ingredient exclusions use
                text matching; check labels and cross-contact yourself for
                allergies. Meals may repeat, and portions are approximate.
              </p>
            </section>
            {data.plan && (
              <>
                <p className="diet-caption">
                  Based on preferences saved{" "}
                  {new Date(data.plan.createdAt).toLocaleDateString()}. Generate
                  again after changing your profile or recipes.
                </p>
                <div className="diet-week-tabs">
                  {data.plan.days.map((d, i) => (
                    <button
                      className={planDay === i ? "selected" : ""}
                      key={d.day}
                      aria-pressed={planDay === i}
                      onClick={() => setPlanDay(i)}
                    >
                      Day {d.day}
                    </button>
                  ))}
                </div>
                <section className="card diet-more">
                  <h3>Day {planDay + 1} · estimated nutrition</h3>
                  <MacroStats
                    items={data.plan.days[planDay].meals.flatMap((m) =>
                      m.recipe ? scaledIngredients(m.recipe, m.portions) : [],
                    )}
                  />
                  <p className="diet-caption">
                    Portions are rounded starting points. Review and adjust them
                    before logging; daily totals may differ from your estimated
                    needs.
                  </p>
                </section>
                <div className="diet-plan-meals">
                  {data.plan.days[planDay].meals.map((m) => (
                    <section className="card" key={m.meal}>
                      <span className="eyebrow">{m.meal}</span>
                      <h3>{m.recipe?.name || "Choose a meal"}</h3>
                      {m.recipe ? (
                        <>
                          <p>
                            {m.portions} servings · ~
                            {fmt(
                              nutritionTotal(
                                scaledIngredients(m.recipe, m.portions),
                              ).total.calories,
                            )}{" "}
                            kcal
                          </p>
                          <button
                            className="text-button"
                            onClick={() => logRecipe(m.recipe, m.portions)}
                          >
                            Review portions & log ↗
                          </button>
                          <details>
                            <summary>Ingredients & method</summary>
                            <ul>
                              {scaledIngredients(m.recipe, m.portions).map(
                                (i, n) => (
                                  <li key={n}>
                                    {fmt(i.grams)} g {i.food.name}
                                  </li>
                                ),
                              )}
                            </ul>
                            <ol>
                              {m.recipe.steps.map((step, n) => (
                                <li key={n}>{step}</li>
                              ))}
                            </ol>
                          </details>
                        </>
                      ) : (
                        <p className="diet-caption">
                          No recipe matches your preferences for this meal. Add
                          a suitable recipe or adjust your filters, then
                          regenerate.
                        </p>
                      )}
                    </section>
                  ))}
                </div>
                <section className="card diet-workout">
                  <span className="eyebrow">MOVEMENT · DAY {planDay + 1}</span>
                  {data.plan.profile.limitations ||
                  data.plan.profile.special ? (
                    <>
                      <h2>Let’s keep this personal.</h2>
                      <p>
                        Automatic workouts are paused for your saved health
                        circumstances or movement restrictions. Ask a qualified
                        professional for an adapted plan.
                      </p>
                    </>
                  ) : (
                    <>
                      <h2>{data.plan.workouts[planDay].title}</h2>
                      <p>{data.plan.workouts[planDay].detail}</p>
                      <p className="diet-caption">
                        Build up gradually. A short starter week may be below
                        the general adult guideline of 150 minutes of moderate
                        activity and two strength days. Stop if you feel pain or
                        unwell.{" "}
                        <a
                          href="https://www.cdc.gov/physical-activity-basics/adding-adults/"
                          target="_blank"
                          rel="noreferrer"
                        >
                          Activity guidance
                        </a>
                      </p>
                    </>
                  )}
                </section>
              </>
            )}
          </>
        )}
      </div>
      <footer className="diet-footer">
        <span>
          My food data stays in this browser. Built-in food search works without
          an account.
        </span>
        <button className="text-button" onClick={exportData}>
          Export my food data ↓
        </button>
      </footer>
      {editor && (
        <Editor
          key={editor.id || "new"}
          editor={editor}
          foods={[...data.logs, ...data.recipes].flatMap((r) =>
            r.ingredients.map((i) => i.food),
          )}
          onClose={() => setEditor(null)}
          onSave={saveEntry}
        />
      )}
    </div>
  );
}
