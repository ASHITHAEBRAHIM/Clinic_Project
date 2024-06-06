import React, { useState } from 'react';

import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { FaCopy } from 'react-icons/fa';
import { Input } from '@/components/ui/input';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  selectedDate: Date | undefined;
  selectedTime: string | undefined;
  inviteURL: string;
  showMeetingInfo: boolean;
  setShowMeetingInfo: (state: boolean) => void;
}

export default function ConfirmationModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  selectedDate, 
  selectedTime, 
  inviteURL, 
  showMeetingInfo, 
  setShowMeetingInfo 
}: ConfirmationModalProps) {

  const handleDialogClose = () => {
    setShowMeetingInfo(false);
  };
  const[copied,setCopied] = useState(false);
  const onCopy = () => {
    navigator.clipboard.writeText(inviteURL);
    setCopied(true);

    setTimeout(()=>{
        setCopied(false);
    },1000);
}


  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-8 rounded-md shadow-md">
            <p className="mb-4">Are you sure you want to book this time?</p>
            {selectedDate && selectedTime && (
              <p className="mb-4">{selectedDate.toDateString()}, Time: {selectedTime}</p>
            )}
            <div className="flex justify-end">
              <button className="mr-4 px-4 py-2 bg-gray-200 text-gray-800 rounded-md" onClick={onClose}>
                Cancel
              </button>
              <button className="px-4 py-2 bg-blue-500 text-white rounded-md" onClick={onConfirm}>
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
      <Dialog open={showMeetingInfo} onOpenChange={setShowMeetingInfo}>
        <DialogContent className='bg-white'>
            <DialogHeader>
            <DialogTitle className='text-2xl font-bold text-black'>Booking Successful</DialogTitle>
            <DialogDescription className='text-black'>
             Your appointment has been booked successfully.Here is your meeting Link!
          </DialogDescription>
          </DialogHeader>
          <div>
      <div className="flex items-center mt-2 gap-x-2">
        <Input
          className="bg-zinc-500 border-0 text-black"
          defaultValue={inviteURL} 
        />
        <Button onClick={onCopy} className='bg-zinc-500' size="icon">
            {copied
            ? <Check className="w-4 h-4"/>
            : <FaCopy className="w-4 h-4" />
            }
        </Button>
      </div>
    </div>
          <DialogFooter>
            <DialogClose asChild>
              <button className="bg-blue-500 text-white py-2 px-4 rounded" onClick={handleDialogClose}>Close</button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
