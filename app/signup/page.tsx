import Header from "@/components/Header";
import { createClient } from "@/utils/supabase/server";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function Signup({
    searchParams,
}:{
    searchParams: { message: string};
}){
    const supabase = createClient();
    const {
        data: { user },
      } = await supabase.auth.getUser();

    if(user){
        return redirect('/');
    }

    const signUp = async(formData: FormData) => {
        "use server";
        const origin = headers().get('origin');
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;
        const confirmPassword = formData.get("confirmPassword") as string;

        if(password !== confirmPassword){
            redirect('/signup?message=Passwords do not match');
            return; // Ensure the function exits after redirecting
        }

        const supabase = createClient();
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: `${origin}/auth/callback`,
            },
        });

        if(signUpError){
            console.error('Error during sign-up:', signUpError.message);
            redirect('/signup?message=could not authenticate user');
            return; // Ensure the function exits after redirecting
        }

        // Retrieve the new user's ID
        const userId = signUpData.user?.id;
        if (!userId) {
            console.error('Error: User ID not found after sign-up.');
            redirect('/signup?message=User ID not found');
            return; // Ensure the function exits after redirecting
        }

        // Retrieve the "patient" role ID
        const { data: rolesData, error: rolesError } = await supabase
            .from('roles')
            .select('id')
            .eq('role_name', 'Patient')
            .single();

        if (rolesError || !rolesData) {
            console.error('Error fetching role ID:', rolesError?.message);
            redirect('/signup?message=Role ID not found');
            return; // Ensure the function exits after redirecting
        }

        const roleId = rolesData.id;

        // Insert into the user_roles table
        const { error: userRoleError } = await supabase
            .from('user_roles')
            .insert([{ user_id: userId, role_id: roleId }]);

        if (userRoleError) {
            console.error('Error inserting into user_roles:', userRoleError.message);
            redirect('/signup?message=Failed to assign role');
            return; // Ensure the function exits after redirecting
        }

        redirect(`/confirm?message=Check email (${email}) to continue sign in process`);
    };

    return (
        <div className="w-full">
            <Header/>
            <div className="w-full px-8 sm:max-w-md mx-auto mt-4">
                <form action={signUp} className="animate-in flex-1 flex flex-col space-y-4 w-full justify-center">
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
                    <label className="text-black text-md" htmlFor="password">
                        Password
                    </label>
                    <input
                        id="password"
                        className="text-black rounded-md px-4 py-2 bg-inherit border mb-6"
                        type="password"
                        name="password"
                        placeholder="........."
                        required
                        autoComplete="new-password"
                    />
                    <label className="text-black text-md" htmlFor="password">
                        Confirm Password
                    </label>
                    <input 
                        id="confirmPassword"
                        className="text-black rounded-md px-4 py-2 bg-inherit border mb-6"
                        type="password"
                        name="confirmPassword"
                        autoComplete="new-password"
                        placeholder="........."
                        required
                    />
                    <button className="bg-green-700 rounded-md px-4 py-2 text-foreground mb-2">
                        Sign up
                    </button>
                    {searchParams?.message && (
                        <p className="mt-4 p-4 bg-foreground/10 text-black text-center">
                            {searchParams.message}
                        </p>
                    )}
                </form>
                <Link
                    href='/login'
                    className="text-black rounded-md no-underline text-sm"
                >
                    Already have an account? Sign In
                </Link>
            </div>
        </div>
    );
}
