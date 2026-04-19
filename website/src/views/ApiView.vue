<template>
  <div class="api-page">
    <aside class="api-sidebar">
      <nav>
        <div v-for="section in sections" :key="section.id" class="sidebar-section">
          <a :href="'#' + section.id" class="sidebar-title" @click.prevent="scrollTo(section.id)">
            {{ section.title }}
          </a>
          <ul v-if="section.children">
            <li v-for="child in section.children" :key="child.id">
              <a :href="'#' + child.id" @click.prevent="scrollTo(child.id)">{{ child.title }}</a>
            </li>
          </ul>
        </div>
      </nav>
    </aside>

    <main class="api-content">
      <!-- Quick Start -->
      <section id="quickstart">
        <h1>API 参考文档</h1>
        <p class="lead">DataSmith 提供 Python SDK 和 CLI 两种调用方式。所有示例均基于 <code>datasmith</code> 包（<code>pip install datasmith</code>）。</p>

        <div class="info-banner">
          <span class="badge badge-tip">提示</span>
          认证方式：云端 API 通过 <code>api_key</code> 字段或环境变量（<code>OPENAI_API_KEY</code>、<code>DASHSCOPE_API_KEY</code>）传入，本地 vLLM 无需认证。
        </div>
      </section>

      <!-- Pipeline.run() -->
      <section id="pipeline-run">
        <h2>Pipeline.run()</h2>
        <p>核心入口，加载配置后执行数据合成流水线。</p>

        <div class="code-block">
          <div class="code-header"><span>Python</span><button @click="copy($event, 'pipeline-run-code')">复制</button></div>
          <pre id="pipeline-run-code"><code>from datasmith import Pipeline
from datasmith.config import loader

config = loader.load("config.yaml")
pipeline = Pipeline(config)
result = pipeline.run()

print(f"完成: {result.completed}  拒绝: {result.rejected}  失败: {result.failed}")
print(f"吞吐: {result.throughput:.1f} rec/min")</code></pre>
        </div>

        <h3>返回值 <code>PipelineResult</code></h3>
        <table class="param-table">
          <thead><tr><th>字段</th><th>类型</th><th>说明</th></tr></thead>
          <tbody>
            <tr><td>completed</td><td>int</td><td>成功处理并写入输出的记录数</td></tr>
            <tr><td>rejected</td><td>int</td><td>未通过评估器的记录数（写入 dead_letter）</td></tr>
            <tr><td>failed</td><td>int</td><td>超过最大重试次数后仍失败的记录数</td></tr>
            <tr><td>elapsed</td><td>float</td><td>总耗时（秒）</td></tr>
            <tr><td>throughput</td><td>float</td><td>有效吞吐量（条/分钟）</td></tr>
          </tbody>
        </table>
      </section>

      <!-- Config Schema -->
      <section id="config-schema">
        <h2>配置文件结构</h2>
        <p>DataSmith 通过 YAML 配置文件声明式描述整个流水线，无需修改代码。</p>

        <div class="code-block">
          <div class="code-header"><span>config.yaml</span><button @click="copy($event, 'config-schema-code')">复制</button></div>
          <pre id="config-schema-code"><code>name: my-pipeline         # 流水线名称（用于检查点目录命名）

source:
  type: jsonl             # 支持 jsonl | csv | parquet
  path: ./seeds.jsonl

pipeline:
  - step: generate        # 生成步骤
    strategy: evol-instruct
    depth: 3
    llm:
      provider: openai    # openai | vllm | bailian
      model: gpt-4o-mini
      api_key: ${OPENAI_API_KEY}
      rpm_limit: 500
      tpm_limit: 200000

  - step: evaluate        # 评估步骤（可链式叠加多个）
    evaluator: llm-judge
    criteria: helpfulness
    threshold: 4.0
    llm:
      provider: openai
      model: gpt-4o-mini
      api_key: ${OPENAI_API_KEY}

sink:
  path: ./output.jsonl
  checkpoint_dir: ./.datasmith_runs
  dead_letter_path: ./rejected.jsonl

