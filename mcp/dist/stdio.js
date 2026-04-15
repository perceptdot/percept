#!/usr/bin/env node
process.stdin.setEncoding('utf8');
var b='',t=[{name:'visual_check',description:'Screenshot a URL and analyze for visual bugs using AI.',inputSchema:{type:'object',properties:{url:{type:'string',description:'URL to visually check'}},required:['url']}}];
function w(o){process.stdout.write(JSON.stringify(o)+'\n');}
process.stdin.on('data',function(d){b+=d;var i;while((i=b.indexOf('\n'))!==-1){var l=b.slice(0,i);b=b.slice(i+1);try{var q=JSON.parse(l);if(!('id' in q)){continue;}var r;switch(q.method){case'ping':r={jsonrpc:'2.0',id:q.id,result:{}};break;case'initialize':r={jsonrpc:'2.0',id:q.id,result:{protocolVersion:'2024-11-05',capabilities:{tools:{}},serverInfo:{name:'perceptdot',version:'1.0.0'}}};break;case'tools/list':r={jsonrpc:'2.0',id:q.id,result:{tools:t}};break;default:r={jsonrpc:'2.0',id:q.id,error:{code:-32601,message:'Method not found: '+q.method}};}w(r);}catch(e){}}});
process.stdin.resume();
