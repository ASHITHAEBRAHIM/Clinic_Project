import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'
import React from 'react'
import SlotCalculator from './SlotCalculator';
import { IoIosInformationCircleOutline } from "react-icons/io";
import Link from 'next/link';
import OverrideDetails from './OverrideDetails';

type SelectedProps = {
    day: string;
    handleAddTime: (time: string) => void;
    selectedTimes: string[];
    loading: boolean;
    handleSave: () => void;
    clearAll: () => void;
    handleRemoveItem: (i: number) => void;
};

export default function SelectedTimes({
    day,
    handleAddTime,
    selectedTimes,
    loading,
    handleSave,
    clearAll,
    handleRemoveItem}:SelectedProps) {

  return (
    <>
    <div className='grid grid-cols-1 sm:grid-cols-2 border-gray-200 dark:border-gray-600 shadow rounded-md divide-x divide-gray-200'>
            <div className='p-4'>
                <h2 className='font-semibold'>
                    Select your Times Available for this Day
                </h2>
                <div className='py-6'>
                <SlotCalculator onAddTime={handleAddTime} />
                </div>
            </div>
            <div className='p-4 font-semibold'>
                <h2>Here is your availability for {day}</h2>
                <div className='py-6 grid grid-cols-3 gap-3'>
                    {selectedTimes.map((time, i) => (
                        <button
                        onClick={()=>handleRemoveItem(i)}
                            key={i}
                            className='flex items-center justify-center py-2 px-2 border border-red-500 bg-blue-50 rounded-md text-sm'
                        >
                            <span>{time}</span>
                            <X className='w-3 h-3 ml-2' />
                        </button>
                    ))}
                </div>
                    <div className="flex justify-between">
                        <div className='text-white bg-black text-center'>
                            <Button onClick={handleSave} disabled={loading}>
                                {loading ? 'Saving...' : 'Save Settings'}
                            </Button>
                        </div>
                        <div className='text-white bg-black text-center'>
                            <Button onClick={clearAll}>
                                <span>Clear All</span>
                                <X className='w-3 h-3 ml-2' />
                            </Button>
                        </div>
                    </div>
            </div>
        </div>
          
        <div className='p-4'>
        <h2 className='font-semibold flex items-center'>
               Date overrides <IoIosInformationCircleOutline className='ml-2' />
        </h2>
        <p className='text-gray-600 mt-2'>
        Add dates when your availability changes from your daily hours.
        </p>
         </div>
         <OverrideDetails/>
         <div className='mt-4'>
         <Link href='/doctor/settings/override' className='border border-gray-200 mt-24 px-6 py-3'>
         + Add an override
         </Link>
         </div>
      </>
  )
}