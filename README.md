[![Netlify Status](https://api.netlify.com/api/v1/badges/ca43731c-bb8e-4f97-aad1-4ba82a37f1fb/deploy-status)](https://app.netlify.com/sites/fervent-panini-0fa2cb/deploys)

# Acos annotation tool

This is a repository for Acos server tool called "code annotation tool". With this tool course instructors can easily create annotations that highlights specific parts of a program code.

The tool generates both RST and spesific JSON object which is used within spesific code annotation packages. The actual json handling is done by spesific code annotation content type.

## JSON syntax

TODO

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

TODO

## Related packages

####

Content type which handles the generated JSON can be found in [here](https://github.com/sormpe/acos-code-annotation)

####

Sample content package TODO

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
