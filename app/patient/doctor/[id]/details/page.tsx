import Header from '@/components/Header';
import { Label } from '@/components/ui/label';
import React from 'react';
import Image from 'next/image';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AvailDetails from '../../../_components/AvailDetails';

const AvailabilityDetailPage = () => {
  return (
    <div className="flex-1 w-full flex flex-col gap-10">
    <div className="text-black animate-in flex-1 flex flex-col gap-10 opacity-0 px-6">
      <Header/>
      <div className="flex justify-center items-center">
        <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-4xl">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-3xl font-bold">Doctor Name</Label>
              <p className="text-gray-500">Service</p>
              <p>Doctor Address</p>
            </div>
            <div>
              <Image src="" alt="DoctorImage" width={100} height={100} />
            </div>
          </div>
          <div className="max-w-5xl w-full">
            <Tabs defaultValue="servicedetails" className="w-full">
              <TabsList>
                <TabsTrigger 
                  value="servicedetails" 
                  className="text-black bg-blue-400 hover:text-black focus:ring-2 focus:ring-gray-400 rounded-md px-4 py-2 data-[state=active]:bg-white data-[state=active]:text-black">
                  Service Details
                </TabsTrigger>
                <TabsTrigger 
                  value="availability" 
                  className="text-black bg-blue-400  hover:text-black focus:ring-2 focus:ring-gray-400 rounded-md px-4 py-2 data-[state=active]:bg-white data-[state=active]:text-black">
                  Availability Details
                </TabsTrigger>
              </TabsList>
              <TabsContent value="servicedetails">Service details component</TabsContent>
              <TabsContent value="availability"><AvailDetails/></TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  </div>
  );
};

export default AvailabilityDetailPage;
