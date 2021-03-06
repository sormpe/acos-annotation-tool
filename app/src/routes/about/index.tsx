import { FunctionalComponent, h } from 'preact';

import * as style from './style.css';

const About: FunctionalComponent = () => {
  return (
    <div>
      <div class={style.about}>
        <h2>Code annotion tool</h2>

        <p>
          With this tool you can easily create and preview annotations for code and text snippets. It genererates both reStructuredText and JSON for
          later usage. RST can be used in A+ and JSONs are used with codeannotation ACOS content type.
        </p>
        <p>Currently, editor supports plain text and following programming and markup languages:</p>
        <div class="ml-12 mt-3">
          <ul class="list-disc">
            <li>JavaScript</li>
            <li>Python</li>
            <li>CSS</li>
            <li>C</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default About;
