import { FunctionalComponent, h } from 'preact';
import { useEffect, useState, useRef } from 'preact/hooks';
import * as style from './style.css';

import parse from 'html-react-parser';

import AceEditor from 'react-ace';

import 'ace-builds/src-noconflict/mode-javascript';
import 'ace-builds/src-noconflict/mode-python';
import 'ace-builds/src-noconflict/mode-c_cpp';
import 'ace-builds/src-noconflict/mode-css';
import 'ace-builds/src-noconflict/mode-plain_text';

import 'ace-builds/src-noconflict/theme-github';
import 'ace-builds/src-noconflict/theme-monokai';

import CodeBlock from '../../components/codeblock';
import prism from 'prismjs';

import { InputValues } from '../../config/inputs';

const Home: FunctionalComponent = () => {
  type annotationType = {
    index: number;
    content: any;
    pureContent: any;
    beforeContent: any;
    afterContent: any;
    annotation: string;
    locIndex: number;
  };

  const [name, setName] = useState<string>('default');
  const [code, setCode] = useState<string>('');
  const [textvalue, setTextvalue] = useState<string>('');

  const jsonValue = [
    {
      language: ''
    },
    {
      content: '',
      annotatedContent: ''
    },
    {
      annotations: []
    }
  ];

  const [rstResult, setRstResult] = useState<string>('');
  const [jsonResult, setJsonResult] = useState<object>(jsonValue);
  const [annotations, setAnnotations] = useState<annotationType[] | []>([]);
  const [syntaxHighlight, setSyntaxHighlight] = useState<string>('plain_text');

  useEffect(() => {
    restructurify();
    updateAnnotationsWithEvent(textvalue);
  }, [textvalue, code, annotations, syntaxHighlight]);

  function getSelectedTextRange(codeToAnnotate: HTMLInputElement) {
    const from2 = codeToAnnotate.selectionStart as number;
    const to2 = codeToAnnotate.selectionEnd as number;
    return { from2, to2 };
  }

  function getSelectedTextRangeAce(code: any, codeToAnnotate: any) {
    const from = code.indexOf(codeToAnnotate) as number;
    const to = from + codeToAnnotate.length;
    return { from, to };
  }

  const [instance, setInstance] = useState<any | null>(null);
  const addAnnotation = () => {
    // const codeToAnnotate = document.getElementById('code-to-annotate') as HTMLInputElement;
    const codeToAnnotateAce = document.getElementById('ace_div') as any;

    var lines = instance.getSession().doc.getAllLines(),
      range = instance.getSelectionRange(),
      i,
      n1,
      n2,
      selectionStart = 0,
      selectionEnd = 0;

    for (i = 0, n1 = lines.length, n2 = range.end.row; i < n1 && i <= n2; ++i) {
      // Selection Start
      if (i === range.start.row) {
        selectionStart += range.start.column;
      } else {
        selectionStart += lines[i].length + 1;
      }

      // Selection End
      if (i === range.end.row) {
        selectionEnd += range.end.column;
      } else {
        selectionEnd += lines[i].length + 1;
      }
    }

    const result = {
      selectionStart: selectionStart,
      selectionEnd: selectionEnd
    };

    const codeToAnnotate = instance.getValue();

    let { from, to } = getSelectedTextRangeAce(textvalue, instance.getSelectedText());
    // const { from2, to2 } = getSelectedTextRange(document.getElementById('code-to-annotate') as HTMLInputElement);
    to = result.selectionEnd;

    if (range.start.row === range.end.row) {
      from = result.selectionStart;
    }

    const selection = codeToAnnotate.substring(from, to);

    const beforeAnnotation = codeToAnnotate.substring(0, from);

    const afterAnnotation = codeToAnnotate.substring(to, code.length + annotations.length * 4);
    /*
    if (codeToAnnotate.value.substring(to - 1, to) === '\n' && codeToAnnotate.value.substring(to - 2, to - 1) !== '\n') {
      afterAnnotation = codeToAnnotate.value.substring(to - 1, code.length + annotations.length * 3);
    } else {
      afterAnnotation = codeToAnnotate.value.substring(to, code.length + annotations.length * 3);
    }
    */

    const index = annotations.length + 1;
    const modifiedCode = replaceAt(from, to, index + '«' + selection + '»' + index, textvalue);

    setTextvalue(modifiedCode);

    // codeToAnnotate = modifiedCode;
    instance.setValue(modifiedCode);

    const b = beforeAnnotation.replace(/[0-9]+«/g, '').replace(/»+[0-9]/g, '');
    updateAnnotations({
      index: index,
      // prettier-ignore
      content: selection.replace(/[0-9]+«/g, '').replace(/»+[0-9]/g, ''),
      pureContent: selection,
      beforeContent: beforeAnnotation.replace(/[0-9]+«/g, '').replace(/»+[0-9]/g, ''),
      afterContent: afterAnnotation.replace(/[0-9]+«/g, '').replace(/»+[0-9]/g, ''),
      annotation: '',
      locIndex: code.indexOf(selection.replace(/[0-9]+«/g, '').replace(/»+[0-9]/g, ''))
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
    // const codeToAnnotate = document.getElementById('code-to-annotate') as HTMLInputElement;

    let rst = '';
    rst += '.. annotated::\n';
    rst += '\t.. code-block:: ' + syntaxHighlight + '\n\n';
    rst += tabify(textvalue);
    rst += '\n\n';

    (annotations as annotationType[]).map((annotation: annotationType, idx: any) => {
      rst += '\t.. annotation::\n\t\t' + annotation.annotation + '\n\n';
    });

    let json: any = jsonResult;
    json[0].language = syntaxHighlight;
    json[1].content = code;
    json[1].annotatedContent = textvalue;

    json[2].annotations = [];
    (annotations as annotationType[]).map((annotation: annotationType, idx: any) => {
      console.log('restructurify', annotation.locIndex);

      json[2].annotations.push({
        index: json[2].annotations.length + 1,
        content: annotation.content,
        annotation: annotation.annotation,
        locIndex: annotation.locIndex
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
    console.log('asdannotations', splicedAnnotations);

    const coords = textvalue.indexOf(index + '«' + removedAnnoation.content + '»' + index);

    const newTextValue = textvalue.substring(coords + 2, coords + removedAnnoation.content.length + 2);
    const modifiedCode = replaceAt(coords, coords + removedAnnoation.content.length + 4, newTextValue, textvalue);

    setTextvalue(modifiedCode);
    instance.setValue(modifiedCode);

    setAnnotations(splicedAnnotations);
  };

  const moveAnnotationDown = (e: any, index: number) => {
    setAnnotations([]);

    const annotation = annotations[index - 1];
    const belowAnnotation = annotations[index];

    annotations[index - 1] = { ...belowAnnotation, index: annotation.index };
    annotations[index] = { ...annotation, index: belowAnnotation.index };

    const firstCoords = textvalue.indexOf(index + '«' + annotation.pureContent + '»');
    const secondCoords = textvalue.indexOf(index + 1 + '«' + belowAnnotation.pureContent + '»');

    const newTextValue = textvalue.substring(firstCoords + 1, firstCoords + annotation.pureContent.length + 3);
    let modifiedCode = replaceAt(
      firstCoords,
      firstCoords + annotation.pureContent.length + 4,
      belowAnnotation.index + newTextValue + belowAnnotation.index,
      textvalue
    );

    const secondnewTextValue = modifiedCode.substring(secondCoords + 1, secondCoords + belowAnnotation.pureContent.length + 3);

    modifiedCode = replaceAt(
      secondCoords,
      secondCoords + belowAnnotation.pureContent.length + 4,
      annotation.index + secondnewTextValue + annotation.index,
      modifiedCode
    );

    setTextvalue(modifiedCode);
    instance.setValue(modifiedCode);

    setAnnotations(annotations);
    restructurify();
  };

  const moveAnnotationUp = (e: any, index: number) => {
    setAnnotations([]);

    const aboveAnnotation = annotations[index - 2];
    const annotation = annotations[index - 1];

    annotations[index - 2] = { ...annotation, index: aboveAnnotation.index };
    annotations[index - 1] = { ...aboveAnnotation, index: annotation.index };

    const firstCoords = textvalue.indexOf(index + '«' + annotation.pureContent + '»');
    const secondCoords = textvalue.indexOf(index - 1 + '«' + aboveAnnotation.pureContent + '»');

    const newTextValue = textvalue.substring(firstCoords + 1, firstCoords + annotation.pureContent.length + 3);

    let modifiedCode = replaceAt(
      firstCoords,
      firstCoords + annotation.pureContent.length + 4,
      aboveAnnotation.index + newTextValue + aboveAnnotation.index,
      textvalue
    );

    const secondnewTextValue = modifiedCode.substring(secondCoords + 1, secondCoords + aboveAnnotation.pureContent.length + 3);

    modifiedCode = replaceAt(
      secondCoords,
      secondCoords + aboveAnnotation.pureContent.length + 4,
      annotation.index + secondnewTextValue + annotation.index,
      modifiedCode
    );

    setTextvalue(modifiedCode);
    instance.setValue(modifiedCode);

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
    el.value = name + ': ' + JSON.stringify(jsonResult, null, 2);
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
  };

  const updateAnnotationsWithEvent = (e: any) => {
    console.log('updateAnnotationsWithEvent', e);

    if (annotations.length > 0) {
      for (let annotation of annotations as any) {
        if (e.split(annotation.index + '«')[1]) {
          console.log('jeeeeeeee1');

          updateAnnotations({
            index: annotation.index,
            // prettier-ignore
            content: e.split(annotation.index + '«')[1].split('»' + annotation.index)[0].replace(/[0-9]+«/g, '').replace(/»+[0-9]/g, ''),
            pureContent: e.split(annotation.index + '«')[1].split('»' + annotation.index)[0],
            beforeContent: e
              .split(annotation.index + '«')[0]
              .replace(/[0-9]+«/g, '')
              .replace(/»+[0-9]/g, ''),
            afterContent: e
              .split(annotation.index + '«')[1]
              .split('»' + annotation.index)[1]
              .replace(/[0-9]+«/g, '')
              .replace(/»+[0-9]/g, ''),
            annotation: annotation.annotation,
            locIndex: annotation.locIndex
          });
        } else {
          console.log('jeeeeeeee2');
          updateAnnotations({
            index: annotation.index,
            // prettier-ignore
            content: annotation.content,
            pureContent: annotation.pureContent,
            beforeContent: annotation.beforeContent,
            afterContent: annotation.afterContent,
            annotation: annotation.annotation,
            locIndex: annotation.locIndex
          });
        }
      }
    }
  };

  const handleChange = (e: any) => {
    console.log('e.target.value', e.target.value.replace(/[0-9]+«/g, '').replace(/»+[0-9]/g, ''));
    setTextvalue(e.target.value);
    console.log('last', e.target.value.slice(-1));
    setCode(e.target.value.replace(/[0-9]+«/g, '').replace(/»+[0-9]/g, ''));

    updateAnnotationsWithEvent(e.target.value);
  };

  const handleChangeAce = (e: any, v: any) => {
    console.log('handleChangeAce', e);
    if (!e && instance) {
      console.log('handleChangeAce undefined');
      console.log('handleChangeAce undefined fix', instance.getValue());
    } else {
      console.log('e.target.value', e.replace(/[0-9]+«/g, '').replace(/»+[0-9]/g, ''));
      setTextvalue(e);
      console.log('last', e.slice(-1));
      setCode(e.replace(/[0-9]+«/g, '').replace(/»+[0-9]/g, ''));

      updateAnnotationsWithEvent(e);
      console.log('ace', document.getElementById('ace_div'));
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

  const highlightNodes = (e: HTMLElement, content: string, before: string, after: string) => {
    if (e) {
      const nodes = e.children[0];

      let recurringTextFromLines = '';
      let recurringTextFromLinesArray = [];

      for (let i = 0; i < nodes.children.length; i++) {
        const e = nodes.children[i] as HTMLElement;

        for (let j = 0; j < e.children.length; j++) {
          recurringTextFromLines += (e.children[j] as any).innerText;

          recurringTextFromLinesArray.push(e.children[j]);
        }
        /*
        console.log('recurringTextFromLines1', recurringTextFromLines.replace(/(\r\n|\n|\r)/gm, ''));
        console.log('recurringTextFromLines2', content.replace(/(\r\n|\n|\r)/gm, '').replace(/\s*$/g, ''));
        console.log('recurringTextFromLines', recurringTextFromLines.replace(/\s*$/g, '').includes(content.replace(/(\r\n|\n|\r)/gm, '')));
        */
        for (let item of nodes.children as any) {
          item.textContent = '';
        }

        // const arr = recurringTextFromLines.split(content.replace(/(\r\n|\n|\r)/gm, ''));

        const span1 = document.createElement('span');
        span1.textContent = before;

        const span2 = document.createElement('span');

        span2.textContent = content;

        const span3 = document.createElement('span');
        if (code.slice(-1) === '\n') {
          span3.textContent = after + '\n';
        } else {
          span3.textContent = after;
        }
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
    (annotations as any[]).map(a => {});

    const annotation = annotations.find(a => a.index === index) as annotationType;

    const content = annotation.content;

    const before = annotation.beforeContent;
    const after = annotation.afterContent;
    if (annotation.content.slice(-1) === '\n') {
      console.log('content last!');
    }

    const d = document.getElementById('content-block') as HTMLElement;
    highlightNodes(d, content, before, after);
  };

  const removeChildren = (elem: any) => {
    while (elem.hasChildNodes()) {
      if (elem.id === 'search-term') {
        elem.removeAttribute('style');
      }

      removeChildren(elem.lastChild);
      elem.removeChild(elem.lastChild);
    }

    setCode('');
  };

  const onMouseLeave = (e: any) => {
    setCode('');
    const element = document.getElementById('content-block') as HTMLElement;
    removeChildren(element.childNodes[0]);
    setCode(code.replace(/[0-9]+«/g, '').replace(/»+[0-9]/g, ''));
  };

  const handleKeyDown = (e: any) => {
    let value = textvalue,
      selStartPos = e.currentTarget.selectionStart;

    // handle 4-space indent on

    if (e.key === 'Tab' && !e.shiftKey) {
      value = value.substring(0, selStartPos) + '    ' + value.substring(selStartPos, value.length);
      e.currentTarget.selectionStart = selStartPos + 3;
      e.currentTarget.selectionEnd = selStartPos + 4;
      e.preventDefault();

      setTextvalue(value);
    }

    if (e.key === 'Tab' && e.shiftKey) {
      value = value.substring(0, value.length - 4);
      e.currentTarget.selectionStart = selStartPos - 3;
      e.currentTarget.selectionEnd = selStartPos - 4;
      e.preventDefault();

      setTextvalue(value);
    }
  };

  const onReset = (e: any) => {
    setTextvalue(textvalue.replace(/[0-9]+«/g, '').replace(/»+[0-9]/g, ''));
    setAnnotations([]);
  };

  const listAnnotations = (annotations as annotationType[]).map(a => {
    const annotation = annotations.find(x => x.index === a.index) as annotationType;

    if (a) {
      return (
        <li>
          <div class="h-100 w-full flex items-center justify-center bg-teal-lightest font-sans">
            <div class="bg-white rounded shadow p-4 m-2 w-full">
              <div class="mb-4">
                <div class="flex mt-4">
                  <span class="px-3">{a.index}</span>
                  <input
                    onInput={e => inputChange(e, a.index)}
                    id={'annotation-input-' + a.index}
                    value={annotation.index === a.index ? annotation.annotation : 'error'}
                    class="shadow appearance-none border rounded w-full py-2 px-3 mr-4 text-grey-darker"
                    placeholder="Write annotation..."
                  />
                  <button
                    onClick={e => removeAnnotation(e, a.index)}
                    id="remove-button"
                    data-index={a.index}
                    class="flex-no-shrink p-2 ml-4 mr-2 border-2 rounded hover:text-white text-green border-green hover:bg-green"
                  >
                    x
                  </button>
                  {annotations.length > 1 && annotations[a.index] !== undefined ? (
                    <button
                      onClick={e => moveAnnotationDown(e, a.index)}
                      class="flex-no-shrink p-2 ml-2 border-2 rounded text-red border-red hover:text-white hover:bg-red"
                    >
                      &darr;
                    </button>
                  ) : null}
                  {annotations.length > 1 && annotations[a.index - 2] !== undefined ? (
                    <button
                      onClick={e => moveAnnotationUp(e, a.index)}
                      class="flex-no-shrink p-2 ml-2 border-2 rounded text-red border-red hover:text-white hover:bg-red"
                    >
                      &uarr;
                    </button>
                  ) : null}
                </div>
                <div>
                  <p class="w-full text-grey-darkest pl-7 pt-3">{a.content ? a.content : 'empty content'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* 
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
          */}
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
          <input value={name} onInput={(e: any) => setName(e.target.value)} class="mr-6" />

          <select id="syntax-highlight-input" name="highlight" onInput={handleHighLightChange}>
            {highlightValues}
          </select>

          <div style="float: right">
            <button
              onClick={onReset}
              type="button"
              class="border border-gray-200 bg-gray-200 text-gray-700 rounded-md px-4 py-2 m-2 transition duration-500 ease select-none hover:bg-gray-300 focus:outline-none focus:shadow-outline"
            >
              Reset
            </button>
          </div>
        </div>
        {/*
        <pre>
          <code>
            <textarea onKeyDown={handleKeyDown} value={textvalue} class={style['text-area']} id="code-to-annotate" onInput={handleChange} />
          </code>
        </pre>
        */}
        <AceEditor
          value={textvalue}
          onLoad={instance => setInstance(instance)}
          mode={syntaxHighlight}
          theme="monokai"
          onChange={handleChangeAce}
          name="ace_div"
          fontSize={16}
          style={{ width: '100%', height: '22em', marginBottom: '1em', border: '1px solid grey' }}
          editorProps={{ $blockScrolling: true }}
        />

        <button
          onClick={addAnnotation}
          id="add-annotation-button"
          type="button"
          class="border border-gray-200 bg-gray-200 text-gray-700 rounded-md px-4 py-2 m-2 transition duration-500 ease select-none hover:bg-gray-300 focus:outline-none focus:shadow-outline"
        >
          Add annotation
        </button>

        <ol id="annotation-list">{listAnnotations}</ol>
      </div>

      <div id={'right'} class={style.rightside}>
        <div id={style.codeblock} class="p-2">
          {code && <CodeBlock code={code} language={syntaxHighlight} />}
          {(annotations as annotationType[]).map(a => {
            if (annotations.length > 0) {
              return (
                <div id={'annotation-for-' + a.index.toString()} class={style.annotation} onMouseOver={onMouseOver} onMouseLeave={onMouseLeave}>
                  {a ? parse(a.annotation) : 'waiting...'}
                </div>
              );
            } else {
              return null;
            }
          })}
        </div>
      </div>
      <div id={'right2'} class={style.rightside2}>
        <div id={style.preview}>
          {rstResult ? (
            <div>
              <h4>Rst</h4>
              <div id="preview-rst">
                <pre>{rstResult}</pre>
              </div>
              <button
                onClick={copyRstToClipboard}
                class="border border-blue-900 bg-blue-900 text-white rounded-md px-4 py-2 m-2 transition duration-500 ease select-none hover:bg-blue-900 focus:outline-none focus:shadow-outline"
              >
                Copy
              </button>
            </div>
          ) : null}
          {jsonResult ? (
            <div>
              <h4>Json</h4>
              <pre>
                {name}: {JSON.stringify(jsonResult, null, 2)}
              </pre>
              <button
                onClick={copyJsonToClipboard}
                class="border border-blue-900 bg-blue-900 text-white rounded-md px-4 py-2 m-2 transition duration-500 ease select-none hover:bg-blue-900 focus:outline-none focus:shadow-outline"
              >
                Copy
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default Home;
