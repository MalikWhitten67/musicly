import { Component, html, h ,f}  from "../../jsfiber.js";


class Home extends Component{
    constructor(props){
        super(props);
    }
    render(){
        return html`
        <div data-ref="view" data-replace="outerHTML">
              <div class="flex flex-col gap-5 p-5">
              <h1>Picked for you</h1>
              <h1>Todays Trending</h1>
              <h1>Recently Played</h1>
              <h1>Others like</h1>
               </div>
             
          </div>
        `;
    }   
}

export default Home;