import NormalisedURLPath from "./normalisedURLPath";
import { FormFieldError } from "./recipe/emailpassword/types";
import { APIFormField, AppInfoUserInput, NormalisedAppInfo, NormalisedFormField } from "./types";
import { RecipeModuleHooks, NormalisedRecipeModuleHooks } from "./recipe/recipeModule/types";
export declare function normalisedRecipeModuleHooks<T, S, R>(
    config: RecipeModuleHooks<T, S, R>
): NormalisedRecipeModuleHooks<T, S, R>;
export declare function getRecipeIdFromSearch(search: string): string | null;
export declare function getQueryParams(param: string): string | null;
export declare function getRedirectToPathFromURL(): string | undefined;
export declare function isTest(): boolean;
export declare function normaliseInputAppInfoOrThrowError(appInfo: AppInfoUserInput): NormalisedAppInfo;
export declare function validateForm(
    inputs: APIFormField[],
    configFormFields: NormalisedFormField[]
): Promise<FormFieldError[]>;
export declare function getCurrentNormalisedUrlPath(): NormalisedURLPath;
export declare function appendQueryParamsToURL(stringUrl: string, queryParams?: Record<string, string>): string;
export declare function getWindowOrThrow(): any;
export declare function getShouldUseShadowDom(useShadowDom?: boolean): boolean;
export declare function matchRecipeIdUsingQueryParams(recipeId: string): () => boolean;
export declare function isRequestInit(
    x:
        | RequestInit
        | {
              url?: string;
              requestInit: RequestInit;
          }
): x is RequestInit;
