import Highlight, { defaultProps } from 'prism-react-renderer';

import { FunctionalComponent, h, ComponentProps } from 'preact';

import './../../style/prism.css';

interface CodeProps extends ComponentProps<any> {
  code: string;
  language: any;
}

const CodeBlock: FunctionalComponent<CodeProps> = ({ code, language }) => {
  return (
    <div id="content-block">
      <Highlight {...defaultProps} theme={undefined} code={code} language={language}>
        {({ className, style, tokens, getLineProps, getTokenProps }) => (
          <pre class={className} style={'white-space: pre-wrap; padding: 0.6em 0.2em 0.6em 1em;'}>
            {tokens.map((line, i) => {
              // Ensure blank lines/spaces drop onto a new line
              if (line.length === 1 && line[0].content === '' && i < tokens.length - 1) {
                line[0].content = ' ';
              }

              return (
                <div {...(getLineProps({ line, key: i }) as any)}>
                  {line.map((token, key) => (
                    <span
                      {...(getTokenProps({
                        token,
                        key
                      }) as any)}
                    />
                  ))}
                </div>
              );
            })}
          </pre>
        )}
      </Highlight>
    </div>
  );
};

export default CodeBlock;
