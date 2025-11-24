# AML Data Source API Recommendations

## Executive Summary

This document provides recommendations for integrating specific data source APIs
into the AML compliance agent. The current implementation relies on general web
search, which has limitations in accuracy, coverage, and compliance. Integrating
dedicated APIs will significantly improve the system's reliability and
regulatory compliance.

## Recommended API Categories

### 1. Sanctions Lists APIs

#### **Tier 1: Comprehensive Aggregator APIs** (Recommended for Production)

##### **OFAC-API.com** ⭐ **TOP RECOMMENDATION**

- **Coverage**: OFAC SDN, UN Consolidated, EU FSF, UK, Canada, Australia, PEP
  database
- **Features**:
  - Single API for multiple data sources
  - Includes PEP screening
  - Regular updates
  - RESTful API
- **Pricing**: Commercial (contact for pricing)
- **Documentation**: https://docs.ofac-api.com
- **Best For**: Comprehensive coverage in one API

##### **Sanctions.io**

- **Coverage**: 3,000+ sanctions and watchlists
- **Features**:
  - Real-time screening
  - Smart matching technology
  - Batch screening
  - Continuous monitoring
  - Updates every 15 minutes
- **Pricing**: Commercial (contact for pricing)
- **Documentation**: https://www.sanctions.io
- **Best For**: Enterprise-grade with high update frequency

##### **Dataspike AML Search API**

- **Coverage**: Global watchlists, sanctions, PEP, adverse media
- **Features**:
  - Aggregates intelligence from major international lists
  - Thousands of global media sources
  - Comprehensive coverage
- **Pricing**: Commercial
- **Documentation**: https://docs.dataspike.io/aml-screening
- **Best For**: All-in-one solution including adverse media

#### **Tier 2: Developer-Friendly APIs**

##### **Compli API**

- **Coverage**: OFAC sanctions, geo-fencing, VPN detection
- **Features**:
  - Developer-friendly
  - Intuitive APIs
  - Easy integration
- **Pricing**: Commercial
- **Documentation**: https://compliapi.com
- **Best For**: Quick integration, developer experience

##### **OFAC Lookup**

- **Coverage**: OFAC sanctions screening
- **Features**:
  - Intelligent filtering
  - Full audit trail
  - Reduces false positives
  - Affordable pricing
- **Pricing**: Affordable commercial
- **Documentation**: https://ofaclookup.com
- **Best For**: Cost-effective OFAC-focused solution

#### **Tier 3: Open Source / Free Options**

##### **Sanctions.network** ⭐ **RECOMMENDED FOR DEVELOPMENT/TESTING**

- **Coverage**: OFAC SDN, UN Consolidated, EU FSF
- **Features**:
  - Open source
  - Simple JSON API
  - Free tier available
  - Easy to self-host
- **Pricing**: Free / Open source
- **Documentation**: https://sanctions.network
- **Best For**: Development, testing, proof-of-concept

##### **Moov's OFAC Search (GitHub)**

- **Coverage**: OFAC SDN list
- **Features**:
  - Open source
  - Self-hostable
  - GitHub project
- **Pricing**: Free (self-hosted)
- **Documentation**: https://github.com/cardonator/ofac
- **Best For**: Self-hosted OFAC-only solution

### 2. PEP (Politically Exposed Persons) Databases

Most comprehensive APIs include PEP screening, but dedicated options:

- **OFAC-API.com**: Includes comprehensive PEP database
- **Dataspike**: Includes PEP screening
- **Dilisense**: International and national PEPs
- **IDfy AML API**: PEP and adverse media screening

### 3. Adverse Media APIs

##### **Dataspike**

- Aggregates from thousands of global media sources
- Part of comprehensive AML solution

##### **IDfy AML API**

- Covers adverse media screening
- Regulatory compliance focus

### 4. Official Government Sources (Free, but require processing)

These are free but require data processing and maintenance:

- **OFAC Sanctions List Service (SLS)**:
  https://ofac.treasury.gov/sanctions-list-service
  - Downloadable XML/CSV files
  - Requires parsing and indexing
  - Regular updates needed

- **UN Consolidated Sanctions List**: Available for download
  - Requires data processing
  - No direct API

- **EU Financial Sanctions Files**: Available for download
  - Requires data processing
  - No direct API

## Recommended Integration Strategy

### Phase 1: Development & Testing (Immediate)

