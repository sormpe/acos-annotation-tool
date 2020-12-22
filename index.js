const express = require("express");
const path = require("path");

const codeAnnotation = function () {};

codeAnnotation.register = (handlers, app, config) => {
  handlers.tools["code-annotation-tool"] = codeAnnotation;

  // prettier-ignore
  app.use("/code-annotation-tool", express.static(path.join(__dirname, "/app/build/code-annotation-tool")));

  // Register own URL endpoint for this tool
  app.all("/code-annotation-tool", (req, res) => {
    res.sendFile(
      path.join(__dirname, "/app/build/code-annotation-tool/index.html")
    );
  });
};

codeAnnotation.namespace = "code-annotation";
codeAnnotation.packageType = "tool";

codeAnnotation.meta = {
  name: "Code annotation tool",
  shortDescription: "",
  description: "",
  author: "Peter Sormunen",
  license: "MIT",
  version: "0.0.1",
  url: "",
};

module.exports = codeAnnotation;
