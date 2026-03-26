import React, { useEffect, useState } from 'react';
import { api } from '../api';
import type { SystemInfo } from '../types.ts';
import { Cpu, Database, HardDrive, Activity, RotateCcw, PowerOff } from 'lucide-react';

export const SystemMonitor: React.FC = () => {
    const [info, setInfo] = useState<SystemInfo | null>(null);
    const [powerAction, setPowerAction] = useState<'shutdown' | 'restart' | null>(null);
    const [powerLoading, setPowerLoading] = useState(false);
    const [password, setPassword] = useState('');
    const [authError, setAuthError] = useState('');

    const handlePower = async () => {
        if (!powerAction) return
        setPowerLoading(true)
        setAuthError('')
        const res = await api.systemPower(powerAction, password)
        if (res.status !== 'ok') {
            setAuthError(res.message || '操作失败')
            setPowerLoading(false)
            return
        }
        setPassword('')
        setPowerLoading(false)
        setPowerAction(null)
    }

    useEffect(() => {
        const fetchInfo = async () => {
            try {
                const data = await api.getSystemInfo();
                setInfo(data);
            } catch (error) {
                console.error('Failed to fetch system info:', error);
            }
        };
        fetchInfo();
        const timer = setInterval(fetchInfo, 3000);
        return () => clearInterval(timer);
    }, []);

    if (!info) return (
        <div className="flex items-center justify-center p-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
    );

    const gb = (bytes: number) => (bytes / (1024 ** 3)).toFixed(1);

    const StatCard = ({ title, value, detail, percent, icon: Icon, colorClass }: any) => (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
                <div className="flex flex-col">
                  <h3 className="text-slate-500 text-sm font-medium mb-1">{title}</h3>
                  <span className="text-2xl font-bold text-slate-800">{value}</span>
                </div>
                <div className={`p-2.5 rounded-xl ${colorClass.bg}`}>
                    <Icon size={20} className={colorClass.text} />
                </div>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-3">
                <div 
                    className={`h-full transition-all duration-700 ease-out ${colorClass.bar}`}
                    style={{ width: `${percent}%` }}
                />
            </div>
            <div className="flex justify-between items-center text-[10px] text-slate-400 font-medium tracking-tight">
               <span>详情</span>
               <span className="font-mono uppercase">{detail}</span>
            </div>
        </div>
    );

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                    <Activity size={18} className="text-indigo-600" />
                    <h2 className="text-base font-bold text-slate-700 uppercase tracking-wider">实时资源监控</h2>
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => setPowerAction('restart')}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-colors"
                    >
                        <RotateCcw size={13} />
                        重启
                    </button>
                    <button
                        onClick={() => setPowerAction('shutdown')}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                        <PowerOff size={13} />
                        关机
                    </button>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard 
                    title="CPU 使用率"
                    value={`${info.cpu_percent}%`}
                    detail={`${info.os} ${info.os_release}`}
                    percent={info.cpu_percent}
                    icon={Cpu}
                    colorClass={{ bg: 'bg-blue-50', text: 'text-blue-600', bar: 'bg-blue-600' }}
                />
                <StatCard 
                    title="内存使用"
                    value={`${info.memory.percent}%`}
                    detail={`${gb(info.memory.used)}G / ${gb(info.memory.total)}G`}
                    percent={info.memory.percent}
                    icon={Database}
                    colorClass={{ bg: 'bg-emerald-50', text: 'text-emerald-600', bar: 'bg-emerald-600' }}
                />
                <StatCard 
                    title="磁盘空间"
                    value={`${info.disk.percent}%`}
                    detail={`${gb(info.disk.used)}G / ${gb(info.disk.total)}G`}
                    percent={info.disk.percent}
                    icon={HardDrive}
                    colorClass={{ bg: 'bg-amber-50', text: 'text-amber-600', bar: 'bg-amber-600' }}
                />
            </div>

            {powerAction && (
                <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-6 w-80 shadow-xl">
                        <h3 className="font-bold text-slate-800 text-center mb-1">
                            确认{powerAction === 'shutdown' ? '关机' : '重启'}？
                        </h3>
                        <p className="text-sm text-slate-400 text-center mb-4">
                            {powerAction === 'shutdown' ? '系统将立即关机，请保存好数据。' : '系统将立即重启。'}
                        </p>
                        <p className="text-xs text-slate-400 text-center mb-3">需要 sudo 权限，请输入当前用户密码</p>
                        <input
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handlePower()}
                            placeholder="输入 sudo 密码"
                            className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
                            autoFocus
                        />
                        {authError && <p className="text-xs text-red-500 text-center mb-3">{authError}</p>}
                        <div className="flex gap-3">
                            <button
                                onClick={() => { setPowerAction(null); setPassword(''); setAuthError('') }}
                                className="flex-1 py-2.5 text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                            >
                                取消
                            </button>
                            <button
                                onClick={handlePower}
                                disabled={powerLoading || !password}
                                className={`flex-1 py-2.5 text-sm text-white rounded-xl transition-colors disabled:opacity-50 ${
                                    powerAction === 'shutdown' ? 'bg-red-400 hover:bg-red-500' : 'bg-orange-400 hover:bg-orange-500'
                                }`}
                            >
                                {powerLoading ? '处理中...' : '确认'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
