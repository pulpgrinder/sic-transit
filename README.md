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

creates a new instance of SicTransit and makes it ready for use.The elements with class `.mypanelclass` inside the div `#mycontainer` will be set up as SicTransit panels. The last one in the container (in this case `#panel4`) will be placed at the top of the internal panel stack and made visible.

Now you can use JavaScript to control the panels. Open a JavaScript console and enter:

```javascript
mySic.performTransition({panelSelector:"#slide2",transitionName:"wipeInFromLeft"})
```

The transition should run, with Slide 2 sliding in from the left.

Now try: 

```javascript
mySic.performTransition({panelSelector:"#slide2",transitionName:"wipeOutToLeft"})
```

As you might expect, the `wipeOutToLeft` transition does the opposite of the `wipeInFromLeft` transition, effectively undoing the previous transition.

All of the available transitions are fully described in the Transitions section below. Some transitions need additional parameters for `performTransition()`. Those are described below as well.

## Mode of Operation
SicTransit relies on a user-specified container `div` that contains other user-created `div`s which function as movable "panels". SicTransit uses an internal stack to keep track of the panels and their relative position. In general, only the panel on top of the stack after the transition is complete will be visible. SicTransit transitions manipulate the panel stack in different ways, while simultaneously manpulating the CSS values for the panels (such as the z-index) to make the panels appear, disappear, move, and so on. 

## Initialization

```javascript
const mySic = new SicTransit(containerId, elementClass);
```
`containerId`: The ID of the container div that holds the panels.

`elementClass`: The user-specified class for panels. Panels are  `div`s with the given class, which are nested within the div with id `containerID`. Using different classes (and container ids) will let you have more than one instance of SicTransit on the same page.

Place all your initial panel `div`s within the container `div` you're planning to use (don't worry, you can add or remove panels later -- see below).
## Public Methods

#### Selectors

Many of the public methods take a `selector` argument to specify a particular panel. The following examples use the `showPanel()` method in conjunction with a selector, because `showPanel()` is straightforward and is thus useful as an example.

A selector can be any of the following:
1) A query selector (with the same basic syntax as `document.querySelector()` and CSS). This is the most common type. Examples:

```javascript
let newpanel =  document.createElement('div');
newpanel.id = 'myNewPanel';
newPanel.innerText = "Hey, I'm new!";
// display it using the id as a selector.
mySic.showPanel({panelSelector:'#myNewPanel'}); 

let secondnewpanel = document.createElement('div');
// give it a custom class.
secondnewpanel.classList.add('secondclass');
newPanel.innerText = "I'm new, too!";
// display it using the custom class as a  selector.
mySic.showPanel({panelSelector:'.secondclass'});
```


2) A numeric index into the internal panel stack. A negative value (or "negative zero") denotes an offset from the top of the stack, while a positive or positive zero value indicates an offset from the bottom of the stack.

Examples:

```javascript
// move the panel one down from the top of the stack
// to the top of the stack and display it.
mySic.showPanel({panelSelector:-1}); 

// move the panel one up from the bottom of the stack
// to the top of the stack and display it.
mySic.showPanel({panelSelector:1});

// move the panel at the bottom of the stack to the
// top of the stack and display it.
mySic.showPanel({panelSelector:0});

// move the panel at the top of the stack to the top of
// the stack and display it. This obviously has no 
// visible effect with `showPanel()`, but will with
// some of the transitions (for instance, those that
// animate the element).
mySic.showPanel({panelSelector:-0}); 
```

2) An explicit HTML element. This form is mostly only used for internal SicTransit operations, but it's there if you need it. Example:

```javascript
// Create a new div element.
let newpanel =  document.createElement('div');
newPanel.innerText = "Hi, there!";
mySic.showPanel({panelSelector:newpanel});
```
Here we're creating a new HTML element, and passing it directly to `showPanel()`.


#### `getBos()`
Returns the panel currently at the bottom of the panel stack.

#### `getContainerId()`
Returns the user-specified ID for the panel container. See *Initialization*, above.

#### `getPanelClass()`
Returns the user-specified CSS class used to identify the panels that belong to this instance of SicTransit. See *Initialization*, above.

#### `getTransitionList()`
Returns an array containing the names of all defined transitions.

