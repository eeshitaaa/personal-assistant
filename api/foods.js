const nutrients = {
  calories: 1008,
  protein: 1003,
  carbs: 1005,
  fat: 1004,
  fiber: 1079,
  sugar: 2000,
  sodium: 1093,
  calcium: 1087,
  iron: 1089,
  potassium: 1092,
  vitaminC: 1162,
};
export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed." });
  }
  if (!req.query.q)
    return res
      .status(200)
      .json({ configured: Boolean(process.env.USDA_API_KEY) });
  if (!process.env.USDA_API_KEY)
    return res.status(503).json({
      error:
        "USDA search is not connected. Starter foods and your recipes are available.",
    });
  const query = String(req.query.q || "").trim();
  if (query.length < 2 || query.length > 100)
    return res.status(400).json({ error: "Search with 2–100 characters." });
  try {
    const url = new URL("https://api.nal.usda.gov/fdc/v1/foods/search");
    url.searchParams.set("api_key", process.env.USDA_API_KEY);
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query,
        pageSize: 20,
        dataType: ["Foundation", "SR Legacy", "Survey (FNDDS)"],
      }),
      signal: AbortSignal.timeout(12000),
    });
    if (!response.ok)
      return res.status(response.status === 429 ? 429 : 502).json({
        error:
          response.status === 429
            ? "Food search is busy. Try again shortly."
            : "USDA search is unavailable. Try starter foods.",
      });
    const data = await response.json();
    const foods = (data.foods || []).map((food) => ({
      id: `usda-${food.fdcId}`,
      name: food.description,
      source: `USDA FoodData Central · ${food.dataType} · per 100 g`,
      url: `https://fdc.nal.usda.gov/food-details/${food.fdcId}/nutrients`,
      nutrients: Object.fromEntries(
        Object.entries(nutrients).map(([key, id]) => {
          const n = (food.foodNutrients || []).find((n) => n.nutrientId === id);
          return [key, typeof n?.value === "number" ? n.value : null];
        }),
      ),
    }));
    res.setHeader(
      "Cache-Control",
      "public, s-maxage=3600, stale-while-revalidate=86400",
    );
    return res.status(200).json({ foods });
  } catch {
    return res.status(502).json({
      error: "Food search timed out. Try again or use starter foods.",
    });
  }
}
