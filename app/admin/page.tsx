import Header from '@/components/Header'
import React from 'react'

const AdminPage = () => {
  return (
    <div className="flex-1 w-full flex flex-col gap-10">
    <div className="text-black animate-in flex-1 flex flex-col gap-10 opacity-0 px-6">
        <Header/>
        Welcome Admin
    </div>
    </div>
  )
}

export default AdminPage