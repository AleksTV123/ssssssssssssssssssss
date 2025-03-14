import { BotStatus } from "@shared/schema";

interface StatusCardsProps {
  status: BotStatus | undefined;
  activeBot?: string;
}

export default function StatusCards({ status, activeBot = 'Bot1' }: StatusCardsProps) {
  // Define different color schemes based on the active bot
  const colors = activeBot === 'Bot2' ? {
    primary: 'blue',
    secondary: 'indigo',
    warning: 'orange'
  } : {
    primary: 'green',
    secondary: 'emerald',
    warning: 'amber'
  };

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 gap-4">
      {/* Server Status Card */}
      <div className={`bg-white rounded-lg shadow-md p-5 border-l-4 border-${colors.primary}-600`}>
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-neutral-500 text-sm font-medium">Server Status</h3>
            <p className="text-neutral-900 text-xl font-semibold mt-1">
              {status?.server ? 'Online' : 'Offline'}
            </p>
          </div>
          <svg xmlns="http://www.w3.org/2000/svg" className={`h-8 w-8 text-${colors.primary}-600`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </div>
        <div className="mt-2 text-sm text-neutral-500">
          {status?.serverAddress || "Not connected"}
        </div>
      </div>

      {/* Uptime Card */}
      <div className={`bg-white rounded-lg shadow-md p-5 border-l-4 border-${colors.secondary}-600`}>
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-neutral-500 text-sm font-medium">Bot Uptime</h3>
            <p className="text-neutral-900 text-xl font-semibold mt-1">
              {status?.uptime || "0h 0m 0s"}
            </p>
          </div>
          <svg xmlns="http://www.w3.org/2000/svg" className={`h-8 w-8 text-${colors.secondary}-600`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        </div>
        <div className="mt-2 text-sm text-neutral-500">
          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-${colors.secondary}-100 text-${colors.secondary}-800`}>
            Last restart: {status?.lastRestart || "Never"}
          </span>
        </div>
      </div>

      {/* Reconnection Attempts Card */}
      <div className={`bg-white rounded-lg shadow-md p-5 border-l-4 border-${colors.warning}-600`}>
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-neutral-500 text-sm font-medium">Reconnection Attempts</h3>
            <p className="text-neutral-900 text-xl font-semibold mt-1">
              {status?.reconnectAttempts || 0}
            </p>
          </div>
          <svg xmlns="http://www.w3.org/2000/svg" className={`h-8 w-8 text-${colors.warning}-600`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
          </svg>
        </div>
        <div className="mt-2 text-sm text-neutral-500">
          Last attempt: {status?.lastReconnectTime || "N/A"}
        </div>
      </div>

      {/* Activity Card */}
      <div className={`bg-white rounded-lg shadow-md p-5 border-l-4 border-${colors.primary}-600`}>
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-neutral-500 text-sm font-medium">Bot Activity</h3>
            <p className="text-neutral-900 text-xl font-semibold mt-1">
              {status?.activity || "Inactive"}
            </p>
          </div>
          <svg xmlns="http://www.w3.org/2000/svg" className={`h-8 w-8 text-${colors.primary}-600`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
          </svg>
        </div>
        <div className="mt-2 text-sm text-neutral-500">
          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-${colors.primary}-100 text-${colors.primary}-800`}>
            {status?.lastAction || "No recent actions"}
          </span>
        </div>
      </div>
    </section>
  );
}
