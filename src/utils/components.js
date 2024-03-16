export class Component extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({mode: 'open'});
        this.shadowRoot.innerHTML = this.html;
        this.state = {}; 
    }
    compareAttributes(a, b) { 
        if(a.length !== b.length) return false;
        for(let i = 0; i < a.length; i++){
            if(a[i].name !== b[i].name || a[i].value !== b[i].value){
                return false;
            }
        }
        return true;
    } 
    computeChanges(oldEl, newEl) {  
        const changes = []
        if(!oldEl || !newEl) return changes
        if(oldEl.children && oldEl.children.length > 0){
            let oldChildren = Array.from(oldEl.children)
            let newChildren = Array.from(newEl.children)
             for(var i = 0; i < oldChildren.length; i++){
                changes.push(...this.computeChanges(oldChildren[i], newChildren[i]))
               
             }
            return changes
        }

        if (oldEl.tagName !== newEl.tagName && oldEl.isEqualNode(newEl)) {
            changes.push({ type: 'replace', oldEl, newEl })
        } 
        if(oldEl.attributes && newEl.attributes &&  ){
            changes.push({ type:  'attributes', oldEl: oldEl, newEl: newEl })
        }
        if(oldEl.textContent !== newEl.textContent){
            changes.push({ type: 'text', oldEl, newEl })
        }
        return changes
    }

    handleChanges(changes) {  
        changes.forEach(change => {
            if(change.type === 'replace'){ 
                change.oldEl.replaceWith(change.newEl)
            }
            if(change.type === 'attributes'){ 
                change.oldEl.replaceWith(change.newEl)
            }
            if(change.type === 'text'){
                change.oldEl.innerHTML = change.newEl.innerHTML
            }
        })
    }

    update() {
         let old = this.shadowRoot.firstElementChild 
         let current = document.createElement('div') 
         current.innerHTML = this.render();
         let changes = this.computeChanges(old, current)
         this.handleChanges(changes)
    }
    useState(key, value) {
       if(!this.state[key]){
           this.state[key] = value;
       }
       const getState = () => this.state[key] || value;
         return [getState, (v) => this.setState(key, v)]
    }
    setState(key, value) {
        this.state[key] = value;
        this.update();
    }
    render() {}
    onMount() {}
    connectedCallback() { 
        this.shadowRoot.innerHTML = this.render();
        if(this.style) this.shadowRoot.innerHTML +=  `<style>${this.style || ''}</style>`
        this.onMount();
    }
    getElement(selector) {
        return this.shadowRoot.querySelector(selector);
    }

    mount(main = false){ 
        if(!customElements.get(`${this.constructor.name.toLowerCase()}-app`)){
            customElements.define(`${this.constructor.name.toLowerCase()}-app`, this.constructor);
        }  
        main  ? document.body.innerHTML = `<${this.constructor.name.toLowerCase()}-app></${this.constructor.name.toLowerCase()}-app>` : null;
    }
}

export default Component;