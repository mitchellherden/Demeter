// Meal scanning workflow.
// Users can open the camera, upload an image, review AI guesses, and save the meal entry.
import { useRef, useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Camera as CameraIcon, X, Check, Loader2 } from "lucide-react";
import { recognizeFood } from "../utils/foodDatabase";
import { storage, FoodItem, Meal } from "../utils/storage";
import { toast } from "sonner";
import { Badge } from "./ui/badge";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { updateBadgeMetrics } from "../utils/badges";

export function Camera() {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isStreaming, setIsStreaming] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [recognizedFoods, setRecognizedFoods] = useState<FoodItem[]>([]);
  const [mealType, setMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('lunch');

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsStreaming(true);
      }
    } catch (err) {
      toast.error("Unable to access camera. Please check permissions or use file upload.");
      console.error("Error accessing camera:", err);
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsStreaming(false);
    }
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const imageData = canvas.toDataURL('image/jpeg');
        setCapturedImage(imageData);
        stopCamera();
        analyzeImage(imageData);
      }
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageData = e.target?.result as string;
        setCapturedImage(imageData);
        analyzeImage(imageData);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeImage = async (imageData: string) => {
    setIsAnalyzing(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock AI recognition
    const foods = recognizeFood(imageData);
    setRecognizedFoods(foods);
    setIsAnalyzing(false);
    
    toast.success(`Recognized ${foods.length} food item${foods.length > 1 ? 's' : ''}!`);
  };

  const saveMeal = () => {
    const meal: Meal = {
      id: "",
      timestamp: new Date().toISOString(),
      imageData: capturedImage || undefined,
      foods: recognizedFoods,
      totalCalories: recognizedFoods.reduce((sum, f) => sum + f.calories, 0),
      totalProtein: recognizedFoods.reduce((sum, f) => sum + f.protein, 0),
      totalCarbs: recognizedFoods.reduce((sum, f) => sum + f.carbs, 0),
      totalFat: recognizedFoods.reduce((sum, f) => sum + f.fat, 0),
      mealType,
    };

    storage.addMeal(meal);
    updateBadgeMetrics(); // Update badge metrics after logging a meal
    toast.success("Meal saved successfully!");
    navigate('/dashboard');
  };

  const reset = () => {
    setCapturedImage(null);
    setRecognizedFoods([]);
    stopCamera();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2">Scan Your Meal</h2>
        <p className="text-gray-600">Take a photo or upload an image to track your nutrition</p>
      </div>

      <Card>
        <CardContent className="p-6">
          {!capturedImage && !isStreaming && (
            <div className="space-y-4">
              <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <CameraIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600 mb-4">Ready to capture your meal</p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={startCamera}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <CameraIcon className="w-4 h-4 mr-2" />
                  Open Camera
                </Button>
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  className="flex-1"
                >
                  Upload Photo
                </Button>
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileUpload}
              />
            </div>
          )}

          {isStreaming && (
            <div className="space-y-4">
              <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={captureImage}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <CameraIcon className="w-4 h-4 mr-2" />
                  Capture
                </Button>
                <Button
                  onClick={stopCamera}
                  variant="outline"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {capturedImage && (
            <div className="space-y-4">
              <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                <img
                  src={capturedImage}
                  alt="Captured meal"
                  className="w-full h-full object-cover"
                />
              </div>

              {isAnalyzing && (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-green-600 mx-auto mb-4" />
                    <p className="text-gray-600">Analyzing your meal...</p>
                    <p className="text-sm text-gray-500 mt-1">Using AI to identify foods and calculate nutrition</p>
                  </div>
                </div>
              )}

              {recognizedFoods.length > 0 && !isAnalyzing && (
                <div className="space-y-4">
                  <div className="border-t pt-4">
                    <h3 className="font-semibold mb-3">Recognized Foods</h3>
                    <div className="space-y-3">
                      {recognizedFoods.map((food, index) => (
                        <div key={index} className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className="font-medium">{food.name}</h4>
                              <p className="text-sm text-gray-600">{food.portionSize}</p>
                            </div>
                            <Badge variant="secondary">{food.calories} cal</Badge>
                          </div>
                          <div className="grid grid-cols-3 gap-2 text-sm">
                            <div>
                              <span className="text-gray-500">Protein:</span>
                              <span className="font-medium ml-1">{food.protein}g</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Carbs:</span>
                              <span className="font-medium ml-1">{food.carbs}g</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Fat:</span>
                              <span className="font-medium ml-1">{food.fat}g</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <Label htmlFor="meal-type">Meal Type</Label>
                    <Select value={mealType} onValueChange={(value: any) => setMealType(value)}>
                      <SelectTrigger id="meal-type" className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="breakfast">Breakfast</SelectItem>
                        <SelectItem value="lunch">Lunch</SelectItem>
                        <SelectItem value="dinner">Dinner</SelectItem>
                        <SelectItem value="snack">Snack</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-lg">
                          {recognizedFoods.reduce((sum, f) => sum + f.calories, 0)} calories
                        </p>
                        <p className="text-sm text-gray-600">Total for this meal</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={saveMeal}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Save Meal
                    </Button>
                    <Button
                      onClick={reset}
                      variant="outline"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Retake
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <canvas ref={canvasRef} className="hidden" />

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-gray-700">
          <strong>Note:</strong> This demo uses mock AI recognition. In production, this would connect to a computer vision API like Google Cloud Vision or AWS Rekognition with a trained model for food recognition.
        </p>
      </div>
    </div>
  );
}