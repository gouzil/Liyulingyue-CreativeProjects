import { StatusBar } from './components/domains/status';
import { CameraView } from './components/domains/camera';
import { RobotController } from './components/domains/robot';
import { ServoControl } from './components/domains/servo';
import { BuzzerControl } from './components/domains/buzzer';
import './App.css';

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>Raspbot Controller</h1>
        <p className="app-subtitle">Robot Control System</p>
      </header>

      <main className="app-main">
        <StatusBar />

        <div className="content-grid">
          <div className="left-panel">
            <CameraView />
            <ServoControl />
          </div>

          <div className="right-panel">
            <RobotController />
            <BuzzerControl />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
