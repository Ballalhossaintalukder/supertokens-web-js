/* Copyright (c) 2022, VRAI Labs and/or its affiliates. All rights reserved.
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
import Querier from "../../querier";
import Multitenancy from "../multitenancy/recipe";
import { PreAndPostAPIHookAction, RecipeInterface } from "./types";
import { getQueryParams, normaliseUser } from "../../utils";
import { RecipeFunctionOptions, RecipeImplementationInput } from "../recipeModule/types";
import { User } from "../../types";

export default function getRecipeImplementation(
    recipeImplInput: RecipeImplementationInput<PreAndPostAPIHookAction>
): RecipeInterface {
    const querier = new Querier(recipeImplInput.recipeId, recipeImplInput.appInfo);

    return {
        submitNewPassword: async function ({
            formFields,
            options,
            userContext,
        }: {
            formFields: {
                id: string;
                value: string;
            }[];
            options?: RecipeFunctionOptions;
            userContext: any;
        }): Promise<
            | {
                  status: "OK";
                  fetchResponse: Response;
              }
            | {
                  status: "RESET_PASSWORD_INVALID_TOKEN_ERROR";
                  fetchResponse: Response;
              }
            | {
                  status: "FIELD_ERROR";
                  formFields: {
                      id: string;
                      error: string;
                  }[];
                  fetchResponse: Response;
              }
        > {
            const tenantId = this.getTenantIdFromURL({ userContext });
            const token = this.getResetPasswordTokenFromURL({
                userContext,
            });

            const { jsonBody, fetchResponse } = await querier.post(
                {
                    path: "/<tenantId>/user/password/reset",
                    pathParams: {
                        tenantId: tenantId || "public",
                    },
                },
                { body: { formFields, token, method: "token" } },
                Querier.preparePreAPIHook({
                    recipePreAPIHook: recipeImplInput.preAPIHook,
                    action: "SUBMIT_NEW_PASSWORD",
                    options,
                    userContext,
                }),
                Querier.preparePostAPIHook({
                    recipePostAPIHook: recipeImplInput.postAPIHook,
                    action: "SUBMIT_NEW_PASSWORD",
                    userContext,
                })
            );

            if (jsonBody.status === "FIELD_ERROR") {
                return {
                    status: "FIELD_ERROR",
                    formFields: jsonBody.formFields,
                    fetchResponse,
                };
            }

            if (jsonBody.status === "RESET_PASSWORD_INVALID_TOKEN_ERROR") {
                return {
                    status: jsonBody.status,
                    fetchResponse,
                };
            }
            return {
                ...jsonBody,
                fetchResponse,
            };
        },

        sendPasswordResetEmail: async function ({
            formFields,
            options,
            userContext,
        }: {
            formFields: {
                id: string;
                value: string;
            }[];
            options?: RecipeFunctionOptions;
            userContext: any;
        }): Promise<
            | {
                  status: "OK";
                  fetchResponse: Response;
              }
            | {
                  status: "PASSWORD_RESET_NOT_ALLOWED";
                  reason: string;
                  fetchResponse: Response;
              }
            | {
                  status: "FIELD_ERROR";
                  formFields: {
                      id: string;
                      error: string;
                  }[];
                  fetchResponse: Response;
              }
        > {
            let { jsonBody, fetchResponse } = await querier.post(
                {
                    path: "/<tenantId>/user/password/reset/token",
                    pathParams: {
                        tenantId:
                            (await Multitenancy.getInstanceOrThrow().recipeImplementation.getTenantId({
                                userContext,
                            })) || "public",
                    },
                },
                { body: { formFields } },
                Querier.preparePreAPIHook({
                    recipePreAPIHook: recipeImplInput.preAPIHook,
                    action: "SEND_RESET_PASSWORD_EMAIL",
                    options,
                    userContext,
                }),
                Querier.preparePostAPIHook({
                    recipePostAPIHook: recipeImplInput.postAPIHook,
                    action: "SEND_RESET_PASSWORD_EMAIL",
                    userContext,
                })
            );

            if (jsonBody.status === "FIELD_ERROR") {
                return {
                    status: "FIELD_ERROR",
                    formFields: jsonBody.formFields,
                    fetchResponse,
                };
            }

            if (jsonBody.status === "PASSWORD_RESET_NOT_ALLOWED") {
                return {
                    status: jsonBody.status,
                    reason: jsonBody.reason,
                    fetchResponse,
                };
            }

            return {
                status: jsonBody.status,
                fetchResponse,
            };
        },

        signUp: async function ({ formFields, shouldTryLinkingWithSessionUser, options, userContext }): Promise<
            | {
                  status: "OK";
                  user: User;
                  fetchResponse: Response;
              }
            | {
                  status: "FIELD_ERROR";
                  formFields: {
                      id: string;
                      error: string;
                  }[];
                  fetchResponse: Response;
              }
            | {
                  status: "SIGN_UP_NOT_ALLOWED";
                  reason: string;
                  fetchResponse: Response;
              }
        > {
            let { jsonBody, fetchResponse } = await querier.post(
                {
                    path: "/<tenantId>/signup",
                    pathParams: {
                        tenantId:
                            (await Multitenancy.getInstanceOrThrow().recipeImplementation.getTenantId({
                                userContext,
                            })) || "public",
                    },
                },
                { body: { formFields, shouldTryLinkingWithSessionUser } },
                Querier.preparePreAPIHook({
                    recipePreAPIHook: recipeImplInput.preAPIHook,
                    action: "EMAIL_PASSWORD_SIGN_UP",
                    options,
                    userContext,
                }),
                Querier.preparePostAPIHook({
                    recipePostAPIHook: recipeImplInput.postAPIHook,
                    action: "EMAIL_PASSWORD_SIGN_UP",
                    userContext,
                })
            );

            if (jsonBody.status === "FIELD_ERROR") {
                return {
                    status: "FIELD_ERROR",
                    formFields: jsonBody.formFields,
                    fetchResponse,
                };
            }
            if (jsonBody.status === "SIGN_UP_NOT_ALLOWED") {
                return {
                    status: "SIGN_UP_NOT_ALLOWED",
                    reason: jsonBody.reason,
                    fetchResponse,
                };
            }

            return {
                status: jsonBody.status,
                user: normaliseUser("emailpassword", jsonBody.user),
                fetchResponse,
            };
        },

        signIn: async function ({ formFields, shouldTryLinkingWithSessionUser, options, userContext }): Promise<
            | {
                  status: "OK";
                  user: User;
                  fetchResponse: Response;
              }
            | {
                  status: "FIELD_ERROR";
                  formFields: {
                      id: string;
                      error: string;
                  }[];
                  fetchResponse: Response;
              }
            | {
                  status: "WRONG_CREDENTIALS_ERROR";
                  fetchResponse: Response;
              }
            | {
                  status: "SIGN_IN_NOT_ALLOWED";
                  reason: string;
                  fetchResponse: Response;
              }
        > {
            let { jsonBody, fetchResponse } = await querier.post(
                {
                    path: "/<tenantId>/signin",
                    pathParams: {
                        tenantId:
                            (await Multitenancy.getInstanceOrThrow().recipeImplementation.getTenantId({
                                userContext,
                            })) || "public",
                    },
                },
                { body: { formFields, shouldTryLinkingWithSessionUser } },
                Querier.preparePreAPIHook({
                    recipePreAPIHook: recipeImplInput.preAPIHook,
                    action: "EMAIL_PASSWORD_SIGN_IN",
                    options,
                    userContext,
                }),
                Querier.preparePostAPIHook({
                    recipePostAPIHook: recipeImplInput.postAPIHook,
                    action: "EMAIL_PASSWORD_SIGN_IN",
                    userContext,
                })
            );

            if (jsonBody.status === "FIELD_ERROR") {
                return {
                    status: "FIELD_ERROR",
                    formFields: jsonBody.formFields,
                    fetchResponse,
                };
            }

            if (jsonBody.status === "WRONG_CREDENTIALS_ERROR") {
                return {
                    status: "WRONG_CREDENTIALS_ERROR",
                    fetchResponse,
                };
            }
            if (jsonBody.status === "SIGN_IN_NOT_ALLOWED") {
                return {
                    status: "SIGN_IN_NOT_ALLOWED",
                    reason: jsonBody.reason,
                    fetchResponse,
                };
            }

            return {
                status: "OK",
                user: normaliseUser("emailpassword", jsonBody.user),
                fetchResponse,
            };
        },

        doesEmailExist: async function ({
            email,
            options,
            userContext,
        }: {
            email: string;
            options?: RecipeFunctionOptions;
            userContext: any;
        }): Promise<{
            status: "OK";
            doesExist: boolean;
            fetchResponse: Response;
        }> {
            let { jsonBody, fetchResponse } = await querier.get(
                {
                    path: "/<tenantId>/emailpassword/email/exists",
                    pathParams: {
                        tenantId:
                            (await Multitenancy.getInstanceOrThrow().recipeImplementation.getTenantId({
                                userContext,
                            })) || "public",
                    },
                    queryParams: {
                        email,
                    },
                },
                {},
                Querier.preparePreAPIHook({
                    recipePreAPIHook: recipeImplInput.preAPIHook,
                    action: "EMAIL_EXISTS",
                    options,
                    userContext,
                }),
                Querier.preparePostAPIHook({
                    recipePostAPIHook: recipeImplInput.postAPIHook,
                    action: "EMAIL_EXISTS",
                    userContext,
                })
            );

            return {
                status: jsonBody.status,
                doesExist: jsonBody.exists,
                fetchResponse,
            };
        },

        getResetPasswordTokenFromURL: function (): string {
            const token = getQueryParams("token");

            if (token === undefined) {
                return "";
            }

            return token;
        },

        getTenantIdFromURL: function (): string | undefined {
            return getQueryParams("tenantId");
        },
    };
}

export { getRecipeImplementation };
