Docs for flip transitions. Put this back in the main doc after I figure out why they're not working in Safari. :-)

#### `flipInX/flipOutX, flipInY/flipOutY`

These transitions provide a "flip card" effect. `flipInX` and `flipOutX` rotate the card about the X axis, while `flipInY` and   `flipOutY` rotate it about the Y axis.

```javascript
// Display #panel1 using a flipcard effect
// about the X axis

demoSic.performTransition({panelSelector:"#panel1",transitionName:"flipInX"});
```

```javascript
// Hide #panel1 by using an inverse flipcard
// effect about the Y axis.

demoSic.performTransition({panelSelector:"#panel1",transitionName:"flipOutY"});
```