import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, getDocs, limit, where } from 'firebase/firestore';
import { Sparkles, ArrowLeft, Send, PenTool, Loader2, MessageSquare, Heart, Clock } from 'lucide-react';
import { User } from 'firebase/auth';

interface BlogSystemProps {
  user: User;
  onBack: () => void;
}

interface BlogPost {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  createdAt: any;
  likesCount: number;
}

export default function BlogSystem({ user, onBack }: BlogSystemProps) {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [isComposing, setIsComposing] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  
  

  useEffect(() => {
    const q = query(collection(db, 'blogs'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const b: BlogPost[] = [];
      snapshot.forEach((doc) => {
        b.push({ id: doc.id, ...doc.data() } as BlogPost);
      });
      setBlogs(b);
    });
    return () => unsubscribe();
  }, []);

  

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      alert('제목과 내용을 모두 입력해주세요.');
      return;
    }
    
    // Check user data to get nickname if needed, else use user.displayName
    let authorName = user.displayName || '이름 없음';
    try {
      const uq = query(collection(db, 'users'), where('uid', '==', user.uid), limit(1));
      const usnap = await getDocs(uq);
      if (!usnap.empty) {
        authorName = usnap.docs[0].data().nickname || authorName;
      }
    } catch (e) {}

    try {
      await addDoc(collection(db, 'blogs'), {
        title,
        content,
        authorId: user.uid,
        authorName,
        createdAt: serverTimestamp(),
        likesCount: 0
      });
      setIsComposing(false);
      setTitle('');
      setContent('');
      
    } catch (err: any) {
      alert('업로드 실패: ' + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white relative flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-slate-900 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
            <ArrowLeft className="w-6 h-6 text-slate-400" />
          </button>
          <h1 className="text-xl font-black bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            캐로그 (Calog)
          </h1>
        </div>
        {!isComposing && (
          <button 
            onClick={() => setIsComposing(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg font-bold transition-colors"
          >
            <PenTool className="w-4 h-4" />
            새 글 쓰기
          </button>
        )}
      </div>

      <div className="flex-1 p-4 max-w-4xl w-full mx-auto flex flex-col gap-4">
        {isComposing ? (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-2xl font-bold">블로그 작성</h2>
              
              {/* AI Tool */}
              <a 
                href="https://ai.studio/apps/f0d06644-78ef-4e2f-a2e7-00aad52cb0ef?fullscreenApplet=true"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 px-4 py-2 rounded-lg font-bold transition-colors text-white"
              >
                <Sparkles className="w-4 h-4 text-yellow-400" />
                ai 자동작성
              </a>
            </div>

            <input 
              type="text" 
              placeholder="제목을 입력하세요" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 font-bold text-lg focus:outline-none focus:border-blue-500"
            />
            
            <textarea 
              placeholder="내용을 입력하세요..." 
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 min-h-[300px] resize-y focus:outline-none focus:border-blue-500"
            ></textarea>
            
            <div className="flex justify-end gap-3 mt-2">
              <button 
                onClick={() => setIsComposing(false)}
                className="px-6 py-2 rounded-lg font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              >
                취소
              </button>
              <button 
                onClick={handleSubmit}
                className="flex items-center gap-2 px-6 py-2 rounded-lg font-bold bg-blue-600 hover:bg-blue-500 text-white transition-colors"
              >
                <Send className="w-4 h-4" />
                게시하기
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {blogs.length === 0 ? (
              <div className="text-center text-slate-500 mt-20 flex flex-col items-center">
                <MessageSquare className="w-16 h-16 mb-4 opacity-50" />
                <p>아직 작성된 캐로그가 없습니다.</p>
                <p className="text-sm mt-2">첫 번째 글을 작성해보세요!</p>
              </div>
            ) : (
              blogs.map((blog) => (
                <div key={blog.id} className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-slate-700 transition-colors">
                  <h3 className="text-xl font-bold mb-3">{blog.title}</h3>
                  <div className="text-sm text-slate-400 flex items-center gap-4 mb-4">
                    <span className="font-semibold text-blue-400">@{blog.authorName}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3"/> {blog.createdAt?.toDate ? blog.createdAt.toDate().toLocaleDateString() : '방금 전'}</span>
                  </div>
                  <div className="text-slate-300 leading-relaxed whitespace-pre-wrap line-clamp-6">
                    {blog.content}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
