import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Header from "@/components/Header";

export default async function Login({
  searchParams,
}: {
  searchParams: { message: string };
}) {
  const supabase = createClient();

  const login = async (formData: FormData) => {
    "use server";

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const supabase = createClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("Authentication error:", error);
      return redirect("/login?message=Could not authenticate user");
    }

    const { user } = data;
    console.log("User ID:", user?.id);

    const { data: userRoleData, error: userRoleError } = await supabase
      .from('user_roles')
      .select('role_id')
      .eq('user_id', user?.id)
      .single();

    if (userRoleError) {
      console.error("Error fetching user role:", userRoleError);
      return redirect("/login?message=Could not retrieve user role");
    }

    if (!userRoleData) {
      console.error("No role data found for user");
      return redirect("/login?message=No role data found for user");
    }

    const roleId = userRoleData.role_id;

    if (!roleId) {
      console.error("Role ID is undefined");
      return redirect("/login?message=Role ID is undefined");
    }

    const { data: roleData, error: roleError } = await supabase
      .from('roles')
      .select('role_name')
      .eq('id', roleId)
      .single();

    if (roleError) {
      console.error("Error fetching role:", roleError);
      return redirect("/login?message=Could not retrieve role");
    }

    if (!roleData) {
      console.error("No role data found for role ID");
      return redirect("/login?message=No role data found for role ID");
    }

    const role = roleData.role_name;

    if (role === 'Admin') {
      return redirect("/admin");
    } else if (role === 'Doctor') {
      return redirect("/doctor");
    } else if (role === 'Patient') {
      return redirect("/patient");
    } else {
      return redirect("/login?message=Unknown user role");
    }
  };

  return (
    <div className="w-full">
      <Header />
      <div className="w-full px-8 sm:max-w-md mx-auto mt-4">
        <form action={login} className="animate-in flex-1 flex flex-col w-full justify-center gap-2 text-foreground">
          <label className="text-black text-md" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            className="text-black rounded-md px-4 py-2 bg-inherit border mb-6"
            type="email"
            name="email"
            placeholder="you@example.com"
            required
            autoComplete="email"
            />
          <label className=" text-black text-md" htmlFor="password">
            Password
          </label>
          <input
            className="text-black rounded-md px-4 py-2 bg-inherit border mb-6"
            id="password"
            type="password"
            name="password"
            placeholder="••••••••"
            required
            autoComplete="password"
          />
          <button
            type="submit"
            className="bg-green-700 rounded-md px-4 py-2 text-foreground mb-2"
          >
            Sign In
          </button>
          {searchParams?.message && (
            <p className="mt-4 p-4 bg-foreground/10 text-black text-center">
              {searchParams.message}
            </p>
          )}
        </form>
        <div className="flex flex-col">
          <Link href='/forgetPassword' className="text-blue-700">
            Forgotten Password
          </Link>
          <Link className="text-black" href='/signup'>
            Don't have an Account? Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
}
