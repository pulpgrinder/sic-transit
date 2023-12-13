/*  sic-transit.js Copyright 2023 by Anthony W. Hursh
 *  MIT license.
 */

class SicTransit {
    createOverlayPanels(){
        let overlaypanel;
        let overlayPanels = [
            "blackpanel",
            "graypanel",
            "whitepanel",
            "irispanel",
            "flippanel",
            "flipbackgroundpanel"
        ];
        overlayPanels.forEach(element => {
            overlaypanel = document.createElement('div');
            this[element] = overlaypanel;
            overlaypanel.classList.add(this.panelClass,'sic-transit-panel','sic-transit-' + element);
            this.container.appendChild(overlaypanel);
            this.panelStack.unshift(overlaypanel);
        });
        this.normalizeStack();
    }
    constructor(containerId, panelClass) {
    // Set up the user-suppplied container.
      this.containerId = containerId;
      this.container = document.querySelector(containerId);
      this.container.classList.add("sic-transit-container");
      
 /* If the user-supplied panel class is (e.g.) .foobar, some things want it as the raw class 'foobar', while others want it in the CSS/Query format '.foobar'. Irritating. We'll store it both ways. */
      this.panelClass = panelClass.substring(1);
      this.panelQuery = panelClass;

      // Used for timing and statistical purposes.
      this.date = new Date();
      this.synchro = 0;

      // Set up our panels.
      this.panelStack = [];
      // Load up the internal panel stack with any panels the user has already supplied in the given panel container.
      this.loadStack();

      // Create our special internal overlay panels. These are things like solid black, solid white ,etc. Used to support various transitions.
      this.createOverlayPanels(); 
    }

// Public methods.
    // Returns the element currently at the bottom of the stack, if there is
    // one. Otherwise throws an error.
    getBos(self=this){
        if(self.panelStack.length > 0){
            return self.panelStack[0];
        }
        throw new Error("Sic Transit getBos(): trying to get element at bottom of empty stack.");
    }
    // Return the container id for this instance of Sic Transit.
    getContainerId(self=this){
        return self.containerId;
    }
    // Return the panel class for this instance of Sic Transit in CSS query form.
    getPanelClass(self=this){
        return  self.panelQuery;
    }
/* Returns an array of all panels in the panel container which have the specified panel class and  an id value. Does not return the internal special panels such as the black, white, and gray panels used in certain transitions. */
    getPanelList(self=this){
        let panelList = [];
        let panels = document.querySelectorAll(self.containerId + " > " + this.panelQuery);
        for(let i = 0; i < panels.length; i++){
            if(panels[i].id !== ""){
                panelList.push(panels[i].id);
            }
        }
        return panelList;
    }
/* Returns the panel currently at the top of the panel stack, if there is one. Otherwise throws an error. */
    getTos(self=this){
        if(self.panelStack.length > 0){
            return self.panelStack[self.panelStack.length - 1];
        }
        throw new Error("Sic Transit getTos(): trying to get element at top of empty stack.");
    }
    getTransitionList(self=this){
        let transitions = [];
        for (let key in self.dispatchTable) {
            if (self.dispatchTable.hasOwnProperty(key)) {
              transitions.push(key);
            }
         }
         return transitions;
    }
    getZIndex(panelSelector,self=this){
        let selectedPanel = this.selectPanel(panelSelector,self);
        return window.getComputedStyle(selectedPanel).getPropertyValue('z-index');
    }
 
    moveToBos(panelSelector,self=this){
        let selectedPanel = this.selectPanel(panelSelector);
        self.removeFromStack(selectedPanel,self);
        self.panelStack.unshift(selectedPanel);
        self.normalizeStack(self);
    }
    moveToTos(panelSelector,self=this){
        let selectedPanel = this.selectPanel(panelSelector);
        self.removeFromStack(selectedPanel,self);
        self.panelStack.push(selectedPanel);
        self.normalizeStack(self);
    }
    performTransition(args){
        if(args.self === undefined){
            args.self = this;
        }
        let self = args.self;
        args.selectedPanel =  self.selectPanel(args.panelSelector,self);
        args.startTime = new Date().getTime();
        if(self.dispatchTable[args.transitionName] === undefined){
            throw new Error("SicTransit: " + args.transitionName + " is not a recognized transition");
        }
        args.transitionFunction = self.dispatchTable[args.transitionName]["forwardTransition"];
        args.firstanimation = self.dispatchTable[args.transitionName]["animation"];
        args.secondanimation = self.dispatchTable[args.transitionName]["secondanimation"];
        args.transitionFunction(args);
    }
    /*  Removes the selected panel from the panel stack (but not the DOM), if it's there. Returns the panel if it was found, otherwise
    returns null. */
    removeFromStack(panelSelector,self=this){
        let panel = self.selectPanel(panelSelector, self);
        let panelStack = self.panelStack;
        for(let i = 0; i < panelStack.length; i++){
            if(panelStack[i] === panel){
                panelStack.splice(i,1);
                return panel;
            }
        }
        return null;
    }
    // Remove selected panel from the panel stack and the
    // DOM. Returns the selected panel, in case you want to save it
    // for adding back later or do something else with it.
    removePanel(panelSelector,self=this){
        let panel = self.selectPanel(panelSelector);
        self.removeFromStack(panel, self);
        panel.remove();
        return panel;
    }
    /*  rotateStack() with a positive argument transfers panels from the 
    bottom of the stack to the top of the stack the specified number of 
    times. A negative argument transfers elements from the top of the
    stack to the bottom. Does nothing if the argument is zero, other than making sure the top of stack panel is visible (below). */
    rotateStack(args){
        let self = args.self;
        let stackRotation = args.panelSelector;
        if(stackRotation < 0){
             for(let i = 0; i > stackRotation; i--){
                self.panelStack.unshift(self.panelStack.pop());
             }
         }
         else if(stackRotation > 0){
             for(let i = 0; i < stackRotation; i++){
                 self.panelStack.push(self.panelStack.shift())
             }
         }
         self.normalizeStack(self);
         self.showPanel(self.getTos(self),self);
     }
/* Returns the panel corresponding to the given panelSelector, if it exists. Returns null if panelSelector is invalid. There are several possibilities for panelSelector. If it is blank, the panel at the current
    top of the stack is returned. If panelSelector is already a DOM element, it gets returned as-is. If panelSelector is a string, it is treated as a query selector, and the first matching DOM element is returned (if one exists). If panelSelector is a positive integer, the element at that index in the panel stack is returned (if it exists). If panelSelector is a negative integer, the element at that index from the top of the stack is returned (if it exists). If panelSelector is 0, the element at the bottom of the stack is returned (same as getBos()). If panelSelector is -0, the element at the top of the stack is returned (same as getTos()). */
    selectPanel(panelSelector,self=this){
        // No selector, return top of stack.
        if((panelSelector === undefined) || (panelSelector === "")){
            return self.getTos(self);
        }
        else if(panelSelector instanceof HTMLElement){ // It's already a DOM element, just return it.
            return panelSelector;
        }
        else if(Number.isInteger(panelSelector)){
/*             // We're selecting the item by stack position
            if(panelSelector > 0){
                // Counting up from bottom of stack.
                if(panelSelector < self.panelStack.length){
                    return self.panelStack[panelSelector];
                }
                else{
                    console.error("SicTransit selectPanel(): panel index " + panelSelector + " is outside the bounds of the panelStack.");
                        return null;
                }
            }
            else if(panelSelector < 0) {
                // Counting down from top of stack.
                let panelIndex = self.panelStack.length + (panelSelector - 1);
                if(panelIndex >= 0){
                    return self.panelStack[panelIndex];
                }
                else{
                    console.error("SicTransit selectPanel(): panelStack index " + panelIndex + " (" + panelSelector + " from top of stack) is outside the bounds of the panelStack.");
                    return null;
                } 
            }
            // ES2015 lets us distinguish between +0 and -0.
            else if(Object.is(panelSelector,-0)){
                    return self.panelStack[self.panelStack.length - 1];
            }
            else{
                return self.panelStack[0];
            } */
            return self.panelStack[0];
        }
        else if(typeof panelSelector === 'string'){
            // we assume strings are query selectors
            let selectedPanel = document.querySelector(panelSelector);
            if(selectedPanel === null){
                console.error("SicTransit selectPanel(): no panels matching " + panelSelector);
                return null;
            }
            return selectedPanel;
       }
        else {
            // The panelSelector is something truly weird. Give up.
            console.error("SicTransit selectPanel(): panelSelector " + panelSelector + " is invalid.");
                return null;
        }
    }

// Sets the given parameter for the specified transition. If the transition isn't specified, or is set to '*', sets it for all transitions.

