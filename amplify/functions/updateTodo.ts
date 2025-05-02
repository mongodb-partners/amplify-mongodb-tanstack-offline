import type { AppSyncIdentityCognito } from "aws-lambda";
import { ObjectId } from "mongodb";
import type { Schema } from "../data/resource";
import { connectToMongodb } from "./mdbUtils";

export const handler: Schema["updateTodo"]["functionHandler"] = async (
  event
) => {
  // Connect to MongoDB

  const [client, , collection] = connectToMongodb();
  try {
    console.log("Connected to MongoDB");
    let user = null;
    if ((event.identity as AppSyncIdentityCognito).username)
      user = (event.identity as AppSyncIdentityCognito).username;

    const payload = { content: event.arguments.content, username: user };
    const documentId = new ObjectId(event.arguments._id!);
    const updateResult = await collection.updateOne(
      { _id: documentId, username: user },
      { $set: payload }
    );

    // return successResponse(updateResult, payload);
    return {
      statusCode: 200,

      count: updateResult.modifiedCount,
      todo: { ...payload, _id: event.arguments._id },
    };
  } catch (e) {
    console.log("got error: " + e);
    return {
      statusCode: 500,
      count: 0,
      todo: event.arguments,
    };
  } finally {
    if (client) {
      await client.close();
    }
  }
};
