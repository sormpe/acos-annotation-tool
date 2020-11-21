import { FunctionalComponent, h } from 'preact';
import { useEffect, useState, useRef } from 'preact/hooks';

import { Link } from 'preact-router/match';
import * as style from './style.css';

import SplitPane from 'react-split-pane';


import 'react-reflex/styles.css';

import { ReflexContainer, ReflexSplitter, ReflexElement } from 'react-reflex';

const About: FunctionalComponent = () => {
  return (
    <div>
      <div class={style.about}>
        <h2>Code annotion tool</h2>
        <p>
          With this tool you can easily create and preview annotations. It genererates both reStructuredText and JSON notations for later usage, for
          example creating ACOS content packages.
        </p>
        <p>Currently, it supports plain text and following programming and markup languages:</p>
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
