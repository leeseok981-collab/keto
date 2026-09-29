import { QuestDefinition, PlayerQuestState, QuestReward } from '../types';
import { MagenAudio } from '../engine/MagenAudio';

export const DEFAULT_QUESTS: QuestDefinition[] = [
    {
        id: 'quest_pebble',
        title: '새로운 여정의 시작',
        giverName: '촌장 엘든',
        description: '지면에 흩어져 있는 작은 돌멩이 3개를 주워 생존 도구를 제작할 준비를 하세요.',
        category: 'tutorial',
        requiredType: 'gather',
        targetId: 101, // pebble
        targetCount: 3,
        reward: {
            coins: 20,
            exp: 15,
            items: [{ itemId: 301, count: 2 }] // 2 apples
        }
    },
    {
        id: 'quest_wood',
        title: '기초 재료 수집',
        giverName: '촌장 엘든',
        description: '주변 참나무를 벌목하여 참나무 원목 4개를 획득하세요.',
        category: 'gathering',
        requiredType: 'gather',
        targetId: 6, // oak log
        targetCount: 4,
        reward: {
            coins: 35,
            exp: 25,
            items: [{ itemId: 302, count: 3 }] // 3 bread
        }
    },
    {
        id: 'quest_harvest',
        title: '풍요로운 수확',
        giverName: '농부 밀러',
        description: '마을 밭이나 직접 경작한 농토에서 밀 또는 당근을 3회 수확하세요.',
        category: 'farming' as any,
        requiredType: 'farm',
        targetCount: 3,
        reward: {
            coins: 45,
            exp: 30,
            items: [{ itemId: 310, count: 5 }] // 5 carrots
        }
    },
    {
        id: 'quest_fish',
        title: '강태공의 비법',
        giverName: '낚시꾼 핀',
        description: '낚싯대를 들고 마을 연못에서 물고기 2마리를 낚아 올리세요.',
        category: 'exploration',
        requiredType: 'fish',
        targetCount: 2,
        reward: {
            coins: 50,
            exp: 35,
            items: [{ itemId: 454, count: 2 }] // 2 cooked salmon
        }
    },
    {
        id: 'quest_zombie',
        title: '마을을 위협하는 어둠',
        giverName: '대장장이 토르벤',
        description: '밤마다 마을 외곽을 배회하는 좀비를 2마리 처치하여 마을의 안전을 지키세요.',
        category: 'combat',
        requiredType: 'kill',
        targetId: 'zombie',
        targetCount: 2,
        reward: {
            coins: 80,
            exp: 60,
            items: [{ itemId: 412, count: 1 }] // Iron sword!
        }
    },
    {
        id: 'quest_blacksmith',
        title: '장인의 불꽃',
        giverName: '대장장이 토르벤',
        description: '대장간의 모루를 이용해 무기나 방어구를 1회 강화(Enhance)해보세요.',
        category: 'crafting',
        requiredType: 'enhance',
        targetCount: 1,
        reward: {
            coins: 100,
            exp: 80,
            items: [{ itemId: 470, count: 2 }] // 2 enhancement stones
        }
    }
];

export class QuestManager {
    private quests: Map<string, QuestDefinition> = new Map();
    private playerQuestStates: Map<string, PlayerQuestState> = new Map();
    public onQuestNotification?: (message: string) => void;

    constructor(initialStates?: { [questId: string]: PlayerQuestState }) {
        DEFAULT_QUESTS.forEach(q => this.quests.set(q.id, q));

        if (initialStates) {
            Object.values(initialStates).forEach(state => {
                this.playerQuestStates.set(state.questId, { ...state });
            });
        } else {
            // By default, start with the first tutorial quest active
            this.playerQuestStates.set('quest_pebble', {
                questId: 'quest_pebble',
                progress: 0,
                completed: false,
                rewardClaimed: false
            });
        }
    }

    public getAllQuests(): QuestDefinition[] {
        return Array.from(this.quests.values());
    }

    public getQuest(id: string): QuestDefinition | undefined {
        return this.quests.get(id);
    }

    public getState(id: string): PlayerQuestState | undefined {
        return this.playerQuestStates.get(id);
    }

    public getAllStatesMap(): { [questId: string]: PlayerQuestState } {
        const result: { [questId: string]: PlayerQuestState } = {};
        this.playerQuestStates.forEach((val, key) => {
            result[key] = { ...val };
        });
        return result;
    }

    public acceptQuest(questId: string): boolean {
        if (!this.playerQuestStates.has(questId)) {
            this.playerQuestStates.set(questId, {
                questId,
                progress: 0,
                completed: false,
                rewardClaimed: false
            });
            const q = this.getQuest(questId);
            if (q && this.onQuestNotification) {
                this.onQuestNotification(`📜 새로운 퀘스트 수락: [${q.title}]`);
            }
            return true;
        }
        return false;
    }

    public claimReward(questId: string): QuestReward | null {
        const state = this.playerQuestStates.get(questId);
        const quest = this.getQuest(questId);
        if (!state || !quest || !state.completed || state.rewardClaimed) {
            return null;
        }

        state.rewardClaimed = true;
        MagenAudio.playExpOrb();
        if (this.onQuestNotification) {
            this.onQuestNotification(`🎉 퀘스트 보상 획득: ${quest.reward.coins}코인 & ${quest.reward.exp} 경험치!`);
        }
        return quest.reward;
    }

    public notifyEvent(type: 'gather' | 'kill' | 'fish' | 'farm' | 'craft' | 'enhance', targetId?: number | string, count: number = 1): void {
        this.playerQuestStates.forEach((state, questId) => {
            if (state.completed) return;
            const quest = this.quests.get(questId);
            if (!quest || quest.requiredType !== type) return;

            // Check matching target
            if (quest.targetId !== undefined && quest.targetId !== targetId) {
                return;
            }

            state.progress = Math.min(quest.targetCount, state.progress + count);
            if (state.progress >= quest.targetCount && !state.completed) {
                state.completed = true;
                MagenAudio.playLevelUp();
                if (this.onQuestNotification) {
                    this.onQuestNotification(`⭐ 퀘스트 완료! [${quest.title}] - NPC를 찾아가 보상을 수령하세요.`);
                }
            }
        });
    }
}
