import { Radio, Link } from 'lucide-react'
import type { NetworkInfo } from '../../types'

interface Props {
  info: NetworkInfo
}

export const NetworkPorts = ({ info }: Props) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-cyan-50 flex items-center justify-center text-cyan-500">
            <Radio size={18} />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-800">{info.listening_ports.length}</p>
            <p className="text-xs text-slate-400">监听端口</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center text-orange-500">
            <Link size={18} />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-800">{info.active_connections.length}</p>
            <p className="text-xs text-slate-400">活跃连接</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100">
          <h3 className="font-bold text-slate-800 text-sm">监听端口</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-slate-50 text-slate-400 text-xs uppercase tracking-wider font-semibold">
                <th className="py-3 pl-5 text-left">协议</th>
                <th className="py-3 text-left">端口</th>
                <th className="py-3 text-left">地址</th>
                <th className="py-3 text-left">进程</th>
                <th className="py-3 text-left">PID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {info.listening_ports.sort((a, b) => a.port - b.port).map((p, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3 pl-5">
                    <span className={`text-xs px-2 py-0.5 rounded font-bold ${
                      p.protocol === 'TCP' ? 'bg-emerald-50 text-emerald-600' : 'bg-purple-50 text-purple-600'
                    }`}>
                      {p.protocol}
                    </span>
                  </td>
                  <td className="py-3">
                    <span className="text-sm font-mono font-bold text-slate-700">{p.port}</span>
                  </td>
                  <td className="py-3">
                    <span className="text-xs text-slate-400 font-mono">{p.address}</span>
                  </td>
                  <td className="py-3">
                    <span className="text-xs text-slate-600">{p.process || '-'}</span>
                  </td>
                  <td className="py-3">
                    <span className="text-xs text-slate-400 font-mono">{p.pid || '-'}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-2 border-t border-slate-50 text-xs text-slate-400">
          共 {info.listening_ports.length} 个监听端口
        </div>
      </div>

      {info.active_connections.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-800 text-sm">活跃连接</h3>
          </div>
          <div className="overflow-x-auto max-h-96">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-slate-50 text-slate-400 text-xs uppercase tracking-wider font-semibold">
                  <th className="py-3 pl-5 text-left">协议</th>
                  <th className="py-3 text-left">本地地址</th>
                  <th className="py-3 text-left">远程地址</th>
                  <th className="py-3 text-left">状态</th>
                  <th className="py-3 text-left">PID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {info.active_connections.slice(0, 200).map((c, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-2 pl-5">
                      <span className={`text-xs px-2 py-0.5 rounded font-bold ${
                        c.protocol === 'TCP' ? 'bg-emerald-50 text-emerald-600' : 'bg-purple-50 text-purple-600'
                      }`}>
                        {c.protocol}
                      </span>
                    </td>
                    <td className="py-2">
                      <span className="text-xs font-mono text-slate-600">{c.laddr}</span>
                    </td>
                    <td className="py-2">
                      <span className="text-xs font-mono text-slate-400">{c.raddr}</span>
                    </td>
                    <td className="py-2">
                      <span className="text-xs text-slate-400">{c.status}</span>
                    </td>
                    <td className="py-2">
                      <span className="text-xs text-slate-400 font-mono">{c.pid || '-'}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-5 py-2 border-t border-slate-50 text-xs text-slate-400">
            共 {info.active_connections.length} 个活跃连接（显示前 200 条）
          </div>
        </div>
      )}
    </div>
  )
}
