import { defineFunction } from "@aws-amplify/backend";
import "dotenv/config";

const envValues = {
  ATLAS_CONNECTION_STRING: process.env.ATLAS_CONNECTION_STRING!,
  COLLECTION_NAME: process.env.COLLECTION_NAME!,
  DB_NAME: process.env.DB_NAME!,
};

const timeoutSeconds = 30;
export const listTodoHandler = defineFunction({
  entry: "./listTodo.ts",
  name: "listTodoHandler",
  timeoutSeconds,
  environment: {
    ...envValues,
  },
});

export const addTodoHandler = defineFunction({
  entry: "./addTodo.ts",
  timeoutSeconds,
  environment: {
    ...envValues,
  },
});

export const deleteTodoHandler = defineFunction({
  entry: "./deleteTodo.ts",
  timeoutSeconds,
  environment: {
    ...envValues,
  },
});

export const updateTodoHandler = defineFunction({
  entry: "./updateTodo.ts",
  timeoutSeconds,
  environment: {
    ...envValues,
  },
});
