import { FunctionalComponent, h } from "preact";
import { Link } from "preact-router/match";
import * as style from "./style.css";

const About: FunctionalComponent = () => {
    return (
        <div class={style.about}>
            <h2>Code annotion tool</h2>
            <p>This tool is lorem ipsum...</p>
        </div>
    );
};

export default About;
