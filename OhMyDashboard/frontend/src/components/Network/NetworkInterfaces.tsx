import { ArrowDown, ArrowUp, Activity, Server, Wifi } from 'lucide-react'
import type { NetworkInfo } from '../../types'
import { fmt, fmtS } from './utils'

interface Props {
  info: NetworkInfo
  selectedIface: string
  speeds: Record<string, { up: number; down: number }>
  onSelectIface: (name: string) => void
}

export const NetworkInterfaces = ({ info, selectedIface, speeds, onSelectIface }: Props) => {
  const activeIfaces = Object.entries(info.interfaces).filter(([, v]) => v.is_up)
  const ifaceData = selectedIface ? info.interfaces[selectedIface] : null

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-100">
          <div className="flex items-center gap-2 mb-2">
            <ArrowDown size={14} className="text-emerald-500" />
            <span className="text-xs text-slate-400">总接收</span>
          </div>
          <p className="text-lg font-bold text-slate-800">{fmt(info.total.bytes_recv)}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-100">
          <div className="flex items-center gap-2 mb-2">
            <ArrowUp size={14} className="text-blue-500" />
            <span className="text-xs text-slate-400">总发送</span>
          </div>
          <p className="text-lg font-bold text-slate-800">{fmt(info.total.bytes_sent)}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-100">
          <div className="flex items-center gap-2 mb-2">
            <Activity size={14} className="text-orange-500" />
            <span className="text-xs text-slate-400">TCP 连接</span>
          </div>
          <p className="text-lg font-bold text-slate-800">{info.connections.tcp}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-100">
          <div className="flex items-center gap-2 mb-2">
            <Server size={14} className="text-purple-500" />
            <span className="text-xs text-slate-400">UDP 连接</span>
          </div>
          <p className="text-lg font-bold text-slate-800">{info.connections.udp}</p>
        </div>
      </div>

      <div className="bg-slate-50 rounded-lg p-1 flex gap-1 w-fit overflow-x-auto">
        {activeIfaces.map(([name]) => (
          <button
            key={name}
            onClick={() => onSelectIface(name)}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors flex items-center gap-2 whitespace-nowrap ${
              selectedIface === name ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <div className={`w-2 h-2 rounded-full ${info.interfaces[name]?.is_up ? 'bg-emerald-400' : 'bg-red-400'}`} />
            {name}
          </button>
        ))}
      </div>

      {ifaceData && (
        <div className="bg-white rounded-xl border border-slate-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-cyan-50 flex items-center justify-center text-cyan-500">
                <Wifi size={18} />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 font-mono">{selectedIface}</h3>
                <p className="text-xs text-slate-400">
                  {ifaceData.address.length > 0 ? ifaceData.address.join(', ') : '无 IP'}
                  {ifaceData.mac.length > 0 && ` · ${ifaceData.mac[0]}`}
                </p>
              </div>
            </div>
            {speeds[selectedIface] && (
              <div className="flex items-center gap-4 text-xs">
                <div className="text-right">
                  <p className="text-emerald-500 font-bold">{fmtS(speeds[selectedIface].down)}</p>
                  <p className="text-slate-400">下载</p>
                </div>
                <div className="text-right">
                  <p className="text-blue-500 font-bold">{fmtS(speeds[selectedIface].up)}</p>
                  <p className="text-slate-400">上传</p>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              ['接收流量', fmt(ifaceData.bytes_recv)],
              ['发送流量', fmt(ifaceData.bytes_sent)],
              ['MTU', `${ifaceData.mtu} bytes`],
              ['状态', ifaceData.is_up ? '已连接' : '未连接'],
              ['接收包', ifaceData.packets_recv.toLocaleString()],
              ['发送包', ifaceData.packets_sent.toLocaleString()],
              ['接收错误', ifaceData.errin],
              ['发送错误', ifaceData.errout],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between text-sm px-3 py-2 rounded-lg bg-slate-50">
                <span className="text-slate-400">{label}</span>
                <span className="font-medium text-slate-600">{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
