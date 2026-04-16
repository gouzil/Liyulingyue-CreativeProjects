import { useState, useEffect, useCallback } from "react";
import Header from "./components/Header";
import CreatePage from "./pages/CreatePage";
import GalleryPage from "./pages/GalleryPage";
import TasksPage from "./pages/TasksPage";
import SettingsPage from "./pages/SettingsPage";

const prompts = [
  "Cyberpunk city at night, neon lights, rain on pavement, cinematic lighting, 8k resolution",
  "Zen garden with cherry blossoms, soft morning sunlight, peaceful atmosphere, high detail",
  "Astronaut floating in deep space, colorful nebula in background, hyper-realistic, 4k",
  "Minimalist mountain landscape, sunset, smooth gradients, vector art style",
  "Underwater kingdom, glowing jellyfish, coral reefs, ethereal blue light, fantasy style",
  "Steampunk airship flying through golden clouds at sunset, highly detailed",
  "Ancient forest with glowing mushrooms, magical fireflies, mystery atmosphere",
  "Futuristic interior design, sleek white furniture, large windows looking into a green garden"
];

function App() {
  const [activeTab, setActiveTab] = useState("create");
  const [prompt, setPrompt] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [enableCache, setEnableCache] = useState(true);
  const [cacheLimit, setCacheLimit] = useState(50);
  const [autoRefreshHours, setAutoRefreshHours] = useState(0);
  const [autoPrompt, setAutoPrompt] = useState("");
  const [galleryImages, setGalleryImages] = useState<string[]>([]);

  const sendIpc = useCallback((cmd: string, arg?: any) => {
    (window as any).ipc?.postMessage(JSON.stringify({ cmd, arg }));
  }, []);

  useEffect(() => {
    sendIpc("get_config");
    // @ts-ignore
    window.onConfigLoaded = (config: any) => {
      if (config.api_key) setApiKey(config.api_key);
      setEnableCache(config.enable_cache);
      setCacheLimit(config.cache_limit);
      setAutoRefreshHours(config.auto_refresh_hours);
      setAutoPrompt(config.auto_prompt || "");
    };

    // @ts-ignore
    window.onGenerationComplete = (base64Img: string) => {
      setIsGenerating(false);
      setStatusMsg("生成成功！");
      setPreviewUrl(base64Img);
      setTimeout(() => setStatusMsg(""), 3000);
    };

    // @ts-ignore
    window.onGalleryLoaded = (images: string[]) => {
      setGalleryImages(images);
    };

    return () => {
      // @ts-ignore
      delete window.onConfigLoaded;
      // @ts-ignore
      delete window.onGenerationComplete;
      // @ts-ignore
      delete window.onGalleryLoaded;
    };
  }, [sendIpc]);

  useEffect(() => {
    if (activeTab === "gallery") {
      sendIpc("get_gallery");
    }
  }, [activeTab, sendIpc]);

  const handleGenerate = () => {
    if (!prompt.trim() || isGenerating) return;
    setIsGenerating(true);
    setStatusMsg("正在构思画面...");
    sendIpc("generate", prompt);
  };

  const handleRandomPrompt = () => {
    const random = prompts[Math.floor(Math.random() * prompts.length)];
    setPrompt(random);
  };

  const handleSaveKey = () => {
    sendIpc("save_config", {
      api_key: apiKey,
      enable_cache: enableCache,
      cache_limit: cacheLimit,
      auto_refresh_hours: autoRefreshHours,
      auto_prompt: autoPrompt
    });
    setStatusMsg("配置已同步");
    setTimeout(() => setStatusMsg(""), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-[Inter,system-ui,sans-serif] text-slate-900 selection:bg-blue-100 selection:text-blue-700">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} sendIpc={sendIpc} />

      <main className="flex-1 p-10 max-w-6xl mx-auto w-full overflow-y-auto custom-scrollbar">
        {activeTab === "create" && (
          <CreatePage
            prompt={prompt}
            setPrompt={setPrompt}
            handleRandomPrompt={handleRandomPrompt}
            handleGenerate={handleGenerate}
            isGenerating={isGenerating}
            statusMsg={statusMsg}
            previewUrl={previewUrl}
            sendIpc={sendIpc}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === "gallery" && (
          <GalleryPage galleryImages={galleryImages} />
        )}

        {activeTab === "tasks" && (
          <TasksPage
            autoRefreshHours={autoRefreshHours}
            setAutoRefreshHours={setAutoRefreshHours}
            autoPrompt={autoPrompt}
            setAutoPrompt={setAutoPrompt}
            handleSaveKey={handleSaveKey}
          />
        )}

        {activeTab === "settings" && (
          <SettingsPage
            apiKey={apiKey}
            setApiKey={setApiKey}
            enableCache={enableCache}
            setEnableCache={setEnableCache}
            cacheLimit={cacheLimit}
            setCacheLimit={setCacheLimit}
            handleSaveKey={handleSaveKey}
          />
        )}
      </main>

      <footer className="px-10 py-6 border-t border-slate-100 text-[10px] text-slate-400 font-bold uppercase tracking-widest flex justify-between items-center">
        <div className="flex gap-6">
          <span>Engine: Tao/Wry</span>
          <span>UI: Tailwind 4 / React</span>
        </div>
        <div className="flex items-center gap-1.5 bg-blue-50 text-blue-600 px-3 py-1 rounded-full border border-blue-100">
          <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse"></div>
          Powered by Gemini 2.0
        </div>
      </footer>
    </div>
  );
}

export default App;
