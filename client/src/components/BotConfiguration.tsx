import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BotConfig } from "@shared/schema";

interface BotConfigurationProps {
  config: BotConfig | undefined;
  onSaveConfig: (config: BotConfig) => void;
  isPending: boolean;
  activeBot?: string;
}

export default function BotConfiguration({ config, onSaveConfig, isPending, activeBot = 'Bot1' }: BotConfigurationProps) {
  const [formState, setFormState] = useState<BotConfig>({
    host: "",
    port: 25565,
    username: "",
    version: "",
    password: ""
  });

  // Update form state when config data is loaded
  useEffect(() => {
    if (config) {
      setFormState(config);
    }
  }, [config]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({
      ...prev,
      [name]: name === 'port' ? parseInt(value) || 25565 : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveConfig(formState);
  };

  return (
    <section className="bg-white rounded-lg shadow-md p-5">
      <h2 className="text-lg font-semibold text-neutral-800 border-b pb-2">Bot Configuration</h2>
      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <div className="space-y-2">
          <label htmlFor="host" className="block text-sm font-medium text-neutral-700">Server Host</label>
          <Input 
            type="text" 
            id="host" 
            name="host" 
            value={formState.host} 
            onChange={handleInputChange}
            className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-neutral-300 rounded-md"
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="port" className="block text-sm font-medium text-neutral-700">Server Port</label>
          <Input 
            type="number" 
            id="port" 
            name="port" 
            value={formState.port} 
            onChange={handleInputChange}
            className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-neutral-300 rounded-md"
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="username" className="block text-sm font-medium text-neutral-700">Bot Username</label>
          <Input 
            type="text" 
            id="username" 
            name="username" 
            value={formState.username} 
            onChange={handleInputChange}
            className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-neutral-300 rounded-md"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="block text-sm font-medium text-neutral-700">Bot Password</label>
          <Input 
            type="password" 
            id="password" 
            name="password" 
            value={formState.password} 
            onChange={handleInputChange}
            className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-neutral-300 rounded-md"
            placeholder="Password for /login command"
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="version" className="block text-sm font-medium text-neutral-700">Minecraft Version</label>
          <Input 
            type="text" 
            id="version" 
            name="version" 
            value={formState.version} 
            onChange={handleInputChange}
            className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-neutral-300 rounded-md"
          />
        </div>
        
        <div className="pt-2 flex justify-end">
          <Button 
            type="submit" 
            className="inline-flex items-center px-4 py-2"
            disabled={isPending}
          >
            Save Configuration
          </Button>
        </div>
      </form>
    </section>
  );
}