    setParameter(parametername, parametervalue,transitionname){
        let transitionList;
        if((transitionname === undefined) || (transitionname === "*")) {
            transitionList = this.getTransitionList(this);
        }
        else{
            transitionList = [transitionname];
        }
        for(let i = 0; i < transitionList.length; i++){
            this.dispatchTable[transitionList[i]][parametername] = parametervalue;
        }
    }

// Put selected panel in the panel container (if it isn't already there), move it to top of the panel stack, and display it.
    showPanel(selector,self=this){
        let selectedPanel = self.selectPanel(selector);
        if(selectedPanel === null){
            return;
        }
        // Remove from stack (if it's already there).
        self.removeFromStack(selectedPanel, self); 
        // Remove from wherever it is in the DOM. 
        selectedPanel.remove(); 
        // Add the necessary classes to make it behave as a Sic Transit
        // panel.
        selectedPanel.classList.add(self.panelClass,"sic-transit-panel");
        // Reset display parameters (in case they were previously altered).
        selectedPanel.style.display = "block";
        selectedPanel.style.opacity = 1.0;
        selectedPanel.style.transform = "";
        selectedPanel.style.transformOrigin = "";
        // Put it on top of stack.
        self.panelStack.push(selectedPanel);
        // Put it back in DOM, but now inside the container (in case it wasn't there before)
        self.container.appendChild(selectedPanel);
        self.normalizeStack(self);
    }
    // Dump the internal state of the panel stack to the Javascript console.
    // Handy when debugging a new transition.
    stackDump(args={self:this}){
        console.log("stackDump:");
        for (const panel of args.self.panelStack) {
            if(panel.id !== ""){
                console.log("id: " + panel.id + " display:" + panel.style.display + " z-index: " + panel.style.zIndex);
            }
            else {
                console.log("class: " + panel.className + " display:" + panel.style.display + " z-index: " + panel.style.zIndex);
            }
        } 
    }

