import Component from "../../utils/components.js";
import youtube from "../../../../src/js/index.js";
import PopupModal from "../../components/popupmodal.js";
class Search extends Component {
  state = {
    results: [],
    isSearching: false,
    query: ''
  }
  constructor() {
    super();
  }
  style = `
     
     input[type="text"]{  
        height: 50px;
        text-indent: 10px;
        width: 100%;
        border-radius: 50px;
        border:1px solid #e3e1e1;  
        display: flex; 
        margin-bottom: 10px;
     }
      *{
        font-family: 'Poppins', sans-serif; 
      }
    
      .container{
        display: flex;
        padding: 5px;
        justify-content: space-evenly;
        flex-direction: column;
      }
      input[type="text"]:focus{
        outline: none;
      }

      .song{
        display: flex;
        flex-direction: column; 
        margin-bottom: 10px;
      }
      .song img{
        width: 60px;
        height: 60px;
        object-fit: cover;
        border-radius: 10px;
      }
      .btn{
        padding: 10px 20px;
        border: none; 
        color: black;
        border-radius: 10px;
      }
      .relative{
        position: relative;
      }
      .absolute{
        position: absolute;
        top: 0;  
        color: #fff;
        border: none;
        border-radius: 50%;
      }
       .mb-24{
        margin-bottom: 24px;
       }
       
      .musicly_song_title{
        margin: 10px 0 10px 0;
      }

      .flex{
        display: flex;
      }

      .p-2{
        padding: 10px;
      }

      .flex-col{
        flex-direction: column;
      }
        .gap-1{
            gap: 10px;
        }

        .btn-sm{
            padding: 5px 10px;
            border: none; 
            color: #fff;
            border-radius: 10px;
            width:30px;
            height:30px;
        }

       .list-none{
              list-style: none;
       }
       .gap-2{
              gap: 20px;
       }

       .mt-5{
                margin-top: 25pt  
       }
       .hero *{
         margin:0;
         padding:0; 
         font-size: 1.5rem;
       }

       
 
       .mt-6{
          margin-top: 2rem
       }

       .hero{

       }

       .musicly_song_data p{
        margin: 0;
        margin-top: 5px;
        margin-bottom: 5px;
        margin-left: 10px;
       }

       .mt-2{
        margin-top: 20px;
       }

       .fixed{
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
       }
       .p-5{
        padding: 20px;
       }
    `
  render() {
    let queries = JSON.parse(localStorage.getItem('queries')) || [];
    return `
     <div>
      
    <div class="navbar-top" style="position: fixed; top: 0; left: 0; right: 0; padding: 15px; background: #fff; box-shadow: 0 0 10px rgba(0,0,0,0.1); z-index: 100;">
    <input type="text" id="search" placeholder="Search for a song"   />
    </div>

    ${
       this.state.results.length > 0 ? `
        <div   style="margin-top: 7rem">
          <h1>Search Results</h1>
          <span class="mt-5">Showing ${this.state.results.length} results</span>
          <div class="mt-2" onclick="window.clearSearch()"  >Clear Search</div>
          <div class="flex flex-co mt-5">
          <ul class="list-none" style="margin: 0; padding: 0;">
            ${
                this.state.results.map((result, index) => {
                  // create a new modal 
                  return `
                  <li 
                  onclick="window.location.href = '/app/?route=player&videourl=${result.url}&title=${result.title.replace("'", '')}&thumbnail=${result.thumbnail}&artist=${result.artist}'"
                  class="flex gap-1" style="margin-bottom: ${index === this.state.results.length - 1 ? '5rem' : '20px'}">
                    <div class="relative">
                      <img src="${result.thumbnail}" alt="${result.title}"  style="width: 60px; height: 60px; object-fit: cover; border-radius: 10px;" />
                    </div>
                    <div class="musicly_song_data">
                      <p class="musicly_song_title">${result.title}</p>
                      <p>${result.artist}</p>
                      <p>${result.views}</p>
                    </div>
                  </li>  
                  `
                }).join('')
            }
          </ul>
        </div>
       </div>

        
       ` : `
       <div class="mt-6 flex flex-col gap-1" style="margin-top: 5rem">
        <h1>Recent Searches</h1>
        ${
           queries.length > 0 ? queries.map((query) => {
              return `
              <span 
              style="padding: 10px; border-radius: 10px; border: 1px solid #e3e1e1; cursor: pointer; display: flex;  margin-bottom: 10px;"
               onclick="window.search('${query}')"> 
            ${query}</span>
              `
           }).join('') : `<p>Search Something and it will appear here</p>`
        }
       
       `
    }
    </div>
    
    `
  }
  onMount() {
    let [query, setQuery] = this.useState('query', '');
    let [results, setResults] = this.useState('results', []);
    let [isSearching, setIsSearching] = this.useState('isSearching', false);
    let recentSearches = JSON.parse(localStorage.getItem('queries')) || [];
    let input = this.getElement('#search');
    input.addEventListener('input', (e) => {
      setQuery(e.target.value);
    })
    function fetchResults(q) {
      let queries = JSON.parse(localStorage.getItem('queries')) || [];
      if(!queries.includes(q)){
        queries.push(q)
        localStorage.setItem('queries', JSON.stringify(queries))
      }
      setIsSearching(true)
      youtube.findSong(q).then((results) => {
        setResults(results)
        setIsSearching(false)
         
      })
    }
    window.clearSearch = () => {
      setResults([])
      setQuery('')
    }
    window.search = (q) => {
      setQuery(q)
      fetchResults(q)
      input.value = q
       
    }
    input.addEventListener('keyup', async (e) => {
      if (e.key === 'Enter') {
        let q = query()
        setResults([])
        fetchResults(q)

      }
      if (e.key === 'Backspace') {
        console.log('Backspace')
        let q = query()
        if (q.replace(/\s/g, '').length === 0) {
          setResults([])
        }
      }
    })
  }
}
customElements.define('search-app', Search);
export default Search;