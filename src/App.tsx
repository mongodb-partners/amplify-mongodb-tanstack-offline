import { useMutation, useQuery } from "@tanstack/react-query";
import { Authenticator } from "@aws-amplify/ui-react";
import { Schema } from "../amplify/data/resource";
import { amplifyClient, tanstackClient } from "./main";
type Todo = Schema["Todo"]["type"];

function App() {
  const query = useQuery({
    queryKey: ["listTodo"],
    staleTime: 60 * 1000,
    // networkMode: "offlineFirst",
    // initialData: [{_id:"666", content: "Initial value"}],
    queryFn: async () => {
      const response = await amplifyClient.queries.listTodo();
      console.log({ response });
      const allTodos = response.data;

      if (!allTodos) return null;

      return allTodos.todoList;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (input: { content: string }) => {
      const { data } = await amplifyClient.mutations.addTodo(input);
      console.log(data);
      return data;
    },
    // When mutate is called:
    onMutate: async (newTodo) => {
      // Cancel any outgoing refetches
      // (so they don't overwrite our optimistic update)
      await tanstackClient.cancelQueries({ queryKey: ["listTodo"] });

      // Snapshot the previous value
      const previousTodoList = tanstackClient.getQueryData(["listTodo"]);

      // Optimistically update to the new value
      if (previousTodoList) {
        tanstackClient.setQueryData(["listTodo"], (old: Todo[]) => [
          ...old,
          newTodo,
        ]);
      }

      // Return a context object with the snapshotted value
      return { previousTodoList };
    },
    // If the mutation fails,
    // use the context returned from onMutate to rollback
    onError: (err, newTodo, context) => {
      console.error("Error saving record:", err, newTodo);
      if (context?.previousTodoList) {
        tanstackClient.setQueryData(["listTodo"], context.previousTodoList);
      }
    },
    // Always refetch after error or success:
    onSettled: () => {
      tanstackClient.invalidateQueries({ queryKey: ["listTodo"] });
    },
    onSuccess: () => {
      tanstackClient.invalidateQueries({ queryKey: ["listTodo"] });
    },
  });

  const createTodo = async () => {
    const itemContent = window.prompt("Todo content");
    if (!itemContent) return;
    createMutation.mutate({
      content: itemContent,
    });
  };

  const updateTodo = async (todo: Todo) => {
    if (!todo) return;

    const itemContent = window.prompt("Todo content", todo.content as string);
    if (!itemContent) return;

    const updatedTodo: Todo = { ...todo, content: itemContent };

    updateMutation.mutate({
      _id: updatedTodo._id,
      content: updatedTodo.content as string,
    });
  };

  const updateMutation = useMutation({
    mutationFn: async (todo: { _id: string; content: string }) => {
      const { data } = await amplifyClient.mutations.updateTodo(todo);

      return data!.todo;
    },
    // When mutate is called:
    onMutate: async (updatedTodo: { _id: string; content: string }) => {
      // Cancel any outgoing refetches
      // (so they don't overwrite our optimistic update)

      await tanstackClient.cancelQueries({
        queryKey: ["listTodo"],
      });

      const previousTodoList = tanstackClient.getQueryData(["listTodo"]);

      // filter out the old Todo to list
      const newList = (previousTodoList as Todo[]).filter(
        (todo: Todo) => todo._id !== updatedTodo._id
      );
      newList.push(updatedTodo);
      // Optimistically update to the new value
      if (previousTodoList) {
        tanstackClient.setQueryData(["listTodo"], () => newList);
      }

      // Return a context with the new Todo
      return { updatedTodo };
    },
    // If the mutation fails, use the context we returned above
    onError: (err, updatedTodo) => {
      console.error("Error updating record:", err, updatedTodo);
    },
    // Always refetch after error or success:
    onSettled: (updatedTodo) => {
      if (updatedTodo) {
        tanstackClient.invalidateQueries({
          queryKey: ["listTodo", updatedTodo._id],
        });
      }
      tanstackClient.invalidateQueries({
        queryKey: ["listTodo"],
      });
    },
  });

  async function deleteTodo(
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    id: string
  ) {
    e.stopPropagation();
    deleteMutation.mutate({ _id: id });
  }

  const deleteMutation = useMutation({
    mutationFn: async (input: { _id: string }) => {
      const { data } = await amplifyClient.mutations.deleteTodo(input);
      return data;
    },
    // When mutate is called:
    onMutate: async (deletedTodo) => {
      // Cancel any outgoing refetches
      // (so they don't overwrite our optimistic update)
      await tanstackClient.cancelQueries({
        queryKey: ["listTodo", deletedTodo._id],
      });

      await tanstackClient.cancelQueries({
        queryKey: ["listTodo"],
      });

      // retrieved the cached list
      const previousTodoList = tanstackClient.getQueryData(["listTodo"]);

      // Optimistically remove to the deleted Todo
      if (previousTodoList) {
        // filter out deleted todo
        const newList = (previousTodoList as Todo[]).filter(
          (todo: Todo) => todo._id !== deletedTodo._id
        );
        tanstackClient.setQueryData(["listTodo"], () => newList);
      }

      // Return a context with the previous and new Todo
      return { deletedTodo };
    },
    // If the mutation fails, use the context we returned above
    onError: (err, deletedTodo) => {
      console.error("Error deleting record:", err, deletedTodo);
    },
    // Always refetch after error or success:
    onSettled: () => {
      tanstackClient.invalidateQueries({
        queryKey: ["listTodo"],
      });
    },
    onSuccess: () => {
      tanstackClient.invalidateQueries({ queryKey: ["listTodo"] });
    },
  });

  return (
    <Authenticator>
      {({ signOut, user }) => (
        <main>
          <h1>Hello {user?.username}</h1>
          <button onClick={signOut}>Sign out</button>
          <h1>My todos</h1>
          {query.isError && <div>Problem loading Todos</div>}
          {query.isLoading && (
            <div style={styles.loadingIndicator}>Loading Todos...</div>
          )}
          {createMutation.isPending && (
            <div style={styles.loadingIndicator}>Creating New Todo...</div>
          )}
          {createMutation.isError && (
            <div style={styles.loadingIndicator}>
              Error Creating New Todo...
            </div>
          )}
          {updateMutation.isPending && (
            <div style={styles.loadingIndicator}>Updating Todo...</div>
          )}
          {updateMutation.isError && (
            <div style={styles.loadingIndicator}>Error Updating Todo...</div>
          )}
          {query.isSuccess && (
            <div>
              <button onClick={createTodo}>+ new</button>
              <ul>
                {query.data!.map((todo) => {
                  if (!todo) return null;
                  return (
                    <li style={styles.todoItem}>
                      {todo.content}{" "}
                      <span>
                        <button onClick={() => updateTodo(todo)} key={todo._id}>
                          update
                        </button>{" "}
                        <button
                          style={styles.deleteButton}
                          onClick={(event) => deleteTodo(event, todo._id)}
                        >
                          delete
                        </button>
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          <div>
            🥳 App successfully hosted. Try creating a new todo.
            <br />
            <a href="https://docs.amplify.aws/react/start/quickstart/#make-frontend-updates">
              Review next step of this tutorial.
            </a>
          </div>
        </main>
      )}
    </Authenticator>
  );
}

export default App;

const styles = {
  loadingIndicator: {
    border: "1px solid black",
    padding: "1rem",
    margin: "1rem",
  },
  deleteButton: {
    backgroundColor: "red",
    color: "white",
  },
  todoItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
} as const;