concurrency: 50
mode: burst               # burst | streaming</code></pre>
        </div>

        <h3>顶层字段</h3>
        <table class="param-table">
          <thead><tr><th>字段</th><th>类型</th><th>默认值</th><th>说明</th></tr></thead>
          <tbody>
            <tr><td>name</td><td>string</td><td>—</td><td>流水线名称</td></tr>
            <tr><td>source.type</td><td>string</td><td>jsonl</td><td>输入格式：<code>jsonl</code> | <code>csv</code> | <code>parquet</code></td></tr>
            <tr><td>source.path</td><td>string</td><td>—</td><td>输入文件路径</td></tr>
            <tr><td>concurrency</td><td>int</td><td>50</td><td>最大并发 LLM 请求数</td></tr>
            <tr><td>mode</td><td>string</td><td>streaming</td><td><code>burst</code>：全量内存批量提交（最高吞吐）；<code>streaming</code>：流式处理（大数据集）</td></tr>
          </tbody>
        </table>
      </section>

      <!-- Strategy -->
      <section id="strategies">
        <h2>合成策略（Strategy）</h2>

        <section id="evol-instruct">
          <h3>evol-instruct</h3>
          <p>WizardLM 风格的指令变异策略，对每条种子指令进行多轮渐进式改写，使指令更复杂、更具体、更有约束性。</p>

          <div class="code-block">
            <div class="code-header"><span>YAML</span><button @click="copy($event, 'evol-code')">复制</button></div>
            <pre id="evol-code"><code>- step: generate
  strategy: evol-instruct
  depth: 3                   # 变异轮数
  mutation_types:
    - constraints             # 添加约束条件（时间/资源/受众）
    - deepen                  # 深化概念复杂度
    - concretize              # 具体化场景与受众
  use_system_prompt: true     # 开启 vLLM KV prefix cache，提升吞吐
  require_json: false         # 为 true 时对格式错误输出自动修复</code></pre>
          </div>

          <table class="param-table">
            <thead><tr><th>参数</th><th>类型</th><th>默认值</th><th>说明</th></tr></thead>
            <tbody>
              <tr><td>depth</td><td>int</td><td>3</td><td>变异迭代轮数，每轮在上一轮输出基础上继续改写</td></tr>
              <tr><td>mutation_types</td><td>list</td><td>全部</td><td><code>constraints</code> / <code>deepen</code> / <code>concretize</code>，每轮随机选取</td></tr>
              <tr><td>use_system_prompt</td><td>bool</td><td>false</td><td>开启后所有请求共享 system prompt KV cache，显著提升 vLLM 吞吐</td></tr>
              <tr><td>require_json</td><td>bool</td><td>false</td><td>为 true 时对非 JSON 输出进行二次修复（最多 2 次）</td></tr>
            </tbody>
          </table>
        </section>

        <section id="custom-strategy">
          <h3>自定义策略</h3>
          <p>继承 <code>BaseStrategy</code>，实现 <code>apply()</code> 方法即可接入流水线，无需其他配置。</p>
          <div class="code-block">
            <div class="code-header"><span>Python</span><button @click="copy($event, 'custom-strategy-code')">复制</button></div>
            <pre id="custom-strategy-code"><code>from datasmith.strategies import BaseStrategy
from datasmith.schema import DataRecord

