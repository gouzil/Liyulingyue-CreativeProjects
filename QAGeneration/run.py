from dotenv import load_dotenv
from openai import OpenAI
from src import QAGenerator, DistributionPlanner, load_chunks_gen, get_logger
import argparse
import os
import time
import logging
from typing import Optional, Tuple

# 加载环境变量
load_dotenv()

# 获取统一的 logger
logger = get_logger("run")

def setup_file_logging(log_path: str = "data/run.log"):
    """为根 logger 添加文件输出"""
    root_logger = logging.getLogger()
    # 避免重复添加 FH
    if not any(isinstance(h, logging.FileHandler) for h in root_logger.handlers):
        formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
        fh = logging.FileHandler(log_path, encoding='utf-8')
        fh.setFormatter(formatter)
        root_logger.addHandler(fh)

def run(
    chunks_path: str = "data/coffee_test.jsonl",
    out_path: str = "data/qas_coffee_result.jsonl",
    log_path: str = "data/run.log",
    max_items: Optional[int] = None,
    sleep_seconds: float = 0.5,
    q_range: tuple = (20, 350),
    a_range: tuple = (50, 500),
    bins: int = 5,
    q_bins: Optional[int] = None,
    a_bins: Optional[int] = None,
    joint: bool = True,
    show_dist_freq: int = 100,
    chunk_size: int = 1500,
    model_name: Optional[str] = None,
    template_idx: int = 1,
):
    """QAGeneration 主流程入口。"""
    setup_file_logging(log_path)
    api_key = os.getenv("MODEL_KEY")
    base_url = os.getenv("MODEL_URL", "https://aistudio.baidu.com/llm/lmapi/v3")
    model = model_name or os.getenv("MODEL_NAME", "gpt-4o")

    if not api_key:
        logger.error("错误：未在环境变量中设置 MODEL_KEY")
        return

    client = OpenAI(api_key=api_key, base_url=base_url)

    # 模板配置
    templates = {
        0: [{"Q": "问题描述", "A": "最终给出的答案"}],
        1: [{
            "Q": "问题描述",
            "Thought": "在正式回答前的逻辑拆解与推理过程",
            "A": "最终给出的答案"
        }],
        2: [{
            "Q": "场景化问题描述",
            "Context": "相关原文",
            "A": "基于背景的深度解答"
        }]
    }
    target_structure = templates.get(template_idx, templates[0])

    # 1. 核心逻辑组件初始化
    # ... 其余逻辑 ...
    planner = DistributionPlanner(
        q_range=q_range,
        a_range=a_range,
        bins=bins,
        q_bins=q_bins,
        a_bins=a_bins,
        joint=joint,
    )
    # 初始化 QAGenerator 时传入 output_path 和 target_structure
    generator = QAGenerator(
        client, 
        model=model, 
        output_path=out_path,
        target_structure=target_structure
    )

    try:
        # 使用生成器流式加载
        chunks_stream = load_chunks_gen(chunks_path, chunk_size=chunk_size)
    except FileNotFoundError:
        logger.error(f"错误：找不到文件 {chunks_path}")
        return

    # 预先清理/触碰输出文件 (可选，如果存在则覆盖初始状态)
    if out_path:
        with open(out_path, "w", encoding="utf-8") as f:
            pass

    logger.info(f"--- [Generator + Planner] 分布规划生产线 (全流式) ---")

    count = 0
    for chunk in chunks_stream:
        if max_items and count >= max_items:
            break
        
        # 1. 向 Planner 获取本次生成的分布指令
        dynamic_advice = planner.get_adjustment_requirements()

        logger.info(f"[{count+1}] 处理新文本块 | 建议调整数: {len(dynamic_advice)} | 建议内容: {dynamic_advice}")

        try:
            # 2. 调用 Generator 生成结果
            qas = generator.generate_single(
                chunk,
                dynamic_requirements=dynamic_advice,
                temperature=0.3,
            )

            # 反馈给 Planner 记录当前状态
            planner.record_metrics(qas)

            # 根据参数决定是否/何时展示分布情况
            if show_dist_freq > 0 and (count + 1) % show_dist_freq == 0:
                planner.show_distribution()

            stats = planner.get_stats()
            logger.info(f"[{count+1}] 已处理 | 分布规划中 | 建议项: {len(dynamic_advice)} | 累计 QA: {stats['total']}")

        except Exception as e:
            logger.error(f"[{count+1}] 请求失败: {e}")

        count += 1
        if sleep_seconds > 0:
            time.sleep(sleep_seconds)

    logger.info(f"--- 任务完成！结果已保存至 {out_path} ---")


def _parse_range(s: str) -> tuple:
    parts = s.split("-")
    if len(parts) == 2:
        return (int(parts[0]), int(parts[1]))
    raise argparse.ArgumentTypeError("range must be in LOW-HIGH format, e.g. 100-500")

def main():
    parser = argparse.ArgumentParser(description="Run QAGeneration with distribution planning")
    parser.add_argument("--input", "-i", default=os.getenv("INPUT_PATH", "data/coffee_test.jsonl"), help="input jsonl path")
    parser.add_argument("--output", "-o", default=os.getenv("OUTPUT_PATH", "data/qas_coffee_result.jsonl"), help="output jsonl path")
    parser.add_argument("--log", "-l", default="data/run.log", help="log file path")
    parser.add_argument("--max-items", type=int, default=None, help="max items to process")
    parser.add_argument("--sleep", type=float, default=0.5, help="sleep seconds between requests")
    parser.add_argument("--q-range", type=_parse_range, default=os.getenv("Q_RANGE", "20-350"), help="Q length target range LOW-HIGH")
    parser.add_argument("--a-range", type=_parse_range, default=os.getenv("A_RANGE", "50-500"), help="A length target range LOW-HIGH")
    parser.add_argument("--bins", type=int, default=int(os.getenv("BINS", "5")), help="number of bins for distribution")
    parser.add_argument("--q-bins", type=int, default=None, help="number of bins for Q (overrides --bins)")
    parser.add_argument("--a-bins", type=int, default=None, help="number of bins for A (overrides --bins)")
    parser.add_argument(
        "--joint", 
        type=lambda x: (str(x).lower() in ["true", "1", "yes"]), 
        default=True, 
        help="enable joint (2D) binning (default: True)"
    )
    parser.add_argument(
        "--show-dist", 
        dest="show_dist_freq",
        type=lambda x: 100 if str(x).lower() in ["true", "yes"] else (0 if str(x).lower() in ["false", "no"] else int(x)),
        default=1,
        help="Distribution display frequency. True=100, False=0/None, or specify a number (default: 100)"
    )
    parser.add_argument("--chunk-size", type=int, default=1500, help="max characters per chunk for text splitting")
    parser.add_argument("--model", type=str, default=None, help="model name override")
    parser.add_argument(
        "--template-idx", 
        type=int, 
        default=2, 
        help="Target structure template index (0: Q/A, 1: Q/Thought/A, 2: Q/Context/A). Default: 1"
    )

    args = parser.parse_args()

    run(
        chunks_path=args.input,
        out_path=args.output,
        log_path=args.log,
        max_items=args.max_items,
        sleep_seconds=args.sleep,
        q_range=args.q_range,
        a_range=args.a_range,
        bins=args.bins,
        q_bins=args.q_bins,
        a_bins=args.a_bins,
        joint=args.joint,
        show_dist_freq=args.show_dist_freq,
        chunk_size=args.chunk_size,
        model_name=args.model,
        template_idx=args.template_idx,
    )


if __name__ == "__main__":
    main()
