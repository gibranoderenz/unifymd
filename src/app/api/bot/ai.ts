import { ChatPromptTemplate } from "@langchain/core/prompts";
import { ChatOpenAI } from "@langchain/openai";
import { AgentExecutor, createOpenAIToolsAgent } from "langchain/agents";
import { SqlToolkit } from "langchain/agents/toolkits/sql";
import { pull } from "langchain/hub";
import { SqlDatabase } from "langchain/sql_db";
import { DataSource, DataSourceOptions } from "typeorm";

let agentExecutor: AgentExecutor | null = null;

export const getAgentExecutor = async () => {
  if (agentExecutor) {
    return agentExecutor;
  }

  const datasource = new DataSource({
    type: "postgres",
    url: process.env.DATABASE_URL!,
  } as DataSourceOptions);
  const db = await SqlDatabase.fromDataSourceParams({
    appDataSource: datasource,
  });

  const llm = new ChatOpenAI({ model: "gpt-4o-mini", temperature: 0 });

  const toolkit = new SqlToolkit(db, llm);

  const prompt = await pull<ChatPromptTemplate>("hwchase17/openai-tools-agent");

  const agent = await createOpenAIToolsAgent({
    llm,
    tools: toolkit.getTools(),
    prompt,
  });

  const executor = new AgentExecutor({
    agent,
    tools: toolkit.getTools(),
  });

  return executor;
};
