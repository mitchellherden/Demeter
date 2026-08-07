declare module "../utils/googleVision" {
  export interface VisionLabel {
    description: string;
    score: number;
  }

  export interface VisionRecognitionResult {
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
    source: "google-vision" | "fallback";
    errorMessage?: string;
  }

  export function recognizeFoodWithGoogleVision(imageData: string): Promise<VisionRecognitionResult>;
  export function mapVisionLabelsToFoodItems(labels: VisionLabel[]): Array<{
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
