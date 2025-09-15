import Anthropic from '@anthropic-ai/sdk';

export interface QueryOptimizationResult {
  optimizedQueries: string[];
  reasoning: string;
  originalTopic: string;
}

export class ClaudeQueryOptimizer {
  private anthropic: Anthropic;

  constructor() {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY environment variable is required for Claude query optimization');
    }

    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }

  async optimizeSearchQueries(userTopic: string): Promise<QueryOptimizationResult> {
    try {
      const prompt = `
あなたはニュース検索の専門家です。ユーザーが指定したトピックについて、Brave Search APIで効果的にニュースを収集するための検索クエリを生成してください。

## ユーザーの要求
トピック: "${userTopic}"

## 指示
1. 上記のトピックに関連する最新ニュースを効果的に検索するため、3-5個の検索クエリを生成してください
2. 各クエリは異なる角度からトピックにアプローチし、包括的な情報収集を可能にすること
3. 英語と日本語の両方のニュースをカバーできるよう、適切な言語でクエリを作成すること
4. 検索結果の質を高めるため、具体的で検索しやすいキーワードを使用すること
5. ニュース性の高い情報が得られるよう、最新性を重視したクエリにすること

## 出力形式
以下のJSON形式で回答してください：

{
  "optimizedQueries": [
    "検索クエリ1",
    "検索クエリ2",
    "検索クエリ3",
    "検索クエリ4",
    "検索クエリ5"
  ],
  "reasoning": "クエリ生成の理由と戦略を説明",
  "originalTopic": "${userTopic}"
}

## 例
ユーザートピック: "量子コンピューティングの最新研究"
→ 出力例：
{
  "optimizedQueries": [
    "quantum computing breakthrough 2024",
    "量子コンピューティング 研究 最新",
    "quantum algorithm advances news",
    "量子プロセッサ 開発 IBM Google",
    "quantum supremacy latest results"
  ],
  "reasoning": "量子コンピューティングの分野では、技術的ブレークスルー、企業の研究開発、量子超越性の実証などが主要なニュースとなるため、これらの要素を含むクエリを生成しました。英語圏と日本語圏の両方の情報源をカバーし、主要企業名も含めて具体性を高めています。",
  "originalTopic": "量子コンピューティングの最新研究"
}
`;

      const response = await this.anthropic.messages.create({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 1000,
        temperature: 0.3,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      });

      if (response.content[0].type !== 'text') {
        throw new Error('Invalid response format from Claude API');
      }

      const responseText = response.content[0].text;

      // Extract JSON from response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Could not extract JSON from Claude response');
      }

      const result = JSON.parse(jsonMatch[0]) as QueryOptimizationResult;

      // Validate the result
      if (!result.optimizedQueries || !Array.isArray(result.optimizedQueries) || result.optimizedQueries.length === 0) {
        throw new Error('Invalid optimized queries in Claude response');
      }

      // Ensure we have 3-5 queries
      if (result.optimizedQueries.length < 3) {
        result.optimizedQueries.push(
          `${userTopic} news latest`,
          `${userTopic} recent updates`
        );
      }

      // Limit to 5 queries max
      result.optimizedQueries = result.optimizedQueries.slice(0, 5);

      return result;

    } catch (error) {
      console.error('Claude query optimization error:', error);

      // Fallback to simple query generation
      return this.generateFallbackQueries(userTopic);
    }
  }

  private generateFallbackQueries(userTopic: string): QueryOptimizationResult {
    const baseQueries = [
      `${userTopic} news latest`,
      `${userTopic} recent updates`,
      `${userTopic} breakthrough 2024`,
      `${userTopic} 最新ニュース`,
      `${userTopic} developments`
    ];

    return {
      optimizedQueries: baseQueries.slice(0, 5),
      reasoning: `Claude APIが利用できないため、基本的なクエリパターンを使用してフォールバック検索を実行します。トピック「${userTopic}」に関する英語と日本語の最新ニュースを検索します。`,
      originalTopic: userTopic
    };
  }
}

// Singleton instance
let queryOptimizer: ClaudeQueryOptimizer | null = null;

export function getQueryOptimizer(): ClaudeQueryOptimizer {
  if (!queryOptimizer) {
    queryOptimizer = new ClaudeQueryOptimizer();
  }
  return queryOptimizer;
}