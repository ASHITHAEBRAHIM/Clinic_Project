'use client'
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import { Stethoscope } from 'lucide-react';
import moment from 'moment';

interface AvailabilityData {
    user_id: string;
    [dayOfWeek: string]: string[] | string;
}

interface OverrideData {
    user_id: string;
    date: string;
    start_time: string;
    end_time: string;
    is_not_available: boolean;
}

const daysOfWeek = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

const getDateForDay = (day: string) => {
    const today = moment().startOf('day');
    const currentDayIndex = today.day();
    const targetDayIndex = daysOfWeek.indexOf(day.toLowerCase());

    let daysToAdd;
    if (targetDayIndex >= currentDayIndex) {
        daysToAdd = targetDayIndex - currentDayIndex;
    } else {
        daysToAdd = 7 - (currentDayIndex - targetDayIndex);
    }

    const targetDate = today.clone().add(daysToAdd, 'days');
    return targetDate.format('YYYY-MM-DD');
};

const DayAvailability = ({ day, date, doctors, currentDay }: { day: string, date: string, doctors: AvailabilityData[], currentDay: string }) => {
    return (
        <div className="mb-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {doctors.map((doctor, index) => (
                    Array.isArray(doctor[day]) && doctor[day].length > 0 && (
                        <div key={index} className='border border-gray-200 bg-white inline-flex flex-col py-2 px-4 rounded-md hover:border-gray-400 duration-300 transition-all'>
                            <Link href={`/patient/doctor/${doctor.user_id}/details`}>
                                <h2 className='uppercase font-bold text-lg tracking-widest'>Doctor Name</h2>
                                <p className='py-2'>Address</p>
                                <p>User ID: {doctor.user_id}</p>
                                <div className='flex items-center gap-2 py-2'>
                                    Doctor Image 
                                    <div className='flex flex-col gap-1'>
                                        <p className='flex items-center'>
                                            <Stethoscope className='w-4 h-4 mr-2 flex-shrink-0'/>
                                            <span>Service</span>
                                        </p>
                                        {currentDay === day && (
                                            <p className='bg-green-200 py-1 px-2 uppercase'>
                                                Available Today
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </Link>
                            <div className='pt-2 border-t border-gray-400'>
                                <h3 className='flex gap-2 justify-between items-center'>
                                    <span className='text-gray-600'>{day.charAt(0).toUpperCase() + day.slice(1)} - {moment(date).format('MMMM Do, YYYY')}</span>
                                    <span className='font-bold'>Price</span>
                                </h3>
                                <div className='py-2 grid grid-cols-2 gap-2'>
                                    {doctor[day].slice(0, 5).map((time: string, timeIndex: number) => (
                                        <Link key={timeIndex} href='' className='bg-blue-600 text-white py-1 px-2'>
                                            {time}
                                        </Link>
                                    ))}
                                    {doctor[day].length > 5 && (
                                        <Link className='bg-blue-900 text-white py-1 px-2' href={`/patient/doctor/${doctor.user_id}/details`}>More</Link>
                                    )}
                                </div>
                            </div>
                        </div>
                    )
                ))}
            </div>
        </div>
    );
}

export default function DoctorList() {
    const [doctors, setDoctors] = useState<AvailabilityData[]>([]);
    const [overrides, setOverrides] = useState<OverrideData[]>([]);
    const [currentDay, setCurrentDay] = useState<string>('');

    useEffect(() => {
        const fetchDoctorsAndOverrides = async () => {
            const supabase = createClient();

            const { data: availabilityData, error: availabilityError } = await supabase
                .from("availability")
                .select("*");

            if (availabilityError) {
                console.error("Error fetching availability data:", availabilityError);
                return;
            }

            const { data: overrideData, error: overrideError } = await supabase
                .from("overrides")
                .select("*");

            if (overrideError) {
                console.error("Error fetching override data:", overrideError);
                return;
            }

            const localDoctors = availabilityData.map((doctor: AvailabilityData) => {
                const localTimes: AvailabilityData = { ...doctor };
                Object.keys(localTimes).forEach((day) => {
                    if (Array.isArray(localTimes[day])) {
                        localTimes[day] = localTimes[day].map((time: string) => {
                            const localTime = moment.utc(time).local();
                            return localTime.format('h:mm A');
                        });
                    }
                });
                return localTimes;
            });

            setDoctors(localDoctors);
            setOverrides(overrideData);

            const dayOfWeek = moment().format('dddd').toLowerCase();
            setCurrentDay(dayOfWeek);
        };

        fetchDoctorsAndOverrides();
    }, []);

    const getFilteredDoctors = (day: string, date: string) => {
        return doctors.filter(doctor => {
            const doctorOverrides = overrides.filter(override => override.user_id === doctor.user_id && override.date === date);
            if (doctorOverrides.some(override => override.is_not_available)) {
                return false;
            }
            if (doctorOverrides.length > 0) {
                doctor[day] = doctorOverrides.map(override => {
                    const startTime = moment.utc(override.start_time, 'HH:mm').local().format('h:mm A');
                    const endTime = moment.utc(override.end_time, 'HH:mm').local().format('h:mm A');
                    return `${startTime}-${endTime}` ;
                });
            }
            return true;
        });
    };

    const sortedDaysOfWeek = (() => {
        const todayIndex = moment().day();
        return [
            ...daysOfWeek.slice(todayIndex),
            ...daysOfWeek.slice(0, todayIndex),
        ];
    })();

    return (
        <div>
            {sortedDaysOfWeek.map(day => (
                <DayAvailability key={day} day={day} date={getDateForDay(day)} doctors={getFilteredDoctors(day, getDateForDay(day))} currentDay={currentDay} />
            ))}
        </div>
    );
}
