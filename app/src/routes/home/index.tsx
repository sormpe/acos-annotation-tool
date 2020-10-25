import { FunctionalComponent, h } from 'preact';
import { useEffect, useState, useRef, useCallback } from 'preact/hooks';
import * as style from './style.css';

import CodeBlock from '../../components/codeblock';
import { highlight } from 'prismjs';

const Home: FunctionalComponent = () => {
  type annotationType = {
    index: number;
    content: any;
    annotation: string;
    locIndex: number;
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
    console.log('textvalue changed', textvalue);
    restructurify();

    removeAnnotationMarks();
  }, [textvalue]);

  useEffect(() => {
    console.log('code changed', code);
    restructurify();
  }, [code]);

  useEffect(() => {
    console.log('annotations changed', annotations);
    restructurify();
  }, [annotations]);

  function getSelectedTextRange(codeToAnnotate: HTMLInputElement) {
    console.log('getSelectedTextRange codeToAnnotate', codeToAnnotate.value);

    const from = codeToAnnotate.selectionStart as number;
    const to = codeToAnnotate.selectionEnd as number;
    return { from, to };
  }

  const addAnnotation = () => {
    const codeToAnnotate = document.getElementById('code-to-annotate') as HTMLInputElement;
    const originalcode = code;
    const { from, to } = getSelectedTextRange(codeToAnnotate);
    console.log('from, to', from, to);
    console.log('textvalue', textvalue);
    const selection = codeToAnnotate.value.substring(from, to);
    const index = annotations.length + 1;
    const modifiedCode = replaceAt(from, to, index + '«' + selection.toString() + '»', textvalue);
    console.log('modifiedCode text value', modifiedCode);
    console.log('modifiedCode code', code);

    setTextvalue(modifiedCode);

    codeToAnnotate.value = modifiedCode;

    updateAnnotations({
      index: index,
      content: selection.toString(),
      annotation: '',
      locIndex: from
    });
  };

  const replaceAt = (from: number, to: number, replacement: string, value: string) => {
    console.log('code.value', value, from, to, replacement.length);
    console.log('sub 1', value.substr(0, from));
    console.log('sub 2', value.substr(to, code.length));
    console.log('replacement', replacement);

    const modified = value.substr(0, from) + replacement + value.substr(to, value.length);
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
    const syntaxHighlight = document.getElementById('syntax-highlight-input') as HTMLInputElement;
    const codeToAnnotate = document.getElementById('code-to-annotate') as HTMLInputElement;

    let rst = '';
    rst += '.. annotated::\n';
    rst += '\t.. code-block:: ' + syntaxHighlight.value + '\n\n';
    rst += tabify(codeToAnnotate.value);
    rst += '\n\n';

    (annotations as annotationType[]).map((a: any, idx: any) => {
      console.log('restructurify a', a.index);
      const input = document.getElementById('annotation-input-' + a.index.toString()) as any;
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
      const input = document.getElementById('annotation-input-' + a.index.toString()) as any;
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

  const removeAnnotationMarks = () => {
    let code = textvalue;

    (annotations as annotationType[]).map((a: any, idx: any) => {
      const coords = code.indexOf(a.index + '«' + a.content + '»');
      if (coords !== -1) {
        const newTextValue = code.substring(coords + 2, coords + a.content.length + 2);

        const modifiedCode = replaceAt(coords, coords + a.content.length + 3, newTextValue, code);

        code = modifiedCode;
      }
    });
    setCode(code);
  };

  const removeAnnotation = (e: any, index: number) => {
    console.log('e', e);
    console.log('remove index', index);

    const idx = Number(e.target.getAttribute('data-index'));
    const removedAnnoation = annotations.find(a => a.index === index) as annotationType;
    console.log('coords remove annoation', removedAnnoation);
    const splicedAnnotations = annotations.filter(item => item.index !== idx);

    console.log('splicedAnnotations', splicedAnnotations);

    setAnnotations(splicedAnnotations);

    const coords = textvalue.indexOf(index + '«' + removedAnnoation.content + '»');

    const newTextValue = textvalue.substring(coords + 2, coords + removedAnnoation.content.length + 2);
    const modifiedCode = replaceAt(coords, coords + removedAnnoation.content.length + 3, newTextValue, textvalue);
    console.log('modifiedCode text value', modifiedCode);
    console.log('modifiedCode code', code);

    setTextvalue(modifiedCode);
  };

  const moveAnnotationDown = (e: any, index: number) => {
    setAnnotations([]);

    console.log('moveAnnotationDown');
    const content = annotations[index - 1].content;
    const bottomContent = annotations[index].content;
    const annotation = annotations[index - 1].annotation;
    const bottomAnnotation = annotations[index].annotation;

    annotations[index - 1].content = bottomContent;
    annotations[index].content = content;
    annotations[index - 1].annotation = bottomAnnotation;
    annotations[index].annotation = annotation;
    setAnnotations(annotations);
    restructurify();
  };

  const moveAnnotationUp = (e: any, index: number) => {
    setAnnotations([]);

    const aboveContent = annotations[index - 2].content;
    const content = annotations[index - 1].content;
    const aboveAnnotation = annotations[index - 2].annotation;
    const annotation = annotations[index - 1].annotation;

    annotations[index - 1].content = aboveContent;
    annotations[index - 2].content = content;
    annotations[index - 1].annotation = aboveAnnotation;
    annotations[index - 2].annotation = annotation;
    console.log('moveAnnotationUp');
    setAnnotations(annotations);
    restructurify();
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
    if (annotations.length === 0) {
      setCode(e.target.value);
    }
  };

  const handleHighLightChange = (e: any) => {
    console.log('e', e.target.value);
    setSyntaxHighlight(e.target.value);
  };

  const inputChange = (e: any, index: number) => {
    console.log('e', e.target.value);
    const annotation = annotations.find(a => a.index === index) as annotationType;
    const a = { ...annotation, annotation: e.target.value };
    updateAnnotations(a);
    console.log('annotations', annotations);
    restructurify();
  };

  const highlightNodes = (e: HTMLElement, string: string) => {
    const nodes = e.children[0];
    for (let i = 0; i < nodes.childNodes.length; i++) {
      // console.log('children', nodes.childNodes[i]);
      const e = nodes.childNodes[i] as HTMLElement;
      console.log('children', e);
      console.log('inc', e.innerText, string);
      if (e.innerText === string) {
        const r = e.firstChild as any;
        for (let i = 0; i < e.childNodes.length; i++) {
          console.log('e.childNodes[i]', e.childNodes[i]);
          const c = e.childNodes[i] as HTMLElement;
          console.log('classname1', c);
          const parent = c.parentNode as HTMLElement;
          if (parent.className === 'token-line') {
            c.id = 'search-term';

            c.setAttribute('style', 'background-color:crimson');
          }
        }

        return e;
      } else if (e.innerText.includes(string)) {
        console.log('include!');
        const s = e.innerText.split(string);
        console.log('include ', s);
        const span = document.createElement('span');
        span.textContent = string;
        e.innerText = s[0];
        const p = e.parentNode as any;
        console.log('parent', p);

        e.appendChild(span);
        console.log('classname2', p);
        const parent = e.parentNode as HTMLElement;
        if (e.childNodes.length > 0) {
          for (let i = 0; i < e.childNodes.length; i++) {
            const c = e.children[i];
            c.id = 'search-term';

            c.setAttribute('style', 'background-color:crimson');
          }
        } else {
          e.id = 'search-term';

          e.setAttribute('style', 'background-color:crimson');
        }
      }
    }
  };

  const onMouseOver = (e: any) => {
    console.log('e', e);

    console.log('e', e.target.id.slice(-1));
    const index: number = Number(e.target.id.slice(-1));
    const annotation = annotations.find(a => a.index === index) as annotationType;

    console.log('annotation', annotation);
    console.log('annotation loc', annotation.locIndex);

    const content = annotation.content;

    const d = document.getElementById('content-block') as HTMLElement;
    highlightNodes(d, content);
  };

  function removeChildren(elem: any) {
    console.log('removeChildren', elem);
    while (elem.hasChildNodes()) {
      if (elem.id === 'search-term') {
        elem.removeAttribute('style');
      }

      removeChildren(elem.lastChild);
      elem.removeChild(elem.lastChild);
    }
    setCode('');
  }

  const onMouseLeave = (e: any) => {
    setCode('');

    const element = document.getElementById('content-block') as HTMLElement;
    removeChildren(element.childNodes[0]);

    console.log('onMouseLeave element', element.childNodes[0]);
    console.log('onMouseLeave code', code);
    setCode(code);
  };

  const handleKeyDown = (e: any) => {
    let value = textvalue,
      selStartPos = e.currentTarget.selectionStart;

    console.log(e.currentTarget);

    // handle 4-space indent on
    if (e.key === 'Tab') {
      value = value.substring(0, selStartPos) + '    ' + value.substring(selStartPos, value.length);
      e.currentTarget.selectionStart = selStartPos + 3;
      e.currentTarget.selectionEnd = selStartPos + 4;
      e.preventDefault();

      setTextvalue(value);
    }
  };

  const listAnnotations = (annotations as annotationType[]).map(a => {
    const annotation = annotations.find(x => x.index === a.index) as annotationType;

    if (a) {
      return (
        <li>
          <input
            onInput={e => inputChange(e, a.index)}
            id={'annotation-input-' + a.index}
            value={annotation.index === a.index ? annotation.annotation : 'error'}
          />
          {a.content ? a.content : 'error'}
          <button onClick={e => removeAnnotation(e, a.index)} id="remove-button" data-index={a.index}>
            x
          </button>
          {annotations.length > 1 ? (
            <span>
              {annotations.length > 1 && annotations[a.index] !== undefined ? (
                <button onClick={e => moveAnnotationDown(e, a.index)}>&darr;</button>
              ) : null}
              {annotations.length > 1 && annotations[a.index - 2] !== undefined ? (
                <button onClick={e => moveAnnotationUp(e, a.index)}>&uarr;</button>
              ) : null}
            </span>
          ) : null}
        </li>
      );
    }
  });

  return (
    <div class={style.home}>
      <div class={style.leftside}>
        <input id="syntax-highlight-input" value={syntaxHighlight} onInput={handleHighLightChange} />

        <pre>
          <code>
            <textarea onKeyDown={handleKeyDown} value={textvalue} class={style['text-area']} id="code-to-annotate" onInput={handleChange} />
          </code>
        </pre>

        <button onClick={addAnnotation} id="add-annotation-button">
          Add annotation
        </button>
        {/*
        <button onClick={generate} id="restructurify-button">
          ReStructurify
        </button>
        */}

        <ol id="annotation-list">{listAnnotations}</ol>

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
        <div id={style.codeblock}>
          {code && <CodeBlock code={code} language={syntaxHighlight} />}
          {(annotations as annotationType[]).map(a => {
            console.log('aaa', a);
            console.log('id', 'annotation-input-' + a.index.toString());
            if (annotations.length > 0) {
              return (
                <div id={'annotation-for-' + a.index.toString()} class={style.annotation} onMouseOver={onMouseOver} onMouseLeave={onMouseLeave}>
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
