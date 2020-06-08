//KMC Partner-N64 Message Register Emulation script by LuigiBlood

console.log("KMC Partner-N64");

const _KMC_ADDR_BASE = 0xBFF00000;
const _KMC_ADDR_CODE_TOP = _KMC_ADDR_BASE;
const _KMC_ADDR_REG_TOP = _KMC_ADDR_CODE_TOP + 0x8000;
const _KMC_ADDR_END = 0xBFFFFFFF;

const _KMC_ADDR_CHK = _KMC_ADDR_CODE_TOP + 0x0;
const _KMC_ADDR_CHK2 = _KMC_ADDR_CODE_TOP + 0x4;
const _KMC_ADDR_CHK3 = _KMC_ADDR_CODE_TOP + 0x10;

const _KMC_ADDR_WPORT = _KMC_ADDR_REG_TOP + 0x0;
const _KMC_ADDR_STAT = _KMC_ADDR_REG_TOP + 0x4;

const ADDR_KMC_CODE = new AddressRange(_KMC_ADDR_CODE_TOP, _KMC_ADDR_REG_TOP-1);
const ADDR_KMC_REG = new AddressRange(_KMC_ADDR_REG_TOP, _KMC_ADDR_END);

var KMC_CHK = 0x4B4D4300;	//"KMC "

//Basic variables for simulating reads
var return_data = 0;
var return_reg = 0;
var callbackId = 0;

events.onread(ADDR_KMC_CODE, function(addr) {
	return_reg = getStoreOp();
	
	return_data = 0;
	
	if (addr == _KMC_ADDR_CHK)
	{
		return_data = KMC_CHK;
	}
	else if (addr == _KMC_ADDR_CHK3)
	{
		return_data = 0xB0FFB000;
	}
	
	//console.log('KMC Code Read ', addr.hex(), ' - ', return_data.hex());
	
	callbackId = events.onexec((gpr.pc + 4), ReadCartReg);
});

events.onwrite(ADDR_KMC_CODE, function(addr) {
	return_reg = getStoreOp();
	
	//console.log('KMC Code Write', addr.hex(), ' - ', getStoreOpValue().hex());
});

events.onread(ADDR_KMC_REG, function(addr) {
	return_reg = getStoreOp();
	
	return_data = 0;
	
	if (addr == _KMC_ADDR_STAT)
	{
		return_data = 0x14;
	}
	
	//console.log('KMC Reg Read ', addr.hex(), ' - ', return_data.hex());
	
	callbackId = events.onexec((gpr.pc + 4), ReadCartReg);
});

var KMC_COUNT = -1;
var KMC_STRING = [];

events.onwrite(ADDR_KMC_REG, function(addr) {
	return_reg = getStoreOp();
	
	if (addr == _KMC_ADDR_WPORT)
	{
		if (KMC_COUNT < 0)
		{
			KMC_COUNT = getStoreOpValue();
			console.print(String.fromCharCode.apply(null, KMC_STRING));
			KMC_STRING = [];
		}
		else
		{
			if (getStoreOpValue() == 0xA)
			{
				KMC_STRING.push(0xD);
			}
			KMC_STRING.push(getStoreOpValue());
			KMC_COUNT--;
		}
	}
	
	//console.log('KMC Reg Write', addr.hex(), ' - ', getStoreOpValue().hex());
});

function getStoreOp()
{
	// hacky way to get value that SW will write
	var pcOpcode = mem.u32[gpr.pc];
	var tReg = (pcOpcode >> 16) & 0x1F;
	return tReg;
}

function getStoreOpValue()
{
	// hacky way to get value that SW will write
	var pcOpcode = mem.u32[gpr.pc];
	var tReg = (pcOpcode >> 16) & 0x1F;
	return gpr[tReg];
}

function ReadCartReg()
{
    gpr[return_reg] = return_data;
    events.remove(callbackId);
}

