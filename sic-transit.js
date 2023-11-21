/*  sic-transit.js Copyright 2023 by Anthony W. Hursh
 *  MIT license
 */

class SicTransit {
    constructor(containerId, elementClass) {
      this.containerId = containerId;
      this.container = document.querySelector(containerId);
      this.elementClass = elementClass;
      this.loadStack();
      let overlay = document.createElement('div');
      this.overlay = overlay;
      overlay.className = 'sic-transit-overlay';
      this.container.appendChild(overlay);
      this.elementStack.unshift(overlay);
      this.normalizeStack();
      this.showElement(this.elementStack[this.elementStack.length - 1]);     
    }

    dispatchTable =  {
        "fadeIn": {
            forwardTransition: this.fadeIn,
            animation: [{ display:"block", opacity: 0}, {display:"block",opacity:1}],
            timing: {easing: 'ease-in-out', duration:500}
        },
        "fadeOut": {
            forwardTransition: this.fadeOut,
            animation: [{opacity:1}, {opacity:0}],
            timing: {easing: 'ease-in-out', duration:500}
        },
        "slideInLeft": {
                        forwardTransition: this.slideInLeft,
                        animation: [{ display:"block", transform: "translateX(100%)"}, {display:"block",transform: "translateX(0%)"}],
                        timing: {easing: 'ease-in-out', duration:500}
        },
        "slideOutLeft": {
            forwardTransition: this.slideOutLeft,
            animation: [{transform: "translateX(0%)"}, {transform: "translateX(100%)"}],
            timing: {easing: 'ease-in-out', duration:500}
        },
        "slideInRight": {
            forwardTransition: this.slideInRight,
            animation: [{display:"block", transform: "translateX(-100%)"}, {display:"block",transform: "translateX(0%)"}],
           timing: {easing: 'ease-in-out', duration:500}
        },
        "slideOutRight": {
            forwardTransition: this.slideOutRight,
            animation: [{transform: "translateX(0%)"}, {transform: "translateX(-100%)"}],
            timing:{easing: 'ease-in-out',duration:500}
        },
        "slideInTop": {
            forwardTransition: this.slideInTop,
            animation: [{display:"block", transform: "translateY(-100%)"}, {display:"block",transform: "translateY(0%)"}],
            timing: {easing: 'ease-in-out', duration:500}
        },
        "slideOutTop": {
            forwardTransition: this.slideOutTop,
            animation:[{transform: "translateY(0%)"}, {transform: "translateY(-100%)"}],
            timing:{easing: 'ease-in-out', duration:500}
        },
        "slideInBottom": {
            forwardTransition: this.slideInBottom,
            animation: [{display:"block", transform: "translateY(100%)"}, {display:"block",transform: "translateY(0%)"}],
            timing: {easing: 'ease-in-out', duration:500}
        },
        "slideOutBottom": {
            forwardTransition: this.slideOutBottom,
            animation: [{transform: "translateY(0%)"}, {transform: "translateY(100%)"}],
            timing: {easing: 'ease-in-out', duration:500}
        },
        "newspaperIn": {
            forwardTransition: this.newspaperIn,
            animation: [{display:"block", transform: "rotate(0deg)  scale(0)"}, {display:"block", transform: "rotate(720deg) scale(1)"}],
           timing: {easing: 'ease-in-out', duration:500}
        },
        "newspaperOut":{
            forwardTransition: this.newspaperOut,
            animation:[{display:"block", transform: "rotate(0deg)  scale(1)"}, {display:"block", transform: "rotate(-720deg) scale(0)"}],
           timing: {easing: 'ease-in-out', duration:500}
        },
        "zoomIn": {
            forwardTransition: this.zoomIn,
            animation: [{display:"block", transform: "scale(0)"}, {display:"block", transform: "scale(1)"}],
            timing: {easing: 'ease-in-out', duration:500}

        },
        "zoomOut":{
            forwardTransition: this.zoomOut,
            animation: [{display:"block", transform: "scale(1)"}, {display:"block", transform: "scale(0)"}],
            timing: {easing: 'ease-in-out', duration:500}
        }


    }
    loadStack(){
        const element_list = document.querySelectorAll(this.elementClass);
        this.elementStack = [...element_list];
        this.normalizeStack()
    }
    normalizeStack(){
        for(let index = 0; index < this.elementStack.length; index++){
            let element = this.elementStack[index];
            element.style.zIndex = index - this.elementStack.length;
        }
    }
    getZIndex(element){
        return window.getComputedStyle(element).getPropertyValue('z-index');
    }
    removeFromStack(element){
        const index = this.elementStack.indexOf(element);
        if (index > -1) {
            this.elementStack.splice(index, 1); 
        }
    }
    moveToTos(element){
        this.removeFromStack(element);
        this.elementStack.push(element);
        this.normalizeStack();
    }
    moveToBos(element){
        this.removeFromStack(element);
        this.elementStack.unshift(element);
        this.normalizeStack();
    }
    showElement(element){
        this.moveToTos(element);
        element.style.display = "block";
        this.normalizeStack();
    }
    checkElementExists(selectedElement, elementSelector){
        if(selectedElement === null){
            throw new Error("SicTransit: Element " + elementSelector + " not found in " + this.containerId);
        }
    }
    selectElement(elementSelector){
        let selectedElement;
        if(Number.isInteger(elementSelector)){
            // We're selecting the new item by index
            let elements = document.querySelectorAll(this.elementClass);
            selectedElement =  elements[elementSelector];
        }
        else {
            selectedElement = document.querySelector(elementSelector);
        }
        this.checkElementExists(selectedElement, elementSelector);
        return selectedElement;
    }
    performTransition(elementSelector,transitionName,delay){
        const transitionFunction = this.dispatchTable[transitionName]["forwardTransition"];
        if(transitionFunction === null){
            throw new Error("SicTransit: " + transitionName + " is not a recognized transition");
        }
        const animation = this.dispatchTable[transitionName]["animation"];
        let timing = this.dispatchTable[transitionName]["timing"];
        timing.duration = delay;
        transitionFunction(this,elementSelector,animation,timing);
    }
    performAnimation(selectedElement,anim,direction,timing,onfinish){
        this.moveToTos(selectedElement);
        const animation = selectedElement.animate(anim,timing);
        if(direction > 0){
            this.overlay.style.opacity = 0.0;
            this.overlay.animate({opacity:"0",opacity:"0.5"},timing);
        }
        else{
            this.overlay.style.opacity = 0.5;
            this.overlay.animate({opacity:"0.5",opacity:"0"},timing);
        }
        animation.onfinish = onfinish;
    }
    slideInLeft(self,elementSelector,animation,timing){
        self.moveToTos(self.overlay);
        const selectedElement = self.selectElement(elementSelector);
        let finishHandler = function(){
            selectedElement.style.display= "block";
            self.moveToBos(self.overlay);
        }
        self.performAnimation(selectedElement,animation,1,timing,finishHandler);
    }
    slideOutLeft(self,elementSelector,animation,timing){
        self.moveToTos(self.overlay);
        const selectedElement = self.selectElement(elementSelector);
        let finishHandler = function(){
            self.moveToBos(selectedElement);
            self.moveToBos(self.overlay);
            selectedElement.style.transform = "translateX(0%)";
        }
        self.performAnimation(selectedElement,animation,-1,timing,finishHandler);
    }
    slideInRight(self,elementSelector,animation,timing){
        self.moveToTos(self.overlay);
        const selectedElement = self.selectElement(elementSelector);
        let finishHandler = function(){
            self.moveToBos(self.overlay)
            selectedElement.style.display= "block";
        }
        self.performAnimation(selectedElement,animation,1,timing,finishHandler);
    }
    slideOutRight(self,elementSelector,animation,timing){
        self.moveToTos(self.overlay);
        const selectedElement = self.selectElement(elementSelector);
        let finishHandler = function(){
            self.moveToBos(selectedElement);
            self.moveToBos(self.overlay)
            selectedElement.style.transform = "translateX(0%)";
        }
        self.performAnimation(selectedElement,animation,-1,timing,finishHandler);
    }
    slideInTop(self,elementSelector,animation,timing){
        self.moveToTos(self.overlay)
        const selectedElement = self.selectElement(elementSelector);
        let finishHandler = function(){
            self.moveToBos(self.overlay)
            selectedElement.style.display= "block";
        }
        self.performAnimation(selectedElement,animation,1,timing,finishHandler);
    }
    slideOutTop(self,elementSelector,animation,timing){
        self.moveToTos(self.overlay)
        const selectedElement = self.selectElement(elementSelector);
        let finishHandler = function(){
            self.moveToBos(self.overlay)
            self.moveToBos(selectedElement);
            selectedElement.style.transform = "translateY(0%)";
        }
        self.performAnimation(selectedElement,animation,-1,timing,finishHandler);
    }
    slideInBottom(self,elementSelector,animation,timing){
        self.moveToTos(self.overlay)
        const selectedElement = self.selectElement(elementSelector);
    
        let finishHandler = function(){
            self.moveToBos(self.overlay)
            selectedElement.style.display= "block";
        }
        self.performAnimation(selectedElement,animation, 1,timing,finishHandler);
    }
    slideOutBottom(self,elementSelector,animation,timing){
        self.moveToTos(self.overlay);
        const selectedElement = self.selectElement(elementSelector);
       
        let finishHandler = function(){
            self.moveToBos(self.overlay)
            self.moveToBos(selectedElement);
            selectedElement.style.transform = "translateY(0%)";
        }
        self.performAnimation(selectedElement,animation,-1,timing,finishHandler);
    }
    newspaperIn(self,elementSelector, animation,timing){
        self.moveToTos(self.overlay);
        const selectedElement = self.selectElement(elementSelector);  
        let finishHandler = function(){
            self.moveToBos(self.overlay);
            selectedElement.style.display = "block";
            selectedElement.style.transform = "rotate(0deg) scale(1)";
        }
        self.performAnimation(selectedElement,animation,1,timing,finishHandler);
    }
    newspaperOut(self,elementSelector,animation,timing){
        self.moveToTos(self.overlay);
        const selectedElement = self.selectElement(elementSelector);
      
        let finishHandler = function(){
            self.moveToBos(self.overlay);
            self.moveToBos(selectedElement);
            selectedElement.style.display = "none";
            selectedElement.style.transform = "rotate(0deg) scale(1)";
        }
        self.performAnimation(selectedElement,animation,-1,timing,finishHandler);
    }
    zoomIn(self,elementSelector, animation,timing){
        self.moveToTos(self.overlay);
        const selectedElement = self.selectElement(elementSelector);
        let finishHandler = function(){
            self.moveToBos(self.overlay);
            selectedElement.style.display = "block";
            selectedElement.style.transform = "scale(1)";
        }
        self.performAnimation(selectedElement,animation,1,timing,finishHandler);
    }
    zoomOut(self,elementSelector,animation,timing){
        self.moveToTos(self.overlay);
        const selectedElement = self.selectElement(elementSelector);
      
        let finishHandler = function(){
            self.moveToBos(self.overlay);
            self.moveToBos(selectedElement);
            selectedElement.style.display = "none";
            selectedElement.style.transform = "scale(1)";
        }
        self.performAnimation(selectedElement,animation,-1,timing,finishHandler);
    }
    fadeIn(self,elementSelector, animation,timing){
        self.moveToTos(self.overlay);
        const selectedElement = self.selectElement(elementSelector);
        let finishHandler = function(){
            self.moveToBos(self.overlay);
            selectedElement.style.display = "block";
            selectedElement.style.opacity = 1;
        }
        self.performAnimation(selectedElement,animation,1,timing,finishHandler);
    }
    fadeOut(self,elementSelector,animation,timing){
        self.moveToTos(self.overlay);
        const selectedElement = self.selectElement(elementSelector);
        let finishHandler = function(){
            self.moveToBos(self.overlay);
            self.moveToBos(selectedElement);
            selectedElement.style.display = "none";
            selectedElement.style.opacity = 1;
        }
        self.performAnimation(selectedElement,animation,-1,timing,finishHandler);
    }
  }
