// 工具类

// 日期格式化, 自动注入Date原型
// 调用后, 可使用 new Date().Format("yyyyMMddhhmmssS"); 以格式化日期
(() => {
	Date.prototype.Format = function(fmt) {
		const o = {
			"M+": this.getMonth() + 1,
			"d+": this.getDate(),
			"h+": this.getHours(),
			"m+": this.getMinutes(),
			"s+": this.getSeconds(),
			"q+": Math.floor((this.getMonth() + 3) / 3),
			"S": this.getMilliseconds()
		};
		if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
		for (let k in o)
			if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
		return fmt;
	};
})();

// 数组 移除特定元素
(() => {
	Array.prototype.Remove = function(val) {
		const index = this.indexOf(val);
		if (index > -1) {
			return this.slice(0, index).concat(this.slice(index+1, this.length))
		} else {
			return this;
		}
	};
})();

// 禁止响应全局的文件拖放事件
export const disableDragDrop = () => {
	window.addEventListener("dragover",function(e){
		e = e || event;
		e.preventDefault();
	},false);
	window.addEventListener("drop",function(e){
		e = e || event;
		e.preventDefault();
	},false);
};

// 节流, delay 时间内连续触发的调用, 只有最后一个会执行
export const throttle = (callback, delay) => {
	let timer = null;
	return function() {
		let context = this, args = arguments;
		clearTimeout(timer);
		timer = setTimeout(function() {
			callback.apply(context, args);
		}, delay);
	};
};
// 节流, 带必须触发时间参数
// delay 间隔内连续触发的调用，后一个调用会把前一个调用的等待处理掉，但每隔 mustRunDelay 至少执行一次。
export const throttleMustRun = (callback, delay, mustRunDelay) => {
	let timer = null;
	let t_start;
	return function(){
		let context = this, args = arguments, t_curr = +new Date();
		clearTimeout(timer);
		if(!t_start){
			t_start = t_curr;
		}
		if(t_curr - t_start >= mustRunDelay){
			callback.apply(context, args);
			t_start = t_curr;
		}
		else {
			timer = setTimeout(function(){
				callback.apply(context, args);
			}, delay);
		}
	};
};

// 判断对象为空
export const objIsEmpty = (obj) => {
	// null and undefined are "empty"
	if (obj === null || obj === undefined) return true;

	// Assume if it has a length property with a non-zero value
	// that that property is correct.
	if (obj.length > 0)    return false;
	if (obj.length === 0)  return true;

	// Otherwise, does it have any properties of its own?
	// Note that this doesn't handle
	// toString and valueOf enumeration bugs in IE < 9
	for (let key in obj) {
		if (hasOwnProperty.call(obj, key)) return false;
	}

	return true;
};

// 判断浏览器版本
export const getBrowser = () => {
	let Sys = {};
	let ua = navigator.userAgent.toLowerCase();
	let s;
	(s = ua.match(/rv:([\d.]+)\) like gecko/)) ? Sys.ie = s[1] :
		(s = ua.match(/msie ([\d.]+)/)) ? Sys.ie = s[1] :
			(s = ua.match(/firefox\/([\d.]+)/)) ? Sys.firefox = s[1] :
				(s = ua.match(/chrome\/([\d.]+)/)) ? Sys.chrome = s[1] :
					(s = ua.match(/opera.([\d.]+)/)) ? Sys.opera = s[1] :
						(s = ua.match(/version\/([\d.]+).*safari/)) ? Sys.safari = s[1] : 0;

	if (Sys.ie) return {
		browser: 'ie',
		version: Sys.ie
	};
	if (Sys.firefox) return {
		browser: 'firefox',
		version: Sys.firefox
	};
	if (Sys.chrome) return {
		browser: 'chrome',
		version: Sys.chrome
	};
	if (Sys.opera) return {
		browser: 'opera',
		version: Sys.opera
	};
	if (Sys.safari) return {
		browser: 'safari',
		version: Sys.safari
	};
};

