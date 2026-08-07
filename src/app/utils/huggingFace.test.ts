import { afterEach, describe, expect, it, vi } from "vitest";
import { mapHuggingFaceLabelsToFoodItems, recognizeFoodWithHuggingFace } from "./huggingFace";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe("mapHuggingFaceLabelsToFoodItems", () => {
  it("maps common Hugging Face labels to food entries", () => {
    const foods = mapHuggingFaceLabelsToFoodItems([
      { label: "chicken breast", score: 0.95 },
      { label: "rice", score: 0.9 },
    ]);

    expect(foods.map((food: { name: string }) => food.name)).toEqual(
      expect.arrayContaining(["Chicken Breast", "White Rice"])
    );
  });

  it("ignores labels that do not map to known foods", () => {
    const foods = mapHuggingFaceLabelsToFoodItems([{ label: "car", score: 0.4 }]);

    expect(foods).toEqual([]);
  });

  it("returns fallback foods when the Hugging Face request fails", async () => {
    vi.stubEnv("VITE_HUGGINGFACE_ENDPOINT", "https://huggingface.co/your-model");
    vi.stubEnv("VITE_HUGGINGFACE_TOKEN", "test-token");
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network error")));

    const result = await recognizeFoodWithHuggingFace("fake-image-data");

    expect(result.source).toBe("fallback");
    expect(result.foods.length).toBeGreaterThan(0);
    expect(result.errorMessage).toContain("Using local fallback suggestions");
  });

  it("returns local fallback foods when no Hugging Face credentials are configured", async () => {
    vi.unstubAllEnvs();

    const result = await recognizeFoodWithHuggingFace("fake-image-data");

    expect(result.source).toBe("fallback");
    expect(result.foods.length).toBeGreaterThan(0);
    expect(result.labels.length).toBeGreaterThan(0);
  });

  it("builds a router-based Hugging Face request URL for the configured model", async () => {
    vi.stubEnv("VITE_HUGGINGFACE_ENDPOINT", "https://api-inference.huggingface.co/models/google/vit-base-patch16-224");
    vi.stubEnv("VITE_HUGGINGFACE_TOKEN", "test-token");

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [{ label: "chicken breast", score: 0.95 }],
    });

    vi.stubGlobal("fetch", fetchMock);

    await recognizeFoodWithHuggingFace("data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBxAQEBAQEBUQEBQVFQ0QEBQUFRQWFhUYFRUYHSggGBolGxUVITEhJSkrLi4uFx8zODMtNygtLisBCgoKDg0OGxAQGy0mHyUtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLQ==");

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/huggingface/models/google/vit-base-patch16-224",
      expect.objectContaining({ method: "POST" })
    );
  });
});
