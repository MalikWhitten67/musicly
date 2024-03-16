import Component from "../utils/components.js";

class PopupModal extends Component {
    constructor() {
        super();
    }
    style = `
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

export default PopupModal;
 