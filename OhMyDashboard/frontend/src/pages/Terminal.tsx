import { useEffect, useRef, useState, useCallback } from 'react'
import { Terminal as XTerm } from 'xterm'
import { FitAddon } from 'xterm-addon-fit'
import { Terminal as TermIcon, Plus, X } from 'lucide-react'
import 'xterm/css/xterm.css'

type TermInstance = {
  term: XTerm
  fitAddon: FitAddon
  ws: WebSocket
  resizeObs: ResizeObserver | null
  resizeTimer: ReturnType<typeof setTimeout> | null
}

export const Terminal = () => {
  const [tabs, setTabs] = useState<{ id: string; label: string }[]>([
    { id: 'main-0', label: 'Terminal 1' }
  ])
  const [activeTab, setActiveTab] = useState('main-0')
  const instances = useRef<Map<string, TermInstance>>(new Map())
  const containerRef = useRef<HTMLDivElement>(null)

  const createTerm = useCallback((tabId: string) => {
    const existing = instances.current.get(tabId)
    if (existing) return existing

    const term = new XTerm({
      cursorBlink: true,
      fontSize: 13,
      fontFamily: 'Menlo, Monaco, "Courier New", monospace',
      theme: { background: '#1e1e1e' },
      convertEol: true,
      scrollback: 2000,
    })
    const fitAddon = new FitAddon()
    term.loadAddon(fitAddon)

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const host = window.location.host
    const wsUrl = `${protocol}//${host}/ws/terminal/${tabId}`
    const ws = new WebSocket(wsUrl)

    ws.onopen = () => {
      if (term.element) term.write('\r\n\x1b[32m[Connected]\x1b[0m\r\n')
      ws.send(JSON.stringify({ type: 'resize', cols: term.cols, rows: term.rows }))
    }
    ws.onmessage = (event) => {
      if (term.element) term.write(event.data)
    }
    ws.onclose = () => {
      if (term.element) term.write('\r\n\x1b[31m[Disconnected]\x1b[0m\r\n')
    }

    term.onData((data) => {
      if (ws.readyState === WebSocket.OPEN) ws.send(data)
    })

    let resizeTimer: ReturnType<typeof setTimeout> | null = null
    const resizeObs = new ResizeObserver(() => {
      if (resizeTimer) clearTimeout(resizeTimer)
      resizeTimer = setTimeout(() => {
        try {
          fitAddon.fit()
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'resize', cols: term.cols, rows: term.rows }))
          }
        } catch (e) {}
      }, 100)
    })

    const inst: TermInstance = { term, fitAddon, ws, resizeObs, resizeTimer }
    instances.current.set(tabId, inst)
    return inst
  }, [])

  const attachTerm = useCallback((tabId: string, container: HTMLElement) => {
    const inst = createTerm(tabId)
    inst.term.open(container)
    inst.fitAddon.fit()
    if (inst.resizeTimer) clearTimeout(inst.resizeTimer)
    inst.resizeTimer = setTimeout(() => {
      inst.resizeObs?.observe(container)
    }, 50)
  }, [createTerm])

  const detachTerm = useCallback((tabId: string) => {
    const inst = instances.current.get(tabId)
    if (!inst) return
    if (inst.resizeTimer) clearTimeout(inst.resizeTimer)
    inst.resizeObs?.disconnect()
    inst.ws.close()
    inst.term.dispose()
    instances.current.delete(tabId)
  }, [])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    attachTerm(activeTab, container)
    return () => {
      detachTerm(activeTab)
    }
  }, [activeTab, attachTerm, detachTerm])

  const addTab = () => {
    const id = `main-${Date.now()}`
    const label = `Terminal ${tabs.length + 1}`
    setTabs(prev => [...prev, { id, label }])
    setActiveTab(id)
  }

  const closeTab = (tabId: string) => {
    if (tabs.length === 1) return
    detachTerm(tabId)
    const newTabs = tabs.filter(t => t.id !== tabId)
    setTabs(newTabs)
    if (activeTab === tabId) {
      setActiveTab(newTabs[newTabs.length - 1].id)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TermIcon size={20} className="text-emerald-500" />
          <h2 className="text-lg font-bold text-slate-800">终端</h2>
        </div>
        <button
          onClick={addTab}
          className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-emerald-500 hover:bg-emerald-50 rounded-lg transition-colors"
        >
          <Plus size={14} />
          新建终端
        </button>
      </div>

      <div className="flex flex-col rounded-xl border border-slate-200 overflow-hidden bg-[#1e1e1e]">
        <div className="flex items-center gap-1 px-3 py-2 bg-slate-100 border-b border-slate-200 overflow-x-auto">
          {tabs.map(tab => (
            <div
              key={tab.id}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium cursor-pointer transition-colors shrink-0 ${
                activeTab === tab.id
                  ? 'bg-[#1e1e1e] text-slate-200'
                  : 'text-slate-400 hover:bg-slate-200'
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span>{tab.label}</span>
              {tabs.length > 1 && (
                <button
                  onClick={e => { e.stopPropagation(); closeTab(tab.id) }}
                  className="ml-1 hover:text-red-400 transition-colors"
                >
                  <X size={11} />
                </button>
              )}
            </div>
          ))}
        </div>
        <div
          ref={containerRef}
          className="flex-1 min-h-[400px]"
          style={{ height: 'calc(100vh - 280px)' }}
        />
      </div>
    </div>
  )
}
