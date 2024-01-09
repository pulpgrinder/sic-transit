# SicTransit JavaScript Library

`SicTransit` is an MIT-licensed, dependency-free library that provides a versatile set of animated transitions for HTML elements within a specified container. It is primarily designed to provide screen transitions for web-based mobile applications.

## Features
- Pure JavaScript and CSS with NO dependencies.
- Numerous avalable transitions including cuts, dissolves, fades, flips, hinges, wipes, irises, zooms, and more.
- Easy addition and removal of custom screen panels.
- Customizable animation duration, easing, and more.
- Multiple instances of `SicTransit` can coexist on the same page. Panels can be transferred from one instance to another.


## Mode of Operation
SicTransit relies on a user-specified container `div` that contains other user-created `div`s which function as movable "panels". SicTransit uses an internal stack to keep track of the panels and their relative position. In general, only the panel on top of the stack after the transition is complete will be visible. SicTransit transitions manipulate the panel stack in different ways, while simultaneously manpulating the CSS values for the panels (such as the z-index) to make the panels appear, disappear, move, and so on.

See the [documentation](https://pulpgrinder.github.io/sic-transit/) for details.

