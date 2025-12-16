import { Request, Response } from "express";
import { getProviderConfig, upsertProviderConfig } from "../database/queries/providerQueries";
import { encrypt } from "../utils/encryption";
import { builtinModels } from "../models/builtInModels";
import { AvailableModel } from "../types/model.types";
import { addModel, deleteModel, getAvailableModels } from "../database/queries/modelQueries";
import { ProviderName } from "../types/providers.types";
import { AuthenticationError, ValidationError, NotFoundError, ConflictError } from "../utils/customError";



export async function getProvider(req: Request,res: Response): Promise<void> {

    const provider = req.body;
    const user_id = req.user?.id;

    if(!user_id || !provider){
        throw new ValidationError('User ID and provider are required');
    }

    const providerConfig = await getProviderConfig(user_id, provider);
        
    if (!providerConfig){
        throw new NotFoundError('No configuration found for this provider');
    }

        res.status(200).json({
        success: true,
        data: {
            provider: providerConfig.provider,
            url: providerConfig.base_url,
            hasKey: providerConfig.api_key_encrypted !== null
        }
    })
}

// add / update provider config
export async function upsertProvider(req: Request, res: Response): Promise<void> {

    const { provider, api_key, base_url, is_default } = req.body;
    const user_id = req.user?.id;

    if (!user_id || !provider) {
        throw new ValidationError('User ID and provider are required');
    }

    // encrypt the API key only if a new one was provided
    let api_key_encrypted: string | null = null;
    if (api_key !== undefined && api_key !== null && api_key !== "") {
        api_key_encrypted = encrypt(api_key);
    }

    const updated = await upsertProviderConfig(
        user_id,
        provider,
        api_key_encrypted,
        is_default || false,
        base_url
    );

    res.status(201).json({
        success: true,
        data: {
            id: updated.id,
            user_id: updated.user_id,
            provider: updated.provider,
            base_url: updated.base_url,
            hasKey: updated.api_key_encrypted !== null,
            created: updated.created_at,
            updated: updated.updated_at
        }
    });
}



export async function listProviderModels(req: Request, res: Response): Promise<void>{

    const provider = req.params.provider as ProviderName;
    const user_id = req.user?.id;


    if (!provider) {
        throw new ValidationError("Provider is required");
    }

    // type guard to ensure provider is a valid ProviderName
    const validProviders = Object.keys(builtinModels);
    if (!validProviders.includes(provider)) {
        throw new ValidationError("Invalid provider");
    }

    // load builtin models (from src/models/builtInModels.ts):
    const builtin = (builtinModels[provider as keyof typeof builtinModels] || []).map(b => ({
        ...b,
        id: null,
        user_id: null,
        source: "builtin"
    }));

    // load user models (from the database)
    const userModels: (AvailableModel & {source: string})[] = user_id
    ? ((await getAvailableModels(user_id, provider)).map(m => ({
        ...m, source: "user"
    }))): [];

    const map = new Map<string, any>();

    for(const b of builtin) map.set(b.model_name, b);
    for(const u of userModels) map.set(u.model_name, u);

    const merged = Array.from(map.values());

    res.status(200).json({
        success: true,
        data: merged
    });
}


export async function addProviderModel(req: Request, res: Response): Promise<void> {

    const provider = req.params.provider as ProviderName;
    const user_id = req.user?.id;

    if(!user_id){
        throw new AuthenticationError();
    }

    const {
        model_name,
        display_name,
        supports_vision = false,
        supports_streaming = true,
        supports_tools = true,
        url,
        max_tokens
    } = req.body;

    if (!model_name || !display_name) {
        throw new ValidationError("Model name and display name are required");
    }

    const newModel = await addModel(
        user_id,
        provider,
        model_name,
        display_name,
        url,
        supports_vision,
        supports_streaming,
        supports_tools,
        max_tokens
    );

    res.status(201).json({
        success: true,
        data: {
            ...newModel,
            source: "user"
        }
    });
}


export async function deleteProviderModel(req: Request, res: Response): Promise<void> {

    const user_id = req.user?.id;
    const model_id = req.params.modelId;

    if (!model_id) {
        throw new ValidationError("Model ID is required");
    }

    if(!user_id){
        throw new AuthenticationError();
    }

    const deleted = await deleteModel(user_id, model_id);

    if (!deleted) {
        throw new NotFoundError("Model not found or not owned by user");
    }

    res.status(200).json({
        success: true,
        message: "Model deleted successfully"
    });
}

