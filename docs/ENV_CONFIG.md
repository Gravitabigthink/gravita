# GRAVITA CRM - Environment Configuration Guide

## Required Environment Variables

Create a `.env.local` file in the project root with the following variables:

### Google Gemini AI (Required)
```
GOOGLE_GEMINI_API_KEY=your-api-key-here
```

### LLM Router Configuration (Optional - has defaults)
```
# Models by complexity tier (for token optimization)
LLM_MODEL_SIMPLE=gemini-2.0-flash-lite     # Automatic tasks, scoring
LLM_MODEL_STANDARD=gemini-2.0-flash        # Chat, lead analysis  
LLM_MODEL_ADVANCED=gemini-1.5-pro          # Proposals, deep analysis

# Retry control
LLM_MAX_RETRIES=5                          # Max attempts before failing
LLM_RETRY_DELAY_MS=1000                    # Base delay between retries (ms)
```

### Firebase Configuration (if using Firebase)
```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

## Model Tier Descriptions

| Tier | Model | Use Case | Cost |
|------|-------|----------|------|
| `simple` | gemini-2.0-flash-lite | Auto scoring, validation, classification | Very Low |
| `standard` | gemini-2.0-flash | Chat, lead analysis, email drafts | Low |
| `advanced` | gemini-1.5-pro | Complex proposals, deep analysis | Higher |

## Retry Behavior

The system implements exponential backoff:
1. First attempt: immediate
2. Retry 2: wait 1 second
3. Retry 3: wait 2 seconds
4. Retry 4: wait 4 seconds
5. Retry 5: wait 8 seconds
6. After 5 retries: returns error message (no infinite loop)
