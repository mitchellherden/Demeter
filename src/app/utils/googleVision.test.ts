import { describe, expect, it } from "vitest";
import { mapVisionLabelsToFoodItems } from "./googleVision";

describe("mapVisionLabelsToFoodItems", () => {
  it("maps known food labels to nutrition entries", () => {
    const foods = mapVisionLabelsToFoodItems([
      { description: "Chicken", score: 0.93 },
      { description: "Rice", score: 0.88 },
      { description: "Salad", score: 0.77 },
    ]);

    expect(foods.map((food) => food.name)).toEqual(
      expect.arrayContaining(["Chicken Breast", "White Rice", "Mixed Salad Bowl"])
    );
  });

  it("returns no matches for unrelated labels", () => {
    const foods = mapVisionLabelsToFoodItems([{ description: "Furniture", score: 0.8 }]);

    expect(foods).toEqual([]);
  });
});
