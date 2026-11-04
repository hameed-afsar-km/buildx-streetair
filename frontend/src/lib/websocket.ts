import {
  AirReading,
  LiveWSConnectionState,
  ScenarioKey,
  WebSocketInboundMessage,
  WebSocketOutboundMessage,
} from "./types";
import { getMockLatestReading, setActiveMockScenario } from "./api/mockAdapter";

type MessageHandler = (message: WebSocketInboundMessage) => void;
type StatusHandler = (status: LiveWSConnectionState) => void;

class LiveWebSocketManager {
  private ws: WebSocket | null = null;
  private url: string;
  private status: LiveWSConnectionState = "disconnected";
  private messageListeners: Set<MessageHandler> = new Set();
  private statusListeners: Set<StatusHandler> = new Set();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 8;
  private baseDelayMs = 1500;
  private maxDelayMs = 20000;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private pingInterval: ReturnType<typeof setInterval> | null = null;
  private isIntentionallyClosed = false;
  private lastMessageTimestamp: Date | null = null;
  private currentDeviceId: string = "crescent-vandalur-01";

  constructor() {
    this.url =
      typeof window !== "undefined"
        ? process.env.NEXT_PUBLIC_WS_URL || `ws://${window.location.hostname}:8000/ws/v1/live`
        : "ws://localhost:8000/ws/v1/live";
  }

  public getStatus(): LiveWSConnectionState {
    return this.status;
  }

  public getLastMessageTime(): Date | null {
    return this.lastMessageTimestamp;
  }

  public connect(deviceId: string = "crescent-vandalur-01", authToken?: string): void {
    if (typeof window === "undefined") return;
    this.currentDeviceId = deviceId;
    this.isIntentionallyClosed = false;

    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    this.setStatus(this.reconnectAttempts === 0 ? "connecting" : "reconnecting");

    try {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        this.reconnectAttempts = 0;
        this.setStatus("connected");
        this.lastMessageTimestamp = new Date();

        // Send subscribe message
        const subscribeMsg: WebSocketOutboundMessage = {
          action: "subscribe",
          device_id: deviceId,
          token: authToken,
        };
        this.send(subscribeMsg);

        // Start client-side ping/heartbeat safeguard
        this.startHeartbeat();
      };

      this.ws.onmessage = (event) => {
        this.lastMessageTimestamp = new Date();
        try {
          const data = JSON.parse(event.data) as WebSocketInboundMessage;
          if (data.type === "ping") {
            this.send({ action: "ping" });
            return;
          }
          this.notifyMessage(data);
        } catch (err) {
          console.warn("Received malformed WebSocket packet", err);
        }
      };

      this.ws.onclose = () => {
        this.stopHeartbeat();
        this.ws = null;
        if (!this.isIntentionallyClosed) {
          this.scheduleReconnect();
        } else {
          this.setStatus("disconnected");
        }
      };

      this.ws.onerror = () => {
        // Triggers onclose next
      };
    } catch {
      this.scheduleReconnect();
    }
  }

  public disconnect(): void {
    this.isIntentionallyClosed = true;
    this.stopHeartbeat();
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.setStatus("disconnected");
  }

  public send(msg: WebSocketOutboundMessage): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(msg));
    }
  }

  /**
   * Triggers a scenario update across all subscribers.
   * If real WebSocket is connected, sends via socket.
   * If offline/mock mode, triggers synthetic inbound packet to keep UI fully live.
   */
  public triggerScenario(scenarioKey: ScenarioKey, deviceId: string = "crescent-vandalur-01"): void {
    setActiveMockScenario(scenarioKey);

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.send({
        action: "trigger_scenario",
        device_id: deviceId,
        scenario_key: scenarioKey,
      });
    }

    // Always broadcast locally so the demo feels immediately responsive
    const updatedReading: AirReading = getMockLatestReading(deviceId);
    this.lastMessageTimestamp = new Date();
    this.notifyMessage({
      type: "reading_update",
      device_id: deviceId,
      reading: updatedReading,
    });
    this.notifyMessage({
      type: "scenario_triggered",
      device_id: deviceId,
      scenario_key: scenarioKey,
      scenario_name: updatedReading.scenario,
      simulated_by: "FRONTEND_DEMO_KEYPAD",
    });
  }

  public addMessageListener(listener: MessageHandler): () => void {
    this.messageListeners.add(listener);
    return () => this.messageListeners.delete(listener);
  }

  public addStatusListener(listener: StatusHandler): () => void {
    this.statusListeners.add(listener);
    listener(this.status);
    return () => this.statusListeners.delete(listener);
  }

  private setStatus(status: LiveWSConnectionState): void {
    if (this.status === status) return;
    this.status = status;
    this.statusListeners.forEach((l) => l(status));
  }

  private notifyMessage(msg: WebSocketInboundMessage): void {
    this.messageListeners.forEach((l) => l(msg));
  }

  private scheduleReconnect(): void {
    if (this.isIntentionallyClosed) return;

    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      // Reached max attempts; mark as disconnected/offline
      this.setStatus("disconnected");
      return;
    }

    this.reconnectAttempts++;
    this.setStatus("reconnecting");

    // Exponential backoff with jitter: delay = base * 2^(attempts-1) + jitter
    const exp = Math.min(this.maxDelayMs, this.baseDelayMs * Math.pow(1.8, this.reconnectAttempts - 1));
    const jitter = Math.random() * 800;
    const delay = Math.round(exp + jitter);

    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.reconnectTimer = setTimeout(() => {
      this.connect(this.currentDeviceId);
    }, delay);
  }

  private startHeartbeat(): void {
    this.stopHeartbeat();
    this.pingInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.send({ action: "ping" });
      }
    }, 25000);
  }

  private stopHeartbeat(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }
}

// Singleton instance for the application
export const liveWebSocket = new LiveWebSocketManager();

