import { FunctionalComponent, h } from 'preact';
import { Link } from 'preact-router/match';
import * as style from './style.css';

const About: FunctionalComponent = () => {
  return (
    <div class={style.about}>
      <h2>Code annotion tool</h2>
      <p>
        With this tool you can easily create and preview annotations. It genererates both reStructuredText and JSON notations for later usage, for
        example creating ACOS content packages.
      </p>
      <p>Currently, it supports plain text and following programming and markup languages:</p>
      <ul>
        <li>JavaScript</li>
        <li>Python</li>
        <li>CSS</li>
        <li>C</li>
      </ul>
    </div>
  );
};

export default About;
