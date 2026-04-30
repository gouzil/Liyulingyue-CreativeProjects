# skills 目录说明

此目录用于存放从 GitHub 仓库中稀疏检出的 `skills/` 子目录内容。

## 稀疏绑定（Sparse Checkout）

如果你希望仅将远程仓库 `https://github.com/Liyulingyue/CreativeProjects` 的 `skills/` 目录稀疏检出到本地，可以使用以下命令：

```bash
rm -rf ~/.agents
git clone --filter=blob:none --no-checkout --sparse https://github.com/Liyulingyue/CreativeProjects.git ~/.agents
cd ~/.agents
git sparse-checkout init --no-cone
git sparse-checkout set skills
git checkout main
```

这将确保本地目录只检出：

- `.git`
- `skills/`

而不会保留根目录下的其他顶层文件。

## 已存在仓库下切换为稀疏检出

如果 `~/.agents` 已经是一个仓库，则可执行：

```bash
cd ~/.agents
git sparse-checkout init --no-cone
git sparse-checkout set skills
git checkout main
```

## 小贴士

- `--no-cone` 模式可确保只检出你明确指定的路径。
- 如果你只运行 `git sparse-checkout set skills`，Git 可能仍会保留仓库根目录下的顶层文件。
- 该操作需要 Git 2.25 及以上版本。
