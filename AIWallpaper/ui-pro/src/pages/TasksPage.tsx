import React from 'react';

interface TasksPageProps {
  autoRefreshHours: number;
  setAutoRefreshHours: (v: number) => void;
  autoPrompt: string;
  setAutoPrompt: (v: string) => void;
  handleSaveKey: () => void;
}

const TasksPage: React.FC<TasksPageProps> = ({
  autoRefreshHours, setAutoRefreshHours,
  autoPrompt, setAutoPrompt,
  handleSaveKey
}) => {
  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700 max-w-3xl mx-auto py-10">
      <div className="text-center space-y-4 mb-16">
        <div className="inline-flex p-4 bg-blue-50 rounded-3xl text-blue-600 mb-4 animate-bounce">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56" /><path d="M22 10 16 12l3 5 3-7Z" /></svg>
        </div>
        <h2 className="text-4xl font-black text-slate-900 tracking-tight">智能自动化</h2>
        <p className="text-slate-400 font-medium">让灵感在屏幕上跳动，无需亲自动手</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-[3rem] p-10 shadow-2xl space-y-10 relative overflow-hidden group">
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-50/50 rounded-full blur-3xl group-hover:bg-blue-100/50 transition-colors duration-1000"></div>

        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-5">
            <div className="p-4 bg-slate-900 rounded-[1.5rem] text-white shadow-xl">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">自动刷新壁纸</h3>
              <p className="text-sm text-slate-400 font-medium">开启后系统将定期为您生成并更换新壁纸</p>
            </div>
          </div>
          <button
            onClick={() => setAutoRefreshHours(autoRefreshHours > 0 ? 0 : 4)}
            className={`w-14 h-8 rounded-full transition-all duration-500 relative ${autoRefreshHours > 0 ? 'bg-blue-600 shadow-lg shadow-blue-200' : 'bg-slate-200'}`}
          >
            <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all duration-500 shadow-sm ${autoRefreshHours > 0 ? 'left-7' : 'left-1'}`}></div>
          </button>
        </div>

        {autoRefreshHours > 0 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-500 relative z-10 bg-slate-50/50 p-8 rounded-[2rem] border border-slate-100">
            <div className="space-y-4">
              <label className="text-xs font-black text-slate-400 px-1 uppercase flex justify-between tracking-widest">
                <span>刷新间隔时间</span>
                <span className="text-blue-600 bg-blue-50 px-3 py-1 rounded-full">{autoRefreshHours} 小时</span>
              </label>
              <input
                type="range" min="1" max="72" step="1"
                value={autoRefreshHours}
                onChange={(e) => setAutoRefreshHours(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-bold px-1">
                <span>1小时</span>
                <span>3天</span>
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-xs font-black text-slate-400 px-1 uppercase flex justify-between tracking-widest">
                <span>自动化提示词</span>
                <span className="text-slate-300">留空则随机</span>
              </label>
              <textarea
                value={autoPrompt}
                onChange={(e) => setAutoPrompt(e.target.value)}
                placeholder="为自动化生成设定一个主题，例如：Cyberpunk city, neon lights..."
                className="w-full bg-white border border-slate-200 rounded-2xl p-5 text-sm min-h-[120px] focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 outline-none transition-all resize-none shadow-sm placeholder:text-slate-300 text-slate-600 italic"
              />
            </div>
          </div>
        )}

        <button
          onClick={handleSaveKey}
          className="w-full bg-slate-900 hover:bg-black text-white py-5 rounded-2xl font-black text-lg transition-all shadow-2xl shadow-slate-200 active:scale-[0.98] relative z-10"
        >
          保存自动化任务
        </button>
      </div>

      <p className="text-center text-[11px] text-slate-300 font-medium">提示：自动化任务将在后台运行，即使关闭主界面（不退出程序）也会生效</p>
    </div>
  );
};

export default TasksPage;
