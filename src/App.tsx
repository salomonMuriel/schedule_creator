import React, { useState, useCallback, useMemo, useEffect, useRef, FC, ChangeEvent, DragEvent, MouseEvent, FormEvent } from 'react';
import './App.css'; // Assuming you have some base CSS

// Import types
import { Activity, ScheduleState, PillarType, ScheduleJsonData } from './types';

// Import data utilities and initial raw data
import { initialSeedData, transformLoadedData, transformStateToJson } from './dataUtils';

// Import components
import WeekRow from './components/WeekRow';
import CreateActivityForm from './components/CreateActivityForm';
import EditActivityForm from './components/EditActivityForm';
import ActivityListModal from './components/ActivityListModal';
import { pillarBgColors, pillarTextColors } from './components/ActivityTag'; // Import color maps


// --- Main App Component ---
const App: FC = () => {
    // --- State ---
    const [schedule, setSchedule] = useState<ScheduleState>({}); // Initialize empty, load in useEffect
    const [numWeeks, setNumWeeks] = useState<number>(12); // Default number of weeks
    const [history, setHistory] = useState<[ScheduleState, number][]>([]); // History for undo
    const [showCreateForm, setShowCreateForm] = useState<string | null>(null); // Stores the dayId for which to show the form, or null
    const [showEditForm, setShowEditForm] = useState<{ activity: Activity; dayId: string } | null>(null); // Stores the activity and dayId to edit
    const [showActivityList, setShowActivityList] = useState<boolean>(false); // State to control the visibility of the activity list modal
    const fileInputRef = useRef<HTMLInputElement>(null); // Ref for the file input

    // --- Constants ---
    const daysOfWeek = useMemo(() => ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], []);

    // --- Effects ---
    // Effect to load schedule from localStorage or initial data on mount
    useEffect(() => {
        const savedScheduleJson = localStorage.getItem('catapultSchedule');
        let loadedSchedule: ScheduleState;
        let loadedNumWeeks: number = 12; // Default

        if (savedScheduleJson) {
            try {
                const loadedJsonData = JSON.parse(savedScheduleJson);
                [loadedSchedule, loadedNumWeeks] = transformLoadedData(loadedJsonData);
            } catch (error) {
                console.error("Failed to load/parse schedule from localStorage:", error);
                // Fallback to initial data if loading fails
                [loadedSchedule, loadedNumWeeks] = transformLoadedData(initialSeedData);
            }
        } else {
             // Initialize with default data if nothing in localStorage
             [loadedSchedule, loadedNumWeeks] = transformLoadedData(initialSeedData);
        }
        setSchedule(loadedSchedule);
        setNumWeeks(loadedNumWeeks);

    }, []); // Empty dependency array ensures this runs only once on mount

    // Effect to save schedule to localStorage whenever it changes
    useEffect(() => {
        // Avoid saving the initial empty state before loading is complete
        if (Object.keys(schedule).length > 0) {
            try {
                const scheduleJsonData = transformStateToJson(schedule);
                localStorage.setItem('catapultSchedule', JSON.stringify(scheduleJsonData));
            } catch (error) {
                console.error("Failed to save schedule to localStorage:", error);
            }
        }
    }, [schedule]); // Run whenever the schedule state updates


    // --- History Management ---
    const handleUndo = useCallback(() => {
        if (history.length === 0) {
            return; // Nothing to undo
        }

        const [prevState, prevNumWeeks] = history[0]; // Get the most recent state
        const newHistory = history.slice(1); // Remove it from history

        setSchedule(prevState);
        setNumWeeks(prevNumWeeks);
        setHistory(newHistory);
        // Note: localStorage saving will happen automatically via useEffect
    }, [history]); // Dependency: history


    // --- Event Handlers ---

    // Function to close all potentially open modals
    const closeAllModals = useCallback(() => {
        setShowCreateForm(null);
        setShowEditForm(null);
        setShowActivityList(false);
    }, []);

    // --- Reset Handler ---
    const handleResetSchedule = useCallback(() => {
        if (window.confirm("Are you sure you want to reset the schedule to its initial state? All current changes will be lost.")) {
            const [initialSchedule, initialWeeks] = transformLoadedData(initialSeedData);
            setSchedule(initialSchedule);
            setNumWeeks(initialWeeks);
            setHistory([]); // Clear undo history
            closeAllModals(); // Close any open forms/modals
            // localStorage will update via useEffect
            alert("Schedule has been reset to the initial state.");
        }
    }, [closeAllModals]); // Dependency: closeAllModals function

    // Handle dropping an activity onto a day cell
    const handleDropActivity = useCallback((targetDayId: string, activityId: string, sourceDayId: string) => {
        // Save current state to history before modification
        const stateToSave: [ScheduleState, number] = [schedule, numWeeks];
        setHistory(prev => [stateToSave, ...prev].slice(0, 10));

        setSchedule(prevSchedule => {
            const newSchedule = { ...prevSchedule };
            const sourceActivities = [...(newSchedule[sourceDayId] || [])];
            const targetActivities = [...(newSchedule[targetDayId] || [])];

            // Find the activity being moved
            const activityIndex = sourceActivities.findIndex(act => act.id === activityId);
            if (activityIndex === -1) return prevSchedule; // Activity not found

            const [movedActivity] = sourceActivities.splice(activityIndex, 1);

            // Add the activity to the target day
            targetActivities.push(movedActivity);

            // Update the schedule state
            newSchedule[sourceDayId] = sourceActivities;
            newSchedule[targetDayId] = targetActivities;
            return newSchedule;
        });
    }, [schedule, numWeeks]); // Depend on current schedule and numWeeks

    // Handle removing an activity from a day cell
    const handleRemoveActivity = useCallback((dayId: string, activityId: string) => {
        // Confirmation dialog
        if (!window.confirm(`Are you sure you want to remove this activity?`)) {
            return; // Stop if user cancels
        }

        // Save current state to history before modification
        const stateToSave: [ScheduleState, number] = [schedule, numWeeks];
        setHistory(prev => [stateToSave, ...prev].slice(0, 10));

        setSchedule(prevSchedule => {
            const newSchedule = { ...prevSchedule };
            const dayActivities = [...(newSchedule[dayId] || [])];

            // Filter out the activity to remove
            newSchedule[dayId] = dayActivities.filter(act => act.id !== activityId);
            return newSchedule;
        });
    }, [schedule, numWeeks]); // Depend on current schedule and numWeeks

    // Handle request to add a new activity (opens the form)
    const handleAddActivityRequest = useCallback((dayId: string) => {
        setShowCreateForm(dayId); // Set the target day ID to show the form
        setShowEditForm(null); // Ensure edit form is closed
    }, []);

    // Handle adding the new activity from the form
    const handleAddActivity = useCallback((dayId: string, newActivity: Activity) => {
        // Save current state to history before modification
        const stateToSave: [ScheduleState, number] = [schedule, numWeeks];
        setHistory(prev => [stateToSave, ...prev].slice(0, 10));

        setSchedule(prevSchedule => {
            const newSchedule = { ...prevSchedule };
            // Ensure the day exists in the schedule before adding
            const dayActivities = [...(newSchedule[dayId] || [])];
            dayActivities.push(newActivity);
            newSchedule[dayId] = dayActivities;
            return newSchedule;
        });
        setShowCreateForm(null); // Close the form after adding
    }, [schedule, numWeeks]); // Depend on current schedule and numWeeks

    const handleEditActivityRequest = useCallback((activity: Activity, dayId: string) => {
        setShowEditForm({ activity, dayId }); // Set the activity and day ID to edit
        setShowCreateForm(null); // Ensure create form is closed
    }, []);

    // Handle updating an activity from the edit form
    const handleUpdateActivity = useCallback((dayId: string, updatedActivity: Activity) => {
        // Save current state to history before modification
        const stateToSave: [ScheduleState, number] = [schedule, numWeeks];
        setHistory(prev => [stateToSave, ...prev].slice(0, 10));

        setSchedule(prevSchedule => {
            const newSchedule = { ...prevSchedule };
            const dayActivities = [...(newSchedule[dayId] || [])];
            const activityIndex = dayActivities.findIndex(act => act.id === updatedActivity.id);

            if (activityIndex !== -1) {
                dayActivities[activityIndex] = updatedActivity;
                newSchedule[dayId] = dayActivities;
            } else {
                 console.warn(`Activity with ID ${updatedActivity.id} not found in day ${dayId} for update.`);
                 return prevSchedule; // Return previous state if activity not found
            }
            return newSchedule; // Return new state
        });
        setShowEditForm(null); // Close the edit form
    }, [schedule, numWeeks]); // Depend on current schedule and numWeeks

    // --- Dynamic Week Management ---
    const addWeek = useCallback(() => {
        // Save current state to history before modification
        const stateToSave: [ScheduleState, number] = [schedule, numWeeks];
        setHistory(prev => [stateToSave, ...prev].slice(0, 10));

        setNumWeeks(prev => {
            const nextWeekNum = prev + 1;
            // Pre-populate the new week's days in the schedule state if they don't exist
            // This ensures WeekRow receives valid keys even if the week is initially empty
            setSchedule(currentSchedule => {
                const updatedSchedule = {...currentSchedule};
                let weekNeedsInitialization = false;
                daysOfWeek.forEach(day => {
                    const dayId = `W${nextWeekNum}-${day}`;
                    if (!(dayId in updatedSchedule)) {
                        updatedSchedule[dayId] = [];
                        weekNeedsInitialization = true;
                    }
                });
                // Only return a new object if changes were actually made
                return weekNeedsInitialization ? updatedSchedule : currentSchedule;
            });
            return nextWeekNum;
        });
    }, [schedule, numWeeks]); // Depend on current schedule and numWeeks

    const removeWeek = useCallback(() => {
        if (numWeeks <= 1) {
            alert("Cannot remove the last week.");
            return;
        }
        if (window.confirm(`Are you sure you want to remove Week ${numWeeks} and all its activities? This cannot be undone.`)) {
            // Save current state to history before modification
            const stateToSave: [ScheduleState, number] = [schedule, numWeeks];
            setHistory(prev => [stateToSave, ...prev].slice(0, 10));

            const weekToRemove = numWeeks;
            setSchedule(prevSchedule => {
                const newSchedule = { ...prevSchedule };
                let weekRemoved = false;
                daysOfWeek.forEach(day => {
                    const dayId = `W${weekToRemove}-${day}`;
                    if (dayId in newSchedule) {
                        delete newSchedule[dayId]; // Remove entries for the last week
                        weekRemoved = true;
                    }
                });
                 // Only return a new object if changes were made
                return weekRemoved ? newSchedule : prevSchedule;
            });
            setNumWeeks(prev => prev - 1);
        }
    }, [schedule, numWeeks]); // Depend on current schedule and numWeeks

    // --- Save/Load Functionality ---

    // Trigger file download
    const handleSaveSchedule = () => {
        try {
            const scheduleJsonData = transformStateToJson(schedule);
            const jsonString = JSON.stringify(scheduleJsonData, null, 2); // Pretty print JSON
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `catapult_schedule_${new Date().toISOString().split('T')[0]}.json`; // Filename with date
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url); // Clean up blob URL
            // alert('Schedule saved successfully!'); // Optional feedback
        } catch (error) {
            console.error('Failed to save schedule:', error);
            alert('Error saving schedule. See console for details.');
        }
    };

    // Trigger hidden file input click
    const triggerLoadInput = () => {
        fileInputRef.current?.click();
    };

    // Process selected file
    const handleLoadScheduleFile = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) {
            return; // No file selected
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const jsonString = e.target?.result as string;
                const loadedJsonData: ScheduleJsonData = JSON.parse(jsonString);

                // Basic validation
                if (!loadedJsonData || !Array.isArray(loadedJsonData.weeks)) {
                   throw new Error("Invalid schedule file format. Missing 'weeks' array.");
                }
                if (loadedJsonData.weeks.some(week => typeof week.week !== 'number')) {
                    throw new Error("Invalid schedule file format. Each week must have a 'week' number.");
                }

                const [loadedSchedule, loadedNumWeeks] = transformLoadedData(loadedJsonData);
                setSchedule(loadedSchedule); // Update state
                setNumWeeks(loadedNumWeeks); // Update numWeeks

                alert('Schedule loaded successfully!');
                // No need to save to localStorage here, the useEffect for 'schedule' handles it.

            } catch (error) {
                console.error('Failed to load or parse schedule file:', error);
                alert(`Error loading schedule file: ${error instanceof Error ? error.message : 'Unknown error'}. Please check the file format and console.`);
            } finally {
                 // Reset file input value to allow loading the same file again if needed
                if (event.target) {
                    event.target.value = '';
                }
            }
        };
        reader.onerror = () => {
             console.error('Error reading file:', reader.error);
             alert('Error reading the selected file.');
             if (event.target) {
                 event.target.value = ''; // Reset file input
             }
        };
        reader.readAsText(file);
    };

    // --- Render ---
    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Catapult Schedule Planner</h1>

            {/* --- Controls --- */}
            <div className="flex justify-between items-center mb-4 bg-gray-100 p-3 rounded-lg shadow-sm">
                <div className="flex space-x-2">
                    <button onClick={addWeek} className="px-4 py-2 bg-blue-500 text-white font-semibold rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75 shadow-sm">Add Week</button>
                    <button onClick={removeWeek} disabled={numWeeks <= 1} className={`px-4 py-2 font-semibold rounded shadow-sm ${numWeeks <= 1 ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-red-500 text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-75'}`}>Remove Last Week</button>
                    <button onClick={handleUndo} disabled={history.length === 0} className={`px-4 py-2 font-semibold rounded shadow-sm ${history.length === 0 ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-orange-500 text-white hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-opacity-75'}`}>Undo</button>
                    <button onClick={handleResetSchedule} className="px-4 py-2 bg-yellow-500 text-white font-semibold rounded hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-opacity-75 shadow-sm">Reset</button>
                </div>
                <div className="flex space-x-2">
                     <button onClick={handleSaveSchedule} className="px-4 py-2 bg-green-500 text-white font-semibold rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-75 shadow-sm">Save Schedule (JSON)</button>
                     <button onClick={triggerLoadInput} className="px-4 py-2 bg-yellow-500 text-white font-semibold rounded hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-opacity-75 shadow-sm">Load Schedule (JSON)</button>
                     <input type="file" ref={fileInputRef} onChange={handleLoadScheduleFile} accept=".json" style={{ display: 'none' }} />
                    <button onClick={() => setShowActivityList(true)} className="px-4 py-2 bg-purple-500 text-white font-semibold rounded hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-opacity-75 shadow-sm">View All Activities</button> {/* Button to toggle the modal */}
                </div>
            </div>

            {/* --- Pillar Color Legend --- */}
            <div className="flex justify-center space-x-4 mb-4 text-xs">
                {(['Ser', 'Pensar', 'Hacer', 'Social'] as PillarType[]).map(pillar => (
                    <div key={pillar} className="flex items-center">
                        <span className={`inline-block w-3 h-3 mr-1.5 rounded-sm ${pillarBgColors[pillar]}`}></span>
                        <span className={`${pillarTextColors[pillar]}`}>{pillar}</span>
                    </div>
                ))}
                <div className="flex items-center align-center">
                    <span className="inline-block w-5 h-5 mr-1.5 rounded-sm bg-gray-200 flex items-center justify-center">🚌</span> Field Trip
                </div>
                <div className="flex items-center align-center">
                    <span className="inline-block w-5 h-5 mr-1.5 rounded-sm bg-gray-200 flex items-center justify-center">🎤</span> Guest Speaker
                </div>
            </div>

            {/* --- Schedule Grid --- */}
            <div className="overflow-x-auto shadow-lg rounded-lg border border-gray-300 bg-white">
                <table className="w-full border-collapse">
                    {/* Header Row */}
                    <thead className="sticky top-0 z-10 bg-gray-200 shadow-sm">
                        <tr>
                            <th className="w-16 flex-shrink-0 p-2 font-semibold border-r border-gray-300 text-sm text-gray-700">Week</th> {/* Corner cell */}
                            {daysOfWeek.map(day => (
                                <th key={day} className="flex-1 p-2 text-center font-semibold border-r border-gray-300 text-sm text-gray-700">{day}</th>
                            ))}
                        </tr>
                    </thead>
                    {/* Week Rows */}
                    <tbody>
                        {Array.from({ length: numWeeks }, (_, i) => i + 1).map(weekNum => (
                            <WeekRow
                                key={`week-${weekNum}`}
                                weekNum={weekNum}
                                daysOfWeek={daysOfWeek}
                                schedule={schedule} // Pass only the relevant part of the schedule?
                                onDropActivity={handleDropActivity}
                                onRemoveActivity={handleRemoveActivity}
                                onAddActivityRequest={handleAddActivityRequest}
                                onEditActivityRequest={handleEditActivityRequest}
                                onDragStartInitiated={closeAllModals} // Pass the closer function
                            />
                        ))}
                    </tbody>
                </table>
            </div>

            {/* --- Modals --- */}
            {showCreateForm && (
                <CreateActivityForm
                    targetDayId={showCreateForm}
                    onAddActivity={handleAddActivity}
                    onCancel={() => setShowCreateForm(null)}
                />
            )}

            {showEditForm && (
                <EditActivityForm
                    activity={showEditForm.activity}
                    dayId={showEditForm.dayId}
                    onUpdateActivity={handleUpdateActivity}
                    onCancel={() => setShowEditForm(null)}
                />
            )}

             {showActivityList && (
                <ActivityListModal
                    scheduleData={schedule}
                    onClose={() => setShowActivityList(false)}
                />
            )}

        </div>
    );
};

export default App;