# AML API Integration Guide

This guide explains how to use the integrated AML data source APIs in the AML
agent.

## Overview

The AML agent now uses dedicated APIs for sanctions and PEP screening instead of
relying solely on general web search. This provides:

- **Higher Accuracy**: Direct access to official sanctions lists
- **Better Coverage**: Comprehensive PEP databases
- **Regulatory Compliance**: Access to authoritative sources
- **Reduced False Positives**: Better matching algorithms with identifiers

## Available APIs

### 1. Sanctions.network (Free, Default)

- **Status**: ✅ Always available
- **Coverage**: OFAC SDN, UN Consolidated, EU FSF
- **Cost**: Free
- **Setup**: No configuration needed

This is the default API used for development and testing. It's free and open
source.

### 2. OFAC-API.com (Commercial, Optional)

- **Status**: Requires API key
- **Coverage**: Comprehensive sanctions + PEP database
- **Cost**: Commercial (contact for pricing)
- **Setup**: Set `OFAC_API_KEY` environment variable

To use OFAC-API.com:

```bash
export OFAC_API_KEY="your-api-key-here"
```

Or create a `.env` file (if using a tool that supports it).

## How It Works

### Architecture

```
AML Agent
    ↓
AML API Manager
    ↓
┌─────────────────┬─────────────────┐
│ Sanctions.network│  OFAC-API.com   │
│   (Free)         │   (Commercial)   │
└─────────────────┴─────────────────┘
```

The API Manager:

1. Tries APIs in priority order
2. Falls back to next API if one fails
3. Returns results from the first successful API

### Integration Points

The APIs are integrated into:

1. **Step 3: PEP Screening** - Uses PEP APIs
2. **Step 4: Sanctions Review** - Uses sanctions APIs
3. **Step 2: Adverse Media** - Still uses web search (no free API available)

### Data Flow

```
User Query
    ↓
Extract identifiers (name, DOB, nationality, location)
    ↓
Call API Manager
    ↓
API Manager tries APIs in order
    ↓
Return structured results
    ↓
LLM analyzes and structures into report
```

## Adding New APIs

To add a new API provider:

1. **Create API implementation** in `src/agent/aml-apis/`
   - Implement `SanctionsAPI`, `PEPAPI`, or `AdverseMediaAPI` interface
   - Or implement full `AMLAPI` interface

2. **Register in API Manager** (`src/agent/aml-apis/index.ts`)
   ```typescript
   const newAPI = new NewAPI();
   if (newAPI.isAvailable()) {
     amlAPIManager.addAPI(newAPI, {
       sanctions: 0, // Priority (lower = higher priority)
       pep: 0,
       adverseMedia: 0,
     });
   }
   ```

3. **Set environment variables** if needed

## API Response Format

### Sanctions Match

```typescript
{
  name: string;
  aliases?: string[];
  dateOfBirth?: string;
  nationality?: string;
  list: string;  // e.g., "OFAC SDN", "UN Consolidated"
  matchType: "exact" | "fuzzy" | "partial" | "none";
  details: string;
  source: string;  // API provider name
}
```

### PEP Match

```typescript
{
  name: string;
  position: string;
  country: string;
  dates?: string;
  source: string;
}
```

## Error Handling

The API Manager handles errors gracefully:

- If an API fails, it tries the next one
- If all APIs fail, returns empty results
- Errors are logged but don't crash the investigation
- Web search can still be used as fallback

## Testing

To test the API integration:

```bash
# Run an investigation
deno task start

# The system will:
# 1. Try Sanctions.network (always available)
# 2. Try OFAC-API.com if API key is set
# 3. Log which API was used
```

## Monitoring

The system logs:

- ✅ Which API was successfully used
- ⚠️ API failures (with fallback)
- ❌ All APIs failed (rare)

Check console output for API usage information.

## Production Recommendations

For production use:

1. **Start with Sanctions.network** (free, good for MVP)
2. **Add OFAC-API.com** for comprehensive coverage
3. **Consider Dataspike** for adverse media (if needed)
4. **Monitor API usage** and costs
5. **Implement caching** for frequently checked names

## Troubleshooting

### API Not Working

1. Check environment variables:
   ```bash
   echo $OFAC_API_KEY
   ```

2. Check API availability:
   - Sanctions.network: Should always work
   - OFAC-API.com: Requires valid API key

3. Check network connectivity

4. Review console logs for error messages

### No Results Returned

- This is normal if the person is not on any lists
- Check that identifiers (DOB, nationality) are being extracted correctly
- Verify API is actually being called (check logs)

### False Positives

- Ensure DOB and nationality are provided when available
- Review match scores and match types
- Consider adjusting match thresholds in API implementations

## Future Enhancements

Potential improvements:

1. **Caching layer** - Cache API results to reduce calls
2. **Batch processing** - Process multiple names at once
3. **Rate limiting** - Respect API rate limits
4. **More providers** - Add Dataspike, Sanctions.io, etc.
5. **Adverse media APIs** - Integrate dedicated adverse media providers
