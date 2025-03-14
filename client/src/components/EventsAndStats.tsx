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
  return (
    <section className="bg-white rounded-lg shadow-md p-5">
      <h2 className="text-lg font-semibold text-neutral-800 border-b pb-2 mb-4">Bot Events</h2>
      
      <div>
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
    </section>
  );
}
