import { Request, Response } from "express";
import { getProviderConfig, upsertProviderConfig } from "../database/queries/providerQueries";
import { encrypt } from "../utils/encryption";
import { builtinModels } from "../models/builtInModels";
import { AvailableModel } from "../types/model.types";
import { addModel, deleteModel, getAvailableModels } from "../database/queries/modelQueries";
import { ProviderName } from "../types/providers.types";

// for database errors: might move this to another file that handles errors.
function isDatabaseError(err: unknown): err is { code: string } {
    return typeof err === 'object' && err !== null && 'code' in err;
}


export async function getProvider(req: Request,res: Response): Promise<void> {

    try {
        const provider = req.body;
        const user_id = req.user?.id;

        if(!user_id || !provider){
            res.status(400).json({
                success: false,
                error: { message: 'no user_id or provider sent'}
            });
            return;
        }

        const providerConfig = await getProviderConfig(user_id, provider);
        
        if (!providerConfig){
            res.status(400).json({
                success: false,
                error: { message: 'there is no config for this provider, add one'}
            })
            return;
        }

        res.status(200).json({
            success: true,
            data: {
                provider: providerConfig.provider,
                url: providerConfig.base_url,
                hasKey: providerConfig.api_key_encrypted !== null
            }
        })
    } catch (error) {
        console.error('database error: ', error);
        res.status(500).json({
            success: false,
            error: { message: 'getting config failed. Please try again.' }
        });
    }
};

export async function upsertProvider(req: Request, res: Response): Promise<void> {
    try {
        const { provider, api_key, base_url, is_default } = req.body;
        const user_id = req.user?.id;

        if (!user_id || !provider) {
            res.status(400).json({
                success: false,
                error: { message: 'user_id and provider are required.' }
            });
            return;
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

    } catch (error) {
        console.error('database error: ', error);
        res.status(500).json({
            success: false,
            error: { message: 'Saving provider config failed. Please try again.' }
        });
    }
};



export async function listProviderModels(req: Request, res: Response): Promise<void>{

    try {
        const provider = req.params.provider as ProviderName;
        const user_id = req.user?.id;


        if (!provider) {
            res.status(400).json({
                success: false,
                error: { message: "provider is required" } 
            });
            return;
        }

        // type guard to ensure provider is a valid ProviderName
        const validProviders = Object.keys(builtinModels);
        if (!validProviders.includes(provider)) {
            res.status(400).json({
                success: false,
                error: { message: "Invalid provider" }
            });
            return;
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


    } catch (error) {
        console.error('Error listing provider models:', error);
        res.status(500).json({
            success: false,
            error: { message: 'Failed to list models. Please try again.' }
        });
    }
};

export async function addProviderModel(req: Request, res: Response): Promise<void> {

    try {
        const provider = req.params.provider as ProviderName;
        const user_id = req.user?.id;

        if(!user_id){
            res.status(400).json({
                success: false,
                error: { message: "user_id isn't there, try again" }
            });
            return;
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
            res.status(400).json({
                success: false,
                error: { message: "model_name and display_name are required" }
            });
            return;
        }

        const newURl: string | null = url;

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
    } catch (error) {
        // handle unique constraint violation
        if (isDatabaseError(error) && error.code === "23505") {
            res.status(409).json({
                success: false,
                error: { message: "Model with this name already exists for this provider" }
            });
            return;
        }
        
        console.error('Error adding provider model:', error);
        res.status(500).json({
            success: false,
            error: { message: 'Failed to add model. Please try again.' }
        });
    }
}


export async function deleteProviderModel(req: Request, res: Response): Promise<void> {
  try {
    const user_id = req.user?.id;
    const model_id = req.params.modelId;

    if (!model_id) {
      res.status(400).json({
        success: false,
        error: { message: "modelId is required" }
      });
      return;
    }

    if(!user_id){
        res.status(400).json({
            success: false,
            error: { message: "user_id isn't tho98ere, try again" }
        });
        return;
    }

    const deleted = await deleteModel(user_id, model_id);

    if (!deleted) {
      res.status(404).json({
        success: false,
        error: { message: "Model not found or not owned by user" }
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Model deleted successfully"
    });

  } catch (error) {
    console.error("deleteProviderModel error:", error);
    res.status(500).json({
      success: false,
      error: { message: "Failed to delete model" }
    });
  }
}
