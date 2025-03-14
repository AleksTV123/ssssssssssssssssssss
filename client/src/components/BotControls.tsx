import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface BotControlsProps {
  connected: boolean;
  onToggleConnection: () => void;
  onRestartBot: () => void;
  onSendCommand: () => void;
  customCommand: string;
  setCustomCommand: (command: string) => void;
  isPending: boolean;
}

export default function BotControls({ 
  connected, 
  onToggleConnection, 
  onRestartBot, 
  onSendCommand,
  customCommand,
  setCustomCommand,
  isPending
}: BotControlsProps) {
  return (
    <section className="bg-white rounded-lg shadow-md p-5 space-y-4">
      <h2 className="text-lg font-semibold text-neutral-800 border-b pb-2">Bot Controls</h2>
      
      <div className="space-y-4">
        {/* Connect/Disconnect Button */}
        <Button 
          className="w-full flex justify-center items-center"
          onClick={onToggleConnection}
          disabled={isPending}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
          {connected ? 'Disconnect Bot' : 'Connect Bot'}
        </Button>

        {/* Restart Bot Button */}
        <Button 
          className="w-full flex justify-center items-center"
          variant="warning"
          onClick={onRestartBot}
          disabled={isPending}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
          </svg>
          Restart Bot
        </Button>

        {/* Send Custom Command */}
        <div className="space-y-2">
          <label htmlFor="customCommand" className="block text-sm font-medium text-neutral-700">
            Send Custom Command
          </label>
          <div className="flex space-x-2">
            <Input
              type="text"
              id="customCommand"
              placeholder="/command"
              value={customCommand}
              onChange={(e) => setCustomCommand(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  onSendCommand();
                }
              }}
              disabled={isPending || !connected}
            />
            <Button 
              onClick={onSendCommand} 
              disabled={isPending || !connected || !customCommand.trim()}
              size="sm"
            >
              Send
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
