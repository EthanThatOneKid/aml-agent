# Sphart

> Thank you to [Sphinx](https://sphinxhq.com) for inspiring this project.
>
> \- Ethan Davidson

## Developing

Once you've cloned the project, start a development server:

```bash
deno task start
```

Run the following command to run the opinionated pre-commit tasks:

```bash
deno task precommit
```

Example output:

```
>deno task start
Task start deno -A --env src/app.ts
Enter the subject of the AML report: John Smith

💡 Enter distinguishing details or URLs to help identify the individual
   (e.g., date of birth, location, LinkedIn URL, company name)
   Press Enter with an empty input to finish adding details.

Detail 1 (or press Enter to finish):  https://example.com/
Detail 2 (or press Enter to finish):  https://github.com/username
Detail 3 (or press Enter to finish):  Lives in City, State
Detail 4 (or press Enter to finish):  Studied at State University
Detail 5 (or press Enter to finish):  Born January 1, 1990
Detail 6 (or press Enter to finish):

✅ Collected 5 distinguishing detail(s)

🔍 Starting AML Investigation for: John Smith
🔎 Using 5 distinguishing detail(s) for disambiguation
⏰ Investigation started at: 2025-11-22T02:13:15.997Z

📋 Step 1/4: Gathering basic information...
✅ Step 1 completed in 16.43s
📰 Step 2/4: Checking adverse media...
✅ Step 2 completed in 18.78s
🏛️  Step 3/4: Screening for PEP status...
✅ Step 3 completed in 13.81s
🚫 Step 4/4: Reviewing sanctions lists...
✅ Step 4 completed in 8.16s

📊 Synthesizing findings and generating structured report...
✅ Report synthesis completed in 25.34s

🎯 Investigation Summary:
   Risk Level: LOW
   Risk Score: 10/100
   Decision: APPROVE
   Confidence: 95%

⏱️  Total investigation time: 82.53s
✅ Investigation completed at: 2025-11-22T02:14:13.190Z


💾 Report saved to: investigations/aml-report-john-smith-2025-11-22T02-14-38-539Z.json    

📄 Generation Result: {
  subject: {
    name: "John Smith",
    dateOfBirth: "1990-01-01",
    nationality: "American",
    location: "City, State"
  },
  adverseMediaCheck: {
    status: "clear",
    findings: [],
    confidence: 95,
    reasoning: "Comprehensive searches were conducted across news, social media, and web sources for negative information related to financial crimes, fraud, corruption, or other high-risk activities. Several individuals with similar names were identified but were excluded as false positives based on differing identifying details such as middle name, location, profession, and date of birth. No credible adverse media specifically linked to John Smith, matching all distinguishing details, was found."
  },
  pepScreening: {
    status: "clear",
    findings: [],
    confidence: 95,
    reasoning: "Thorough screening for Politically Exposed Person (PEP) status, government roles, or close associations with PEPs was conducted. Multiple individuals with similar names were identified, including a known PEP, but were confirmed to be distinct individuals based on significant differences in identifying details. No evidence was found that John Smith currently holds or has held any PEP-related positions."     
  },
  sanctionsReview: {
    status: "clear",
    findings: [
      {
        list: "OFAC",
        matchType: "none",
        details: "No matches found. Searches on major sanctions lists (OFAC, UN, EU) using the full name, date of birth, and inferred nationality did not yield any results for John Smith. A prominent individual with a similar name was identified as a false positive.",
        identifiers: {
          name: "John Smith",
          dateOfBirth: "1990-01-01",
          nationality: "American"
        }
      }
    ],
    confidence: 95,
    reasoning: "Major sanctions lists including OFAC, UN, and EU were screened. The subject's full name, date of birth, and inferred nationality were used to conduct precise matching. No direct or fuzzy matches were found. Potential false positives with similar names were successfully distinguished due to clear differences in associated identifiers and demographics."
  },
  riskAssessment: {
    overallRisk: "low",
    riskScore: 10,
    riskFactors: [],
    mitigatingFactors: [
      "No adverse media findings",
      "Not identified as a Politically Exposed Person (PEP)",
      "No matches found on major sanctions lists",
      "Identity verified through multiple online presences (GitHub, personal website) matching distinguishing details.",
      "Consistent professional background (developer, Tech Company, Startup Name)."
    ],
    reasoning: "All primary compliance checks (Adverse Media, PEP Screening, Sanctions Review) yielded clear results with no flags or concerns. The individual's identity is well-corroborated by the provided online profiles (GitHub, personal website) and university affiliation. Despite some initial reliance on provided distinguishing details for DOB and location, no contradictory information was found. Extensive false positive analysis ensured the correct individual was assessed. The overall profile indicates a low risk."
  },
  decision: {
    action: "approve",
    reasoning: "Step 1: Basic information gathered confirms the subject's identity through GitHub and personal website, consistent with provided distinguishing details. While DOB and location were not independently verified from public records beyond the distinguishing details, no contradictory information was found for the identified individual. Step 2: Adverse media check is clear, with no relevant negative findings. Step 3: PEP screening is clear, with no political exposure detected. Step 4: Sanctions review is clear, with no matches on major lists. Step 5: Data correlation shows consistency across all available information, confirming the absence of red flags. Step 6: Risk assessment concludes a low overall risk score (10/100) due to the absence of any identified risk factors and the presence of several mitigating factors. Based on the comprehensive and clear results, the recommended action is to approve.",
    confidence: 95,
    falsePositiveAnalysis: "The investigation included rigorous false positive analysis, particularly during adverse media, PEP, and sanctions screenings where common names or similar names led to numerous irrelevant search results. Unique identifiers such as the GitHub username, personal website, specific university, and distinct professional background were critical in accurately identifying and narrowing down the subject. The identified false positives were successfully excluded based on conflicting dates of birth, locations, middle names, or professional contexts. Therefore, the risk of a false positive in the final decision for John Smith is low."
  },
  evidence: [
    {
      source: "Provided distinguishing details (URL: example.com)",
      type: "web",
      timestamp: "2025-11-22T02:13:15.997Z",
      findings: "Personal website associated with subject. Used for identity verification.",        
      relevance: "high"
    },
    {
      source: "Provided distinguishing details (URL: github.com/username)",
      type: "social_media",
      timestamp: "2025-11-22T02:13:15.997Z",
      findings: "GitHub profile confirming name and affiliation. Used for identity verification and professional background.",
      relevance: "high"
    },
    {
      source: "Provided distinguishing details (University affiliation)",
      type: "public_record",
      timestamp: "2025-11-22T02:13:15.997Z",
      findings: "Affiliation with State University. Used for identity verification and inferring nationality.",
      relevance: "high"
    },
    {
      source: "Provided distinguishing details (Location: City, State)",
      type: "public_record",
      timestamp: "2025-11-22T02:13:15.997Z",
      findings: "Current or last known location 'City, State'. Used for identity verification. Not independently verified by search results but not contradicted.",
      relevance: "high"
    },
    {
      source: "Provided distinguishing details (DOB: January 1, 1990)",
      type: "public_record",
      timestamp: "2025-11-22T02:13:15.997Z",
      findings: "Date of Birth 'January 1, 1990'. Used for identity verification. Not independently verified by search results but not contradicted.",
      relevance: "high"
    },
    {
      source: "Google Search (various queries for basic info, adverse media, PEP, sanctions)",      
      type: "web",
      timestamp: "2025-11-22T02:13:00.000Z",
      findings: "No adverse media found for John Smith. Identified and excluded multiple false positives (different individuals with similar names, etc.). No PEP status or sanctions matches found. Inferred nationality as American. Identified prior employment at Tech Company and current affiliation with Startup Name.",
      relevance: "high"
    },
    {
      source: "News articles (e.g., similar name - author and musician)",
      type: "news",
      timestamp: "2025-11-22T02:13:00.000Z",
      findings: "Discussed an individual with a similar name, an author and musician. Identified as a false positive due to differing middle name, location, and profession.",
      relevance: "low"
    },
    {
      source: "Inmate lists / Detainee rosters",
      type: "public_record",
      timestamp: "2025-11-22T02:13:00.000Z",
      findings: "Found entries for individuals with similar names. Identified as false positives due to lack of matching identifiers.",
      relevance: "low"
    },
    {
      source: "Kentucky parole eligibility list (May 31, 2023)",
      type: "public_record",
      timestamp: "2025-11-22T02:13:00.000Z",
      findings: "No entry for 'John Smith' found. Confirmed absence of relevant adverse media.",
      relevance: "medium"
    },
    {
      source: "Foundation / Organization information (re: similar name)",
      type: "public_record",
      timestamp: "2025-11-22T02:13:00.000Z",
      findings: "Identified an individual with a similar name as a PEP (Treasurer/Chairman of Grants Committee for a Foundation, Chair of an organization board). Excluded as a false positive for the subject due to different middle name, DOB, and professional context.",
      relevance: "low"
    },
    {
      source: "Office of Foreign Assets Control (OFAC) sanctions list",
      type: "database",
      timestamp: "2025-11-22T02:14:00.000Z",
      findings: "No matches for 'John Smith' (with DOB, nationality) found. Confirmed absence of sanctions.",
      relevance: "high"
    },
    {
      source: "United Nations (UN) Security Council Sanctions List",
      type: "database",
      timestamp: "2025-11-22T02:14:00.000Z",
      findings: "No matches for 'John Smith' (with DOB, nationality) found. Confirmed absence of sanctions.",
      relevance: "high"
    },
    {
      source: "European Union (EU) Sanctions List",
      type: "database",
      timestamp: "2025-11-22T02:14:00.000Z",
      findings: "No matches for 'John Smith' (with DOB, nationality) found. Confirmed absence of sanctions.",
      relevance: "high"
    }
  ],
  auditTrail: {
    investigationStartTime: "2025-11-22T02:13:15.997Z",
    investigationEndTime: "2025-11-22T02:14:13.190Z",
    steps: [
      {
        step: "Step 1: Gather Basic Information",
        timestamp: "2025-11-22T02:13:00.000Z",
        dataSources: [
          "Provided distinguishing details",
          "example.com",
          "github.com/username",
          "Google Search"
        ],
        findings: "Confirmed 'John Smith' identity via GitHub and personal website, consistent with distinguishing details (DOB: January 1, 1990; Location: City, State; University affiliation). DOB and location not independently verified by search results but not contradicted. Nationality inferred as American."
      },
      {
        step: "Step 2: Adverse Media Check",
        timestamp: "2025-11-22T02:13:00.000Z",
        dataSources: [
          "Google Search (various queries)",
          "News articles",
          "Inmate lists",
          "Parole lists",
          "U.S. Gun Violence Victim List"
        ],
        findings: "No adverse media found for John Smith related to financial crimes, fraud, corruption, or other high-risk activities. Identified and successfully excluded multiple false positives based on differing identifying details."
      },
      {
        step: "Step 3: PEP Screening",
        timestamp: "2025-11-22T02:13:00.000Z",
        dataSources: [
          "Google Search (PEP-related queries)",
          "Public records (e.g., foundation boards)"
        ],
        findings: "No evidence found linking John Smith to any current or former politically exposed positions or close associations with PEPs. Identified and successfully excluded false positives, including a known PEP with a similar name."
      },
      {
        step: "Step 4: Sanctions Review",
        timestamp: "2025-11-22T02:14:00.000Z",
        dataSources: [
          "Google Search (sanctions-related queries)",
          "OFAC sanctions list",
          "UN Security Council Sanctions List",
          "EU Sanctions List"
        ],
        findings: "No matches or potential matches for John Smith found on major sanctions lists (OFAC, UN, EU) using name, DOB, and inferred nationality. An individual with a similar name was identified and excluded as a false positive."
      },
      {
        step: "Step 5: Data Correlation",
        timestamp: "2025-11-22T02:14:00.000Z",
        dataSources: [ "All previous findings" ],
        findings: "All findings across basic information, adverse media, PEP screening, and sanctions review are consistent, indicating no discrepancies or red flags. The identity is strongly linked to online profiles, and no negative information was found across multiple checks."
      },
      {
        step: "Step 6: Risk Assessment",
        timestamp: "2025-11-22T02:14:00.000Z",
        dataSources: [ "All previous findings" ],
        findings: "Overall risk assessed as 'low' with a score of 10/100. No risk factors identified. Mitigating factors include clear adverse media, PEP, and sanctions checks, and consistent identity information."
      },
      {
        step: "Step 7: Decision Making",
        timestamp: "2025-11-22T02:14:13.190Z",
        dataSources: [ "All previous findings" ],
        findings: "Decision is to 'approve' with high confidence (95%). Comprehensive checks yielded no flags. Robust false positive analysis minimized risk of error."
      }
    ]
  }
}
⏱️  Generation took 82539.08ms (82.54s)
```

## Deploying

To deploy your FartKit application, see
[Deno Deploy](https://docs.deno.com/deploy/manual/).

---

Created with 🧪 [**@FartLabs**](https://github.com/FartLabs)
