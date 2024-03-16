let playerchannel = new BroadcastChannel('player');
 
let player = {
    play: (track) => {
        playerchannel.postMessage({ type: 'play', track });
    },
    stop: () => {
        playerchannel.postMessage({ type: 'stop' });
    },
    seek: (time) => {
        playerchannel.postMessage({ type: 'seek', time });
    },
    prevTrack: () => {
        playerchannel.postMessage({ type: 'prevTrack' });
    },
    nextTrack: () => {
        playerchannel.postMessage({ type: 'nextTrack' });
    },
    thereisNextTrack: () => {
        playerchannel.postMessage({ type: 'thereisNextTrack' });
    }
}