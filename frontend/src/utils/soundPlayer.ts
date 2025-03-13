/**
 * Utility for playing notification sounds with strict duration control
 */

// We'll use a single audio instance to avoid multiple sounds playing
let activeAudio: HTMLAudioElement | null = null;
let stopTimeout: number | null = null;

/**
 * Force stop any currently playing sound
 */
const stopAllSounds = () => {
  if (activeAudio) {
    activeAudio.pause();
    activeAudio.currentTime = 0;
    activeAudio = null;
  }
  
  if (stopTimeout !== null) {
    window.clearTimeout(stopTimeout);
    stopTimeout = null;
  }
};

/**
 * Play a sound with a maximum duration
 * @param soundUrl URL of the sound file
 * @param maxDuration Maximum duration in seconds
 */
export const playSound = (soundUrl: string, maxDuration: number = 4): void => {
  // Stop any currently playing sound
  stopAllSounds();
  
  try {
    // Create new audio
    activeAudio = new Audio(soundUrl);
    
    // Set volume to ensure it's not too loud
    activeAudio.volume = 0.7;
    
    // Make sure it stops after maxDuration
    stopTimeout = window.setTimeout(() => {
      stopAllSounds();
    }, maxDuration * 1000);
    
    // Start playing
    activeAudio.play().catch(error => {
      console.warn('Audio play failed:', error);
      stopAllSounds();
    });
  } catch (error) {
    console.error('Error creating audio:', error);
    stopAllSounds();
  }
};

// Make sure sounds stop when page changes/unloads
window.addEventListener('beforeunload', stopAllSounds);
window.addEventListener('pagehide', stopAllSounds);

export default {
  play: playSound,
  stop: stopAllSounds
};
