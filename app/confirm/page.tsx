import Header from "@/components/Header";

export default function Signup({
    searchParams,
}:{
    searchParams: {message: string};
}) {
    return(
        <div className="w-full">
            <Header/>
            <div className="w-full px-8 sm:max-w-lg mx-auto mt-8">
                <p className="text-black">{searchParams.message}</p>
            </div>
        </div>
    )
}