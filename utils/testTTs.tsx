import React, { useState } from 'react';
import { TextToSpeech } from '@capacitor-community/text-to-speech';

const TTSDebugTool = () => {
  const [status, setStatus] = useState<string>('');
  const [languages, setLanguages] = useState<string[]>([]);

  const runFullDiagnostics = async () => {
    let report = '=== TTS 诊断报告 ===\n\n';
    
    try {
      const { supported } = await TextToSpeech.isSupported();
      report += `✓ TTS 支持: ${supported}\n`;
      
      if (!supported) {
        setStatus(report + '\n❌ TTS 不支持');
        return;
      }
      
      const { languages: langs } = await TextToSpeech.getSupportedLanguages();
      setLanguages(langs);
      report += `✓ 可用语言数: ${langs.length}\n`;
      report += `✓ 语言列表: ${langs.join(', ')}\n\n`;
      
      const chineseLanguages = langs.filter(l => 
        l.toLowerCase().includes('zh') || 
        l.toLowerCase().includes('cn') ||
        l.toLowerCase().includes('cmn')
      );
      report += `✓ 中文语言: ${chineseLanguages.join(', ')}\n\n`;
      
      report += '开始朗读测试...\n';
      await TextToSpeech.speak({
        text: '你好，这是语音测试',
        lang: 'zh-CN',
        rate: 1.0,
        pitch: 1.0,
        volume: 1.0,
      });
      
      report += '✅ 朗读测试成功！\n';
      setStatus(report);
      alert('✅ TTS 完全正常！');
      
    } catch (error) {
      report += `\n❌ 错误: ${JSON.stringify(error, null, 2)}`;
      setStatus(report);
      console.error('TTS Error:', error);
    }
  };

  const testSpeak = async (text: string) => {
    try {
      await TextToSpeech.speak({
        text: text,
        lang: 'zh-CN',
        rate: 1.0,
        pitch: 1.0,
        volume: 1.0,
      });
      alert('✅ 朗读成功');
    } catch (error) {
      alert(`❌ 朗读失败: ${error}`);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>TTS 调试工具</h2>
      
      <button onClick={runFullDiagnostics}>
        运行完整诊断
      </button>
      
      <button onClick={() => testSpeak('你好，世界')}>
        测试朗读
      </button>
      
      <button onClick={() => testSpeak('这是一段较长的测试文本，用来验证语音合成是否正常工作。')}>
        测试长文本
      </button>
      
      <pre style={{ 
        background: '#f5f5f5', 
        padding: '10px', 
        marginTop: '20px',
        whiteSpace: 'pre-wrap'
      }}>
        {status}
      </pre>
      
      {languages.length > 0 && (
        <div style={{ marginTop: '20px' }}>
          <h3>可用语言：</h3>
          <ul>
            {languages.map((lang, i) => (
              <li key={i}>{lang}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default TTSDebugTool;