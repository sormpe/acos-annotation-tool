import { FunctionalComponent, h } from 'preact';
import { useEffect, useState, useRef } from 'preact/hooks';
import * as style from './style.css';

import parse from 'html-react-parser';

import AceEditor from 'react-ace';

import 'ace-builds/src-noconflict/mode-html';
import 'ace-builds/src-noconflict/mode-python';
import 'ace-builds/src-noconflict/mode-c_cpp';
import 'ace-builds/src-noconflict/mode-css';
import 'ace-builds/src-noconflict/mode-plain_text';

import 'ace-builds/src-noconflict/theme-github';
import 'ace-builds/src-noconflict/theme-monokai';

import CodeBlock from '../../components/codeblock';
import prism from 'prismjs';

import { InputValues } from '../../config/inputs';

// resizer code source: https://htmldom.dev/create-resizable-split-views/

const Home: FunctionalComponent = () => {
  type annotationType = {
    index: number;
    content: string[];
    pureContent: string[];
    beforeContent: string[];
    afterContent: string[];
    annotation: string;
    locIndex: number[];
  };

  const [name, setName] = useState<string>('default');
  const [code, setCode] = useState<string>('');
  const [textvalue, setTextvalue] = useState<string>('');

  const dragElemRef = useRef(null);
  const codeBlockElemRef = useRef(null);

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

  const [showPreview, setShowPreview] = useState(true);

  const [aceEditor, setAceEditor] = useState<any | null>(null);

  let resizer: any;

  let leftSide: any;
  let rightSide: any;

  useEffect(() => {
    // Query the element
    resizer = dragElemRef.current;

    leftSide = resizer.previousElementSibling;
    rightSide = resizer.nextElementSibling;
    // Attach the handler
    resizer.addEventListener('mousedown', mouseDownHandler);
  }, []);

  // The current position of mouse
  let x = 0;
  let y = 0;
  let leftWidth = 0;

  // Handle the mousedown event
  // that's triggered when user drags the resizer
  const mouseDownHandler = function(e: any) {
    // Get the current mouse position
    x = e.clientX;
    y = e.clientY;
    leftWidth = leftSide.getBoundingClientRect().width;

    // Attach the listeners to `document`
    document.addEventListener('mousemove', mouseMoveHandler);
    document.addEventListener('mouseup', mouseUpHandler);
  };

  const mouseMoveHandler = function(e: any) {
    // How far the mouse has been moved
    const dx = e.clientX - x;
    const dy = e.clientY - y;

    const newLeftWidth = ((leftWidth + dx) * 100) / resizer.parentNode.getBoundingClientRect().width;
    leftSide.style.width = `${newLeftWidth}%`;

    resizer.style.cursor = 'col-resize';
    document.body.style.cursor = 'col-resize';

    leftSide.style.userSelect = 'none';
    leftSide.style.pointerEvents = 'none';

    rightSide.style.userSelect = 'none';
    rightSide.style.pointerEvents = 'none';
  };

  const mouseUpHandler = function() {
    resizer.style.removeProperty('cursor');
    document.body.style.removeProperty('cursor');

    leftSide.style.removeProperty('user-select');
    leftSide.style.removeProperty('pointer-events');

    rightSide.style.removeProperty('user-select');
    rightSide.style.removeProperty('pointer-events');

    // Remove the handlers of `mousemove` and `mouseup`
    document.removeEventListener('mousemove', mouseMoveHandler);
    document.removeEventListener('mouseup', mouseUpHandler);
  };

  useEffect(() => {
    restructurify();

    updateAnnotationsWithEvent(textvalue, annotations);
  }, [code, textvalue, annotations, syntaxHighlight]);

  function getSelectedTextRangeAce(code: any, codeToAnnotate: any) {
    const from = code.indexOf(codeToAnnotate) as number;
    const to = from + codeToAnnotate.length;
    return { from, to };
  }

  const getCoords = (selectionRange: any) => {
    var lines = aceEditor.getSession().doc.getAllLines(),
      range = selectionRange,
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

    let { from, to } = getSelectedTextRangeAce(textvalue, aceEditor.getSelectedText());
    to = result.selectionEnd;

    if (range.start.row === range.end.row) {
      from = result.selectionStart;
    }

    const r: any = { from, to };
    return r;
  };

  const addAnnotation = () => {
    if (aceEditor.selection.rangeList.ranges.length > 0) {
      const index = annotations.length + 1;

      const contents = [];
      const pureContents = [];
      const beforeAnnotations = [];
      const afterAnnotations = [];
      const locIndeces = [];
      let modifiedCode = textvalue;

      for (let i = 0; i < aceEditor.selection.rangeList.ranges.length; i++) {
        const { from, to } = getCoords(aceEditor.selection.rangeList.ranges[i]);
        let afterEnd = code.length + annotations.length * 4;

        if (aceEditor.selection.rangeList.ranges[i + 1]) {
          const { from, to } = getCoords(aceEditor.selection.rangeList.ranges[i + 1]);

          afterEnd = from;
        }

        const codeToAnnotate = aceEditor.getValue();

        const selection = codeToAnnotate.substring(from, to);
        const content = selection.replace(/[0-9]+«/g, '').replace(/»+[0-9]/g, '');
        contents.push(content);
        pureContents.push(selection);

        const beforeAnnotation = codeToAnnotate.substring(0, from);
        beforeAnnotations.push(beforeAnnotation.replace(/[0-9]+«/g, '').replace(/»+[0-9]/g, ''));

        const afterAnnotation = codeToAnnotate.substring(to, afterEnd);
        afterAnnotations.push(afterAnnotation.replace(/[0-9]+«/g, '').replace(/»+[0-9]/g, ''));

        const locIndex = from - (beforeAnnotation.match(/«/g) || []).length * 2 - (beforeAnnotation.match(/»/g) || []).length * 2;
        locIndeces.push(locIndex);

        modifiedCode = replaceAt(from + i * 4, to + i * 4, index + '«' + selection + '»' + index, modifiedCode);
      }

      setTextvalue(modifiedCode);

      updateAnnotations({
        index: index,
        // prettier-ignore
        content: contents,
        pureContent: pureContents,
        beforeContent: beforeAnnotations,
        afterContent: afterAnnotations,
        annotation: '',
        locIndex: locIndeces
      });

      // aceEditor.setValue(modifiedCode);
    } else {
      const { from, to } = getCoords(aceEditor.getSelectionRange());
      const codeToAnnotate = aceEditor.getValue();

      const selection = codeToAnnotate.substring(from, to);

      const beforeAnnotation = codeToAnnotate.substring(0, from);

      const afterAnnotation = codeToAnnotate.substring(to, textvalue.length);

      const index = annotations.length + 1;
      const modifiedCode = replaceAt(from, to, index + '«' + selection + '»' + index, textvalue);

      setTextvalue(modifiedCode);

      // aceEditor.setValue(modifiedCode);

      updateAnnotations({
        index: index,
        // prettier-ignore
        content: [selection.replace(/[0-9]+«/g, '').replace(/»+[0-9]/g, '')],
        pureContent: [selection],
        beforeContent: [beforeAnnotation.replace(/[0-9]+«/g, '').replace(/»+[0-9]/g, '')],
        afterContent: [afterAnnotation.replace(/[0-9]+«/g, '').replace(/»+[0-9]/g, '')],
        annotation: '',
        locIndex: [from - (beforeAnnotation.match(/«/g) || []).length * 2 - (beforeAnnotation.match(/»/g) || []).length * 2]
      });
    }
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
    let rst = '';
    rst += '.. annotated::\n';
    rst += '\t.. code-block:: ' + syntaxHighlight + '\n\n';
    rst += tabify(textvalue.replace(/»+[0-9]/g, '»'));
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
      json[2].annotations.push({
        index: json[2].annotations.length + 1,
        content: annotation.content,
        annotation: annotation.annotation,
        locIndices: annotation.locIndex
      });
    });

    setRstResult(rst);
    setJsonResult(json);
  };

  const removeAnnotation = (e: any, index: number) => {
    const idx = Number(e.target.getAttribute('data-index'));
    const annotationToBeRemoved = annotations.find(a => a.index === index) as annotationType;
    const splicedAnnotations = annotations.filter(item => item.index !== idx);

    let modifiedCode = textvalue;
    for (let c of annotationToBeRemoved.pureContent) {
      const coords = modifiedCode.indexOf(index + '«' + c + '»' + index);
      const newTextValue = modifiedCode.substring(coords + 2, coords + c.length + 2);

      modifiedCode = replaceAt(coords, coords + c.length + 4, newTextValue, modifiedCode);
    }

    setTextvalue(modifiedCode);
    aceEditor.setValue(modifiedCode);

    setAnnotations(splicedAnnotations);
  };

  const moveAnnotationDown = (e: any, index: number) => {
    setAnnotations([]);

    const annotation = annotations[index - 1];
    const belowAnnotation = annotations[index];

    annotations[index - 1] = { ...belowAnnotation, index: annotation.index };
    annotations[index] = { ...annotation, index: belowAnnotation.index };

    const originalTextvalue = textvalue;
    let modifiedCode = textvalue;

    const loopLength = annotation.content.length > belowAnnotation.content.length ? annotation.content.length : belowAnnotation.content.length;

    for (let c = 0; c < loopLength; c++) {
      if (annotation.pureContent[c]) {
        const firstCoords = originalTextvalue.indexOf(index + '«' + annotation.pureContent[c] + '»');

        const newTextValue = modifiedCode.substring(firstCoords + 1, firstCoords + annotation.pureContent[c].length + 3);
        modifiedCode = replaceAt(
          firstCoords,
          firstCoords + annotation.pureContent[c].length + 4,
          belowAnnotation.index + newTextValue + belowAnnotation.index,
          modifiedCode
        );
      }

      if (belowAnnotation.pureContent[c]) {
        const secondCoords = originalTextvalue.indexOf(index + 1 + '«' + belowAnnotation.pureContent[c] + '»');
        const secondNewTextValue = modifiedCode.substring(secondCoords + 1, secondCoords + belowAnnotation.pureContent[c].length + 3);

        modifiedCode = replaceAt(
          secondCoords,
          secondCoords + belowAnnotation.pureContent[c].length + 4,
          annotation.index + secondNewTextValue + annotation.index,
          modifiedCode
        );
      }
    }

    setTextvalue(modifiedCode);
    aceEditor.setValue(modifiedCode);

    setAnnotations(annotations);

    restructurify();
  };

  const moveAnnotationUp = (e: any, index: number) => {
    setAnnotations([]);

    const aboveAnnotation = annotations[index - 2];
    const annotation = annotations[index - 1];

    annotations[index - 1] = { ...aboveAnnotation, index: annotation.index };
    annotations[index - 2] = { ...annotation, index: aboveAnnotation.index };

    const originalTextvalue = textvalue;
    let modifiedCode = textvalue;

    const loopLength = annotation.content.length > aboveAnnotation.content.length ? annotation.content.length : aboveAnnotation.content.length;

    for (let c = 0; c < loopLength; c++) {
      if (annotation.pureContent[c]) {
        const firstCoords = originalTextvalue.indexOf(index + '«' + annotation.pureContent[c] + '»');
        const newTextValue = modifiedCode.substring(firstCoords + 1, firstCoords + annotation.pureContent[c].length + 3);

        modifiedCode = replaceAt(
          firstCoords,
          firstCoords + annotation.pureContent[c].length + 4,
          aboveAnnotation.index + newTextValue + aboveAnnotation.index,
          modifiedCode
        );
      }

      if (aboveAnnotation.pureContent[c]) {
        const secondCoords = originalTextvalue.indexOf(index - 1 + '«' + aboveAnnotation.pureContent[c] + '»');
        const secondNewTextValue = modifiedCode.substring(secondCoords + 1, secondCoords + aboveAnnotation.pureContent[c].length + 3);

        modifiedCode = replaceAt(
          secondCoords,
          secondCoords + aboveAnnotation.pureContent[c].length + 4,
          annotation.index + secondNewTextValue + annotation.index,
          modifiedCode
        );
      }
    }

    setTextvalue(modifiedCode);
    aceEditor.setValue(modifiedCode);

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

  const updateAnnotationsWithEvent = (e: any, annotations: annotationType[]) => {
    if (annotations.length > 0) {
      for (let annotation of annotations as any) {
        if (e.split(annotation.index + '«')[1]) {
          for (let i = 0; i < annotations.length; i++) {
            const contents = [];
            const pureContents = [];
            const beforeContents = [];
            const afterContents = [];
            const locIndeces = [];

            const idx = annotation.index;
            const startRegexp = new RegExp(idx + '«', 'g');
            let startregex = startRegexp,
              startresult,
              startIndices = [];
            while ((startresult = startregex.exec(e))) {
              startIndices.push(startresult.index);
            }

            const endRegexp = new RegExp('»' + idx, 'g');
            let regex = endRegexp,
              result,
              endIndices = [];
            while ((result = regex.exec(e))) {
              endIndices.push(result.index);
            }

            for (let f = 0; f < startIndices.length; f++) {
              contents.push(
                e
                  .substring(startIndices[f] + 2, endIndices[f])
                  .replace(/[0-9]+«/g, '')
                  .replace(/»+[0-9]/g, '')
              );
              pureContents.push(e.substring(startIndices[f] + 2, endIndices[f]));

              beforeContents.push(
                e
                  .substring(endIndices[f - 1] + 2, startIndices[f])
                  .replace(/[0-9]+«/g, '')
                  .replace(/»+[0-9]/g, '')
              );

              const nextAnno = e.substring(endIndices[f] + 2, e.length).split(idx + '«')[0];

              afterContents.push(nextAnno.replace(/[0-9]+«/g, '').replace(/»+[0-9]/g, ''));
            }

            const subs = [];
            for (let s of startIndices) {
              subs.push(e.substring(0, s));
            }

            for (let f in pureContents) {
              locIndeces.push(subs[f].length - (subs[f].match(/[0-9]+«/g) || []).length * 2 - (subs[f].match(/»+[0-9]/g) || []).length * 2);
            }

            updateAnnotations({
              index: annotation.index,
              // prettier-ignore
              content: contents,
              pureContent: pureContents,
              beforeContent: beforeContents,
              afterContent: afterContents,
              annotation: annotation.annotation,
              locIndex: locIndeces
            });
          }
        } else {
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

  const handleChangeAce = (e: any, v: any) => {
    if (e && aceEditor) {
      setTextvalue(e);
      setCode(e.replace(/»+[0-9]/g, '').replace(/[0-9]+«/g, ''));

      updateAnnotationsWithEvent(e, annotations);
    } else {
      setTextvalue('');
      setCode('');

      updateAnnotationsWithEvent('', annotations);
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

  const highlightNodes = (e: HTMLElement, content: string[], before: string[], after: string[]) => {
    if (e) {
      const nodes = e.children[0];

      for (let i = 0; i < nodes.children.length; i++) {
        const e = nodes.children[i] as HTMLElement;

        for (let item of nodes.children as any) {
          item.textContent = '';
        }

        const span1 = document.createElement('span');
        span1.textContent = before[0];
        e.appendChild(span1);
        prism.highlightElement(span1);

        for (let i = 0; i < content.length; i++) {
          const span2 = document.createElement('span');

          span2.textContent = content[i];

          const span3 = document.createElement('span');
          if (code.slice(-1) === '\n') {
            span3.textContent = after[i] + '\n';
          } else {
            span3.textContent = after[i];
          }
          e.appendChild(span2);
          span2.id = 'search-term';
          span2.setAttribute('style', 'background-color:crimson');
          e.appendChild(span3);
          prism.highlightElement(span3);
        }
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

    const element = document.getElementById('content-block') as HTMLElement; // TODO: user codeBlockElemRef instead

    highlightNodes(element, content, before, after);
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
    const element = document.getElementById('content-block') as HTMLElement; // TODO: user codeBlockElemRef instead
    removeChildren(element.childNodes[0]);
    setCode(code.replace(/[0-9]+«/g, '').replace(/»+[0-9]/g, ''));
  };

  const onReset = (e: any) => {
    setTextvalue(textvalue.replace(/»+[0-9]/g, '').replace(/[0-9]+«/g, ''));
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
                  <p class="w-full text-grey-darkest pl-7 pt-3">{a.content ? a.content.join(', ') : 'empty content'}</p>
                </div>
              </div>
            </div>
          </div>
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

          <AceEditor
            value={textvalue}
            onLoad={aceEditor => setAceEditor(aceEditor)}
            mode={syntaxHighlight}
            wrapEnabled={true}
            theme="monokai"
            onChange={handleChangeAce}
            name="ace_div"
            fontSize={16}
            style={{ width: '100%', height: '24rem', marginBottom: '1em', border: '1px solid grey' }}
            editorProps={{ $blockScrolling: false }}
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
      </div>

      <div class={style.resizer} ref={dragElemRef} />

      <div id={'right'} class={style.rightside}>
        {showPreview ? (
          <div>
            <nav class="relative flex items-center justify-between sm:h-12 bg-blue-200">
              <span class="hidden sm:block">
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  type="button"
                  class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  View RST and JSON
                </button>
              </span>
              <div>
                <button
                  onClick={copyRstToClipboard}
                  class="border border-blue-900 bg-blue-900 text-white rounded-md px-4 py-2 m-2 transition duration-500 ease select-none hover:bg-blue-900 focus:outline-none focus:shadow-outline"
                >
                  Copy RST
                </button>
                <button
                  onClick={copyJsonToClipboard}
                  class="border border-blue-900 bg-blue-900 text-white rounded-md px-4 py-2 m-2 transition duration-500 ease select-none hover:bg-blue-900 focus:outline-none focus:shadow-outline"
                >
                  Copy JSON
                </button>
              </div>
            </nav>

            <div id={style.codeblock} ref={codeBlockElemRef} class="p-2">
              {code && (
                <div>
                  <CodeBlock code={code} language={syntaxHighlight} />
                </div>
              )}
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
        ) : (
          <div>
            <nav class="relative flex items-center justify-between sm:h-12 lg:justify-start bg-blue-200">
              <span class="hidden sm:block">
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  type="button"
                  class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Show preview
                </button>
              </span>
            </nav>

            <div id={style.preview}>
              {rstResult ? (
                <div>
                  <h2>Rst</h2>
                  <div class="mt-3" id="preview-rst">
                    <pre>{rstResult}</pre>
                  </div>
                  <button
                    onClick={copyRstToClipboard}
                    class="border border-blue-900 bg-blue-900 text-white rounded-md px-4 py-2 m-2 transition duration-500 ease select-none hover:bg-blue-900 focus:outline-none focus:shadow-outline"
                  >
                    Copy RST
                  </button>
                </div>
              ) : null}
              <hr />
              {jsonResult ? (
                <div class="mt-3">
                  <h2>Json</h2>
                  <div class="mt-3" id="preview-json">
                    <pre>
                      {name}: {JSON.stringify(jsonResult, null, 2)}
                    </pre>
                  </div>
                  <button
                    onClick={copyJsonToClipboard}
                    class="border border-blue-900 bg-blue-900 text-white rounded-md px-4 py-2 m-2 transition duration-500 ease select-none hover:bg-blue-900 focus:outline-none focus:shadow-outline"
                  >
                    Copy JSON
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
