import Header from '@/components/Header'

import React from 'react'
import DocSidebar from './_components/DocSidebar'

const DoctorPage = () => {
  return (
    <div className="flex-1 w-full flex flex-col gap-10">
    <div className="text-black animate-in flex-1 flex flex-col gap-10 opacity-0 px-6">
        <Header/>
        <div className='grid grid-cols-[auto,1fr] flex-grow-1 overflow-auto'>
            <DocSidebar/>
            <div className='overflow-x-hidden px-8 pb-4'>
                <div className='sticky top-0 bg-white z-10 pb-4'>
                    Search Bar
                </div>
                <div>
                Welcome Doctor
                </div>
            </div>
        </div>
    </div>
    </div>
  )
}

export default DoctorPage