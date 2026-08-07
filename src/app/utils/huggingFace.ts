import { FoodItem } from './storage';
import { foodDatabase } from './foodDatabase';

const FORCE_LOCAL_FALLBACK = false;

export interface HuggingFacePrediction {
  label: string;
  score: number;
}

export interface HuggingFaceRecognitionResult {
  foods: FoodItem[];
  labels: string[];
  source: 'huggingface' | 'fallback';
  errorMessage?: string;
}

// Keys are Food-101 category names returned by nateraw/food (underscores normalised to spaces).
const labelMap: Record<string, string> = {
  // Beef
  steak: 'steak',
  'filet mignon': 'steak',
  'prime rib': 'steak',
  'beef tartare': 'steak',
  'beef carpaccio': 'steak',
  'pork chop': 'steak',
  'baby back ribs': 'steak',
  'peking duck': 'steak',
  // Chicken
  'chicken wings': 'chicken breast',
  'chicken curry': 'chicken breast',
  'chicken quesadilla': 'chicken breast',
  chicken: 'chicken breast',
  // Fish
  'grilled salmon': 'salmon',
  salmon: 'salmon',
  sashimi: 'salmon',
  sushi: 'salmon',
  'lobster bisque': 'salmon',
  'lobster roll sandwich': 'salmon',
  'shrimp and grits': 'salmon',
  scallops: 'salmon',
  ceviche: 'salmon',
  'fish and chips': 'salmon',
  'fried calamari': 'salmon',
  mussels: 'salmon',
  oysters: 'salmon',
  // Eggs
  'eggs benedict': 'eggs',
  'deviled eggs': 'eggs',
  'huevos rancheros': 'eggs',
  omelette: 'eggs',
  egg: 'eggs',
  eggs: 'eggs',
  // Rice
  'fried rice': 'rice',
  bibimbap: 'rice',
  paella: 'rice',
  risotto: 'rice',
  rice: 'rice',
  // Pasta
  'spaghetti bolognese': 'pasta',
  'spaghetti carbonara': 'pasta',
  lasagna: 'pasta',
  'macaroni and cheese': 'pasta',
  'pad thai': 'pasta',
  ravioli: 'pasta',
  ramen: 'pasta',
  pho: 'pasta',
  gnocchi: 'pasta',
  pasta: 'pasta',
  spaghetti: 'pasta',
  // Bread
  'garlic bread': 'bread',
  'french toast': 'bread',
  bruschetta: 'bread',
  bread: 'bread',
  waffles: 'bread',
  pancakes: 'bread',
  // Sandwiches / burgers
  'club sandwich': 'sandwich',
  'grilled cheese sandwich': 'sandwich',
  'pulled pork sandwich': 'sandwich',
  sandwich: 'sandwich',
  hamburger: 'burger',
  'hot dog': 'burger',
  // Pizza
  pizza: 'pizza',
  // Salads
  'caesar salad': 'salad bowl',
  'greek salad': 'salad bowl',
  'caprese salad': 'salad bowl',
  'beet salad': 'salad bowl',
  'seaweed salad': 'salad bowl',
  salad: 'salad bowl',
  // Avocado
  guacamole: 'avocado',
  // Potato
  'french fries': 'potato',
  poutine: 'potato',
  potato: 'potato',
  // Tofu / plant
  edamame: 'tofu',
  'spring rolls': 'tofu',
  samosa: 'tofu',
  dumplings: 'tofu',
  falafel: 'tofu',
  gyoza: 'tofu',
  // Dessert / dairy
  'frozen yogurt': 'yogurt',
  'ice cream': 'yogurt',
  yogurt: 'yogurt',
  cheesecake: 'cheese',
  cheese: 'cheese',
  // Soups
  'clam chowder': 'salmon',
  'french onion soup': 'bread',
  'hot and sour soup': 'tofu',
  'miso soup': 'tofu',
  'breakfast burrito': 'eggs',
  nachos: 'potato',
  tacos: 'steak',
  'panna cotta': 'yogurt',
  tiramisu: 'yogurt',
  hummus: 'tofu',
};

function normalizeLabel(label: string): string {
  return label.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function findDbKey(normalized: string): string | null {
  // Exact match first
  if (labelMap[normalized]) return labelMap[normalized];

  // Model label contains a known map key (e.g. "swiss steak" contains "steak")
  for (const key of Object.keys(labelMap)) {
    if (normalized.includes(key)) {
      return labelMap[key];
    }
  }

  return null;
}

export function mapHuggingFaceLabelsToFoodItems(labels: HuggingFacePrediction[]): FoodItem[] {
  const matchedFoods: FoodItem[] = [];

  labels.forEach((prediction) => {
    const normalized = normalizeLabel(prediction.label);
    const dbKey = findDbKey(normalized);
    if (!dbKey) return;

    const food: FoodItem | undefined = foodDatabase[dbKey];
    if (food && !matchedFoods.some((entry: FoodItem) => entry.name === food.name)) {
      matchedFoods.push({ ...food });
    }
  });

  return matchedFoods;
}

function toImageBlob(imageData: string): Blob {
  const base64Payload = imageData.includes('base64,') ? imageData.split('base64,')[1] : imageData;
  const binary = atob(base64Payload);
  const array = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i += 1) {
    array[i] = binary.charCodeAt(i);
  }

  return new Blob([array], { type: 'image/jpeg' });
}

