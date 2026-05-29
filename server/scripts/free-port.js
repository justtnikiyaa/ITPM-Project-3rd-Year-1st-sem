const { execSync } = require('child_process');

const port = Number(process.env.PORT) || 5000;

function run(command) {
    return execSync(command, { stdio: ['ignore', 'pipe', 'ignore'] })
        .toString()
        .trim();
}

function freePortWindows(targetPort) {
    try {
        const output = run(`netstat -ano -p tcp | findstr :${targetPort}`);
        const lines = output
            .split(/\r?\n/)
            .map((line) => line.trim())
            .filter(Boolean)
            .filter((line) => line.includes('LISTENING'));

        const pids = [...new Set(lines.map((line) => line.split(/\s+/).pop()).filter(Boolean))];

        if (pids.length === 0) {
            console.log(`[dev] Port ${targetPort} is already free.`);
            return;
        }

        for (const pid of pids) {
            if (String(process.pid) === String(pid)) continue;
            try {
                execSync(`taskkill /PID ${pid} /F`, { stdio: 'ignore' });
                console.log(`[dev] Stopped process ${pid} on port ${targetPort}.`);
            } catch {
                // Ignore failures to avoid blocking developer workflow.
            }
        }
    } catch {
        console.log(`[dev] Port ${targetPort} is already free.`);
    }
}

function freePortPosix(targetPort) {
    try {
        const output = run(`lsof -ti tcp:${targetPort}`);
        const pids = [...new Set(output.split(/\r?\n/).map((v) => v.trim()).filter(Boolean))];

        if (pids.length === 0) {
            console.log(`[dev] Port ${targetPort} is already free.`);
            return;
        }

        for (const pid of pids) {
            if (String(process.pid) === String(pid)) continue;
            try {
                execSync(`kill -9 ${pid}`, { stdio: 'ignore' });
                console.log(`[dev] Stopped process ${pid} on port ${targetPort}.`);
            } catch {
                // Ignore failures to avoid blocking developer workflow.
            }
        }
    } catch {
        console.log(`[dev] Port ${targetPort} is already free.`);
    }
}

if (process.platform === 'win32') {
    freePortWindows(port);
} else {
    freePortPosix(port);
}
