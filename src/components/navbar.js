import { html, h, Component, f } from "../jsfiber.js";
import Modal from "./modal.js";
class Navbar extends Component {
  render(){
    let [route, setRoute] = this.useState('route', 'home')
    const navigate = (route) => {
      console.log(route)
        window.history.pushState({}, '', `?route=${route}`);
        window.dispatchEvent(new PopStateEvent('popstate'));
        setRoute(route, 'navbar');
    }
    let device = {
      isIOS: /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream
    }
     
    let is_tandalone = window.matchMedia('(display-mode: standalone)').matches;
    window.is_tandalone = is_tandalone;
    window.device = device;
    return html`
    <nav class="navbar" data-ref="navbar"
     style="background-color: ${window['navbarColor'] || 'white'}"
    >
    <ul ${device.isIOS && is_tandalone ? 'style="margin-bottom:calc(10% - 12px) !important;"' : ''}>
      <li>
      <a 
      onclick="${f(navigate, 'home')}"
    "
      class="flex flex-col items-center" >
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"
 
      class="w-6 h-6       ${location.href.includes('home') ? 'stroke-orange' : ''}">
  <path stroke-linecap="round" stroke-linejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
</svg>

       
        

      </a></li>
      <li><a 
      onclick="${f(navigate, 'search')}"
      class="flex flex-col items-center">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6
        ${location.href.includes('search') ? 'stroke-orange' : ''}
        ">
          <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
        </svg>
        

      </a></li>
      <li>
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="black" class="w-6 h-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="m9 9 10.5-3m0 6.553v3.75a2.25 2.25 0 0 1-1.632 2.163l-1.32.377a1.803 1.803 0 1 1-.99-3.467l2.31-.66a2.25 2.25 0 0 0 1.632-2.163Zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 0 1-1.632 2.163l-1.32.377a1.803 1.803 0 0 1-.99-3.467l2.31-.66A2.25 2.25 0 0 0 9 15.553Z" />
</svg>

  </li>
      <li onclick="${f(navigate, 'favorites')}" class="flex flex-col items-center">
      
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="black" class="w-6 h-6
        ${location.href.includes('favorites') ? 'fill-orange' : ''}
        ">
         <path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
        </svg>
       

      </li>
    </ul>
  </nav>
  <slot/>
    
    `
  }
  onMount(){
    let [route, setRoute] = this.useState('route', 'home');
    const navigate = (route) => {
      window.history.pushState({}, '', `?route=${route}`);
      window.dispatchEvent(new PopStateEvent('popstate')); 
  }
   
    window.addEventListener('popstate', () => {
      let url = new URL(window.location.href);
      let route = url.searchParams.get('route');
      setRoute(route, 'navbar');
    })  
    window.navigate = navigate;
  }
}
 
export default Navbar; 