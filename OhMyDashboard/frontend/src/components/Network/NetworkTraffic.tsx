import { useEffect, useRef, useState } from 'react'
import { ArrowDown, ArrowUp } from 'lucide-react'

import { fmtS } from './utils'

interface Props {
  selectedIface: string
  speeds: Record<string, { up: number; down: number }>
}

export const NetworkTraffic = ({ selectedIface, speeds }: Props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [history, setHistory] = useState<{ up: number; down: number }[]>([])

  useEffect(() => {
    setHistory([])
  }, [selectedIface])

  useEffect(() => {
    if (!selectedIface || !speeds[selectedIface]) return
    setHistory(prev => [...prev, speeds[selectedIface]].slice(-60))
  }, [speeds, selectedIface])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.width = canvas.offsetWidth * 2
    canvas.height = 100 * 2
    const ctx = canvas.getContext('2d')
    if (ctx) ctx.scale(2, 2)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || history.length < 2) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const w = canvas.width
    const h = canvas.height
    ctx.clearRect(0, 0, w, h)

    const maxVal = Math.max(...history.map(h => Math.max(h.up, h.down)), 1024)

    const drawLine = (data: number[], color: string) => {
      ctx.beginPath()
      ctx.strokeStyle = color
      ctx.lineWidth = 2
      ctx.lineJoin = 'round'
      ctx.lineCap = 'round'
      data.forEach((v, i) => {
        const x = (i / (history.length - 1)) * w
        const y = h - (v / maxVal) * (h - 8)
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      })
      ctx.stroke()
    }

    drawLine(history.map(h => h.down), '#10b981')
    drawLine(history.map(h => h.up), '#3b82f6')
  }, [history])

  return (
    <div className="space-y-4">
      {selectedIface && speeds[selectedIface] && (
        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 rounded-xl bg-emerald-50 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <ArrowDown size={16} className="text-emerald-500" />
              <span className="text-sm font-medium text-emerald-600">下载</span>
            </div>
            <p className="text-2xl font-black text-emerald-700">{fmtS(speeds[selectedIface].down)}</p>
          </div>
          <div className="p-4 rounded-xl bg-blue-50 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <ArrowUp size={16} className="text-blue-500" />
              <span className="text-sm font-medium text-blue-600">上传</span>
            </div>
            <p className="text-2xl font-black text-blue-700">{fmtS(speeds[selectedIface].up)}</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-100 p-4">
        <div className="flex items-center gap-4 mb-3 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-0.5 bg-emerald-500" />
            <span className="text-slate-400">下载</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-0.5 bg-blue-500" />
            <span className="text-slate-400">上传</span>
          </div>
          <span className="text-slate-400 ml-auto">近 60 秒</span>
        </div>
        <canvas
          ref={canvasRef}
          className="w-full h-[100px]"
          style={{ imageRendering: 'crisp-edges' }}
        />
      </div>

    </div>
  )
}
