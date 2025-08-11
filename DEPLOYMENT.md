# 部署说明

## 新的 API 密钥配置方式

现在用户可以直接在应用中输入和保存 DeepSeek API 密钥，无需在 Vercel 中配置环境变量！

### 使用方法

1. **部署到 Vercel**：直接推送代码即可，无需配置环境变量
2. **用户首次使用**：点击右上角的"配置"按钮
3. **输入 API 密钥**：在弹出窗口中输入你的 DeepSeek API 密钥
4. **保存配置**：点击"保存"按钮，密钥会保存在浏览器的 localStorage 中
5. **开始使用**：配置完成后，应用即可正常使用

### 获取 API 密钥

- **DeepSeek API 密钥**：访问 https://platform.deepseek.com/
- **Gemini API 密钥**（如果使用）：访问 https://makersuite.google.com/app/apikey

### 优势

- ✅ **无需服务器配置**：用户可以直接在应用中配置
- ✅ **更安全**：API 密钥只存储在用户本地浏览器中
- ✅ **更灵活**：用户可以随时更改或清除 API 密钥
- ✅ **部署简单**：直接推送到 Vercel 即可部署

### 本地开发

在本地开发时，仍然可以创建 `.env.local` 文件（可选）：

```bash
DEEPSEEK_API_KEY=your_actual_api_key_here
GEMINI_API_KEY=your_actual_gemini_key_here
```

### 注意事项

- API 密钥会保存在用户的浏览器 localStorage 中
- 清除浏览器数据会导致 API 密钥丢失
- 每个用户需要单独配置自己的 API 密钥
- 如果用户没有配置 API 密钥，应用会显示配置提示
