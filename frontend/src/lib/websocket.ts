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
      const wsUrl = authToken
        ? `${this.url}${this.url.includes("?") ? "&" : "?"}token=${encodeURIComponent(authToken)}`
        : `${this.url}${this.url.includes("?") ? "&" : "?"}public=true`;

      this.ws = new WebSocket(wsUrl);

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
          const data = JSON.parse(event.data);

          // Handle backend event format: { event, version, timestamp, data }
          if (data && data.event) {
            if (data.event === "heartbeat" || data.event === "ping") {
              this.send({ action: "ping" });
              return;
            }
            if (data.event === "connection.established") {
              return;
            }
            if (data.event === "reading.created" && data.data) {
              const rd = data.data;
              const transformedMsg: WebSocketInboundMessage = {
                type: "reading_update",
                device_id: rd.station_id || rd.device_id || this.currentDeviceId,
                reading: this._transformBackendReading(rd),
              };
              this.notifyMessage(transformedMsg);
              return;
            }
            if (data.event === "alert.created" && data.data) {
              this.notifyMessage({
                type: "alert_created",
                alert: data.data,
              } as any);
              return;
            }
            return;
          }

          // Handle frontend direct protocol format
          const msg = data as WebSocketInboundMessage;
          if (msg.type === "ping") {
            this.send({ action: "ping" });
            return;
          }
          this.notifyMessage(msg);
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
      this.setStatus("disconnected");
      return;
    }

    this.reconnectAttempts++;
    this.setStatus("reconnecting");

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

  private _transformBackendReading(rd: any): AirReading {
    const scenarioIdMap: Record<string, ScenarioKey> = {
      normal: "scenario_1_normal",
      traffic_congestion: "scenario_2_traffic",
      construction_dust: "scenario_3_construction",
      industrial_emissions: "scenario_4_industrial",
      waste_burning: "scenario_5_waste_burning",
      high_humidity: "scenario_6_humidity",
      smoke_event: "scenario_7_smoke",
      pollution_dispersal: "scenario_8_dispersal",
      extreme_pollution: "scenario_9_extreme",
    };

    const r = rd.readings || {};
    const aqi = typeof rd.aqi === "object" ? rd.aqi?.value ?? 0 : typeof rd.aqi === "number" ? rd.aqi : 0;
    const category = typeof rd.aqi === "object" ? rd.aqi?.category ?? "Good" : rd.aqi_category || "Good";
    const scenarioKey: ScenarioKey = scenarioIdMap[rd.scenario_id || "normal"] || "scenario_1_normal";

    return {
      reading_id: rd.reading_id || `rdg_${Date.now()}`,
      device_id: rd.device_id || rd.station_id || this.currentDeviceId,
      station_name: rd.station_name,
      timestamp: rd.timestamp ? new Date(rd.timestamp).toISOString() : new Date().toISOString(),
      source: (rd.data_source || "SIMULATED").toUpperCase() as any,
      data_status: "LIVE",
      scenario: scenarioKey,
      aqi,
      category: category as any,
      pollutants: {
        pm25: {
          value: r.pm25 ?? 0,
          unit: "µg/m³",
          sub_index: Math.min(500, Math.round((r.pm25 ?? 0) * 1.6)),
          safe_threshold: 60,
          description: "Fine inhalable particles ≤ 2.5 micrometers",
        },
        pm10: {
          value: r.pm10 ?? 0,
          unit: "µg/m³",
          sub_index: Math.min(500, Math.round((r.pm10 ?? 0) * 1.1)),
          safe_threshold: 100,
          description: "Inhalable coarse particles ≤ 10 micrometers",
        },
        no2: { value: 0, unit: "ppb", sub_index: 0, safe_threshold: 80, description: "Nitrogen Dioxide" },
        so2: { value: 0, unit: "ppb", sub_index: 0, safe_threshold: 80, description: "Sulfur Dioxide" },
        co: { value: 0, unit: "ppm", sub_index: 0, safe_threshold: 2.0, description: "Carbon Monoxide" },
        o3: { value: 0, unit: "ppb", sub_index: 0, safe_threshold: 100, description: "Ground-level Ozone" },
        voc: {
          value: r.mq135_raw ? Math.round(r.mq135_raw / 10) : 50,
          unit: "ppb",
          sub_index: null,
          safe_threshold: 300,
          description: "MQ135 Raw Gas Sensor (uncalibrated VOC proxy)",
        },
      },
      weather: {
        temperature: r.temperature ?? 28,
        humidity: r.humidity ?? 60,
        wind_speed: 12.8,
        wind_direction: "ENE",
        pressure: r.pressure ?? 1012,
      },
    };
  }
}

// Singleton instance for the application
export const liveWebSocket = new LiveWebSocketManager();
