"use client";

import { Input } from "@/components/ui/input";
import { useState } from "react";
import { MdGrain } from "react-icons/md";
import Markdown from "react-markdown";
import { toast } from "sonner";

export const Chat = () => {
  const [messages, setMessages] = useState<
    { id: number; content: string; sender: "user" | "ai" }[]
  >([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const sendMessage = async () => {
    setMessages((prev) => [
      ...prev,
      { id: prev.length + 1, content: currentMessage, sender: "user" },
    ]);

    try {
      setIsLoading(true);
      const response = await fetch("/api/bot", {
        method: "POST",
        body: JSON.stringify({ message: currentMessage }),
      });
      if (response.ok) {
        const data = await response.json();
        setMessages((prev) => [
          ...prev,
          { id: prev.length + 1, content: data.message.output, sender: "ai" },
        ]);
      }
    } catch {
      toast("An error occurred while asking UnifyMD. Try again.");
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="relative flex flex-col bg-[#F8F3FF] w-1/3 rounded-xl h-[80vh]">
      <div className="flex items-center gap-2 p-8">
        <MdGrain
          size={22}
          className="bg-[#381E72] text-white rounded-full p-[2px]"
        />
        <span className="text-lg text-[#381E72] font-semibold">
          UnifyMD - Your Assistant
        </span>
      </div>

      <div className="flex flex-col gap-4 p-8 overflow-auto pb-24">
        {messages.map((message) => {
          return (
            <span
              key={message.id}
              className={`p-4 rounded-xl ${
                message.sender === "user"
                  ? "bg-white text-black self-end w-4/5"
                  : "bg-[#381E72] text-white self-start w-4/5"
              }`}
            >
              <Markdown>{message.content}</Markdown>
            </span>
          );
        })}
        {isLoading && (
          <div className="flex items-center justify-center gap-2 bg-gray-200 rounded-2xl w-fit p-3">
            <div className="bg-gray-400 animate-bounce w-2 h-2 rounded-full" />
            <div className="bg-gray-400 animate-bounce w-2 h-2 rounded-full" />
            <div className="bg-gray-400 animate-bounce w-2 h-2 rounded-full" />
          </div>
        )}
      </div>

      <Input
        value={currentMessage}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            sendMessage();
            setCurrentMessage("");
          }
        }}
        onChange={(e) => {
          setCurrentMessage(e.target.value);
        }}
        className={`bg-white rounded-2xl bottom-4 py-6 w-[90%] self-center absolute`}
        placeholder="Search about this patient..."
      />
    </div>
  );
};
