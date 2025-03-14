import { useRef, useEffect } from "react";

interface ConsoleMessage {
  message: string;
  type: string;
  timestamp: string;
}

interface ConsoleOutputProps {
  consoleMessages: ConsoleMessage[];
  onClearConsole: () => void;
  onDownloadLogs: () => void;
}

export default function ConsoleOutput({ consoleMessages, onClearConsole, onDownloadLogs }: ConsoleOutputProps) {
  const consoleRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }
  }, [consoleMessages]);

  const getMessageClass = (type: string) => {
    switch (type) {
      case 'error':
        return 'text-red-400';
      case 'success':
        return 'text-green-400';
      case 'warning':
        return 'text-yellow-400';
      case 'system':
        return 'text-blue-400';
      default:
        return 'text-white';
    }
  };

  return (
    <section className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="px-5 py-3 bg-neutral-800 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
          </svg>
          Console Output
        </h2>
        <div className="flex space-x-2">
          <button 
            className="p-1 rounded hover:bg-neutral-700 text-neutral-400 hover:text-white transition" 
            title="Clear Console"
            onClick={onClearConsole}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
            </svg>
          </button>
          <button 
            className="p-1 rounded hover:bg-neutral-700 text-neutral-400 hover:text-white transition" 
            title="Download Logs"
            onClick={onDownloadLogs}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
            </svg>
          </button>
        </div>
      </div>
      <div 
        ref={consoleRef}
        className="h-96 overflow-y-auto bg-neutral-900 font-mono text-sm p-4 text-neutral-100"
      >
        {consoleMessages.map((message, index) => (
          <div key={index} className={getMessageClass(message.type)}>
            [{message.timestamp}] {message.message}
          </div>
        ))}
      </div>
    </section>
  );
}
