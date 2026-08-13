// Manual food logging screen.
import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Search, Plus, Check } from "lucide-react";
import { storage, FoodItem, Meal } from "../utils/storage";
import { foodDatabase } from "../utils/foodDatabase";
import { updateBadgeMetrics } from "../utils/badges";
import { toast } from "sonner";

export function AddFood() {
    const navigate = useNavigate();
    const [query, setQuery] = useState("");
    const [mealType, setMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('lunch');

    const [selectedFoods, setSelectedFoods] = useState<FoodItem[]>([]);

    const [customFood, setCustomFood] = useState({
        name: '',
        calories: '',
        protein: '',
        carbs:'',
        fat:'',
        portionSize:'',
    });


    const searchResults = useMemo(() => {
        if (!query.trim()) return [];
        const q = query.trim().toLowerCase();
        return Object.values(foodDatabase)
            .filter((food) => food.name.toLowerCase().includes(q))
            .slice(0, 8);
    }, [query]);

    const addFoodToSelection = (food: FoodItem) => {
        setSelectedFoods((prev) => [...prev, food]);
        toast.success(`Added ${food.name}`);
        setQuery("");
    };

    const addCustomFood = () => {
        if (!customFood.name.trim() || !customFood.calories) {
            toast.error("give the food a name and calorie amount")
            return;
        }

        const food: FoodItem = {
            name: customFood.name.trim(),
            calories: Number(customFood.calories) || 0,
            protein: Number(customFood.protein) || 0,
            carbs: Number(customFood.carbs) || 0,
            fat: Number(customFood.fat) || 0,
            portionSize: customFood.portionSize.trim() || '1 serving',
        };

        setSelectedFoods((prev) => [...prev, food]);
        setCustomFood({ name: '', calories: '', protein: '', carbs: '', fat: '', portionSize: '' });
        toast.success(`Added ${food.name}`);
        
    };

    const removeSelected = (index: number) => {
        setSelectedFoods((prev) => prev.filter((_, i) => i !== index)); 
    };

    const saveMeal = () => {
        if (selectedFoods.length === 0) {
            toast.error("Add at least one food item before saving");
            return;
        }

    const meal: Meal = {
        id: "",
        timestamp: new Date().toISOString(),
        foods: selectedFoods,
        totalCalories: selectedFoods.reduce((sum, f) => sum + f.calories, 0),
        totalProtein: selectedFoods.reduce((sum, f) => sum + f.protein, 0),
        totalCarbs: selectedFoods.reduce((sum, f) => sum + f.carbs, 0),
        totalFat: selectedFoods.reduce((sum, f) => sum + f.fat, 0),
        mealType,
    };

    storage.addMeal(meal);
    updateBadgeMetrics();
    toast.success("Food logged");
    navigate('/dashboard');
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-semibold mb-2">Add Food</h2>
                <p className="text-gray-600">Log Something you ate</p>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Meal Type</CardTitle>
                </CardHeader>
                <CardContent>
                    <Select value={mealType} onValueChange={(v) => setMealType(v as typeof mealType)}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="breakfast">Breakfast</SelectItem>
                            <SelectItem value="lunch">Lunch</SelectItem>
                            <SelectItem value="dinner">Dinner</SelectItem>
                            <SelectItem value="snack">Snack</SelectItem>
                        </SelectContent>
                    </Select>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Search className="w-4 h-4" />
                        Search Foods
                    </CardTitle>
                    <CardDescription>Search the pre defined food list</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    <Input 
                        placeholder="e.g. chicken breast, rice"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)} 
                        />
                    {searchResults.length > 0 && (
                        <div className="space-y-2">
                            {searchResults.map((food) => (
                                <button
                                    key={food.name}
                                    type="button" 
                                    onClick={() => addFoodToSelection(food)}
                                    className="w-full flex items-center justify-between p-3 border rounded-lg hover:bg-green-50 text-left" 
                                >
                                    <div>
                                        <p className="font-medium">{food.name}</p>
                                        <p className="text-sm text-gray-500">{food.portionSize} - {food.calories} cal</p>
                                    </div>
                                    <Plus className="w-4 h-4 text-green-600" />
                                </button>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card> 
                <CardHeader>
                    <CardTitle className='text-lg'>Enter a custom food.</CardTitle>
                    <CardDescription>Add your own item.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="space-y-2"> 
                        <Label htmlFor="customName">Food Name</Label>
                        <Input 
                            id="customName"
                            placeholder="e.g. fried chicken"
                            value={customFood.name}
                            onChange={(e) => setCustomFood({ ...customFood, name: e.target.value})}
                        /> 
                    </div>

                    <div className="space-y-3">
                        <div className="space-y-2"> 
                            <Label htmlFor="customCalories">Calories</Label>
                            <Input
                                id="customCalories"
                                type="number"
                                placeholder="0"
                                value={customFood.calories}
                                onChange={(e) => setCustomFood({ ...customFood, calories: e.target.value})}
                            /> 
                            </div> 
                        </div>
                        
                    <div className="space-y-2">
                        <Label htmlFor="customPortion">Portion Amount</Label>
                        <Input 
                            id="customPortion"
                            placeholder="1 serving"
                            value={customFood.portionSize}
                            onChange={(e) => setCustomFood({ ...customFood, portionSize: e.target.value })} 
                        />
                    </div>

                    <div className="space-y-2"> 
                        <Label htmlFor="customProtein">Protein (g)</Label>
                        <Input
                        id="customProtein" 
                        type="number"
                        placeholder="0"
                        value={customFood.protein}
                        onChange={(e) => setCustomFood({ ...customFood, protein: e.target.value})}
                        /> 
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="customCarbs">Carbs (g)</Label>
                        <Input
                            id="customCarbs"
                            type="number"
                            placeholder="0"
                            value={customFood.carbs}
                            onChange={(e) => setCustomFood({ ...customFood, carbs: e.target.value})}
                        /> 
                    </div>

                    <div> 
                        <Label htmlFor="customFat">Fat (g)</Label>
                        <Input
                            id="customFat"
                            type="number"
                            placeholder="0"
                            value={customFood.fat}
                            onChange={(e) => setCustomFood({ ...customFood, fat: e.target.value})}
                        />
                    </div>


                    <Button type="button" variant="outline" className="w-full" onClick={addCustomFood}>
                            <Plus className="w-4 h-4 mr-2" />
                            Add Custom Food
                   </Button>
                </CardContent>
            </Card>

            {selectedFoods.length > 0 && ( 
                <Card> 
                    <CardHeader> 
                        <CardTitle className="text-lg flex items-center gap-2"> 
                            <Check className="w-4 h-4 text-green-600" />
                            Ready to log ({selectedFoods.length}) 
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2"> 
                        {selectedFoods.map((food, index) => (
                            <div key={`${food.name}-${index}`} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                                <div>
                                    <p className="font-medium">{food.name}</p>
                                    <p className="text-sm text-gray-500"> 
                                        {food.calories} cal - {food.protein}g protein - {food.carbs}g - {food.fat}g fat 
                                    </p> 
                                    </div> 
                                    <button 
                                        type="button"
                                        onClick={() => removeSelected(index)}
                                        className="text-sm text-red-600 hover:text-red-700" 
                                    >
                                        Remove
                                    </button>
                                </div>
                            ))} 
                            <Button className="w-full bg-green-600 hover:bg-green-700 mt-2" onClick={saveMeal}>
                                Save to today's meals 
                            </Button>
                        </CardContent>
                    </Card> 
                )}
            </div>
    );
}