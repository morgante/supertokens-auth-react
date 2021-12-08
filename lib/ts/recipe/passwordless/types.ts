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

import { FeatureBaseConfig, NormalisedBaseConfig } from "../../types";
import {
    GetRedirectionURLContext as AuthRecipeModuleGetRedirectionURLContext,
    OnHandleEventContext as AuthRecipeModuleOnHandleEventContext,
    Config as AuthRecipeModuleConfig,
    NormalisedConfig as NormalisedAuthRecipeModuleConfig,
    UserInput as AuthRecipeModuleUserInput,
} from "../authRecipe/types";

import { ComponentOverride } from "../../components/componentOverride/componentOverride";
import type { CountryCode } from "libphonenumber-js";
import SignInUpTheme from "./components/themes/signInUp";
import { SignInUpHeader } from "./components/themes/signInUp/signInUpHeader";
import { SignInUpFooter } from "./components/themes/signInUp/signInUpFooter";
import { EmailForm } from "./components/themes/signInUp/emailForm";
import { MobileForm } from "./components/themes/signInUp/mobileForm";
import { UserInputCodeForm } from "./components/themes/signInUp/userInputCodeForm";
import { LinkClickedScreen } from "./components/themes/linkClickedScreen";
import { SignInUpCodeInputHeader } from "./components/themes/signInUp/signInUpCodeInputHeader";
import { SignInUpCodeInputFooter } from "./components/themes/signInUp/signInUpCodeInputFooter";
import { LinkSent as LinkSentScreen } from "./components/themes/signInUp/linkSent";

export type RecipeInterface = {
    createCode: (
        input: ({ email: string } | { phoneNumber: string }) & {
            config: NormalisedConfig;
        }
    ) => Promise<
        | {
              status: "OK";
              deviceId: string;
              preAuthSessionId: string;
              flowType: "USER_INPUT_CODE" | "MAGIC_LINK" | "USER_INPUT_CODE_AND_MAGIC_LINK";
          }
        | { status: "GENERAL_ERROR"; message: string }
    >;
    resendCode: (
        input: { deviceId: string; preAuthSessionId: string } & {
            config: NormalisedConfig;
        }
    ) => Promise<
        | {
              status: "OK" | "RESTART_FLOW_ERROR";
          }
        | { status: "GENERAL_ERROR"; message: string }
    >;

    consumeCode: (
        input: (
            | {
                  userInputCode: string;
                  deviceId: string;
                  preAuthSessionId: string;
              }
            | {
                  preAuthSessionId: string;
                  linkCode: string;
              }
        ) & {
            config: NormalisedConfig;
        }
    ) => Promise<
        | {
              status: "OK";
              createdUser: boolean;
              user: {
                  id: string;
                  email?: string;
                  phoneNumber?: string;
                  timeJoined: number;
              };
          }
        | {
              status: "INCORRECT_USER_INPUT_CODE_ERROR" | "EXPIRED_USER_INPUT_CODE_ERROR";
              failedCodeInputAttemptCount: number;
              maximumCodeInputAttempts: number;
          }
        | { status: "GENERAL_ERROR"; message: string }
        | { status: "RESTART_FLOW_ERROR" }
    >;

    doesEmailExist: (input: { email: string; config: NormalisedConfig }) => Promise<boolean>;
    doesPhoneNumberExist: (input: { phoneNumber: string; config: NormalisedConfig }) => Promise<boolean>;

    getLoginAttemptInfo: () =>
        | Promise<
              | undefined
              | {
                    deviceId: string;
                    preAuthSessionId: string;
                    contactInfo: string;
                    contactMethod: "EMAIL" | "PHONE";
                    flowType: "USER_INPUT_CODE" | "MAGIC_LINK" | "USER_INPUT_CODE_AND_MAGIC_LINK";
                    lastResend: number;
                }
          >
        | {
              deviceId: string;
              preAuthSessionId: string;
              contactInfo: string;
              contactMethod: "EMAIL" | "PHONE";
              flowType: "USER_INPUT_CODE" | "MAGIC_LINK" | "USER_INPUT_CODE_AND_MAGIC_LINK";
              lastResend: number;
          }
        | undefined;
    setLoginAttemptInfo: (input: {
        deviceId: string;
        preAuthSessionId: string;
        contactInfo: string;
        contactMethod: "EMAIL" | "PHONE";
        flowType: "USER_INPUT_CODE" | "MAGIC_LINK" | "USER_INPUT_CODE_AND_MAGIC_LINK";
        lastResend: number;
    }) => Promise<void> | void;
    clearLoginAttemptInfo: () => Promise<void> | void;
};

export type PreAPIHookContext = {
    /*
     * Pre API Hook action.
     */
    action:
        | "PASSWORDLESS_CREATE_CODE"
        | "PASSWORDLESS_CONSUME_CODE"
        | "PASSWORDLESS_RESEND_CODE"
        | "EMAIL_EXISTS"
        | "PHONE_NUMBER_EXISTS";

    /*
     * Request object containing query params, body, headers.
     */
    requestInit: RequestInit;

    /*
     * URL
     */
    url: string;
};

export type GetRedirectionURLContext = AuthRecipeModuleGetRedirectionURLContext;

export type OnHandleEventContext =
    | {
          action: "PASSWORDLESS_RESTART_FLOW";
      }
    | {
          action: "PASSWORDLESS_CODE_SENT";
          isResend: boolean;
          email?: string;
          phoneNumber?: string;
      }
    | AuthRecipeModuleOnHandleEventContext;

export type PasswordlessNormalisedBaseConfig = {
    disableDefaultImplementation?: boolean;
} & NormalisedBaseConfig;

