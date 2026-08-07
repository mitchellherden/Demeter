import { FoodItem } from './storage';
import { foodDatabase } from './foodDatabase';

export interface VisionLabel {
  description: string;
  score: number;
}

export interface VisionRecognitionResult {
  foods: FoodItem[];
  labels: string[];
  source: 'google-vision' | 'fallback';
  errorMessage?: string;
}

const labelMap: Record<string, string> = {
  chicken: 'chicken breast',
  chickenbreast: 'chicken breast',
  salad: 'salad bowl',
  mixedsalad: 'salad bowl',
  rice: 'rice',
  'white rice': 'rice',
  sushi: 'rice',
  pasta: 'pasta',
  bread: 'bread',
  toast: 'bread',
  banana: 'banana',
  apple: 'apple',
  avocado: 'avocado',
  broccoli: 'broccoli',
  spinach: 'spinach',
  carrot: 'carrots',
  carrots: 'carrots',
  tomato: 'tomato',
  yogurt: 'yogurt',
  cheese: 'cheese',
  milk: 'milk',
  pizza: 'pizza',
  burger: 'burger',
  sandwich: 'sandwich',
  oatmeal: 'oatmeal',
  granola: 'granola',
  salmon: 'salmon',
  egg: 'eggs',
  eggs: 'eggs',
  tofu: 'tofu',
  steak: 'steak',
  potatoes: 'potato',
  potato: 'potato',
  sweetpotato: 'sweet potato',
  sweetpotatoes: 'sweet potato',
  quinoa: 'quinoa',
};

function normalizeLabel(label: string): string {
  return label.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

export function mapVisionLabelsToFoodItems(labels: VisionLabel[]): FoodItem[] {
  const matchedFoods: FoodItem[] = [];

  labels.forEach((label) => {
    const normalized = normalizeLabel(label.description);
    const matchedKey = labelMap[normalized] ?? labelMap[normalized.replace(/\s+/g, '')] ?? null;

    if (!matchedKey) {
      return;
    }

    const food: FoodItem | undefined = foodDatabase[matchedKey];
    if (food && !matchedFoods.some((entry: FoodItem) => entry.name === food.name)) {
      matchedFoods.push({ ...food });
    }
  });

  return matchedFoods;
}

function toBase64Payload(imageData: string): string {
  return imageData.includes('base64,') ? imageData.split('base64,')[1] : imageData;
}

export async function recognizeFoodWithGoogleVision(imageData: string): Promise<VisionRecognitionResult> {
  const apiKey = import.meta.env.VITE_GOOGLE_CLOUD_VISION_API_KEY?.trim();

  if (!apiKey) {
    return {
      foods: [],
      labels: [],
      source: 'fallback',
      errorMessage: 'No Google Vision API key is configured.',
    };
  }

  const endpoint = import.meta.env.VITE_GOOGLE_CLOUD_VISION_ENDPOINT?.trim() || `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requests: [
          {
            image: {
              content: toBase64Payload(imageData),
            },
            features: [
              { type: 'LABEL_DETECTION', maxResults: 10 },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorPayload = await response.text();
      let errorMessage = `Vision API request failed with status ${response.status}`;

      try {
        const parsed = JSON.parse(errorPayload);
        errorMessage = parsed?.error?.message ?? errorMessage;
      } catch {
        errorMessage = errorPayload || errorMessage;
      }

      throw new Error(errorMessage);
    }

    const payload = await response.json();
    const labels = payload?.responses?.[0]?.labelAnnotations ?? [];
    const mappedFoods = mapVisionLabelsToFoodItems(
      labels.map((label: { description?: string; score?: number }) => ({
        description: label.description ?? '',
        score: label.score ?? 0,
      }))
    );

    return {
      foods: mappedFoods,
      labels: labels.map((label: { description?: string }) => label.description ?? ''),
      source: 'google-vision',
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown Google Vision error.';
    console.error('Google Vision scan failed:', error);
    return {
      foods: [],
      labels: [],
      source: 'fallback',
      errorMessage: message,
    };
  }
}
