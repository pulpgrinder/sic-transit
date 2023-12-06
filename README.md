# SicTransit JavaScript Library

`SicTransit` is a dependency-free, MIT-licensed library that provides a versatile set of animated transitions for HTML elements within a specified container. It is useful for creating dynamic visual effects in web applications, including screen transitions for web-based mobile applications.

## Features
- Numerous transition animations including cuts, dissolves, fades, flips, hinges, slides, irises, zooms, and more.
- Easy addition and removal of new screen panels.
- Customizable animation duration, easing, and more.

## Mode of Operation
SicTransit relies on a user-specified container `div` that contains other `div`s which function as "panels". Sic Transit uses an internal stack to manipulate and display panels by setting their z-index values and other CSS parameters
## Usage

## Initialization
```javascript
const variablename = new SicTransit(containerId, elementClass);
```
`containerId`: The ID of the container div that holds the panels.

`elementClass`: The user-specified class for panels. Panels are  `div`s with the given class, which are nested within the div with id `containerID`.

Place all your initial panel `div`s in the container `div` you're planning to use. Each panel should have a unique `id`, and also have a custom class want to use with this instance of SicTransit (this allows you to have more than one instance of SicTransit running on the same web page, if you so desire).

For example, you could have something like:

```html
<div id='myContainer'>
    <div id='screen1' class='myscreenclass'>
        Hi!
    </div>
    <div id='screen2' class='myscreenclass'>
        Bonjour!
    </div>
    <div id='screen3' class='myscreenclass'>
        Hola!
    </div>
    <div id='screen4' class='myscreenclass'>
       G'day, mate!
    </div>
```

Then initialize a new SicTransit instance with:

```javascript
const mySic = new SicTransit("myContainer","myscreenclass")
```

### Public Methods

The fundamental method is `performTransition`, which is discussed at length in its own section below. Other public methods include:

`addPanel(selector)`
Appends the given div to the panel container and adds it to the internal panel stack.  The selector can specify the new panel in three ways: 

1) Pass an actual raw DOM element to addPanel.

```javascript
let newpanel =  document.createElement('div');
newpanel.id = 'myNewPanel'; // We need some way to refer to it later. :-)
mySic.addPanel(newpanel);
```

2) Provide the id of the new panel as a string.

```javascript
let newpanel =  document.createElement('div');
newpanel.id = 'myNewPanel'; // We need some way to refer to it later. :-)
mySic.addPanel('myNewPanel');
```

3) Provide a CSS query selector.

```javascript
let newpanel =  document.createElement('div');
newpanel.id = 'myNewPanel'; // We need some way to refer to it later. :-)
newpanel.classList.add('newguyclass');
mySic.addPanel('.newguyclass');
```

If the new panel does not already have the proper CSS classes to function as a Sic Transit panel, they will be added.

`getContainerId()`
Returns the user-specified ID for the panel container. See *Initialization*, above.

`getPanelClass()`
Returns the user-specified CSS class used to identify the panels that belong to this instance of Sic Transit. See *Initialization*, above.

`getTransitionList()`
Returns a list of all available transitions (useful if you wish to allow transition selection in a UI, as in the demo).

`getPanelList()`
Returns a list of available panels within the panel container. Note that this does not include the special internal panels used to implement certain effects, only the ones created by the user, either at startup or by using `addPanel` later.


`getBos()`
Returns the element currently at the bottom of the element stack.

`getTos()`
Returns the element currently at the top of the element stack.

`performTransition(args)`
Performs the specified transition. This is documented in detail in its own section below.

`setCallback(func)`
Sets a callback function to be called after a transition. The callback function is called with the args object for the transition as a paremeter (again, see the `performTransition` section below).

`stackDump()`
Prints the current state of the element stack to the console. This is handy if you are debugging a new transition.

Transitions
The library includes a variety of transitions such as cutIn, dissolveOut, fadeInFromBlack, flipOutY, hingeInLeft, newspaperOut, slideInRight, zoomIn, and more. Each transition can be invoked via performTransition() method.

        let defaultArgs = {
            direction: "forward",
            easing: "linear",
            duration: 500,
            elementSelector: "",
            firstanimation:() => {},
            secondanimation: () => {},
            timing: self.dispatchTable[args["transitionName"]]["timing"],
            transitionFunction: self.dispatchTable["nullTransition"].forwardTransition,
            finishHandler:  () => {},
            fadePanel: self.blackpanel,
            finalDisplayStyle: 'none',
            stackRotation:0
        }