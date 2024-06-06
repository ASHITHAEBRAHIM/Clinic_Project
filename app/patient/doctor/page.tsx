import Header from '@/components/Header'
import React from 'react'
import PatSideBar from '../_components/PatSidebar'
import DoctorList from '../_components/DoctorList'


const PatDoctor = () => {
  return (
    <div className="flex-1 w-full flex flex-col gap-10">
    <div className="text-black animate-in flex-1 flex flex-col gap-10 opacity-0 px-6">
        <Header/>
        <div className='grid grid-cols-[auto,1fr] flex-grow-1 overflow-auto'>
         <PatSideBar/>
            <div className='overflow-x-hidden px-8 pb-4'>
                <div className='px-8 pb-4 text-center'>
                <h1 className='scroll-m-20 text-3xl font-extrabold tracking-tight lg:text-4xl'>Browse your doctors By</h1>
                <p className='pt-2 text-gray-600'>choose from thousands of providers at every day affordable prices. Book online today. </p>
                </div>
               <DoctorList/>
            </div>
        </div>
    </div>
    </div>
  )
}

export default PatDoctor