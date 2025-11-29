import { createClient } from '@supabase/supabase-js';

export async function executeToolCall(toolName, args, userId) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );

  console.log(`Executing tool: ${toolName}`, args);

  try {
    switch (toolName) {
      case "predict_disease":
        return await predictDisease(args.symptoms, args.duration);

      case "check_medicines":
        return await checkMedicines(supabase, args.user_id, args.check_interactions);

      case "analyze_nutrition":
        return await analyzeNutrition(supabase, args.user_id, args.days || 7);

      case "get_fitness_activity":
        return await getFitnessActivity(supabase, args.user_id, args.days || 7);

      case "find_clinics":
        return await findClinics(args.location, args.specialty, args.radius || 5);

      case "assess_mental_health":
        return await assessMentalHealth(supabase, args.user_id);

      case "create_fitness_plan":
        return await createFitnessPlan(supabase, args.user_id, args);
       
      case "create_meal_plan":
        return await createMealPlan(supabase, args.user_id, args);

      case "create_mental_health_routine":
        return await createMentalHealthRoutine(supabase, args.user_id, args);
      
      case "create_medicine_reminders":
        return await createMedicineReminders(supabase, args.user_id, args);

      case "create_health_goals":
        return await createHealthGoals(supabase, args.user_id, args);

      default:
        return { error: `Unknown tool: ${toolName}` };
    }
  } catch (error) {
    console.error(`Error executing ${toolName}:`, error);
    return { error: error.message };
  }
}

// ==================== DISEASE PREDICTION ====================
async function predictDisease(symptoms, duration) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    
    // Format symptoms for your API
    const problem = symptoms.join(', ');
    const answers = {
      symptoms: symptoms,
      duration: duration || 'Not specified',
      onset: 'Recent'
    };

    console.log('🔍 Calling disease prediction API with:', { problem, answers });

    const response = await fetch(`${baseUrl}/api/prediction`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        problem: problem,
        answers: answers
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('API Error:', error);
      throw new Error(`API returned ${response.status}`);
    }

    const data = await response.json();

    return {
      analysis: `Based on reported symptoms (${problem}):`,
      conditions: data.conditions || [],
      medicines: data.medicines || [],
      care_tips: data.care_tips || [],
      warning_signs: data.see_doctor_if || [],
      recommendation: data.conditions?.[0] 
        ? `Possible conditions: ${data.conditions.join(', ')}. ${data.medicines?.length > 0 ? 'Consider these OTC medicines: ' + data.medicines.join(', ') : ''}`
        : 'Consult a healthcare professional for diagnosis.',
      confidence: 'Medium'
    };

  } catch (error) {
    console.error('❌ Disease prediction error:', error);
    
    // Fallback: Basic symptom analysis
    return {
      analysis: `Symptom Analysis: ${symptoms.join(', ')}${duration ? ` (Duration: ${duration})` : ''}`,
      conditions: symptoms,
      recommendation: 'Consult a healthcare professional for accurate diagnosis and medical advice.',
      note: 'Using fallback analysis. Consider consulting a doctor for persistent symptoms.'
    };
  }
}


