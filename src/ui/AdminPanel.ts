// The test panel: jumps straight to the parts of the game being tested, opened from a small button in
// the bottom-left corner. The button must be held for a second, so a stray tap never opens it.
// The game pauses while the panel is open, like the character menu.

const HOLD_MS = 1000
const TAB_KEY = 'polar-haul-admin-tab'
const WRENCH =
  '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21.7 6.3 18 10l-4-4 3.7-3.7A6 6 0 0 0 10 9.3L2.6 16.7a2 2 0 0 0 2.8 2.8l7.4-7.4a6 6 0 0 0 8.9-5.8z"/></svg>'
const RING_LENGTH = 2 * Math.PI * 27 // the hold ring's circumference, for its dash animation

export interface AdminAction {
  label: string
  hint: string // one line on what it does
  since: string // the version it arrived in, such as "0.6.0"
  run: () => void
  isOn?: () => boolean // given for an on/off switch; the button then shows its state
  closes?: boolean // closes the panel afterwards, so the result can be watched
}

export interface AdminTab {
  title: string
  actions?: AdminAction[]
  info?: () => [string, string][] // read-only rows: name and value
}

export class AdminPanel {
  isOpen = false
  private tabs: AdminTab[]
  private current: number
  private button = document.createElement('button')
  private overlay = document.createElement('div')
  private tabBar = document.createElement('div')
  private list = document.createElement('div')
  private holdTimer = 0

  constructor(tabs: AdminTab[]) {
    this.tabs = tabs
    this.current = Math.min(readTab(), tabs.length - 1)
    this.buildButton()
    this.buildPanel()
  }

  open(): void {
    this.isOpen = true
    this.overlay.classList.remove('hidden')
    this.render()
  }

  close(): void {
    this.isOpen = false
    this.overlay.classList.add('hidden')
  }

  // Hold to open: a ring fills around the button; letting go early cancels.
  private buildButton(): void {
    this.button.type = 'button'
    this.button.className = 'admin-button'
    this.button.setAttribute('aria-label', 'Test paneli (basılı tut)')
    this.button.innerHTML = `${WRENCH}<svg class="admin-ring" viewBox="0 0 60 60" aria-hidden="true"><circle cx="30" cy="30" r="27" style="stroke-dasharray:${RING_LENGTH};stroke-dashoffset:${RING_LENGTH}"/></svg>`
    const cancel = (): void => {
      window.clearTimeout(this.holdTimer)
      this.button.classList.remove('holding')
    }
    this.button.addEventListener('pointerdown', (e) => {
      e.stopPropagation()
      this.button.classList.add('holding')
      this.holdTimer = window.setTimeout(() => {
        cancel()
        this.open()
      }, HOLD_MS)
    })
    this.button.addEventListener('pointerup', cancel)
    this.button.addEventListener('pointerleave', cancel)
    this.button.addEventListener('pointercancel', cancel)
    this.button.addEventListener('contextmenu', (e) => e.preventDefault())
    document.body.append(this.button)
  }

  private buildPanel(): void {
    this.overlay.className = 'menu-overlay hidden'
    const panel = document.createElement('div')
    panel.className = 'menu-panel admin-panel'
    panel.setAttribute('role', 'dialog')
    panel.setAttribute('aria-label', 'Test paneli')

    const head = document.createElement('div')
    head.className = 'menu-head admin-head'
    const title = document.createElement('h2')
    title.textContent = 'Test paneli'
    const version = document.createElement('div')
    version.className = 'admin-version'
    version.textContent = `v${__APP_VERSION__}`
    const close = document.createElement('button')
    close.type = 'button'
    close.className = 'menu-close'
    close.textContent = 'Kapat'
    close.addEventListener('click', () => this.close())
    this.tabBar.className = 'admin-tabs'
    const top = document.createElement('div')
    top.className = 'admin-top'
    top.append(title, version, close)
    head.append(top, this.tabBar)

    this.list.className = 'menu-list'
    panel.append(head, this.list)
    this.overlay.append(panel)
    this.overlay.addEventListener('pointerdown', (e) => {
      e.stopPropagation()
      if (e.target === this.overlay) this.close()
    })
    document.body.append(this.overlay)
  }

  private render(): void {
    this.tabBar.replaceChildren(
      ...this.tabs.map((tab, i) => {
        const b = document.createElement('button')
        b.type = 'button'
        b.className = 'admin-tab'
        b.classList.toggle('active', i === this.current)
        b.textContent = tab.title
        if (tab.actions?.some((a) => isNew(a.since))) b.classList.add('has-new')
        b.addEventListener('click', () => {
          this.current = i
          saveTab(i)
          this.render()
        })
        return b
      }),
    )
    const tab = this.tabs[this.current]
    const rows: HTMLElement[] = []
    for (const action of tab.actions ?? []) rows.push(this.actionRow(action))
    for (const [name, value] of tab.info?.() ?? []) rows.push(infoRow(name, value))
    this.list.replaceChildren(...rows)
  }

  private actionRow(action: AdminAction): HTMLElement {
    const row = document.createElement('div')
    row.className = 'menu-row'
    const text = document.createElement('div')
    text.className = 'menu-text'
    const name = document.createElement('div')
    name.className = 'menu-name'
    name.textContent = action.label
    const badge = document.createElement('span')
    badge.className = isNew(action.since) ? 'admin-badge new' : 'admin-badge'
    badge.textContent = isNew(action.since) ? 'YENİ' : action.since
    name.append(badge)
    const detail = document.createElement('div')
    detail.className = 'menu-detail'
    detail.textContent = action.hint
    text.append(name, detail)

    const button = document.createElement('button')
    button.type = 'button'
    button.className = 'menu-buy admin-go'
    const on = action.isOn?.()
    if (on !== undefined) {
      button.textContent = on ? 'Açık' : 'Kapalı'
      button.classList.toggle('off', !on)
    } else {
      button.textContent = 'Uygula'
    }
    button.addEventListener('click', () => {
      action.run()
      if (action.closes) this.close()
      else this.render()
    })
    row.append(text, button)
    return row
  }
}

function infoRow(name: string, value: string): HTMLElement {
  const row = document.createElement('div')
  row.className = 'menu-row admin-info'
  const n = document.createElement('div')
  n.className = 'menu-text'
  n.textContent = name
  const v = document.createElement('div')
  v.className = 'admin-value'
  v.textContent = value
  row.append(n, v)
  return row
}

// "New" means it arrived in the version being played, so each update's additions stand out.
function isNew(since: string): boolean {
  return since === __APP_VERSION__
}

function readTab(): number {
  try {
    return Number(localStorage.getItem(TAB_KEY) ?? 0) || 0
  } catch {
    return 0
  }
}

function saveTab(i: number): void {
  try {
    localStorage.setItem(TAB_KEY, String(i))
  } catch {
    // Private browsing can refuse storage; the panel then opens on the first tab.
  }
}
