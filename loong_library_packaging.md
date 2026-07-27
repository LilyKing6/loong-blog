# Loong 库包打包设计（lib / bin 拆分）

## 目标
把 Web 框架与共享基础抽取为可复用的 `.lpkg` 库包，博客 / 文档 / 演示作为 bin 包通过
path 依赖消费它们，使框架真正具备"库"的特征：明确的公开 API、显式可见性、有效完整性、
完整依赖元数据。

## 目录结构

```text
loong_blog/
  loong.toml                      # bin 包：webdemo / blog / docs 三个 target
  loong.lock                      # lock_version = 3
  src/
    webdemo/main.lo               # 演示 bin 入口（消费 web）
    blog/{blog.lo, main.lo, state.lo}
    docs/{docs.lo, main.lo}
  lib/
    loong-web/
      loong.toml                  # lib target "web"（type = lib）
      loong.lock
      src/web.lo                  # 根聚合：import web.{app,auth,...,upload};
      src/web/*.lo                # 21 个模块
      dist/loong.web-0.1.0.lpkg   # 构建产物
    loong-shared/
      loong.toml                  # lib target "shared"（type = lib）
      loong.lock
      src/shared.lo               # 根聚合：import shared.{content,routes};
      src/shared/*.lo             # 2 个模块
      dist/loong.shared-0.1.0.lpkg
  site/                           # 静态资源
  blog.lx  docs.lx  webdemo.lx    # bin 产物
```

## 依赖声明

根 `loong.toml`（bin 包）：

```toml
[package]
name = "loong.blog"
version = "0.1.0"
edition = "2026"
source_root = "src"

[dependencies]
std = { builtin = true }
web = { path = "lib/loong-web" }
shared = { path = "lib/loong-shared" }
```

库包 `lib/loong-web/loong.toml`：

```toml
[package]
name = "loong.web"
version = "0.1.0"
edition = "2026"
source_root = "src"

[dependencies]
std = { builtin = true }

[targets.web]
type = "lib"
root = "src/web.lo"
exports = ["web.app", "web.auth", ... , "web.upload"]
```

`root` 指向聚合模块 `src/web.lo`，它只做 `import web.{...};`，把 21 个子模块拉进同一
编译单元；`exports` 列出全部导出模块。`loong-shared` 结构相同。

## 可见性：`public` 修饰符

依据语言规范 §14.5，库包 API 必须显式标注 `public`：

- 一旦某模块出现任意显式 `public` 声明，跨包访问只允许该模块中的 `public` 声明。
- 若某模块完全没有显式 `public`，则走旧兼容规则，默认可见符号仍可跨包访问。

为了让框架成为"正规库"，已为全部导出 API 加上 `public`：

- `lib/loong-web/src/web/*.lo`：21 个模块里所有面向包的函数 / struct / enum 加 `public`
  （共约 117 个导出符号，`visibility = "public"`）。
- `lib/loong-shared/src/shared/*.lo`：`shared.content` 的 19 个 struct、`shared.routes` 的
  2 个 struct 与 2 个函数加 `public`（共 23 个导出符号）。
- 内部辅助（如 `web.json::decodeJson`、编译器生成的匿名闭包）保持默认可见，不导出。

效果：`.lpkg` 的 `[api_index]` / `[[api_index.type]]` / `[[api_index.function]]` 现在统一记录
`visibility = "public"`；`[[dependency]]` 也带上完整 source-fingerprint 身份元数据。

## 构建与校验

```bash
LOC=/home/lily/Projects/loong/build-gcc-debug/out/loc

# 构建库包
$LOC build --manifest lib/loong-shared/loong.toml   # -> dist/loong.shared-0.1.0.lpkg
$LOC build --manifest lib/loong-web/loong.toml      # -> dist/loong.web-0.1.0.lpkg

# 校验库包
$LOC validate --manifest lib/loong-shared/loong.toml
$LOC validate --manifest lib/loong-web/loong.toml

# 检查 .lpkg 完整性
$LOC inspect lib/loong-web/dist/loong.web-0.1.0.lpkg      # Integrity: valid
$LOC inspect lib/loong-shared/dist/loong.shared-0.1.0.lpkg # Integrity: valid

# 构建 bin（消费库包）
$LOC build --manifest loong.toml --target webdemo   # -> webdemo.lx
$LOC build --manifest loong.toml --target blog      # -> blog.lx
$LOC build --manifest loong.toml --target docs      # -> docs.lx
```

构建日志会显示 `web -> lpkg: present` / `shared -> lpkg: present`，依赖元数据带上
`build / toolchain / deps / payload` 摘要。

## 已知行为说明

- 显式 `public` 之后，loc 当前只写入根 stub payload（`payload/main.lobj`，29 字节），
  不再为每个模块单独写入 `.lobj`。bin 构建时命名的 `public` 函数若不在 stub 里，会走
  "源码重编译"回退（构建日志里表现为 `links: missing` + 对应 `missing:` 列表），最终仍能
  正确链接出可执行文件。入口函数（如 `web::server::serve`）仍能 `links: satisfied`。
- 编译器生成的匿名闭包（`__anon_*`）按 §14.5 永远不抬升为包 API，统一走源码回退，属预期。
- 此前的"per-module payload + 旧兼容可见性"路径会让 5 个模块（form / http_header /
  middleware / server / session）写出 stale RELA，导致 `Integrity: invalid`；改用显式
  `public` 后该路径不再触发，完整性变为 valid。详见下节。

## 历史问题：loong-web 曾出现的 `Integrity: invalid`

在未加 `public` 时，`loong.web-0.1.0.lpkg` 报 `Integrity: invalid`，而 `loong.shared` 为
`valid`。根因：loc 在"旧兼容可见性 + per-module payload"模式下，给上述 5 个模块写出了
指向不存在 Call 指令的 stale RELA 条目；`deserializeObject` 内部的 `validateRelaEntries`
会校验 `instructions[sourceOperand-2] == Call(230)` 等，命中 stale 条目即返回失败，使
`moduleEntriesValid = false` → `integrityValid = false`。

切换到显式 `public` 可见性后，loc 不再走 per-module payload 写入路径，stale RELA 不再产生，
`Integrity: valid`。这是当前 loc build 705 在该路径上的行为，已用 Python 复刻 lobj 解码 +
`validateRelaEntries` 完成验证。

## 运行（沙箱外）

```bash
LORT=/home/lily/Projects/loong/build-gcc-debug/out/lort
$LORT blog.lx serve -p 18105 -r '*/>{SOURCE}index.html' -R site
```

注：沙箱内无 TCP socket 权限，运行时 smoke test 须在沙箱外执行。

## 2026-07-27 更新

M3 博客后端与 M4 文档后端均已完成并验证通过：

- blog target：loc validate（2199 类型/8701 函数），loc build（blog.lx 134883 指令）
- docs target：loc validate（2182 类型/8596 函数），loc build（docs.lx 112226 指令）
- 两个 .lpkg 库包保持 Integrity: valid，bin 包通过 path 依赖正常消费
- docs 新增 docs/state.lo（DocsState 数据层）和重写的 docs/docs.lo（20 个路由处理器）