// ==================== MEDICINES TRACKER ====================
async function checkMedicines(supabase, userId, checkInteractions) {
  // First try the dedicated medicines table
  const { data: medicinesTable, error: medError } = await supabase
    .from('medicines')
    .select('*')
    .eq('user_id', userId)
    .eq('active', true);

  // If medicines table has data, use it
  if (!medError && medicinesTable && medicinesTable.length > 0) {
    const parsedMedicines = medicinesTable.map(m => ({
      name: m.medicine_name,
      dosage: m.dosage || 'Not specified',
      frequency: m.frequency || 'As needed',
      side_effects: m.side_effects || '',
      purpose: m.purpose || '',
      logged_at: m.created_at
    }));

    // Check for fatigue-causing side effects
    const fatigueRisk = parsedMedicines.filter(m => 
      m.side_effects && (
        m.side_effects.toLowerCase().includes('fatigue') ||
        m.side_effects.toLowerCase().includes('drowsiness') ||
        m.side_effects.toLowerCase().includes('tiredness') ||
        m.side_effects.toLowerCase().includes('sleepiness') ||
        m.side_effects.toLowerCase().includes('tired')
      )
    );

    return {
      medicines: parsedMedicines,
      total_count: parsedMedicines.length,
      fatigue_causing_meds: fatigueRisk.map(m => m.name),
      side_effects_risk: fatigueRisk.length > 0 ? 'high' : 'low',
      recommendation: fatigueRisk.length > 0 
        ? `⚠️ ${fatigueRisk.length} medication(s) may contribute to fatigue: ${fatigueRisk.map(m => m.name).join(', ')}. Consult your doctor about alternatives.`
        : '✓ No obvious medication-related fatigue concerns found.'
    };
  }

  // Fallback: Try nutrition_logs with correct column structure
  // nutrition_logs has: id, user_id, items (jsonb), created_at
  const { data: nutritionLogs, error: nutritionError } = await supabase
    .from('nutrition_logs')
    .select('*')
    .eq('user_id', userId)
    .limit(20);

  if (!nutritionError && nutritionLogs && nutritionLogs.length > 0) {
    // Parse items (jsonb) for medicine-related entries
    const medicineEntries = [];
    
    for (const log of nutritionLogs) {
      const items = log.items || {};
      
      // Check if items contains medicine/medication data
      const itemsStr = JSON.stringify(items).toLowerCase();
      if (itemsStr.includes('medicine') || 
          itemsStr.includes('medication') || 
          itemsStr.includes('pill') ||
          itemsStr.includes('tablet')) {
        
        medicineEntries.push({
          name: items.medicine_name || items.name || items.medication || 'Unknown medication',
          dosage: items.dosage || 'Not specified',
          frequency: items.frequency || 'As needed',
          side_effects: items.side_effects || items.notes || '',
          logged_at: log.created_at
        });
      }
    }

    if (medicineEntries.length > 0) {
      // Check for fatigue-causing side effects
      const fatigueRisk = medicineEntries.filter(m => 
        m.side_effects && (
          m.side_effects.toLowerCase().includes('fatigue') ||
          m.side_effects.toLowerCase().includes('drowsiness') ||
          m.side_effects.toLowerCase().includes('tired')
        )
      );

      return {
        medicines: medicineEntries,
        total_count: medicineEntries.length,
        fatigue_causing_meds: fatigueRisk.map(m => m.name),
        side_effects_risk: fatigueRisk.length > 0 ? 'high' : 'low',
        message: 'Medications found in nutrition logs. Consider using the dedicated Medicine Tracker.',
        recommendation: fatigueRisk.length > 0 
          ? `Some medications may contribute to fatigue. Consult your doctor.`
          : 'No obvious medication-related fatigue concerns.'
      };
    }
  }

  // No medicines found anywhere
  console.log('No medicines found in medicines table or nutrition_logs');
  
  return { 
    medicines: [], 
    total_count: 0,
    message: 'No medication data found. Start tracking medicines in the Medicine Tracker.',
    side_effects_risk: 'none',
    recommendation: 'Add your medications to get personalized side effect analysis and drug interaction checks.'
  };
}