class MyStrategy(BaseStrategy):
    async def apply(self, record: DataRecord) -> DataRecord:
        prompt = f"将以下指令翻译成中文并扩展：{record.instruction}"
        response = await self.client.generate([{"role": "user", "content": prompt}])
        record.synthetic_data = {"instruction": response}
        return record</code></pre>
          </div>
        </section>
      </section>

      <!-- Evaluators -->
      <section id="evaluators">
        <h2>评估器（Evaluator）</h2>

        <section id="llm-judge">
          <h3>llm-judge</h3>
          <p>调用 LLM 对合成数据打分（1–5 分），低于阈值的记录写入 dead_letter。</p>

          <div class="code-block">
            <div class="code-header"><span>YAML</span><button @click="copy($event, 'judge-code')">复制</button></div>
            <pre id="judge-code"><code>- step: evaluate
  evaluator: llm-judge
  criteria: helpfulness   # helpfulness | harmlessness | honesty
  threshold: 4.0           # 低于此分数的记录被拒绝
  eval_max_tokens: 3       # 限制 judge 输出 token 数，5× 速度提升
  llm:
    provider: openai
    model: gpt-4o-mini
    api_key: ${OPENAI_API_KEY}</code></pre>
          </div>

          <table class="param-table">
            <thead><tr><th>参数</th><th>类型</th><th>默认值</th><th>说明</th></tr></thead>
            <tbody>
              <tr><td>criteria</td><td>string</td><td>helpfulness</td><td>评分维度，影响 judge prompt 内容</td></tr>
              <tr><td>threshold</td><td>float</td><td>4.0</td><td>最低接受分数（1–5 区间）</td></tr>
              <tr><td>eval_max_tokens</td><td>int</td><td>null</td><td>限制 judge 输出长度，设为 3 时速度提升约 5×</td></tr>
            </tbody>
          </table>
        </section>

        <section id="regex-filter">
          <h3>regex-filter</h3>
          <p>基于正则黑名单过滤输出，支持可选的 JSON Schema 校验。</p>
          <div class="code-block">
            <div class="code-header"><span>YAML</span><button @click="copy($event, 'regex-code')">复制</button></div>
            <pre id="regex-code"><code>- step: evaluate
  evaluator: regex-filter
  blacklist_patterns:
    - "I cannot"
    - "I'm sorry, but"
    - "As an AI"
    - "我无法"
  json_schema:              # 可选：验证输出是否符合 JSON Schema
    type: object
    required: [instruction, response]</code></pre>
          </div>
        </section>
      </section>

      <!-- LLM Config -->
      <section id="llm-config">
        <h2>LLM 配置（llm:）</h2>
        <p>每个 <code>generate</code> / <code>evaluate</code> 步骤可独立配置 LLM 后端。</p>

        <table class="param-table">
          <thead><tr><th>字段</th><th>类型</th><th>默认值</th><th>说明</th></tr></thead>
          <tbody>
            <tr><td>provider</td><td>string</td><td>—</td><td><code>openai</code> / <code>vllm</code> / <code>bailian</code></td></tr>
            <tr><td>model</td><td>string</td><td>—</td><td>模型名称，如 <code>gpt-4o-mini</code>、<code>Qwen/Qwen2.5-7B-Instruct</code></td></tr>
            <tr><td>api_key</td><td>string</td><td>—</td><td>支持 <code>${ENV_VAR}</code> 语法，从环境变量读取</td></tr>
            <tr><td>base_url</td><td>string</td><td>—</td><td>自定义端点，vLLM 本地服务必填，如 <code>http://localhost:8000/v1</code></td></tr>
            <tr><td>rpm_limit</td><td>int</td><td>60</td><td>每分钟请求数上限（双桶限流器 RPM 桶）</td></tr>
            <tr><td>tpm_limit</td><td>int</td><td>100000</td><td>每分钟 Token 数上限（双桶限流器 TPM 桶）</td></tr>
            <tr><td>generation_kwargs</td><td>object</td><td>{}</td><td>透传给 LLM 的额外参数：<code>temperature</code>、<code>max_tokens</code>、<code>top_p</code> 等</td></tr>
          </tbody>
        </table>

        <h3>支持的 Provider</h3>
        <table class="param-table">
          <thead><tr><th>Provider</th><th>值</th><th>示例 model</th><th>需要 base_url</th></tr></thead>
          <tbody>
            <tr><td>OpenAI</td><td><code>openai</code></td><td>gpt-4o-mini, gpt-4o</td><td>否</td></tr>
            <tr><td>DeepSeek</td><td><code>openai</code></td><td>deepseek-chat</td><td>是（api.deepseek.com）</td></tr>
            <tr><td>Anthropic</td><td><code>openai</code></td><td>claude-3-5-sonnet-20241022</td><td>是（api.anthropic.com）</td></tr>
            <tr><td>vLLM / Ollama</td><td><code>vllm</code></td><td>Qwen/Qwen2.5-7B-Instruct</td><td>是（localhost）</td></tr>
            <tr><td>阿里云百炼</td><td><code>bailian</code></td><td>qwen-plus-2025-12-01</td><td>是（dashscope）</td></tr>
          </tbody>
        </table>
      </section>

      <!-- CLI -->
      <section id="cli">
        <h2>CLI 命令</h2>

        <section id="cli-run">
          <h3>datasmith run</h3>
          <div class="code-block">
            <div class="code-header"><span>Shell</span><button @click="copy($event, 'cli-run-code')">复制</button></div>
            <pre id="cli-run-code"><code>datasmith run config.yaml [OPTIONS]

