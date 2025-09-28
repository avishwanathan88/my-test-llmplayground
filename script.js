// LLM Playground JavaScript
class LLMPlayground {
    constructor() {
        this.chatHistory = [];
        this.currentModel = 'openai';
        this.isGenerating = false;
        
        this.initializeElements();
        this.bindEvents();
        this.loadTemplates();
        this.updateParameterDisplays();
    }

    initializeElements() {
        // Get DOM elements
        this.userInput = document.getElementById('userInput');
        this.sendBtn = document.getElementById('sendBtn');
        this.chatMessages = document.getElementById('chatMessages');
        this.modelProvider = document.getElementById('modelProvider');
        this.modelSelection = document.getElementById('modelSelection');
        this.systemPrompt = document.getElementById('systemPrompt');
        this.temperature = document.getElementById('temperature');
        this.maxTokens = document.getElementById('maxTokens');
        this.presencePenalty = document.getElementById('presencePenalty');
        this.frequencyPenalty = document.getElementById('frequencyPenalty');
        this.seed = document.getElementById('seed');
        this.stopSequence = document.getElementById('stopSequence');
        this.clearBtn = document.getElementById('clearBtn');
        this.saveBtn = document.getElementById('saveBtn');
        this.voiceBtn = document.getElementById('voiceBtn');
        this.attachBtn = document.getElementById('attachBtn');
        this.loadingModal = document.getElementById('loadingModal');
        
        // Model options for each provider
        this.modelOptions = {
            openai: [
                { value: 'gpt-4', text: 'GPT-4' },
                { value: 'gpt-4-turbo', text: 'GPT-4 Turbo' },
                { value: 'gpt-4o', text: 'GPT-4o' },
                { value: 'gpt-3.5-turbo', text: 'GPT-3.5 Turbo' }
            ],
            anthropic: [
                { value: 'claude-3-5-sonnet-20241022', text: 'Claude 3.5 Sonnet' },
                { value: 'claude-3-5-haiku-20241022', text: 'Claude 3.5 Haiku' },
                { value: 'claude-3-opus-20240229', text: 'Claude 3 Opus' },
                { value: 'claude-3-sonnet-20240229', text: 'Claude 3 Sonnet' },
                { value: 'claude-3-haiku-20240307', text: 'Claude 3 Haiku' }
            ],
            google: [
                { value: 'gemini-2.5-flash', text: 'Gemini 2.5 Flash' },
                { value: 'gemini-2.5-pro-preview-03-25', text: 'Gemini 2.5 Pro Preview' },
                { value: 'gemini-2.5-flash-preview-05-20', text: 'Gemini 2.5 Flash Preview' }
            ],
            groq: [
                { value: 'llama-3.3-70b-versatile', text: 'Llama 3.3 70B Versatile' },
                { value: 'llama-3.1-8b-instant', text: 'Llama 3.1 8B Instant' },
                { value: 'openai/gpt-oss-120b', text: 'GPT-OSS 120B' },
                { value: 'openai/gpt-oss-20b', text: 'GPT-OSS 20B' }
            ]
        };
    }

    bindEvents() {
        // Send message events
        if (this.sendBtn) this.sendBtn.addEventListener('click', () => this.sendMessage());
        if (this.userInput) {
            this.userInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });
            
