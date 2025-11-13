

import { GoogleGenAI } from "@google/genai";
import { StrategicPlan, SWOT, Objective, QuarterlyAction } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const formatList = (items: string[]): string => {
    return items.filter(item => item.trim() !== '').map(item => `- ${item}`).join('\n');
};

const formatObjectives = (objectives: Objective[]): string => {
    return objectives
        .filter(obj => obj.title.trim() !== '')
        .map(obj => {
            const keyResults = obj.keyResults
                .filter(kr => kr.title.trim() !== '')
                .map(kr => `  - ${kr.title}`)
                .join('\n');
            return `**Objetivo:** ${obj.title}\n**Resultados-Chave:**\n${keyResults}`;
        })
        .join('\n\n');
};

const formatQuarters = (quarters: QuarterlyAction[]): string => {
    return quarters
        .map(q => {
            const actions = q.actions
                .filter(a => a.trim() !== '')
                .map(a => `- ${a}`)
                .join('\n');
            return `**${q.quarter}:**\n${actions}`;
        })
        .join('\n\n');
};

export const generateVisionMissionText = async (
    type: 'vision' | 'mission',
    keywords: string[],
    studioName: string
): Promise<string> => {
    if (keywords.length === 0) {
        return "";
    }

    const promptType = type === 'vision' ? 'Visão de Futuro inspiradora' : 'Missão clara e objetiva';
    const promptKeywords = keywords.join(', ');

    const prompt = `
        Você é um consultor de negócios especialista em branding para estúdios de Pilates.
        Sua tarefa é criar uma declaração de ${promptType} para um estúdio de Pilates chamado "${studioName}".
        A declaração deve ser concisa, profissional e inspiradora, e deve ser baseada nos seguintes conceitos/palavras-chave selecionados pelo proprietário do estúdio:

        **Conceitos-chave:** ${promptKeywords}

        **Instruções:**
        1.  Combine os conceitos de forma coesa e natural.
        2.  Não faça uma lista, crie um parágrafo único de 2 a 3 frases.
        3.  O tom deve ser acolhedor e profissional, refletindo os valores de um estúdio de Pilates focado em bem-estar.

        Gere a declaração de ${promptType}.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text.trim();
    } catch (error) {
        console.error(`Error calling Gemini API for ${type}:`, error);
        throw new Error(`Failed to generate ${type} from Gemini API.`);
    }
};

export const generateGoalSuggestions = async (swot: SWOT): Promise<string[]> => {
    const prompt = `
        Você é um consultor de negócios especialista em estúdios de Pilates.
        Analise a seguinte Análise SWOT de um estúdio e sugira 3 a 5 objetivos estratégicos (OKRs) para o próximo ano.

        **Análise SWOT:**
        **Forças:**
        ${formatList(swot.strengths)}
        
        **Fraquezas:**
        ${formatList(swot.weaknesses)}

        **Oportunidades:**
        ${formatList(swot.opportunities)}

        **Ameaças:**
        ${formatList(swot.threats)}

        **Instruções:**
        1.  Os objetivos devem ser acionáveis e inspiradores.
        2.  Foque em alavancar as forças, abordar as fraquezas, explorar as oportunidades e mitigar as ameaças.
        3.  Liste APENAS os títulos dos objetivos, cada um separado pelo caractere "|". Não adicione números, marcadores ou qualquer outra formatação.
        4.  Seja conciso e direto.

        **Exemplo de saída:** Aumentar a base de clientes fiéis|Lançar novos programas de aulas especializadas|Melhorar a presença digital do estúdio|Otimizar a gestão financeira
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        const text = response.text.trim();
        if (!text) return [];
        return text.split('|').map(s => s.trim()).filter(s => s);
    } catch (error) {
        console.error("Error calling Gemini API for goal suggestions:", error);
        throw new Error("Failed to generate goal suggestions from Gemini API.");
    }
};

