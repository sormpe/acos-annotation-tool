import Highlight, { defaultProps } from "prism-react-renderer";

import { FunctionalComponent, h, ComponentProps } from "preact";
import { useEffect } from "preact/hooks";

import "./../../style/prism.css";
import oceanicNext from 'prism-react-renderer/themes/oceanicNext';
import palenight from 'prism-react-renderer/themes/palenight';

interface CodeProps extends ComponentProps<any> {
  code: string;
  language: any;
}

const CodeBlock: FunctionalComponent<CodeProps> = ({ code, language }) => {

    useEffect(() => {
      console.log("prism code block", code);
    }, [code]);

    let theme;
    if (language === 'javascript') {
      theme = oceanicNext;
    } else {
      theme = palenight;
    }

    return (
      <div id="content-block">
      
      <Highlight {...defaultProps} theme={theme} code={code} language={language}>
          {({ className, style, tokens, getLineProps, getTokenProps }) => (
            <pre class={className} style={'white-space: pre-wrap; padding: 0.6em 0.2em 0.6em 1em;'}>
              {tokens.map((line, i) => (
                <div {...getLineProps({ line, key: i }) as any}>
                  {line.map((token, key) => (
                    <span {...getTokenProps({ token, key }) as any} />
                  ))}
                </div>
              ))}
            </pre>
          )}
        </Highlight>
      </div>

    );
};

export default CodeBlock;
