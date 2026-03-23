import os
import time
from typing import List, Optional

from dotenv import load_dotenv
from openai import OpenAI
from core import QAGenerator, DistributionPlanner, load_chunks

# 加载环境变量
load_dotenv()

def run(
    chunks_path: str = "data/coffee_test.jsonl",
    out_path: str = "qas_coffee_result.jsonl",
    max_items: Optional[int] = None,
    sleep_seconds: float = 0.5,
):
    """
    QAGeneration 主流程接口 (简洁入口版)。
    """
    api_key = os.getenv("MODEL_KEY")
    base_url = os.getenv("MODEL_URL", "https://aistudio.baidu.com/llm/lmapi/v3")
    model = os.getenv("MODEL_NAME", "gpt-4o")

    if not api_key:
        print("错误：未在环境变量中设置 MODEL_KEY")
        return

    client = OpenAI(api_key=api_key, base_url=base_url)

    # 1. 初始化分布规划器 (专注于分布状态补齐)
    planner = DistributionPlanner(
        q_range=(20, 350),  # Q 长度目标区间
        a_range=(50, 500),  # A 长度目标区间
        bins=5              # 划分 5 个桶来观察均匀度
    )

    # 2. 初始化自适应生成器
    generator = QAGenerator(
        client, 
        model=model
    )

    try:
        chunks = load_chunks(chunks_path)
    except FileNotFoundError:
        print(f"错误：找不到文件 {chunks_path}")
        return

    total = len(chunks)
    if max_items:
        total = min(total, max_items)

    print(f"--- 此版本采用 [Generator + Planner] 均匀分布规划架构 ---")

    for i in range(total):
        chunk = chunks[i]
        
        # 获取分布补齐建议
        dynamic_advice = planner.get_adjustment_requirements()
        
        try:
            # 运行生成
            qas = generator.generate_single(
                chunk, 
                dynamic_requirements=dynamic_advice,
                temperature=0.3
            )
            
            # 反馈给规划器
            planner.record_metrics(qas)
            
            # 实时进度
            stats = planner.get_stats()
            print(f"[{i+1}/{total}] 已处理 | 桶分布补齐中 | 建议项: {len(dynamic_advice)} | 累计 QA: {stats['total']}")
                
        except Exception as e:
            print(f"[{i+1}/{total}] 请求失败: {e}")

        if sleep_seconds > 0 and i < total - 1:
            time.sleep(sleep_seconds)

    generator.save_to_file(out_path)
    print(f"--- 任务完成！结果已保存至 {out_path} ---")
    
    # 最终报告
    print("\n--- 最终分布规划报告 ---")
    print(f"设定 Q 区间: {planner.q_range}, A 区间: {planner.a_range}")
    print(f"结果已使整体分布趋向设定的区间均匀分布。")

if __name__ == "__main__":
    run()
