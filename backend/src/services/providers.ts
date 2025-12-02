import { KEYLESS_PROVIDERS, PROVIDERS, PROVIDER_NAMES } from "../config/providers.config";
import { ProviderName } from "../types/providers.types";
import { getProviderConfig } from "../database/queries/providerQueries";
import { decrypt } from "../utils/encryption";

//used to get the provider 
export const getProviderInstance = async (
    user_id: string,
    provider: ProviderName,
    customBaseURL?: string
) => {

    const requiresKey = !KEYLESS_PROVIDERS.includes(provider as any);

    let apiKey: string | undefined;
    let baseURL = customBaseURL;

    if (requiresKey) {
        // Fetch encrypted API key from database
        const config = await getProviderConfig(user_id, provider);
    
        if (!config || !config.api_key_encrypted) {
        throw new Error(`No API key configured for provider: ${provider}`);
        }

        apiKey = decrypt(config.api_key_encrypted);

        // Use custom base URL from config if not provided
        if (!baseURL && config.base_url) {
        baseURL = config.base_url;
        }
    }

    const providerFactory = PROVIDERS[provider];
    
    if (!providerFactory) {
    throw new Error(`Unknown provider: ${provider}`);
    }

  return providerFactory(apiKey as string, baseURL);
};