// ==================== NUTRITION ANALYSIS ====================
async function analyzeNutrition(supabase, userId, days) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  // Query nutrition_logs
  const { data: nutritionLogs, error: nutritionError } = await supabase
    .from('nutrition_logs')
    .select('*')
    .eq('user_id', userId)
    .gte('created_at', startDate.toISOString())
    .order('created_at', { ascending: false });

  // Query daily_tracking
  const { data: dailyTracking, error: trackingError } = await supabase
    .from('daily_tracking')
    .select('*')
    .eq('user_id', userId)
    .gte('date', startDate.toISOString().split('T')[0])
    .order('date', { ascending: false });

  // Query food_logs
  const { data: foodLogs, error: foodError } = await supabase
    .from('food_logs')
    .select('*')
    .eq('user_id', userId)
    .gte('meal_date', startDate.toISOString().split('T')[0])
    .order('meal_date', { ascending: false });

  const hasData = (dailyTracking && dailyTracking.length > 0) || 
                  (foodLogs && foodLogs.length > 0) || 
                  (nutritionLogs && nutritionLogs.length > 0);

  if (!hasData) {
    return {
      message: 'No nutrition data available for analysis',
      recommendation: 'Start tracking meals in the Calorie Tracker to get personalized insights',
      days_analyzed: 0
    };
  }

  let nutritionStats = [];

  // Parse nutrition_logs (items is jsonb)
  if (nutritionLogs && nutritionLogs.length > 0) {
    nutritionLogs.forEach(log => {
      const items = log.items || {};
      nutritionStats.push({
        date: log.created_at?.split('T')[0],
        calories: items.calories || 0,
        protein: items.protein || 0,
        carbs: items.carbs || 0,
        fats: items.fats || 0
      });
    });
  }

  // Parse daily_tracking
  if (dailyTracking && dailyTracking.length > 0) {
    dailyTracking.forEach(entry => {
      const diet = entry.diet_consumed || {};
      nutritionStats.push({
        date: entry.date,
        calories: diet.total_calories || diet.calories || 0,
        protein: diet.total_protein || diet.protein || 0,
        carbs: diet.total_carbs || diet.carbs || 0,
        fats: diet.total_fats || diet.fats || 0
      });
    });
  }

  // Parse food_logs
  if (foodLogs && foodLogs.length > 0) {
    foodLogs.forEach(log => {
      nutritionStats.push({
        date: log.meal_date,
        calories: log.calories || 0,
        protein: log.protein || 0,
        carbs: log.carbs || 0,
        fats: log.fats || 0
      });
    });
  }

  if (nutritionStats.length === 0) {
    return {
      message: 'Unable to parse nutrition data',
      recommendation: 'Ensure meals are logged with complete nutritional information'
    };
  }

  const totalDays = nutritionStats.length;
  const avgCalories = nutritionStats.reduce((sum, d) => sum + d.calories, 0) / totalDays;
  const avgProtein = nutritionStats.reduce((sum, d) => sum + d.protein, 0) / totalDays;
  const avgCarbs = nutritionStats.reduce((sum, d) => sum + d.carbs, 0) / totalDays;
  const avgFats = nutritionStats.reduce((sum, d) => sum + d.fats, 0) / totalDays;

  const deficiencies = [];
  const warnings = [];

  if (avgProtein < 50) {
    deficiencies.push('protein');
    warnings.push('Low protein intake. Aim for 50-60g daily.');
  }
  if (avgCalories < 1500) {
    deficiencies.push('calories');
    warnings.push('Calorie intake below recommended minimum.');
  }
  if (avgFats < 40) {
    deficiencies.push('healthy_fats');
    warnings.push('Low fat intake. Healthy fats are essential.');
  }

  return {
    days_analyzed: totalDays,
    average_daily: {
      calories: Math.round(avgCalories),
      protein: Math.round(avgProtein),
      carbs: Math.round(avgCarbs),
      fats: Math.round(avgFats)
    },
    deficiencies,
    warnings,
    nutrition_quality: deficiencies.length === 0 ? 'good' : 'needs_improvement',
    data_sources: {
      nutrition_logs: nutritionLogs?.length || 0,
      daily_tracking: dailyTracking?.length || 0,
      food_logs: foodLogs?.length || 0
    }
  };
}


