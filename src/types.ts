import { DEFAULT_MENU_LIST } from './enum'

/**
 * 菜单项配置
 */
export interface MenuOptions {
  // 菜单项key
  key: string
  // 菜单项名称
  title: string
  // 菜单项描述
  desc?: string
  // 禁用
  disabled?: boolean
  // 类型，作用是区分当前选择项在什么情况下出现
  // (ALL：所有情况下出现，APP：只有在app情况下出现，GRAPH：只有在图形情况下出现)
  type?: 'ALL' | 'APP' | 'GRAPH'
  // 子菜单 后续支持
  // children?: Array<MenuOptions | string>
}

/**
 * 选项配置
 */
export interface Options {
  // 菜单列表 （与菜单组二选一，优先级高于菜单组）
  menuList?: Array<MenuOptions>
  // 菜单组
  menuGroup?: Array<Array<MenuOptions>>
  // 排除默认菜单
  excludeDefaultMenu?: DEFAULT_MENU_LIST[]
  // 阻止默认菜单的默认行为
  preventDefaultMenu?: DEFAULT_MENU_LIST[]
  // 隐藏默认菜单组
  hideDefaultMenu?: boolean
  // 菜单容器类名
  menuWrapClass?: string
  // 菜单项容器类名
  menuItemWrapClass?: string
}

/**
 * 事件监听
 */
export type EventMonitor = (options?: MenuOptions, e?: MouseEvent) => void
