/*  sic-transit.js Copyright 2023 by Anthony W. Hursh
 *  MIT license
 */

class SicTransit {
    constructor(containerId, elementClass) {
      this.containerId = containerId;
      this.container = document.querySelector(containerId);
      this.elementClass = elementClass;
      this.loadStack(this);
      let overlay = document.createElement('div');
      this.overlay = overlay;
      overlay.className = 'sic-transit-overlay sic-transit-overlay-panel';
      this.container.appendChild(overlay);
      this.elementStack.unshift(overlay);
      let blackpanel = document.createElement('div');
      this.blackpanel = blackpanel;
      blackpanel.className = 'sic-transit-black-panel sic-transit-overlay-panel';
      this.container.appendChild(blackpanel);
      this.elementStack.unshift(blackpanel);
      let graypanel = document.createElement('div');
      this.graypanel = graypanel;
      graypanel.className = 'sic-transit-gray-panel sic-transit-overlay-panel';
      this.container.appendChild(graypanel);
      this.elementStack.unshift(graypanel);
      let whitepanel = document.createElement('div');
      this.whitepanel = whitepanel;
      whitepanel.className = 'sic-transit-white-panel  sic-transit-overlay-panel';
      this.container.appendChild(whitepanel);
      this.elementStack.unshift(whitepanel);
      let flippanel = document.createElement('div');
      this.flippanel = flippanel;
      flippanel.className = 'sic-transit-flip-panel sic-transit-overlay-panel';
      this.container.appendChild(flippanel);
      this.elementStack.unshift(flippanel);
      this.normalizeStack(this);
      this.showElement(this,this.elementStack[this.elementStack.length - 1]);     
    }

