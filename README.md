# SicTransit JavaScript Library

`SicTransit` is an MIT-licensed, dependency-free library that provides a versatile set of animated transitions for HTML elements within a specified container. It is primarily designed to provide screen transitions for web-based mobile applications.

## Features
- Pure JavaScript and CSS with NO dependencies.
- Numerous avalable transitions including cuts, dissolves, fades, flips, hinges, slides, irises, zooms, and more.
- Easy addition and removal of custom screen panels.
- Customizable animation duration, easing, and more.

## Quick Start Example

#### 
```html
<!DOCTYPE html>
  <head>
    <link rel="stylesheet" href="sic-transit.css">
    <script type="text/javascript" src="sic-transit.js"></script>
  </head>
<div id='mycontainer'>
    <div id='slide1' class='mypanelclass'>
        Hi!
    </div>
    <div id='slide2' class='mypanelclass'>
        Bonjour!
    </div>
    <div id='slide3' class='mypanelclass'>
        Hola!
    </div>
    <div id='slide4' class='mypanelclass'>
       G'day, mate!
    </div>
    <script type="javascript">
        const mySic = new SicTransit("#mycontainer",".mypanelclass");
    </script>
</html>
```

The line:
```javascript
const mySic = new SicTransit("#mycontainer",".mypanelclass");
```

creates a new instance of SicTransit and makes it ready for use.The elements with class `.mypanelclass` inside the div `#mycontainer` will be set up as SicTransit panels. The last one in the container (in this case `#panel4`) will be placed at the top of the internal stack and made visible.

Now you can use JavaScript to control the panels. Open a JavaScript console and enter:

```javascript
mySic.performTransition({panelSelector:"#slide2",transitionName:"wipeInFromLeft"})
```

The transition should run, with Slide 2 sliding in from the left.

Now try: 

```javascript
mySic.performTransition({panelSelector:"#slide2",transitionName:"wipeOutToToLeft"})
```

As you might expect, the `wipeOutToToLeft` transition does the opposite of the `wipeInFromLeft` transition, effectively undoing the previous transition.

All of the available transitions are fully described below. There are other parameters you can use in `performTransition()` as well. Those are also described below.

## Mode of Operation
SicTransit relies on a user-specified container `div` that contains other `div`s which function as movable "panels". SicTransit uses an internal stack to manipulate and display panels by setting their z-index values and other CSS parameters. SicTransit transitions manipulate the panel stack in different ways, causing panels to appear, disappear, move, and so on. 

## Initialization

```javascript
const variablename = new SicTransit(containerId, elementClass);
```
`containerId`: The ID of the container div that holds the panels.

`elementClass`: The user-specified class for panels. Panels are  `div`s with the given class, which are nested within the div with id `containerID`. Using different classes (and container ids) will let you have more than one instance of SicTransit on the same page.

Place all your initial panel `div`s within the container `div` you're planning to use (don't worry, you can add or remove panels later -- see below).
## Public Methods

### Selectors

Many of the public methods take a `selector` argument to specify a particular panel. The following examples use the `displayPanel()` method for ease of understanding.

A selector can be any of the following:
1) An explicit raw DOM element. Example:

```javascript
let newpanel =  document.createElement('div');
// newpanel is now a new raw DOM element.
mySic.showPanel({panelSelector:newpanel});
```

Here we're creating a new DOM element, and passing it directly to `displayPanel()`.

2) A query selector (with the same basic syntax as document.querySelector() and CSS).

Examples:

```javascript
let newpanel =  document.createElement('div');
newpanel.id = 'myNewPanel';
mySic.showPanel({panelSelector:'#myNewPanel'}); // display it using the id as a selector.


let secondnewpanel = document.createElement('div');
secondnewpanel.classList.add('secondclass'); // give it a custom class.
mySic.displayPanel({panelSelector:'.secondclass'}); // display it using the custom class as a  selector.
```
3) A numeric index into the internal panel stack. A negative value (or "negative zero") denotes an offset from the top of the stack, while a positive or positive zero value indicates an offset from the bottom of the stack.

Examples:

```javascript
mySic.displayPanel({panelSelector:-1}) // move the panel one down from the top of the stack to the top of the stack and display it.

mySic.displayPanel({panelSelector:1}) // move the panel one up from the bottom of the stack to the top of the stack and display it.

mySic.displayPanel({panelSelector:0}) // move the panel at the bottom of the stack to the top of the stack and display it.

mySic.displayPanel({panelSelector:-0}) // move the panel at the top of the stack to the top of the stack and display it. This obviously has no real effect with `displayPanel()`, but will with some of the other methods.
```

### `getBos()`
Returns the panel currently at the bottom of the panel stack.

### `getContainerId()`
Returns the user-specified ID for the panel container. See *Initialization*, above.

### `getPanelClass()`
Returns the user-specified CSS class used to identify the panels that belong to this instance of SicTransit. See *Initialization*, above.

### `getTransitionList()`
Returns an array containing the names of all defined transitions.

