/* @preserve 
 * sic-transit.js 
 * Copyright 2024 by Anthony W. Hursh
 * MIT license.
 * @endpreserve
 */
"use strict";class SicTransit{static allInstances=[];constructor(e,a){if(this.containerId=e,this.container=document.querySelector(e),null===this.container)throw new Error("SicTransit: container "+e+" not found.  SicTransit requires a container element.");if(this.container.classList.add("sic-transit-container"),"."!==a[0])throw new Error("SicTransit: panelClass "+a+" must start with a period.");this.panelClass=a.substring(1),this.panelQuery=a,this.date=new Date,this.loadPanelStack(),this.createOverlayPanels(),SicTransit.allInstances.push(this)}getBos(e=this){if(e.panelStack.length>0)return e.panelStack[0];throw new Error("SicTransit getBos(): trying to get element at bottom of empty stack.")}getContainerId(e=this){return e.containerId}getPanelClass(e=this){return e.panelQuery}getPanelList(e=this){let a=[],t=document.querySelectorAll(e.containerId+" > "+this.panelQuery);for(let e=0;e<t.length;e++)""!==t[e].id&&a.push(t[e].id);return a}getTos(e=this){if(e.panelStack.length>0)return e.panelStack[e.panelStack.length-1];throw new Error("SicTransit getTos(): trying to get element at top of empty stack.")}getTransitionList(e=this){let a=[];for(let t in e.dispatchTable)e.dispatchTable.hasOwnProperty(t)&&a.push(t);return a}getZIndex(e,a=this){let t=this.selectPanel(e,a);return window.getComputedStyle(t).getPropertyValue("z-index")}moveToBos(e,a=this){let t=this.selectPanel(e);a.removeFromStack(t,a),a.panelStack.unshift(t),a.normalizeStack(a)}moveToTos(e,a=this){let t=this.selectPanel(e);a.removeFromStack(t,a),a.panelStack.push(t),a.container.appendChild(t),a.normalizeStack(a)}animationLock=!1;performTransition(e){void 0===e.self&&(e.self=this);let a=e.self;if(!0===a.animationLock)return;a.animationLock=!0;if(!0===(!0===window.matchMedia("(prefers-reduced-motion: reduce)")||!0===window.matchMedia("(prefers-reduced-motion: reduce)").matches)&&(e.transitionName=e.self.dispatchTable[e.transitionName].prefersReducedMotion),a.removeOverlayPanels(a),e.selectedPanel=a.selectPanel(e.panelSelector,a),e.startTime=(new Date).getTime(),void 0===a.dispatchTable[e.transitionName])throw new Error("SicTransit: "+e.transitionName+" is not a recognized transition");e.transitionFunction=a.dispatchTable[e.transitionName].forwardTransition,e.firstanimation=a.dispatchTable[e.transitionName].animation,e.secondanimation=a.dispatchTable[e.transitionName].secondanimation,e.transitionFunction(e)}removePanel(e,a=this){let t=a.selectPanel(e);return null!==t&&(a.removeFromAllStacks(t),t.remove()),t}rotateStack(e){let a,t=e.self;if(a=Number.isInteger(e.stackRotationNumber)?e.stackRotationNumber:1,a>0)for(let e=0;e<a;e++)t.panelStack.unshift(t.panelStack.pop());else if(a<0)for(let e=0;e>a;e--)t.panelStack.push(t.panelStack.shift());t.normalizeStack(t),t.performCallback(e)}setParameter(e,a,t){let n;n=void 0===t||"*"===t?this.getTransitionList(this):[t];for(let t=0;t<n.length;t++)this.dispatchTable[n[t]][e]=a}showPanel(e,a=this){a.transferPanel(e,a),a.moveToTos(e,a)}stackDump(e={self:this}){let a="stackDump:\n";for(const t of e.self.panelStack)a=""!==t.id?a+"id: "+t.id+" display:"+t.style.display+" z-index: "+t.style.zIndex+"\n":a+"class: "+t.className+" display:"+t.style.display+" z-index: "+t.style.zIndex+"\n"}transferPanel(e,a=this){let t=a.selectPanel(e,a);if(null===t)throw new Error("SicTransit transferPanel(): panelSelector "+panelSelector+" is invalid.");a.removePanel(t,this),t.classList.add(a.panelClass,"sic-transit-panel"),a.moveToBos(t,this),a.container.appendChild(t),t.classList.add(a.panelClass,"sic-transit-panel"),t.classList.add(a.panelClass,this.panelClass),a.resetPanel(e,this)}removeFromStack(e,a=this){let t=a.selectPanel(e,a),n=a.panelStack;for(let e=0;e<n.length;e++)if(n[e]===t)return n.splice(e,1),t;return null}removeFromAllStacks(e){for(let a=0;a<SicTransit.allInstances.length;a++)SicTransit.allInstances[a].removeFromStack(e,SicTransit.allInstances[a])}normalizeStack(e=this){let a=e.panelStack,t=0;for(let e=a.length-1;e>=0;e--){a[e].style.zIndex=t,t-=1}}removeOverlayPanels(e=this){e.panelStack=e.panelStack.filter((e=>!e.classList.contains("sic-transit-overlay-panel"))),document.querySelectorAll(".sic-transit-overlay-panel").forEach((e=>e.remove())),e.normalizeStack(e)}selectPanel(e,a=this){if(void 0===e||""===e)return a.getTos(a);if(e instanceof HTMLElement)return e;if(Number.isInteger(e)){if(e>0){if(e<a.panelStack.length)return a.panelStack[e];throw new Error("SicTransit selectPanel(): panel index "+e+" is outside the bounds of the panelStack.");return null}if(e<0){let t=a.panelStack.length+(e-1);if(t>=0)return a.panelStack[t];throw new Error("SicTransit selectPanel(): panelStack index "+t+" ("+e+" from top of stack) is outside the bounds of the panelStack.");return null}return a.panelStack[0]}if("string"==typeof e){let a=document.querySelector(e);if(null===a){throw new Error("SicTransit selectPanel(): no panels matching "+e);return null}return a}throw new Error("SicTransit selectPanel(): panelSelector "+e+" is invalid.");return null}dispatchTable={cutIn:{forwardTransition:this.cutIn,firstanimation:[],secondanimation:[],boxShadow:"10px 10px 20px rgba(0,0,0,0.5)",easing:"",duration:0,callback:null,prefersReducedMotion:"cutIn"},cutOut:{forwardTransition:this.cutOut,firstanimation:[],secondanimation:[],boxShadow:"10px 10px 20px rgba(0,0,0,0.5)",easing:"",duration:0,callback:null,prefersReducedMotion:"cutOut"},crossDissolveIn:{forwardTransition:this.crossDissolveIn,firstanimation:[{display:"block",opacity:0},{display:"block",opacity:1}],secondanimation:[{display:"block",opacity:1},{display:"block",opacity:0}],boxShadow:"10px 10px 20px rgba(0,0,0,0.5)",easing:"ease-in-out",duration:2e3,callback:null,prefersReducedMotion:"cutIn"},crossDissolveOut:{forwardTransition:this.crossDissolveOut,firstanimation:[{display:"block",opacity:1},{display:"block",opacity:0}],secondanimation:[{display:"block",opacity:0},{display:"block",opacity:1}],boxShadow:"10px 10px 20px rgba(0,0,0,0.5)",easing:"ease-in-out",duration:2e3,callback:null},fadeInFromBlack:{forwardTransition:this.fadeInFromBlack,firstanimation:[{display:"block",opacity:0},{display:"block",opacity:1}],boxShadow:"10px 10px 20px rgba(0,0,0,0.5)",easing:"ease-in-out",duration:2e3,callback:null,prefersReducedMotion:"cutIn"},fadeOutToBlack:{forwardTransition:this.fadeOutToBlack,firstanimation:[{opacity:1},{opacity:0}],boxShadow:"10px 10px 20px rgba(0,0,0,0.5)",easing:"ease-in-out",duration:2e3,callback:null,prefersReducedMotion:"cutOut"},fadeInFromGray:{forwardTransition:this.fadeInFromGray,firstanimation:[{display:"block",opacity:0},{display:"block",opacity:1}],boxShadow:"10px 10px 20px rgba(0,0,0,0.5)",easing:"ease-in-out",duration:2e3,callback:null,prefersReducedMotion:"cutIn"},fadeOutToGray:{forwardTransition:this.fadeOutToGray,firstanimation:[{opacity:1},{opacity:0}],boxShadow:"10px 10px 20px rgba(0,0,0,0.5)",easing:"ease-in-out",duration:2e3,callback:null,prefersReducedMotion:"cutOut"},fadeInFromWhite:{forwardTransition:this.fadeInFromWhite,firstanimation:[{display:"block",opacity:0},{display:"block",opacity:1}],boxShadow:"10px 10px 20px rgba(0,0,0,0.5)",easing:"ease-in-out",duration:2e3,callback:null,prefersReducedMotion:"cutIn"},fadeOutToWhite:{forwardTransition:this.fadeOutToWhite,firstanimation:[{opacity:1},{opacity:0}],boxShadow:"10px 10px 20px rgba(0,0,0,0.5)",easing:"ease-in-out",duration:2e3,callback:null,prefersReducedMotion:"cutOut"},irisIn:{forwardTransition:this.irisIn,firstanimation:[{display:"block",clipPath:"circle(0% at center"},{display:"block",clipPath:"circle(100% at center)"}],easing:"ease-in-out",duration:1e3,callback:null,prefersReducedMotion:"cutIn"},irisOut:{forwardTransition:this.irisOut,firstanimation:[{display:"block",clipPath:"circle(100% at center"},{display:"block",clipPath:"circle(0% at center)"}],easing:"ease-in-out",duration:1e3,callback:null,prefersReducedMotion:"cutOut"},irisInFromBlack:{forwardTransition:this.irisInFromBlack,easing:"ease-in-out",duration:1e3,callback:null,prefersReducedMotion:"cutIn"},irisOutToBlack:{forwardTransition:this.irisOutToBlack,easing:"ease-in-out",duration:1e3,callback:null,prefersReducedMotion:"cutOut"},irisInFromGray:{forwardTransition:this.irisInFromGray,easing:"ease-in-out",duration:1e3,callback:null,prefersReducedMotion:"cutIn"},irisOutToGray:{forwardTransition:this.irisOutToGray,easing:"ease-in-out",duration:1e3,callback:null,prefersReducedMotion:"cutOut"},irisInFromWhite:{forwardTransition:this.irisInFromWhite,easing:"ease-in-out",duration:1e3,callback:null,prefersReducedMotion:"cutIn"},irisOutToWhite:{forwardTransition:this.irisOutToWhite,easing:"ease-in-out",duration:1e3,callback:null,prefersReducedMotion:"cutOut"},menuInFromBottom:{forwardTransition:this.menuInFromBottom,firstanimation:[{display:"block",transform:"translateY(100%)"},{display:"block",transform:"translateY(%%%)"}],boxShadow:"-10px -10px 30px rgba(0,0,0,0.5)",easing:"ease-in-out",duration:500,menuSize:3,callback:null,prefersReducedMotion:"menuInFromBottomReduced"},menuInFromBottomReduced:{forwardTransition:this.menuInFromBottomReduced,callback:null},menuOutToBottom:{forwardTransition:this.menuOutToBottom,firstanimation:[{transform:"translateY(%%%)"},{transform:"translateY(100%)"}],boxShadow:"-10px -10px 20px rgba(0,0,0,0.5)",easing:"ease-in-out",duration:500,menuSize:3,callback:null,prefersReducedMotion:"menuOutToBottomReduced"},menuOutToBottomReduced:{forwardTransition:this.menuOutToBottomReduced,callback:null},menuInFromLeft:{forwardTransition:this.menuInFromLeft,firstanimation:[{display:"block",transform:"translateX(-100%)"},{display:"block",transform:"translateX(%%%)"}],boxShadow:"10px 20px 20px 30px rgba(0,0,0,0.5)",easing:"ease-in-out",duration:500,menuSize:12,callback:null,prefersReducedMotion:"menuInFromLeftReduced"},menuInFromLeftReduced:{forwardTransition:this.menuInFromLeftReduced,callback:null},menuOutToLeft:{forwardTransition:this.menuOutToLeft,firstanimation:[{display:"block",transform:"translateX(%%%)"},{display:"block",transform:"translateX(-100%)"}],boxShadow:"10px 20px 20px 30px rgba(0,0,0,0.5)",easing:"ease-in-out",duration:500,menuSize:12,callback:null,prefersReducedMotion:"menuOutToLeftReduced"},menuOutToLeftReduced:{forwardTransition:this.menuOutToLeftReduced,callback:null},menuInFromRight:{forwardTransition:this.menuInFromRight,firstanimation:[{display:"block",transform:"translateX(100%)"},{display:"block",transform:"translateX(%%%)"}],boxShadow:"-10px -10px 20px 30px rgba(0,0,0,0.5)",easing:"ease-in-out",duration:500,menuSize:12,callback:null,prefersReducedMotion:"menuInFromRightReduced"},menuInFromRightReduced:{forwardTransition:this.menuInFromRightReduced,callback:null},menuOutToRight:{forwardTransition:this.menuOutToRight,firstanimation:[{transform:"translateX(%%%)"},{transform:"translateX(100%)"}],boxShadow:"-10px -10px 20px 30px rgba(0,0,0,0.5)",easing:"ease-in-out",duration:500,menuSize:12,callback:null,prefersReducedMotion:"menuOutToRightReduced"},menuOutToRightReduced:{forwardTransition:this.menuOutToRightReduced,callback:null},menuInFromTop:{forwardTransition:this.menuInFromTop,firstanimation:[{display:"block",transform:"translateY(-100%)"},{display:"block",transform:"translateY(%%%)"}],boxShadow:"10px 10px 20px rgba(0,0,0,0.5)",easing:"ease-in-out",duration:500,menuSize:3,callback:null,prefersReducedMotion:"menuInFromTopReduced"},menuInFromTopReduced:{forwardTransition:this.menuInFromTopReduced,callback:null},menuOutToTop:{forwardTransition:this.menuOutToTop,firstanimation:[{transform:"translateY(%%%)"},{transform:"translateY(-100%)"}],boxShadow:"10px 10px 20px rgba(0,0,0,0.5)",easing:"ease-in-out",duration:500,menuSize:3,callback:null,prefersReducedMotion:"menuOutToTopReduced"},menuOutToTopReduced:{forwardTransition:this.menuOutToTopReduced,callback:null},spinIn:{forwardTransition:this.spinIn,firstanimation:[{display:"block",transform:"rotate(0deg) scale(0)"},{display:"block",transform:"rotate(720deg) scale(1)"}],boxShadow:"10px 10px 20px rgba(0,0,0,0.5)",easing:"ease-in-out",duration:1e3,callback:null,prefersReducedMotion:"cutIn"},spinOut:{forwardTransition:this.spinOut,firstanimation:[{display:"block",transform:"rotate(0deg)  scale(1)"},{display:"block",transform:"rotate(-720deg) scale(0)"}],boxShadow:"10px 10px 20px rgba(0,0,0,0.5)",easing:"ease-in-out",duration:1e3,callback:null,prefersReducedMotion:"cutOut"},rotateStack:{forwardTransition:this.rotateStack,firstanimation:[],boxShadow:"",easing:"",duration:0,callback:null},swap:{forwardTransition:this.swap,firstanimation:[],callback:null},swipeInFromBottom:{forwardTransition:this.swipeInFromBottom,firstanimation:[{display:"block",transform:"translateY(100%)"},{display:"block",transform:"translateY(0%)"}],boxShadow:"-10px -10px 30px rgba(0,0,0,0.5)",easing:"ease-in-out",duration:500,callback:null,prefersReducedMotion:"cutIn"},swipeOutToBottom:{forwardTransition:this.swipeOutToBottom,firstanimation:[{transform:"translateY(0%)"},{transform:"translateY(100%)"}],boxShadow:"-10px -10px 20px rgba(0,0,0,0.5)",easing:"ease-in-out",duration:500,callback:null,prefersReducedMotion:"cutOut"},swipeInFromLeft:{forwardTransition:this.swipeInFromLeft,firstanimation:[{display:"block",transform:"translateX(-100%)"},{display:"block",transform:"translateX(0%)"}],boxShadow:"10px 20px 20px 30px rgba(0,0,0,0.5)",easing:"ease-in-out",duration:500,callback:null,prefersReducedMotion:"cutIn"},swipeOutToLeft:{forwardTransition:this.swipeOutToLeft,firstanimation:[{display:"block",transform:"translateX(0%)"},{display:"block",transform:"translateX(-120%)"}],boxShadow:"10px 20px 20px 30px rgba(0,0,0,0.5)",easing:"ease-in-out",duration:500,callback:null,prefersReducedMotion:"cutOut"},swipeInFromRight:{forwardTransition:this.swipeInFromRight,firstanimation:[{display:"block",transform:"translateX(100%)"},{display:"block",transform:"translateX(0%)"}],boxShadow:"-10px -10px 20px 30px rgba(0,0,0,0.5)",easing:"ease-in-out",duration:500,callback:null,prefersReducedMotion:"cutIn"},swipeOutToRight:{forwardTransition:this.swipeOutToRight,firstanimation:[{transform:"translateX(0%)"},{transform:"translateX(120%)"}],boxShadow:"-10px -10px 20px 30px rgba(0,0,0,0.5)",easing:"ease-in-out",duration:500,callback:null,prefersReducedMotion:"cutOut"},swipeInFromTop:{forwardTransition:this.swipeInFromTop,firstanimation:[{display:"block",transform:"translateY(-100%)"},{display:"block",transform:"translateY(0%)"}],boxShadow:"10px 10px 20px rgba(0,0,0,0.5)",easing:"ease-in-out",duration:500,callback:null,prefersReducedMotion:"cutIn"},swipeOutToTop:{forwardTransition:this.swipeOutToTop,firstanimation:[{transform:"translateY(0%)"},{transform:"translateY(-100%)"}],boxShadow:"10px 10px 20px rgba(0,0,0,0.5)",easing:"ease-in-out",duration:500,callback:null,prefersReducedMotion:"cutOut"},zoomIn:{forwardTransition:this.zoomIn,firstanimation:[{display:"block",transform:"scale(0)"},{display:"block",transform:"scale(1)"}],boxShadow:"10px 10px 20px rgba(0,0,0,0.5)",easing:"ease-in-out",duration:500,callback:null,prefersReducedMotion:"cutIn"},zoomOut:{forwardTransition:this.zoomOut,firstanimation:[{display:"block",transform:"scale(1)"},{display:"block",transform:"scale(0)"}],boxShadow:"10px 10px 20px rgba(0,0,0,0.5)",easing:"ease-in-out",duration:500,callback:null,prefersReducedMotion:"cutIn"}};createOverlayPanels(){let e;this.specialtyPanels={};["blackpanel","graypanel","whitepanel"].forEach((a=>{e=document.createElement("div"),this.specialtyPanels[a]=e,e.classList.add(this.panelClass,"sic-transit-panel","sic-transit-"+a,"sic-transit-overlay-panel")})),this.normalizeStack()}resetPanel(e,a=this){let t=a.selectPanel(e,a);t.style.display="block",t.style.opacity=1,t.style.removeProperty("transform"),t.style.removeProperty("transformOrigin"),t.style.removeProperty("clip-path"),t.style.animationFillMode="none",t.classList.remove("sic-transit-menupanel"),t.classList.remove("sic-transit-leftmenupanel"),t.classList.remove("sic-transit-rightmenupanel"),t.classList.remove("sic-transit-topmenupanel"),t.classList.remove("sic-transit-bottommenupanel")}loadPanelStack(e=this){e.panelStack=[];const a=document.querySelectorAll(e.containerId+" > "+e.panelQuery);e.panelStack=[...a];for(let a=0;a<e.panelStack.length;a++)e.panelStack[a].classList.add("sic-transit-panel");e.normalizeStack(e)}async performAnimation(e){let a=e.self,t=a.dispatchTable[e.transitionName];a.moveToTos(e.selectedPanel,a);const n=e.selectedPanel.animate(e.firstanimation,{easing:t.easing,duration:t.duration,fill:"forwards"});await n.finished,n.commitStyles(),n.cancel(),e.finishHandler()}performCallback(e){const a=e.self;a.animationLock=!1;let t=a.dispatchTable[e.transitionName];null!==t.callback&&(e.endTime=(new Date).getTime(),t.callback(e))}stackSwap(e=this){if(e.panelStack.length<2){throw new Error("SicTransit stackSwap(): can't swap when length of panelStack is < 2.");return}let a=e.panelStack.pop();e.resetPanel(a,e);let t=e.panelStack.pop();e.resetPanel(t,e),e.panelStack.push(a),e.panelStack.push(t),e.normalizeStack(e)}cutIn(e){let a=e.self;a.resetPanel(e.selectedPanel,a),a.showPanel(e.selectedPanel,a),a.performCallback(e)}cutOut(e){let a=e.self;a.moveToBos(e.selectedPanel,a),a.resetPanel(e.selectedPanel,a),a.performCallback(e)}async crossDissolveIn(e){let a=e.self,t=a.dispatchTable[e.transitionName];a.moveToBos(e.selectedPanel,a);let n=a.panelStack.pop();a.panelStack.push(a.specialtyPanels.graypanel),a.panelStack.push(n),a.resetPanel(n,a),a.resetPanel(e.selectedPanel,a),a.moveToTos(e.selectedPanel,a),e.finishHandler=function(){a.resetPanel(e.selectedPanel,a),a.normalizeStack(a),a.performCallback(e)};const l=e.selectedPanel.animate(t.firstanimation,{easing:t.easing,duration:t.duration+100,fill:"forwards"}),s=n.animate(t.secondanimation,{easing:t.easing,duration:t.duration,fill:"forwards"});await l.finished,l.commitStyles(),l.cancel(),await s.finished,s.commitStyles(),s.cancel(),e.finishHandler()}async crossDissolveOut(e){let a=e.self;e.transitionName="crossDissolveIn";let t=e.selectedPanel;a.moveToBos(t,a),e.selectedPanel=a.panelStack.pop(),a.moveToTos(t,a),a.crossDissolveIn(e)}doFadeIn(e){let a=e.self;a.resetPanel(e.fadePanel,a),a.moveToTos(e.fadePanel,a),a.container.append(e.fadePanel),a.resetPanel(e.selectedPanel,a),e.selectedPanel.style.opacity=0,a.moveToTos(e.selectedPanel,a),e.finishHandler=function(){a.moveToBos(e.fadePanel,a),a.performCallback(e)},a.performAnimation(e)}doFadeOut(e){let a=e.self;a.resetPanel(e.selectedPanel,a),e.fadePanel.style.opacity=0,a.container.append(e.fadePanel);let t=e.selectedPanel;e.selectedPanel=e.fadePanel,e.fadePanel=t,a.doFadeIn(e)}fadeInFromBlack(e){let a=e.self;e.firstanimation=a.dispatchTable.fadeInFromBlack.firstanimation,e.fadePanel=a.specialtyPanels.blackpanel,a.doFadeIn(e)}fadeOutToBlack(e){let a=e.self;e.firstanimation=a.dispatchTable.fadeInFromBlack.firstanimation,e.fadePanel=a.specialtyPanels.blackpanel,a.doFadeOut(e)}fadeInFromGray(e){let a=e.self;e.firstanimation=a.dispatchTable.fadeInFromGray.firstanimation,e.fadePanel=a.specialtyPanels.graypanel,a.doFadeIn(e)}fadeOutToGray(e){let a=e.self;e.firstanimation=a.dispatchTable.fadeInFromGray.firstanimation,e.fadePanel=a.specialtyPanels.graypanel,a.doFadeOut(e)}fadeInFromWhite(e){let a=e.self,t=a.dispatchTable.fadeInFromWhite;e.firstanimation=t.firstanimation,e.fadePanel=a.specialtyPanels.whitepanel,a.doFadeIn(e)}fadeOutToWhite(e){let a=e.self;e.firstanimation=a.dispatchTable.fadeInFromWhite.firstanimation,e.fadePanel=a.specialtyPanels.whitepanel,a.doFadeOut(e)}getElementDiagonal(e){let a=getComputedStyle(e),t=parseInt(a.width),n=parseInt(a.height);return Math.ceil(Math.sqrt(t*t+n*n))}irisIn(e){let a=e.self,t=a.dispatchTable.irisIn,n=e.selectedPanel;a.resetPanel(n,a),n.style.clipPath="circle(0% at center)",n.style.display="block",a.moveToTos(n,a),e.firstanimation=t.firstanimation,e.finishHandler=function(){n.style.display="block",n.style.clipPath="none",a.performCallback(e)},a.performAnimation(e)}irisOut(e){let a=e.self,t=a.dispatchTable.irisOut,n=e.selectedPanel;a.resetPanel(n,a),n.style.clipPath="circle(100% at center)",n.style.display="block",a.moveToTos(n,a),e.firstanimation=t.firstanimation,e.finishHandler=function(){a.moveToBos(n,a),n.style.removeProperty("clip-path"),a.performCallback(e)},a.performAnimation(e)}irisInFromBlack(e){let a=e.self;a.container.append(a.specialtyPanels.blackpanel),a.moveToTos(a.specialtyPanels.blackpanel),a.irisIn(e)}irisOutToBlack(e){let a=e.self;a.specialtyPanels.blackpanel.style.display="none",a.moveToTos(a.specialtyPanels.blackpanel,a),a.container.append(a.specialtyPanels.blackpanel),a.normalizeStack(),a.specialtyPanels.blackpanel.style.display="block",a.irisOut(e)}irisInFromGray(e){let a=e.self;a.moveToTos(a.specialtyPanels.graypanel),a.container.append(a.specialtyPanels.graypanel),a.irisIn(e)}irisOutToGray(e){let a=e.self;a.specialtyPanels.graypanel.style.display="none",a.moveToTos(a.specialtyPanels.graypanel,a),a.container.append(a.specialtyPanels.graypanel),a.normalizeStack(),a.specialtyPanels.graypanel.style.display="block",a.irisOut(e)}irisInFromWhite(e){let a=e.self;a.moveToTos(a.specialtyPanels.whitepanel),a.container.append(a.specialtyPanels.whitepanel),a.irisIn(e)}irisOutToWhite(e){let a=e.self;a.specialtyPanels.whitepanel.style.display="none",a.moveToTos(a.specialtyPanels.whitepanel,a),a.container.append(a.specialtyPanels.whitepanel),a.normalizeStack(),a.specialtyPanels.whitepanel.style.display="block",a.irisOut(e)}menuInFromBottom(e){let a=e.self;a.moveToBos(e.selectedPanel,a),a.resetPanel(e.selectedPanel,a),e.selectedPanel.classList.add("sic-transit-menupanel"),e.selectedPanel.classList.add("sic-transit-bottommenupanel");let t=a.dispatchTable.menuInFromBottom,n="calc(100% - "+t.menuSize+"em)";e.selectedPanel.style.transform="translateY(100%)";let l=e.selectedPanel.querySelector(".sic-transit-menupanel .sic-transit-menucontainer");null!==l&&(l.style.width="100%"),a.moveToTos(e.selectedPanel,a),e.firstanimation=JSON.parse(JSON.stringify(t.firstanimation).replace("%%%",n)),e.finishHandler=function(){a.moveToTos(e.selectedPanel,a),e.selectedPanel.style.display="block",e.selectedPanel.style.transform="translateY("+n+")",a.performCallback(e)},a.performAnimation(e)}menuInFromBottomReduced(e){let a=e.self;a.moveToBos(e.selectedPanel,a),a.resetPanel(e.selectedPanel,a),e.selectedPanel.classList.add("sic-transit-menupanel"),e.selectedPanel.classList.add("sic-transit-bottommenupanel");let t=e.selectedPanel.querySelector(".sic-transit-menupanel .sic-transit-menucontainer");null!==t&&(t.style.width="100%");let n="calc(100% - "+a.dispatchTable.menuInFromBottom.menuSize+"em)";e.selectedPanel.style.transform="translateY("+n+")",a.moveToTos(e.selectedPanel,a),e.selectedPanel.style.display="block",a.performCallback(e)}menuOutToBottom(e){let a=e.self;a.moveToTos(e.selectedPanel,a);let t=a.dispatchTable.menuOutToBottom,n="calc(100% - "+t.menuSize+"em)";e.selectedPanel.style.transform="translateY("+n+")",e.firstanimation=JSON.parse(JSON.stringify(t.firstanimation).replace("%%%",n)),e.finishHandler=function(){a.moveToBos(e.selectedPanel,a),a.resetPanel(e.selectedPanel,a),a.performCallback(e)},a.performAnimation(e)}menuOutToBottomReduced(e){let a=e.self;a.moveToBos(e.selectedPanel,a),a.resetPanel(e.selectedPanel,a),e.selectedPanel.style.transform="translateY(100%)",a.performCallback(e)}menuInFromLeft(e){let a=e.self;a.moveToBos(e.selectedPanel,a),a.resetPanel(e.selectedPanel,a),e.selectedPanel.classList.add("sic-transit-menupanel"),e.selectedPanel.classList.add("sic-transit-leftmenupanel");let t=a.dispatchTable.menuInFromLeft,n=t.menuSize,l="calc(-100% + "+n+"em)";e.firstanimation=JSON.parse(JSON.stringify(t.firstanimation).replace("%%%",l)),e.selectedPanel.style.transform="translateX(-100%)";let s=e.selectedPanel.querySelector(".sic-transit-menupanel .sic-transit-menucontainer");null!==s&&(s.style.width=n-1+"em"),a.moveToTos(e.selectedPanel,a),e.finishHandler=function(){e.selectedPanel.style.display="block",e.selectedPanel.style.transform="translateX("+l+")",a.performCallback(e)},a.performAnimation(e)}menuInFromLeftReduced(e){let a=e.self;a.moveToBos(e.selectedPanel,a),a.resetPanel(e.selectedPanel,a),e.selectedPanel.classList.add("sic-transit-menupanel"),e.selectedPanel.classList.add("sic-transit-leftmenupanel");let t=a.dispatchTable.menuInFromLeft.menuSize,n=e.selectedPanel.querySelector(".sic-transit-menupanel .sic-transit-menucontainer");null!==n&&(n.style.width="calc("+t+"em - 1em)");let l="translateX("+("calc(-100% + "+t+"em)")+")";e.selectedPanel.style.transform=l,a.moveToTos(e.selectedPanel,a),e.selectedPanel.style.display="block",a.performCallback(e)}menuOutToLeft(e){let a=e.self,t=a.dispatchTable.menuOutToLeft,n="calc(-100% + "+t.menuSize+"em)";e.firstanimation=JSON.parse(JSON.stringify(t.firstanimation).replace("%%%",n));let l="translateX("+n+")";e.selectedPanel.style.transform=l,e.finishHandler=function(){a.moveToBos(e.selectedPanel,a),a.resetPanel(e.selectedPanel,a),a.performCallback(e)},a.performAnimation(e)}menuOutToLeftReduced(e){let a=e.self;a.moveToBos(e.selectedPanel,a),a.resetPanel(e.selectedPanel,a),e.selectedPanel.style.transform="translateX(-100%)",a.performCallback(e)}menuInFromRight(e){let a=e.self;a.moveToBos(e.selectedPanel,a),a.resetPanel(e.selectedPanel,a),e.selectedPanel.classList.add("sic-transit-menupanel"),e.selectedPanel.classList.add("sic-transit-rightmenupanel");let t=a.dispatchTable.menuInFromRight,n=t.menuSize,l="calc(100% - "+n+"em)";e.firstanimation=JSON.parse(JSON.stringify(t.firstanimation).replace("%%%",l)),e.selectedPanel.style.transform="translateX(100%)";let s=e.selectedPanel.querySelector(".sic-transit-menupanel .sic-transit-menucontainer");null!==s&&(s.style.width="calc("+n+"em - 1em)"),a.moveToTos(e.selectedPanel,a),e.finishHandler=function(){e.selectedPanel.style.display="block",e.selectedPanel.style.transform="translateX("+l+")",a.performCallback(e)},a.performAnimation(e)}menuInFromRightReduced(e){let a=e.self;a.moveToBos(e.selectedPanel,a),a.resetPanel(e.selectedPanel,a);let t=a.dispatchTable.menuInFromRight.menuSize,n="calc(100% - "+t+"em)";e.selectedPanel.style.transform="translateX("+n+")",e.selectedPanel.classList.add("sic-transit-menupanel"),e.selectedPanel.classList.add("sic-transit-rightmenupanel");let l=e.selectedPanel.querySelector(".sic-transit-menupanel .sic-transit-menucontainer");null!==l&&(l.style.width="calc("+t+"em - 1em)"),a.moveToTos(e.selectedPanel,a),e.selectedPanel.style.display="block",a.performCallback(e)}menuOutToRight(e){let a=e.self,t=a.dispatchTable.menuOutToRight,n="calc(100% - "+t.menuSize+"em)";e.firstanimation=JSON.parse(JSON.stringify(t.firstanimation).replace("%%%",n)),e.finishHandler=function(){a.moveToBos(e.selectedPanel,a),a.resetPanel(e.selectedPanel,a),a.performCallback(e)},a.performAnimation(e)}menuOutToRightReduced(e){let a=e.self;a.moveToBos(e.selectedPanel,a),a.resetPanel(e.selectedPanel,a),e.selectedPanel.style.transform="translateX(100%)",a.performCallback(e)}menuInFromTop(e){let a=e.self;a.moveToBos(e.selectedPanel,a),a.resetPanel(e.selectedPanel,a),e.selectedPanel.classList.add("sic-transit-menupanel"),e.selectedPanel.classList.add("sic-transit-topmenupanel");let t=e.selectedPanel.querySelector(".sic-transit-menupanel .sic-transit-menucontainer");null!==t&&(t.style.width="100%");let n=a.dispatchTable.menuInFromTop,l="calc(-100% + "+n.menuSize+"em)";e.firstanimation=JSON.parse(JSON.stringify(n.firstanimation).replace("%%%",l)),e.selectedPanel.transform="translateY(-100%)",a.moveToTos(e.selectedPanel,a),e.finishHandler=function(){e.selectedPanel.style.transform="translateY("+l+")",e.selectedPanel.style.display="block",a.performCallback(e)},a.performAnimation(e)}menuInFromTopReduced(e){let a=e.self;a.moveToBos(e.selectedPanel,a),a.resetPanel(e.selectedPanel,a),e.selectedPanel.classList.add("sic-transit-menupanel"),e.selectedPanel.classList.add("sic-transit-topmenupanel");let t=e.selectedPanel.querySelector(".sic-transit-menupanel .sic-transit-menucontainer");null!==t&&(t.style.width="100%");let n="translateY("+("calc(-100% + "+a.dispatchTable.menuInFromTop.menuSize+"em)")+")";e.selectedPanel.style.transform=n,a.moveToTos(e.selectedPanel,a),e.selectedPanel.style.display="block",a.performCallback(e)}menuOutToTop(e){let a=e.self,t=a.dispatchTable.menuOutToTop,n="calc(-100% + "+t.menuSize+"em)";e.firstanimation=JSON.parse(JSON.stringify(t.firstanimation).replace("%%%",n)),e.finishHandler=function(){a.moveToBos(e.selectedPanel,a),a.resetPanel(e.selectedPanel,a),a.performCallback(e)},a.performAnimation(e)}menuOutToTopReduced(e){let a=e.self;a.moveToBos(e.selectedPanel,a),a.resetPanel(e.selectedPanel,a),e.selectedPanel.style.transform="translateY(-100%)",a.performCallback(e)}spinIn(e){let a=e.self;a.moveToBos(e.selectedPanel,a),a.resetPanel(e.selectedPanel,a),e.selectedPanel.style.transform="scale(0)",a.moveToTos(e.selectedPanel,a);let t=a.dispatchTable.spinIn;e.firstanimation=t.firstanimation,e.finishHandler=function(){a.resetPanel(e.selectedPanel,a),a.performCallback(e)},a.performAnimation(e)}spinOut(e){let a=e.self;a.resetPanel(e.selectedPanel,a);let t=a.dispatchTable.spinOut;e.firstanimation=t.firstanimation,e.finishHandler=function(){a.moveToBos(e.selectedPanel,a),a.resetPanel(e.selectedPanel,a),a.performCallback(e)},a.performAnimation(e)}swap(e){let a=e.self;a.stackSwap(a),a.normalizeStack(),a.performCallback(e)}swipeInFromBottom(e){let a=e.self;a.moveToBos(e.selectedPanel,a),a.resetPanel(e.selectedPanel,a);let t=a.dispatchTable.swipeInFromBottom;e.firstanimation=t.firstanimation,e.selectedPanel.transform="translateY(100%)",a.moveToTos(e.selectedPanel,a),e.finishHandler=function(){a.resetPanel(e.selectedPanel,a),a.performCallback(e)},a.performAnimation(e)}swipeOutToBottom(e){let a=e.self;a.resetPanel(e.selectedPanel,a),a.moveToTos(e.selectedPanel,a);let t=a.dispatchTable.swipeOutToBottom;e.firstanimation=t.firstanimation,e.finishHandler=function(){a.moveToBos(e.selectedPanel,a),a.resetPanel(e.selectedPanel,a),a.performCallback(e)},a.performAnimation(e)}swipeInFromLeft(e){let a=e.self;a.moveToBos(e.selectedPanel,a),a.resetPanel(e.selectedPanel,a);let t=a.dispatchTable.swipeInFromLeft;e.firstanimation=t.firstanimation,e.selectedPanel.transform="translateX(-100%)",a.moveToTos(e.selectedPanel,a),e.selectedPanel.style.display="block",e.finishHandler=function(){a.resetPanel(e.selectedPanel,a),a.performCallback(e)},a.performAnimation(e)}swipeOutToLeft(e){let a=e.self;a.resetPanel(e.selectedPanel,a),a.moveToTos(e.selectedPanel,a);let t=a.dispatchTable.swipeOutToLeft;e.firstanimation=t.firstanimation,e.finishHandler=function(){a.moveToBos(e.selectedPanel,a),a.resetPanel(e.selectedPanel,a),a.performCallback(e)},a.performAnimation(e)}swipeInFromRight(e){let a=e.self;a.moveToBos(e.selectedPanel,a),a.resetPanel(e.selectedPanel,a);let t=a.dispatchTable.swipeInFromRight;e.firstanimation=t.firstanimation,e.selectedPanel.transform="translateX(100%)",a.moveToTos(e.selectedPanel,a),e.finishHandler=function(){e.selectedPanel.style.display="block",a.performCallback(e)},a.performAnimation(e)}swipeOutToRight(e){let a=e.self;a.resetPanel(e.selectedPanel,a);let t=a.dispatchTable.swipeOutToRight;e.firstanimation=t.firstanimation,e.finishHandler=function(){a.moveToBos(e.selectedPanel,a),a.resetPanel(e.selectedPanel,a),a.performCallback(e)},a.performAnimation(e)}swipeInFromTop(e){let a=e.self;a.moveToBos(e.selectedPanel,a),a.resetPanel(e.selectedPanel,a);let t=a.dispatchTable.swipeInFromTop;e.firstanimation=t.firstanimation,e.selectedPanel.transform="translateY(100%)",a.moveToTos(e.selectedPanel,a),e.finishHandler=function(){a.resetPanel(e.selectedPanel,a),a.performCallback(e)},a.performAnimation(e)}swipeOutToTop(e){let a=e.self;a.resetPanel(e.selectedPanel,a);let t=a.dispatchTable.swipeOutToTop;e.firstanimation=t.firstanimation,e.finishHandler=function(){a.moveToBos(e.selectedPanel,a),a.resetPanel(e.selectedPanel,a),e.selectedPanel.style.transform="translateY(0%)",a.performCallback(e)},a.performAnimation(e)}zoomIn(e){let a=e.self;a.moveToBos(e.selectedPanel,a),a.resetPanel(e.selectedPanel,a),e.selectedPanel.transform="scale(0)",a.moveToTos(e.selectedPanel,a);let t=a.dispatchTable.zoomIn;e.firstanimation=t.firstanimation,e.finishHandler=function(){a.resetPanel(e.selectedPanel,a),a.performCallback(e)},a.performAnimation(e)}zoomOut(e){let a=e.self;a.resetPanel(e.selectedPanel,a),a.moveToTos(e.selectedPanel,a);let t=a.dispatchTable.zoomOut;e.firstanimation=t.firstanimation,e.finishHandler=function(){a.moveToBos(e.selectedPanel,a),a.resetPanel(e.selectedPanel,a),a.performCallback(e)},a.performAnimation(e)}}