#### `getPanelList()`
Returns an array of the ids of panels within the panel container. Note that this does **not** include the special internal panels used to implement certain effects, as those do not have ids, nor does it include user-created panels that likewise don't have ids (user-created panels with ids will be included);

#### `getTos()`
Returns the panel currently at the top of the panel stack.

#### `performTransition(args)`
The heart of Sic Transit. Each transition is documented in detail in the *Transitions* section below.

#### `setParameter(parametername, parametervalue,transitionname)`
Sets the given parameter name to the given value for the given transition name. If the transition name is "\*" (in quotes), or not supplied, the specified parameter is set for *all* transitions.

Some commonly used parameters include:

`duration` -- set the duration of the transition in milliseconds. Default value varies, depending on the transition (some transitions look better slower, others faster).

`callback` -- sets a user-written function that is called when the transition is complete. Default is null.

`menuPercentage` -- controls the percentage of the panel container that gets covered by a menu. Only relevant for the "menu-" transitions (see below), though it will not cause an error if you set it for other transitions. It will simply have no effect. Default is 25%.

There are other parameters that might be of interest to advanced users, in particular those defining their own custom transtitions. See the `dispatchTable` object in `sic-transit.js` to learn more.

Examples:

```javascript
// Set the duration for the `wipeInFromLeft` transition
// to 3 seconds (3000 ms), rather than the default 500 ms:

mySic.setParameter("duration",3000,"wipeInFromLeft");
```

```javascript

// Set the menu percentage (i.e., the proportion of the
// screen covered by a menu) to 50% for the `menuInFromTop`
// and `menuOutToTop` transitions:
mySic.setParameter("menuPercentage",50,"menuInFromTop");
mySic.setParameter("menuPercentage",50,"menuOutToTop");

```

In general, you will want to use the same menuPercentage for `menuInFrom` and `menuOutTo` pairs. Unexpected behavior may occur if the two values aren't the same.

#### Callbacks

The `setParameter` method can be used to set a callback method that will be called whenever a transition is complete.

Examples:



```javascript
// Set a callback function for the 
// `wipeInFromLeft` transition.

// Define our callback function.
function myCallBackFunc(args){
    alert("Hello from wipeInFromLeft");
}
// Set up the callback.
mySic.setParameter("callback",myCallbackFunc,"wipeInFromLeft");
```

```javascript
// Set a callback function for all
// transitions.

// Define the callback function.
function anotherCallBackFunc(args){
    alert("Hello from " + args.transitionName);
}

// Set up the callback. Note that we're using "*" 
// for the selector here. That specifies that 
// anotherCallbackFunc should be set as the callback for all transitions.
mySic.setParameter("callback",anotherCallbackFunc,"*");
```
Note the use of args.transitionName in `anotherCallBackFunc()` The args object passed to a callback has the following data available for use:

    args.transitionName
    args.startTime
    args.endTime
    args.panelSelector
    args.selectedPanel
    args.stackRotationNumber (only valid for the `rotateStack` transition)

Future transitions may define other key/value pairs on the args object.
    
Most of these are self-explanatory. The difference between `panelSelector` and `selectedPanel` is that the first is the selector provided by the user and the second is the panel that was actually selected using that selector.

#### `showPanel(selector)`
Move the DOM element with the given selector to the top of the stack and display it. If the DOM element is not already a panel, it will be removed from its current location in the DOM, added to the panel container, and added to the panel stack. The CSS classes required to make it function as a panel will be added automatically, if necessary.

#### `stackDump()`
Prints the current state of the panel stack to the console. This is handy if you are debugging a new transition.

### Transitions

#### `cutIn/cutOut` 

These transitions make the change immediately, without any animation effects (like a movie cut).

```javascript
// Move "#slide2" to the top of the stack
// and display it immediately.
mySic.performTransition({panelSelector:"#slide2",transitionName:"cutIn"});
```

```javascript
// Move "#slide2" to the bottom of the stack
// and hide it immediately.The panel previously
// one down from the top of the stack will become
// visible.
mySic.performTransition({panelSelector:"#slide2",transitionName:"cutOut"});
```

#### `crossDissolveIn/crossDissolveOut` 

These transitions fade in one panel, while simultaneously fading out another.

