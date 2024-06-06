'use client'
import { useState } from 'react';
import { Home, AlarmClock, UsersRound, Mail, Settings } from 'lucide-react';
import Link from "next/link"
import UserItem from '@/components/User';
import {
  Command,
  CommandItem,
  CommandList,
} from "@/components/ui/command"

export default function DocSidebar(){
  const [activeItem, setActiveItem] = useState<string | null>(null);

  return(
    <div className="flex flex-col gap-4 lg:w-[300px] lg:min-w-[300px] lg:border-r border-neutral-500 lg:min-h-screen">
      <div>
        <UserItem />
      </div>
      <div className="flex-1 overflow-y-auto">
      <Command>
          <CommandList className="pl-12">
            <Link href="/doctor">
              <CommandItem onClick={() => setActiveItem("dashboard")} className={activeItem === "dashboard" ? "text-black" : "text-gray-500"}>
                <Home className="mr-2"/>Dashboard
              </CommandItem>
            </Link>
            <Link href="/doctor/appointments">
              <CommandItem onClick={() => setActiveItem("appointments")} className={activeItem === "appointments" ? "text-black" : "text-gray-500"}>
                <AlarmClock className="mr-2"/>Appointments
              </CommandItem>
            </Link>
            <Link href="/doctor/patients">
              <CommandItem onClick={() => setActiveItem("patients")} className={activeItem === "patients" ? "text-black" : "text-gray-500"}>
                <UsersRound className="mr-2"/>Patients
              </CommandItem>
            </Link>
            <Link href="/doctor/tasks">
              <CommandItem onClick={() => setActiveItem("tasks")} className={activeItem === "tasks" ? "text-black" : "text-gray-500"}>
                <UsersRound className="mr-2"/>Tasks
              </CommandItem>
            </Link>
            <Link href="/doctor/inbox">
              <CommandItem onClick={() => setActiveItem("inbox")} className={activeItem === "inbox" ? "text-black" : "text-gray-500"}>
                <Mail className="mr-2"/>Inbox
              </CommandItem>
            </Link>
            <Link href="/doctor/settings">
              <CommandItem onClick={() => setActiveItem("settings")} className={activeItem === "settings" ? "text-black" : "text-gray-500"}>
                <Settings className="mr-2" />Settings
              </CommandItem>
            </Link>
          </CommandList>
        </Command>
      </div>
    </div>
  )
}