**Use**: Sanctions.network (free, open source)

- Quick to integrate
- Good for development and testing
- Covers primary sanctions lists (OFAC, UN, EU)
- Can switch to paid API later without major code changes

### Phase 2: Production MVP (Short-term)

**Use**: OFAC Lookup or Compli API

- Affordable commercial options
- Good developer experience
- Focused on OFAC (primary requirement for US-based compliance)

### Phase 3: Full Production (Long-term)

**Use**: OFAC-API.com or Sanctions.io

- Comprehensive coverage
- Includes PEP screening
- Regular updates
- Enterprise-grade reliability
- May include adverse media (Dataspike)

## API Comparison Matrix

| Provider              | Sanctions        | PEP    | Adverse Media | Update Frequency | Pricing    | Ease of Integration |
| --------------------- | ---------------- | ------ | ------------- | ---------------- | ---------- | ------------------- |
| **OFAC-API.com**      | ✅ Comprehensive | ✅ Yes | ❌ No         | Regular          | Commercial | ⭐⭐⭐⭐            |
| **Sanctions.io**      | ✅ 3000+ lists   | ✅ Yes | ❌ No         | 15 min           | Commercial | ⭐⭐⭐⭐            |
| **Dataspike**         | ✅ Comprehensive | ✅ Yes | ✅ Yes        | Regular          | Commercial | ⭐⭐⭐⭐            |
| **Compli API**        | ✅ OFAC          | ❌ No  | ❌ No         | Regular          | Commercial | ⭐⭐⭐⭐⭐          |
| **OFAC Lookup**       | ✅ OFAC          | ❌ No  | ❌ No         | Regular          | Affordable | ⭐⭐⭐⭐            |
| **Sanctions.network** | ✅ OFAC/UN/EU    | ❌ No  | ❌ No         | Regular          | Free       | ⭐⭐⭐⭐⭐          |

## Implementation Recommendations

### 1. Start with Sanctions.network

- **Why**: Free, open source, easy integration
- **When**: Development and testing phase
- **How**: Simple REST API, JSON responses

### 2. Add PEP Screening

- **Option A**: Use OFAC-API.com (includes PEP)
- **Option B**: Use separate PEP API if needed
- **When**: Production phase

### 3. Add Adverse Media

- **Option**: Dataspike or dedicated adverse media API
- **When**: Enhanced production features
- **Note**: Current web search can supplement but not replace

### 4. Consider Multi-Provider Strategy

- Primary: Comprehensive API (OFAC-API.com or Sanctions.io)
- Secondary: Specialized APIs for specific needs
- Fallback: Web search for edge cases

## Technical Integration Considerations

### API Requirements

1. **RESTful API** (preferred over SOAP)
2. **JSON responses** for easy parsing
3. **Rate limiting** understanding
4. **Error handling** and retry logic
5. **Caching** for frequently checked names
6. **Batch processing** support (if available)

### Data Matching Considerations

1. **Fuzzy matching** capabilities
2. **Name variations** handling (aliases, transliterations)
3. **Date of Birth** matching
4. **Nationality** matching
5. **False positive reduction**

### Compliance Requirements

1. **Audit trails** - all API calls must be logged
2. **Data retention** - maintain records per regulations
3. **Update frequency** - ensure data freshness
4. **Coverage verification** - confirm all required lists are checked

## Next Steps

1. ✅ Research completed
2. ⏭️ Select initial API (recommend Sanctions.network for development)
3. ⏭️ Design API integration layer
4. ⏭️ Implement API client with error handling
5. ⏭️ Update AML agent to use APIs
6. ⏭️ Add caching layer
7. ⏭️ Implement batch processing (if needed)
8. ⏭️ Add monitoring and logging
9. ⏭️ Test with real data
10. ⏭️ Plan migration to production API

## Cost Considerations

- **Free/Open Source**: Sanctions.network, Moov OFAC (self-hosted)
- **Affordable**: OFAC Lookup, Compli API
- **Commercial**: OFAC-API.com, Sanctions.io, Dataspike
- **Self-Hosted**: Requires infrastructure and maintenance

## Security & Compliance Notes

- All API keys must be stored securely (environment variables)
- API responses may contain sensitive data - handle appropriately
- Ensure compliance with data protection regulations (GDPR, etc.)
- Maintain audit logs of all API calls
- Consider data residency requirements
