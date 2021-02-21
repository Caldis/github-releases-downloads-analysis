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
      "S": this.getMilliseconds(),
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
  window.addEventListener('dragover', function (e) {
    e.preventDefault()
  }, false)
  window.addEventListener('drop', function (e) {
    e.preventDefault()
  }, false)
}
