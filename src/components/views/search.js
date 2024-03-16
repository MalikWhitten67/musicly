import {Component, html, f } from "../../jsfiber.js"
import musicPlayer from "../../player/index.js"; 
class Search extends Component {
    constructor(props) {
        super(props);
        console.log('props', props)
        this.props =  {
            deleteQuery:'2',
            isSearching: props.isSearching,
            openSongPanel: props.openSongPanel,
            query: props.query,
            reflectContainer: props.reflectContainer,
            results: props.results,
            setIsSearching: props.setIsSearching,
            setQuery: props.setQuery,
            setReflectContainer: props.setReflectContainer,
            setResults: props.setResults
        }
    }

    render(){
        let {deleteQuery, isSearching, openSongPanel, query, reflectContainer, results, setIsSearching, setQuery, setReflectContainer, setResults} = this.props;
        console.log('props', this.props)
        let queries = JSON.parse(localStorage.getItem('queries')) || [];
        let device = musicPlayer.states.device;
        let timeout;
        musicPlayer.states.currentPlaylistName = `Search - ${query}`
        function handleQueries(query){
            console.log('query', query)
            let queries = JSON.parse(localStorage.getItem('queries')) || [];
             
            !queries.includes(query) && localStorage.setItem('queries', JSON.stringify([...queries, query]))
         }
        const search = (q) => {
            fetch(`https://${window.location.host}/search?query=${query}`)
            .then(res => res.json())
            .then(data => {
               console.log('data', data)
               this.setState({results: data}, 'resultscontainer')
               this.setState({isSearching: false}, 'resultscontainer')
            }).catch(err => {
               console.log('err', err)
            })
         }
        const searchQ = (q) => {
            if(timeout) clearTimeout(timeout);
            timeout = setTimeout(() => {
               search(q)
               setReflectContainer('resultscontainer', 'clear')
               this.setState({isSearching: true}, 'resultscontainer')
            }, 1000)
        }
        return html`
         <div data-ref="view" data-replace="outerHTML" >
                
                <div class="musicly_container ">
                 <div style="position:fixed; top:0px; z-index:100; padding:10px;   left:0px; right:0px;   background:white;
                 height:50px; 
                 ">
                 <input type="text"  id="musicly_search_input"  class="search_input mt-2"  
                 style=" width:calc(100% - 20px); 
                 border-radius:5px;
                 font-size:16px; 
                 border:1px solid #eeee;
                 " 
                 onkeyup="${f(searchQ)}"
                 placeholder="What do you listen to?" id="search" 
                  oninput="${f((e) => { setQuery(e.target.value, 'resultscontainer', 'clear')})}"
                   
                  />
   </div>
                  <div class="relative" style="position:relative; ">
                   
                  <p  
                     data-ref="clear"
                     data-replace="outerHTML"
                     onclick="${f(() => {
                     setQuery('', 'resultscontainer', 'clear');
                     document.getElementById('musicly_search_input').value = '';
                  })}"
                  style="
                  ${query.length > 0 ? ` 
                  position:absolute; top:${device.isIOS ? 'calc(100% - 40px)' : 'calc(100% - 40px)'};
                 left:calc(100% - 40px);  right:0; cursor:pointer; padding:10px; color:black;
                  ` : 'display:none'}
                  ">X</p>

                  
                  </div>
                  <div data-ref="resultscontainer" class="search_results ${
                     device.isIOS ? 'mt-5 mb-6' : ''
                  }" style="
                  overflow-y:scroll;
                  ">
                     ${
                        query.length > 0 ? html`
                        <div data-ref="results"   class="search_results mt-5"> 
                           <br>
                           ${
                              results.length > 0 && !isSearching ? html`
                              ${
                                 results.map((result, index)=>{ 
                                   let b4Index = index;
                                   musicPlayer.states.currentPlaylist = results; 
                                   musicPlayer.states.currentPlaylistName = query; 
                                   index = index + 1; 
                                     
                                    const parseViews = (views) => {
                                       if(views > 999 && views < 1000000){
                                          return `${(views / 1000).toFixed(1)}k views`
                                       }else if(views > 999999){
                                          return `${(views / 1000000).toFixed(1)}m views`
                                       }else if( !isNaN(views) && views.length > 0){
                                          return `${views} views` 
                                       }
                                    }
                                    result.views = parseViews(result.views)
                                   return html`
                                     <div class="song_card
                                     
                                     "
                                     ${
                                       b4Index == results.length - 1 ? 'style="margin-bottom: 12rem;"' : ''
                                     }
                                     >
                                     <img   onclick="${f(() => { 
                                          musicPlayer.audio.play();
                                          let queryData = JSON.parse(localStorage.getItem('queryData')) || [];
                                          if(!queryData.find(q => q.for === query)){
                                                queryData.push({for: query, ...result})
                                                localStorage.setItem('queryData', JSON.stringify(queryData))
                                                let queries = JSON.parse(localStorage.getItem('queries')) || [];
                                                !queries.includes(query) && localStorage.setItem('queries', JSON.stringify([...queries, query]))
                                          }
                                         showModal(result, {minimized:true, autoplay:true});
                                       })}" src="${result.thumbnail}" alt="song thumbnail" class="song_thumbnail"/>
                                       <div class="w-full">
                                        <span class="flex relative justify-between ">
                                        <p  style="width:${result.title.length > 50 ? 'calc(100% - 70px)' : `calc(100% - 45px)`};font-size:1rem; word-wrap:wrap; word-break:break-word" >${result.title.slice(0, 50)} </p>
                                        <svg 
                                        onclick="${f(() => { openSongPanel({title: result.title, thumbnail: result.thumbnail, artist: result.artist, url: result.url, views: result.views, index: index, length: results.length, query: query, id: index, type: 'search'})})}"
                                        xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"  
                                        style="width: 15pt; height: 20pt; cursor:pointer; position:absolute; right:10;"
                                        >
                                            <path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                                    </svg>


                                    </span>
                                        <div class="flex gap-2">
                                        <p class="text-sm">${result.artist}</p> 
                                       </div>
                                       </div>
                                       </div>  
                                       

                                       
                                   `
                                 }).join('')
                              }
                              ` : html`
                                <span>Loading...</span>
                              `
                           }
                          </div>  
                        ` : html`
                            ${
                               queries.length > 0 ? html`
                                <h1 class="text-xl mt-5 mb-5">Recent Searches</h1>
                                 <ul class="list-none flex-col flex gap-5">
                                    ${
                                       queries.map((query, index) => {
                                          let b4Index = index; 
                                          let img =  JSON.parse(localStorage.getItem('queryData')) || [];
                                          let  thumbnail = img[index] ? img[index].thumbnail : '';
                                          let title = img[index] ? img[index].title : '';
                                          let artist = img[index] ? img[index].artist : '';
                                          return html`
                                           <li class="search_query capitalize flex   " 
                                           style="margin:0; padding:0; list-style-type:none; cursor:pointer
                                           position:relative; gap:1rem;
                                           ${b4Index === queries.length -1 && window.modalisOpen  ? 'margin-bottom: 11rem;' : ''}
                                           " >
                                          <img  onclick="${f(() => {setQuery(query, 'resultscontainer', 'clear');  window.searchQ(query);})}" src="${thumbnail}" style="width: 50px; height: 50px; object-fit: cover;  " />
                                           <div class="flex  flex-col">
                                           <div class="flex w-full"  >
                                           <span class="text-md">${query}</span>
                                           <div onclick="${f(() => {deleteQuery(query)})}"
                                          style=" position:absolute; right:15px;  cursor:pointer; color:black;"
                                          > 
                                          <svg
                                           
                                           xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12"   />
                                          </svg>                                       
                                       </div>
                                       </div> 
                                          <p class="text-sm mt-1" style="${title.length > 50 ? 'width:80%;' : ''}">${title.slice(0, 50)}</p>
                                          </div>
                                          
                                          </li>
                                          `
                                       }).join('')
                                    }
                                    <button  
                                    style="width:50%; border-radius:20px; background:#121212; color:white; padding:10px;  
                                    margin:auto; cursor:pointer; border:none
                                    "
                                    onclick="${f(() => {localStorage.setItem('queries', '[]'); setReflectContainer('clear', 'view')})}">Clear Recent Searches</button>
                               ` : html`
                                <div class="  center"
                                style="margin-top:15rem;"
                                >
                                  <h1>Play Songs you love</h1>
                                  <p class="mt-2" style="font-size:12px">Search Artists, songs, podcasts, albums, and more</p>
                                </div>
                               `
                            }
                        
                        `
                     }
                  </div>
                
                </div>
            
        `
    }
    onMount(){}
}

export default Search;