<template>
  <div class="tutorial-content">
    <!-- 第一步：安装 Node.js -->
    <NodeInstallTutorial :platform="platform" :step-number="1" tool-name="OpenClaw" />

    <!-- Git 前置要求（Windows 特别提示） -->
    <div
      v-if="platform === 'windows'"
      class="mb-4 rounded-xl border border-amber-100 bg-gradient-to-r from-amber-50 to-yellow-50 p-4 dark:border-amber-500/40 dark:from-amber-950/30 dark:to-yellow-950/30 sm:mb-6 sm:p-6"
    >
      <h5
        class="mb-2 flex items-center text-base font-semibold text-gray-800 dark:text-gray-200 sm:mb-3 sm:text-lg"
      >
        <i class="fab fa-git-alt mr-2 text-amber-600" />
        前置要求：安装 Git
      </h5>
      <p class="mb-3 text-sm text-gray-700 dark:text-gray-300 sm:text-base">
        OpenClaw 需要 Git 支持。如果尚未安装，请先安装：
      </p>
      <div class="mb-3 space-y-1 text-sm text-gray-600 dark:text-gray-400">
        <p>
          官方下载：<a
            class="text-blue-600 underline dark:text-blue-400"
            href="https://git-scm.com/downloads/win"
            target="_blank"
            >https://git-scm.com/downloads/win</a
          >
        </p>
      </div>
      <p class="mb-3 text-sm text-gray-700 dark:text-gray-300">验证是否已安装：</p>
      <div
        class="mb-3 overflow-x-auto rounded bg-gray-900 p-2 font-mono text-xs text-green-400 sm:p-3 sm:text-sm"
      >
        <div class="whitespace-nowrap text-gray-300">git --version</div>
      </div>
      <div
        class="rounded-lg border border-yellow-200 bg-yellow-50 p-3 dark:border-yellow-500/40 dark:bg-yellow-950/30"
      >
        <p class="text-xs text-yellow-700 dark:text-yellow-400">
          Git 版本建议 2.40+。早期版本的 cygpath.exe 无法正确处理中文路径，可能导致报错。可运行
          <code class="rounded bg-yellow-100 px-1 dark:bg-yellow-900">winget upgrade Git.Git</code>
          升级。
        </p>
      </div>
    </div>

    <!-- 第二步：安装 OpenClaw -->
    <div class="mb-4 sm:mb-10 sm:mb-6">
      <h4
        class="mb-3 flex items-center text-lg font-semibold text-gray-800 dark:text-gray-300 sm:mb-4 sm:text-xl"
      >
        <span
          class="mr-2 flex h-6 w-6 items-center justify-center rounded-full bg-green-500 text-xs font-bold text-white sm:mr-3 sm:h-8 sm:w-8 sm:text-sm"
          >2</span
        >
        安装 OpenClaw
      </h4>

      <div
        class="mb-4 rounded-xl border border-green-100 bg-gradient-to-r from-green-50 to-emerald-50 p-4 dark:border-green-500/40 dark:from-green-950/30 dark:to-emerald-950/30 sm:mb-6 sm:p-6"
      >
        <h5
          class="mb-2 flex items-center text-base font-semibold text-gray-800 dark:text-gray-200 sm:mb-3 sm:text-lg"
        >
          <i class="fas fa-download mr-2 text-green-600" />
          全局安装
        </h5>
        <p class="mb-3 text-sm text-gray-700 dark:text-gray-300 sm:mb-4 sm:text-base">
          {{ platform === 'windows' ? '打开 PowerShell 或 Windows Terminal' : '打开终端' }}
          ，运行以下命令：
        </p>
        <div
          class="mb-4 overflow-x-auto rounded-lg bg-gray-900 p-3 font-mono text-xs text-green-400 sm:p-4 sm:text-sm"
        >
          <div class="mb-2"># 全局安装 OpenClaw</div>
          <div class="whitespace-nowrap text-gray-300">
            {{
              platform === 'windows'
                ? 'npm install -g openclaw@latest'
                : 'sudo npm install -g openclaw@latest'
            }}
          </div>
          <div class="mb-2 mt-3"># 国内镜像加速</div>
          <div class="whitespace-nowrap text-gray-300">
            {{
              platform === 'windows'
                ? 'npm install -g openclaw@latest --registry=https://registry.npmmirror.com'
                : 'sudo npm install -g openclaw@latest --registry=https://registry.npmmirror.com'
            }}
          </div>
        </div>
        <p class="text-sm text-gray-600 dark:text-gray-400">运行以下命令验证是否成功：</p>
        <div
          class="mt-3 overflow-x-auto rounded bg-gray-900 p-2 font-mono text-xs text-green-400 sm:p-3 sm:text-sm"
        >
          <div class="whitespace-nowrap text-gray-300">openclaw --version</div>
        </div>
      </div>
    </div>

    <!-- 第三步：运行初始化 -->
    <div class="mb-6 sm:mb-10">
      <h4
        class="mb-3 flex items-center text-lg font-semibold text-gray-800 dark:text-gray-300 sm:mb-4 sm:text-xl"
      >
        <span
          class="mr-2 flex h-6 w-6 items-center justify-center rounded-full bg-purple-500 text-xs font-bold text-white sm:mr-3 sm:h-8 sm:w-8 sm:text-sm"
          >3</span
        >
        运行初始化配置
      </h4>

      <div
        class="mb-4 rounded-xl border border-purple-100 bg-gradient-to-r from-purple-50 to-pink-50 p-4 dark:border-purple-500/40 dark:from-purple-950/30 dark:to-pink-950/30 sm:mb-6 sm:p-6"
      >
        <h5
          class="mb-2 flex items-center text-base font-semibold text-gray-800 dark:text-gray-200 sm:mb-3 sm:text-lg"
        >
          <i class="fas fa-magic mr-2 text-purple-600" />
          Onboard 初始化
        </h5>
        <p class="mb-3 text-sm text-gray-700 dark:text-gray-300 sm:mb-4 sm:text-base">
          执行初始化命令：
        </p>
        <div
          class="mb-4 overflow-x-auto rounded-lg bg-gray-900 p-3 font-mono text-xs text-green-400 sm:p-4 sm:text-sm"
        >
          <div class="whitespace-nowrap text-gray-300">openclaw onboard --install-daemon</div>
        </div>

        <p class="mb-3 text-sm text-gray-700 dark:text-gray-300">
          过程中会依次询问以下选项，按下方说明选择：
        </p>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm text-gray-700 dark:text-gray-300">
            <thead>
              <tr class="border-b border-gray-200 dark:border-gray-700">
                <th class="py-2 pr-4 font-semibold text-gray-800 dark:text-gray-200">选项</th>
                <th class="py-2 font-semibold text-gray-800 dark:text-gray-200">选择</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
              <tr v-for="item in onboardOptions" :key="item.option">
                <td class="py-2 pr-4">{{ item.option }}</td>
                <td class="py-2">
                  <code
                    v-for="(val, idx) in item.values"
                    :key="idx"
                    class="rounded bg-purple-100 px-1 dark:bg-purple-900"
                    >{{ val }}</code
                  >
                  <span v-if="item.note" class="ml-1 text-gray-500 dark:text-gray-400">{{
                    item.note
                  }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div
          class="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-500/40 dark:bg-blue-950/30 sm:p-4"
        >
          <p class="text-sm text-blue-700 dark:text-blue-300">
            初始化结束后会自动部署 Gateway 后台服务。如果提示 "Model check: No auth
            configured"，这是正常的，因为跳过了官方认证，后面会手动配置中转服务。
          </p>
        </div>
      </div>
    </div>

    <!-- 第四步：配置中转服务 -->
    <div class="mb-6 sm:mb-10">
      <h4
        class="mb-3 flex items-center text-lg font-semibold text-gray-800 dark:text-gray-300 sm:mb-4 sm:text-xl"
      >
        <span
          class="mr-2 flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-xs font-bold text-white sm:mr-3 sm:h-8 sm:w-8 sm:text-sm"
          >4</span
        >
        配置中转服务
      </h4>

      <div
        class="mb-4 rounded-xl border border-blue-100 bg-gradient-to-r from-blue-50 to-cyan-50 p-4 dark:border-blue-500/40 dark:from-blue-950/30 dark:to-cyan-950/30 sm:mb-6 sm:p-6"
      >
        <h5
          class="mb-2 flex items-center text-base font-semibold text-gray-800 dark:text-gray-200 sm:mb-3 sm:text-lg"
        >
          <i class="fas fa-cog mr-2 text-blue-600" />
          编辑配置文件
        </h5>
        <p class="mb-3 text-sm text-gray-700 dark:text-gray-300 sm:mb-4 sm:text-base">
          编辑配置文件，添加自定义 provider 连接中转服务：
        </p>

        <div class="mb-4 space-y-2">
          <p class="text-sm font-medium text-gray-800 dark:text-gray-200">配置文件位置：</p>
          <p class="text-sm text-gray-600 dark:text-gray-400">
            <code class="rounded bg-blue-100 px-1 dark:bg-blue-900">{{ configFilePath }}</code>
          </p>
        </div>

        <p class="mb-2 text-sm text-gray-700 dark:text-gray-300">打开配置文件：</p>
        <div
          class="mb-4 overflow-x-auto rounded-lg bg-gray-900 p-3 font-mono text-xs text-green-400 sm:p-4 sm:text-sm"
        >
          <template v-if="platform === 'windows'">
            <div class="mb-2"># Windows (PowerShell)</div>
            <div class="whitespace-nowrap text-gray-300">
              notepad $env:USERPROFILE\.openclaw\openclaw.json
            </div>
            <div class="whitespace-nowrap text-gray-300">
              code $env:USERPROFILE\.openclaw\openclaw.json
            </div>
          </template>
          <template v-else>
            <div class="mb-2"># {{ platform === 'macos' ? 'macOS' : 'Linux' }}</div>
            <div class="whitespace-nowrap text-gray-300">nano ~/.openclaw/openclaw.json</div>
            <div class="whitespace-nowrap text-gray-300">code ~/.openclaw/openclaw.json</div>
          </template>
        </div>

        <div
          class="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-500/40 dark:bg-red-950/30 sm:p-4"
        >
          <h6 class="mb-2 flex items-center font-medium text-red-800 dark:text-red-300">
            <i class="fas fa-exclamation-triangle mr-2" />
            重要提示
          </h6>
          <ul class="space-y-1 text-xs text-red-700 dark:text-red-300 sm:text-sm">
            <li><strong>"baseUrl"</strong> - 必须使用你自己分组的接入地址，不同分组 URL 不同</li>
            <li><strong>"apiKey"</strong> - 必须填写你自己的 API Key</li>
            <li>
              <strong>"model.primary"</strong> - 决定默认使用哪个模型，格式为
              <code class="rounded bg-red-100 px-1 dark:bg-red-900">provider/model-id</code>
            </li>
          </ul>
        </div>

        <p class="mb-2 text-sm font-medium text-gray-800 dark:text-gray-200">
          将以下完整配置覆盖到配置文件中：
        </p>
        <div
          class="mb-4 max-h-[500px] overflow-auto rounded-lg bg-gray-900 p-3 font-mono text-xs text-green-400 sm:p-4 sm:text-sm"
        >
          <pre class="whitespace-pre text-gray-300">{{ configJsonContent }}</pre>
        </div>

        <div
          class="rounded-lg border border-yellow-200 bg-yellow-50 p-3 dark:border-yellow-500/40 dark:bg-yellow-950/30 sm:p-4"
        >
          <p class="text-sm text-yellow-700 dark:text-yellow-400">
            将 <code class="rounded bg-yellow-100 px-1 dark:bg-yellow-900">sk-xxx</code> 替换为你的
            API 密钥，将
            <code class="rounded bg-yellow-100 px-1 dark:bg-yellow-900">your-token</code>
            替换为你想设置的 Gateway Token。
          </p>
        </div>
      </div>
    </div>

    <!-- 第五步：验证配置 -->
    <div class="mb-6 sm:mb-10">
      <h4
        class="mb-3 flex items-center text-lg font-semibold text-gray-800 dark:text-gray-300 sm:mb-4 sm:text-xl"
      >
        <span
          class="mr-2 flex h-6 w-6 items-center justify-center rounded-full bg-teal-500 text-xs font-bold text-white sm:mr-3 sm:h-8 sm:w-8 sm:text-sm"
          >5</span
        >
        验证配置
      </h4>

      <div
        class="rounded-xl border border-teal-100 bg-gradient-to-r from-teal-50 to-cyan-50 p-4 dark:border-teal-500/40 dark:from-teal-950/30 dark:to-cyan-950/30 sm:p-6"
      >
        <p class="mb-3 text-sm text-gray-700 dark:text-gray-300 sm:mb-4 sm:text-base">
          配置完成后，运行以下命令验证：
        </p>
        <div
          class="mb-4 overflow-x-auto rounded-lg bg-gray-900 p-3 font-mono text-xs text-green-400 sm:p-4 sm:text-sm"
        >
          <div class="mb-2"># 检查配置问题</div>
          <div class="whitespace-nowrap text-gray-300">openclaw doctor</div>
          <div class="mb-2 mt-3"># 查看已配置的模型</div>
          <div class="whitespace-nowrap text-gray-300">openclaw models list</div>
        </div>

        <div
          class="rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-500/40 dark:bg-green-950/30 sm:p-4"
        >
          <p class="text-sm text-green-700 dark:text-green-300">
            如果 <code class="rounded bg-green-100 px-1 dark:bg-green-900">models list</code>
            显示你配置的模型且 Auth 为 yes，说明配置成功！
          </p>
        </div>
      </div>
    </div>

    <!-- 第六步：启动使用 -->
    <div class="mb-6 sm:mb-10">
      <h4
        class="mb-3 flex items-center text-lg font-semibold text-gray-800 dark:text-gray-300 sm:mb-4 sm:text-xl"
      >
        <span
          class="mr-2 flex h-6 w-6 items-center justify-center rounded-full bg-orange-500 text-xs font-bold text-white sm:mr-3 sm:h-8 sm:w-8 sm:text-sm"
          >6</span
        >
        启动使用
      </h4>

      <div
        class="rounded-xl border border-orange-100 bg-gradient-to-r from-orange-50 to-yellow-50 p-4 dark:border-orange-500/40 dark:from-orange-950/30 dark:to-yellow-950/30 sm:p-6"
      >
        <p class="mb-3 text-sm text-gray-700 dark:text-gray-300 sm:mb-4 sm:text-base">
          启动 Gateway 服务开始使用：
        </p>

        <div class="space-y-4">
          <div>
            <h6 class="mb-2 text-sm font-medium text-gray-800 dark:text-gray-300 sm:text-base">
              启动 Gateway 服务
            </h6>
            <div
              class="overflow-x-auto rounded-lg bg-gray-900 p-3 font-mono text-xs text-green-400 sm:p-4 sm:text-sm"
            >
              <div class="mb-2"># 部署并启动后台服务</div>
              <div class="whitespace-nowrap text-gray-300">openclaw gateway install</div>
              <div class="whitespace-nowrap text-gray-300">openclaw gateway start</div>
              <div class="mb-2 mt-3"># 或前台运行（可以看到日志，调试用）</div>
              <div class="whitespace-nowrap text-gray-300">openclaw gateway --verbose</div>
            </div>
          </div>

          <div>
            <h6 class="mb-2 text-sm font-medium text-gray-800 dark:text-gray-300 sm:text-base">
              启动 TUI 交互界面
            </h6>
            <div
              class="overflow-x-auto rounded-lg bg-gray-900 p-3 font-mono text-xs text-green-400 sm:p-4 sm:text-sm"
            >
              <div class="mb-2"># 设置 Gateway Token（与配置文件中 gateway.auth.token 一致）</div>
              <template v-if="platform === 'windows'">
                <div class="whitespace-nowrap text-gray-300">
                  $env:OPENCLAW_GATEWAY_TOKEN="your-token"
                </div>
              </template>
              <template v-else>
                <div class="whitespace-nowrap text-gray-300">
                  export OPENCLAW_GATEWAY_TOKEN=your-token
                </div>
              </template>
              <div class="mt-2 whitespace-nowrap text-gray-300">openclaw tui</div>
            </div>
          </div>

          <div>
            <h6 class="mb-2 text-sm font-medium text-gray-800 dark:text-gray-300 sm:text-base">
              命令行对话
            </h6>
            <div
              class="overflow-x-auto rounded bg-gray-900 p-2 font-mono text-xs text-green-400 sm:p-3 sm:text-sm"
            >
              <div class="whitespace-nowrap text-gray-300">
                openclaw agent --agent main --message "Hello"
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 常用命令参考 -->
    <div class="mb-6 sm:mb-10">
      <h4
        class="mb-3 flex items-center text-lg font-semibold text-gray-800 dark:text-gray-300 sm:mb-4 sm:text-xl"
      >
        <i class="fas fa-terminal mr-2 text-indigo-600 sm:mr-3" />
        常用命令参考
      </h4>

      <div class="space-y-3">
        <details
          v-for="group in commandGroups"
          :key="group.title"
          class="rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800"
        >
          <summary
            class="cursor-pointer p-3 text-sm font-medium text-gray-800 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 sm:p-4 sm:text-base"
          >
            {{ group.title }}
          </summary>
          <div class="px-3 pb-3 sm:px-4 sm:pb-4">
            <div class="overflow-x-auto">
              <table class="w-full text-left text-xs text-gray-600 dark:text-gray-400 sm:text-sm">
                <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
                  <tr v-for="cmd in group.commands" :key="cmd.command">
                    <td class="py-1.5 pr-4">
                      <code class="whitespace-nowrap rounded bg-gray-200 px-1 dark:bg-gray-700">{{
                        cmd.command
                      }}</code>
                    </td>
                    <td class="py-1.5">{{ cmd.desc }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </details>
      </div>
    </div>

    <!-- 多 Provider 配置 -->
    <div class="mb-6 sm:mb-10">
      <h4
        class="mb-3 flex items-center text-lg font-semibold text-gray-800 dark:text-gray-300 sm:mb-4 sm:text-xl"
      >
        <i class="fas fa-layer-group mr-2 text-violet-600 sm:mr-3" />
        多 Provider 配置
      </h4>

      <div
        class="rounded-xl border border-violet-100 bg-gradient-to-r from-violet-50 to-purple-50 p-4 dark:border-violet-500/40 dark:from-violet-950/30 dark:to-purple-950/30 sm:p-6"
      >
        <p class="mb-3 text-sm text-gray-700 dark:text-gray-300 sm:text-base">
          可以在同一个配置文件中配置多个 provider，实现多模型切换：
        </p>
        <div
          class="mb-4 overflow-x-auto rounded-lg bg-gray-900 p-3 font-mono text-xs text-green-400 sm:p-4 sm:text-sm"
        >
          <pre class="whitespace-pre text-gray-300">{{ multiProviderExample }}</pre>
        </div>
        <div
          class="overflow-x-auto rounded-lg bg-gray-900 p-3 font-mono text-xs text-green-400 sm:p-4 sm:text-sm"
        >
          <div class="mb-2"># 切换默认模型</div>
          <div class="whitespace-nowrap text-gray-300">
            openclaw models set nexus/claude-opus-4-6
          </div>
          <div class="whitespace-nowrap text-gray-300">openclaw models set openai/gpt-5.2</div>
          <div class="mb-2 mt-3"># 查看所有可用模型</div>
          <div class="whitespace-nowrap text-gray-300">openclaw models list</div>
        </div>
        <p class="mt-3 text-xs text-violet-700 dark:text-violet-400">
          model.primary 格式为
          <code class="rounded bg-violet-100 px-1 dark:bg-violet-900">provider名/模型ID</code
          >。切换时使用对应的 provider 前缀。
        </p>
      </div>
    </div>

    <!-- 常见配置问题 -->
    <div class="mb-8">
      <h4
        class="mb-3 flex items-center text-lg font-semibold text-gray-800 dark:text-gray-300 sm:mb-4 sm:text-xl"
      >
        <i class="fas fa-wrench mr-2 text-red-600 sm:mr-3" />
        常见配置问题
      </h4>

      <div class="space-y-3">
        <details
          v-for="faq in faqItems"
          :key="faq.title"
          class="rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800"
        >
          <summary
            class="cursor-pointer p-3 text-sm font-medium text-gray-800 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 sm:p-4 sm:text-base"
          >
            {{ faq.title }}
          </summary>
          <div class="px-3 pb-3 text-gray-600 dark:text-gray-400 sm:px-4 sm:pb-4">
            <div v-html="faq.content"></div>
          </div>
        </details>

        <!-- 错误信息表 -->
        <details
          class="rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800"
        >
          <summary
            class="cursor-pointer p-3 text-sm font-medium text-gray-800 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 sm:p-4 sm:text-base"
          >
            常见错误信息与解决方案
          </summary>
          <div class="px-3 pb-3 sm:px-4 sm:pb-4">
            <div class="overflow-x-auto">
              <table class="w-full text-left text-xs text-gray-600 dark:text-gray-400 sm:text-sm">
                <thead>
                  <tr class="border-b border-gray-200 dark:border-gray-700">
                    <th class="py-2 pr-4 font-semibold text-gray-800 dark:text-gray-200">
                      错误信息
                    </th>
                    <th class="py-2 font-semibold text-gray-800 dark:text-gray-200">解决方案</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
                  <tr v-for="err in errorSolutions" :key="err.error">
                    <td class="py-1.5 pr-4">
                      <code class="rounded bg-gray-200 px-1 dark:bg-gray-700">{{ err.error }}</code>
                    </td>
                    <td class="py-1.5">{{ err.solution }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </details>

        <!-- 故障排查命令 -->
        <div
          class="rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-500/40 dark:bg-blue-950/30 sm:p-4"
        >
          <h6 class="mb-2 font-medium text-blue-800 dark:text-blue-300">故障排查命令</h6>
          <div
            class="overflow-x-auto rounded bg-gray-900 p-2 font-mono text-xs text-green-400 sm:p-3 sm:text-sm"
          >
            <div class="mb-2"># 检查配置问题</div>
            <div class="whitespace-nowrap text-gray-300">openclaw doctor</div>
            <div class="mb-2 mt-2"># 自动修复</div>
            <div class="whitespace-nowrap text-gray-300">openclaw doctor --fix</div>
            <div class="mb-2 mt-2"># 查看模型状态</div>
            <div class="whitespace-nowrap text-gray-300">openclaw models status</div>
            <div class="mb-2 mt-2"># 查看日志</div>
            <div class="whitespace-nowrap text-gray-300">openclaw logs --follow</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 配置 Telegram -->
    <div class="mb-8">
      <h4
        class="mb-3 flex items-center text-lg font-semibold text-gray-800 dark:text-gray-300 sm:mb-4 sm:text-xl"
      >
        <i class="fab fa-telegram mr-2 text-sky-500 sm:mr-3" />
        配置 Telegram（可选）
      </h4>

      <div
        class="rounded-xl border border-sky-100 bg-gradient-to-r from-sky-50 to-blue-50 p-4 dark:border-sky-500/40 dark:from-sky-950/30 dark:to-blue-950/30 sm:p-6"
      >
        <p class="mb-4 text-sm text-gray-700 dark:text-gray-300 sm:text-base">
          OpenClaw 支持通过 Telegram 作为对话界面。以下为配置步骤：
        </p>

        <div class="space-y-4">
          <div>
            <h6 class="mb-2 text-sm font-medium text-gray-800 dark:text-gray-300 sm:text-base">
              1. 获取 Telegram Bot Token
            </h6>
            <ul class="list-inside list-disc space-y-1 text-sm text-gray-600 dark:text-gray-400">
              <li>在 Telegram 中搜索 @BotFather</li>
              <li>发送 /newbot，按提示设置 bot 名称</li>
              <li>
                获得 Bot Token（格式：<code class="rounded bg-sky-100 px-1 dark:bg-sky-900"
                  >123456789:ABCdefGHI...</code
                >）
              </li>
            </ul>
          </div>

          <div>
            <h6 class="mb-2 text-sm font-medium text-gray-800 dark:text-gray-300 sm:text-base">
              2. 启用 Telegram 插件
            </h6>
            <div
              class="overflow-x-auto rounded bg-gray-900 p-2 font-mono text-xs text-green-400 sm:p-3 sm:text-sm"
            >
              <div class="whitespace-nowrap text-gray-300">openclaw plugins enable telegram</div>
            </div>
          </div>

          <div>
            <h6 class="mb-2 text-sm font-medium text-gray-800 dark:text-gray-300 sm:text-base">
              3. 配置 Bot Token
            </h6>
            <div
              class="overflow-x-auto rounded bg-gray-900 p-2 font-mono text-xs text-green-400 sm:p-3 sm:text-sm"
            >
              <div class="whitespace-nowrap text-gray-300">
                openclaw config set channels.telegram.botToken "YOUR_BOT_TOKEN"
              </div>
            </div>
          </div>

          <div>
            <h6 class="mb-2 text-sm font-medium text-gray-800 dark:text-gray-300 sm:text-base">
              4. 启动 Gateway 并配对
            </h6>
            <div
              class="overflow-x-auto rounded bg-gray-900 p-2 font-mono text-xs text-green-400 sm:p-3 sm:text-sm"
            >
              <div class="mb-2"># 启动 Gateway</div>
              <div class="whitespace-nowrap text-gray-300">openclaw gateway</div>
              <div class="mb-2 mt-3"># 在 Telegram 中给你的 bot 发消息后</div>
              <div class="mb-2"># Bot 会返回验证码，在终端执行：</div>
              <div class="whitespace-nowrap text-gray-300">
                openclaw pairing approve telegram YOUR_CODE
              </div>
            </div>
          </div>
        </div>

        <div
          class="mt-4 rounded-lg border border-sky-200 bg-sky-50 p-3 dark:border-sky-500/40 dark:bg-sky-950/30"
        >
          <p class="text-sm text-sky-700 dark:text-sky-300">
            完成配对后即可在 Telegram 中与 AI 对话！更多配置选项请参考
            <a
              class="underline hover:text-sky-800 dark:hover:text-sky-200"
              href="https://docs.openclaw.ai"
              target="_blank"
              >OpenClaw 官方文档</a
            >。
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import NodeInstallTutorial from './NodeInstallTutorial.vue'

const props = defineProps({
  platform: {
    type: String,
    required: true,
    validator: (value) => ['windows', 'macos', 'linux'].includes(value)
  }
})

const openclawBaseUrl = 'https://ggbond2.me/api'

const configFilePath = computed(() =>
  props.platform === 'windows'
    ? 'C:\\Users\\用户名\\.openclaw\\openclaw.json'
    : '~/.openclaw/openclaw.json'
)

const onboardOptions = [
  { option: 'Security 安全确认', values: ['Yes'], note: '' },
  { option: 'Onboarding mode', values: ['Manual'], note: '（手动配置）' },
  { option: 'What do you want to set up?', values: ['Local gateway (this machine)'], note: '' },
  { option: 'Model/auth provider', values: ['Skip for now'], note: '' },
  { option: 'Gateway port', values: ['18789'], note: '（默认）' },
  { option: 'Gateway bind', values: ['LAN (0.0.0.0)'], note: '' },
  { option: 'Gateway auth', values: ['Token'], note: '' },
  { option: 'Tailscale exposure', values: ['Off'], note: '' },
  { option: 'Configure chat channels now?', values: ['No'], note: '（先跳过）' },
  { option: 'Set GOOGLE_PLACES_API_KEY?', values: ['No'], note: '' },
  { option: 'Configure skills now?', values: ['No'], note: '' }
]

const configJsonContent = computed(() => {
  const url = openclawBaseUrl
  return JSON.stringify(
    {
      agents: {
        defaults: {
          workspace: '~/clawd',
          model: { primary: 'nexus/claude-opus-4-6-20260205' },
          compaction: { mode: 'safeguard', reserveTokensFloor: 40000 },
          thinkingDefault: 'high',
          timeoutSeconds: 900,
          maxConcurrent: 4,
          subagents: { maxConcurrent: 8 }
        }
      },
      models: {
        mode: 'merge',
        providers: {
          nexus: {
            baseUrl: url,
            apiKey: 'sk-xxx',
            api: 'anthropic-messages',
            models: [
              {
                id: 'claude-sonnet-4-5-20250929',
                name: 'Claude Sonnet 4.5',
                contextWindow: 200000,
                maxTokens: 64000,
                reasoning: true,
                input: ['text', 'image'],
                cost: { input: 3, output: 15, cacheRead: 0.3, cacheWrite: 3.75 }
              },
              {
                id: 'claude-sonnet-4-6',
                name: 'Claude Sonnet 4.6',
                contextWindow: 200000,
                maxTokens: 64000,
                reasoning: true,
                input: ['text', 'image'],
                cost: { input: 3, output: 15, cacheRead: 0.3, cacheWrite: 3.75 }
              },
              {
                id: 'claude-opus-4-5-20251101',
                name: 'Claude Opus 4.5',
                contextWindow: 200000,
                maxTokens: 64000,
                reasoning: true,
                input: ['text', 'image'],
                cost: { input: 5, output: 25, cacheRead: 0.5, cacheWrite: 6.25 }
              },
              {
                id: 'claude-opus-4-6-20260205',
                name: 'Claude Opus 4.6',
                contextWindow: 200000,
                maxTokens: 128000,
                reasoning: true,
                input: ['text', 'image'],
                cost: { input: 5, output: 25, cacheRead: 0.5, cacheWrite: 6.25 }
              }
            ]
          }
        }
      },
      messages: { ackReactionScope: 'group-mentions' },
      commands: { native: 'auto', nativeSkills: 'auto' },
      gateway: {
        port: 18789,
        mode: 'local',
        bind: 'lan',
        auth: { mode: 'token', token: 'your-token' },
        tailscale: { mode: 'off', resetOnExit: false }
      },
      skills: { install: { nodeManager: 'npm' } }
    },
    null,
    2
  )
})

const multiProviderExample = computed(() => {
  const url = openclawBaseUrl
  return `# 在 models.providers 中添加多个 provider
"providers": {
  "nexus": {
    "baseUrl": "${url}",
    "apiKey": "sk-xxx",
    "api": "anthropic-messages",
    "models": [...]
  },
  "openai": {
    "baseUrl": "https://...",
    "apiKey": "sk-xxx",
    "api": "openai-responses",
    "models": [...]
  }
}`
})

const commandGroups = [
  {
    title: 'Gateway 管理',
    commands: [
      { command: 'openclaw gateway', desc: '前台启动 Gateway' },
      { command: 'openclaw gateway --verbose', desc: '前台启动并显示详细日志' },
      { command: 'openclaw gateway install', desc: '部署 Gateway 后台服务' },
      { command: 'openclaw gateway start', desc: '启动后台服务' },
      { command: 'openclaw gateway stop', desc: '停止后台服务' },
      { command: 'openclaw gateway restart', desc: '重启服务（改完配置后执行）' },
      { command: 'openclaw gateway status', desc: '查看运行状态' },
      { command: 'openclaw gateway health', desc: '健康检查' },
      { command: 'openclaw gateway uninstall', desc: '卸载后台服务' }
    ]
  },
  {
    title: '状态与诊断',
    commands: [
      { command: 'openclaw status', desc: '快速状态总览' },
      { command: 'openclaw status --all', desc: '完整诊断报告' },
      { command: 'openclaw doctor', desc: '检查配置问题' },
      { command: 'openclaw doctor --fix', desc: '自动修复配置问题' },
      { command: 'openclaw models list', desc: '查看已配置的模型' },
      { command: 'openclaw models set <model>', desc: '设置默认模型' },
      { command: 'openclaw configure', desc: '启动交互式配置' }
    ]
  },
  {
    title: '代理与会话',
    commands: [
      { command: 'openclaw agents list', desc: '列出所有代理' },
      { command: 'openclaw agents add [name]', desc: '添加新代理' },
      { command: 'openclaw sessions', desc: '查看活跃会话' },
      { command: 'openclaw tui', desc: '启动 TUI 交互界面' },
      { command: 'openclaw logs --follow', desc: '实时查看日志' },
      { command: 'openclaw dashboard', desc: '打开 Web 管理面板' }
    ]
  },
  {
    title: '系统管理',
    commands: [
      { command: 'openclaw update', desc: '更新到最新版本' },
      { command: 'openclaw memory search <query>', desc: '语义搜索记忆库' },
      { command: 'openclaw daemon install', desc: '开机自启服务' },
      { command: 'openclaw daemon uninstall', desc: '卸载自启服务' },
      { command: 'openclaw reset', desc: '重置本地配置' },
      { command: 'openclaw uninstall', desc: '完全卸载 OpenClaw' }
    ]
  }
]

const faqItems = [
  {
    title: 'baseUrl 格式错误（最常见）',
    content:
      '<div class="space-y-2 text-sm">' +
      '<p class="flex items-center gap-2"><i class="fas fa-check-circle text-green-500"></i>' +
      '<span>正确：<code class="rounded bg-green-100 px-1 dark:bg-green-900">"baseUrl": "https://xxx.itssx.com/api"</code></span></p>' +
      '<p class="flex items-center gap-2"><i class="fas fa-times-circle text-red-500"></i>' +
      '<span>错误：<code class="rounded bg-red-100 px-1 dark:bg-red-900">"baseUrl": "https://xxx.itssx.com/api/"</code>（末尾多了斜杠）</span></p>' +
      '<p class="flex items-center gap-2"><i class="fas fa-times-circle text-red-500"></i>' +
      '<span>错误：<code class="rounded bg-red-100 px-1 dark:bg-red-900">"baseUrl": "https://xxx.itssx.com"</code>（缺少 /api）</span></p>' +
      '<p class="flex items-center gap-2"><i class="fas fa-times-circle text-red-500"></i>' +
      '<span>错误：<code class="rounded bg-red-100 px-1 dark:bg-red-900">"baseUrl": "https://xxx.itssx.com/v1"</code>（路径错误）</span></p>' +
      '</div>'
  },
  {
    title: 'gateway.mode 未设置',
    content:
      '<p class="mb-2 text-sm">必须设置 gateway.mode，否则报错 "Gateway start blocked"：</p>' +
      '<div class="overflow-x-auto rounded bg-gray-900 p-2 font-mono text-xs text-green-400 sm:p-3 sm:text-sm">' +
      '<pre class="whitespace-pre text-gray-300">"gateway": { "mode": "local", "port": 18789 }</pre></div>'
  },
  {
    title: 'bind: "lan" 时 Gateway 启动失败',
    content:
      '<p class="mb-2 text-sm">gateway.bind 为 "lan" 时必须配置 controlUi.allowedOrigins。在 gateway 中添加：</p>' +
      '<div class="overflow-x-auto rounded bg-gray-900 p-2 font-mono text-xs text-green-400 sm:p-3 sm:text-sm">' +
      '<pre class="whitespace-pre text-gray-300">"controlUi": {\n  "allowedOrigins": ["http://127.0.0.1:18789"]\n}</pre></div>'
  },
  {
    title: '模型格式错误',
    content:
      '<div class="space-y-2 text-sm">' +
      '<p class="flex items-center gap-2"><i class="fas fa-check-circle text-green-500"></i>' +
      '<span>正确：<code class="rounded bg-green-100 px-1 dark:bg-green-900">"primary": "nexus/claude-opus-4-6"</code></span></p>' +
      '<p class="flex items-center gap-2"><i class="fas fa-times-circle text-red-500"></i>' +
      '<span>错误：<code class="rounded bg-red-100 px-1 dark:bg-red-900">"primary": "claude-opus-4-6"</code>（缺少 provider 前缀）</span></p>' +
      '</div>'
  }
]

const errorSolutions = [
  { error: 'No API key found', solution: '检查 apiKey 配置是否正确' },
  { error: 'Gateway start blocked', solution: '添加 "mode": "local" 到 gateway 配置' },
  { error: 'non-loopback Control UI requires...', solution: '添加 controlUi.allowedOrigins 配置' },
  { error: 'Connection refused', solution: '检查 baseUrl 和网络连接' },
  { error: '401 Unauthorized', solution: '检查 apiKey 是否正确' },
  { error: '404 Not Found', solution: '检查 baseUrl 路径是否正确' }
]
</script>
