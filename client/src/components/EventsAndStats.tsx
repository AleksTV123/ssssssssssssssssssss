import { Card, CardContent } from "@/components/ui/card";

interface EventProps {
  id: string;
  title: string;
  description: string;
  timestamp: string;
}

interface EventsAndStatsProps {
  events: EventProps[];
}

export default function EventsAndStats({ events }: EventsAndStatsProps) {
  // Mock statistics data (in a real app this would come from the backend)
  const stats = [
    { label: "Attacks Performed", value: 0, percentage: 0 },
    { label: "Repair Commands", value: 0, percentage: 0 },
    { label: "Reconnection Rate", value: "0/day", percentage: 0 },
    { label: "Uptime Percentage", value: "0%", percentage: 0 }
  ];

  return (
    <section className="bg-white rounded-lg shadow-md p-5">
      <h2 className="text-lg font-semibold text-neutral-800 border-b pb-2 mb-4">Bot Events & Statistics</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Events */}
        <div>
          <h3 className="text-md font-medium text-neutral-700 mb-3">Recent Events</h3>
          <div className="space-y-3">
            {events.length > 0 ? (
              events.map((event) => (
                <div key={event.id} className="p-3 bg-neutral-50 rounded-md border border-neutral-200">
                  <div className="flex justify-between items-start">
                    <div className="font-medium text-neutral-800">{event.title}</div>
                    <span className="text-xs text-neutral-500">{event.timestamp}</span>
                  </div>
                  <p className="text-sm text-neutral-600 mt-1">{event.description}</p>
                </div>
              ))
            ) : (
              <Card>
                <CardContent className="p-3">
                  <p className="text-sm text-neutral-500">No events recorded yet.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
        
        {/* Statistics */}
        <div>
          <h3 className="text-md font-medium text-neutral-700 mb-3">Activity Statistics</h3>
          <div className="space-y-4">
            {stats.map((stat, index) => (
              <div key={index}>
                <div className="flex justify-between mb-1">
                  <div className="text-sm font-medium text-neutral-700">{stat.label}</div>
                  <div className="text-sm font-medium text-neutral-700">{stat.value}</div>
                </div>
                <div className="w-full bg-neutral-200 rounded-full h-2">
                  <div 
                    className={`${index === 0 ? 'bg-primary-600' : index === 1 ? 'bg-secondary-600' : index === 2 ? 'bg-warning-600' : 'bg-green-600'} h-2 rounded-full`} 
                    style={{ width: `${stat.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
