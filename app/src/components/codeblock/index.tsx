import Highlight, { defaultProps, Language } from 'prism-react-renderer';

import { FunctionalComponent, h } from 'preact';

import './../../style/prism.css';

interface CodeProps {
  code: string;
  language: Language;
}

const CodeBlock: FunctionalComponent<CodeProps> = (props: CodeProps) => {
  const { code, language } = props;
  console.log('lang', language);
  return (
    <div id="content-block">
      <Highlight {...defaultProps} theme={undefined} code={code} language={language}>
        {({ className, tokens, getLineProps, getTokenProps }): JSX.Element => (
          <pre class={className} style={'white-space: pre-wrap; padding: 0.6em 0.2em 0.6em 1em;'}>
            {tokens.map((line, i) => {
              // Ensure blank lines/spaces drop onto a new line
              if (line.length === 1 && line[0].content === '' && i < tokens.length - 1) {
                line[0].content = ' ';
              }

              return (
                <div key={i} {...getLineProps({ line, key: i })}>
                  {line.map((token, key) => (
                    <span
                      key={key}
                      {...getTokenProps({
                        token,
                        key
                      })}
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
