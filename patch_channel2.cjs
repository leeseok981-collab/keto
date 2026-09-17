const fs = require('fs');
let code = fs.readFileSync('src/ChannelSystem.tsx', 'utf8');

// I will insert Banner and Channel Profile editors in viewMode === 'my'
const myViewRegex = /\{viewMode === 'my' && \(\s*<div className="space-y-6">/;

const bannerProfileUI = `
{viewMode === 'my' && (
    <div className="space-y-6">
        <div className="bg-slate-900 p-6 rounded-2xl border-2 border-slate-700">
            <h3 className="text-xl font-black mb-4">채널 설정</h3>
            <div className="flex flex-col sm:flex-row gap-6">
                <div>
                    <label className="block text-sm font-bold text-slate-400 mb-2">채널 프로필</label>
                    <input type="file" accept="image/*" onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = async (ev) => {
                            await updateDoc(doc(db, 'users', user.uid), { channelProfilePic: ev.target.result });
                            alert('채널 프로필이 업데이트되었습니다.');
                        };
                        reader.readAsDataURL(file);
                    }} className="block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-500 file:text-white hover:file:bg-red-600"/>
                </div>
                <div>
                    <label className="block text-sm font-bold text-slate-400 mb-2">채널 배너</label>
                    <input type="file" accept="image/*" onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = async (ev) => {
                            await updateDoc(doc(db, 'users', user.uid), { channelBanner: ev.target.result });
                            alert('채널 배너가 업데이트되었습니다.');
                        };
                        reader.readAsDataURL(file);
                    }} className="block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-500 file:text-white hover:file:bg-red-600"/>
                </div>
            </div>
        </div>
`;

code = code.replace(myViewRegex, bannerProfileUI);
fs.writeFileSync('src/ChannelSystem.tsx', code);
