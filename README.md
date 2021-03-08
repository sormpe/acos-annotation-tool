[![Netlify Status](https://api.netlify.com/api/v1/badges/ca43731c-bb8e-4f97-aad1-4ba82a37f1fb/deploy-status)](https://app.netlify.com/sites/fervent-panini-0fa2cb/deploys)

# Acos annotation tool

This is a repository for Acos server tool called "code annotation tool". With this tool course instructors can easily create annotations that highlights specific parts of a program code.

Please note that the tool is just for _previewing_ the code annotations. It does not actually create any HTML or CSS which you could copypaste somewhere. Instead, the tool generates both RST and spesific JSON object. The RST can be used with [A+ Learning Management System](https://github.com/apluslms/a-plus) with help of [spesific rst tools](https://version.aalto.fi/gitlab/piitulr1/aplus-rst-tools-ae/). The JSON is used within [Acos](https://github.com/acos-server/acos-server) and the actual JSON handling is done by spesific code annotation [Acos content type](https://github.com/sormpe/acos-code-annotation).

## JSON syntax

The tool generates following JSON.

```javascript
<name_of_the_object> = [
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
  ]
```

## Install

#### Acos server

In acos root folder:

```
git -C node_modules clone https://github.com/sormpe/acos-annotation-tool.git
cd node_modules/acos-annotation-tool/app
npm install
```

Postinstall script build generates a build version of the app. After that the tool can be found in <acos_server_url>/code-annotation-tool/

## Usage

##### General

A usage of the is simple: You can paste and or edit text or code with a editor which is located to a left side on the tool. In right side there is a preview view. The tool generetes preview in real time, and shows how code annotations will look like in Acos server.

##### Adding annotations

You can select or multiselect part(s) of the text/code in the editor and click 'add annotation' button. It creates a block for the selected part, and you can write your annotation (i.e explanation). In preview view you can see the this block below the text/code. The user can hover this block - and while hovering - the selected part of the text/code will be highlighted. You can also remove or change order of the annotations.

##### Publishing

Basically you just copy the generated JSON and paste it to a spesific content package. Aa a reference, please see [sample content package](https://github.com/sormpe/code-annotation-sample) and especially its [content](https://github.com/sormpe/code-annotation-sample/blob/master/static/content.js). There you can see sample JSONs which were generated with this tool.

Edit nesseccary meta information of the package and publish package in Acos.

## Related packages

####

Content type which handles the generated JSON can be found in [here](https://github.com/sormpe/acos-code-annotation)

####

Sample content package [here](https://github.com/sormpe/code-annotation-sample)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
