class SicTransit {
    dispatchTable =  {
        "slideInLeft": {
                        forwardTransition: this.slideInLeft,
                        undoTransition: this.slideOutLeft,
        },
        "slideOutLeft": {
            forwardTransition: this.slideOutLeft,
            undoTransition: this.slideInLeft,
}
    }
    constructor(containerId, elementClass) {
      this.containerId = containerId;
      this.elementClass = elementClass;
      this.loadStack();
      this.showElement(this.elementStack[this.elementStack.length - 1]);     
    }

    loadStack(){
        const element_list = document.querySelectorAll(this.elementClass);
        this.elementStack = [...element_list];
        this.normalizeStack()
    }
    normalizeStack(){
        for(let index = 0; index < this.elementStack.length; index++){
            this.elementStack[index].style.zIndex = index - this.elementStack.length;
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
    showElement(element){
        this.moveToTos(element);
        element.style.display = "block";
    }
    checkElementExists(selectedElement, elementSelector){
        if(selectedElement === null){
            throw new Error("SicTransit: Element " + elementSelector + " not found in " + this.containerId);
        }
    }
    selectElement(elementSelector){
        let selectedElement;
        if(Number.isInteger(elementSelector)){
            console.log("got integer");
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
        transitionFunction(this,elementSelector,delay);
    }
    slideInLeft(self,elementSelector,delay){
        console.log("slideInLeft");
        const selectedElement = self.selectElement(elementSelector);
        console.log("newElement is " + selectedElement);
        self.moveToTos(selectedElement);
        const slideInLeftAnim = [{display:"block", transform: "translateX(100%)"}, {display:"block",transform: "translateX(0%)"}];
        selectedElement.style.display = "block";
        const slideInLeftTiming = {duration:delay,iterations:1};

        selectedElement.animate(slideInLeftAnim,slideInLeftTiming);
  /*      const aliceTumbling = [
            { transform: "rotate(0) translate3D(-50%, -50%, 0)", color: "#000" },
            { color: "#431236", offset: 0.3 },
            { transform: "rotate(360deg) translate3D(-50%, -50%, 0)", color: "#000" },
          ];
          const aliceTiming = {
            duration: 3000,
            iterations: Infinity,
          };
          document.getElementById("alice").animate(aliceTumbling, aliceTiming); */
       
    }
    slideOutLeft(self,elementSelector,delay){
        console.log("slideInLeft");
        const selectedElement = self.selectElement(elementSelector);
        console.log("newElement is " + selectedElement);
        self.knockdownElements();
        self.currentElement.style.zIndex = 1;
        selectedElement.style.zIndex = 2;
        selectedElement.style.display = "block";
        const slideOutLeftAnim = [{transform: "translateX(0%)"}, {transform: "translateX(100%)"}];
        const slideOutLeftTiming = {duration:delay,iterations:1};
        let slideOut = selectedElement.animate(slideOutLeftAnim,slideOutLeftTiming);
        slideOut.onfinish = function(){
            selectedElement.style.display = "none";
            selectedElement.style.zIndex = -32;
            selectedElement.style.transform = "translateX(0%)";
            self.knockdownElements();
        }
       
    }
  }
