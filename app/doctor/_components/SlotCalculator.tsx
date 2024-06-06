import React, { useState } from 'react';

type SlotCalculatorProps = {
    onAddTime: (time: string) => void;
};

const SlotCalculator: React.FC<SlotCalculatorProps> = ({ onAddTime }) => {
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');

    const generateSlots = () => {
        const slots = [];
        let current = new Date(`1970-01-01T${startTime}:00`);
        const end = new Date(`1970-01-01T${endTime}:00`);

        while (current <= end) {
            slots.push(current.toTimeString().slice(0, 5));
            current.setMinutes(current.getMinutes() + 30);
        }

        return slots;
    };

    const handleGenerateSlots = () => {
        const slots = generateSlots();
        slots.forEach(slot => onAddTime(slot));
    };

    return (
        <div className='flex flex-col space-y-4'>
            <input 
                type='time' 
                value={startTime} 
                onChange={(e) => setStartTime(e.target.value)} 
                className='border p-2'
            />
            <input 
                type='time' 
                value={endTime} 
                onChange={(e) => setEndTime(e.target.value)} 
                className='border p-2'
            />
            <button 
                onClick={handleGenerateSlots} 
                className='py-2 px-4 bg-black text-white rounded'
            >
                Generate Slots
            </button>
        </div>
    );
};

export default SlotCalculator;
