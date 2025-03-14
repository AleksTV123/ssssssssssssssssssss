import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { BotConfig, BotStatus, BotType } from "@shared/schema";
import { setupWebSocket, closeWebSocket } from "@/lib/websocket";
import StatusCards from "@/components/StatusCards";
import BotControls from "@/components/BotControls";
import BotConfiguration from "@/components/BotConfiguration";
import ConsoleOutput from "@/components/ConsoleOutput";
import EventsAndStats from "@/components/EventsAndStats";
import { Button } from "@/components/ui/button";

export default function Home() {
  const { toast } = useToast();
  const [consoleMessages, setConsoleMessages] = useState<{message: string, type: string, timestamp: string}[]>([]);
  const [customCommand, setCustomCommand] = useState("");
  const [events, setEvents] = useState<{id: string, title: string, description: string, timestamp: string}[]>([]);
  
  // Get bot status
  const { data: botStatus, refetch: refetchStatus } = useQuery<BotStatus>({
    queryKey: ['/api/bot/status'],
  });

  // Get bot configuration
  const { data: botConfig } = useQuery<BotConfig>({
    queryKey: ['/api/bot/config'],
  });
  
  // Get active bot
  const { data: activeBot } = useQuery<{activeBot: BotType}>({
    queryKey: ['/api/bot/active'],
  });
  
  // Connect/Disconnect mutation
  const connectMutation = useMutation({
    mutationFn: async (connect: boolean) => {
      const endpoint = connect ? '/api/bot/connect' : '/api/bot/disconnect';
      return apiRequest('POST', endpoint, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/bot/status'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to ${botStatus?.connected ? 'disconnect' : 'connect'} bot: ${error}`,
        variant: "destructive"
      });
    }
  });

  // Restart bot mutation
  const restartMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', '/api/bot/restart', {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/bot/status'] });
      toast({
        title: "Success",
        description: "Bot has been restarted",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to restart bot: ${error}`,
        variant: "destructive"
      });
    }
  });

  // Send command mutation
  const sendCommandMutation = useMutation({
    mutationFn: async (command: string) => {
      return apiRequest('POST', '/api/bot/command', { command });
    },
    onSuccess: () => {
      setCustomCommand("");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to send command: ${error}`,
        variant: "destructive"
      });
    }
  });

  // Save configuration mutation
  const saveConfigMutation = useMutation({
    mutationFn: async (config: BotConfig) => {
      return apiRequest('POST', '/api/bot/config', config);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/bot/config'] });
      toast({
        title: "Success",
        description: "Configuration saved",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to save configuration: ${error}`,
        variant: "destructive"
      });
    }
  });
  
  // Switch bot mutation
  const switchBotMutation = useMutation({
    mutationFn: async (botType: BotType) => {
      return apiRequest('POST', '/api/bot/switch', { botType });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/bot/active'] });
      queryClient.invalidateQueries({ queryKey: ['/api/bot/config'] });
      queryClient.invalidateQueries({ queryKey: ['/api/bot/status'] });
      toast({
        title: "Success",
        description: "Bot switched successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to switch bot: ${error}`,
        variant: "destructive"
      });
    }
  });

  // Initialize WebSocket connection
  useEffect(() => {
    const handleConsoleMessage = (message: string, type: string = 'info') => {
      const timestamp = new Date().toLocaleTimeString();
      setConsoleMessages(prev => {
        const newMessages = [...prev, { message, type, timestamp }];
        // Limit to last 100 messages
        if (newMessages.length > 100) {
          return newMessages.slice(newMessages.length - 100);
        }
        return newMessages;
      });
    };

    const handleEvent = (eventData: any) => {
      // Ensure event has a unique ID by combining timestamp and a random string
      const uniqueEvent = {
        ...eventData,
        id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
      };
      
      setEvents(prev => {
        const newEvents = [...prev, uniqueEvent];
        // Limit to last 10 events
        if (newEvents.length > 10) {
          return newEvents.slice(newEvents.length - 10);
        }
        return newEvents;
      });
    };

    const handleStatusUpdate = () => {
      refetchStatus();
    };

    // Setup WebSocket connection
    setupWebSocket({
      onConsoleMessage: handleConsoleMessage,
      onEvent: handleEvent,
      onStatusUpdate: handleStatusUpdate
    });

    // Add some initial log messages
    handleConsoleMessage('Dashboard initialized', 'system');
    handleConsoleMessage('Mineflayer 24/7 Bot Manager ready', 'success');
    handleConsoleMessage('Use the controls to start the bot', 'info');

    // Clean up on component unmount
    return () => {
      closeWebSocket();
    };
  }, [refetchStatus]);

  // Handle toggle connection
  const handleToggleConnection = () => {
    connectMutation.mutate(!botStatus?.connected);
  };

  // Handle restart bot
  const handleRestartBot = () => {
    restartMutation.mutate();
  };

  // Handle send command
  const handleSendCommand = () => {
    if (customCommand.trim()) {
      sendCommandMutation.mutate(customCommand);
    }
  };

  // Handle clear console
  const handleClearConsole = () => {
    setConsoleMessages([]);
    const timestamp = new Date().toLocaleTimeString();
    setConsoleMessages([{ message: 'Console cleared', type: 'system', timestamp }]);
  };

  // Handle download logs
  const handleDownloadLogs = () => {
    // Convert logs to text
    const logText = consoleMessages.map(log => `[${log.timestamp}] ${log.message}`).join('\n');
    
    // Create download link
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(logText));
    element.setAttribute('download', `mineflayer_logs_${new Date().toISOString().slice(0,10)}.txt`);
    element.style.display = 'none';
    
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    
    toast({
      title: "Success",
      description: "Logs downloaded",
    });
  };

  // Handle save configuration
  const handleSaveConfig = (config: BotConfig) => {
    saveConfigMutation.mutate(config);
  };
  
  // Handle bot switch
  const handleSwitchBot = () => {
    // Switch to the other bot type
    const newBotType: BotType = activeBot?.activeBot === 'Bot1' ? 'Bot2' : 'Bot1';
    switchBotMutation.mutate(newBotType);
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="bg-gray-800 text-white shadow-md">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
              <polyline points="7.5 4.21 12 6.81 16.5 4.21"></polyline>
              <polyline points="7.5 19.79 7.5 14.6 3 12"></polyline>
              <polyline points="21 12 16.5 14.6 16.5 19.79"></polyline>
              <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
              <line x1="12" y1="22.08" x2="12" y2="12"></line>
            </svg>
            <h1 className="text-xl font-semibold">Mineflayer Bot 24/7 Dashboard</h1>
          </div>
          
          {/* Active Bot & Connection Status */}
          <div className="flex items-center space-x-4">
            {/* Bot Switcher */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-white font-medium">Active Bot:</span>
              <Button 
                variant="outline"
                size="sm"
                onClick={handleSwitchBot}
                disabled={switchBotMutation.isPending}
                className="flex items-center space-x-1 bg-white text-primary-700 border-white hover:bg-gray-100 hover:text-primary-800"
              >
                <span>{activeBot?.activeBot || 'Bot1'}</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1">
                  <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"></path>
                </svg>
              </Button>
            </div>
            
            {/* Connection Status */}
            <div id="connectionStatus" className={`flex items-center px-3 py-1 rounded-full ${botStatus?.connected ? 'bg-green-600' : 'bg-red-600'} text-white text-sm shadow-sm`}>
              <span className="relative flex h-3 w-3 mr-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className={`relative inline-flex rounded-full h-3 w-3 ${botStatus?.connected ? 'bg-green-300' : 'bg-white'}`}></span>
              </span>
              {botStatus?.connected ? 'Connected' : 'Disconnected'}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left Column - Stats and Controls */}
          <div className="md:col-span-4 space-y-6">
            {/* Status Cards */}
            <StatusCards status={botStatus} />
            
            {/* Control Panel */}
            <BotControls 
              connected={botStatus?.connected || false}
              onToggleConnection={handleToggleConnection}
              onRestartBot={handleRestartBot}
              onSendCommand={handleSendCommand}
              customCommand={customCommand}
              setCustomCommand={setCustomCommand}
              isPending={connectMutation.isPending || restartMutation.isPending || sendCommandMutation.isPending}
            />
            
            {/* Configuration */}
            <BotConfiguration 
              config={botConfig}
              onSaveConfig={handleSaveConfig}
              isPending={saveConfigMutation.isPending}
            />
          </div>
          
          {/* Right Column - Console and Logs */}
          <div className="md:col-span-8 space-y-6">
            {/* Console Output */}
            <ConsoleOutput 
              consoleMessages={consoleMessages}
              onClearConsole={handleClearConsole}
              onDownloadLogs={handleDownloadLogs}
              activeBot={activeBot?.activeBot}
            />
            
            {/* Events and Statistics */}
            <EventsAndStats events={events} />
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-neutral-200 py-4">
        <div className="container mx-auto px-4 text-center text-neutral-600 text-sm">
          Mineflayer Bot 24/7 Dashboard &copy; {new Date().getFullYear()} | <a href="#" className="text-primary-600 hover:text-primary-800">Documentation</a> | <a href="#" className="text-primary-600 hover:text-primary-800">Support</a>
        </div>
      </footer>
    </div>
  );
}