    // Exchanges the top two elements on top of the panel stack.
    stackSwap(self=this){
        if(self.panelStack.length < 2){
            console.error("SicTransit stackSwap(): can't swap when length of panelStack is < 2.");
            return;
        }
        let temp1 = self.panelStack.pop();
        let temp2 = self.panelStack.pop();
        self.panelStack.push(temp1);
        self.panelStack.push(temp2);
        self.normalizeStack(self)
    }
    // Internal methods below. Not well-documented and not intended to be called
    // directly by user code. These may change at any time. Use at 
    // your own risk.

/* Lookup table for transition parameters. You shouldn't mess with this directly unless you're defining a new transition or fixing a bug, etc.  */
    dispatchTable =  {
        "cutIn": {
            forwardTransition: this.cutIn,
            firstanimation: [],
            secondanimation: [],
            boxShadow: "10px 10px 20px rgba(0,0,0,0.5)",
            // cuts happen immediately, no timing parameters
            easing:"",
            duration:0,
            callback:null
        },
        "cutOut": {
            forwardTransition: this.cutOut,
            firstanimation: [],
            secondanimation: [],
            boxShadow: "10px 10px 20px rgba(0,0,0,0.5)",
            // cuts happen immediately, no timing parameters
            easing:"",
            duration:0,
            callback:null
        },
        "dissolveIn": {
            forwardTransition: this.dissolveIn,
            firstanimation: [{ display:"block", opacity: 0}, {display:"block",opacity:1}],
            secondanimation: [{display:"block", opacity:1}, {display:"block", opacity:0}],
            boxShadow: "10px 10px 20px rgba(0,0,0,0.5)",
            easing: 'ease-in-out',
            duration:2000,
            callback:null
        },
        "dissolveOut": {
            forwardTransition: this.dissolveOut,
            firstanimation: [{ display:"block", opacity: 1}, {display:"block",opacity:0}],
            secondanimation: [{display:"block", opacity:0}, {display:"block", opacity:1}],
            boxShadow: "10px 10px 20px rgba(0,0,0,0.5)",
            easing: 'ease-in-out', 
            duration:2000,
            callback:null
        },
        "fadeInFromBlack": {
            forwardTransition: this.fadeInFromBlack,
            firstanimation: [{ display:"block", opacity: 0}, {display:"block",opacity:1}],
            boxShadow: "10px 10px 20px rgba(0,0,0,0.5)",
            easing: 'ease-in-out', 
            duration:2000,
            callback:null
        },
        "fadeOutToBlack": {
            forwardTransition: this.fadeOutToBlack,
            firstanimation: [{opacity:1}, {opacity:0}],
            boxShadow: "10px 10px 20px rgba(0,0,0,0.5)",
            easing: 'ease-in-out', 
            duration:2000,
            callback:null
        },
        "fadeInFromGray": {
            forwardTransition: this.fadeInFromGray,
            firstanimation: [{ display:"block", opacity: 0}, {display:"block",opacity:1}],
            boxShadow: "10px 10px 20px rgba(0,0,0,0.5)",
            easing:'ease-in-out',
            duration:2000,
            callback:null
        },
        "fadeOutToGray": {
            forwardTransition: this.fadeOutToGray,
            firstanimation: [{opacity:1}, {opacity:0}],
            boxShadow: "10px 10px 20px rgba(0,0,0,0.5)",
            easing:'ease-in-out',
            duration:2000,
            callback:null
        },
        "fadeInFromWhite": {
            forwardTransition: this.fadeInFromWhite,
            firstanimation: [{ display:"block", opacity: 0}, {display:"block",opacity:1}],
            boxShadow: "10px 10px 20px rgba(0,0,0,0.5)",
            easing:'ease-in-out',
            duration:2000,
            callback:null
        },
        "fadeOutToWhite": {
            forwardTransition: this.fadeOutToWhite,
            firstanimation: [{opacity:1}, {opacity:0}],
            boxShadow: "10px 10px 20px rgba(0,0,0,0.5)",
            easing:'ease-in-out',
            duration:2000,
            callback:null
        },
        "flipInX":{
            forwardTransition: this.flipInX,
         //   firstanimation: [{display:"block", transform: "rotateX(180deg)"}, {display:"block", transform: "rotateX(360deg)"}],
            firstanimation: [{display:"block", transform: "rotateX(0deg)"}, {display:"block", transform: "rotateX(180deg)"}],
            boxShadow: "10px 10px 20px rgba(0,0,0,0.5)",
            easing:'ease-in-out',
            duration:1000,
            callback:null
        },
        "flipOutX":{
            forwardTransition: this.flipOutX,
            firstanimation: [{display:"block", transform: "rotateX(180deg)"}, {display:"block", transform: "rotateX(0deg)"}],
          //  firstanimation: [{display:"block", transform: "rotateX(180deg)"}, {display:"block", transform: "rotateX(0deg)"}],
            boxShadow: "10px 10px 20px rgba(0,0,0,0.5)",
            easing:'ease-in-out',
            duration:1000,
            callback:null
        },
        "flipInY":{
            forwardTransition: this.flipInY,
         //   firstanimation: [{display:"block", transform: "rotateY(180deg)"}, {display:"block", transform: "rotateY(360deg)"}],
            firstanimation: [{display:"block", transform: "rotateY(0deg)"}, {display:"block", transform: "rotateY(180deg)"}],
            boxShadow: "10px 10px 20px rgba(0,0,0,0.5)",
            easing:'ease-in-out',
            duration:1000,
            callback:null
        },
        "flipOutY":{
            forwardTransition: this.flipOutY,
          //  firstanimation: [{display:"block", transform: "rotateY(0deg)"}, {display:"block", transform: "rotateY(-180deg)"}],
            firstanimation: [{display:"block", transform: "rotateY(180deg)"}, {display:"block", transform: "rotateY(0deg)"}],
            boxShadow: "10px 10px 20px rgba(0,0,0,0.5)",
            easing:'ease-in-out',
            duration:1000,
            callback:null
        },
        "hingeInBottom":{
            forwardTransition: this.hingeInBottom,
            firstanimation: [{display:"block", transform: "rotateX(180deg)"}, {display:"block", transform: "rotateY(0deg)"}],
            boxShadow: "-10px -10px 20px rgba(0,0,0,0.5)",
            easing:'ease-in-out',
            duration:500,
            callback:null
        },
        "hingeOutBottom":{
            forwardTransition: this.hingeOutBottom,
            firstanimation: [{display:"block", transform: "rotateY(0deg)"}, {display:"block", transform: "rotateX(180deg)"}],
            boxShadow: "-10px -10px 20px rgba(0,0,0,0.5)",
            easing:'ease-in-out',
            duration:500,
            callback:null
        },
        "hingeInLeft":{
            forwardTransition: this.hingeInLeft,
            firstanimation: [{display:"block", transform: "rotateY(-180deg)"}, {display:"block", transform: "rotateY(0deg)"}],
            boxShadow: "10px 10px 20px rgba(0,0,0,0.5)",
            easing:'ease-in-out',
            duration:500,
            callback:null
        },
        "hingeOutLeft":{
            forwardTransition: this.hingeOutLeft,
            firstanimation: [{display:"block", transform: "rotateY(0deg)"}, {display:"block", transform: "rotateY(-180deg)"}],
            boxShadow: "10px 10px 20px rgba(0,0,0,0.5)",
            easing:'ease-in-out',
            duration:500,
            callback:null
        },
        "hingeInRight":{
            forwardTransition: this.hingeInRight,
            firstanimation: [{display:"block", transform: "rotateY(180deg)"}, {display:"block", transform: "rotateY(0deg)"}],
            boxShadow: "-10px -10px 20px rgba(0,0,0,0.5)",
            easing:'ease-in-out',
            duration:500,
            callback:null
        },
        "hingeOutRight":{
            forwardTransition: this.hingeOutRight,
            firstanimation: [{display:"block", transform: "rotateY(0deg)"}, {display:"block", transform: "rotateY(180deg)"}],
            boxShadow: "-10px -10px 20px rgba(0,0,0,0.5)",
            easing:'ease-in-out',
            duration:500,
            callback:null
        },
        "hingeInTop":{
            forwardTransition: this.hingeInTop,
            firstanimation: [{display:"block", transform: "rotateX(-180deg)"}, {display:"block", transform: "rotateY(0deg)"}],
            boxShadow: "10px 10px 20px rgba(0,0,0,0.5)",
            easing:'ease-in-out',
            duration:500,
            callback:null
        },
        "hingeOutTop":{
            forwardTransition: this.hingeOutTop,
            firstanimation: [{display:"block", transform: "rotateY(0deg)"}, {display:"block", transform: "rotateX(-180deg)"}],
            boxShadow: "10px 10px 20px rgba(0,0,0,0.5)",
            easing:'ease-in-out',
            duration:500,
            callback:null
        },
        "irisIn":{
            forwardTransition:this.irisIn,
            firstanimation: [{display:"block", clipPath:"circle(0% at center"}, {display:"block",  clipPath:"circle(100% at center)"}],
            easing:'ease-in-out',
            duration:1000,
            callback:null
        },
        "irisOut":{
            forwardTransition:this.irisOut,
            firstanimation: [{display:"block", clipPath:"circle(100% at center"}, {display:"block",  clipPath:"circle(0% at center)"}],
            easing:'ease-in-out',
            duration:1000,
            callback:null
        },
        "irisInFromBlack":{
            forwardTransition:this.irisInFromBlack,
            easing:'ease-in-out',
            duration:1000,
            callback:null
        },
        "irisOutToBlack":{
            forwardTransition:this.irisOutToBlack,
            easing:'ease-in-out',
            duration:1000,
            callback:null
        },
        "irisInFromGray":{
            forwardTransition:this.irisInFromGray,
            easing:'ease-in-out',
            duration:1000,
            callback:null
        },
        "irisOutToGray":{
            forwardTransition:this.irisOutToGray,
            easing:'ease-in-out',
            duration:1000,
            callback:null
        },
        "irisInFromWhite":{
            forwardTransition:this.irisInFromWhite,
            easing:'ease-in-out',
            duration:1000,
            callback:null
        },
        "irisOutToWhite":{
            forwardTransition:this.irisOutToWhite,
            easing:'ease-in-out',
            duration:1000,
            callback:null
        },
        "menuInBottom": {
            forwardTransition: this.menuInBottom,
            firstanimation: [{display:"block", transform: "translateY(100%)"}, {display:"block",transform: "translateY(%%%%)"}],
            boxShadow: "-10px -10px 30px rgba(0,0,0,0.5)",
            easing:'ease-in-out',
            duration:500,
            menuPercentage:25,
            callback:null
        },
        "menuOutBottom": {
            forwardTransition: this.menuOutBottom,
            firstanimation: [{transform: "translateY(%%%%)"}, {transform: "translateY(100%)"}],
            boxShadow: "-10px -10px 20px rgba(0,0,0,0.5)",
            easing:'ease-in-out',
            duration:500,
            menuPercentage:25,
            callback:null
        },
        "menuInLeft": {
            forwardTransition: this.menuInLeft,
            firstanimation: [{display:"block", transform: "translateX(-100%)"}, {display:"block",transform: "translateX(-%%%%)"}],
            boxShadow:  "10px 20px 20px 30px rgba(0,0,0,0.5)",
            easing:'ease-in-out',
            duration:500,
            menuPercentage:25,
            callback:null
        },
        "menuOutLeft": {
            forwardTransition: this.menuOutLeft,
            firstanimation: [{display:"block", transform: "translateX(-%%%%)"}, {display:"block",transform: "translateX(-100%)"}],
            boxShadow: "10px 20px 20px 30px rgba(0,0,0,0.5)",
            easing:'ease-in-out',
            duration:500,
            menuPercentage:25,
            callback:null
        },
        "menuInRight": {
            forwardTransition: this.menuInRight,
            firstanimation: [{ display:"block", transform: "translateX(100%)"}, {display:"block",transform: "translateX(%%%%)"}],
            boxShadow: "-10px -10px 20px 30px rgba(0,0,0,0.5)",
           easing:'ease-in-out',
           duration:500,
           menuPercentage:25,
           callback:null
        },
        "menuOutRight": {
            forwardTransition: this.menuOutRight,
            firstanimation: [{transform: "translateX(%%%%)"}, {transform: "translateX(100%)"}],
            boxShadow: "-10px -10px 20px 30px rgba(0,0,0,0.5)",
            easing: 'ease-in-out',
            duration:500,
            menuPercentage:25,
            callback:null
        },
        "menuInTop": {
            forwardTransition: this.menuInTop,
            firstanimation: [{display:"block", transform: "translateY(-100%)"}, {display:"block",transform: "translateY(-%%%%)"}],
            boxShadow: "10px 10px 20px rgba(0,0,0,0.5)",
            easing:'ease-in-out',
            duration:500,
            menuPercentage:25,
            callback:null
        },
        "menuOutTop": {
            forwardTransition: this.menuOutTop,
            firstanimation:[{transform: "translateY(-%%%%)"}, {transform: "translateY(-100%)"}],
            boxShadow: "10px 10px 20px rgba(0,0,0,0.5)",
            easing: 'ease-in-out', 
            duration:500,
            menuPercentage:25,
            callback:null
        },
        "newspaperIn": {
            forwardTransition: this.newspaperIn,
            firstanimation: [{display:"block", transform: "rotate(0deg)  scale(0)"}, {display:"block", transform: "rotate(720deg) scale(1)"}],
            boxShadow: "10px 10px 20px rgba(0,0,0,0.5)",
           easing:'ease-in-out',
           duration:1000,
           callback:null
        },
        "newspaperOut":{
            forwardTransition: this.newspaperOut,
            firstanimation:[{display:"block", transform: "rotate(0deg)  scale(1)"}, {display:"block", transform: "rotate(-720deg) scale(0)"}],
            boxShadow: "10px 10px 20px rgba(0,0,0,0.5)",
            easing:'ease-in-out',
            duration:1000,
            callback:null
        },
        "rotateStack": {
            forwardTransition: this.rotateStack,
            firstanimation: [],
            boxShadow: "",
            easing:'',
            duration:0,
            callback:null
        },
        "slideInBottom": {
            forwardTransition: this.slideInBottom,
            firstanimation: [{display:"block", transform: "translateY(100%)"}, {display:"block",transform: "translateY(0%)"}],
            boxShadow: "-10px -10px 30px rgba(0,0,0,0.5)",
           easing:'ease-in-out',
           duration:500,
           callback:null
        },
        "slideOutBottom": {
            forwardTransition: this.slideOutBottom,
            firstanimation: [{transform: "translateY(0%)"}, {transform: "translateY(100%)"}],
            boxShadow: "-10px -10px 20px rgba(0,0,0,0.5)",
            easing:'ease-in-out',
            duration:500,
            callback:null
        },
        "slideInLeft": {
            forwardTransition: this.slideInLeft,
            firstanimation: [{display:"block", transform: "translateX(-100%)"}, {display:"block",transform: "translateX(0%)"}],
            boxShadow:  "10px 20px 20px 30px rgba(0,0,0,0.5)",
            easing:'ease-in-out',
            duration:500,
            callback:null
        },
        "slideOutLeft": {
            forwardTransition: this.slideOutLeft,
            firstanimation: [{display:"block", transform: "translateX(0%)"}, {display:"block",transform: "translateX(-120%)"}],
            boxShadow: "10px 20px 20px 30px rgba(0,0,0,0.5)",
            easing:'ease-in-out',
            duration:500,
            callback:null
        },
        "slideInRight": {
            forwardTransition: this.slideInRight,
            firstanimation: [{ display:"block", transform: "translateX(100%)"}, {display:"block",transform: "translateX(0%)"}],
            boxShadow: "-10px -10px 20px 30px rgba(0,0,0,0.5)",
            easing:'ease-in-out',
            duration:500,
            callback:null
        },
        "slideOutRight": {
            forwardTransition: this.slideOutRight,
            firstanimation: [{transform: "translateX(0%)"}, {transform: "translateX(120%)"}],
            boxShadow: "-10px -10px 20px 30px rgba(0,0,0,0.5)",
            easing: 'ease-in-out',
            duration:500,
            callback:null
        },
        "slideInTop": {
            forwardTransition: this.slideInTop,
            firstanimation: [{display:"block", transform: "translateY(-100%)"}, {display:"block",transform: "translateY(0%)"}],
            boxShadow: "10px 10px 20px rgba(0,0,0,0.5)",
            easing:'ease-in-out',
            duration:500,
            callback:null
        },
        "slideOutTop": {
            forwardTransition: this.slideOutTop,
            firstanimation:[{transform: "translateY(0%)"}, {transform: "translateY(-100%)"}],
            boxShadow: "10px 10px 20px rgba(0,0,0,0.5)",
            easing: 'ease-in-out', 
            duration:500,
            callback:null
        },
        "swap": {
            forwardTransition: this.swap,
            firstanimation:[],
            callback:null
        },
        "zoomIn": {
            forwardTransition: this.zoomIn,
            firstanimation: [{display:"block", transform: "scale(0)"}, {display:"block", transform: "scale(1)"}],
            boxShadow: "10px 10px 20px rgba(0,0,0,0.5)",
            easing:'ease-in-out',
            duration:500,
            callback:null

        },
        "zoomOut":{
            forwardTransition: this.zoomOut,
            firstanimation: [{display:"block", transform: "scale(1)"}, {display:"block", transform: "scale(0)"}],
            boxShadow: "10px 10px 20px rgba(0,0,0,0.5)",
            easing:'ease-in-out',
            duration:500,
            callback:null
        }
    }
    loadStack(self=this){
        const panel_list = document.querySelectorAll(self.panelQuery);
        self.panelStack = [...panel_list];
        for(let i = 0; i < self.panelStack.length; i++){
            self.panelStack[i].classList.add("sic-transit-panel");
        }
        self.normalizeStack(self);
    }
    normalizeStack(self=this){
        let panelStack = self.panelStack;
        for(let index = 0; index < panelStack.length; index++){
            let panel = panelStack[index];
            panel.style.zIndex = (index - panelStack.length) + 1;
        }
    }
    performAnimation(args){
        let self = args.self;
        let dispatchEntry = self.dispatchTable[args["transitionName"]];
       // args.selectedPanel.style.display = "none";
        self.moveToTos(args.selectedPanel,self);
        const animation = args.selectedPanel.animate(args.firstanimation,{easing: dispatchEntry.easing, duration: dispatchEntry.duration});
        animation.onfinish = args.finishHandler; 
    }
    performCallback(args){
        const self = args.self;
        let dispatchEntry = self.dispatchTable[args["transitionName"]];
        if(dispatchEntry.callback === null){
            return;
        }
        args.endTime = new Date().getTime();
        dispatchEntry.callback(args);
    }
 
// Transition handling code. Not intended to be called directly from user code.
// Use performTransition instead.
    cutIn(args){
        let self = args.self;
        self.showPanel(args.selectedPanel, self);
        self.performCallback(args);
    }
    cutOut(args){
        let self = args.self;
        self.moveToBos(args.selectedPanel,self);
        self.performCallback(args);
    }
    dissolveIn(args){
        let self = args.self;
        self.synchro = 0;
        let dispatchEntry = self.dispatchTable[args["transitionName"]];
        self.moveToBos(args.selectedPanel,self);
        args.selectedPanel.style.display = "none";
        let topPanel = self.panelStack.pop();
        self.panelStack.push(topPanel);
        self.moveToTos(self.blackpanel,self);
        self.moveToTos(topPanel,self);
        self.normalizeStack(self);
        args.selectedPanel.style.opacity = 0;
        self.moveToTos(args.selectedPanel,self);;
        args.finishHandler = function(){
            self.synchro++;
            if(self.synchro < 2){
                // Second animation is still running.
                return;
            }
            args.selectedPanel.style.opacity = 1;
            args.selectedPanel.style.display = "block";
            topPanel.style.opacity = 1;
            self.normalizeStack(self);
            self.synchro = 0;
            self.performCallback(args);
        }
        const animation = args.selectedPanel.animate(dispatchEntry.firstanimation,{easing: dispatchEntry.easing, duration: dispatchEntry.duration});
        animation.onfinish = args.finishHandler;
        const topAnimation = topPanel.animate(dispatchEntry.secondanimation,{easing: dispatchEntry.easing, duration: dispatchEntry.duration});
        topAnimation.onfinish = args.finishHandler;
    }
    dissolveOut(args){
        let self = args.self;
        self.synchro = 0;
        let dispatchEntry = self.dispatchTable[args["transitionName"]];
        self.moveToTos(args.selectedPanel,self);
        let topPanel = self.panelStack[self.panelStack.length - 2];
        self.normalizeStack(self);
        args.selectedPanel.style.opacity = 1;
        topPanel.style.opacity = 0;
        args.finishHandler = function(){
            self.synchro++;
            if(self.synchro < 2){
                 // Second animation is still running.
                return;
            }
            self.moveToBos(args.selectedPanel,self);
            topPanel.style.opacity = 1;
            args.selectedPanel.style.opacity = 1;
            self.normalizeStack(self);
            self.synchro = 0;
            self.performCallback(args);
        }
        const animation = args.selectedPanel.animate(dispatchEntry.firstanimation,{easing: dispatchEntry.easing, duration:dispatchEntry.duration});
        animation.onfinish = args.finishHandler; 
        const topanimation = topPanel.animate(dispatchEntry.secondanimation,{easing: dispatchEntry.easing, duration: dispatchEntry.duration});
        topanimation.onfinish = args.finishHandler;
    }
    fadeIn(args){
        let self = args.self;
        self.moveToTos(args.fadePanel,self);
        args.selectedPanel.style.opacity = 0;
        args.selectedPanel.style.display = "block";
        self.moveToTos(args.selectedPanel,self);
        args.finishHandler = function(){
            self.moveToBos(args.fadePanel,self);
            args.selectedPanel.style.display = "block";
            args.selectedPanel.style.opacity = 1;
            self.performCallback(args);
        }
        self.performAnimation(args);
    }
    fadeOut(args){
        let self = args.self;
        self.moveToTos(args.fadePanel,self);
        args.selectedPanel.style.opacity = 1;
        args.selectedPanel.style.display = "block";
        self.moveToTos(args.selectedPanel,self);
        args.finishHandler = function(){
            self.moveToBos(args.selectedPanel,self);
            args.selectedPanel.style.opacity = 1;
            self.performCallback(args);
        }
        self.performAnimation(args);
    }
    fadeInFromBlack(args){
        let self = args.self;
        let dispatchEntry = self.dispatchTable["fadeInFromBlack"];
        args.firstanimation = dispatchEntry.firstanimation;
        args.fadePanel = self.blackpanel;
        self.fadeIn(args);
    }
    fadeOutToBlack(args){
        let self = args.self;
        let dispatchEntry = self.dispatchTable["fadeOutToBlack"];
        args.firstanimation = dispatchEntry.firstanimation;
        args.fadePanel = self.blackpanel;
        self.fadeOut(args);
    }
    fadeInFromGray(args){
        let self = args.self;
        let dispatchEntry = self.dispatchTable["fadeInFromGray"];
        args.firstanimation = dispatchEntry.firstanimation;
        args.fadePanel = self.graypanel;
        self.fadeIn(args);
    }
    fadeOutToGray(args){
        let self = args.self;
        let dispatchEntry = self.dispatchTable["fadeOutToGray"];
        args.firstanimation = dispatchEntry.firstanimation;
        args.fadePanel = self.graypanel;
        self.fadeOut(args);
    }
    fadeInFromWhite(args){
        let self = args.self;
        let dispatchEntry = self.dispatchTable["fadeInFromWhite"];
        args.firstanimation = dispatchEntry.firstanimation;
        args.fadePanel = self.whitepanel;
        self.fadeIn(args);
    }
    fadeOutToWhite(args){
        let self = args.self;
        let dispatchEntry = self.dispatchTable["fadeOutToWhite"];
        args.firstanimation = dispatchEntry.firstanimation;
        args.fadePanel = self.whitepanel;
        self.fadeOut(args);
    }
    flipInX(args){
        let self = args.self;
        let dispatchEntry = self.dispatchTable["flipInX"];
        self.flippanel.replaceChildren([]);
        self.flippanel.style.display = "none";
        self.removeFromStack(args.selectedPanel,self);
        self.flippanel.appendChild(args.selectedPanel);
        args.selectedPanel.classList.add("sic-transit-flipped-x");
        let tosItem = self.panelStack.pop();
        self.flippanel.appendChild(tosItem);
        self.flippanel.style.display = "block";
        self.moveToTos(self.flipbackgroundpanel,self);
        self.moveToTos(self.flippanel,self);
        let animation = self.flippanel.animate(dispatchEntry.firstanimation,{easing: dispatchEntry.easing, duration: dispatchEntry.duration});
        animation.onfinish = function(){
            args.selectedPanel.classList.remove("sic-transit-flipped-x");
            self.container.append(args.selectedPanel);
            self.container.append(tosItem);
            self.panelStack.push(tosItem);
            self.panelStack.push(args.selectedPanel);
            self.moveToBos(self.flipbackgroundpanel);
            self.moveToBos(self.flippanel, self);

        }
    }
    flipInY(args){
        let self = args.self;
        let dispatchEntry = self.dispatchTable["flipInY"];
        self.flippanel.replaceChildren([]);
        self.flippanel.style.display = "none";
        self.removeFromStack(args.selectedPanel,self);
        self.flippanel.appendChild(args.selectedPanel);
        args.selectedPanel.classList.add("sic-transit-flipped-y");
        let tosItem = self.panelStack.pop();
        self.flippanel.appendChild(tosItem);
        self.flippanel.style.display = "block";
        self.moveToTos(self.flipbackgroundpanel,self);
        self.moveToTos(self.flippanel,self);
        let animation = self.flippanel.animate(dispatchEntry.firstanimation,{easing: dispatchEntry.easing, duration: dispatchEntry.duration});
        animation.onfinish = function(){
            args.selectedPanel.classList.remove("sic-transit-flipped-y");
            self.container.append(args.selectedPanel);
            self.container.append(tosItem);
            self.panelStack.push(tosItem);
            self.panelStack.push(args.selectedPanel);
            self.moveToBos(self.flipbackgroundpanel);
            self.moveToBos(self.flippanel, self);

        }
    }
    flipOutX(args){
        let self = args.self;
        let dispatchEntry = self.dispatchTable["flipOutX"];
        self.flippanel.replaceChildren([]);
        self.flippanel.style.display = "none";
        self.flippanel.style.transform = "rotateX(180deg)";
        self.moveToTos(args.selectedPanel,self);
        self.panelStack.pop();
        let tosItem = self.panelStack.pop();
        self.moveToTos(self.flipbackgroundpanel,self);
        self.flippanel.appendChild(tosItem);
        self.flippanel.appendChild(args.selectedPanel);
        self.flippanel.style.display = "block";
        args.selectedPanel.classList.add("sic-transit-flipped-x");
        self.moveToTos(self.flippanel,self);
        let animation = self.flippanel.animate(dispatchEntry.firstanimation,{easing: dispatchEntry.easing, duration: dispatchEntry.duration});
        animation.onfinish = function(){
            args.selectedPanel.classList.remove("sic-transit-flipped-x");
            self.container.append(tosItem);
            self.container.append(args.selectedPanel);
            self.panelStack.push(args.selectedPanel);
            self.panelStack.push(tosItem);
            self.moveToBos(self.flipbackgroundpanel);
            self.moveToBos(self.flippanel, self);

        }
    }
   
