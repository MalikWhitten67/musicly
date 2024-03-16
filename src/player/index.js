class MusicPlayer{
    states = {
        currentSong: null,
        autoplay: true,
        currentTrack: {
            title: 'No Song Playing',
            artist: 'Musicly',
            album: 'No Album',
            thumbnail: 'https://via.placeholder.com/150'
        },
        currentPlaylist: JSON.parse(sessionStorage.getItem('currentPlayList')) || [],
        currentPlaylistName: sessionStorage.getItem('currentPlaylistName') || 'My Playlist',
        currentDuration: 0,
        currentProgress: 0,
        audioElement: null,
        audio:'',
        Iseeking: false,
        device:{
            isIOS: /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream,
        }
    }
    events = {}

    constructor(){
        this.audio = new Audio(); 
        this.audio.addEventListener('error', (e) => {
            console.log(e.target.error)
             let code = e.target.error.code;
             if(code === 4 && this.thereisNextTrack()){
                 this.audio.onended()
             }else{ 
                this.stop();
             }
        });
        this.audio.src = 'data:audio/mpeg;base64,SUQzBAAAAAABEVRYWFgAAAAtAAADY29tbWVudABCaWdTb3VuZEJhbmsuY29tIC8gTGFTb25vdGhlcXVlLm9yZwBURU5DAAAAHQAAA1N3aXRjaCBQbHVzIMKpIE5DSCBTb2Z0d2FyZQBUSVQyAAAABgAAAzIyMzUAVFNTRQAAAA8AAANMYXZmNTcuODMuMTAwAAAAAAAAAAAAAAD/80DEAAAAA0gAAAAATEFNRTMuMTAwVVVVVVVVVVVVVUxBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zQsRbAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zQMSkAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV'
 
        this.audio.addEventListener('ended', () => { 
            this.events['songEnded'] && this.events['songEnded']();
            if(document.visibilityState !== 'visible')  {
                this.audio.src = 'data:audio/mpeg;base64,SUQzBAAAAAABEVRYWFgAAAAtAAADY29tbWVudABCaWdTb3VuZEJhbmsuY29tIC8gTGFTb25vdGhlcXVlLm9yZwBURU5DAAAAHQAAA1N3aXRjaCBQbHVzIMKpIE5DSCBTb2Z0d2FyZQBUSVQyAAAABgAAAzIyMzUAVFNTRQAAAA8AAANMYXZmNTcuODMuMTAwAAAAAAAAAAAAAAD/80DEAAAAA0gAAAAATEFNRTMuMTAwVVVVVVVVVVVVVUxBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zQsRbAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zQMSkAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV'
            }
        });
          
        this.audio.onplaying = () => {
            let recentlyPlayed = JSON.parse(localStorage.getItem('recentlyPlayed')) || [];
            if(!recentlyPlayed.find(track => track.thumbnail === this.states.currentTrack.thumbnail)){
               recentlyPlayed.push(this.states.currentTrack);
               localStorage.setItem('recentlyPlayed', JSON.stringify(recentlyPlayed));
            }
        }

     
        
    }

    /**
     *  @description adds audio handlers for ui updates
     */
    bindNavigatorEvents = () => {
        navigator.mediaSession.setActionHandler('play', () => this.play());
        navigator.mediaSession.setActionHandler('pause', () => this.stop());
        navigator.mediaSession.setActionHandler('seekbackward', () => this.seek(this.audio.currentTime - 10));
        navigator.mediaSession.setActionHandler('seekforward', () => this.seek(this.audio.currentTime + 10));
        navigator.mediaSession.setActionHandler('previoustrack', () => this.prevTrack());
        navigator.mediaSession.setActionHandler('nexttrack', () => this.nextTrack());
        navigator.mediaSession.setActionHandler('stop', () => this.stop());
        navigator.mediaSession.setActionHandler('seekto', (details) => this.seek(details.seekTime)); 
    }

    /**
     * 
     * @returns {url:string, title:string, artist:string, album:string, thumbnail:string}
     */
    getNextTrack = () => {
        let currentIndex = this.states.currentPlaylist.findIndex(track => track.thumbnail === this.states.currentTrack.thumbnail);
        let nextIndex = currentIndex + 1;
        return  {
            url: this.states.currentPlaylist[nextIndex].url,
            title: this.states.currentPlaylist[nextIndex].title,
            artist: this.states.currentPlaylist[nextIndex].artist,
            album: this.states.currentPlaylist[nextIndex].album,
            thumbnail: this.states.currentPlaylist[nextIndex].thumbnail
        }
    }

    setMetaData = (metadata) => {
        navigator.mediaSession.metadata = new MediaMetadata({
            title: metadata.title,
            artist: metadata.artist + ' - Musicly', // 'artist' is actually 'by' in the UI, but 'artist' is the correct term for the API
            album: metadata.album,
            artwork: [
                { src: metadata.thumbnail, sizes: '96x96', type: 'image/jpg' },
                { src: metadata.thumbnail, sizes: '128x128', type: 'image/jpg' },
                { src: metadata.thumbnail, sizes: '192x192', type: 'image/jpg' },
                { src: metadata.thumbnail, sizes: '256x256', type: 'image/jpg' },
                { src: metadata.thumbnail, sizes: '384x384', type: 'image/jpg' },
                { src: metadata.thumbnail, sizes: '512x512', type: 'image/jpg' },
            ]
        });
    }

    play = (track, metadata) => {  
        this.audio.src = track 
        this.setMetaData(metadata);
        this.audio.play();  
        this.states.currentTrack = metadata;   
        if(this.audio.currentTime === 0)  this.events['songStarted'] && this.events['songStarted'](); 
        else this.events['songResumed'] && this.events['songResumed']();
            
    }
    stop = () => {
        this.audio.pause();
        this.events['songStopped'] && this.events['songStopped'](); 
    }

    seek = (time) => {  
        if(!this.audio.paused)   this.stop();
        this.audio.currentTime = time;
        window.dispatchEvent(new CustomEvent('seeked', { detail: time })); 
        this.events['seeked'] && this.events['seeked']();
        
    }

    formatTime = (time) => {
        let minutes = Math.floor(time / 60);
        let seconds = Math.floor(time % 60);
        seconds = seconds < 10 ? '0' + seconds : seconds;
        return `${minutes}:${seconds}`;
    }
    
    prevTrack = () => {
        this.stop();
        const currentIndex = this.states.currentPlaylist.findIndex(track => track.thumbnail === this.states.currentTrack.thumbnail);
        let prevIndex =  currentIndex - 1;
        if(prevIndex < 0) prevIndex = this.states.currentPlaylist.length - 1;
        this.states.currentTrack = this.states.currentPlaylist[prevIndex];
        this.play(this.states.currentTrack.url, {
            title: this.states.currentTrack.title,
            artist: this.states.currentTrack.artist,
            album: this.states.currentTrack.album,
            thumbnail: this.states.currentTrack.thumbnail
        })
        this.events['newTrack'] && this.events['newTrack']();
        return this.states.currentTrack;
    }

    thereisNextTrack = () => {
       try {
        let currentIndex = this.states.currentPlaylist.findIndex(track => track.thumbnail === this.states.currentTrack.thumbnail);
        return  currentIndex + 1 < this.states.currentPlaylist.length;
       } catch (error) {
         return false;
       }
    }

    on = (event, callback) => {
        this.events[event] = callback.bind(this);
    }

    resetPlaylist = () => {
        this.states.currentPlaylist = JSON.parse(sessionStorage.getItem('currentPlayList')) || [];
    }

    nextTrack = () => {    
          let isEnd;
          let currentIndex = this.states.currentPlaylist.findIndex(track => track.thumbnail === this.states.currentTrack.thumbnail);
          if(currentIndex + 1 === this.states.currentPlaylist.length) isEnd = true;
          let nextIndex = isEnd ? 0 : currentIndex + 1;
          this.states.currentTrack = this.states.currentPlaylist[nextIndex];
          return this.states.currentPlaylist[nextIndex];
    }
    
    
    loop = (loop) => {
         this.states.loop = loop;
    }
}

const musicPlayer = new MusicPlayer();
export default musicPlayer;