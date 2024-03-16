import { Component , html} from "../../jsfiber.js";

class Alerts extends Component {
    constructor(props){
        super(props);
    }
    render(){
        return html`
            <div class="${this.props.type} alert">
                <p>${this.props.message}</p>
            </div>
        `;
    }
}

export default Alerts;