### `getPanelList()`
Returns an array of the ids of panels within the panel container. Note that this does **not** include the special internal panels used to implement certain effects, as those do not have ids, nor does it include user-created panels that likewise don't have ids (user-created panels with ids will be included);

### `getTos()`
Returns the panel currently at the top of the panel stack.

### `performTransition(args)`
The heart of Sic Transit. Each transition is documented in detail in the *Transitions* section below.

### `setParameter(parametername, parametervalue,transitionname)`
Sets the given parameter name to the given value for the given transition name. If the transition name is "\*" (in quotes), or not supplied, the specified parameter is set to the supplied value for *all* transitions.

Some commonly used parameters include:

`duration` -- set the duration of the transition in milliseconds.

`callback` -- sets a user-written function that is called when the transition is complete. Default is null.

`menuPercentage` -- controls the percentage of the screen covered by menus. Only really relevant for the "menu-" transitions (see below).

There are several other parameters that might be of interest to advanced users (or those defining their own custom transtitions). See the `dispatchTable` object in `sic-transit.js` to learn more.

Examples:

Set the duration for the `wipeInFromLeft` transition to 3 seconds (3000 ms), rather than the default 500 ms:

```javascript
mySic.setParameter("duration",3000,"wipeInFromLeft");
```

Set the menu percentage (i.e., the proportion of the screen covered by a menu) to 50% for the `wipeInFromTop` and `wipeOutToTop` transitions:

```javascript
mySic.setParameter("menuPercentage",50,"menuInFromTop");
mySic.setParameter("menuPercentage",50,"menuOutToTop");

```

Notes: While menuPercentage can be set for any transition, it only has any real effect for the menu transitions. Also, in general, you're going to want to use the same menuPercentage for `menuInFrom` and `menuOutTo` pairs. Unexpected behavior may occur if the two values aren't the same.

#### Callbacks

The `setParameter` method can be used to set a callback method that will be called when a transition is complete.

Examples:

Set a callback function for the `wipeInFromLeft` transition:

```javascript

// Our callback function
function myCallBackFunc(args){
    alert("Hello from wipeInFromLeft");
}
// Set up the callback.
mySic.setParameter("callback",myCallbackFunc,"wipeInFromLeft");
```

Set a callback function for **all** transitions:

```javascript
function anotherCallBackFunc(args){
    alert("Hello from " + args.transitionName);
}

// Note that we're using "*" here. That specifies that myCallbackFunc should be called for all transitions.
mySic.setParameter("callback",anotherCallbackFunc,"*");
```
Note the use of args.transitionName. The args object passed to a callback has the following data available for use:

    args.transitionName
    args.startTime
    args.endTime
    args.panelSelector
    args.selectedPanel
    args.stackRotationNumber (only valid for the `rotateStack` transition)

Future transitions may define other key/value pairs on the args object.
    