// 数组去重
export const unique = (arr) => {
	return Array.from(new Set(arr))
};
// 数组排序, 配合sort使用
export const by = (name, reverse) => {
	return function(o, p){
		let a, b;
		if (typeof o === "object" && typeof p === "object" && o && p) {
			a = o[name];
			b = p[name];
			if (a === b) {
				return 0;
			}
			if (typeof a === typeof b) {
				return reverse ? a > b ? -1 : 1 : a < b ? -1 : 1;
			}
			return reverse ? typeof a > typeof b ? -1 : 1 : typeof a < typeof b ? -1 : 1;
		}
		else {
			throw ("error");
		}
	}
};

// 随机字符串
export const generateUUID = () => {
	let d = new Date().getTime();
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
		const r = (d + Math.random()*16)%16 | 0;
		d = Math.floor(d/16);
		return (c==="x" ? r : (r&0x7|0x8)).toString(16);
	});
};

// 统计字符串中特殊字符出现的次数
//str 源字符串, target 特殊字符
export const getStrCount = (str, target) => {
	let count=0;
	while(str.indexOf(target) >=1 ) {
		str = str.replace(target,"");
		count++;
	}
	return count;
};

// 从Url获取文件名
export const getNameFromUrl = (url) => {
	const arrUrl = url ? url.split("/") : '';
	return arrUrl[arrUrl.length-1];
};

// 直接下载文件
export const downloadFile = (fileLink, fileName) => {
	fetch(fileLink).then(res => res.blob().then(blob => {
		const aTag = document.createElement('a');
		const url = window.URL.createObjectURL(blob);
		aTag.href = url;
		aTag.download = fileName;
		aTag.click();
		window.URL.revokeObjectURL(url);
	}));
};

// 判断元素没有内容
export const noValueOf = (data) => {
	if(data === undefined || data === null)
		return true;
	switch (data.constructor) {
		case Array:
			return data.length === 0;
		case Object:
			return Object.keys(data).length === 0;
		case String:
			return data.length === 0;
		case Number:
			return data === 0;
		case Boolean:
			return !data;
		default:
			return false;
	}
};

// 判断元素有内容
export const hasValueOf = (data) => {
	if(data === undefined || data === null)
		return false;
	switch (data.constructor) {
		case Array:
			return data.length > 0;
		case Object:
			return Object.keys(data).length > 0;
		case String:
			return data.length > 0;
		case Number:
			return data > 0;
		case Boolean:
			return data;
		default:
			return true;
	}
};

// Base64解编码, 支持Unicode
export class Base64Unicoder {
	constructor() {
		// private property
		this._keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
	}
	// 编码
	encode = (input) => {
		let output = "";
		let chr1, chr2, chr3, enc1, enc2, enc3, enc4;
		let i = 0;
		input = this._utf8_encode(input);
		while (i < input.length) {
			chr1 = input.charCodeAt(i++);
			chr2 = input.charCodeAt(i++);
			chr3 = input.charCodeAt(i++);
			enc1 = chr1 >> 2;
			enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
			enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
			enc4 = chr3 & 63;
			if (isNaN(chr2)) {
				enc3 = enc4 = 64;
			} else if (isNaN(chr3)) {
				enc4 = 64;
			}
			output = output +
				this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) +
				this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);
		}
		return output;
	};
	// 解码
	decode = (input) => {
		let output = "";
		let chr1, chr2, chr3;
		let enc1, enc2, enc3, enc4;
		let i = 0;
		input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
		while (i < input.length) {
			enc1 = this._keyStr.indexOf(input.charAt(i++));
			enc2 = this._keyStr.indexOf(input.charAt(i++));
			enc3 = this._keyStr.indexOf(input.charAt(i++));
			enc4 = this._keyStr.indexOf(input.charAt(i++));
			chr1 = (enc1 << 2) | (enc2 >> 4);
			chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
			chr3 = ((enc3 & 3) << 6) | enc4;
			output = output + String.fromCharCode(chr1);
			if (enc3 !== 64) {
				output = output + String.fromCharCode(chr2);
			}
			if (enc4 !== 64) {
				output = output + String.fromCharCode(chr3);
			}
		}
		output = this._utf8_decode(output);
		return output;
	};
	// 私有方法 UTF-8 编码
	_utf8_encode = (string) => {
		string = string.replace(/\r\n/g, "\n");
		let utftext = "";
		for (let n = 0; n < string.length; n++) {
			let c = string.charCodeAt(n);
			if (c < 128) {
				utftext += String.fromCharCode(c);
			}
			else if ((c > 127) && (c < 2048)) {
				utftext += String.fromCharCode((c >> 6) | 192);
				utftext += String.fromCharCode((c & 63) | 128);
			}
			else {
				utftext += String.fromCharCode((c >> 12) | 224);
				utftext += String.fromCharCode(((c >> 6) & 63) | 128);
				utftext += String.fromCharCode((c & 63) | 128);
			}
		}
		return utftext;
	};
	// 私有方法 UTF-8 解码
	_utf8_decode = (utftext) => {
		let string = "";
		let i = 0;
		let c = 0, c1 = 0, c2 = 0, c3 = 0;
		while (i < utftext.length) {
			c = utftext.charCodeAt(i);
			if (c < 128) {
				string += String.fromCharCode(c);
				i++;
			}
			else if ((c > 191) && (c < 224)) {
				c2 = utftext.charCodeAt(i + 1);
				string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
				i += 2;
			}
			else {
				c2 = utftext.charCodeAt(i + 1);
				c3 = utftext.charCodeAt(i + 2);
				string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
				i += 3;
			}
		}
		return string;
	};
}

