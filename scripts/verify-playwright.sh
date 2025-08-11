#!/bin/bash

echo "🔍 验证 Playwright 设置..."

# 检查 Playwright 是否已安装
if ! npx playwright --version &> /dev/null; then
    echo "❌ Playwright 未安装"
    exit 1
fi

echo "✅ Playwright 已安装: $(npx playwright --version)"

# 检查配置文件
if [ -f "playwright.config.ts" ]; then
    echo "✅ playwright.config.ts 配置文件存在"
else
    echo "❌ playwright.config.ts 配置文件不存在"
fi

# 检查测试文件
test_files=(
    "tests/e2e/smoke.spec.ts"
    "tests/e2e/app.spec.ts"
    "tests/e2e/lexical-editor.spec.ts"
    "tests/e2e/global-setup.ts"
    "tests/e2e/utils/test-helpers.ts"
    "tests/e2e/utils/electron-helpers.ts"
)

for file in "${test_files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file 存在"
    else
        echo "❌ $file 不存在"
    fi
done

# 检查 package.json 脚本
if grep -q "test:e2e" package.json; then
    echo "✅ package.json 中包含 e2e 测试脚本"
else
    echo "❌ package.json 中缺少 e2e 测试脚本"
fi

# 运行快速测试验证
echo ""
echo "🧪 运行快速测试验证..."
if npx playwright test smoke.spec.ts --project=electron --reporter=list &> /dev/null; then
    echo "✅ 冒烟测试通过"
else
    echo "❌ 冒烟测试失败"
fi

echo ""
echo "📊 测试统计:"
npx playwright test --list | grep -c "test"

echo ""
echo "🎉 Playwright 设置验证完成！"
echo ""
echo "🚀 可用的测试命令:"
echo "  pnpm test:e2e              # 运行所有 e2e 测试"
echo "  pnpm test:e2e:electron     # 运行 Electron 专用测试"
echo "  pnpm test:e2e:ui           # 运行测试并显示 UI 界面"
echo "  pnpm test:e2e:headed       # 在有头模式下运行测试"
echo "  pnpm test:e2e:debug        # 调试模式运行测试"
echo "  pnpm test:e2e:report       # 显示测试报告"
echo "  pnpm test:all              # 运行所有测试"