export const generateActionSuggestions = async (objectives: Objective[]): Promise<string[]> => {
    const prompt = `
        Você é um consultor de negócios especialista em estúdios de Pilates.
        Analise os seguintes Objetivos e Resultados-Chave (OKRs) de um estúdio e sugira de 5 a 8 ações práticas e trimestrais para alcançá-los.

        **Objetivos e Resultados-Chave (OKRs):**
        ${formatObjectives(objectives)}

        **Instruções:**
        1. As ações devem ser concretas, específicas e realistas para um estúdio de Pilates.
        2. Foque em ações que possam ser executadas dentro de um trimestre.
        3. Liste APENAS as descrições das ações, cada uma separada pelo caractere "|". Não adicione números, marcadores, nem para qual objetivo ela se refere.
        4. Seja conciso e direto.

        **Exemplo de saída:** Lançar uma campanha de marketing de verão|Criar um programa de indicação de alunos|Realizar um workshop de "Pilates para Gestantes"|Fazer 3 posts por semana nas redes sociais|Otimizar o site para buscas locais (SEO)
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        const text = response.text.trim();
        if (!text) return [];
        return text.split('|').map(s => s.trim()).filter(s => s);
    } catch (error) {
        console.error("Error calling Gemini API for action suggestions:", error);
        throw new Error("Failed to generate action suggestions from Gemini API.");
    }
};


export const generateFullReport = async (planData: StrategicPlan): Promise<string> => {
    const prompt = `
        Você é um consultor de negócios especialista em marketing e gestão para estúdios de Pilates.
        Sua tarefa é criar um Plano Estratégico Anual completo e profissional em formato Markdown, baseado nos dados fornecidos pelo usuário.
        O tom deve ser inspirador, estratégico e prático. Organize o conteúdo de forma clara e legível, utilizando títulos, subtítulos, negrito e listas.

        Aqui estão os dados do estúdio:

        **Nome do Estúdio:** ${planData.studioName}
        **Ano do Planejamento:** ${planData.planningYear}
        **Visão de Futuro:** ${planData.vision}
        **Missão do Estúdio:** ${planData.mission}

        **Análise SWOT:**
        **Forças:**
        ${formatList(planData.swot.strengths)}
        
        **Fraquezas:**
        ${formatList(planData.swot.weaknesses)}

        **Oportunidades:**
        ${formatList(planData.swot.opportunities)}

        **Ameaças:**
        ${formatList(planData.swot.threats)}

        **Objetivos Estratégicos Anuais (OKRs):**
        ${formatObjectives(planData.objectives)}

        **Plano de Ação Trimestral:**
        ${formatQuarters(planData.quarterlyActions)}

        **Instruções para a Geração do Relatório:**
        1.  **Sumário Executivo:** Comece com um parágrafo introdutório que resuma o propósito do plano e a visão geral para o ano de ${planData.planningYear}.
        2.  **Estrutura Clara:** Organize o plano nas seções: Visão e Missão, Análise Estratégica (SWOT), Objetivos e Metas (OKRs), e Plano de Ação Trimestral.
        3.  **Análise SWOT Detalhada:** Para cada item da SWOT, escreva um breve comentário ou sugestão de como alavancar forças, mitigar fraquezas, explorar oportunidades e se proteger de ameaças.
        4.  **Conexão entre Seções:** Crie uma narrativa coesa, mostrando como o plano de ação e os objetivos se conectam para realizar a visão e a missão, considerando a análise SWOT.
        5.  **Conclusão Motivacional:** Termine com uma conclusão forte e motivacional, encorajando o proprietário do estúdio a executar o plano com foco e dedicação.
        6.  **Formato:** Use Markdown de forma eficaz (# para títulos principais, ## para subtítulos, etc.).

        Agora, gere o relatório completo para o ano de ${planData.planningYear}.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        throw new Error("Failed to generate report from Gemini API.");
    }
};