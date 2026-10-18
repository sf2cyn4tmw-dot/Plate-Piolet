/** Adult planning estimates only. Personal energy needs vary. No health data leaves the device. */
export const ACTIVITY = Object.freeze({
  sedentary: { factor: 1.2, label: 'Mostly sitting' },
  light: { factor: 1.375, label: 'Lightly active' },
  moderate: { factor: 1.55, label: 'Moderately active' },
  active: { factor: 1.725, label: 'Very active' },
  intense: { factor: 1.9, label: 'Highly active' }
});
export const EMPTY_PROFILE = Object.freeze({
  age: '', sex: '', heightFt: '', heightIn: '', weightLb: '', goalWeightLb: '',
  activity: 'light', goal: 'maintain', pace: '0.5', macros: 'balanced'
});
export function estimatePlan(raw) {
  const age = Number(raw.age), feet = Number(raw.heightFt), inches = Number(raw.heightIn);
  const pounds = Number(raw.weightLb);
  const goal = raw.goal, sex = raw.sex;
  if (!['female','male'].includes(sex)) throw Error('Select the energy equation to use.');
  if (!String(raw.age).trim() || !Number.isInteger(age) || age < 18 || age > 100) throw Error('Enter an age from 18 to 100.');
  if (!String(raw.heightFt).trim() || !Number.isInteger(feet) || feet < 3 || feet > 7 || !Number.isInteger(inches) || inches < 0 || inches >= 12) throw Error('Enter height in feet and inches.');
  const heightCm = (feet * 12 + inches) * 2.54;
  if (heightCm < 120 || heightCm > 230) throw Error('Check your height (120–230 cm supported).');
  if (!String(raw.weightLb).trim() || !Number.isFinite(pounds) || pounds < 77 || pounds > 770) throw Error('Enter a weight between 77 and 770 lb.');
  if (!['lose','maintain','gain'].includes(goal)) throw Error('Select your weight goal.');
  const activity = ACTIVITY[raw.activity];
  if (!activity) throw Error('Select your activity level.');
  const pace = Number(raw.pace);
  if (!Number.isFinite(pace) || ![0.5,1,1.5].includes(pace)) throw Error('Select a weekly pace.');
  if (!['balanced','highProtein','lowerCarb'].includes(raw.macros)) throw Error('Select a macro preference.');
  const goalWeight = String(raw.goalWeightLb??'').trim();
  if (goalWeight && (!Number.isFinite(Number(goalWeight)) || Number(goalWeight) < 77 || Number(goalWeight) > 770)) throw Error('Check your optional target weight.');
  const kg = pounds * 0.45359237;
  // Mifflin–St Jeor resting metabolic rate estimate, using the chosen adult equation.
  const bmr = 10 * kg + 6.25 * heightCm - 5 * age + (sex === 'male' ? 5 : -161);
  const maintenance = Math.round(bmr * activity.factor / 10) * 10;
  const weeklyChange = pace * 500; // ~3500 kcal/lb divided by 7 days; rough heuristic.
  const requestedAdjustment = goal === 'maintain' ? 0 : (goal === 'lose' ? -weeklyChange : weeklyChange);
  const cappedAdjustment = goal === 'lose'
    ? -Math.min(weeklyChange, maintenance * 0.2)
    : goal === 'gain' ? Math.min(weeklyChange, maintenance * 0.15) : 0;
  const floor = sex === 'male' ? 1500 : 1200;
  const preFloor = maintenance + cappedAdjustment;
  const result = goal === 'lose' ? Math.max(floor, preFloor) : preFloor;
  const calories = Math.round(result / 10) * 10;
  const warnings = [];
  if (Math.abs(requestedAdjustment) > Math.abs(cappedAdjustment) + 1) warnings.push('The calorie change was moderated to keep the plan gradual.');
  if (preFloor < floor) warnings.push('Your calorie target was limited by a basic planning floor. Consider individualized guidance before pursuing a deficit.');
  if (goalWeight && ((goal === 'lose' && Number(goalWeight) >= pounds) || (goal === 'gain' && Number(goalWeight) <= pounds))) warnings.push('Your target weight points in the opposite direction from your selected goal.');
  const proteinFactor = raw.macros === 'highProtein' ? 1 : raw.macros === 'lowerCarb' ? 0.85 : goal === 'lose' ? 0.85 : 0.75;
  const protein = Math.round(Math.min(pounds * proteinFactor, calories * 0.35 / 4));
  let carbs, fat;
  if (raw.macros === 'lowerCarb') {
    carbs = Math.round(calories * 0.3 / 4);
    fat = Math.max(0, Math.round((calories - protein * 4 - carbs * 4) / 9));
  } else {
    fat = Math.round(calories * (raw.macros === 'highProtein' ? .28 : .30) / 9);
    carbs = Math.max(0, Math.round((calories - protein * 4 - fat * 9) / 4));
  }
  return {
    calorieGoal: calories, proteinGoal: protein, carbsGoal: carbs, fatGoal: fat,
    maintenance, resting: Math.round(bmr), adjustment: calories - maintenance,
    warnings, activityLabel: activity.label
  };
}
