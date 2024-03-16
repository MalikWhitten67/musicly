import Component from "../../utils/components.js";
import youtube from "../../../../src/js/index.js";
class SongPlayer extends Component{
    constructor() {
        super();
    }

    state = { 
        audioState: {currentTime: 0, duration: 0},
        loaded: false,
        isPlaying: true,
    }

    style = `

    *{
        font-family:  sans-serif;
    }
     .container{
        display: flex; 
        flex-direction: column;  
     }
     .rounded{
        border-radius: 20px;
        width: 100%; 
     }
      
    .rounded-full{
        border-radius: 50%;   
    }
     .flex{
        display: flex;
        justify-content: space-between;
        align-items: center;
     }
     .p-2{
        padding: 10px;
     }

     .song_progress{
        width: 100%;
        border: none;
        height: 5px;
        border-radius:  20px;
        color: #000;
        background: #eee;
        margin-bottom: 10px;
        margin-top: 10px; 
     }
     input[type=range] { 
        appearance: none;
        width: 100%;    
        background: #eee;
      }
     .song_progress::-webkit-slider-thumb{ 
        width:0 px;
        height: 0;
        border-radius: 50%;
        background: #000;
     }
     .song_progress::-moz-range-thumb{
        width: 0;
        height:  0;
        border-radius: 50%;
        background: #000;
     }  

     .song_thumbnail{
        width:  360px;
        justify-content: center; 
        align-items: center; 
        display: flex;
        object-fit: contain;
     }

     .mt-12{
        margin-top: 6rem;
     }
    .mt-6{
        margin-top: 3rem;
    }

    .w-6{
        width: 30px;
    }
    `
    render(){ 
        let title = new URLSearchParams(window.location.search).get('title')
        let thumbnail = new URLSearchParams(window.location.search).get('thumbnail')
        let artist = new URLSearchParams(window.location.search).get('artist') 
        return `
             <div>
             <div class="container mt-6">  
                 <div style="width: 100%; height: 300px; padding:15px;  display: flex; justify-content: center; align-items: center;">
                  <div>
                  <img src="${thumbnail}" alt="song" class="rounded-md  song_thumbnail"/>
                  <p>${youtube.formatDuration(this.state.audioState.currentTime)} / ${youtube.formatDuration(this.state.audioState.duration)}</p>
                  <div class="track">
                    <h2>${title}</h2>  
                    <p>${artist}</p>
                    <input type="range" min="0" max="${this.state.audioState.duration}" value="${this.state.audioState.currentTime}" class="song_progress"  oninput="youtube.seekSong(this.value)"/>
                    
                   </div>
                  </div>
                 </div>
                 </div>
                 
                 
                <div class="flex mt-12 p-2" style="justify-content: center; align-items: center;">
                <div class="rounded-full" style="width: 50px; height: 50px; background: #eee; display: flex; justify-content: center; align-items: center;"
                onclick="youtube.togglePlay(this)">
                 ${
                    this.state.isPlaying ? `
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 5.25v13.5m-7.5-13.5v13.5" />
</svg>
                    
                    
                    ` : `
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
</svg>


                    `
                 }
              
                </div>                
 
             </div>
            </div>
            </div>
        `
    }
    onMount(){
        let url = new URLSearchParams(window.location.search).get('videourl') 
        if(!this.state.loaded){
            youtube.loadSong(url).then((audio) => {
                console.log(audio)
                  this.setState('audioState', {currentTime: 0, duration: audio.duration})
                  audio.ontimeupdate = (d) => {   
                    this.setState('audioState', {currentTime: audio.currentTime, duration: audio.duration})
                  } 
                  audio.onpause = () => {
                    console.log('paused') 
                    this.setState('isPlaying', false)
                  }
                  audio.onplay = () => { 
                    this.setState('isPlaying', true)
                  }
                  youtube.playCurrentSong()
            })
            this.state.loaded = true
        
             
        } 
    } 
}
customElements.define('song-player-app', SongPlayer);
export default SongPlayer;