/*! sprintf-js v1.0.3 | Copyright (c) 2007-present, Alexandru Marasteanu <hello@alexei.ro> | BSD-3-Clause */
!function(e){"use strict";function t(){var e=arguments[0],r=t.cache;return r[e]&&r.hasOwnProperty(e)||(r[e]=t.parse(e)),t.format.call(null,r[e],arguments)}function r(e){return"number"==typeof e?"number":"string"==typeof e?"string":Object.prototype.toString.call(e).slice(8,-1).toLowerCase()}function n(e,t){return t>=0&&t<=7&&i[e]?i[e][t]:Array(t+1).join(e)}var s={not_string:/[^s]/,not_bool:/[^t]/,not_type:/[^T]/,not_primitive:/[^v]/,number:/[diefg]/,numeric_arg:/[bcdiefguxX]/,json:/[j]/,not_json:/[^j]/,text:/^[^\x25]+/,modulo:/^\x25{2}/,placeholder:/^\x25(?:([1-9]\d*)\$|\(([^\)]+)\))?(\+)?(0|'[^$])?(-)?(\d+)?(?:\.(\d+))?([b-gijostTuvxX])/,key:/^([a-z_][a-z_\d]*)/i,key_access:/^\.([a-z_][a-z_\d]*)/i,index_access:/^\[(\d+)\]/,sign:/^[\+\-]/};t.format=function(e,a){var i,o,l,p,c,f,u,g=1,_=e.length,d="",b=[],h=!0,x="";for(o=0;o<_;o++)if(d=r(e[o]),"string"===d)b[b.length]=e[o];else if("array"===d){if(p=e[o],p[2])for(i=a[g],l=0;l<p[2].length;l++){if(!i.hasOwnProperty(p[2][l]))throw new Error(t('[sprintf] property "%s" does not exist',p[2][l]));i=i[p[2][l]]}else i=p[1]?a[p[1]]:a[g++];if(s.not_type.test(p[8])&&s.not_primitive.test(p[8])&&"function"==r(i)&&(i=i()),s.numeric_arg.test(p[8])&&"number"!=r(i)&&isNaN(i))throw new TypeError(t("[sprintf] expecting number but found %s",r(i)));switch(s.number.test(p[8])&&(h=i>=0),p[8]){case"b":i=parseInt(i,10).toString(2);break;case"c":i=String.fromCharCode(parseInt(i,10));break;case"d":case"i":i=parseInt(i,10);break;case"j":i=JSON.stringify(i,null,p[6]?parseInt(p[6]):0);break;case"e":i=p[7]?parseFloat(i).toExponential(p[7]):parseFloat(i).toExponential();break;case"f":i=p[7]?parseFloat(i).toFixed(p[7]):parseFloat(i);break;case"g":i=p[7]?parseFloat(i).toPrecision(p[7]):parseFloat(i);break;case"o":i=i.toString(8);break;case"s":i=String(i),i=p[7]?i.substring(0,p[7]):i;break;case"t":i=String(!!i),i=p[7]?i.substring(0,p[7]):i;break;case"T":i=r(i),i=p[7]?i.substring(0,p[7]):i;break;case"u":i=parseInt(i,10)>>>0;break;case"v":i=i.valueOf(),i=p[7]?i.substring(0,p[7]):i;break;case"x":i=parseInt(i,10).toString(16);break;case"X":i=parseInt(i,10).toString(16).toUpperCase()}s.json.test(p[8])?b[b.length]=i:(!s.number.test(p[8])||h&&!p[3]?x="":(x=h?"+":"-",i=i.toString().replace(s.sign,"")),f=p[4]?"0"===p[4]?"0":p[4].charAt(1):" ",u=p[6]-(x+i).length,c=p[6]&&u>0?n(f,u):"",b[b.length]=p[5]?x+i+c:"0"===f?x+c+i:c+x+i)}return b.join("")},t.cache={},t.parse=function(e){for(var t=e,r=[],n=[],a=0;t;){if(null!==(r=s.text.exec(t)))n[n.length]=r[0];else if(null!==(r=s.modulo.exec(t)))n[n.length]="%";else{if(null===(r=s.placeholder.exec(t)))throw new SyntaxError("[sprintf] unexpected placeholder");if(r[2]){a|=1;var i=[],o=r[2],l=[];if(null===(l=s.key.exec(o)))throw new SyntaxError("[sprintf] failed to parse named argument key");for(i[i.length]=l[1];""!==(o=o.substring(l[0].length));)if(null!==(l=s.key_access.exec(o)))i[i.length]=l[1];else{if(null===(l=s.index_access.exec(o)))throw new SyntaxError("[sprintf] failed to parse named argument key");i[i.length]=l[1]}r[2]=i}else a|=2;if(3===a)throw new Error("[sprintf] mixing positional and named placeholders is not (yet) supported");n[n.length]=r}t=t.substring(r[0].length)}return n};var a=function(e,r,n){return n=(r||[]).slice(0),n.splice(0,0,e),t.apply(null,n)},i={0:["","0","00","000","0000","00000","000000","0000000"]," ":[""," ","  ","   ","    ","     ","      ","       "],_:["","_","__","___","____","_____","______","_______"]};"undefined"!=typeof exports&&(exports.sprintf=t,exports.vsprintf=a),"undefined"!=typeof e&&(e.sprintf=t,e.vsprintf=a,"function"==typeof define&&define.amd&&define(function(){return{sprintf:t,vsprintf:a}}))}("undefined"==typeof window?this:window);
//# sourceMappingURL=sprintf.min.js.map