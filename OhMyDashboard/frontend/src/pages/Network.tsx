import { useEffect, useState, useRef } from 'react'
import { api } from '../api'
import type { NetworkInfo } from '../types'
import { Globe, RefreshCw } from 'lucide-react'
import { NetworkInterfaces } from '../components/Network/NetworkInterfaces'
import { NetworkTraffic } from '../components/Network/NetworkTraffic'
import { NetworkPorts } from '../components/Network/NetworkPorts'

export const Network = () => {
  const [info, setInfo] = useState<NetworkInfo | null>(null)
  const [speeds, setSpeeds] = useState<Record<string, { up: number; down: number }>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [selectedIface, setSelectedIface] = useState<string>('')
  const prevStatsRef = useRef<Record<string, { sent: number; recv: number; time: number }>>({})

  const fetchNetwork = async () => {
    const data = await api.getNetworkInfo()
    const now = Date.now()

    const newSpeeds: Record<string, { up: number; down: number }> = {}
    for (const [iface, ifaceData] of Object.entries(data.interfaces)) {
      const prev = prevStatsRef.current[iface]
      if (prev) {
        const elapsed = (now - prev.time) / 1000
        if (elapsed > 0) {
          newSpeeds[iface] = {
            down: Math.max(0, (ifaceData.bytes_recv - prev.recv) / elapsed),
            up: Math.max(0, (ifaceData.bytes_sent - prev.sent) / elapsed),
          }
        }
      }
      prevStatsRef.current[iface] = { sent: ifaceData.bytes_sent, recv: ifaceData.bytes_recv, time: now }
    }
    setSpeeds(newSpeeds)
    setInfo(data)
    setIsLoading(false)
  }

  useEffect(() => {
    fetchNetwork()
    const timer = setInterval(fetchNetwork, 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (!info || selectedIface) return
    const ifaces = Object.keys(info.interfaces)
    if (ifaces.length > 0) {
      setSelectedIface(ifaces[0])
    }
  }, [info])

  if (isLoading || !info) {
    return <div className="py-12 text-center text-slate-400">加载中...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Globe size={20} className="text-cyan-500" />
          <h2 className="text-lg font-bold text-slate-800">网络监控</h2>
        </div>
        <button onClick={fetchNetwork} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600" title="刷新">
          <RefreshCw size={16} />
        </button>
      </div>

      <NetworkInterfaces
        info={info}
        selectedIface={selectedIface}
        speeds={speeds}
        onSelectIface={setSelectedIface}
      />

      <NetworkTraffic
        speeds={speeds}
        selectedIface={selectedIface}
      />

      <NetworkPorts info={info} />
    </div>
  )
}
