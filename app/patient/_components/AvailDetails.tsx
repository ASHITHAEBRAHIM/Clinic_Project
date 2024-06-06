'use client'
import React, { useEffect, useState } from 'react';
import { Calendar } from "@/components/ui/calendar";
import { createClient } from '@/utils/supabase/client';
import moment from 'moment';
import ConfirmationModal from './ConfirmationModal';
import { useOrigin } from '@/lib/useOrigin';
import toast from 'react-hot-toast';

type SelectSingleEventHandler = (date: Date | undefined) => void;

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

function generateMeetingId(): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const length = 9;
  let result = '';
  for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
      if ((i + 1) % 3 === 0 && i !== length - 1) { 
          result += '-';
      }
  }
  return result;
}

export default function AvailDetails() {

  const [bookDate, setBookDate] = useState<Date | undefined>(new Date());
  const [selectedDay, setSelectedDay] = useState<string | undefined>();
  const [selectedTime, setSelectedTime] = useState<string | undefined>();

  const [availability, setAvailability] = useState<string[]>([]);
  const [currentWeekDates, setCurrentWeekDates] = useState<Date[]>([]);
  const [overrides, setOverrides] = useState<OverrideData[]>([]);

  const [showConfirmationModal, setShowConfirmationModal] = useState<boolean>(false);

  const [userData, setUserData] = useState<any | null>(null);
  const [doctorId, setDoctorId] = useState("");

  const origin = useOrigin();
  const [inviteURL, setInviteURL] = useState("");
  const [showMeetingInfo, setShowMeetingInfo] = useState(false);

  useEffect(() => {
    const pathParts = window.location.pathname.split('/')
    const doc_id = pathParts[pathParts.length - 2]
    setDoctorId(doc_id)

    const fetchDoctorsAvailability = async (doc_id:string) => {
      const supabase = createClient();
      const { data: availabilityData, error: availabilityError } = await supabase
        .from("availability")
        .select("*") 
        .eq("user_id", doc_id);

      if (availabilityError) {
        console.error("Error fetching availability data:", availabilityError);
        return;
      }

      const { data: overrideData, error: overrideError } = await supabase
      .from("overrides")
      .select("*")
      .eq("user_id", doc_id);

      if (overrideError) {
        console.error("Error fetching override data:", overrideError);
        return;
      }

      setOverrides(overrideData);

      if (!bookDate) return;

      const selectedDayOfWeek = moment(bookDate).format('dddd').toLowerCase(); 
      const isDateInCurrentWeek = currentWeekDates.some(date => moment(date).isSame(bookDate, 'day'));

      const overrideTimesForSelectedDate = overrides
        .filter(override => moment(override.date).isSame(bookDate, 'day'))
        .flatMap(override => {
          if (override.is_not_available) {
            return ['Not Available'];
          } else {
            const startTime = moment.utc(override.start_time, 'HH:mm');
            const endTime = moment.utc(override.end_time, 'HH:mm');
            const times = [];
            while (startTime < endTime) {
              times.push(startTime.local().format('h:mm A'));
              startTime.add(30, 'minutes');
            }
            return times;
          }
        });

      if (overrideTimesForSelectedDate.length > 0) {
        setAvailability(overrideTimesForSelectedDate);
      } else {
        if (isDateInCurrentWeek) {
          const selectedAvailability = availabilityData.find(entry => entry[selectedDayOfWeek as keyof AvailabilityData]);
          if (selectedAvailability) {
            const times = selectedAvailability[selectedDayOfWeek as keyof AvailabilityData];
            const localTimes = Array.isArray(times) ? times.map(time => moment.utc(time).local().format('h:mm A')) : [];
            setAvailability(localTimes);
          } else {
            setAvailability([]);
          }
        } else {
          setAvailability([]);
        }
      }

      setSelectedDay(selectedDayOfWeek); 
    };

    fetchDoctorsAvailability(doc_id);
  }, [bookDate, currentWeekDates]);

  useEffect(() => {
    const getWeekDates = () => {
      const today = moment().startOf('day');
      const weekDates = [];

      for (let i = 0; i < 7; i++) {
        weekDates.push(today.clone().add(i, 'days').toDate());
      }

      setCurrentWeekDates(weekDates);
    };
    getWeekDates();
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
          const supabase = createClient();
          const { data, error } = await supabase.auth.getUser();
          if (error) {
              throw error;
          }
          if (data && data.user) {
              setUserData(data.user.id);
          }
      } catch (error) {
          console.error('Error fetching user ID:', error);
      }
    };
    fetchUserData();
  }, []);

  useEffect(() => {
    const bookAppointment = async () => {
      if (!inviteURL) return;
      try {
        if (!userData) {
          throw new Error('User data not available');
        }
        const supabase = createClient();
        
        const { data, error } = await supabase.from('booking').insert([
          {
            pat_id: userData, 
            doc_id: doctorId,
            book_date: moment(bookDate).format('YYYY-MM-DD'),
            book_time: selectedTime,
            invite_URL: inviteURL
          }
        ]);
        console.log(userData, doctorId, moment(bookDate).format('YYYY-MM-DD'), selectedTime, inviteURL)
        if (error) {
          throw error;
        }
    
        console.log('Appointment booked successfully:', data);
    
        setShowConfirmationModal(false);
        setSelectedTime(undefined);
        setShowMeetingInfo(true); 
    
      } catch (error) {
        console.error('Error booking appointment:', error);
        toast.error('Error booking appointment');
      }
    };

    bookAppointment();
  }, [inviteURL]);

  const handleSelectDate: SelectSingleEventHandler = (date) => {
    if (date instanceof Date) {
      setBookDate(date);
      setSelectedTime(undefined);
    }
  };

  const handleSelectTime = (time: string) => {
    setSelectedTime(time);
  };

  const handleBookAppointment = async () => {
    if (!selectedTime) {
      toast.error('Please select the time');
      return;
    }
  
    try {
      const formattedDate = moment(bookDate).format('YYYY-MM-DD');
      const supabase = createClient();
      const { data: bookingsData, error: bookingsError } = await supabase
        .from("booking")
        .select("book_time")
        .eq("book_date", formattedDate)
        .eq("book_time", selectedTime)
        .eq("doc_id", doctorId); 
  
      if (bookingsError) {
        console.error("Error fetching booked times data:", bookingsError);
        toast.error('Error checking booked times. Please try again.');
        return;
      }
  
      if (bookingsData && bookingsData.length > 0) {
        toast.error('Selected time is already booked. Please choose another time.');
      } else {
        setShowConfirmationModal(true);
        setBookDate(bookDate); 
      }
    } catch (error) {
      console.error('Error checking booked times:', error);
      toast.error('Error checking booked times. Please try again.');
    }
  };
  
  const handleConfirmBooking = () => {
    const meetingId = generateMeetingId(); 
    const url = `${origin}/meet/${meetingId}`;
    setInviteURL(url); 
  };

  const handleCloseModal = () => {
    setShowConfirmationModal(false);
  };

  return (
    <div className='text-black'>
      <h2 className='font-bold py-4 text-xl uppercase text-slate-500 tracking-wider'>Select a Date and Time</h2>
      <div className='grid grid-cols-2'>
        <div className='sm:col-span-1 col-span-full'>
          <Calendar
            mode="single"
            selected={bookDate}
            onSelect={handleSelectDate}
            className="rounded-md border"
          />
        </div>
        <div className='sm:col-span-1 col-span-full'>
          <div className='px-4'>
            <h2 className='pb-4 text-blue-700 text-center py-3 px-4 border border-blue-500'>
              {bookDate ? `${moment(bookDate).format('MMMM Do, YYYY')} - ${selectedDay}` : 'Select a date to display'}
            </h2>
            <div className='py-2 grid grid-cols-2 gap-2'>
              {availability.length > 0 ? (
                availability.map((time, index) => (
                  <div key={index}
                  className={`py-1 px-2 cursor-pointer ${time === selectedTime ? 'bg-green-500 text-white' : 'bg-blue-600 text-white'}`}
                  onClick={() => handleSelectTime(time)}>
                    {time}
                  </div>
                ))
              ): (
                <div className='text-red-500 font-bold text-center'>Not Available</div>
              )}
            </div>
            {availability.length > 0 && (
              <button className='bg-black text-white w-full mt-4 py-2 rounded'
              onClick={handleBookAppointment}>
                + Book
              </button>
            )}
          </div>
        </div>
      </div>
      <ConfirmationModal 
        isOpen={showConfirmationModal} 
        onClose={handleCloseModal} 
        onConfirm={handleConfirmBooking} 
        selectedDate={bookDate}
        selectedTime={selectedTime}
        inviteURL={inviteURL} 
        showMeetingInfo={showMeetingInfo} 
        setShowMeetingInfo={setShowMeetingInfo} 
      />
    </div>
  );
}
