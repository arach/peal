import React, { useState } from 'react';
import { peal } from './peal';

// Example React component using Peal sounds
export function SoundDemo() {
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    peal.setVolume(newVolume);
  };

  const toggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    peal.mute(newMuted);
  };

  return (
    <div className="sound-demo">
      <h2>Peal Sound Effects Demo</h2>
      
      <div className="controls">
        <label>
          Volume: {Math.round(volume * 100)}%
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={handleVolumeChange}
          />
        </label>
        
        <button onClick={toggleMute}>
          {isMuted ? '🔇 Unmute' : '🔊 Mute'}
        </button>
      </div>

      <div className="sound-grid">
        <h3>UI Feedback</h3>
        <button onClick={() => peal.success()}>✅ Success</button>
        <button onClick={() => peal.error()}>❌ Error</button>
        <button onClick={() => peal.notification()}>🔔 Notification</button>
        <button onClick={() => peal.click()}>👆 Click</button>
        <button onClick={() => peal.tap()}>👇 Tap</button>

        <h3>Transitions</h3>
        <button onClick={() => peal.transition()}>➡️ Transition</button>
        <button onClick={() => peal.swoosh()}>💨 Swoosh</button>

        <h3>Loading</h3>
        <button onClick={() => peal.play('loading', { loop: true })}>
          ⏳ Start Loading
        </button>
        <button onClick={() => peal.stop('loading')}>⏹️ Stop Loading</button>
        <button onClick={() => peal.complete()}>✨ Complete</button>

        <h3>Alerts</h3>
        <button onClick={() => peal.alert()}>🚨 Alert</button>
        <button onClick={() => peal.warning()}>⚠️ Warning</button>

        <h3>Messages</h3>
        <button onClick={() => peal.message()}>💬 Message</button>
        <button onClick={() => peal.mention()}>@️ Mention</button>

        <h3>Interactive</h3>
        <button 
          onMouseEnter={() => peal.hover()}
          onClick={() => peal.select()}
        >
          🎯 Hover & Select
        </button>
        <button onClick={() => peal.toggle()}>🎚️ Toggle</button>

        <h3>System</h3>
        <button onClick={() => peal.startup()}>🚀 Startup</button>
        <button onClick={() => peal.shutdown()}>⏻ Shutdown</button>
        <button onClick={() => peal.unlock()}>🔓 Unlock</button>
      </div>
    </div>
  );
}