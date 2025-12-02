import { PROVIDERS } from "./providers.config";
import { generateText } from 'ai';

const provider = PROVIDERS['ollama']();
const model = provider('gpt-oss:latest');

const testOllamaChat = async () => {
    try {
        console.log('Testing Ollama with gpt-oss:latest...\n');

        const prompt = "Hello! Can you introduce yourself in one sentence?";

        const { text } = await generateText({
            model,
            prompt,
        });

        console.log('Prompt:', prompt);
        console.log('Response:', text);
        console.log('\nTest completed successfully!');
        
        return text;
    } catch (error) {
        console.error('Error testing Ollama:', error);
        throw error;
    }
};

// Run the test
testOllamaChat()
    .then(() => {
        console.log('\n✓ Ollama test passed');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n✗ Ollama test failed:', error.message);
        process.exit(1);
    });
