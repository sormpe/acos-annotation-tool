# Acos annotation tool

This is a repository for Acos server tool called "code annotation tool". With this tool course instructors can easily create annotations that hihglight specifics parts of a program code.

The tool generates both RST and spesific JSON syntax which is used with Acos content type in order to create code annotation packages.

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
