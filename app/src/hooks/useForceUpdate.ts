import { useState } from "preact/hooks";

//create your forceUpdate hook
export function useForceUpdate() {
    const [value, setValue] = useState(0); // integer state
    console.log("FORCE UPDATE");
    return () => setValue(value => ++value); // update the state to force render
}