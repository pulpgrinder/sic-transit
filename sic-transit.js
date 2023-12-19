/*  sic-transit.js 
 *  Copyright 2023 by Anthony W. Hursh
 *  MIT license.
 */

"use strict";

class SicTransit {
/* Constructor takes two arguments, the id for the panel container,
 * and the CSS class for the panels. 
 */
    static allInstances = [];
    constructor(containerId, panelClass) {
    // Set up the user-suppplied container.
      this.containerId = containerId;
      this.container = document.querySelector(containerId);
      this.container.classList.add("sic-transit-container");
 /* If the user-supplied panel class is (e.g.) .foobar, some things want it as the raw class name 'foobar', while others want it in the CSS/querySelector format '.foobar'. Irritating. We'll store it both ways. */
      this.panelClass = panelClass.substring(1);
      this.panelQuery = panelClass;

      // Used for timing and statistical purposes.
      this.date = new Date();

      // Load up the internal panel stack with any panels the user has already supplied -- i.e., elements with the given panel class that are inside the given container.
      this.loadPanelStack();

      // Create our special internal overlay panels. These are things like solid black, solid white ,etc. Used to support various transitions.
      this.createOverlayPanels(); 
      SicTransit.allInstances.push(this);
    } // End of constructor.


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

/* Returns an array of all panels in the panel container which have the specified panel class and  an id value. Does *not* return the internal special panels such as the black, white, and gray panels used in certain transitions. */
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

    /* Returns an array of all transitions currently defined. */
    getTransitionList(self=this){
        let transitions = [];
        for (let key in self.dispatchTable) {
            if (self.dispatchTable.hasOwnProperty(key)) {
              transitions.push(key);
            }
         }
         return transitions;
    }

    // Returns the z-index of the panel corresponding to panelSelector.
    getZIndex(panelSelector,self=this){
        let selectedPanel = this.selectPanel(panelSelector,self);
        return window.getComputedStyle(selectedPanel).getPropertyValue('z-index');
    }

    // Moves the selected panel to the bottom of the stack.
    moveToBos(panelSelector,self=this){
        let selectedPanel = this.selectPanel(panelSelector);
        self.removeFromStack(selectedPanel,self);
        self.panelStack.unshift(selectedPanel);
        self.normalizeStack(self);
    }

    // Moves the selected panel to the top of the stack.
    moveToTos(panelSelector,self=this){
        let selectedPanel = this.selectPanel(panelSelector);
        self.removeFromStack(selectedPanel,self);
        self.panelStack.push(selectedPanel);
        self.normalizeStack(self);
    }

