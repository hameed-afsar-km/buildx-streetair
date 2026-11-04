"use client";

import { useEffect, useState, useCallback } from "react";
import { AirReading, LiveWSConnectionState, ScenarioKey, WebSocketInboundMessage } from "@/lib/types";
import { liveWebSocket } from "@/lib/websocket";
import { getLatestReading } from "@/lib/api/endpoints";

interface UseLiveWebSocketOptions {
  deviceId?: string;
  initialReading?: AirReading;
  autoConnect?: boolean;
}

export function useLiveWebSocket({
  deviceId = "crescent-vandalur-01",
  initialReading,
  autoConnect = true,
}: UseLiveWebSocketOptions = {}) {
  const [reading, setReading] = useState<AirReading | null>(initialReading || null);
  const [connectionStatus, setConnectionStatus] = useState<LiveWSConnectionState>(
    liveWebSocket.getStatus()
  );
  const [lastUpdateTime, setLastUpdateTime] = useState<Date | null>(
    liveWebSocket.getLastMessageTime() || (initialReading ? new Date(initialReading.timestamp) : null)
  );

  // Fallback initial fetch if not provided
  useEffect(() => {
    if (!reading) {
      getLatestReading(deviceId).then((r) => {
        setReading(r);
        setLastUpdateTime(new Date(r.timestamp));
      });
    }
  }, [deviceId, reading]);

  useEffect(() => {
    if (autoConnect) {
      liveWebSocket.connect(deviceId);
    }

    const removeStatusListener = liveWebSocket.addStatusListener((status) => {
      setConnectionStatus(status);
    });

    const removeMessageListener = liveWebSocket.addMessageListener((msg: WebSocketInboundMessage) => {
      if (msg.type === "reading_update") {
        if (!deviceId || msg.device_id === deviceId) {
          setReading(msg.reading);
          setLastUpdateTime(new Date(msg.reading.timestamp));
        }
      } else if (msg.type === "scenario_triggered") {
        if (!deviceId || msg.device_id === deviceId) {
          // Re-fetch latest reading corresponding to the new scenario
          getLatestReading(deviceId).then((r) => {
            setReading(r);
            setLastUpdateTime(new Date());
          });
        }
      }
    });

    return () => {
      removeStatusListener();
      removeMessageListener();
    };
  }, [deviceId, autoConnect]);

  const triggerScenario = useCallback(
    (key: ScenarioKey) => {
      liveWebSocket.triggerScenario(key, deviceId);
    },
    [deviceId]
  );

  return {
    reading,
    connectionStatus,
    lastUpdateTime,
    triggerScenario,
    isLive: connectionStatus === "connected" || connectionStatus === "stale",
  };
}

