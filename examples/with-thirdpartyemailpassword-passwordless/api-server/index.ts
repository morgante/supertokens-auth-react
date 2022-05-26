import express from "express";
import cors from "cors";
import supertokens from "supertokens-node";
import Session from "supertokens-node/recipe/session";
import { verifySession } from "supertokens-node/recipe/session/framework/express";
import { middleware, errorHandler, SessionRequest } from "supertokens-node/framework/express";
import ThirdPartyEmailPassword from "supertokens-node/recipe/thirdpartyemailpassword";
import Passwordless from "supertokens-node/recipe/passwordless";
import { tpepOverride } from "./tpepOverride";
import { plessOverride } from "./plessOverride";
import { evOverride } from "./evOverride";
import { getPrimaryUserIdFromRecipeUserId } from "./accountLinkingMap";
require("dotenv").config();

const apiPort = process.env.REACT_APP_API_PORT || 3001;
const apiDomain = process.env.REACT_APP_API_URL || `http://localhost:${apiPort}`;
const websitePort = process.env.REACT_APP_WEBSITE_PORT || 3000;
const websiteDomain = process.env.REACT_APP_WEBSITE_URL || `http://localhost:${websitePort}`;

export const emailVerificationOn = true;

supertokens.init({
    framework: "express",
    supertokens: {
        // TODO: This is a core hosted for demo purposes. You can use this, but make sure to change it to your core instance URI eventually.
        connectionURI: "https://try.supertokens.com",
        apiKey: "<REQUIRED FOR MANAGED SERVICE, ELSE YOU CAN REMOVE THIS FIELD>",
    },
    appInfo: {
        appName: "SuperTokens Demo App", // TODO: Your app name
        apiDomain, // TODO: Change to your app's API domain
        websiteDomain, // TODO: Change to your app's website domain
    },
    recipeList: [
        ThirdPartyEmailPassword.init({
            emailVerificationFeature: {
                createAndSendCustomEmail: async function (user, link, userContext) {
                    console.log(link);
                },
            },
            providers: [
                // We have provided you with development keys which you can use for testing.
                // IMPORTANT: Please replace them with your own OAuth keys for production use.
                ThirdPartyEmailPassword.Google({
                    clientId: "1060725074195-kmeum4crr01uirfl2op9kd5acmi9jutn.apps.googleusercontent.com",
                    clientSecret: "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",
                }),
                ThirdPartyEmailPassword.Github({
                    clientSecret: "e97051221f4b6426e8fe8d51486396703012f5bd",
                    clientId: "467101b197249757c71f",
                }),
                ThirdPartyEmailPassword.Apple({
                    clientId: "4398792-io.supertokens.example.service",
                    clientSecret: {
                        keyId: "7M48Y4RYDL",
                        privateKey:
                            "-----BEGIN PRIVATE KEY-----\nMIGTAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBHkwdwIBAQQgu8gXs+XYkqXD6Ala9Sf/iJXzhbwcoG5dMh1OonpdJUmgCgYIKoZIzj0DAQehRANCAASfrvlFbFCYqn3I2zeknYXLwtH30JuOKestDbSfZYxZNMqhF/OzdZFTV0zc5u5s3eN+oCWbnvl0hM+9IW0UlkdA\n-----END PRIVATE KEY-----",
                        teamId: "YWQCXGJRJL",
                    },
                }),
            ],
            override: {
                functions: (originalImpl) => {
                    return tpepOverride(originalImpl);
                },
                emailVerificationFeature: {
                    functions: (originalImpl) => {
                        return evOverride(originalImpl);
                    },
                    apis: (originalImpl) => {
                        return {
                            ...originalImpl,
                            verifyEmailPOST: async function (input) {
                                if (originalImpl.verifyEmailPOST === undefined) {
                                    throw new Error("Should never come here");
                                }
                                // The would not be required after the recipe
                                // function for verify email starts to accept a session
                                let session = (await Session.getSession(input.options.req, input.options.res))!;
                                input.userContext.session = session;
                                return await originalImpl.verifyEmailPOST(input);
                            },
                        };
                    },
                },
            },
        }),
        Passwordless.init({
            contactMethod: "EMAIL_OR_PHONE",
            flowType: "USER_INPUT_CODE_AND_MAGIC_LINK",
            createAndSendCustomEmail: async function (input) {
                // TODO: implement sending of email
                console.log(input);
            },
            createAndSendCustomTextMessage: async function (input) {
                // TODO: implement sending of text message
                console.log(input);
            },
            override: {
                functions: (originalImplementation) => {
                    return plessOverride(originalImplementation);
                },
            },
        }),
        Session.init({
            override: {
                functions: (originalImplementation) => {
                    return {
                        ...originalImplementation,
                        refreshSession: async function (input) {
                            let session = await originalImplementation.refreshSession(input);
                            let recipeUserId = session.getUserId();
                            let primaryUserId = getPrimaryUserIdFromRecipeUserId(recipeUserId);
                            if (primaryUserId !== recipeUserId) {
                                // this means we have just linked accounts, so we must upgrade the session
                                session = await Session.createNewSession(
                                    (session as any).res,
                                    primaryUserId,
                                    session.getAccessTokenPayload(),
                                    await session.getSessionData()
                                );
                            }
                            return session;
                        },
                        createNewSession: async function (input) {
                            return originalImplementation.createNewSession({
                                ...input,
                                accessTokenPayload: {
                                    ...input.accessTokenPayload,
                                    isPasswordless:
                                        input.accessTokenPayload.isPasswordless === undefined
                                            ? input.userContext.isPasswordless === true
                                            : input.accessTokenPayload.isPasswordless,
                                },
                            });
                        },
                    };
                },
            },
        }),
    ],
});

const app = express();

app.use(
    cors({
        origin: websiteDomain, // TODO: Change to your app's website domain
        allowedHeaders: ["content-type", ...supertokens.getAllCORSHeaders()],
        methods: ["GET", "PUT", "POST", "DELETE"],
        credentials: true,
    })
);

app.use(middleware());

// custom API that requires session verification
app.get("/sessioninfo", verifySession(), async (req: SessionRequest, res) => {
    let session = req.session!;
    res.send({
        sessionHandle: session.getHandle(),
        userId: session.getUserId(),
        accessTokenPayload: session.getAccessTokenPayload(),
    });
});

app.use(errorHandler());

app.use((err: any, req: any, res: any, next: any) => {
    console.log(err);
    res.status(500).send("Internal error: " + err.message);
});

app.listen(apiPort, () => console.log(`API Server listening on port ${apiPort}`));
