import { FC } from 'react';
import { Activity, ActivityListModalProps } from '../types'; // Import necessary types

// Helper to sort activities: Field trips last, then alphabetically by name
const sortActivities = (a: Activity, b: Activity): number => {
    if (a.isFieldTrip && !b.isFieldTrip) return 1; // a is field trip, b is not -> b comes first
    if (!a.isFieldTrip && b.isFieldTrip) return -1; // b is field trip, a is not -> a comes first
    return a.name.localeCompare(b.name); // Both same type, sort by name
};

// Helper to group activities by pillar
const groupActivitiesByPillar = (activities: Activity[]): { [pillar: string]: Activity[] } => {
    return activities.reduce((acc, activity) => {
        const pillar = activity.pillar;
        if (!acc[pillar]) {
            acc[pillar] = [];
        }
        acc[pillar].push(activity);
        // Sort activities within each pillar group
        acc[pillar].sort(sortActivities);
        return acc;
    }, {} as { [pillar: string]: Activity[] });
};

// Activity List Modal Component
const ActivityListModal: FC<ActivityListModalProps> = ({ scheduleData, onClose }) => {

    // Combine all activities from all days into a single list
    const allActivities = Object.values(scheduleData).flat();

    // Group activities by pillar
    const groupedActivities = groupActivitiesByPillar(allActivities);

    // Define the order of pillars for display
    const pillarOrder: Activity['pillar'][] = ['Ser', 'Pensar', 'Hacer', 'Social'];

    return (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 overflow-y-auto h-full w-full z-50 flex justify-center items-start pt-10">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-4xl w-full mx-4 my-8 relative">
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 text-2xl font-bold"
                    aria-label="Close modal"
                >
                    &times;
                </button>
                <h2 className="text-2xl font-bold mb-6 text-center">Complete Activity List</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
                    {pillarOrder.map(pillar => (
                        <div key={pillar} className="border rounded-lg p-3 bg-gray-50 min-w-0 overflow-hidden">
                            <h3 className="text-lg font-semibold mb-3 border-b pb-1 capitalize text-center">{pillar}</h3>
                            {groupedActivities[pillar] && groupedActivities[pillar].length > 0 ? (
                                <ul className="space-y-2">
                                    {groupedActivities[pillar].map(activity => (
                                        <li key={activity.id} className="text-sm p-1.5 bg-white rounded shadow-sm border border-gray-200 overflow-hidden">
                                            <span className="font-medium">{activity.name}</span>
                                            {activity.isFieldTrip && <span className="ml-1 text-xs flex-shrink-0" title="Field Trip">🚌</span>}
                                            {activity.guestSpeaker && <span className="ml-1 text-xs flex-shrink-0" title="Guest Speaker">🎤</span>}
                                            <p className="text-xs text-gray-600 mt-0.5 break-words">{activity.description}</p>
                                            {activity.skills && activity.skills.length > 0 && (
                                                <div className="mt-1 text-xs flex flex-wrap gap-1">
                                                    <span className="text-gray-500">Skills:</span>
                                                    {activity.skills.map((skill, i) => (
                                                         <span key={i} className="ml-1 bg-gray-200 px-1.5 py-0.5 rounded-full text-gray-700">{skill}</span>
                                                    ))}
                                                </div>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-gray-500 italic text-center">No activities</p>
                            )}
                        </div>
                    ))}
                </div>

                <div className="mt-6 text-center">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ActivityListModal;
