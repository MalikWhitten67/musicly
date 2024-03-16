import { Component, html, f } from '../../jsfiber.js';
export class SongPanel extends Component {
    state = { 
      toggled: false
    }
    constructor(props) {
      super();
      this.currentTrack = {
        title: '',
        artist: '',
        thumbnail: ''
    }
  } 
    render() {
      let [favorites, setFavorites] = this.useState('favorites', JSON.parse(localStorage.getItem('favorites')) || [])
      const _toggleSongPanel = () => {
        this.state.toggled = !this.state.toggled;
        this.setState(this.state, 'songPanel');
      }
      const toggleFavorites = () => { 
        if(favorites.find((fav) => fav.thumbnail === this.currentTrack.thumbnail)){
          favorites = favorites.filter((fav) => fav.thumbnail !== this.currentTrack.thumbnail); 
        }else{
          favorites.push(musicPlayer.states.currentTrack);
        }
        setFavorites(favorites, 'favorites');
        localStorage.setItem('favorites', JSON.stringify(favorites)); 
        window.dispatchEvent(new Event('favoritesUpdated'));
      }
      const playNext = () => {
        if(musicPlayer.states.currentTrack){
          // tell the player once it ends not to automatically play the next song
          musicPlayer.states.autoplaynext = false;
          let next = musicPlayer.getNextTrack();
          // remove the next track from the playlist and add it to the end of the playlist 
           musicPlayer.states.currentPlaylist[musicPlayer.states.currentPlaylist.indexOf(next)] =  this.currentTrack;
           musicPlayer.states.currentPlaylist = musicPlayer.states.currentPlaylist.filter((track) => track.thumbnail !== next.thumbnail);
           musicPlayer.states.currentPlaylist.push(next);
           // swap the current track with the next track
           musicPlayer.states.currentTrack = this.currentTrack; 
           musicPlayer.states.autoplaynext = true;
       }else{
          musicPlayer.states.currentTrack = this.currentTrack;
          musicPlayer.states.currentPlaylist = [this.currentTrack];
          musicPlayer.states.autoplaynext = true;
          musicPlayer.play(this.currentTrack.url);
       } 
      }
      return html`
      <div class="modal" data-ref="songPanel" data-replace="outerHTML"
      id="songPanel"
      style="${ this.state.toggled ? `display: flex; flex-direction:column; ` : `display: none;`}"
      >
       ${
         this.state.toggled ? html` 
            <div class="flex gap-2 flex-col mt-5 p-5">
            <img src="${this.currentTrack.thumbnail}" class="  rounded modal_image"
            style="width"
            />
           <div class="flex flex-col center gap-2">
           <h1 class="text-lg">${this.currentTrack.title.length > 50 ? this.currentTrack.title.slice(0, 50) : this.currentTrack.title}</h1>
           <p>${this.currentTrack.artist}</p>
           
           </div>
          <div class="flex flex-col gap-5 mt-5">
              <span class="hero gap-2" onclick="${f(toggleFavorites)}"
              data-ref="favorites" data-replace="outerHTML"
              >
               <svg xmlns="http://www.w3.org/2000/svg" fill="${
                favorites.find((fav) => fav.thumbnail === this.currentTrack.thumbnail) ? '#FF6262' : 'none'
               }" viewBox="0 0 24 24" stroke-width="1.5" stroke="#FF6262" class="w-6 h-6">
               <path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
              </svg>
              <p  > 
                ${favorites.find((fav) => fav.thumbnail === this.currentTrack.thumbnail) ? 'Remove from favorites' : 'Add to favorites'}
              </p>
             </span>
              <span class="hero gap-2"
              onclick="${f(playNext)}"
              > 
              <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"><path d="m780-60-60-60 120-120-120-120 60-60 180 180L780-60Zm-460-60v-80H160q-33 0-56.5-23.5T80-280v-480q0-33 23.5-56.5T160-840h640q33 0 56.5 23.5T880-760v280h-80v-280H160v480h520v80h-80v80H320Zm120-240h80v-120h120v-80H520v-120h-80v120H320v80h120v120Zm-280 80v-480 480Z"/></svg>
              <p> Play next</p>
             </span> 
              <span class="hero gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
               <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
  
             Add to playlist
              </span>
          </div>
           <span class="center mt-5" style="padding:10px 60px; margin:auto; margin-top:25px; background-color:#eeeeee; border-radius:20px;" onclick="${f(_toggleSongPanel)}">Close</span>
         </div>
         ` : html``
       }
       </div>
      `
    }
    onMount() {
      let [toggled, setToggled] = this.useState('toggled', false);
      window.openSongPanel = (details) => {
        this.currentTrack = details;
        setToggled(true, 'songPanel')
        document.getElementById(`songPanel`).style.cssText = `
        transition: all 0.7s ease-in-out;
        position: fixed; /* or absolute depending on your layout */
        display: flex;
        flex-direction: column;
        z-index: 9999; /* set a high z-index to ensure it appears on top */
        top: 0; /* place it at the bottom of the screen */
        left: 0; 
        right: 0; 
        padding:0;
        gap: 10px;  
        `
      }
  
      window.toggleSongPanel = () => {
        setToggled(!toggled, 'songPanel')
      }
    }
  }