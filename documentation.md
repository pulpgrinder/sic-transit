# Sic Transit Documentation and Tutorial

This is the full documentation for the Sic Transit library. It has live examples for all the public methods which can be run directly from this documentation, the effect of which can be seen in the demo area to the left. 

Sic Transit is [available on GitHub](https://github.com/pulpgrinder/sic-transit).

If you're looking for a basic example just to get started, have a look at the [minimal example](minimalexample.html).

## Installation

Add `sic-transit-min.js` (minified) or `sic-transit.js` and `sic-transit.css` to your page. That's it!

## Initialization

Schematically, an instance of Sic Transit is organized like this:

![Sic Transit Block Diagram](sic-transit-block-diagram.png)

Basically, there's a container div which contains multiple panel divs. 

Setting up a new instance of Sic Transit requires only two parameters, an id for the container div and a CSS class for the panels.

`const mySic = new SicTransit(containerId, panelClass);`

`containerId`: The ID of the container `div` that holds the panels.

`panelClass`: The user-specified class for the panels.

Put all your initial panel `divs` within your container `div`. Make sure each one has the given `panelClass` (you can add or remove panels later -- see below). If you've added more than one panel, the last panel in page order will be the panel shown at startup.

Example:

Set up a new instance of Sic Transit named `firstSic`, and associate it with a container `div` named `#firstcontainer`, and tell it that the nested panel `divs` in the container use the class `.demopanel`.

`const firstSic = new SicTransit("#firstcontainer", ".demopanel");`

This has already been done for you on this demo page. `firstSic` has been preloaded with `.demopanel` `divs` in the HTML markup for the page -- `#panel1` through `#panel4`. There are also some  "loose" `divs` at the bottom, `#panel5` and `#panel6` (we'll be adding these to the container later). 

The layout and content for these panels has intentionally been made very basic, to avoid distraction from the workings. In your own code, the panels can contain arbitrarily complex content (e.g., an entire screen for a mobile device).

There's no problem having multple instances of Sic Transit on the same page.

Later we'll see how to generate panels dynamically or turn `divs` elsewhere on the page (such as the "loose divs"  at the bottom of the page) into Sic Transit panels and transfer them into a Sic Transit container.

Sic Transit does not have (or need) "teardown" or "destroy" methods -- instances of Sic 
 Transit are removed by the normal JavaScript garbage collection process when the last reference to them disappears.

## Public Methods

### `performTransition(args)`
Transitions are the heart of Sic Transit. There are over 50 transitions described below.

#### `swipeInFromBottom, swipeOutToBottom, swipeInFromLeft, swipeOutToLeft, swipeInFromRight, swipeOutToRight, swipeInFromTop, swipeOutToTop`

Swipes are probably the most commonly used transition. The specified panel will appear (`swipeIn`) or disappear (`swipeOut`) from the specified edge of the container element, and will slide (or "swipe") across until it is fully visible (for `swipeIn`) or fully hidden (for `swipeOut`).

```javascript

// Swipe #panel1 in from the right, and make it the
// current visible panel.

firstSic.performTransition({panelSelector:"#panel1",transitionName:"swipeInFromRight"});
```

Note: in this documentation, green code (like the above) is live code. It can be run using its associated Run button, edited and rerun, and so on.

```javascript
// Swipe #panel1 out to the top, revealing the previous panel. Note that swiping out to a different direction than the swipe in is fine. In general, this applies to all Sic Transit transtiions other than the menu transitions.

firstSic.performTransition({panelSelector:"#panel1",transitionName:"swipeOutToTop"});

```

You can edit the above code snippets and rerun them if you want to see the other swipe transitions.

#### `cutIn/cutOut` 

These transitions make the change immediately, without any animation effects (like a movie cut).

```javascript
// Move "#panel2" to the top of the stack
// and display it immediately.

firstSic.performTransition({panelSelector:"#panel2",transitionName:"cutIn"});
```

```javascript
// Move "#panel2" to the bottom of the stack
// and hide it immediately.The panel previously
// one down from the top of the stack will become
// visible.

firstSic.performTransition({panelSelector:"#panel2",transitionName:"cutOut"});
```

#### `crossDissolveIn/crossDissolveOut` 

These transitions fade in one panel, while simultaneously fading out another.

```javascript
// Move "#panel1" to the top of the stack and 
// gradually fade it in, while fading out the 
// panel which was the previous top of the stack.

firstSic.performTransition({panelSelector:"#panel1",transitionName:"crossDissolveIn"});
```

```javascript
// Gradually fade out "#panel1", while fading
// in the panel underneath it on the stack.

firstSic.performTransition({panelSelector:"#panel1",transitionName:"crossDissolveOut"});
```

#### `fadeInFromBlack, fadeInFromGray, fadeInFromWhite, fadeOutToBlack, fadeOutToGray, fadeOutToWhite`

Fade transitions gradually fade the specified panel in or out from a solid color background.

There are six fade transitions,  a `fadeInFrom` and a `fadeOutTo` each for white, black, and gray.


```javascript
// Gradually fade #panel3 in from a solid black
// background panel.

firstSic.performTransition({panelSelector:"#panel3",transitionName:"fadeInFromBlack"});
```

```javascript
// Gradually fade "#panel3" out,
// leaving a solid gray background panel.

firstSic.performTransition({panelSelector:"#panel3",transitionName:"fadeOutToGray"})
```

As always, you can edit the above code snippets and rerun them if you want to see the other fade transitions.

#### `flipInX/flipOutX, flipInY/flipOutY`

These transitions provide a "flip card" effect. `flipInX` and `flipOutX` rotate the card about the X axis, while `flipInY` and   `flipOutY` rotate it about the Y axis.

```javascript
// Display #panel1 using a flipcard effect
// about the X axis

firstSic.performTransition({panelSelector:"#panel1",transitionName:"flipInX"});
```

```javascript
// Hide #panel1 by using an inverse flipcard
// effect about the Y axis.

firstSic.performTransition({panelSelector:"#panel1",transitionName:"flipOutY"});
```


#### `irisIn/irisOut, irisInFrom/irisOutTo`

These transitions use growing or shrinking circles through which the panel in question is visible (similar to a "camera iris" effect). `irisIn` and `irisOut` work with whatever elements are already on the stack, while `irisInFromWhite`, `irisOutToWhite`, `irisInFromBlack`, `irisOutToBlack`, `irisInFromGray`, and `irisOutToGray` use panels of the specified color for the iris surround.

```javascript
// Move "#panel3" to the top of the stack and
// gradually display it using an iris effect. 
// The iris surround will be whichever panel was 
// previously on top of the stack.

firstSic.performTransition({panelSelector:"#panel3",transitionName:"irisIn"});
```


```javascript
// Hide "#panel3" using an iris effect.

firstSic.performTransition({panelSelector:"#panel3",transitionName:"irisOut"});
```


```javascript
// Iris "#panel3" in from a white background.
firstSic.performTransition({panelSelector:"#panel3",transitionName:"irisInFromWhite"});
```

```javascript
// Iris "#panel3" out to a black background.
firstSic.performTransition({panelSelector:"#panel3",transitionName:"irisOutToBlack"});
```


#### menuInFromBottom, menuOutToBottom,menuInFromLeft, menuOutToLeft,menuInFromRight, menuOutToRight,menuInFromTop, menuOutToTop

The `menuInFrom/menuOutTo` transitions do a "partial swipe" (see the swipe transitions above), sliding the specified panel in/out from/to the specified direction only partially. This is useful for making sliding menus. Valid directions are Left, Right, Top, and Bottom. The default menu coverage is 33%. This can be changed with `setParameter()` (see below). Examples: 

```javascript
// Display "#panel1" as a menu on the right 
// side of the panel container.

firstSic.performTransition({panelSelector:"#panel1",transitionName:"menuInFromRight"});
```

```javascript
// Hide the previous "#panel1" menu.

firstSic.performTransition({panelSelector:"#panel1",transitionName:"menuOutToRight"});
```

The other directions (left, top, and bottom) work the same, other than the direction from/to which the menu appears/disappears. As usual, you can edit the code above to experiment with them. 

*Unlike most transitions, using `menuIn` from one direction and `menuOut` to another, while not causing an error, will produce an odd visual effect that you probably don't want*. 

#### hingeInFromTop, hingeOutToTop, hingeInFromBottom, hingeOutToBottom, hingeInFromLeft, hingeOutToLeft, hingeInFromRight, hingeOutToRight

These transitions have the visual effect of a "hinge" on the specified side (like a door or a book opening).

```javascript
// Hinge "#panel2" in from the left side.
firstSic.performTransition({panelSelector:"#panel2",transitionName:"hingeInFromLeft"});
```

```javascript
// Hinge "#panel2" out to the top.
firstSic.performTransition({panelSelector:"#panel2",transitionName:"hingeOutToTop"});
```

Edit the code samples above to see the hinge effect applied to different sides.


#### spinIn, spinOut

These transitions provide a "spinning newspaper" effect, as seen in many old movies. 
`spinIn` makes the selected panel grow and rotate as it appears, while `spinOut` reverses the process.

```javascript
// Transition panel "#panel2" in, using the 
// spinning newspaper effect

firstSic.performTransition({panelSelector:"#panel2",transitionName:"spinIn"});

```

```javascript
// Transition panel "#panel2" out, using the
// spinning newspaper effect

firstSic.performTransition({panelSelector:"#panel2",transitionName:"spinOut"});

```

#### rotateStack

The `rotateStack` transition takes an integer parameter, denoted by `stackRotationNumber`, and either pulls panels from the top of the stack and puts them on the bottom (positive integers) or pulls panels from the bottom of the stack and puts them on top (negative integers). `rotateStack` does *not* use a `panelSelector` parameter. If a `panelSelector` argument is supplied, it will be ignored. If the `stackRotationNumber` is not supplied, it is assumed to be 1. 

This is handy if you want to remove several elements from the stack at once, in the reverse order of how they were added. For example, suppose you display a menu, then from that display a submenu (and possibly sub-sub-menus, etc.) `rotateStack` would allow you to "unwind" the stack of menus and get back to the original display without removing them explicitly.

```javascript

firstSic.performTransition({transitionName:"rotateStack",stackRotationNumber:3});
// panel that was third from the top of the stack is now on top.

```

#### `swap`

The `swap` transition reverses the top two entries on the panel stack. For example, if `#panel4` is on top of the stack and `#panel1` is immediately underneath it, after a `swap` transition is executed `#panel1` will be on top with `#panel4` underneath it. This transition does not take any parameters other than the transition name. Example:


```javascript
// Reverse the order of the top two elements on the panel stack.

firstSic.performTransition({transitionName:"swap"})
```


#### `zoomIn/zoomOut`

These transitions provide a "zoom lens" effect. `zoomIn` causes the selected panel to grow from the center of the container until it reaches full size, while `zoomOut` causes the selected panel to shrink to the center until it disappears.

```javascript
// Use a zoom transition to display #panel4
firstSic.performTransition({panelSelector:"#panel4",transitionName:"zoomIn"});
```

```javascript
// Use a zoom transition to hide #panel4
firstSic.performTransition({panelSelector:"#panel4",transitionName:"zoomOut"});

```

### Other public methods

#### `getBos()`
Returns whatever panel is currently at the bottom of the instance's panel stack.

```javascript
firstSic.getBos();

```


#### `getTos()`
Returns whatever panel is currently at the top of the instance's panel stack.
```javascript
firstSic.getTos();

```


#### `getContainerId()`
Returns the user-specified ID that was given for the panel container when the instance was created.

```javascript
firstSic.getContainerId();

// Returns '#firstcontainer' for this page.
```

#### `getPanelClass()`
Returns the user-specified CSS class that was given when the instance was created.

```javascript
firstSic.getPanelClass();

```

#### `getPanelList()`
Returns an array of the ids of panels within the panel container. This (obviously) returns only the ones that *have* ids. Panels that don't have ids (for example, the internal overlay panels used for certain transitions) will not be included.

```javascript
firstSic.getPanelList();
```


#### `getTransitionList()`
Returns an array containing the names of all defined transitions.

```javascript
// Returns an array of all available transitions (> 50 at present).

firstSic.getTransitionList();
```

#### `getZIndex(selector)`
Returns the current z-index for the selected panel. The visible panel at the top of the stack always has z-index 0. The panels below it have indices of -1, -2, -3... counting from the top of the stack.

```javascript

firstSic.getZIndex("#panel1");
```


#### `moveToBos(selector)`
Moves the selected panel to the bottom of the stack.

```javascript

firstSic.moveToBos("#panel4");
```

#### `moveToTos(selector)`
Moves the selected panel to the top of the stack.

```javascript

firstSic.moveToTos("#panel4");
```

#### `setParameter(parametername, parametervalue,transitionname)`
Sets the given parameter name to the given value for the given transition name. If the transition name is "\*" (in quotes), or not supplied, the specified parameter is set for *all* transitions.

Some commonly used parameters include:

`duration` -- set the duration of the transition in milliseconds. Default value varies, depending on the transition (some transitions look better slower, others faster).

`callback` -- sets a user-written function that is called when the transition is complete. Default is null.

`menuPercentage` -- controls the percentage of the panel container that gets covered by a menu. Only relevant for the "menu-" transitions (see above), though it will not cause an error if you set it for other transitions. It will simply have no effect. Default is 33%.

There are other parameters that might be of interest to advanced users, in particular those defining their own custom transtitions. See the `dispatchTable` object in `sic-transit.js` to learn more.

Examples:

##### Duration
```javascript
// Set the duration for the `swipeInFromLeft` transition
// to 3 seconds (3000 ms), rather than the default 500 ms:

firstSic.setParameter("duration",3000,"swipeInFromLeft");
```

```javascript
// Demo our new (slow!) swipeInFromLeft duration

firstSic.performTransition({panelSelector:"#panel4",transitionName:"swipeInFromLeft"});
```

##### menuPercentage

The percentage of the container covered by menus is a settable parameter.

```javascript
// Set the menu coverage for the menuInFromRight 
// transition to 50% (rather than the default 33%).

firstSic.setParameter("menuPercentage",50,"menuInFromRight");

// Do the same for the menuOutToRight transition
// (unexpected effects may occur if menu in and out transitions
// have different coverage percentages).

firstSic.setParameter("menuPercentage",50,"menuOutToRight");
```

```javascript
// Now show a menu from the right, which will use
// the new 50% menu coverage.

firstSic.performTransition({panelSelector:"#panel1",transitionName:"menuInFromRight"});
```

```javascript
// Close the menu.

firstSic.performTransition({panelSelector:"#panel1",transitionName:"menuOutToRight"});
```
You can also set the menu percentage for all menu transitions by using "*" for the transition name.

```javascript
// Set the menu coverage percentage to 50% for all
// transitions (will have no effect on non-menu transitions).

firstSic.setParameter("menuPercentage",50,"*");
```

```javascript
// Now show a menu from the bottom, which will use
// the new 50% menu coverage.

firstSic.performTransition({panelSelector:"#panel4",transitionName:"menuInFromBottom"});
```

```javascript
// Close the menu.

firstSic.performTransition({panelSelector:"#panel4",transitionName:"menuOutToBottom"});
```

##### Callbacks

The `setParameter` method can also be used to set a callback method that will be called whenever a transition is complete.

Examples:

```javascript
// Set a callback function for the 
// `swipeInFromLeft` transition.

// Define our callback function.
function myCallBackFunc(args){
    alert("Hello from swipeInFromLeft");
}
// Set up the callback.
firstSic.setParameter("callback",myCallBackFunc,"swipeInFromLeft");
// myCallbackFunc() will now be executed every time a 
// "swipeInFromLeft" transition is complete.
```

```javascript
// See our callback function in action.

firstSic.performTransition({panelSelector:"#panel4",transitionName:"swipeInFromLeft"});

// myCallBackFunc() will be called when this is complete.

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
firstSic.setParameter("callback",anotherCallBackFunc,"*");
```


```javascript
// Try our new global callback function.

firstSic.performTransition({panelSelector:"#panel4",transitionName:"irisIn"});

```


Note the use of args.transitionName in `anotherCallBackFunc()` The args object passed to a callback has the following data available for use:

    args.transitionName
    args.startTime
    args.endTime
    args.panelSelector
    args.selectedPanel
    args.stackRotationNumber (only valid for the `rotateStack` transition)

Future transitions may define other key/value pairs on the args object.
    
Most of these are self-explanatory. The difference between `panelSelector` and `selectedPanel` is that the first is the selector provided by the user and the second is the HTML element that was actually selected using that selector.


#### `removePanel(panelSelector)`

Removes the panel with the given selector from the Sic Transit instance. Returns the panel. If you wish, you can retain the panel and put it elsewhere in the DOM and/or add it back to the Sic Transit instance at a later time. Generally, though, you'd only use this if you want to get rid of the panel permanently. If you just want to make the panel disappear, it would be more efficient to just move it to the bottom of the stack (`moveToBos()`) or use one of the "transitionOut" transitions.


#### `showPanel(selector)`
Make the selected `div` a Sic Transit panel, move it to the top of the stack and display it immediately. The div can already be within this instance, in another instance of Sic Transit, or even at an arbitrary place in the page DOM. The special CSS classes for Sic Transit will be added automatically, if needed, but you may need to do some custom CSS tweaking to make arbitrary DOM `divs` work (e.g., if the imported DOM element has some kind of CSS sizing or positioning that makes it incompatible with being a Sic Transit panel).

```javascript

// Move the "loose" #panel5 div out of the top level and put it in firstSic.

firstSic.showPanel("#panel5"); 
```

#### `stackDump()`
Prints the current state of the panel stack to the console. This is handy if you are debugging a new transition.

```javascript

// Dump the current panel stack for firstSic.

firstSic.stackDump(); 
```

#### `transferPanel(selector)`

Transfers a panel from the DOM or another instance of Sic Transit into this one. The difference between this and `showPanel()`, above, is that `transferPanel()` does not automatically display the panel. In fact, `showPanel()` works by first calling `transferPanel()` and then moving the transferred panel to the top of the stack. 

```javascript
// Transfer the "loose" #panel6 from the DOM to firstSic.

firstSic.transferPanel("#panel6");

// #panel6 is now in firstSic, but at the bottom of the stack (i.e., not visible).

```

```javascript
// We can transition #panel6 in at a later time.

firstSic.performTransition({panelSelector:"#panel6",transitionName:"zoomIn"});
```

## More on Selectors

Many of the Sic Transit public methods have a selector argument to specify a particular panel. Usually this is the id for the panel, but there are many other options.

The examples below use `showPanel()` for simplicity, but these selector types below apply to any method that requires selecting a panel (for example, the `panelSelector` parameter in `performTransition`).

A Sic Transit selector can be any of the following types:

### String 
Strings as normal query selectors, with the same basic syntax as `document.querySelector()` and CSS. This is the most common type. SicTransit actually uses `document.querySelector()` under the hood here, so the selectors can get as fancy as you need them to be.



### Integer
Integers are intepreted as numeric indices into the internal panel stack. A negative integer, including "negative zero" -- yes, negative zero is an actual JavaScript value -- denotes an offset from the top of the stack, while a positive integer, including the normal "positive zero", indicates an offset from the bottom of the stack.

```javascript
// Use an integer value to move the panel one up from the bottom of the firstSic stack to the top of the stack and display it. 

firstSic.showPanel(1);
```

```javascript
// Use an integer value to move the panel one down from the top of the firstSic stack to the top of the stack and display it.

firstSic.showPanel(-1); 
```


```javascript
// Use an integer value to move the panel at the top of the firstSic stack to the top of the stack and display it. This obviously has no visible effect with showPanel(), but will with some of the transitions (for instance, those that animate the element). 

firstSic.showPanel(-0); 
```


### Dom Element
An explicit DOM element. This form is mostly  used for internal SicTransit operations, but it's there if you need it. The special classes required for a Sic Transit panel will be added automatically.


```javascript
// Create a new HTML div element and use `showPanel()` to display it in firstSic's container. Normally you'd give this an id or some kind of special class so you could it manipulate later, but you don't have to.

const newpanel =  document.createElement('div');
newpanel.innerText = "Hi, there!";
firstSic.showPanel(newpanel);
```
