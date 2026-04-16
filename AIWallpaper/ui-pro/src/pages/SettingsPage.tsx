import React from 'react';

interface SettingsPageProps {
  apiKey: string;
  setApiKey: (v: string) => void;
  enableCache: boolean;
  setEnableCache: (v: boolean) => void;
  cacheLimit: number;
  setCacheLimit: (v: number) => void;
  handleSaveKey: () => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({
  apiKey, setApiKey,
  enableCache, setEnableCache,
  cacheLimit, setCacheLimit,
  handleSaveKey
}) => {
  return (
    <div className="max-w-xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
      {/* API 配置 */}
      <div>
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">AI Studio API Token</h3>
        <div className="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-lg space-y-4">
          <div className="flex items-start gap-3 pb-2">
            <div className="p-2 bg-slate-100 rounded-xl text-slate-600">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-700 font-[system-ui]">API Studio 身份凭证</p>
              <a href="https://aistudio.baidu.com/account/accessToken" target="_blank" rel="noreferrer" className="text-[10px] text-blue-500 hover:text-blue-700 flex items-center gap-1 mt-0.5 transition">
                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" x2="21" y1="14" y2="3" /></svg>
                前往 aistudio.baidu.com 获取 Token
              </a>
            </div>
          </div>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="粘贴您的 API Key..."
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 outline-none transition-all"
          />
          <p className="text-[10px] text-slate-400 px-1 font-medium italic">您的 Token 将安全地存储在本地配置文件中，仅用于壁纸生成请求。</p>
        </div>
      </div>

      {/* 本地缓存管理 */}
      <div>
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">本地缓存管理</h3>
        <div className="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-lg space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-100 rounded-xl text-slate-600">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v3" /><path d="m21 12-1 8H4l-1-8h18Z" /><path d="M10 12V8" /><path d="M14 12V8" /></svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-700">启用本地缓存</p>
                <p className="text-[10px] text-slate-400">保存生成历史以供画廊预览</p>
              </div>
            </div>
            <button
              onClick={() => setEnableCache(!enableCache)}
              className={`w-12 h-6 rounded-full transition-colors relative ${enableCache ? 'bg-blue-600' : 'bg-slate-200'}`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${enableCache ? 'left-7' : 'left-1'}`}></div>
            </button>
          </div>
          {enableCache && (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
              <label className="text-[11px] font-bold text-slate-400 px-1 uppercase flex justify-between">
                <span>最大缓存数量</span>
                <span className="text-blue-600">{cacheLimit} 张</span>
              </label>
              <input
                type="range" min="10" max="500" step="10"
                value={cacheLimit}
                onChange={(e) => setCacheLimit(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>
          )}
          <button onClick={handleSaveKey} className="w-full bg-slate-900 hover:bg-black text-white py-4 rounded-2xl font-bold text-sm transition-all shadow-xl shadow-slate-100 active:scale-[0.98]">应用并保存设置</button>
        </div>
      </div>

      {/* 系统信息 */}
      <div>
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">系统信息</h3>
        <div className="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-lg space-y-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-100 rounded-xl text-slate-600">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="3" rx="2" /><line x1="8" x2="16" y1="21" y2="21" /><line x1="12" x2="12" y1="17" y2="21" /></svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-700">AIWallpaper Pro v1.1.0</p>
              <p className="text-[10px] text-slate-400 uppercase">STABLE</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
