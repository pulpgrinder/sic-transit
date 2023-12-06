/*  sic-transit.js Copyright 2023 by Anthony W. Hursh
 *  MIT license.
 */

class SicTransit {
    constructor(containerId, panelClass) {
      this.containerId = containerId;
      this.container = document.querySelector(containerId);
      this.panelClass = panelClass.substring(1);
      this.date = new Date();
      this.synchro = 0;
      this.panelStack = [];
      this.loadStack();
      this.callback = null;
      let blackpanel = document.createElement('div');
      this.blackpanel = blackpanel;
      blackpanel.className = this.panelClass + ' sic-panel sic-transit-black-panel';
      this.container.appendChild(blackpanel);
      this.panelStack.unshift(blackpanel);
      let graypanel = document.createElement('div');
      this.graypanel = graypanel;
      graypanel.className = this.panelClass + ' sic-panel sic-transit-gray-panel';
      this.container.appendChild(graypanel);
      this.panelStack.unshift(graypanel);
      let whitepanel = document.createElement('div');
      this.whitepanel = whitepanel;
      whitepanel.className = this.panelClass +  ' sic-panel sic-transit-white-panel';
      this.container.appendChild(whitepanel);
      this.panelStack.unshift(whitepanel);
      let irispanel = document.createElement('div');
      this.irispanel = irispanel;
      irispanel.className = this.panelClass +  ' sic-panel sic-transit-iris-panel';
      this.container.appendChild(irispanel);
      this.panelStack.unshift(irispanel);
      let flippanel = document.createElement('div');
      this.flippanel = flippanel;
      flippanel.className = this.panelClass +  ' sic-panel sic-transit-flip-panel';
      this.container.appendChild(flippanel);
      this.panelStack.unshift(flippanel);
      this.showPanel({self:this,selectedPanel:this.panelStack[this.panelStack.length - 1]});
      this.normalizeStack();
    }
    checkPanelExists(args){
        if(args.selectedPanel === null){
            throw new Error("SicTransit: Panel " + args.panelSelector + " not found in " + args.self.containerId);
        }
    }
   dispatchTable =  {
        "cutIn": {
            forwardTransition: this.cutIn,
            undo:"cutOut",
            animation: [],
            secondanimation: [],
            boxShadow: "10px 10px 20px rgba(0,0,0,0.5)",
            // cuts happen immediately, no timing parameters
            timing: {}
        },
        "cutOut": {
            forwardTransition: this.cutOut,
            undo:"cutIn",
            animation: [],
            secondanimation: [],
            boxShadow: "10px 10px 20px rgba(0,0,0,0.5)",
            // cuts happen immediately, no timing parameters
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
            timing: {easing: 'ease-in-out', duration:500}
        },
        "flipOutX":{
            forwardTransition: this.flipOutX,
            undo:"flipInX",
            animation: [{display:"block", transform: "rotateX(0deg)"}, {display:"block", transform: "rotateX(-180deg)"}],
            secondanimation: [{display:"block", transform: "rotateX(180deg)"}, {display:"block", transform: "rotateX(0deg)"}],
            boxShadow: "10px 10px 20px rgba(0,0,0,0.5)",
            timing: {easing: 'ease-in-out', duration:500}
        },
        "flipInY":{
            forwardTransition: this.flipInY,
            undo:"flipOutY",
            animation: [{display:"block", transform: "rotateY(180deg)"}, {display:"block", transform: "rotateY(360deg)"}],
            secondanimation: [{display:"block", transform: "rotateY(0deg)"}, {display:"block", transform: "rotateY(180deg)"}],
            boxShadow: "10px 10px 20px rgba(0,0,0,0.5)",
            timing: {easing: 'ease-in-out', duration:500}
        },
        "flipOutY":{
            forwardTransition: this.flipOutY,
            undo:"flipInY",
            animation: [{display:"block", transform: "rotateY(0deg)"}, {display:"block", transform: "rotateY(-180deg)"}],
            secondanimation: [{display:"block", transform: "rotateY(180deg)"}, {display:"block", transform: "rotateY(0deg)"}],
            boxShadow: "10px 10px 20px rgba(0,0,0,0.5)",
            timing: {easing: 'ease-in-out', duration:500}
        },
        "hingeInBottom":{
            forwardTransition: this.hingeInBottom,
            undo:"hingeOutBottom",
            animation: [{display:"block", transform: "rotateX(180deg)"}, {display:"block", transform: "rotateY(0deg)"}],
            boxShadow: "-10px -10px 20px rgba(0,0,0,0.5)",
            timing: {easing: 'ease-in-out', duration:500}
        },
        "hingeOutBottom":{
            forwardTransition: this.hingeOutBottom,
            undo:"hingeInBottom",
            animation: [{display:"block", transform: "rotateY(0deg)"}, {display:"block", transform: "rotateX(180deg)"}],
            boxShadow: "-10px -10px 20px rgba(0,0,0,0.5)",
            timing: {easing: 'ease-in-out', duration:500}
        },
        "hingeInLeft":{
            forwardTransition: this.hingeInLeft,
            undo:"hingeOutLeft",
            animation: [{display:"block", transform: "rotateY(-180deg)"}, {display:"block", transform: "rotateY(0deg)"}],
            boxShadow: "10px 10px 20px rgba(0,0,0,0.5)",
            timing: {easing: 'ease-in-out', duration:500}
        },
        "hingeOutLeft":{
            forwardTransition: this.hingeOutLeft,
            undo:"hingeInLeft",
            animation: [{display:"block", transform: "rotateY(0deg)"}, {display:"block", transform: "rotateY(-180deg)"}],
            boxShadow: "10px 10px 20px rgba(0,0,0,0.5)",
            timing: {easing: 'ease-in-out', duration:500}
        },
        "hingeInRight":{
            forwardTransition: this.hingeInRight,
            undo:"hingeOutRight",
            animation: [{display:"block", transform: "rotateY(180deg)"}, {display:"block", transform: "rotateY(0deg)"}],
            boxShadow: "-10px -10px 20px rgba(0,0,0,0.5)",
            timing: {easing: 'ease-in-out', duration:500}
        },
        "hingeOutRight":{
            forwardTransition: this.hingeOutRight,
            undo:"hingeInRight",
            animation: [{display:"block", transform: "rotateY(0deg)"}, {display:"block", transform: "rotateY(180deg)"}],
            boxShadow: "-10px -10px 20px rgba(0,0,0,0.5)",
            timing: {easing: 'ease-in-out', duration:500}
        },
        "hingeInTop":{
            forwardTransition: this.hingeInTop,
            undo:"hingeOutTop",
            animation: [{display:"block", transform: "rotateX(-180deg)"}, {display:"block", transform: "rotateY(0deg)"}],
            boxShadow: "10px 10px 20px rgba(0,0,0,0.5)",
            timing: {easing: 'ease-in-out', duration:500}
        },
        "hingeOutTop":{
            forwardTransition: this.hingeOutTop,
            undo:"hingeInTop",
            animation: [{display:"block", transform: "rotateY(0deg)"}, {display:"block", transform: "rotateX(-180deg)"}],
            boxShadow: "10px 10px 20px rgba(0,0,0,0.5)",
            timing: {easing: 'ease-in-out', duration:500}
        },
        "irisInBlack":{
            forwardTransition:this.irisInBlack,
            undo:this.irisOutBlack,
            timing: {easing: 'ease-in-out', duration:500}
        },
        "irisOutBlack":{
            forwardTransition:this.irisOutBlack,
            undo:this.irisInBlack,
            timing: {easing: 'ease-in-out', duration:500}
        },
        "irisInGray":{
            forwardTransition:this.irisInGray,
            undo:this.irisOutGray,
            timing: {easing: 'ease-in-out', duration:500}
        },
        "irisOutGray":{
            forwardTransition:this.irisOutGray,
            undo:this.irisInGray,
            timing: {easing: 'ease-in-out', duration:500}
        },
        "irisInWhite":{
            forwardTransition:this.irisInWhite,
            undo:this.irisOutWhite,
            timing: {easing: 'ease-in-out', duration:500}
        },
        "irisOutWhite":{
            forwardTransition:this.irisOutWhite,
            undo:this.irisInWhite,
            timing: {easing: 'ease-in-out', duration:500}
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
            timing: {easing: 'ease-in-out', duration:500}
        },
        "newspaperOut":{
            forwardTransition: this.newspaperOut,
            undo:"newspaperIn",
            animation:[{display:"block", transform: "rotate(0deg)  scale(1)"}, {display:"block", transform: "rotate(-720deg) scale(0)"}],
            boxShadow: "10px 10px 20px rgba(0,0,0,0.5)",
            timing: {easing: 'ease-in-out', duration:500}
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
            // rotates happen immediately, no timing parameters
            timing: {}
        },
        "unrotateStack":{
            forwardTransition: this.unrotateStack,
            undo:"rotateStack",
            animation: [],
            boxShadow: "",
            // rotates happen immediately, no timing parameters
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
            timing: {easing: 'ease-in-out', duration:500}

        },
        "zoomOut":{
            forwardTransition: this.zoomOut,
            undo:"zoomIn",
            animation: [{display:"block", transform: "scale(1)"}, {display:"block", transform: "scale(0)"}],
            boxShadow: "10px 10px 20px rgba(0,0,0,0.5)",
            timing: {easing: 'ease-in-out', duration:500}
        },
    }

// Public methods.
    addPanel(selector,self=this){
        let newPanel;
        if(typeof selector === 'string'){
            if((selector.indexOf(".") !== 0) && (selector.indexOf("#") !== 0)){
                // we assume it's an id
                newPanel = document.getElementById(selector);
            }
            else { // we assume it's a query selector
                newPanel = document.querySelector(selector);
            
            }
        }
        else if(selector instanceof HTMLElement){ // It's already an DOM object
            newPanel = selector;
        }
        if(newPanel instanceof HTMLElement){
           newPanel.remove(); // Remove it from where it is now.
           newPanel.classList.add(self.panelClass,"sic-panel");
            self.panelStack.push(newPanel);
            self.container.appendChild(newPanel);
            self.normalizeStack(self);
        }
        else {
             throw new Error("Sic Transit: attempting to add invalid panel " + selector.toString())
        }
      
    }
    displayPanel(panel){
        this.showPanel({self:this,selectedPanel:panel});
    }
    getBos(args){
        let self;
        if(args !== undefined){
            self = args.self;
        }
        else{
            self = this;
        }
        return self.panelStack[0];
    }
    getContainerId(){
        return this.containerId;
    }
    getPanelClass(){
        return this.panelClass;
    }
    getPanelList(){
        let panelList = [];
        let panels = document.querySelectorAll(this.containerId + " > ." + this.panelClass);
        for(let i = 0; i < panels.length; i++){
            if(panels[i].id !== ""){
                panelList.push(panels[i].id);
            }
        }
        return panelList;
    }
    getTos(args){
        let self;
        if(args !== undefined){
            self = args.self;
        }
        else{
            self = this;
        }
        return args.self.panelStack[args.self.panelStack.length - 1];
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
    getZIndex(panel){
        return window.getComputedStyle(panel).getPropertyValue('z-index');
    }
    performTransition(args){
        if(args.self === undefined){
            args.self = this;
        }
        let self = args.self;
        args = self.loadDefaults(args);
        args.startTime = new Date().getTime();
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
        args.transitionFunction(args);
    }
    setCallback(func){
        this.callback = func;
    }
    stackDump(args = {self:this}){
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

    // Internal methods. Not documented and not intended to be called
    // directly by user code. These may change at any time. Use at 
    // your own risk.

    animateIris(args,startSize, endSize, color, duration) {
        let self = args.self;
        const startTime = Date.now();
        const irisOverlay = self.irispanel;
        irisOverlay.style.background = "radial-gradient(circle, transparent 0%, transparent 0%, ${color} 0%)";
        args.selectedPanel.style.display = "block";
        self.moveToTos(args.selectedPanel,self);
        self.moveToTos(self.irispanel,self);
        function animate() {
            const currentTime = Date.now();
            const elapsedTime = currentTime - startTime;
            const progress = elapsedTime / duration;
            const currentSize = startSize + (endSize - startSize) * progress;
            self.setIrisSize(args,currentSize,color);
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        }
        requestAnimationFrame(animate);
    }
    loadDefaults(args){
        let self = args.self;
        if(args["transitionName"] === undefined){
            args["transitionName"] = "nullTransition";
        }
        let defaultArgs = {
            direction: "forward",
            easing: "linear",
            duration: 500,
            panelSelector: "",
            firstanimation:() => {},
            secondanimation: () => {},
            timing: self.dispatchTable[args["transitionName"]]["timing"],
            transitionFunction: self.dispatchTable["nullTransition"].forwardTransition,
            finishHandler:  () => {},
            fadePanel: self.blackpanel,
            finalDisplayStyle: 'none',
            stackRotation:0
        }
        if(args["easing"] !== undefined){
            self.dispatchTable[args["transitionName"]]["timing"]["easing"] = args["easing"];
            }
        if(args["duration"] !== undefined){
            self.dispatchTable[args["transitionName"]]["timing"]["duration"] = args["duration"];
        }
        if(args["timing"] !== undefined){
            self.dispatchTable[args["transitionName"]]["timing"] = args["timing"];
        }
        defaultArgs["timing"] = self.dispatchTable[args["transitionName"]]["timing"];
        for (let key in defaultArgs) {
            if (defaultArgs.hasOwnProperty(key)) {
                if(args[key] === undefined){
                    args[key] = defaultArgs[key];
                }
            }
          }
        args =  self.selectPanel(args);
        return args;
    }
    loadStack(self=this){
        const panel_list = document.querySelectorAll("." + self.panelClass);
        self.panelStack = [...panel_list];
        self.normalizeStack(self);
    }
    moveToBos(panel,self=this){
        self.removeFromStack(panel,self);
        self.panelStack.unshift(panel);
        self.normalizeStack(self);
    }
    moveToTos(panel,self=this){
        self.removeFromStack(panel,self);
        self.panelStack.push(panel);
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
        self.moveToTos(args.selectedPanel,self);
        const animation = args.selectedPanel.animate(args.firstanimation,args.timing);
        animation.onfinish = args.finishHandler; 
    }
    performFlip(args){
        let self = args.self;
        self.flippanel.replaceChildren([]);
        self.removeFromStack(args.selectedPanel,self);
        self.flippanel.appendChild(args.selectedPanel);
        let tosItem = self.panelStack.pop();
        self.flippanel.appendChild(tosItem);
        self.moveToTos(self.flippanel,self);
        const animation = args.selectedPanel.animate(args.firstanimation,args.timing);
        animation.onfinish = function(){
            args.selectedPanel.style.transform = "";
            tosItem.style.transform = "";
            self.flippanel.replaceChildren([]);
            self.moveToBos(self.flippanel,self);
            if(args.direction === 1){
                self.panelStack.push(tosItem);
                self.panelStack.push(args.selectedPanel);
                self.normalizeStack(self);
            }
            else{
                self.panelStack.push(args.selectedPanel);
                self.panelStack.push(tosItem);
                self.normalizeStack(self);
            }
            self.container.appendChild(tosItem);
            self.container.appendChild(args.selectedPanel);
            self.normalizeStack(self);
            self.performCallback(args);
        }
        self.moveToTos(self.flippanel,self);
        self.flippanel.style.display = "block";
        tosItem.animate(args.secondanimation, args.timing);
    }

    setIrisSize(args,holeSize,color) {
        self = args.self;
        const irisOverlay = self.irispanel;
        irisOverlay.style.background = `radial-gradient(circle, transparent ${holeSize}px, ${color} ${holeSize}px)`;
    }
    showPanel(args){
        args.selectedPanel.style.display = "block";
        args.selectedPanel.style.opacity = 1.0;
        args.self.moveToTos(args.selectedPanel,args.self);
        }
    removeFromStack(panel,self=this){
        let panelStack = self.panelStack;
        for(let i = 0; i < panelStack.length; i++){
            if(panelStack[i] === panel){
                panelStack.splice(i,1);
                return panel;
            }
        }
        throw new Error("removeFromStack: panel not found.");
    }
    selectPanel(args){
        let self = args.self;
        if(args.panelSelector === ""){
            args.selectedPanel = self.getBos(args);
        }
        else if(Number.isInteger(args.panelSelector)){
            // We're selecting the new item by stack position
            if(args.panelSelector >= 0){
                // Counting up from bottom of stack.
                args.selectedPanel =  self.panelStack[args.panelSelector];
            }
            else{
                // Counting down from top of stack.
                args.selectedPanel = self.panelStack[self.panelStack.length - (args.panelSelector + 1)];
            }
        }
        else {
            args.selectedPanel = document.querySelector(args.panelSelector);
        }
        // Throws an error if the panel does not exist.
        self.checkPanelExists(args);
        return args;
    }
    performCallback(args){
        const self = args.self;
        if(self.callback === null){
            return;
        }
        args.endTime = new Date().getTime();
        self.callback(args);
    }
 

// Transition handling code. Not intended to be called directly from user code.
// Use performTransition instead.
    cutIn(args){
        let self = args.self;
        self.showPanel(args);
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
        const animation = args.selectedPanel.animate(args.firstanimation,args.timing);
        animation.onfinish = args.finishHandler;
        const topAnimation = topPanel.animate(args.secondanimation,args.timing);
        topAnimation.onfinish = args.finishHandler;
    }
    dissolveOut(args){
        let self = args.self;
        self.synchro = 0;
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
        const animation = args.selectedPanel.animate(args.firstanimation,args.timing);
        animation.onfinish = args.finishHandler; 
        const topanimation = topPanel.animate(args.secondanimation,args.timing);
        topanimation.onfinish = args.finishHandler;
    }
    fade(args){
        let self = args.self;
        if(args.direction === 1){
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
        }
        else{
            self.moveToTos(args.fadePanel,self);
            args.selectedPanel.style.opacity = 1;
            args.selectedPanel.style.display = "block";
            self.moveToTos(args.selectedPanel,self);
            args.finishHandler = function(){
                self.moveToBos(args.selectedPanel,self);
                args.selectedPanel.style.opacity = 1;
                self.performCallback(args);
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
        self.moveToBos(args.selectedPanel,self);
        args.selectedPanel.style.display = "block";
        args.selectedPanel.style.transform = "rotateY(180deg)";
        self.performFlip(args);
    }
    flipOutY(args){
        args.direction = -1;
        let self = args.self;
        self.moveToTos(args.selectedPanel,self);
        args.selectedPanel.style.display = "block";
        args.selectedPanel.style.transform = "rotateX(0deg)";
        self.panelStack[self.panelStack.length - 2].style.transform = "rotateX(180deg)";
        self.performFlip(args);
    }
    flipInX(args){
        args.direction = 1;
        let self = args.self;
        self.moveToBos(args.selectedPanel,self);
        args.selectedPanel.style.display = "block";
        args.selectedPanel.style.transform = "rotateX(180deg)";
        self.performFlip(args);
    }
    flipOutX(args){
        args.direction = -1;
        let self = args.self;
        self.moveToTos(args.selectedPanel,self);
        args.selectedPanel.style.display = "block";
        args.selectedPanel.style.transform = "rotateX(0deg)";
        self.panelStack[self.panelStack.length - 2].style.transform = "rotateX(180deg)";
        self.performFlip(args);
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
        args.selectedPanel.style.transformOrigin = "bottom";
        args.finalDisplayStyle = "block";
        self.hinge(args);
    }
    hingeOutBottom(args){
        let self = args.self;
        args.selectedPanel.style.transformOrigin = "bottom";
        args.finalDisplayStyle = "none";
        self.hinge(args);
    }
    hingeInLeft(args){
        let self = args.self;
        args.selectedPanel.style.transformOrigin = "left";
        args.finalDisplayStyle = "block";
        self.hinge(args);
    }
    hingeOutLeft(args){
        let self = args.self;
        args.selectedPanel.style.transformOrigin = "left";
        args.finalDisplayStyle = "none";
        self.hinge(args);
    }
    hingeInRight(args){
        let self = args.self;
        args.selectedPanel.style.transformOrigin = "right";
        args.finalDisplayStyle = "block";
        self.hinge(args);
    }
    hingeOutRight(args){
        let self = args.self;
        args.selectedPanel.style.transformOrigin = "right";
        args.finalDisplayStyle = "none";
        self.hinge(args);
    }
    hingeInTop(args){
        let self = args.self;
        args.selectedPanel.style.transformOrigin = "top";
        args.finalDisplayStyle = "block";
        self.hinge(args);
    }
        irisInBlack(args){
        let self = args.self;
        self.animateIris(args,0,175,"black",self.dispatchTable.irisInBlack.timing.duration);
        self.performCallback(args);
    }
    irisOutBlack(args){
        let self = args.self;
        self.animateIris(args,175,0,"black",self.dispatchTable.irisOutBlack.timing.duration);
        self.performCallback(args);
    }
    irisInGray(args){
        let self = args.self;
        self.animateIris(args,0,175,"gray",self.dispatchTable.irisInGray.timing.duration);
        self.performCallback(args);
    }
    irisOutGray(args){
        let self = args.self;
        self.animateIris(args,175,0,"gray",self.dispatchTable.irisOutGray.timing.duration);
        self.performCallback(args);
    }
    irisInWhite(args){
        let self = args.self;
        self.animateIris(args,0,175,"white",self.dispatchTable.irisInWhite.timing.duration);
        self.performCallback(args);
    }
    irisOutWhite(args){
        let self = args.self;
        self.animateIris(args,175,0,"white",self.dispatchTable.irisOutWhite.timing.duration);
        self.performCallback(args);
    }
    hingeOutTop(args){
        let self = args.self;
        args.selectedPanel.style.transformOrigin = "top";
        args.finalDisplayStyle = "none";
        self.hinge(args);
    }
    menuInBottom(args){
        let self = args.self;
        args.selectedPanel.transform = "translateY(100%)";
        args.finishHandler = function(){
            self.moveToTos(args.selectedPanel,self);
            args.selectedPanel.style.display = "block";
            args.selectedPanel.style.transform = "translateY(50%)";
            self.performCallback(args);
        }
        self.performAnimation(args);
    }
    menuOutBottom(args){
        let self = args.self;
        args.finishHandler = function(){
            self.moveToBos(args.selectedPanel,self);
            args.selectedPanel.style.transform = "";
            self.performCallback(args);
        }
        self.performAnimation(args);
    }
    menuInLeft(args){
        let self = args.self;
        args.selectedPanel.transform = "translateX(-100%)";
        self.moveToTos(args.selectedPanel,self);
        args.finishHandler = function(){
            args.selectedPanel.style.display= "block";
            args.selectedPanel.style.transform = "translateX(-50%)";
            self.performCallback(args);
        }
        self.performAnimation(args);
    }
    menuOutLeft(args){
        let self = args.self;
        args.finishHandler = function(){
            self.moveToBos(args.selectedPanel,self);
            args.selectedPanel.style.transform = "";
            self.performCallback(args);
        }
        self.performAnimation(args);
    }
    menuInRight(args){
        let self = args.self;
        args.selectedPanel.transform = "translateX(100%)";
        args.finishHandler = function(){
            args.selectedPanel.style.display= "block";
            args.selectedPanel.style.transform = "translateX(50%)";
            self.performCallback(args);
        }
        self.performAnimation(args);
    }
    menuOutRight(args){
        let self = args.self;
        args.finishHandler = function(){
            self.moveToBos(args.selectedPanel,self);
            args.selectedPanel.style.transform = "";
            self.performCallback(args);
        }
        self.performAnimation(args);
    }
    menuInTop(args){
        let self = args.self;
        args.selectedPanel.transform = "translateY(-100%)";
        args.finishHandler = function(){
            args.selectedPanel.style.transform = "translateY(-50%)"
            args.selectedPanel.style.display= "block";
            self.performCallback(args);
        }
        self.performAnimation(args);
    }
    menuOutTop(args){
        let self = args.self;
        args.finishHandler = function(){
            self.moveToBos(args.selectedPanel,self);
            args.selectedPanel.style.transform = "";
            self.performCallback(args);
        }
        self.performAnimation(args);
    }
    newspaperIn(args){
        let self = args.self;
        args.finishHandler = function(){
            args.selectedPanel.style.display = "block";
            args.selectedPanel.style.transform = "rotate(0deg) scale(1)";
            self.performCallback(args);
        }
        self.performAnimation(args);
    }
    newspaperOut(args){
        let self = args.self;
        args.finishHandler = function(){
            self.moveToBos(args.selectedPanel,self);
            args.selectedPanel.style.display = "none";
            args.selectedPanel.style.transform = "rotate(0deg) scale(1)";
            self.performCallback(args);
        }
        self.performAnimation(args);
    }
    nullTransition(){
        self.performCallback(args);
    }
    rotateStack(args){
        let self = args.self;
        let stackRotation = args.stackRotation;
       // We don't do anything if number === 0, other than making sure panel is visible (below).
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
        let tosPanel = self.getTos(args);
        tosPanel.style.display = "block";
        tosPanel.style.opacity = 1.0;
        self.performCallback(args);
    }
    unrotateStack(args){
        args.stackRotation = -args.stackRotation;
        args.self.rotateStack(args);
    }
    slideInBottom(args){
        let self = args.self;
        args.selectedPanel.transform = "translateY(100%)";
        args.finishHandler = function(){
            args.selectedPanel.style.display= "block";
            self.performCallback(args);
        }
        self.performAnimation(args);
    }
    slideOutBottom(args){
        let self = args.self;
        args.finishHandler = function(){
            self.moveToBos(args.selectedPanel,self);
            args.selectedPanel.style.transform = "translateY(0%)";
            self.performCallback(args);
        }
        self.performAnimation(args);
    }
    slideInLeft(args){
        let self = args.self;
        args.selectedPanel.transform = "translateX(-100%)";
        self.moveToTos(args.selectedPanel,self);
        args.finishHandler = function(){
            args.selectedPanel.style.display= "block";
            args.selectedPanel.transform = "translateX(0)";
            self.performCallback(args);
        }
        self.performAnimation(args);
    }
    slideOutLeft(args){
        let self = args.self;
        args.finishHandler = function(){
            self.moveToBos(args.selectedPanel,self);
            args.selectedPanel.style.transform = "translateX(0%)";
            self.performCallback(args);
        }
        self.performAnimation(args);
    }
    slideInRight(args){
        let self = args.self;
        args.selectedPanel.transform = "translateX(100%)";
        args.finishHandler = function(){
            args.selectedPanel.style.display= "block";
            self.performCallback(args);
        }
        self.performAnimation(args);
    }
    slideOutRight(args){
        let self = args.self;
        args.finishHandler = function(){
            self.moveToBos(args.selectedPanel,self);
            args.selectedPanel.style.transform = "translateX(0%)";
            self.performCallback(args);
        }
        self.performAnimation(args);
    }
    slideInTop(args){
        let self = args.self;
        args.selectedPanel.transform = "translateY(100%)";
        args.finishHandler = function(){
            args.selectedPanel.style.display= "block";
            self.performCallback(args);
        }
        self.performAnimation(args);
    }
    slideOutTop(args){
        let self = args.self;
        args.finishHandler = function(){
            self.moveToBos(args.selectedPanel,self);
            args.selectedPanel.style.transform = "translateY(0%)";
            self.performCallback(args);
        }
        self.performAnimation(args);
    }
    zoomIn(args){
        let self = args.self;
        args.finishHandler = function(){
            args.selectedPanel.style.display = "block";
            args.selectedPanel.style.transform = "scale(1)";
            self.performCallback(args);
        }
        self.performAnimation(args);
    }
    zoomOut(args){
        let self = args.self;
        args.finishHandler = function(){
            self.moveToBos(args.selectedPanel,self);
            args.selectedPanel.style.display = "none";
            args.selectedPanel.style.transform = "scale(1)";
            self.performCallback(args);
        }
        self.performAnimation(args);
    }
  }
