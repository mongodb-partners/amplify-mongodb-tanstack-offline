import type { AppSyncIdentityCognito } from "aws-lambda";

import type { Schema } from "../data/resource";
import { connectToMongodb } from "./mdbUtils";

export const handler: Schema["addTodo"]["functionHandler"] = async (event) => {
  // Connect to MongoDB
  const [client, , collection] = connectToMongodb();
  try {
    console.log("Connected to MongoDB");
    let user = null;
    if ((event.identity as AppSyncIdentityCognito).username)
      user = (event.identity as AppSyncIdentityCognito).username;

    const payload = { content: event.arguments.content, username: user };
    const insertResult = await collection.insertOne(payload);
    const todo = { _id: insertResult.insertedId.toString(), ...payload };

    return {
      statusCode: 200,
      todo,
    };
  } catch (e) {
    return {
      statusCode: 500,
      todo: null,
    };
  } finally {
    if (client) {
      await client.close();
    }
  }
};
