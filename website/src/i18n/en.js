export default {
  nav: {
    home: 'Home',
    research: 'Research',
    publications: 'Publications',
    news: 'News',
    resources: 'Resources',
    api: 'API',
    team: 'Team',
  },
  footer: {
    tagline: 'High-Concurrency LLM Data Synthesis Engine',
    contact: 'Contact',
  },

  home: {
    hero: {
      title: 'DataSmith',
      subtitle: 'High-Concurrency LLM Data Synthesis Engine',
      slogan: 'Provide seed data, and synthesize rich, high-quality, massive datasets for you',
      cta_start: 'Get Started',
      cta_github: 'View on GitHub',
      install_tip: 'Click to copy',
      install_copied: 'Copied!',
    },
    overview: {
      title: 'What is DataSmith?',
      body: 'Building SFT and RLHF datasets at scale is an infrastructure problem before it is a data problem. Naive async scripts hit rate limits silently, crash without checkpoints, produce malformed JSON, and leave no audit trail. At 10K+ records these failure modes compound: a crash at 80% means losing hours of API spend and starting over. \n\nDataSmith is a production-grade async pipeline that handles rate limiting, retries, checkpointing, and quality filtering automatically — so you focus on what to generate, not how. It works the same way whether you are hitting a cloud API or a local vLLM server.',
    },
    highlights: {
      title: 'Key Features',
      items: [
        {
          icon: '⚡',
          title: 'Async Pipeline',
          desc: 'Single-queue N-worker asyncio architecture with 50+ concurrent coroutines. 5,000+ RPM on a single machine. Scale horizontally with Ray or Dask.',
        },
        {
          icon: '🛡️',
          title: 'Fault Tolerance',
          desc: 'WAL-based checkpoint recovery + exponential backoff with full jitter. 99.8% task completion under 30% fault injection. Zero data loss on service interruption.',
        },
        {
          icon: '🔌',
          title: 'Plugin System',
          desc: 'Extend via BaseStrategy / BaseEvaluator in 5 lines. Built-in EvolInstruct, LLMJudge, and RegexFilter. Unified client interface for OpenAI, Anthropic, vLLM, Ollama, and Aliyun.',
        },
      ],
    },
    stats: {
      items: [
        { value: '+12.1%', label: 'Throughput over NaiveAsync' },
        { value: '99.8%', label: 'Completion under 30% fault injection' },
        { value: '5×', label: 'Eval speedup with eval_max_tokens' },
      ],
    },
    mission: 'Democratizing high-quality LLM training data synthesis for every researcher.',
  },

  research: {
    title: 'Research',
    subtitle: 'We focus on the core challenges of LLM data engineering, advancing the systematic study of data synthesis methodology.',
    areas: [
      {
        icon: '🧪',
        title: 'Data Synthesis',
        desc: 'We study LLM-based automatic instruction data synthesis, including EvolInstruct mutation (constraints, deepening, concretization), Self-Play dialogue expansion, and SeedToQA seed transformation — exploring low-cost, high-diversity synthesis paradigms.',
      },
      {
        icon: '🔍',
        title: 'Data Quality Evaluation',
        desc: 'We explore multi-dimensional quality evaluation systems covering LLM-as-a-Judge scoring, regex filtering, length-window constraints, semantic completeness detection, and similarity-based deduplication to build trustworthy quality assurance pipelines.',
      },
      {
        icon: '⚡',
        title: 'High-Concurrency Scheduling',
        desc: 'We study high-concurrency async scheduling theory for LLM APIs, including dual-bucket rate limiting (RPM+TPM), prefix-aware KV cache scheduling, heterogeneous two-stage gen-eval overlap execution, and exponential backoff with full jitter.',
      },
      {
        icon: '🌐',
        title: 'Distributed Data Processing',
        desc: 'We explore Ray Actor and Dask-based distributed data synthesis frameworks achieving linear multi-machine scaling, studying cross-node checkpoint coordination, load balancing, and task scheduling optimization.',
      },
    ],
  },

  publications: {
    title: 'Publications',
    subtitle: 'We publish data synthesis research at top-tier conferences and journals.',
    placeholder_title: 'Paper Title (Coming Soon)',
    placeholder_authors: 'Author List',
    placeholder_venue: 'Conference / Journal · Year',
    placeholder_abstract: 'Abstract coming soon. Stay tuned.',
    btn_pdf: 'PDF',
    btn_arxiv: 'arXiv',
    btn_bibtex: 'BibTeX',
  },

  news: {
    title: 'News',
    subtitle: 'Project releases and major milestones.',
    items: [
      {
        date: '2026-04-17',
        title: 'DataSmith Official Website Launched',
        desc: 'Official website goes live with bilingual support (Chinese/English), covering project overview, research directions, publications, resources, and team.',
      },
      {
        date: '2026-03-20',
        title: 'DataSmith v1.0 MVP Released',
        desc: 'v1.0 MVP released with declarative YAML configuration, full CLI commands, and 85% test coverage. Now open source on GitHub.',
      },
      {
        date: '2026-02-15',
        title: 'v0.5 Beta — EvolInstruct & LLMJudge',
        desc: 'Introduced EvolInstruct mutation strategy, LLMJudge scoring evaluator, RegexFilter, and automatic JSON repair mechanism.',
      },
      {
        date: '2026-01-10',
        title: 'v0.1 Alpha — Core Engine',
        desc: 'First Alpha release with async scheduler, unified LLM routing, dual-bucket rate limiter, and WAL checkpoint engine.',
      },
    ],
  },

  resources: {
    title: 'Resources',
    subtitle: 'Datasets, configuration templates, and related tools to get you started quickly.',
    groups: [
      {
        icon: '📦',
        title: 'Datasets',
        items: [
          { name: 'general_instructions_1k.jsonl', desc: '1,000 general English instruction seed dataset for quick experiments and validation', link: 'https://github.com/datascale-ai/datasmith/blob/main/demo/datasets/general_instructions_1k.jsonl' },
          { name: 'general_instructions_10k.jsonl', desc: '10,000 general English instruction seed dataset for large-scale synthesis tasks', link: 'https://github.com/datascale-ai/datasmith/blob/main/demo/datasets/general_instructions_10k.jsonl' },
          { name: 'cloud_api_eval_500.jsonl', desc: '500-record subset for cloud API rate-limiter benchmarking (qwen-plus experiment)', link: 'https://github.com/datascale-ai/datasmith/blob/main/demo/datasets/cloud_api_eval_500.jsonl' },
        ],
      },
      {
        icon: '📝',
        title: 'Config Templates',
        items: [
          { name: 'openai_evol_instruct.yaml', desc: 'OpenAI GPT-4o-mini + EvolInstruct 3-round mutation + LLMJudge evaluation', link: 'https://github.com/datascale-ai/datasmith/blob/main/demo/configs/openai_evol_instruct.yaml' },
          { name: 'vllm_local_pipeline.yaml', desc: 'Local vLLM (Qwen2.5-7B) + prefix cache + two-stage pipeline config', link: 'https://github.com/datascale-ai/datasmith/blob/main/demo/configs/vllm_local_pipeline.yaml' },
          { name: 'cloud_api_rate_limited.yaml', desc: 'Aliyun Bailian / DeepSeek cloud config with dual-bucket rate limiting', link: 'https://github.com/datascale-ai/datasmith/blob/main/demo/configs/cloud_api_rate_limited.yaml' },
        ],
      },
      {
        icon: '🔗',
        title: 'Related Projects',
        items: [
          { name: 'vLLM', desc: 'High-performance LLM inference engine — preferred local backend for DataSmith', link: 'https://github.com/vllm-project/vllm' },
          { name: 'WizardLM', desc: 'Origin of EvolInstruct methodology — the academic foundation of DataSmith synthesis strategies', link: 'https://github.com/nlpxucan/WizardLM' },
          { name: 'LLaMA-Factory', desc: 'Leading SFT/RLHF fine-tuning framework — consume DataSmith-generated datasets downstream', link: 'https://github.com/hiyouga/LLaMA-Factory' },
        ],
      },
    ],
  },

  team: {
    title: 'Team',
    subtitle: 'Researchers and engineers from academia and industry driving DataSmith forward.',
    members: [
      { name: 'luoyang', role: 'Lead Developer', github: 'https://github.com/datascale-ai' },
      { name: 'Contributor', role: 'Research Engineer', github: 'https://github.com/datascale-ai/datasmith' },
    ],
    join_title: 'Join Us',
    join_desc: 'We welcome researchers and engineers interested in LLM data engineering to contribute.',
    join_btn: 'Contributing Guide',
  },
}