// ==================== FITNESS ACTIVITY ====================
async function getFitnessActivity(supabase, userId, days) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  // Query daily_tracking for workout data
  const { data: dailyTracking, error: trackingError } = await supabase
    .from('daily_tracking')
    .select('*')
    .eq('user_id', userId)
    .gte('date', startDate.toISOString().split('T')[0])
    .not('workout_done', 'is', null)
    .order('date', { ascending: false });

  // Query workout_progress for detailed workout history
  const { data: workoutProgress, error: progressError } = await supabase
    .from('workout_progress')
    .select('*')
    .eq('user_id', userId)
    .gte('created_at', startDate.toISOString())
    .order('created_at', { ascending: false });

  const hasData = (dailyTracking && dailyTracking.length > 0) || 
                  (workoutProgress && workoutProgress.length > 0);

  if (!hasData) {
    return {
      message: 'No workout data available',
      activity_level: 'sedentary',
      recommendation: 'Consider starting with 20-30 minutes of light physical activity daily',
      days_analyzed: days
    };
  }

  let workoutDetails = [];

  // Parse workout_done from daily_tracking
  if (dailyTracking && dailyTracking.length > 0) {
    workoutDetails = dailyTracking.map(entry => {
      const workout = entry.workout_done || {};
      return {
        date: entry.date,
        type: workout.type || workout.workout_type || 'general',
        duration: workout.duration || workout.total_duration || 30,
        exercises: workout.exercises || [],
        completed: true
      };
    });
  }

  // Add workout_progress data
  if (workoutProgress && workoutProgress.length > 0) {
    workoutProgress.forEach(progress => {
      const progressData = progress.progress_data || {};
      workoutDetails.push({
        date: progress.created_at?.split('T')[0],
        type: progress.workout_type || 'general',
        duration: progressData.duration || 30,
        sets: progressData.sets_completed,
        reps: progressData.reps_completed,
        completed: progress.completed || false
      });
    });
  }

  const totalWorkouts = workoutDetails.length;
  const avgPerWeek = (totalWorkouts / days) * 7;
  
  const totalDuration = workoutDetails.reduce((sum, w) => sum + (w.duration || 0), 0);
  const avgDuration = totalDuration / totalWorkouts;

  // Determine activity level
  let activityLevel = 'sedentary';
  let activityDescription = '';
  
  if (avgPerWeek >= 5) {
    activityLevel = 'very_active';
    activityDescription = 'Excellent! You maintain a very active lifestyle.';
  } else if (avgPerWeek >= 3) {
    activityLevel = 'active';
    activityDescription = 'Good! You meet recommended activity guidelines.';
  } else if (avgPerWeek >= 1) {
    activityLevel = 'lightly_active';
    activityDescription = 'Room for improvement. Try to increase frequency.';
  } else {
    activityLevel = 'sedentary';
    activityDescription = 'Low activity detected. This may contribute to fatigue.';
  }

  // Workout type distribution
  const workoutTypes = {};
  workoutDetails.forEach(w => {
    const type = w.type || 'general';
    workoutTypes[type] = (workoutTypes[type] || 0) + 1;
  });

  return {
    days_analyzed: days,
    total_workouts: totalWorkouts,
    workouts_per_week: Math.round(avgPerWeek * 10) / 10,
    avg_duration_minutes: Math.round(avgDuration),
    total_duration_hours: Math.round(totalDuration / 60 * 10) / 10,
    activity_level: activityLevel,
    activity_description: activityDescription,
    workout_type_distribution: workoutTypes,
    recent_workouts: workoutDetails.slice(0, 5).map(w => ({
      date: w.date,
      type: w.type,
      duration: w.duration,
      exercises: w.exercises?.length || 0
    })),
    data_sources: {
      daily_tracking: dailyTracking?.length || 0,
      workout_progress: workoutProgress?.length || 0
    }
  };
}