    /* This updates the zIndex of the panels in the panel stack, so that the top of stack panel has a zIndex of 0, the next one down has a zIndex of -1, etc. This should be called any time the panel stack changes. Most public methods methods already call this as needed.
*/
    normalizeStack(self=this){
        let panelStack = self.panelStack;
        for(let index = 0; index < panelStack.length; index++){
            let panel = panelStack[index];
            panel.style.zIndex = (index - panelStack.length) + 1;
        }
    }

/* Performs the specified transition. The following keys in args are recognized:
    panelSelector: the selector for the panel to be transitioned. See selectPanel() for details.
    transitionName: the name of the transition to be performed. See getTransitionList() for a list of currently defined transitions.
    stackRotationNumber: the number of times to rotate the stack.  Only used by the rotateStack transition. Positive numbers move panels from the top of the stack to the bottom. Negative numbers move panels from the bottom of the stack to the top. Zero is a no-op. Default is 1.
*/
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

/*  Removes the selected panel from the panel stack for the current
    instance, if it's there, but not the DOM. Returns the panel if
    it was found, otherwise returns null. 
*/
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

/* Removes the selected panel from the panel stacks for all
   instances. Does not remove from DOM. 
*/
    removeFromAllStacks(panelSelector){
        for(let i = 0; i < SicTransit.allInstances.length; i++){
            SicTransit.allInstances[i].removeFromStack(panelSelector,SicTransit.allInstances[i]);
        }
    }

/* Remove selected panel from the panel stack for all instances and the
    DOM as well. Returns the removed panel.
*/
    removePanel(panelSelector,self=this){
        let panel = self.selectPanel(panelSelector);
        if(panel !== null){
            self.removeFromAllStacks(panel);
            panel.remove();
        }
        return panel;
    }

/*  rotateStack() with a positive argument transfers panels from the 
top of the stack to the bottom of the stack the specified number of 
times. A negative argument transfers elements from the bottom of the
stack to the top. Does nothing if the argument is zero, other than making sure the top of stack panel is visible (below). */
    rotateStack(args){
        let self = args.self;
        let stackRotationNumber;
        if(Number.isInteger(args.stackRotationNumber)){  
            stackRotationNumber = args.stackRotationNumber; 
        }
        else{
            stackRotationNumber = 1;
        }

        // stackRotationNumber === 0 is a no-op.
        if(stackRotationNumber > 0){
             for(let i = 0; i < stackRotationNumber; i++){
                self.panelStack.unshift(self.panelStack.pop());
             }
         }
         else if(stackRotationNumber < 0){
             for(let i = 0; i > stackRotationNumber; i--){
                 self.panelStack.push(self.panelStack.shift())
             }
         }
         self.normalizeStack(self);
         self.performCallback(args);
     }

/* Returns the panel corresponding to the given panelSelector, if it exists. If panelSelector is blank (i.e. "" or undefined), the panel at the current
    top of the stack is returned. If panelSelector is already a DOM element, it is returned as-is. If panelSelector is a string, it is treated as a query selector, and the first matching DOM element is returned (if one exists). If panelSelector is a positive integer, the element at that index in the panel stack is returned (if it exists). If panelSelector is a negative integer, the element at that index from the top of the stack is returned (if it exists). If panelSelector is 0, the element at the bottom of the stack is returned (same as getBos()). If panelSelector is -0, the element at the top of the stack is returned (same as getTos()). */
    selectPanel(panelSelector,self=this){
        // No selector, return top of stack.
        if((panelSelector === undefined) || (panelSelector === "")){
            return self.getTos(self);
        }
        else if(panelSelector instanceof HTMLElement){ // It's already a DOM element, just return it.
            return panelSelector;
        }
        else if(Number.isInteger(panelSelector)){
             // We're selecting the item by stack position
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
            }
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

// Puts selected panel in the panel container (if it isn't already there), moves it to the top of the panel stack, and displays it.
    showPanel(selector,self=this){
        let selectedPanel = self.selectPanel(selector);
        if(selectedPanel === null){
            return;
        }
        // Remove from the panel stack for all instances, if it's there,
        // and remove from DOM.
        self.removePanel(selectedPanel,this); 
        // Add the necessary classes to make it behave as a Sic Transit
        // panel.
        selectedPanel.classList.add(self.panelClass,"sic-transit-panel");
        // Reset display parameters (in case they were previously altered).
        selectedPanel.style.display = "block";
        selectedPanel.style.opacity = 1.0;
        selectedPanel.style.removeProperty("transform");
        selectedPanel.style.removeProperty("transformOrigin");
        // Put it on top of stack.
        self.panelStack.push(selectedPanel);
        // Put it back in DOM, but now inside the container (in case it wasn't there before)
        self.container.appendChild(selectedPanel);
        self.normalizeStack(self);
    }

    // Dump the internal state of the panel stack to the JavaScript console.
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

    /* Transfer a panel from one instance of Sic Transit to another. The panel is removed from the panel stack for the source instance, and added to the panel stack for the destination instance. The panel is also removed from the container for the source instance, and added to the container for the destination instance. Call the method on the source instance,
        with a panel selector and the destination instance as parameters.*/
    transferPanel(selector,destinationSic,self=this){
            let selectedPanel = self.selectPanel(selector,self);
            if(selectedPanel === null){
                console.log("SicTransit transferPanel(): panelSelector " + panelSelector + " is invalid.");
                return;
            }
            self.removeFromAllStacks(selector,self);
            destinationSic.showPanel(selector,destinationSic);
    }

    
/* Internal methods below. Not well-documented and not intended to be called directly by user code. These may change at any time. Use at your own risk. :-) */

/* Lookup table for transition parameters. Shouldn't have to do anything with this unless you're defining a new transition or fixing a bug.  */
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
        "crossDissolveIn": {
            forwardTransition: this.crossDissolveIn,
            firstanimation: [{ display:"block", opacity: 0}, {display:"block",opacity:1}],
            secondanimation: [{display:"block", opacity:1}, {display:"block", opacity:0}],
            boxShadow: "10px 10px 20px rgba(0,0,0,0.5)",
            easing: 'ease-in-out',
            duration:2000,
            callback:null
        },
        "crossDissolveOut": {
            forwardTransition: this.crossDissolveOut,
            firstanimation: [{ display:"block", opacity:1}, {display:"block",opacity:0}],
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
        "hingeInFromBottom":{
            forwardTransition: this.hingeInFromBottom,
            firstanimation: [{display:"block", transform: "rotateX(-180deg)"}, {display:"block", transform: "rotateX(0deg)"}],
            boxShadow: "-10px -10px 20px rgba(0,0,0,0.5)",
            easing:'ease-in-out',
            duration:1000,
            callback:null
        },
        "hingeOutToBottom":{
            forwardTransition: this.hingeOutToBottom,
            firstanimation: [{display:"block", transform: "rotateX(0deg)"}, {display:"block", transform: "rotateX(-180deg)"}],
            boxShadow: "-10px -10px 20px rgba(0,0,0,0.5)",
            easing:'ease-in-out',
            duration:1000,
            callback:null
        },
        "hingeInFromLeft":{
            forwardTransition: this.hingeInFromLeft,
            firstanimation: [{display:"block", transform: "rotateY(-180deg)"}, {display:"block", transform: "rotateY(0deg)"}],
            boxShadow: "10px 10px 20px rgba(0,0,0,0.5)",
            easing:'ease-in-out',
            duration:1000,
            callback:null
        },
        "hingeOutToLeft":{
            forwardTransition: this.hingeOutToLeft,
            firstanimation: [{display:"block", transform: "rotateY(0deg)"}, {display:"block", transform: "rotateY(-180deg)"}],
            boxShadow: "10px 10px 20px rgba(0,0,0,0.5)",
            easing:'ease-in-out',
            duration:1000,
            callback:null
        },
        "hingeInFromRight":{
            forwardTransition: this.hingeInFromRight,
            firstanimation: [{display:"block", transform: "rotateY(180deg)"}, {display:"block", transform: "rotateY(0deg)"}],
            boxShadow: "-10px -10px 20px rgba(0,0,0,0.5)",
            easing:'ease-in-out',
            duration:1000,
            callback:null
        },
        "hingeOutToRight":{
            forwardTransition: this.hingeOutToRight,
            firstanimation: [{display:"block", transform: "rotateY(0deg)"}, {display:"block", transform: "rotateY(180deg)"}],
            boxShadow: "-10px -10px 20px rgba(0,0,0,0.5)",
            easing:'ease-in-out',
            duration:1000,
            callback:null
        },
        "hingeInFromTop":{
            forwardTransition: this.hingeInFromTop,
            firstanimation: [{display:"block", transform: "rotateX(180deg)"}, {display:"block", transform: "rotateX(0deg)"}],
            boxShadow: "10px 10px 20px rgba(0,0,0,0.5)",
            easing:'ease-in-out',
            duration:1000,
            callback:null
        },
        "hingeOutToTop":{
            forwardTransition: this.hingeOutToTop,
            firstanimation: [{display:"block", transform: "rotateX(0deg)"}, {display:"block", transform: "rotateX(180deg)"}],
            boxShadow: "10px 10px 20px rgba(0,0,0,0.5)",
            easing:'ease-in-out',
            duration:1000,
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
        "menuInFromBottom": {
            forwardTransition: this.menuInFromBottom,
            firstanimation: [{display:"block", transform: "translateY(100%)"}, {display:"block",transform: "translateY(%%%%)"}],
            boxShadow: "-10px -10px 30px rgba(0,0,0,0.5)",
            easing:'ease-in-out',
            duration:500,
            menuPercentage:25,
            callback:null
        },
        "menuOutToBottom": {
            forwardTransition: this.menuOutToBottom,
            firstanimation: [{transform: "translateY(%%%%)"}, {transform: "translateY(100%)"}],
            boxShadow: "-10px -10px 20px rgba(0,0,0,0.5)",
            easing:'ease-in-out',
            duration:500,
            menuPercentage:25,
            callback:null
        },
        "menuInFromLeft": {
            forwardTransition: this.menuInFromLeft,
            firstanimation: [{display:"block", transform: "translateX(-100%)"}, {display:"block",transform: "translateX(-%%%%)"}],
            boxShadow:  "10px 20px 20px 30px rgba(0,0,0,0.5)",
            easing:'ease-in-out',
            duration:500,
            menuPercentage:25,
            callback:null
        },
        "menuOutToLeft": {
            forwardTransition: this.menuOutToLeft,
            firstanimation: [{display:"block", transform: "translateX(-%%%%)"}, {display:"block",transform: "translateX(-100%)"}],
            boxShadow: "10px 20px 20px 30px rgba(0,0,0,0.5)",
            easing:'ease-in-out',
            duration:500,
            menuPercentage:25,
            callback:null
        },
        "menuInFromRight": {
            forwardTransition: this.menuInFromRight,
            firstanimation: [{ display:"block", transform: "translateX(100%)"}, {display:"block",transform: "translateX(%%%%)"}],
            boxShadow: "-10px -10px 20px 30px rgba(0,0,0,0.5)",
           easing:'ease-in-out',
           duration:500,
           menuPercentage:25,
           callback:null
        },
        "menuOutToRight": {
            forwardTransition: this.menuOutToRight,
            firstanimation: [{transform: "translateX(%%%%)"}, {transform: "translateX(100%)"}],
            boxShadow: "-10px -10px 20px 30px rgba(0,0,0,0.5)",
            easing: 'ease-in-out',
            duration:500,
            menuPercentage:25,
            callback:null
        },
        "menuInFromTop": {
            forwardTransition: this.menuInFromTop,
            firstanimation: [{display:"block", transform: "translateY(-100%)"}, {display:"block",transform: "translateY(-%%%%)"}],
            boxShadow: "10px 10px 20px rgba(0,0,0,0.5)",
            easing:'ease-in-out',
            duration:500,
            menuPercentage:25,
            callback:null
        },
        "menuOutToTop": {
            forwardTransition: this.menuOutToTop,
            firstanimation:[{transform: "translateY(-%%%%)"}, {transform: "translateY(-100%)"}],
            boxShadow: "10px 10px 20px rgba(0,0,0,0.5)",
            easing: 'ease-in-out', 
            duration:500,
            menuPercentage:25,
            callback:null
        },
        "newspaperIn": {
            forwardTransition: this.newspaperIn,
            firstanimation: [{display:"block", transform: "rotate(0deg) scale(0)"}, {display:"block", transform: "rotate(720deg) scale(1)"}],
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
        "swap": {
            forwardTransition: this.swap,
            firstanimation:[],
            callback:null
        },
        "wipeInFromBottom": {
            forwardTransition: this.wipeInFromBottom,
            firstanimation: [{display:"block", transform: "translateY(100%)"}, {display:"block",transform: "translateY(0%)"}],
            boxShadow: "-10px -10px 30px rgba(0,0,0,0.5)",
           easing:'ease-in-out',
           duration:500,
           callback:null
        },
        "wipeOutToBottom": {
            forwardTransition: this.wipeOutToBottom,
            firstanimation: [{transform: "translateY(0%)"}, {transform: "translateY(100%)"}],
            boxShadow: "-10px -10px 20px rgba(0,0,0,0.5)",
            easing:'ease-in-out',
            duration:500,
            callback:null
        },
        "wipeInFromLeft": {
            forwardTransition: this.wipeInFromLeft,
            firstanimation: [{display:"block", transform: "translateX(-100%)"}, {display:"block",transform: "translateX(0%)"}],
            boxShadow:  "10px 20px 20px 30px rgba(0,0,0,0.5)",
            easing:'ease-in-out',
            duration:500,
            callback:null
        },
        "wipeOutToLeft": {
            forwardTransition: this.wipeOutToLeft,
            firstanimation: [{display:"block", transform: "translateX(0%)"}, {display:"block",transform: "translateX(-120%)"}],
            boxShadow: "10px 20px 20px 30px rgba(0,0,0,0.5)",
            easing:'ease-in-out',
            duration:500,
            callback:null
        },
        "wipeInFromRight": {
            forwardTransition: this.wipeInFromRight,
            firstanimation: [{ display:"block", transform: "translateX(100%)"}, {display:"block",transform: "translateX(0%)"}],
            boxShadow: "-10px -10px 20px 30px rgba(0,0,0,0.5)",
            easing:'ease-in-out',
            duration:500,
            callback:null
        },
        "wipeOutToRight": {
            forwardTransition: this.wipeOutToRight,
            firstanimation: [{transform: "translateX(0%)"}, {transform: "translateX(120%)"}],
            boxShadow: "-10px -10px 20px 30px rgba(0,0,0,0.5)",
            easing: 'ease-in-out',
            duration:500,
            callback:null
        },
        "wipeInFromTop": {
            forwardTransition: this.wipeInFromTop,
            firstanimation: [{display:"block", transform: "translateY(-100%)"}, {display:"block",transform: "translateY(0%)"}],
            boxShadow: "10px 10px 20px rgba(0,0,0,0.5)",
            easing:'ease-in-out',
            duration:500,
            callback:null
        },
        "wipeOutToTop": {
            forwardTransition: this.wipeOutToTop,
            firstanimation:[{transform: "translateY(0%)"}, {transform: "translateY(-100%)"}],
            boxShadow: "10px 10px 20px rgba(0,0,0,0.5)",
            easing: 'ease-in-out', 
            duration:500,
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
    // These panels are used internally in various transitions (e.g., fadeInFromBlack). Not intended to be accessed directly from user code.
    createOverlayPanels(){
        this.specialtyPanels = {};
        let overlaypanel;
        let overlayPanels = [
            "blackpanel",
            "graypanel",
            "whitepanel",
            "flippanel",
            "flipbackgroundpanel"
        ];
        overlayPanels.forEach(element => {
            overlaypanel = document.createElement('div');
            this.specialtyPanels[element] = overlaypanel;
            overlaypanel.classList.add(this.panelClass,'sic-transit-panel','sic-transit-' + element);
            this.container.appendChild(overlaypanel);
            this.panelStack.unshift(overlaypanel);
        });
        this.normalizeStack();
    }

/* Reset panel position, etc. to a known state. In some situations,
you may want to move the panel to the bottom of the stack before calling
this (so the reset isn't visible on screen).*/

resetPanel(panelSelector,self=this){
    let panel = self.selectPanel(panelSelector,self);
    panel.style.display = "block";
    panel.style.opacity = 1.0;
    panel.style.removeProperty("transform");
    panel.style.removeProperty("transformOrigin");
    panel.style.removeProperty("clip-path");
    panel.style.animationFillMode = "none";

}


/* Creates the initial panel stack, using elements which have the user-specified panel class and are contained within te user-specified container.
*/
    loadPanelStack(self=this){
        self.panelStack = [];
        const panel_list = document.querySelectorAll(self.containerId + " > " + self.panelQuery);
        self.panelStack = [...panel_list];
        for(let i = 0; i < self.panelStack.length; i++){
            self.panelStack[i].classList.add("sic-transit-panel");
        }
        self.normalizeStack(self);
    }

/* Actually performs the animation. This is called by most transition functions, though some transitions require custom manipulations. */
   async performAnimation(args){
        let self = args.self;
        let dispatchEntry = self.dispatchTable[args["transitionName"]];
        self.moveToTos(args.selectedPanel,self);
        const animation = args.selectedPanel.animate(args.firstanimation,{easing: dispatchEntry.easing, duration: dispatchEntry.duration,fill:"forwards"});
        await animation.finished;
        animation.commitStyles();
        animation.cancel();
        args.finishHandler(); 
    }

/* Performs the callback function for the given transition, ,if one is specified. */
    performCallback(args){
        const self = args.self;
        let dispatchEntry = self.dispatchTable[args["transitionName"]];
        if(dispatchEntry.callback === null){
            return;
        }
        args.endTime = new Date().getTime();
        dispatchEntry.callback(args);
    }

    // Exchanges the top two elements on the panel stack and updates display.
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
    
    // Transition handling code. Not intended to be called directly from user code.
// Use performTransition() instead.
    cutIn(args){
        let self = args.self;
        self.resetPanel(args.selectedPanel,self);
        self.showPanel(args.selectedPanel, self);
        self.performCallback(args);
    }
    cutOut(args){
        let self = args.self;
        self.moveToBos(args.selectedPanel,self);
        self.resetPanel(args.selectedPanel,self);
        self.performCallback(args);
    }
    async crossDissolveIn(args){
        let self = args.self;
        let dispatchEntry = self.dispatchTable[args["transitionName"]];
        self.moveToBos(args.selectedPanel,self);
        self.resetPanel(args.selectedPanel,self);
        let topPanel = self.panelStack.pop();
        // Add a gray panel as a background, so lower layers don't show through.
        self.panelStack.push(self.specialtyPanels.graypanel);
        self.panelStack.push(topPanel);
        self.resetPanel(topPanel,self);
        self.normalizeStack(self);
        self.moveToTos(args.selectedPanel,self);
        args.finishHandler = function(){
            self.resetPanel(topPanel,self);
            self.moveToBos(self.specialtyPanels.graypanel);
            self.normalizeStack(self);
            self.performCallback(args);
        }
        const animation = args.selectedPanel.animate(dispatchEntry.firstanimation,{easing: dispatchEntry.easing, duration: dispatchEntry.duration + 100,fill:"forwards"});
        const topanimation = topPanel.animate(dispatchEntry.secondanimation,{easing: dispatchEntry.easing, duration: dispatchEntry.duration,fill:"forwards"});
        await animation.finished;
        await topanimation.finished
        animation.commitStyles();
        animation.cancel();
        topanimation.commitStyles();
        topanimation.cancel();
        args.finishHandler(); 
        
    }
    async crossDissolveOut(args){
        let self = args.self;
        let dispatchEntry = self.dispatchTable[args["transitionName"]];
        self.moveToBos(args.selectedPanel,self);
        self.resetPanel(args.selectedPanel,self);
        let topPanel =  self.panelStack.pop();
        self.panelStack.push(self.specialtyPanels.graypanel);
        self.panelStack.push(args.selectedPanel);
        self.resetPanel(topPanel,self);
        self.moveToTos(topPanel,self);
        args.finishHandler = function(){
            self.moveToBos(self.specialtyPanels.graypanel,self);
            self.moveToBos(args.selectedPanel,self);
            self.performCallback(args);
        }
      
        const animation = args.selectedPanel.animate(dispatchEntry.firstanimation,{easing: dispatchEntry.easing, duration:dispatchEntry.duration,fill:"forwards"});
        const topanimation =  topPanel.animate(dispatchEntry.secondanimation,{easing: dispatchEntry.easing, duration: dispatchEntry.duration,fill:"forwards"});
        await animation.finished;
        await topanimation.finished;
        animation.commitStyles();
        animation.cancel();
        topanimation.commitStyles();
        topanimation.cancel();
        args.finishHandler(); 
    }
    fadeIn(args){
        let self = args.self;
        self.resetPanel(args.fadePanel,self);
        self.moveToTos(args.fadePanel,self);
        self.resetPanel(args.selectedPanel,self);
        args.selectedPanel.style.opacity = 0;
        self.moveToTos(args.selectedPanel,self);
        args.finishHandler = function(){
            self.moveToBos(args.fadePanel,self);
            self.performCallback(args);
        }
        self.performAnimation(args);
    }
    fadeOut(args){
        let self = args.self;
        self.resetPanel(args.selectedPanel,self);
        args.fadePanel.style.opacity = 0;
        self.moveToTos(args.fadePanel,self);
        self.moveToTos(args.selectedPanel,self);
        self.stackSwap(self);
        self.resetPanel(self.fadePanel,self);
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
        args.fadePanel = self.specialtyPanels.blackpanel;
        self.fadeIn(args);
    }
    fadeOutToBlack(args){
        let self = args.self;
        let dispatchEntry = self.dispatchTable["fadeOutToBlack"];
        args.firstanimation = dispatchEntry.firstanimation;
        args.fadePanel = self.specialtyPanels.blackpanel;
        self.fadeOut(args);
    }
    fadeInFromGray(args){
        let self = args.self;
        let dispatchEntry = self.dispatchTable["fadeInFromGray"];
        args.firstanimation = dispatchEntry.firstanimation;
        args.fadePanel = self.specialtyPanels.graypanel;
        self.fadeIn(args);
    }
    fadeOutToGray(args){
        let self = args.self;
        let dispatchEntry = self.dispatchTable["fadeOutToGray"];
        args.firstanimation = dispatchEntry.firstanimation;
        args.fadePanel = self.specialtyPanels.graypanel;
        self.fadeOut(args);
    }
    fadeInFromWhite(args){
        let self = args.self;
        let dispatchEntry = self.dispatchTable["fadeInFromWhite"];
        args.firstanimation = dispatchEntry.firstanimation;
        args.fadePanel = self.specialtyPanels.whitepanel;
        self.fadeIn(args);
    }
    fadeOutToWhite(args){
        let self = args.self;
        let dispatchEntry = self.dispatchTable["fadeOutToWhite"];
        args.firstanimation = dispatchEntry.firstanimation;
        args.fadePanel = self.specialtyPanels.whitepanel;
        self.fadeOut(args);
    }
    async flipInX(args){
        let self = args.self;
        let dispatchEntry = self.dispatchTable["flipInX"];
        self.resetPanel(self.specialtyPanels.flippanel,self);
        self.specialtyPanels.flippanel.replaceChildren([]);
        self.specialtyPanels.flippanel.style.display = "none";
        self.removeFromStack(args.selectedPanel,self);
        self.resetPanel(args.selectedPanel,self);
        args.selectedPanel.classList.add("sic-transit-flipped-x");
        self.specialtyPanels.flippanel.appendChild(args.selectedPanel);
        let tosItem = self.panelStack.pop();
        self.resetPanel(tosItem,self);
        self.specialtyPanels.flippanel.appendChild(tosItem);
        self.specialtyPanels.flippanel.style.display = "block";
        self.moveToTos(self.specialtyPanels.flipbackgroundpanel,self);
        self.moveToTos(self.specialtyPanels.flippanel,self);
        const animation = self.specialtyPanels.flippanel.animate(dispatchEntry.firstanimation,{easing: dispatchEntry.easing, duration: dispatchEntry.duration,fill:"forwards"});
        args.finishHandler = function(){
            args.selectedPanel.classList.remove("sic-transit-flipped-x");
            self.specialtyPanels.flippanel.replaceChildren([]);
            self.container.append(tosItem);
            self.container.append(args.selectedPanel);
            self.resetPanel(args.selectedPanel,self);
            self.panelStack.push(tosItem);
            self.panelStack.push(args.selectedPanel);
            self.normalizeStack(self);
        }
        await animation.finished;
        animation.commitStyles();
        animation.cancel();
        args.finishHandler();
    }
    async flipInY(args){
        let self = args.self;
        let dispatchEntry = self.dispatchTable["flipInY"];
        self.resetPanel(self.specialtyPanels.flippanel,self);
        self.specialtyPanels.flippanel.replaceChildren([]);
        self.specialtyPanels.flippanel.style.display = "none";
        self.removeFromStack(args.selectedPanel,self);
        self.resetPanel(args.selectedPanel,self);
        args.selectedPanel.classList.add("sic-transit-flipped-y");
        self.specialtyPanels.flippanel.appendChild(args.selectedPanel);
        let tosItem = self.panelStack.pop();
        self.resetPanel(tosItem,self);
        self.specialtyPanels.flippanel.appendChild(tosItem);
        self.specialtyPanels.flippanel.style.display = "block";
        self.moveToTos(self.specialtyPanels.flipbackgroundpanel,self);
        self.moveToTos(self.specialtyPanels.flippanel,self);
        const animation = self.specialtyPanels.flippanel.animate(dispatchEntry.firstanimation,{easing: dispatchEntry.easing, duration: dispatchEntry.duration,fill:"forwards"});
        args.finishHandler = function(){
            args.selectedPanel.classList.remove("sic-transit-flipped-y");
            self.specialtyPanels.flippanel.replaceChildren([]);
            self.container.append(tosItem);
            self.container.append(args.selectedPanel);
            self.resetPanel(args.selectedPanel,self);
            self.panelStack.push(tosItem);
            self.panelStack.push(args.selectedPanel);
            self.normalizeStack(self);
        }
        await animation.finished;
        animation.commitStyles();
        animation.cancel();
        args.finishHandler();
        
    }
    async flipOutX(args){
        let self = args.self;
        let dispatchEntry = self.dispatchTable["flipOutX"];
        self.specialtyPanels.flippanel.replaceChildren([]);
        self.specialtyPanels.flippanel.style.display = "none";
        self.specialtyPanels.flippanel.style.transform = "rotateX(180deg)";
        self.moveToTos(args.selectedPanel,self);
        self.panelStack.pop();
        let tosItem = self.panelStack.pop();
        self.moveToTos(self.specialtyPanels.flipbackgroundpanel,self);
        self.specialtyPanels.flippanel.appendChild(tosItem);
        self.specialtyPanels.flippanel.appendChild(args.selectedPanel);
        self.specialtyPanels.flippanel.style.display = "block";
        args.selectedPanel.classList.add("sic-transit-flipped-x");
        self.moveToTos(self.specialtyPanels.flippanel,self);
        args.finishHandler = function(){
            args.selectedPanel.classList.remove("sic-transit-flipped-x");
            self.container.append(args.selectedPanel);
            self.container.append(tosItem);
            self.panelStack.push(args.selectedPanel);
            self.panelStack.push(tosItem);
            self.normalizeStack(self);

        }
        const animation = self.specialtyPanels.flippanel.animate(dispatchEntry.firstanimation,{easing: dispatchEntry.easing, duration: dispatchEntry.duration,fill:"forwards"});    
        await animation.finished;
        animation.commitStyles();
        animation.cancel();
        args.finishHandler();
    }
   
    async flipOutY(args){
        let self = args.self;
        let dispatchEntry = self.dispatchTable["flipOutY"];
        self.specialtyPanels.flippanel.replaceChildren([]);
        self.specialtyPanels.flippanel.style.display = "none";
        self.specialtyPanels.flippanel.style.transform = "rotateY(180deg)";
        self.moveToTos(args.selectedPanel,self);
        self.panelStack.pop();
        let tosItem = self.panelStack.pop();
        self.moveToTos(self.specialtyPanels.flipbackgroundpanel,self);
        self.specialtyPanels.flippanel.appendChild(tosItem);
        self.specialtyPanels.flippanel.appendChild(args.selectedPanel);
        self.specialtyPanels.flippanel.style.display = "block";
        args.selectedPanel.classList.add("sic-transit-flipped-y");
        self.moveToTos(self.specialtyPanels.flippanel,self);
        args.finishHandler = function(){
            args.selectedPanel.classList.remove("sic-transit-flipped-y");
            self.container.append(args.selectedPanel);
            self.container.append(tosItem);
            self.panelStack.push(args.selectedPanel);
            self.panelStack.push(tosItem);
            self.normalizeStack(self);
         

        }
        const animation = self.specialtyPanels.flippanel.animate(dispatchEntry.firstanimation,{easing: dispatchEntry.easing, duration: dispatchEntry.duration,fill:"forwards"});    
        await animation.finished;
        animation.commitStyles();
        animation.cancel();
        args.finishHandler();
       
    }
     hinge(args){
        let self = args.self;
        self.resetPanel(args.selectedPanel,self);
        self.container.style.perspective =  "1000px";
        self.container.style.perspectiveOrigin = "left";
        args.finishHandler = function(){
            args.selectedPanel.style.transformOrigin = "center";
            self.performCallback(args);
        }
        self.performAnimation(args);
    }
    hingeInFromBottom(args){
        let self = args.self;
        let dispatchEntry = self.dispatchTable["hingeInFromBottom"];
        args.firstanimation = dispatchEntry.firstanimation;
        args.selectedPanel.style.transformOrigin = "bottom";
        self.hinge(args);
    }
    hingeOutToBottom(args){
        let self = args.self;
        let dispatchEntry = self.dispatchTable["hingeOutToBottom"];
        args.firstanimation = dispatchEntry.firstanimation;
        args.selectedPanel.style.transformOrigin = "bottom";
        self.hinge(args);
    }
    hingeInFromLeft(args){
        let self = args.self;
        let dispatchEntry = self.dispatchTable["hingeInFromLeft"];
        args.firstanimation = dispatchEntry.firstanimation;
        args.selectedPanel.style.transformOrigin = "left";
        self.hinge(args);
    }
    hingeOutToLeft(args){
        let self = args.self;
        let dispatchEntry = self.dispatchTable["hingeOutToLeft"];
        args.firstanimation = dispatchEntry.firstanimation;
        args.selectedPanel.style.transformOrigin = "left";
        self.hinge(args);
    }
    hingeInFromRight(args){
        let self = args.self;
        let dispatchEntry = self.dispatchTable["hingeInFromRight"];
        args.firstanimation = dispatchEntry.firstanimation;
        args.selectedPanel.style.transformOrigin = "right";
        self.hinge(args);
    }
    hingeOutToRight(args){
        let self = args.self;
        let dispatchEntry = self.dispatchTable["hingeOutToRight"];
        args.firstanimation = dispatchEntry.firstanimation;
        args.selectedPanel.style.transformOrigin = "right";
        self.hinge(args);
    }
    hingeInFromTop(args){
        let self = args.self;
        let dispatchEntry = self.dispatchTable["hingeInFromTop"];
        args.firstanimation = dispatchEntry.firstanimation;
        args.selectedPanel.style.transformOrigin = "top";
        self.hinge(args);
    }
    hingeOutToTop(args){
        let self = args.self;
        let dispatchEntry = self.dispatchTable["hingeOutToTop"];
        args.firstanimation = dispatchEntry.firstanimation;
        args.selectedPanel.style.transformOrigin = "top";
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
        self.resetPanel(panel,self);
        panel.style.clipPath = "circle(0% at center)";
        panel.style.display="block";
        self.moveToTos(panel,self);
        args.firstanimation = dispatchEntry.firstanimation;
        args.finishHandler = function(){
            panel.style.display = "block";
            panel.style.clipPath = "none";
            self.performCallback(args);
        }
        self.performAnimation(args);
    }
    irisOut(args){
        let self = args.self;
        let dispatchEntry = self.dispatchTable["irisOut"];
        let panel = args.selectedPanel;
        self.resetPanel(panel,self);
        panel.style.clipPath = "circle(100% at center)";
        panel.style.display="block";
        self.moveToTos(panel,self);
        args.firstanimation = dispatchEntry.firstanimation;
        args.finishHandler = function(){
            self.moveToBos(panel, self);
            panel.style.removeProperty("clip-path");
            self.performCallback(args);
        }
        self.performAnimation(args);
    }
    irisInFromBlack(args){
        let self = args.self;
        self.moveToTos(self.specialtyPanels.blackpanel);
        self.irisIn(args);
    }
    irisOutToBlack(args){
        let self = args.self;
             self.specialtyPanels.blackpanel.style.display = "none";
        self.moveToTos(self.specialtyPanels.blackpanel, self);
        self.stackSwap();
        self.normalizeStack();
             self.specialtyPanels.blackpanel.style.display = "block";
        self.irisOut(args);
    }
    irisInFromGray(args){
        let self = args.self;
        self.moveToTos(self.specialtyPanels.graypanel);
        self.irisIn(args);
    }
    irisOutToGray(args){
        let self = args.self;
        self.specialtyPanels.graypanel.style.display = "none";
        self.moveToTos(self.specialtyPanels.graypanel, self);
        self.stackSwap();
        self.normalizeStack();
        self.specialtyPanels.graypanel.style.display = "block";
        self.irisOut(args);
    }
    irisInFromWhite(args){
        let self = args.self;
        self.moveToTos(self.specialtyPanels.whitepanel);
        self.irisIn(args);
    }
    irisOutToWhite(args){
        let self = args.self;
        self.specialtyPanels.whitepanel.style.display = "none";
        self.moveToTos(self.specialtyPanels.whitepanel, self);
        self.stackSwap();
        self.normalizeStack();
         self.specialtyPanels.whitepanel.style.display = "block";
        self.irisOut(args);
    }
    menuInFromBottom(args){
        let self = args.self;
        self.moveToBos(args.selectedPanel,self);
        self.resetPanel(args.selectedPanel,self);
        let dispatchEntry = self.dispatchTable["menuInFromBottom"];
        let menuPercentage =  100 - dispatchEntry.menuPercentage;
        args.selectedPanel.transform = "translateY(100%)";
        self.moveToTos(args.selectedPanel,self);
        args.firstanimation = JSON.parse(JSON.stringify(dispatchEntry.firstanimation).replace("%%%",menuPercentage));
        args.finishHandler = function(){
            self.moveToTos(args.selectedPanel,self);
            args.selectedPanel.style.display = "block";
            args.selectedPanel.style.transform = "translateY(" + menuPercentage + "%)";
            self.performCallback(args);
        }
        self.performAnimation(args);
    }
    menuOutToBottom(args){
        let self = args.self;
        self.moveToTos(args.selectedPanel,self);
        let dispatchEntry = self.dispatchTable["menuOutToBottom"];
        let menuPercentage = 100 - dispatchEntry.menuPercentage;
        args.firstanimation = JSON.parse(JSON.stringify(dispatchEntry.firstanimation).replace("%%%",menuPercentage));
        args.finishHandler = function(){
            self.moveToBos(args.selectedPanel,self);
            self.resetPanel(args.selectedPanel,self);
            self.performCallback(args);
        }
        self.performAnimation(args);
    }
    menuInFromLeft(args){
        let self = args.self;
        self.moveToBos(args.selectedPanel,self);
        self.resetPanel(args.selectedPanel,self);
        let dispatchEntry = self.dispatchTable["menuInFromLeft"];
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
    menuOutToLeft(args){
        let self = args.self;
        let dispatchEntry = self.dispatchTable["menuOutToLeft"];
        let menuPercentage = 100 - dispatchEntry.menuPercentage;
        args.firstanimation = JSON.parse(JSON.stringify(dispatchEntry.firstanimation).replace("%%%",menuPercentage));
        args.finishHandler = function(){
            self.moveToBos(args.selectedPanel,self);
            self.resetPanel(args.selectedPanel,self);
            self.performCallback(args);
        }
        self.performAnimation(args);
    }
    menuInFromRight(args){
        let self = args.self;
        self.moveToBos(args.selectedPanel,self);
        self.resetPanel(args.selectedPanel,self);
        let dispatchEntry = self.dispatchTable["menuInFromRight"];
        let menuPercentage = 100 - dispatchEntry.menuPercentage;
        args.firstanimation = JSON.parse(JSON.stringify(dispatchEntry.firstanimation).replace("%%%",menuPercentage));
        args.selectedPanel.transform = "translateX(100%)";
        self.moveToTos(args.selectedPanel,self);
        args.finishHandler = function(){
            args.selectedPanel.style.display= "block";
            args.selectedPanel.style.transform = "translateX(" + menuPercentage + "%)";
            self.performCallback(args);
        }
        self.performAnimation(args);
    }
    menuOutToRight(args){
        let self = args.self;
        let dispatchEntry = self.dispatchTable["menuOutToRight"];
        let menuPercentage = 100 - dispatchEntry.menuPercentage;
        args.firstanimation = JSON.parse(JSON.stringify(dispatchEntry.firstanimation).replace("%%%", menuPercentage));
        args.finishHandler = function(){
            self.moveToBos(args.selectedPanel,self);
            self.resetPanel(args.selectedPanel,self);
            self.performCallback(args);
        }
        self.performAnimation(args);
    }
    menuInFromTop(args){
        let self = args.self;
        self.moveToBos(args.selectedPanel,self);
        self.resetPanel(args.selectedPanel,self);
        let dispatchEntry = self.dispatchTable["menuInFromTop"];
        let menuPercentage = 100 - dispatchEntry.menuPercentage;
        args.firstanimation = JSON.parse(JSON.stringify(dispatchEntry.firstanimation).replace("%%%",menuPercentage));
        args.selectedPanel.transform = "translateY(-100%)";
        self.moveToTos(args.selectedPanel,self);
        args.finishHandler = function(){
            args.selectedPanel.style.transform = "translateY(-" + menuPercentage + "%)"
            args.selectedPanel.style.display= "block";
            self.performCallback(args);
        }
        self.performAnimation(args);
    }
    menuOutToTop(args){
        let self = args.self;
        let dispatchEntry = self.dispatchTable["menuOutToTop"];
        let menuPercentage = 100 - dispatchEntry.menuPercentage;
        args.firstanimation = JSON.parse(JSON.stringify(dispatchEntry.firstanimation).replace("%%%",menuPercentage));
        args.finishHandler = function(){
            self.moveToBos(args.selectedPanel,self);
            self.resetPanel(args.selectedPanel,self);
            self.performCallback(args);
        }
        self.performAnimation(args);
    }
    newspaperIn(args){
        let self = args.self;
        self.moveToBos(args.selectedPanel,self);
        self.resetPanel(args.selectedPanel,self);
        args.selectedPanel.style.transform = "scale(0)";
        self.moveToTos(args.selectedPanel,self);
        let dispatchEntry = self.dispatchTable["newspaperIn"];
        args.firstanimation = dispatchEntry.firstanimation;
        args.finishHandler = function(){
            self.resetPanel(args.selectedPanel,self);
            self.performCallback(args);
        }
        self.performAnimation(args);
    }
    newspaperOut(args){
        let self = args.self;
        self.resetPanel(args.selectedPanel,self);
        let dispatchEntry = self.dispatchTable["newspaperOut"];
        args.firstanimation = dispatchEntry.firstanimation;
        args.finishHandler = function(){
            self.moveToBos(args.selectedPanel,self);
            self.resetPanel(args.selectedPanel,self);
            self.performCallback(args);
        }
        self.performAnimation(args);
    }
    swap(args){
        let self = args.self;
        self.stackSwap(self);
        self.normalizeStack()
        self.performCallback(args);
    }
    wipeInFromBottom(args){
        let self = args.self;
        self.moveToBos(args.selectedPanel,self);
        self.resetPanel(args.selectedPanel,self);
        let dispatchEntry = self.dispatchTable["wipeInFromBottom"];
        args.firstanimation = dispatchEntry["firstanimation"];
        args.selectedPanel.transform = "translateY(100%)";
        self.moveToTos(args.selectedPanel,self);
        args.finishHandler = function(){
            self.resetPanel(args.selectedPanel,self);
            self.performCallback(args);
        }
        self.performAnimation(args);
    }
    wipeOutToBottom(args){
        let self = args.self;
        self.resetPanel(args.selectedPanel,self);
        self.moveToTos(args.selectedPanel,self);
        let dispatchEntry = self.dispatchTable["wipeOutToBottom"];
        args.firstanimation = dispatchEntry["firstanimation"];
        args.finishHandler = function(){
            self.moveToBos(args.selectedPanel,self);
            self.resetPanel(args.selectedPanel,self);
            self.performCallback(args);
        }
        self.performAnimation(args);
    }
    wipeInFromLeft(args){
        let self = args.self;
        self.moveToBos(args.selectedPanel,self);
        self.resetPanel(args.selectedPanel,self);
        let dispatchEntry = self.dispatchTable["wipeInFromLeft"];
        args.firstanimation = dispatchEntry["firstanimation"];
        args.selectedPanel.transform = "translateX(-100%)";
        self.moveToTos(args.selectedPanel,self);
        args.selectedPanel.style.display = "block";
        args.finishHandler = function(){
            self.resetPanel(args.selectedPanel,self);
            self.performCallback(args);
        }
        self.performAnimation(args);
    }
    wipeOutToLeft(args){
        let self = args.self;
        self.resetPanel(args.selectedPanel,self);
        self.moveToTos(args.selectedPanel,self);
        let dispatchEntry = self.dispatchTable["wipeOutToLeft"];
        args.firstanimation = dispatchEntry["firstanimation"];
        args.finishHandler = function(){
            self.moveToBos(args.selectedPanel,self);
            self.resetPanel(args.selectedPanel,self);
            self.performCallback(args);
        }
        self.performAnimation(args);
    }
    wipeInFromRight(args){
        let self = args.self;
        self.moveToBos(args.selectedPanel,self);
        self.resetPanel(args.selectedPanel,self);
        let dispatchEntry = self.dispatchTable["wipeInFromRight"];
        args.firstanimation = dispatchEntry["firstanimation"];
        args.selectedPanel.transform = "translateX(100%)";
        self.moveToTos(args.selectedPanel,self);
        args.finishHandler = function(){
            args.selectedPanel.style.display= "block";
            self.performCallback(args);
        }
        self.performAnimation(args);
    }
    wipeOutToRight(args){
        let self = args.self;
        self.resetPanel(args.selectedPanel,self);
        let dispatchEntry = self.dispatchTable["wipeOutToRight"];
        args.firstanimation = dispatchEntry["firstanimation"];
        args.finishHandler = function(){
            self.moveToBos(args.selectedPanel,self);
            self.resetPanel(args.selectedPanel,self);
            self.performCallback(args);
        }
        self.performAnimation(args);
    }
    wipeInFromTop(args){
        let self = args.self;
        self.moveToBos(args.selectedPanel,self);
        self.resetPanel(args.selectedPanel,self);
        let dispatchEntry = self.dispatchTable["wipeInFromTop"];
        args.firstanimation = dispatchEntry["firstanimation"];
        args.selectedPanel.transform = "translateY(100%)";
        self.moveToTos(args.selectedPanel,self);
        args.finishHandler = function(){
            self.resetPanel(args.selectedPanel,self);
            self.performCallback(args);
        }
        self.performAnimation(args);
    }
    wipeOutToTop(args){
        let self = args.self;
        self.resetPanel(args.selectedPanel,self);
        let dispatchEntry = self.dispatchTable["wipeOutToTop"];
        args.firstanimation = dispatchEntry["firstanimation"];
        args.finishHandler = function(){
            self.moveToBos(args.selectedPanel,self);
            self.resetPanel(args.selectedPanel,self);
            args.selectedPanel.style.transform = "translateY(0%)";
            self.performCallback(args);
        }
        self.performAnimation(args);
    }
 
    zoomIn(args){
        let self = args.self;
        self.moveToBos(args.selectedPanel,self);
        self.resetPanel(args.selectedPanel,self);
        args.selectedPanel.transform = "scale(0)";
        self.moveToTos(args.selectedPanel,self);
        let dispatchEntry = self.dispatchTable["zoomIn"];
        args.firstanimation = dispatchEntry["firstanimation"];
        args.finishHandler = function(){
            self.resetPanel(args.selectedPanel,self);
            self.performCallback(args);
        }
        self.performAnimation(args);
    }
    zoomOut(args){
        let self = args.self;
        self.resetPanel(args.selectedPanel,self);
        self.moveToTos(args.selectedPanel,self);
        let dispatchEntry = self.dispatchTable["zoomOut"];
        args.firstanimation = dispatchEntry["firstanimation"];
        args.finishHandler = function(){
            self.moveToBos(args.selectedPanel,self);
            self.resetPanel(args.selectedPanel,self);
            self.performCallback(args);
        }
        self.performAnimation(args);
    }
  }
