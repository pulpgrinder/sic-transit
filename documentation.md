# Sic Transit Documentation and Tutorial

Checking something out.

This is the full documentation for the Sic Transit library. It has live examples for all the public methods that can be run directly from this documentation, the effect of which can be seen in the demo area below.

If you're looking for a basic example just to get started, have a look at the [minimal example](minimalexample.html).

## Initialization

Setting up a new instance of Sic Transit requires only two parameters:

`const mySic = new SicTransit(containerId, elementClass);`

`containerId`: The ID of the container `div` that holds the panels.

`elementClass`: The user-specified class for the panels. Panels are  `div`s with the given element class, which are nested within the `div` with id `containerID`. 

Place all your initial panel `div`s within the container `div` you're planning to use and make sure each one has the given `elementClass` (don't worry, you can add or remove panels later -- see below).

Example:

Set up a new instance of Sic Transit named `firstSic`, and associate it with a container `div` named `#firstcontainer`, and tell it that the nested panel `divs` in the container use the class `.demopanel`.

`const firstSic = new SicTransit("#firstcontainer", ".demopanel");`

This has already been done for you in the demo below. In fact, there are two instances of Sic Transit in the demo, `firstSic` and `secondSic`. Both of these have been preloaded with `.demopanel` `divs` in the HTML markup for the page -- `#panel1` through `#panel4` in `#firstcontainer`, for `firstSic` and  `#panel5` through `#panel8` in `#secondcontainer` for `secondSic`. There's also a "loose" `div` at the bottom with the id `#panel9` (we'll be adding this to one of our containers later). As you can see, there's no problem having multple instances of Sic Transit on the same page.

Later we'll see how to generate panels dynamically, turn `divs` elsewhere on the page (such as the "loose div" `#panel9` at the bottom of the page) into Sic Transit panels and move them into a Sic Transit container, and transfer panels between instances of Sic Transit.

Sic Transit does not have (or need) "teardown" or "destroy" methods -- instances of Sic 
 Transit are removed by the normal JavaScript garbage collection process when the last reference to them disappears.

## Public Methods

### `performTransition(args)`
Transitions are the heart of Sic Transit. There are over 50 transitions, which are described below.

#### `swipeInFromBottom, swipeOutToBottom, swipeInFromLeft, swipeOutToLeft, swipeInFromRight, swipeOutToRight, swipeInFromTop, swipeOutToTop`

Swipes are probably the most commonly used transition. The specified panel will appear (`swipeIn`) or disappear (`swipeOut`) from the specified edge of the container element, and will slide (or "swipe") across until it is fully visible (for `swipeIn`) or fully hidden (for `swipeOut`).

```javascript

// Swipe #panel4 in from the right, and make it the
// current visible panel.

firstSic.performTransition({panelSelector:"#panel4",transitionName:"swipeInFromRight"});
```

Note: in this documentation, green code (like the above) is live code. It can be run using its associated Run button, edited and rerun, and so on.

```javascript
// Swipe #panel4 out to the right, revealing the previous panel.

firstSic.performTransition({panelSelector:"#panel4",transitionName:"swipeOutToRight"});

```

Swiping in from one direction and swiping out to another is permitted.

The transitions `swipeInFromLeft`, `swipeOutToLeft`, `swipeInFromTop`, `swipeOutToTop`, `swipeIFromBottom`, and `swipeOutToBottom` are the same, other than the direction from which the swiped panel appears or disappears.  You can edit the above code snippets and rerun them if you want to see the other swipe transitions.

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

#### `fadeInFrom/fadeOutTo`

Fade transitions gradually fade the specified panel in or out from a solid color background.

There are six fade transitions,  a `fadeInFrom` and a `fadeOutTo` each for white, black, and gray.


```javascript
// Gradually fade #panel3 in from a solid black
// background panel.

firstSic.performTransition({panelSelector:"#panel3",transitionName:"fadeInFromBlack"});
```

```javascript
// Gradually fade "#panel3" out,
// leaving a solid black background panel.

firstSic.performTransition({panelSelector:"#panel3",transitionName:"fadeOutToBlack"})
```

`fadeInFromWhite`, `fadeOutToWhite`, `fadeInFromGray`, and `fadeOutToGray` are exactly the same, except that they use white and gray panels respectively rather than black. As always, you can edit the above code snippets and rerun them if you want to see the other fade transitions.