// ==================== MENTAL HEALTH ====================
async function assessMentalHealth(supabase, userId) {
  const { data: mentalHealthData, error } = await supabase
    .from('mental_health_logs')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(21);  // Get 3 weeks of data

  if (error || !mentalHealthData || mentalHealthData.length === 0) {
    return {
      message: 'No mental health data available',
      recommendation: 'Start tracking your mood and stress levels daily to identify patterns',
      mental_health_status: 'unknown'
    };
  }

  // Calculate mood trends
  const recentMood = mentalHealthData.slice(0, 7);  // Last week
  const olderMood = mentalHealthData.slice(7, 14);  // Previous week

  // Map category names to numeric scores for trending
  const categoryScoreMap = {
    'Severe': 1,
    'Moderate': 5,
    'Mild': 7,
    'Minimal/Low risk': 9
  };

  const recentAvg = recentMood.reduce((sum, m) => {
    const score = categoryScoreMap[m.category] || m.score || 5;
    return sum + score;
  }, 0) / recentMood.length;

  const olderAvg = olderMood.length > 0
    ? olderMood.reduce((sum, m) => {
        const score = categoryScoreMap[m.category] || m.score || 5;
        return sum + score;
      }, 0) / olderMood.length
    : recentAvg;

  let trend = 'stable';
  let trendDescription = '';

  if (recentAvg > olderAvg + 1) {
    trend = 'improving';
    trendDescription = 'Your mental health has been improving recently ✓';
  } else if (recentAvg < olderAvg - 1) {
    trend = 'declining';
    trendDescription = 'Your mental health has been declining. Consider reaching out for support.';
  } else {
    trend = 'stable';
    trendDescription = 'Your mental health has been relatively stable';
  }

  // Analyze category distribution
  const categoryCount = {};
  mentalHealthData.forEach(m => {
    categoryCount[m.category] = (categoryCount[m.category] || 0) + 1;
  });

  let status = 'good';
  let concerns = [];

  if (categoryCount['Severe'] > 0) {
    status = 'needs_attention';
    concerns.push(`${categoryCount['Severe']} entries with Severe stress/mood`);
  }
  if (categoryCount['Moderate'] > mentalHealthData.length / 2) {
    status = 'needs_attention';
    concerns.push('More than half your entries show Moderate stress');
  }
  if (trend === 'declining') {
    concerns.push('Mental health showing declining trend');
  }

  return {
    entries_analyzed: mentalHealthData.length,
    mood_trend: trend,
    trend_description: trendDescription,
    mental_health_status: status,
    category_distribution: categoryCount,
    concerns: concerns.length > 0 ? concerns : ['No major concerns detected'],
    recommendation: status === 'needs_attention' 
      ? 'Consider speaking with a mental health professional or counselor. Practice stress management techniques like meditation or exercise.'
      : 'Continue monitoring your mental health regularly. Maintain current wellness practices.',
    recent_entries: recentMood.slice(0, 3).map(m => ({
      date: m.created_at?.split('T')[0],
      category: m.category,
      score: m.score
    }))
  };
}


