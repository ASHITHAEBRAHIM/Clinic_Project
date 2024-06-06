import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";
import { Plus, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import toast from "react-hot-toast";
import SelectedTimes from "./SelectedTimes";
import moment from 'moment';

type Props = {
    upsertAvailability: (day: 'monday', times: string[]) => Promise<any>;
};

const Monday: React.FC<Props> = ({ upsertAvailability }) => {

    const [selectedTimes, setSelectedTimes] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);

    useEffect(() => {
        const fetchUserIdAndAvailability = async () => {
            try {
                const supabase = createClient();
                const { data: userData, error: userError } = await supabase.auth.getUser();
                if (userError) {
                    throw userError;
                }
                if (userData && userData.user) {
                    const userId = userData.user.id;
                    setUserId(userId);

                    const { data, error } = await supabase
                        .from('availability')
                        .select('monday')
                        .eq('user_id', userId)
                        .single();
                    if (error) {
                        throw error;
                    }
                    if (data) {
                        const storedTimes = data.monday.map((utcTime: string) => {
                            const localTime = moment.utc(utcTime).local(); // Convert UTC time to local time
                            const hours = localTime.hours();
                            const minutes = localTime.minutes().toString().padStart(2, '0');
                            const period = hours >= 12 ? 'PM' : 'AM';
                            const formattedHours = (hours % 12 || 12).toString(); 
                            return `${formattedHours}.${minutes} ${period}`;
                        });
                        setSelectedTimes(storedTimes);
                    }
                }
            } catch (error) {
                console.error('Error fetching user ID or availability:', error);
            }
        };

        fetchUserIdAndAvailability();
    }, []);

    const handleAddTime = (time: string) => {
        if (!selectedTimes.includes(time)) {
            setSelectedTimes((prevTimes) => [...prevTimes, time]);
        } else {
            toast.error(`${time} already added!`);
        }
    };

    const handleRemoveItem = (index:number) => {
        const updatedTimes = selectedTimes.filter((_,i) => i!==index)
        setSelectedTimes(updatedTimes)
    };

    const clearAll = () => {
        setSelectedTimes([]);
    };

    const handleSave = async () => {
        if (!userId) {
            toast.error('User ID not found. Please try again.');
            return;
        }

        setLoading(true);
        try {
            const selectedTimesUTC = selectedTimes.map(time => {
                const [hours, minutes, period] = time.split(/[.: ]/);
                const adjustedHours = hours === '12' ? 0 : parseInt(hours) + (period === 'PM' ? 12 : 0);
                const minutesNumber = parseInt(minutes);
                const localTime = moment().set({ hours: adjustedHours, minutes: minutesNumber });
                const utcTime = moment.utc(localTime).format(); 
                return utcTime;
            });

            await upsertAvailability('monday', selectedTimesUTC);
            toast.success('Settings Updated Successfully!');
        } catch (error) {
            console.error('Error saving availability:', error);
            toast.error('Failed to save availability. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
      <SelectedTimes 
      day="Monday"
      handleAddTime = {handleAddTime}
      selectedTimes = {selectedTimes}
      loading = {loading}
      handleSave= {handleSave}
      clearAll = {clearAll}
      handleRemoveItem = {handleRemoveItem}
      />
    );
};

export default Monday;
