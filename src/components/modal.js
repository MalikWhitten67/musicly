import { html, f, Component } from "../jsfiber.js";
import musicPlayer from "../player/index.js"; 
function throttle(callback, limit) {
  let throttleTimeout;
  return function () {
    const args = arguments;
    const context = this;
    if (!throttleTimeout) {
      callback.apply(context, args);
      throttleTimeout = setTimeout(() => {
        throttleTimeout = null;
      }, limit);
    }
  };
}
export default class Modal extends Component {
  state = {
    toggled: false,
    modalData: {}, 
    justToggled: false,
    isPlaying: false,
    thumbNailLoaded: false,
    time: 0,
  }
  constructor(props) {
    super();
    
    let [isPlaying, setIsPlaying] = this.useState('isPlaying', this.state.isPlaying)
    this.isPlaying = isPlaying;
    this.setIsPlaying = setIsPlaying;
  }  
  toRGBImage(img) {
    var r = 0, g = 0, b = 0;
    var count = 0;
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);
    var data = ctx.getImageData(0, 0, img.width, img.height).data;
     for (var i = 0; i < data.length; i += 4) {
         r += data[i];
         g += data[i + 1];
         b += data[i + 2];
         count++;
     }
     r = Math.floor(r / count);
     g = Math.floor(g / count);
     b = Math.floor(b / count);
     return {r, g, b};
 }

  render() {
     
    let [toggled, setToggled] = this.useState('toggled', false);
    let [modalData, setModalData] = this.useState('modalData',  window.modalData || {}) 
    let [time, setTime] = this.useState(`time`, null) 
    let [formattedTime, setFormattedTime] = this.useState('formattedTime',  {current: '0:00', duration: '0:00'})
    let [favorites, setFavorites] = this.useState('favorites', JSON.parse(localStorage.getItem('favorites')) || [])
    
    musicPlayer.audio.onloadedmetadata = () => { 
      if(document.getElementById('myRange')){
        document.getElementById('myRange').max = musicPlayer.audio.duration;
      } 
      let recentlyPlayed = JSON.parse(localStorage.getItem('recentlyPlayed')) || [];
      if(!recentlyPlayed.find((track) => track.thumbnail === modalData.thumbnail)){
        recentlyPlayed.push(modalData);
      }
      localStorage.setItem('recentlyPlayed', JSON.stringify(recentlyPlayed));
    }
    musicPlayer.audio.ontimeupdate = () => {
        if(document.querySelector('[data-ref="timechange"]')){
          document.querySelector('[data-ref="timechange"]').value = Math.floor((musicPlayer.audio.currentTime /  musicPlayer.audio.duration) * 100);
          setFormattedTime({current: musicPlayer.formatTime(musicPlayer.audio.currentTime), duration: musicPlayer.formatTime(musicPlayer.audio.duration)}, 'formattedTime')
        }
        if(document.querySelector('[data-ref="formattedTime"]')){  
         
        }  
        
        if(document.getElementById('myRange')){
        this.state.time = musicPlayer.audio.currentTime;
        document.getElementById('myRange').max = musicPlayer.audio.duration;
        document.getElementById('myRange').value = musicPlayer.audio.currentTime;
         
        }
    }    
    
    musicPlayer.audio.onloadeddata = () => { 
       document.querySelector('link[rel="icon"]').href = modalData.thumbnail;
       document.querySelector('meta[property="og:image"]').content = modalData.thumbnail;
     
    }
 

    if(this.state.justToggled){ 
      this.state.justToggled = false;
      this.state.isPlaying = true;
      this.setIsPlaying(true, 'toggledModal') 
    }

    musicPlayer.audio.onended = () => {
        // check if document is visible\
        // ensure song hasbt just started
        if(document.visibilityState === 'visible' && musicPlayer.audio.currentTime > 0){
         let t = setTimeout(() => { 
          if(musicPlayer.thereisNextTrack() && musicPlayer.states.autoplay){
            if(document.getElementById('myRange'))  document.getElementById('myRange').value = 0;
            nextSong();
          }else if(!musicPlayer.thereisNextTrack()){
            clearTimeout(t)
          }
         }, 1500);
        }
        else {if(musicPlayer.thereisNextTrack()){
          nextSong();
        }
      }
    }

    if(!window.hasEvent){
       window.hasEvent = true;
       window.addEventListener('songStopped', () => {
        console.log('song stopped')
      })
    }

    musicPlayer.audio.onpause = () => { 
      this.setIsPlaying(false, 'toggledModal') 
    }
     
    
    let t;
    const handleSlideChange = (e) => {  
      musicPlayer.audio.pause();
      
      musicPlayer.seek(e.target.value)
      if(t) return;
      t = setTimeout(() => { 
        musicPlayer.audio.play();
        clearTimeout(t);
      }, 1000);
    }

    const toggleFavorites = () => {
     setTimeout(() => { 
      let event;
      if(musicPlayer.states.currentTrack){
       if(favorites.find((fav) => fav.thumbnail === musicPlayer.states.currentTrack.thumbnail)){
         favorites = favorites.filter((fav) => fav.thumbnail !== musicPlayer.states.currentTrack.thumbnail);
         event = 'removed';
       }else{
         favorites.push(musicPlayer.states.currentTrack);
          event = 'added';
       }
       setFavorites(favorites, 'favorites');
       localStorage.setItem('favorites', JSON.stringify(favorites));
       window.favoritesUpdated && window.favoritesUpdated(event === 'added' ? musicPlayer.states.currentTrack : null);
      }
     }, 1)
    }

    const toggleSong =  (options = {}) => {
        if(musicPlayer.audio.paused){ 
            this.setIsPlaying(true, 'toggledModal')
            musicPlayer.audio.play();  
            musicPlayer.states.currentTrack = modalData;
            window.onresume && window.onresume.bind(musicPlayer)();
            this.state.isPlaying = true;
             
        }else{ 
            this.setIsPlaying(false, 'toggledModal')
            musicPlayer.audio.pause();   
            musicPlayer.events['songStopped'] && musicPlayer.events['songStopped'](modalData);
            this.state.isPlaying = false;
        }  
        if(options.toggledFromMediaSession){
          console.log('toggled from media session')
           this.setIsPlaying(!isPlaying, 'musicly_modal')
        }
    }

    musicPlayer.audio.onplay = () => {
      musicPlayer.states.currentTrack = modalData;
      this.setIsPlaying(true, 'toggledModal')
      
    } 
    const nextSong = () => {
      
      let track = musicPlayer.nextTrack(); 
       
      document.title = track.title;
      showModal(track, {minimized: true, autoplay: true});
      musicPlayer.states.currentTrack = track;
      musicPlayer.audio.src = track.url; 
      musicPlayer.audio.play(); 
      musicPlayer.events['newTrack'] && musicPlayer.events['newTrack']();
      this.setIsPlaying(true, 'toggledModal') 
    }
    const prevSong = () => { 
      let previous = musicPlayer.prevTrack();
      document.title = previous.title;
      showModal(previous, {minimized: true, autoplay: true});
      musicPlayer.setMetaData(previous);
      musicPlayer.states.currentTrack = previous;
      musicPlayer.events['newTrack'] && musicPlayer.events['newTrack']();
    }

    
     
    const toggleModal = () => {
       if(!this.state.toggled){  
        // hide the progress while its toggling
          document.querySelector('[data-ref="timechange"]').style.visibility = 'hidden';
          document.getElementById(`musicly_modal`).style.cssText = `
          transition: all 0.2s ease-in-out 0s;position: fixed;z-index: 9999; 
          background-color: rgb(${modalData.rgb.r}, ${modalData.rgb.g}, ${modalData.rgb.b});
          
          color:  ${modalData.textColor};
           
            top: calc(${
             device.isIOS && is_tandalone ? '100% - 169px' : '100% - 153px'
            });
           padding: 8px;
           height: 15%; 
           left: 0;
          ` 
       
          setToggled(true,  'musicly_modal')
          this.setIsPlaying(this.state.isPlaying, 'musicly_modal')  
         setTimeout(() => {
          document.querySelector('[data-ref="timechange"]').style.visibility = 'visible';
          }, 1000);
       }else{
          
          document.getElementById(`musicly_modal`).style.cssText = `
          transition: all 0.3s ease-in-out;
          position: fixed; /* or absolute depending on your layout */
          z-index: 9999; /* set a high z-index to ensure it appears on top */
          top: 0; /* place it at the bottom of the screen */
          left: 0;   
          height: 100%;
          /* Other styles */
          `
          window['navbarColor'] = `rgb(${modalData.rgb.r}, ${modalData.rgb.g}, ${modalData.rgb.b})`;
          setToggled(false, 'musicly_modal')
          this.setIsPlaying(this.state.isPlaying, 'musicly_modal')
 
          if(document.querySelector('[data-ref="timechange"]')){
            document.querySelector('[data-ref="timechange"]').value = 0;
          }
          if(document.getElementById('myRange')){
            document.getElementById('myRange').max = musicPlayer.audio.duration;
            document.getElementById('myRange').value = musicPlayer.audio.currentTime;
          }
       }
    }
 

 
    return html`
     <div class="modal" data-ref="musicly_modal" data-replace="innerHTML" id="musicly_modal" style="display: none;
     
     ">
       <div class="modal-content"  >
        ${
           toggled ? html`
           <div class="flex  gap-2"
           id="modal-header"
           >
           <img 
           onclick="${f(toggleModal)}"
           src="${modalData.thumbnail}" 
           id="modal-image"
           class="modal_image"
           style="transition: all 0.5s ease-in-out; 
           width:40px; height:40px; border-radius:5px;
           "
           />
            <div class="container">
              <div class="flex  " style="">
              <p  style="width:300px;font-size:16px; word-wrap:wrap; word-break:break-word" >${modalData.title.length > 50 ? modalData.title.slice(0, 70) + '...' : modalData.title}</p>
              <div class="flex gap-2" data-ref="toggledModal" style="position: absolute;
    right: 5px;" >
             

              ${
                 this.state.isPlaying ? html`
                   <svg xmlns="http://www.w3.org/2000/svg" fill="none" onclick="${f(toggleSong)}" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 5.25v13.5m-7.5-13.5v13.5" />
</svg>

                 ` : html`  
                 <svg xmlns="http://www.w3.org/2000/svg" onclick="${f(toggleSong)}"  fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
</svg>

`
              } 
 
             </div>
             </div> 
             
             <p style="font-size: .9rem;">${modalData.artist.length > 50 ? modalData.artist.substring(0, 50) + '...' : modalData.artist}</p>
            </div>
            
            </div>
            <progress value="${time}"
            data-ref="timechange"
            data-replace="outerHTML"
            max="100" style="width: 100%;"
            class="musicly_underprogress" 
            ></progress>
           `
           : html`
            <div class="flex justify-between hero relative">
            <div onclick="${f(toggleModal)}" style="padding:5px">
           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
            </svg>

        </div>  
        ${musicPlayer.states.currentPlaylistName ? html`
        <p>${musicPlayer.states.currentPlaylistName}</p>
        ` : ``}
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
           <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM18.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
         </svg>
</div> 
        <img src="${modalData.thumbnail}" class="modal_image"  style="width:100%; height: 200px; object-fit: cover;"/>
        
        <div class="containe mt-5">
          <div class="flex flex-col mt-2">
          <input data-ref="timechange" data-replace="attributes" type="range" class="slider"
          oninput="${f(handleSlideChange)}" 
          id="myRange"  max="100"   style="width: 100%;"/>
          <div class="center flex mt-2 justify-between mx-5 text-sm"
          data-ref="formattedTime" data-replace="outerHTML"
          >
          <p  >${formattedTime?.current}</p>
          <p >${formattedTime?.duration}</p>
          </div>
          </div>
          <div class="flex flex-col mt-5 gap-2">
          <p class="text-lg">${modalData?.title ? modalData.title: ''}</p>
          <div class="flex hero mb-12 justify-between"
          style="margin-bottom:6rem;"
          > 
         <svg
         data-ref="favorites"
         data-replace="outerHTML"
         onclick="${f(toggleFavorites)}"
         xmlns="http://www.w3.org/2000/svg"  
         ${favorites.find((fav) => fav.thumbnail === modalData.thumbnail) ? 'fill="#FF6262" stroke="#FF6262"' : 'fill="none" stroke="#FF6262"'}
         viewBox="0 0 24 24" stroke-width="1.5"  class="w-5 h-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
</svg>
            </div>
          </div>
          <div class="flex justify-between  gap-2"
          style="margin:auto; display:flex; justify-content:space-between; align-items:center; width:100%;"
          ><svg 
          onclick="${f(prevSong)}"
          xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M21 16.811c0 .864-.933 1.406-1.683.977l-7.108-4.061a1.125 1.125 0 0 1 0-1.954l7.108-4.061A1.125 1.125 0 0 1 21 8.689v8.122ZM11.25 16.811c0 .864-.933 1.406-1.683.977l-7.108-4.061a1.125 1.125 0 0 1 0-1.954l7.108-4.061a1.125 1.125 0 0 1 1.683.977v8.122Z" />
</svg>

            <div 
            data-ref="toggledModal"
            data-replace="outerHTML"
            style="width: 50px; height: 50px; 
            display: flex; justify-content: center; align-items: center;
            border-radius: 50%; fill:#ff7f50;stroke:#ff7f50; "
            class="rounded-full " onclick="${f(toggleSong)}">
             ${
                this.state.isPlaying ? html`
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 5.25v13.5m-7.5-13.5v13.5" />
</svg>
                  

                ` : html`
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
</svg>

                `
             }
           

            </div>
            
            <svg 
            
            onclick="${f(nextSong)}"
            xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M3 8.689c0-.864.933-1.406 1.683-.977l7.108 4.061a1.125 1.125 0 0 1 0 1.954l-7.108 4.061A1.125 1.125 0 0 1 3 16.811V8.69ZM12.75 8.689c0-.864.933-1.406 1.683-.977l7.108 4.061a1.125 1.125 0 0 1 0 1.954l-7.108 4.061a1.125 1.125 0 0 1-1.683-.977V8.69Z" />
</svg>

          </div>

          
          
       </div>
           `
        }
       
 
       </div>
     </div>
    `
  }

  onMount() { 
    let [toggled, setToggled] = this.useState('toggled', false);
    let [modalData, setModalData] = this.useState('modalData',  this.props)
    let [isPlaying, setIsPlaying] = this.useState(`isPlaying`, true)
 
    window.showModal =  async(details, options = {minimized : false, autoplay:true})=>{  
      
      setModalData(details, 'musicly_modal') 
      setToggled(options.minimized, 'musicly_modal')
      window.modalData = details;  
      window.modalisOpen = true;
     
      
      if(options.minimized){
        let img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = details.thumbnail;
        
        img.onload = () => {
          let rgb = this.toRGBImage(img);  
          let [r, g, b] = [rgb.r, rgb.g, rgb.b];
          let brightness = Math.round(((r * 299) + (g * 587) + (b * 114)) / 1000);
          let textColor = brightness > 125 ? 'black' : 'white'; 
          modalData['textColor'] = textColor;
          modalData['rgb'] = {r, g, b};
          window.modalData = modalData;
          document.getElementById(`musicly_modal`).style.cssText = ` 
          transition: all 0.2s ease-in-out 0s;position: fixed;z-index: 9999; 
          background-color: rgb(${r}, ${g}, ${b});
          color: ${textColor};
           
            top: calc(${
             device.isIOS && is_tandalone ? '100% - 169px' : '100% - 153px'
            });
           padding: 8px;
           height: 15%; 
           left: 0;
         ` 
        }
        
      }else{
        document.getElementById(`musicly_modal`).style.cssText = `
        transition: all 0.3s ease-in-out;
        position: fixed; /* or absolute depending on your layout */
        z-index: 9999; /* set a high z-index to ensure it appears on top */
        top: 0; /* place it at the bottom of the screen */
        left: 0;  
        bottom: 0;
        height: 100%; 
        `
      }
     
    
      
      this.state.justToggled = true; 
      document.title = details.title;  
      musicPlayer.setMetaData(details);
      musicPlayer.audio.src = details.url; 
      musicPlayer.states.currentTrack = details;
      musicPlayer.audio.play();
      window.songMetaData = details;
      setIsPlaying(true, 'musicly_modal')
      window.autoplay = options.autoplay;
      document.querySelector('[data-ref="timechange"]').value = 0;
      musicPlayer.states.currentTrack = details;
    } 
    window.showModal = window.showModal.bind(this)
    if(window['modalPopstate'] === undefined){
      window['modalPopstate'] = true;
      window.addEventListener('popstate', () => {
        if(!this.state.toggled && window.modalisOpen){
          setToggled(true, 'musicly_modal')
          document.getElementById(`musicly_modal`).style.cssText = `
          transition: all 0.2s ease-in-out 0s;position: fixed;z-index: 9999; 
          background-color: rgb(${modalData.rgb.r}, ${modalData.rgb.g}, ${modalData.rgb.b});
          color: ${modalData.textColor};
          opacity: 0.5
          background-position: center;
 
          color: white;
           
            top: calc(${
             device.isIOS && is_tandalone ? '100% - 175px' : '100% - 168px'
            });
           height: 15%; 
           left: 0;
          `

        }
      })
    }
    window.toggleModal = () => {
       setToggled(!toggled, 'musicly_modal')
    }
     
  }
}

 
