// src/components/dashboard/ClassroomAvailabilitySearch.tsx
import * as React from "react";
import { api } from "@/lib/axios";
import { Calendar, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DashboardClassroomAvailabilitySkeleton } from "@/components/dashboard/ClassroomAvailabilitySkeleton";

interface Classroom {
  id: number;
  name: string;
  capacity: number;
  isAvailable: boolean;
}

export function ClassroomAvailabilitySearch() {
  const [date, setDate] = React.useState<string>(new Date().toISOString().split("T")[0]);
  const [timeSlot, setTimeSlot] = React.useState<string>("10:00");
  const [classrooms, setClassrooms] = React.useState<Classroom[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchAvailability = async () => {
      try {
        const response = await api.get<{ classrooms: Classroom[] }>(
          `/classrooms/availability?date=${date}&time=${timeSlot}`
        );
        setClassrooms(response.data.classrooms);
      } catch (error) {
        console.error("Failed to fetch classroom availability:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAvailability();
  }, [date, timeSlot]);

  return (
    <Card className="h-full glass border-border/50">
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          Classroom Availability
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4 mb-4">
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-40"
          />
          <Select value={timeSlot} onValueChange={setTimeSlot}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Time" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="08:00">08:00</SelectItem>
              <SelectItem value="10:00">10:00</SelectItem>
              <SelectItem value="12:00">12:00</SelectItem>
              <SelectItem value="14:00">14:00</SelectItem>
              <SelectItem value="16:00">16:00</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <ScrollArea className="h-[300px] pr-4">
          {loading ? (
            <DashboardClassroomAvailabilitySkeleton />
          ) : classrooms.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-8">
              No classrooms found for this time.
            </p>
          ) : (
            <div className="space-y-4">
              {classrooms.map((classroom) => (
                <div
                  key={classroom.id}
                  className="flex items-center justify-between p-3 rounded-md border border-border/50"
                >
                  <div>
                    <p className="font-medium">{classroom.name}</p>
                    <p className="text-sm text-muted-foreground">Capacity: {classroom.capacity}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`h-3 w-3 rounded-full ${
                        classroom.isAvailable ? "bg-green-500" : "bg-red-500"
                      }`}
                    />
                    <span className="text-sm">
                      {classroom.isAvailable ? "Available" : "Occupied"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}