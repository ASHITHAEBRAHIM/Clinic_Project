'use client'
import React, { useEffect, useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css'; 
import { Trash } from 'lucide-react'; 
import { Label } from '@/components/ui/label';
import { Button } from 'flowbite-react';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import moment from 'moment';
import { createClient } from '@/utils/supabase/client';
import toast from 'react-hot-toast';

const Override = () => {
    const [startTimes, setStartTimes] = useState<string[]>(['']);
    const [endTimes, setEndTimes] = useState<string[]>(['']);
    const [isNotAvailable, setIsNotAvailable] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
    const [overrideId,setOverrideId] = useState("");

    const initializeTimes = (startTime: string, endTime: string) => {
        setStartTimes([moment.utc(startTime, 'HH:mm').local().format('HH:mm')]);
        setEndTimes([moment.utc(endTime, 'HH:mm').local().format('HH:mm')]);
    };

    useEffect(() => {
        const pathParts = window.location.pathname.split('/');
        const id = pathParts[pathParts.length - 1];
        setOverrideId(id);

        const fetchOverrides = async (id: string) => {
            try {
                const supabase = createClient();
                const { data: overrideData, error: overrideError } = await supabase
                    .from("overrides")
                    .select("*")
                    .eq("id", id);

                if (overrideError) {
                    console.error("Error fetching override data:", overrideError);
                    return;
                }

                if (!overrideData) return;

                if (Array.isArray(overrideData) && overrideData.length > 0) {
                    const override = overrideData[0]; 
                    const startTime = override.start_time;
                    const endTime = override.end_time;

                    setSelectedDate(new Date(override.date));
                    initializeTimes(startTime, endTime);
                    setIsNotAvailable(override.is_not_available);
                }
            } catch (error) {
                console.error('Error fetching overrides:', error);
            }
        };

        if (overrideId) {
            fetchOverrides(overrideId);
        }
    }, [overrideId]);
    

    const handleDayClick = (day: Date) => {
        setSelectedDate(day);
    };

    const handleDeleteSlot = (index: number) => {
        const updatedStartTimes = [...startTimes];
        const updatedEndTimes = [...endTimes];
        updatedStartTimes.splice(index, 1);
        updatedEndTimes.splice(index, 1);
        setStartTimes(updatedStartTimes);
        setEndTimes(updatedEndTimes);
    };

    const handleStartTimeChange = (index: number, value: string) => {
        const updatedStartTimes = [...startTimes];
        updatedStartTimes[index] = value;
        setStartTimes(updatedStartTimes);
    };

    const handleEndTimeChange = (index: number, value: string) => {
        const updatedEndTimes = [...endTimes];
        updatedEndTimes[index] = value;
        setEndTimes(updatedEndTimes);
    };

    const disabledDays = {
        before: new Date(),
    };

    const modifiers = selectedDate ? { selected: selectedDate } : undefined;

    const updateOverride = async (overrideId: string, selectedDate: Date, startTime: string, endTime: string, isNotAvailable: boolean) => {
        try {
            const supabase = createClient();
            const date = moment(selectedDate).format('YYYY-MM-DD');
    
            const convertToUTC = (time: string) => {
                const [hours, minutes, period] = time.split(/[.: ]/);
                const adjustedHours = hours === '12' ? 0 : parseInt(hours) + (period === 'PM' ? 12 : 0);
                const minutesNumber = parseInt(minutes);
                const localTime = moment().set({ hours: adjustedHours, minutes: minutesNumber });
                const utcTime = moment.utc(localTime).format('HH:mm');
                return utcTime;
            };
    
            const startUtc = convertToUTC(startTime);
            const endUtc = convertToUTC(endTime);
    
            const { data, error } = await supabase.from('overrides').update({
                start_time: startUtc,
                end_time: endUtc,
                is_not_available: isNotAvailable,
            }).eq('id', overrideId).eq('date', date); 
    
            if (error) {
                throw error;
            }
    
            toast.success("Date Overrides updated successfully");
            console.log('Override updated successfully:', data);
        } catch (error) {
            console.error('Error updating override:', error);
        }
    };
    
    const handleUpdateOverride = async (index: number) => {
        if (!selectedDate) {
            return;
        }
        if (isNotAvailable) {
            await updateOverride(overrideId, selectedDate, "", "", true);
        } else {
            const startTime = startTimes[index]; 
            const endTime = endTimes[index]; 
    
            await updateOverride(overrideId, selectedDate, startTime, endTime, false);
        }
    };
    
    return (
        <Card>
        <CardContent>
        <div className='flex flex-col items-center text-black mt-24'>
        <div className='flex justify-center'>
        <div className='sm:col-span-1 col-span-full border-r border-gray-400'>
        <div className='mb-4'>
        <Label className='text-xl font-bold m-8'>Select the dates to override</Label>
        </div>
        <DayPicker
        mode="single"
        selected={selectedDate}
        onDayClick={handleDayClick}
        modifiers={modifiers}
        modifiersStyles={{
        selected: {
        backgroundColor: 'black',
        color: 'white',
        },
        }}
        disabled={disabledDays}
        className="rounded-md border"
        />
        </div>

        <div className='sm:col-span-1 col-span-full'>
        <div className='px-2'>
        <h2 className='text-gray-500 text-xl text-start py-3 px-4'>
        Which hours are you free?
        </h2>
        {isNotAvailable ? (
          <Input placeholder='Unavailable for all days' className='border-gray-400 text-gray-600 mx-4 mb-2'/>
        ) : (
        <>
        <div className='flex flex-col px-4 py-2 gap-2 items-center'>
       {startTimes.map((startTime, index) => (
       <div key={index} className='flex items-center gap-2'>
       <input
       type='time'
       value={startTime}
       onChange={(e) => handleStartTimeChange(index, e.target.value)}
       className='border p-2'
       />
       <span className='mx-2'> - </span>
       <input
       type='time'
       value={endTimes[index]}
       onChange={(e) => handleEndTimeChange(index, e.target.value)}
       className='border p-2'
       />
       <Button onClick={() => handleDeleteSlot(index)} className='text-black bg-transparent'>
       <Trash />
       </Button>
       </div>
       ))}
       </div>
       </>
       )}
       <div className='flex items-center py-2 px-4'>
       <input
       type='checkbox'
       id='availability-toggle'
       className='hidden'
       checked={isNotAvailable}
       onChange={(e) => setIsNotAvailable(e.target.checked)}
       />
       <label htmlFor='availability-toggle' className={`w-10 h-6 rounded-full relative cursor-pointer ${isNotAvailable ? 'bg-black' : 'bg-gray-300'}`}>
       <span className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform transform ${isNotAvailable ? 'translate-x-4' : ''}`}></span>
       </label>
       <label className='ml-2'>Mark unavailable (All day)</label>
       </div>
       </div>
       </div>
       </div>
       </div>
       <div className='flex items-center justify-end py-2 px-4'>
       <Link href='/doctor/settings' className='mr-2 text-black'>Close</Link>
       {selectedDate && (
       startTimes.map((startTime, index) => (
       <button key={index} onClick={() => handleUpdateOverride(index)} className='text-white bg-black mx-4 px-6 py-3 rounded'>Update Override</button>
       ))
       )}
       </div>
       </CardContent>
       </Card>
    );
}

export default Override;
