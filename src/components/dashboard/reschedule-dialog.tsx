
import React from "react";
import { Button } from "@/components/ui/button";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface Workout {
  id: string;
  name: string;
  time: string;
  day: string;
  duration: string;
}

interface RescheduleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  workout: Workout | null;
  scheduledDate: Date | undefined;
  onDateChange: (date: Date | undefined) => void;
  scheduledTime: string;
  onTimeChange: (time: string) => void;
}

const availableTimes = [
  "05:00 AM", "05:30 AM", "06:00 AM", "06:30 AM", 
  "07:00 AM", "07:30 AM", "08:00 AM", "08:30 AM",
  "05:00 PM", "05:30 PM", "06:00 PM", "06:30 PM", 
  "07:00 PM", "07:30 PM", "08:00 PM", "08:30 PM"
];

export function RescheduleDialog({ 
  isOpen, 
  onClose, 
  workout, 
  scheduledDate, 
  onDateChange, 
  scheduledTime, 
  onTimeChange 
}: RescheduleDialogProps) {
  const { toast } = useToast();
  
  const handleReschedule = () => {
    if (workout && scheduledDate) {
      toast({
        title: "Workout Rescheduled",
        description: `${workout.name} rescheduled to ${format(scheduledDate, "EEEE, MMM d")} at ${scheduledTime}`,
      });
      onClose();
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Reschedule Workout</DialogTitle>
          <DialogDescription>
            Choose a new date and time for your workout
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <div className="mb-4">
            <h4 className="text-sm font-medium mb-2">Select Date</h4>
            <CalendarComponent
              mode="single"
              selected={scheduledDate}
              onSelect={onDateChange}
              className="rounded-md border"
              initialFocus
            />
          </div>
          
          <div className="mb-4">
            <h4 className="text-sm font-medium mb-2">Select Time</h4>
            <select 
              value={scheduledTime}
              onChange={(e) => onTimeChange(e.target.value)}
              className="w-full border rounded-md p-2"
            >
              {availableTimes.map((time) => (
                <option key={time} value={time}>{time}</option>
              ))}
            </select>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleReschedule}>
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
