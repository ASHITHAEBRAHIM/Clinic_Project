import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "./ui/button";

export default async function AuthButton() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const signOut = async () => {
    "use server";

    const supabase = createClient();
    await supabase.auth.signOut();
    return redirect("/login");
  };

  if (!user) {
    return (
      <Link
        href="/login"
        className="py-2 px-3 flex rounded-md no-underline bg-btn-background hover:bg-btn-background-hover"
      >
        LOGIN
      </Link>
    );
  }

  const { data: userRoleData, error: userRoleError } = await supabase
    .from('user_roles')
    .select('role_id')
    .eq('user_id', user.id)
    .single();

  if (userRoleError || !userRoleData) {
    console.error("Error fetching user role:", userRoleError);
    return
  }

  const roleId = userRoleData.role_id;

  const { data: roleData, error: roleError } = await supabase
    .from('roles')
    .select('role_name')
    .eq('id', roleId)
    .single();

  if (roleError || !roleData) {
    console.error("Error fetching role:", roleError);
    return
  }

  const role = roleData.role_name.toLowerCase(); 

  const profileUrl = `/${role}`;

  return (
    <div className="flex flex-col lg:flex lg:flex-row items-center gap-4">
      <Link href={profileUrl}>My Profile</Link>
      <form action={signOut}>
        <Button>LOGOUT</Button>
      </form>
    </div>
  );
}
