# SicTransit JavaScript Library

`SicTransit` is an MIT-licensed, dependency-free library that provides a versatile set of animated transitions for HTML elements within a specified container. It is primarily designed to provide screen transitions for web-based mobile applications.

## Features
- Pure JavaScript and CSS with NO dependencies.
- Numerous avalable transitions including cuts, dissolves, fades, flips, hinges, slides, irises, zooms, and more.
- Easy addition and removal of screen panels.
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
    <div id='panel1' class='mypanelclass'>
        Hi!
    </div>
    <div id='panel2' class='mypanelclass'>
        Bonjour!
    </div>
    <div id='panel3' class='mypanelclass'>
        Hola!
    </div>
    <div id='panel4' class='mypanelclass'>
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
mySic.performTransition({panelSelector:"#slide2",transitionName:"slideInLeft"})
```

The transition should run, with Slide 2 sliding in from the left.

Now try: 

```javascript
mySic.performTransition({panelSelector:"#slide2",transitionName:"slideOutLeft"})
```

As you might expect, the `slideOutLeft` transition does the opposite of the `slideInLeft` transition, effectively undoing the previous transition.

Now try:

```javascript
mySic.performTransition({panelSelector:"#slide1",transitionName:"slideInLeft",duration:6000})
```

Notice how the transition is much slower. That's because there is an extra parameter this time, `duration:6000`. This tells SicTransit to spread the transition over 6000 milliseconds (i.e., 6 seconds).

All of the available transitions are fully described below. There are numerous other parameters you can use in `performTransition()` as well. Those are also described below.

## Mode of Operation
SicTransit relies on a user-specified container `div` that contains other `div`s which function as movable "panels". SicTransit uses an internal stack to manipulate and display panels by setting their z-index values and other CSS parameters. SicTransit transitions manipulate the panel stack in different ways, causing panels to appear, disappear, move, and so on. 

## Initialization

```javascript
const variablename = new SicTransit(containerId, elementClass);
```
`containerId`: The ID of the container div that holds the panels.

`elementClass`: The user-specified class for panels. Panels are  `div`s with the given class, which are nested within the div with id `containerID`. Using different classes (and container ids) will let you have more than one instance of SicTransit on the same page.

Place all your initial panel `div`s within the container `div` you're planning to use (don't worry, you can add or remove panels later -- see below).
### Public Methods

#### Selectors

Many of the following public methods take a `selector` argument to specify a particular panel. A selector can be any of the following:

1) An explicit raw DOM element. Example:

```javascript
let newpanel =  document.createElement('div');
// newpanel is now a new raw DOM element.
mySic.displayPanel(newpanel);
```

Here we're creating a new DOM element, and passing it directly to `displayPanel()`.

2) A query selector (with the same syntax as document.querySelector() and CSS).

Examples:

```javascript
let newpanel =  document.createElement('div');
newpanel.id = 'myNewPanel';
mySic.displayPanel('#myNewPanel'); // display it using the id as a selector.

let secondnewpanel = document.createElement('div');
secondnewpanel.classList.add('secondclass'); // give it a custom class.
mySic.displayPanel('.secondclass'); // display it using the custom class as a  selector.
```
3) A numeric index into the internal panel stack. A negative value or negative zero denotes an offset from the top of the stack, while a positive or positive zero value indicates an offset from the bottom of the stack.

Examples:

```javascript
mySic.displayPanel(-1) // move the panel one down from the top of the stack to the top of the stack and display it.

mySic.displayPanel(1) // move the panel one up from the bottom of the stack to the top of the stack and display it.

mySic.displayPanel(0) // move the panel at the bottom of the stack to the top of the stack and display it.

mySic.displayPanel(-0) // move the panel at the top of the stack to the top of the stack and display it. This obviously has no real effect with `displayPanel()`, but will with other methods.
```

#### Methods
`displayPanel(selector)`
Move the DOM element with the given selector to the top of the stack and display it. If the DOM element is not already a panel, it will be removed from its current location in the DOM, , and added to the panel stack. The CSS classes required to make it function as a panel will be added automatically, if necessary.

`getContainerId()`
Returns the user-specified ID for the panel container. See *Initialization*, above.

`getPanelClass()`
Returns the user-specified CSS class used to identify the panels that belong to this instance of SicTransit. See *Initialization*, above.

`getTransitionList()`
Returns an array of the names of all available transitions.

`getPanelList()`
Returns an array of the ids of panels within the panel container. Note that this does not include the special internal panels used to implement certain effects, nor does it include any user-created panels which don't have ids.

`getBos()`
Returns the panel currently at the bottom of the panel stack as an DOM element.

`getTos()`
Returns the panel currently at the top of the panel stack as a DOM element.

`performTransition(args)`
The heart of Sic Transit. This is documented in detail in its own section below.

`setCallback(function)`
Sets a callback function to be called after each transition. The callback function is called with the args object for the transition as a parameter (again, see the `performTransition` section below).

`stackDump()`
Prints the current state of the panel stack to the console. This is handy if you are debugging a new transition.

Transitions
The library includes a variety of transitions such as cutIn, dissolveOut, fadeInFromBlack, flipOutY, hingeInLeft, newspaperOut, slideInRight, zoomIn, and more. Each transition can be invoked via performTransition() method.

        let defaultArgs = {
            direction: "forward",
            easing: "linear",
            duration: 500,
            elementSelector: "",
            firstanimation:() => {},
            secondanimation: () => {},
            finishHandler:  () => {},
        }