import React, { useState, useRef, FC, DragEvent, MouseEvent } from 'react';
import { Activity, ActivityTagProps } from '../types'; // Import necessary types

// Mapping from pillar to Tailwind CSS background color classes
// Exported for use in Legend
export const pillarBgColors: { [key in Activity['pillar']]: string } = {
    Ser: 'bg-green-200',    // Changed from blue-200
    Pensar: 'bg-blue-200',   // Changed from green-200
    Hacer: 'bg-red-200',      // Changed from yellow-200
    Social: 'bg-purple-200',
};

// Mapping from pillar to Tailwind CSS text color classes
// Exported for use in Legend
export const pillarTextColors: { [key in Activity['pillar']]: string } = {
    Ser: 'text-green-800',   // Changed from blue-800
    Pensar: 'text-blue-800',  // Changed from green-800
    Hacer: 'text-red-800',     // Changed from yellow-800
    Social: 'text-purple-800',
};

// Activity Tag Component
const ActivityTag: FC<ActivityTagProps> = ({
    activity,
    dayId,
    onRemoveActivity,
    onEditActivityRequest,
    onDragStartInitiated // Added prop
}) => {
    const [isHovered, setIsHovered] = useState(false);
    const [showTooltip, setShowTooltip] = useState(false);
    const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
    const tooltipTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const handleDragStart = (e: DragEvent<HTMLDivElement>) => {
        onDragStartInitiated(); // Close modals first
        e.dataTransfer.setData('activityId', activity.id);
        e.dataTransfer.setData('sourceDayId', dayId);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleRemoveClick = (e: MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation(); // Prevent triggering drag or other parent events
        onRemoveActivity(dayId, activity.id);
    };

    const handleEditClick = (e: MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation(); // Prevent triggering drag or other parent events
        onEditActivityRequest(activity, dayId); // Pass the full activity and dayId
    };

    const handleMouseEnter = () => {
        setIsHovered(true);
        // Clear any existing timeout
        if (tooltipTimeoutRef.current) {
            clearTimeout(tooltipTimeoutRef.current);
        }
        // Set a timeout to show the tooltip after a short delay
        tooltipTimeoutRef.current = setTimeout(() => {
            setShowTooltip(true);
        }, 750); // 750ms delay
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
        // Clear the timeout if the mouse leaves before the delay is over
        if (tooltipTimeoutRef.current) {
            clearTimeout(tooltipTimeoutRef.current);
            tooltipTimeoutRef.current = null;
        }
        // Hide the tooltip immediately
        setShowTooltip(false);
    };

    const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
        // Update tooltip position relative to the viewport
        setTooltipPosition({ x: e.clientX + 15, y: e.clientY + 15 });
    };

    const bgColor = pillarBgColors[activity.pillar] || 'bg-gray-200'; // Fallback color
    const textColor = pillarTextColors[activity.pillar] || 'text-gray-800';

    return (
        <div
            draggable
            onDragStart={handleDragStart}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onMouseMove={handleMouseMove}
            className={`${bgColor} ${textColor} p-1.5 rounded-md mb-1 text-xs cursor-grab relative shadow-sm hover:shadow-md transition-shadow duration-150 flex justify-between items-center min-h-[40px]`}
            title={activity.description} // Use standard title for basic hover info
        >
            <div className="flex-grow pr-1">
                {/* Activity Name and Icons */}
                <div className="flex items-center flex-wrap text-left">
                    <span className="font-semibold text-left mr-1">{activity.name}</span>
                    {activity.isFieldTrip && <span className="text-xs ml-1" title="Field Trip">🚌</span>}
                    {activity.guestSpeaker && <span className="text-xs ml-1" title="Guest Speaker">🎤</span>}
                </div>
            </div>

            {/* Action Buttons - visible on hover */}
            {isHovered && (
                <div className="absolute top-0 right-0 flex bg-opacity-80 bg-gray-300 rounded-bl-md p-0.5 space-x-0.5">
                    <button
                        onClick={handleEditClick}
                        className="text-blue-600 hover:text-blue-800 p-0.5 rounded text-xxs"
                        aria-label="Edit activity"
                    >
                        ✏️
                    </button>
                    <button
                        onClick={handleRemoveClick}
                        className="text-red-500 hover:text-red-700 p-0.5 rounded text-xxs"
                        aria-label="Remove activity"
                    >
                        🗑️
                    </button>
                </div>
            )}

            {/* Enhanced Tooltip - shown after delay */}
            {showTooltip && (
                <div
                    style={{ top: `${tooltipPosition.y}px`, left: `${tooltipPosition.x}px` }}
                    className="fixed z-50 p-2 text-sm text-white bg-gray-800 rounded-md shadow-lg max-w-xs break-words"
                    role="tooltip"
                >
                    <h4 className="font-bold mb-1">{activity.name} {activity.isFieldTrip && '🚌'} ({activity.pillar})</h4>
                    <p className="mb-1 text-gray-300">{activity.description || 'No description provided.'}</p>
                    {activity.skills && activity.skills.length > 0 && (
                        <div className="mt-1 pt-1 border-t border-gray-600">
                            <span className="text-gray-400 text-xs">Skills: </span>
                            {activity.skills.map((skill, index) => (
                                <span key={index} className="inline-block bg-gray-600 rounded-full px-2 py-0.5 text-xs font-semibold text-gray-200 mr-1 mb-1">
                                    {skill}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ActivityTag;