function normalizeInferenceEndpoint(endpoint: string): string {
  const trimmed = endpoint.trim();

  const modelName = trimmed.includes('/models/')
    ? trimmed.split('/models/')[1].replace(/\/$/, '')
    : trimmed.replace(/^https?:\/\/[^/]+\//, '').replace(/^models\//, '').replace(/^hf-inference\//, '').replace(/\/$/, '');

  return `https://router.huggingface.co/hf-inference/models/${modelName}`;
}

function getInferenceRequestUrl(endpoint: string): string {
  const trimmed = endpoint.trim();

  if (import.meta.env.DEV) {
    const modelName = trimmed.includes('/models/')
      ? trimmed.split('/models/')[1].replace(/\/$/, '')
      : trimmed.replace(/^https?:\/\/[^/]+\//, '').replace(/^models\//, '').replace(/^hf-inference\//, '').replace(/\/$/, '');

    return `/api/huggingface/models/${modelName}`;
  }

  return normalizeInferenceEndpoint(trimmed);
}

function getFallbackFoods(): FoodItem[] {
  return [
    foodDatabase['rice'],
    foodDatabase['chicken breast'],
    foodDatabase['broccoli'],
  ].filter((food): food is FoodItem => Boolean(food));
}

function extractPredictions(payload: unknown): HuggingFacePrediction[] {
  if (Array.isArray(payload)) {
    return payload.map((item) => ({
      label: typeof item === 'object' && item && 'label' in item ? String((item as { label?: unknown }).label ?? '') : '',
      score: typeof item === 'object' && item && 'score' in item ? Number((item as { score?: unknown }).score ?? 0) : 0,
    }));
  }

  if (payload && typeof payload === 'object') {
    const record = payload as Record<string, unknown>;

    const candidates = [record?.[0], record?.['0'], record?.['data'], record?.['predictions'], record?.['result']].filter(Boolean);
    for (const candidate of candidates) {
      const extracted = extractPredictions(candidate);
      if (extracted.length > 0) {
        return extracted;
      }
    }

    if (Array.isArray(record?.labels) && Array.isArray(record?.scores)) {
      return (record.labels as unknown[]).map((label, index) => ({
        label: String(label ?? ''),
        score: Number((record.scores as unknown[])[index] ?? 0),
      }));
    }

    if (typeof record?.label === 'string') {
      return [{ label: record.label, score: Number(record.score ?? 0) }];
    }
  }

  return [];
}

export async function recognizeFoodWithHuggingFace(imageData: string): Promise<HuggingFaceRecognitionResult> {
  const endpoint = import.meta.env.VITE_HUGGINGFACE_ENDPOINT?.trim();
  const token = import.meta.env.VITE_HUGGINGFACE_TOKEN?.trim();

  if (FORCE_LOCAL_FALLBACK || !endpoint || !token) {
    const fallbackFoods = getFallbackFoods();
    return {
      foods: fallbackFoods,
      labels: fallbackFoods.map((food) => food.name),
      source: 'fallback',
      errorMessage: 'Hugging Face is unavailable in this environment. Using local fallback suggestions.',
    };
  }

  try {
    const response = await fetch(getInferenceRequestUrl(endpoint), {
      method: 'POST',
      headers: {
        ...(import.meta.env.DEV ? {} : { Authorization: `Bearer ${token}` }),
        'Content-Type': 'image/jpeg',
      },
      body: toImageBlob(imageData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Hugging Face request failed with status ${response.status}: ${errorText}`);
    }

    const payload = await response.json();
    const predictions = extractPredictions(payload);
    // Log raw model output so label gaps can be diagnosed
    console.log('[HuggingFace] raw predictions:', predictions.map((p) => `${p.label} (${(p.score * 100).toFixed(1)}%)`));
    const mappedFoods = mapHuggingFaceLabelsToFoodItems(predictions);

    return {
      foods: mappedFoods,
      labels: mappedFoods.map((food) => food.name),
      source: 'huggingface',
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown Hugging Face error.';
    console.error('Hugging Face scan failed:', error);
    return {
      foods: getFallbackFoods(),
      labels: getFallbackFoods().map((food) => food.name),
      source: 'fallback',
      errorMessage: `Unable to reach Hugging Face right now. Using local fallback suggestions. ${message}`,
    };
  }
}
