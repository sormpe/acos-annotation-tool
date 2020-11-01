import { FunctionalComponent, h } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import * as style from './style.css';

import CodeBlock from '../../components/codeblock';
import prism from 'prismjs';

import { InputValues } from '../../config/inputs';

const Home: FunctionalComponent = () => {
  type annotationType = {
    index: number;
    content: any;
    beforeContent: any;
    afterContent: any;
    annotation: string;
    locIndex: number;
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
  const [syntaxHighlight, setSyntaxHighlight] = useState<string>('');

  useEffect(() => {
    restructurify();
  }, [textvalue, code, annotations, syntaxHighlight]);

  function getSelectedTextRange(codeToAnnotate: HTMLInputElement) {
    const from = codeToAnnotate.selectionStart as number;
    const to = codeToAnnotate.selectionEnd as number;
    return { from, to };
  }

  const addAnnotation = () => {
    const codeToAnnotate = document.getElementById('code-to-annotate') as HTMLInputElement;
    const { from, to } = getSelectedTextRange(codeToAnnotate);
    const selection = codeToAnnotate.value.substring(from, to);
    const beforeAnnotation = codeToAnnotate.value.substring(0, from);

    const afterAnnotation = codeToAnnotate.value.substring(to, code.length + annotations.length * 3);

    const index = annotations.length + 1;
    const modifiedCode = replaceAt(from, to, index + '«' + selection.toString() + '»', textvalue);

    setTextvalue(modifiedCode);

    codeToAnnotate.value = modifiedCode;

    updateAnnotations({
      index: index,
      // prettier-ignore
      content: selection.toString().replace(/[0-9]+«/g, '').replace(/»/g, ''),
      beforeContent: beforeAnnotation.replace(/[0-9]+«/g, '').replace(/»/g, ''),
      afterContent: afterAnnotation.replace(/[0-9]+«/g, '').replace(/»/g, ''),
      annotation: '',
      locIndex: from
    });
  };

  const replaceAt = (from: number, to: number, replacement: string, value: string) => {
    const modified = value.substr(0, from) + replacement + value.substr(to, value.length);
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

  const restructurify = () => {
    const syntaxHighlight = document.getElementById('syntax-highlight-input') as HTMLInputElement;
    const codeToAnnotate = document.getElementById('code-to-annotate') as HTMLInputElement;

    let rst = '';
    rst += '.. annotated::\n';
    rst += '\t.. code-block:: ' + syntaxHighlight.value + '\n\n';
    rst += tabify(codeToAnnotate.value);
    rst += '\n\n';

    (annotations as annotationType[]).map((annotation: annotationType, idx: any) => {
      rst += '\t.. annotation::\n\t\t' + annotation.annotation + '\n\n';
    });

    let json: any = jsonResult;
    json[0].language = syntaxHighlight.value;
    json[1].contentblock = textvalue;
    json[2].annotations = [];
    (annotations as annotationType[]).map((annotation: annotationType, idx: any) => {
      json[2].annotations.push({
        index: json[2].annotations.length + 1,
        content: annotation.content,
        annotation: annotation.annotation
      });
    });

    setRstResult(rst);
    setJsonResult(json);

    const codeOutput = document.getElementById('code-output') as any;
  };

  const removeAnnotation = (e: any, index: number) => {
    const idx = Number(e.target.getAttribute('data-index'));
    const removedAnnoation = annotations.find(a => a.index === index) as annotationType;
    const splicedAnnotations = annotations.filter(item => item.index !== idx);

    setAnnotations(splicedAnnotations);

    const coords = textvalue.indexOf(index + '«' + removedAnnoation.content + '»');

    const newTextValue = textvalue.substring(coords + 2, coords + removedAnnoation.content.length + 2);
    const modifiedCode = replaceAt(coords, coords + removedAnnoation.content.length + 3, newTextValue, textvalue);

    setTextvalue(modifiedCode);
  };

  const moveAnnotationDown = (e: any, index: number) => {
    setAnnotations([]);

    const annotation = annotations[index - 1];
    const belowAnnotation = annotations[index];

    annotations[index - 1] = { ...belowAnnotation, index: annotation.index };
    annotations[index] = { ...annotation, index: belowAnnotation.index };

    const firstCoords = textvalue.indexOf(index + '«' + annotation.content + '»');
    const secondCoords = textvalue.indexOf(index + 1 + '«' + belowAnnotation.content + '»');

    const newTextValue = textvalue.substring(firstCoords + 1, firstCoords + annotation.content.length + 3);
    let modifiedCode = replaceAt(firstCoords, firstCoords + annotation.content.length + 3, belowAnnotation.index + newTextValue, textvalue);

    const secondnewTextValue = modifiedCode.substring(secondCoords + 1, secondCoords + belowAnnotation.content.length + 3);

    modifiedCode = replaceAt(secondCoords, secondCoords + belowAnnotation.content.length + 3, annotation.index + secondnewTextValue, modifiedCode);

    setTextvalue(modifiedCode);

    setAnnotations(annotations);
    restructurify();
  };

  const moveAnnotationUp = (e: any, index: number) => {
    setAnnotations([]);

    const aboveAnnotation = annotations[index - 2];
    const annotation = annotations[index - 1];

    annotations[index - 2] = { ...annotation, index: aboveAnnotation.index };
    annotations[index - 1] = { ...aboveAnnotation, index: annotation.index };

    const firstCoords = textvalue.indexOf(index + '«' + annotation.content + '»');
    const secondCoords = textvalue.indexOf(index - 1 + '«' + aboveAnnotation.content + '»');

    const newTextValue = textvalue.substring(firstCoords + 1, firstCoords + annotation.content.length + 3);
    let modifiedCode = replaceAt(firstCoords, firstCoords + annotation.content.length + 3, aboveAnnotation.index + newTextValue, textvalue);

    const secondnewTextValue = modifiedCode.substring(secondCoords + 1, secondCoords + aboveAnnotation.content.length + 3);

    modifiedCode = replaceAt(secondCoords, secondCoords + aboveAnnotation.content.length + 3, annotation.index + secondnewTextValue, modifiedCode);

    setTextvalue(modifiedCode);

    setAnnotations(annotations);
    restructurify();
  };

  const updateAnnotations = (annotation: annotationType) => {
    setAnnotations([]);

    const modified: annotationType[] = annotations;
    const foundIndex = modified.findIndex(x => x.index === annotation.index);
    if (foundIndex === -1) {
      modified.push(annotation);
    } else {
      modified[foundIndex] = annotation;
    }

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
    setTextvalue(e.target.value);
    setCode(
      e.target.value
        .replace(/[0-9]+«/g, '')
        .replace(/»/g, '')
        .replace(/\s*$/g, '')
    );

    if (annotations.length > 0) {
      for (let annotation of annotations as any) {
        const from = e.target.value.indexOf(annotation.index + '«');

        updateAnnotations({
          index: annotation.index,
          // prettier-ignore
          content: e.target.value.split(annotation.index + '«')[1].split('»')[0].replace(/[0-9]+«/g, '').replace(/»/g, ''),
          beforeContent: e.target.value
            .split(annotation.index + '«')[0]
            .replace(/[0-9]+«/g, '')
            .replace(/»/g, ''),
          afterContent: e.target.value
            .split(annotation.index + '«')[1]
            .split('»')[1]
            .replace(/[0-9]+«/g, '')
            .replace(/»/g, ''),
          annotation: annotation.annotation,
          locIndex: from
        });
      }
    }
  };

  const handleHighLightChange = (e: any) => {
    setSyntaxHighlight(e.target.value);
  };

  const inputChange = (e: any, index: number) => {
    const annotation = annotations.find(a => a.index === index) as annotationType;
    const a = { ...annotation, annotation: e.target.value };
    updateAnnotations(a);
    restructurify();
  };

  const highlightNodes = (e: HTMLElement, string: string, before: string, after: string) => {
    const nodes = e.children[0];

    let recurringTextFromLines = '';
    let recurringTextFromLinesArray = [];

    for (let i = 0; i < nodes.children.length; i++) {
      const e = nodes.children[i] as HTMLElement;

      for (let j = 0; j < e.children.length; j++) {
        recurringTextFromLines += (e.children[j] as any).innerText;
        recurringTextFromLinesArray.push(e.children[j]);
      }
      if (recurringTextFromLines.includes(string.replace(/(\r\n|\n|\r)/gm, '').replace(/\s*$/g, ''))) {
        for (let item of nodes.children as any) {
          item.textContent = '';
        }

        const arr = recurringTextFromLines.split(string.replace(/(\r\n|\n|\r)/gm, ''));

        const span1 = document.createElement('span');
        span1.textContent = before;

        const span2 = document.createElement('span');
        span2.textContent = string;

        const span3 = document.createElement('span');
        span3.textContent = after;
        e.appendChild(span1);
        e.appendChild(span2);
        span2.id = 'search-term';
        span2.setAttribute('style', 'background-color:crimson');
        e.appendChild(span3);
        prism.highlightElement(span1);
        prism.highlightElement(span3);
      }
    }
  };

  const onMouseOver = (e: any) => {
    const index: number = Number(e.target.id.slice(-1));
    const annotation = annotations.find(a => a.index === index) as annotationType;

    const content = annotation.content;
    const before = annotation.beforeContent;
    const after = annotation.afterContent;

    const d = document.getElementById('content-block') as HTMLElement;
    highlightNodes(d, content, before, after);
  };

  function removeChildren(elem: any) {
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
    setCode(code.replace(/[0-9]+«/g, '').replace(/»/g, ''));
  };

  const handleKeyDown = (e: any) => {
    let value = textvalue,
      selStartPos = e.currentTarget.selectionStart;

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
          <div style={'margin-bottom: 0.6em; display: flex; flex-direction: row; justify-content: flex-end'}>
            <div style={'margin-right: auto; width: 90%;'}>
              <input
                style={'width: 95%; height: 3em'}
                onInput={e => inputChange(e, a.index)}
                id={'annotation-input-' + a.index}
                value={annotation.index === a.index ? annotation.annotation : 'error'}
              />
            </div>
            <div style={''}>
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
            </div>
          </div>
          <div style={'margin-bottom: 1em;'}>{a.content ? a.content : 'empty content'}</div>

          {annotations[a.index] !== undefined ? <hr /> : null}
        </li>
      );
    }
  });

  const highlightValues = Object.keys(InputValues).map(i => {
    return <option value={i}>{i}</option>;
  });

  return (
    <div class={style.home}>
      <div class={style.leftside}>
        <div>
          <select id="syntax-highlight-input" name="highlight" onInput={handleHighLightChange}>
            {highlightValues}
          </select>
        </div>
        <pre>
          <code>
            <textarea onKeyDown={handleKeyDown} value={textvalue} class={style['text-area']} id="code-to-annotate" onInput={handleChange} />
          </code>
        </pre>
        <button onClick={addAnnotation} id="add-annotation-button">
          Add annotation
        </button>

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
