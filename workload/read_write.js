import http from "k6/http";
import { check, sleep } from "k6";

const BASE_URL = __ENV.BASE_URL || "http://localhost:8080";

const SCHEMA_PATH = "/recipes/by-time";
const INGREDIENT_PATH = "/recipes/by-ingredient";

export const options = {
  vus: Number(__ENV.VUS || 10),
  iterations: Number(__ENV.ITERATIONS || 1000),

  // Optional: include percentiles you want in the summary
  summaryTrendStats: ["min", "med", "avg", "max", "p(90)", "p(95)"],
};

function normalGet() {
  const url = `${BASE_URL}/recipes`;
  const res = http.get(url, {
    tags: { name: "GET /recipes", endpoint: "/recipes", method: "GET" },
  });
  check(res, { "GET /recipes status 200": (r) => r.status === 200 });
}

function postRecipe() {
  const payload = JSON.stringify({
    recipe_title: "k6 test",
    ingredients: ["salt", "pepper"],
    directions: ["mix", "cook"],
    cook_speed: "fast",
  });

  const res = http.post(`${BASE_URL}/recipes`, payload, {
    headers: { "Content-Type": "application/json" },
    tags: { name: "POST /recipes", endpoint: "/recipes", method: "POST" },
  });

  check(res, { "POST /recipes status 2xx": (r) => r.status >= 200 && r.status < 300 });
}

function schemaSensitiveGet() {
  const maxPrep = 60;
  const url = `${BASE_URL}${SCHEMA_PATH}?maxPrep=${maxPrep}&limit=10`;
  const res = http.get(url, {
    tags: { name: "GET /recipes/by-time", endpoint: SCHEMA_PATH, method: "GET" },
  });
  check(res, { "GET /recipes/by-time status 200": (r) => r.status === 200 });
}

function ingredientGet() {
  const ingredients = [
    "salt and freshly ground black pepper",
    "1 teaspoon paprika",
    "1 tablespoon finely chopped fresh rosemary",
    "2 tablespoons butter",
  ];

  const ing = ingredients[__ITER % ingredients.length]; // deterministic, repeatable
  const url = `${BASE_URL}${INGREDIENT_PATH}?ingredient=${encodeURIComponent(ing)}&limit=10`;

  const res = http.get(url, {
    tags: { name: "GET /recipes/by-ingredient", endpoint: INGREDIENT_PATH, method: "GET" },
  });
  check(res, { "GET /recipes/by-ingredient status 200": (r) => r.status === 200 });
}

export default function () {
  // Exact 25% split across 4 actions
  switch (__ITER % 4) {
    case 0:
      normalGet();
      break;
    case 1:
      postRecipe();
      break;
    case 2:
      schemaSensitiveGet();
      break;
    case 3:
      ingredientGet();
      break;
  }

  sleep(1);
}
