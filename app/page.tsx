import { createClient } from "@/utils/supabase/server";
import Header from "@/components/Header";
import Image from "next/image";

export default async function Index() {
  const canInitSupabaseClient = () => {
    try {
      createClient();
      return true;
    } catch (e) {
      return false;
    }
  };

  const isSupabaseConnected = canInitSupabaseClient();

  return (
    <div className="flex-1 w-full flex flex-col gap-10">
      <div className="text-black animate-in flex-1 flex flex-col gap-10 opacity-0 px-6">
        <Header />
        <main className="flex-1 flex flex-col">
          <div className="relative w-full h-[500px]"> 
            <Image 
              src='/clinic_bg.jpeg' 
              alt='Background image' 
              layout="fill" 
              objectFit="cover" 
              className="rounded-lg"
            />
          </div>
        </main>
      </div>

      <footer className="w-full text-black border-t border-t-foreground/10 p-8 flex justify-center text-center text-xs">
        <p>
          Powered by{" "}
          <a
            href="https://supabase.com/?utm_source=create-next-app&utm_medium=template&utm_term=nextjs"
            target="_blank"
            className="text-black font-bold hover:underline"
            rel="noreferrer"
          >
            Clinic App
          </a>
        </p>
      </footer>
    </div>
  );
}