```javascript
// Move "#slide2" to the top of the stack and 
// gradually fade it in, while fading out the 
// panel which was the previous top of the stack.
mySic.performTransition({panelSelector:"#slide2",transitionName:"crossDissolveIn"});
```

```javascript
// Gradually fade out "#slide2", while fading
// in the slide underneath it on the stack.
mySic.performTransition({panelSelector:"#slide2",transitionName:"crossDissolveOut"});
```

#### `fadeInFrom/fadeOutTo`

There are six of these, a `fadeInFrom` and a `fadeOutTo` each for white, black, and gray. 

```javascript
// Move "#slide2" to the top of the stack and
// gradually fade it in from a solid black
// background panel.
mySic.performTransition({panelSelector:"#slide2",transitionName:"fadeInFromBlack"});
```

```javascript
// Gradually fade out "#slide2", until it disappears, 
// leaving a solid black background panel.
mySic.performTransition({panelSelector:"#slide2",transitionName:"fadeOutToBlack"})
```

`fadeInFromWhite`, `fadeOutToWhite`, `fadeInFromGray`, and `fadeOutToGray` are exactly the same, except that they use white and gray panels respectively, rather than black.

#### `flipInX/flipOutX, flipInY/flipOutY`

These transitions provide a "flip card" effect. `flipInX/flipOutX` rotate the card about the X axis, while `flipInY/flipOutY` rotate it about the Y axis.


```javascript
// Display #slide2 using a flipcard effect
// about the X axis

mySic.performTransition({panelSelector:"#slide2",transitionName:"flipInX"});

// Hide #slide2 by using the inverse flipcard
// effect about the Y axis. The previous panel will be restored.
mySic.performTransition({panelSelector:"#slide2",transitionName:"flipOutX"});

```
#### `irisIn/irisOut, irisInFrom/irisOutTo`

These transitions involve a growing or shrinking circle through which the panel in question is visible (similar to a "camera iris" effect). `irisIn` and `irisOut` work with whatever elements are currently on the stack, while `irisInFromWhite`,`irisOutToWhite`,`irisInFromBlack`,`irisOutToBlack`,`irisInFromGray`, and `irisOutToGray` use panels of the specified color for the iris surround.

```javascript
// Move "#slide2" to the top of the stack and
// gradually display it using an iris effect. 
// The iris surround will be whichever panel was 
// previously on top of the stack.
mySic.performTransition({panelSelector:"#slide2",transitionName:"irisIn"});
```

```javascript
// Move "#slide2" to the top of the stack and
// gradually display it using an iris effect. 
// The iris surround will be solid black.
mySic.performTransition({panelSelector:"#slide2",transitionName:"irisInFromBlack"});
```

```javascript
// Gradually hide "#slide2" using an iris effect,
//  eventually winding up with a solid gray background.
mySic.performTransition({panelSelector:"#slide2",transitionName:"irisOutToGray"});
```

#### menuInFromBottom, menuOutToBottom,menuInFromLeft, menuOutToLeft,menuInFromRight, menuOutToRight,menuInFromTop, menuOutToTop

The `menuInFrom/menuOutTo` transitions do a "partial wipe" (see "wipe", below), sliding the specified panel in/out from/to the specified direction only partially. This is useful for making menus. Valid directions are Left, Right, Top, and Bottom. The default menu coverage is 25%. This can be changed with `setParameter()` (see above). Examples: 

```javascript
// Display "#slide2" as a menu on the left 
// side of the panel container.
mySic.performTransition({panelSelector:"#slide2",transitionName:"menuInFromLeft"});

// Hide the previous "#slide2" menu.
mySic.performTransition({panelSelector:"#slide2",transitionName:"menuOutToLeft"});

// Set the menu coverage for the menuInFromLeft 
// transition to 33% (rather than the default 25%).
mySic.setParameter("menuPercentage",33,"menuInFromLeft");

// Do the same for the menuOutToLeft transition
// (unexpected effects may occur if menu in and out transitions
// have different coverage percentages).
mySic.setParameter("menuPercentage",33,"menuOutToLeft");

// Now show a menu from the left, which will use
// the new 33% menu coverage.
mySic.performTransition({panelSelector:"#slide2",transitionName:"menuInFromLeft"});

// Set the menu coverage percentage to 50% for all
// transitions (will have no effect on non-menu transitions).
mySic.setParameter("menuPercentage",50,"*");

```

