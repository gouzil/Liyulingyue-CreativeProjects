import { useState, useCallback } from 'react';
import { carApi } from '../../../api';
import './index.css';

const PRESET_NOTES = [
  { freq: 262, label: 'C4' },
  { freq: 294, label: 'D4' },
  { freq: 330, label: 'E4' },
  { freq: 392, label: 'G4' },
  { freq: 440, label: 'A4' },
  { freq: 523, label: 'C5' },
];

export const BuzzerControl = () => {
  const [isOn, setIsOn] = useState(false);
  const [isBeeping, setIsBeeping] = useState(false);
  const [frequency, setFrequency] = useState(440);

  const handleToggle = useCallback(async () => {
    try {
      const action = isOn ? 'off' : 'on';
      await carApi.buzzer({ action, frequency });
      setIsOn(!isOn);
    } catch (err) {
      console.error('[BuzzerControl] toggle error:', err);
    }
  }, [isOn, frequency]);

  const handleBeep = useCallback(async () => {
    if (isBeeping) return;
    setIsBeeping(true);
    try {
      await carApi.buzzer({ action: 'beep', frequency });
    } catch (err) {
      console.error('[BuzzerControl] beep error:', err);
    } finally {
      setTimeout(() => setIsBeeping(false), 300);
    }
  }, [isBeeping, frequency]);

  const handleFrequencyChange = useCallback(async (freq: number) => {
    setFrequency(freq);
    try {
      await carApi.buzzer({ action: 'set_freq', frequency: freq });
    } catch (err) {
      console.error('[BuzzerControl] set_freq error:', err);
    }
  }, []);

  return (
    <div className="buzzer-container">
      <div className="buzzer-header">
        <h3>Buzzer</h3>
        <span className="buzzer-freq">{frequency} Hz</span>
      </div>

      <div className="buzzer-controls">
        <button
          className={`buzzer-btn toggle ${isOn ? 'active' : ''}`}
          onClick={handleToggle}
        >
          {isOn ? 'ON' : 'OFF'}
        </button>
        <button
          className={`buzzer-btn beep ${isBeeping ? 'active' : ''}`}
          onClick={handleBeep}
          disabled={isBeeping}
        >
          BEEP
        </button>
        <button
          className={`buzzer-btn long ${isOn ? 'active' : ''}`}
          onClick={handleToggle}
        >
          LONG
        </button>
      </div>

      <div className="freq-control">
        <input
          type="range"
          min="100"
          max="1000"
          value={frequency}
          onChange={e => handleFrequencyChange(Number(e.target.value))}
          className="freq-slider"
        />
        <div className="freq-presets">
          {PRESET_NOTES.map(n => (
            <button
              key={n.freq}
              className={`freq-preset ${frequency === n.freq ? 'active' : ''}`}
              onClick={() => handleFrequencyChange(n.freq)}
            >
              {n.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
