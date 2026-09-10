import ballerina/http;

type Task record {
    int id;
    string title;
    string description;
    string priority;
    boolean done;
};

map<Task> tasks = {};
int nextId = 1;

@http:ServiceConfig {
    cors: {
        allowOrigins: ["http://localhost:5173", "http://localhost:3000"],
        allowCredentials: false,
        allowHeaders: ["Content-Type", "Authorization"],
        allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    }
}
service /api on new http:Listener(9090) {

    resource function get tasks() returns Task[] {
        return tasks.toArray();
    }

    resource function post tasks(@http:Payload TaskInput input) returns Task {
        int id = nextId;
        nextId += 1;
        Task t = {
            id: id,
            title: input.title,
            description: input.description ?: "",
            priority: input.priority ?: "Medium",
            done: false
        };
        tasks[id.toString()] = t;
        return t;
    }

    resource function put tasks/[int id](@http:Payload TaskInput input) returns Task|http:NotFound {
        string key = id.toString();
        if (!tasks.hasKey(key)) {
            return <http:NotFound>{body: "Task not found"};
        }
        Task? old = tasks[key];
        string desc = input.description ?: (old is Task ? old.description : "");
        string pri = input.priority ?: (old is Task ? old.priority : "Medium");
        boolean doneVal = old is Task ? old.done : false;
        if (input.done is boolean) {
            doneVal = <boolean>input.done;
        }
        string newTitle = input.title == "" ? (old is Task ? old.title : "") : input.title;
        Task updated = {id: id, title: newTitle, description: desc, priority: pri, done: doneVal};
        tasks[key] = updated;
        return updated;
    }

    resource function delete tasks/[int id]() returns http:Ok|http:NotFound {
        string key = id.toString();
        if (!tasks.hasKey(key)) {
            return <http:NotFound>{body: "Task not found"};
        }
        _ = tasks.remove(key);
        return <http:Ok>{body: "Deleted"};
    }

    resource function get health() returns string {
        return "Secure Task Manager API running with WSO2 Ballerina";
    }
}

type TaskInput record {
    string title;
    string description?;
    string priority?;
    boolean done?;
};
