import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";

export default function UserItem() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient();
      const { data, error } = await supabase.auth.getUser();

      if (error) {
        console.error("Error fetching user:", error);
        setLoading(false);
        return;
      }

      setUser(data?.user || null);
      setLoading(false);
    };

    fetchUser();
  }, []);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user) return;

      const supabase = createClient();
      const { data: userRoleData, error: userRoleError } = await supabase
        .from('user_roles')
        .select('role_id')
        .eq('user_id', user.id)
        .single();

      if (userRoleError || !userRoleData) {
        console.error("Error fetching user role:", userRoleError);
        return;
      }

      const roleId = userRoleData.role_id;

      const { data: roleData, error: roleError } = await supabase
        .from('roles')
        .select('role_name')
        .eq('id', roleId)
        .single();

      if (roleError || !roleData) {
        console.error("Error fetching role:", roleError);
        return;
      }

      setRole(roleData.role_name);
    };

    fetchUserRole();
  }, [user]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user || !role) {
    return (
      <div className="flex items-center gap-2 border border-neutral-500 rounded-lg p-2">
        <div className="avatar rounded-full h-10 w-10 bg-emerald-500 text-white font-bold flex items-center justify-center">
          <p>Dr</p>
        </div>
        <div className="flex flex-col">
          <p className="text-xl font-bold">Guest</p>
          <p className="text-sm text-neutral-500">You are not logged in.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 border rounded-lg">
      <div className="avatar rounded-full h-10 w-10 bg-emerald-500 text-white font-bold flex items-center justify-center">
        <p>{role === "Doctor" ? "Dr" : "Pt"}</p>
      </div>
      <div className="flex flex-col">
        <p className="text-xl font-bold">{role === "Doctor" ? "Doctor" : "Patient"} Name</p>
        <p className="text-sm text-neutral-500">{user.email}!</p>
      </div>
    </div>
  );
}
