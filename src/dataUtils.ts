import { ScheduleJsonData, ScheduleState, JsonWeekData } from './types';
// Import the raw initial data directly from the JSON file
import initialJsonData from './initialState.json';

// --- Helper function to generate unique IDs ---
export const generateId = (): string => `id_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

// --- Function to transform loaded JSON data to the app's state format ---
export const transformLoadedData = (jsonData: ScheduleJsonData): [ScheduleState, number] => { 
    const schedule: ScheduleState = {};
    let maxWeek = 0;
    const dayKeysMap: { [key: string]: string } = { 'mon': 'Mon', 'tue': 'Tue', 'wed': 'Wed', 'thu': 'Thu', 'fri': 'Fri', 'sat': 'Sat' };

    jsonData.weeks.forEach(weekData => {
        const weekNum = weekData.week;
        if (weekNum > maxWeek) {
            maxWeek = weekNum;
        }

        // Iterate over possible day keys (mon, tue, etc.) within the weekData
        Object.keys(dayKeysMap).forEach(jsonDayKey => {
            // Check if the weekData actually has this day defined
            if (weekData[jsonDayKey as keyof Omit<JsonWeekData, 'week'>]) {
                const dayAbbr = dayKeysMap[jsonDayKey];
                const dayId = `W${weekNum}-${dayAbbr}`;
                // Ensure activities exist and add unique IDs
                const activitiesWithIds = weekData[jsonDayKey as keyof Omit<JsonWeekData, 'week'>]?.activities.map(activity => ({
                    ...activity,
                    id: generateId() // Add a unique ID
                })) || []; // Default to empty array if no activities
                schedule[dayId] = activitiesWithIds;
            } else {
                // Ensure dayId exists even if no activities are defined for it in the JSON
                const dayAbbr = dayKeysMap[jsonDayKey];
                const dayId = `W${weekNum}-${dayAbbr}`;
                if (!schedule[dayId]) { // Only add if not already added by a previous week's definition (unlikely but safe)
                    schedule[dayId] = [];
                }
            }
        });
    });

    // Ensure all days for all weeks up to maxWeek exist, even if empty
    for (let w = 1; w <= maxWeek; w++) {
        Object.values(dayKeysMap).forEach(dayAbbr => {
            const dayId = `W${w}-${dayAbbr}`;
            if (!schedule[dayId]) {
                schedule[dayId] = [];
            }
        });
    }

    // Handle case where jsonData might be empty or malformed, default to 12 weeks
    if (maxWeek === 0 && jsonData.weeks.length === 0) {
        maxWeek = 12; // Default if no weeks found
         // Initialize empty days for default 12 weeks
         for (let w = 1; w <= maxWeek; w++) {
            Object.values(dayKeysMap).forEach(dayAbbr => {
                const dayId = `W${w}-${dayAbbr}`;
                if (!schedule[dayId]) {
                    schedule[dayId] = [];
                }
            });
        }
    }

    return [schedule, maxWeek]; // Return the populated schedule and calculated max weeks
 };

// Export the imported data so App.tsx can use it for reset
// Explicitly cast to ScheduleJsonData to satisfy TypeScript's stricter typing
export const initialSeedData: ScheduleJsonData = initialJsonData as ScheduleJsonData;

// Helper to calculate initial weeks directly from raw data without transforming schedule
export const calculateInitialWeeks = (): number => { 
     // This function is no longer needed as transformLoadedData calculates weeks
     // Keeping it commented out for reference or future use if structure changes
     // let maxWeek = 0;
     // for (const dayId of Object.keys(jsonData)) {
     //     const match = dayId.match(/^W(\d+)-/); // Extract week number
     //     if (match) {
     //         const weekNum = parseInt(match[1], 10);
     //         if (weekNum > maxWeek) {
     //             maxWeek = weekNum;
     //         }
     //     }
     // }
     // return maxWeek > 0 ? maxWeek : 12; // Return max weeks found or default 12
    return 12; // Placeholder return, as it's unused
};

// --- Transform current state to JSON for saving ---
export const transformStateToJson = (scheduleState: ScheduleState): ScheduleJsonData => {
    const jsonData: ScheduleJsonData = { weeks: [] };
    const weekMap: { [weekNum: number]: JsonWeekData } = {};
    const dayKeysReverse: { [key: string]: keyof Omit<JsonWeekData, 'week'> } = {
        'Mon': 'mon', 'Tue': 'tue', 'Wed': 'wed', 'Thu': 'thu', 'Fri': 'fri', 'Sat': 'sat'
    };

    // Group activities by week and day
    Object.entries(scheduleState).forEach(([dayId, activities]) => {
        const match = dayId.match(/^W(\d+)-(\w+)$/);
        if (match) {
            const weekNum = parseInt(match[1], 10);
            const dayAbbr = match[2];
            const jsonDayKey = dayKeysReverse[dayAbbr];

            if (jsonDayKey) {
                if (!weekMap[weekNum]) {
                    weekMap[weekNum] = { week: weekNum };
                }
                // Prepare activities for JSON (strip 'id')
                const jsonActivities = activities.map(({ id, ...rest }) => rest);
                weekMap[weekNum][jsonDayKey] = { activities: jsonActivities };
            }
        }
    });

    // Sort weeks and add to the final structure
    jsonData.weeks = Object.values(weekMap).sort((a, b) => a.week - b.week);

    return jsonData;
};