#### `flipInX/flipOutX, flipInY/flipOutY`

These transitions provide a "flip card" effect. `flipInX` and `flipOutX` rotate the card about the X axis, while `flipInY` and   `flipOutY` rotate it about the Y axis.

```javascript
// Display #panel1 using a flipcard effect
// about the X axis

firstSic.performTransition({panelSelector:"#panel1",transitionName:"flipInX"});
```

```javascript
// Hide #panel1 by using the inverse flipcard
// effect about the X axis. The previous panel will be restored.

firstSic.performTransition({panelSelector:"#panel1",transitionName:"flipOutX"});
```

You can edit the above code to use  `flipInY` and `flipOutY` if you want to see those transitions.

#### `irisIn/irisOut, irisInFrom/irisOutTo`

These transitions use growing or shrinking circles through which the panel in question is visible (similar to a "camera iris" effect). `irisIn` and `irisOut` work with whatever elements are currently on the stack, while `irisInFromWhite`, `irisOutToWhite`, `irisInFromBlack`, `irisOutToBlack`, `irisInFromGray`, and `irisOutToGray` use panels of the specified color for the iris surround.

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
// Move "#panel3" to the top of the stack and iris it in starting from a black screen.
firstSic.performTransition({panelSelector:"#panel3",transitionName:"irisInFromBlack"});
```

```javascript
// Iris out "#panel3" to a black background.
firstSic.performTransition({panelSelector:"#panel3",transitionName:"irisOutToBlack"});
```

`irisInFromGray`,`irisOutToGray`, `irisInFromWhite`, and `irisOutToWhite` work the same, except using the specified color rather than black. You can edit the above code to use one of the other iris effects if you want to have a look.

#### menuInFromBottom, menuOutToBottom,menuInFromLeft, menuOutToLeft,menuInFromRight, menuOutToRight,menuInFromTop, menuOutToTop

The `menuInFrom/menuOutTo` transitions do a "partial swipe (see "swipe", below), sliding the specified panel in/out from/to the specified direction only partially. This is useful for making sliding menus. Valid directions are Left, Right, Top, and Bottom. The default menu coverage is 25%. This can be changed with `setParameter()` (see below). Examples: 

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

#### hingeInFromTop, hingeOutToTop, hingeInFromBottom, hingeOutToBottom, hingeInFromLeft, hingeOutToLeft, hingeInFromRight, hingeOutToRight

These transitions have the visual effect of a "hinge" on the specified side (like a door opening).

```javascript
// Move "#panel3" to the top of the stack and hinge it in from the left side.
firstSic.performTransition({panelSelector:"#panel3",transitionName:"hingeInFromLeft"});
```

```javascript
// Hinge "#panel3" out to the left.
firstSic.performTransition({panelSelector:"#panel3",transitionName:"hingeOutToLeft"});
```

You can edit the code samples above to see the hinge effect applied to a different side.


#### newspaperIn, newspaperOut

These transitions provide a "spinning newspaper" effect, as seen in many old movies. 
`newspaperIn` makes the selected panel grow and rotate as it appears, while `newspaperOut` reverses the process.

```javascript
// Transition panel "#panel4" in, using the 
// spinning newspaper effect

firstSic.performTransition({panelSelector:"#panel4",transitionName:"newspaperIn"});

```

```javascript
// Transition panel "#panel4" out, using the
// spinning newspaper effect

firstSic.performTransition({panelSelector:"#panel4",transitionName:"newspaperOut"});

```

#### rotateStack

The `rotateStack` transition takes an integer parameter, denoted by `stackRotationNumber` and either pulls panels from the top of the stack and puts them on the bottom (positive integers) or pulls panels from the bottom of the stack and puts them on top (negative integers). `rotateStack` does *not* use a `panelSelector` parameter. If a `panelSelector` argument is supplied, it will be ignored. If the `stackRotationNumber` is not supplied, it is assumed to be 1. 

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
// Returns a list of all available transitions (> 50 at present).

firstSic.getTransitionList();
```

#### `getZIndex(selector)`
Returns the current z-index for the selected panel.

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

`menuPercentage` -- controls the percentage of the panel container that gets covered by a menu. Only relevant for the "menu-" transitions (see above), though it will not cause an error if you set it for other transitions. It will simply have no effect. Default is 25%.

