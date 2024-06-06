import Link from "next/link";
import { FaClinicMedical } from "react-icons/fa";
import AuthButton from "./AuthButton";

const Header = () => {
  return (
    <nav className="w-full flex flex-col lg:flex-row justify-between items-center px-5 lg:px-10 h-auto lg:h-14 bg-primary text-black shadow-md">
      <div className="flex items-center gap-4">
        <FaClinicMedical className="text-3xl lg:text-4xl" />
        <Link href="/" className="text-xl lg:text-2xl font-bold">Clinic App</Link>
      </div>
      <div className="flex flex-col lg:flex lg:flex-row items-center gap-6 lg:gap-12 mt-4 lg:mt-0">
        <Link href="/">HOME</Link>
        <Link href="/about">ABOUT</Link>
        <Link href="/contact">CONTACT</Link>
        <AuthButton />
      </div>
    </nav>
  );
}

export default Header;
