declare module "./huggingFace" {
  export interface HuggingFacePrediction {
    label: string;
    score: number;
  }

  export interface HuggingFaceRecognitionResult {
    foods: Array<{
      name: string;
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
      fiber?: number;
      sugar?: number;
      portionSize: string;
    }>;
    labels: string[];
    source: "huggingface" | "fallback";
    errorMessage?: string;
  }

  export function recognizeFoodWithHuggingFace(imageData: string): Promise<HuggingFaceRecognitionResult>;
  export function mapHuggingFaceLabelsToFoodItems(labels: HuggingFacePrediction[]): Array<{
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber?: number;
    sugar?: number;
    portionSize: string;
  }>;
}

declare module "../utils/huggingFace" {
  export interface HuggingFacePrediction {
    label: string;
    score: number;
  }

  export interface HuggingFaceRecognitionResult {
    foods: Array<{
      name: string;
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
      fiber?: number;
      sugar?: number;
      portionSize: string;
    }>;
    labels: string[];
    source: "huggingface" | "fallback";
    errorMessage?: string;
  }

  export function recognizeFoodWithHuggingFace(imageData: string): Promise<HuggingFaceRecognitionResult>;
  export function mapHuggingFaceLabelsToFoodItems(labels: HuggingFacePrediction[]): Array<{
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber?: number;
    sugar?: number;
    portionSize: string;
  }>;
}
