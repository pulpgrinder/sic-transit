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
      this.loadStack({self:this});
      this.callback = null;
      this.performCallback = null;
      let blackpanel = document.createElement('div');
      this.blackpanel = blackpanel;
      blackpanel.className = elementClass + ' sicpanel sic-transit-black-panel';
      this.container.appendChild(blackpanel);
      this.elementStack.unshift(blackpanel);
      let graypanel = document.createElement('div');
      this.graypanel = graypanel;
      graypanel.className = elementClass + ' sicpanel sic-transit-gray-panel';
      this.container.appendChild(graypanel);
      this.elementStack.unshift(graypanel);
      let whitepanel = document.createElement('div');
      this.whitepanel = whitepanel;
      whitepanel.className = elementClass +  ' sicpanel sic-transit-white-panel';
      this.container.appendChild(whitepanel);
      this.elementStack.unshift(whitepanel);
      let flippanel = document.createElement('div');
      this.flippanel = flippanel;
      flippanel.className = elementClass +  ' sicpanel sic-transit-flip-panel';
      this.container.appendChild(flippanel);
      this.elementStack.unshift(flippanel);
      this.showElement({self:this,selectedElement:this.elementStack[this.elementStack.length - 1]});
    }
    checkElementExists(args){
        if(args.selectedElement === null){
            throw new Error("SicTransit: Element " + args.elementSelector + " not found in " + args.self.containerId);
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
            forwardTransition: this.flipOutX,
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
        "menuInBottom": {
            forwardTransition: this.menuInBottom,
            undo:"menuOutBottom",
            animation: [{display:"block", transform: "translateY(100%)"}, {display:"block",transform: "translateY(50%)"}],
            boxShadow: "-10px -10px 30px rgba(0,0,0,0.5)",
            timing: {easing: 'ease-in-out', duration:500}
        },
        "menuOutBottom": {
            forwardTransition: this.menuOutBottom,
            undo:"menuInBottom",
            animation: [{transform: "translateY(50%)"}, {transform: "translateY(100%)"}],
            boxShadow: "-10px -10px 20px rgba(0,0,0,0.5)",
            timing: {easing: 'ease-in-out', duration:500}
        },
        "menuInLeft": {
                        forwardTransition: this.menuInLeft,
                        undo:"menuOutLeft",
                        animation: [{display:"block", transform: "translateX(-100%)"}, {display:"block",transform: "translateX(-50%)"}],
                        boxShadow:  "10px 20px 20px 30px rgba(0,0,0,0.5)",
                        timing: {easing: 'ease-in-out', duration:500}
        },
        "menuOutLeft": {
            forwardTransition: this.menuOutLeft,
            undo:"menuInLeft",
            animation: [{display:"block", transform: "translateX(-50%)"}, {display:"block",transform: "translateX(-100%)"}],
            boxShadow: "10px 20px 20px 30px rgba(0,0,0,0.5)",
            timing: {easing: 'ease-in-out', duration:500}
        },
        "menuInRight": {
            forwardTransition: this.menuInRight,
            undo:"slideOutRight",
            animation: [{ display:"block", transform: "translateX(100%)"}, {display:"block",transform: "translateX(50%)"}],
            boxShadow: "-10px -10px 20px 30px rgba(0,0,0,0.5)",
           timing: {easing: 'ease-in-out', duration:500}
        },
        "menuOutRight": {
            forwardTransition: this.menuOutRight,
            undo:"menuInRight",
            animation: [{transform: "translateX(50%)"}, {transform: "translateX(100%)"}],
            boxShadow: "-10px -10px 20px 30px rgba(0,0,0,0.5)",
            timing:{easing: 'ease-in-out',duration:500}
        },
        "menuInTop": {
            forwardTransition: this.menuInTop,
            undo:"menuOutTop",
            animation: [{display:"block", transform: "translateY(-100%)"}, {display:"block",transform: "translateY(-50%)"}],
            boxShadow: "10px 10px 20px rgba(0,0,0,0.5)",
            timing: {easing: 'ease-in-out', duration:500}
        },
        "menuOutTop": {
            forwardTransition: this.menuOutTop,
            undo:"menuInTop",
            animation:[{transform: "translateY(-50%)"}, {transform: "translateY(-100%)"}],
            boxShadow: "10px 10px 20px rgba(0,0,0,0.5)",
            timing:{easing: 'ease-in-out', duration:500}
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
        "nullTransition":{
            forwardTransition: this.nullTransition,
            undo:"nullTransition",
            animation: [],
            boxShadow: "",
            timing: {}
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
    getContainerId(){
        return this.containerId;
    }
    getElementClass(){
        return this.elementClass;
    }
    getTransitionList(){
        let transitions = [];
        for (let key in this.dispatchTable) {
            if (this.dispatchTable.hasOwnProperty(key)) {
              transitions.push(key);
            }
         }
         return transitions;
    }
    getPanelList(){
        let panelList = [];
        let elements = document.querySelectorAll(this.containerId + " > " + this.elementClass);
        for(let i = 0; i < elements.length; i++){
            if(elements[i].id !== undefined){
                panelList.push(elements[i].id);
            }
        }
        return panelList;
    }
    getBos(args){
        return args.self.elementStack[0];
    }
    getTos(args){
        return args.self.elementStack[args.self.elementStack.length - 1];
    }
    getZIndex(element){
        return window.getComputedStyle(element).getPropertyValue('z-index');
    }
    loadStack(args){
        let self = args.self;
        const element_list = document.querySelectorAll(self.elementClass);
        self.elementStack = [...element_list];
        self.normalizeStack(args);
    }
    moveToBos(args,element){
        let self = args.self;
        self.removeFromStack(args,element);
        self.elementStack.unshift(element);
        self.normalizeStack(args);
    }
    moveToTos(args,element){
        let self = args.self;
        self.removeFromStack(args,element);
        self.elementStack.push(element);
        self.normalizeStack(args);
    }
   
    normalizeStack(args){
        let self = args.self;
        let elementStack = self.elementStack;
        for(let index = 0; index < elementStack.length; index++){
            let element = elementStack[index];
            element.style.zIndex = (index - elementStack.length) + 1;
        }
    }
    performAnimation(args){
        let self = args.self;
        self.moveToTos(args,args.selectedElement);
        const animation = args.selectedElement.animate(args.firstanimation,args.timing);
        animation.onfinish = args.finishHandler; 
    }
    performFlip(args){
        let self = args.self;
        self.flippanel.replaceChildren([]);
        self.removeFromStack(args,args.selectedElement);
        self.flippanel.appendChild(args.selectedElement);
        let tosItem = self.elementStack.pop();
        self.flippanel.appendChild(tosItem);
        self.moveToTos(args,self.flippanel);
        const animation = args.selectedElement.animate(args.firstanimation,args.timing);
        animation.onfinish = function(){
            args.selectedElement.style.transform = "";
            tosItem.style.transform = "";
            self.flippanel.replaceChildren([]);
            self.moveToBos(args,self.flippanel);
            if(args.direction === 1){
                self.elementStack.push(tosItem);
                self.elementStack.push(args.selectedElement);
                self.normalizeStack(args);
            }
            else{
                self.elementStack.push(args.selectedElement);
                self.elementStack.push(tosItem);
                self.normalizeStack(args);
            }
            self.container.appendChild(tosItem);
            self.container.appendChild(args.selectedElement);
            self.normalizeStack(args);
            if(self.performCallback !== null){
                self.performCallback();
            }
        }
        self.moveToTos(args,self.flippanel);
        self.flippanel.style.display = "block";
        tosItem.animate(args.secondanimation, args.timing);
    }
    loadDefaults(args){
        let self = args.self;
        let defaultArgs = {
            transitionName: "nullTransition",
            direction: "forward",
            duration: 1000,
            elementSelector: "",
            firstanimation:() => {},
            secondanimation: () => {},
            timing: {easing: "linear", duration:1000},
            transitionFunction: self.dispatchTable["nullTransition"].forwardTransition,
            finishHandler:  () => {},
            fadePanel: self.blackpanel,
            finalDisplayStyle: 'none',
            stackRotation:0
        }
        for (let key in defaultArgs) {
            if (defaultArgs.hasOwnProperty(key)) {
                if(args[key] === undefined){
                    args[key] = defaultArgs[key];
                }
            }
          }
        args =  self.selectElement(args);
        return args;
    }

    performTransition(args){
        if(args.self === undefined){
            args.self = this;
        }
        let self = args.self;
        args = self.loadDefaults(args);
        if(self.dispatchTable[args.transitionName] === undefined){
            throw new Error("SicTransit: " + args.transitionName + " is not a recognized transition");
        }
        if((args.direction === "forward") || (args.direction > 0)){
             args.transitionFunction = self.dispatchTable[args.transitionName]["forwardTransition"];
        }
        else if((args.direction === "reverse") || (args.direction < 0)){
            args.transitionName = self.dispatchTable[args.transitionName]["undo"];
            args.direction = "forward";
            self.performTransition(args);
            return;
        }
        else {
            throw new Error("sicTransit: " + args.direction + " is not defined as a valid direction.")
        }  
        args.firstanimation = self.dispatchTable[args.transitionName]["animation"];
        args.secondanimation = self.dispatchTable[args.transitionName]["secondanimation"];
        args.timing = self.dispatchTable[args.transitionName]["timing"];
        args.timing.duration = args.duration;
        args.transitionFunction(args);
    }
    removeFromStack(args,element){
        let elementStack = args.self.elementStack;
        for(let i = 0; i < elementStack.length; i++){
            if(elementStack[i] === element){
                elementStack.splice(i,1);
                return element;
            }
        }
        throw new Error("removeFromStack: element not found.");
    }
    selectElement(args){
        let self = args.self;
        if(args.elementSelector === ""){
            args.selectedElement = self.getBos(args);
        }
        else if(Number.isInteger(args.elementSelector)){
            // We're selecting the new item by stack position
            if(args.elementSelector >= 0){
                // Counting up from bottom of stack.
                args.selectedElement =  self.elementStack[args.elementSelector];
            }
            else{
                // Counting down from top of stack.
                args.selectedElement = self.elementStack[self.elementStack.length - (args.elementSelector + 1)];
            }
        }
        else {
            args.selectedElement = document.querySelector(args.elementSelector);
        }
        // Throws an error if the element does not exist.
        self.checkElementExists(args);
        return args;
    }
    setCallback(func){
        this.callback = func;
    }
    showElement(args){
        args.selectedElement.style.display = "block";
        args.selectedElement.style.opacity = 1.0;
        args.self.moveToTos(args,args.selectedElement);
    }
    stackDump(args = {self:this}){
        console.log("stackDump:");
        for (const element of args.self.elementStack) {
            if(element.id !== ""){
                console.log("id: " + element.id + " display:" + element.style.display + " z-index: " + element.style.zIndex);
            }
            else {
                console.log("class: " + element.className + " display:" + element.style.display + " z-index: " + element.style.zIndex);
            }
        } 
    }

// Transitions
    cutIn(args){
        let self = args.self;
        self.showElement(args);
        if(self.performCallback !== null){
            self.performCallback();
        }
    }
    cutOut(args){
        let self = args.self;
        self.moveToBos(args,args.selectedElement);
        if(self.performCallback !== null){
            self.performCallback();
        }
    }
    dissolveIn(args){
        let self = args.self;
        self.synchro = 0;
        self.moveToBos(args,args.selectedElement);
        args.selectedElement.style.display = "none";
        let topElement = self.elementStack.pop();
        self.elementStack.push(topElement);
        self.moveToTos(args,self.blackpanel);
        self.moveToTos(args,topElement);
        self.normalizeStack(args);
        args.selectedElement.style.opacity = 0;
        self.moveToTos(args,args.selectedElement);
        args.finishHandler = function(){
            self.synchro++;
            if(self.synchro < 2){
                // Second animation is still running.
                return;
            }
            args.selectedElement.style.opacity = 1;
            args.selectedElement.style.display = "block";
            topElement.style.opacity = 1;
            self.normalizeStack(args);
            self.synchro = 0;
            if(self.performCallback !== null){
                self.performCallback();
            }
        }
        const animation = args.selectedElement.animate(args.firstanimation,args.timing);
        animation.onfinish = args.finishHandler;
        const topAnimation = topElement.animate(args.secondanimation,args.timing);
        topAnimation.onfinish = args.finishHandler;
    }
    dissolveOut(args){
        let self = args.self;
        self.synchro = 0;
        self.moveToTos(args,args.selectedElement);
        let topElement = self.elementStack[self.elementStack.length - 2];
        self.normalizeStack(args);
        args.selectedElement.style.opacity = 1;
        topElement.style.opacity = 0;
        args.finishHandler = function(){
            self.synchro++;
            if(self.synchro < 2){
                 // Second animation is still running.
                return;
            }
            self.moveToBos(args,args.selectedElement);
            topElement.style.opacity = 1;
            args.selectedElement.style.opacity = 1;
            self.normalizeStack(args);
            self.synchro = 0;
            if(self.performCallback !== null){
                self.performCallback();
            }
        }
        const animation = args.selectedElement.animate(args.firstanimation,args.timing);
        animation.onfinish = args.finishHandler; 
        const topanimation = topElement.animate(args.secondanimation,args.timing);
        topanimation.onfinish = args.finishHandler;
    }
    fade(args){
        let self = args.self;
        if(args.direction === 1){
            self.moveToTos(args,args.fadePanel);
            args.selectedElement.style.opacity = 0;
            args.selectedElement.style.display = "block";
            self.moveToTos(args,args.selectedElement);
            args.finishHandler = function(){
                self.moveToBos(args,args.fadePanel);
                args.selectedElement.style.display = "block";
                args.selectedElement.style.opacity = 1;
                if(self.performCallback !== null){
                    self.performCallback();
                }
            }
        }
        else{
            self.moveToTos(args,args.fadePanel);
            args.selectedElement.style.opacity = 1;
            args.selectedElement.style.display = "block";
            self.moveToTos(args,args.selectedElement);
            args.finishHandler = function(){
                self.moveToBos(args,args.selectedElement);
                args.selectedElement.style.opacity = 1;
                if(self.performCallback !== null){
                    self.performCallback();
                }
            }
        }
        self.performAnimation(args);
    }
    fadeInFromBlack(args){
        let self = args.self;
        args.fadePanel = self.blackpanel;
        args.direction = 1;
        self.fade(args);
    }
    fadeOutToBlack(args){
        let self = args.self;
        args.fadePanel = self.blackpanel;
        args.direction = -1;
        self.fade(args);
    }
    fadeInFromGray(args){
        let self = args.self;
        args.fadePanel = self.graypanel;
        args.direction = 1;
        self.fade(args);
    }
    fadeOutToGray(args){
        let self = args.self;
        args.fadePanel = self.graypanel;
        args.direction = -1;
        self.fade(args);
    }
    fadeInFromWhite(args){
        let self = args.self;
        args.fadePanel = self.whitepanel;
        args.direction = 1;
        self.fade(args);
    }
    fadeOutToWhite(args){
        let self = args.self;
        args.fadePanel = self.whitepanel;
        args.direction = -1;
        self.fade(args);
    }
    flipInY(args){
        args.direction = 1;
        let self = args.self;
        self.moveToBos(args,args.selectedElement);
        args.selectedElement.style.display = "block";
        args.selectedElement.style.transform = "rotateY(180deg)";
        self.performFlip(args);
    }
    flipOutY(args){
        args.direction = -1;
        let self = args.self;
        self.moveToTos(args,args.selectedElement);
        args.selectedElement.style.display = "block";
        args.selectedElement.style.transform = "rotateX(0deg)";
        self.elementStack[self.elementStack.length - 2].style.transform = "rotateX(180deg)";
        self.performFlip(args);
    }
    flipInX(args){
        args.direction = 1;
        let self = args.self;
        self.moveToBos(args,args.selectedElement);
        args.selectedElement.style.display = "block";
        args.selectedElement.style.transform = "rotateX(180deg)";
        self.performFlip(args);
    }
    flipOutX(args){
        args.direction = -1;
        let self = args.self;
        self.moveToTos(args,args.selectedElement);
        args.selectedElement.style.display = "block";
        args.selectedElement.style.transform = "rotateX(0deg)";
        self.elementStack[self.elementStack.length - 2].style.transform = "rotateX(180deg)";
        self.performFlip(args);
    }
    hinge(args){
        let self = args.self;
        self.container.style.perspective =  "1000px";
        self.container.style.perspectiveOrigin = "left";
        args.finishHandler = function(){
            args.selectedElement.style.display= args.finalDisplayStyle;
            args.selectedElement.style.transformOrigin = "";
            self.container.style.perspective =  "";
            self.container.style.perspectiveOrigin = "";
            if(self.performCallback !== null){
                self.performCallback();
            }
        }
        self.performAnimation(args);
    }
    hingeInBottom(args){
        let self = args.self;
        args.selectedElement.style.transformOrigin = "bottom";
        args.finalDisplayStyle = "block";
        self.hinge(args);
    }
    hingeOutBottom(args){
        let self = args.self;
        args.selectedElement.style.transformOrigin = "bottom";
        args.finalDisplayStyle = "none";
        self.hinge(args);
    }
    hingeInLeft(args){
        let self = args.self;
        args.selectedElement.style.transformOrigin = "left";
        args.finalDisplayStyle = "block";
        self.hinge(args);
    }
    hingeOutLeft(args){
        let self = args.self;
        args.selectedElement.style.transformOrigin = "left";
        args.finalDisplayStyle = "none";
        self.hinge(args);
    }
    hingeInRight(args){
        let self = args.self;
        args.selectedElement.style.transformOrigin = "right";
        args.finalDisplayStyle = "block";
        self.hinge(args);
    }
    hingeOutRight(args){
        let self = args.self;
        args.selectedElement.style.transformOrigin = "right";
        args.finalDisplayStyle = "none";
        self.hinge(args);
    }
    hingeInTop(args){
        let self = args.self;
        args.selectedElement.style.transformOrigin = "top";
        args.finalDisplayStyle = "block";
        self.hinge(args);
    }
    hingeOutTop(args){
        let self = args.self;
        args.selectedElement.style.transformOrigin = "top";
        args.finalDisplayStyle = "none";
        self.hinge(args);
    }
    menuInBottom(args){
        let self = args.self;
        args.selectedElement.transform = "translateY(100%)";
        args.finishHandler = function(){
            self.moveToTos(args,args.selectedElement);
            args.selectedElement.style.display = "block";
            args.selectedElement.style.transform = "translateY(50%)";
            if(self.performCallback !== null){
                self.performCallback();
            }
        }
        self.performAnimation(args);
    }
    menuOutBottom(args){
        let self = args.self;
        args.finishHandler = function(){
            self.moveToBos(args,args.selectedElement);
            args.selectedElement.style.transform = "";
            if(self.performCallback !== null){
                self.performCallback();
            }
        }
        self.performAnimation(args);
    }
    menuInLeft(args){
        let self = args.self;
        args.selectedElement.transform = "translateX(-100%)";
        self.moveToTos(args,args.selectedElement);
        args.finishHandler = function(){
            args.selectedElement.style.display= "block";
            args.selectedElement.style.transform = "translateX(-50%)";
            if(self.performCallback !== null){
                self.performCallback();
            }
        }
        self.performAnimation(args);
    }
    menuOutLeft(args){
        let self = args.self;
        args.finishHandler = function(){
            self.moveToBos(args,args.selectedElement);
            args.selectedElement.style.transform = "";
            if(self.performCallback !== null){
                self.performCallback();
            }
        }
        self.performAnimation(args);
    }
    menuInRight(args){
        let self = args.self;
        args.selectedElement.transform = "translateX(100%)";
        args.finishHandler = function(){
            args.selectedElement.style.display= "block";
            args.selectedElement.style.transform = "translateX(50%)";
            if(self.performCallback !== null){
                self.performCallback();
            }
        }
        self.performAnimation(args);
    }
    menuOutRight(args){
        let self = args.self;
        args.finishHandler = function(){
            self.moveToBos(args,args.selectedElement);
            args.selectedElement.style.transform = "";
            if(self.performCallback !== null){
                self.performCallback();
            }
        }
        self.performAnimation(args);
    }
    menuInTop(args){
        let self = args.self;
        args.selectedElement.transform = "translateY(-100%)";
        args.finishHandler = function(){
            args.selectedElement.style.transform = "translateY(-50%)"
            args.selectedElement.style.display= "block";
            if(self.performCallback !== null){
                self.performCallback();
            }
        }
        self.performAnimation(args);
    }
    menuOutTop(args){
        let self = args.self;
        args.finishHandler = function(){
            self.moveToBos(args,args.selectedElement);
            args.selectedElement.style.transform = "";
            if(self.performCallback !== null){
                self.performCallback();
            }
        }
        self.performAnimation(args);
    }
    newspaperIn(args){
        let self = args.self;
        args.finishHandler = function(){
            args.selectedElement.style.display = "block";
            args.selectedElement.style.transform = "rotate(0deg) scale(1)";
            if(self.performCallback !== null){
                self.performCallback();
            }
        }
        self.performAnimation(args);
    }
    newspaperOut(args){
        let self = args.self;
        args.finishHandler = function(){
            self.moveToBos(args,args.selectedElement);
            args.selectedElement.style.display = "none";
            args.selectedElement.style.transform = "rotate(0deg) scale(1)";
            if(self.performCallback !== null){
                self.performCallback();
            }
        }
        self.performAnimation(args);
    }
    nullTransition(){

    }
    rotateStack(args){
        let self = args.self;
        let stackRotation = args.stackRotation;
       // We don't do anything if number === 0, other than making sure element is visible (below).
       if(stackRotation < 0){
            for(let i = 0; i > stackRotation; i--){
               self.elementStack.unshift(self.elementStack.pop());
            }
        }
        else if(stackRotation > 0){
            for(let i = 0; i < stackRotation; i++){
                self.elementStack.push(self.elementStack.shift())
            }
        }
        self.normalizeStack(args);
        let tosElement = self.getTos(args);
        tosElement.style.display = "block";
        tosElement.style.opacity = 1.0;
        if(self.performCallback !== null){
            self.performCallback();
        }
    }
    unrotateStack(args){
        args.stackRotation = -args.stackRotation;
        args.self.rotateStack(args);
    }
    slideInBottom(args){
        let self = args.self;
        args.selectedElement.transform = "translateY(100%)";
        args.finishHandler = function(){
            args.selectedElement.style.display= "block";
            if(self.performCallback !== null){
                self.performCallback();
            }
        }
        self.performAnimation(args);
    }
    slideOutBottom(args){
        let self = args.self;
        args.finishHandler = function(){
            self.moveToBos(args,args.selectedElement);
            args.selectedElement.style.transform = "translateY(0%)";
            if(self.performCallback !== null){
                self.performCallback();
            }
        }
        self.performAnimation(args);
    }
    slideInLeft(args){
        let self = args.self;
        args.selectedElement.transform = "translateX(-100%)";
        self.moveToTos(args,args.selectedElement);
        args.finishHandler = function(){
            args.selectedElement.style.display= "block";
            args.selectedElement.transform = "translateX(0)";
            if(self.performCallback !== null){
                self.performCallback();
            }
        }
        self.performAnimation(args);
    }
    slideOutLeft(args){
        let self = args.self;
        args.finishHandler = function(){
            self.moveToBos(args,args.selectedElement);
            args.selectedElement.style.transform = "translateX(0%)";
            if(self.performCallback !== null){
                self.performCallback();
            }
        }
        self.performAnimation(args);
    }
    slideInRight(args){
        let self = args.self;
        args.selectedElement.transform = "translateX(100%)";
        args.finishHandler = function(){
            args.selectedElement.style.display= "block";
            if(self.performCallback !== null){
                self.performCallback();
            }
        }
        self.performAnimation(args);
    }
    slideOutRight(args){
        let self = args.self;
        args.finishHandler = function(){
            self.moveToBos(args,args.selectedElement);
            args.selectedElement.style.transform = "translateX(0%)";
            if(self.performCallback !== null){
                self.performCallback();
            }
        }
        self.performAnimation(args);
    }
    slideInTop(args){
        let self = args.self;
        args.selectedElement.transform = "translateY(100%)";
        args.finishHandler = function(){
            args.selectedElement.style.display= "block";
            if(self.performCallback !== null){
                self.performCallback();
            }
        }
        self.performAnimation(args);
    }
    slideOutTop(args){
        let self = args.self;
        args.finishHandler = function(){
            self.moveToBos(args,args.selectedElement);
            args.selectedElement.style.transform = "translateY(0%)";
            if(self.performCallback !== null){
                self.performCallback();
            }
        }
        self.performAnimation(args);
    }
    zoomIn(args){
        let self = args.self;
        args.finishHandler = function(){
            args.selectedElement.style.display = "block";
            args.selectedElement.style.transform = "scale(1)";
            if(self.performCallback !== null){
                self.performCallback();
            }
        }
        self.performAnimation(args);
    }
    zoomOut(args){
        let self = args.self;
        args.finishHandler = function(){
            self.moveToBos(args,args.selectedElement);
            args.selectedElement.style.display = "none";
            args.selectedElement.style.transform = "scale(1)";
            if(self.performCallback !== null){
                self.performCallback();
            }
        }
        self.performAnimation(args);
    }
  }
