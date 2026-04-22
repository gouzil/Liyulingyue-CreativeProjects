import { useState, useCallback, useEffect, useRef } from 'react';
import { carApi } from '../../../api';
import type { Direction } from '../../../api';
import './index.css';

const CONTROLS: { direction: Direction; label: string; className: string }[] = [
  { direction: 'forward', label: '▲', className: 'btn-up' },
  { direction: 'left', label: '◀', className: 'btn-left' },
  { direction: 'stop', label: '■', className: 'btn-center' },
  { direction: 'right', label: '▶', className: 'btn-right' },
  { direction: 'backward', label: '▼', className: 'btn-down' },
];

const KEY_MAP: Record<string, Direction> = {
  w: 'forward', s: 'backward', a: 'left', d: 'right',
  W: 'forward', S: 'backward', A: 'left', D: 'right',
  ArrowUp: 'forward', ArrowDown: 'backward',
  ArrowLeft: 'left', ArrowRight: 'right',
  ' ': 'stop',
};

const PRESETS = [
  { label: 'Spin Left', direction: 'spin_left' as Direction },
  { label: 'Spin Right', direction: 'spin_right' as Direction },
];

export const RobotController = () => {
  const [speed, setSpeed] = useState(50);
  const [activeDir, setActiveDir] = useState<Direction | null>(null);
  const [manualMode, setManualMode] = useState(false);
  const [leftSpeed, setLeftSpeed] = useState(0);
  const [rightSpeed, setRightSpeed] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback(async (direction: Direction) => {
    setActiveDir(direction);
    try {
      await carApi.move({ direction, speed });
    } catch (err) {
      console.error('[RobotController] move error:', err);
    }
  }, [speed]);

  const handleStop = useCallback(async () => {
    setActiveDir(null);
    try {
      await carApi.stop();
    } catch (err) {
      console.error('[RobotController] stop error:', err);
    }
  }, []);

  const handleManualControl = useCallback(async () => {
    try {
      await carApi.manual({ l_speed: leftSpeed, r_speed: rightSpeed });
    } catch (err) {
      console.error('[RobotController] manual error:', err);
    }
  }, [leftSpeed, rightSpeed]);

  useEffect(() => {
    if (!manualMode) return;
    handleManualControl();
  }, [manualMode, leftSpeed, rightSpeed, handleManualControl]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (manualMode) return;
      const dir = KEY_MAP[e.key];
      if (!dir) return;
      e.preventDefault();
      handleMove(dir);
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (manualMode) return;
      if (KEY_MAP[e.key]) {
        e.preventDefault();
        handleStop();
      }
    };

    const el = containerRef.current;
    if (el) {
      el.addEventListener('keydown', onKeyDown);
      el.addEventListener('keyup', onKeyUp);
      el.setAttribute('tabindex', '0');
      el.focus();
    }
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    return () => {
      if (el) {
        el.removeEventListener('keydown', onKeyDown);
        el.removeEventListener('keyup', onKeyUp);
      }
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [handleMove, handleStop, manualMode]);

  return (
    <div className="controller-container" ref={containerRef}>
      <div className="control-panel">
        <div className="panel-header">
          <h3>Robot Control</h3>
          <button
            className={`mode-toggle ${manualMode ? 'active' : ''}`}
            onClick={() => setManualMode(!manualMode)}
          >
            {manualMode ? 'Manual' : 'Simple'}
          </button>
        </div>

        {!manualMode ? (
          <>
            <div className="speed-control">
              <label>Speed: {speed}%</label>
              <input
                type="range"
                min="10"
                max="100"
                value={speed}
                onChange={e => setSpeed(Number(e.target.value))}
                className="speed-slider"
              />
            </div>

            <div className="control-grid">
              {CONTROLS.map(c => (
                <button
                  key={c.direction}
                  className={`control-btn ${c.className} ${activeDir === c.direction ? 'active' : ''}`}
                  onMouseDown={() => handleMove(c.direction)}
                  onMouseUp={handleStop}
                  onMouseLeave={handleStop}
                >
                  {c.label}
                </button>
              ))}
            </div>

            <div className="preset-controls">
              {PRESETS.map(p => (
                <button
                  key={p.direction}
                  className={`control-btn preset ${activeDir === p.direction ? 'active' : ''}`}
                  onMouseDown={() => handleMove(p.direction)}
                  onMouseUp={handleStop}
                  onMouseLeave={handleStop}
                >
                  {p.label}
                </button>
              ))}
            </div>

            <div className="keyboard-hint">
              <span>Use: W/S/A/D or Arrow Keys, Space to stop</span>
            </div>
          </>
        ) : (
          <div className="manual-control">
            <div className="motor-control">
              <label>Left Motor: {leftSpeed > 0 ? '+' : ''}{leftSpeed}</label>
              <input
                type="range"
                min="-100"
                max="100"
                value={leftSpeed}
                onChange={e => setLeftSpeed(Number(e.target.value))}
                className="motor-slider left"
              />
            </div>
            <div className="motor-control">
              <label>Right Motor: {rightSpeed > 0 ? '+' : ''}{rightSpeed}</label>
              <input
                type="range"
                min="-100"
                max="100"
                value={rightSpeed}
                onChange={e => setRightSpeed(Number(e.target.value))}
                className="motor-slider right"
              />
            </div>
            <div className="manual-presets">
              <button
                className="preset-btn"
                onClick={() => { setLeftSpeed(0); setRightSpeed(0); }}
              >
                Stop
              </button>
              <button
                className="preset-btn"
                onClick={() => { setLeftSpeed(speed); setRightSpeed(speed); }}
              >
                Forward
              </button>
              <button
                className="preset-btn"
                onClick={() => { setLeftSpeed(-speed); setRightSpeed(-speed); }}
              >
                Backward
              </button>
              <button
                className="preset-btn"
                onClick={() => { setLeftSpeed(-speed); setRightSpeed(speed); }}
              >
                Spin Left
              </button>
              <button
                className="preset-btn"
                onClick={() => { setLeftSpeed(speed); setRightSpeed(-speed); }}
              >
                Spin Right
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
