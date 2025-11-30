import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface VideoRecordingConfig {
  resultsDir: string;
  testName: string;
}

/**
 * Enable video recording in Playwright config
 * Videos are automatically saved by Playwright when --video flag is used
 */
export async function enableVideoRecording(config: VideoRecordingConfig): Promise<void> {
  // Playwright automatically records videos when --video=on flag is used
  // The videos are saved in test-results directory
  // We just need to ensure the directory exists
  const videoDir = path.join(config.resultsDir, 'videos');
  if (!fs.existsSync(videoDir)) {
    fs.mkdirSync(videoDir, { recursive: true });
  }
}

/**
 * Move video files to results directory after test completion
 */
export async function moveVideosToResults(
  testResultsDir: string,
  resultsDir: string
): Promise<string[]> {
  const videosDir = path.join(resultsDir, 'videos');
  if (!fs.existsSync(videosDir)) {
    fs.mkdirSync(videosDir, { recursive: true });
  }
  
  const videoFiles: string[] = [];
  
  // Find all video files in test-results
  if (fs.existsSync(testResultsDir)) {
    const findVideos = (dir: string) => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory()) {
          findVideos(fullPath);
        } else if (entry.name.endsWith('.webm') || entry.name.endsWith('.mp4')) {
          const destPath = path.join(videosDir, entry.name);
          fs.copyFileSync(fullPath, destPath);
          videoFiles.push(destPath);
        }
      }
    };
    
    findVideos(testResultsDir);
  }
  
  return videoFiles;
}

/**
 * Convert webm to mp4 (if needed)
 */
export async function convertVideoToMP4(webmPath: string): Promise<string | null> {
  if (!webmPath.endsWith('.webm')) {
    return null;
  }
  
  const mp4Path = webmPath.replace('.webm', '.mp4');
  
  try {
    // Check if ffmpeg is available
    await execAsync('ffmpeg -version');
    
    // Convert webm to mp4
    await execAsync(
      `ffmpeg -i "${webmPath}" -c:v libx264 -c:a aac "${mp4Path}" -y`
    );
    
    // Remove original webm if conversion successful
    if (fs.existsSync(mp4Path)) {
      fs.unlinkSync(webmPath);
      return mp4Path;
    }
  } catch (error) {
    // ffmpeg not available or conversion failed
    console.warn('Video conversion failed, using webm format:', error);
  }
  
  return null;
}