    flipOutY(args){
        let self = args.self;
        let dispatchEntry = self.dispatchTable["flipOutY"];
        self.flippanel.replaceChildren([]);
        self.flippanel.style.display = "none";
        self.flippanel.style.transform = "rotateY(180deg)";
        self.moveToTos(args.selectedPanel,self);
        self.panelStack.pop();
        let tosItem = self.panelStack.pop();
        self.moveToTos(self.flipbackgroundpanel,self);
        self.flippanel.appendChild(tosItem);
        self.flippanel.appendChild(args.selectedPanel);
        self.flippanel.style.display = "block";
        args.selectedPanel.classList.add("sic-transit-flipped-y");
        self.moveToTos(self.flippanel,self);
        let animation = self.flippanel.animate(dispatchEntry.firstanimation,{easing: dispatchEntry.easing, duration: dispatchEntry.duration});
        animation.onfinish = function(){
            args.selectedPanel.classList.remove("sic-transit-flipped-y");
            self.container.append(tosItem);
            self.container.append(args.selectedPanel);
            self.panelStack.push(args.selectedPanel);
            self.panelStack.push(tosItem);
            self.moveToBos(self.flipbackgroundpanel);
            self.moveToBos(self.flippanel, self);

        }
    }
 
    hinge(args){
        let self = args.self;
        self.container.style.perspective =  "1000px";
        self.container.style.perspectiveOrigin = "left";
        args.finishHandler = function(){
            args.selectedPanel.style.display= args.finalDisplayStyle;
            args.selectedPanel.style.transformOrigin = "";
            self.container.style.perspective =  "";
            self.container.style.perspectiveOrigin = "";
            self.performCallback(args);
        }
        self.performAnimation(args);
    }
    hingeInBottom(args){
        let self = args.self;
        let dispatchEntry = self.dispatchTable["hingeInBottom"];
        args.firstanimation = dispatchEntry.firstanimation;
        args.selectedPanel.style.transformOrigin = "bottom";
        args.finalDisplayStyle = "block";
        self.hinge(args);
    }
    hingeOutBottom(args){
        let self = args.self;
        let dispatchEntry = self.dispatchTable["hingeOutBottom"];
        args.firstanimation = dispatchEntry.firstanimation;
        args.selectedPanel.style.transformOrigin = "bottom";
        args.finalDisplayStyle = "none";
        self.hinge(args);
    }
    hingeInLeft(args){
        let self = args.self;
        let dispatchEntry = self.dispatchTable["hingeInLeft"];
        args.firstanimation = dispatchEntry.firstanimation;
        args.selectedPanel.style.transformOrigin = "left";
        args.finalDisplayStyle = "block";
        self.hinge(args);
    }
    hingeOutLeft(args){
        let self = args.self;
        let dispatchEntry = self.dispatchTable["hingeOutLeft"];
        args.firstanimation = dispatchEntry.firstanimation;
        args.selectedPanel.style.transformOrigin = "left";
        args.finalDisplayStyle = "none";
        self.hinge(args);
    }
    hingeInRight(args){
        let self = args.self;
        let dispatchEntry = self.dispatchTable["hingeInRight"];
        args.firstanimation = dispatchEntry.firstanimation;
        args.selectedPanel.style.transformOrigin = "right";
        args.finalDisplayStyle = "block";
        self.hinge(args);
    }
    hingeOutRight(args){
        let self = args.self;
        let dispatchEntry = self.dispatchTable["hingeOutRight"];
        args.firstanimation = dispatchEntry.firstanimation;
        args.selectedPanel.style.transformOrigin = "right";
        args.finalDisplayStyle = "none";
        self.hinge(args);
    }
    hingeInTop(args){
        let self = args.self;
        let dispatchEntry = self.dispatchTable["hingeInTop"];
        args.firstanimation = dispatchEntry.firstanimation;
        args.selectedPanel.style.transformOrigin = "top";
        args.finalDisplayStyle = "block";
        self.hinge(args);
    }
    hingeOutTop(args){
        let self = args.self;
        let dispatchEntry = self.dispatchTable["hingeOutBottom"];
        args.firstanimation = dispatchEntry.firstanimation;
        args.selectedPanel.style.transformOrigin = "top";
        args.finalDisplayStyle = "none";
        self.hinge(args);
    }
    getElementDiagonal(element){
        let computedStyle = getComputedStyle(element);
        let width =  parseInt(computedStyle.width);
        let height = parseInt(computedStyle.height);
        let diagonal = Math.ceil(Math.sqrt((width * width) + (height * height)));
        return diagonal;
    }

