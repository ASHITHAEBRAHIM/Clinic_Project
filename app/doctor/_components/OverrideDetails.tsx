'use client'
import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import moment from "moment";
import {
    Table,
    TableBody,
    TableCell,
    TableRow,
  } from "@/components/ui/table"
  import { IoTrash } from "react-icons/io5";
  import { GoPencil } from "react-icons/go";
import Link from "next/link";
  

interface Override {
    id: string;
    date: string;
    start_time: string;
    end_time: string;
    is_not_available: boolean;
}

const OverrideDetails= () => {
    const [overrides, setOverrides] = useState<Override[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchOverrides = async () => {
            try {
                const supabase = createClient();
                const { data: user, error: authError } = await supabase.auth.getUser();
                if (authError) {
                    throw authError;
                }

                const userId = user?.user?.id;
                if (!userId) {
                    throw new Error('User not found.');
                }

                const { data, error } = await supabase
                    .from('overrides')
                    .select('*')
                    .eq('user_id', userId);

                if (error) {
                    throw error;
                }

                setOverrides(data);
            } catch (error: any) {
                setError(error.message || 'Error fetching overrides.')
            } finally {
                setLoading(false);
            }
        };

        fetchOverrides();
    }, []);

    const handleDelete = async (id: string) => {
        try {
            const supabase = createClient();
            const { error } = await supabase
                .from('overrides')
                .delete()
                .eq('id', id);

            if (error) {
                throw error;
            }

            setOverrides(overrides.filter((override) => override.id !== id));
        } catch (error: any) {
            console.error('Error deleting override:', error.message);
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div className="justify-between">
            <Table className="w-full border-collapse">
                <TableBody>
                    {overrides.map((override) => {
                        const dateFormatted = moment(override.date).format('dddd, MMMM D');
                        const startLocal = moment.utc(override.start_time, 'HH:mm').local().format('h:mm A');
                        const endLocal = moment.utc(override.end_time, 'HH:mm').local().format('h:mm A');
                        const timeFormatted = override.is_not_available ? 'Unavailable' : `${startLocal} - ${endLocal}`;
                        return (
                            <TableRow key={override.id} className="border-b border-gray-300">
                                <TableCell className="px-4 py-2">
                                    <div>{dateFormatted}</div>
                                    <div className={override.is_not_available ? "" : "text-gray-500"}>{timeFormatted}</div>
                                </TableCell>
                                <TableCell className="px-4 py-2">
                                    <button onClick={() => handleDelete(override.id)}>
                                        <IoTrash className="text-red-500" />
                                    </button>
                                    <button>
                                    <Link href={`/doctor/settings/editOverride/${override.id}`}>
                                        <GoPencil className="text-blue-500 ml-4" />
                                    </Link>
                                    </button>      
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    );
};
export default OverrideDetails;