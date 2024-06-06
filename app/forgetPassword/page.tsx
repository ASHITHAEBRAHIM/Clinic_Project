import Header from "@/components/Header";
import { createClient } from "@/utils/supabase/server";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function ForgetPassword({
    searchParams,
}:{
    searchParams: {message: string}
}) {
    const confirmReset = async (formData: FormData) => {
        "use server";
    
        const origin = headers().get('origin');
        const email = formData.get("email") as string;
        const supabase = createClient();
    
        const { error } = await supabase.auth.resetPasswordForEmail(email, {redirectTo:`${origin}/resetPassword`});
    
        if (error) {
            console.log(error)
          return redirect("/forgetPassword?message=Could not authenticate user");
        }
    
        return redirect("/confirm?message=Password reset link has been sent to your email address");
      };
    return(
        <div className="w-full">
          <Header/>
      <div className="w-full px-8 sm:max-w-md mx-auto mt-4">
        <form action={confirmReset} className="animate-in flex-1 flex flex-col w-full justify-center gap-2 text-foreground mb-2">
            <label className="text-black text-md" htmlFor="email">
                Enter Email Address
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
            <button className="bg-indigo-700 rounded-md px-4 py-2 text-foreground mb-2">
                confirm
            </button>
            {searchParams?.message && (
          <p className="text-black mt-4 p-4 text-center">
            {searchParams.message}
          </p>
        )}
        </form>
        <Link className="text-black" href='/login'>
        Remember your password?Sign in
        </Link>
      </div>
        </div>
    )
}