选项：
  --dry-run          验证配置，不执行流水线
  --backend BACKEND  覆盖 LLM 后端（fake | openai | vllm）
  --concurrency N    覆盖并发数
  --limit N          只处理前 N 条记录（调试用）</code></pre>
          </div>
        </section>

        <section id="cli-assess">
          <h3>datasmith assess</h3>
          <p>对输出文件生成数据质量报告（JSON 或 HTML 格式）。</p>
          <div class="code-block">
            <div class="code-header"><span>Shell</span><button @click="copy($event, 'cli-assess-code')">复制</button></div>
            <pre id="cli-assess-code"><code>datasmith assess output.jsonl [--format html] [--out report.html]</code></pre>
          </div>
        </section>

        <section id="cli-status">
          <h3>datasmith status</h3>
          <p>查看检查点目录，了解断点续传进度。</p>
          <div class="code-block">
            <div class="code-header"><span>Shell</span><button @click="copy($event, 'cli-status-code')">复制</button></div>
            <pre id="cli-status-code"><code>datasmith status .datasmith_runs</code></pre>
          </div>
        </section>
      </section>

      <!-- DataRecord -->
      <section id="data-record">
        <h2>数据结构：DataRecord</h2>
        <p><code>DataRecord</code> 是流水线中流转的基本单元（Pydantic 模型）。</p>

        <div class="code-block">
          <div class="code-header"><span>Python</span><button @click="copy($event, 'record-code')">复制</button></div>
          <pre id="record-code"><code>from datasmith import DataRecord, RecordStatus

# 典型输出记录结构
record = DataRecord(
    id="seed-000001",
    seed_data={"instruction": "什么是机器学习？"},
    synthetic_data={
        "instruction": "为一家 p99 延迟 < 50ms 的金融科技公司设计 ML 系统，..."
    },
    score=4.5,
    status=RecordStatus.COMPLETED,
)
</code></pre>
        </div>

        <table class="param-table">
          <thead><tr><th>字段</th><th>类型</th><th>说明</th></tr></thead>
          <tbody>
            <tr><td>id</td><td>string</td><td>记录唯一标识（来自输入文件）</td></tr>
            <tr><td>seed_data</td><td>dict</td><td>原始种子数据</td></tr>
            <tr><td>synthetic_data</td><td>dict</td><td>合成后的数据</td></tr>
            <tr><td>score</td><td>float | null</td><td>LLMJudge 评分（1–5），未配置 judge 时为 null</td></tr>
            <tr><td>status</td><td>RecordStatus</td><td>PENDING → GENERATED → EVALUATING → COMPLETED / REJECTED / FAILED</td></tr>
            <tr><td>metadata</td><td>dict</td><td>运行时元数据（重试次数、耗时、使用 token 数等）</td></tr>
          </tbody>
        </table>
      </section>

      <!-- Error Codes -->
      <section id="errors">
        <h2>错误处理与状态码</h2>
        <table class="param-table">
          <thead><tr><th>状态</th><th>触发条件</th><th>处理方式</th></tr></thead>
          <tbody>
            <tr><td><code>REJECTED</code></td><td>评估器返回 false（不满足质量标准）</td><td>写入 dead_letter_path，不重试</td></tr>
            <tr><td><code>FAILED</code></td><td>超过最大重试次数（LLM 错误、超时）</td><td>写入 dead_letter_path</td></tr>
            <tr><td>HTTP 429</td><td>超过 Provider RPM/TPM 限制</td><td>双桶限流器自动限速，RetryEngine 指数退避重试</td></tr>
            <tr><td>TimeoutError</td><td>LLM 响应超时</td><td>RetryEngine 自动重试（最多 max_retries 次）</td></tr>
            <tr><td>JSONDecodeError</td><td>LLM 输出格式错误</td><td><code>require_json: true</code> 时触发二次修复请求</td></tr>
          </tbody>
        </table>
      </section>
    </main>
  </div>
</template>

<script setup>
const sections = [
  { id: 'quickstart', title: '快速开始' },
  { id: 'pipeline-run', title: 'Pipeline.run()' },
  {
    id: 'config-schema', title: '配置文件结构',
  },
  {
    id: 'strategies', title: '合成策略',
    children: [
      { id: 'evol-instruct', title: 'evol-instruct' },
      { id: 'custom-strategy', title: '自定义策略' },
    ],
  },
  {
    id: 'evaluators', title: '评估器',
    children: [
      { id: 'llm-judge', title: 'llm-judge' },
      { id: 'regex-filter', title: 'regex-filter' },
    ],
  },
  { id: 'llm-config', title: 'LLM 配置' },
  {
    id: 'cli', title: 'CLI 命令',
    children: [
      { id: 'cli-run', title: 'datasmith run' },
      { id: 'cli-assess', title: 'datasmith assess' },
      { id: 'cli-status', title: 'datasmith status' },
    ],
  },
  { id: 'data-record', title: 'DataRecord 结构' },
  { id: 'errors', title: '错误处理' },
]

