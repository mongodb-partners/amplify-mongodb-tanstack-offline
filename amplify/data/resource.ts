import { type ClientSchema, a, defineData } from "@aws-amplify/backend";
import {
  addTodoHandler,
  listTodoHandler,
  deleteTodoHandler,
  updateTodoHandler,
} from "../functions/resource";

const schema = a.schema({
  Todo: a.customType({
    _id: a.id().required(),
    content: a.string(),
  }),
  ListTodoResponse: a.customType({
    statusCode: a.integer().required(),
    todoList: a.ref("Todo").array(),
  }),
  AddTodoResponse: a.customType({
    statusCode: a.integer().required(),
    todo: a.ref("Todo"),
  }),
  DeleteTodoResponse: a.customType({
    statusCode: a.integer().required(),
    count: a.integer().required(),
    deletedId: a.string().required(),
  }),
  UpdatedTodoResponse: a.customType({
    statusCode: a.integer().required(),
    count: a.integer().required(),
    todo: a.ref("Todo"),
  }),
  addTodo: a
    .mutation()
    .arguments({
      _id: a.id(),
      content: a.string().required(),
    })
    .returns(a.ref("AddTodoResponse"))
    .authorization((allow) => [allow.authenticated()])
    .handler(a.handler.function(addTodoHandler)),
  listTodo: a
    .query()
    .returns(a.ref("ListTodoResponse"))
    .authorization((allow) => [allow.authenticated()])
    .handler(a.handler.function(listTodoHandler)),
  deleteTodo: a
    .mutation()
    .arguments({
      _id: a.string().required(),
    })
    .returns(a.ref("DeleteTodoResponse"))
    .authorization((allow) => [allow.authenticated()])
    .handler(a.handler.function(deleteTodoHandler)),
  updateTodo: a
    .mutation()
    .arguments({
      _id: a.string().required(),
      content: a.string().required(),
    })
    .returns(a.ref("UpdatedTodoResponse"))
    .authorization((allow) => [allow.authenticated()])
    .handler(a.handler.function(updateTodoHandler)),
  RealEstateProperty: a
    .model({
      name: a.string().required(),
      address: a.string(),
    })
    .authorization((allow) => [allow.guest()]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "userPool",
    apiKeyAuthorizationMode: {
      expiresInDays: 30,
    },
  },
});
