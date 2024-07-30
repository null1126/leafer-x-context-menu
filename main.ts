import { Leafer, Rect } from 'leafer-ui'
import { ContextMenu, DEFAULT_MENU_LIST } from './src' // 引入插件代码

const leafer = new Leafer({ view: window })

const rect = new Rect({
  x: 100,
  y: 100,
  width: 100,
  height: 100,
  fill: '#32cd79',
  draggable: true,
  editable: true,
})

leafer.add(rect)

const contextMenu = new ContextMenu(leafer, {
  excludeDefaultMenu: [DEFAULT_MENU_LIST.SELECT_ALL],
  menuList: [
    {
      title: '自定义菜单：超出隐藏超出隐藏超出隐藏',
      desc: '自定义菜单：超出隐藏超出隐藏',
      key: 'test',
      disabled: false,
    },
    {
      title: '自定义菜单：没有描述和禁用',
      key: 'test1',
      disabled: true,
    },
  ],
})

// 初始化
contextMenu.init()

// 监听菜单选择事件
contextMenu.on((opt) => {
  console.log(opt)
})
