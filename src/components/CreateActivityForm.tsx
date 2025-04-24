import React, { useState, FC, ChangeEvent, FormEvent } from 'react';
import { Activity, PillarType, CreateActivityFormProps } from '../types'; // Import necessary types
import { generateId } from '../dataUtils'; // Import ID generator

// Create Activity Form Component
const CreateActivityForm: FC<CreateActivityFormProps> = ({ targetDayId, onAddActivity, onCancel }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [pillar, setPillar] = useState<PillarType>('Pensar'); // Default pillar
    const [isFieldTrip, setIsFieldTrip] = useState(false);
    const [skills, setSkills] = useState(''); // Store skills as a comma-separated string for input

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!name.trim()) {
            alert('Activity name cannot be empty.'); // Basic validation
            return;
        }

        const newActivity: Activity = {
            id: generateId(), // Generate a unique ID
            name: name.trim(),
            description: description.trim(),
            pillar,
            isFieldTrip,
            // Convert comma-separated string to array, trimming whitespace and removing empty strings
            skills: skills.split(',').map(s => s.trim()).filter(s => s !== ''),
        };
        onAddActivity(targetDayId, newActivity);
        // Optionally reset form fields here or expect the parent to close the form
        // onCancel(); // Call cancel to close the form after submission
    };

    const pillarOptions: PillarType[] = ['Ser', 'Pensar', 'Hacer', 'Social'];

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-40 flex justify-center items-center">
            <form
                onSubmit={handleSubmit}
                className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4"
            >
                <h3 className="text-lg font-semibold mb-4">Add New Activity to {targetDayId}</h3>

                <div className="mb-4">
                    <label htmlFor="activity-name" className="block text-sm font-medium text-gray-700 mb-1">Name*</label>
                    <input
                        id="activity-name"
                        type="text"
                        value={name}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        required
                    />
                </div>

                <div className="mb-4">
                    <label htmlFor="activity-desc" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                        id="activity-desc"
                        value={description}
                        onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
                        rows={3}
                        className="w-full p-2 border border-gray-300 rounded shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                <div className="mb-4">
                    <label htmlFor="activity-pillar" className="block text-sm font-medium text-gray-700 mb-1">Pillar</label>
                    <select
                        id="activity-pillar"
                        value={pillar}
                        onChange={(e: ChangeEvent<HTMLSelectElement>) => setPillar(e.target.value as PillarType)}
                        className="w-full p-2 border border-gray-300 rounded bg-white shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    >
                        {pillarOptions.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                </div>

                 <div className="mb-4">
                    <label htmlFor="activity-skills" className="block text-sm font-medium text-gray-700 mb-1">Skills (comma-separated)</label>
                    <input
                        id="activity-skills"
                        type="text"
                        value={skills}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setSkills(e.target.value)}
                        placeholder="e.g., teamwork, coding, design"
                        className="w-full p-2 border border-gray-300 rounded shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                <div className="mb-6">
                    <label className="flex items-center">
                        <input
                            type="checkbox"
                            checked={isFieldTrip}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => setIsFieldTrip(e.target.checked)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-2"
                        />
                        <span className="text-sm text-gray-700">Is Field Trip? 🚌</span>
                    </label>
                </div>

                <div className="flex justify-end space-x-3">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        Add Activity
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateActivityForm;