export const cookies = {
	getItem: function (sKey) {
		return decodeURIComponent(document.cookie.replace(new RegExp("(?:(?:^|.*;)\\s*" + encodeURIComponent(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*([^;]*).*$)|^.*$"), "$1")) || null;
	},
	setItem: function (sKey, sValue, vEnd, sPath, sDomain, bSecure) {
		if (!sKey || /^(?:expires|max\-age|path|domain|secure)$/i.test(sKey)) { return false; }
		let sExpires = "";
		if (vEnd) {
			switch (vEnd.constructor) {
				case Number:
					sExpires = vEnd === Infinity ? "; expires=Fri, 31 Dec 9999 23:59:59 GMT" : "; max-age=" + vEnd;
					break;
				case String:
					sExpires = "; expires=" + vEnd;
					break;
				case Date:
					sExpires = "; expires=" + vEnd.toUTCString();
					break;
			}
		}
		document.cookie = encodeURIComponent(sKey) + "=" + encodeURIComponent(sValue) + sExpires + (sDomain ? "; domain=" + sDomain : "") + (sPath ? "; path=" + sPath : "") + (bSecure ? "; secure" : "");
		return true;
	},
	removeItem: function (sKey, sPath, sDomain) {
		if (!sKey || !this.hasItem(sKey)) { return false; }
		document.cookie = encodeURIComponent(sKey) + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT" + ( sDomain ? "; domain=" + sDomain : "") + ( sPath ? "; path=" + sPath : "");
		return true;
	},
	hasItem: function (sKey) {
		return (new RegExp("(?:^|;\\s*)" + encodeURIComponent(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=")).test(document.cookie);
	},
	keys: /* optional method: you can safely remove it! */ function () {
		let aKeys = document.cookie.replace(/((?:^|\s*;)[^\=]+)(?=;|$)|^\s*|\s*(?:\=[^;]*)?(?:\1|$)/g, "").split(/\s*(?:\=[^;]*)?;\s*/);
		for (let nIdx = 0; nIdx < aKeys.length; nIdx++) { aKeys[nIdx] = decodeURIComponent(aKeys[nIdx]); }
		return aKeys;
	}
};

export const idSearch = () => {

	let initYear = 1990; //最早貌似从1993年起
	let date = new Date();
	let nowYear = date.getFullYear();
	let tmpUrl = 'http://10.30.12.170/eGuardFileServer/';

	const genFullUrlList = (uid, fromYear) => {
		let urlList = [];
		let dateList = [];
		for(let year = fromYear || initYear; year<=nowYear; year++) {
			for(let month = 1; month<=12; month++) {
				const sYear = year.toString();
				const sMonth = month<10?'0'+month.toString():month.toString();
				urlList.push(tmpUrl + sYear + sMonth + uid + '.jpg');
				dateList.push({
					year,
					month,
				})
			}
		}
		return {urlList, dateList}
	};

	return (uid, callback) => {
		if(uid.length === 14) {
			return 'http://10.30.12.170/eGuardFileServer/' + uid + '.jpg';
		}
		if(typeof uid === 'number') {
			// 请以字符串格式传入工号
			return;
		}
		if(uid.length > 14) {
			// 工号过长
			return;
		}

		const data = genFullUrlList(uid);
		data.urlList.forEach((url, index) => {
			fetch(url).then(res => {
				if(res.ok) {
					console.log('入职:' + data.dateList[index].year + '年' + data.dateList[index].month + '月');
					console.log('头像:' + res.url);
					callback()
				}
			}, (e) => {
				console.log("Fetch failed!", e);
			});
		})
	}
};

// 全局事件工具类
// 放全局事件的对象
const eventDOM = document.querySelector('html');
// 默认配置项
const defaultOptions = { target: window, cleanBeforeAdd: true };
// 全局事件的回调函数引用
window["eventBin"] = {}; const eventBin = window.eventBin;
export const GlobalEvent = {
	// 添加对应事件的 Handler
	addEventHandler: (typeName, eventHandler, options) => {
		// target: 指定目标
		// cleanBeforeAdd: 先移除所有已有的同名事件再绑定
		const customOptions = Object.assign(defaultOptions, options);
		const { target, cleanBeforeAdd } = customOptions;
		// 初始化对应类型的全局事件的回调函数引用
		if (!eventBin[typeName]) eventBin[typeName] = [];
		// 如果传入 cleanBeforeAdd, 则先移除所有已有的同名事件再追加
		if (cleanBeforeAdd && eventBin[typeName].length) {
			eventBin[typeName].forEach(eventHandler => GlobalEvent.removeEventHandler(typeName, eventHandler));
			eventBin[typeName] = [];
		}
		// 保存 handler 的句柄, handler 接受的的参数是自定义函数中 detail 的对应值
		const handler = (e) => { eventHandler(e.detail) };
		eventBin[typeName].push({ handler, options: customOptions });
		// 绑定事件, 如果传入了 target, 则绑定在 target 上
		if (target) {
			target.addEventListener(typeName, handler, false);
		} else {
			eventDOM.addEventListener(typeName, handler, false);
		}
	},
	dispatchEvent: (typeName, data) => {
		// 为事件附带自定义数据 (必须放入 detail 这个属性中)
		const event = new CustomEvent(typeName, { 'detail': data });
		// 分发事件, 如果存在 target, 则发送到 target
		GlobalEvent.targetsOf(typeName).forEach(target => target.dispatchEvent(event));
	},
	// 移除对应事件的Handler
	removeEventHandler: (typeName, eventHandler) => {
		// 移除事件, 如果存在 target, 则移除 target 上的
		GlobalEvent.targetsOf(typeName).forEach(target => target.removeEventListener(typeName, eventHandler, false));
	},
	// 获取事件目标的属性
	targetsOf: function (typeName) {
		if (eventBin[typeName]) {
			return eventBin[typeName].map(typeData => {
				if (typeData.options.target) {
					return typeData.options.target
				} else {
					return eventDOM
				}
			});
		}
		return [eventDOM]
	},
	// 阻止事件默认行为
	preventDefault: function (event) {
		if (event.preventDefault) {
			event.preventDefault();
		} else {
			event.returnValue = false;
		}
	},
	// 阻止事件冒泡
	stopPropagation: function (event) {
		if (event.stopPropagation) {
			event.stopPropagation();
		} else {
			event.cancelBubble = true;
		}
	}
};

// 校验字符串是否Url
export const isURL = (url) => {
	// 待实现
};
// 从文件路径, URl路径获取文件名
export const filenameOfPath = (path) => {
	if (path) {
		const splitUnix = path.split("\/");
		const splitWin32 = path.split("\\");
		const splitArr = splitUnix.length>splitWin32.length ? splitUnix : splitWin32;
		return splitArr[splitArr.length - 1];
	} else {
		return "";
	}
};
// 从完整文件名获取文件名称 (去掉扩展名)
export const nameOfFilename = (fullName) => {
	return fullName.replace(/\.\w+$/,"");
};
// 从完整文件名获取文件后缀 (去掉文件名)
export const typeOfFilename = (fullName) => {
	return /\.[^\.]+$/.exec(fullName)[0].replace(/\./,"").toLowerCase();
};