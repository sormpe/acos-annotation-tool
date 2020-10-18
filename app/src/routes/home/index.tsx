import { FunctionalComponent, h } from 'preact';
import { useEffect, useState, useRef, useCallback } from 'preact/hooks';
import * as style from './style.css';

import CodeBlock from '../../components/codeblock';

const Home: FunctionalComponent = () => {
  type annotationType = {
    index: number;
    content: any;
    annotation: string;
  };

  type annotationsType = {
    [key: string]: annotationType;
  };

  const jsonValue = [
    {
      language: ''
    },
    {
      contentblock: ''
    },
    {
      annotations: []
    }
  ];

  const [code, setCode] = useState<string>('');
  const [textvalue, setTextvalue] = useState<string>('');

  const [rstResult, setRstResult] = useState<string>('');
  const [jsonResult, setJsonResult] = useState<object>(jsonValue);
  const [annotations, setAnnotations] = useState<annotationType[] | []>([]);
  const [syntaxHighlight, setSyntaxHighlight] = useState<string>('javascript');

  useEffect(() => {
    console.log('code changed', code);
  }, [code]);

  useEffect(() => {
    console.log('annotations changed', annotations);
  }, [annotations]);

  function getSelectedTextRange(codeToAnnotate: HTMLInputElement) {
    console.log('getSelectedTextRange codeToAnnotate', codeToAnnotate.value);

    const from = codeToAnnotate.selectionStart as number;
    const to = codeToAnnotate.selectionEnd as number;
    return { from, to };
  }

  const addAnnotation = () => {
    const codeToAnnotate = document.getElementById(
      'code-to-annotate'
    ) as HTMLInputElement;
    const originalcode = code;
    const { from, to } = getSelectedTextRange(codeToAnnotate);
    console.log('from, to', from, to);
    console.log('textvalue', textvalue);
    const selection = codeToAnnotate.value.substring(from, to);
    const index = annotations.length + 1;
    const modifiedCode = replaceAt(
      from,
      to,
      index + '«' + selection.toString() + '»'
    );
    console.log('modifiedCode text value', modifiedCode);
    console.log('modifiedCode code', code);

    setTextvalue(modifiedCode);

    codeToAnnotate.value = modifiedCode;

    updateAnnotations({
      index: index,
      content: selection.toString(),
      annotation: ''
    });
  };

  const replaceAt = (from: number, to: number, replacement: string) => {
    console.log('code.value', textvalue, from, to, replacement.length);
    console.log('sub 1', textvalue.substr(0, from));
    console.log('sub 2', textvalue.substr(to, code.length));
    console.log('replacement', replacement);

    const modified =
      textvalue.substr(0, from) +
      replacement +
      textvalue.substr(to, textvalue.length);
    console.log('modified.value', modified);

    return modified;
  };

  const tabify = (text: string) => {
    let tabified = '';
    const lines = text.split('\n');
    lines.map(l => {
      tabified += '\t\t' + l + '\n';
    });
    return tabified;
  };

  const generate = () => {
    restructurify();
  };

  const restructurify = () => {
    const syntaxHighlight = document.getElementById(
      'syntax-highlight-input'
    ) as HTMLInputElement;
    const codeToAnnotate = document.getElementById(
      'code-to-annotate'
    ) as HTMLInputElement;

    let rst = '';
    rst += '.. annotated::\n';
    rst += '\t.. code-block:: ' + syntaxHighlight.value + '\n\n';
    rst += tabify(codeToAnnotate.value);
    rst += '\n\n';

    (annotations as annotationType[]).map((a: any, idx: any) => {
      console.log('restructurify a', a.index);
      const input = document.getElementById(
        'annotation-input-' + a.index.toString()
      ) as any;
      console.log('restructurify input', input.value);

      rst += '\t.. annotation::\n\t\t' + input.value + '\n\n';
    });

    let json: any = jsonResult;
    json[0].language = syntaxHighlight.value;
    json[1].contentblock = textvalue;
    json[2].annotations = [];
    (annotations as annotationType[]).map((a: any, idx: any) => {
      console.log('lol', a);
      console.log('json', json[2].annotations);

      console.log('a.index', a.index);
      console.log('json index', json[2].annotations[a.index - 1]);
      const input = document.getElementById(
        'annotation-input-' + a.index.toString()
      ) as any;
      json[2].annotations.push({
        index: json[2].annotations.length,
        content: a.content,
        annotation: input.value
      });
    });

    console.log(rst);
    setRstResult(rst);
    setJsonResult(json);

    const codeOutput = document.getElementById('code-output') as any;
    console.log('codeOutput', codeOutput);
  };

  const removeAnnotation = (e: any, index: number) => {
    console.log('e', e);
    console.log('remove index', index);

    const idx = Number(e.target.getAttribute('data-index'));
    console.log('idx', typeof idx);

    const initialLength = annotations.length;

    const removedAnnoation = annotations.find(
      a => a.index === index
    ) as annotationType;
    console.log('coords remove annoation', removedAnnoation);
    const splicedAnnotations = annotations.filter(item => item.index !== idx);

    console.log('splicedAnnotations', splicedAnnotations);

    setAnnotations(splicedAnnotations);

    console.log('textvalue', textvalue);
    const coords = textvalue.indexOf(
      index + '«' + removedAnnoation.content + '»'
    );
    console.log('coords', coords);
    console.log(
      'coords sub',
      coords + 2,
      coords + 2 + removedAnnoation.content.length
    );

    const test = textvalue.substring(
      coords + 2,
      coords + removedAnnoation.content.length + 2
    );
    console.log('coords test', test);
    const modifiedCode = replaceAt(
      coords,
      coords + removedAnnoation.content.length + 3,
      test
    );
    console.log('modifiedCode text value', modifiedCode);
    console.log('modifiedCode code', code);

    setTextvalue(modifiedCode);
  };

  const updateAnnotations = (annotation: annotationType) => {
    setAnnotations([]);

    console.log('updateAnnotations', annotation);
    const modified: annotationType[] = annotations;
    const foundIndex = modified.findIndex(x => x.index === annotation.index);
    console.log('foundIndex', foundIndex);
    if (foundIndex === -1) {
      modified.push(annotation);
      console.log('modified', modified);
    } else {
      console.log('updating....');
      modified[foundIndex] = annotation;
    }
    console.log('modified', modified);

    setAnnotations(modified);
  };

  const copyRstToClipboard = () => {
    const el = document.createElement('textarea');
    el.value = rstResult;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
  };

  const copyJsonToClipboard = () => {
    const el = document.createElement('textarea');
    el.value = JSON.stringify(jsonResult, null, 2);
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
  };

  const handleChange = (e: any) => {
    console.log('e', e.target.value);
    setTextvalue(e.target.value);
    setCode(e.target.value);
  };

  const handleHighLightChange = (e: any) => {
    console.log('e', e.target.value);
    setSyntaxHighlight(e.target.value);
  };

  const inputChange = (e: any, index: number) => {
    console.log('e', e.target.value);
    const annotation = annotations.find(
      a => a.index === index
    ) as annotationType;
    const a = { ...annotation, annotation: e.target.value };
    updateAnnotations(a);
    console.log('annotations', annotations);
  };

  const onMouseOver = (e: any) => {
    console.log('e', e);

    console.log('e', e.target.id.slice(-1));
    const index: number = Number(e.target.id.slice(-1));
    const annotation = annotations.find(
      a => a.index === index
    ) as annotationType;

    console.log('annotation', annotation);
    const content = annotation.content;
    console.log('content', content);

    const contentDiv = document.getElementById('content-block') as HTMLElement;
    console.log('contentDiv', contentDiv.childNodes[0].childNodes);
    const nodeList = contentDiv.childNodes[0].childNodes[0].childNodes;
    for (let i = 0; i < nodeList.length; i++) {
      let item = nodeList[i] as any;
      console.log('item', item);
      console.log('item type', typeof item.innerText);
      console.log('content type', typeof content);
      console.log('item includes content?', item.innerText.includes(content));
      if (item.innerText.includes(content)) {
        item.setAttribute('style', 'background-color:crimson');
      }
    }
  };

  const onMouseLeave = (e: any) => {
    console.log('e', e);

    console.log('e', e.target.id.slice(-1));
    const index: number = Number(e.target.id.slice(-1));
    const annotation = annotations.find(
      a => a.index === index
    ) as annotationType;

    console.log('annotation', annotation);
    const content = annotation.content;

    const contentDiv = document.getElementById('content-block') as HTMLElement;
    console.log('contentDiv', contentDiv.childNodes[0].childNodes);
    const nodeList = contentDiv.childNodes[0].childNodes[0].childNodes;
    for (let i = 0; i < nodeList.length; i++) {
      let item = nodeList[i] as any;
      console.log('item', item);
      console.log('item type', typeof item.innerText);
      console.log('content type', typeof content);
      console.log('item includes content?', item.innerText.includes(content));
      if (item.innerText.includes(content)) {
        item.removeAttribute('style');
      }
    }
  };

  const handleKeyDown = (e: any) => {
    let value = textvalue,
      selStartPos = e.currentTarget.selectionStart;

    console.log(e.currentTarget);

    // handle 4-space indent on
    if (e.key === 'Tab') {
      value =
        value.substring(0, selStartPos) +
        '    ' +
        value.substring(selStartPos, value.length);
      e.currentTarget.selectionStart = selStartPos + 3;
      e.currentTarget.selectionEnd = selStartPos + 4;
      e.preventDefault();

      setTextvalue(value);
    }
  };

  const listAnnotations = (annotations as annotationType[]).map(a => {
    const annotation = annotations.find(
      x => x.index === a.index
    ) as annotationType;

    if (a) {
      return (
        <div>
          <li>
            <input
              onInput={e => inputChange(e, a.index)}
              id={'annotation-input-' + a.index}
              value={
                annotation.index === a.index ? annotation.annotation : 'error'
              }
            />
            {a.content ? a.index + ': ' + a.content : 'error'}
            <button
              onClick={e => removeAnnotation(e, a.index)}
              id="remove-button"
              data-index={a.index}
            >
              x
            </button>
          </li>
        </div>
      );
    }
  });

  return (
    <div class={style.home}>
      <div class={style.leftside}>
        <input
          id="syntax-highlight-input"
          value={syntaxHighlight}
          onInput={handleHighLightChange}
        />

        <pre>
          <code>
            <textarea
              onKeyDown={handleKeyDown}
              value={textvalue}
              id="code-to-annotate"
              cols={100}
              rows={10}
              onInput={handleChange}
            />
          </code>
        </pre>

        <button onClick={addAnnotation} id="add-annotation-button">
          Add annotation
        </button>
        <button onClick={generate} id="restructurify-button">
          ReStructurify
        </button>

        <ul id="annotation-list">{listAnnotations}</ul>

        <hr />

        <div id={style.preview}>
          {rstResult ? (
            <div>
              <h4>Rst</h4>
              <div id="preview-rst">
                <pre>{rstResult}</pre>
              </div>
              <button onClick={copyRstToClipboard}>Copy</button>
            </div>
          ) : null}
          {jsonResult ? (
            <div>
              <h4>Json</h4>
              <pre>{JSON.stringify(jsonResult, null, 2)}</pre>
              <button onClick={copyJsonToClipboard}>Copy</button>
            </div>
          ) : null}
        </div>
      </div>

      <div id={'right'} class={style.rightside}>
        <h3>Preview</h3>
        <div id={style.codeblock}>
          {code && <CodeBlock code={code} language={syntaxHighlight} />}
          {(annotations as annotationType[]).map(a => {
            console.log('aaa', a);
            console.log('id', 'annotation-input-' + a.index.toString());
            if (annotations.length > 0) {
              return (
                <div
                  id={'annotation-for-' + a.index.toString()}
                  class={style.annotation}
                  onMouseOver={onMouseOver}
                  onMouseLeave={onMouseLeave}
                >
                  {a ? a.annotation : 'waiting...'}
                </div>
              );
            } else {
              return null;
            }
          })}
        </div>
      </div>
    </div>
  );
};

export default Home;
