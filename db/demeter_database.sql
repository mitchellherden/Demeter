CREATE DATABASE demeter;
USE demeter;

-- ===========================
-- USERS
-- ===========================
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login DATETIME
);

-- ===========================
-- USER PROFILES
-- ===========================
CREATE TABLE user_profiles (
    profile_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    age INT,
    sex ENUM('Male','Female','Other'),
    height_cm DECIMAL(5,2),
    weight_kg DECIMAL(5,2),
    activity_level VARCHAR(50),
    goal_type VARCHAR(50),
    target_calories INT,
    protein_target DECIMAL(6,2),
    carb_target DECIMAL(6,2),
    fat_target DECIMAL(6,2),

    CONSTRAINT fk_profile_user
        FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE
);

-- ===========================
-- FOODS
-- ===========================
CREATE TABLE foods (
    food_id INT AUTO_INCREMENT PRIMARY KEY,
    food_name VARCHAR(255) NOT NULL,
    calories_per_100g DECIMAL(8,2),
    protein_g DECIMAL(8,2),
    carbs_g DECIMAL(8,2),
    fat_g DECIMAL(8,2),
    fibre_g DECIMAL(8,2),
    sugar_g DECIMAL(8,2),
    sodium_mg DECIMAL(8,2)
);

-- ===========================
-- MEALS
-- ===========================
CREATE TABLE meals (
    meal_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    meal_time DATETIME NOT NULL,
    image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_meal_user
        FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE
);

-- ===========================
-- MEAL NUTRITION
-- ===========================
CREATE TABLE meal_nutrition (
    meal_id INT PRIMARY KEY,
    total_calories DECIMAL(8,2),
    protein_g DECIMAL(8,2),
    carbs_g DECIMAL(8,2),
    fat_g DECIMAL(8,2),
    fibre_g DECIMAL(8,2),
    sodium_mg DECIMAL(8,2),

    CONSTRAINT fk_nutrition_meal
        FOREIGN KEY (meal_id)
        REFERENCES meals(meal_id)
        ON DELETE CASCADE
);

-- ===========================
-- MEAL FOOD ITEMS
-- ===========================
CREATE TABLE meal_food_items (
    meal_food_id INT AUTO_INCREMENT PRIMARY KEY,
    meal_id INT NOT NULL,
    food_id INT NOT NULL,
    estimated_portion_g DECIMAL(8,2),
    confidence_score DECIMAL(4,3),

    CONSTRAINT fk_mealfood_meal
        FOREIGN KEY (meal_id)
        REFERENCES meals(meal_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_mealfood_food
        FOREIGN KEY (food_id)
        REFERENCES foods(food_id)
);

-- ===========================
-- RECIPES
-- ===========================
CREATE TABLE recipes (
    recipe_id INT AUTO_INCREMENT PRIMARY KEY,
    recipe_name VARCHAR(255) NOT NULL,
    calories DECIMAL(8,2),
    protein DECIMAL(8,2),
    carbs DECIMAL(8,2),
    fat DECIMAL(8,2),
    instructions TEXT
);

-- ===========================
-- RECIPE INGREDIENTS
-- ===========================
CREATE TABLE recipe_ingredients (
    recipe_ingredient_id INT AUTO_INCREMENT PRIMARY KEY,
    recipe_id INT NOT NULL,
    food_id INT NOT NULL,
    quantity_g DECIMAL(8,2),

    CONSTRAINT fk_recipeingredient_recipe
        FOREIGN KEY (recipe_id)
        REFERENCES recipes(recipe_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_recipeingredient_food
        FOREIGN KEY (food_id)
        REFERENCES foods(food_id)
);

-- ===========================
-- RECOMMENDATIONS
-- ===========================
CREATE TABLE recommendations (
    recommendation_id INT AUTO_INCREMENT PRIMARY KEY,
    recipe_id INT NOT NULL,
    user_id INT NOT NULL,
    date_generated DATETIME DEFAULT CURRENT_TIMESTAMP,
    reason TEXT,

    CONSTRAINT fk_recommendation_recipe
        FOREIGN KEY (recipe_id)
        REFERENCES recipes(recipe_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_recommendation_user
        FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE
);

-- ===========================
-- RECIPE FEEDBACK
-- ===========================
CREATE TABLE recipe_feedback (
    recommendation_id INT PRIMARY KEY,
    recipe_id INT NOT NULL,
    user_id INT NOT NULL,
    rating INT CHECK (rating BETWEEN 1 AND 5),
    liked BOOLEAN,
    comment TEXT,

    CONSTRAINT fk_feedback_recommendation
        FOREIGN KEY (recommendation_id)
        REFERENCES recommendations(recommendation_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_feedback_recipe
        FOREIGN KEY (recipe_id)
        REFERENCES recipes(recipe_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_feedback_user
        FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE
);

-- ===========================
-- DAILY NUTRITION
-- ===========================
CREATE TABLE daily_nutrition (
    daily_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    date DATE NOT NULL,
    total_calories DECIMAL(8,2),
    protein_g DECIMAL(8,2),
    carbs_g DECIMAL(8,2),
    fat_g DECIMAL(8,2),

    CONSTRAINT fk_dailynutrition_user
        FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE,

    CONSTRAINT unique_user_date
        UNIQUE(user_id, date)
);