import { useState } from 'react'
import './App.css' 
import './manifest.json'
import Home from './pages/home'
import Library from './pages/library'

function App() {
 
window.isFirstLoad = true;
   let [route, setRoute] = useState('home')
   window.route = route
   window.navigate = (route) => {
      setRoute(route)
      window.dispatchEvent(new Event('popstate'))
   }
  if(!localStorage.getItem('library')){ 
    let lib = []
    lib.push({playlist: 'Liked Music',  type:'liked', songs:[], id:'liked', description:'Songs you liked'})
    localStorage.setItem('library', JSON.stringify(lib))
  }
   switch (route) {
      case 'home':
        return <Home  route={route} setRoute={setRoute}/>
      case 'library':
        return <Library route={route} setRoute={setRoute}/>
      default:
        return <Home  route={route} setRoute={setRoute}/>
   }
}

 

export default App
