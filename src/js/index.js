import { Component  } from '../utils/components.js';
import  './search/index.js';
import  '../components/navbar.js';
import  './song/index.js';
import youtube from '../../../src/js/index.js'; 

class PlayModal extends HTMLElement {
    constructor() {
        super();
        this.style = `
        .modal{
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            justify-content: center;
            align-items: center;
            z-index: 1000;
        }
        `
    }
    render() {
        return `
            <div class="modal">
                <div class="modal-content">
                     <slot/>
                </div>
            </div>
        `
    }

}
class Musicly extends Component {
    constructor() {
        super(); 
        this.route = new URLSearchParams(window.location.search).get('route') || 'home'
    }
     style = ` 
                *{
                    font-family: 'Poppins', sans-serif; 
                } 
                .container{
                    display: flex;
                    padding: 10px;
                    flex-direction: column;  
                }
                .btn{
                    padding: 10px 20px;
                    border: none;
                    background: #000;
                    color: #fff;
                }
                .btn:hover{
                    background: #333;
                }
                .rounded-full{
                    border-radius: 20px;
                }
                .w-5{
                    width: 100px;
                }
             
        `
    
    render() { 
        switch(this.route){
            case 'home':
                return `
                    <div class="container" id="main">
                    <h1>My Playlist</h1>
                    <h1>Welcome to Musicly</h1>
                     <p>Add Tracks to your playlist by browsing and listening using the search tab</p>
                     <button class="btn rounded-full w-5" onclick="window.location.href = '/app/?route=search'">Search</button>
                     
                   
                </div> 
                <navbar-app></navbar-app>
                `
            case 'search':
                return `
                <search-app></search-app>
                <navbar-app></navbar-app>  
                `
                break;
            case 'player':
                let url = new URLSearchParams(window.location.search).get('videourl')
                
                return ` 
                <song-player-app></song-player-app>
                <navbar-app></navbar-app>
                `
        
        }
    }
    onMount(){
      
    } 
}

customElements.define('play-modal', PlayModal);
  
Musicly.prototype.mount(true);