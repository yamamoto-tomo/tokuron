import {Hono} from "hono";
import type { ContextVariables } from "../constants";
import { API_PREFIX } from "../constants";
import { attachUserId, checkJWTAuth } from "../middlewares/auth";
import type { 
    DBCreateUser, 
    DBUser,
    DBChat,
    DBCreateChat,
    DBCreateMessage,
    DBMessage 
} from "../models/db";
// import { SimpleInMemoryResource } from "../storage/in_memory";
import { AUTH_PREFIX, createAuthApp } from "./auth"
import { CHAT_PREFIX, createChatApp } from "./chat";
import {env} from 'cloudflare:workers'
import {UserSQLResource} from "../storage/sql";
import {MessageSQLResource} from "../storage/sql";
import {ChatSQLResource} from "../storage/sql";

export function createSQLApp(){
    return createMainApp(
        createAuthApp(new UserSQLResource(env.DB)),
        createChatApp(
            new ChatSQLResource(env.DB),
            new MessageSQLResource(env.DB)
        )
    );
}

export function createMainApp(
    authApp: Hono<ContextVariables>,
    chatApp: Hono<ContextVariables>,
){
    const app = new Hono<ContextVariables>().basePath(API_PREFIX);

    app.use("*", checkJWTAuth);
    app.use("*", attachUserId);
    app.route(AUTH_PREFIX, authApp);
    app.route(CHAT_PREFIX, chatApp);

    return app;
}

// export function createInMemoryApp(){
//     return createMainApp(
//         createAuthApp(new SimpleInMemoryResource<DBUser, DBCreateUser>()),
//         createChatApp(
//             new SimpleInMemoryResource<DBChat, DBCreateChat>(),
//             new SimpleInMemoryResource<DBMessage, DBCreateMessage>(),
//         )
//     );        
// }