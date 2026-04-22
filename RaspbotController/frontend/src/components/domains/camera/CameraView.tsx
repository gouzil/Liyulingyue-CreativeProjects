import { useEffect, useRef, useState, useCallback } from 'react';
import { cameraApi } from '../../../api';
import './index.css';

type CameraMode = 'snapshot' | 'stream';

export const CameraView = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const pollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortedRef = useRef(false);
  const [enabled, setEnabled] = useState(true);
  const [connected, setConnected] = useState(false);
  const [quality, setQuality] = useState(80);
  const [mode, setMode] = useState<CameraMode>('snapshot');

  const stopFetching = useCallback(() => {
    if (pollTimerRef.current) {
      clearTimeout(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  }, []);

  const fetchFrame = useCallback(async () => {
    if (abortedRef.current || !enabled) return;
    try {
      const resp = await fetch(cameraApi.getSnapshotUrl(quality));
      if (!resp.ok || abortedRef.current) return;
      const blob = await resp.blob();
      const url = URL.createObjectURL(blob);
      const img = new Image();
      img.onload = () => {
        if (abortedRef.current) { URL.revokeObjectURL(url); return; }
        const canvas = canvasRef.current;
        if (!canvas) { URL.revokeObjectURL(url); return; }
        canvas.width = img.width;
        canvas.height = img.height;
        canvas.getContext('2d')!.drawImage(img, 0, 0);
        URL.revokeObjectURL(url);
        setConnected(true);
      };
      img.onerror = () => {
        setConnected(false);
      };
      img.src = url;
    } catch {
      setConnected(false);
    }
    if (!abortedRef.current && enabled) {
      pollTimerRef.current = setTimeout(fetchFrame, 300);
    }
  }, [quality, enabled]);

  const startStreamMode = useCallback(async () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }

    try {
      const video = videoRef.current;
      if (!video) return;

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
        audio: false,
      });

      streamRef.current = stream;
      video.srcObject = stream;
      await video.play();
      setConnected(true);
    } catch {
      setConnected(false);
      setMode('snapshot');
    }
  }, []);

  const stopStreamMode = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  }, []);

  useEffect(() => {
    abortedRef.current = true;
    stopFetching();
    stopStreamMode();
  }, [stopFetching, stopStreamMode]);

  useEffect(() => {
    if (!enabled) {
      stopFetching();
      setConnected(false);
      abortedRef.current = true;
      return;
    }

    abortedRef.current = false;

    if (mode === 'snapshot') {
      fetchFrame();
    } else {
      startStreamMode();
    }

    return () => {
      abortedRef.current = true;
      if (mode === 'snapshot') {
        stopFetching();
      } else {
        stopStreamMode();
      }
    };
  }, [enabled, mode, quality, fetchFrame, startStreamMode, stopFetching, stopStreamMode]);

  useEffect(() => {
    return () => {
      abortedRef.current = true;
      stopFetching();
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [stopFetching]);

  const toggleCamera = useCallback(() => {
    setEnabled(prev => !prev);
  }, []);

  const handleQualityChange = useCallback((newQuality: number) => {
    setQuality(newQuality);
  }, []);

  const handleModeChange = useCallback((newMode: CameraMode) => {
    setMode(newMode);
  }, []);

  return (
    <div className="camera-container">
      <div className="camera-header">
        <h3>Camera</h3>
        <div className="camera-controls">
          <button
            className={`camera-toggle ${enabled ? 'on' : 'off'}`}
            onClick={toggleCamera}
            title={enabled ? 'Disable Camera' : 'Enable Camera'}
          >
            {enabled ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>

      <div className="camera-settings">
        <div className="setting-group">
          <label>Mode</label>
          <div className="mode-selector">
            <button
              className={`mode-btn ${mode === 'snapshot' ? 'active' : ''}`}
              onClick={() => handleModeChange('snapshot')}
            >
              Snapshot
            </button>
            <button
              className={`mode-btn ${mode === 'stream' ? 'active' : ''}`}
              onClick={() => handleModeChange('stream')}
            >
              Stream
            </button>
          </div>
        </div>

        {mode === 'snapshot' && (
          <div className="setting-group">
            <label>Quality: {quality}%</label>
            <input
              type="range"
              min="30"
              max="100"
              value={quality}
              onChange={e => handleQualityChange(Number(e.target.value))}
              className="quality-slider"
            />
          </div>
        )}
      </div>

      <div className={`camera-frame ${!enabled ? 'disabled' : ''}`}>
        {mode === 'snapshot' ? (
          <canvas ref={canvasRef} />
        ) : (
          <video ref={videoRef} playsInline muted />
        )}
        {!enabled && (
          <div className="camera-overlay">
            <span>Camera Off</span>
          </div>
        )}
      </div>

      <div className="camera-status">
        <span className={`status-indicator ${connected && enabled ? 'connected' : 'disconnected'}`}>
          {connected && enabled ? '● Live' : enabled ? '○ Connecting...' : '○ Disabled'}
        </span>
      </div>
    </div>
  );
};
