/*  sic-transit.js Copyright 2023 by Anthony W. Hursh
 *  MIT license.
 */

class SicTransit {
    constructor(containerId, elementClass) {
      this.containerId = containerId;
      this.container = document.querySelector(containerId);
      this.elementClass = elementClass;
      this.synchro = 0;
      this.elementStack = [];
      this.loadStack(this);
      this.callback = null;
      this.performCallback = null;
      let overlay = document.createElement('div');
      this.overlay = overlay;
      overlay.className = 'sic-transit-overlay sic-transit-overlay-panel sic-panel';
      this.container.appendChild(overlay);
      this.elementStack.unshift(overlay);
      let blackpanel = document.createElement('div');
      this.blackpanel = blackpanel;
      blackpanel.className = 'sic-transit-black-panel sic-transit-overlay-panel sic-panel';
      this.container.appendChild(blackpanel);
      this.elementStack.unshift(blackpanel);
      let graypanel = document.createElement('div');
      this.graypanel = graypanel;
      graypanel.className = 'sic-transit-gray-panel sic-transit-overlay-panel sic-panel';
      this.container.appendChild(graypanel);
      this.elementStack.unshift(graypanel);
      let whitepanel = document.createElement('div');
      this.whitepanel = whitepanel;
      whitepanel.className = 'sic-transit-white-panel  sic-transit-overlay-panel sic-panel';
      this.container.appendChild(whitepanel);
      this.elementStack.unshift(whitepanel);
      let flippanel = document.createElement('div');
      this.flippanel = flippanel;
      flippanel.className = 'sic-transit-flip-panel sic-transit-overlay-panel sic-panel';
      this.container.appendChild(flippanel);
      this.elementStack.unshift(flippanel);
      this.showElement(this,this.elementStack[this.elementStack.length - 1]);
    }
    checkElementExists(self,selectedElement, elementSelector){
        if(selectedElement === null){
            throw new Error("SicTransit: Element " + elementSelector + " not found in " + self.containerId);
        }
    }
   dispatchTable =  {
        "cutIn": {
            forwardTransition: this.cutIn,
            undo:"cutOut",
            animation: [],
            secondanimation: [],
            boxShadow: "10px 10px 20px rgba(0,0,0,0.5)",
            timing: {}
        },
        "cutOut": {
            forwardTransition: this.cutOut,
            undo:"cutIn",
            animation: [],
            secondanimation: [],
            boxShadow: "10px 10px 20px rgba(0,0,0,0.5)",
            timing: {}
        },
        "dissolveIn": {
            forwardTransition: this.dissolveIn,
            undo:"dissolveOut",
            animation: [{ display:"block", opacity: 0}, {display:"block",opacity:1}],
            secondanimation: [{display:"block", opacity:1}, {display:"block", opacity:0}],
            boxShadow: "10px 10px 20px rgba(0,0,0,0.5)",
            timing: {easing: 'ease-in-out', duration:500}
        },
        "dissolveOut": {
            forwardTransition: this.dissolveOut,
            undo:"dissolveIn",
            animation: [{ display:"block", opacity: 1}, {display:"block",opacity:0}],
            secondanimation: [{display:"block", opacity:0}, {display:"block", opacity:1}],
            boxShadow: "10px 10px 20px rgba(0,0,0,0.5)",
            timing: {easing: 'ease-in-out', duration:500}
        },
        "fadeInFromBlack": {
            forwardTransition: this.fadeInFromBlack,
            undo:"fadeOutToBlack",
            animation: [{ display:"block", opacity: 0}, {display:"block",opacity:1}],
            boxShadow: "10px 10px 20px rgba(0,0,0,0.5)",
            timing: {easing: 'ease-in-out', duration:500}
        },
        "fadeOutToBlack": {
            forwardTransition: this.fadeOutToBlack,
            undo:"fadeInFromBlack",
            animation: [{opacity:1}, {opacity:0}],
            boxShadow: "10px 10px 20px rgba(0,0,0,0.5)",
            timing: {easing: 'ease-in-out', duration:500}
        },
        "fadeInFromGray": {
            forwardTransition: this.fadeInFromGray,
            undo:"fadeOutToGray",
            animation: [{ display:"block", opacity: 0}, {display:"block",opacity:1}],
            boxShadow: "10px 10px 20px rgba(0,0,0,0.5)",
            timing: {easing: 'ease-in-out', duration:500}
        },
        "fadeOutToGray": {
            forwardTransition: this.fadeOutToGray,
            undo:"fadeInFromGray",
            animation: [{opacity:1}, {opacity:0}],
            boxShadow: "10px 10px 20px rgba(0,0,0,0.5)",
            timing: {easing: 'ease-in-out', duration:500}
        },
        "fadeInFromWhite": {
            forwardTransition: this.fadeInFromWhite,
            undo:"fadeOutToWhite",
            animation: [{ display:"block", opacity: 0}, {display:"block",opacity:1}],
            boxShadow: "10px 10px 20px rgba(0,0,0,0.5)",
            timing: {easing: 'ease-in-out', duration:500}
        },
        "fadeOutToWhite": {
            forwardTransition: this.fadeOutToWhite,
            undo:"fadeInFromWhite",
            animation: [{opacity:1}, {opacity:0}],
            boxShadow: "10px 10px 20px rgba(0,0,0,0.5)",
            timing: {easing: 'ease-in-out', duration:500}
        },
        "flipInX":{
            forwardTransition: this.flipInX,
            undo:"flipOutX",
            animation: [{display:"block", transform: "rotateX(180deg)"}, {display:"block", transform: "rotateX(360deg)"}],
            secondanimation: [{display:"block", transform: "rotateX(0deg)"}, {display:"block", transform: "rotateX(180deg)"}],
            boxShadow: "10px 10px 20px rgba(0,0,0,0.5)",
            timing: {easing: 'ease-out', duration:500}
        },
        "flipOutX":{
            forwardTransition: this.flipOutY,
            undo:"flipInX",
            animation: [{display:"block", transform: "rotateX(0deg)"}, {display:"block", transform: "rotateX(-180deg)"}],
            secondanimation: [{display:"block", transform: "rotateX(180deg)"}, {display:"block", transform: "rotateX(0deg)"}],
            boxShadow: "10px 10px 20px rgba(0,0,0,0.5)",
            timing: {easing: 'ease-out', duration:500}
        },
        "flipInY":{
            forwardTransition: this.flipInY,
            undo:"flipOutY",
            animation: [{display:"block", transform: "rotateY(180deg)"}, {display:"block", transform: "rotateY(360deg)"}],
            secondanimation: [{display:"block", transform: "rotateY(0deg)"}, {display:"block", transform: "rotateY(180deg)"}],
            boxShadow: "10px 10px 20px rgba(0,0,0,0.5)",
            timing: {easing: 'ease-out', duration:500}
        },
        "flipOutY":{
            forwardTransition: this.flipOutY,
            undo:"flipInY",
            animation: [{display:"block", transform: "rotateY(0deg)"}, {display:"block", transform: "rotateY(-180deg)"}],
            secondanimation: [{display:"block", transform: "rotateY(180deg)"}, {display:"block", transform: "rotateY(0deg)"}],
            boxShadow: "10px 10px 20px rgba(0,0,0,0.5)",
            timing: {easing: 'ease-out', duration:500}
        },
        "hingeInBottom":{
            forwardTransition: this.hingeInBottom,
            undo:"hingeOutBottom",
            animation: [{display:"block", transform: "rotateX(180deg)"}, {display:"block", transform: "rotateY(0deg)"}],
            boxShadow: "-10px -10px 20px rgba(0,0,0,0.5)",
            timing: {easing: 'ease-out', duration:500}
        },
        "hingeOutBottom":{
            forwardTransition: this.hingeOutBottom,
            undo:"hingeInBottom",
            animation: [{display:"block", transform: "rotateY(0deg)"}, {display:"block", transform: "rotateX(180deg)"}],
            boxShadow: "-10px -10px 20px rgba(0,0,0,0.5)",
            timing: {easing: 'ease-in', duration:500}
        },
        "hingeInLeft":{
            forwardTransition: this.hingeInLeft,
            undo:"hingeOutLeft",
            animation: [{display:"block", transform: "rotateY(-180deg)"}, {display:"block", transform: "rotateY(0deg)"}],
            boxShadow: "10px 10px 20px rgba(0,0,0,0.5)",
            timing: {easing: 'linear', duration:500}
        },
        "hingeOutLeft":{
            forwardTransition: this.hingeOutLeft,
            undo:"hingeInLeft",
            animation: [{display:"block", transform: "rotateY(0deg)"}, {display:"block", transform: "rotateY(-180deg)"}],
            boxShadow: "10px 10px 20px rgba(0,0,0,0.5)",
            timing: {easing: 'linear', duration:500}
        },
        "hingeInRight":{
            forwardTransition: this.hingeInRight,
            undo:"hingeOutRight",
            animation: [{display:"block", transform: "rotateY(180deg)"}, {display:"block", transform: "rotateY(0deg)"}],
            boxShadow: "-10px -10px 20px rgba(0,0,0,0.5)",
            timing: {easing: 'ease-out', duration:500}
        },
        "hingeOutRight":{
            forwardTransition: this.hingeOutRight,
            undo:"hingeInRight",
            animation: [{display:"block", transform: "rotateY(0deg)"}, {display:"block", transform: "rotateY(180deg)"}],
            boxShadow: "-10px -10px 20px rgba(0,0,0,0.5)",
            timing: {easing: 'ease-in', duration:500}
        },
        "hingeInTop":{
            forwardTransition: this.hingeInTop,
            undo:"hingeOutTop",
            animation: [{display:"block", transform: "rotateX(-180deg)"}, {display:"block", transform: "rotateY(0deg)"}],
            boxShadow: "10px 10px 20px rgba(0,0,0,0.5)",
            timing: {easing: 'ease-out', duration:500}
        },
        "hingeOutTop":{
            forwardTransition: this.hingeOutTop,
            undo:"hingeInTop",
            animation: [{display:"block", transform: "rotateY(0deg)"}, {display:"block", transform: "rotateX(-180deg)"}],
            boxShadow: "10px 10px 20px rgba(0,0,0,0.5)",
            timing: {easing: 'ease-in', duration:500}
        },
        "newspaperIn": {
            forwardTransition: this.newspaperIn,
            undo:"newspaperOut",
            animation: [{display:"block", transform: "rotate(0deg)  scale(0)"}, {display:"block", transform: "rotate(720deg) scale(1)"}],
            boxShadow: "10px 10px 20px rgba(0,0,0,0.5)",
            timing: {easing: 'linear', duration:500}
        },
        "newspaperOut":{
            forwardTransition: this.newspaperOut,
            undo:"newspaperIn",
            animation:[{display:"block", transform: "rotate(0deg)  scale(1)"}, {display:"block", transform: "rotate(-720deg) scale(0)"}],
            boxShadow: "10px 10px 20px rgba(0,0,0,0.5)",
            timing: {easing: 'linear', duration:500}
        },
        "rotateStack":{
            forwardTransition: this.rotateStack,
            undo:"unrotateStack",
            animation: [],
            boxShadow: "",
            timing: {}
        },
        "unrotateStack":{
            forwardTransition: this.unrotateStack,
            undo:"rotateStack",
            animation: [],
            boxShadow: "",
            timing: {}
        },
        "slideInBottom": {
            forwardTransition: this.slideInBottom,
            undo:"slideOutBottom",
            animation: [{display:"block", transform: "translateY(100%)"}, {display:"block",transform: "translateY(0%)"}],
            boxShadow: "-10px -10px 30px rgba(0,0,0,0.5)",
            timing: {easing: 'ease-in-out', duration:500}
        },
        "slideOutBottom": {
            forwardTransition: this.slideOutBottom,
            undo:"slideInBottom",
            animation: [{transform: "translateY(0%)"}, {transform: "translateY(100%)"}],
            boxShadow: "-10px -10px 20px rgba(0,0,0,0.5)",
            timing: {easing: 'ease-in-out', duration:500}
        },
        "slideInLeft": {
                        forwardTransition: this.slideInLeft,
                        undo:"slideOutLeft",
                        animation: [{display:"block", transform: "translateX(-100%)"}, {display:"block",transform: "translateX(0%)"}],
                        boxShadow:  "10px 20px 20px 30px rgba(0,0,0,0.5)",
                        timing: {easing: 'ease-in-out', duration:500}
        },
        "slideOutLeft": {
            forwardTransition: this.slideOutLeft,
            undo:"slideInLeft",
            animation: [{display:"block", transform: "translateX(0%)"}, {display:"block",transform: "translateX(-120%)"}],
            boxShadow: "10px 20px 20px 30px rgba(0,0,0,0.5)",
            timing: {easing: 'ease-in-out', duration:500}
        },
        "slideInRight": {
            forwardTransition: this.slideInRight,
            undo:"slideOutRight",
            animation: [{ display:"block", transform: "translateX(100%)"}, {display:"block",transform: "translateX(0%)"}],
            boxShadow: "-10px -10px 20px 30px rgba(0,0,0,0.5)",
           timing: {easing: 'ease-in-out', duration:500}
        },
        "slideOutRight": {
            forwardTransition: this.slideOutRight,
            undo:"slideInRight",
            animation: [{transform: "translateX(0%)"}, {transform: "translateX(120%)"}],
            boxShadow: "-10px -10px 20px 30px rgba(0,0,0,0.5)",
            timing:{easing: 'ease-in-out',duration:500}
        },
        "slideInTop": {
            forwardTransition: this.slideInTop,
            undo:"slideOutTop",
            animation: [{display:"block", transform: "translateY(-100%)"}, {display:"block",transform: "translateY(0%)"}],
            boxShadow: "10px 10px 20px rgba(0,0,0,0.5)",
            timing: {easing: 'ease-in-out', duration:500}
        },
        "slideOutTop": {
            forwardTransition: this.slideOutTop,
            undo:"slideInTop",
            animation:[{transform: "translateY(0%)"}, {transform: "translateY(-100%)"}],
            boxShadow: "10px 10px 20px rgba(0,0,0,0.5)",
            timing:{easing: 'ease-in-out', duration:500}
        },
        "zoomIn": {
            forwardTransition: this.zoomIn,
            undo:"zoomOut",
            animation: [{display:"block", transform: "scale(0)"}, {display:"block", transform: "scale(1)"}],
            boxShadow: "10px 10px 20px rgba(0,0,0,0.5)",
            timing: {easing: 'linear', duration:500}

        },
        "zoomOut":{
            forwardTransition: this.zoomOut,
            undo:"zoomIn",
            animation: [{display:"block", transform: "scale(1)"}, {display:"block", transform: "scale(0)"}],
            boxShadow: "10px 10px 20px rgba(0,0,0,0.5)",
            timing: {easing: 'linear', duration:500}
        },
    }

// Utility methods
    getBos(self){
        return self.elementStack[0];
    }
    getTos(self){
        return self.elementStack[self.elementStack.length - 1];
    }
    getZIndex(element){
        return window.getComputedStyle(element).getPropertyValue('z-index');
    }
    loadStack(self){
        const element_list = document.querySelectorAll(self.elementClass);
        self.elementStack = [...element_list];
        self.normalizeStack(self);
    }
    moveToBos(self,element){
        self.removeFromStack(self,element);
        self.elementStack.unshift(element);
        self.normalizeStack(self);
    }
    moveToTos(self,element){
        self.removeFromStack(self,element);
        self.elementStack.push(element);
        self.normalizeStack(self);
    }
   