// ==================== FIND CLINICS ====================
async function findClinics(location, specialty, radius) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/nearby-clinics`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ location, specialty, radius })
    });
    
    if (!response.ok) {
      return { 
        clinics: [], 
        message: 'Unable to fetch nearby clinics at this time',
        recommendation: 'Try searching manually or contact your regular healthcare provider'
      };
    }
    
    const data = await response.json();
    return {
      ...data,
      search_params: { location, specialty, radius }
    };
  } catch (error) {
    console.error('Clinic finder error:', error);
    return { 
      clinics: [],
      message: 'Location service temporarily unavailable',
      recommendation: 'Please search manually or try again later'
    };
  }
}

async function createFitnessPlan(supabase, userId, planData) {
  try {
    // Your table stores plan as JSON in diet_plan/workout_plan columns
    const planPayload = {
      user_id: userId,
      name: planData.plan_name || 'AI Generated Plan',
      workout_plan: JSON.stringify({
        plan_name: planData.plan_name || 'AI Generated Plan',
        duration_weeks: planData.duration_weeks || 4,
        workouts: planData.workouts || [],
        goal: planData.goal || 'General Fitness',
        difficulty: planData.difficulty || 'Intermediate',
        created_at: new Date().toISOString(),
        ai_generated: true
      })
    };

    console.log('📝 Updating fitness plan for user:', userId);

    // Check if user already has a plan
    const { data: existingPlan, error: fetchError } = await supabase
      .from('fitness_plans')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (existingPlan && existingPlan.id) {
      // UPDATE existing plan (replaces old one)
      console.log('⚠️ Plan already exists. Replacing with new one.');
      
      const { data, error } = await supabase
        .from('fitness_plans')
        .update(planPayload)
        .eq('user_id', userId)
        .select();

      if (error) {
        console.error('Error updating fitness plan:', error);
        return {
          success: false,
          error: error.message,
          message: 'Could not update fitness plan'
        };
      }

      return {
        success: true,
        action: 'UPDATED',
        message: `✅ Fitness plan "${planData.plan_name}" updated! Old plan replaced. Check your Fitness Studio.`,
        workouts_count: planData.workouts?.length || 0,
        note: 'Your previous plan has been replaced with this new one'
      };
    } else {
      // INSERT new plan (first time)
      console.log('✅ Creating new fitness plan');
      
      const insertPayload = {
        user_id: userId,
        ...planPayload,
        created_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('fitness_plans')
        .insert([insertPayload])
        .select();

      if (error) {
        console.error('Error creating fitness plan:', error);
        return {
          success: false,
          error: error.message
        };
      }

      return {
        success: true,
        action: 'CREATED',
        message: `✅ Fitness plan "${planData.plan_name}" created! Check your Fitness Studio.`,
        workouts_count: planData.workouts?.length || 0
      };
    }

  } catch (error) {
    console.error('Create fitness plan error:', error);
    return { success: false, error: error.message };
  }
}


async function createMealPlan(supabase, userId, mealData) {
  try {
    const planPayload = {
      user_id: userId,  // FIX 1: Changed useriD to userId
      name: mealData.plan_name || 'AI Generated Meal Plan',
      diet_plan: JSON.stringify({
        plan_name: mealData.plan_name || 'AI Generated Meal Plan',
        duration_days: mealData.duration_days || 7,
        daily_meals: mealData.daily_meals || [],
        daily_calories: mealData.daily_calories || 2000,
        macros: mealData.macros || {},
        ai_generated: true,
        created_at: new Date().toISOString()
      }),
      created_at: new Date().toISOString()  // Keep this one
    };

    console.log('📝 Creating meal plan for user:', userId);

    // Check if user already has a meal plan
    const { data: existingPlan, error: fetchError } = await supabase
      .from('fitness_plans')
      .select('id')
      .eq('user_id', userId)  // FIX 2: Changed userid to user_id
      .single();

    if (existingPlan && existingPlan.id) {
      // UPDATE existing plan
      console.log('⚠️ Meal plan already exists. Replacing with new one.');
      
      const { data, error } = await supabase
        .from('fitness_plans')
        .update(planPayload)
        .eq('user_id', userId)  // FIX 2: Changed userid to user_id
        .select();

      if (error) {
        console.error('Error updating meal plan:', error);
        return { 
          success: false, 
          error: error.message,
          message: 'Could not update meal plan'
        };
      }

      return {
        success: true,
        action: 'UPDATED',
        message: `✅ Meal plan "${mealData.plan_name}" updated! Check your Diet Progress.`,
        note: 'Your previous meal plan has been replaced'
      };
    } else {
      // INSERT new plan
      const insertPayload = {
        user_id: userId,  // FIX 1: Changed userid to user_id
        name: mealData.plan_name || 'AI Generated Meal Plan',
        diet_plan: planPayload.diet_plan,
        created_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('fitness_plans')
        .insert([insertPayload])
        .select();

      if (error) {
        console.error('Error creating meal plan:', error);
        return { 
          success: false, 
          error: error.message,
          message: 'Could not create meal plan'
        };
      }

      return {
        success: true,
        action: 'CREATED',
        message: `✅ Meal plan "${mealData.plan_name}" created! Check your Diet Progress.`
      };
    }

  } catch (error) {
    console.error('Create meal plan error:', error);
    return { 
      success: false, 
      error: error.message,
      message: 'Error creating meal plan'
    };
  }
}



async function createMentalHealthRoutine(supabase, userId, routineData) {
  try {
    // Create multiple daily log entries for the routine
    const entries = [];
    const today = new Date();
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      
      entries.push({
        user_id: userId,
        log_date: date.toISOString().split('T')[0],
        score: 6, // Starting score
        category: 'Moderate',
        notes: `${routineData.routine_name}: ${routineData.goal || 'Mental health routine'}`,
        routine_data: routineData.activities,
        
        created_at: new Date().toISOString()
      });
    }

    const { data, error } = await supabase
      .from('mental_health_logs')
      .insert(entries)
      .select();

    if (error) {
      console.error('Error creating mental health routine:', error);
      return {
        success: false,
        error: error.message
      };
    }

    return {
      success: true,
      routine_name: routineData.routine_name,
      message: `✅ Mental health routine "${routineData.routine_name}" created! Check your Mental Health section.`,
      activities_count: routineData.activities?.length || 0,
      entries_created: entries.length,
      recommendation: `${routineData.goal || 'Mental health improvement'}. Practice daily for best results.`
    };

  } catch (error) {
    console.error('Create mental health routine error:', error);
    return { success: false, error: error.message };
  }
}

async function createMedicineReminders(supabase, userId, reminderData) {
  try {
    const medicines = reminderData.medicines || [];
    const updates = [];

    for (const med of medicines) {
      const { data, error } = await supabase
        .from('medicines')
        .update({
          reminder_times: med.reminder_times || [],
          reminder_enabled: true,
          notes: med.notes || `Reminder set for ${med.frequency || 'as needed'}`,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('medicine_name', med.name)
        .select();

      if (!error && data) {
        updates.push(med.name);
      }
    }

    // If no existing medicines updated, create new entries
    if (updates.length === 0) {
      const newMeds = medicines.map(m => ({
        user_id: userId,
        medicine_name: m.name,
        dosage: m.dosage || 'As prescribed',
        frequency: m.frequency || 'Daily',
        reminder_times: m.reminder_times || [],
        reminder_enabled: true,
        active: true,
        purpose: m.purpose || 'Health maintenance',
        ai_generated: true,
        created_at: new Date().toISOString()
      }));

      const { data, error } = await supabase
        .from('medicines')
        .insert(newMeds)
        .select();

      if (error) {
        return { success: false, error: error.message };
      }

      updates.push(...newMeds.map(m => m.medicine_name));
    }

    return {
      success: true,
      message: `✅ Medicine reminders created for ${updates.length} medication(s)! Check your Medicine Tracker.`,
      medicines_count: updates.length,
      reminder_times: medicines[0]?.reminder_times || [],
      notification: 'You will receive notifications at scheduled times'
    };

  } catch (error) {
    console.error('Create medicine reminders error:', error);
    return { success: false, error: error.message };
  }
}

async function createHealthGoals(supabase, userId, goalsData) {
  try {
    const goals = goalsData.goals || [];
    
    const goalEntries = goals.map(g => ({
      user_id: userId,
      plan_name: g.name,
      plan_type: 'health_goal',
      target: g.target,
      timeline: g.timeline,
      milestones: g.milestones || [],
      status: 'active',
      progress: 0,
      description: `Goal: ${g.name}. Target: ${g.target}. Timeline: ${g.timeline}`,
      ai_generated: true,
      created_at: new Date().toISOString()
    }));

    const { data, error } = await supabase
      .from('plans')
      .insert(goalEntries)
      .select();

    if (error) {
      console.error('Error creating health goals:', error);
      return {
        success: false,
        error: error.message
      };
    }

    return {
      success: true,
      message: `✅ ${goals.length} health goal(s) created! Check your Goals section.`,
      goals_created: goals.length,
      goals_list: goals.map(g => `• ${g.name} (${g.timeline})`),
      motivation: 'Track your progress regularly and celebrate milestones!'
    };

  } catch (error) {
    console.error('Create health goals error:', error);
    return { success: false, error: error.message };
  }
}