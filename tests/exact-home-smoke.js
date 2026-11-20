#!/usr/bin/env node
"use strict";
const fs=require("node:fs"),assert=require("node:assert/strict"),vm=require("node:vm");
const read=f=>fs.readFileSync(f,"utf8");const html=read("index.html"),js=read("assets/exact-home.js"),css=read("assets/exact-home.css"),sw=read("service-worker.js");
new vm.Script(js);
assert(html.includes("exact-home.css")&&html.includes("exact-home.js"));assert(sw.includes("exact-home.css")&&sw.includes("exact-home.js"));
assert(js.includes("mohw-homepage-exact.png")&&js.includes("gia-introduction.mp4"));
for(const part of ["\"search\"","\"share\"","\"report\"","\"message\"","\"access\"","\"gia\"","\"contacts\""])assert(js.includes(part));
assert(css.includes("max-width:899px")&&css.includes(":focus-visible"));console.log("Exact image interactive homepage checks passed");
