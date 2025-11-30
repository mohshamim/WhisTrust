import * as http from 'http';

/**
 * Check if a port is responding (simplified check)
 */
async function checkPort(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const req = http.get(`http://localhost:${port}`, { timeout: 1500 }, (res) => {
      // If we get a response (even 404), the server is running
      resolve(res.statusCode !== undefined);
      res.destroy(); // Close immediately to save time
    });
    
    req.on('error', () => resolve(false));
    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });
  });
}

/**
 * Find the first available port where WhisTrust app is running
 * Prioritizes port 3001, then checks other ports
 */
export async function findWhisTrustPort(): Promise<number> {
  // First, check if TEST_BASE_URL is set
  const envUrl = process.env.TEST_BASE_URL;
  if (envUrl) {
    const match = envUrl.match(/localhost:(\d+)/);
    if (match) {
      const port = parseInt(match[1]);
      if (await checkPort(port)) {
        console.log(`Using TEST_BASE_URL: ${envUrl}`);
        return port;
      }
      console.warn(
        `TEST_BASE_URL ${envUrl} is unreachable. Falling back to automatic port detection.`
      );
    }
  }

  // Prioritize 3000, then check other ports
  const ports = [3000, 3001, 3002, 3003, 3004];
  
  for (const port of ports) {
    const isAvailable = await checkPort(port);
    if (isAvailable) {
      console.log(`Detected WhisTrust running on port ${port}`);
      return port;
    }
  }
  
  // Default to 3000 if none found (most common case)
  console.log('No WhisTrust app detected, defaulting to port 3000');
  return 3000;
}

