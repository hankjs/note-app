#!/bin/bash

# E2E 测试快速启动脚本

echo "🚀 启动 Note App E2E 测试..."

# 检查是否安装了 Playwright
if ! command -v npx &> /dev/null; then
    echo "❌ 错误: 未找到 npx，请确保已安装 Node.js"
    exit 1
fi

# 检查 Playwright 是否已安装
if ! npx playwright --version &> /dev/null; then
    echo "📦 安装 Playwright..."
    pnpm add -D @playwright/test
    npx playwright install
fi

# 显示可用的测试命令
echo ""
echo "📋 可用的测试命令:"
echo "  pnpm test:e2e          - 运行所有 e2e 测试"
echo "  pnpm test:e2e:electron - 运行 Electron 专用测试"
echo "  pnpm test:e2e:ui       - 运行测试并显示 UI 界面"
echo "  pnpm test:e2e:headed   - 在有头模式下运行测试"
echo "  pnpm test:e2e:debug    - 调试模式运行测试"
echo "  pnpm test:e2e:report   - 显示测试报告"
echo "  pnpm test:all          - 运行所有测试（单元测试 + e2e 测试）"
echo ""

# 询问用户想要运行哪种测试
read -p "请选择测试类型 (1-7，或按 Enter 运行默认测试): " choice

case $choice in
    1)
        echo "🔍 运行所有 e2e 测试..."
        pnpm test:e2e
        ;;
    2)
        echo "⚡ 运行 Electron 专用测试..."
        pnpm test:e2e:electron
        ;;
    3)
        echo "🎨 运行测试并显示 UI 界面..."
        pnpm test:e2e:ui
        ;;
    4)
        echo "👁️  在有头模式下运行测试..."
        pnpm test:e2e:headed
        ;;
    5)
        echo "🐛 调试模式运行测试..."
        pnpm test:e2e:debug
        ;;
    6)
        echo "📊 显示测试报告..."
        pnpm test:e2e:report
        ;;
    7)
        echo "🧪 运行所有测试..."
        pnpm test:all
        ;;
    *)
        echo "🔍 运行默认 e2e 测试..."
        pnpm test:e2e
        ;;
esac

echo ""
echo "✅ 测试完成！"
