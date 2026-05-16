import * as React from "react";
import { formatDistanceToNow } from "date-fns";
import { 
  Calendar, 
  CheckCircle2, 
  Clock, 
  MessageSquare, 
  UserPlus, 
  Star 
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { api } from "@/lib/axios";

interface Activity {
  id: number;
  user_id: number;
  user_name: string;
  action: string;
  entity_type: string;
  description: string;
  created_at: string;
}

export function ActivityFeed() {
  const [activities, setActivities] = React.useState<Activity[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchActivities = async () => {
      try {
        const response = await api.get<{ success: boolean, data: { activities: Activity[] } }>('/activities?limit=10');
        setActivities(response.data.data.activities);
      } catch (error) {
        console.error("Failed to fetch activities:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  const getIcon = (action: string) => {
    switch (action) {
      case 'CREATE_EVENT':
        return <Calendar className="h-4 w-4 text-blue-500" />;
      case 'SAVE_EVENT':
        return <Star className="h-4 w-4 text-yellow-500" />;
      case 'JOIN_CLUB':
        return <UserPlus className="h-4 w-4 text-green-500" />;
      case 'SUBMIT_FEEDBACK':
        return <MessageSquare className="h-4 w-4 text-purple-500" />;
      default:
        return <CheckCircle2 className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <Card className="h-full glass border-border/50">
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex gap-3 animate-pulse">
                  <div className="h-8 w-8 rounded-full bg-accent/50" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-3/4 bg-accent/50 rounded" />
                    <div className="h-3 w-1/2 bg-accent/50 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : activities.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-8">
              No recent activities
            </p>
          ) : (
            <div className="space-y-6">
              {activities.map((activity) => (
                <div key={activity.id} className="flex gap-4 group">
                  <div className="mt-1 h-8 w-8 rounded-full bg-accent/30 flex items-center justify-center border border-border/50 group-hover:border-primary/50 transition-colors">
                    {getIcon(activity.action)}
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm leading-none">
                      <span className="font-semibold text-primary">
                        {activity.user_name || "System"}
                      </span>{" "}
                      {activity.description}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                    </p>
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
