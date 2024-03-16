import { h, render , html, f, Component} from "../src/jsfiber.js";
import Navbar from "../src/components/navbar.js"; 
import Modal from "../src/components/modal.js";
import { SongPanel } from "../src/components/modals/songPanel.js";
import musicPlayer from "../src/player/index.js";
import FavoritesPanel from "../src/components/favoritespanel.js";
import Search from "../src/components/views/search.js";
import Home from "../src/components/views/home.js";
window.url = `https://` + window.location.host
let wakeLock = null;
 

function requestWakeLock() {
   if ('wakeLock' in navigator && 'request' in navigator.wakeLock) {
      navigator.permissions.query({name: 'screen-wake-lock'}).then((result) => { 
            if (result.state === 'granted') { 
               console.log('screen wake lock permission granted')
               navigator.wakeLock.request('screen').then((wl) => {
                  wakeLock = wl  
               }).catch((err) => {
                  console.error(`The wake lock request has failed: ${err}`);
               });
            }else{
               console.log('prompting for screen wake lock permission')
               navigator.wakeLock.request('screen').then((wl) => {
                  wakeLock = wl  
               }).catch((err) => {
                  console.error(`The wake lock request has failed: ${err}`);
               });
            }
         }); 
   } else {
       console.warn('Wake Lock API is not supported');
   } 
    setTimeout(() => {
      // release wakeLock so ios can sleep but continue playing audio
         if(wakeLock !== null){
            wakeLock.release().then(() => {
               wakeLock = null;
            });
         }
    }, 1000)
}
document.onclick = () => {
   requestWakeLock()
}
  
class Index extends Component {
   name = 'Index';
   render(){
  
      let [query , setQuery] = this.useState('query', ''); 
      let queries = JSON.parse(localStorage.getItem('queries')) || [];
      let [results, setResults] = this.useState('results', []);
      let [isSearching, setIsSearching] = this.useState('isSearching', false);
      let [reflectContainer, setReflectContainer] = this.useState('reflectContainer', 'resultscontainer');
      const deleteQuery = (query) => {
         let queries = JSON.parse(localStorage.getItem('queries')) || [];
         queries = queries.filter(q => q !== query);
         localStorage.setItem('queries', JSON.stringify(queries));
         let queryData = JSON.parse(localStorage.getItem('queryData')) || [];
         let data = queryData.filter(q => q.for !== query);
         localStorage.setItem('queryData', JSON.stringify(data));
         setReflectContainer('clear', 'view')
      }
     
      let device = musicPlayer.states.device;

      const openSongPanel = (data) => {
         window.openSongPanel(data)
      }

      musicPlayer.states.currentPlaylistName = `Search - ${query}`

      musicPlayer.states.autoplay = true
      let route = new URLSearchParams(window.location.search).get('route') || 'home';
      if(!new URLSearchParams(window.location.search).get('route')){
         window.history.pushState({}, '', `?route=${route}`);
      }
      return html`
      <div  >
      ${
            route === 'search' ? 
             h(Search, {query, setQuery, results, setResults, isSearching, setIsSearching, reflectContainer, setReflectContainer, deleteQuery, openSongPanel}, null)
            : route == 'favorites' ? html`
             ${this.memoizeComponent(FavoritesPanel, {}, null).render()}
          ` 
          : route == 'home' ? html` 
               ${this.memoizeComponent(Home, {}, null).render()}
          `  : html``
      }
      </div>
      ${h(Modal, {}, null)}
      ${h(Navbar, {}, null)}
      ${h(SongPanel, {}, null)}
      `
       
   } 

   onMount(){

       

      function handleQueries(query){
         console.log('query', query)
         let queries = JSON.parse(localStorage.getItem('queries')) || [];
          
         !queries.includes(query) && localStorage.setItem('queries', JSON.stringify([...queries, query]))
      }
      const handleMount = () => {
         let route = new URLSearchParams(window.location.search).get('route') || 'home';
         if(route === 'search'){
            const search = (query) => {
               fetch(window.url+ `/search?query=${query}`)
               .then(res => res.json())
               .then(data => {
                  console.log('data', data)
                  this.setState({results: data}, 'resultscontainer')
                  this.setState({isSearching: false}, 'resultscontainer')
               }).catch(err => {
                  console.log('err', err)
               })
            }
            window.searchQ = (query) => { 
               document.getElementById('musicly_search_input').value = query;
               search(query); 
            }
            //wait fully until they stop typing
            let timeout = null;
            document.getElementById('musicly_search_input').addEventListener('keyup', (e) => {
               if(timeout) clearTimeout(timeout);
               timeout = setTimeout(() => {
                  search(e.target.value); 
                  this.setState({results: []}, 'resultscontainer')
                  this.setState({isSearching: true}, 'resultscontainer')
               }, 1000)
            })
         }
      }
      handleMount()
      window.addEventListener('popstate', () => {
         this.setState({route: new URLSearchParams(window.location.search).get('route') || 'home'}, 'view')
         handleMount()
         this.setState({results: []}, 'resultscontainer')
         this.setState({query: ''}, 'clear')
      })
     
   }
    
}

render(Index, document.getElementById('root'));