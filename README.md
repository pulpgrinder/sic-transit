# sic-transit
Dependency-free transition library
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