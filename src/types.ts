// --- Type Definitions ---

// Define the possible pillar types
export type PillarType = 'Ser' | 'Pensar' | 'Hacer' | 'Social';

// Interface for a single activity
export interface Activity {
  id: string;
  pillar: PillarType;
  name: string;
  description: string;
  skills?: string[]; // Optional skills array
  isFieldTrip: boolean; // Renamed from fieldTrip for consistency
}

// Interface for the application's internal state representation
export interface ScheduleState {
  [dayId: string]: Activity[];
}

// --- Interfaces for JSON Save/Load Format ---
export interface JsonDayData {
  activities: Omit<Activity, 'id'>[]; // Exclude 'id' when saving/loading structure
}

export interface JsonWeekData {
  week: number;
  mon?: JsonDayData;
  tue?: JsonDayData;
  wed?: JsonDayData;
  thu?: JsonDayData;
  fri?: JsonDayData;
  sat?: JsonDayData;
}

export interface ScheduleJsonData {
  weeks: JsonWeekData[];
}

// --- Prop Interfaces ---

export interface CreateActivityFormProps {
    targetDayId: string;
    onAddActivity: (dayId: string, newActivity: Activity) => void;
    onCancel: () => void;
}

export interface EditActivityFormProps {
    activity: Activity;
    dayId: string;
    onUpdateActivity: (dayId: string, updatedActivity: Activity) => void;
    onCancel: () => void;
}

export interface ActivityListModalProps {
    scheduleData: ScheduleState;
    onClose: () => void;
}

// Props for components moved from App.tsx

export interface ActivityTagProps {
  activity: Activity;
  dayId: string; // Need dayId to identify which day to remove from
  onRemoveActivity: (dayId: string, activityId: string) => void;
  onEditActivityRequest: (activity: Activity, dayId: string) => void; // Pass activity and dayId
  onDragStartInitiated: () => void; // Add callback for drag start
}

export interface DayCellProps {
  dayId: string;
  activities: Activity[];
  onDropActivity: (targetDayId: string, activityId: string, sourceDayId: string) => void;
  onRemoveActivity: (dayId: string, activityId: string) => void;
  onAddActivityRequest: (dayId: string) => void; // Function to trigger showing the add form
  onEditActivityRequest: (activity: Activity, dayId: string) => void; // Function to trigger showing the edit form
  onDragStartInitiated: () => void; // Add callback for drag start
}

export interface WeekRowProps {
  weekNum: number; // Renamed from weekNumber
  schedule: ScheduleState; // Renamed from weekData
  daysOfWeek: string[];
  onDropActivity: (targetDayId: string, activityId: string, sourceDayId: string) => void;
  onRemoveActivity: (dayId: string, activityId: string) => void;
  onAddActivityRequest: (dayId: string) => void;
  onEditActivityRequest: (activity: Activity, dayId: string) => void;
  onDragStartInitiated: () => void; // Add callback for drag start
}
