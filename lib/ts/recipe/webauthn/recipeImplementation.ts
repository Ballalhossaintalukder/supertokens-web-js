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
import { RecipeInterface } from "./types";
import { RecipeFunctionOptions, RecipeImplementationInput } from "../recipeModule/types";
import { PreAndPostAPIHookAction } from "./types";
import Multitenancy from "../multitenancy/recipe";
import {
    AuthenticationResponseJSON,
    browserSupportsWebAuthn,
    platformAuthenticatorIsAvailable,
    RegistrationResponseJSON,
    startAuthentication,
    startRegistration,
} from "@simplewebauthn/browser";
import { paths } from "../../sdk/paths";

export default function getRecipeImplementation(
    recipeImplInput: RecipeImplementationInput<PreAndPostAPIHookAction>
): RecipeInterface {
    const querier = new Querier(recipeImplInput.recipeId, recipeImplInput.appInfo);

    return {
        getRegisterOptions: async function ({
            options,
            userContext,
            email,
            recoverAccountToken,
        }: { options?: RecipeFunctionOptions; userContext: any } & (
            | { email: string; recoverAccountToken?: never }
            | { recoverAccountToken: string; email?: never }
        )) {
            const { jsonBody, fetchResponse } = await querier.post(
                {
                    path: "/<tenantId>/webauthn/options/register",
                    pathParams: {
                        tenantId:
                            (await Multitenancy.getInstanceOrThrow().recipeImplementation.getTenantId({
                                userContext: userContext,
                            })) || "public",
                    },
                },
                {
                    body: email !== undefined ? { email } : { recoverAccountToken },
                },
                Querier.preparePreAPIHook({
                    recipePreAPIHook: recipeImplInput.preAPIHook,
                    action: "REGISTER_OPTIONS",
                    options: options,
                    userContext: userContext,
                }),
                Querier.preparePostAPIHook({
                    recipePostAPIHook: recipeImplInput.postAPIHook,
                    action: "REGISTER_OPTIONS",
                    userContext: userContext,
                })
            );

            return {
                ...jsonBody,
                fetchResponse,
            };
        },
        getSignInOptions: async function ({ options, userContext }) {
            const { jsonBody, fetchResponse } = await querier.post(
                {
                    path: "/<tenantId>/webauthn/options/signin",
                    pathParams: {
                        tenantId:
                            (await Multitenancy.getInstanceOrThrow().recipeImplementation.getTenantId({
                                userContext: userContext,
                            })) || "public",
                    },
                },
                {
                    body: undefined,
                },
                Querier.preparePreAPIHook({
                    recipePreAPIHook: recipeImplInput.preAPIHook,
                    action: "SIGN_IN_OPTIONS",
                    options: options,
                    userContext: userContext,
                }),
                Querier.preparePostAPIHook({
                    recipePostAPIHook: recipeImplInput.postAPIHook,
                    action: "SIGN_IN_OPTIONS",
                    userContext: userContext,
                })
            );

            return {
                ...jsonBody,
                fetchResponse,
            };
        },
        signUp: async function ({
            webauthnGeneratedOptionsId,
            credential,
            options,
            userContext,
            shouldTryLinkingWithSessionUser,
        }) {
            const { jsonBody, fetchResponse } = await querier.post(
                {
                    path: "/<tenantId>/webauthn/signup",
                    pathParams: {
                        tenantId:
                            (await Multitenancy.getInstanceOrThrow().recipeImplementation.getTenantId({
                                userContext: userContext,
                            })) || "public",
                    },
                },
                {
                    body: {
                        webauthnGeneratedOptionsId,
                        credential,
                        shouldTryLinkingWithSessionUser,
                    },
                },
                Querier.preparePreAPIHook({
                    recipePreAPIHook: recipeImplInput.preAPIHook,
                    action: "SIGN_UP",
                    options: options,
                    userContext: userContext,
                }),
                Querier.preparePostAPIHook({
                    recipePostAPIHook: recipeImplInput.postAPIHook,
                    action: "SIGN_UP",
                    userContext: userContext,
                })
            );

            return {
                ...jsonBody,
                fetchResponse,
            };
        },
        signIn: async function ({
            webauthnGeneratedOptionsId,
            credential,
            options,
            userContext,
            shouldTryLinkingWithSessionUser,
        }) {
            const { jsonBody, fetchResponse } = await querier.post(
                {
                    path: "/<tenantId>/webauthn/signin",
                    pathParams: {
                        tenantId:
                            (await Multitenancy.getInstanceOrThrow().recipeImplementation.getTenantId({
                                userContext: userContext,
                            })) || "public",
                    },
                },
                {
                    body: {
                        webauthnGeneratedOptionsId,
                        credential,
                        shouldTryLinkingWithSessionUser,
                    },
                },
                Querier.preparePreAPIHook({
                    recipePreAPIHook: recipeImplInput.preAPIHook,
                    action: "SIGN_IN",
                    options: options,
                    userContext: userContext,
                }),
                Querier.preparePostAPIHook({
                    recipePostAPIHook: recipeImplInput.postAPIHook,
                    action: "SIGN_IN",
                    userContext: userContext,
                })
            );

            return {
                ...jsonBody,
                fetchResponse,
            };
        },
        getEmailExists: async function ({ email, options, userContext }) {
            const { jsonBody, fetchResponse } = await querier.get(
                {
                    path: "/<tenantId>/webauthn/email/exists",
                    pathParams: {
                        tenantId:
                            (await Multitenancy.getInstanceOrThrow().recipeImplementation.getTenantId({
                                userContext: userContext,
                            })) || "public",
                    },
                    queryParams: {
                        email: email,
                    },
                },
                {},
                Querier.preparePreAPIHook({
                    recipePreAPIHook: recipeImplInput.preAPIHook,
                    action: "EMAIL_EXISTS",
                    options: options,
                    userContext: userContext,
                }),
                Querier.preparePostAPIHook({
                    recipePostAPIHook: recipeImplInput.postAPIHook,
                    action: "EMAIL_EXISTS",
                    userContext: userContext,
                })
            );

            return {
                ...jsonBody,
                fetchResponse,
            };
        },
        generateRecoverAccountToken: async function ({ email, options, userContext }) {
            const { jsonBody, fetchResponse } = await querier.post(
                {
                    path: "/<tenantId>/user/webauthn/reset/token",
                    pathParams: {
                        tenantId:
                            (await Multitenancy.getInstanceOrThrow().recipeImplementation.getTenantId({
                                userContext: userContext,
                            })) || "public",
                    },
                },
                {
                    body: {
                        email,
                    },
                },
                Querier.preparePreAPIHook({
                    recipePreAPIHook: recipeImplInput.preAPIHook,
                    action: "GENERATE_RECOVER_ACCOUNT_TOKEN",
                    options: options,
                    userContext: userContext,
                }),
                Querier.preparePostAPIHook({
                    recipePostAPIHook: recipeImplInput.postAPIHook,
                    action: "GENERATE_RECOVER_ACCOUNT_TOKEN",
                    userContext: userContext,
                })
            );

            return {
                ...jsonBody,
                fetchResponse,
            };
        },
        recoverAccount: async function ({ token, webauthnGeneratedOptionsId, credential, options, userContext }) {
            const { jsonBody, fetchResponse } = await querier.post(
                {
                    path: "/<tenantId>/user/webauthn/reset",
                    pathParams: {
                        tenantId:
                            (await Multitenancy.getInstanceOrThrow().recipeImplementation.getTenantId({
                                userContext: userContext,
                            })) || "public",
                    },
                },
                {
                    body: {
                        token,
                        webauthnGeneratedOptionsId,
                        credential,
                    },
                },
                Querier.preparePreAPIHook({
                    recipePreAPIHook: recipeImplInput.preAPIHook,
                    action: "RECOVER_ACCOUNT",
                    options: options,
                    userContext: userContext,
                }),
                Querier.preparePostAPIHook({
                    recipePostAPIHook: recipeImplInput.postAPIHook,
                    action: "RECOVER_ACCOUNT",
                    userContext: userContext,
                })
            );

            return {
                ...jsonBody,
                fetchResponse,
            };
        },
        createCredential: async function ({ registrationOptions }) {
            let registrationResponse: RegistrationResponseJSON;
            try {
                registrationResponse = await startRegistration({ optionsJSON: registrationOptions });
            } catch (error: any) {
                if (error.name === "InvalidStateError") {
                    return { status: "AUTHENTICATOR_ALREADY_REGISTERED" };
                }

                if (
                    error.name === "NotSupportedError" ||
                    error.message === "WebAuthn is not supported in this browser"
                ) {
                    return { status: "WEBAUTHN_NOT_SUPPORTED", error: error };
                }

                return {
                    status: "FAILED_TO_REGISTER_USER",
                    error: error,
                };
            }

            return {
                status: "OK",
                registrationResponse,
            };
        },
        registerCredentialWithSignUp: async function ({
            email,
            shouldTryLinkingWithSessionUser,
            options,
            userContext,
        }) {
            // Get the registration options by using the passed email ID.
            const registrationOptions = await this.getRegisterOptions({ options, userContext, email });
            if (registrationOptions?.status !== "OK") {
                // If we did not get an OK status, we need to return the error as is.

                // If the `status` is `RECOVER_ACCOUNT_TOKEN_INVALID_ERROR`, we need to throw an
                // error since that should never happen as we are registering with an email
                // and not a token.
                if (registrationOptions?.status === "RECOVER_ACCOUNT_TOKEN_INVALID_ERROR") {
                    throw new Error("Got `RECOVER_ACCOUNT_TOKEN_INVALID_ERROR` status that should never happen");
                }

                return registrationOptions;
            }

            // We should have received a valid registration options response.
            const createCredentialResponse = await this.createCredential({ registrationOptions, userContext });
            if (createCredentialResponse.status !== "OK") {
                return createCredentialResponse;
            }

            // We should have a valid registration response for the passed credentials
            // and we are good to go ahead and verify them.
            return await this.signUp({
                webauthnGeneratedOptionsId: registrationOptions.webauthnGeneratedOptionsId,
                credential: createCredentialResponse.registrationResponse,
                shouldTryLinkingWithSessionUser,
                options,
                userContext,
            });
        },
        authenticateCredential: async function ({ authenticationOptions }) {
            let authenticationResponse: AuthenticationResponseJSON;
            try {
                authenticationResponse = await startAuthentication({ optionsJSON: authenticationOptions });
            } catch (error: any) {
                if (
                    error.name === "NotSupportedError" ||
                    error.message === "WebAuthn is not supported in this browser"
                ) {
                    return { status: "WEBAUTHN_NOT_SUPPORTED", error: error };
                }

                return {
                    status: "FAILED_TO_AUTHENTICATE_USER",
                    error: error,
                };
            }

            return {
                status: "OK",
                authenticationResponse: authenticationResponse,
            };
        },
        authenticateCredentialWithSignIn: async function ({ shouldTryLinkingWithSessionUser, options, userContext }) {
            // Make a call to get the sign in options using the entered email ID.
            const signInOptions = await this.getSignInOptions({ options, userContext });
            if (signInOptions?.status !== "OK") {
                // We want to return the error as is if status was not "OK"
                return signInOptions;
            }

            // We should have the options ready and are good to start the authentication
            const authenticateCredentialResponse = await this.authenticateCredential({
                authenticationOptions: signInOptions,
                userContext: userContext,
            });
            if (authenticateCredentialResponse.status !== "OK") {
                return authenticateCredentialResponse;
            }

            // We should have a valid authentication response at this point so we can
            // go ahead and sign in the user.
            return await this.signIn({
                webauthnGeneratedOptionsId: signInOptions.webauthnGeneratedOptionsId,
                credential: authenticateCredentialResponse.authenticationResponse,
                shouldTryLinkingWithSessionUser,
                options: options,
                userContext: userContext,
            });
        },
        registerCredentialWithRecoverAccount: async function ({ recoverAccountToken, options, userContext }) {
            // Get the registration options based on the recoverAccountToken and
            // register the device against the user.
            const registrationOptions = await this.getRegisterOptions({ options, userContext, recoverAccountToken });
            if (registrationOptions?.status !== "OK") {
                // If we did not get an OK status, we need to return the error as is.

                // If the `status` is `INVALID_EMAIL_ERROR`, we need to throw an
                // error since that should never happen as we are registering with a recover account token
                // and not an email ID.
                if (registrationOptions?.status === "INVALID_EMAIL_ERROR") {
                    throw new Error("Got `INVALID_EMAIL_ERROR` status that should never happen");
                }

                return registrationOptions;
            }

            // We should have received a valid registration options response.
            const createCredentialResponse = await this.createCredential({
                registrationOptions,
                userContext,
            });
            if (createCredentialResponse.status !== "OK") {
                return createCredentialResponse;
            }

            return await this.recoverAccount({
                token: recoverAccountToken,
                webauthnGeneratedOptionsId: registrationOptions.webauthnGeneratedOptionsId,
                credential: createCredentialResponse.registrationResponse,
                options,
                userContext,
            });
        },
        createAndRegisterCredentialForSessionUser: async function ({ recipeUserId, email, options, userContext }) {
            // Get the registration options by using the passed email ID.
            const registrationOptions = await this.getRegisterOptions({ options, userContext, email });
            if (registrationOptions?.status !== "OK") {
                // If we did not get an OK status, we need to return the error as is.

                // If the `status` is `RECOVER_ACCOUNT_TOKEN_INVALID_ERROR`, we need to throw an
                // error since that should never happen as we are registering with an email
                // and not a token.
                if (registrationOptions?.status === "RECOVER_ACCOUNT_TOKEN_INVALID_ERROR") {
                    throw new Error("Got `RECOVER_ACCOUNT_TOKEN_INVALID_ERROR` status that should never happen");
                }

                return registrationOptions;
            }

            // We should have received a valid registration options response.
            const createCredentialResponse = await this.createCredential({ registrationOptions, userContext });
            if (createCredentialResponse.status !== "OK") {
                return createCredentialResponse;
            }

            // We should have a valid registration response for the passed credentials
            // and we are good to go ahead and verify them.
            return await this.registerCredential({
                webauthnGeneratedOptionsId: registrationOptions.webauthnGeneratedOptionsId,
                recipeUserId,
                credential: createCredentialResponse.registrationResponse,
                options,
                userContext,
            });
        },
        listCredentials: async function ({ options, userContext }) {
            const { jsonBody, fetchResponse } = await querier.get(
                {
                    path: "/<tenantId>/webauthn/credential/list",
                    pathParams: {
                        tenantId:
                            (await Multitenancy.getInstanceOrThrow().recipeImplementation.getTenantId({
                                userContext: userContext,
                            })) || "public",
                    },
                },
                {},
                Querier.preparePreAPIHook({
                    recipePreAPIHook: recipeImplInput.preAPIHook,
                    action: "LIST_CREDENTIALS",
                    options: options,
                    userContext: userContext,
                }),
                Querier.preparePostAPIHook({
                    recipePostAPIHook: recipeImplInput.postAPIHook,
                    action: "LIST_CREDENTIALS",
                    userContext: userContext,
                })
            );

            return {
                ...jsonBody,
                fetchResponse,
            };
        },
        removeCredential: async function ({ webauthnCredentialId, options, userContext }) {
            const { jsonBody, fetchResponse } = await querier.post(
                {
                    path: "/<tenantId>/webauthn/credential/remove",
                    pathParams: {
                        tenantId:
                            (await Multitenancy.getInstanceOrThrow().recipeImplementation.getTenantId({
                                userContext: userContext,
                            })) || "public",
                    },
                },
                {
                    body: {
                        webauthnCredentialId,
                    },
                },
                Querier.preparePreAPIHook({
                    recipePreAPIHook: recipeImplInput.preAPIHook,
                    action: "REMOVE_CREDENTIAL",
                    options: options,
                    userContext: userContext,
                }),
                Querier.preparePostAPIHook({
                    recipePostAPIHook: recipeImplInput.postAPIHook,
                    action: "REMOVE_CREDENTIAL",
                    userContext: userContext,
                })
            );

            return {
                ...jsonBody,
                fetchResponse,
            };
        },
        registerCredential: async function ({
            webauthnGeneratedOptionsId,
            recipeUserId,
            credential,
            options,
            userContext,
        }) {
            // This weird trick is required because otherwise TS will complain since we added the new prop in 4.2, but still support 4.1
            // It doesn't get picked up somehow...
            // TODO: Figure out why merging doesn't work right in this case
            const body: Required<
                paths["/<tenantId>/webauthn/credential"]["post"]
            >["requestBody"]["content"]["application/json"] = {
                webauthnGeneratedOptionsId,
                recipeUserId,
                credential,
            };
            const { jsonBody, fetchResponse } = await querier.post(
                {
                    path: "/<tenantId>/webauthn/credential",
                    pathParams: {
                        tenantId:
                            (await Multitenancy.getInstanceOrThrow().recipeImplementation.getTenantId({
                                userContext: userContext,
                            })) || "public",
                    },
                },
                {
                    body,
                },
                Querier.preparePreAPIHook({
                    recipePreAPIHook: recipeImplInput.preAPIHook,
                    action: "REGISTER_CREDENTIAL",
                    options: options,
                    userContext: userContext,
                }),
                Querier.preparePostAPIHook({
                    recipePostAPIHook: recipeImplInput.postAPIHook,
                    action: "REGISTER_CREDENTIAL",
                    userContext: userContext,
                })
            );

            return {
                ...jsonBody,
                fetchResponse,
            };
        },
        doesBrowserSupportWebAuthn: async () => {
            try {
                const isPlatformAuthenticatorAvailable = await platformAuthenticatorIsAvailable();
                return {
                    status: "OK",
                    browserSupportsWebauthn: browserSupportsWebAuthn(),
                    platformAuthenticatorIsAvailable: isPlatformAuthenticatorAvailable,
                };
            } catch (error: any) {
                return {
                    status: "ERROR",
                    error: error,
                };
            }
        },
    };
}

export { getRecipeImplementation };
