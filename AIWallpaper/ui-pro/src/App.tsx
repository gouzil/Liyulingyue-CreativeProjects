import React, { useState, useEffect } from "react";
import "./index.css";

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState("create");
  const [prompt, setPrompt] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [enableCache, setEnableCache] = useState(false);
  const [cacheLimit, setCacheLimit] = useState(100);
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState("");

  const sendIpc = (type: string, value: any = "") => {
    // @ts-ignore
    if (window.ipc) {
      // @ts-ignore
      window.ipc.postMessage(JSON.stringify({ type, value }));
    }
  };

  useEffect(() => {
    // @ts-ignore
    window.onGenerationComplete = (success: boolean, error: string, data: any) => {
      setIsGenerating(false);
      if (success && data) {
        // data URL 不能追加查询参数，普通 URL 才需要时间戳来防缓存
        const url = data.previewUrl as string;
        setPreviewUrl(url.startsWith("data:") ? url : url + "?t=" + Date.now());
        setStatusMsg("生成成功！壁纸已更新");
      } else {
        setStatusMsg("发生错误: " + error);
      }
    };
    // @ts-ignore
    window.onImageSaved = (path: string) => {
      setStatusMsg("图片已保存至: " + path);
    };
    // @ts-ignore
    window.onConfigLoaded = (config: any) => {
      if (config.api_key) setApiKey(config.api_key);
      if (config.enable_cache !== undefined) setEnableCache(config.enable_cache);
      if (config.cache_limit !== undefined) setCacheLimit(config.cache_limit);
    };
    return () => {
      // @ts-ignore
      delete window.onGenerationComplete;
      // @ts-ignore
      delete window.onImageSaved;
      // @ts-ignore
      delete window.onConfigLoaded;
    };
  }, []);

  const handleGenerate = () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setStatusMsg("正在构思画面...");
    sendIpc("generate", prompt);
  };

  const handleSaveKey = () => {
    if (!apiKey.trim()) return;
    sendIpc("save_key", apiKey);
    setStatusMsg("API Token 已同步核心系统");
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-blue-500/20 overflow-hidden">
      <header className="flex items-center justify-between px-6 py-4 bg-white/70 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-50">
        <div className="flex items-center gap-3 group cursor-pointer" onClick={() => sendIpc("switch_mode", "lite")}>
          <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform duration-300">
             <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-900">AIWallpaper <span className="text-blue-600 text-[10px] font-bold ml-1 px-1.5 py-0.5 rounded bg-blue-50 border border-blue-100 uppercase align-middle">PRO</span></span>
        </div>
        <nav className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl border border-slate-200 shadow-inner">
          {[{ id: "create", label: "创作" }, { id: "gallery", label: "画廊" }, { id: "tasks", label: "自动化" }, { id: "settings", label: "设置" }].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${activeTab === tab.id ? "bg-white text-blue-600 shadow-sm border border-slate-200" : "text-slate-500 hover:text-slate-800 hover:bg-white/50"}`}>{tab.label}</button>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <button onClick={() => sendIpc("minimize")} className="p-2.5 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-600 transition-all active:scale-90"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/></svg></button>
          <button onClick={() => sendIpc("close")} className="p-2.5 hover:bg-red-50 hover:text-red-500 rounded-xl text-slate-400 transition-all active:scale-90"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></button>
        </div>
      </header>
      <main className="flex-1 p-10 max-w-6xl mx-auto w-full overflow-y-auto custom-scrollbar">
        {activeTab === "create" && (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
            <div className="bg-white border border-slate-200 rounded-[2.5rem] p-10 shadow-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-1000"><svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500"><path d="M12 3v19"/><path d="M5 8h14"/><path d="M15 21a3 3 0 0 0-3-3 3 3 0 0 0-3 3"/><path d="M19 12a3 3 0 0 0-3-3 3 3 0 0 0-3 3"/></svg></div>
              <h2 className="text-3xl font-bold mb-8 flex items-center gap-3 text-slate-900"><span className="w-1.5 h-8 bg-blue-600 rounded-full"></span>开启创作灵感</h2>
              <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="描述你想要的画面..." className="w-full bg-slate-50 border border-slate-200 rounded-3xl p-6 text-xl min-h-[180px] focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 outline-none transition-all resize-none shadow-inner placeholder:text-slate-300 leading-relaxed text-slate-700" />
              <div className="mt-10 flex items-center justify-between">
                <button className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 text-sm font-semibold transition-all active:scale-95 text-slate-600"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>画质修正</button>
                <div className="flex items-center gap-6">
                  {statusMsg && <span className="text-sm font-medium text-blue-600 animate-pulse">{statusMsg}</span>}
                  <button onClick={handleGenerate} disabled={isGenerating || !prompt.trim()} className={`bg-slate-900 hover:bg-black text-white px-12 py-4 rounded-[1.25rem] font-black text-xl shadow-2xl shadow-slate-200 active:scale-95 transition-all flex items-center gap-3 ${isGenerating ? "opacity-50 cursor-not-allowed" : ""}`}>{isGenerating ? "正在生成..." : "开始生成"}<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg></button>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-10">
               <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-lg">
                <div className="flex items-center justify-between mb-6"><h3 className="text-slate-400 text-xs font-black uppercase tracking-[0.2em]">当前壁纸预览</h3><div className={`w-2.5 h-2.5 rounded-full ${isGenerating ? "bg-blue-500 animate-pulse" : "bg-green-500"}`}></div></div>
                <div className="aspect-video bg-slate-100 rounded-3xl overflow-hidden border border-slate-200 group relative shadow-inner flex items-center justify-center">
                  {previewUrl ? <img src={previewUrl} className="w-full h-full object-cover" /> : <div className="text-slate-300 text-sm italic">等待生成...</div>}
                  {previewUrl && <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 border-2 border-transparent group-hover:border-blue-500/50 rounded-3xl"><button onClick={() => sendIpc("save_image")} className="p-3 bg-white rounded-2xl text-slate-900 shadow-xl hover:scale-110 transition-transform"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg></button></div>}
                </div>
              </div>
               <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-lg">
                <div className="flex items-center justify-between mb-6"><h3 className="text-slate-400 text-xs font-black uppercase tracking-[0.2em]">自动化任务</h3><button onClick={() => setActiveTab("tasks")} className="text-blue-600 text-[10px] font-bold hover:underline">管理全部</button></div>
                <div className="space-y-4"><div className="flex items-center justify-between p-5 rounded-2xl bg-blue-50 border border-blue-100 border-l-4 border-l-blue-600"><div className="flex items-center gap-4"><div className="p-2 bg-white rounded-lg text-blue-600 shadow-sm"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></div><div><div className="text-sm font-bold text-slate-800">每日自动更新</div><div className="text-[10px] text-slate-500">下次运行: 明日 08:00</div></div></div><div className="h-1.5 w-12 bg-blue-200 rounded-full overflow-hidden"><div className="h-full bg-blue-600 w-[65%]"></div></div></div></div>
              </div>
            </div>
          </div>
        )}
        {activeTab === "settings" && (
          <div className="max-w-xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
            {/* API 配置 */}
            <div>
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">AI Studio API Token</h3>
              <div className="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-lg space-y-4">
                <div className="flex items-start gap-3 pb-2">
                  <div className="p-2 bg-slate-100 rounded-xl text-slate-600">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-700">AI Studio API Token</p>
                    <a href="https://aistudio.baidu.com/account/accessToken" target="_blank" className="text-[10px] text-blue-500 hover:text-blue-700 flex items-center gap-1 mt-0.5 transition">
                      <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" x2="21" y1="14" y2="3"/></svg>
                      前往 aistudio.baidu.com 获取 Token
                    </a>
                  </div>
                </div>
                <div className="space-y-3">
                  <input type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="输入您的 API Token" className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 outline-none transition-all shadow-inner" />
                </div>
              </div>
            </div>
            {/* 缓存设置 */}
            <div>
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">本地缓存管理</h3>
              <div className="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-lg space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-100 rounded-xl text-slate-600">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v3"/><path d="m21 12-1 8H4l-1-8h18Z"/><path d="M10 12V8"/><path d="M14 12V8"/></svg>
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
                <button onClick={handleSaveKey} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-bold text-sm transition-all shadow-lg shadow-blue-100 active:scale-[0.98]">保存配置</button>
              </div>
            </div>
            {/* 系统信息 */}
            <div>
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">系统信息</h3>
              <div className="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-lg space-y-5">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-100 rounded-xl text-slate-600">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" x2="16" y1="21" y2="21"/><line x1="12" x2="12" y1="17" y2="21"/></svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-700">AIWallpaper Pro v1.1.0</p>
                    <p className="text-[10px] text-slate-400 uppercase">STABLE</p>
                  </div>
                </div>
                <div className="bg-slate-50 rounded-2xl p-5 text-[11px] text-slate-500 leading-relaxed border border-slate-200 shadow-inner">
                  <p className="mb-2 uppercase font-bold text-[9px] text-slate-400">核心架构</p>
                  1. 基于 Rust 高性能异步后端<br/>
                  2. Win32 消息钩子 (0x052C) 桌面注入<br/>
                  3. WebView2 GPU 加速渲染层 (Win11 24H2 优化版本)
                </div>
                <div className="flex items-center gap-3 pt-1">
                  <div className="p-2 bg-slate-100 rounded-xl text-slate-600">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12.01" y1="8" y2="8"/><line x1="12" x2="12" y1="12" y2="16"/></svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-700">开源与开发者</p>
                    <a href="https://github.com/Liyulingyue/" target="_blank" className="text-[10px] text-slate-400 hover:text-blue-500 flex items-center gap-1 mt-0.5 transition">
                      <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>
                      GitHub: @Liyulingyue
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
      <footer className="px-8 py-4 border-t border-slate-100 bg-white/50 text-[10px] text-slate-400 flex justify-between items-center italic"><div>Ready to imagine something new?</div><div className="flex gap-4"><span>Engine: Gemini 3 Flash</span><span>Status: Connected</span></div></footer>
    </div>
  );
};

export default App;
