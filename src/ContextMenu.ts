import { Event, Leafer, PointerEvent } from '@leafer-ui/core'
import type { IEventListenerId, IUI } from '@leafer-ui/interface'
import { DEFAULT_MENU_LIST } from './enum'
import type { MenuOptions, Options, EventMonitor } from './types'
import { defaultMenuList } from './config'

export class ContextMenu {
  /**
   * leafer实例
   */
  private readonly app: Leafer

  /**
   * 选项配置
   */
  private options: Options

  /**
   * 菜单容器
   */
  private menuContainer: HTMLElement

  /**
   * 默认菜单列表
   */
  private defaultMenuList: Array<MenuOptions>

  /**
   * 绑定的事件id列表
   */
  private bindEventIds: Array<IEventListenerId>

  /**
   * 是否已经初始化
   */
  private isInitialized: boolean

  /**
   * 监听事件列表
   */
  private eventList: Array<EventMonitor>

  /**
   * 已复制的图形
   */
  private copiedGraph?: IUI

  /**
   * 当前操作的图形
   */
  private currentGraph: IUI

  constructor(app: Leafer, options?: Options) {
    this.app = app
    this.options = options
    this.bindEventIds = []
    this.defaultMenuList = defaultMenuList
    this.eventList = []
    this.copiedGraph = undefined
  }

  /**
   * 初始化
   * @param { Options } options 配置参数
   */
  init(options?: Options) {
    if (this.isInitialized) {
      console.warn('ContextMenu has been initialized')
      return
    }
    this.options = { ...this.options, ...options }
    this.initEvent()
  }

  getMenuList() {
    const defaultMenuList: MenuOptions[] = []

    this.defaultMenuList.forEach((menu) => {
      if (menu.key === DEFAULT_MENU_LIST.PASTE) {
        menu.disabled = !this.copiedGraph
      }
      if (
        this.options.excludeDefaultMenu.indexOf(
          menu.key as DEFAULT_MENU_LIST
        ) === -1
      ) {
        defaultMenuList.push(menu)
      }
    })

    return [...this.options.menuList, ...defaultMenuList]
  }

  /**
   * 初始化事件
   * @private
   */
  private initEvent() {
    const menuEventId = this.app.on_(
      PointerEvent.MENU,
      this.leaferMenuEvent,
      this
    )

    const clickEventId = this.app.on_(
      PointerEvent.CLICK,
      this.leaferClickEvent,
      this
    )

    this.bindEventIds.push(menuEventId, clickEventId)
  }

  /**
   * 创建菜单
   */
  private createMenu(menuList: MenuOptions[]) {
    const menu = document.createElement('ul')
    const menuWrapClass = this.options.menuWrapClass
    menu.classList.add('context-menu')
    menuWrapClass && menu.classList.add(menuWrapClass)
    menuList.forEach((item) => {
      const li = document.createElement('li')
      const h4 = document.createElement('p')
      h4.innerText = item.title
      h4.title = item.title
      li.appendChild(h4)
      h4.classList.add('context-menu-title')

      if (item?.desc) {
        const p = document.createElement('p')
        p.innerText = item?.desc || ''
        p.title = item?.desc || ''
        p.classList.add('context-menu-desc')
        li.appendChild(p)
      }

      const menuItemWrapClass = this.options.menuItemWrapClass
      li.classList.add('context-menu-item')
      item?.disabled && li.classList.add('disabled')
      li.setAttribute('key', item.key)
      menuItemWrapClass && menu.classList.add(menuItemWrapClass)
      menu.appendChild(li)
    })
    return menu
  }

