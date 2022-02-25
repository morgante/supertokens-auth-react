/* Copyright (c) 2021, VRAI Labs and/or its affiliates. All rights reserved.
 *
 * This software is licensed under the Apache License, Version 2.0 (the
 * "License") as published by the Apache Software Foundation.
 *
 * You may not use this file except in compliance with the License. You may
 * obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations
 * under the License.
 */

/*
 * Imports.
 */

import React from "react";
import AuthRecipeWithEmailVerification from "../authRecipeWithEmailVerification";
import { CreateRecipeFunction, RecipeFeatureComponentMap, NormalisedAppInfo } from "../../types";
import {
    GetRedirectionURLContext,
    Config,
    NormalisedConfig,
    PreAndPostAPIHookContext,
    OnHandleEventContext,
    UserInput,
    RecipeInterface,
} from "./types";
import { getRedirectToPathFromURL, isTest, matchRecipeIdUsingQueryParams } from "../../utils";
import { normaliseThirdPartyConfig, matchRecipeIdUsingState } from "./utils";
import NormalisedURLPath from "supertokens-web-js/utils/normalisedURLPath";
import { SSR_ERROR } from "../../constants";
import RecipeModule from "../recipeModule";
import SignInAndUp from "./components/features/signInAndUp";
import SignInAndUpCallback from "./components/features/signInAndUpCallback";
import RecipeImplementation from "./recipeImplementation";
import EmailVerification from "../emailverification/recipe";
import AuthWidgetWrapper from "../authRecipe/authWidgetWrapper";
import OverrideableBuilder from "supertokens-js-override";
import WebJSThirdPartyRecipe from "supertokens-web-js/lib/build/recipe/thirdparty/recipe";

/*
 * Class.
 */
export default class ThirdParty extends AuthRecipeWithEmailVerification<
    GetRedirectionURLContext,
    OnHandleEventContext,
    NormalisedConfig
> {
    static instance?: ThirdParty;
    static RECIPE_ID = "thirdparty";

    recipeImpl: RecipeInterface;
    webJsRecipe: WebJSThirdPartyRecipe;

    constructor(
        config: Config,
        recipes: {
            emailVerificationInstance: EmailVerification | undefined;
        }
    ) {
        super(normaliseThirdPartyConfig(config), {
            emailVerificationInstance: recipes.emailVerificationInstance,
        });

        const recipeId = this.config.recipeId;
        this.webJsRecipe = new WebJSThirdPartyRecipe(
            {
                recipeId: config.recipeId,
                appInfo: config.appInfo,
                preAPIHook: config.preAPIHook,
                postAPIHook: config.postAPIHook,
                override: {
                    functions: function (originalImplementation) {
                        return {
                            ...originalImplementation,
                            setStateAndOtherInfoToStorage: function (input) {
                                return originalImplementation.setStateAndOtherInfoToStorage<{
                                    rid?: string;
                                    redirectToPath?: string;
                                }>({
                                    ...input,
                                    state: {
                                        ...input.state,
                                        rid: recipeId,
                                        redirectToPath: getRedirectToPathFromURL(),
                                    },
                                });
                            },
                        };
                    },
                },
            },
            {
                emailVerification: recipes.emailVerificationInstance?.webJsRecipe,
            }
        );

        {
            const builder = new OverrideableBuilder(RecipeImplementation(this.webJsRecipe, this.config.recipeId));
            this.recipeImpl = builder.override(this.config.override.functions).build();
        }
    }

    /*
     * Instance methods.
     */

    getFeatures = (): RecipeFeatureComponentMap => {
        const features: RecipeFeatureComponentMap = {};
        if (this.config.signInAndUpFeature.disableDefaultImplementation !== true) {
            const normalisedFullPath = this.config.appInfo.websiteBasePath.appendPath(new NormalisedURLPath("/"));
            features[normalisedFullPath.getAsStringDangerous()] = {
                matches: matchRecipeIdUsingQueryParams(this.config.recipeId),
                component: (prop: any) => this.getFeatureComponent("signinup", prop),
            };
        }

        // Add callback route for each provider.
        this.config.signInAndUpFeature.providers.forEach((provider) => {
            const normalisedFullPath = this.config.appInfo.websiteBasePath.appendPath(
                new NormalisedURLPath(`/callback/${provider.id}`)
            );
            features[normalisedFullPath.getAsStringDangerous()] = {
                // TODO NEMI: Is passing nothing as userContext ok in this case?
                matches: () => matchRecipeIdUsingState(this, {}),
                component: (prop: any) => this.getFeatureComponent("signinupcallback", prop),
            };
        });

        return {
            ...features,
            ...this.getAuthRecipeWithEmailVerificationFeatures(),
        };
    };

    getFeatureComponent = (
        componentName: "signinup" | "signinupcallback" | "emailverification",
        props: any
    ): JSX.Element => {
        if (componentName === "signinup") {
            return (
                <AuthWidgetWrapper<
                    GetRedirectionURLContext,
                    PreAndPostAPIHookContext,
                    OnHandleEventContext,
                    NormalisedConfig
                >
                    authRecipe={this}
                    history={props.history}>
                    <SignInAndUp recipe={this} {...props} />
                </AuthWidgetWrapper>
            );
        } else if (componentName === "signinupcallback") {
            return <SignInAndUpCallback recipe={this} {...props} />;
        } else {
            return this.getAuthRecipeWithEmailVerificationFeatureComponent(componentName, props);
        }
    };

    getDefaultRedirectionURL = async (context: GetRedirectionURLContext): Promise<string> => {
        return this.getAuthRecipeWithEmailVerificationDefaultRedirectionURL(context);
    };

    static init(
        config: UserInput
    ): CreateRecipeFunction<
        GetRedirectionURLContext,
        PreAndPostAPIHookContext,
        OnHandleEventContext,
        NormalisedConfig
    > {
        return (
            appInfo: NormalisedAppInfo
        ): RecipeModule<GetRedirectionURLContext, PreAndPostAPIHookContext, OnHandleEventContext, NormalisedConfig> => {
            ThirdParty.instance = new ThirdParty(
                {
                    ...config,
                    appInfo,
                    recipeId: ThirdParty.RECIPE_ID,
                },
                {
                    emailVerificationInstance: undefined,
                }
            );
            return ThirdParty.instance;
        };
    }

    static getInstanceOrThrow(): ThirdParty {
        if (ThirdParty.instance === undefined) {
            // TODO Use correct doc link.
            let error =
                "No instance of ThirdParty found. Make sure to call the ThirdParty.init method." +
                "See https://supertokens.io/docs/thirdparty/quick-setup/frontend";

            // eslint-disable-next-line supertokens-auth-react/no-direct-window-object
            if (typeof window === "undefined") {
                error = error + SSR_ERROR;
            }
            throw Error(error);
        }

        return ThirdParty.instance;
    }

    /*
     * Tests methods.
     */
    static reset(): void {
        if (!isTest()) {
            return;
        }
        ThirdParty.instance = undefined;
        return;
    }
}
