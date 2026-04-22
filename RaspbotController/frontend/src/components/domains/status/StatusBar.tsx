import { useHealthCheck } from '../../../hooks/useHealthCheck';
import './index.css';

export const StatusBar = () => {
  const health = useHealthCheck();

  return (
    <div className="status-bar">
      <div className="status-section">
        <span className="section-label">System</span>
        <div className="status-items">
          <div className="status-item">
            <span className={`dot ${health?.car ? 'green' : 'red'}`}></span>
            <span>Car {health?.car ? 'Ready' : 'Offline'}</span>
          </div>
          <div className="status-item">
            <span className={`dot ${health?.camera ? 'green' : 'red'}`}></span>
            <span>Camera {health?.camera ? 'Ready' : 'Offline'}</span>
          </div>
        </div>
      </div>
      <div className="status-section">
        <span className="section-label">Connection</span>
        <div className="status-items">
          <div className="status-item">
            <span className={`dot ${health ? 'green' : 'red'}`}></span>
            <span>{health ? 'Connected' : 'Disconnected'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
