export interface TipItem {
    icon: string;
    title: string;
    description: string;
}

// ---- AI Agent Status Types ----
export type UpdateAIAgentStatusBody = {
    id: string;
    active: boolean;
};

export type UpdateAIAgentStatusResponse = any;

// ---- Fetch AI Agent Types ----
export type FetchAIAgentInput = {
    accountId: string;
    userId: string;
    agentId: string;
};

export type FetchAIAgentResponse = any;
