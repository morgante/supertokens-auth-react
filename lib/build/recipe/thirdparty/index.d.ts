import { CreateRecipeFunction, SuccessAPIResponse } from "../../types";
import EmailVerificationTheme from "../emailverification/components/themes/emailVerification";
import EmailVerification from "./components/features/emailVerification/wrapper";
import {
    ThirdPartyUserInput,
    ThirdPartyGetRedirectionURLContext,
    ThirdPartyPreAPIHookContext,
    ThirdPartyOnHandleEventContext,
} from "./types";
import ThirdPartyAuth from "./thirdpartyAuth";
import SignInAndUp from "./components/features/signInAndUp/wrapper";
import SignInAndUpTheme from "./components/themes/signInAndUp";
import Apple from "./providers/apple";
import Google from "./providers/google";
import Facebook from "./providers/facebook";
import Github from "./providers/github";
export default class ThirdPartyAPIWrapper {
    static init(
        config: ThirdPartyUserInput
    ): CreateRecipeFunction<
        ThirdPartyGetRedirectionURLContext,
        ThirdPartyPreAPIHookContext,
        ThirdPartyOnHandleEventContext
    >;
    static signOut(): Promise<SuccessAPIResponse>;
    static isEmailVerified(): Promise<boolean>;
    static redirectToAuth(show?: "signin" | "signup"): void;
    static Google: typeof Google;
    static Apple: typeof Apple;
    static Facebook: typeof Facebook;
    static Github: typeof Github;
    static ThirdPartyAuth: typeof ThirdPartyAuth;
    static SignInAndUp: typeof SignInAndUp;
    static SignInAndUpTheme: typeof SignInAndUpTheme;
    static EmailVerification: typeof EmailVerification;
    static EmailVerificationTheme: typeof EmailVerificationTheme;
}
declare const init: typeof ThirdPartyAPIWrapper.init;
declare const signOut: typeof ThirdPartyAPIWrapper.signOut;
declare const isEmailVerified: typeof ThirdPartyAPIWrapper.isEmailVerified;
declare const redirectToAuth: typeof ThirdPartyAPIWrapper.redirectToAuth;
export {
    ThirdPartyAuth,
    ThirdPartyAPIWrapper,
    init,
    Apple,
    Google,
    Facebook,
    Github,
    isEmailVerified,
    SignInAndUp,
    SignInAndUpTheme,
    signOut,
    redirectToAuth,
    EmailVerification,
    EmailVerificationTheme,
    ThirdPartyGetRedirectionURLContext,
    ThirdPartyPreAPIHookContext,
    ThirdPartyOnHandleEventContext,
};