#### newspaperIn, newspaperOut

These transitions provide a "spinning newspaper" effect, as seen in many old movies. 
`newspaperIn` makes the selected panel grow and rotate as it appears, while `newspaperOut` reverses the process.

```javascript
// Transition panel "#slide2" in, using the 
// spinning newspaper effect
mySic.performTransition({panelSelector:"#slide2",transitionName:"newspaperIn"});

// Transition panel "#slide2" out, using the
// spinning newspaper effect
mySic.performTransition({panelSelector:"#slide2",transitionName:"newspaperOut"});

```

#### rotateStack

The `rotateStack` transition takes an integer parameter, denoted by `stackRotationNumber` and either pulls panels from the top of the stack and puts them on the bottom (positive integers) or pulls panels from the bottom of the stack and puts them on top (negative integers). `rotateStack` does *not* use a `panelSelector` parameter. If a `panelSelector` argument is supplied, it will be ignored. If the `stackRotationNumber` is not supplied, it is assumed to be 1. 

This is handy if you want to remove several elements from the stack at once, in the reverse order of how  they were added. For example, suppose you display a menu, then from that display a submenu (and possibly sub-sub-menus, etc.) `rotateStack` would allow you to "unwind" the stack of menus and get back to the original display without removing them explicitly.

```javascript
// Let's say that, e.g, slides 2,3, and 4 
// have menus on them.

mySic.performTransition({panelSelector:"#slide2",transitionName:"menuInFromLeft"});
// #slide2 menu is now visible on the left side
// of the container.

// User makes a choice from the #slide2 menu
// which brings up the #slide3 sub-menu.

mySic.performTransition({panelSelector:"#slide3",transitionName:"menuInFromLeft"});
// #slide2 menu is now visible on the left side
// of the container.

// User makes a choice from the #slide3 submenu
// which brings up the #slide4 sub-sub-menu.
mySic.performTransition({panelSelector:"#slide4",transitionName:"menuInFromLeft"});

// Now we're sitting there with three menus on the stack. 
// We could just "menuOutTo" for each one in turn, but 
// instead we'll use a rotateStack transition to hide them all in one go.

mySic.performTransition({transitionName:"rotateStack",stackRotationNumber:3});

```

#### `swap`

The `swap` transition reverses the top two entries on the panel stack. For example, if `#slide4` is on top of the stack and `#slide1` is immediately underneath it, after a `swap` transition is executed `#slide1` will be on top with `#slide4` underneath it. This transition does not take any parameters other than the transition name. Example:


```javascript
// Reverse the order of the top two elements on the panel stack.
mySic.performTransition({transitionName:"swap"})
```



#### `wipeInFromBottom, wipeOutToBottom,wipeInFromLeft, wipeOutToLeft,wipeInFromRight, wipeOutToRight,wipeInFromTop, wipeOutToTop`

Probably the most commonly used transition. Wipe transitions are similar to the menu transitions described above, except that the incoming panel fills the entire container area, rather than just a percentage of it. The specified panel will appear (`wipeIn`) or disappear (`wipeOut`) from the specified edge of the container element, and will slide (or "wipe") across until it is fully visible (for `wipeIn`) or fully offscreen (for `wipeOut`).

```javascript

// Slide #slide4 in from the right, and make it the
// current visible panel.
mySic.performTransition({panelSelector:"#slide4",transitionName:"wipeInFromRight"});


// Slide #slide4 out to the right, revealing the previous panel.
mySic.performTransition({panelSelector:"#slide4",transitionName:"wipeOutToRight"});

```

#### `zoomIn/zoomOut`

These transitions provide a "zoom lens" effect. `zoomIn` causes the selected panel to grow from the center of the container until it reaches full size, while `zoomOut` causes the selected panel to shrink to the center until it disappears.

```javascript
// Use a zoom transition to display #slide4
mySic.performTransition({panelSelector:"#slide4",transitionName:"zoomIn"});


// Use a zoom transition to hide #slide4
mySic.performTransition({panelSelector:"#slide4",transitionName:"zoomOut"});

```
