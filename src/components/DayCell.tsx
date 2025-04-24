import React, { FC, DragEvent } from 'react';
import { DayCellProps, Activity } from '../types'; // Import necessary types
import ActivityTag from './ActivityTag'; // Import the ActivityTag component

// Day Cell Component
const DayCell: FC<DayCellProps> = ({
    dayId,
    activities,
    onDropActivity,
    onRemoveActivity,
    onAddActivityRequest,
    onEditActivityRequest,
    onDragStartInitiated // Added prop
}) => {

    const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault(); // Necessary to allow dropping
        e.dataTransfer.dropEffect = 'move';
        // Optional: Add a visual indicator for droppable area
        e.currentTarget.classList.add('bg-gray-200', 'border-dashed');
    };

    const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
        // Remove visual indicator when dragging out
        e.currentTarget.classList.remove('bg-gray-200', 'border-dashed');
    };

    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.currentTarget.classList.remove('bg-gray-200', 'border-dashed'); // Clean up visual indicator
        const activityId = e.dataTransfer.getData('activityId');
        const sourceDayId = e.dataTransfer.getData('sourceDayId');

        if (activityId && sourceDayId && sourceDayId !== dayId) {
            onDropActivity(dayId, activityId, sourceDayId);
        }
    };

    const handleAddClick = () => {
        onAddActivityRequest(dayId); // Signal App to show the create form for this day
    };

    // Extract week number and day name for display
    const [weekNum, dayName] = dayId.split('-');

    return (
        <div
            className="day-cell-content p-2 h-48 relative transition-colors duration-150" // Moved border/sizing classes to WeekRow
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-sm text-gray-600">{dayName}</span>
                <button
                    onClick={handleAddClick}
                    className="add-activity-btn bg-blue-500 hover:bg-blue-700 text-white text-xs font-bold py-1 px-1 rounded-full flex items-center justify-center leading-none w-4 h-4"
                    title={`Add activity to ${dayName}`}
                    aria-label={`Add activity to ${dayName}`}
                >
                    +
                </button>
            </div>
            <div className="activities-container min-h-[100px]">
                {activities.length > 0 ? (
                    activities.map(activity => (
                        <ActivityTag
                            key={activity.id}
                            activity={activity}
                            dayId={dayId}
                            onRemoveActivity={onRemoveActivity}
                            onEditActivityRequest={onEditActivityRequest} // Pass down the handler
                            onDragStartInitiated={onDragStartInitiated} // Pass down the drag start handler
                        />
                    ))
                ) : (
                    <div className="text-center text-gray-400 text-xs pt-4">Empty</div>
                )}
            </div>
        </div>
    );
};

export default DayCell;
