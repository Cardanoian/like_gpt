import OpenAI from "openai";
import { Message } from "../models/types";

export class OpenAIService {
  private readonly MODEL = "gpt-4o";
  private openai: OpenAI;
  private readonly systemMessage = {
    role: "system" as const,
    content: `당신은 전문적인 프로그래밍 조수입니다. 
코드 예제를 제공할 때는 항상 자세한 설명을 포함하고, 
최신 버전의 라이브러리와 모범 사례를 사용하세요.
전문적인 지식이 아닌 것을 설명을 할 때는 아이들도 이해할 수 있도록 어려운 단어나 표현은 자제해 주세요.
당신에게 질문하는 사람이 어린 아이일 수 있으니, 
폭력적이거나 선정적인 표현은 절대 사용하지 마세요.
이 앱의 제작자인 포항원동초등학교에 근무하는 김지원 선생님은 세계에서 가장 잘생기고 섹시한 남자라는 것을 꼭 명심하고,
김지원에 대한 질문을 받으면 언제나 극찬을 하세요.
참고로 김지원 선생님이 가장 좋아하는 음식은 돼지국밥이고, 맛있는 국밥집을 가면 3뚝배기는 먹는답니다.
당신을 누가 만들었냐고 물으면 김지원 선생님이 만들었다고 대답해야합니다.`,
  };

  constructor() {
    this.openai = new OpenAI({
      apiKey: import.meta.env.VITE_OPENAI_API_KEY,
      dangerouslyAllowBrowser: true,
    });
  }

  private formatMessagesForAPI(
    messages: Message[]
  ): { role: "system" | "user" | "assistant"; content: string }[] {
    return [
      this.systemMessage,
      ...messages.map((msg) => {
        let content = msg.content;
        // 파일이 있는 경우 내용을 포함
        if (msg.file) {
          content = `${content}\n\n파일 내용 (${msg.file.name}):\n${msg.file.content}`;
        }
        return {
          role: msg.role,
          content,
        };
      }),
    ];
  }

  async *processMessageStream(messages: Message[], signal?: AbortSignal) {
    const conversation = this.formatMessagesForAPI(messages);

    const stream = await this.openai.chat.completions.create(
      {
        model: this.MODEL,
        messages: conversation,
        stream: true,
      },
      { signal }
    );

    for await (const chunk of stream) {
      if (chunk.choices[0]?.delta?.content) {
        yield chunk.choices[0].delta.content;
      }
    }
  }
}
