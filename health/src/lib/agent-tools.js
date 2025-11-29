export const healthcareTools = [
  {
    name: "predict_disease",
    description: "Analyzes symptoms and predicts possible health conditions. Use this when user mentions any physical symptoms or health complaints.",
    parameters: {
      type: "object",
      properties: {
        symptoms: {
          type: "array",
          items: { type: "string" },
          description: "List of symptoms reported by user (e.g., 'fatigue', 'headache', 'fever')"
        },
        duration: {
          type: "string",
          description: "How long symptoms have been present"
        }
      },
      required: ["symptoms"]
    }
  },
  {
    name: "check_medicines",
    description: "Retrieves user's current medications and checks for side effects. Use when investigating potential medication-related issues.",
    parameters: {
      type: "object",
      properties: {
        user_id: {
          type: "string",
          description: "User's unique identifier"
        },
        check_interactions: {
          type: "boolean",
          description: "Whether to check for drug interactions"
        }
      },
      required: ["user_id"]
    }
  },
  {
    name: "analyze_nutrition",
    description: "Analyzes user's calorie intake and nutrition data over a time period. Use to investigate diet-related concerns.",
    parameters: {
      type: "object",
      properties: {
        user_id: {
          type: "string",
          description: "User's unique identifier"
        },
        days: {
          type: "number",
          description: "Number of days to analyze (default 7)"
        }
      },
      required: ["user_id"]
    }
  },
  {
    name: "get_fitness_activity",
    description: "Retrieves user's workout history and physical activity levels. Use to assess exercise patterns.",
    parameters: {
      type: "object",
      properties: {
        user_id: {
          type: "string",
          description: "User's unique identifier"
        },
        days: {
          type: "number",
          description: "Number of days to analyze"
        }
      },
      required: ["user_id"]
    }
  },
  {
    name: "find_clinics",
    description: "Finds nearby healthcare facilities based on location. Use when user needs medical consultation.",
    parameters: {
      type: "object",
      properties: {
        location: {
          type: "string",
          description: "User's location or address"
        },
        specialty: {
          type: "string",
          description: "Type of clinic needed (e.g., 'general', 'cardiology')"
        },
        radius: {
          type: "number",
          description: "Search radius in kilometers"
        }
      },
      required: ["location"]
    }
  },
  {
    name: "assess_mental_health",
    description: "Evaluates mental health status and mood patterns. Use when investigating stress, anxiety, or mood-related concerns.",
    parameters: {
      type: "object",
      properties: {
        user_id: {
          type: "string",
          description: "User's unique identifier"
        }
      },
      required: ["user_id"]
    }
  },


{
  name: "create_fitness_plan",
  description: "Creates a personalized fitness plan and saves it to the database. User will see it in their Fitness Studio.",
  parameters: {
    type: "object",
    properties: {
      user_id: {
        type: "string",
        description: "User's unique identifier"
      },
      plan_name: {
        type: "string",
        description: "Name of the fitness plan (e.g., 'Weekly Full Body Workout')"
      },
      duration_weeks: {
        type: "number",
        description: "How many weeks for this plan"
      },
      workouts: {
        type: "array",
        items: { type: "object" },
        description: "Array of workout objects with day, type, duration, exercises"
      },
      goal: {
        type: "string",
        description: "Fitness goal (e.g., 'Increase strength', 'Improve cardio', 'Lose weight')"
      },
      difficulty: {
        type: "string",
        enum: ["Beginner", "Intermediate", "Advanced"],
        description: "Difficulty level"
      }
    },
    required: ["user_id", "plan_name", "workouts"]
  }
},
{
  name: "create_meal_plan",
  description: "Creates a personalized meal plan with daily nutrition targets and saves it to the database.",
  parameters: {
    type: "object",
    properties: {
      user_id: {
        type: "string",
        description: "User's unique identifier"
      },
      plan_name: {
        type: "string",
        description: "Name of the meal plan (e.g., 'High Protein Diet')"
      },
      duration_days: {
        type: "number",
        description: "Duration of plan in days"
      },
      daily_meals: {
        type: "array",
        items: { type: "object" },
        description: "Array of meals with breakfast, lunch, dinner, snacks"
      },
      daily_calories: {
        type: "number",
        description: "Target daily calories"
      },
      macros: {
        type: "object",
        description: "Daily macro targets (protein, carbs, fats)"
      }
    },
    required: ["user_id", "plan_name", "daily_meals"]
  }
},
{
  name: "create_mental_health_routine",
  description: "Creates a personalized mental health routine with daily activities like meditation, yoga, breathing exercises. Saves to Mental Health logs.",
  parameters: {
    type: "object",
    properties: {
      user_id: {
        type: "string",
        description: "User's unique identifier"
      },
      routine_name: {
        type: "string",
        description: "Name of routine (e.g., 'Daily Stress Relief', 'Mindfulness Practice')"
      },
      activities: {
        type: "array",
        items: { type: "object" },
        description: "Array of activities with time, type, duration, instructions"
      },
      frequency: {
        type: "string",
        enum: ["Daily", "Weekly", "Bi-weekly"],
        description: "How often to do this routine"
      },
      goal: {
        type: "string",
        description: "Mental health goal (e.g., 'Reduce stress', 'Better sleep', 'Anxiety management')"
      }
    },
    required: ["user_id", "routine_name", "activities"]
  }
},
{
  name: "create_medicine_reminders",
  description: "Sets up medicine reminders with specific times and instructions. Saves to medicines table with reminder times.",
  parameters: {
    type: "object",
    properties: {
      user_id: {
        type: "string",
        description: "User's unique identifier"
      },
      medicines: {
        type: "array",
        items: { type: "object" },
        description: "Array of medicines with name, dosage, frequency, reminder_times"
      }
    },
    required: ["user_id", "medicines"]
  }
},
{
  name: "create_health_goals",
  description: "Creates personalized health goals based on current health status. Saves to plans table as goals.",
  parameters: {
    type: "object",
    properties: {
      user_id: {
        type: "string",
        description: "User's unique identifier"
      },
      goals: {
        type: "array",
        items: { type: "object" },
        description: "Array of health goals with name, target, timeline, milestones"
      }
    },
    required: ["user_id", "goals"]
  }
}

]