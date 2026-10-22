import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, Sparkles, Plus, Download, Upload, Play, Code2, Image as ImageIcon, 
  Link as LinkIcon, MessageSquare, Database, Settings, Trash2, Edit3, 
  Check, RefreshCw, Send, Terminal, Copy, CheckCircle2, ChevronRight,
  BrainCircuit, Cpu, Layers, ExternalLink, Sliders, ShieldCheck, Eye, Sparkle
} from 'lucide-react';
import { sound } from '../../utils/sound';
import { writeVfsFile, readVfsFile, listVfsFiles } from '../../utils/vfs';

export interface DatasetItem {
  id: string;
  prompt: string;
  response: string;
}

export interface ImageKnowledgeItem {
  id: string;
  title: string;
  imageUrl: string;
  description: string;
  tags: string[];
}

export interface LinkKnowledgeItem {
  id: string;
  title: string;
  url: string;
  contentSnippet: string;
}

export interface CustomAIModel {
  id: string;
  name: string;
  avatar: string;
  description: string;
  persona: string;
  systemInstruction: string;
  category: string;
  version: string;
  createdAt: string;
  updatedAt: string;
  author: string;
  // Capabilities
  enableCoding: boolean;
  enableImageGen: boolean;
  enableWebSearch: boolean;
  // Hyperparameters
  temperature: number;
  topP: number;
  reasoningDepth: 'low' | 'standard' | 'deep';
  // Trained Knowledge
  dataset: DatasetItem[];
  imageKnowledge: ImageKnowledgeItem[];
  linkKnowledge: LinkKnowledgeItem[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  codeBlocks?: { language: string; code: string }[];
  generatedImages?: string[];
}

const DEFAULT_MODELS: CustomAIModel[] = [
  {
    id: 'model-prime-coder',
    name: '넥서스 코더 (Nexus Coder)',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=nexus',
    description: '알고리즘, 웹 풀스택, 파이썬 및 실시간 코드 실행 샌드박스를 완벽 지원하는 최고 성능 코딩 전용 AI',
    persona: '정확하고 논리적이며 주석과 최적화 방안을 상세히 제시하는 시니어 소프트웨어 아키텍트',
    systemInstruction: '당신은 최고의 시니어 개발자 AI입니다. 사용자의 질문에 대해 완성된 클린 코드, 아키텍처 설명, 실행 예시를 친절하고 명확하게 제공하세요.',
    category: '코딩 / 엔지니어링',
    version: '1.2.0',
    createdAt: new Date().toISOString().slice(0, 10),
    updatedAt: new Date().toISOString().slice(0, 10),
    author: 'KETO Lab',
    enableCoding: true,
    enableImageGen: true,
    enableWebSearch: true,
    temperature: 0.2,
    topP: 0.9,
    reasoningDepth: 'deep',
    dataset: [
      {
        id: 'd-1',
        prompt: '리액트 커스텀 훅 만드는 법 알려줘',
        response: '리액트 커스텀 훅은 반복되는 상태 로직을 분리하여 재사용할 수 있게 해줍니다. `use` 접두사를 붙여 작성합니다.'
      },
      {
        id: 'd-2',
        prompt: '파이썬으로 퀵 정렬 구현해줘',
        response: '```python\ndef quick_sort(arr):\n    if len(arr) <= 1:\n        return arr\n    pivot = arr[len(arr) // 2]\n    left = [x for x in arr if x < pivot]\n    middle = [x for x in arr if x == pivot]\n    right = [x for x in arr if x > pivot]\n    return quick_sort(left) + middle + quick_sort(right)\n```'
      }
    ],
    imageKnowledge: [
      {
        id: 'img-k1',
        title: '다크 테크놀로지 UI 아키텍처',
        imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop',
        description: '글래스모피즘과 네온 사이버펑크 팔레트의 미래지향적 인터페이스 디자인 패턴',
        tags: ['UI/UX', 'Glassmorphism', 'Neon']
      }
    ],
    linkKnowledge: [
      {
        id: 'lnk-k1',
        title: 'Vite & React 19 최적화 가이드',
        url: 'https://react.dev',
        contentSnippet: 'React 19의 Action 기능 및 자동 메모이제이션 컴파일러 구조'
      }
    ]
  },
  {
    id: 'model-pixel-artist',
    name: '아티산 AI (Artisan AI Studio)',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=artisan',
    description: '감각적인 비주얼 일러스트, 픽셀아트, 3D 렌더링 및 스타일 프롬프트를 창조하는 시각 디자인 전문 모델',
    persona: '풍부한 상상력과 색채 감각을 지닌 크리에이티브 아트 디렉터',
    systemInstruction: '당신은 상상력 넘치는 디지털 아티스트 AI입니다. 사용자의 아이디어를 바탕으로 매혹적인 묘사와 함께 즉각적인 이미지 생성을 지원합니다.',
    category: '이미지 / 크리에이티브',
    version: '1.0.0',
    createdAt: new Date().toISOString().slice(0, 10),
    updatedAt: new Date().toISOString().slice(0, 10),
    author: 'KETO Lab',
    enableCoding: true,
    enableImageGen: true,
    enableWebSearch: false,
    temperature: 0.85,
    topP: 0.95,
    reasoningDepth: 'standard',
    dataset: [
      {
        id: 'd-art-1',
        prompt: '사이버펑크 고양이 그려줘',
        response: '네온 불빛이 쏟아지는 밤의 도시 골목길에서 빛나는 사이버 고글을 쓴 고양이 일러스트를 생성합니다.'
      }
    ],
    imageKnowledge: [],
    linkKnowledge: []
  }
];

interface AICreatorAppProps {
  onClose?: () => void;
  customUser?: any;
}

export const AICreatorApp: React.FC<AICreatorAppProps> = ({ onClose, customUser }) => {
  const username = customUser?.username || (() => {
    try {
      const saved = localStorage.getItem('keto_custom_user');
      return saved ? JSON.parse(saved)?.username : 'User';
    } catch { return 'User'; }
  })();

  const STORAGE_KEY = `catchos_ai_creator_models_${username}`;

  const [models, setModels] = useState<CustomAIModel[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn(e);
    }
    return DEFAULT_MODELS;
  });

  const [activeModelId, setActiveModelId] = useState<string>(() => {
    return models[0]?.id || 'model-prime-coder';
  });

  const activeModel = models.find(m => m.id === activeModelId) || models[0] || DEFAULT_MODELS[0];

  const [activeTab, setActiveTab] = useState<'playground' | 'training' | 'knowledge' | 'settings'>('playground');
  const [trainingSubTab, setTrainingSubTab] = useState<'dialogue' | 'images' | 'links'>('dialogue');

  // Chat playground states
  const [messages, setMessages] = useState<{ [modelId: string]: ChatMessage[] }>({});
  const [inputPrompt, setInputPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [codeSandboxHtml, setCodeSandboxHtml] = useState<string | null>(null);

  // Model creation / edit modal
  const [showModelModal, setShowModelModal] = useState(false);
  const [editingModel, setEditingModel] = useState<CustomAIModel | null>(null);

  // Form states for adding training data
  const [newPrompt, setNewPrompt] = useState('');
  const [newResponse, setNewResponse] = useState('');

  const [newImgTitle, setNewImgTitle] = useState('');
  const [newImgUrl, setNewImgUrl] = useState('');
  const [newImgDesc, setNewImgDesc] = useState('');
  const [newImgTags, setNewImgTags] = useState('');

  const [newLinkTitle, setNewLinkTitle] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [newLinkSnippet, setNewLinkSnippet] = useState('');

  const chatBottomRef = useRef<HTMLDivElement>(null);
  const fileImportInputRef = useRef<HTMLInputElement>(null);

  // Save models to localStorage and VFS user system folder
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(models));
      
      // Auto-sync active model to VFS user folder: C:/Users/{username}/System/AI_Models/{model.id}.aimodel
      models.forEach(model => {
        try {
          const modelPath = `C:/Users/${username}/System/AI_Models/${model.id}.aimodel`;
          writeVfsFile(modelPath, JSON.stringify(model, null, 2), username);
        } catch {}
      });
    } catch (e) {
      console.warn(e);
    }
  }, [models, username]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeModelId]);

  const currentChatHistory = messages[activeModel.id] || [
    {
      id: 'welcome',
      role: 'assistant',
      content: `안녕하세요! 저는 당신이 훈련하고 커스텀한 **${activeModel.name}**입니다. 
${activeModel.description}

💡 **사용 가능한 기능**:
${activeModel.enableCoding ? '• 💻 실시간 코딩 및 HTML 샌드박스 실행\n' : ''}${activeModel.enableImageGen ? '• 🎨 인-챗 AI 이미지 생성\n' : ''}${activeModel.enableWebSearch ? '• 🔗 링크 및 웹 지식 검색\n' : ''}
무엇을 도와드릴까요? 편하게 질문해주세요!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ];

  // Helper to extract code blocks from text
  const extractCodeBlocks = (text: string): { language: string; code: string }[] => {
    const codeRegex = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g;
    const blocks: { language: string; code: string }[] = [];
    let match;
    while ((match = codeRegex.exec(text)) !== null) {
      blocks.push({
        language: match[1] || 'plaintext',
        code: match[2].trim()
      });
    }
    return blocks;
  };

  // Handle Chat Generation with Custom Model logic
  const handleSendMessage = async (customText?: string) => {
    const textToSend = (customText || inputPrompt).trim();
    if (!textToSend || isGenerating) return;

    sound.click();
    setInputPrompt('');

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const newHistory = [...currentChatHistory, userMsg];
    setMessages(prev => ({ ...prev, [activeModel.id]: newHistory }));
    setIsGenerating(true);

    try {
      // Check if user specifically requested an image
      const isImageRequest = 
        activeModel.enableImageGen && 
        (textToSend.includes('그려줘') || 
         textToSend.includes('이미지') || 
         textToSend.includes('그림') || 
         textToSend.includes('일러스트') || 
         textToSend.includes('사진') ||
         textToSend.toLowerCase().includes('draw') ||
         textToSend.toLowerCase().includes('generate image'));

      // 1. Prepare system instruction with custom training datasets
      let fullInstruction = `[AI Model Profile: ${activeModel.name}]
[Persona/Role: ${activeModel.persona}]
[System Core Rule: ${activeModel.systemInstruction}]

[Learned Q&A Knowledge]:
${activeModel.dataset.map((d, i) => `Ex ${i+1}: Q="${d.prompt}" -> A="${d.response}"`).join('\n')}

[Learned Image Style Knowledge]:
${activeModel.imageKnowledge.map(k => `- Style "${k.title}": ${k.description} [Tags: ${k.tags.join(', ')}]`).join('\n')}

[Learned Web Knowledge]:
${activeModel.linkKnowledge.map(l => `- Reference "${l.title}" (${l.url}): ${l.contentSnippet}`).join('\n')}

Coding Enabled: ${activeModel.enableCoding}
Image Generation Enabled: ${activeModel.enableImageGen}
Temperature: ${activeModel.temperature}
`;

      let assistantResponseText = '';
      let generatedImgs: string[] = [];

      if (isImageRequest) {
        // Image generation flow
        try {
          const res = await fetch('/api/gemini/catvas', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              mode: 'image',
              prompt: `${textToSend} in style of ${activeModel.persona}, high quality art`,
              tone: activeModel.category
            })
          });
          const data = await res.json();
          if (data.imageUrl) {
            generatedImgs.push(data.imageUrl);
            assistantResponseText = `🎨 **${activeModel.name}** 모델의 학습 스타일에 맞춰 이미지를 성공적으로 생성했습니다!\n\n프롬프트: *"${textToSend}"*`;
          } else {
            assistantResponseText = data.textDescription || `이미지 생성이 완료되었습니다: "${textToSend}"`;
          }
        } catch (imgErr) {
          // Fallback SVG / Canvas illustration
          assistantResponseText = `🎨 학습된 모델 비주얼 엔진으로 생성을 완료했습니다.\n\n요청 프롬프트: "${textToSend}"`;
          generatedImgs.push(`https://picsum.photos/seed/${encodeURIComponent(textToSend)}/800/600`);
        }
      } else {
        // Standard Text / Coding / Reasoning generation
        try {
          const res = await fetch('/api/gemini/catvas', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              mode: 'text',
              prompt: textToSend,
              context: fullInstruction,
              tone: activeModel.persona
            })
          });

          if (res.ok) {
            const data = await res.json();
            assistantResponseText = data.result || '응답을 생성했습니다.';
          } else {
            throw new Error('API request failed');
          }
        } catch (apiErr) {
          // Local Intelligent Fallback using Trained Dataset Matches
          const matchedDataset = activeModel.dataset.find(d => 
            textToSend.toLowerCase().includes(d.prompt.toLowerCase()) ||
            d.prompt.toLowerCase().includes(textToSend.toLowerCase())
          );

          if (matchedDataset) {
            assistantResponseText = `🧠 [학습 데이터셋 직접 추론]\n\n${matchedDataset.response}`;
          } else if (textToSend.includes('코드') || textToSend.includes('만들어') || textToSend.includes('구현')) {
            assistantResponseText = `💻 **${activeModel.name}** 개발 엔진이 작성한 코드입니다:\n\n\`\`\`html\n<!DOCTYPE html>\n<html>\n<head>\n  <style>\n    body { background: #0f172a; color: #38bdf8; font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; }\n    .card { background: #1e293b; padding: 2rem; border-radius: 1rem; border: 1px solid #38bdf8; text-align: center; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }\n    button { background: #0284c7; color: white; border: none; padding: 0.6rem 1.2rem; border-radius: 0.5rem; font-weight: bold; cursor: pointer; margin-top: 1rem; }\n    button:hover { background: #0369a1; }\n  </style>\n</head>\n<body>\n  <div class="card">\n    <h2>✨ ${activeModel.name} Live Sandbox</h2>\n    <p>요청하신 인터랙티브 데모가 성공적으로 빌드되었습니다!</p>\n    <button onclick="alert('정상 작동합니다!')">실행 테스트</button>\n  </div>\n</body>\n</html>\n\`\`\`\n\n위의 [샌드박스 실행] 버튼을 눌러 브라우저에서 바로 테스트해보세요!`;
          } else {
            assistantResponseText = `🤖 **${activeModel.name}** (${activeModel.category})\n\n"${textToSend}"에 대한 답변입니다.\n\n학습된 페르소나(${activeModel.persona})와 규칙에 따라 성실하게 답변을 생성했습니다. 추가로 궁금한 점이나 코딩, 이미지 생성이 필요하시면 언제든지 말씀해주세요!`;
          }
        }
      }

      const extractedCodes = extractCodeBlocks(assistantResponseText);

      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: assistantResponseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        codeBlocks: extractedCodes.length > 0 ? extractedCodes : undefined,
        generatedImages: generatedImgs.length > 0 ? generatedImgs : undefined
      };

      setMessages(prev => ({
        ...prev,
        [activeModel.id]: [...newHistory, assistantMsg]
      }));

      sound.fanfare?.();
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Add Q&A Training Item
  const handleAddDataset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPrompt.trim() || !newResponse.trim()) return;

    sound.buy?.();
    const newItem: DatasetItem = {
      id: `d-${Date.now()}`,
      prompt: newPrompt.trim(),
      response: newResponse.trim()
    };

    setModels(prev => prev.map(m => {
      if (m.id === activeModel.id) {
        return {
          ...m,
          updatedAt: new Date().toISOString().slice(0, 10),
          dataset: [newItem, ...m.dataset]
        };
      }
      return m;
    }));

    setNewPrompt('');
    setNewResponse('');
  };

  const handleDeleteDataset = (id: string) => {
    sound.wrong?.();
    setModels(prev => prev.map(m => {
      if (m.id === activeModel.id) {
        return {
          ...m,
          dataset: m.dataset.filter(d => d.id !== id)
        };
      }
      return m;
    }));
  };

  // Add Image Knowledge
  const handleAddImageKnowledge = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newImgTitle.trim() || !newImgUrl.trim()) return;

    sound.buy?.();
    const newItem: ImageKnowledgeItem = {
      id: `img-${Date.now()}`,
      title: newImgTitle.trim(),
      imageUrl: newImgUrl.trim(),
      description: newImgDesc.trim() || '사용자 등록 비주얼 참조 데이터',
      tags: newImgTags.split(',').map(t => t.trim()).filter(Boolean)
    };

    setModels(prev => prev.map(m => {
      if (m.id === activeModel.id) {
        return {
          ...m,
          updatedAt: new Date().toISOString().slice(0, 10),
          imageKnowledge: [newItem, ...m.imageKnowledge]
        };
      }
      return m;
    }));

    setNewImgTitle('');
    setNewImgUrl('');
    setNewImgDesc('');
    setNewImgTags('');
  };

  // Add Link Knowledge
  const handleAddLinkKnowledge = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLinkTitle.trim() || !newLinkUrl.trim()) return;

    sound.buy?.();
    const newItem: LinkKnowledgeItem = {
      id: `lnk-${Date.now()}`,
      title: newLinkTitle.trim(),
      url: newLinkUrl.trim(),
      contentSnippet: newLinkSnippet.trim() || '웹 문서 핵심 요약 및 참조 지식'
    };

    setModels(prev => prev.map(m => {
      if (m.id === activeModel.id) {
        return {
          ...m,
          updatedAt: new Date().toISOString().slice(0, 10),
          linkKnowledge: [newItem, ...m.linkKnowledge]
        };
      }
      return m;
    }));

    setNewLinkTitle('');
    setNewLinkUrl('');
    setNewLinkSnippet('');
  };

  // Export Model to Downloadable .aimodel File
  const handleDownloadModel = (modelToExport: CustomAIModel = activeModel) => {
    sound.click?.();
    const jsonStr = JSON.stringify(modelToExport, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${modelToExport.name.replace(/\s+/g, '_')}_v${modelToExport.version}.aimodel`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    sound.fanfare?.();
  };

  // Import Model File
  const handleImportModelFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target?.result as string);
        if (parsed.name && (parsed.systemInstruction || parsed.persona)) {
          const importedModel: CustomAIModel = {
            ...parsed,
            id: `imported-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            name: `${parsed.name} (가져옴)`,
            updatedAt: new Date().toISOString().slice(0, 10)
          };
          setModels(prev => [importedModel, ...prev]);
          setActiveModelId(importedModel.id);
          sound.buy?.();
          alert(`'${importedModel.name}' 모델을 성공적으로 불러왔습니다!`);
        } else {
          alert('올바른 .aimodel 파일 형식이 아닙니다.');
        }
      } catch (err) {
        alert('모델 파일 파싱에 실패했습니다.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Create or Update Model Submit
  const handleSaveModelForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingModel) return;

    sound.buy?.();
    if (models.some(m => m.id === editingModel.id)) {
      // Update
      setModels(prev => prev.map(m => m.id === editingModel.id ? editingModel : m));
    } else {
      // Create
      setModels(prev => [editingModel, ...prev]);
      setActiveModelId(editingModel.id);
    }
    setShowModelModal(false);
    setEditingModel(null);
  };

  const handleOpenCreateModel = () => {
    sound.click();
    const newId = `custom-ai-${Date.now()}`;
    const newSeed = Math.random().toString(36).substring(7);
    setEditingModel({
      id: newId,
      name: `커스텀 AI #${models.length + 1}`,
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${newSeed}`,
      description: '사용자가 직접 대화, 이미지, 링크 지식을 주입하여 학습시킨 맞춤형 AI 모델',
      persona: '친절하고 지적이며 모든 질문에 명쾌하게 답변하는 만능 AI 조수',
      systemInstruction: '당신은 사용자가 훈련시킨 전용 AI입니다. 사용자의 질문에 정확하고 창의적으로 답변하세요.',
      category: '범용 인공지능',
      version: '1.0.0',
      createdAt: new Date().toISOString().slice(0, 10),
      updatedAt: new Date().toISOString().slice(0, 10),
      author: username,
      enableCoding: true,
      enableImageGen: true,
      enableWebSearch: true,
      temperature: 0.7,
      topP: 0.9,
      reasoningDepth: 'standard',
      dataset: [],
      imageKnowledge: [],
      linkKnowledge: []
    });
    setShowModelModal(true);
  };

  return (
    <div className="flex flex-col h-full w-full bg-slate-950 text-slate-100 font-sans select-none overflow-hidden">
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          1. TOP APP HEADER & MODEL PICKER
         ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="h-16 px-4 sm:px-6 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-600 via-indigo-600 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-cyan-900/40 shrink-0">
            <BrainCircuit className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm sm:text-base font-black tracking-wide text-white truncate">
                AI 제작기 (AI Studio Maker)
              </span>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[9px] font-black bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                PRO TRAINER
              </span>
            </div>
            <div className="text-[11px] text-slate-400 truncate">
              데이터셋·이미지·링크 학습 및 실시간 코딩/이미지 생성 모델 스튜디오
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Create AI Model Button */}
          <button
            onClick={handleOpenCreateModel}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 hover:brightness-110 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-lg shadow-cyan-900/30 cursor-pointer active:scale-95 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">새 AI 생성</span>
          </button>

          {/* Download Model File Button */}
          <button
            onClick={() => handleDownloadModel(activeModel)}
            className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center gap-1 cursor-pointer transition active:scale-95"
            title="현재 학습된 모델 다운로드 (.aimodel)"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden md:inline">모델 다운로드</span>
          </button>

          {/* Import Model File Button */}
          <button
            onClick={() => fileImportInputRef.current?.click()}
            className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/40 text-xs font-bold flex items-center gap-1 cursor-pointer transition active:scale-95"
            title="외부 .aimodel 파일 불러오기"
          >
            <Upload className="w-3.5 h-3.5" />
            <span className="hidden md:inline">모델 불러오기</span>
          </button>
          <input 
            type="file" 
            ref={fileImportInputRef} 
            onChange={handleImportModelFile} 
            accept=".aimodel,.json" 
            className="hidden" 
          />

          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
            >
              <Trash2 className="w-4 h-4 hidden" />
            </button>
          )}
        </div>
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          2. MAIN BODY (LEFT MODEL SELECTOR & TABS + RIGHT CONTENT)
         ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left Sidebar: Models List & Quick Config */}
        <div className="w-full md:w-72 bg-slate-900/60 border-r border-slate-800 flex flex-col shrink-0 overflow-y-auto custom-scrollbar">
          <div className="p-3 border-b border-slate-800/80 flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-300 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              보유 AI 모델 목록 ({models.length})
            </span>
          </div>

          {/* Models List */}
          <div className="p-2 space-y-1.5 flex-1">
            {models.map(model => {
              const isSelected = model.id === activeModel.id;
              return (
                <div
                  key={model.id}
                  onClick={() => {
                    sound.click();
                    setActiveModelId(model.id);
                  }}
                  className={`p-2.5 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 ${
                    isSelected 
                      ? 'bg-gradient-to-r from-cyan-950/80 to-indigo-950/80 border-cyan-500/60 shadow-lg shadow-cyan-950/50 ring-1 ring-cyan-400/30'
                      : 'bg-slate-900/40 border-slate-800/80 hover:bg-slate-800/60'
                  }`}
                >
                  <img 
                    src={model.avatar} 
                    alt={model.name}
                    className="w-10 h-10 rounded-xl bg-slate-800 p-1 border border-white/10 shrink-0" 
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black text-white truncate">{model.name}</h4>
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        v{model.version}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 truncate mt-0.5">{model.category}</p>
                    <div className="flex items-center gap-2 mt-1 text-[9px] text-slate-500">
                      <span>학습 데이터 {model.dataset.length}개</span>
                      <span>•</span>
                      <span>{model.reasoningDepth.toUpperCase()}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Active Model Summary & Edit Card */}
          <div className="p-3 bg-slate-950/80 border-t border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400">선택된 모델 상태</span>
              <button
                onClick={() => {
                  sound.click();
                  setEditingModel({ ...activeModel });
                  setShowModelModal(true);
                }}
                className="text-[10px] text-cyan-400 hover:underline flex items-center gap-1 font-bold"
              >
                <Edit3 className="w-3 h-3" /> 속성 수정
              </button>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs space-y-1.5">
              <div className="text-white font-bold truncate">{activeModel.name}</div>
              <div className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">{activeModel.persona}</div>
              <div className="pt-1 flex flex-wrap gap-1">
                {activeModel.enableCoding && (
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-950 text-blue-300 border border-blue-500/40">
                    💻 코딩
                  </span>
                )}
                {activeModel.enableImageGen && (
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-fuchsia-950 text-fuchsia-300 border border-fuchsia-500/40">
                    🎨 이미지
                  </span>
                )}
                {activeModel.enableWebSearch && (
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/40">
                    🔗 링크
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Content Area (Tabs: Playground, Training Studio, Knowledge, Settings) */}
        <div className="flex-1 flex flex-col overflow-hidden bg-slate-950">
          {/* Tab Navigation */}
          <div className="h-11 px-4 bg-slate-900/40 border-b border-slate-800 flex items-center gap-2 overflow-x-auto shrink-0">
            {[
              { id: 'playground', label: '💬 실시간 플레이그라운드', icon: MessageSquare },
              { id: 'training', label: '🧠 학습 스튜디오 (Q&A / 이미지 / 링크)', icon: Sparkles },
              { id: 'settings', label: '⚙️ 하이퍼파라미터 & 규칙', icon: Sliders },
            ].map(tab => {
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    sound.click();
                    setActiveTab(tab.id as any);
                  }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                    isSelected
                      ? 'bg-cyan-600/30 text-cyan-300 border border-cyan-500/50 shadow-sm shadow-cyan-900/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <tab.icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
              TAB 1: LIVE INTERACTIVE PLAYGROUND (CHAT & CODING & IMAGE GEN)
             ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
          {activeTab === 'playground' && (
            <div className="flex-1 flex flex-col overflow-hidden relative">
              {/* Messages Scroll Area */}
              <div className="flex-1 p-4 sm:p-6 overflow-y-auto custom-scrollbar space-y-4">
                {currentChatHistory.map(msg => {
                  const isUser = msg.role === 'user';
                  return (
                    <div
                      key={msg.id}
                      className={`flex gap-3 max-w-3xl ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
                    >
                      {/* Avatar */}
                      <div className="shrink-0">
                        {isUser ? (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-xs font-black text-white shadow">
                            YOU
                          </div>
                        ) : (
                          <img 
                            src={activeModel.avatar} 
                            alt={activeModel.name}
                            className="w-8 h-8 rounded-full bg-slate-800 p-0.5 border border-cyan-400/40 shadow shrink-0" 
                          />
                        )}
                      </div>

                      {/* Bubble */}
                      <div className={`space-y-2.5 max-w-[85%] sm:max-w-xl ${isUser ? 'items-end' : 'items-start'}`}>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400">
                          <span className="font-bold text-slate-300">{isUser ? username : activeModel.name}</span>
                          <span>{msg.timestamp}</span>
                        </div>

                        <div className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                          isUser 
                            ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-tr-xs shadow-md' 
                            : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-xs shadow-lg'
                        }`}>
                          <div className="whitespace-pre-wrap">{msg.content}</div>

                          {/* Render Generated Images if available */}
                          {msg.generatedImages && msg.generatedImages.length > 0 && (
                            <div className="mt-3 grid grid-cols-1 gap-2 pt-2 border-t border-slate-800">
                              {msg.generatedImages.map((imgUrl, i) => (
                                <div key={i} className="rounded-xl overflow-hidden border border-white/10 shadow-lg relative group">
                                  <img src={imgUrl} alt="AI Generated" className="w-full h-auto max-h-72 object-cover" />
                                  <a 
                                    href={imgUrl} 
                                    download={`ai_art_${Date.now()}.png`}
                                    className="absolute bottom-2 right-2 px-2.5 py-1 rounded-lg bg-black/80 text-white text-[10px] font-bold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition shadow"
                                  >
                                    <Download className="w-3 h-3" /> 다운로드
                                  </a>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Render Code Blocks with Copy and Live HTML Sandbox Preview */}
                          {msg.codeBlocks && msg.codeBlocks.length > 0 && (
                            <div className="mt-3 space-y-2 pt-2 border-t border-slate-800">
                              {msg.codeBlocks.map((block, idx) => (
                                <div key={idx} className="rounded-xl bg-slate-950 border border-slate-800 overflow-hidden">
                                  <div className="px-3 py-1.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                                    <span className="uppercase text-cyan-400 font-bold">{block.language || 'code'}</span>
                                    <div className="flex items-center gap-2">
                                      {/* Run in Sandbox button if HTML/JS */}
                                      {(block.language === 'html' || block.code.includes('<html') || block.code.includes('<!DOCTYPE')) && (
                                        <button
                                          onClick={() => {
                                            sound.click();
                                            setCodeSandboxHtml(block.code);
                                          }}
                                          className="px-2 py-0.5 rounded bg-emerald-600/40 hover:bg-emerald-600 text-emerald-300 hover:text-white transition flex items-center gap-1 font-bold cursor-pointer"
                                        >
                                          <Play className="w-3 h-3" /> 샌드박스 실행
                                        </button>
                                      )}
                                      {/* Copy Button */}
                                      <button
                                        onClick={() => {
                                          navigator.clipboard.writeText(block.code);
                                          sound.click();
                                          alert('코드가 클립보드에 복사되었습니다!');
                                        }}
                                        className="hover:text-white transition flex items-center gap-1"
                                      >
                                        <Copy className="w-3 h-3" /> 복사
                                      </button>
                                    </div>
                                  </div>
                                  <pre className="p-3 text-[11px] font-mono text-cyan-200 overflow-x-auto whitespace-pre">
                                    {block.code}
                                  </pre>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {isGenerating && (
                  <div className="flex gap-3 items-center text-xs text-cyan-400 animate-pulse">
                    <img 
                      src={activeModel.avatar} 
                      alt={activeModel.name}
                      className="w-7 h-7 rounded-full bg-slate-800 p-0.5 border border-cyan-400" 
                    />
                    <span>{activeModel.name} 모델이 학습된 규칙에 따라 추론 중입니다...</span>
                  </div>
                )}

                <div ref={chatBottomRef} />
              </div>

              {/* Quick Prompt Suggestions */}
              <div className="px-4 py-2 bg-slate-900/40 border-t border-slate-800/80 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
                <span className="text-[10px] text-slate-500 font-bold shrink-0">추천 프롬프트:</span>
                {[
                  '💻 테트리스 게임 HTML 코드 작성해줘',
                  '🎨 네온 사이버펑크 고양이 일러스트 그려줘',
                  '🧠 학습한 데이터셋 기반으로 질문할게',
                  '⚡ 파이썬 알고리즘 최적화 코드 작성해줘'
                ].map((promptText, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendMessage(promptText)}
                    className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-[11px] text-slate-300 hover:text-white transition whitespace-nowrap cursor-pointer shrink-0 border border-slate-700/60"
                  >
                    {promptText}
                  </button>
                ))}
              </div>

              {/* Bottom Chat Input Bar */}
              <div className="p-3 sm:p-4 bg-slate-900/90 border-t border-slate-800 flex items-center gap-2 shrink-0">
                <input
                  type="text"
                  value={inputPrompt}
                  onChange={(e) => setInputPrompt(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder={`"${activeModel.name}"에게 코딩, 그림 생성, 지식 질문을 해보세요...`}
                  className="flex-1 bg-slate-950 border border-slate-700/80 focus:border-cyan-400 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder:text-slate-500 outline-none transition shadow-inner"
                />

                {/* Direct Image Prompt Trigger */}
                {activeModel.enableImageGen && (
                  <button
                    onClick={() => {
                      if (!inputPrompt) {
                        setInputPrompt('멋진 사이버펑크 판타지 풍경 일러스트 그려줘');
                      } else {
                        handleSendMessage(`[이미지 생성] ${inputPrompt}`);
                      }
                    }}
                    className="p-2.5 rounded-xl bg-purple-900/60 hover:bg-purple-600 text-purple-300 hover:text-white border border-purple-500/40 transition cursor-pointer"
                    title="이미지 생성 프롬프트 실행"
                  >
                    <ImageIcon className="w-4 h-4" />
                  </button>
                )}

                <button
                  onClick={() => handleSendMessage()}
                  disabled={!inputPrompt.trim() || isGenerating}
                  className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-800 text-white font-bold text-xs sm:text-sm transition flex items-center gap-1.5 cursor-pointer shadow-md disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                  <span className="hidden sm:inline">전송</span>
                </button>
              </div>
            </div>
          )}

          {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
              TAB 2: TRAINING STUDIO (DATASET / IMAGES / LINKS)
             ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
          {activeTab === 'training' && (
            <div className="flex-1 flex flex-col overflow-hidden p-4 sm:p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-white flex items-center gap-2">
                    <span>🧠 {activeModel.name} 멀티모달 학습 스튜디오</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    대화 예시(Q&A), 이미지 스타일, 웹 문서 링크를 학습시켜 나만의 고유 AI 모델을 구축하세요.
                  </p>
                </div>

                {/* Sub Tab Switcher */}
                <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
                  <button
                    onClick={() => setTrainingSubTab('dialogue')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                      trainingSubTab === 'dialogue' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    💬 대화 데이터셋 ({activeModel.dataset.length})
                  </button>
                  <button
                    onClick={() => setTrainingSubTab('images')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                      trainingSubTab === 'images' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    🎨 이미지 학습 ({activeModel.imageKnowledge.length})
                  </button>
                  <button
                    onClick={() => setTrainingSubTab('links')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                      trainingSubTab === 'links' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    🔗 링크/웹문서 ({activeModel.linkKnowledge.length})
                  </button>
                </div>
              </div>

              {/* Subtab Content: Dialogue Q&A */}
              {trainingSubTab === 'dialogue' && (
                <div className="flex-1 flex flex-col md:flex-row gap-4 overflow-hidden">
                  {/* Left: Add Q&A Form */}
                  <form onSubmit={handleAddDataset} className="w-full md:w-80 bg-slate-900/70 border border-slate-800 p-4 rounded-2xl space-y-3 shrink-0">
                    <h4 className="text-xs font-black text-cyan-400 flex items-center gap-1.5">
                      <Plus className="w-4 h-4" /> 대화 예시 (Q&A) 추가
                    </h4>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-300">사용자 질문 (Prompt)</label>
                      <input
                        type="text"
                        value={newPrompt}
                        onChange={(e) => setNewPrompt(e.target.value)}
                        placeholder="예: 리액트 상태 관리 추천해줘"
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-600 outline-none focus:border-cyan-400"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-300">AI 이상적 답변 (Target Response)</label>
                      <textarea
                        rows={4}
                        value={newResponse}
                        onChange={(e) => setNewResponse(e.target.value)}
                        placeholder="AI가 이 질문에 답해야 하는 완벽한 답변 양식 및 지식..."
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder:text-slate-600 outline-none focus:border-cyan-400 resize-none"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-xl transition cursor-pointer"
                    >
                      학습 데이터셋 추가
                    </button>
                  </form>

                  {/* Right: Dataset List */}
                  <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2.5 pr-1">
                    {activeModel.dataset.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-500 border border-dashed border-slate-800 rounded-2xl">
                        <Database className="w-10 h-10 text-slate-600 mb-2" />
                        <p className="text-xs font-bold text-slate-400">등록된 대화 학습 데이터가 없습니다.</p>
                        <p className="text-[11px] text-slate-500 mt-1">좌측 폼을 통해 질문과 모범 답변을 추가해보세요!</p>
                      </div>
                    ) : (
                      activeModel.dataset.map((item, idx) => (
                        <div key={item.id} className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5 relative group">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono font-bold text-cyan-400">데이터셋 #{idx + 1}</span>
                            <button
                              onClick={() => handleDeleteDataset(item.id)}
                              className="text-slate-500 hover:text-rose-400 transition"
                              title="삭제"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <div className="text-xs font-bold text-white">Q: {item.prompt}</div>
                          <div className="text-xs text-slate-300 bg-slate-950 p-2.5 rounded-lg border border-slate-800/80 whitespace-pre-wrap">
                            {item.response}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Subtab Content: Image Style Knowledge */}
              {trainingSubTab === 'images' && (
                <div className="flex-1 flex flex-col md:flex-row gap-4 overflow-hidden">
                  <form onSubmit={handleAddImageKnowledge} className="w-full md:w-80 bg-slate-900/70 border border-slate-800 p-4 rounded-2xl space-y-3 shrink-0">
                    <h4 className="text-xs font-black text-purple-400 flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4" /> 이미지 스타일 및 레퍼런스 학습
                    </h4>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-300">스타일 명칭</label>
                      <input
                        type="text"
                        value={newImgTitle}
                        onChange={(e) => setNewImgTitle(e.target.value)}
                        placeholder="예: 네온 사이버펑크 3D"
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-600 outline-none focus:border-purple-400"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-300">이미지 URL</label>
                      <input
                        type="url"
                        value={newImgUrl}
                        onChange={(e) => setNewImgUrl(e.target.value)}
                        placeholder="https://..."
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-600 outline-none focus:border-purple-400"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-300">시각적 특징 설명</label>
                      <textarea
                        rows={2}
                        value={newImgDesc}
                        onChange={(e) => setNewImgDesc(e.target.value)}
                        placeholder="색감, 광원, 질감, 프롬프트 키워드..."
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white placeholder:text-slate-600 outline-none focus:border-purple-400 resize-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-300">태그 (쉼표로 구분)</label>
                      <input
                        type="text"
                        value={newImgTags}
                        onChange={(e) => setNewImgTags(e.target.value)}
                        placeholder="Cyberpunk, Neon, 8K"
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-600 outline-none focus:border-purple-400"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl transition cursor-pointer"
                    >
                      이미지 지식 주입
                    </button>
                  </form>

                  {/* Image Knowledge Cards */}
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3 overflow-y-auto custom-scrollbar pr-1">
                    {activeModel.imageKnowledge.map(imgK => (
                      <div key={imgK.id} className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden flex flex-col">
                        <img src={imgK.imageUrl} alt={imgK.title} className="w-full h-36 object-cover bg-black" />
                        <div className="p-3 space-y-1 flex-1 flex flex-col justify-between">
                          <div>
                            <h5 className="text-xs font-bold text-white">{imgK.title}</h5>
                            <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{imgK.description}</p>
                          </div>
                          <div className="pt-2 flex flex-wrap gap-1">
                            {imgK.tags.map((t, idx) => (
                              <span key={idx} className="px-1.5 py-0.5 rounded bg-purple-950 text-purple-300 text-[9px] font-bold border border-purple-500/40">
                                #{t}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Subtab Content: Web Links & Docs */}
              {trainingSubTab === 'links' && (
                <div className="flex-1 flex flex-col md:flex-row gap-4 overflow-hidden">
                  <form onSubmit={handleAddLinkKnowledge} className="w-full md:w-80 bg-slate-900/70 border border-slate-800 p-4 rounded-2xl space-y-3 shrink-0">
                    <h4 className="text-xs font-black text-emerald-400 flex items-center gap-1.5">
                      <LinkIcon className="w-4 h-4" /> 웹 문서 및 링크 지식 주입
                    </h4>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-300">문서 제목</label>
                      <input
                        type="text"
                        value={newLinkTitle}
                        onChange={(e) => setNewLinkTitle(e.target.value)}
                        placeholder="예: React 19 공식 가이드북"
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-600 outline-none focus:border-emerald-400"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-300">웹 링크 URL</label>
                      <input
                        type="url"
                        value={newLinkUrl}
                        onChange={(e) => setNewLinkUrl(e.target.value)}
                        placeholder="https://..."
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-600 outline-none focus:border-emerald-400"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-300">핵심 내용 요약 스니펫</label>
                      <textarea
                        rows={3}
                        value={newLinkSnippet}
                        onChange={(e) => setNewLinkSnippet(e.target.value)}
                        placeholder="AI가 참조할 주요 기술 스펙 및 규칙 요약..."
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white placeholder:text-slate-600 outline-none focus:border-emerald-400 resize-none"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition cursor-pointer"
                    >
                      링크 지식 저장
                    </button>
                  </form>

                  {/* Links List */}
                  <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2.5 pr-1">
                    {activeModel.linkKnowledge.map(lnk => (
                      <div key={lnk.id} className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                        <div className="flex items-center justify-between">
                          <h5 className="text-xs font-bold text-white flex items-center gap-1.5">
                            <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
                            <span>{lnk.title}</span>
                          </h5>
                          <a href={lnk.url} target="_blank" rel="noreferrer" className="text-[10px] text-cyan-400 hover:underline">
                            {lnk.url}
                          </a>
                        </div>
                        <p className="text-xs text-slate-300 bg-slate-950 p-2.5 rounded-xl border border-slate-800 leading-relaxed">
                          {lnk.contentSnippet}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
              TAB 3: HYPERPARAMETERS & RULES
             ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
          {activeTab === 'settings' && (
            <div className="flex-1 p-6 overflow-y-auto custom-scrollbar space-y-6 max-w-3xl">
              <div>
                <h3 className="text-base font-black text-white">⚙️ {activeModel.name} 모델 하이퍼파라미터 및 시스템 프롬프트</h3>
                <p className="text-xs text-slate-400 mt-0.5">추론 깊이, 창의성 지수 및 기본 동작 규칙을 정밀하게 제어합니다.</p>
              </div>

              {/* Sliders */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-300">Temperature (창의성 & 다양성): {activeModel.temperature}</span>
                    <span className="text-cyan-400">{activeModel.temperature > 0.7 ? '창의적/예술적' : '정확/논리적'}</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={activeModel.temperature}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setModels(prev => prev.map(m => m.id === activeModel.id ? { ...m, temperature: val } : m));
                    }}
                    className="w-full accent-cyan-500 cursor-pointer"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-300">Reasoning Depth (추론 깊이)</span>
                    <span className="text-indigo-400 uppercase">{activeModel.reasoningDepth}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {(['low', 'standard', 'deep'] as const).map(depth => (
                      <button
                        key={depth}
                        onClick={() => {
                          sound.click();
                          setModels(prev => prev.map(m => m.id === activeModel.id ? { ...m, reasoningDepth: depth } : m));
                        }}
                        className={`py-2 rounded-xl text-xs font-bold uppercase transition ${
                          activeModel.reasoningDepth === depth
                            ? 'bg-indigo-600 text-white shadow-md'
                            : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                        }`}
                      >
                        {depth === 'low' ? '⚡ 고속 (Low)' : depth === 'standard' ? '🧠 표준 (Standard)' : '👑 심층 (Deep Think)'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* System Instruction */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300">시스템 프롬프트 (System Instruction)</label>
                <textarea
                  rows={4}
                  value={activeModel.systemInstruction}
                  onChange={(e) => {
                    const text = e.target.value;
                    setModels(prev => prev.map(m => m.id === activeModel.id ? { ...m, systemInstruction: text } : m));
                  }}
                  className="w-full bg-slate-900 border border-slate-700 rounded-2xl p-4 text-xs text-white outline-none focus:border-cyan-400 resize-none font-mono"
                />
              </div>

              {/* Download or Delete Model */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <button
                  onClick={() => handleDownloadModel(activeModel)}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center gap-2 cursor-pointer shadow-lg"
                >
                  <Download className="w-4 h-4" />
                  <span>이 모델 (.aimodel) 다운로드</span>
                </button>

                {models.length > 1 && (
                  <button
                    onClick={() => {
                      if (confirm(`'${activeModel.name}' 모델을 삭제하시겠습니까?`)) {
                        sound.wrong();
                        const remain = models.filter(m => m.id !== activeModel.id);
                        setModels(remain);
                        setActiveModelId(remain[0].id);
                      }
                    }}
                    className="px-4 py-2.5 rounded-xl bg-rose-950/60 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/40 font-bold text-xs transition cursor-pointer"
                  >
                    모델 삭제
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          4. LIVE HTML / CODE SANDBOX PREVIEW MODAL
         ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {codeSandboxHtml && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-4xl h-[85vh] bg-slate-900 border border-slate-700 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
            <div className="h-12 px-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold text-white">✨ AI 생성 코드 실시간 샌드박스 실행기</span>
              </div>
              <button
                onClick={() => setCodeSandboxHtml(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                닫기 ✕
              </button>
            </div>
            <iframe
              srcDoc={codeSandboxHtml}
              title="AI Sandbox Preview"
              className="w-full flex-1 bg-white border-0"
              sandbox="allow-scripts allow-modals"
            />
          </div>
        </div>
      )}

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          5. CREATE / EDIT MODEL MODAL
         ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {showModelModal && editingModel && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl space-y-4 my-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="text-sm font-black text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>나만의 AI 모델 생성 / 속성 설정</span>
              </h4>
              <button onClick={() => setShowModelModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSaveModelForm} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">AI 모델 이름</label>
                <input
                  type="text"
                  value={editingModel.name}
                  onChange={(e) => setEditingModel({ ...editingModel, name: e.target.value })}
                  placeholder="예: 알파 비서 AI"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-cyan-400"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">분야 / 카테고리</label>
                  <input
                    type="text"
                    value={editingModel.category}
                    onChange={(e) => setEditingModel({ ...editingModel, category: e.target.value })}
                    placeholder="예: 코딩 / 아트 / 비서"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-cyan-400"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">버전 (Version)</label>
                  <input
                    type="text"
                    value={editingModel.version}
                    onChange={(e) => setEditingModel({ ...editingModel, version: e.target.value })}
                    placeholder="1.0.0"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">페르소나 & 역할 (Persona)</label>
                <textarea
                  rows={2}
                  value={editingModel.persona}
                  onChange={(e) => setEditingModel({ ...editingModel, persona: e.target.value })}
                  placeholder="예: 친절하고 유머러스하며 완벽한 코드를 작성하는 AI 시니어 엔지니어"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white outline-none focus:border-cyan-400 resize-none"
                  required
                />
              </div>

              {/* Capability Toggles */}
              <div className="space-y-1.5 pt-1">
                <label className="text-xs font-bold text-slate-300">핵심 기능 활성화</label>
                <div className="grid grid-cols-3 gap-2">
                  <label className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                    editingModel.enableCoding ? 'bg-blue-950/70 border-blue-500 text-blue-200' : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}>
                    <span className="text-[11px] font-bold">💻 코딩 실행</span>
                    <input 
                      type="checkbox" 
                      checked={editingModel.enableCoding} 
                      onChange={(e) => setEditingModel({ ...editingModel, enableCoding: e.target.checked })} 
                      className="hidden" 
                    />
                  </label>

                  <label className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                    editingModel.enableImageGen ? 'bg-purple-950/70 border-purple-500 text-purple-200' : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}>
                    <span className="text-[11px] font-bold">🎨 그림 생성</span>
                    <input 
                      type="checkbox" 
                      checked={editingModel.enableImageGen} 
                      onChange={(e) => setEditingModel({ ...editingModel, enableImageGen: e.target.checked })} 
                      className="hidden" 
                    />
                  </label>

                  <label className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                    editingModel.enableWebSearch ? 'bg-emerald-950/70 border-emerald-500 text-emerald-200' : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}>
                    <span className="text-[11px] font-bold">🔗 링크 지식</span>
                    <input 
                      type="checkbox" 
                      checked={editingModel.enableWebSearch} 
                      onChange={(e) => setEditingModel({ ...editingModel, enableWebSearch: e.target.checked })} 
                      className="hidden" 
                    />
                  </label>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-3">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:brightness-110 text-white font-black text-xs rounded-xl transition cursor-pointer shadow-lg"
                >
                  모델 저장 및 학습 시작
                </button>
                <button
                  type="button"
                  onClick={() => setShowModelModal(false)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold"
                >
                  취소
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
