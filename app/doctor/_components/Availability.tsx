'use client'

import dynamic from 'next/dynamic';
import React, { useEffect, useState } from 'react';
import Monday from './Monday';
import Tuesday from './Tuesday';
import Wednesday from './Wednesday';
import Thursday from './Thursday';
import Friday from './Friday';
import Saturday from './Saturday';
import Sunday from './Sunday';
import { createClient } from '@/utils/supabase/client';

const Tabs = dynamic(() => import('flowbite-react').then(mod => mod.Tabs), { ssr: false });
const TabsItem = dynamic(() => import('flowbite-react').then(mod => mod.Tabs.Item), { ssr: false });

type Day = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
export default function AvailabilitySettings() {

    const [userId, setUserId] = useState<string | null>(null);

    useEffect(() => {
        const fetchUserId = async () => {
            try {
                const supabase = createClient();
                const { data, error } = await supabase.auth.getUser();
                if (error) {
                    throw error;
                }
                if (data && data.user) {
                    setUserId(data.user.id);
                }
            } catch (error) {
                console.error('Error fetching user ID:', error);
            }
        };

        fetchUserId();
    }, []);

    const upsertAvailability = async (day:Day, times: string[]) => {
        if (!userId) return;

        const supabase = createClient();

        try {
            const { data: existingData, error: fetchError } = await supabase
                .from('availability')
                .select('*')
                .eq('user_id', userId)
                .single();

            if (fetchError && fetchError.code !== 'PGRST116') { 
                throw fetchError;
            }

            const updatedAvailability = {
                user_id: userId,
                created_at: existingData ? existingData.created_at : new Date().toISOString(),
                updated_at: new Date().toISOString(),
                monday: existingData?.monday || [],
                tuesday: existingData?.tuesday || [],
                wednesday: existingData?.wednesday || [],
                thursday: existingData?.thursday || [],
                friday: existingData?.friday || [],
                saturday: existingData?.saturday || [],
                sunday: existingData?.sunday || [],
            };
            updatedAvailability[day] = times;

            const { data, error: upsertError } = await supabase
                .from('availability')
                .upsert([updatedAvailability], { onConflict: 'user_id' });

            if (upsertError) {
                throw upsertError;
            }

            return data;
        } catch (error) {
            console.error('Error upserting availability:', error);
            throw error;
        }
    };

    const tabs = [
        {
            title: "Monday",
            component: <Monday upsertAvailability={upsertAvailability} />,
        },
        {
            title: "Tuesday",
            component: <Tuesday upsertAvailability={upsertAvailability}/>,
        },
        {
            title: "Wednesday",
            component: <Wednesday upsertAvailability={upsertAvailability}/>,
        },
        {
            title: "Thursday",
            component: <Thursday upsertAvailability={upsertAvailability}/>,
        },
        {
            title: "Friday",
            component: <Friday upsertAvailability={upsertAvailability}/>,
        },
        {
            title: "Saturday",
            component: <Saturday upsertAvailability={upsertAvailability}/>,
        },
        {
            title: "Sunday",
            component: <Sunday upsertAvailability={upsertAvailability}/>,
        },
    ];

    return (
        <div>
            <p className="py-3">Please Add the Availability for the Whole Week</p>
            <Tabs aria-label="Tabs with underline" style="underline">
                {tabs.map((tab, i) => (
                    <TabsItem key={i} title={tab.title}>
                        {tab.component}
                    </TabsItem>
                ))}
            </Tabs>
        </div>
    );
}