function scrollTo(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function copy(event, id) {
  const code = document.getElementById(id)?.innerText || ''
  navigator.clipboard.writeText(code).then(() => {
    const btn = event.target
    btn.textContent = '已复制'
    setTimeout(() => { btn.textContent = '复制' }, 1500)
  })
}
</script>

<style scoped>
.api-page {
  display: flex;
  min-height: 100vh;
  padding-top: var(--nav-height);
}

.api-sidebar {
  width: 220px;
  flex-shrink: 0;
  position: sticky;
  top: var(--nav-height);
  height: calc(100vh - var(--nav-height));
  overflow-y: auto;
  padding: 2rem 0 2rem 2rem;
  border-right: 1px solid #e5e9f0;
  background: #fafbfc;
}

.api-sidebar nav {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.sidebar-section {
  margin-bottom: 0.5rem;
}

.sidebar-title {
  display: block;
  font-weight: 600;
  font-size: 0.85rem;
  color: var(--primary-color);
  padding: 0.3rem 0;
  text-decoration: none;
}

.sidebar-title:hover { color: var(--secondary-color); }

.sidebar-section ul {
  list-style: none;
  padding-left: 0.75rem;
  margin: 0.15rem 0;
}

.sidebar-section ul li a {
  display: block;
  font-size: 0.82rem;
  color: #555;
  padding: 0.2rem 0;
  text-decoration: none;
  transition: color 0.15s;
}

.sidebar-section ul li a:hover { color: var(--secondary-color); }

/* Main content */
.api-content {
  flex: 1;
  padding: 2.5rem 3rem;
  max-width: 860px;
  min-width: 0;
}

.api-content h1 {
  font-size: 1.9rem;
  color: var(--primary-color);
  margin-bottom: 0.75rem;
}

.api-content h2 {
  font-size: 1.35rem;
  color: var(--primary-color);
  margin: 2.5rem 0 0.75rem;
  padding-bottom: 0.4rem;
  border-bottom: 2px solid var(--accent-color);
}

.api-content h3 {
  font-size: 1.05rem;
  color: #1a2a4a;
  margin: 1.5rem 0 0.5rem;
}

.api-content section { margin-bottom: 1.5rem; }

.lead {
  font-size: 1rem;
  color: #444;
  line-height: 1.7;
  margin-bottom: 1.25rem;
}

.api-content p { color: #444; line-height: 1.7; margin-bottom: 0.75rem; }

.info-banner {
  background: #eef4ff;
  border-left: 4px solid var(--secondary-color);
  padding: 0.75rem 1rem;
  border-radius: 0 6px 6px 0;
  font-size: 0.9rem;
  color: #2a3f6b;
  margin-bottom: 1.5rem;
}

.badge {
  display: inline-block;
  padding: 0.15rem 0.5rem;
  border-radius: 3px;
  font-size: 0.75rem;
  font-weight: 600;
  margin-right: 0.5rem;
}

.badge-tip { background: var(--secondary-color); color: #fff; }

/* Code blocks */
.code-block {
  background: #1e2433;
  border-radius: 8px;
  margin: 0.75rem 0 1.25rem;
  overflow: hidden;
}

.code-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.4rem 1rem;
  background: #2a3348;
}

.code-header span {
  font-size: 0.78rem;
  color: #8ba3cc;
  font-family: monospace;
}

.code-header button {
  font-size: 0.75rem;
  color: #8ba3cc;
  background: none;
  border: 1px solid #3d4f6e;
  border-radius: 3px;
  padding: 0.15rem 0.5rem;
  cursor: pointer;
  transition: color 0.15s, border-color 0.15s;
}

.code-header button:hover { color: #fff; border-color: #78c2ff; }

.code-block pre {
  margin: 0;
  padding: 1rem 1.25rem;
  overflow-x: auto;
}

.code-block code {
  font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
  font-size: 0.83rem;
  color: #cdd6f4;
  line-height: 1.65;
}

/* Tables */
.param-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
  margin: 0.5rem 0 1.5rem;
}

.param-table th {
  background: var(--primary-color);
  color: #fff;
  padding: 0.6rem 0.9rem;
  text-align: left;
  font-weight: 600;
}

.param-table td {
  padding: 0.55rem 0.9rem;
  border-bottom: 1px solid #e8ecf2;
  color: #333;
  vertical-align: top;
}

.param-table tr:nth-child(even) td { background: #f6f8fb; }
.param-table tr:hover td { background: #eef4ff; }

.param-table code {
  background: #e8edf6;
  padding: 0.1rem 0.35rem;
  border-radius: 3px;
  font-size: 0.82rem;
  color: #1a3a6b;
}

/* Responsive */
@media (max-width: 768px) {
  .api-sidebar { display: none; }
  .api-content { padding: 1.5rem 1rem; }
}
</style>
