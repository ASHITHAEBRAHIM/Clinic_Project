import Header from '@/components/Header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AvailabilitySettings from '../_components/Availability';
import DocSidebar from '../_components/DocSidebar';
import { Label } from '@/components/ui/label';

const SettingsPage = () => {
  return (
    <div className="flex-1 w-full flex flex-col gap-10">
      <div className="text-black flex-1 flex flex-col gap-10 px-6">
        <Header />
        <div className='lg:flex'>
        <DocSidebar />
        <div className='px-8 pb-4 flex flex-col lg:pt-1 pt-8'>
          <Label className='text-2xl lg:text-4xl font-bold'>Settings</Label>
          <div className='max-w-5xl w-full py-6'>
            <Tabs defaultValue="availability" className="w-full">
              <TabsList>
                <TabsTrigger
                  value="availability"
                  className="text-gray-500 bg-transparent hover:text-black focus:ring-2 focus:ring-gray-400 rounded-md px-4 py-2 data-[state=active]:bg-white data-[state=active]:text-black">
                  Availability Settings
                </TabsTrigger>
                <TabsTrigger
                  value="account"
                  className="text-gray-500 bg-transparent hover:text-black focus:ring-2 focus:ring-gray-400 rounded-md px-4 py-2 data-[state=active]:bg-white data-[state=active]:text-black">
                  Account Settings
                </TabsTrigger>
              </TabsList>
              <TabsContent value="availability"><AvailabilitySettings /></TabsContent>
              <TabsContent value="account">Make changes to your account here.</TabsContent>
            </Tabs>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SettingsPage;