  /**
   * 鼠标右键
   */
  private leaferMenuEvent(e: PointerEvent) {
    this.menuContainer?.remove()
    let menuList = this.getMenuList()
    if (e.target instanceof Leafer) {
      menuList = menuList.filter(
        (item) => item.type === 'APP' || item.type === 'ALL' || !item.type
      )
    } else {
      menuList = menuList.filter(
        (item) => item.type === 'GRAPH' || item.type === 'ALL' || !item.type
      )
      this.currentGraph = e.target as IUI
    }

    this.menuContainer = this.createMenu(menuList)
    document.body.appendChild(this.menuContainer)

    let menuW = this.menuContainer.offsetWidth
    let menuH = this.menuContainer.offsetHeight
    let { x, y, current } = e
    const { width, height } = current

    // 如果鼠标靠近画布右侧，菜单就出现在鼠标左侧
    if (width - x <= menuW) {
      x -= menuW
    }
    // 如果鼠标靠近画布底部，菜单就出现在鼠标上方
    if (height - y <= menuH) {
      y -= menuH
    }

    this.menuContainer.style.visibility = 'visible'
    this.menuContainer.style.left = `${x}px`
    this.menuContainer.style.top = `${y}px`
    this.menuContainer.addEventListener('click', this.menuClick.bind(this))
  }

  /**
   * 菜单被点击
   */
  private menuClick(event: MouseEvent) {
    // 获取被点击的元素
    let target = event.target as HTMLElement
    let clickKey = ''
    let menuList = this.getMenuList()

    // 向上遍历直到找到带有'key'属性的元素或到达菜单容器
    while (target && target !== (this as unknown as HTMLElement)) {
      // 'this'在这里指向menu
      if (target.getAttribute('key')) {
        // 找到带有'key'属性的元素
        clickKey = target.getAttribute('key')
        // 找到后退出循环
        break
      }
      // 向上移动到父元素
      target = target.parentElement as HTMLElement
    }

    if (!clickKey) {
      return
    }
    const menuInfo = menuList.find((item) => item.key === clickKey)
    this.eventList.forEach((func) => {
      func(menuInfo, event)
    })

    this.executiveMenuFun(menuInfo.key)
    this.menuContainer?.remove()
  }

  /**
   * 执行菜单功能
   */
  private executiveMenuFun(key: string) {
    const keyFunMap: any = {
      [DEFAULT_MENU_LIST.DELETE]: () => this.deleteGraph(this.currentGraph),
      [DEFAULT_MENU_LIST.COPY]: () => this.copyGraph(this.currentGraph),
      [DEFAULT_MENU_LIST.PASTE]: () => this.pasteGraph(),
      [DEFAULT_MENU_LIST.CUT]: () => this.cutGraph(this.currentGraph),
    }
    keyFunMap[key]?.()
  }

  /**
   * 复制图形
   */
  private copyGraph(graph: IUI) {
    this.copiedGraph = graph.clone()
  }

  /**
   * 清空复制的图形
   */
  clearCopyGraph() {
    this.copiedGraph = undefined
  }

  /**
   * 粘贴图形到鼠标位置
   */
  private pasteGraph() {
    if (this.copiedGraph) {
      const graph = this.copiedGraph.clone()
      const { x, y } = this.app.getPagePoint(this.app.cursorPoint)
      graph.set({ x, y })
      this.app.add(graph)
    }
  }

  /**
   * 剪切图形
   */
  private cutGraph(graph: IUI) {
    this.copyGraph(graph)
    this.deleteGraph(graph)
  }

  /**
   * 删除图形
   */
  private deleteGraph(graph: IUI) {
    this.app.remove(graph)
  }

  /**
   * 点击事件
   */
  private leaferClickEvent() {
    this.menuContainer.style.visibility = 'hidden'
  }

  /**
   * 监听菜单选择事件
   * @param func 事件回调
   */
  on(func: EventMonitor) {
    this.eventList.push(func)
  }

  /**
   * 取消监听菜单选择事件
   */
  off(func: EventMonitor) {
    const index = this.eventList.findIndex((item) => item === func)
    if (index > -1) {
      this.eventList.splice(index, 1)
    }
  }

  /**
   * 销毁
   */
  destroy() {
    this.app.off_(this.bindEventIds)
    this.bindEventIds = []
    this.eventList = []
    this.menuContainer?.removeEventListener('click', this.menuClick.bind(this))
    this.menuContainer?.remove()
    this.isInitialized = false
    this.clearCopyGraph()
  }
}

export class ContextMenuEvent extends Event {}
