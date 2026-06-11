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
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { api } from "@/lib/axios";
import { DashboardActivityFeedSkeleton } from "@/components/dashboard/DashboardSkeletons";

interface Activity {
  id: number;
  user_id: number;
  user_name: string;
  action: string;
  entity_type: string;
  description: string;
  created_at: string;
}

interface ActivityPagination {
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

export function ActivityFeed() {
  const [activities, setActivities] = React.useState<Activity[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [pagination, setPagination] = React.useState<ActivityPagination>({
    total: 0,
    limit: 10,
    offset: 0,
    hasMore: false,
  });

  const currentPage = Math.floor(pagination.offset / pagination.limit) + 1;
  const totalPages = Math.max(1, Math.ceil(pagination.total / pagination.limit));

  React.useEffect(() => {
    const fetchActivities = async () => {
      try {
        const response = await api.get<{
          success: boolean;
          data: { activities: Activity[]; pagination: ActivityPagination };
        }>(`/activities?limit=${pagination.limit}&offset=${pagination.offset}`);
        setActivities(response.data.data.activities);
        setPagination(response.data.data.pagination);
      } catch (error) {
        console.error("Failed to fetch activities:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [pagination.limit, pagination.offset]);

  const handleNextPage = () => {
    if (!pagination.hasMore) return;
    setLoading(true);
    setPagination((current) => ({ ...current, offset: current.offset + current.limit }));
  };

  const handlePreviousPage = () => {
    if (pagination.offset === 0) return;
    setLoading(true);
    setPagination((current) => ({ ...current, offset: Math.max(0, current.offset - current.limit) }));
  };

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
            <DashboardActivityFeedSkeleton />
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
        <div className="mt-4 flex items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handlePreviousPage} disabled={loading || pagination.offset === 0}>
              Previous
            </Button>
            <Button variant="outline" size="sm" onClick={handleNextPage} disabled={loading || !pagination.hasMore}>
              Next
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