There are other parameters that might be of interest to advanced users, in particular those defining their own custom transtitions. See the `dispatchTable` object in `sic-transit.js` to learn more.

Examples:

```javascript
// Set the duration for the `swipeInFromLeft` transition
// to 3 seconds (3000 ms), rather than the default 500 ms:

firstSic.setParameter("duration",3000,"swipeInFromLeft");
```

```javascript
// Demo our new swipeInFromLeft duration

firstSic.performTransition({panelSelector:"#panel4",transitionName:"swipeInFromLeft"});
```

The percentage of the container covered by menus is a settable parameter.

```javascript
// Set the menu coverage for the menuInFromRight 
// transition to 33% (rather than the default 25%).

firstSic.setParameter("menuPercentage",33,"menuInFromRight");

// Do the same for the menuOutToRight transition
// (unexpected effects may occur if menu in and out transitions
// have different coverage percentages).

firstSic.setParameter("menuPercentage",33,"menuOutToRight");
```

```javascript
// Now show a menu from the right, which will use
// the new 33% menu coverage.

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
// Now show a menu from the right, which will use
// the new 50% menu coverage.

firstSic.performTransition({panelSelector:"#panel4",transitionName:"menuInFromRight"});
```

```javascript
// Close the menu.

firstSic.performTransition({panelSelector:"#panel4",transitionName:"menuOutToRight"});
```

#### `removePanel(panelSelector)`

Removes the panel with the given selector from the Sic Transit instance. Returns the panel. If you wish, you can retain the panel and add it back at a later time with `showPanel()`.

```javascript
// Remove #panel4 from the internal panel stack and the DOM.
// After this is called, removedPanel will retain a reference
// to the panel, so it can be added back later (e.g. with showPanel()).
// If you do not save a reference, the removed panel will eventually
// be garbage collected.

let removedPanel = firstSic.removePanel("#panel4");
```

#### Callbacks

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
Note the use of args.transitionName in `anotherCallBackFunc()` The args object passed to a callback has the following data available for use:

    args.transitionName
    args.startTime
    args.endTime
    args.panelSelector
    args.selectedPanel
    args.stackRotationNumber (only valid for the `rotateStack` transition)

Future transitions may define other key/value pairs on the args object.
    
Most of these are self-explanatory. The difference between `panelSelector` and `selectedPanel` is that the first is the selector provided by the user and the second is the HTML element that was actually selected using that selector.

#### `showPanel(selector)`
Move the `div` with the given selector to the top of the stack and display it immediately. If the `div` is not already a panel, it will be removed from its current location in the DOM, added to the panel container, and added to the panel stack. The CSS classes required to make it function as a panel will be added automatically, if necessary. Most reasonable pre-existing `div` classes (other than those that specify hard-coded positions) should work. Please open an issue if you have problems here. See the examples in the section on Selectors, below.


#### `stackDump()`
Prints the current state of the panel stack to the console. This is handy if you are debugging a new transition.

#### `transferPanel(selector,destinationSic)`

Transfers a panel between one Sic Transit instance and another. Call this method on the source instance.

```javascript
// Transfer #panel1 from #sic1 to #sic2

firstSic.transferPanel("#panel1",secondSic);

```
## Selectors

Many of the Sic Transit public methods have a selector argument to specify a particular panel. The examples below use `showPanel()` for simplicity, but these selector types below can be used with any method that requires selecting a panel (for example, the `panelSelector` parameter in `performTransition`).

A Sic Transit selector can be any of the following types:

### String 
Strings as normal query selectors, with the same basic syntax as `document.querySelector()` and CSS. This is the most common type. SicTransit actually uses `document.querySelector()` under the hood here, so the selectors can get as fancy as you need them to be.

```javascript

// Move the "loose" #panel9 div out of the top level and put it in firstSic.

firstSic.showPanel("#panel9"); 
```

### Integer
Integers are intepreted as numeric indices into the internal panel stack. A negative integer, including "negative zero" -- yes, negative zero is an actual JavaScript value -- denotes an offset from the top of the stack, while a positive integer, including the normal "positive zero", indicates an offset from the bottom of the stack.

```javascript
// Use an integer value to move the panel one up from the bottom of the secondSic stack to the top of the stack and display it. 

secondSic.showPanel(1);
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
