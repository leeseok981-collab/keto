import React, { useState, useEffect, useRef } from 'react';
import { Youtube, Play, Image as ImageIcon, Heart, MessageCircle, Share, Trash2, Send, Upload, FileVideo, FileText, Users } from 'lucide-react';
import { db } from './firebase';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, doc, updateDoc, deleteDoc, arrayUnion, arrayRemove, where, getDocs, limit, getDoc } from 'firebase/firestore';

export const ChannelView = ({ user, userData, onBack }: any) => {
    const [posts, setPosts] = useState<any[]>([]);
    const [viewMode, setViewMode] = useState<'feed' | 'my'>('feed');
    const [filterType, setFilterType] = useState<'all' | 'image' | 'video'>('all');
    const [uploadType, setUploadType] = useState<'none' | 'image' | 'video'>('none');
    const [showFriendModal, setShowFriendModal] = useState(false);
    const [friendSearchQuery, setFriendSearchQuery] = useState('');
    const [friendSearchResults, setFriendSearchResults] = useState<any[]>([]);
    const [friendRequests, setFriendRequests] = useState<any[]>([]);
    const [friendTab, setFriendTab] = useState<'search' | 'requests'>('search');

    
    const [newPostUrl, setNewPostUrl] = useState('');
    const [newPostText, setNewPostText] = useState('');
    const [newPostType, setNewPostType] = useState<'video' | 'image'>('image');

    const [activeComments, setActiveComments] = useState<string | null>(null);
    const [commentText, setCommentText] = useState('');

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!user) return;
        const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
        const unsub = onSnapshot(q, (snap) => {
            setPosts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        }, (err) => {
            console.warn("posts snapshot error:", err);
        });
        return () => unsub();
    }, [user]);


    useEffect(() => {
        if (!user) return;
        const reqUnsub = onSnapshot(query(collection(db, 'friendRequests'), where('to', '==', user.uid), where('status', '==', 'pending')), (snap) => {
            setFriendRequests(snap.docs.map(d => ({id: d.id, ...d.data()})));
        }, (err) => {
            console.warn("friendRequests snapshot error:", err);
        });
        return () => reqUnsub();
    }, [user]);

    const searchFriends = async () => {
        import('firebase/firestore').then(({ getDocs, limit, where, query, collection }) => {
            if (!friendSearchQuery.trim()) return;
            const q = query(collection(db, 'users'), where('nickname', '==', friendSearchQuery.trim()), limit(5));
            getDocs(q).then(snap => {
                setFriendSearchResults(snap.docs.map(d => ({ uid: d.id, ...d.data() })).filter(u => u.uid !== user?.uid));
            });
        });
    };

    const sendFriendRequest = async (targetUid: string) => {
        if (!user) return;
        await addDoc(collection(db, 'friendRequests'), {
            from: user.uid,
            fromName: userData.nickname,
            fromPic: userData.profilePic,
            to: targetUid,
            status: 'pending',
            createdAt: serverTimestamp()
        });
        alert('친구 요청을 보냈습니다!');
    };

    const acceptFriendRequest = async (reqId: string, fromUid: string) => {
        if (!user) return;
        import('firebase/firestore').then(async ({ doc, getDoc }) => {
            await updateDoc(doc(db, 'friendRequests', reqId), { status: 'accepted' });
            
            const userDocRef = doc(db, 'users', user.uid);
            const userDocSnap = await getDoc(userDocRef);
            let newFriends = [];
            if (userDocSnap.exists()) {
                const friends = userDocSnap.data().friends || [];
                if (!friends.includes(fromUid)) {
                    newFriends = [...friends, fromUid];
                    await updateDoc(userDocRef, { friends: newFriends, updatedAt: serverTimestamp() });
                }
            }
            
            const fromDocRef = doc(db, 'users', fromUid);
            const fromDocSnap = await getDoc(fromDocRef);
            if (fromDocSnap.exists()) {
                const fromFriends = fromDocSnap.data().friends || [];
                if (!fromFriends.includes(user.uid)) {
                    await updateDoc(fromDocRef, { friends: [...fromFriends, user.uid], updatedAt: serverTimestamp() });
                }
            }
            alert('친구 추가 완료!');
        });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        
        if (file.size > 10000 * 1024) {
            alert('파일 크기는 최대 10,000KB(10MB) 이하여야 합니다.');
            if (fileInputRef.current) fileInputRef.current.value = '';
            return;
        }

        const reader = new FileReader();
        reader.onload = (ev) => {
            if (ev.target?.result) {
                setNewPostUrl(ev.target.result as string);
                setNewPostType(file.type.startsWith('video/') ? 'video' : 'image');
            }
        };
        reader.readAsDataURL(file);
    };

    const handleUpload = async () => {
        if (!newPostUrl || !newPostText) return;
        await addDoc(collection(db, 'posts'), {
            authorId: user.uid,
            authorName: userData.nickname || 'Unknown',
            authorPic: userData.profilePic || '',
            type: newPostType,
            url: newPostUrl,
            text: newPostText,
            likes: [],
            comments: [],
            createdAt: serverTimestamp()
        });
        setUploadType('none');
        setNewPostUrl('');
        setNewPostText('');
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const toggleLike = async (postId: string, currentLikes: string[]) => {
        const postRef = doc(db, 'posts', postId);
        if (currentLikes.includes(user.uid)) {
            await updateDoc(postRef, { likes: arrayRemove(user.uid) });
        } else {
            await updateDoc(postRef, { likes: arrayUnion(user.uid) });
        }
    };

    const addComment = async (postId: string) => {
        if (!commentText.trim()) return;
        const postRef = doc(db, 'posts', postId);
        await updateDoc(postRef, {
            comments: arrayUnion({
                id: Date.now().toString(),
                authorName: userData.nickname,
                text: commentText
            })
        });
        setCommentText('');
    };

    const deletePost = async (postId: string) => {
        if (window.confirm("정말 삭제하시겠습니까?")) {
            await deleteDoc(doc(db, 'posts', postId));
        }
    };

    let displayPosts = viewMode === 'feed' ? posts : posts.filter(p => p.authorId === user.uid);
    if (filterType !== 'all') {
        displayPosts = displayPosts.filter(p => p.type === filterType);
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white flex flex-col p-4 md:p-8 w-full max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-black flex items-center gap-2"><Youtube className="w-8 h-8 text-red-500"/> 소셜 채널 (캐디오)</h1>
                <button onClick={onBack} className="bg-slate-800 hover:bg-slate-700 px-6 py-2 rounded-xl font-bold">로비로 돌아가기</button>
            </div>

            <div className="flex flex-col md:flex-row gap-4 mb-6 justify-between">
                <div className="flex gap-2">
                    <button onClick={() => setViewMode('feed')} className={`px-4 py-2 rounded-xl font-black transition-colors ${viewMode === 'feed' ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-400'}`}>전체 피드</button>
                    <button onClick={() => setViewMode('my')} className={`px-4 py-2 rounded-xl font-black transition-colors ${viewMode === 'my' ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-400'}`}>내 채널</button>
                </div>
                
                <div className="flex gap-2 bg-slate-900 p-1 rounded-xl">
                    <button onClick={() => setFilterType('all')} className={`px-4 py-1.5 rounded-lg font-bold text-sm ${filterType === 'all' ? 'bg-slate-700 text-white' : 'text-slate-400'}`}>전체보기</button>
                    <button onClick={() => setFilterType('image')} className={`px-4 py-1.5 rounded-lg font-bold text-sm flex items-center gap-1 ${filterType === 'image' ? 'bg-slate-700 text-white' : 'text-slate-400'}`}><FileText className="w-4 h-4"/> 게시글</button>
                    <button onClick={() => setFilterType('video')} className={`px-4 py-1.5 rounded-lg font-bold text-sm flex items-center gap-1 ${filterType === 'video' ? 'bg-slate-700 text-white' : 'text-slate-400'}`}><FileVideo className="w-4 h-4"/> 영상</button>
                </div>

                <div className="flex gap-2">
                    <button onClick={() => setUploadType(uploadType === 'image' ? 'none' : 'image')} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold transition-colors shadow-[0_0_15px_rgba(79,70,229,0.3)] flex items-center gap-2"><ImageIcon className="w-4 h-4"/> 사진 올리기</button>
                    <button onClick={() => setUploadType(uploadType === 'video' ? 'none' : 'video')} className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded-xl font-bold transition-colors shadow-[0_0_15px_rgba(220,38,38,0.3)] flex items-center gap-2"><FileVideo className="w-4 h-4"/> 영상 올리기</button>
                </div>
            </div>

            {uploadType !== 'none' && (
                <div className="bg-slate-900 border-2 border-slate-700 rounded-2xl p-6 mb-8 shadow-xl">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Upload className="w-5 h-5"/> 새 게시물 업로드</h2>
                    
                    <div className="mb-4">
                        <label className="block text-slate-400 mb-2 font-bold text-sm">파일 선택 (최대 10,000KB / 10MB 이하)</label>
                        <input 
                            type="file" 
                            accept={uploadType === 'video' ? 'video/*' : 'image/*'} 
                            onChange={handleFileChange} 
                            ref={fileInputRef}
                            className="w-full bg-slate-800 p-3 rounded-xl border border-slate-700 text-slate-300 outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-cyan-600 file:text-white hover:file:bg-cyan-700 cursor-pointer"
                        />
                    </div>
                    
                    {newPostUrl && (
                        <div className="mb-4 border border-slate-700 rounded-xl overflow-hidden bg-black/50 aspect-video flex items-center justify-center">
                            {newPostType === 'image' ? (
                                <img src={newPostUrl} className="max-h-64 object-contain" />
                            ) : (
                                <video src={newPostUrl} controls className="max-h-64" />
                            )}
                        </div>
                    )}

                    <textarea value={newPostText} onChange={e=>setNewPostText(e.target.value)} placeholder="게시물 내용을 작성하세요..." className="w-full bg-slate-800 p-4 rounded-xl border border-slate-700 outline-none mb-4 min-h-[100px] resize-none" />
                    
                    <button onClick={handleUpload} disabled={!newPostUrl || !newPostText} className="w-full bg-green-600 hover:bg-green-500 disabled:bg-slate-700 disabled:text-slate-500 py-4 rounded-xl font-black transition-colors text-lg">업로드 완료</button>
                </div>
            )}


            {showFriendModal && (
                <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
                    <div className="bg-slate-900 rounded-3xl w-full max-w-lg overflow-hidden border border-slate-700">
                        <div className="flex justify-between items-center p-6 border-b border-slate-800 bg-slate-800/50">
                            <h2 className="text-xl font-black text-white flex items-center gap-2"><Users className="text-cyan-400"/> 친구 시스템</h2>
                            <button onClick={() => setShowFriendModal(false)} className="text-slate-400 hover:text-white bg-slate-800 p-2 rounded-lg">✕</button>
                        </div>
                        <div className="flex border-b border-slate-800">
                            <button onClick={() => setFriendTab('search')} className={`flex-1 p-4 text-sm font-bold ${friendTab === 'search' ? 'text-cyan-400 border-b-2 border-cyan-400 bg-cyan-900/10' : 'text-slate-400 hover:text-white'}`}>친구 검색</button>
                            <button onClick={() => setFriendTab('requests')} className={`flex-1 p-4 text-sm font-bold relative ${friendTab === 'requests' ? 'text-pink-400 border-b-2 border-pink-400 bg-pink-900/10' : 'text-slate-400 hover:text-white'}`}>
                                요청 확인
                                {friendRequests.length > 0 && <span className="absolute top-2 right-4 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{friendRequests.length}</span>}
                            </button>
                        </div>
                        <div className="p-6 h-80 overflow-y-auto">
                            {friendTab === 'search' && (
                                <div>
                                    <div className="flex gap-2 mb-6">
                                        <input type="text" placeholder="닉네임으로 검색" value={friendSearchQuery} onChange={e=>setFriendSearchQuery(e.target.value)} onKeyDown={e=>e.key==='Enter'&&searchFriends()} className="flex-1 bg-slate-800 p-3 rounded-xl outline-none text-sm text-white" />
                                        <button onClick={searchFriends} className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 rounded-xl font-bold">검색</button>
                                    </div>
                                    <div className="space-y-3">
                                        {friendSearchResults.map((u, i) => (
                                            <div key={i} className="flex justify-between items-center bg-slate-800/50 p-3 rounded-xl border border-slate-700">
                                                <div className="flex items-center gap-3">
                                                    <img src={u.profilePic || 'https://api.dicebear.com/7.x/bottts/svg?seed=1'} className="w-10 h-10 rounded-lg bg-slate-700" />
                                                    <span className="font-bold text-white">{u.nickname || 'Unknown'}</span>
                                                </div>
                                                <button onClick={() => sendFriendRequest(u.uid)} className="bg-slate-700 hover:bg-cyan-600 text-white text-xs font-bold px-3 py-2 rounded-lg transition-colors">요청 보내기</button>
                                            </div>
                                        ))}
                                        {friendSearchResults.length === 0 && friendSearchQuery && (
                                            <div className="text-center text-slate-500 py-10">검색 결과가 없습니다.</div>
                                        )}
                                    </div>
                                </div>
                            )}
                            {friendTab === 'requests' && (
                                <div className="space-y-3">
                                    {friendRequests.length === 0 ? (
                                        <div className="text-center text-slate-500 py-10">받은 요청이 없습니다.</div>
                                    ) : friendRequests.map((req, i) => (
                                        <div key={i} className="flex justify-between items-center bg-slate-800 p-3 rounded-xl border border-slate-700">
                                            <div className="flex items-center gap-3">
                                                <img src={req.fromPic || 'https://api.dicebear.com/7.x/bottts/svg?seed=1'} className="w-10 h-10 rounded-lg bg-slate-700" />
                                                <span className="font-bold text-white">{req.fromName || 'Unknown'}</span>
                                            </div>
                                            <button onClick={() => acceptFriendRequest(req.id, req.from)} className="bg-pink-600 hover:bg-pink-500 text-white text-xs font-bold px-3 py-2 rounded-lg transition-colors">수락하기</button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <div className="space-y-8">
                {displayPosts.map(post => (
                    <div key={post.id} className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-lg">
                        <div className="p-4 flex items-center justify-between border-b border-slate-800">
                            <div className="flex items-center gap-3">
                                <img src={post.authorPic} className="w-12 h-12 rounded-full border-2 border-slate-700 bg-slate-800" />
                                <div>
                                    <div className="font-black text-lg">{post.authorName}</div>
                                    <div className="text-xs text-slate-500">{new Date(post.createdAt?.seconds * 1000).toLocaleString()}</div>
                                </div>
                            </div>
                            {post.authorId === user.uid && (
                                <button onClick={() => deletePost(post.id)} className="text-slate-500 hover:text-red-500 p-2 transition-colors"><Trash2 className="w-5 h-5"/></button>
                            )}
                        </div>
                        
                        <div className="bg-black/80 flex items-center justify-center overflow-hidden relative">
                            {post.type === 'image' ? (
                                <img src={post.url} className="w-full max-h-[600px] object-contain" />
                            ) : (
                                <video src={post.url} controls className="w-full max-h-[600px]" />
                            )}
                        </div>
                        
                        <div className="p-6">
                            <div className="flex gap-6 mb-4">
                                <button onClick={() => toggleLike(post.id, post.likes || [])} className={`flex items-center gap-2 font-bold transition-transform active:scale-90 ${ (post.likes||[]).includes(user.uid) ? 'text-red-500' : 'text-slate-400 hover:text-red-400'}`}>
                                    <Heart className={`w-7 h-7 ${ (post.likes||[]).includes(user.uid) ? 'fill-current' : ''}`}/> {(post.likes||[]).length}
                                </button>
                                <button onClick={() => setActiveComments(activeComments === post.id ? null : post.id)} className="flex items-center gap-2 font-bold text-slate-400 hover:text-white transition-colors">
                                    <MessageCircle className="w-7 h-7"/> {(post.comments||[]).length}
                                </button>
                                <button className="flex items-center gap-2 font-bold text-slate-400 hover:text-white transition-colors">
                                    <Share className="w-7 h-7"/> 공유
                                </button>
                            </div>
                            <p className="text-slate-200 leading-relaxed text-lg"><span className="font-black text-white mr-2">{post.authorName}</span> {post.text}</p>
                            
                            {activeComments === post.id && (
                                <div className="mt-6 pt-6 border-t border-slate-800">
                                    <div className="space-y-4 mb-4 max-h-60 overflow-y-auto pr-2 scrollbar-hide">
                                        {(post.comments||[]).map((c:any) => (
                                            <div key={c.id} className="text-sm bg-slate-800/50 p-3 rounded-xl">
                                                <span className="font-black text-cyan-400 mr-2">{c.authorName}</span>
                                                <span className="text-slate-300">{c.text}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex gap-2">
                                        <input type="text" value={commentText} onChange={e=>setCommentText(e.target.value)} placeholder="댓글을 입력하세요..." className="flex-1 bg-slate-800 p-3 rounded-xl outline-none text-sm border border-slate-700 focus:border-cyan-500 transition-colors" />
                                        <button onClick={() => addComment(post.id)} className="bg-cyan-600 hover:bg-cyan-500 px-6 rounded-xl font-bold transition-colors"><Send className="w-4 h-4"/></button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                {displayPosts.length === 0 && (
                    <div className="text-center py-20 text-slate-500">
                        <Youtube className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <p className="text-xl font-bold">아직 업로드된 게시물이 없습니다.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
