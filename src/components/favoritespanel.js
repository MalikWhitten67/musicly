import { Component, html, f, h } from "../jsfiber.js";
import Alerts from "./informatives/alerts.js";
import musicPlayer from "../player/index.js";
class FavoritesPanel extends Component{
    state = {
        songPlaying: {}
    }
    constructor(){
        super()
    }

    render(){
        let [favorites, setFavorites] = this.useState('favorites', JSON.parse(localStorage.getItem('favorites')) || []);
        let [isPlaying, setIsPlaying] = this.useState('songPlaying', {}) 
        let [loop, setLoop] = this.useState('loop', false); 
        let [isAlerted, setIsAlerted] = this.useState('alerted',  {type: '', message: ''}); 
       
        window.onpopstate = () => {
            setTimeout(() => {
                if(isPlaying.thumbnail && !window.location.href.includes('favorites')){
                    setIsPlaying({}, 'isPlaying', 'icons');
                    setLoop(false, 'loop');
                  }else {
                     if(favorites.find((fav) => fav.thumbnail === musicPlayer.states.currentTrack.thumbnail)){
                        setIsPlaying(musicPlayer.states.currentTrack, 'isPlaying', 'icons');
                     }
                  }
              
            }, 1)

        }
        document.addEventListener('visibilitychange', () => {
            if(document.visibilityState === 'hidden'){
                musicPlayer.states.currentTrack = navigator.mediaSession.metadata;
                setIsPlaying(musicPlayer.states.currentTrack, 'isPlaying');
            }else if(musicPlayer.audio.paused === false){
                musicPlayer.states.currentTrack = navigator.mediaSession.metadata;
                setIsPlaying(musicPlayer.states.currentTrack, 'isPlaying');
            }
        });
        musicPlayer.states.currentPlaylistName = 'Favorite Songs';
        const search = (e, favorites) => {
             if(e.target.value === ''){
                setFavorites(favorites, 'list');
                return;
             }
             let filtered = favorites.filter(track => track.title.toLowerCase().includes(e.target.value.toLowerCase()));
                setFavorites(filtered, 'list');
            } 
        musicPlayer.states.autoplay = false;

        const loopPlaylist = () => {
            setLoop(!loop, 'loop');  
        }

        // remove empty favorites 
        const playAll = () => { 
             musicPlayer.states.currentPlaylist =  JSON.parse(localStorage.getItem('favorites')) || [];
             if(isPlaying.thumbnail){
                musicPlayer.stop();
                setIsPlaying({}, 'isPlaying', 'icons');
             }else{
                let track = musicPlayer.states.currentPlaylist[0];
                showModal(track, {minimized:true, autoplay:true});
                setIsPlaying(track, 'isPlaying', 'icons');
             }
        }
        // monitor volume if it is muted and not paused then stop the music
        let visual
        musicPlayer.on('songEnded', () => {
            if(loop){
            let nextTrack = musicPlayer.nextTrack();   
            musicPlayer.audio.currentTime = 0;
            musicPlayer.audio.duration = 0;
            musicPlayer.setMetaData(nextTrack);
             setTimeout(() => { 
                showModal(nextTrack, {minimized:true, autoplay:true});
              }, 0);
             setIsPlaying(nextTrack, 'isPlaying', 'icons');
            }else{
                setIsPlaying({}, 'isPlaying', 'icons');
            }
        }); 
        window.favoritesUpdated = (data) => {
            if(data && data.thumbnail === musicPlayer.states.currentTrack.thumbnail){
                setIsPlaying(data, 'isPlaying', 'icons');
            }
            setFavorites(JSON.parse(localStorage.getItem('favorites')), 'list');
        }
        musicPlayer.on('newTrack', () => {
            console.log('new track');
            setIsPlaying(musicPlayer.states.currentTrack, 'isPlaying')
        });
        musicPlayer.on('songStopped', () => { 
            setIsPlaying({}, 'icons', 'isPlaying');
        });
        window.onresume = () => {
           setTimeout(() => {
            setIsPlaying(musicPlayer.states.currentTrack, 'isPlaying', 'icons');
           }, 1)
        }
        return favorites.length < 1 ? html`
        <div class="text-lg mt-6 p-2" data-ref="view" data-replace="outerHTML"> 
                   <div class="hero justify-between flex p-5">
                   <svg 
                   onclick="${f(()=>{
                window.history.back()
                window.dispatchEvent(new PopStateEvent('popstate'));
                })}"
                   xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
</svg>
 
<p class="center mt-5 rounded-full ">Your Favorites</p>
                   <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM18.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
</svg>
 
                   </div>
                   <div style="margin:auto; text-align:center; padding:5px;  margin-top:12vh;">
                      <h1>Songs you love will Appear Here</h1>
                      <p class="mt-5">Add tracks to your favorites by clicking the heart icon</p>
                      <button 
                      onclick="${f(()=>{navigate('search')})}"
                      style="background-color:#121212; color:white; border:none; padding:15px; border-radius:9999px; margin-top: 20px;">
                        Discover Music
                      </button>
                   </div>
        </div> 
        
        ` : html`
          <div class="text-lg  mb-12" data-ref="view" data-replace="outerHTML">
          
            <div class="flex  p-2 hero justify-between mt-2"  style="padding:12px">
            <svg 
            onclick="${f(()=>{window.history.back(); window.dispatchEvent(new PopStateEvent('popstate'));})}"
            xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
</svg>

                 <input type="text" placeholder="Search your favorites"
                 oninput="${f((e) => search(e, JSON.parse(localStorage.getItem('favorites'))))}"
                 style="padding: 10px;  border: 1px solid #eeee; border-radius:20px; outline: none; width: 84%;
                 height: 40px;
                 font-size: 16px; 
                 background: #f5f5f5;
                 "
                 />
                  
            </div>
             
            <div class="gap-2 p-5" data-ref="list"  data-replace="innerHTML"
                style="overflow-y: auto; max-height: 70vh;" >
                 <div class="flex justify-between hero">
                 <div class="mb-5"> 
                   <p class="mt-2"
                   style="opacity: 0.5;">${favorites.length} Favorites</p> 
                </div>
                <div class="flex items-center gap-1" data-ref="icons" data-replace="outerHTML">
                <div data-ref="loop" data-replace="outerHTML">
                <svg 
                onclick="${f(loopPlaylist)}"
                xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="
                ${loop ? '#ff5722' : 'black'}"  
                " class="w-6 h-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 0 0-3.7-3.7 48.678 48.678 0 0 0-7.324 0 4.006 4.006 0 0 0-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 0 0 3.7 3.7 48.656 48.656 0 0 0 7.324 0 4.006 4.006 0 0 0 3.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3-3 3" />
</svg>
    </div>

                 <span onclick="${f(playAll)}" class="flex items-center gap-1" data-ref="playAll" data-replace="outerHTML">
                 ${
                    isPlaying.thumbnail ? html`
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="black" class="w-6 h-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 5.25v13.5m-7.5-13.5v13.5" />
</svg>

                    ` : html`
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="black" class="w-6 h-6">
                 <path stroke-linecap="round" stroke-linejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
               </svg>
                    `
                }
                </span>

               </div>
                </div>
                
                 <div data-ref="isPlaying" data-replace="outerHTML" 
                class="musicly_scrollbar"
                >
                ${favorites.map((track, index) => html`
                    <div class="card hero    flex" style=" margin-top:1rem;  gap:1rem; border-radius: 5px;
                     ${
                     // if end add margin bottom
                    index === favorites.length - 1 ?  'margin-bottom: 5rem;' : ''
                    }"
                    
                    >
                    <img src="${track.thumbnail}" alt="${track.title}" class="rounded-full modal_image"
                         onclick="${f(() =>{
                            showModal(track, {minimized:true, autoplay:true});
                            setIsPlaying(track, `isPlaying`, 'icons');
                         })}"
                         style="width: 55px; height: 55px; object-fit: cover;border-radius:0px;"/> 
                         <div class="flex flex-col"
                         style="font-size: 15px; line-height: 1.5; "
                         >
                          <p 
                          ${isPlaying.thumbnail === track.thumbnail ? 'style="color: #ff5722;"' : ''}
                          >${track.title.length > 20 ? track.title.slice(0,  50) + '...' : track.title}</p>
                          <p 
                          >${isPlaying.title === track.title ? 'Playing' : track.artist}</p>
                         </div>
                        
                    </div>
                `).join(' ')}
                </div>
                 
            </div>
            </div>
        `
    }
    onMount(){
        window.onload = () => {
            this.setState({songPlaying: musicPlayer.states.currentTrack}, 'isPlaying');
        }
    }
}

export default FavoritesPanel;