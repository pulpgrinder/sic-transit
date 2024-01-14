/* @preserve 
 * sic-transit.js 
 * Copyright 2024 by Anthony W. Hursh
 * MIT license.
 * @endpreserve
 */
"use strict";class SicTransit{static allInstances=[];constructor(e,a){if(this.containerId=e,this.container=document.querySelector(e),null===this.container)throw new Error("SicTransit: container "+e+" not found.  SicTransit requires a container element.");if(this.container.classList.add("sic-transit-container"),"."!==a[0])throw new Error("SicTransit: panelClass "+a+" must start with a period.");this.panelClass=a.substring(1),this.panelQuery=a,this.date=new Date,this.loadPanelStack(),this.createOverlayPanels(),SicTransit.allInstances.push(this)}getBos(e=this){if(e.panelStack.length>0)return e.panelStack[0];throw new Error("SicTransit getBos(): trying to get element at bottom of empty stack.")}getContainerId(e=this){return e.containerId}getPanelClass(e=this){return e.panelQuery}getPanelList(e=this){let a=[],t=document.querySelectorAll(e.containerId+" > "+this.panelQuery);for(let e=0;e<t.length;e++)""!==t[e].id&&a.push(t[e].id);return a}getTos(e=this){if(e.panelStack.length>0)return e.panelStack[e.panelStack.length-1];throw new Error("SicTransit getTos(): trying to get element at top of empty stack.")}getTransitionList(e=this){let a=[];for(let t in e.dispatchTable)e.dispatchTable.hasOwnProperty(t)&&a.push(t);return a}getZIndex(e,a=this){let t=this.selectPanel(e,a);return window.getComputedStyle(t).getPropertyValue("z-index")}moveToBos(e,a=this){let t=this.selectPanel(e);a.removeFromStack(t,a),a.panelStack.unshift(t),a.normalizeStack(a)}moveToTos(e,a=this){let t=this.selectPanel(e);a.removeFromStack(t,a),a.panelStack.push(t),t.remove(),a.container.appendChild(t),a.normalizeStack(a)}performTransition(e){void 0===e.self&&(e.self=this);let a=e.self;if(a.removeOverlayPanels(a),e.selectedPanel=a.selectPanel(e.panelSelector,a),e.startTime=(new Date).getTime(),void 0===a.dispatchTable[e.transitionName])throw new Error("SicTransit: "+e.transitionName+" is not a recognized transition");e.transitionFunction=a.dispatchTable[e.transitionName].forwardTransition,e.firstanimation=a.dispatchTable[e.transitionName].animation,e.secondanimation=a.dispatchTable[e.transitionName].secondanimation,e.transitionFunction(e)}removePanel(e,a=this){let t=a.selectPanel(e);return null!==t&&(a.removeFromAllStacks(t),t.remove()),t}rotateStack(e){let a,t=e.self;if(a=Number.isInteger(e.stackRotationNumber)?e.stackRotationNumber:1,a>0)for(let e=0;e<a;e++)t.panelStack.unshift(t.panelStack.pop());else if(a<0)for(let e=0;e>a;e--)t.panelStack.push(t.panelStack.shift());t.normalizeStack(t),t.performCallback(e)}setParameter(e,a,t){let n;n=void 0===t||"*"===t?this.getTransitionList(this):[t];for(let t=0;t<n.length;t++)this.dispatchTable[n[t]][e]=a}showPanel(e,a=this){a.transferPanel(e,a),a.moveToTos(e,a)}stackDump(e={self:this}){let a="stackDump:\n";for(const t of e.self.panelStack)a=""!==t.id?a+"id: "+t.id+" display:"+t.style.display+" z-index: "+t.style.zIndex+"\n":a+"class: "+t.className+" display:"+t.style.display+" z-index: "+t.style.zIndex+"\n"}transferPanel(e,a=this){let t=a.selectPanel(e,a);if(null===t)throw new Error("SicTransit transferPanel(): panelSelector "+panelSelector+" is invalid.");a.removePanel(t,this),t.classList.add(a.panelClass,"sic-transit-panel"),a.moveToBos(t,this),a.container.appendChild(t),t.classList.add(a.panelClass,"sic-transit-panel"),t.classList.add(a.panelClass,this.panelClass),a.resetPanel(e,this)}removeFromStack(e,a=this){let t=a.selectPanel(e,a),n=a.panelStack;for(let e=0;e<n.length;e++)if(n[e]===t)return n.splice(e,1),t;return null}removeFromAllStacks(e){for(let a=0;a<SicTransit.allInstances.length;a++)SicTransit.allInstances[a].removeFromStack(e,SicTransit.allInstances[a])}normalizeStack(e=this){let a=e.panelStack,t=0;for(let e=a.length-1;e>=0;e--){a[e].style.zIndex=t,t-=1}}removeOverlayPanels(e=this){e.panelStack=e.panelStack.filter((e=>!e.classList.contains("sic-transit-overlay-panel"))),document.querySelectorAll(".sic-transit-overlay-panel").forEach((e=>e.remove())),e.normalizeStack(e)}selectPanel(e,a=this){if(void 0===e||""===e)return a.getTos(a);if(e instanceof HTMLElement)return e;if(Number.isInteger(e)){if(e>0){if(e<a.panelStack.length)return a.panelStack[e];throw new Error("SicTransit selectPanel(): panel index "+e+" is outside the bounds of the panelStack.");return null}if(e<0){let t=a.panelStack.length+(e-1);if(t>=0)return a.panelStack[t];throw new Error("SicTransit selectPanel(): panelStack index "+t+" ("+e+" from top of stack) is outside the bounds of the panelStack.");return null}return a.panelStack[0]}if("string"==typeof e){let a=document.querySelector(e);if(null===a){throw new Error("SicTransit selectPanel(): no panels matching "+e);return null}return a}throw new Error("SicTransit selectPanel(): panelSelector "+e+" is invalid.");return null}dispatchTable={cutIn:{forwardTransition:this.cutIn,firstanimation:[],secondanimation:[],boxShadow:"10px 10px 20px rgba(0,0,0,0.5)",easing:"",duration:0,callback:null},cutOut:{forwardTransition:this.cutOut,firstanimation:[],secondanimation:[],boxShadow:"10px 10px 20px rgba(0,0,0,0.5)",easing:"",duration:0,callback:null},crossDissolveIn:{forwardTransition:this.crossDissolveIn,firstanimation:[{display:"block",opacity:0},{display:"block",opacity:1}],secondanimation:[{display:"block",opacity:1},{display:"block",opacity:0}],boxShadow:"10px 10px 20px rgba(0,0,0,0.5)",easing:"ease-in-out",duration:2e3,callback:null},crossDissolveOut:{forwardTransition:this.crossDissolveOut,firstanimation:[{display:"block",opacity:1},{display:"block",opacity:0}],secondanimation:[{display:"block",opacity:0},{display:"block",opacity:1}],boxShadow:"10px 10px 20px rgba(0,0,0,0.5)",easing:"ease-in-out",duration:2e3,callback:null},fadeInFromBlack:{forwardTransition:this.fadeInFromBlack,firstanimation:[{display:"block",opacity:0},{display:"block",opacity:1}],boxShadow:"10px 10px 20px rgba(0,0,0,0.5)",easing:"ease-in-out",duration:2e3,callback:null},fadeOutToBlack:{forwardTransition:this.fadeOutToBlack,firstanimation:[{opacity:1},{opacity:0}],boxShadow:"10px 10px 20px rgba(0,0,0,0.5)",easing:"ease-in-out",duration:2e3,callback:null},fadeInFromGray:{forwardTransition:this.fadeInFromGray,firstanimation:[{display:"block",opacity:0},{display:"block",opacity:1}],boxShadow:"10px 10px 20px rgba(0,0,0,0.5)",easing:"ease-in-out",duration:2e3,callback:null},fadeOutToGray:{forwardTransition:this.fadeOutToGray,firstanimation:[{opacity:1},{opacity:0}],boxShadow:"10px 10px 20px rgba(0,0,0,0.5)",easing:"ease-in-out",duration:2e3,callback:null},fadeInFromWhite:{forwardTransition:this.fadeInFromWhite,firstanimation:[{display:"block",opacity:0},{display:"block",opacity:1}],boxShadow:"10px 10px 20px rgba(0,0,0,0.5)",easing:"ease-in-out",duration:2e3,callback:null},fadeOutToWhite:{forwardTransition:this.fadeOutToWhite,firstanimation:[{opacity:1},{opacity:0}],boxShadow:"10px 10px 20px rgba(0,0,0,0.5)",easing:"ease-in-out",duration:2e3,callback:null},flipInX:{forwardTransition:this.flipInX,firstanimation:[{display:"block",transform:"rotateX(0deg)"},{display:"block",transform:"rotateX(180deg)"}],boxShadow:"10px 10px 20px rgba(0,0,0,0.5)",easing:"linear",duration:1e3,callback:null},flipOutX:{forwardTransition:this.flipOutX,firstanimation:[{display:"block",transform:"rotateX(180deg)"},{display:"block",transform:"rotateX(0deg)"}],boxShadow:"10px 10px 20px rgba(0,0,0,0.5)",easing:"linear",duration:1e3,callback:null},flipInY:{forwardTransition:this.flipInY,firstanimation:[{display:"block",transform:"rotateY(0deg)"},{display:"block",transform:"rotateY(180deg)"}],boxShadow:"10px 10px 20px rgba(0,0,0,0.5)",easing:"linear",duration:1e3,callback:null},flipOutY:{forwardTransition:this.flipOutY,firstanimation:[{display:"block",transform:"rotateY(180deg)"},{display:"block",transform:"rotateY(0deg)"}],boxShadow:"10px 10px 20px rgba(0,0,0,0.5)",easing:"linear",duration:1e3,callback:null},hingeInFromBottom:{forwardTransition:this.hingeInFromBottom,firstanimation:[{display:"block",transform:"rotateX(-180deg)"},{display:"block",transform:"rotateX(0deg)"}],boxShadow:"-10px -10px 20px rgba(0,0,0,0.5)",easing:"ease-in-out",duration:1e3,callback:null},hingeOutToBottom:{forwardTransition:this.hingeOutToBottom,firstanimation:[{display:"block",transform:"rotateX(0deg)"},{display:"block",transform:"rotateX(-180deg)"}],boxShadow:"-10px -10px 20px rgba(0,0,0,0.5)",easing:"ease-in-out",duration:1e3,callback:null},hingeInFromLeft:{forwardTransition:this.hingeInFromLeft,firstanimation:[{display:"block",transform:"rotateY(-180deg)"},{display:"block",transform:"rotateY(0deg)"}],boxShadow:"10px 10px 20px rgba(0,0,0,0.5)",easing:"ease-in-out",duration:1e3,callback:null},hingeOutToLeft:{forwardTransition:this.hingeOutToLeft,firstanimation:[{display:"block",transform:"rotateY(0deg)"},{display:"block",transform:"rotateY(-180deg)"}],boxShadow:"10px 10px 20px rgba(0,0,0,0.5)",easing:"ease-in-out",duration:1e3,callback:null},hingeInFromRight:{forwardTransition:this.hingeInFromRight,firstanimation:[{display:"block",transform:"rotateY(180deg)"},{display:"block",transform:"rotateY(0deg)"}],boxShadow:"-10px -10px 20px rgba(0,0,0,0.5)",easing:"ease-in-out",duration:1e3,callback:null},hingeOutToRight:{forwardTransition:this.hingeOutToRight,firstanimation:[{display:"block",transform:"rotateY(0deg)"},{display:"block",transform:"rotateY(180deg)"}],boxShadow:"-10px -10px 20px rgba(0,0,0,0.5)",easing:"ease-in-out",duration:1e3,callback:null},hingeInFromTop:{forwardTransition:this.hingeInFromTop,firstanimation:[{display:"block",transform:"rotateX(180deg)"},{display:"block",transform:"rotateX(0deg)"}],boxShadow:"10px 10px 20px rgba(0,0,0,0.5)",easing:"ease-in-out",duration:1e3,callback:null},hingeOutToTop:{forwardTransition:this.hingeOutToTop,firstanimation:[{display:"block",transform:"rotateX(0deg)"},{display:"block",transform:"rotateX(180deg)"}],boxShadow:"10px 10px 20px rgba(0,0,0,0.5)",easing:"ease-in-out",duration:1e3,callback:null},irisIn:{forwardTransition:this.irisIn,firstanimation:[{display:"block",clipPath:"circle(0% at center"},{display:"block",clipPath:"circle(100% at center)"}],easing:"ease-in-out",duration:1e3,callback:null},irisOut:{forwardTransition:this.irisOut,firstanimation:[{display:"block",clipPath:"circle(100% at center"},{display:"block",clipPath:"circle(0% at center)"}],easing:"ease-in-out",duration:1e3,callback:null},irisInFromBlack:{forwardTransition:this.irisInFromBlack,easing:"ease-in-out",duration:1e3,callback:null},irisOutToBlack:{forwardTransition:this.irisOutToBlack,easing:"ease-in-out",duration:1e3,callback:null},irisInFromGray:{forwardTransition:this.irisInFromGray,easing:"ease-in-out",duration:1e3,callback:null},irisOutToGray:{forwardTransition:this.irisOutToGray,easing:"ease-in-out",duration:1e3,callback:null},irisInFromWhite:{forwardTransition:this.irisInFromWhite,easing:"ease-in-out",duration:1e3,callback:null},irisOutToWhite:{forwardTransition:this.irisOutToWhite,easing:"ease-in-out",duration:1e3,callback:null},menuInFromBottom:{forwardTransition:this.menuInFromBottom,firstanimation:[{display:"block",transform:"translateY(100%)"},{display:"block",transform:"translateY(%%%%)"}],boxShadow:"-10px -10px 30px rgba(0,0,0,0.5)",easing:"ease-in-out",duration:500,menuPercentage:33,callback:null},menuOutToBottom:{forwardTransition:this.menuOutToBottom,firstanimation:[{transform:"translateY(%%%%)"},{transform:"translateY(100%)"}],boxShadow:"-10px -10px 20px rgba(0,0,0,0.5)",easing:"ease-in-out",duration:500,menuPercentage:33,callback:null},menuInFromLeft:{forwardTransition:this.menuInFromLeft,firstanimation:[{display:"block",transform:"translateX(-100%)"},{display:"block",transform:"translateX(-%%%%)"}],boxShadow:"10px 20px 20px 30px rgba(0,0,0,0.5)",easing:"ease-in-out",duration:500,menuPercentage:33,callback:null},menuOutToLeft:{forwardTransition:this.menuOutToLeft,firstanimation:[{display:"block",transform:"translateX(-%%%%)"},{display:"block",transform:"translateX(-100%)"}],boxShadow:"10px 20px 20px 30px rgba(0,0,0,0.5)",easing:"ease-in-out",duration:500,menuPercentage:33,callback:null},menuInFromRight:{forwardTransition:this.menuInFromRight,firstanimation:[{display:"block",transform:"translateX(100%)"},{display:"block",transform:"translateX(%%%%)"}],boxShadow:"-10px -10px 20px 30px rgba(0,0,0,0.5)",easing:"ease-in-out",duration:500,menuPercentage:33,callback:null},menuOutToRight:{forwardTransition:this.menuOutToRight,firstanimation:[{transform:"translateX(%%%%)"},{transform:"translateX(100%)"}],boxShadow:"-10px -10px 20px 30px rgba(0,0,0,0.5)",easing:"ease-in-out",duration:500,menuPercentage:33,callback:null},menuInFromTop:{forwardTransition:this.menuInFromTop,firstanimation:[{display:"block",transform:"translateY(-100%)"},{display:"block",transform:"translateY(-%%%%)"}],boxShadow:"10px 10px 20px rgba(0,0,0,0.5)",easing:"ease-in-out",duration:500,menuPercentage:33,callback:null},menuOutToTop:{forwardTransition:this.menuOutToTop,firstanimation:[{transform:"translateY(-%%%%)"},{transform:"translateY(-100%)"}],boxShadow:"10px 10px 20px rgba(0,0,0,0.5)",easing:"ease-in-out",duration:500,menuPercentage:33,callback:null},spinIn:{forwardTransition:this.spinIn,firstanimation:[{display:"block",transform:"rotate(0deg) scale(0)"},{display:"block",transform:"rotate(720deg) scale(1)"}],boxShadow:"10px 10px 20px rgba(0,0,0,0.5)",easing:"ease-in-out",duration:1e3,callback:null},spinOut:{forwardTransition:this.spinOut,firstanimation:[{display:"block",transform:"rotate(0deg)  scale(1)"},{display:"block",transform:"rotate(-720deg) scale(0)"}],boxShadow:"10px 10px 20px rgba(0,0,0,0.5)",easing:"ease-in-out",duration:1e3,callback:null},rotateStack:{forwardTransition:this.rotateStack,firstanimation:[],boxShadow:"",easing:"",duration:0,callback:null},swap:{forwardTransition:this.swap,firstanimation:[],callback:null},swipeInFromBottom:{forwardTransition:this.swipeInFromBottom,firstanimation:[{display:"block",transform:"translateY(100%)"},{display:"block",transform:"translateY(0%)"}],boxShadow:"-10px -10px 30px rgba(0,0,0,0.5)",easing:"ease-in-out",duration:500,callback:null},swipeOutToBottom:{forwardTransition:this.swipeOutToBottom,firstanimation:[{transform:"translateY(0%)"},{transform:"translateY(100%)"}],boxShadow:"-10px -10px 20px rgba(0,0,0,0.5)",easing:"ease-in-out",duration:500,callback:null},swipeInFromLeft:{forwardTransition:this.swipeInFromLeft,firstanimation:[{display:"block",transform:"translateX(-100%)"},{display:"block",transform:"translateX(0%)"}],boxShadow:"10px 20px 20px 30px rgba(0,0,0,0.5)",easing:"ease-in-out",duration:500,callback:null},swipeOutToLeft:{forwardTransition:this.swipeOutToLeft,firstanimation:[{display:"block",transform:"translateX(0%)"},{display:"block",transform:"translateX(-120%)"}],boxShadow:"10px 20px 20px 30px rgba(0,0,0,0.5)",easing:"ease-in-out",duration:500,callback:null},swipeInFromRight:{forwardTransition:this.swipeInFromRight,firstanimation:[{display:"block",transform:"translateX(100%)"},{display:"block",transform:"translateX(0%)"}],boxShadow:"-10px -10px 20px 30px rgba(0,0,0,0.5)",easing:"ease-in-out",duration:500,callback:null},swipeOutToRight:{forwardTransition:this.swipeOutToRight,firstanimation:[{transform:"translateX(0%)"},{transform:"translateX(120%)"}],boxShadow:"-10px -10px 20px 30px rgba(0,0,0,0.5)",easing:"ease-in-out",duration:500,callback:null},swipeInFromTop:{forwardTransition:this.swipeInFromTop,firstanimation:[{display:"block",transform:"translateY(-100%)"},{display:"block",transform:"translateY(0%)"}],boxShadow:"10px 10px 20px rgba(0,0,0,0.5)",easing:"ease-in-out",duration:500,callback:null},swipeOutToTop:{forwardTransition:this.swipeOutToTop,firstanimation:[{transform:"translateY(0%)"},{transform:"translateY(-100%)"}],boxShadow:"10px 10px 20px rgba(0,0,0,0.5)",easing:"ease-in-out",duration:500,callback:null},zoomIn:{forwardTransition:this.zoomIn,firstanimation:[{display:"block",transform:"scale(0)"},{display:"block",transform:"scale(1)"}],boxShadow:"10px 10px 20px rgba(0,0,0,0.5)",easing:"ease-in-out",duration:500,callback:null},zoomOut:{forwardTransition:this.zoomOut,firstanimation:[{display:"block",transform:"scale(1)"},{display:"block",transform:"scale(0)"}],boxShadow:"10px 10px 20px rgba(0,0,0,0.5)",easing:"ease-in-out",duration:500,callback:null}};createOverlayPanels(){let e;this.specialtyPanels={};["blackpanel","graypanel","whitepanel","flippanel","flipbackgroundpanel"].forEach((a=>{e=document.createElement("div"),this.specialtyPanels[a]=e,e.classList.add(this.panelClass,"sic-transit-panel","sic-transit-"+a,"sic-transit-overlay-panel")})),this.normalizeStack()}resetPanel(e,a=this){let t=a.selectPanel(e,a);t.style.display="block",t.style.opacity=1,t.style.removeProperty("transform"),t.style.removeProperty("transformOrigin"),t.style.removeProperty("clip-path"),t.style.animationFillMode="none"}loadPanelStack(e=this){e.panelStack=[];const a=document.querySelectorAll(e.containerId+" > "+e.panelQuery);e.panelStack=[...a];for(let a=0;a<e.panelStack.length;a++)e.panelStack[a].classList.add("sic-transit-panel");e.normalizeStack(e)}async performAnimation(e){let a=e.self,t=a.dispatchTable[e.transitionName];a.moveToTos(e.selectedPanel,a);const n=e.selectedPanel.animate(e.firstanimation,{easing:t.easing,duration:t.duration,fill:"forwards"});await n.finished,n.commitStyles(),n.cancel(),e.finishHandler()}performCallback(e){let a=e.self.dispatchTable[e.transitionName];null!==a.callback&&(e.endTime=(new Date).getTime(),a.callback(e))}stackSwap(e=this){if(e.panelStack.length<2){throw new Error("SicTransit stackSwap(): can't swap when length of panelStack is < 2.");return}let a=e.panelStack.pop(),t=e.panelStack.pop();e.panelStack.push(a),e.panelStack.push(t),e.normalizeStack(e)}cutIn(e){let a=e.self;a.resetPanel(e.selectedPanel,a),a.showPanel(e.selectedPanel,a),a.performCallback(e)}cutOut(e){let a=e.self;a.moveToBos(e.selectedPanel,a),a.resetPanel(e.selectedPanel,a),a.performCallback(e)}async crossDissolveIn(e){let a=e.self,t=a.dispatchTable[e.transitionName];a.moveToBos(e.selectedPanel,a);let n=a.panelStack.pop();a.panelStack.push(a.specialtyPanels.graypanel),a.panelStack.push(n),a.resetPanel(n,a),a.normalizeStack(a),a.resetPanel(e.selectedPanel,a),a.moveToTos(e.selectedPanel,a),e.finishHandler=function(){a.resetPanel(e.selectedPanel,a),a.normalizeStack(a),a.performCallback(e)};const i=e.selectedPanel.animate(t.firstanimation,{easing:t.easing,duration:t.duration+100,fill:"forwards"}),l=n.animate(t.secondanimation,{easing:t.easing,duration:t.duration,fill:"forwards"});await i.finished,await l.finished,i.commitStyles(),i.cancel(),l.commitStyles(),l.cancel(),e.finishHandler()}async crossDissolveOut(e){let a=e.self;e.transitionName="crossDissolveIn";let t=e.selectedPanel;a.moveToBos(t,a),e.selectedPanel=a.panelStack.pop(),a.moveToTos(t,a),a.normalizeStack(a),a.crossDissolveIn(e)}doFadeIn(e){let a=e.self;a.resetPanel(e.fadePanel,a),a.moveToTos(e.fadePanel,a),a.container.append(e.fadePanel),a.resetPanel(e.selectedPanel,a),e.selectedPanel.style.opacity=0,a.moveToTos(e.selectedPanel,a),e.finishHandler=function(){a.moveToBos(e.fadePanel,a),a.performCallback(e)},a.performAnimation(e)}doFadeOut(e){let a=e.self;a.resetPanel(e.selectedPanel,a),e.fadePanel.style.opacity=0,a.container.append(e.fadePanel);let t=e.selectedPanel;e.selectedPanel=e.fadePanel,e.fadePanel=t,a.doFadeIn(e)}fadeInFromBlack(e){let a=e.self;e.firstanimation=a.dispatchTable.fadeInFromBlack.firstanimation,e.fadePanel=a.specialtyPanels.blackpanel,a.doFadeIn(e)}fadeOutToBlack(e){let a=e.self;e.firstanimation=a.dispatchTable.fadeInFromBlack.firstanimation,e.fadePanel=a.specialtyPanels.blackpanel,a.doFadeOut(e)}fadeInFromGray(e){let a=e.self;e.firstanimation=a.dispatchTable.fadeInFromGray.firstanimation,e.fadePanel=a.specialtyPanels.graypanel,a.doFadeIn(e)}fadeOutToGray(e){let a=e.self;e.firstanimation=a.dispatchTable.fadeInFromGray.firstanimation,e.fadePanel=a.specialtyPanels.graypanel,a.doFadeOut(e)}fadeInFromWhite(e){let a=e.self,t=a.dispatchTable.fadeInFromWhite;e.firstanimation=t.firstanimation,e.fadePanel=a.specialtyPanels.whitepanel,a.doFadeIn(e)}fadeOutToWhite(e){let a=e.self;e.firstanimation=a.dispatchTable.fadeInFromWhite.firstanimation,e.fadePanel=a.specialtyPanels.whitepanel,a.doFadeOut(e)}hinge(e){let a=e.self;a.resetPanel(e.selectedPanel,a),a.container.style["-webkit-perspective"]="1000px",a.container.style.perspective="1000px",a.container.style["-webkit-perspectiveOrigin"]="left",a.container.style.perspectiveOrigin="left",e.finishHandler=function(){e.selectedPanel.style["-webkit-transformOrigin"]="center",e.selectedPanel.style.transformOrigin="center",a.performCallback(e)},a.performAnimation(e)}hingeInFromBottom(e){let a=e.self,t=a.dispatchTable.hingeInFromBottom;e.firstanimation=t.firstanimation,e.selectedPanel.style["-webkit-transformOrigin"]="bottom",e.selectedPanel.style.transformOrigin="bottom",a.hinge(e)}hingeOutToBottom(e){let a=e.self,t=a.dispatchTable.hingeOutToBottom;e.firstanimation=t.firstanimation,e.selectedPanel.style["-webkit-transformOrigin"]="bottom",e.selectedPanel.style.transformOrigin="bottom",a.hinge(e)}hingeInFromLeft(e){let a=e.self,t=a.dispatchTable.hingeInFromLeft;e.firstanimation=t.firstanimation,e.selectedPanel.style["-webkit-transformOrigin"]="left",e.selectedPanel.style.transformOrigin="left",a.hinge(e)}hingeOutToLeft(e){let a=e.self,t=a.dispatchTable.hingeOutToLeft;e.firstanimation=t.firstanimation,e.selectedPanel.style["-webkit-transformOrigin"]="left",e.selectedPanel.style.transformOrigin="left",a.hinge(e)}hingeInFromRight(e){let a=e.self,t=a.dispatchTable.hingeInFromRight;e.firstanimation=t.firstanimation,e.selectedPanel.style["-webkit-transformOrigin"]="right",e.selectedPanel.style.transformOrigin="right",a.hinge(e)}hingeOutToRight(e){let a=e.self,t=a.dispatchTable.hingeOutToRight;e.firstanimation=t.firstanimation,e.selectedPanel.style["-webkit-transformOrigin"]="right",e.selectedPanel.style.transformOrigin="right",a.hinge(e)}hingeInFromTop(e){let a=e.self,t=a.dispatchTable.hingeInFromTop;e.firstanimation=t.firstanimation,e.selectedPanel.style["-webkit-transformOrigin"]="top",e.selectedPanel.style.transformOrigin="top",a.hinge(e)}hingeOutToTop(e){let a=e.self,t=a.dispatchTable.hingeOutToTop;e.firstanimation=t.firstanimation,e.selectedPanel.style["-webkit-transformOrigin"]="top",e.selectedPanel.style.transformOrigin="top",a.hinge(e)}getElementDiagonal(e){let a=getComputedStyle(e),t=parseInt(a.width),n=parseInt(a.height);return Math.ceil(Math.sqrt(t*t+n*n))}irisIn(e){let a=e.self,t=a.dispatchTable.irisIn,n=e.selectedPanel;a.resetPanel(n,a),n.style.clipPath="circle(0% at center)",n.style.display="block",a.moveToTos(n,a),e.firstanimation=t.firstanimation,e.finishHandler=function(){n.style.display="block",n.style.clipPath="none",a.performCallback(e)},a.performAnimation(e)}irisOut(e){let a=e.self,t=a.dispatchTable.irisOut,n=e.selectedPanel;a.resetPanel(n,a),n.style.clipPath="circle(100% at center)",n.style.display="block",a.moveToTos(n,a),e.firstanimation=t.firstanimation,e.finishHandler=function(){a.moveToBos(n,a),n.style.removeProperty("clip-path"),a.performCallback(e)},a.performAnimation(e)}irisInFromBlack(e){let a=e.self;a.container.append(a.specialtyPanels.blackpanel),a.moveToTos(a.specialtyPanels.blackpanel),a.irisIn(e)}irisOutToBlack(e){let a=e.self;a.specialtyPanels.blackpanel.style.display="none",a.moveToTos(a.specialtyPanels.blackpanel,a),a.container.append(a.specialtyPanels.blackpanel),a.normalizeStack(),a.specialtyPanels.blackpanel.style.display="block",a.irisOut(e)}irisInFromGray(e){let a=e.self;a.moveToTos(a.specialtyPanels.graypanel),a.container.append(a.specialtyPanels.graypanel),a.irisIn(e)}irisOutToGray(e){let a=e.self;a.specialtyPanels.graypanel.style.display="none",a.moveToTos(a.specialtyPanels.graypanel,a),a.container.append(a.specialtyPanels.graypanel),a.normalizeStack(),a.specialtyPanels.graypanel.style.display="block",a.irisOut(e)}irisInFromWhite(e){let a=e.self;a.moveToTos(a.specialtyPanels.whitepanel),a.container.append(a.specialtyPanels.whitepanel),a.irisIn(e)}irisOutToWhite(e){let a=e.self;a.specialtyPanels.whitepanel.style.display="none",a.moveToTos(a.specialtyPanels.whitepanel,a),a.container.append(a.specialtyPanels.whitepanel),a.normalizeStack(),a.specialtyPanels.whitepanel.style.display="block",a.irisOut(e)}menuInFromBottom(e){let a=e.self;a.moveToBos(e.selectedPanel,a),a.resetPanel(e.selectedPanel,a);let t=a.dispatchTable.menuInFromBottom,n=100-t.menuPercentage;e.selectedPanel.transform="translateY(100%)",a.moveToTos(e.selectedPanel,a),e.firstanimation=JSON.parse(JSON.stringify(t.firstanimation).replace("%%%",n)),e.finishHandler=function(){a.moveToTos(e.selectedPanel,a),e.selectedPanel.style.display="block",e.selectedPanel.style.transform="translateY("+n+"%)",a.performCallback(e)},a.performAnimation(e)}menuOutToBottom(e){let a=e.self;a.moveToTos(e.selectedPanel,a);let t=a.dispatchTable.menuOutToBottom,n=100-t.menuPercentage;e.firstanimation=JSON.parse(JSON.stringify(t.firstanimation).replace("%%%",n)),e.finishHandler=function(){a.moveToBos(e.selectedPanel,a),a.resetPanel(e.selectedPanel,a),a.performCallback(e)},a.performAnimation(e)}menuInFromLeft(e){let a=e.self;a.moveToBos(e.selectedPanel,a),a.resetPanel(e.selectedPanel,a);let t=a.dispatchTable.menuInFromLeft,n=100-t.menuPercentage;e.firstanimation=JSON.parse(JSON.stringify(t.firstanimation).replace("%%%",n)),e.selectedPanel.style.transform="translateX(-100%)",a.moveToTos(e.selectedPanel,a),e.finishHandler=function(){e.selectedPanel.style.display="block",e.selectedPanel.style.transform="translateX(-"+n+"%)",a.performCallback(e)},a.performAnimation(e)}menuOutToLeft(e){let a=e.self,t=a.dispatchTable.menuOutToLeft,n=100-t.menuPercentage;e.firstanimation=JSON.parse(JSON.stringify(t.firstanimation).replace("%%%",n)),e.finishHandler=function(){a.moveToBos(e.selectedPanel,a),a.resetPanel(e.selectedPanel,a),a.performCallback(e)},a.performAnimation(e)}menuInFromRight(e){let a=e.self;a.moveToBos(e.selectedPanel,a),a.resetPanel(e.selectedPanel,a);let t=a.dispatchTable.menuInFromRight,n=100-t.menuPercentage;e.firstanimation=JSON.parse(JSON.stringify(t.firstanimation).replace("%%%",n)),e.selectedPanel.transform="translateX(100%)",a.moveToTos(e.selectedPanel,a),e.finishHandler=function(){e.selectedPanel.style.display="block",e.selectedPanel.style.transform="translateX("+n+"%)",a.performCallback(e)},a.performAnimation(e)}menuOutToRight(e){let a=e.self,t=a.dispatchTable.menuOutToRight,n=100-t.menuPercentage;e.firstanimation=JSON.parse(JSON.stringify(t.firstanimation).replace("%%%",n)),e.finishHandler=function(){a.moveToBos(e.selectedPanel,a),a.resetPanel(e.selectedPanel,a),a.performCallback(e)},a.performAnimation(e)}menuInFromTop(e){let a=e.self;a.moveToBos(e.selectedPanel,a),a.resetPanel(e.selectedPanel,a);let t=a.dispatchTable.menuInFromTop,n=100-t.menuPercentage;e.firstanimation=JSON.parse(JSON.stringify(t.firstanimation).replace("%%%",n)),e.selectedPanel.transform="translateY(-100%)",a.moveToTos(e.selectedPanel,a),e.finishHandler=function(){e.selectedPanel.style.transform="translateY(-"+n+"%)",e.selectedPanel.style.display="block",a.performCallback(e)},a.performAnimation(e)}menuOutToTop(e){let a=e.self,t=a.dispatchTable.menuOutToTop,n=100-t.menuPercentage;e.firstanimation=JSON.parse(JSON.stringify(t.firstanimation).replace("%%%",n)),e.finishHandler=function(){a.moveToBos(e.selectedPanel,a),a.resetPanel(e.selectedPanel,a),a.performCallback(e)},a.performAnimation(e)}spinIn(e){let a=e.self;a.moveToBos(e.selectedPanel,a),a.resetPanel(e.selectedPanel,a),e.selectedPanel.style.transform="scale(0)",a.moveToTos(e.selectedPanel,a);let t=a.dispatchTable.spinIn;e.firstanimation=t.firstanimation,e.finishHandler=function(){a.resetPanel(e.selectedPanel,a),a.performCallback(e)},a.performAnimation(e)}spinOut(e){let a=e.self;a.resetPanel(e.selectedPanel,a);let t=a.dispatchTable.spinOut;e.firstanimation=t.firstanimation,e.finishHandler=function(){a.moveToBos(e.selectedPanel,a),a.resetPanel(e.selectedPanel,a),a.performCallback(e)},a.performAnimation(e)}swap(e){let a=e.self;a.stackSwap(a),a.normalizeStack(),a.performCallback(e)}swipeInFromBottom(e){let a=e.self;a.moveToBos(e.selectedPanel,a),a.resetPanel(e.selectedPanel,a);let t=a.dispatchTable.swipeInFromBottom;e.firstanimation=t.firstanimation,e.selectedPanel.transform="translateY(100%)",a.moveToTos(e.selectedPanel,a),e.finishHandler=function(){a.resetPanel(e.selectedPanel,a),a.performCallback(e)},a.performAnimation(e)}swipeOutToBottom(e){let a=e.self;a.resetPanel(e.selectedPanel,a),a.moveToTos(e.selectedPanel,a);let t=a.dispatchTable.swipeOutToBottom;e.firstanimation=t.firstanimation,e.finishHandler=function(){a.moveToBos(e.selectedPanel,a),a.resetPanel(e.selectedPanel,a),a.performCallback(e)},a.performAnimation(e)}swipeInFromLeft(e){let a=e.self;a.moveToBos(e.selectedPanel,a),a.resetPanel(e.selectedPanel,a);let t=a.dispatchTable.swipeInFromLeft;e.firstanimation=t.firstanimation,e.selectedPanel.transform="translateX(-100%)",a.moveToTos(e.selectedPanel,a),e.selectedPanel.style.display="block",e.finishHandler=function(){a.resetPanel(e.selectedPanel,a),a.performCallback(e)},a.performAnimation(e)}swipeOutToLeft(e){let a=e.self;a.resetPanel(e.selectedPanel,a),a.moveToTos(e.selectedPanel,a);let t=a.dispatchTable.swipeOutToLeft;e.firstanimation=t.firstanimation,e.finishHandler=function(){a.moveToBos(e.selectedPanel,a),a.resetPanel(e.selectedPanel,a),a.performCallback(e)},a.performAnimation(e)}swipeInFromRight(e){let a=e.self;a.moveToBos(e.selectedPanel,a),a.resetPanel(e.selectedPanel,a);let t=a.dispatchTable.swipeInFromRight;e.firstanimation=t.firstanimation,e.selectedPanel.transform="translateX(100%)",a.moveToTos(e.selectedPanel,a),e.finishHandler=function(){e.selectedPanel.style.display="block",a.performCallback(e)},a.performAnimation(e)}swipeOutToRight(e){let a=e.self;a.resetPanel(e.selectedPanel,a);let t=a.dispatchTable.swipeOutToRight;e.firstanimation=t.firstanimation,e.finishHandler=function(){a.moveToBos(e.selectedPanel,a),a.resetPanel(e.selectedPanel,a),a.performCallback(e)},a.performAnimation(e)}swipeInFromTop(e){let a=e.self;a.moveToBos(e.selectedPanel,a),a.resetPanel(e.selectedPanel,a);let t=a.dispatchTable.swipeInFromTop;e.firstanimation=t.firstanimation,e.selectedPanel.transform="translateY(100%)",a.moveToTos(e.selectedPanel,a),e.finishHandler=function(){a.resetPanel(e.selectedPanel,a),a.performCallback(e)},a.performAnimation(e)}swipeOutToTop(e){let a=e.self;a.resetPanel(e.selectedPanel,a);let t=a.dispatchTable.swipeOutToTop;e.firstanimation=t.firstanimation,e.finishHandler=function(){a.moveToBos(e.selectedPanel,a),a.resetPanel(e.selectedPanel,a),e.selectedPanel.style.transform="translateY(0%)",a.performCallback(e)},a.performAnimation(e)}zoomIn(e){let a=e.self;a.moveToBos(e.selectedPanel,a),a.resetPanel(e.selectedPanel,a),e.selectedPanel.transform="scale(0)",a.moveToTos(e.selectedPanel,a);let t=a.dispatchTable.zoomIn;e.firstanimation=t.firstanimation,e.finishHandler=function(){a.resetPanel(e.selectedPanel,a),a.performCallback(e)},a.performAnimation(e)}zoomOut(e){let a=e.self;a.resetPanel(e.selectedPanel,a),a.moveToTos(e.selectedPanel,a);let t=a.dispatchTable.zoomOut;e.firstanimation=t.firstanimation,e.finishHandler=function(){a.moveToBos(e.selectedPanel,a),a.resetPanel(e.selectedPanel,a),a.performCallback(e)},a.performAnimation(e)}}