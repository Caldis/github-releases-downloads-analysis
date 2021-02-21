// 禁止响应全局的文件拖放事件
export const disableDragDrop = () => {
  window.addEventListener('dragover', function (e) {
    e.preventDefault()
  }, false)
  window.addEventListener('drop', function (e) {
    e.preventDefault()
  }, false)
}
