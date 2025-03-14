type WebSocketCallbacks = {
  onConsoleMessage: (message: string, type: string) => void;
  onEvent: (eventData: any) => void;
  onStatusUpdate: () => void;
};

let socket: WebSocket | null = null;
let callbacks: WebSocketCallbacks | null = null;

export const setupWebSocket = (newCallbacks: WebSocketCallbacks) => {
  callbacks = newCallbacks;

  // Close any existing connections
  if (socket) {
    closeWebSocket();
  }

  // Determine WebSocket URL based on the current URL
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const wsUrl = `${protocol}//${window.location.host}/ws`;

  socket = new WebSocket(wsUrl);

  socket.onopen = () => {
    console.log('WebSocket connection established');
    callbacks?.onConsoleMessage('WebSocket connection established', 'system');
  };

  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      
      // Handle different types of messages
      switch (data.type) {
        case 'console':
          callbacks?.onConsoleMessage(data.message, data.messageType || 'info');
          break;
        case 'event':
          callbacks?.onEvent(data.event);
          break;
        case 'statusUpdate':
          callbacks?.onStatusUpdate();
          break;
        default:
          console.log('Unknown message type:', data);
      }
    } catch (err) {
      console.error('Error parsing WebSocket message:', err);
    }
  };

  socket.onclose = () => {
    console.log('WebSocket connection closed');
    // Try to reconnect after a delay
    setTimeout(() => {
      if (callbacks) {
        setupWebSocket(callbacks);
      }
    }, 5000);
  };

  socket.onerror = (error) => {
    console.error('WebSocket error:', error);
    callbacks?.onConsoleMessage('WebSocket error occurred', 'error');
  };

  return socket;
};

export const closeWebSocket = () => {
  if (socket) {
    socket.close();
    socket = null;
  }
};

export const sendWebSocketMessage = (message: any) => {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(message));
    return true;
  }
  return false;
};
