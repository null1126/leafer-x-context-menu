import { DEFAULT_MENU_LIST } from './enum'
import { MenuOptions } from './types'

/**
 * 默认菜单列表
 */
export const defaultMenuList: Array<MenuOptions> = [
  {
    key: DEFAULT_MENU_LIST.DELETE,
    title: '删除',
    desc: 'Delete',
    type: 'GRAPH',
  },
  {
    key: DEFAULT_MENU_LIST.COPY,
    title: '复制',
    desc: 'Ctrl+C',
    type: 'GRAPH',
  },
  {
    key: DEFAULT_MENU_LIST.PASTE,
    title: '粘贴',
    desc: 'Ctrl+V',
    type: 'APP',
  },
  {
    key: DEFAULT_MENU_LIST.CUT,
    title: '剪切',
    desc: 'Ctrl+X',
    type: 'GRAPH',
  },
  {
    key: DEFAULT_MENU_LIST.SELECT_ALL,
    title: '全选',
    desc: 'Ctrl+A',
    type: 'ALL',
  },
]
