import type { AppSyncIdentityCognito } from "aws-lambda";

import type { Schema } from "../data/resource";
import { connectToMongodb } from "./mdbUtils";
import { ObjectId } from "mongodb";

export const handler: Schema["deleteTodo"]["functionHandler"] = async (
  event
) => {
  // Connect to MongoDB
  const [client, , collection] = connectToMongodb();
  try {
    console.log("Connected to MongoDB");
    let user = null;
    if ((event.identity as AppSyncIdentityCognito).username)
      user = (event.identity as AppSyncIdentityCognito).username;

    const id = event.arguments._id!;

    // delete where object id and user match
    const deleteResult = await collection.deleteOne({
      _id: new ObjectId(id),
      username: user,
    });

    return {
      statusCode: 200,
      count: deleteResult.deletedCount,
      deletedId: id,
    };
  } catch (e) {
    return {
      statusCode: 500,
      count: 0,
      deletedId: "",
    };
  } finally {
    if (client) {
      await client.close();
    }
  }
};
