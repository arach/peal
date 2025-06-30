// Example: Using Peal sounds in your application
import { peal } from '../peal.js';

// Play individual sounds
console.log('🔊 Playing success sound...');
peal.success();

setTimeout(() => {
  console.log('🔊 Playing error sound...');
  peal.error();
}, 1000);

setTimeout(() => {
  console.log('🔊 Playing notification with custom volume...');
  peal.play('notification', { volume: 0.5 });
}, 2000);

// Demonstrate looping
setTimeout(() => {
  console.log('🔊 Starting loading loop...');
  peal.play('loading', { loop: true, volume: 0.3 });
  
  // Stop after 3 seconds
  setTimeout(() => {
    console.log('🔊 Stopping loading loop...');
    peal.stop('loading');
    
    console.log('🔊 Playing completion sound...');
    peal.complete();
  }, 3000);
}, 3000);

// Demonstrate global controls
setTimeout(() => {
  console.log('🔊 Reducing global volume to 50%...');
  peal.setVolume(0.5);
  
  console.log('🔊 Playing tap sound...');
  peal.tap();
}, 7000);

setTimeout(() => {
  console.log('🔊 Muting all sounds...');
  peal.mute(true);
  
  console.log('🔊 Trying to play click (should be muted)...');
  peal.click();
  
  setTimeout(() => {
    console.log('🔊 Unmuting...');
    peal.mute(false);
    
    console.log('🔊 Playing click again...');
    peal.click();
  }, 1000);
}, 8000);

// Exit after demo
setTimeout(() => {
  console.log('\n✨ Demo complete!');
  process.exit(0);
}, 10000);