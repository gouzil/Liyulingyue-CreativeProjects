const os = require('os');
const pty = require('node-pty');

const shell = process.env.SHELL_PATH || (os.platform() === 'win32' ? 'powershell.exe' : '/bin/bash');
const initialCols = parseInt(process.env.PTY_COLS || '80');
const initialRows = parseInt(process.env.PTY_ROWS || '24');
const cwd = process.env.PTY_CWD || process.cwd();

const ptyProcess = pty.spawn(shell, [], {
  name: 'xterm-color',
  cols: initialCols,
  rows: initialRows,
  cwd: cwd,
  env: process.env
});

ptyProcess.onData((data) => {
  process.stdout.write(data);
});

ptyProcess.onExit(({ exitCode, signal }) => {
  process.exit(exitCode || 0);
});

let inputBuffer = '';
process.stdin.on('data', (chunk) => {
  inputBuffer += chunk.toString('utf8');
  let lineEnd;
  while ((lineEnd = inputBuffer.indexOf('\n')) !== -1) {
    const line = inputBuffer.substring(0, lineEnd).trim();
    inputBuffer = inputBuffer.substring(lineEnd + 1);
    if (!line) continue;
    try {
      const msg = JSON.parse(line);
      if (msg.type === 'input') {
        ptyProcess.write(msg.data);
      } else if (msg.type === 'resize') {
        if (msg.cols > 0 && msg.rows > 0) {
          ptyProcess.resize(msg.cols, msg.rows);
        }
      }
    } catch (e) {
      // Ignore parse errors
    }
  }
});

process.stdout.on('error', (err) => {
  if (err.code === 'EPIPE') process.exit(0);
});
