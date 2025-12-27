import { Router } from "express";
import { addProviderModel, deleteProviderModel, getProvider, listProviderModels, upsertProvider } from "../controllers/providersControllers.js";

const router = Router();

// router.get('/list', ) // list supported providers

router.get('/config', getProvider) // get provider config
router.post('/upsert', upsertProvider) // add/update provider

router.get('/:provider/models', listProviderModels) // list available models
router.post('/:provider/models', addProviderModel) // add a model
router.delete('/:provider/models/:modelId', deleteProviderModel) // delete a model

export default router; 