Most of these are self-explanatory. The difference between `panelSelector` and `selectedPanel` is that the first is the selector provided by the user and the second is the panel that was actually selected using that selector. `panelSelector` will be generally a string, an integer, or undefined (for the few transtions that don't use it). `selectedPanel` will be a DOM object.

### `showPanel(selector)`
Move the DOM element with the given selector to the top of the stack and display it. If the DOM element is not already a panel, it will be removed from its current location in the DOM, added to the panel container, and added to the panel stack. The CSS classes required to make it function as a panel will be added automatically, if necessary. See the examples above.

### `stackDump()`
Prints the current state of the panel stack to the console. This is handy if you are debugging a new transition.

### Available Transitions

#### `cutIn/cutOut` 

These transitions make the change immediately, without any animation effects.

```javascript
// Move "#slide2" to the top of the stack and display it immediately.
mySic.performTransition({panelSelector:"#slide2",transitionName:"cutIn"});
```

```javascript
// Move "#slide2" to the bottom of the stack and hide it immediately.The panel previously one down from the top of the stack will become visible.
mySic.performTransition({panelSelector:"#slide2",transitionName:"cutOut"});
```

#### `crossDissolveIn/crossDissolveOut` 

These transitions fade in one panel, while simultaneously fading out another.

```javascript
// Move "#slide2" to the top of the stack and gradually fade it in,
// while fading out the panel which was the previous top of the stack.
mySic.performTransition({panelSelector:"#slide2",transitionName:"crossDissolveIn"});
```

```javascript
// Gradually fade out "#slide2", while fading in the slide underneath it on the stack.
mySic.performTransition({panelSelector:"#slide2",transitionName:"crossDissolveOut"})
```

#### fadeInFrom/fadeOutTo

There are six of these, a fadeIn and a fadeOut each for white, black, and gray. 

```javascript
// Move "#slide2" to the top of the stack and gradually fade it in from a solid black background panel.
mySic.performTransition({panelSelector:"#slide2",transitionName:"fadeInFromBlack"});
```

```javascript
// Gradually fade out "#slide2", until it disappears, leaving a solid black background panel.
mySic.performTransition({panelSelector:"#slide2",transitionName:"fadeOutToBlack"})
```

`fadeInFromWhite`, `fadeOutToWhite`, `fadeInFromGray`, and `fadeOutToGray` are exactly the same, except that they use white and gray panels respectively, rather than black.

#### irisIn, irisInFrom/irisOut,irisOutTo

These transitions involve a growing or shrinking circle through which the panel in question is visible (similar to a "camera iris" effect). `irisIn` and `irisOut` work with whatever elements are currently on the stack, while `irisInFromWhite`,`irisOutToWhite`,`irisInFromBlack`,`irisOutToBlack`,`irisInFromGray`, and `irisOutToGray` use panels of the specified color for the iris surround.

```javascript
// Move "#slide2" to the top of the stack and gradually display it using an iris effect. The iris surround will be whichever panel was previously on top of the stack.
mySic.performTransition({panelSelector:"#slide2",transitionName:"irisIn"});
```

```javascript
// Move "#slide2" to the top of the stack and gradually display it using an iris effect. The iris surround will be solid black.
mySic.performTransition({panelSelector:"#slide2",transitionName:"irisInFromBlack"});
```

```javascript
// Gradually hide "#slide2" using an iris effect, eventually winding up with a solid gray background.
mySic.performTransition({panelSelector:"#slide2",transitionName:"irisOutToGray"})
```

#### menuInFromBottom, menuOutToBottom,menuInFromLeft, menuOutToLeft,menuInFromRight, menuOutToRight,menuInFromTop, menuOutToTop

The `menuInFrom/menuOutTo` transitions do a "partial wipe" (see "wipe", below), sliding the specified panel in/out from/to the specified direction only partially. This is useful for making sliding menus. Valid directions are Left, Right, Top, and Bottom. The default menu coverage is 25%. This can be changed with `setParameter()`. See the examples below.

```javascript
// Display "#slide2" as a menu on the left side of the area.
mySic.performTransition({panelSelector:"#slide2",transitionName:"menuInFromLeft"});

// Hide the previous "#slide2" menu.
mySic.performTransition({panelSelector:"#slide2",transitionName:"menuOutToLeft"});

// Set the menu coverage for the menuInFromLeft transition to 30% (rather than the default 25%).
mySic.setParameter("menuPercentage",30,"menuInFromLeft");

// Do the same for the menuOutToLeft transition (unexpected effects may occur if the in and out transitions have different coverage percentages).
mySic.setParameter("menuPercentage",30,"menuOutToLeft");

// Now show a menu from the left, which will use the new 30% menu coverage.
mySic.performTransition({panelSelector:"#slide2",transitionName:"menuInFromLeft"});

// Set the menu coverage percentage to 50% for all transitions (will have no effect on non-menu transitions).

mySic.setParameter("menuPercentage",50,"*");

```

#### newspaperIn, newspaperOut

These transitions provide a "spinning newspaper" effect, as seen in many old movies. 
`newspaperIn` makes the selected panel grow and rotate as it appears, while `newspaperOut` reverses the process.

```javascript
// Transition panel "#slide2" in, using the spinning newspaper effect
mySic.performTransition({panelSelector:"#slide2",transitionName:"newspaperIn"});

// Transition panel "#slide2" out, using the spinning newspaper effect
mySic.performTransition({panelSelector:"#slide2",transitionName:"newspaperOut"});

```

#### rotateStack

The `rotateStack` transition takes an integer parameter, denoted by `stackRotationNumber` and either pulls panels from the top of the stack and puts them on the bottom (positive integers) or pulls panels from the bottom of the stack and puts them on top (negative integers). `rotateStack` does *not* use a `panelSelector` parameter. If a `panelSelector` argument is supplied, it will be ignored. If the `stackRotationNumber` is not supplied, it is assumed to be 1. 

This is handy if you want to remove several elements from the stack at once, in the reverse order of how  they were added. For example, suppose you display a menu, then from that display a submenu (and possibly sub-sub-menus, etc.) `rotateStack` would allow you to "unwind" the stack of menus and get back to the original display without removing them explicitly.

```javascript
// Let's say that, e.g, slides 2,3, and 4 have menus on them.

mySic.performTransition({panelSelector:"#slide2",transitionName:"menuInFromLeft"});

// User makes a choice from the slide 2 menu which brings up a sub-menu.

mySic.performTransition({panelSelector:"#slide3",transitionName:"menuInFromLeft"});

// User makes a choice from the slide 3 submenu which brings up a sub-sub-menu.

mySic.performTransition({panelSelector:"#slide4",transitionName:"menuInFromLeft"});

// Now we're sitting there with three menus on the stack. We could just "menuOutTo" them in turn, but instead we'll use a rotateStack transition to hide them all in one go.

mySic.performTransition({transitionName:"rotateStack",stackRotationNumber:3});

```



#### wipeInFromBottom, wipeOutToBottom,wipeInFromLeft, wipeOutToLeft,wipeInFromRight, wipeOutToRight,wipeInFromTop, wipeOutToTop

Wipe transitions are similar to the menu transitions described above, except that they always provide 100% coverage. This is probably the most commonly used transition. The specified panel will appear or disappear from the specified edge of the container element, and will slide (or "wipe") across until it is fully visible (for `wipeIn`) or fully offscreen (for `wipeOut`).