    dispatchTable =  {
        "fadeInFromWhite": {
            forwardTransition: this.fadeInFromWhite,
            undo:"fadeOutToWhite",
            animation: [{ display:"block", opacity: 0}, {display:"block",opacity:1}],
            timing: {easing: 'ease-in-out', duration:500}
        },
        "fadeOutToWhite": {
            forwardTransition: this.fadeOutToWhite,
            undo:"fadeInFromWhite",
            animation: [{opacity:1}, {opacity:0}],
            timing: {easing: 'ease-in-out', duration:500}
        },
        "fadeInFromBlack": {
            forwardTransition: this.fadeInFromBlack,
            undo:"fadeOutToBlack",
            animation: [{ display:"block", opacity: 0}, {display:"block",opacity:1}],
            timing: {easing: 'ease-in-out', duration:500}
        },
        "fadeOutToBlack": {
            forwardTransition: this.fadeOutToBlack,
            undo:"fadeInFromBlack",
            animation: [{opacity:1}, {opacity:0}],
            timing: {easing: 'ease-in-out', duration:500}
        },
        "fadeInFromGray": {
            forwardTransition: this.fadeInFromGray,
            undo:"fadeOutToGray",
            animation: [{ display:"block", opacity: 0}, {display:"block",opacity:1}],
            timing: {easing: 'ease-in-out', duration:500}
        },
        "fadeOutToGray": {
            forwardTransition: this.fadeOutToGray,
            undo:"fadeInFromGray",
            animation: [{opacity:1}, {opacity:0}],
            timing: {easing: 'ease-in-out', duration:500}
        },
        "slideInLeft": {
                        forwardTransition: this.slideInLeft,
                        undo:"slideOutLeft",
                        animation: [{display:"block", transform: "translateX(-100%)"}, {display:"block",transform: "translateX(0%)"}],
                        
                        timing: {easing: 'ease-in-out', duration:500}
        },
        "slideOutLeft": {
            forwardTransition: this.slideOutLeft,
            undo:"slideInLeft",
            animation: [{display:"block", transform: "translateX(0%)"}, {display:"block",transform: "translateX(-100%)"}],
            timing: {easing: 'ease-in-out', duration:500}
        },
        "slideInRight": {
            forwardTransition: this.slideInRight,
            undo:"slideOutRight",
            animation: [{ display:"block", transform: "translateX(100%)"}, {display:"block",transform: "translateX(0%)"}],
           timing: {easing: 'ease-in-out', duration:500}
        },
        "slideOutRight": {
            forwardTransition: this.slideOutRight,
            undo:"slideInRight",
            animation: [{transform: "translateX(0%)"}, {transform: "translateX(100%)"}],
            timing:{easing: 'ease-in-out',duration:500}
        },
        "slideInTop": {
            forwardTransition: this.slideInTop,
            undo:"slideOutTop",
            animation: [{display:"block", transform: "translateY(-100%)"}, {display:"block",transform: "translateY(0%)"}],
            timing: {easing: 'ease-in-out', duration:500}
        },
        "slideOutTop": {
            forwardTransition: this.slideOutTop,
            undo:"slideInTop",
            animation:[{transform: "translateY(0%)"}, {transform: "translateY(-100%)"}],
            timing:{easing: 'ease-in-out', duration:500}
        },
        "slideInBottom": {
            forwardTransition: this.slideInBottom,
            undo:"slideOutBottom",
            animation: [{display:"block", transform: "translateY(100%)"}, {display:"block",transform: "translateY(0%)"}],
            timing: {easing: 'ease-in-out', duration:500}
        },
        "slideOutBottom": {
            forwardTransition: this.slideOutBottom,
            undo:"slideInBottom",
            animation: [{transform: "translateY(0%)"}, {transform: "translateY(100%)"}],
            timing: {easing: 'ease-in-out', duration:500}
        },
        "newspaperIn": {
            forwardTransition: this.newspaperIn,
            undo:"newspaperOut",
            animation: [{display:"block", transform: "rotate(0deg)  scale(0)"}, {display:"block", transform: "rotate(720deg) scale(1)"}],
           timing: {easing: 'ease-in-out', duration:500}
        },
        "newspaperOut":{
            forwardTransition: this.newspaperOut,
            undo:"newspaperIn",
            animation:[{display:"block", transform: "rotate(0deg)  scale(1)"}, {display:"block", transform: "rotate(-720deg) scale(0)"}],
           timing: {easing: 'ease-in-out', duration:500}
        },
        "zoomIn": {
            forwardTransition: this.zoomIn,
            undo:"zoomOut",
            animation: [{display:"block", transform: "scale(0)"}, {display:"block", transform: "scale(1)"}],
            timing: {easing: 'ease-in-out', duration:500}

        },
        "zoomOut":{
            forwardTransition: this.zoomOut,
            undo:"zoomIn",
            animation: [{display:"block", transform: "scale(1)"}, {display:"block", transform: "scale(0)"}],
            timing: {easing: 'ease-in-out', duration:500}
        },
        "hingeInLeft":{
            forwardTransition: this.hingeInLeft,
            undo:"hingeOutLeft",
            animation: [{display:"block", transform: "rotateY(-180deg)"}, {display:"block", transform: "rotateY(0deg)"}],
            timing: {easing: 'linear', duration:500}
        },
        "hingeOutLeft":{
            forwardTransition: this.hingeOutLeft,
            undo:"hingeInLeft",
            animation: [{display:"block", transform: "rotateY(0deg)"}, {display:"block", transform: "rotateY(-180deg)"}],
            timing: {easing: 'linear', duration:500}
        },
        "hingeInRight":{
            forwardTransition: this.hingeInRight,
            undo:"hingeOutRight",
            animation: [{display:"block", transform: "rotateY(180deg)"}, {display:"block", transform: "rotateY(0deg)"}],
            timing: {easing: 'ease-out', duration:500}
        },
        "hingeOutRight":{
            forwardTransition: this.hingeOutRight,
            undo:"hingeInRight",
            animation: [{display:"block", transform: "rotateY(0deg)"}, {display:"block", transform: "rotateY(180deg)"}],
            timing: {easing: 'ease-in', duration:500}
        },
        "hingeInTop":{
            forwardTransition: this.hingeInTop,
            undo:"hingeOutTop",
            animation: [{display:"block", transform: "rotateX(-180deg)"}, {display:"block", transform: "rotateY(0deg)"}],
            timing: {easing: 'ease-out', duration:500}
        },
        "hingeOutTop":{
            forwardTransition: this.hingeOutTop,
            undo:"hingeInTop",
            animation: [{display:"block", transform: "rotateY(0deg)"}, {display:"block", transform: "rotateX(-180deg)"}],
            timing: {easing: 'ease-in', duration:500}
        },
        "hingeInBottom":{
            forwardTransition: this.hingeInBottom,
            undo:"hingeOutBottom",
            animation: [{display:"block", transform: "rotateX(180deg)"}, {display:"block", transform: "rotateY(0deg)"}],
            timing: {easing: 'ease-out', duration:500}
        },
        "hingeOutBottom":{
            forwardTransition: this.hingeOutBottom,
            undo:"hingeInBottom",
            animation: [{display:"block", transform: "rotateY(0deg)"}, {display:"block", transform: "rotateX(180deg)"}],
            timing: {easing: 'ease-in', duration:500}
        },
        "flipInY":{
            forwardTransition: this.flipInY,
            undo:"flipOutY",
            animation: [{display:"block", transform: "rotateY(180deg)"}, {display:"block", transform: "rotateY(360deg)"}],
            secondanimation: [{display:"block", transform: "rotateY(0deg)"}, {display:"block", transform: "rotateY(180deg)"}],
            timing: {easing: 'ease-out', duration:500}
        },
        "flipOutY":{
            forwardTransition: this.flipOutY,
            undo:"flipInY",
            animation: [{display:"block", transform: "rotateY(0deg)"}, {display:"block", transform: "rotateY(180deg)"}],
            secondanimation: [{display:"block", transform: "rotateY(180deg)"}, {display:"block", transform: "rotateY(360deg)"}],
            timing: {easing: 'ease-in', duration:500}
        },
    }
    loadStack(self){
        const element_list = document.querySelectorAll(self.elementClass);
        self.elementStack = [...element_list];
        self.normalizeStack(self)
    }
    normalizeStack(self){
        for(let index = 0; index < self.elementStack.length; index++){
            let element = self.elementStack[index];
            element.style.zIndex = (index - self.elementStack.length) + 1;
        }
    }
    getZIndex(element){
        return window.getComputedStyle(element).getPropertyValue('z-index');
    }
    removeFromStack(self,element){
        const index = self.elementStack.indexOf(element);
        if (index > -1) {
            self.elementStack.splice(index, 1); 
        }
    }
    moveToTos(self,element){
        self.removeFromStack(self,element);
        self.elementStack.push(element);
        self.normalizeStack(self);
    }
    moveToBos(self,element){
        self.removeFromStack(self,element);
        self.elementStack.unshift(element);
        self.normalizeStack(self);
    }
    stackDump(self = this){
        console.log("stack dump:");
        for (const element of self.elementStack) {
            if(element.id !== ""){
                console.log("id: " + element.id + " display:" + element.style.display + " z-index: " + element.style.zIndex);
            }
            else {
                console.log("class: " + element.className + " display:" + element.style.display + " z-index: " + element.style.zIndex);
            }
        }
    }
    showElement(self,element){
        self.moveToTos(self,element);
        element.style.display = "block";
        self.normalizeStack(self);
    }
    checkElementExists(self,selectedElement, elementSelector){
        if(selectedElement === null){
            throw new Error("SicTransit: Element " + elementSelector + " not found in " + self.containerId);
        }
    }
    selectElement(self,elementSelector){
        let selectedElement;
        if(Number.isInteger(elementSelector)){
            // We're selecting the new item by index
            let elements = document.querySelectorAll(self.elementClass);
            selectedElement =  elements[elementSelector];
        }
        else {
            selectedElement = document.querySelector(elementSelector);
        }
        self.checkElementExists(self,selectedElement, elementSelector);
        return selectedElement;
    }
    performTransition(elementSelector,transitionName,delay,direction = 1){
        console.log("transitionName: " + transitionName)
        let overlays = document.querySelectorAll(".sic-transit-overlay-panel");
        overlays.forEach((overlay) => this.moveToBos(this,overlay));
        let transitionFunction;
        if(direction === 1){
            console.log("forward")
             transitionFunction = this.dispatchTable[transitionName]["forwardTransition"];
        }
        else if(direction ===  -1){
            console.log("reverse")
            this.performTransition(elementSelector,this.dispatchTable[transitionName]["undo"],delay,1);
            return;
        }
        if(transitionFunction === null){
            throw new Error("SicTransit: " + transitionName + " is not a recognized transition");
        }
        const animation = this.dispatchTable[transitionName]["animation"];
        const secondanimation = this.dispatchTable[transitionName]["secondanimation"];
        let timing = this.dispatchTable[transitionName]["timing"];
        timing.duration = delay;
        transitionFunction(this,elementSelector,animation,secondanimation,timing);
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
    slideInLeft(self,elementSelector,animation,secondanimation, timing){
        self.moveToTos(self,self.overlay);
        const selectedElement = self.selectElement(self,elementSelector);
        let finishHandler = function(){
            selectedElement.style.display= "block";
            self.moveToBos(self,self.overlay);
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
        }
        self.performAnimation(self,selectedElement,animation,-1,timing,finishHandler);
    }
    slideInRight(self,elementSelector,animation,secondanimation,timing){
        self.moveToTos(self,self.overlay);
        const selectedElement = self.selectElement(self,elementSelector);
        let finishHandler = function(){
            self.moveToBos(self,self.overlay)
            selectedElement.style.display= "block";
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
        }
        self.performAnimation(self,selectedElement,animation,-1,timing,finishHandler);
    }
    slideInTop(self,elementSelector,animation,secondanimation,timing){
        self.moveToTos(self,self.overlay)
        const selectedElement = self.selectElement(self,elementSelector);
        let finishHandler = function(){
            self.moveToBos(self.overlay)
            selectedElement.style.display= "block";
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
        }
        self.performAnimation(self,selectedElement,animation,-1,timing,finishHandler);
    }
    slideInBottom(self,elementSelector,animation,secondanimation,timing){
        self.moveToTos(self,self.overlay)
        const selectedElement = self.selectElement(self,elementSelector);
    
        let finishHandler = function(){
            self.moveToBos(self.overlay)
            selectedElement.style.display= "block";
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
        }
        self.performAnimation(self,selectedElement,animation,-1,timing,finishHandler);
    }
  
    fadeInFromBlack(self,elementSelector, animation,secondanimation,timing){
        self.moveToTos(self,self.blackpanel);
        const selectedElement = self.selectElement(self,elementSelector);
        selectedElement.style.opacity = 0;
        self.moveToTos(self,selectedElement);
        let finishHandler = function(){
            self.moveToBos(self,self.blackpanel);
            selectedElement.style.display = "block";
            selectedElement.style.opacity = 1;
        }
        self.performAnimation(self,selectedElement,animation,1,timing,finishHandler);
    }
    fadeOutToBlack(self,elementSelector,animation,secondanimation,timing){
        self.moveToTos(self,self.blackpanel);
        const selectedElement = self.selectElement(self,elementSelector);
        self.moveToTos(self,selectedElement);
        let finishHandler = function(){
            self.moveToBos(self,selectedElement);
            selectedElement.style.display = "none";
            selectedElement.style.opacity = 1;
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
        }
        self.performAnimation(self,selectedElement,animation,1,timing,finishHandler);
    }
    fadeOutToWhite(self,elementSelector,animation,secondanimation,timing){
        self.moveToTos(self,self.whitepanel);
        const selectedElement = self.selectElement(self,elementSelector);
        self.moveToTos(self,selectedElement);
        let finishHandler = function(){
            self.moveToBos(self,selectedElement);
            selectedElement.style.display = "none";
            selectedElement.style.opacity = 1;
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
            
        }
        self.performAnimation(self,selectedElement,animation,-1,timing,finishHandler);
    }
    hingeInRight(self,elementSelector,animation,secondanimation,timing){
        self.moveToTos(self,self.overlay);
        const selectedElement = self.selectElement(self,elementSelector);
        selectedElement.style.transformOrigin = "right";
        self.container.style.perspective =  "1000px";
        self.container.style.perspectiveOrigin = "right";
        let finishHandler = function(){
            self.moveToBos(self,self.overlay);
            selectedElement.style.display= "block";
            selectedElement.style.transformOrigin = "";
            self.container.style.perspective =  "";
            self.container.style.scale =  "";
            self.container.style.perspectiveOrigin = "";
        }
        self.performAnimation(self,selectedElement,animation,1,timing,finishHandler);
    }
    hingeOutRight(self,elementSelector,animation,secondanimation,timing){
        self.moveToTos(self,self.overlay);
        const selectedElement = self.selectElement(self,elementSelector);
        selectedElement.style.transformOrigin = "right";
        self.container.style.perspective =  "1000px";
        self.container.style.perspectiveOrigin = "right";
        let finishHandler = function(){
            self.moveToBos(self,self.overlay);
            self.moveToBos(self,selectedElement);
            selectedElement.style.display= "none";
            selectedElement.style.transformOrigin = "";
            self.container.style.perspective =  "";
            self.container.style.scale =  "";
            self.container.style.perspectiveOrigin = "";
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
        }
        self.performAnimation(self,selectedElement,animation,-1,timing,finishHandler);
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
        }
        self.performAnimation(self,selectedElement,animation,-1,timing,finishHandler);
    }
    performFlip(self,selectedElement,replaceElement, firstanimation,secondanimation, timing,onfinish){
        self.moveToTos(self,self.flippanel);
        const animation = selectedElement.animate(firstanimation,timing);
        animation.onfinish = onfinish; 
        secondanimation = replaceElement.animate(secondanimation,timing);
    }
    flipInY(self,elementSelector,firstanimation,secondanimation,timing){
        console.log("in flipInY")
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
        console.log("flippanel");
        console.log(self.flippanel.children);
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
        }
        self.performFlip(self,selectedElement,tosItem,firstanimation,secondanimation,timing,finishHandler);
    }
    flipOutY(self,elementSelector,firstanimation,secondanimation,timing){
        console.log("in flipOutY")
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
        console.log("flippanel");
        console.log(self.flippanel.children);
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
        }
        self.performFlip(self,topElement,secondElement,firstanimation,secondanimation,timing,finishHandler);
    }
  }
