// src/models/ChatModel.ts
import { Message, MessageInput } from "./types";

export class ChatModel {
  private messages: Message[] = [];
  private listeners: Set<() => void> = new Set();

  addMessage(messageInput: MessageInput): string {
    const id = crypto.randomUUID();
    const message: Message = {
      ...messageInput,
      id,
    };
    this.messages.push(message);
    this.notifyListeners();
    return id;
  }

  updateMessage(messageId: string, content: string) {
    const messageIndex = this.messages.findIndex((msg) => msg.id === messageId);
    if (messageIndex !== -1) {
      this.messages[messageIndex] = {
        ...this.messages[messageIndex],
        content,
      };
      this.notifyListeners();
    }
  }

  getMessages(): Message[] {
    return [...this.messages];
  }

  clear() {
    this.messages = [];
    this.notifyListeners();
  }

  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners() {
    this.listeners.forEach((listener) => listener());
  }
}