export type NormalisedConfig = {
    resendCodeTimeGap: number;

    validateEmailAddress: (email: string) => Promise<string | undefined> | string | undefined;
    validatePhoneNumber: (phoneNumber: string) => Promise<string | undefined> | string | undefined;

    emailForm: {
        /*
         * Privacy policy link for the sign-up form.
         */
        privacyPolicyLink?: string;
        /*
         * Terms and conditions link for the sign-up form.
         */
        termsOfServiceLink?: string;
    } & PasswordlessNormalisedBaseConfig;

    mobileForm: {
        /*
         * Must be a two-letter ISO country code (e.g.: "US")
         */
        defaultCountry?: CountryCode;
        /*
         * Privacy policy link for the sign-up form.
         */
        privacyPolicyLink?: string;
        /*
         * Terms and conditions link for the sign-up form.
         */
        termsOfServiceLink?: string;
    } & PasswordlessNormalisedBaseConfig;
    userInputCodeForm: PasswordlessNormalisedBaseConfig;
    linkClickedScreen: PasswordlessNormalisedBaseConfig;

    contactMethod: "PHONE" | "EMAIL";

    override: {
        functions: (originalImplementation: RecipeInterface) => RecipeInterface;
        components: ComponentOverrideMap;
    };
} & NormalisedAuthRecipeModuleConfig<GetRedirectionURLContext, PreAPIHookContext, OnHandleEventContext>;

export type Config = UserInput &
    AuthRecipeModuleConfig<GetRedirectionURLContext, PreAPIHookContext, OnHandleEventContext>;

export type PasswordlessFeatureBaseConfig = {
    disableDefaultImplementation?: boolean;
} & FeatureBaseConfig;

export type UserInput = {
    contactMethod: "PHONE" | "EMAIL";

    validateEmailAddress?: (email: string) => Promise<string | undefined> | string | undefined;
    validatePhoneNumber?: (phoneNumber: string) => Promise<string | undefined> | string | undefined;

    resendCodeTimeGap?: number;

    emailForm?: {
        privacyPolicyLink?: string;
        termsOfServiceLink?: string;
    } & FeatureBaseConfig;

    mobileForm?: {
        /*
         * Must be a two-letter ISO country code (e.g.: "US")
         */
        defaultCountry?: CountryCode;
        privacyPolicyLink?: string;
        termsOfServiceLink?: string;
    } & FeatureBaseConfig;
    userInputCodeForm?: FeatureBaseConfig;

    linkClickedScreen?: FeatureBaseConfig;

    override?: {
        functions?: (originalImplementation: RecipeInterface) => RecipeInterface;
        components?: ComponentOverrideMap;
    };
} & AuthRecipeModuleUserInput<GetRedirectionURLContext, PreAPIHookContext, OnHandleEventContext>;

export type SignInUpProps = {
    loginAttemptInfo?: LoginAttemptInfo;
    loaded: boolean;
    error?: string;
    recipeImplementation: RecipeInterface;
    config: NormalisedConfig;
    onSuccess?: () => void;
};
export type LoginAttemptInfo = {
    deviceId: string;
    preAuthSessionId: string;
    contactInfo: string;
    contactMethod: "EMAIL" | "PHONE";
    lastResend: number;
    flowType: "USER_INPUT_CODE" | "MAGIC_LINK" | "USER_INPUT_CODE_AND_MAGIC_LINK";
};

export type SignInUpEmailFormProps = {
    error?: string;
    recipeImplementation: RecipeInterface;
    config: NormalisedConfig;
    onSuccess?: () => void;
};

export type SignInUpMobileFormProps = {
    error?: string;
    recipeImplementation: RecipeInterface;
    config: NormalisedConfig;
    onSuccess?: () => void;
};

export type SignInUpUserInputCodeFormProps = {
    recipeImplementation: RecipeInterface;
    config: NormalisedConfig;
    loginAttemptInfo: LoginAttemptInfo;
    onSuccess?: () => void;
};

export type LinkClickedScreenProps = {
    recipeImplementation: RecipeInterface;
    config: NormalisedConfig;
    onSuccess?: () => void;
};

export type LinkEmailSentThemeProps = {
    error?: string;
    loginAttemptInfo: LoginAttemptInfo;
    recipeImplementation: RecipeInterface;
    config: NormalisedConfig;
};

export type SignInUpCodeInputFooterProps = {
    loginAttemptInfo: LoginAttemptInfo;
    recipeImplementation: RecipeInterface;
    config: NormalisedConfig;
};

export type SignInUpCodeInputHeaderProps = {
    loginAttemptInfo: LoginAttemptInfo;
    recipeImplementation: RecipeInterface;
    config: NormalisedConfig;
};

export type ComponentOverrideMap = {
    PasswordlessSignInUp?: ComponentOverride<typeof SignInUpTheme>;
    PasswordlessSignInUpHeader?: ComponentOverride<typeof SignInUpHeader>;
    PasswordlessSignInUpFooter?: ComponentOverride<typeof SignInUpFooter>;
    PasswordlessSignInUpEmailForm?: ComponentOverride<typeof EmailForm>;
    PasswordlessSignInUpPhoneNumberForm?: ComponentOverride<typeof MobileForm>;

    PasswordlessSignInUpCodeInputForm?: ComponentOverride<typeof UserInputCodeForm>;
    PasswordlessSignInUpCodeInputHeader?: ComponentOverride<typeof SignInUpCodeInputHeader>;
    PasswordlessSignInUpCodeInputFooter?: ComponentOverride<typeof SignInUpCodeInputFooter>;

    PasswordlessLinkSentScreen?: ComponentOverride<typeof LinkSentScreen>;

    PasswordlessLinkClickedScreen?: ComponentOverride<typeof LinkClickedScreen>;
};