    normalizeStack(self){
        for(let index = 0; index < self.elementStack.length; index++){
            let element = self.elementStack[index];
            element.style.zIndex = (index - self.elementStack.length) + 1;
        }
    }
    performAnimation(self,selectedElement,firstanimation,direction,timing,onfinish){
        self.moveToTos(self,selectedElement);
        if(direction > 0){
            self.overlay.style.opacity = 0.0;
            self.overlay.animate({opacity:"0",opacity:"0.25"},timing);
        }
        else{
            self.overlay.style.opacity = 0.25;
            self.overlay.animate({opacity:"0.25",opacity:"0"},timing);
        }
        const animation = selectedElement.animate(firstanimation,timing);
        animation.onfinish = onfinish; 
    }
    performFlip(self,selectedElement,replaceElement, firstanimation,secondanimation, timing,onfinish){
        self.moveToTos(self,self.flippanel);
        const animation = selectedElement.animate(firstanimation,timing);
        animation.onfinish = onfinish; 
        secondanimation = replaceElement.animate(secondanimation,timing);
    }
    performTransition(elementSelector,transitionName,delay,direction = 1){
        let transitionFunction;
        if(direction === 1){
             transitionFunction = this.dispatchTable[transitionName]["forwardTransition"];
        }
        else if(direction ===  -1){
            this.performTransition(elementSelector,this.dispatchTable[transitionName]["undo"],delay,1);
            return;
        }
        if(transitionFunction === null){
            throw new Error("SicTransit: " + transitionName + " is not a recognized transition");
        }
        let selectedElement = this.selectElement(this,elementSelector);
        const animation = this.dispatchTable[transitionName]["animation"];
        const secondanimation = this.dispatchTable[transitionName]["secondanimation"];
        let timing = this.dispatchTable[transitionName]["timing"];
        timing.duration = delay;
        let self = this;
        let startTime = Date.now();
        if(this.callback !== null){
            this.performCallback = function(){
                let endTime = date.now();
                self.callback(elementSelector,transitionName,delay,direction,startTime,endTime);
            }
        }
        else {
            this.performCallback = null;
        }
        transitionFunction(this,elementSelector,animation,secondanimation,timing);
    }
    removeFromStack(self,element){
        for(let i = 0; i < self.elementStack.length; i++){
            if(self.elementStack[i] === element){
                self.elementStack.splice(i,1);
                return element;
            }
        }
        throw new Error("removeFromStack: element not found.");
    }
    selectElement(self,elementSelector){
        let selectedElement;
        if(Number.isInteger(elementSelector)){
            // We're selecting the new item by stack position
            if(elementSelector >= 0){
                // Counting up from bottom of stack.
                selectedElement =  self.elementStack[elementSelector];
            }
            else{
                // Counting down from top of stack.
                selectedElement = self.elementStack[self.elementStack.length - (elementSelector + 1)];
            }
        }
        else {
            selectedElement = document.querySelector(elementSelector);
        }
        // Throws an error if the element does not exist.
        self.checkElementExists(self,selectedElement, elementSelector);
        return selectedElement;
    }
    setCallback(func){
        this.callback = func;
    }
    showElement(self,element){
        element.style.display = "block";
        element.style.opacity = 1.0;
        self.moveToTos(self,element);
    }
    stackDump(self){
        console.log("stackDump:");
        for (const element of self.elementStack) {
            if(element.id !== ""){
                console.log("id: " + element.id + " display:" + element.style.display + " z-index: " + element.style.zIndex);
            }
            else {
                console.log("class: " + element.className + " display:" + element.style.display + " z-index: " + element.style.zIndex);
            }
        } 
    }

// Transitions
    cutIn(self,elementSelector,animation,secondanimation, timing){
        const selectedElement = self.selectElement(self,elementSelector);
        self.showElement(self,selectedElement);
        if(this.performCallback !== null){
            this.performCallback();
        }
    }
    cutOut(self,elementSelector,animation,secondanimation, timing){
        const selectedElement = self.selectElement(self,elementSelector);
        self.moveToBos(self,selectedElement);
        if(this.performCallback !== null){
            this.performCallback();
        }
    }
    dissolveIn(self,elementSelector,firstanimation,secondanimation,timing){
        self.synchro = 0;
        let selectedElement = self.selectElement(self,elementSelector);
        self.moveToBos(self,selectedElement);
        selectedElement.style.display = "none";

        let topElement = self.elementStack.pop();
        self.elementStack.push(topElement);
        self.moveToTos(self,self.blackpanel);
        self.moveToTos(self,topElement);
        self.normalizeStack(self);
        selectedElement.style.opacity = 0;
        self.moveToTos(self,selectedElement);
        let finishHandler = function(){
            self.synchro++;
            if(self.synchro < 2){
                // Second animation is still running.
                return;
            }
            selectedElement.style.opacity = 1;
            selectedElement.style.display = "block";
            topElement.style.opacity = 1;
            self.normalizeStack(self);
            self.synchro = 0;
            if(self.performCallback !== null){
                self.performCallback();
            }
        }
        const animation = selectedElement.animate(firstanimation,timing);
        animation.onfinish = finishHandler;
        const topAnimation = topElement.animate(secondanimation,timing);
        topAnimation.onfinish = finishHandler;
    }
    dissolveOut(self,elementSelector,firstanimation,secondanimation,timing){
        self.synchro = 0;
        let selectedElement = self.selectElement(self,elementSelector);
        self.removeFromStack(self,selectedElement);
        let topElement = self.elementStack.pop();
        self.moveToTos(self,self.blackpanel);
        self.moveToTos(self,topElement);
        self.moveToTos(self,selectedElement);
        self.normalizeStack(self);
        selectedElement.style.opacity = 1;
        topElement.style.opacity = 0;
        let finishHandler = function(){
            self.synchro++;
            if(self.synchro < 2){
                 // Second animation is still running.
                return;
            }
            self.moveToTos(self,topElement);
            topElement.style.opacity = 1;
            self.normalizeStack(self);
            self.synchro = 0;
            if(self.performCallback !== null){
                self.performCallback();
            }
        }
        const animation = selectedElement.animate(firstanimation,timing);
        animation.onfinish = finishHandler; 
        const topanimation = topElement.animate(secondanimation,timing);
        topanimation.onfinish = finishHandler;
    }
    fadeInFromBlack(self,elementSelector, animation,secondanimation,timing){
        self.moveToTos(self,self.blackpanel);
        const selectedElement = self.selectElement(self,elementSelector);
        selectedElement.style.opacity = 0;
        selectedElement.style.display = "block";
        self.moveToTos(self,selectedElement);
        let finishHandler = function(){
            self.moveToBos(self,self.blackpanel);
            selectedElement.style.display = "block";
            selectedElement.style.opacity = 1;
            if(self.performCallback !== null){
                self.performCallback();
            }
        }
        self.performAnimation(self,selectedElement,animation,1,timing,finishHandler);
    }
    fadeOutToBlack(self,elementSelector,animation,secondanimation,timing){
        self.moveToTos(self,self.blackpanel);
        const selectedElement = self.selectElement(self,elementSelector);
        selectedElement.style.opacity = 1;
        selectedElement.style.display = "block";
        self.moveToTos(self,selectedElement);
        let finishHandler = function(){
            self.moveToBos(self,selectedElement);
            selectedElement.style.display = "none";
            selectedElement.style.opacity = 1;
            if(self.performCallback !== null){
                self.performCallback();
            }
        }
        self.performAnimation(self,selectedElement,animation,-1,timing,finishHandler);
    }
    fadeInFromGray(self,elementSelector, animation,secondanimation,timing){
        self.moveToTos(self,self.graypanel);
        const selectedElement = self.selectElement(self,elementSelector);
        selectedElement.style.opacity = 0;
        self.moveToTos(self,selectedElement);
        let finishHandler = function(){
            self.moveToBos(self,self.graypanel);
            selectedElement.style.display = "block";
            selectedElement.style.opacity = 1;
            if(self.performCallback !== null){
                self.performCallback();
            }
        }
        self.performAnimation(self,selectedElement,animation,1,timing,finishHandler);
    }
    fadeOutToGray(self,elementSelector,animation,secondanimation,timing){
        self.moveToTos(self,self.graypanel);
        const selectedElement = self.selectElement(self,elementSelector);
        selectedElement.style.opacity = 1;
        selectedElement.style.display = "block";
        self.moveToTos(self,selectedElement);
        let finishHandler = function(){
            self.moveToBos(self,selectedElement);
            selectedElement.style.display = "none";
            selectedElement.style.opacity = 1;
            if(self.performCallback !== null){
                self.performCallback();
            }
        }
        self.performAnimation(self,selectedElement,animation,-1,timing,finishHandler);
    }
    fadeInFromWhite(self,elementSelector, animation,secondanimation,timing){
        self.moveToTos(self,self.whitepanel);
        const selectedElement = self.selectElement(self,elementSelector);
        selectedElement.style.opacity = 0;
        self.moveToTos(self,selectedElement);
        let finishHandler = function(){
            self.moveToBos(self,self.whitepanel);
            selectedElement.style.display = "block";
            selectedElement.style.opacity = 1;
            if(self.performCallback !== null){
                self.performCallback();
            }
        }
        self.performAnimation(self,selectedElement,animation,1,timing,finishHandler);
    }
    fadeOutToWhite(self,elementSelector,animation,secondanimation,timing){
        self.moveToTos(self,self.whitepanel);
        const selectedElement = self.selectElement(self,elementSelector);
        selectedElement.style.opacity = 1;
        selectedElement.style.display = "block";
        self.moveToTos(self,selectedElement);
        let finishHandler = function(){
            self.moveToBos(self,selectedElement);
            selectedElement.style.display = "none";
            selectedElement.style.opacity = 1;
            if(self.performCallback !== null){
                self.performCallback();
            }
        }
        self.performAnimation(self,selectedElement,animation,-1,timing,finishHandler);
    }
    flipInY(self,elementSelector,firstanimation,secondanimation,timing){
        const selectedElement = self.selectElement(self,elementSelector);
        self.moveToBos(self,selectedElement);
        selectedElement.style.display = "none";
        self.normalizeStack(self);
        selectedElement.style.transform = "rotateY(180deg)";
        selectedElement.style.display = "block";
        self.flippanel.replaceChildren([]);
        let tosItem = self.elementStack.pop();
        self.flippanel.appendChild(selectedElement);
        self.flippanel.appendChild(tosItem);
        self.moveToTos(self,self.flippanel);
        self.flippanel.style.display="block";
        self.normalizeStack(self);
        let finishHandler = function(){
            self.moveToBos(self,self.flippanel);
            self.container.appendChild(tosItem);
            self.container.appendChild(selectedElement);
            self.moveToTos(self,tosItem);
            self.moveToTos(self,selectedElement);
            self.normalizeStack(self);
            selectedElement.style.transform = "";
            if(self.performCallback !== null){
                self.performCallback();
            }
        }
        self.performFlip(self,selectedElement,tosItem,firstanimation,secondanimation,timing,finishHandler);
    }
    flipOutY(self,elementSelector,firstanimation,secondanimation,timing){
        let animElement = self.selectElement(self,elementSelector);
        self.moveToTos(self,animElement);
        self.normalizeStack(self);
        let topElement = self.elementStack.pop();
        let secondElement= self.elementStack.pop();
        secondElement.style.display = "block";
       // self.normalizeStack(self);
        secondElement.style.transform = "rotateY(180deg)";
        self.flippanel.replaceChildren([]);
        self.flippanel.appendChild(secondElement);
        self.flippanel.appendChild(topElement);
        self.moveToTos(self,self.flippanel);
        self.flippanel.style.display="block";
        self.normalizeStack(self);
        let finishHandler = function(){
            self.moveToBos(self,self.flippanel);
            self.container.appendChild(topElement);
            self.container.appendChild(secondElement);
            self.moveToTos(self,topElement);
            self.moveToTos(self,secondElement);
            self.normalizeStack(self);
            secondElement.style.transform = "";
            if(self.performCallback !== null){
                self.performCallback();
            }
        }
        self.performFlip(self,topElement,secondElement,firstanimation,secondanimation,timing,finishHandler);
    }
    flipInX(self,elementSelector,firstanimation,secondanimation,timing){
        const selectedElement = self.selectElement(self,elementSelector);
        self.moveToBos(self,selectedElement);
        selectedElement.style.display = "none";
        self.normalizeStack(self);
        selectedElement.style.transform = "rotateX(180deg)";
        selectedElement.style.display = "block";
        self.flippanel.replaceChildren([]);
        let tosItem = self.elementStack.pop();
        self.flippanel.appendChild(selectedElement);
        self.flippanel.appendChild(tosItem);
        self.moveToTos(self,self.flippanel);
        self.flippanel.style.display="block";
        self.normalizeStack(self);
        let finishHandler = function(){
            self.moveToBos(self,self.flippanel);
            self.container.appendChild(tosItem);
            self.container.appendChild(selectedElement);
            self.moveToTos(self,tosItem);
            self.moveToTos(self,selectedElement);
            self.normalizeStack(self);
            selectedElement.style.transform = "";
            if(self.performCallback !== null){
                self.performCallback();
            }
        }
        self.performFlip(self,selectedElement,tosItem,firstanimation,secondanimation,timing,finishHandler);
    }
    flipOutX(self,elementSelector,firstanimation,secondanimation,timing){
        let animElement = self.selectElement(self,elementSelector);
        self.moveToTos(self,animElement);
        self.normalizeStack(self);
        let topElement = self.elementStack.pop();
        let secondElement= self.elementStack.pop();
        secondElement.style.display = "block";
       // self.normalizeStack(self);
        secondElement.style.transform = "rotateX(180deg)";
        self.flippanel.replaceChildren([]);
        self.flippanel.appendChild(secondElement);
        self.flippanel.appendChild(topElement);
        self.moveToTos(self,self.flippanel);
        self.flippanel.style.display="block";
        self.normalizeStack(self);
        let finishHandler = function(){
            self.moveToBos(self,self.flippanel);
            self.container.appendChild(topElement);
            self.container.appendChild(secondElement);
            self.moveToTos(self,topElement);
            self.moveToTos(self,secondElement);
            self.normalizeStack(self);
            secondElement.style.transform = "";
            if(self.performCallback !== null){
                self.performCallback();
            }
        }
        self.performFlip(self,topElement,secondElement,firstanimation,secondanimation,timing,finishHandler);
    }
    hingeInBottom(self,elementSelector,animation,secondanimation,timing){
        self.moveToTos(self,self.overlay);
        const selectedElement = self.selectElement(self,elementSelector);
        selectedElement.style.transformOrigin = "bottom";
        self.container.style.perspective =  "1000px";
        self.container.style.perspectiveOrigin = "left";
        let finishHandler = function(){
            self.moveToBos(self,self.overlay);
            selectedElement.style.display= "block";
            selectedElement.style.transformOrigin = "";
            self.container.style.perspective =  "";
            self.container.style.perspectiveOrigin = "";
            if(self.performCallback !== null){
                self.performCallback();
            }
        }
        self.performAnimation(self,selectedElement,animation,1,timing,finishHandler);
    }
    hingeOutBottom(self,elementSelector,animation,secondanimation,timing){
        self.moveToTos(self,self.overlay);
        const selectedElement = self.selectElement(self,elementSelector);
        selectedElement.style.transformOrigin = "bottom";
        self.container.style.perspective =  "1000px";
        self.container.style.perspectiveOrigin = "left";
        let finishHandler = function(){
            self.moveToBos(self,self.overlay);
            self.moveToBos(self,selectedElement);
            selectedElement.style.display= "none";
            selectedElement.style.transformOrigin = "";
            self.container.style.perspective =  "";
            self.container.style.perspectiveOrigin = "";
            if(self.performCallback !== null){
                self.performCallback();
            }
        }
        self.performAnimation(self,selectedElement,animation,-1,timing,finishHandler);
    }
    hingeInLeft(self,elementSelector,animation,secondanimation,timing){
        self.moveToTos(self,self.overlay);
        const selectedElement = self.selectElement(self,elementSelector);
        selectedElement.style.transformOrigin = "left";
        self.container.style.perspective =  "10000px";
        self.container.style.perspectiveOrigin = "left";
        let finishHandler = function(){
            self.moveToBos(self,self.overlay);
            selectedElement.style.display= "block";
            selectedElement.style.transformOrigin = "";
            selectedElement.style.scale = "";
            self.container.style.perspective =  "";
            self.container.style.perspectiveOrigin = "";
            if(self.performCallback !== null){
                self.performCallback();
            }
        }
        self.performAnimation(self,selectedElement,animation,1,timing,finishHandler);
    }
    hingeOutLeft(self,elementSelector,animation,secondanimation,timing){
        self.moveToTos(self,self.overlay);
        const selectedElement = self.selectElement(self,elementSelector);
        selectedElement.style.transformOrigin = "left";
        self.container.style.perspective =  "10000px";
        self.container.style.perspectiveOrigin = "left";
        let finishHandler = function(){
            self.moveToBos(self,self.overlay);
            self.moveToBos(self,selectedElement);
            selectedElement.style.display= "none";
            selectedElement.style.transformOrigin = ""
            selectedElement.style.scale = "";
            self.container.style.perspective =  "";
            self.container.style.perspectiveOrigin = "";
            if(self.performCallback !== null){
                self.performCallback();
            }
            
        }
        self.performAnimation(self,selectedElement,animation,-1,timing,finishHandler);
    }
    hingeInRight(self,elementSelector,animation,secondanimation,timing){
        self.moveToTos(self,self.overlay);
        const selectedElement = self.selectElement(self,elementSelector);
        selectedElement.style.transformOrigin = "right";
        self.container.style.perspective =  "1000px";
        self.container.style.perspectiveOrigin = "left";
        let finishHandler = function(){
            self.moveToBos(self,self.overlay);
            selectedElement.style.display= "block";
            selectedElement.style.transformOrigin = "";
            self.container.style.perspective =  "";
            self.container.style.scale =  "";
            self.container.style.perspectiveOrigin = "";
            if(self.performCallback !== null){
                self.performCallback();
            }
        }
        self.performAnimation(self,selectedElement,animation,1,timing,finishHandler);
    }
    hingeOutRight(self,elementSelector,animation,secondanimation,timing){
        self.moveToTos(self,self.overlay);
        const selectedElement = self.selectElement(self,elementSelector);
        selectedElement.style.transformOrigin = "right";
        self.container.style.perspective =  "1000px";
        self.container.style.perspectiveOrigin = "left";
        let finishHandler = function(){
            self.moveToBos(self,self.overlay);
            self.moveToBos(self,selectedElement);
            selectedElement.style.display= "none";
            selectedElement.style.transformOrigin = "";
            self.container.style.perspective =  "";
            self.container.style.scale =  "";
            self.container.style.perspectiveOrigin = "";
            if(self.performCallback !== null){
                self.performCallback();
            }
        }
        self.performAnimation(self,selectedElement,animation,-1,timing,finishHandler);
    }
    hingeInTop(self,elementSelector,animation,secondanimation,timing){
        self.moveToTos(self,self.overlay);
        const selectedElement = self.selectElement(self,elementSelector);
        selectedElement.style.transformOrigin = "top";
        self.container.style.perspective =  "1000px";
        self.container.style.perspectiveOrigin = "left";
        let finishHandler = function(){
            self.moveToBos(self,self.overlay);
            selectedElement.style.display= "block";
            selectedElement.style.transformOrigin = "";
            self.container.style.perspective =  "";
            self.container.style.perspectiveOrigin = "";
            if(self.performCallback !== null){
                self.performCallback();
            }
        }
        self.performAnimation(self,selectedElement,animation,1,timing,finishHandler);
    }
    hingeOutTop(self,elementSelector,animation,secondanimation,timing){
        self.moveToTos(self,self.overlay);
        const selectedElement = self.selectElement(self,elementSelector);
        selectedElement.style.transformOrigin = "top";
        self.container.style.perspective =  "1000px";
        self.container.style.perspectiveOrigin = "left";
        let finishHandler = function(){
            self.moveToBos(self,self.overlay);
            self.moveToBos(self,selectedElement);
            selectedElement.style.display= "none";
            selectedElement.style.transformOrigin = "";
            self.container.style.perspective =  "";
            self.container.style.perspectiveOrigin = "";
            if(self.performCallback !== null){
                self.performCallback();
            }
        }
        self.performAnimation(self,selectedElement,animation,-1,timing,finishHandler);
    }
    newspaperIn(self,elementSelector, animation,secondanimation,timing){
        self.moveToTos(self,self.overlay);
        const selectedElement = self.selectElement(self,elementSelector);  
        let finishHandler = function(){
            self.moveToBos(self,self.overlay);
            selectedElement.style.display = "block";
            selectedElement.style.transform = "rotate(0deg) scale(1)";
            if(self.performCallback !== null){
                self.performCallback();
            }
        }
        self.performAnimation(self,selectedElement,animation,1,timing,finishHandler);
    }
    newspaperOut(self,elementSelector,animation,secondanimation,timing){
        self.moveToTos(self,self.overlay);
        const selectedElement = self.selectElement(self,elementSelector);
      
        let finishHandler = function(){
            self.moveToBos(self,self.overlay);
            self.moveToBos(self,selectedElement);
            selectedElement.style.display = "none";
            selectedElement.style.transform = "rotate(0deg) scale(1)";
            if(self.performCallback !== null){
                self.performCallback();
            }
        }
        self.performAnimation(self,selectedElement,animation,-1,timing,finishHandler);
    }
    rotateStack(self,number, animation, secondanimation, timing){
       // We don't do anything if number === 0, other than making sure element is visible (below).
       if(number < 0){
            for(let i = 0; i > number; i--){
               self.elementStack.unshift(self.elementStack.pop());
            }
        }
        else if(number > 0){
            for(let i = 0; i < number; i++){
                self.elementStack.push(self.elementStack.shift())
            }
        }
        self.normalizeStack(self);
        let tosElement = self.getTos(self);
        tosElement.style.display = "block";
        tosElement.style.opacity = 1.0;
        if(this.performCallback !== null){
            this.performCallback();
        }
    }
    unrotateStack(self,number, animation, secondanimation, timing){
        self.rotateStack(self,-number, animation, secondanimation,timing);
    }
    slideInBottom(self,elementSelector,animation,secondanimation,timing){
        self.moveToTos(self,self.overlay)
        const selectedElement = self.selectElement(self,elementSelector);
    
        let finishHandler = function(){
            self.moveToBos(self,self.overlay)
            selectedElement.style.display= "block";
            if(self.performCallback !== null){
                self.performCallback();
            }
        }
        self.performAnimation(self,selectedElement,animation, 1,timing,finishHandler);
    }
    slideOutBottom(self,elementSelector,animation,secondanimation,timing){
        self.moveToTos(self,self.overlay);
        const selectedElement = self.selectElement(self,elementSelector);
       
        let finishHandler = function(){
            self.moveToBos(self,self.overlay)
            self.moveToBos(self,selectedElement);
            selectedElement.style.transform = "translateY(0%)";
            if(self.performCallback !== null){
                self.performCallback();
            }
        }
        self.performAnimation(self,selectedElement,animation,-1,timing,finishHandler);
    }
    slideInLeft(self,elementSelector,animation,secondanimation, timing){
        self.moveToTos(self,self.overlay);
        const selectedElement = self.selectElement(self,elementSelector);
        let finishHandler = function(){
            selectedElement.style.display= "block";
            self.moveToBos(self,self.overlay);
            if(self.performCallback !== null){
                self.performCallback();
            }
        }
        self.performAnimation(self,selectedElement,animation,1,timing,finishHandler);
    }
    slideOutLeft(self,elementSelector,animation,secondanimation, timing){
        self.moveToTos(self,self.overlay);
        const selectedElement = self.selectElement(self,elementSelector);
        let finishHandler = function(){
            self.moveToBos(self,selectedElement);
            self.moveToBos(self,self.overlay);
            selectedElement.style.transform = "translateX(0%)";
            if(self.performCallback !== null){
                self.performCallback();
            }
        }
        self.performAnimation(self,selectedElement,animation,-1,timing,finishHandler);
    }
    slideInRight(self,elementSelector,animation,secondanimation,timing){
        self.moveToTos(self,self.overlay);
        const selectedElement = self.selectElement(self,elementSelector);
        let finishHandler = function(){
            self.moveToBos(self,self.overlay)
            selectedElement.style.display= "block";
            if(self.performCallback !== null){
                self.performCallback();
            }
        }
        self.performAnimation(self,selectedElement,animation,1,timing,finishHandler);
    }
    slideOutRight(self,elementSelector,animation,secondanimation,timing){
        self.moveToTos(self,self.overlay);
        const selectedElement = self.selectElement(self,elementSelector);
        let finishHandler = function(){
            self.moveToBos(self,selectedElement);
            self.moveToBos(self,self.overlay)
            selectedElement.style.transform = "translateX(0%)";
            if(self.performCallback !== null){
                self.performCallback();
            }
        }
        self.performAnimation(self,selectedElement,animation,-1,timing,finishHandler);
    }
    slideInTop(self,elementSelector,animation,secondanimation,timing){
        self.moveToTos(self,self.overlay)
        const selectedElement = self.selectElement(self,elementSelector);
        let finishHandler = function(){
            self.moveToBos(self,self.overlay)
            selectedElement.style.display= "block";
            if(self.performCallback !== null){
                self.performCallback();
            }
        }
        self.performAnimation(self,selectedElement,animation,1,timing,finishHandler);
    }
    slideOutTop(self,elementSelector,animation,secondanimation,timing){
        self.moveToTos(self,self.overlay)
        const selectedElement = self.selectElement(self,elementSelector);
        let finishHandler = function(){
            self.moveToBos(self,self.overlay)
            self.moveToBos(self,selectedElement);
            selectedElement.style.transform = "translateY(0%)";
            if(self.performCallback !== null){
                self.performCallback();
            }
        }
        self.performAnimation(self,selectedElement,animation,-1,timing,finishHandler);
    }
    zoomIn(self,elementSelector, animation,secondanimation,timing){
        self.moveToTos(self,self.overlay);
        const selectedElement = self.selectElement(self,elementSelector);
        let finishHandler = function(){
            self.moveToBos(self,self.overlay);
            selectedElement.style.display = "block";
            selectedElement.style.transform = "scale(1)";
            if(self.performCallback !== null){
                self.performCallback();
            }
        }
        self.performAnimation(self,selectedElement,animation,1,timing,finishHandler);
    }
    zoomOut(self,elementSelector,animation,secondanimation,timing){
        self.moveToTos(self,self.overlay);
        const selectedElement = self.selectElement(self,elementSelector);
      
        let finishHandler = function(){
            self.moveToBos(self,self.overlay);
            self.moveToBos(self,selectedElement);
            selectedElement.style.display = "none";
            selectedElement.style.transform = "scale(1)";
            if(self.performCallback !== null){
                self.performCallback();
            }
        }
        self.performAnimation(self,selectedElement,animation,-1,timing,finishHandler);
    }
  }
