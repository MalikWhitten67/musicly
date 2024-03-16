
/**
 * @description Creates a callable function that can be invoked toplevel of the component parent
 * @param {Function} func 
 * @returns  {String}
 */
let functions = new Map();
var f = (func, args = null) => {
    const randomName = Math.random().toString(36).substring(7); // Generate random name if func doesn't have one
    const funcName = func.name || randomName;

    const usingRandomName = func.name ? false : true;
    const callback = function (event) {  
        func(event)
    };

    
    if(!window[`call${funcName}`]){
        window[`call${funcName}`] = callback;
    }
 

    return `window.call${funcName}(${args ? typeof args === 'string' ? `'${args}'` : args : 'event'})`;
};


let state = new Map();

window.navigate = (url) => {
    window.location.href = url;
}


/**
 * @description Allows you to write html in js cleaner
 * @param {String} strings 
 * @param  {...any} values 
 * @returns 
 */
function html(strings, ...values) {
    let str = '';
    strings.forEach((string, i) => {
        str += string + (values[i] || '');
    });
    return str;
}

class Component {
    constructor() {
        this.state =  {};
        this.props = {};
        this.style = '';
        this.vdom = '';
        this.refs = {};
        this.memoized = {};
    }
     
    
    memoizeComponent(component, props, html) {
        console.log('memoizing', component.name)
        if(!this.memoized[component.name]){
            this.memoized[component.name] = new component(props);
            this.memoized[component.name].props = props;
        }
        this.memoized[component.name].onMount();
        return this.memoized[component.name];
    }
    useRef(key, initliaValue) {
        if(!this.refs[key]){
            this.refs[key] = { current: initliaValue };
        }
        return { current: initliaValue, bind: key};

    }
    setState(newState,  ...refs) {
        this.state = {...this.state, ...newState};
        state.set(this.constructor.name, this.state);
        if(!refs) throw new Error('You must provide a reference to update the state');
        refs.forEach((ref) => {
            let oldEl = document.querySelector(`[data-ref="${ref}"]`);
            let newl = new DOMParser().parseFromString(this.render(), 'text/html').querySelector(`[data-ref="${ref}"]`); 
            if(!newl || !oldEl) return;
            newl.setAttribute('data-ref', ref);
            if(oldEl.hasAttribute('data-replace') && oldEl.getAttribute('data-replace') === 'outerHTML'){
                oldEl.outerHTML = newl.outerHTML;
                return;
            }
            if(oldEl.hasAttribute('data-replace') && oldEl.getAttribute('data-replace') === 'attributes'){
                for(let attr of oldEl.attributes){
                    oldEl.removeAttribute(attr.name);
                }
                for(let attr of newl.attributes){
                    oldEl.setAttribute(attr.name, attr.value);
                }
                return;
            }
            oldEl.outerHTML = newl.outerHTML;
        }); 
        this.vdom = this.render();
    }

    /**
     * @template T
     * @param {String} key 
     * @param {T} value 
     * @param {*} options 
     * @returns  {Array<T, Function, Function>}
     */
    useState(key, value, options = {}) {
        if(!this.state[key]){ 
            this.state[key] = value;
        }

        if(options.persist){
            let persistedState = state.get(this.constructor.name);
            if(persistedState){
                this.state[key] = persistedState[key];
            }
        }
         
        let setState = (newState, ...refs) => {  
            this.state[key] = newState; 
            if(!refs) throw new Error('You must provide a reference to update the state');
            refs.forEach((ref) => { 
                let oldEl = document.querySelector(`[data-ref="${ref}"]`);
                let newl = new DOMParser().parseFromString(this.render(), 'text/html').querySelector(`[data-ref="${ref}"]`); 
                if(!newl) return;
                newl.setAttribute('data-ref', ref);
                if(oldEl.hasAttribute('data-replace') && oldEl.getAttribute('data-replace') === 'outerHTML'){ 
                    oldEl.outerHTML = newl.outerHTML; 
                    return;
                }
                if(oldEl.hasAttribute('data-replace') && oldEl.getAttribute('data-replace') === 'attributes'){
                    let newAttributes = newl.attributes;
                    for (let attr of newAttributes) {
                        oldEl.setAttribute(attr.name, attr.value);
                    }
                    return;
                }
                oldEl.innerHTML = newl.innerHTML;
            })    
        }
        const getState = () => {
            return this.state[key];
        }
        return [this.state[key], setState, getState];
    }
    
    $ = (selector) => {
        return document.querySelector(selector);
    }
    

    getElement(id) {
        return document.getElementById(id);
    }


    render() {
        return '';
    }

    onMount() {
        return '';
    }
}
/**
 * @description Render a component to the DOM
 * @param {Function} component 
 * @param {HTMLElement} root
 */

function render(component, root) {
    let comp = new component();
    let html = comp.render();
    let style = comp.style;
    let styleTag = document.createElement('style');
    styleTag.innerHTML = style;
    root.innerHTML = html;
    root.appendChild(styleTag);
    comp.vdom = html
    window.onload = () => {
        comp.onMount();
    }
}

  

/**
 * @description Create a virtual jsfiber component and use it in the DOM
 * @param {Function} component 
 * @param {Object} props 
 * @param {String} html
 * @returns 
 */

const memoizes = {};
let hasMounted = []
function  h(component, props, html) { 
    if(!props) props = {};
    if(!memoizes[component.name]){ 
        memoizes[component.name] = new component(props);
    } 
    let comp = memoizes[component.name]; 
    comp.props = props;
    comp.vdom =  comp.render(); 
    if(!hasMounted.includes(comp)){
        hasMounted.push(comp);
        comp.onMount();
    } 
    return comp.vdom;
}

 
export { f, h, render, html, Component}