            // Auto-expanding textarea functionality (ChatGPT style)
            this.userInput.addEventListener('input', () => this.autoResizeTextarea());
            this.userInput.addEventListener('paste', () => {
                setTimeout(() => this.autoResizeTextarea(), 0);
            });
        }

        // Model provider change event
        if (this.modelProvider) this.modelProvider.addEventListener('change', () => {
            console.log('Provider changed to:', this.modelProvider.value);
            this.updateModelOptions();
        });

        // Model selection change event
        if (this.modelSelection) this.modelSelection.addEventListener('change', () => {
            console.log('Model changed to:', this.modelSelection.value);
            this.updateModelInfo();
        });

        // Parameter change events
        if (this.temperature) this.temperature.addEventListener('input', () => this.updateParameterDisplay('temperature'));
        if (this.maxTokens) this.maxTokens.addEventListener('input', () => this.updateParameterDisplay('maxTokens'));
        if (this.presencePenalty) this.presencePenalty.addEventListener('input', () => this.updateParameterDisplay('presencePenalty'));
        if (this.frequencyPenalty) this.frequencyPenalty.addEventListener('input', () => this.updateParameterDisplay('frequencyPenalty'));

        // Action button events
        if (this.clearBtn) this.clearBtn.addEventListener('click', () => this.clearChat());
        if (this.saveBtn) this.saveBtn.addEventListener('click', () => this.saveConversation());
        if (this.voiceBtn) this.voiceBtn.addEventListener('click', () => this.handleVoiceInput());
        if (this.attachBtn) this.attachBtn.addEventListener('click', () => this.handleFileAttachment());

        // Initialize model options
        this.updateModelOptions();
        
        // Prompt suggestion cards
        this.bindPromptCards();
    }
    
    bindPromptCards() {
        const promptCards = document.querySelectorAll('.prompt-card');
        promptCards.forEach(card => {
            card.addEventListener('click', () => {
                const promptText = card.getAttribute('data-prompt');
                if (promptText) {
                    this.userInput.value = promptText;
                    this.autoResizeTextarea();
                    this.hidePromptSuggestions();
                    // Auto-focus the input for immediate editing if needed
                    this.userInput.focus();
                    // Move cursor to end
                    this.userInput.setSelectionRange(promptText.length, promptText.length);
                }
            });
        });
    }
    
    hidePromptSuggestions() {
        const promptSuggestions = document.querySelector('.prompt-suggestions');
        const welcomeSection = document.querySelector('.welcome-section');
        const chatMessages = document.getElementById('chatMessages');
        
        if (promptSuggestions) {
            promptSuggestions.style.display = 'none';
        }
        if (welcomeSection) {
            welcomeSection.style.display = 'none';
        }
        if (chatMessages) {
            chatMessages.style.display = 'block';
        }
    }
    
    showPromptSuggestions() {
        const promptSuggestions = document.querySelector('.prompt-suggestions');
        const welcomeSection = document.querySelector('.welcome-section');
        const chatMessages = document.getElementById('chatMessages');
        
        if (promptSuggestions) {
            promptSuggestions.style.display = 'grid';
        }
        if (welcomeSection) {
            welcomeSection.style.display = 'block';
        }
        if (chatMessages) {
            chatMessages.style.display = 'none';
        }
    }

    autoResizeTextarea() {
        if (!this.userInput) return;
        
        // Reset height to auto to get the correct scrollHeight
        this.userInput.style.height = 'auto';
        
        // Calculate the new height based on content
        const scrollHeight = this.userInput.scrollHeight;
        const minHeight = 60; // matches CSS min-height
        const maxHeight = 200; // matches CSS max-height
        
        // Set the height within bounds
        if (scrollHeight <= maxHeight) {
            this.userInput.style.height = Math.max(scrollHeight, minHeight) + 'px';
            this.userInput.style.overflowY = 'hidden';
        } else {
            this.userInput.style.height = maxHeight + 'px';
            this.userInput.style.overflowY = 'auto';
        }
    }

    updateModelOptions() {
        if (!this.modelProvider || !this.modelSelection) {
            console.log('Missing elements:', { provider: !!this.modelProvider, selection: !!this.modelSelection });
            return;
        }
        
        const provider = this.modelProvider.value;
        const models = this.modelOptions[provider] || [];
        
        console.log('Updating models for provider:', provider, 'Models:', models);
        
        // Clear current options
        this.modelSelection.innerHTML = '';
        
        // Add new options based on selected provider
        models.forEach(model => {
            const option = document.createElement('option');
            option.value = model.value;
            option.textContent = model.text;
            this.modelSelection.appendChild(option);
        });
        
        console.log('Model selection updated, new options count:', this.modelSelection.options.length);
        
        // Update current model info
        this.updateModelInfo();
    }

    updateParameterDisplay(parameter) {
        const value = this[parameter].value;
        let displayElementId;
        
        // Map parameter names to their corresponding display element IDs
        switch(parameter) {
            case 'temperature':
                displayElementId = 'tempValue';
                break;
            case 'maxTokens':
                displayElementId = 'tokensValue';
                break;
            case 'presencePenalty':
                displayElementId = 'presenceValue';
                break;
            case 'frequencyPenalty':
                displayElementId = 'frequencyValue';
                break;
            default:
                displayElementId = parameter + 'Value';
        }
        
        const displayElement = document.getElementById(displayElementId);
        if (displayElement) {
            // Format the value appropriately
            let formattedValue = value;
            if (parameter === 'temperature' || parameter === 'presencePenalty' || parameter === 'frequencyPenalty') {
                formattedValue = parseFloat(value).toFixed(1);
            } else if (parameter === 'maxTokens') {
                formattedValue = parseInt(value);
            }
            displayElement.textContent = formattedValue;
        }
    }

    updateParameterDisplays() {
        this.updateParameterDisplay('temperature');
        this.updateParameterDisplay('maxTokens');
        this.updateParameterDisplay('presencePenalty');
        this.updateParameterDisplay('frequencyPenalty');
    }

    loadTemplates() {
        this.templates = {
            creative: {
                systemPrompt: "You are a creative writing assistant. Help users craft engaging stories, poems, and creative content with vivid descriptions and imaginative scenarios.",
                temperature: 0.9,
                maxTokens: 2048
            },
            code: {
                systemPrompt: "You are a helpful coding assistant. Provide clear, well-commented code examples and explanations. Focus on best practices and efficient solutions.",
                temperature: 0.3,
                maxTokens: 1024
            },
            analysis: {
                systemPrompt: "You are a data analysis expert. Help users understand data, create insights, and provide analytical reasoning with clear explanations.",
                temperature: 0.5,
                maxTokens: 1536
            },
            chat: {
                systemPrompt: "You are a friendly and helpful conversational AI. Engage in natural, casual conversation while being informative and supportive.",
                temperature: 0.7,
                maxTokens: 1024
            }
        };
    }

    applyTemplate() {
        const selectedTemplate = this.templateSelect.value;
        if (selectedTemplate && this.templates[selectedTemplate]) {
            const template = this.templates[selectedTemplate];
            
            this.systemPrompt.value = template.systemPrompt;
            this.temperature.value = template.temperature;
            this.maxTokens.value = template.maxTokens;
            
            this.updateParameterDisplays();
        }
    }

    updateModelInfo() {
        const provider = this.modelProvider.value;
        const model = this.modelSelection.value;
        this.currentModel = `${provider}-${model}`;
        
        // You can add more model-specific info updates here
        console.log(`Selected model: ${this.currentModel}`);
    }

    async sendMessage() {
        const message = this.userInput.value.trim();
        if (!message) return;

        // Hide prompt suggestions when sending a message
        this.hidePromptSuggestions();

        // Add user message to chat
        this.addMessage(message, 'user');
        this.userInput.value = '';
        this.autoResizeTextarea(); // Reset textarea height after clearing

        // Show loading
        this.setGenerating(true);

        try {
            // Call LLM API with current model and parameters
            const response = await this.callLLMAPI(message);
            this.addMessage(response, 'assistant');
        } catch (error) {
            this.addMessage('Sorry, there was an error processing your request.', 'error');
            console.error('Error:', error);
        } finally {
            this.setGenerating(false);
        }
    }

    async callLLMAPI(message) {
        try {
            const provider = this.modelProvider.value;
            const model = this.modelSelection.value;
            const systemPrompt = this.systemPrompt ? this.systemPrompt.value : '';
            const temperature = parseFloat(this.temperature.value);
            const maxTokens = parseInt(this.maxTokens.value);
            const presencePenalty = parseFloat(this.presencePenalty.value);
            const frequencyPenalty = parseFloat(this.frequencyPenalty.value);
            
            // Prepare request payload
            const requestData = {
                provider: provider,
                model: model,
                message: message,
                parameters: {
                    systemPrompt: systemPrompt,
                    temperature: temperature,
                    maxTokens: maxTokens,
                    presencePenalty: presencePenalty,
                    frequencyPenalty: frequencyPenalty
                }
            };
            
            console.log(`Making API call to ${provider} with model ${model}`, requestData);
            
            // Make API call to backend
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestData)
            });
            
            console.log('Response status:', response.status);
            
            const data = await response.json();
            console.log('Response data:', data);
            
            if (!response.ok) {
                throw new Error(data.error || `HTTP error! status: ${response.status}`);
            }
            
            if (!data.success) {
                throw new Error(data.error || 'API call failed');
            }
            
            return data.response;
            
        } catch (error) {
            console.error('API Error:', error);
            
            // Handle specific error types
            if (error.message.includes('API key not configured')) {
                throw new Error(`API key not configured for ${this.modelProvider.value}. Please check your .env file.`);
            } else if (error.message.includes('fetch')) {
                throw new Error('Unable to connect to the backend server. Please ensure the server is running.');
            } else {
                throw new Error(`API Error: ${error.message}`);
            }
        }
    }

    containsUnsafeContent(text) {
        // Simple safety check (in real implementation, use proper safety APIs)
        const unsafeKeywords = ['harmful', 'dangerous', 'illegal'];
        return unsafeKeywords.some(keyword => 
            text.toLowerCase().includes(keyword)
        );
    }

    addMessage(content, type) {
        // Show chat messages container when first message is added
        if (this.chatMessages.style.display === 'none') {
            this.chatMessages.style.display = 'flex';
            // Hide welcome section and prompt suggestions
            this.hidePromptSuggestions();
            const welcomeSection = document.querySelector('.welcome-section');
            if (welcomeSection) {
                welcomeSection.style.display = 'none';
            }
        }

        // Remove welcome message if it exists
        const welcomeMessage = this.chatMessages.querySelector('.welcome-message');
        if (welcomeMessage) {
            welcomeMessage.remove();
        }

        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        messageDiv.textContent = content;
        
        this.chatMessages.appendChild(messageDiv);
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;

        // Add to chat history
        this.chatHistory.push({ content, type, timestamp: new Date() });
    }

    setGenerating(isGenerating) {
        this.isGenerating = isGenerating;
        this.sendBtn.disabled = isGenerating;
        this.userInput.disabled = isGenerating;
        
        if (isGenerating) {
            this.loadingModal.style.display = 'block';
            this.sendBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
        } else {
            this.loadingModal.style.display = 'none';
            this.sendBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Send';
        }
    }

    updateModelInfo() {
        const modelInfo = {
            openai: 'OpenAI GPT - Advanced language model with strong reasoning capabilities',
            google: 'Google Gemini - Multimodal AI with excellent analytical skills',
            groq: 'Groq - High-speed inference with optimized performance'
        };
        
        console.log(`Switched to: ${modelInfo[this.currentModel]}`);
    }

    clearChat() {
        if (confirm('Are you sure you want to clear the chat history?')) {
            this.chatMessages.innerHTML = '';
            this.chatMessages.style.display = 'none';
            this.chatHistory = [];
            
            // Show welcome section and prompt suggestions when chat is cleared
            const welcomeSection = document.querySelector('.welcome-section');
            if (welcomeSection) {
                welcomeSection.style.display = 'block';
            }
            this.showPromptSuggestions();
        }
    }

    saveConversation() {
        if (this.chatHistory.length === 0) {
            alert('No conversation to save!');
            return;
        }

        const conversation = {
            timestamp: new Date().toISOString(),
            model: this.currentModel,
            parameters: {
                temperature: this.temperature.value,
                maxTokens: this.maxTokens.value,
                presencePenalty: this.presencePenalty.value,
                frequencyPenalty: this.frequencyPenalty.value,
                systemPrompt: this.systemPrompt.value
            },
            messages: this.chatHistory
        };

        const blob = new Blob([JSON.stringify(conversation, null, 2)], {
            type: 'application/json'
        });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `llm-conversation-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    toggleVoiceInput() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            const recognition = new SpeechRecognition();
            
            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.lang = 'en-US';

            recognition.onstart = () => {
                this.voiceBtn.innerHTML = '<i class="fas fa-microphone-slash"></i>';
                this.voiceBtn.style.color = '#dc2626';
            };

            recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                this.userInput.value = transcript;
                this.userInput.focus();
            };

            recognition.onend = () => {
                this.voiceBtn.innerHTML = '<i class="fas fa-microphone"></i>';
                this.voiceBtn.style.color = '';
            };

            recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                alert('Speech recognition error: ' + event.error);
            };

            recognition.start();
        } else {
            alert('Speech recognition is not supported in your browser.');
        }
    }

    attachFile() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.txt,.md,.json';
        
        input.onchange = (event) => {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const content = e.target.result;
                    this.userInput.value += `\n\n[File: ${file.name}]\n${content}`;
                    this.userInput.focus();
                };
                reader.readAsText(file);
            }
        };
        
        input.click();
    }
}

// Initialize the playground when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new LLMPlayground();
});

// Export for potential module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LLMPlayground;
}