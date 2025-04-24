import React, { FC } from 'react';
import { WeekRowProps } from '../types'; // Import necessary types
import DayCell from './DayCell'; // Import the DayCell component

// Week Row Component
const WeekRow: FC<WeekRowProps> = ({
    weekNum,        // Renamed from weekNumber
    schedule,       // Renamed from weekData
    daysOfWeek,
    onDropActivity,
    onRemoveActivity,
    onAddActivityRequest,
    onEditActivityRequest,
    onDragStartInitiated // Added prop
}) => {
    return (
        <tr className="week-row border-b border-gray-300"> 
            {/* Week Number Cell */}
            <td className="w-16 flex-shrink-0 p-2 font-bold text-center align-middle bg-gray-100 border-r border-gray-300">Wk {weekNum}</td> 
            {/* Day Cells */}
            {daysOfWeek.map(day => {
                const dayId = `W${weekNum}-${day}`;
                const activities = schedule[dayId] || []; // Use renamed 'schedule'
                return (
                    <td key={dayId} className="border border-gray-300 align-top min-w-[150px]"> 
                        <DayCell
                            dayId={dayId}
                            activities={activities}
                            onDropActivity={onDropActivity}
                            onRemoveActivity={onRemoveActivity}
                            onAddActivityRequest={onAddActivityRequest} // Pass down handler
                            onEditActivityRequest={onEditActivityRequest} // Pass down handler
                            onDragStartInitiated={onDragStartInitiated} // Pass down the new handler
                        />
                    </td>
                );
            })}
        </tr> 
    );
};

export default WeekRow;