    irisIn(args){
        let self = args.self;
        let dispatchEntry = self.dispatchTable["irisIn"];
        let panel = args.selectedPanel;
        panel.style.display = "none";
        self.moveToTos(panel,self);
        args.firstanimation = dispatchEntry.firstanimation;
        args.finishHandler = function(){
            panel.style.display = "block";
            args.selectedPanel.style.clipPath = "";
            self.performCallback(args);
        }
        self.performAnimation(args);
    }
    irisOut(args){
        let self = args.self;
        let dispatchEntry = self.dispatchTable["irisOut"];
        let panel = args.selectedPanel;
        panel.style.clipPath = "circle(100% at center)"
        self.moveToTos(panel,self);
        args.firstanimation = dispatchEntry.firstanimation;
        args.finishHandler = function(){
            self.moveToBos(panel, self);
            panel.style.clipPath = "";
            self.performCallback(args);
        }
        self.performAnimation(args);
    }
    irisInFromBlack(args){
        let self = args.self;
        self.moveToTos(self.blackpanel);
        self.irisIn(args);
    }
    irisOutToBlack(args){
        let self = args.self;
        self.blackpanel.style.display = "none";
        self.moveToTos(self.blackpanel, self);
        self.stackSwap();
        self.normalizeStack();
        self.blackpanel.style.display = "block";
        self.irisOut(args);
    }
    irisInFromGray(args){
        let self = args.self;
        self.moveToTos(self.graypanel);
        self.irisIn(args);
    }
    irisOutToGray(args){
        let self = args.self;
        self.graypanel.style.display = "none";
        self.moveToTos(self.graypanel, self);
        self.stackSwap();
        self.normalizeStack();
        self.graypanel.style.display = "block";
        self.irisOut(args);
    }
    irisInFromWhite(args){
        let self = args.self;
        self.moveToTos(self.whitepanel);
        self.irisIn(args);
    }
    irisOutToWhite(args){
        let self = args.self;
        self.whitepanel.style.display = "none";
        self.moveToTos(self.whitepanel, self);
        self.stackSwap();
        self.normalizeStack();
        self.whitepanel.style.display = "block";
        self.irisOut(args);
    }
    menuInBottom(args){
        let self = args.self;
        let dispatchEntry = self.dispatchTable["menuInBottom"];
        let menuPercentage =  100 - dispatchEntry.menuPercentage;
        args.selectedPanel.transform = "translateY(100%)";
        args.firstanimation = JSON.parse(JSON.stringify(dispatchEntry.firstanimation).replace("%%%",menuPercentage));
        args.finishHandler = function(){
            self.moveToTos(args.selectedPanel,self);
            args.selectedPanel.style.display = "block";
            args.selectedPanel.style.transform = "translateY(" + menuPercentage + "%)";
            self.performCallback(args);
        }
        self.performAnimation(args);
    }
    menuOutBottom(args){
        let self = args.self;
        let dispatchEntry = self.dispatchTable["menuOutBottom"];
        let menuPercentage = 100 - dispatchEntry.menuPercentage;
        args.firstanimation = JSON.parse(JSON.stringify(dispatchEntry.firstanimation).replace("%%%",menuPercentage));
        args.finishHandler = function(){
            self.moveToBos(args.selectedPanel,self);
            args.selectedPanel.style.transform = "";
            self.performCallback(args);
        }
        self.performAnimation(args);
    }
    menuInLeft(args){
        let self = args.self;
        let dispatchEntry = self.dispatchTable["menuInLeft"];
        let menuPercentage = 100 - dispatchEntry.menuPercentage;
        args.firstanimation = JSON.parse(JSON.stringify(dispatchEntry.firstanimation).replace("%%%", menuPercentage));
        args.selectedPanel.style.transform = "translateX(-100%)";
        self.moveToTos(args.selectedPanel,self);
        args.finishHandler = function(){
            args.selectedPanel.style.display= "block";
            args.selectedPanel.style.transform = "translateX(-" +  menuPercentage + "%)";
            self.performCallback(args);
        }
        self.performAnimation(args);
    }
    menuOutLeft(args){
        let self = args.self;
        let dispatchEntry = self.dispatchTable["menuOutLeft"];
        let menuPercentage = 100 - dispatchEntry.menuPercentage;
        args.firstanimation = JSON.parse(JSON.stringify(dispatchEntry.firstanimation).replace("%%%",menuPercentage));
        args.finishHandler = function(){
            self.moveToBos(args.selectedPanel,self);
            args.selectedPanel.style.transform = "";
            self.performCallback(args);
        }
        self.performAnimation(args);
    }
    menuInRight(args){
        let self = args.self;
        let dispatchEntry = self.dispatchTable["menuInRight"];
        let menuPercentage = 100 - dispatchEntry.menuPercentage;
        args.firstanimation = JSON.parse(JSON.stringify(dispatchEntry.firstanimation).replace("%%%",menuPercentage));
        args.selectedPanel.transform = "translateX(100%)";
        args.finishHandler = function(){
            args.selectedPanel.style.display= "block";
            args.selectedPanel.style.transform = "translateX(" + menuPercentage + "%)";
            self.performCallback(args);
        }
        self.performAnimation(args);
    }
    menuOutRight(args){
        let self = args.self;
        let dispatchEntry = self.dispatchTable["menuOutRight"];
        let menuPercentage = 100 - dispatchEntry.menuPercentage;
        args.firstanimation = JSON.parse(JSON.stringify(dispatchEntry.firstanimation).replace("%%%", menuPercentage));
        args.finishHandler = function(){
            self.moveToBos(args.selectedPanel,self);
            args.selectedPanel.style.transform = "";
            self.performCallback(args);
        }
        self.performAnimation(args);
    }
    menuInTop(args){
        let self = args.self;
        let dispatchEntry = self.dispatchTable["menuInTop"];
        let menuPercentage = 100 - dispatchEntry.menuPercentage;
        args.firstanimation = JSON.parse(JSON.stringify(dispatchEntry.firstanimation).replace("%%%",menuPercentage));
        args.selectedPanel.transform = "translateY(-100%)";
        args.finishHandler = function(){
            args.selectedPanel.style.transform = "translateY(-" + menuPercentage + "%)"
            args.selectedPanel.style.display= "block";
            self.performCallback(args);
        }
        self.performAnimation(args);
    }
    menuOutTop(args){
        let self = args.self;
        let dispatchEntry = self.dispatchTable["menuOutTop"];
        let menuPercentage = 100 - dispatchEntry.menuPercentage;
        args.firstanimation = JSON.parse(JSON.stringify(dispatchEntry.firstanimation).replace("%%%",menuPercentage));
        args.finishHandler = function(){
            self.moveToBos(args.selectedPanel,self);
            args.selectedPanel.style.transform = "";
            self.performCallback(args);
        }
        self.performAnimation(args);
    }
    newspaperIn(args){
        let self = args.self;
        let dispatchEntry = self.dispatchTable["newspaperIn"];
        args.firstanimation = dispatchEntry.firstanimation;
        args.finishHandler = function(){
            args.selectedPanel.style.display = "block";
            args.selectedPanel.style.transform = "rotate(0deg) scale(1)";
            self.performCallback(args);
        }
        self.performAnimation(args);
    }
    newspaperOut(args){
        let self = args.self;
        let dispatchEntry = self.dispatchTable["newspaperOut"];
        args.firstanimation = dispatchEntry.firstanimation;
        args.finishHandler = function(){
            self.moveToBos(args.selectedPanel,self);
            args.selectedPanel.style.display = "none";
            args.selectedPanel.style.transform = "rotate(0deg) scale(1)";
            self.performCallback(args);
        }
        self.performAnimation(args);
    }
    slideInBottom(args){
        let self = args.self;
        let dispatchEntry = self.dispatchTable["slideInBottom"];
        args.firstanimation = dispatchEntry["firstanimation"];
        args.selectedPanel.transform = "translateY(100%)";
        args.finishHandler = function(){
            args.selectedPanel.style.display= "block";
            self.performCallback(args);
        }
        self.performAnimation(args);
    }
    slideOutBottom(args){
        let self = args.self;
        let dispatchEntry = self.dispatchTable["slideOutBottom"];
        args.firstanimation = dispatchEntry["firstanimation"];
        args.finishHandler = function(){
            self.moveToBos(args.selectedPanel,self);
            args.selectedPanel.style.transform = "translateY(0%)";
            self.performCallback(args);
        }
        self.performAnimation(args);
    }
    slideInLeft(args){
        let self = args.self;
        let dispatchEntry = self.dispatchTable["slideInLeft"];
        args.firstanimation = dispatchEntry["firstanimation"];
        args.selectedPanel.transform = "translateX(-100%)";
        self.moveToTos(args.selectedPanel,self);
        args.selectedPanel.style.display = "block";
        args.finishHandler = function(){
            args.selectedPanel.style.display= "block";
            args.selectedPanel.transform = "translateX(0)";
            self.performCallback(args);
        }
        self.performAnimation(args);
    }
    slideOutLeft(args){
        let self = args.self;
        let dispatchEntry = self.dispatchTable["slideOutLeft"];
        args.firstanimation = dispatchEntry["firstanimation"];
        args.finishHandler = function(){
            self.moveToBos(args.selectedPanel,self);
            args.selectedPanel.style.transform = "translateX(0%)";
            self.performCallback(args);
        }
        self.performAnimation(args);
    }
    slideInRight(args){
        let self = args.self;
        let dispatchEntry = self.dispatchTable["slideInRight"];
        args.firstanimation = dispatchEntry["firstanimation"];
        args.selectedPanel.transform = "translateX(100%)";
        args.finishHandler = function(){
            args.selectedPanel.style.display= "block";
            self.performCallback(args);
        }
        self.performAnimation(args);
    }
    slideOutRight(args){
        let self = args.self;
        let dispatchEntry = self.dispatchTable["slideOutRight"];
        args.firstanimation = dispatchEntry["firstanimation"];
        args.finishHandler = function(){
            self.moveToBos(args.selectedPanel,self);
            args.selectedPanel.style.transform = "translateX(0%)";
            self.performCallback(args);
        }
        self.performAnimation(args);
    }
    slideInTop(args){
        let self = args.self;
        let dispatchEntry = self.dispatchTable["slideInTop"];
        args.firstanimation = dispatchEntry["firstanimation"];
        args.selectedPanel.transform = "translateY(100%)";
        args.finishHandler = function(){
            args.selectedPanel.style.display= "block";
            self.performCallback(args);
        }
        self.performAnimation(args);
    }
    slideOutTop(args){
        let self = args.self;
        let dispatchEntry = self.dispatchTable["slideOutTop"];
        args.firstanimation = dispatchEntry["firstanimation"];
        args.finishHandler = function(){
            self.moveToBos(args.selectedPanel,self);
            args.selectedPanel.style.transform = "translateY(0%)";
            self.performCallback(args);
        }
        self.performAnimation(args);
    }
    swap(args){
        let self = args.self;
        self.stackSwap(self);
        self.performCallback(args);
    }
    zoomIn(args){
        let self = args.self;
        let dispatchEntry = self.dispatchTable["zoomIn"];
        args.firstanimation = dispatchEntry["firstanimation"];
        args.finishHandler = function(){
            args.selectedPanel.style.display = "block";
            args.selectedPanel.style.transform = "scale(1)";
            self.performCallback(args);
        }
        self.performAnimation(args);
    }
    zoomOut(args){
        let self = args.self;
        let dispatchEntry = self.dispatchTable["zoomOut"];
        args.firstanimation = dispatchEntry["firstanimation"];
        args.finishHandler = function(){
            self.moveToBos(args.selectedPanel,self);
            args.selectedPanel.style.display = "none";
            args.selectedPanel.style.transform = "scale(1)";
            self.performCallback(args);
        }
        self.performAnimation(args);
    }
  }
