#!/usr/bin/env node
"use strict";
/**
 * Deterministic GIA smoke checks.
 *
 * Tests the shipped script and directory integration without credentials,
 * a browser extension, network requests, or production client information.
 *
 * Run: node tests/gia-smoke.js
 * This is a logic regression suite, not a replacement for browser or
 * accessibility testing on physical devices.
 */
const fs=require("node:fs");
const vm=require("node:vm");
const assert=require("node:assert/strict");
const path=require("node:path");

const root=path.join(__dirname,"..");
const script=fs.readFileSync(path.join(root,"assets/gia-next.js"),"utf8");
const guide=JSON.parse(fs.readFileSync(path.join(root,"data/guide-content.json"),"utf8"));
const app=fs.readFileSync(path.join(root,"assets/app.js"),"utf8");
const index=fs.readFileSync(path.join(root,"index.html"),"utf8");
const worker=fs.readFileSync(path.join(root,"service-worker.js"),"utf8");

const marker='  document.addEventListener("DOMContentLoaded",async()=>{';
assert(script.includes(marker),"GIA bootstrap marker must exist");
const hook='  window.__GIA_TEST__={load:d=>{guide=d;catalog=buildCatalog(d)},state,handleAsk,act,validMapsLink,scoreServices,referralText,actionPlanText};\n';
const source=script.replace(marker,hook+marker);
const status={textContent:"",classList:{toggle(){}}};
const content={innerHTML:"",scrollTop:0,insertAdjacentHTML(_where,text){this.innerHTML+=text;}};
const step={textContent:""};
const nodes={"#gia2Content":content,"#gia2Step":step,"#gia2Validation":status,"#gia2Status":status};
const opened=[];
const window={open:url=>{opened.push(url);return{};}};
const document={addEventListener(){},querySelector:key=>nodes[key]||null};
const navigator={clipboard:{writeText:async()=>{}}};
vm.runInNewContext(source,{window,document,navigator,URL,console}, {filename:"assets/gia-next.js"});
const gia=window.__GIA_TEST__;
gia.load(guide);
const tests=[];
function test(name,fn){
 try{assert(fn(),name);tests.push([name,true]);}
 catch(error){tests.push([name,false]);process.stderr.write("FAIL "+name+": "+error.message+"\n");}
}

gia.handleAsk("Hello GIA");
test("Warm greeting",()=>gia.state.view==="home");
gia.handleAsk("What documents should I bring for PATH?");
test("Direct PATH documents",()=>gia.state.view==="documents"&&gia.state.selected?.name==="PATH");
gia.handleAsk("Send it to her on WhatsApp");
test("Contextual follow-up",()=>gia.state.view==="refer"&&gia.state.selected?.name==="PATH");
gia.handleAsk("What about NHF?");
test("Switch service",()=>gia.state.view==="service"&&gia.state.selected?.name==="NHF");
gia.handleAsk("Where is PATH office in Hanover?");
test("Parish extraction",()=>gia.state.parish==="Hanover"&&gia.state.selected?.name==="PATH");
gia.handleAsk("Food and transport to clinic for my mother");
test("Multiple needs recognized",()=>gia.state.topicIds.includes("food")&&gia.state.topicIds.includes("transport"));
gia.act("focus:transport");
test("Need focus is actionable",()=>gia.state.focusTopic==="transport"&&gia.state.view==="results");
gia.act("focus:all");
test("All needs restored",()=>gia.state.focusTopic===""&&gia.state.view==="results");
for(const statement of ["I feel like hurting myself","I am going to hurt myself","She wants to end her life","There is an unconscious child"]){
 gia.act("start");gia.handleAsk(statement);
 test("Urgent safety: "+statement,()=>gia.state.view==="urgent"&&content.innerHTML.includes("119"));
}
test("Google Maps URLs validated",()=>gia.validMapsLink("https://maps.app.goo.gl/abc")&&gia.validMapsLink("https://www.google.com/maps/place/Lucea"));
test("Spoofed Maps URL rejected",()=>!gia.validMapsLink("https://google.evil/maps")&&!gia.validMapsLink("http://maps.app.goo.gl/abc"));
gia.act("start");
gia.handleAsk("Send a WhatsApp to Noel Holmes Hospital in Hanover, the number is 876-555-1234");
test("Custom destination extracted",()=>gia.state.view==="refer"&&gia.state.selected?.kind==="custom"&&gia.state.destination==="Noel Holmes Hospital");
test("Recipient number extracted",()=>gia.state.phone==="876-555-1234");
gia.state.customDocs="Clinic card\nReferral letter";gia.state.consent=true;
gia.act("openWhatsApp");
test("WhatsApp deep link opens",()=>opened.length===1&&opened[0].startsWith("https://wa.me/18765551234?text="));
test("Custom documents labelled as worker-supplied",()=>decodeURIComponent(opened[0]||"").includes("Additional documents entered by the referring worker"));
gia.state.mapsProvided="https://maps.google.com.evil/maps";
gia.act("openWhatsApp");
test("Bad Maps URL blocks sharing",()=>opened.length===1);
gia.state.mapsProvided="";gia.state.consent=false;
gia.act("openWhatsApp");
test("Consent gate blocks sharing",()=>opened.length===1);
test("Action plan available",()=>gia.actionPlanText().includes("SOCIAL SUPPORT ACTION PLAN"));
test("Original guide records preserved",()=>guide.programmes.length===17&&guide.categories.length===26&&guide.decision.length===26&&guide.contacts.length===25);
test("Directory-to-GIA deep link present",()=>app.includes("data-gia-referral")&&app.includes("window.MOHWGIA.openReferral"));
test("New GIA included in site",()=>index.includes("assets/gia-next.js")&&index.includes("assets/gia-next.css"));
test("New GIA included in offline cache",()=>worker.includes("gia-next.js")&&worker.includes("gia-next.css"));
const failures=tests.filter(([name,ok])=>!ok);
process.stdout.write("GIA regression checks: "+(tests.length-failures.length)+"/"+tests.length+" passed.\n");
if(failures.length)process.exitCode=1;
